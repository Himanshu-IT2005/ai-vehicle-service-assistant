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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
                <Link to="/" className="inline-flex items-center space-x-2">
                    <span className="p-1.5 px-3 bg-blue-600 rounded-lg text-white font-bold text-sm">DS</span>
                    <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        DRIVESYNC AI
                    </span>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Reset Password</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white border border-slate-205 py-8 px-6 shadow-md rounded-2xl sm:px-10">

                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Check your email</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                We have sent temporary passkey instructions to <strong className="text-slate-700">{email}</strong>.
                            </p>

                            {successMsg && successMsg.includes('developer terminal') && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left space-y-1.5 text-xs text-yellow-805">
                                    <div className="flex items-center font-bold">
                                        <AlertTriangle className="w-4 h-4 mr-1 text-yellow-600" />
                                        <span>Local Server Notice</span>
                                    </div>
                                    <p className="font-normal text-[11px] leading-relaxed">
                                        {successMsg}
                                    </p>
                                </div>
                            )}

                            <div className="pt-2">
                                <Link to="/login" className="text-xs text-blue-600 hover:underline font-bold flex items-center justify-center">
                                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to sign in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <p className="text-xs text-slate-550 leading-normal font-normal">
                                Enter your email address below. We'll send instructions explaining how to recover credentials.
                            </p>

                            {errorMsg && (
                                <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-red-700 text-xs">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 animate-pulse-subtle">
                                    Email Address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-450" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-205 rounded-xl text-sm text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="name@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-550 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? "Sending reset link..." : "Send Reset Link"}
                                </button>
                            </div>

                            <div className="text-center text-xs pt-2">
                                <Link to="/login" className="text-slate-500 hover:text-slate-800 flex items-center justify-center">
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
