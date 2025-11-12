import React from 'react';
import { Tab } from '../types';

interface TabButtonProps {
    label: Tab;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
    return (
       <button
            className={`
                flex items-center justify-center font-medium transition-all duration-300 ease-out group 
                
                flex-col w-20 h-20 rounded-2xl gap-1
                
                md:flex-row md:w-auto md:h-auto md:px-6 md:py-3 md:rounded-full md:gap-2
                
                ${isActive 
                    ? 'bg-white text-amber-500 shadow-soft scale-105 md:bg-amber-100 md:text-amber-600 md:shadow-none md:scale-100' 
                    : 'text-soft-text hover:bg-white/60 md:bg-gray-100 md:text-gray-500 md:hover:bg-gray-200'
                }`
            }
            onClick={onClick}>
            <div className="transition-transform group-hover:scale-110">{icon}</div>
            <span className="text-sm md:text-base">{label}</span>
       </button>
    );
};

export default TabButton;