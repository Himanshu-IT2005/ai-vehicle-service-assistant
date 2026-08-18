import React, { useState, useEffect } from 'react';
import { db } from '../data/db';
import { DollarSign, Plus, X, Search, Calendar, Landmark, PieChart, LandmarkIcon } from 'lucide-react';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form Fields
    const [formData, setFormData] = useState({
        vehicleId: '',
        categoryId: '1',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Filter States
    const [filterVehicle, setFilterVehicle] = useState('all');
    const [searchDesc, setSearchDesc] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const exps = await db.getExpenses();
            const vehs = await db.getVehicles();
            const cats = await db.getCategories();

            setExpenses(exps);
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
        if (!formData.vehicleId || !formData.amount || !formData.expenseDate || !formData.description) {
            setFormError("Please fill out Amount, Date, Description, and select a Vehicle *.");
            return;
        }
        setFormError('');
        setFormLoading(true);

        try {
            await db.addExpense(formData);
            setFormData(prev => ({
                ...prev,
                amount: '',
                description: ''
            }));
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setFormError(err.message || "Failed to add expense log.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            try {
                await db.deleteExpense(id);
                await loadData();
            } catch (err) {
                alert("Failed to delete cost record.");
            }
        }
    };

    const filteredExpenses = expenses.filter(e => {
        const matchesVehicle = filterVehicle === 'all' || e.vehicleId === parseInt(filterVehicle);
        const matchesSearch = e.description.toLowerCase().includes(searchDesc.toLowerCase());
        return matchesVehicle && matchesSearch;
    });

    const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by categories for dynamic visual budget distribution list
    const categoryStats = categories.map(cat => {
        const sum = filteredExpenses
            .filter(e => e.categoryId === cat.id)
            .reduce((s, e) => s + e.amount, 0);
        return { name: cat.name, sum };
    }).filter(c => c.sum > 0);

    return (
        <div className="space-y-6 text-xs sm:text-xs">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                        <DollarSign className="w-5.5 h-5.5 mr-2 text-green-550" /> Maintenance Expenses Tracker
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">Analyze and catalog budget spending for fuel, insurance, spare parts, and labor.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> LOG NEW EXPENSE
                </button>
            </div>

            {vehicles.length === 0 && !loading && (
                <div className="bg-slate-900 border border-slate-805 p-6 rounded-2xl text-center text-slate-450">
                    Please add a vehicle profile under "My Vehicles" page before cataloging invoices.
                </div>
            )}

            {vehicles.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Stats card */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Aggregated Expenses</span>
                            <span className="text-xl font-bold text-white mt-1 block">₹{totalExpense.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Filters panel */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-72">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-500" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search description keywords..."
                                value={searchDesc}
                                onChange={(e) => setSearchDesc(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                            />
                        </div>

                        <div className="flex w-full sm:w-auto items-center space-x-2 justify-end">
                            <span className="text-slate-400 text-xs hidden sm:inline">Filter Vehicle:</span>
                            <select
                                value={filterVehicle}
                                onChange={(e) => setFilterVehicle(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-xs text-slate-350 rounded-lg px-3 py-2 focus:outline-none"
                            >
                                <option value="all">All Vehicles</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500">Querying financial statements...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* List/Table of expenses */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Desktop View Table */}
                        <div className="hidden md:block bg-slate-900 border border-slate-805 rounded-2xl overflow-hidden shadow-md">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                                            <th className="py-4 px-5">Expense Date</th>
                                            <th className="py-4 px-5">Vehicle</th>
                                            <th className="py-4 px-5">Type / Category</th>
                                            <th className="py-4 px-5">Description</th>
                                            <th className="py-4 px-5 text-right">Cost</th>
                                            <th className="py-4 px-5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {filteredExpenses.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-slate-505">
                                                    No financial logs indexed matching search conditions.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredExpenses.map((exp) => {
                                                const veh = vehicles.find(v => v.id === exp.vehicleId);
                                                const cat = categories.find(c => c.id === exp.categoryId);
                                                return (
                                                    <tr key={exp.id} className="hover:bg-slate-955/40 transition-colors">
                                                        <td className="py-4 px-5 whitespace-nowrap flex items-center">
                                                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                                            {exp.expenseDate}
                                                        </td>
                                                        <td className="py-4 px-5 whitespace-nowrap font-medium text-slate-202">
                                                            {veh ? `${veh.brand} ${veh.model}` : "Unknown"}
                                                        </td>
                                                        <td className="py-4 px-5 whitespace-nowrap">
                                                            <span className="px-2.5 py-0.5 rounded bg-slate-955 text-slate-400 border border-slate-800 text-[9px]">
                                                                {cat ? cat.name : "Other"}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5 max-w-xs truncate">{exp.description}</td>
                                                        <td className="py-4 px-5 text-right font-bold text-white">
                                                            ₹{exp.amount.toLocaleString()}
                                                        </td>
                                                        <td className="py-4 px-5 text-right">
                                                            <button
                                                                onClick={() => handleDelete(exp.id)}
                                                                className="text-slate-550 hover:text-red-400 p-1 rounded hover:bg-slate-800"
                                                            >
                                                                <X className="w-4.5 h-4.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredExpenses.length === 0 ? (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500">
                                    No financial logs indexed matching search conditions.
                                </div>
                            ) : (
                                filteredExpenses.map((exp) => {
                                    const veh = vehicles.find(v => v.id === exp.vehicleId);
                                    const cat = categories.find(c => c.id === exp.categoryId);
                                    return (
                                        <div key={exp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] text-slate-500 block">{exp.expenseDate}</span>
                                                    <h4 className="font-bold text-slate-200 mt-0.5">{veh ? `${veh.brand} ${veh.model}` : "Unknown"}</h4>
                                                </div>
                                                <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-800 text-[9px]">
                                                    {cat ? cat.name : "Other"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-350">{exp.description}</span>
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-white">₹{exp.amount.toLocaleString()}</span>
                                                    <button
                                                        onClick={() => handleDelete(exp.id)}
                                                        className="text-slate-500 hover:text-red-400 p-1 bg-slate-950/40 rounded border border-slate-850"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>


                    {/* Allocation of costs widget */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h3 className="font-semibold text-sm text-white flex items-center border-b border-slate-800 pb-3">
                            <PieChart className="w-4.5 h-4.5 mr-2 text-blue-500" /> Budget Allocation Details
                        </h3>

                        {categoryStats.length === 0 ? (
                            <p className="text-xs text-slate-500 py-3 text-center">No cost statistics recorded.</p>
                        ) : (
                            <div className="space-y-4">
                                {categoryStats.map((stat, i) => {
                                    const percent = Math.round((stat.sum / totalExpense) * 100);
                                    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500"];
                                    const color = colors[i % colors.length];

                                    return (
                                        <div key={stat.name} className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-slate-350 flex items-center">
                                                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${color}`}></span>
                                                    {stat.name}
                                                </span>
                                                <span className="text-slate-205">₹{stat.sum.toLocaleString()} ({percent}%)</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Add expense modal */}
            {showAddForm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddForm(false)}></div>

                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-base font-bold text-white mb-2 flex items-center">
                            <LandmarkIcon className="w-5 h-5 mr-1.5 text-blue-500" /> Log Maintenance Invoice
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-6 uppercase tracking-wider font-semibold">Track parts, fuel, or servicing costs.</p>

                        {formError && (
                            <div className="mb-4 bg-red-955/40 border border-red-900/30 p-3 rounded-xl flex items-start space-x-2 text-red-400 text-xs">
                                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">

                            <div>
                                <label className="block text-slate-405 font-bold mb-1 uppercase tracking-wider">Select Vehicle *</label>
                                <select
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleFormChange}
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                    required
                                >
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-405 font-bold mb-1 uppercase tracking-wider">Category *</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleFormChange}
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-405 font-bold mb-1 uppercase tracking-wider">Expense Amount (₹) *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 1500"
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-405 font-bold mb-1 uppercase tracking-wider">Expense Date *</label>
                                <input
                                    type="date"
                                    name="expenseDate"
                                    value={formData.expenseDate}
                                    onChange={handleFormChange}
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-405 font-bold mb-1 uppercase tracking-wider">Description of purchase *</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Shell Petrol, Brake Oil change, Tyre wash"
                                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base sm:text-sm focus:ring-1 focus:ring-blue-550 focus:outline-none"
                                    required
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
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50"
                                >
                                    {formLoading ? "Recording Expense..." : "Log Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
