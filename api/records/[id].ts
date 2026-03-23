import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

// 备用配置（当数据库没有数据时使用）
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
    // 验证用户（可选，不强制登录）
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // 继续，允许查看
      }
    }

    const records = await sql`
      SELECT
        r.id,
        r.user_id as "userId",
        r.assessment_id as "assessmentId",
        r.answers,
        r.score,
        r.result_id as "resultId",
        r.result_title as "resultTitle",
        r.result_content as "resultContent",
        r.duration,
        r.created_at as "createdAt",
        t.name as "assessmentName",
        t.description as "assessmentDescription",
        t.cover_image as "assessmentCover"
      FROM assessment_records r
      LEFT JOIN themes t ON r.theme_id = t.id
      WHERE r.id = ${id}
    `;

    if (records.length === 0) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }

    const record = records[0];

    // 获取结果详情
    let resultDetails = null;
    if (record.resultId) {
      // 尝试从数据库获取
      const rules = await sql`
        SELECT result_title, result_content, result_tags
        FROM scoring_rules
        WHERE theme_id = ${record.assessmentId}
          AND (
            (min_score <= ${record.score} AND max_score >= ${record.score})
            OR id = ${parseInt(record.resultId.replace('r', ''))}
          )
        LIMIT 1
      `;

      if (rules.length > 0) {
        resultDetails = {
          title: rules[0].result_title || record.resultTitle,
          description: rules[0].result_content || record.resultContent,
          tags: rules[0].result_tags ? JSON.parse(rules[0].result_tags) : []
        };
      } else {
        // 使用备用配置
        const results = RESULT_CONFIGS[record.assessmentId] || [];
        const result = results.find(r => r.id === record.resultId) ||
                       results.find(r => record.score >= r.min && record.score <= r.max);
        if (result) {
          resultDetails = {
            title: result.title,
            description: result.description,
            tags: result.tags || []
          };
        }
      }
    }

    // 如果数据库有保存结果内容，直接使用
    if (!resultDetails && record.resultTitle) {
      resultDetails = {
        title: record.resultTitle,
        description: record.resultContent || '',
        tags: []
      };
    }

    return res.status(200).json({
      success: true,
      record: {
        id: record.id,
        userId: record.userId,
        assessmentId: record.assessmentId,
        assessmentName: record.assessmentName || '未知测评',
        assessmentDescription: record.assessmentDescription,
        assessmentCover: record.assessmentCover,
        answers: record.answers,
        score: record.score,
        resultId: record.resultId,
        duration: record.duration,
        createdAt: record.createdAt
      },
      result: resultDetails ? {
        ...resultDetails,
        score: record.score
      } : {
        title: '测评结果',
        description: '查看完整结果详情',
        score: record.score,
        tags: []
      }
    });
  } catch (error: any) {
    console.error('Get record error:', error);
    return res.status(500).json({ success: false, error: '获取记录失败' });
  }
}
