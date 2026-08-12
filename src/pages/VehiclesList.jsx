import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../data/db';
import { Car, Plus, Search, Filter, Trash2, Edit2, Eye, Fuel } from 'lucide-react';

export default function VehiclesList() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState('');
    const [fuelFilter, setFuelFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const list = await db.getVehicles();
            setVehicles(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm("Are you sure you want to delete this vehicle and all associated service logs?")) {
            try {
                await db.deleteVehicle(id);
                loadVehicles();
            } catch (err) {
                alert(err.message || "Failed to delete vehicle.");
            }
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const query = search.toLowerCase();
        const matchesSearch = v.brand.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.registrationNumber.toLowerCase().includes(query);
        const matchesFuel = fuelFilter === 'all' || v.fuelType === fuelFilter;
        return matchesSearch && matchesFuel;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">My Garage Vehicles</h1>
                    <p className="text-slate-400 text-xs mt-1">Manage and audit details for your cars, bikes, and other transports.</p>
                </div>

                <Link
                    to="/vehicles/add"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> ADD VEHICLE
                </Link>
            </div>

            {/* Filters & Search Panel */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center sm:text-xs">

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search brand, model, registration..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Filter keys */}
                <div className="flex w-full md:w-auto items-center space-x-2 justify-end">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400 text-xs hidden sm:inline">Fuel Type:</span>
                    <select
                        value={fuelFilter}
                        onChange={(e) => setFuelFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-805 text-xs text-slate-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="all">All Fuels</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>
            </div>

            {/* Content state */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500">Querying vehicles list...</p>
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center text-slate-400">
                    <Car className="w-16 h-16 mx-auto text-slate-705 mb-4" />
                    <p className="font-semibold text-white">No vehicles found</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing your filters or add a new vehicle instance to start.</p>
                    <Link
                        to="/vehicles/add"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                        Add New Vehicle
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((v) => (
                        <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden hover:border-slate-700 transition-all duration-200">

                            {/* Card content details */}
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{v.brand} {v.model}</h3>
                                        <p className="text-[10px] text-slate-500 font-semibold uppercase">{v.registrationNumber}</p>
                                    </div>

                                    {/* Health status */}
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${v.healthScore >= 85
                                        ? 'bg-green-950/60 text-green-400 border-green-900/30'
                                        : 'bg-amber-955/65 text-amber-400 border-amber-905/30'
                                        }`}>
                                        Health: {v.healthScore}/100
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-550">Year / Purchase</span>
                                        <span className="text-slate-800">{v.year} / {v.purchaseDate}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100">
                                        <span className="text-slate-550">Current Odometer</span>
                                        <span className="text-slate-800 font-medium">{v.currentMileage.toLocaleString()} km</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-550">Fuel Type</span>
                                        <span className="text-slate-800 capitalize flex items-center">
                                            <Fuel className="w-3.5 h-3.5 mr-1 text-slate-500" /> {v.fuelType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons footer */}
                            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-[10px] text-slate-550 italic">
                                    Next standard service: {v.nextServiceMileage.toLocaleString()} km
                                </span>

                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/vehicles/${v.id}`}
                                        className="p-1 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center transition-all shadow-sm"
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1" /> VIEW
                                    </Link>
                                    <Link
                                        to={`/vehicles/${v.id}/edit`}
                                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        onClick={(e) => handleDelete(v.id, e)}
                                        className="p-1.5 bg-white hover:bg-red-50 hover:text-red-650 border border-slate-200 hover:border-red-200 text-slate-500 rounded transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
