import React, { useState, useMemo } from 'react';
import { Mistake, Subject } from '../types';
import MistakeItem from './MistakeItem';
import { generatePracticeProblems } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ResponseDisplay from './ResponseDisplay';

interface MistakeLogProps {
    mistakes: Mistake[];
}

const MistakeLog: React.FC<MistakeLogProps> = ({ mistakes }) => {
    const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
    const [practiceProblems, setPracticeProblems] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
    const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');

    const displayedMistakes = useMemo(() => {
        let filteredAndSorted = [...mistakes];

        // Filtering
        if (filterSubject !== 'all') {
            filteredAndSorted = filteredAndSorted.filter(m => m.subject === filterSubject);
        }

        // Sorting
        filteredAndSorted.sort((a, b) => {
            switch (sortOrder) {
                case 'date-asc':
                    return a.id.localeCompare(b.id);
                case 'name-asc':
                    return a.problemDescription.localeCompare(b.problemDescription);
                case 'name-desc':
                    return b.problemDescription.localeCompare(a.problemDescription);
                case 'date-desc':
                default:
                    return b.id.localeCompare(a.id);
            }
        });
        
        return filteredAndSorted;
    }, [mistakes, filterSubject, sortOrder]);


    const handleSelectMistake = (id: string) => {
        setSelectedMistakes(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const handleGenerateProblems = async () => {
        if (selectedMistakes.length === 0) {
            alert('请先选择需要生成练习题的错题。');
            return;
        }
        setIsLoading(true);
        setPracticeProblems('');
        try {
            const mistakesToPractice = mistakes.filter(m => selectedMistakes.includes(m.id));
            const problems = await generatePracticeProblems(mistakesToPractice);
            setPracticeProblems(problems);
        } catch (error) {
            console.error(error);
            alert('生成练习题失败，请稍后重试。');
        } finally {
            setIsLoading(false);
        }
    };
    
    const groupedMistakes = displayedMistakes.reduce((acc, mistake) => {
        (acc[mistake.subject] = acc[mistake.subject] || []).push(mistake);
        return acc;
    }, {} as Record<Subject, Mistake[]>);

    const subjectColors: Record<Subject, string> = {
        '语文': 'bg-sky-blue text-sky-800',
        '数学': 'bg-sakura-pink text-pink-800',
        '英语': 'bg-mint-green text-emerald-800',
        '其他': 'bg-amber-100 text-amber-800',
    }

    return (
        <div className="mistake-log max-w-5xl mx-auto animate-bounce-in">
            <div className="text-center mb-8">
                <h2 className="font-display text-4xl text-amber-500">我的错题本</h2>
                <p className="text-soft-text mt-2">在这里整理和回顾你的学习成果吧！</p>
            </div>
            
            <div className="card mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="filter-subject" className="block mb-2 text-sm font-medium text-gray-900">按学科筛选</label>
                        <select 
                            id="filter-subject" 
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value as Subject | 'all')}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                        >
                            <option value="all">所有学科</option>
                            <option value="语文">语文</option>
                            <option value="数学">数学</option>
                            <option value="英语">英语</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="sort-order" className="block mb-2 text-sm font-medium text-gray-900">排序方式</label>
                        <select 
                            id="sort-order" 
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc')}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                        >
                            <option value="date-desc">添加日期 (最新)</option>
                            <option value="date-asc">添加日期 (最旧)</option>
                            <option value="name-asc">题目名称 (A-Z)</option>
                            <option value="name-desc">题目名称 (Z-A)</option>
                        </select>
                    </div>
                </div>
                 <h3 className="font-display text-xl text-soft-text mb-4 border-t pt-6">错题巩固练习</h3>
                 <p className="text-gray-500 mb-4">选择下面的错题，AI 会为你生成同类型的练习题哦。</p>
                <button onClick={handleGenerateProblems} disabled={isLoading || selectedMistakes.length === 0} className="primary">
                    {isLoading ? "生成中..." : `为 ${selectedMistakes.length} 道错题生成练习`}
                </button>
            </div>

            {isLoading && <LoadingSpinner />}

            {displayedMistakes.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="text-6xl">🎉</div>
                    <h3 className="font-display text-2xl mt-4">太棒了！</h3>
                    <p className="text-soft-text mt-2">{mistakes.length > 0 ? '当前筛选条件下没有错题。' : '你的错题本是空的，继续保持！'}</p>
                </div>
            ) : (
                (Object.keys(groupedMistakes) as Subject[]).map((subject) => (
                    <div key={subject} className="mb-8">
                        <h3 className={`font-display text-2xl inline-block px-4 py-1 rounded-full mb-4 ${subjectColors[subject]}`}>{subject}</h3>
                        <div className="space-y-4">
                            {groupedMistakes[subject].map(mistake => (
                                <MistakeItem
                                    key={mistake.id}
                                    mistake={mistake}
                                    isSelected={selectedMistakes.includes(mistake.id)}
                                    onSelect={handleSelectMistake}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
            
            {practiceProblems && (
                <ResponseDisplay title="🎓 巩固练习" content={practiceProblems} />
            )}
        </div>
    );
};

export default MistakeLog;
