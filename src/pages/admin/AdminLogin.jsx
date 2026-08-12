import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldAlert, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please input email and password.");
            return;
        }
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            if (user.role !== 'admin') {
                throw new Error("Access Denied: Logged in account is not authorized as Admin.");
            }
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || "Invalid Admin authentication parameters.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
                <Link to="/" className="inline-flex items-center space-x-2">
                    <span className="p-1 px-2.5 bg-rose-600 rounded-lg text-white font-bold text-sm">A</span>
                    <span className="text-lg font-bold tracking-wider text-rose-500 uppercase">
                        ADMIN CENTRAL PORTAL
                    </span>
                </Link>
                <h2 className="text-xl font-semibold text-slate-350">Secure Administrative Authentication</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">

                    {error && (
                        <div className="mb-4 bg-red-955/40 border border-red-900/30 p-4 rounded-xl flex items-start space-x-2 text-xs text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
                                Admin Email Address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-150 placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
                                Secret Access Key
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-805 rounded-xl text-sm text-slate-150 placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-rose-950/20 border border-rose-900/25 p-3 rounded-lg flex items-start space-x-2 text-[10px] text-rose-400">
                            <ShieldAlert className="w-5.5 h-5.5 flex-shrink-0 text-rose-500 mt-0.5" />
                            <span>Warning: unauthorized access attempts will be registered. Use system administrator credentials to configure endpoints.</span>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-550 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? "Authenticating Authority..." : "Authorize Portal"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-slate-800 pt-6 text-center text-xs">
                        <Link to="/login" className="text-slate-505 hover:text-slate-350 transition-colors">
                            Return to standard User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
