import React from 'react';
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
    CheckCircle,
    Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const { user } = useAuth();

    const features = [
        {
            title: "AI Problem Analyzer",
            description: "Describe symptoms in plain text (noises, warning lights) and get structured primary diagnosis.",
            icon: Bot,
            color: "text-blue-500 bg-blue-500/10"
        },
        {
            title: "Vehicle Management",
            description: "Track model specs, mileage, and logs for multiple bikes and cars under a single dashboard.",
            icon: Car,
            color: "text-purple-500 bg-purple-500/10"
        },
        {
            title: "Service History Records",
            description: "Log repairs, spare parts changed, details of service stations, and review complete historical service details.",
            icon: History,
            color: "text-green-500 bg-green-500/10"
        },
        {
            title: "Maintenance Reminders",
            description: "Set and receive notifications dynamic to dates or customized vehicle kilometer thresholds.",
            icon: Bell,
            color: "text-amber-500 bg-amber-500/10"
        },
        {
            title: "Expense Tracking",
            description: "Review maintenance and fuel spendings via category lists and month-over-month costs breakdown.",
            icon: DollarSign,
            color: "text-pink-500 bg-pink-500/10"
        },
        {
            title: "Local Service Centers",
            description: "Locate reputable service centers, review details, ratings, contact info and specialties.",
            icon: MapPin,
            color: "text-teal-500 bg-teal-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Header/Nav */}
            <header className="fixed top-0 w-full bg-white/75 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="p-1 px-2.5 bg-blue-600 rounded-lg text-white font-bold text-sm">DS</span>
                        <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            DRIVESYNC AI
                        </span>
                    </div>

                    <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
                        <a href="#ai-preview" className="hover:text-blue-600 transition-colors">AI Diagnostics</a>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold tracking-wide transition-all shadow-md"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-550 text-white rounded-lg text-sm font-semibold tracking-wide transition-all shadow-md"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-3.5 py-1 text-xs text-blue-600 font-medium">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>AI-Driven DriveSync Platform</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                        Your Smart Assistant for Better{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Vehicle Maintenance
                        </span>
                    </h1>

                    <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg">
                        Manage your garage, log service details, track part expenses, receive custom mileage reminders, and analyze unexpected vibrations or noises using our preliminary AI troubleshooter.
                    </p>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                        <Link
                            to="/register"
                            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-medium tracking-wide transition-colors group shadow-lg"
                        >
                            Get Started
                            <ArrowRight className="w-4.5 h-4.5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="flex items-center justify-center px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* Visual Graphic Representation */}
                <div className="relative flex justify-center items-center">
                    <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[100px] -z-10"></div>

                    <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                        {/* Header decor */}
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-500" /> Diagnosis Simulator
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">User Input:</span>
                                <p className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-850 text-slate-300 italic">
                                    "My car is overheating frequently during traffic logs."
                                </p>
                            </div>

                            <div className="space-y-3 bg-white-950/65 p-4 rounded-xl border border-slate-850/60">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-450 uppercase text-[10px]">AI Preliminary Analysis</span>
                                    <span className="bg-red-50 text-red-750 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold"> High Severity</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Category:</span>
                                    <p className="text-xs font-semibold text-slate-205">Engine Coolant & Thermals</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Possible Causes:</span>
                                    <ul className="list-disc list-inside text-xs text-slate-350 space-y-0.5">
                                        <li>Low coolant (possible water hose crack)</li>
                                        <li>Radiator cooling fan failure</li>
                                        <li>Faulty/Stuck Thermostat valve</li>
                                    </ul>
                                </div>

                                <div className="border-t border-slate-900 pt-2.5">
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                        <strong className="text-slate-400 uppercase text-[9px] font-bold mr-1">Recommended Action:</strong>
                                        Turn off the motor, avoid checking while hot to prevent steam burns. Seek qualified vehicle workshop inspection immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-slate-900/40 border-y border-slate-900 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Full Suite of Owner & Admin Tools</h2>
                        <p className="text-slate-400 text-sm md:text-base">
                            A comprehensive system helping mechanics and owners understand problems and log schedules before breakdowns happen.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl hover:border-slate-700/60 transition-all hover:-translate-y-0.5 duration-250 shadow-md">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 text-white">{f.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
                <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Simple Four-Step Workflow</h2>
                    <p className="text-slate-400 text-sm">No complex setup required. Log and analyze in moments.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { step: "01", title: "Add Your Vehicle", desc: "Select car or scooter, inputs brand, engine size, and registration keys." },
                        { step: "02", title: "Describe Symptoms", desc: "Type in any sound warning, engine leak, or dashboard lights you see." },
                        { step: "03", title: "Get AI Diagnostics", desc: "Receive immediate primary categories, possible causes, and severity ratings." },
                        { step: "04", title: "Update Logs & Sync", desc: "Save diagnostic details, set service reminders, and track repair budgets." }
                    ].map((item, idx) => (
                        <div key={idx} className="relative bg-slate-950 p-6 rounded-2xl border border-slate-850 flex flex-col justify-between">
                            <span className="text-3xl font-extrabold text-blue-600/35 absolute top-4 right-4">{item.step}</span>
                            <div className="mt-8 space-y-2">
                                <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI Preview Section */}
            <section id="ai-preview" className="py-20 bg-slate-900/40 border-t border-slate-900">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Primary AI Problem Diagnostic</h2>
                        <p className="text-slate-450 text-sm max-w-lg mx-auto">
                            Our analyzer processes language prompts to yield classifications. Perfect for getting early warning flags before reaching the mechanics workshop.
                        </p>
                    </div>

                    <div className="text-left bg-slate-950 border border-slate-800 rounded-xl p-5 md:p-8 space-y-4 shadow-xl">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-600">Preview: AI Response Output</h4>
                        <div className="grid md:grid-cols-3 gap-6 text-xs border-y border-slate-200 py-4 my-2">
                            <div>
                                <span className="text-slate-550 font-bold block mb-1">CATEGORY:</span>
                                <span className="text-slate-800">Suspension & Wheel-Alignment</span>
                            </div>
                            <div>
                                <span className="text-slate-550 font-bold block mb-1">SEVERITY LEVEL:</span>
                                <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold inline-block">
                                    ⚠️ Medium
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-550 font-bold block mb-1">RECOMMENDED ACTION:</span>
                                <span className="text-slate-800">Inspect front struts and balancing pins.</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-normal flex items-start">
                            <span className="font-bold text-red-650 mr-2 flex-shrink-0 bg-red-50 px-1 border border-red-200 rounded uppercase text-[9px]">Disclaimer</span>
                            Informational Preliminary Notice: The AI troubleshoot output is provided purely as an advisory assistance mechanism and does not constitute a certified mechanical diagnosis or guarantee. Always contact a qualified auto-shop dealer.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-b from-slate-50 to-blue-50/40 border-t border-slate-200 flex flex-col items-center justify-center px-6">
                <div className="max-w-2xl text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-850">Ready to streamline your vehicle care?</h2>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                        Create an account, add your vehicles, configure reminders, and analyze repair flags using modern modules.
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl tracking-wide transition-colors shadow-md"
                        >
                            Register & Add First Vehicle
                            <ArrowRight className="w-4.5 h-4.5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 bg-slate-100 py-12 text-xs text-slate-600">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="space-y-3">
                        <span className="text-slate-700 font-semibold tracking-wider hover:text-blue-600 transition-colors">PRODUCT</span>
                        <ul className="space-y-2">
                            <li><Link to="/features" className="hover:text-blue-600 hover:underline">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-600 hover:underline">Overview</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <span className="text-slate-700 font-semibold tracking-wider hover:text-blue-600 transition-colors">RESOURCES</span>
                        <ul className="space-y-2">
                            <li><a href="#how-it-works" className="hover:text-blue-600 hover:underline">How It Works</a></li>
                            <li><a href="#ai-preview" className="hover:text-blue-600 hover:underline">AI Diagnostics</a></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <span className="text-slate-700 font-semibold tracking-wider hover:text-blue-600 transition-colors">COMPANY</span>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-blue-600 hover:underline">About Us</a></li>
                            <li><a href="#" className="hover:text-blue-600 hover:underline">Contact Support</a></li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <span className="text-slate-700 font-semibold tracking-wider hover:text-blue-600 transition-colors">LEGAL</span>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-blue-600 hover:underline">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-blue-600 hover:underline">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <span>&copy; {new Date().getFullYear()} DriveSync AI. All rights reserved.</span>
                    <p className="text-[10px] text-slate-500 max-w-md md:text-right">
                        Disclaimer: All system diagnostics recommendations are generated using machine learning simulation models. Users should exercise caution and drive safely.
                    </p>
                </div>
            </footer>
        </div>
    );
}
