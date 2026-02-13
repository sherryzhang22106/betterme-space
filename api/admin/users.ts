import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const users = await sql`
      SELECT id, phone, email, nickname, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const formattedUsers = users.map(u => ({
      id: u.id,
      account: u.phone || u.email,
      nickname: u.nickname,
      role: u.role || 'user',
      createdAt: u.created_at
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Users error:', error);
    return res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
}
