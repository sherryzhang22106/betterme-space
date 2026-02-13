import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'scale';
  content: string;
  options?: { id: string; label: string; value: number }[];
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
}

interface AssessmentConfig {
  id: string;
  title: string;
  questions: Question[];
  scoring: { method: string };
  results: { id: string; min: number; max: number; title: string; description: string }[];
}

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();

  const [config, setConfig] = useState<AssessmentConfig | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadConfig();
  }, [id]);

  const loadConfig = async () => {
    try {
      const res = await fetch(`/api/assessments/${id}`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load assessment:', error);
      navigate('/');
    }
    setLoading(false);
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < (config?.questions.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!config) return;

    setSubmitting(true);
    const duration = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, duration })
      });
      const data = await res.json();

      if (data.success) {
        navigate(`/assessment/${id}/result/${data.recordId}`);
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error) {
      alert('提交失败，请重试');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">测评配置加载失败</p>
      </div>
    );
  }

  const currentQuestion = config.questions[currentIndex];
  const progress = ((currentIndex + 1) / config.questions.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentIndex === config.questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm font-bold text-slate-900">{config.title}</span>
          <span className="text-sm text-slate-400">{currentIndex + 1}/{config.questions.length}</span>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="pt-24 pb-32 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <p className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
              {currentQuestion.content}
            </p>

            {/* Single Choice */}
            {currentQuestion.type === 'single' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                    className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-slate-100 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Scale */}
            {currentQuestion.type === 'scale' && currentQuestion.scale && (
              <div className="space-y-6">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{currentQuestion.scale.minLabel}</span>
                  <span>{currentQuestion.scale.maxLabel}</span>
                </div>
                <div className="flex justify-between gap-2">
                  {Array.from(
                    { length: currentQuestion.scale.max - currentQuestion.scale.min + 1 },
                    (_, i) => currentQuestion.scale!.min + i
                  ).map(value => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(currentQuestion.id, value)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        answers[currentQuestion.id] === value
                          ? 'bg-brand-primary text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 text-slate-400 font-bold disabled:opacity-30"
          >
            上一题
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered || submitting}
              className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl disabled:opacity-50 shadow-lg shadow-brand-primary/20"
            >
              {submitting ? '提交中...' : '提交答案'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="px-8 py-3 bg-brand-primary text-white font-bold rounded-2xl disabled:opacity-50 shadow-lg shadow-brand-primary/20"
            >
              下一题
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
