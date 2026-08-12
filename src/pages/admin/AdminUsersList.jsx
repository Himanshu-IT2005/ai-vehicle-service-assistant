import React, { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { Users, Shield, ShieldCheck, X, Ban, Activity, Trash2, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const list = await db.adminGetUsers();
            setUsers(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggleRole = async (userId, currentRole) => {
        try {
            const nextRole = currentRole === 'admin' ? 'owner' : 'admin';
            await db.adminUpdateUserRole(userId, nextRole);
            await loadUsers();
        } catch (err) {
            alert(err.message || "Failed to toggle role.");
        }
    };

    const handleToggleSuspend = async (userId, currentStatus) => {
        try {
            const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
            await db.adminUpdateUserStatus(userId, nextStatus);
            await loadUsers();
        } catch (err) {
            alert("Failed to toggle suspension.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (confirm("Are you sure you want to permanently delete this user, their vehicles, and service history logs?")) {
            try {
                await db.adminDeleteUser(userId);
                await loadUsers();
            } catch (err) {
                alert("Failed to delete user.");
            }
        }
    };

    const filteredUsers = users.filter(u => {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6 text-xs sm:text-xs">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <Link to="/admin/dashboard" className="p-2 bg-slate-900 border border-slate-805 rounded-lg text-slate-400 hover:text-slate-205">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                            <Users className="w-5.5 h-5.5 mr-2 text-rose-550" /> User Accounts Directory
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5">Toggle administrative access levels, suspend bad actors, and delete user databases records.</p>
                    </div>
                </div>
            </div>

            {/* Search filters */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-505" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search account name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-mono">Running directories lookup...</p>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-805 bg-slate-950 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                                    <th className="py-4 px-6">User Details</th>
                                    <th className="py-4 px-6">Account Type (Role)</th>
                                    <th className="py-4 px-6">Created On</th>
                                    <th className="py-4 px-6">Account Status</th>
                                    <th className="py-4 px-6 text-right">Settings Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-202 text-sm">{u.name}</div>
                                            <div className="text-[10px] text-slate-506 block mt-0.5">{u.email}</div>
                                            {u.phone && <div className="text-[10px] text-slate-550 block">{u.phone}</div>}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${u.role === 'admin'
                                                    ? 'bg-rose-955/60 text-rose-400 border-rose-900/30'
                                                    : 'bg-blue-950/60 text-blue-400 border-blue-900/30'
                                                }`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">{u.createdAt}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'active'
                                                    ? 'bg-green-950 text-green-400'
                                                    : 'bg-red-955 text-red-400'
                                                }`}>
                                                {u.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                                            <button
                                                onClick={() => handleToggleRole(u.id, u.role)}
                                                className="px-2.5 py-1.5 bg-slate-950 border border-slate-805 hover:bg-slate-800 text-slate-205 rounded font-semibold transition-all inline-flex items-center"
                                                title="Swap Admin/Owner status"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" /> TOGGLE ROLE
                                            </button>
                                            <button
                                                onClick={() => handleToggleSuspend(u.id, u.status)}
                                                className={`px-2.5 py-1.5 border rounded font-semibold transition-all inline-flex items-center ${u.status === 'suspended'
                                                        ? 'bg-green-955/40 border-green-900/30 text-green-400 hover:bg-green-950/60'
                                                        : 'bg-red-955/40 border-red-900/30 text-red-400 hover:bg-red-950/60'
                                                    }`}
                                            >
                                                <Ban className="w-3.5 h-3.5 mr-1" /> {u.status === 'suspended' ? "ACTIVATE" : "SUSPEND"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-1.5 bg-slate-950 border border-slate-805 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-all inline-flex align-middle"
                                                title="Delete User permanently"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
