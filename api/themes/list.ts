import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const themes = await sql`
      SELECT
        id,
        name,
        description,
        cover_image,
        price,
        question_count,
        estimated_time,
        status,
        created_at
      FROM themes
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;

    return res.status(200).json({
      success: true,
      themes: themes.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        cover_image: t.cover_image,
        price: Number(t.price),
        question_count: t.question_count,
        estimated_time: t.estimated_time,
        status: t.status
      }))
    });

  } catch (error: any) {
    console.error('获取主题列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取主题列表失败',
      error: error.message
    });
  }
}
