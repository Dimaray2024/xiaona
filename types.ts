export enum Tab {
  CHAT = '聊天辅导',
  ANALYZE = '题目解析',
  GRADE = '批改作业',
  MISTAKES = '错题本',
}

export type Subject = '语文' | '数学' | '英语' | '其他';

export interface Mistake {
  id: string;
  homeworkImages: string[]; // 支持多张图片
  problemDescription: string;
  reasonForError: string;
  correctSteps: string;
  subject: Subject;
}

export interface GradedMistake {
    problemDescription: string;
    reasonForError: string; // 为什么错误
    correctSteps: string; // 正确的解题步骤
    subject: Subject;
}

export interface GradingResponse {
    isBlank: boolean;
    mistakes: GradedMistake[];
}

export interface StructuredAnalysis {
    title: string;
    sections: {
        subtitle: string;
        content: string;
    }[];
}


export interface AnalysisResult {
    title: string;
    content: string | Mistake[];
}

export interface User {
    id: string;
    username: string;
    email?: string;
    password?: string; // 只在注册和更新时使用
    avatar: string; // 可以是 emoji 或 base64/URL
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    images?: string[]; // base64 data URLs
}