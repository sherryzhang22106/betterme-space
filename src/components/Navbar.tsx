import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface NavbarProps {
  onThemeChange: (theme: string) => void;
  currentTheme: string;
}

const Navbar: React.FC<NavbarProps> = ({ onThemeChange, currentTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoggedIn, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowThemeMenu(false);
      setShowUserMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const themes = [
    { id: 'default', name: '经典灵动', color: 'bg-indigo-500' },
    { id: 'theme-forest', name: '治愈森林', color: 'bg-emerald-600' },
    { id: 'theme-rose', name: '温柔晨曦', color: 'bg-rose-500' },
    { id: 'theme-ocean', name: '深海洞察', color: 'bg-sky-600' },
    { id: 'theme-hermes', name: '爱马仕橙', color: 'bg-[#FF7F00]' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-effect shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer logo-link group">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg transition-colors duration-500 group-hover:scale-110">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight text-slate-800">BetterMe Space</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">觅我空间</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowThemeMenu(!showThemeMenu); setShowUserMenu(false); }}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors"
            >
              氛围实验室
              <svg className={`w-4 h-4 ml-1 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showThemeMenu && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 p-2" onClick={(e) => e.stopPropagation()}>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onThemeChange(t.id); setShowThemeMenu(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${currentTheme === t.id ? 'bg-slate-50 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.color}`}></span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors nav-center">测评中心</button>

          <button
            onClick={() => document.getElementById('assessments')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-full hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95 duration-500"
          >
            开启发现之旅
          </button>

          {isLoggedIn() ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowThemeMenu(false); }}
                className="flex items-center space-x-2 pl-4 border-l border-slate-100"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-brand-primary">
                      {user?.nickname?.[0] || user?.account?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 py-2 border-b border-slate-50 mb-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.nickname || '未设置昵称'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.account}</p>
                  </div>
                  <Link to="/user" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setShowUserMenu(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>个人中心</span>
                  </Link>
                  <Link to="/user" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setShowUserMenu(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span>测评记录</span>
                  </Link>
                  <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth/login" className="flex items-center space-x-2 pl-4 border-l border-slate-100 text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span>登录</span>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-3">
          {isLoggedIn() ? (
            <Link to="/user" className="w-9 h-9 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-brand-primary">{user?.nickname?.[0] || user?.account?.[0] || 'U'}</span>
            </Link>
          ) : (
            <Link to="/auth/login" className="text-sm font-medium text-slate-600">登录</Link>
          )}
          <button className="text-slate-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
