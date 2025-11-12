import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getChatResponse, fileToBase64 } from '../services/geminiService';
import { renderMarkdownText } from './ResponseDisplay';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const urls = imageFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);

        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageFiles]);
    
     useEffect(() => {
        // Greet the user with a welcome message from the model
        setMessages([
            {
                id: 'welcome-1',
                role: 'model',
                text: `你好呀！我是你的AI学习伙伴小娜老师。
                
**遇到难题了吗？** 把题目拍下来发给我，我们可以一起：
- **分析解题思路**
- **找出关键知识点**
- **一步步引导你，而不是直接给答案**

准备好了吗？我们开始吧！`,
            },
        ]);
    }, []);

    const handleSend = async () => {
        if (isLoading || (!input.trim() && imageFiles.length === 0)) return;

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            text: input,
            ...(imageFiles.length > 0 && { images: previewUrls }),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // Prepare history for API
        const history = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        try {
            const modelResponse = await getChatResponse(history, input, imageFiles);
            const modelMessage: ChatMessage = {
                id: `model_${Date.now()}`,
                role: 'model',
                text: modelResponse,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat API error:", error);
            const errorMessage: ChatMessage = {
                id: `error_${Date.now()}`,
                role: 'model',
                text: '抱歉，我好像遇到了一点小问题，请稍后再试。',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setInput('');
            setImageFiles([]);
            setPreviewUrls([]);
            setIsLoading(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Allow multiple images
            setImageFiles(prev => [...prev, ...files]);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    }


    return (
        <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-white rounded-4xl shadow-soft-lg animate-bounce-in">
            <div className="p-4 border-b-2 border-creamy-yellow text-center">
                 <h2 className="font-display text-2xl text-amber-500">聊天辅导</h2>
                 <p className="text-sm text-soft-text mt-1">遇到难题了？随时可以问我哦！</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <span className="text-3xl">👩‍🏫</span>}
                        <div className={`max-w-xl p-4 rounded-3xl ${msg.role === 'user' ? 'bg-amber-100 rounded-br-lg' : 'bg-sky-100 rounded-bl-lg'}`}>
                            <div className="prose prose-sm max-w-none text-soft-text leading-relaxed">
                                {msg.text.split('\n').map((line, index) => (
                                    <p key={index}>{renderMarkdownText(line)}</p>
                                ))}
                            </div>
                            {msg.images && msg.images.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.images.map((img, index) => (
                                        <img key={index} src={img} alt={`upload preview ${index}`} className="w-24 h-24 rounded-lg object-cover" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start gap-3">
                        <span className="text-3xl">👩‍🏫</span>
                        <div className="max-w-xl p-4 rounded-3xl bg-sky-100 rounded-bl-lg">
                           <div className="flex items-center space-x-2">
                                <style>{`.dot-flashing { animation: dot-flashing 1s infinite linear alternate; animation-delay: 0.5s; } @keyframes dot-flashing { 0% { background-color: #A7F3D0; } 50%, 100% { background-color: #d1d5db; } }`}</style>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t-2 border-creamy-yellow">
                {previewUrls.length > 0 && (
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                                <img src={url} alt={`preview ${index}`} className="w-16 h-16 rounded-lg object-cover" />
                                <button onClick={() => handleRemoveImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="有什么问题问我吧..."
                        className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 transition-shadow"
                        rows={1}
                        style={{ fontSize: '16px' }}
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || (!input.trim() && imageFiles.length === 0)} className="primary px-6 py-3">
                        发送
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;