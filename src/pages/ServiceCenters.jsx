import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

export default function ServiceCenters() {
    const [userLocationInput, setUserLocationInput] = useState('');
    const [userLocation, setUserLocation] = useState('');

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setUserLocation(userLocationInput.trim());
    };

    const handleReset = () => {
        setUserLocation('');
        setUserLocationInput('');
    };

    const mapQuery = userLocation
        ? `vehicle service centers near ${userLocation}`
        : "vehicle service centers near Bengaluru, Karnataka, India";

    return (
        <div className="space-y-6 text-xs sm:text-xs min-h-[75vh] flex flex-col">
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                    <MapPin className="w-5.5 h-5.5 mr-2 text-blue-500" /> Nearby Service Centers
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Search for certified garages and mechanics around your current location.</p>
            </div>

            {/* Search Input Container */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-500" />
                        </span>
                        <input
                            type="text"
                            placeholder="Enter your city, area, or address (e.g. Indira Nagar, Bengaluru)"
                            value={userLocationInput}
                            onChange={(e) => setUserLocationInput(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-805 rounded-xl text-xs placeholder-slate-600 text-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-550 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                        Search Nearby
                    </button>
                    {(userLocation || userLocationInput) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-450 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all"
                        >
                            Reset
                        </button>
                    )}
                </form>
                {userLocation && (
                    <p className="text-[10px] text-blue-400 font-semibold block mt-3 animate-pulse">
                        📍 Showing vehicle service centers near: "{userLocation}"
                    </p>
                )}
            </div>

            {/* Full-width Map Container */}
            <div className="flex-1 min-h-[450px] relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <iframe
                    title="Service Center Find Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, minHeight: '450px' }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            </div>
        </div>
    );
}
