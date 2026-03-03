import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '../lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  // 验证管理员权限
  const auth = await verifyAdmin(req);
  if (!auth.isAdmin) {
    if (auth.error === '未提供认证令牌' || auth.error === '无效的认证令牌') {
      return unauthorizedResponse(res, auth.error);
    }
    return forbiddenResponse(res, auth.error);
  }

  try {
    const records = await sql`
      SELECT
        r.id,
        r.user_id,
        r.assessment_id,
        r.score,
        r.created_at,
        u.phone,
        u.email
      FROM assessment_records r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    const formattedRecords = records.map(r => ({
      id: r.id,
      userId: r.user_id,
      userAccount: r.phone || r.email || null,
      assessmentId: r.assessment_id,
      score: r.score,
      createdAt: r.created_at
    }));

    return res.status(200).json({
      success: true,
      records: formattedRecords
    });
  } catch (error) {
    console.error('Records error:', error);
    return res.status(500).json({ success: false, error: '获取测评记录失败' });
  }
}
