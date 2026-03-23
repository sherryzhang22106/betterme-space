import { neon } from '@neondatabase/serverless';

// AI 解析服务
export async function generateAIAnalysis(
  themeId: string,
  answers: Record<string, any>,
  score: number,
  resultTitle: string,
  resultContent: string
): Promise<string | null> {
  try {
    // 获取主题的 AI 配置
    const sql = neon(process.env.DATABASE_URL!);

    const [theme] = await sql`
      SELECT name, description, ai_enabled, ai_system_prompt, ai_model
      FROM themes WHERE id = ${themeId}
    `;

    if (!theme || !theme.ai_enabled || !theme.ai_system_prompt) {
      return null;
    }

    // 构建用户答案描述
    const answersText = buildAnswersText(answers);

    // 调用 AI 生成解析
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: theme.ai_model || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: theme.ai_system_prompt
          },
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

    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

// 异步更新 AI 解析（不阻塞主流程）
export async function updateAIAnalysisAsync(
  recordId: string,
  themeId: string,
  answers: Record<string, any>,
  score: number,
  resultTitle: string,
  resultContent: string
): Promise<void> {
  // 标记为生成中
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    UPDATE assessment_records
    SET ai_status = 'generating'
    WHERE id = ${recordId}
  `;

  // 生成 AI 解析
  const analysis = await generateAIAnalysis(themeId, answers, score, resultTitle, resultContent);

  // 更新记录
  if (analysis) {
    await sql`
      UPDATE assessment_records
      SET ai_analysis = ${analysis}, ai_status = 'completed'
      WHERE id = ${recordId}
    `;
  } else {
    await sql`
      UPDATE assessment_records
      SET ai_status = 'failed'
      WHERE id = ${recordId}
    `;
  }
}

// 构建用户答案文本描述
function buildAnswersText(answers: Record<string, any>): string {
  const lines: string[] = [];

  for (const [questionId, answer] of Object.entries(answers)) {
    if (typeof answer === 'string') {
      lines.push(`- ${questionId}: ${answer}`);
    } else if (typeof answer === 'number') {
      lines.push(`- ${questionId}: ${answer}分`);
    } else if (Array.isArray(answer)) {
      lines.push(`- ${questionId}: [${answer.join(', ')}]`);
    }
  }

  return lines.join('\n') || '无详细答案记录';
}

// 更新 AI 分析状态
export async function getAIAnalysisStatus(recordId: string): Promise<{ status: string; analysis: string | null }> {
  const sql = neon(process.env.DATABASE_URL!);

  const [record] = await sql`
    SELECT ai_status, ai_analysis
    FROM assessment_records
    WHERE id = ${recordId}
  `;

  return {
    status: record?.ai_status || 'pending',
    analysis: record?.ai_analysis || null
  };
}
