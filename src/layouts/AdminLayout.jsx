import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShieldAlert,
    Users,
    Car,
    Wrench,
    Tags,
    BellRing,
    Building2,
    LogOut,
    Menu,
    X,
    ArrowLeftRight
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: ShieldAlert },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Vehicle Tracking', path: '/admin/vehicles', icon: Car },
        { name: 'Service Categories', path: '/admin/categories', icon: Tags },
        { name: 'Service Centers', path: '/admin/service-centers', icon: Building2 },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 border-r border-slate-800">
                <div className="flex items-center justify-between h-16 px-6 border-b border-rose-900/30 bg-rose-950/5">
                    <Link to="/admin/dashboard" className="flex items-center space-x-2">
                        <span className="p-1 px-2.5 bg-rose-600 rounded-lg text-white font-bold text-xs ring-4 ring-rose-950">A</span>
                        <span className="text-sm font-bold tracking-wider text-rose-450 uppercase">
                            ADMIN CONTROL
                        </span>
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${active
                                    ? 'bg-rose-600/10 text-rose-400 border-l-2 border-rose-500'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${active ? 'text-rose-450' : 'text-slate-450'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info Bottom */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"}
                            alt={user?.name}
                            className="w-10 h-10 rounded-full border border-rose-800/40 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-rose-400 truncate">System Admin</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Link
                            to="/dashboard"
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800/50 rounded-lg text-xs font-semibold text-blue-400 transition-colors"
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5 mr-2" />
                            OWNER PORTAL
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-350 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            LOG OUT
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-10">
                    {/* Mobile Menu trigger */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-200"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <span className="text-[10px] sm:text-xs text-rose-400 font-semibold tracking-widest uppercase bg-rose-950/30 px-3 py-1.5 rounded-full border border-rose-900/20">
                        SYSTEM ADMIN AREA
                    </span>

                    <div className="flex items-center space-x-4">
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden">
                    {/* Overlay */}
                    <div
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                    ></div>

                    {/* Menu Drawer */}
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4 mb-8">
                                <span className="p-1 px-2.5 bg-rose-600 rounded-lg text-white font-bold mr-2 text-sm">A</span>
                                <span className="text-md font-bold tracking-wider text-slate-100 uppercase">ADMIN MODE</span>
                            </div>
                            <nav className="px-2 space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${active
                                                ? 'bg-rose-600/10 text-rose-400'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5 mr-3" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="flex-shrink-0 flex border-t border-slate-800 p-4 bg-slate-900/50">
                            <div className="flex items-center space-x-3 w-full">
                                <img
                                    src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"}
                                    alt="User"
                                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <button
                                        onClick={handleLogout}
                                        className="text-xs text-rose-455 hover:underline flex items-center mt-0.5"
                                    >
                                        Logout <LogOut className="w-3.5 h-3.5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
