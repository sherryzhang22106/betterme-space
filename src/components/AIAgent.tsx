import React, { useState } from 'react';

const AIAgent: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.reply);
      } else {
        setResult("抱歉，我的思维网络暂时断开了，请稍后再试。");
      }
    } catch (error) {
      console.error(error);
      setResult("抱歉，我的思维网络暂时断开了，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 overflow-hidden relative transition-all duration-700 bg-slate-50/50 backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none overflow-hidden">
         <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full filter blur-[120px] transition-all duration-1000 animate-pulse" style={{ backgroundColor: 'var(--brand-primary)' }}></div>
         <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full filter blur-[120px] transition-all duration-1000 animation-delay-2000 animate-pulse" style={{ backgroundColor: 'var(--brand-secondary)' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-6 bg-white/80 border border-white shadow-sm transition-all duration-500">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Cognitive Lab Insight</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            灵魂深处，<span className="gradient-text">自有回响</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            在实验室的晶体结构中，我们用 AI 捕捉你内在精神状态的每一缕微光。
          </p>
        </div>

        <div className="bg-white/30 backdrop-blur-[60px] border border-white/60 p-10 md:p-14 rounded-[4rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.03)] transition-all duration-700 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>

          <div className="mb-10 relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-white to-transparent opacity-20 rounded-[2.5rem] blur-sm"></div>
             <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="分享你当下的状态或困惑..."
              className="relative w-full h-44 bg-white/50 border border-white/50 rounded-[2.5rem] p-8 text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-xl font-medium focus:bg-white/70"
              style={{ caretColor: 'var(--brand-primary)' }}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleAsk}
              disabled={isLoading}
              className="relative group px-16 py-6 rounded-3xl font-black text-white transition-all transform hover:scale-105 active:scale-95 flex items-center shadow-2xl overflow-hidden"
              style={{ background: isLoading ? '#cbd5e1' : 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)' }}
            >
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>

              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>实验室深度解析中...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10 text-lg">触碰内在回响</span>
                  <svg className="w-6 h-6 ml-3 relative z-10 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-14">
              <div className="p-10 bg-white/60 border border-white/80 rounded-[3rem] shadow-sm relative overflow-hidden group/result">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl group-hover/result:scale-150 transition-transform duration-1000"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                  <div className="mb-6 md:mb-0 w-20 h-20 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center font-bold text-white transition-all duration-700 shadow-xl shadow-brand-primary/20 rotate-6 group-hover/result:rotate-0" style={{ backgroundColor: 'var(--brand-primary)' }}>
                     <span className="text-3xl">觅</span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 rounded-lg bg-slate-50 text-[10px] font-black uppercase tracking-[0.25em] mb-4 transition-colors duration-700" style={{ color: 'var(--brand-primary)' }}>
                      AI 内在洞察报告
                    </div>
                    <p className="text-slate-800 leading-relaxed text-xl font-semibold italic">"{result}"</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIAgent;
