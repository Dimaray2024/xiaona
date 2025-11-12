import React, { useState } from 'react';
import { Tab, User } from './types';
import useAuth from './hooks/useAuth';
import Auth from './components/Auth';
import Header from './components/Header';
import MainContent from './components/MainContent';

const App: React.FC = () => {
    const { user, login, register, logout, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);

    if (!user) {
        return <Auth onLogin={login} onRegister={register} />;
    }

    const handleUpdateUser = (updatedUser: User) => {
        updateUser(updatedUser);
    }

    return (
        <div className="flex flex-col min-h-screen text-soft-text">
            <Header user={user} onLogout={logout} onUpdateUser={handleUpdateUser} />
            <main className="flex-1">
                <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
            </main>
        </div>
    );
};

export default App;