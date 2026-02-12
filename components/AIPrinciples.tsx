
import React from 'react';

const AIPrinciples: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const steps = [
    {
      title: "行为轨迹捕捉",
      desc: "AI 并不是简单读取答案，而是分析你在面对认知困境时的反应模式与选择逻辑。",
      icon: "01"
    },
    {
      title: "认知图谱建模",
      desc: "整合 Big Five (大五人格)、MBTI 与行为经济学模型，构建你的多维内在镜像。",
      icon: "02"
    },
    {
      title: "语义深度解析",
      desc: "利用 LLM 理解文本背后的情感倾向与语境，识别隐秘的防御机制或潜能点。",
      icon: "03"
    },
    {
      title: "个性化生长蓝图",
      desc: "输出不仅仅是标签，更是基于你当前状态的成长建议与内在能量平衡策略。",
      icon: "04"
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="mb-12 text-slate-400 hover:text-brand-primary flex items-center transition-all group">
          <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          返回
        </button>

        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">探索 AI 洞察背后的<span className="gradient-text">认知科学</span></h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            在 BetterMe Space，我们不相信单一的标签。我们利用行为建模技术，为您提供更深维度的自我发现体验。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-24">
          {steps.map((step, i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
              <span className="absolute -top-6 -right-6 text-9xl font-black text-white/40 select-none group-hover:text-brand-primary/10 transition-colors">{step.icon}</span>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-12 rounded-[4rem] bg-brand-primary text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
             <h2 className="text-3xl font-black mb-6">科学与隐私并重</h2>
             <p className="text-white/80 leading-relaxed text-lg mb-8 max-w-3xl">
               本平台的 AI 模型经过行为分析领域深度训练，确保建议的建设性。同时，您的所有原始交互数据仅用于生成您的个人报告，不会用于任何形式的医疗诊断。
             </p>
             <button onClick={onBack} className="px-8 py-4 bg-white text-brand-primary rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">
               立即开启我的第一次探索
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrinciples;
