import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { themeId, answers, userId } = req.body;

    if (!themeId || !answers) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 获取主题信息
    const [theme] = await sql`
      SELECT * FROM themes WHERE id = ${themeId}
    `;

    if (!theme) {
      return res.status(404).json({ success: false, message: '主题不存在' });
    }

    // 计算总分
    let totalScore = 0;

    for (const answer of answers) {
      const { questionId, selectedOptionIds } = answer;

      // 获取选项分值
      const options = await sql`
        SELECT option_value FROM question_options
        WHERE id = ANY(${selectedOptionIds})
      `;

      // 累加分数
      for (const option of options) {
        totalScore += Number(option.option_value);
      }
    }

    // 根据总分匹配结果
    const [result] = await sql`
      SELECT * FROM scoring_rules
      WHERE theme_id = ${themeId}
        AND ${totalScore} >= min_score
        AND ${totalScore} <= max_score
      ORDER BY order_num ASC
      LIMIT 1
    `;

    if (!result) {
      return res.status(500).json({ success: false, message: '未找到匹配的结果' });
    }

    // 保存测评记录
    const [record] = await sql`
      INSERT INTO assessment_records (
        user_id,
        assessment_id,
        theme_id,
        score,
        answers,
        result_title,
        result_content
      )
      VALUES (
        ${userId || null},
        ${themeId},
        ${themeId},
        ${totalScore},
        ${JSON.stringify(answers)},
        ${result.result_title},
        ${result.result_content}
      )
      RETURNING id, created_at
    `;

    return res.status(200).json({
      success: true,
      recordId: record.id,
      result: {
        score: totalScore,
        title: result.result_title,
        content: result.result_content,
        image: result.result_image,
        tags: result.result_tags ? JSON.parse(result.result_tags) : []
      }
    });

  } catch (error: any) {
    console.error('提交测评失败:', error);
    return res.status(500).json({
      success: false,
      message: '提交测评失败',
      error: error.message
    });
  }
}
