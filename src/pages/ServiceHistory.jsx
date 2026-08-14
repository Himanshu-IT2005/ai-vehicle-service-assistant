import React, { useState, useEffect } from 'react';
import { db } from '../data/db';
import { Wrench, Calendar, Plus, X, Search, DollarSign, PenTool, ClipboardList } from 'lucide-react';

export default function ServiceHistory() {
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form Fields
    const [formData, setFormData] = useState({
        vehicleId: '',
        categoryId: '1',
        serviceDate: new Date().toISOString().split('T')[0],
        mileageAtService: '',
        cost: '',
        serviceCenter: '',
        description: '',
        notes: ''
    });

    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Filter States
    const [filterVehicle, setFilterVehicle] = useState('all');
    const [searchCenter, setSearchCenter] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const recs = await db.getServiceRecords();
            const vehs = await db.getVehicles();
            const cats = await db.getCategories();

            setRecords(recs);
            setVehicles(vehs);
            setCategories(cats);

            if (vehs.length > 0) {
                setFormData(prev => ({ ...prev, vehicleId: vehs[0].id.toString() }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.vehicleId || !formData.mileageAtService || !formData.cost || !formData.serviceCenter || !formData.description) {
            setFormError("Please fill out all mandatory fields denoted by *.");
            return;
        }
        setFormError('');
        setFormLoading(true);

        try {
            await db.addServiceRecord(formData);
            // Reset form variables
            setFormData(prev => ({
                ...prev,
                mileageAtService: '',
                cost: '',
                description: '',
                notes: ''
            }));
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setFormError(err.message || "Failed to add service record.");
        } finally {
            setFormLoading(false);
        }
    };

    const filteredRecords = records.filter(r => {
        const matchesVehicle = filterVehicle === 'all' || r.vehicleId === parseInt(filterVehicle);
        const matchesSearch = r.serviceCenter.toLowerCase().includes(searchCenter.toLowerCase()) ||
            r.description.toLowerCase().includes(searchCenter.toLowerCase());
        return matchesVehicle && matchesSearch;
    });

    return (
        <div className="space-y-6 text-xs sm:text-xs">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                        <Wrench className="w-5.5 h-5.5 mr-2 text-green-500" /> Service Logs & History
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">Maintain maintenance records, costs, items replaced, and workshops visited.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> LOG NEW SERVICE
                </button>
            </div>

            {vehicles.length === 0 && !loading && (
                <div className="bg-slate-900 border border-slate-805 p-6 rounded-2xl text-center text-slate-450">
                    Please add a vehicle profile under "My Vehicles" page before logging service histories.
                </div>
            )}

            {/* Filter and search panels */}
            {vehicles.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search center or keywords..."
                            value={searchCenter}
                            onChange={(e) => setSearchCenter(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs placeholder-slate-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex w-full md:w-auto items-center space-x-2 justify-end">
                        <span className="text-slate-400 text-xs hidden sm:inline">Filter Vehicle:</span>
                        <select
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
                        >
                            <option value="all">All Garage Vehicles</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Database logs list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500">Querying service database logs...</p>
                </div>
            ) : filteredRecords.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl py-12 text-center text-slate-505">
                    <ClipboardList className="w-12 h-12 mx-auto text-slate-705 mb-3" />
                    <p className="font-semibold text-slate-350">No service history found</p>
                    <p className="text-xs text-slate-505 mt-0.5">Click the "Log New Service" button to record maintenance data.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop View Table */}
                    <div className="hidden md:block bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                                        <th className="py-4 px-6">Service Date</th>
                                        <th className="py-4 px-6">Vehicle</th>
                                        <th className="py-4 px-6">Service Type</th>
                                        <th className="py-4 px-6">Odometer</th>
                                        <th className="py-4 px-6">Service Workshop</th>
                                        <th className="py-4 px-6">Repair Details</th>
                                        <th className="py-4 px-6 text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredRecords.map((r) => {
                                        const vehicleObj = vehicles.find(v => v.id.toString() === r.vehicleId?.toString());
                                        const categoryObj = categories.find(c => c.id.toString() === r.categoryId?.toString());
                                        return (
                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6 whitespace-nowrap flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-2 text-slate-550" />
                                                    {r.serviceDate}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-800">
                                                    {vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model}` : "Unknown"}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-205 font-semibold text-[10px]">
                                                        {categoryObj ? categoryObj.name : "Custom Servicing"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">{r.mileageAtService.toLocaleString()} km</td>
                                                <td className="py-4 px-6 whitespace-nowrap">{r.serviceCenter}</td>
                                                <td className="py-4 px-6 max-w-xs truncate">
                                                    <span title={r.description}>{r.description}</span>
                                                    {r.notes && (
                                                        <div className="text-[10px] text-slate-500 italic mt-0.5">Notes: {r.notes}</div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right font-bold text-green-405 whitespace-nowrap">
                                                    ₹{r.cost.toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredRecords.map((r) => {
                            const vehicleObj = vehicles.find(v => v.id.toString() === r.vehicleId?.toString());
                            const categoryObj = categories.find(c => c.id.toString() === r.categoryId?.toString());
                            return (
                                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{r.serviceDate}</span>
                                            <h4 className="font-bold text-slate-200 mt-0.5">{vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model}` : "Unknown"}</h4>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[9px]">
                                            {categoryObj ? categoryObj.name : "Custom Servicing"}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-350 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                                        <p className="leading-relaxed"><strong className="text-slate-300 font-medium">Work Done:</strong> {r.description}</p>
                                        {r.notes && (
                                            <p className="mt-1 text-[10px] text-slate-400 italic"><strong className="not-italic text-slate-300">Notes:</strong> {r.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-800/80">
                                        <div className="text-slate-405">
                                            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Odometer / Location</span>
                                            {r.mileageAtService.toLocaleString()} km • {r.serviceCenter}
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Invoice Cost</span>
                                            <span className="font-bold text-green-400">₹{r.cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* Add New Service Modal Dialog */}
            {showAddForm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddForm(false)}></div>

                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 md:p-8 shadow-2xl z-10 max-h-[90svh] overflow-y-auto">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-202"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-base font-bold text-white mb-2 flex items-center">
                            <PenTool className="w-5 h-5 mr-1.5 text-blue-500" /> Log Maintenance Record
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-6">Log details of replacement parts and mechanic invoices.</p>

                        {formError && (
                            <div className="mb-4 bg-red-955/40 border border-red-900/30 p-3 rounded-xl flex items-start space-x-2 text-red-400 text-xs">
                                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Vehicle Choice */}
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Select Vehicle *</label>
                                    <select
                                        name="vehicleId"
                                        value={formData.vehicleId}
                                        onChange={handleFormChange}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                        required
                                    >
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Categories */}
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Service Category *</label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleFormChange}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Service Date */}
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Service Date *</label>
                                    <input
                                        type="date"
                                        name="serviceDate"
                                        value={formData.serviceDate}
                                        onChange={handleFormChange}
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Mileage Odometer */}
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Mileage at Service (km) *</label>
                                    <input
                                        type="number"
                                        name="mileageAtService"
                                        value={formData.mileageAtService}
                                        onChange={handleFormChange}
                                        placeholder="e.g. 18500"
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Service Center Workshop */}
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Service Center / Garage *</label>
                                    <input
                                        type="text"
                                        name="serviceCenter"
                                        value={formData.serviceCenter}
                                        onChange={handleFormChange}
                                        placeholder="e.g. Apex Honda Care"
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Service Cost */}
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Invoice Cost (₹) *</label>
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleFormChange}
                                        placeholder="e.g. 2500"
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description summary */}
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Description of repairs *</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Details of parts changed or repairs done (e.g. replaced clutch rollers, engine oil wash)"
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-805 rounded-xl focus:ring-1 focus:ring-blue-555 focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Private Notes */}
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider">Additional Notes / Remarks</label>
                                <textarea
                                    name="notes"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    placeholder="Recommendations from mechanic, parts to check next time, etc."
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-805 rounded-xl focus:ring-1 focus:ring-blue-555 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-850">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-350 rounded-xl hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
                                >
                                    {formLoading ? "Saving Log..." : "Log Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
