import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { db } from '../data/db';
import { Car, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function VehicleAddEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        fuelType: 'petrol',
        registrationNumber: '',
        currentMileage: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        lastServiceDate: '',
        lastServiceMileage: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const fetchVehicle = async () => {
                setFetching(true);
                try {
                    const v = await db.getVehicle(id);
                    setFormData({
                        brand: v.brand,
                        model: v.model,
                        year: v.year,
                        fuelType: v.fuelType,
                        registrationNumber: v.registrationNumber,
                        currentMileage: v.currentMileage,
                        purchaseDate: v.purchaseDate,
                        lastServiceDate: v.lastServiceDate || '',
                        lastServiceMileage: v.lastServiceMileage || ''
                    });
                } catch (err) {
                    setError("Failed to fetch vehicle information details.");
                } finally {
                    setFetching(false);
                }
            };
            fetchVehicle();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.brand || !formData.model || !formData.registrationNumber || !formData.currentMileage) {
            setError("Please fill in all mandatory fields denoted by *.");
            return;
        }
        setError('');
        setLoading(true);

        try {
            if (isEditMode) {
                await db.updateVehicle(id, formData);
            } else {
                await db.addVehicle(formData);
            }
            navigate('/vehicles');
        } catch (err) {
            setError(err.message || "Failed to save vehicle details.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500">Querying vehicle profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-3">
                <Link to="/vehicles" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-450 hover:text-slate-200">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        {isEditMode ? "Edit Vehicle Credentials" : "Register a New Vehicle"}
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
                        {isEditMode ? "Modify details and adjust current mileage numbers." : "Add a brand new vehicle to start tracking health status."}
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
                {error && (
                    <div className="mb-6 bg-red-955/40 border border-red-900/30 p-4 rounded-xl flex items-start space-x-2 text-xs text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-6 text-xs" onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Brand */}
                        <div>
                            <label htmlFor="brand" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Brand/Manufacturer <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="brand"
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="e.g., Honda, Hyundai, Yamaha"
                                required
                            />
                        </div>

                        {/* Model */}
                        <div>
                            <label htmlFor="model" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Model Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="model"
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="e.g., Activa 6G, i20, R15"
                                required
                            />
                        </div>

                        {/* Manufacturing Year */}
                        <div>
                            <label htmlFor="year" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Manufacturing Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="year"
                                type="number"
                                name="year"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                value={formData.year}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Fuel Type */}
                        <div>
                            <label htmlFor="fuelType" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Fuel Engine Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="fuelType"
                                name="fuelType"
                                value={formData.fuelType}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                required
                            >
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>

                        {/* Registration Number */}
                        <div>
                            <label htmlFor="registrationNumber" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Registration Number / License Tag <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="registrationNumber"
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="e.g., MH-12-TR-4567"
                                required
                            />
                        </div>

                        {/* Current Mileage */}
                        <div>
                            <label htmlFor="currentMileage" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Current Odometer Mileage (km) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="currentMileage"
                                type="number"
                                name="currentMileage"
                                min="0"
                                value={formData.currentMileage}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-805 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="e.g., 25000"
                                required
                            />
                        </div>

                        {/* Purchase Date */}
                        <div>
                            <label htmlFor="purchaseDate" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Purchase Date
                            </label>
                            <input
                                id="purchaseDate"
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                        </div>

                        {/* Last Service Date */}
                        <div>
                            <label htmlFor="lastServiceDate" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Last Service Date
                            </label>
                            <input
                                id="lastServiceDate"
                                type="date"
                                name="lastServiceDate"
                                value={formData.lastServiceDate}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                        </div>

                        {/* Last Service Mileage */}
                        <div>
                            <label htmlFor="lastServiceMileage" className="block font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Last Service Mileage (km)
                            </label>
                            <input
                                id="lastServiceMileage"
                                type="number"
                                name="lastServiceMileage"
                                min="0"
                                value={formData.lastServiceMileage}
                                onChange={handleChange}
                                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="e.g., 20000"
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-4 border-t border-slate-800 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/vehicles')}
                            className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-350 rounded-xl font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold tracking-wide transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Saving Vehicle..." : "Save Vehicle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
