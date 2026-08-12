import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../data/db';
import { Bot, AlertTriangle, ArrowLeft, History, RotateCcw, AlertOctagon, CheckSquare } from 'lucide-react';

export default function AiAnalysisDetails() {
    const { id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchAnalysisData = async () => {
            try {
                const data = await db.getAiAnalysis(id);
                setAnalysis(data);

                if (data.vehicleId) {
                    const v = await db.getVehicle(data.vehicleId);
                    setVehicle(v);
                }
            } catch (err) {
                setError(err.message || "Failed to load diagnostic details.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysisData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500">Retrieving AI diagnostics report...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="max-w-md mx-auto text-center py-12 space-y-4">
                <div className="inline-flex p-3 bg-red-955/20 border border-red-900/30 rounded-full text-red-400">
                    <AlertOctagon className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold">{error || "Diagnostic report not found."}</p>
                <Link to="/ai-assistant" className="text-xs text-blue-400 hover:underline">
                    Go back to Assistant
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 text-xs sm:text-xs md:text-sm">
            {/* Header link */}
            <div className="flex justify-between items-center">
                <Link
                    to="/dashboard"
                    className="flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Home Dashboard
                </Link>

                {vehicle && (
                    <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="text-xs text-blue-450 hover:underline font-semibold"
                    >
                        {vehicle.brand} {vehicle.model} details
                    </Link>
                )}
            </div>

            {/* Main card */}
            <div className="bg-slate-900 border border-slate-805 rounded-2xl shadow-xl overflow-hidden">

                {/* Banner with icon */}
                <div className="bg-blue-600/10 border-b border-slate-800 p-5 px-6 md:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                            <Bot className="w-5.5 h-5.5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Analysis Result</h2>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {analysis.id} • {new Date(analysis.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Severity details */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${analysis.responseSeverity === 'High' || analysis.responseSeverity === 'Critical'
                            ? 'bg-red-955/60 text-red-400 border-red-900/30'
                            : analysis.responseSeverity === 'Medium'
                                ? 'bg-amber-955/60 text-amber-400 border-amber-900/20'
                                : 'bg-green-950/60 text-green-400 border-green-905/30'
                        }`}>
                        {analysis.responseSeverity === 'High' || analysis.responseSeverity === 'Critical' ? '🔴' : '⚠️'} {analysis.responseSeverity} Severity
                    </span>
                </div>

                {/* Info detail components */}
                <div className="p-6 md:p-8 space-y-6">
                    {/* Diagnostic query input */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">User Query Symptom:</span>
                        <p className="text-xs text-slate-205 italic leading-relaxed">"{analysis.queryText}"</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {/* Category */}
                        <div>
                            <span className="text-[9px] text-slate-550 uppercase tracking-widest font-bold block mb-1.5">Problem Category</span>
                            <p className="text-sm font-semibold text-slate-200">{analysis.responseCategory}</p>
                        </div>

                        {/* Recommended action */}
                        <div>
                            <span className="text-[9px] text-slate-550 uppercase tracking-widest font-bold block mb-1.5">Recommended Action</span>
                            <p className="text-xs text-slate-300 leading-normal">{analysis.responseAction}</p>
                        </div>
                    </div>

                    {/* Causes */}
                    <div className="border-t border-slate-805 pt-5 space-y-2">
                        <span className="text-[9px] text-slate-550 uppercase tracking-widest font-bold block">Possible Causes</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-350">
                            {analysis.responseCauses.map((cause, i) => (
                                <li key={i} className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850/60">
                                    <span className="text-blue-500 font-bold font-mono">0{i + 1}.</span>
                                    <span>{cause}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Warning */}
                    {analysis.responseWarning && (
                        <div className="bg-red-955/20 border border-red-900/20 p-4 rounded-xl space-y-1.5 text-red-400">
                            <span className="text-[10px] font-extrabold uppercase tracking-wide flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-1 text-red-500" /> Caution / Safety Warning:
                            </span>
                            <p className="text-[11px] leading-relaxed text-red-305">{analysis.responseWarning}</p>
                        </div>
                    )}

                    {/* Detailed notice check */}
                    <div className="bg-slate-955/30 border border-slate-800 p-4 rounded-xl text-[10.5px] text-slate-500 leading-normal space-y-2">
                        <strong className="text-slate-400 uppercase text-[9px] font-extrabold block">Safety Protocol Notice:</strong>
                        <p>
                            If the mechanical symptom affects active drivetrain functions, e.g. braking response, steering control, engine throttle, or induces fluid leakage, engine smoking, or immediate loss of vehicle steering stability, do not attempt to run the vehicle further. Park safely and initiate towing.
                        </p>
                    </div>

                    {/* Compliance Disclaimer */}
                    <div className="border-t border-slate-800/80 pt-5 text-[10px] text-slate-505 leading-normal flex items-start">
                        <span className="font-bold text-slate-400 mr-2 flex-shrink-0 border border-slate-700 bg-slate-950 px-1 rounded uppercase text-[8px]">ADVISORY DISCLAIMER</span>
                        This AI troubleshoot diagnostics output is generated using automated vehicle schema rules for preliminary informational assistance only. It does not replace a certified auto-engineering diagnosis or physical vehicle inspection. Always obtain professional service details.
                    </div>
                </div>

                {/* Card footer controls */}
                <div className="bg-slate-950/60 border-t border-slate-800/85 px-6 md:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => {
                                setSaved(true);
                                setTimeout(() => setSaved(false), 2000);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-slate-105 rounded-xl font-semibold transition-colors flex items-center"
                        >
                            {saved ? (
                                <>
                                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-green-550" /> REPORT SAVED
                                </>
                            ) : (
                                "SAVE ANALYSIS"
                            )}
                        </button>

                        <Link
                            to="/ai-assistant"
                            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-slate-105 rounded-xl font-semibold transition-colors flex items-center"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> RESET NEW
                        </Link>
                    </div>

                    <Link
                        to="/service-history"
                        className="px-4 py-1.5 bg-blue-650 hover:bg-blue-600 text-white rounded-xl font-semibold tracking-wide transition-colors flex items-center"
                    >
                        <History className="w-3.5 h-3.5 mr-1.5" /> OPEN SERVICE RECORDS
                    </Link>
                </div>

            </div>
        </div>
    );
}
