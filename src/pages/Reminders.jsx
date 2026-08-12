import React, { useState, useEffect } from 'react';
import { db } from '../data/db';
import { Bell, Calendar, Plus, X, Trash2, CheckCircle2, Clock, Info } from 'lucide-react';

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form Fields
    const [formData, setFormData] = useState({
        vehicleId: '',
        categoryId: '1',
        title: '',
        description: '',
        dueDate: '',
        dueMileage: ''
    });

    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const rems = await db.getReminders();
            const vehs = await db.getVehicles();
            const cats = await db.getCategories();

            setReminders(rems);
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
        if (!formData.vehicleId || !formData.title || !formData.dueDate) {
            setFormError("Please fill out Title, Due Date, and select a Vehicle *.");
            return;
        }
        setFormError('');
        setFormLoading(true);

        try {
            await db.addReminder(formData);
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                dueDate: '',
                dueMileage: ''
            }));
            setShowAddForm(false);
            await loadData();
        } catch (err) {
            setFormError(err.message || "Failed to create reminder schedule.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleComplete = async (id, status) => {
        try {
            const nextStatus = status === 'completed' ? 'pending' : 'completed';
            await db.updateReminderStatus(id, nextStatus);
            await loadData();
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this reminder?")) {
            try {
                await db.deleteReminder(id);
                await loadData();
            } catch (err) {
                alert("Failed to delete reminder.");
            }
        }
    };

    const pendingReminders = reminders.filter(r => r.status === 'pending');
    const completedReminders = reminders.filter(r => r.status === 'completed');

    return (
        <div className="space-y-6 text-xs sm:text-xs">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 flex items-center">
                        <Bell className="w-5.5 h-5.5 mr-2 text-amber-500 hover:animate-bounce" /> Maintenance Reminders
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">Schedule date or odometer mileage alerts for upcoming vehicle care services.</p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> CREATE REMINDER
                </button>
            </div>

            {vehicles.length === 0 && !loading && (
                <div className="bg-white border border-slate-205 p-6 rounded-2xl text-center text-slate-500 shadow-sm">
                    Please add a vehicle profile under "My Vehicles" page before scheduling alarms.
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500">Querying reminders schedule...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Active reminders */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700 border-b border-slate-200 pb-2.5 flex items-center">
                            Active Schedules ({pendingReminders.length})
                        </h3>

                        {pendingReminders.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-450 shadow-sm">
                                No active service reminders set.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingReminders.map(rem => {
                                    const vehicleObj = vehicles.find(v => v.id.toString() === rem.vehicleId?.toString());
                                    return (
                                        <div key={rem.id} className="bg-white border border-slate-200 hover:border-slate-350 p-4 rounded-xl flex justify-between items-start space-x-3 transition-all shadow-sm">
                                            <div className="flex items-start space-x-3">
                                                <button
                                                    onClick={() => handleToggleComplete(rem.id, rem.status)}
                                                    className="mt-0.5 p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full border border-slate-200 hover:border-green-200 transition-all"
                                                    title="Mark complete"
                                                >
                                                    <div className="w-3.5 h-3.5 rounded-full hover:bg-green-500 border border-slate-300"></div>
                                                </button>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-xs">{rem.title}</h4>
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase block mt-0.5">
                                                        {vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model}` : "General"}
                                                    </span>
                                                    <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">{rem.description}</p>

                                                    <div className="flex items-center space-x-3 mt-2 text-[9px] text-slate-450">
                                                        <span className="flex items-center">
                                                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Due: {rem.dueDate}
                                                        </span>
                                                        {rem.dueMileage && (
                                                            <span>• Due Odom: {rem.dueMileage.toLocaleString()} km</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(rem.id)}
                                                className="p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-650 border border-slate-200 hover:border-red-250 rounded transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Completed reminders */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-slate-500 border-b border-slate-200 pb-2.5">
                            Completed Logs ({completedReminders.length})
                        </h3>

                        {completedReminders.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-450 shadow-sm">
                                Completed maintenance reminders list is empty.
                            </div>
                        ) : (
                            <div className="space-y-3 opacity-75">
                                {completedReminders.map(rem => {
                                    const vehicleObj = vehicles.find(v => v.id.toString() === rem.vehicleId?.toString());
                                    return (
                                        <div key={rem.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-start space-x-3">
                                            <div className="flex items-start space-x-3">
                                                <button
                                                    onClick={() => handleToggleComplete(rem.id, rem.status)}
                                                    className="mt-0.5 p-1 text-green-600 bg-white rounded-full border border-green-200"
                                                    title="Undo complete"
                                                >
                                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                                </button>
                                                <div>
                                                    <h4 className="font-bold text-slate-400 line-through text-xs">{rem.title}</h4>
                                                    <span className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">
                                                        {vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model}` : "General"}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(rem.id)}
                                                className="p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-650 border border-slate-200 hover:border-red-250 rounded mr-1 shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Add reminder modal */}
            {showAddForm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddForm(false)}></div>

                    <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 text-slate-700">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center">
                            <Clock className="w-5 h-5 mr-1.5 text-blue-500" /> Create Reminders Schedule
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-6 font-medium">Add time-based or mileage-based indicators.</p>

                        {formError && (
                            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl flex items-start space-x-2 text-red-550 text-xs">
                                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1 uppercase tracking-wider">Select Vehicle *</label>
                                <select
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleFormChange}
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    required
                                >
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1 uppercase tracking-wider">Reminder Subject *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Change front brake pads, Rotate tyres"
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1 uppercase tracking-wider">Service Category *</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleFormChange}
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1 uppercase tracking-wider">Due Date *</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleFormChange}
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1 uppercase tracking-wider">Due Mileage Odometer Limit (Optional)</label>
                                <input
                                    type="number"
                                    name="dueMileage"
                                    value={formData.dueMileage}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 26000"
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1 uppercase tracking-wider">Description</label>
                                <textarea
                                    name="description"
                                    rows="2"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Notes about specific parts or parameters to check..."
                                    className="block w-full px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
                                >
                                    {formLoading ? "Creating Alert..." : "Create Schedule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
