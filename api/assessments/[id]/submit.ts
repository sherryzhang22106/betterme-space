import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

// 评分结果配置
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

    // 计算分数
    let score = 0;
    Object.values(answers).forEach((answer: any) => {
      if (typeof answer === 'number') {
        score += answer;
      } else if (typeof answer === 'string' && answer.includes('_a')) {
        score += 1;
      }
    });

    // 获取结果
    const results = RESULT_CONFIGS[id as string] || [];
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
      INSERT INTO assessment_records (user_id, assessment_id, answers, score, result_id, duration)
      VALUES (${userId}, ${id}, ${JSON.stringify(answers)}, ${score}, ${result?.id || null}, ${duration || null})
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
        tags: result.tags
      } : null
    });
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({ success: false, error: '提交失败: ' + (error.message || '未知错误') });
  }
}
