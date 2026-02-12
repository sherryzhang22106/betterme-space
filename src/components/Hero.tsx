import React from 'react';

interface HeroProps {
  onExploreAI: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExploreAI }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">AI 驱动 · 性格行为分析</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              在 BetterMe Space <br />
              <span className="gradient-text">挖掘更有趣的自己</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              融合性格行为学研究与前沿 AI 分析技术。在这里，测评不只是选择题，更是一场关于内在自我的深度对话。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => document.getElementById('assessments')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1"
              >
                立即开始免费探索
              </button>
              <button
                onClick={onExploreAI}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                了解 AI 分析原理
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-slate-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zM7 13a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
                50+ 专业主题
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-brand-primary mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
                1M+ 已完成探索
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop"
              alt="BetterMe Space Visual"
              className="relative rounded-3xl shadow-2xl z-10 border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
            />
            <div className="absolute -bottom-6 -right-6 glass-effect p-6 rounded-2xl shadow-xl z-20 border border-white/50 max-w-xs">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-brand-primary font-bold">AI</span>
                </div>
                <div className="text-xs font-bold text-slate-800">实时分析中...</div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                "基于你的内在逻辑轨迹分析，当前精神丰盈度较高。推荐尝试【灵魂香型】探测。"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
