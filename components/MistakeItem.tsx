import React, { useState } from 'react';
import { Mistake } from '../types';
import { renderMarkdownText } from './ResponseDisplay';

interface MistakeItemProps {
    mistake: Mistake;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const MistakeItem: React.FC<MistakeItemProps> = ({ mistake, isSelected, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="bg-white rounded-3xl shadow-soft transition-all duration-300">
            <div className="mistake-header p-4 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(mistake.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-6 h-6 rounded-md border-2 text-amber-500 focus:ring-amber-400"
                />
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-soft-text">{mistake.problemDescription}</h3>
                </div>
                 <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                </span>
            </div>
            
            {isExpanded && (
                 <div className="mistake-body p-4 pt-0 animate-bounce-in">
                    <div className="border-t-2 border-creamy-yellow pt-4 space-y-4">
                        <div className="p-4 bg-rose-50/50 border-l-4 border-rose-300 rounded-r-lg">
                            <h4 className="font-bold text-rose-700 mb-2">🤔 错误原因：</h4>
                            <div className="text-soft-text space-y-2">
                                {mistake.reasonForError.split('\n').map((line, i) => (
                                    <p key={i}>{renderMarkdownText(line, 'font-semibold text-rose-800')}</p>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-sky-50/50 border-l-4 border-sky-300 rounded-r-lg">
                            <h4 className="font-bold text-sky-700 mb-2">✍️ 正确步骤：</h4>
                            <div className="text-soft-text space-y-2">
                                {mistake.correctSteps.split('\n').map((line, i) => (
                                    <p key={i}>{renderMarkdownText(line, 'font-semibold text-sky-800')}</p>
                                ))}
                            </div>
                        </div>
                        
                        {mistake.homeworkImages.length > 0 && (
                             <div>
                                <h4 className="font-bold text-amber-600 mb-2">📷 相关图片：</h4>
                                <div className="flex flex-wrap gap-3">
                                    {mistake.homeworkImages.map((img, index) => (
                                        <img key={index} src={img} alt={`homework image ${index}`} className="max-w-xs h-auto rounded-2xl shadow-soft" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MistakeItem;