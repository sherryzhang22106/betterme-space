import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { updateAIAnalysisAsync } from '../../ai';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

// 获取数据库中的评分规则
async function getScoringRules(assessmentId: string) {
  try {
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
  } catch (e) {
    console.error('Error getting scoring rules:', e);
    return [];
  }
}

// 备用配置
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

    // 计算分数 - 支持多种选项格式
    let score = 0;

    for (const [key, value] of Object.entries(answers)) {
      // 如果值是数字，直接加（量表题）
      if (typeof value === 'number') {
        score += value;
      }
      // 如果值是字符串（选项 ID 格式 q{qId}_o{optionId}）
      else if (typeof value === 'string') {
        // 格式: q{questionId}_o{optionId}
        const match = value.match(/^q\d+_o(\d+)$/);
        if (match) {
          const optionId = parseInt(match[1], 10);
          try {
            const options = await sql`
              SELECT option_value FROM question_options WHERE id = ${optionId}
            `;
            if (options.length > 0) {
              score += Number(options[0].option_value);
            }
          } catch (e) {
            console.error('Error getting option value:', e);
          }
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
              const optionId = parseInt(match[1], 10);
              try {
                const options = await sql`
                  SELECT option_value FROM question_options WHERE id = ${optionId}
                `;
                if (options.length > 0) {
                  score += Number(options[0].option_value);
                }
              } catch (e) {
                console.error('Error getting option value:', e);
              }
            }
          }
        }
      }
    }

    // 获取评分规则
    let results = await getScoringRules(id as string);
    if (results.length === 0) {
      results = RESULT_CONFIGS[id as string] || [];
    }

    // 匹配结果
    const result = results.find(r => score >= r.min && score <= r.max) || results[0];

    // 获取用户 ID
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

    // 检查是否启用 AI 解析
    let aiEnabled = false;
    try {
      const [theme] = await sql`
        SELECT ai_enabled FROM themes WHERE id = ${id as string}
      `;
      aiEnabled = theme?.ai_enabled || false;
    } catch (e) {
      console.error('Error getting theme:', e);
    }

    // 保存记录
    let recordId = 'temp-' + Date.now();
    try {
      const record = await sql`
        INSERT INTO assessment_records (user_id, assessment_id, theme_id, answers, score, result_id, result_title, result_content, duration, ai_status)
        VALUES (${userId}, ${id}, ${id}, ${JSON.stringify(answers)}, ${score}, ${result?.id || null}, ${result?.title || null}, ${result?.description || null}, ${duration || null}, ${aiEnabled ? 'pending' : 'none'})
        RETURNING id
      `;
      recordId = record[0].id;

      // 如果启用 AI 解析，异步生成
      if (aiEnabled && result) {
        updateAIAnalysisAsync(
          recordId,
          id as string,
          answers,
          score,
          result.title,
          result.description || ''
        ).catch(err => console.error('AI analysis failed:', err));
      }

      // 更新统计
      await sql`
        INSERT INTO assessment_stats (assessment_id, total_count, avg_score, updated_at)
        VALUES (${id}, 1, ${score}, NOW())
        ON CONFLICT (assessment_id) DO UPDATE SET
          total_count = assessment_stats.total_count + 1,
          avg_score = (assessment_stats.avg_score * assessment_stats.total_count + ${score}) / (assessment_stats.total_count + 1),
          updated_at = NOW()
      `;
    } catch (e) {
      console.error('Error saving record:', e);
      // 即使保存失败，也返回结果
    }

    return res.status(200).json({
      success: true,
      recordId,
      score,
      aiEnabled,
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
