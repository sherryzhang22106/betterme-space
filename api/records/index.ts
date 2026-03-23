import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 获取用户 ID
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        return res.status(401).json({ success: false, error: '未登录或登录已过期' });
      }
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }

    // 获取用户的测评记录
    const records = await sql`
      SELECT
        r.id,
        r.assessment_id as "assessmentId",
        r.score,
        r.result_id as "resultId",
        r.result_title as "resultTitle",
        r.result_content as "resultContent",
        r.created_at as "createdAt",
        r.duration,
        t.name as "assessmentName",
        t.cover_image as "assessmentCover"
      FROM assessment_records r
      LEFT JOIN themes t ON r.theme_id = t.id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    // 格式化记录
    const formattedRecords = records.map(r => ({
      id: r.id,
      assessmentId: r.assessmentId,
      assessmentName: r.assessmentName || '未知测评',
      assessmentCover: r.assessmentCover,
      score: r.score,
      resultId: r.resultId,
      resultTitle: r.resultTitle || '未命名结果',
      createdAt: r.createdAt,
      duration: r.duration,
      timeAgo: getTimeAgo(r.createdAt)
    }));

    return res.status(200).json({
      success: true,
      records: formattedRecords,
      total: formattedRecords.length
    });
  } catch (error: any) {
    console.error('Get records error:', error);
    return res.status(500).json({ success: false, error: '获取记录失败' });
  }
}

// 计算时间差描述
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return past.toLocaleDateString('zh-CN');
}
