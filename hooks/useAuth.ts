import { useState, useEffect } from 'react';
import { User } from '../types';

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (username: string, password_raw: string): boolean => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        const userData = storedUsers[username];
        if (userData && userData.password === password_raw) {
            const loggedInUser: User = { 
                id: userData.id, 
                username, 
                avatar: userData.avatar,
                email: userData.email 
            };
            localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            return true;
        }
        return false;
    };

    const register = (username: string, password_raw: string, email: string): boolean => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (storedUsers[username]) {
            return false; // User already exists
        }
        const newUser = {
            id: `user_${Date.now()}`,
            password: password_raw,
            avatar: '',
            email: email,
        };
        storedUsers[username] = newUser;
        localStorage.setItem('users', JSON.stringify(storedUsers));
        return true;
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    const updateUser = (updatedUser: User): boolean => {
        if (!user) return false;

        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        const currentUserData = storedUsers[user.username];

        if (!currentUserData) return false;
        
        const newUserData = {
            ...currentUserData,
            avatar: updatedUser.avatar,
            email: updatedUser.email,
            ...(updatedUser.password && { password: updatedUser.password })
        };
        
        storedUsers[user.username] = newUserData;
        localStorage.setItem('users', JSON.stringify(storedUsers));
        
        const updatedCurrentUser = { ...user, avatar: updatedUser.avatar, email: updatedUser.email };
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        setUser(updatedCurrentUser);

        return true;
    };


    return { user, login, register, logout, updateUser };
};

export default useAuth;