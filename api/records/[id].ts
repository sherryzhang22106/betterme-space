import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 结果配置
const RESULT_CONFIGS: Record<string, any[]> = {
  'mbti-core': [
    { id: 'r1', min: 0, max: 3, title: '内向思考型', description: '你倾向于独处和深度思考，善于分析问题。在需要深入研究的领域中表现出色。', tags: ['深度思考', '独立'] },
    { id: 'r2', min: 4, max: 7, title: '外向行动型', description: '你喜欢社交和行动，善于与人沟通合作。在团队协作中能发挥领导作用。', tags: ['社交达人', '行动派'] }
  ]
};

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const records = await sql`
      SELECT id, assessment_id, score, result_id, created_at
      FROM assessment_records
      WHERE id = ${id}
    `;

    if (records.length === 0) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }

    const record = records[0];
    const results = RESULT_CONFIGS[record.assessment_id] || [];
    const result = results.find(r => r.id === record.result_id) || results.find(r => record.score >= r.min && record.score <= r.max);

    return res.status(200).json({
      success: true,
      record: {
        id: record.id,
        assessmentId: record.assessment_id,
        score: record.score,
        createdAt: record.created_at
      },
      result: result ? {
        title: result.title,
        description: result.description,
        score: record.score,
        tags: result.tags
      } : null
    });
  } catch (error: any) {
    console.error('Get record error:', error);
    return res.status(500).json({ success: false, error: '获取记录失败' });
  }
}
