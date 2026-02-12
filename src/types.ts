import React from 'react';

export enum AssessmentCategory {
  MOOD = '情绪调节',
  LIFE = '人生探索',
  LOVE = '情感实验室',
  CAREER = '职场发展',
  SOCIAL = '社交关系',
  SELF = '自我认知',
  FUN = '趣味发现',
  MBTI = 'MBTI/网上整合'
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: AssessmentCategory;
  icon: React.ReactNode;
  coverImage?: string;
  count?: string;
  hot?: boolean;
  isLocked?: boolean;
  timeEstimate?: string;
  difficulty?: '简单' | '中等' | '深度';
}

export interface User {
  id: string;
  account: string;
  nickname?: string;
  avatar?: string;
  createdAt: string;
}

export interface AssessmentRecord {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  resultTitle: string;
  createdAt: string;
}
