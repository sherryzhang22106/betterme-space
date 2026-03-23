import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';

interface Result {
  title: string;
  description: string;
  score: number;
  tags?: string[];
}

interface RecordInfo {
  id: string;
  assessmentId: string;
  assessmentName: string;
  assessmentCover?: string;
  createdAt: string;
}

const ResultPage: React.FC = () => {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [record, setRecord] = useState<RecordInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResult();
  }, [recordId]);

  const loadResult = async () => {
    try {
      const res = await fetch(`/api/records/${recordId}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setRecord(data.record);
      }
    } catch (error) {
      console.error('Failed to load result:', error);
    }
    setLoading(false);
  };

  // 生成分享海报
  const generatePoster = async () => {
    if (!posterRef.current) return;

    setGenerating(true);
    try {
      // 隐藏按钮再截图
      setShowPoster(true);

      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(posterRef.current, {
        scale: 2, // 高清
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      // 转换为图片并下载
      const link = document.createElement('a');
      link.download = `betterme-result-${recordId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('生成海报失败:', error);
      alert('海报生成失败，请重试');
    } finally {
      setGenerating(false);
      setShowPoster(false);
    }
  };

  // 分享到微信（复制链接）
  const shareToWechat = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('链接已复制，请粘贴到微信分享');
    } catch {
      alert('分享链接：' + shareUrl);
    }
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
      {/* 隐藏的海报模板 */}
      {showPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div ref={posterRef} className="w-[375px] bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* 海报内容 */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-8 text-center text-white">
              <div className="text-sm opacity-80 mb-2">BetterMe Space · 觅我空间</div>
              <h1 className="text-2xl font-black mb-2">{record?.assessmentName || '测评结果'}</h1>
              <p className="text-lg opacity-90">你的专属分析</p>
            </div>

            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-full mb-4">
                <span className="text-5xl font-black text-brand-primary">{result.score}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">{result.title}</h2>

              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {result.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-bold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-slate-600 text-sm leading-relaxed mb-6">{result.description}</p>

              <div className="text-xs text-slate-400">
                {new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Result Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 p-8 text-center text-white">
            <p className="text-sm opacity-80 mb-2">{record?.assessmentName || '测评结果'}</p>
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
                onClick={generatePoster}
                disabled={generating}
                className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    生成分享海报
                  </>
                )}
              </button>

              <button
                onClick={shareToWechat}
                className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.69 14.56c-2.89-1.32-4.92-2.14-4.92-4.56 0-1.66 1.52-3.01 4.16-3.01 2.63 0 3.97 1.35 3.97 3.01 0 2.42-2.03 3.24-4.91 4.56-.17.08-.16.16-.02.22.15.06.31.04.42-.08.19-.2 2.99-2.86 4.51-3.7.07-.04.09-.08.09-.14-.01-.12-.02-.17-.03-.24-.07.03-.15.07-.24.11-.09.05-.14.1-.14.17 0 .06.04.12.09.15.05.03.05.07.01.11-.04.04-2.59 2.29-4.53 3.72-.06.04-.08.06-.05.12.03.06.07.11.12.14.05.03.08.06.05.1-.03.04-3.17 2.74-3.17 4.67 0 1.78 1.38 3.21 3.65 3.21 2.14 0 3.58-1.29 3.58-3.21 0-1.77-1.28-2.62-4.11-3.77-.12-.05-.12-.11-.02-.16.11-.05.18-.03.25.02 1.01.72 2.53 2.11 2.53 2.88 0 .68-.34 1.15-.87 1.15-.59 0-.95-.56-.95-1.32 0-1.18.91-2.5 2.31-4.27.15-.19.02-.27-.1-.27-.08 0-.15.04-.22.08l-3.17 2.16c-.19.12-.24.1-.28-.02-.04-.12-.12-.21-.21-.21-.08 0-.14.04-.18.08l-2.19 2.02c-.13.12-.1.19.02.27.12.08 3.03 1.99 3.03 3.19 0 .95-.76 1.95-2.13 1.95-1.56 0-2.6-1.26-2.6-2.81 0-2.08 1.69-4.37 4.59-6.13l3.78-2.27c.25-.15.2-.22.1-.32-.08-.08-.12-.12-.21-.12-.1 0-.15.04-.21.12l-2.88 2.95c-.12.13-.08.19.02.27.09.08 1.97 1.67 3.17 2.73z"/>
                </svg>
                分享到微信
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
