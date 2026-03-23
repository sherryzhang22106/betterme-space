import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Theme {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  price: number;
  question_count: number;
  estimated_time: number;
  status: string;
}

const ThemeList: React.FC = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes/list');
      const data = await res.json();
      if (data.success) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error('获取主题列表失败:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-800 mb-4">探索你的内心世界</h1>
          <p className="text-lg text-slate-600">专业的心理测评，帮助你更好地了解自己</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/assessment/${theme.id}`)}
            >
              <div className="relative h-48 bg-gradient-to-br from-brand-primary/20 to-brand-primary/5">
                {theme.cover_image ? (
                  <img
                    src={theme.cover_image}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🧠</span>
                  </div>
                )}
                {theme.price === 0 && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    免费
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{theme.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{theme.description}</p>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <span>📝 {theme.question_count} 题</span>
                  <span>⏱️ {theme.estimated_time} 分钟</span>
                </div>

                <div className="flex items-center justify-between">
                  {theme.price > 0 ? (
                    <span className="text-2xl font-black text-brand-primary">
                      ¥{theme.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-emerald-600">免费体验</span>
                  )}
                  <button className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90">
                    开始测评
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {themes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">暂无可用的测评主题</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeList;
