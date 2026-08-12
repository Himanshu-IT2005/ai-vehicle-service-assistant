import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../data/db';
import { Bot, HelpCircle, AlertCircle, Cpu, ShieldAlert } from 'lucide-react';

export default function AiAssistant() {
    const navigate = useNavigate();
    const location = useLocation();

    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [queryText, setQueryText] = useState('');

    // Extra detailed symptom fields
    const [startedWhen, setStartedWhen] = useState('');
    const [frequency, setFrequency] = useState('');
    const [conditions, setConditions] = useState('');
    const [warningLight, setWarningLight] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiSteps, setAiSteps] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const list = await db.getVehicles();
                setVehicles(list);

                // Pre-select vehicle if passed in router state
                if (location.state?.vehicleId) {
                    setSelectedVehicleId(location.state.vehicleId.toString());
                } else if (list.length > 0) {
                    setSelectedVehicleId(list[0].id.toString());
                }
            } catch (err) {
                console.error("Failed to load user vehicles", err);
            }
        };
        fetchVehicles();
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!queryText.trim()) {
            setError("Please describe the mechanical symptoms of your vehicle.");
            return;
        }
        setError('');
        setLoading(true);

        // Simulated step-by-step loading for premium SaaS feel
        const steps = [
            "Connecting to Diagnostics module...",
            "Analyzing query terms: checking brakes, engine, and electrical models...",
            "Matching structural warning thresholds in knowledge files...",
            "Structuring safety disclaimers and recommended mechanical actions...",
            "Parsing JSON summary output..."
        ];

        let currentStep = 0;
        setAiSteps(steps[0]);
        const stepInterval = setInterval(() => {
            currentStep++;
            if (currentStep < steps.length) {
                setAiSteps(steps[currentStep]);
            }
        }, 400);

        try {
            const vId = selectedVehicleId ? parseInt(selectedVehicleId) : null;
            const context = { startedWhen, frequency, conditions, warningLight };
            const analysis = await db.analyzeVehicleProblem(vId, queryText, context);

            clearInterval(stepInterval);
            navigate(`/ai-analysis/${analysis.id}`);
        } catch (err) {
            clearInterval(stepInterval);
            setError(err.message || "Failed to process AI diagnostics. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 text-xs sm:text-xs md:text-sm">
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                    <Bot className="w-6 h-6 mr-2 text-blue-500" /> AI Vehicle Problem Analyzer
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                    Describe query symptoms in plain text as if talking to a mechanic. Get structure recommendations instantly.
                </p>
            </div>

            <div className="bg-slate-900 border border-slate-805 rounded-2xl shadow-xl overflow-hidden">
                {loading ? (
                    /* Loading Graphic State */
                    <div className="p-8 md:p-12 flex flex-col items-center justify-center space-y-6 min-h-[40vh] text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-600/35 border-t-blue-500 rounded-full animate-spin"></div>
                            <Cpu className="w-6 h-6 text-blue-550 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-base text-white animate-pulse">AI Troubleshooter Processing...</h3>
                            <p className="text-xs text-blue-450 italic font-mono h-6">{aiSteps}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 max-w-sm">
                            Please do not refresh the page. We are analyzing textual context against mechanical engine schemas.
                        </p>
                    </div>
                ) : (
                    /* Input Form */
                    <form className="p-6 md:p-8 space-y-6 text-xs" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-955/40 border border-red-900/30 p-4 rounded-xl flex items-start space-x-2 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Vehicle Selector */}
                        <div>
                            <label htmlFor="vehicle" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Select Garage Vehicle
                            </label>
                            <select
                                id="vehicle"
                                value={selectedVehicleId}
                                onChange={(e) => setSelectedVehicleId(e.target.value)}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-205 transition-colors"
                            >
                                <option value="">No Vehicle (General Inquiry)</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.brand} {v.model} ({v.registrationNumber})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Main symptom description */}
                        <div>
                            <label htmlFor="symptoms" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Describe your vehicle problem <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="symptoms"
                                rows="4"
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                                className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="Example: My bike makes a strange grinding noise from the front wheel when I apply the front brake, and the handlebar vibrates..."
                                required
                            />
                        </div>

                        {/* Premium detail expansion panel */}
                        <div className="border-t border-slate-805 pt-5 space-y-4">
                            <h4 className="font-semibold text-xs text-slate-300 flex items-center">
                                <HelpCircle className="w-4 h-4 mr-1.5 text-blue-500" /> Additional Details (Helpful for Precision Analysis)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-450 mb-1.5 font-medium">When did the issue start?</label>
                                    <input
                                        type="text"
                                        value={startedWhen}
                                        onChange={(e) => setStartedWhen(e.target.value)}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-550"
                                        placeholder="e.g., 2 days ago, yesterday morning"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-450 mb-1.5 font-medium">How often does this happen?</label>
                                    <input
                                        type="text"
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-550"
                                        placeholder="e.g., Every time I accelerate, intermittent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-450 mb-1.5 font-medium">Under what driving conditions?</label>
                                    <input
                                        type="text"
                                        value={conditions}
                                        onChange={(e) => setConditions(e.target.value)}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-805 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-550"
                                        placeholder="e.g., Braking, starting, going over bumps"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-450 mb-1.5 font-medium">Is there any alert light on dashboard?</label>
                                    <input
                                        type="text"
                                        value={warningLight}
                                        onChange={(e) => setWarningLight(e.target.value)}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-805 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-555"
                                        placeholder="e.g., Engine check light, ABS indicator"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-950/15 border border-blue-900/25 p-4 rounded-xl flex items-start space-x-2 text-[10px] text-blue-400">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
                            <span>
                                <strong>INFORMATIONAL NOTICE:</strong> The generated troubleshoot data uses machine learning models and does not represent a certified mechanical diagnosis or engineering recommendation.
                            </span>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase"
                            >
                                Analyze Symptoms Now
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
