import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 示例测评配置（后续可以从数据库或文件读取）
const ASSESSMENT_CONFIGS: Record<string, any> = {
  'mbti-core': {
    id: 'mbti-core',
    title: 'MBTI 性格测试',
    questions: [
      {
        id: 'q1',
        type: 'single',
        content: '在社交场合中，你通常会：',
        options: [
          { id: 'q1_a', label: '主动与他人交流，享受社交', value: 1 },
          { id: 'q1_b', label: '等待他人来找你聊天', value: 0 }
        ]
      },
      {
        id: 'q2',
        type: 'single',
        content: '做决定时，你更倾向于：',
        options: [
          { id: 'q2_a', label: '依靠逻辑和客观分析', value: 1 },
          { id: 'q2_b', label: '考虑他人感受和价值观', value: 0 }
        ]
      },
      {
        id: 'q3',
        type: 'scale',
        content: '你有多喜欢提前计划事情？',
        scale: { min: 1, max: 5, minLabel: '完全不喜欢', maxLabel: '非常喜欢' }
      }
    ],
    scoring: { method: 'sum' },
    results: [
      { id: 'r1', min: 0, max: 3, title: '内向思考型', description: '你倾向于独处和深度思考，善于分析问题。' },
      { id: 'r2', min: 4, max: 7, title: '外向行动型', description: '你喜欢社交和行动，善于与人沟通合作。' }
    ]
  }
};

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const config = ASSESSMENT_CONFIGS[id as string];

    if (!config) {
      return res.status(404).json({ success: false, error: '测评不存在' });
    }

    return res.status(200).json({ success: true, config });
  } catch (error) {
    console.error('Get assessment error:', error);
    return res.status(500).json({ success: false, error: '获取测评失败' });
  }
}
