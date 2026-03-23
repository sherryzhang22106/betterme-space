import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'betterme-secret-key';

// 获取数据库中的评分规则
async function getScoringRules(assessmentId: string) {
  try {
    const rules = await sql`
      SELECT min_score, max_score, result_title, result_content, result_tags
      FROM scoring_rules
      WHERE theme_id = ${assessmentId}
      ORDER BY order_num, min_score
    `;
    return rules.map((r, i) => ({
      id: `r${i + 1}`,
      min: r.min_score,
      max: r.max_score,
      title: r.result_title,
      description: r.result_content,
      tags: r.result_tags ? JSON.parse(r.result_tags) : []
    }));
  } catch (e) {
    console.error('Error getting scoring rules:', e);
    return [];
  }
}

// 备用配置
const RESULT_CONFIGS: Record<string, any[]> = {
  'mbti-core': [
    { id: 'r1', min: 0, max: 3, title: '内向思考型', description: '你倾向于独处和深度思考，善于分析问题。在需要深入研究的领域中表现出色。', tags: ['深度思考', '独立'] },
    { id: 'r2', min: 4, max: 7, title: '外向行动型', description: '你喜欢社交和行动，善于与人沟通合作。在团队协作中能发挥领导作用。', tags: ['社交达人', '行动派'] }
  ]
};

// AI 解析
async function generateAIAnalysis(themeId: string, answers: Record<string, any>, score: number, resultTitle: string, resultContent: string): Promise<string | null> {
  try {
    const [theme] = await sql`
      SELECT name, ai_enabled, ai_system_prompt, ai_model
      FROM themes WHERE id = ${themeId}
    `;

    if (!theme || !theme.ai_enabled || !theme.ai_system_prompt) {
      return null;
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.log('DEEPSEEK_API_KEY not configured');
      return null;
    }

    const answersText = Object.entries(answers)
      .map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join('\n');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: theme.ai_model || 'deepseek-chat',
        messages: [
          { role: 'system', content: theme.ai_system_prompt },
          {
            role: 'user',
            content: `用户完成了"${theme.name}"测评，以下是TA的答题情况和测评结果：

【测评结果】
类型：${resultTitle}
基础解读：${resultContent}
总分：${score}分

【用户答案】
${answersText}

请基于以上信息，给出一段150-200字的个性化深度解析，帮助用户更好地理解自己的测评结果。`
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { answers, duration } = req.body || {};

    if (!answers) {
      return res.status(400).json({ success: false, error: '请提交答案' });
    }

    // 计算分数
    let score = 0;

    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === 'number') {
        score += value;
      } else if (typeof value === 'string') {
        const match = value.match(/^q\d+_o(\d+)$/);
        if (match) {
          const optionId = parseInt(match[1], 10);
          try {
            const options = await sql`SELECT option_value FROM question_options WHERE id = ${optionId}`;
            if (options.length > 0) {
              score += Number(options[0].option_value);
            }
          } catch (e) {
            console.error('Error getting option value:', e);
          }
        }
      }
    }

    // 获取评分规则
    let results = await getScoringRules(id as string);
    if (results.length === 0) {
      results = RESULT_CONFIGS[id as string] || [];
    }

    // 匹配结果
    const result = results.find(r => score >= r.min && score <= r.max) || results[0];

    // 获取用户 ID
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // 未登录，继续
      }
    }

    // 检查是否启用 AI 解析
    let aiEnabled = false;
    try {
      const [theme] = await sql`SELECT ai_enabled FROM themes WHERE id = ${id as string}`;
      aiEnabled = theme?.ai_enabled || false;
    } catch (e) {
      console.error('Error getting theme:', e);
    }

    // 保存记录
    let recordId = 'temp-' + Date.now();
    let aiAnalysis: string | null = null;

    try {
      const record = await sql`
        INSERT INTO assessment_records (user_id, assessment_id, theme_id, answers, score, result_id, result_title, result_content, duration, ai_status)
        VALUES (${userId}, ${id}, ${id}, ${JSON.stringify(answers)}, ${score}, ${result?.id || null}, ${result?.title || null}, ${result?.description || null}, ${duration || null}, ${aiEnabled ? 'generating' : 'none'})
        RETURNING id
      `;
      recordId = record[0].id;

      // 生成 AI 解析
      if (aiEnabled && result) {
        aiAnalysis = await generateAIAnalysis(id as string, answers, score, result.title, result.description || '');
        await sql`
          UPDATE assessment_records
          SET ai_analysis = ${aiAnalysis}, ai_status = ${aiAnalysis ? 'completed' : 'failed'}
          WHERE id = ${recordId}
        `;
      }

      // 更新统计
      await sql`
        INSERT INTO assessment_stats (assessment_id, total_count, avg_score, updated_at)
        VALUES (${id}, 1, ${score}, NOW())
        ON CONFLICT (assessment_id) DO UPDATE SET
          total_count = assessment_stats.total_count + 1,
          avg_score = (assessment_stats.avg_score * assessment_stats.total_count + ${score}) / (assessment_stats.total_count + 1),
          updated_at = NOW()
      `;
    } catch (e) {
      console.error('Error saving record:', e);
    }

    return res.status(200).json({
      success: true,
      recordId,
      score,
      aiEnabled,
      result: result ? {
        title: result.title,
        description: result.description,
        tags: result.tags,
        score
      } : null,
      aiAnalysis
    });
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({ success: false, error: '提交失败: ' + (error.message || '未知错误') });
  }
}
