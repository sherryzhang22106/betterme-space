
import React, { useState } from 'react';
import { ASSESSMENTS } from '../constants';
import { AssessmentCategory } from '../types';
import AssessmentCard from './AssessmentCard';

const AssessmentCenter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<AssessmentCategory | 'ALL'>('ALL');
  const [diff, setDiff] = useState<'ALL' | '简单' | '中等' | '深度'>('ALL');

  const filtered = ASSESSMENTS.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = cat === 'ALL' || a.category === cat;
    const matchesDiff = diff === 'ALL' || a.difficulty === diff;
    return matchesSearch && matchesCat && matchesDiff;
  });

  return (
    <div className="pt-32 pb-24 bg-slate-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-primary transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">测评探索中心</h1>
          </div>
          
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="搜索测评名称或关键词..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-700 transition-all pl-14"
            />
            <svg className="w-6 h-6 absolute left-5 top-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-10">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">分类筛选</h3>
              <div className="space-y-3">
                {['ALL', ...Object.values(AssessmentCategory)].map(c => (
                  <button 
                    key={c}
                    onClick={() => setCat(c as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${cat === c ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {c === 'ALL' ? '全部维度' : c}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">深度等级</h3>
              <div className="space-y-3">
                {['ALL', '简单', '中等', '深度'].map(d => (
                  <button 
                    key={d}
                    onClick={() => setDiff(d as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${diff === d ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {d === 'ALL' ? '不限难度' : d}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <div className="lg:col-span-9">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(item => (
                <AssessmentCard key={item.id} assessment={item} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <p className="text-slate-400 font-bold">没有发现符合筛选条件的实验室...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCenter;
