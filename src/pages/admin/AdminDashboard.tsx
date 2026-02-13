import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface Stats {
  totalUsers: number;
  totalRecords: number;
  todayUsers: number;
  todayRecords: number;
}

interface User {
  id: string;
  account: string;
  nickname: string;
  role: string;
  createdAt: string;
}

interface Record {
  id: string;
  userId: string;
  userAccount: string;
  assessmentId: string;
  score: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'records'>('overview');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalRecords: 0, todayUsers: 0, todayRecords: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/auth/login');
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } else if (activeTab === 'records') {
        const res = await fetch('/api/admin/records');
        const data = await res.json();
        if (data.success) setRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-lg font-bold text-slate-800">BetterMe 管理后台</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">{user?.account}</span>
            <Link to="/" className="text-sm text-brand-primary hover:underline">返回前台</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-sm mb-8 w-fit">
          {[
            { key: 'overview', label: '数据概览' },
            { key: 'users', label: '用户管理' },
            { key: 'records', label: '测评记录' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="总用户数" value={stats.totalUsers} icon="👥" color="indigo" />
                <StatCard title="总测评数" value={stats.totalRecords} icon="📊" color="emerald" />
                <StatCard title="今日新增用户" value={stats.todayUsers} icon="🆕" color="amber" />
                <StatCard title="今日测评数" value={stats.todayRecords} icon="📈" color="rose" />
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">账号</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">昵称</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">角色</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">注册时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">暂无用户数据</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-sm text-slate-700">{u.account}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{u.nickname || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                              u.role === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.role === 'admin' ? '管理员' : '用户'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleString('zh-CN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Records Tab */}
            {activeTab === 'records' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">用户</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">测评</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">得分</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">暂无测评记录</td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-sm text-slate-700">{r.userAccount || '游客'}</td>
                          <td className="px-6 py-4 text-sm text-slate-700">{r.assessmentId}</td>
                          <td className="px-6 py-4 text-sm font-bold text-brand-primary">{r.score || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleString('zh-CN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
    </div>
  );
};

export default AdminDashboard;
