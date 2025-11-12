import React from 'react';
import { StructuredAnalysis } from '../types';

// Helper function to parse markdown-like bold syntax
export const renderMarkdownText = (text: string, strongClassName: string = 'font-bold text-amber-600') => {
    if (!text) return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className={strongClassName}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};


interface ResponseDisplayProps {
    title: string;
    content: StructuredAnalysis | string | null;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ title, content }) => {
    if (!content) return null;

    const renderContent = () => {
        if (typeof content === 'string') {
            return (
                <div className="prose max-w-none text-soft-text text-base leading-relaxed">
                    {content.split('\n').map((line, index) => (
                        <p key={index} className="my-2">{renderMarkdownText(line)}</p>
                    ))}
                </div>
            );
        }

        // For StructuredAnalysis
        return (
            <div className="space-y-6">
                {content.sections.map((section, index) => (
                    <div key={index} className="p-4 bg-sky-50 border-l-4 border-sky-400 rounded-r-lg">
                        <h3 className="font-display text-xl text-sky-700 mb-2">{section.subtitle}</h3>
                        <div className="text-soft-text text-base leading-relaxed space-y-2">
                            {section.content.split('\n').map((line, i) => (
                                <p key={i}>{renderMarkdownText(line, 'font-semibold text-sky-800')}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    const mainTitle = typeof content === 'string' ? title : content.title;

    return (
        <div className="mt-8 p-6 bg-white rounded-3xl shadow-soft animate-bounce-in">
            <h2 className="font-display text-2xl text-amber-500 mb-6 border-b-2 border-amber-200 pb-3">{mainTitle}</h2>
            {renderContent()}
        </div>
    );
};

export default ResponseDisplay;