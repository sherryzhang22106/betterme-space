import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface Result {
  title: string;
  description: string;
  score: number;
  tags?: string[];
}

const ResultPage: React.FC = () => {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [recordId]);

  const loadResult = async () => {
    try {
      const res = await fetch(`/api/records/${recordId}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Failed to load result:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-primary/5 to-white">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">正在生成你的专属报告...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">结果加载失败</p>
          <button onClick={() => navigate('/')} className="text-brand-primary hover:underline">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/10 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Result Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-8 text-center text-white">
            <p className="text-sm opacity-80 mb-2">你的测评结果</p>
            <h1 className="text-3xl font-black mb-4">{result.title}</h1>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
              <span className="text-4xl font-black">{result.score}</span>
            </div>
            <p className="text-sm opacity-80 mt-2">综合得分</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Tags */}
            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {result.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-bold rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-slate-600 leading-relaxed mb-8">{result.description}</p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {/* TODO: 生成海报 */}}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all"
              >
                生成分享海报
              </button>
              <Link
                to="/"
                className="block w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl text-center hover:bg-slate-200 transition-all"
              >
                探索更多测评
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          BetterMe Space · 觅我空间
        </p>
      </div>
    </div>
  );
};

export default ResultPage;
