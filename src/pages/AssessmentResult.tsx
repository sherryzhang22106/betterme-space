import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Result {
  score: number;
  title: string;
  content: string;
  image: string;
  tags: string[];
}

const AssessmentResult: React.FC = () => {
  const { themeId, recordId } = useParams<{ themeId: string; recordId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [themeName, setThemeName] = useState('');

  useEffect(() => {
    fetchResult();
  }, [recordId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments/result/${recordId}`);
      const data = await res.json();

      if (data.success) {
        setResult(data.result);
        setThemeName(data.themeName);
      }
    } catch (error) {
      console.error('获取结果失败:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-slate-500">生成结果中...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">结果不存在</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-brand-primary hover:underline"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 结果卡片 */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          {/* 头部 */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white p-8 text-center">
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-bold">
                {themeName}
              </span>
            </div>
            <h1 className="text-3xl font-black mb-2">{result.title}</h1>
            <p className="text-lg opacity-90">你的得分：{result.score}</p>
          </div>

          {/* 结果图片 */}
          {result.image && (
            <div className="relative h-64 bg-slate-100">
              <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 标签 */}
          {result.tags && result.tags.length > 0 && (
            <div className="px-8 pt-6 flex flex-wrap gap-2">
              {result.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 结果内容 */}
          <div className="p-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {result.content}
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-50"
          >
            返回首页
          </button>
          <button
            onClick={() => navigate(`/assessment/${themeId}`)}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90"
          >
            再测一次
          </button>
        </div>

        {/* 分享提示 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            💡 截图保存你的测评结果，分享给朋友
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
