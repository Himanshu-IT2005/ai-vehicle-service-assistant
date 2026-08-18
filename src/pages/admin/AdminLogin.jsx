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
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans">
            <div className="w-full max-w-md mx-auto text-center space-y-3">
                <Link to="/" className="inline-flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-rose-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-rose-600/20 group-hover:scale-105 transition-transform">
                        A
                    </div>
                    <span className="text-lg font-extrabold tracking-wider text-rose-400 uppercase">
                        ADMIN CENTRAL PORTAL
                    </span>
                </Link>
                <h2 className="text-xl font-bold text-slate-200">Secure Administrative Authentication</h2>
            </div>

            <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
                <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl rounded-2xl backdrop-blur-xl space-y-5">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-red-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
                                Admin Email Address
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
                                Secret Access Key
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-start space-x-2.5 text-[11px] text-rose-300">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                            <span className="leading-relaxed">Warning: Unauthorized access attempts are monitored and logged. System administrator level credentials required.</span>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-rose-600/25 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center space-x-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Authenticating...</span>
                                    </span>
                                ) : (
                                    "Authorize Portal"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-slate-850 pt-5 text-center text-xs">
                        <Link to="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
                            Return to Standard User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
