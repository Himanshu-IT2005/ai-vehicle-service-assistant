import React, { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { Car, Fuel, Activity, Trash2, ArrowLeft, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminVehiclesList() {
    const [vehicles, setVehicles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadVehiclesData = async () => {
        setLoading(true);
        try {
            const vList = await db.adminGetVehicles();
            const uList = await db.adminGetUsers();
            setVehicles(vList);
            setUsers(uList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehiclesData();
    }, []);

    const handleDeleteVehicle = async (id) => {
        if (confirm("Are you sure you want to permanently delete this vehicle profile and all related service bills?")) {
            try {
                await db.deleteVehicle(id);
                await loadVehiclesData();
            } catch (err) {
                alert("Failed to delete vehicle registry record.");
            }
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const q = search.toLowerCase();
        const ownerObj = users.find(u => u.id === v.userId);
        const ownerName = ownerObj ? ownerObj.name.toLowerCase() : '';
        const ownerEmail = ownerObj ? ownerObj.email.toLowerCase() : '';

        return v.brand.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.registrationNumber.toLowerCase().includes(q) ||
            ownerName.includes(q) ||
            ownerEmail.includes(q);
    });

    return (
        <div className="space-y-6 text-xs sm:text-xs">

            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <Link to="/admin/dashboard" className="p-2 bg-slate-900 border border-slate-805 rounded-lg text-slate-400 hover:text-slate-205">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                            <Car className="w-5.5 h-5.5 mr-2 text-rose-550" /> Fleet Inventories Management
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5">Audit complete mechanical profiles, registrations tags, health ratings, and owner allocations.</p>
                    </div>
                </div>
            </div>

            {/* Filter panel */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-505" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search brand, model, registration, owner..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-mono">Running fleet diagnostic audit...</p>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                                    <th className="py-4 px-6">Profile Specs</th>
                                    <th className="py-4 px-6">Registration Tag</th>
                                    <th className="py-4 px-6">Account Holder (Owner)</th>
                                    <th className="py-4 px-6">Diagnostic Health</th>
                                    <th className="py-4 px-6 text-right font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {filteredVehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-500">
                                            No vehicles found matching search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map(v => {
                                        const owner = users.find(u => u.id === v.userId);
                                        return (
                                            <tr key={v.id} className="hover:bg-slate-950/40 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-slate-202 text-sm">{v.brand} {v.model}</div>
                                                    <div className="text-[10px] text-slate-505 mt-0.5 flex items-center">
                                                        <Fuel className="w-3.5 h-3.5 mr-1" /> {v.year} • {v.fuelType.toUpperCase()} Engine
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap font-mono font-semibold text-slate-350 tracking-wider">
                                                    {v.registrationNumber}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {owner ? (
                                                        <div>
                                                            <div className="text-slate-300 font-medium">{owner.name}</div>
                                                            <span className="text-[10px] text-slate-505">{owner.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-550 italic">Orphan Record</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${v.healthScore >= 85
                                                                ? 'bg-green-950/60 text-green-400 border-green-905/30'
                                                                : v.healthScore >= 70
                                                                    ? 'bg-amber-955/65 text-amber-450 border-amber-900/20'
                                                                    : 'bg-red-955 border border-red-900/30 text-red-400'
                                                            }`}>
                                                            Health: {v.healthScore}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleDeleteVehicle(v.id)}
                                                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-805 hover:bg-red-950/40 hover:text-red-400 text-slate-400 rounded font-semibold transition-all inline-flex items-center"
                                                        title="Remove vehicle registry"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> DELETE REGISTRY
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
            )}

        </div>
    );
}
