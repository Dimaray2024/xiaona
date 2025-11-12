import React from 'react';
import { GradedMistake } from '../types';
import { renderMarkdownText } from './ResponseDisplay';

interface GradingResultDisplayProps {
    result: {
        message: string;
        mistakes: GradedMistake[];
    };
    onNavigateToMistakes: () => void;
}

const GradingResultDisplay: React.FC<GradingResultDisplayProps> = ({ result, onNavigateToMistakes }) => {
    return (
        <div className="mt-8 p-6 bg-white rounded-3xl shadow-soft animate-bounce-in">
            <div className="text-center">
                 <h2 className="font-display text-2xl text-amber-500 mb-4">批改完成！</h2>
                 <p className="text-lg text-soft-text">{result.message}</p>
            </div>
            
            {result.mistakes.length > 0 && (
                <div className="mt-8 text-left space-y-4">
                    {result.mistakes.map((mistake, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50">
                             <h3 className="font-bold text-lg text-soft-text mb-3 border-b pb-2">{mistake.problemDescription}</h3>
                             <div className="space-y-4">
                                <div className="p-4 bg-rose-50 border-l-4 border-rose-300 rounded-r-lg">
                                    <h4 className="font-bold text-rose-700 mb-2">🤔 错误原因：</h4>
                                    <div className="text-soft-text">
                                         {renderMarkdownText(mistake.reasonForError, 'font-semibold text-rose-800')}
                                    </div>
                                </div>
                                <div className="p-4 bg-sky-50 border-l-4 border-sky-300 rounded-r-lg">
                                    <h4 className="font-bold text-sky-700 mb-2">✍️ 正确步骤：</h4>
                                    <div className="text-soft-text space-y-2">
                                        {mistake.correctSteps.split('\n').map((line, i) => (
                                            <p key={i}>{renderMarkdownText(line, 'font-semibold text-sky-800')}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {result.mistakes.length > 0 && (
                <div className="text-center">
                     <button onClick={onNavigateToMistakes} className="secondary mt-6">
                        去错题本巩固
                    </button>
                </div>
            )}
        </div>
    );
};

export default GradingResultDisplay;
