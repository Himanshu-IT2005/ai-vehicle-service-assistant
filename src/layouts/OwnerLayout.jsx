import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Car,
    Bot,
    History,
    Bell,
    DollarSign,
    MapPin,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    ArrowLeftRight
} from 'lucide-react';

export default function OwnerLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Vehicles', path: '/vehicles', icon: Car },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
        { name: 'Service History', path: '/service-history', icon: History },
        { name: 'Reminders', path: '/reminders', icon: Bell },
        { name: 'Expenses', path: '/expenses', icon: DollarSign },
        { name: 'Service Centers', path: '/service-centers', icon: MapPin },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    // Mock Notifications for dropdown UI
    const mockNotifications = [
        { id: 1, message: "Engine Oil Change reminder for Honda Activa is due soon.", time: "2 hours ago" },
        { id: 2, message: "AI Warning: High severity issue detected in Brake System.", time: "1 day ago" }
    ];

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 border-r border-slate-800">
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <span className="p-1.5 bg-blue-600 rounded-lg text-white font-bold">DS</span>
                        <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            DRIVESYNC AI
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
                                    ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-450' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info Bottom */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                            alt={user?.name}
                            className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name || "Loader user"}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user?.role} Mode</p>
                        </div>
                    </div>
                    {user?.role === 'admin' && (
                        <Link
                            to="/admin/dashboard"
                            className="w-full flex items-center justify-center mb-2 px-4 py-2 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800/50 rounded-lg text-xs font-semibold text-rose-400 transition-colors"
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5 mr-2" />
                            ADMIN PORTAL
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/80 rounded-lg text-xs font-semibold tracking-wider text-slate-350 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        LOG OUT
                    </button>
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

                    {/* Search Bar - Hidden on small mobile */}
                    <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 w-64">
                        <Search className="w-4 h-4 text-slate-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search services, vehicles..."
                            className="bg-transparent border-0 text-xs text-slate-100 placeholder-slate-500 focus:ring-0 focus:outline-none w-full"
                        />
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 relative border border-slate-700"
                            >
                                <Bell className="w-4.5 h-4.5" />
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></span>
                            </button>

                            {notificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setNotificationsOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-[calc(100vw-2.5rem)] max-w-xs sm:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 overflow-hidden">
                                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                            <span className="font-semibold text-sm">Notifications</span>
                                            <span className="text-xs text-blue-400 cursor-pointer hover:underline">Mark all read</span>
                                        </div>
                                        <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
                                            {mockNotifications.map(n => (
                                                <div key={n.id} className="p-4 hover:bg-slate-800/40 text-xs">
                                                    <p className="text-slate-350">{n.message}</p>
                                                    <span className="text-slate-500 text-[10px] block mt-1">{n.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Quick Profile Icon Link */}
                        <Link to="/profile" className="flex items-center space-x-2 transition-opacity">
                            <img
                                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                            />
                        </Link>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Drawer Navigation Menu */}
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
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4 mb-8">
                                <span className="p-1 px-2.5 bg-blue-600 rounded-lg text-white font-bold mr-2 text-sm">DS</span>
                                <span className="text-md font-bold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">DRIVESYNC AI</span>
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
                                                ? 'bg-blue-600/15 text-blue-400'
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
                                    src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                                    alt="User"
                                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <div className="flex flex-wrap gap-2 mt-0.5">
                                        {user?.role === 'admin' && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="text-xs text-rose-400 hover:underline flex items-center"
                                            >
                                                Admin Portal
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="text-xs text-red-400 hover:underline flex items-center"
                                        >
                                            Logout <LogOut className="w-3.5 h-3.5 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
