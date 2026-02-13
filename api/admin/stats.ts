import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 总用户数
    const totalUsersResult = await sql`SELECT COUNT(*) as count FROM users`;
    const totalUsers = parseInt(totalUsersResult[0].count) || 0;

    // 总测评记录数
    const totalRecordsResult = await sql`SELECT COUNT(*) as count FROM assessment_records`;
    const totalRecords = parseInt(totalRecordsResult[0].count) || 0;

    // 今日新增用户
    const todayUsersResult = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= CURRENT_DATE
    `;
    const todayUsers = parseInt(todayUsersResult[0].count) || 0;

    // 今日测评数
    const todayRecordsResult = await sql`
      SELECT COUNT(*) as count FROM assessment_records
      WHERE created_at >= CURRENT_DATE
    `;
    const todayRecords = parseInt(todayRecordsResult[0].count) || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRecords,
        todayUsers,
        todayRecords
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, error: '获取统计数据失败' });
  }
}
