import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Assessment } from '../types';

interface Props {
  assessment: Assessment;
}

const AssessmentCard: React.FC<Props> = ({ assessment }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!assessment.isLocked) {
      navigate(`/assessment/${assessment.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-[2.5rem] overflow-hidden transition-all duration-700 flex flex-col h-full bg-white border border-slate-100
      ${assessment.isLocked
        ? 'cursor-default'
        : 'shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-pointer'
      }`}>

      <div className="relative h-52 overflow-hidden flex items-center justify-center transition-all duration-500">
        {assessment.coverImage ? (
          <>
            <img
              src={assessment.coverImage}
              alt={assessment.title}
              className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-1000 ${!assessment.isLocked && 'group-hover:scale-110'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 transition-opacity duration-500 opacity-10"
               style={{ background: `radial-gradient(circle at center, var(--brand-primary) 0%, transparent 70%)` }}>
          </div>
        )}

        <div className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700
          ${assessment.isLocked
            ? 'text-slate-300 bg-white/10'
            : 'text-brand-primary bg-white/30 backdrop-blur-md border border-white/60 shadow-xl group-hover:scale-110 group-hover:rotate-3'}`}>
          {assessment.icon}
        </div>

        {assessment.isLocked && (
          <div className="absolute inset-0 z-20 backdrop-blur-[12px] bg-white/30 flex items-center justify-center">
            <div className="px-5 py-2 bg-white/60 backdrop-blur-md border border-white/80 rounded-full shadow-sm transform translate-y-8">
              <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">敬请期待</span>
            </div>
          </div>
        )}

        <div className="absolute top-5 left-5 z-30">
          <span className="px-3 py-1 bg-white/80 backdrop-blur-md border border-white/50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {assessment.category}
          </span>
        </div>

        {!assessment.isLocked && assessment.timeEstimate && (
          <div className="absolute bottom-4 left-5 z-30 flex items-center space-x-1 px-2 py-0.5 bg-slate-900/5 backdrop-blur-sm rounded-md">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
            <span className="text-[9px] font-bold text-slate-400">{assessment.timeEstimate}</span>
          </div>
        )}

        {assessment.hot && !assessment.isLocked && (
          <div className="absolute top-5 right-5 z-30">
            <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-bounce">
              HOT
            </span>
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-xl font-black transition-colors duration-300 tracking-tight
            ${assessment.isLocked ? 'text-slate-500' : 'text-slate-900 group-hover:text-brand-primary'}`}>
            {assessment.title}
          </h3>
          {assessment.difficulty && (
             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
               assessment.difficulty === '深度' ? 'border-rose-200 text-rose-400' :
               assessment.difficulty === '中等' ? 'border-amber-200 text-amber-500' :
               'border-slate-200 text-slate-400'
             }`}>
               {assessment.difficulty}
             </span>
          )}
        </div>
        <p className={`text-xs leading-relaxed line-clamp-2 mb-8 font-medium
          ${assessment.isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
          {assessment.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Engagement</span>
            <span className={`text-sm font-black ${assessment.isLocked ? 'text-slate-200' : 'text-slate-900'}`}>
              {assessment.isLocked ? '探索中' : assessment.count}
            </span>
          </div>

          {!assessment.isLocked && (
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-primary/20 transition-all duration-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard;
