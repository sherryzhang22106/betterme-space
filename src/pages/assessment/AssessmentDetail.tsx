import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ASSESSMENTS } from '../../constants';

// iframe 内嵌的现有测评 URL 映射
const EMBEDDED_ASSESSMENTS: Record<string, string> = {
  'lying-flat': 'https://lying.bettermee.cn/',
  'internal-friction': 'https://hao.bettermee.cn/',
};

const AssessmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);

  const assessment = ASSESSMENTS.find(a => a.id === id);
  const embedUrl = id ? EMBEDDED_ASSESSMENTS[id] : null;

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">测评不存在</h2>
          <button onClick={() => navigate('/')} className="text-brand-primary hover:underline">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (assessment.isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">{assessment.title}</h2>
          <p className="text-slate-500 mb-8">该测评正在开发中，敬请期待...</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 如果有 iframe 嵌入 URL，显示嵌入页面
  if (embedUrl && started) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between h-14">
          <button
            onClick={() => setStarted(false)}
            className="flex items-center text-slate-500 hover:text-brand-primary transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            退出测评
          </button>
          <span className="text-sm font-bold text-slate-900">{assessment.title}</span>
          <div className="w-20"></div>
        </div>
        <iframe
          src={embedUrl}
          className="fixed top-14 left-0 right-0 bottom-0 w-full border-0"
          style={{ height: 'calc(100vh - 56px)' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 测评介绍页
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-400 hover:text-brand-primary transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-brand-primary">
              {assessment.icon}
            </div>
            {assessment.hot && (
              <span className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full text-xs font-black">
                HOT
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                {assessment.category}
              </span>
              {assessment.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  assessment.difficulty === '深度' ? 'bg-rose-50 text-rose-500' :
                  assessment.difficulty === '中等' ? 'bg-amber-50 text-amber-500' :
                  'bg-slate-50 text-slate-400'
                }`}>
                  {assessment.difficulty}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-4">{assessment.title}</h1>
            <p className="text-slate-500 leading-relaxed mb-8">{assessment.description}</p>

            <div className="flex items-center gap-6 text-sm text-slate-400 mb-10">
              {assessment.timeEstimate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {assessment.timeEstimate}
                </div>
              )}
              {assessment.count && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {assessment.count} 人已测
                </div>
              )}
            </div>

            <button
              onClick={() => embedUrl ? setStarted(true) : navigate(`/assessment/${id}/quiz`)}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
            >
              开始测评
            </button>

            <p className="text-center text-xs text-slate-300 mt-6">
              测评结果仅供参考，不作为专业诊断依据
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;
