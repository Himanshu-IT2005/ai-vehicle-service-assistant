import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Bot,
    Car,
    History,
    Bell,
    DollarSign,
    MapPin,
    ArrowRight,
    ShieldCheck,
    Cpu,
    Menu,
    X,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            title: "AI Problem Analyzer",
            description: "Describe symptoms in plain text (noises, warning lights) and get structured primary diagnosis.",
            icon: Bot,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
        },
        {
            title: "Vehicle Management",
            description: "Track model specs, mileage, and logs for multiple bikes and cars under a single dashboard.",
            icon: Car,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
        },
        {
            title: "Service History Records",
            description: "Log repairs, spare parts changed, details of service stations, and review complete historical service details.",
            icon: History,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        },
        {
            title: "Maintenance Reminders",
            description: "Set and receive notifications dynamic to dates or customized vehicle kilometer thresholds.",
            icon: Bell,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
        },
        {
            title: "Expense Tracking",
            description: "Review maintenance and fuel spendings via category lists and month-over-month costs breakdown.",
            icon: DollarSign,
            color: "text-pink-400 bg-pink-500/10 border-pink-500/20"
        },
        {
            title: "Local Service Centers",
            description: "Locate reputable service centers, review details, ratings, contact info and specialties.",
            icon: MapPin,
            color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            {/* Header/Nav */}
            <header className="fixed top-0 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            DS
                        </div>
                        <span className="text-lg sm:text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            DRIVESYNC <span className="text-blue-500">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
                        <a href="#ai-preview" className="hover:text-blue-400 transition-colors">AI Diagnostics</a>
                    </nav>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2">
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors focus:outline-none"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Dropdown Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fade-in-up">
                        <nav className="flex flex-col space-y-3 font-medium text-slate-300 text-base border-b border-slate-800 pb-4">
                            <a
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                            >
                                How It Works
                            </a>
                            <a
                                href="#ai-preview"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                            >
                                AI Diagnostics
                            </a>
                        </nav>

                        <div className="flex flex-col space-y-2.5 pt-1">
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-semibold rounded-xl text-sm shadow-md"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-center font-semibold rounded-xl text-sm hover:bg-slate-850"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-semibold rounded-xl text-sm shadow-md"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-44 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 md:gap-12 items-center">
                <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs sm:text-sm text-blue-400 font-medium">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>Next-Gen AI Vehicle Care Assistant</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        Smart AI Maintenance for Your{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Vehicles & Garage
                        </span>
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                        Log service records, track spare part expenses, receive dynamic mileage reminders, and diagnose engine vibrations or unusual noises in seconds with our primary AI troubleshooter.
                    </p>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 justify-center md:justify-start">
                        <Link
                            to="/register"
                            className="flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold tracking-wide transition-all group shadow-xl shadow-blue-600/25"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="flex items-center justify-center px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl font-semibold transition-colors"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* Visual Graphic Representation */}
                <div className="relative flex justify-center items-center">
                    <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-blue-600/15 rounded-full blur-[100px] -z-10"></div>

                    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
                        {/* Header decor */}
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-red-500/80 rounded-full"></span>
                                <span className="w-3 h-3 bg-amber-500/80 rounded-full"></span>
                                <span className="w-3 h-3 bg-emerald-500/80 rounded-full"></span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold tracking-wider flex items-center uppercase">
                                <ShieldCheck className="w-4 h-4 mr-1 text-blue-400" /> AI Diagnostic Live
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">User Input Prompt:</span>
                                <p className="text-xs sm:text-sm bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-200 italic font-mono">
                                    "High-pitched screeching noise when applying brakes at low speed."
                                </p>
                            </div>

                            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">AI Preliminary Findings</span>
                                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                                        ⚠️ Medium Risk
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Category:</span>
                                    <p className="text-xs font-bold text-slate-200">Brake Friction & Rotor wear</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Probable Causes:</span>
                                    <ul className="text-xs text-slate-300 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mr-1.5 flex-shrink-0" />
                                            Worn-down brake pads (wear indicator pin)
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mr-1.5 flex-shrink-0" />
                                            Glazed rotor disc surface
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-t border-slate-850 pt-2.5">
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        <strong className="text-blue-400 uppercase text-[10px] font-bold mr-1">Suggested Step:</strong>
                                        Schedule brake pad thickness check at workshop soon.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-16 sm:py-24 bg-slate-900/50 border-y border-slate-850 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Full Suite of Vehicle Care Tools</h2>
                        <p className="text-slate-400 text-sm sm:text-base">
                            Built for vehicle owners and workshop managers to track maintenance schedules before unexpected breakdowns occur.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-slate-950 p-6 sm:p-7 rounded-2xl border border-slate-850 hover:border-blue-500/40 transition-all duration-300 space-y-4 group"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${f.color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{f.title}</h3>
                                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Simple Four-Step Workflow</h2>
                    <p className="text-slate-400 text-sm sm:text-base">No complex setup required. Log and analyze in moments.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { step: "01", title: "Add Your Vehicle", desc: "Select car or scooter, enter model name, engine capacity, and registration details." },
                        { step: "02", title: "Describe Symptoms", desc: "Type in any sound warning, engine leak, or dashboard indicator lights." },
                        { step: "03", title: "Get AI Diagnostics", desc: "Receive immediate primary categories, probable causes, and severity ratings." },
                        { step: "04", title: "Update Logs & Reminders", desc: "Save diagnostic details, set service reminders, and track repair budgets." }
                    ].map((item, idx) => (
                        <div key={idx} className="relative bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                            <span className="text-3xl font-extrabold text-blue-500/20 absolute top-4 right-4">{item.step}</span>
                            <div className="mt-6 space-y-2">
                                <h3 className="font-bold text-base sm:text-lg text-white">{item.title}</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI Preview Section */}
            <section id="ai-preview" className="py-16 sm:py-24 bg-slate-900/40 border-t border-slate-850">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">AI Diagnostic Assistant Output</h2>
                        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                            Our intelligent troubleshooter assists you in identifying early warning signs before heading to the repair workshop.
                        </p>
                    </div>

                    <div className="text-left bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center">
                                <Cpu className="w-4 h-4 mr-2" /> Live Diagnostic Preview
                            </h4>
                            <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400 font-mono">
                                Engine Model AI v2.4
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider mb-1">Primary Category</span>
                                <span className="text-sm font-bold text-white">Suspension & Wheel Alignment</span>
                            </div>
                            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider mb-1">Severity Rating</span>
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
                                    ⚠️ Medium Priority
                                </span>
                            </div>
                            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider mb-1">Recommended Action</span>
                                <span className="text-xs font-semibold text-slate-300">Inspect front struts and wheel balancing pins.</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-slate-850">
                            <strong className="text-amber-400 uppercase text-[10px] font-bold mr-1.5">Note:</strong>
                            AI troubleshoot recommendations are designed as informational advisory support and do not replace professional mechanical workshop verification.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-850 text-center px-4 sm:px-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">Ready to Elevate Your Vehicle Care?</h2>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Create your account today, add your vehicles, configure reminders, and run AI diagnostic checks in minutes.
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl tracking-wide transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                        >
                            Register & Add First Vehicle
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-850 bg-slate-950 py-12 text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-3">
                        <span className="text-slate-200 font-bold tracking-wider uppercase text-[11px]">Product</span>
                        <ul className="space-y-2">
                            <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                            <li><a href="#ai-preview" className="hover:text-blue-400 transition-colors">AI Diagnostics</a></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <span className="text-slate-200 font-bold tracking-wider uppercase text-[11px]">Resources</span>
                        <ul className="space-y-2">
                            <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
                            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Log In</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <span className="text-slate-200 font-bold tracking-wider uppercase text-[11px]">Company</span>
                        <ul className="space-y-2">
                            <li><span className="text-slate-500">DriveSync AI Platform</span></li>
                            <li><span className="text-slate-500">Contact Support</span></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <span className="text-slate-200 font-bold tracking-wider uppercase text-[11px]">Legal</span>
                        <ul className="space-y-2">
                            <li><span className="text-slate-500">Privacy Policy</span></li>
                            <li><span className="text-slate-500">Terms of Service</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-6 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 text-slate-500">
                    <span>&copy; {new Date().getFullYear()} DriveSync AI. All rights reserved.</span>
                    <p className="text-[10px] max-w-md md:text-right text-slate-600">
                        Disclaimer: Diagnostics outputs are generated for advisory assistance only.
                    </p>
                </div>
            </footer>
        </div>
    );
}
