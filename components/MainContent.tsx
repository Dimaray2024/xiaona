import React, { useState, useEffect } from 'react';
import { Tab, Mistake, GradedMistake, StructuredAnalysis } from '../types';
import TabButton from './TabButton';
import Chat from './Chat';
import MistakeLog from './MistakeLog';
import FileUpload from './FileUpload';
import LoadingSpinner from './LoadingSpinner';
import ResponseDisplay from './ResponseDisplay';
import GradingResultDisplay from './GradingResultDisplay';
import { getProblemAnalysis, gradeHomework, compressImage } from '../services/geminiService';

const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const GradeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MistakesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;


interface MainContentProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, setActiveTab }) => {
    const [mistakes, setMistakes] = useState<Mistake[]>([]);
    
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<StructuredAnalysis | null>(null);
    const [gradingResult, setGradingResult] = useState<{ message: string; mistakes: GradedMistake[] } | null>(null);

    useEffect(() => {
        try {
            const storedMistakes = localStorage.getItem('mistakes');
            if (storedMistakes) {
                setMistakes(JSON.parse(storedMistakes));
            }
        } catch (e) {
            console.error("Failed to load mistakes from localStorage", e);
            setMistakes([]);
        }
    }, []);

    const addMistakes = async (newMistakes: GradedMistake[], imageFiles: File[]) => {
        const imagePromises = imageFiles.map(file => compressImage(file));
        const base64Images = await Promise.all(imagePromises);

        const formattedMistakes: Mistake[] = newMistakes.map((m, index) => ({
            id: `mistake_${Date.now()}_${index}`,
            homeworkImages: base64Images,
            problemDescription: m.problemDescription,
            reasonForError: m.reasonForError,
            correctSteps: m.correctSteps,
            subject: m.subject,
        }));

        setMistakes(prevMistakes => {
            const updatedMistakes = [...prevMistakes, ...formattedMistakes];
            try {
                localStorage.setItem('mistakes', JSON.stringify(updatedMistakes));
            } catch (e) {
                console.error("Failed to save mistakes to localStorage", e);
                alert("保存错题失败：您的错题本存储空间可能已满。");
            }
            return updatedMistakes;
        });
    };
    
    const handleFilesSelect = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setAnalysisResult(null);
        setGradingResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (files.length === 0) {
            setError('请先上传题目图片哦！');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await getProblemAnalysis(files);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '分析题目时发生未知错误。');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGrade = async () => {
        if (files.length === 0) {
            setError('请先上传作业图片哦！');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGradingResult(null);
        try {
            const result = await gradeHomework(files);
            if (result.isBlank) {
                setGradingResult({ message: '作业看起来是空白的，记得要先完成哦！', mistakes: [] });
            } else if (result.mistakes.length === 0) {
                setGradingResult({ message: '太棒了，作业全部正确！继续保持！🎉', mistakes: [] });
            } else {
                await addMistakes(result.mistakes, files);
                setGradingResult({ 
                    message: `找到了 ${result.mistakes.length} 道错题，已经帮你记录到错题本啦！`,
                    mistakes: result.mistakes,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '批改作业时发生未知错误。');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderActiveTabContent = () => {
        switch (activeTab) {
            case Tab.CHAT:
                return <Chat />;
            case Tab.ANALYZE:
                return (
                    <div className="max-w-4xl mx-auto animate-bounce-in">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-4xl text-amber-500">题目解析</h2>
                            <p className="text-soft-text mt-2">遇到难题了？上传图片，小娜老师帮你分析思路！</p>
                        </div>
                        <div className="card">
                             <FileUpload onFilesSelect={handleFilesSelect} multiple={true} />
                            <div className="mt-8 text-center">
                                <button onClick={handleAnalyze} disabled={isLoading || files.length === 0} className="primary text-lg px-8 py-3">
                                    {isLoading ? '正在分析中...' : '开始分析'}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                        {analysisResult && <ResponseDisplay title={analysisResult.title} content={analysisResult} />}
                    </div>
                );
            case Tab.GRADE:
                return (
                     <div className="max-w-4xl mx-auto animate-bounce-in">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-4xl text-amber-500">批改作业</h2>
                            <p className="text-soft-text mt-2">上传写好的作业，AI 帮你检查，错题自动进错题本！</p>
                        </div>
                        <div className="card">
                             <FileUpload onFilesSelect={handleFilesSelect} multiple={true} />
                            <div className="mt-8 text-center">
                                <button onClick={handleGrade} disabled={isLoading || files.length === 0} className="primary text-lg px-8 py-3">
                                    {isLoading ? '正在批改中...' : '开始批改'}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                        {gradingResult && (
                            <GradingResultDisplay
                                result={gradingResult}
                                onNavigateToMistakes={() => setActiveTab(Tab.MISTAKES)}
                            />
                        )}
                    </div>
                );
            case Tab.MISTAKES:
                return <MistakeLog mistakes={mistakes} />;
            default:
                return null;
        }
    };
    
    const TABS = [
        { label: Tab.CHAT, icon: <ChatIcon /> },
        { label: Tab.ANALYZE, icon: <AnalyzeIcon /> },
        { label: Tab.GRADE, icon: <GradeIcon /> },
        { label: Tab.MISTAKES, icon: <MistakesIcon /> },
    ];
    
    const handleTabClick = (tab: Tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            // Reset state when switching tabs to avoid showing old results
            setFiles([]);
            setError(null);
            setAnalysisResult(null);
            setGradingResult(null);
        }
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="hidden md:flex justify-center mb-8">
                <div className="flex space-x-2 bg-creamy-yellow p-2 rounded-full shadow-inner">
                    {TABS.map(tab => (
                        <TabButton
                            key={tab.label}
                            label={tab.label}
                            isActive={activeTab === tab.label}
                            onClick={() => handleTabClick(tab.label)}
                            icon={tab.icon}
                        />
                    ))}
                </div>
            </div>

            {isLoading && <LoadingSpinner message={activeTab === Tab.ANALYZE ? 'AI 老师正在思考解题思路...' : 'AI 老师正在仔细批改作业...'} />}
            
            <div className="md:mt-0">
                {renderActiveTabContent()}
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-soft-lg p-2 flex justify-around border-t border-gray-200">
                 {TABS.map(tab => (
                    <TabButton
                        key={tab.label}
                        label={tab.label}
                        isActive={activeTab === tab.label}
                        onClick={() => handleTabClick(tab.label)}
                        icon={tab.icon}
                    />
                ))}
            </div>
            <div className="md:hidden h-24"></div>
        </div>
    );
};

export default MainContent;