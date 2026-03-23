import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { themeId } = req.query;

    if (!themeId || typeof themeId !== 'string') {
      return res.status(400).json({ success: false, message: '缺少主题ID' });
    }

    // 获取主题信息
    const [theme] = await sql`
      SELECT * FROM themes
      WHERE id = ${themeId} AND status = 'active'
    `;

    if (!theme) {
      return res.status(404).json({ success: false, message: '主题不存在或已下架' });
    }

    // 获取题目和选项
    const questions = await sql`
      SELECT
        q.id,
        q.order_num,
        q.question_text,
        q.question_type,
        q.is_required
      FROM questions q
      WHERE q.theme_id = ${themeId}
      ORDER BY q.order_num ASC
    `;

    // 为每个题目获取选项
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await sql`
          SELECT
            id,
            option_text,
            option_value,
            order_num
          FROM question_options
          WHERE question_id = ${question.id}
          ORDER BY order_num ASC
        `;

        return {
          ...question,
          options
        };
      })
    );

    return res.status(200).json({
      success: true,
      theme: {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        coverImage: theme.cover_image,
        price: Number(theme.price),
        questionCount: theme.question_count,
        estimatedTime: theme.estimated_time
      },
      questions: questionsWithOptions
    });

  } catch (error: any) {
    console.error('获取主题失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取主题失败',
      error: error.message
    });
  }
}
