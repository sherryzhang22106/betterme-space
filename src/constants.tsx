import React from 'react';
import { Assessment, AssessmentCategory } from './types';

const Icons = {
  Mood: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/></svg>,
  Life: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Love: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Career: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Social: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Self: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Fun: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 22V12M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  MBTI: () => <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h10M7 12h10M7 17h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
};

export const ASSESSMENTS: Assessment[] = [
  // 情绪调节
  { id: 'lying-flat', title: '躺平指数', description: '解析你的"精神躺平"真相，是蓄势待发还是彻底倦怠？', category: AssessmentCategory.MOOD, icon: <Icons.Mood />, coverImage: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1000&auto=format&fit=crop', count: '12.5w+', hot: true, timeEstimate: '3-5 min', difficulty: '简单' },
  { id: 'internal-friction', title: '内耗指数', description: '扫描你的情绪黑洞，停止多余的内在精神消耗。', category: AssessmentCategory.MOOD, icon: <Icons.Mood />, count: '8.9w+', timeEstimate: '5-8 min', difficulty: '中等' },

  // 人生探索
  { id: 'life-script', title: '人生剧本', description: '解锁你的核心人生脚本，改写未来的戏剧走向。', category: AssessmentCategory.LIFE, icon: <Icons.Life />, count: '15.2w+', hot: true, timeEstimate: '10-15 min', difficulty: '深度' },
  { id: 'parallel-self', title: '平行宇宙的你', description: '探索生命的其他可能性，遇见另一个时空的自己。', category: AssessmentCategory.LIFE, icon: <Icons.Life />, isLocked: true, timeEstimate: '12 min', difficulty: '深度' },

  // 情感实验室
  { id: 'love-health', title: '恋爱健康指数', description: '审视亲密关系的成色，量化互动中的"养分"分布。', category: AssessmentCategory.LOVE, icon: <Icons.Love />, count: '6.7w+', timeEstimate: '8 min', difficulty: '中等' },
  { id: 'love-concentration', title: '爱情浓度', description: '量化当下的爱意深度，看看你们正处于哪个阶段。', category: AssessmentCategory.LOVE, icon: <Icons.Love />, count: '4.2w+', timeEstimate: '5 min', difficulty: '简单' },
  { id: 'breakup-recovery', title: '分手挽回可能性', description: '理性的情感回溯评估，TA还值得你回头吗？', category: AssessmentCategory.LOVE, icon: <Icons.Love />, count: '24.1w+', timeEstimate: '15 min', difficulty: '深度' },
  { id: 'attachment-style', title: '依恋风格', description: '深度挖掘你的内在安全感来源与互动模式。', category: AssessmentCategory.LOVE, icon: <Icons.Love />, count: '11.3w+', timeEstimate: '10 min', difficulty: '深度' },

  // 职场发展
  { id: 'burnout', title: '职场倦怠指数', description: '评估你的职业疲劳度。', category: AssessmentCategory.CAREER, icon: <Icons.Career />, isLocked: true, timeEstimate: '5 min', difficulty: '简单' },
  { id: 'work-values', title: '工作价值观测评', description: '寻找真正驱动你的内在动力。', category: AssessmentCategory.CAREER, icon: <Icons.Career />, isLocked: true, timeEstimate: '12 min', difficulty: '中等' },
  { id: 'leadership', title: '领导力风格', description: '探索你的影响力模式。', category: AssessmentCategory.CAREER, icon: <Icons.Career />, isLocked: true, timeEstimate: '15 min', difficulty: '深度' },
  { id: 'team-collab', title: '团队协作风格', description: '解析你在团队中的沟通定位。', category: AssessmentCategory.CAREER, icon: <Icons.Career />, isLocked: true, timeEstimate: '8 min', difficulty: '中等' },

  // 社交关系
  { id: 'social-battery', title: '社交电量测评', description: '解析你的社交耐受力与能量恢复模式。', category: AssessmentCategory.SOCIAL, icon: <Icons.Social />, isLocked: true, timeEstimate: '3 min', difficulty: '简单' },
  { id: 'friendship-health', title: '友谊健康度', description: '审视你的社交圈质量。', category: AssessmentCategory.SOCIAL, icon: <Icons.Social />, isLocked: true, timeEstimate: '10 min', difficulty: '中等' },
  { id: 'social-boundaries', title: '边界感指数', description: '守护你的私人内在领地。', category: AssessmentCategory.SOCIAL, icon: <Icons.Social />, isLocked: true, timeEstimate: '8 min', difficulty: '中等' },
  { id: 'social-anxiety', title: '社恐/社牛指数', description: '你的社交属性究竟是什么？', category: AssessmentCategory.SOCIAL, icon: <Icons.Social />, isLocked: true, timeEstimate: '5 min', difficulty: '简单' },

  // 自我认知
  { id: 'self-worth', title: '自我价值感', description: '重塑自信的核心来源。', category: AssessmentCategory.SELF, icon: <Icons.Self />, isLocked: true, timeEstimate: '12 min', difficulty: '深度' },
  { id: 'perfectionism', title: '完美主义倾向', description: '在高标准与幸福感间寻找平衡。', category: AssessmentCategory.SELF, icon: <Icons.Self />, isLocked: true, timeEstimate: '8 min', difficulty: '中等' },
  { id: 'emo-regulation', title: '情绪调节能力', description: '掌握内在感受的主导权。', category: AssessmentCategory.SELF, icon: <Icons.Self />, isLocked: true, timeEstimate: '10 min', difficulty: '中等' },
  { id: 'stress-coping', title: '压力应对模式', description: '压力之下你的真实反应模型。', category: AssessmentCategory.SELF, icon: <Icons.Self />, isLocked: true, timeEstimate: '15 min', difficulty: '深度' },

  // 趣味发现
  { id: 'spirit-animal', title: '精神动物测试', description: '你灵魂深处的原始力量。', category: AssessmentCategory.FUN, icon: <Icons.Fun />, isLocked: true, timeEstimate: '3 min', difficulty: '简单' },
  { id: 'personality-color', title: '人格色彩', description: '用颜色定义你的性格底色。', category: AssessmentCategory.FUN, icon: <Icons.Fun />, isLocked: true, timeEstimate: '2 min', difficulty: '简单' },
  { id: 'soul-scent', title: '灵魂香型', description: '捕捉你气质的嗅觉标签。', category: AssessmentCategory.FUN, icon: <Icons.Fun />, isLocked: true, timeEstimate: '4 min', difficulty: '简单' },
  { id: 'past-life', title: '前世今生', description: '开启灵魂的跨时空对话。', category: AssessmentCategory.FUN, icon: <Icons.Fun />, isLocked: true, timeEstimate: '20 min', difficulty: '深度' },

  // MBTI
  { id: 'mbti-core', title: 'MBTI', description: '经典性格分型工具，深度解析你的16型人格。', category: AssessmentCategory.MBTI, icon: <Icons.MBTI />, count: '100w+', hot: true, timeEstimate: '15-20 min', difficulty: '深度' }
];
