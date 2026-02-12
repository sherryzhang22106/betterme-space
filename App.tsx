
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AssessmentCard from './components/AssessmentCard';
import AIAgent from './components/AIAgent';
import Footer from './components/Footer';
import Terms, { TermType } from './components/Terms';
import AIPrinciples from './components/AIPrinciples';
import AssessmentCenter from './components/AssessmentCenter';
import { ASSESSMENTS } from './constants';
import { AssessmentCategory } from './types';

type View = 'home' | 'service' | 'privacy' | 'disclaimer' | 'ai-principles' | 'assessment-center';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<AssessmentCategory | 'ALL'>('ALL');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentView, setCurrentView] = useState<View>('home');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    const body = document.body;
    body.classList.remove('theme-forest', 'theme-rose', 'theme-ocean', 'theme-hermes');
    if (theme !== 'default') {
      body.classList.add(theme);
    }
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAssessments = activeCategory === 'ALL' 
    ? ASSESSMENTS 
    : ASSESSMENTS.filter(a => a.category === activeCategory);

  // Home section folding logic: only show 8 items if not expanded
  const visibleAssessments = isExpanded ? filteredAssessments : filteredAssessments.slice(0, 8);

  const categories = ['ALL', ...Object.values(AssessmentCategory)];

  const handleLogoClick = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onExploreAI={() => handleNavigate('ai-principles')} />

            {/* Categories Section */}
            <section className="py-24 bg-white" id="assessments">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                   <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">探索你的认知光谱</h2>
                   <p className="text-slate-400 font-medium italic">“在性格的海洋中，找寻属于你的那座岛屿”</p>
                </div>
                
                <div className="flex justify-center mb-16">
                  <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat as any); setIsExpanded(false); }}
                        className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all duration-500 border
                          ${activeCategory === cat 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-brand-primary/30 hover:text-brand-primary'
                          }`}
                      >
                        {cat === 'ALL' ? '全部维度' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700`}>
                    {visibleAssessments.map((item) => (
                      <AssessmentCard key={item.id} assessment={item} />
                    ))}
                  </div>

                  {/* Fold Gradient & Button */}
                  {!isExpanded && filteredAssessments.length > 8 && (
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/90 to-transparent z-20 flex items-end justify-center pb-12">
                      <button 
                        onClick={() => setIsExpanded(true)}
                        className="group flex flex-col items-center space-y-3 px-10 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-2xl hover:shadow-brand-primary/20 transition-all hover:-translate-y-1"
                      >
                        <span className="text-xs font-black text-slate-900 tracking-widest uppercase">展开全部实验室维度</span>
                        <svg className="w-5 h-5 text-brand-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                      </button>
                    </div>
                  )}

                  {isExpanded && filteredAssessments.length > 8 && (
                    <div className="mt-16 flex justify-center">
                      <button 
                        onClick={() => { setIsExpanded(false); window.scrollTo({ top: document.getElementById('assessments')?.offsetTop! - 100, behavior: 'smooth' }); }}
                        className="px-8 py-3 bg-slate-50 text-slate-400 text-xs font-bold rounded-2xl hover:bg-slate-100 transition-all"
                      >
                        收起探索列表
                      </button>
                    </div>
                  )}
                </div>

                {filteredAssessments.length === 0 && (
                  <div className="py-20 text-center text-slate-300 font-bold italic">
                    此实验室正在搭建中，敬请期待新维度的开启。
                  </div>
                )}
              </div>
            </section>

            <AIAgent />

            {/* Brand Values Section */}
            <section className="py-24 bg-slate-50/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-16">
                  <div className="group p-8 rounded-[2.5rem] bg-white border border-white hover:shadow-2xl transition-all duration-700">
                    <div className="w-14 h-14 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary mb-6 transition-all group-hover:scale-110">
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/><path d="M12 12V7M12 16h.01" strokeWidth="2.5"/></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">AI 行为实验室</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">整合 MBTI、性格分类学与大语言模型，提供不仅专业且富有温情的内在解读。</p>
                  </div>
                  <div className="group p-8 rounded-[2.5rem] bg-white border border-white hover:shadow-2xl transition-all duration-700">
                    <div className="w-14 h-14 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary mb-6 transition-all group-hover:scale-110">
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M12 3v18M3 12h18"/></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">多维评估体系</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">基于广泛的行为数据分析，确保每一次点击都通向真实的自我镜像。</p>
                  </div>
                  <div className="group p-8 rounded-[2.5rem] bg-white border border-white hover:shadow-2xl transition-all duration-700">
                    <div className="w-14 h-14 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary mb-6 transition-all group-hover:scale-110">
                       <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">隐私安全围墙</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">端到端数据加密，守护你精神家园最隐秘的角落。</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        );
      case 'ai-principles':
        return <AIPrinciples onBack={() => handleNavigate('home')} />;
      case 'assessment-center':
        return <AssessmentCenter onBack={() => handleNavigate('home')} />;
      case 'service':
      case 'privacy':
      case 'disclaimer':
        return <Terms type={currentView as TermType} onBack={() => handleNavigate('home')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-500 overflow-x-hidden">
      <nav onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.logo-link')) handleLogoClick();
        if (target.closest('.nav-center')) handleNavigate('assessment-center');
      }}>
        <Navbar onThemeChange={handleThemeChange} currentTheme={currentTheme} />
      </nav>
      
      <main>
        {renderContent()}

        {/* Floating Contact */}
        <div className="fixed bottom-8 right-8 z-40">
           <button className="w-16 h-16 bg-white border border-slate-100 text-brand-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-500 group">
              <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2.5"/></svg>
           </button>
        </div>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
