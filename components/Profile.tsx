import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
    user: User;
    onClose: () => void;
    onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onClose, onUpdate }) => {
    const [avatar, setAvatar] = useState(user.avatar);
    const [email, setEmail] = useState(user.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert("两次输入的密码不一致！");
            return;
        }

        const updatedUser: User = {
            ...user,
            avatar,
            email,
        };
        if (password) {
            updatedUser.password = password;
        }
        onUpdate(updatedUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-bounce-in">
            <div className="relative card w-full max-w-md">
                 <button onClick={onClose} className="absolute top-4 right-4 bg-gray-200 text-gray-600 w-10 h-10 flex items-center justify-center !rounded-xl !p-0">
                    ✕
                </button>
                <h2 className="font-display text-3xl text-center text-soft-text mb-6">个人资料</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="form-group text-center">
                            <label className="text-lg font-medium text-soft-text">用户名: <span className="text-amber-600 font-bold">{user.username}</span></label>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="text-lg font-medium text-soft-text mb-2 block">邮箱</label>
                             <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="你的邮箱地址"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="avatar" className="text-lg font-medium text-soft-text mb-2 block">新头像 (Emoji)</label>
                            <input
                                id="avatar"
                                type="text"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                className="text-center text-4xl p-2"
                                placeholder="😊"
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="password">新密码 (留空则不修改)</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">确认新密码</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={!password}
                            />
                        </div>
                    </div>
                    <div className="mt-8">
                        <button type="submit" className="primary w-full py-3 text-lg">保存</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;