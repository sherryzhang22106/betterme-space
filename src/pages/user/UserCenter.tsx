import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const UserCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();

  // 未登录跳转
  if (!isLoggedIn()) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50/30">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">还未登录</h2>
            <p className="text-sm text-slate-400 mb-8">登录后可查看测评历史记录和个人报告</p>
            <div className="space-y-3">
              <Link
                to="/auth/login"
                className="block w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
              >
                立即登录
              </Link>
              <Link
                to="/auth/register"
                className="block w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
              >
                注册账号
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-10">
          <button onClick={() => navigate('/')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-primary transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">个人中心</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-brand-primary">
                      {user?.nickname?.[0] || user?.account?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  {user?.nickname || '未设置昵称'}
                </h3>
                <p className="text-sm text-slate-400 mb-6">{user?.account}</p>
                <button className="w-full py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all">
                  编辑资料
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-rose-400 text-sm font-bold rounded-xl hover:bg-rose-50 transition-all"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>

          {/* Records */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900">测评记录</h3>
                <span className="text-xs text-slate-300 font-bold">共 0 条</span>
              </div>

              {/* Empty State */}
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium mb-6">还没有测评记录</p>
                <Link
                  to="/assessment-center"
                  className="inline-block px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
                >
                  去探索测评
                </Link>
              </div>

              {/* Record List (placeholder) */}
              {/* <div className="space-y-4">
                {records.map(record => (
                  <RecordItem key={record.id} record={record} />
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenter;
