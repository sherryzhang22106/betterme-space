import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

// 获取数据库中的评分规则
async function getScoringRules(assessmentId: string) {
  const rules = await sql`
    SELECT min_score, max_score, result_title, result_content, result_tags
    FROM scoring_rules
    WHERE theme_id = ${assessmentId}
    ORDER BY order_num, min_score
  `;
  return rules.map((r, i) => ({
    id: `r${i + 1}`,
    min: r.min_score,
    max: r.max_score,
    title: r.result_title,
    description: r.result_content,
    tags: r.result_tags ? JSON.parse(r.result_tags) : []
  }));
}

// 备用配置（当数据库没有数据时使用）
const RESULT_CONFIGS: Record<string, any[]> = {
  'mbti-core': [
    { id: 'r1', min: 0, max: 3, title: '内向思考型', description: '你倾向于独处和深度思考，善于分析问题。在需要深入研究的领域中表现出色。', tags: ['深度思考', '独立'] },
    { id: 'r2', min: 4, max: 7, title: '外向行动型', description: '你喜欢社交和行动，善于与人沟通合作。在团队协作中能发挥领导作用。', tags: ['社交达人', '行动派'] }
  ]
};

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { answers, duration } = req.body || {};

    if (!answers) {
      return res.status(400).json({ success: false, error: '请提交答案' });
    }

    // 获取评分规则（优先数据库，其次硬编码）
    let results = await getScoringRules(id as string);
    if (results.length === 0) {
      results = RESULT_CONFIGS[id as string] || [];
    }

    // 计算分数 - 支持多种选项格式
    let score = 0;
    for (const [key, value] of Object.entries(answers)) {
      // 如果值是数字，直接加
      if (typeof value === 'number') {
        score += value;
      }
      // 如果值是选项 ID，尝试从答案中获取分值
      else if (typeof value === 'string') {
        // 格式: q{questionId}_o{optionId}
        const match = value.match(/^q\d+_o(\d+)$/);
        if (match) {
          // 从数据库获取选项分值
          const optionId = parseInt(match[1]);
          const options = await sql`
            SELECT option_value FROM question_options WHERE id = ${optionId}
          `;
          if (options.length > 0) {
            score += options[0].option_value;
          }
        } else if (value.includes('_a')) {
          // 兼容旧格式
          score += 1;
        }
      }
      // 如果是多选题（数组）
      else if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === 'number') {
            score += v;
          } else if (typeof v === 'string') {
            const match = v.match(/^q\d+_o(\d+)$/);
            if (match) {
              const optionId = parseInt(match[1]);
              const options = await sql`
                SELECT option_value FROM question_options WHERE id = ${optionId}
              `;
              if (options.length > 0) {
                score += options[0].option_value;
              }
            }
          }
        }
      }
    }

    // 匹配结果
    const result = results.find(r => score >= r.min && score <= r.max) || results[0];

    // 获取用户 ID（如果已登录）
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // 未登录，继续
      }
    }

    // 保存记录
    const record = await sql`
      INSERT INTO assessment_records (user_id, assessment_id, theme_id, answers, score, result_id, result_title, result_content, duration)
      VALUES (${userId}, ${id}, ${id}, ${JSON.stringify(answers)}, ${score}, ${result?.id || null}, ${result?.title || null}, ${result?.description || null}, ${duration || null})
      RETURNING id
    `;

    // 更新统计
    await sql`
      INSERT INTO assessment_stats (assessment_id, total_count, avg_score, updated_at)
      VALUES (${id}, 1, ${score}, NOW())
      ON CONFLICT (assessment_id) DO UPDATE SET
        total_count = assessment_stats.total_count + 1,
        avg_score = (assessment_stats.avg_score * assessment_stats.total_count + ${score}) / (assessment_stats.total_count + 1),
        updated_at = NOW()
    `;

    return res.status(200).json({
      success: true,
      recordId: record[0].id,
      score,
      result: result ? {
        title: result.title,
        description: result.description,
        tags: result.tags,
        score
      } : null
    });
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({ success: false, error: '提交失败: ' + (error.message || '未知错误') });
  }
}
