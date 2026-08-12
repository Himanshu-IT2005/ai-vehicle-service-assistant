import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../data/db';
import {
    Car,
    Wrench,
    Bell,
    DollarSign,
    Plus,
    Bot,
    Activity,
    ChevronRight,
    TrendingUp,
    AlertTriangle,
    Play,
    History
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [records, setRecords] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for Quick Action Modals (optional, we redirect to clean pages for better flow)
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const vList = await db.getVehicles();
                const rList = await db.getReminders();
                const recList = await db.getServiceRecords();
                const expList = await db.getExpenses();

                setVehicles(vList);
                setReminders(rList);
                setRecords(recList.slice(0, 3)); // show top 3 recent records
                setExpenses(expList);
            } catch (err) {
                console.error("Dashboard data load err", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingReminders = reminders.filter(r => r.status === 'pending');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400">Loading your garage dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Title Header welcoming owner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Garage Dashboard</h1>
                    <p className="text-slate-400 text-xs mt-1">Real-time health overview and reminders analysis for your vehicles.</p>
                </div>

                {/* Quick actions panel */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/vehicles/add"
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> ADD VEHICLE
                    </Link>
                    <Link
                        to="/ai-assistant"
                        className="flex items-center px-4 py-2 bg-slate-905 border border-slate-800 hover:bg-slate-800 text-blue-400 rounded-xl text-xs font-semibold tracking-wider transition-colors"
                    >
                        <Bot className="w-4 h-4 mr-1.5" /> ANALYZE PROBLEM
                    </Link>
                </div>
            </div>

            {/* Numerical Stats overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Garage Vehicles", val: vehicles.length, icon: Car, color: "text-blue-500 bg-blue-500/10" },
                    { label: "Upcoming Services", val: reminders.filter(r => r.status === 'pending' && r.dueMileage).length, icon: Wrench, color: "text-purple-500 bg-purple-500/10" },
                    { label: "Pending Alerts", val: pendingReminders.length, icon: Bell, color: "text-amber-500 bg-amber-505/10" },
                    { label: "Total Cost Incurred", val: `₹${totalExpense.toLocaleString()}`, icon: DollarSign, color: "text-green-500 bg-green-500/10" }
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                            <div className={`p-3.5 rounded-xl ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{stat.label}</span>
                                <span className="text-xl font-bold text-white mt-1 block">{stat.val}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main split sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: Garage Fleet & health scores */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base text-white tracking-wide">My Fleet Overview</h3>
                        <Link to="/vehicles" className="text-xs text-blue-400 hover:underline flex items-center">
                            View All <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                    </div>

                    {vehicles.length === 0 ? (
                        <div className="bg-slate-905 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                            <Car className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                            <p className="text-sm font-semibold">No vehicles registered yet.</p>
                            <Link to="/vehicles/add" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Add your first vehicle now</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {vehicles.map((v) => (
                                <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/60 duration-200 transition-all flex flex-col justify-between">
                                    {/* Card Main info */}
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-white">{v.brand} {v.model}</h4>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">{v.registrationNumber}</span>
                                            </div>

                                            {/* Health Indicator Badge */}
                                            <div className="flex flex-col items-end">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${v.healthScore >= 85
                                                    ? 'bg-green-950/60 text-green-400 border-green-900/30'
                                                    : v.healthScore >= 75
                                                        ? 'bg-amber-955/60 text-amber-400 border-amber-900/25'
                                                        : 'bg-red-955/60 text-red-400 border-red-900/30'
                                                    }`}>
                                                    Health: {v.healthScore}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                            <div>
                                                <span className="text-slate-500 block mb-0.5">YEAR</span>
                                                <strong className="text-slate-200">{v.year}</strong>
                                            </div>
                                            <div className="border-x border-slate-850">
                                                <span className="text-slate-500 block mb-0.5">MILEAGE</span>
                                                <strong className="text-slate-200">{v.currentMileage.toLocaleString()} km</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-505 block mb-0.5">FUEL TYPE</span>
                                                <strong className="text-slate-200 capitalize">{v.fuelType}</strong>
                                            </div>
                                        </div>

                                        {/* Health meter progress checks */}
                                        <div className="space-y-2 border-t border-slate-800/80 pt-3">
                                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Critical Diagnostics</span>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                {Object.entries(v.healthDetail).slice(0, 4).map(([name, score]) => (
                                                    <div key={name} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-slate-400 capitalize">{name}</span>
                                                        <div className="flex items-center space-x-1.5">
                                                            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${score}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-slate-200">{score}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card bottom actions */}
                                    <div className="bg-slate-50 p-3 px-5 border-t border-slate-200 flex justify-between items-center text-xs">
                                        <span className="text-slate-550 italic text-[10px]">
                                            Next service in {Math.max(0, v.nextServiceMileage - v.currentMileage).toLocaleString()} km
                                        </span>
                                        <button
                                            onClick={() => navigate(`/vehicles/${v.id}`)}
                                            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 rounded-lg text-[10px] font-bold tracking-wide transition-all shadow-sm"
                                        >
                                            DETAILS
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions Board */}
                    <div className="bg-slate-909/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="font-semibold text-sm text-slate-200">Common Quick Actions</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Link to="/vehicles/add" className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-805 text-center flex flex-col items-center space-y-2 transition-colors">
                                <Car className="w-5 h-5 text-blue-500" />
                                <span className="text-[10px] font-semibold text-slate-300">Add Vehicle</span>
                            </Link>
                            <Link to="/ai-assistant" className="bg-slate-900 hover:bg-slate-855 p-4 rounded-xl border border-slate-805 text-center flex flex-col items-center space-y-2 transition-colors">
                                <Bot className="w-5 h-5 text-purple-400" />
                                <span className="text-[10px] font-semibold text-slate-300">AI Troubleshoot</span>
                            </Link>
                            <Link to="/service-history" className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-805 text-center flex flex-col items-center space-y-2 transition-colors">
                                <Wrench className="w-5 h-5 text-green-455" />
                                <span className="text-[10px] font-semibold text-slate-300">Add Service Log</span>
                            </Link>
                            <Link to="/reminders" className="bg-slate-900 hover:bg-slate-850 p-4 rounded-xl border border-slate-805 text-center flex flex-col items-center space-y-2 transition-colors">
                                <Bell className="w-5 h-5 text-amber-500" />
                                <span className="text-[10px] font-semibold text-slate-350">Configure Alert</span>
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Right Side: Alerts, Schedules & History Summary */}
                <div className="space-y-6">
                    {/* Section: Pending Maintenance Schedules */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-semibold text-sm text-white flex items-center">
                                <Bell className="w-4 h-4 mr-2 text-amber-500" /> Scheduled Reminders
                            </h3>
                            <span className="bg-amber-950/60 text-amber-400 border border-amber-900/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                {pendingReminders.length} Alerts
                            </span>
                        </div>

                        {pendingReminders.length === 0 ? (
                            <p className="text-xs text-slate-500 py-3 text-center">No upcoming maintenance alerts.</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingReminders.slice(0, 3).map((r) => (
                                    <div key={r.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 hover:border-slate-800 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-semibold text-slate-200">{r.title}</span>
                                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                                                {r.dueMileage ? `${r.dueMileage.toLocaleString()} km` : r.dueDate}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed truncate">{r.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/reminders"
                            className="text-xs text-blue-450 hover:underline font-bold text-center block pt-2 border-t border-slate-800/80"
                        >
                            Configure Reminders
                        </Link>
                    </div>

                    {/* Section: Recent Service logs */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h3 className="font-semibold text-sm text-white flex items-center border-b border-slate-800 pb-3">
                            <History className="w-4.5 h-4.5 mr-2 text-green-500" /> Recent Service Logs
                        </h3>

                        {records.length === 0 ? (
                            <p className="text-xs text-slate-500 py-3 text-center">No service records registered.</p>
                        ) : (
                            <div className="space-y-4">
                                {records.map((rec) => (
                                    <div key={rec.id} className="relative pl-4 border-l border-slate-800 space-y-1 text-xs">
                                        <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 border border-slate-950"></span>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-200">
                                                {vehicles.find(v => v.id === rec.vehicleId)?.brand} {vehicles.find(v => v.id === rec.vehicleId)?.model}
                                            </span>
                                            <span className="text-slate-550 text-[10px]">{rec.serviceDate}</span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-400 truncate">{rec.description}</p>
                                        <span className="text-[10px] font-bold text-green-450 block">₹{rec.cost.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            to="/service-history"
                            className="text-xs text-blue-455 hover:underline font-bold text-center block pt-2 border-t border-slate-800/80"
                        >
                            Open Service History
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    );
}
