import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../data/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Read current user state from local db on startup and verify token validity
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('v_token');
                if (token) {
                    const verifiedUser = await db.getProfile();
                    setUser(verifiedUser);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Token verification failed, clearing stale session:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const loggedUser = await db.login(email, password);
            setUser(loggedUser);
            return loggedUser;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, phone) => {
        setLoading(true);
        try {
            const newUser = await db.register(name, email, password, phone);
            setUser(newUser);
            return newUser;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await db.logout();
            setUser(null);
        } catch (err) {
            console.error("Failed to logout", err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        setLoading(true);
        try {
            if (!user) throw new Error("Not logged in");
            const updatedUser = await db.updateProfile(user.id, profileData);
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        setLoading(true);
        try {
            await db.changePassword(oldPassword, newPassword);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async () => {
        setLoading(true);
        try {
            await db.deleteUserProfile();
            setUser(null);
            localStorage.removeItem('v_token');
            localStorage.removeItem('v_current_user');
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
