import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Save, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Profile() {
    const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess(false);
        setProfileLoading(true);

        try {
            await updateProfile({ name, phone });
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (err) {
            setProfileError(err.message || 'Failed to update profile details.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) {
            setPwdError('Please complete both fields.');
            return;
        }
        setPwdError('');
        setPwdSuccess(false);
        setPwdLoading(true);

        try {
            await changePassword(oldPassword, newPassword);
            setPwdSuccess(true);
            setOldPassword('');
            setNewPassword('');
            setTimeout(() => setPwdSuccess(false), 3000);
        } catch (err) {
            setPwdError(err.message || 'Failed to update security passkey.');
        } finally {
            setPwdLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("WARNING: Are you sure you want to permanently delete your vehicle assistance account? This action is irreversible.")) {
            setDeleteError('');
            setDeleteLoading(true);
            try {
                await deleteAccount();
            } catch (err) {
                setDeleteError(err.message || 'Failed to permanently delete your account.');
                setDeleteLoading(false);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 text-xs sm:text-xs md:text-sm">
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">Owner Profile Management</h1>
                <p className="text-slate-500 text-xs mt-0.5 font-normal">Manage registration credentials, settings, and account privacy options.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Profile Settings form */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                    <h3 className="font-semibold text-sm text-slate-700 border-b border-slate-100 pb-2.5">Personal Details</h3>

                    {profileError && (
                        <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-red-700 text-xs">
                            {profileError}
                        </div>
                    )}

                    {profileSuccess && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center text-green-700 space-x-1.5 text-xs">
                            <CheckCircle className="w-4.5 h-4.5" />
                            <span>Details saved successfully.</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold">
                        <div>
                            <label className="block text-slate-550 mb-1.5 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center"><Mail className="w-4 h-4 text-slate-450" /></span>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed outline-none text-sm font-normal"
                                />
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1 block font-normal">Account identity emails cannot be modified.</span>
                        </div>

                        <div>
                            <label className="block text-slate-550 mb-1.5 uppercase tracking-wider">Full Name *</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center"><User className="w-4 h-4 text-slate-450" /></span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-805 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm font-normal transition-colors"
                                    required
                                    disabled={profileLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-550 mb-1.5 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center"><Phone className="w-4 h-4 text-slate-450" /></span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-805 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm font-normal transition-colors"
                                    disabled={profileLoading}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full flex justify-center items-center py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide transition-all shadow-sm"
                            >
                                <Save className="w-4 h-4 mr-1.5" /> {profileLoading ? "SAVING..." : "SAVE DETAILS"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change password, security settings */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                        <h3 className="font-semibold text-sm text-slate-700 border-b border-slate-100 pb-2.5">Integrate Passkey Access</h3>

                        {pwdError && (
                            <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-red-700 text-xs">
                                {pwdError}
                            </div>
                        )}
                        {pwdSuccess && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center text-green-700 space-x-1.5 text-xs">
                                <CheckCircle className="w-4.5 h-4.5" />
                                <span>Security passkey reset successfully.</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-slate-550 mb-1.5 uppercase tracking-wider">Current Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center"><Lock className="w-4 h-4 text-slate-450" /></span>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-805 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm font-normal transition-colors"
                                        placeholder="••••••••"
                                        disabled={pwdLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-550 mb-1.5 uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center"><Lock className="w-4 h-4 text-slate-450" /></span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-805 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm font-normal transition-colors"
                                        placeholder="••••••••"
                                        disabled={pwdLoading}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={pwdLoading}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide transition-all shadow-sm"
                                >
                                    {pwdLoading ? "CHANGING..." : "UPDATE SECURITY KEYS"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Dangerous Zone */}
                    <div className="bg-red-50/30 border border-red-100 p-6 rounded-2xl space-y-4 shadow-sm">
                        <h3 className="font-semibold text-sm text-red-600 border-b border-red-100/60 pb-2.5">Danger Territory</h3>

                        {deleteError && (
                            <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-red-700 text-xs">
                                {deleteError}
                            </div>
                        )}

                        <p className="text-xs text-slate-500 leading-relaxed font-normal">
                            Deleting your account destroys all garage registered vehicles, AI logs transcripts, reminders schedule, and invoices data. This action is not reversible.
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="w-full flex items-center justify-center py-2 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 rounded-xl text-xs font-semibold tracking-wider transition-colors disabled:opacity-50"
                        >
                            <ShieldAlert className="w-4.5 h-4.5 mr-1.5" /> {deleteLoading ? "DELETING ACCOUNT..." : "DELETE ACCOUNT PERMANENTLY"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
