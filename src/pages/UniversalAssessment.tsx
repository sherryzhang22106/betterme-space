import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentModal from '@/components/PaymentModal';

interface Question {
  id: number;
  order_num: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options: Array<{
    id: number;
    option_text: string;
    option_value: number;
    order_num: number;
  }>;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  price: number;
  questionCount: number;
  estimatedTime: number;
}

const UniversalAssessment: React.FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    checkAccessAndLoadTheme();
  }, [themeId]);

  const checkAccessAndLoadTheme = async () => {
    setLoading(true);

    try {
      // 检查权限
      if (userId) {
        const accessRes = await fetch(`/api/entitlements/check?userId=${userId}&themeId=${themeId}`);
        const accessData = await accessRes.json();

        if (accessData.success && accessData.hasAccess) {
          setHasAccess(true);
        }
      }

      // 加载主题和题目
      const themeRes = await fetch(`/api/themes/${themeId}`);
      const themeData = await themeRes.json();

      if (themeData.success) {
        setTheme(themeData.theme);
        setQuestions(themeData.questions);

        // 如果是免费主题，直接授予访问权限
        if (themeData.theme.price === 0) {
          setHasAccess(true);
        }
      }
    } catch (error) {
      console.error('加载失败:', error);
    }

    setLoading(false);
  };

  const handleSelectOption = (questionId: number, optionId: number, isMultiple: boolean) => {
    setAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // 检查是否所有必答题都已回答
    const unanswered = questions.filter(
      (q) => q.is_required && !answers[q.id]
    );

    if (unanswered.length > 0) {
      alert('请回答所有必答题');
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
        questionId: Number(questionId),
        selectedOptionIds
      }));

      const res = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId,
          userId,
          answers: formattedAnswers
        })
      });

      const data = await res.json();

      if (data.success) {
        // 跳转到结果页
        navigate(`/assessment/${themeId}/result/${data.recordId}`);
      } else {
        alert(data.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    }

    setSubmitting(false);
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

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">主题不存在</p>
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

  // 需要支付
  if (!hasAccess && theme.price > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <img
            src={theme.coverImage || '/images/default-theme.jpg'}
            alt={theme.name}
            className="w-full h-48 object-cover rounded-2xl mb-6"
          />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{theme.name}</h1>
          <p className="text-slate-600 mb-4">{theme.description}</p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500 mb-6">
            <span>📝 {theme.questionCount} 题</span>
            <span>⏱️ {theme.estimatedTime} 分钟</span>
          </div>
          <p className="text-3xl font-black text-brand-primary mb-6">
            ¥{theme.price.toFixed(2)}
          </p>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-primary/90"
          >
            立即购买
          </button>
        </div>

        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          theme={theme}
          onSuccess={() => {
            setHasAccess(true);
            setShowPayment(false);
          }}
        />
      </div>
    );
  }

  // 开始测评
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">
              {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id]?.includes(option.id);
              const isMultiple = currentQuestion.question_type === 'multiple_choice';

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id, isMultiple)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-slate-700">{option.option_text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            上一题
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {submitting ? '提交中...' : '提交答案'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90"
            >
              下一题
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalAssessment;
