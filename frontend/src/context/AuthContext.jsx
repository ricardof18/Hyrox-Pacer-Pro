import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        fetchUser();
    };

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
