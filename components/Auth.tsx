import React, { useState } from 'react';

interface AuthProps {
    onLogin: (username: string, password_raw: string) => boolean;
    onRegister: (username: string, password_raw: string, email: string) => boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        let success = false;
        if (isLogin) {
            success = onLogin(username, password);
            if (!success) {
                setError('用户名或密码错误');
            }
        } else {
            if (username.length < 3 || password.length < 3) {
                 setError('用户名和密码至少需要3个字符');
                 return;
            }
            if (!email.includes('@')) {
                setError('请输入有效的邮箱地址');
                return;
            }
            success = onRegister(username, password, email);
            if (success) {
                alert('注册成功！请登录。');
                setIsLogin(true);
                setUsername('');
                setPassword('');
                setEmail('');
            } else {
                setError('用户名已存在');
            }
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setUsername('');
        setPassword('');
        setEmail('');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-creamy-yellow p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl text-amber-500">欢迎来到</h1>
                    <h2 className="font-display text-5xl text-amber-600">小娜老师</h2>
                </div>
                <form onSubmit={handleSubmit} className="card animate-bounce-in">
                    <h2 className="font-display text-3xl text-center text-soft-text mb-6">{isLogin ? '登录' : '注册'}</h2>
                    {error && <p className="bg-sakura-pink text-pink-800 text-center p-3 rounded-xl mb-4">{error}</p>}
                    <div className="space-y-6">
                        <div className="form-group">
                            <label htmlFor="username" className="text-lg font-medium text-soft-text mb-2 block">用户名</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="text-lg"
                                placeholder="小可爱"
                            />
                        </div>
                        {!isLogin && (
                             <div className="form-group">
                                <label htmlFor="email" className="text-lg font-medium text-soft-text mb-2 block">邮箱</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="text-lg"
                                    placeholder="example@email.com"
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="password" className="text-lg font-medium text-soft-text mb-2 block">密码</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="text-lg"
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <button type="submit" className="primary w-full mt-8 py-3 text-xl font-bold">
                        {isLogin ? '进入学习' : '创建账户'}
                    </button>
                    <p onClick={toggleForm} className="text-center mt-6 text-amber-600 hover:text-amber-500 cursor-pointer font-medium">
                        {isLogin ? '还没有账户？快来注册吧！' : '已有账户？返回登录'}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Auth;