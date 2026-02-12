import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">BetterMe Space</span>
            </div>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
              BetterMe Space (觅我空间) 致力于利用性格行为分析与 AI 技术，为现代人提供更精准、更有温度的内在探索服务，助你找回真实的自我。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors">
                <span className="sr-only">WeChat</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.2 13.9c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5zm4.8 0c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5zm6.5-5.2c-1.1-1.6-2.9-2.7-5-2.7-3.8 0-6.9 2.1-6.9 4.8 0 1.5 1 2.8 2.5 3.7l-.6 1.8 2.1-1.1c.9.3 1.9.4 2.9.4 3.8 0 6.9-2.1 6.9-4.8 0-.8-.3-1.5-.9-2.1z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors">
                 <span className="sr-only">Weibo</span>
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">探索维度</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('')} className="text-slate-500 hover:text-brand-primary text-sm transition-colors">性格分类</button></li>
              <li><button onClick={() => onNavigate('')} className="text-slate-500 hover:text-brand-primary text-sm transition-colors">内在探索</button></li>
              <li><button onClick={() => onNavigate('')} className="text-slate-500 hover:text-brand-primary text-sm transition-colors">认知实验</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">合规与支持</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('terms/service')} className="text-slate-500 hover:text-brand-primary text-sm transition-colors">服务协议</button></li>
              <li><button onClick={() => onNavigate('terms/privacy')} className="text-slate-500 hover:text-brand-primary text-sm transition-colors">隐私政策</button></li>
              <li><button onClick={() => onNavigate('terms/disclaimer')} className="text-slate-500 hover:text-brand-primary text-sm transition-colors">免责声明</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} BetterMe Space | 觅我空间. All rights reserved. 京ICP备XXXXXXXX号
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
