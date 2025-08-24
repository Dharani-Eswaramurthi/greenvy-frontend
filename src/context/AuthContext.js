import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);

    const decodeToken = useCallback((token) => {
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            return {
                user_id: decodedToken.user_id,
                name: decodedToken.name
            };
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setIsAuthenticated(true);
                setUserId(decoded.user_id);
                setUserName(decoded.name);
            } else {
                // Invalid token, remove it
                localStorage.removeItem('token');
            }
        }
    }, [decodeToken]);

    const login = useCallback((token) => {
        try {
            localStorage.setItem('token', token);
            const decoded = decodeToken(token);
            if (decoded) {
                setIsAuthenticated(true);
                setUserId(decoded.user_id);
                setUserName(decoded.name);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    }, [decodeToken]);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUserId(null);
            setUserName(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, userName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
