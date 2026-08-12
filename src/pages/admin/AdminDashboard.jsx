import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../data/db';
import { Users, Car, Wrench, Bot, AlertTriangle, ChevronRight, UserCheck, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        usersCount: 0,
        vehiclesCount: 0,
        servicesCount: 0,
        aiQueriesCount: 0
    });

    const [recentUsers, setRecentUsers] = useState([]);
    const [recentAi, setRecentAi] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdminStats = async () => {
            try {
                const u = await db.adminGetUsers();
                const v = await db.adminGetVehicles();
                const s = await db.getServiceRecords();
                const ai = await db.getAiHistory();

                setStats({
                    usersCount: u.length,
                    vehiclesCount: v.length,
                    servicesCount: s.length,
                    aiQueriesCount: ai.length
                });

                setRecentUsers(u.slice(-4).reverse());
                setRecentAi(ai.slice(-4).reverse());
            } catch (err) {
                console.error("Admin stats fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        loadAdminStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-rose-500 font-mono">Querying Admin Registry Stat Metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-xs sm:text-xs font-sans">

            {/* Title header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
                        <Shield className="w-6.5 h-6.5 mr-2 text-rose-550" /> Admin Command Central
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Audit profiles database registry status, track vehicle inventories and monitor artificial intelligence requests.</p>
                </div>
            </div>

            {/* Numeric metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active User Accounts", val: stats.usersCount, icon: Users, color: "text-rose-500 bg-rose-500/10", route: "/admin/users" },
                    { label: "Total Fleet Vehicles", val: stats.vehiclesCount, icon: Car, color: "text-blue-500 bg-blue-500/10", route: "/admin/vehicles" },
                    { label: "Total Service Records", val: stats.servicesCount, icon: Wrench, color: "text-emerald-500 bg-emerald-500/10", route: "/admin/dashboard" },
                    { label: "AI Diagnostic Queries Run", val: stats.aiQueriesCount, icon: Bot, color: "text-purple-500 bg-purple-500/10", route: "/admin/categories" }
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={idx}
                            to={item.route}
                            className="bg-slate-909/70 p-5 rounded-2xl border border-slate-805 flex items-center space-x-4 shadow hover:border-slate-800 transition-colors"
                        >
                            <div className={`p-3.5 rounded-xl ${item.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{item.label}</span>
                                <span className="text-xl font-bold text-white mt-1 block">{item.val}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Grid splits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Side: Recent users list */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="font-semibold text-sm text-white flex items-center">
                            <Users className="w-4.5 h-4.5 mr-2 text-rose-500" /> Recent User Registrations
                        </h3>
                        <Link to="/admin/users" className="text-xs text-rose-400 hover:underline flex items-center">
                            Audit Accounts <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                        {recentUsers.map(u => (
                            <div key={u.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                                <div className="space-y-1">
                                    <span className="font-bold text-slate-205 flex items-center">
                                        {u.name}
                                        {u.role === 'admin' && (
                                            <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-rose-600/10 text-rose-400 border border-rose-900/30 rounded font-semibold">ADMIN</span>
                                        )}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">{u.email}</span>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 block">Joined {u.createdAt}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Recent AI Diagnostic Queries */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h3 className="font-semibold text-sm text-white flex items-center">
                            <Bot className="w-4.5 h-4.5 mr-2 text-purple-400 animate-pulse" /> Recent AI Troubleshooter Sessions
                        </h3>
                        <Link to="/admin/categories" className="text-xs text-rose-400 hover:underline flex items-center">
                            Settings <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-800/85">
                        {recentAi.map(ai => (
                            <div key={ai.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10.5px] font-bold text-slate-205">{ai.responseCategory}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold border ${ai.responseSeverity === 'High'
                                            ? 'bg-red-955/60 text-red-400 border-red-900/30'
                                            : 'bg-amber-955/60 text-amber-400 border-amber-900/25'
                                        }`}>
                                        {ai.responseSeverity}
                                    </span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 italic truncate">"{ai.queryText}"</p>
                                <div className="flex justify-between text-[9px] text-slate-501 mt-1">
                                    <span>Record ID: {ai.id}</span>
                                    <span>{new Date(ai.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Safety compliance notice and operational logs disclaimer */}
            <div className="bg-rose-955/20 border border-rose-900/20 p-4 rounded-xl flex items-start space-x-2 text-[10px] text-rose-400 leading-normal">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 text-rose-500 mt-0.5" />
                <span>
                    <strong>Operational Admin Protocol Warning:</strong> Modifications here directly affect the simulated DB instances. Modifying user access variables or deleting category tags can prevent users from completing their maintenance records. Exercise system validation.
                </span>
            </div>

        </div>
    );
}
