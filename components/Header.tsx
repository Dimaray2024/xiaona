import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import Profile from './Profile';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: User) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onUpdateUser }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleChangePassword = () => {
        setIsProfileOpen(true);
        setIsDropdownOpen(false);
    };

    return (
        <>
            <header className="bg-primary-dark p-4 sm:p-6 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                           {/* Mortarboard part, clearly representing a graduation cap */}
                           <path d="M12 3L2 8l10 5 10-5L12 3z"/>
                           {/* Lower part, shaped like a friendly chat bubble, connected to the cap */}
                           <path d="M5 9h14c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-7l-4 4v-4H5c-1.1 0-2-.9-2-2v-5c0-1.1.9-2 2-2z"/>
                        </svg>
                     </div>
                    <h1 className="font-display text-2xl text-white">小娜老师</h1>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(prev => !prev)} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:bg-white/10 shadow-none focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                        <span className="text-2xl">{user.avatar || '😊'}</span>
                        <span className="font-medium text-white">{user.username}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-white/80 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                           <path d="M5 8l5 5 5-5z" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft-lg z-10 animate-bounce-in p-2">
                            <div className="px-3 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{user.avatar || '😊'}</span>
                                    <span className="font-medium text-soft-text truncate">{user.username}</span>
                                </div>
                            </div>
                            <ul className="py-2">
                                <li>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleChangePassword(); }} className="flex items-center px-3 py-3 text-soft-text rounded-lg hover:bg-gray-100">
                                        修改资料
                                    </a>
                                </li>
                                <li>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center px-3 py-3 text-soft-text rounded-lg hover:bg-red-50 hover:text-red-600">
                                        退出登录
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            {isProfileOpen && (
                <Profile
                    user={user}
                    onClose={() => setIsProfileOpen(false)}
                    onUpdate={onUpdateUser}
                />
            )}
        </>
    );
};

export default Header;