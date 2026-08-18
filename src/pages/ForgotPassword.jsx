import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { db } from '../data/db';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const message = await db.forgotPassword(email);
            setSuccessMsg(message);
            setSubmitted(true);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to request password reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans">
            <div className="w-full max-w-md mx-auto text-center space-y-3">
                <Link to="/" className="inline-flex items-center space-x-2.5 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        DS
                    </div>
                    <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        DRIVESYNC <span className="text-blue-500">AI</span>
                    </span>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
            </div>

            <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
                <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl rounded-2xl backdrop-blur-xl space-y-5">

                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Check your email</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                We have sent temporary passkey instructions to <strong className="text-slate-200">{email}</strong>.
                            </p>

                            {successMsg && successMsg.includes('developer terminal') && (
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-left space-y-1.5 text-xs text-amber-300">
                                    <div className="flex items-center font-bold">
                                        <AlertTriangle className="w-4 h-4 mr-1 text-amber-400" />
                                        <span>Local Server Notice</span>
                                    </div>
                                    <p className="font-normal text-[11px] leading-relaxed text-amber-200/80">
                                        {successMsg}
                                    </p>
                                </div>
                            )}

                            <div className="pt-2">
                                <Link to="/login" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center">
                                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to sign in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Enter your email address below. We'll send instructions explaining how to recover credentials.
                            </p>

                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Email Address
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
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="name@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/25 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <span className="flex items-center space-x-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            <span>Sending reset link...</span>
                                        </span>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </div>

                            <div className="text-center text-xs pt-2">
                                <Link to="/login" className="text-slate-400 hover:text-slate-200 inline-flex items-center">
                                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to sign in
                                </Link>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
