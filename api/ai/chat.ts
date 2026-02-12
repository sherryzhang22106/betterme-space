export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: '请输入内容' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内在认知向导，名字叫"小觅"。你的回答应该温暖、客观、充满洞察力。严禁使用"心理咨询"、"心理治疗"等医疗词汇。字数控制在150字以内。'
          },
          {
            role: 'user',
            content: `作为一个性格行为学专家与内在认知向导，基于用户的描述："${message}"，推荐最适合TA的性格或状态测评（如：内耗分析、人生剧本探索、依恋风格等），并给出一段精炼且温暖的内在建议。`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({
        success: true,
        reply: data.choices[0].message.content
      });
    } else {
      return res.status(500).json({ success: false, error: 'AI 响应异常' });
    }
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return res.status(500).json({ success: false, error: 'AI 服务暂时不可用' });
  }
}
