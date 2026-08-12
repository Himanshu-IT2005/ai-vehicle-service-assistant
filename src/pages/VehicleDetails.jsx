import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../data/db';
import {
    Car,
    Wrench,
    Bell,
    DollarSign,
    Bot,
    ArrowLeft,
    Edit,
    Clock,
    ShieldAlert,
    ChevronRight,
    UserCheck
} from 'lucide-react';

export default function VehicleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vehicle, setVehicle] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [records, setRecords] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [analyses, setAnalyses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadVehicleData = async () => {
            try {
                const v = await db.getVehicle(id);
                const rList = await db.getReminders(id);
                const recList = await db.getServiceRecords(id);
                const expList = await db.getExpenses(id);
                const allAnalyses = await db.getAiHistory();
                const vAnalyses = allAnalyses.filter(a => a.vehicleId === parseInt(id));

                setVehicle(v);
                setReminders(rList);
                setRecords(recList);
                setExpenses(expList);
                setAnalyses(vAnalyses);
            } catch (err) {
                setError(err.message || "Failed to load vehicle particulars.");
            } finally {
                setLoading(false);
            }
        };
        loadVehicleData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500">Querying vehicle profile and history details...</p>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="max-w-md mx-auto py-12 text-center space-y-4">
                <div className="inline-flex p-3 bg-red-950/20 border border-red-900/30 rounded-full text-red-400">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold">{error || "Vehicle profile not found."}</p>
                <Link to="/vehicles" className="text-xs text-blue-400 hover:underline flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Return to garage
                </Link>
            </div>
        );
    }

    const fileOdometerString = vehicle.currentMileage.toLocaleString();
    const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-8 text-xs sm:text-xs md:text-sm">
            {/* Header bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <Link to="/vehicles" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-205">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{vehicle.brand} {vehicle.model}</h1>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{vehicle.registrationNumber}</span>
                    </div>
                </div>

                {/* Action controls */}
                <div className="flex flex-wrap gap-2.5">
                    <Link
                        to={`/vehicles/${vehicle.id}/edit`}
                        className="flex items-center px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold tracking-wide transition-colors"
                    >
                        <Edit className="w-4 h-4 mr-1.5" /> EDIT VEHICLE
                    </Link>
                    <Link
                        to="/ai-assistant"
                        state={{ vehicleId: vehicle.id }}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors"
                    >
                        <Bot className="w-4 h-4 mr-1.5" /> ANALYZE A PROBLEM
                    </Link>
                </div>
            </div>

            {/* Grid split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: General Profile, health grid */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section: Specifications Overview */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
                        <h3 className="font-semibold text-sm text-white border-b border-slate-800 pb-3">Technical Specifications</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase">MODEL YEAR</span>
                                <span className="text-sm font-semibold text-slate-200">{vehicle.year}</span>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase">FUEL ENGINE</span>
                                <span className="text-sm font-semibold text-slate-200 capitalize">{vehicle.fuelType}</span>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase">ODOMETER READING</span>
                                <span className="text-sm font-semibold text-slate-200">{fileOdometerString} km</span>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase">TOTAL BUDGET SPENT</span>
                                <span className="text-sm font-semibold text-green-405">₹{totalCost.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 pt-2">
                            <div className="flex justify-between py-1.5 border-b border-slate-800">
                                <span>Purchase Date</span>
                                <strong className="text-slate-205">{vehicle.purchaseDate}</strong>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-800">
                                <span>Last Serviced Odom</span>
                                <strong className="text-slate-205">{vehicle.lastServiceMileage ? `${vehicle.lastServiceMileage.toLocaleString()} km` : "No record"}</strong>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-800">
                                <span>Last Serviced Date</span>
                                <strong className="text-slate-205">{vehicle.lastServiceDate || "No record"}</strong>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-800">
                                <span>Next Service Due Odom</span>
                                <strong className="text-slate-205">{vehicle.nextServiceMileage.toLocaleString()} km</strong>
                            </div>
                        </div>
                    </div>

                    {/* Section: Diagnostic Health status */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-semibold text-sm text-white">System Diagnostics Meters</h3>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-500 font-semibold mr-2">Garage Score:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${vehicle.healthScore >= 85
                                        ? 'bg-green-950/60 text-green-400 border-green-900/30'
                                        : 'bg-amber-955/60 text-amber-400 border-amber-900/25'
                                    }`}>
                                    {vehicle.healthScore} / 100
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            {Object.entries(vehicle.healthDetail).map(([compName, score]) => (
                                <div key={compName} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 capitalize">{compName} Health</span>
                                        <span className="text-slate-200 font-semibold">{score}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${score >= 85
                                                    ? 'bg-green-500'
                                                    : score >= 70
                                                        ? 'bg-amber-500'
                                                        : 'bg-red-500'
                                                }`}
                                            style={{ width: `${score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section: Previous AI Analysis reports */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
                        <h3 className="font-semibold text-sm text-white border-b border-slate-800 pb-3">Previous AI Troubleshooting Records</h3>

                        {analyses.length === 0 ? (
                            <p className="text-xs text-slate-500 py-4 text-center">No AI diagnostics logs recorded for this vehicle.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/80">
                                {analyses.map(an => (
                                    <div
                                        key={an.id}
                                        onClick={() => navigate(`/ai-analysis/${an.id}`)}
                                        className="py-4 first:pt-0 last:pb-0 flex justify-between items-center cursor-pointer hover:bg-slate-950/40 p-2.5 rounded-lg transition-colors border border-transparent hover:border-slate-850"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${an.responseSeverity === 'High'
                                                        ? 'bg-red-950/60 text-red-400 border border-red-900/30'
                                                        : 'bg-amber-955/60 text-amber-400 border border-amber-900/25'
                                                    }`}>
                                                    {an.responseSeverity} Severity
                                                </span>
                                                <span className="text-xs font-semibold text-slate-205">{an.responseCategory}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-normal italic truncate max-w-sm">"{an.queryText}"</p>
                                        </div>

                                        <div className="flex items-center text-xs text-slate-405 font-medium">
                                            <span className="text-[10px] text-slate-500 mr-2">{new Date(an.createdAt).toLocaleDateString()}</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Side: Log summary list, reminders list & custom records */}
                <div className="space-y-8">

                    {/* Section Reminders */}
                    <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center">
                                <Bell className="w-4.5 h-4.5 mr-1.5 text-amber-500" /> Reminders Schedule
                            </h3>
                            <Link to="/reminders" className="text-[10px] text-blue-400 hover:underline">Configure</Link>
                        </div>

                        {reminders.length === 0 ? (
                            <p className="text-xs text-slate-500 py-3 text-center">No reminders registered.</p>
                        ) : (
                            <div className="space-y-3">
                                {reminders.map(rem => (
                                    <div key={rem.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                                        <div className="flex justify-between items-start text-xs">
                                            <span className="font-semibold text-slate-200">{rem.title}</span>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${rem.status === 'pending' ? 'bg-amber-950/40 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                                                {rem.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">{rem.description}</p>
                                        <div className="flex justify-between text-[9px] text-slate-505 border-t border-slate-900 pt-1.5 mt-1">
                                            <span>Due Date: {rem.dueDate}</span>
                                            {rem.dueMileage && <span>Due Odom: {rem.dueMileage.toLocaleString()} km</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section Service log history */}
                    <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center">
                                <Wrench className="w-4.5 h-4.5 mr-1.5 text-green-500" /> Recent Service Logs
                            </h3>
                            <Link to="/service-history" className="text-[10px] text-blue-400 hover:underline">Log Service</Link>
                        </div>

                        {records.length === 0 ? (
                            <p className="text-xs text-slate-500 py-3 text-center">No service logs saved yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {records.map(rec => (
                                    <div key={rec.id} className="relative pl-4 border-l border-slate-800 space-y-1 text-xs">
                                        <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 border border-slate-950"></span>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-205">{rec.serviceCenter}</span>
                                            <span className="text-[10px] text-slate-500">{rec.serviceDate}</span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-400 leading-relaxed">{rec.description}</p>
                                        <div className="flex justify-between text-[10px] font-medium text-slate-450 mt-1">
                                            <span>Odom: {rec.mileageAtService.toLocaleString()} km</span>
                                            <span className="text-green-455 font-bold">₹{rec.cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
