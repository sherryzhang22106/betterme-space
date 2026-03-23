import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 获取主题列表
export async function getThemes() {
  const themes = await sql`
    SELECT id, name, description, cover_image, price, question_count, estimated_time
    FROM themes WHERE status = 'active'
    ORDER BY created_at DESC
  `;
  return themes.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    coverImage: t.cover_image,
    price: Number(t.price),
    questionCount: t.question_count,
    estimatedTime: t.estimated_time
  }));
}

// 获取主题详情
export async function getThemeDetail(themeId: string) {
  const [theme] = await sql`
    SELECT * FROM themes WHERE id = ${themeId} AND status = 'active'
  `;

  if (!theme) return null;

  const questions = await sql`
    SELECT id, order_num, question_text, question_type, is_required
    FROM questions WHERE theme_id = ${themeId} ORDER BY order_num ASC
  `;

  const questionsWithOptions = await Promise.all(
    questions.map(async (q) => {
      const options = await sql`
        SELECT id, option_text, option_value, order_num
        FROM question_options WHERE question_id = ${q.id} ORDER BY order_num ASC
      `;
      return { ...q, options };
    })
  );

  return {
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
  };
}

// 主处理函数
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  try {
    // 获取主题列表
    if (action === 'list' || (!action && req.method === 'GET')) {
      const themes = await getThemes();
      return res.status(200).json({ success: true, themes });
    }

    // 获取主题详情
    if (action === 'detail') {
      const { themeId } = req.query;
      if (!themeId || typeof themeId !== 'string') {
        return res.status(400).json({ success: false, message: '缺少主题ID' });
      }
      const result = await getThemeDetail(themeId);
      if (!result) {
        return res.status(404).json({ success: false, message: '主题不存在' });
      }
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(400).json({ success: false, message: '无效的操作' });
  } catch (error: any) {
    console.error('Themes API error:', error);
    return res.status(500).json({ success: false, message: '操作失败', error: error.message });
  }
}
