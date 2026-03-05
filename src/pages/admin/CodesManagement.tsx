import React, { useState, useEffect } from 'react';

interface CodeStats {
  total: number;
  used: number;
  active: number;
  usageRate: string;
}

interface ProductStat {
  product_id: string;
  product_name: string;
  total: number;
  used: number;
  active: number;
}

interface RedemptionCode {
  id: string;
  code: string;
  product_id: string;
  product_name: string;
  batch_no: string;
  status: string;
  used_by: string;
  used_at: string;
  created_at: string;
}

const CodesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'list' | 'stats'>('stats');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('admin_token');

  // 生成兑换码表单（通用兑换码，不绑定产品）
  const [generateForm, setGenerateForm] = useState({
    count: 10,
    batchNo: '',
    notes: ''
  });

  // 兑换码列表
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  // 统计数据
  const [stats, setStats] = useState<CodeStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'list') {
      fetchCodes();
    }
  }, [activeTab, filterStatus]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/codes?action=stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setProductStats(data.productStats);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    }
    setLoading(false);
  };

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'list' });
      if (filterStatus) params.append('status', filterStatus);

      const res = await fetch(`/api/admin/codes?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCodes(data.codes);
      }
    } catch (error) {
      console.error('获取兑换码列表失败:', error);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (generateForm.count < 1) {
      alert('请输入有效的生成数量');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/codes?action=generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(generateForm)
      });

      const data = await res.json();
      if (data.success) {
        alert(`成功生成 ${data.codes.length} 个兑换码`);
        // 下载兑换码
        downloadCodes(data.codes);
        // 重置表单
        setGenerateForm({ ...generateForm, count: 10, batchNo: '', notes: '' });
      } else {
        alert(data.message || '生成失败');
      }
    } catch (error) {
      console.error('生成兑换码失败:', error);
      alert('生成失败');
    }
    setLoading(false);
  };

  const downloadCodes = (codes: any[]) => {
    const content = codes.map(c => `${c.code}\t${c.created_at}`).join('\n');
    const header = '兑换码\t生成时间\n';
    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `通用兑换码_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('已复制到剪贴板');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-sm w-fit">
        {[
          { key: 'stats', label: '数据统计' },
          { key: 'generate', label: '生成兑换码' },
          { key: 'list', label: '兑换码列表' }
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

      {/* 统计面板 */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* 总体统计 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="总兑换码" value={stats.total} color="indigo" />
              <StatCard title="已使用" value={stats.used} color="emerald" />
              <StatCard title="未使用" value={stats.active} color="amber" />
              <StatCard title="使用率" value={stats.usageRate} color="rose" isPercentage />
            </div>
          )}

          {/* 产品统计 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">各产品兑换码统计</h3>
            <div className="space-y-3">
              {productStats.map((stat) => (
                <div key={stat.product_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800">{stat.product_name}</p>
                    <p className="text-sm text-slate-500">ID: {stat.product_id}</p>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-slate-500">总数</p>
                      <p className="font-bold text-slate-800">{stat.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">已用</p>
                      <p className="font-bold text-emerald-600">{stat.used}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-500">未用</p>
                      <p className="font-bold text-amber-600">{stat.active}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 生成兑换码 */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">批量生成通用兑换码</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>通用兑换码：</strong>生成的兑换码可用于任何测评产品，用户可自由选择使用，每个兑换码只能使用一次。
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">生成数量</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={generateForm.count}
                onChange={(e) => setGenerateForm({ ...generateForm, count: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">批次号（可选）</label>
              <input
                type="text"
                placeholder="例如：2024-03-batch-01"
                value={generateForm.batchNo}
                onChange={(e) => setGenerateForm({ ...generateForm, batchNo: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">备注（可选）</label>
              <textarea
                placeholder="例如：小红书活动专用"
                value={generateForm.notes}
                onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                rows={3}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {loading ? '生成中...' : '生成兑换码'}
            </button>
          </div>
        </div>
      )}

      {/* 兑换码列表 */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* 筛选 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">全部状态</option>
              <option value="active">未使用</option>
              <option value="used">已使用</option>
              <option value="expired">已过期</option>
            </select>
          </div>

          {/* 列表 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">兑换码</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">使用产品</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">批次号</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">使用时间</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">暂无数据</td>
                  </tr>
                ) : (
                  codes.map((code) => (
                    <tr key={code.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">{code.code}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {code.used_for_product_name || <span className="text-slate-400">通用（未使用）</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{code.batch_no || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                          code.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                          code.status === 'used' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-100 text-rose-600'
                        }`}>
                          {code.status === 'active' ? '未使用' : code.status === 'used' ? '已使用' : '已过期'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {code.used_at ? new Date(code.used_at).toLocaleString('zh-CN') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyCode(code.code)}
                          className="text-sm text-brand-primary hover:underline"
                        >
                          复制
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; color: string; isPercentage?: boolean }> = ({
  title,
  value,
  color,
  isPercentage = false
}) => {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-slate-500 font-medium mb-2">{title}</p>
      <p className={`text-3xl font-black ${colorClasses[color]}`}>
        {isPercentage ? value : typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
};

export default CodesManagement;
