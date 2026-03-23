import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { recordId } = req.query;

    if (!recordId || typeof recordId !== 'string') {
      return res.status(400).json({ success: false, message: '缺少记录ID' });
    }

    // 获取测评记录
    const [record] = await sql`
      SELECT
        r.*,
        t.name as theme_name
      FROM assessment_records r
      LEFT JOIN themes t ON r.theme_id = t.id
      WHERE r.id = ${recordId}
    `;

    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    return res.status(200).json({
      success: true,
      themeName: record.theme_name,
      result: {
        score: record.score,
        title: record.result_title,
        content: record.result_content,
        image: record.result_image || '',
        tags: record.result_tags ? JSON.parse(record.result_tags) : []
      }
    });

  } catch (error: any) {
    console.error('获取结果失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取结果失败',
      error: error.message
    });
  }
}
