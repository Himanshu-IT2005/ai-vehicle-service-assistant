import React, { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { ClipboardList, Plus, X, Trash2, Edit2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminServiceCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Custom states for Editor Panel (both Add and Edit)
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const loadCategories = async () => {
        setLoading(true);
        try {
            const list = await db.getCategories();
            setCategories(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleEditClick = (cat) => {
        setEditingId(cat.id);
        setName(cat.name);
        setDescription(cat.description || '');
        setError('');
        setShowForm(true);
    };

    const handleCreateClick = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Category Name is required.");
            return;
        }
        setError('');

        try {
            if (editingId) {
                // Edit update
                await db.adminUpdateCategory(editingId, { name, description });
            } else {
                // Add create
                await db.adminAddCategory({ name, description });
            }
            setShowForm(false);
            loadCategories();
        } catch (err) {
            setError(err.message || "Failed to save category tags.");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (confirm("Are you sure you want to delete this Category tag? Users will no longer be able to log service logs under this name.")) {
            try {
                await db.adminDeleteCategory(id);
                loadCategories();
            } catch (err) {
                alert(err.message || "Failed to remove category.");
            }
        }
    };

    return (
        <div className="space-y-6 text-xs sm:text-xs">

            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <Link to="/admin/dashboard" className="p-2 bg-slate-900 border border-slate-805 rounded-lg text-slate-450 hover:text-slate-205">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
                            <ClipboardList className="w-5.5 h-5.5 mr-2 text-rose-550" /> Service Categories Inventory
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5">Customize service maintenance taxonomy tags used across lists and reminders.</p>
                    </div>
                </div>

                <button
                    onClick={handleCreateClick}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wider transition-all"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> ADD NEW CATEGORY
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-mono">Loading tags list...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main categories listing */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-805 bg-slate-950 text-slate-450 uppercase tracking-widest text-[9px] font-boldSB font-bold">
                                        <th className="py-4 px-6">Category Name</th>
                                        <th className="py-4 px-6 md:w-96">Description Details</th>
                                        <th className="py-4 px-6 text-right">Settings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300">
                                    {categories.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-955/40 transition-colors">
                                            <td className="py-4 px-6 font-bold text-slate-202 text-xs md:text-sm whitespace-nowrap">
                                                {c.name}
                                            </td>
                                            <td className="py-4 px-6 text-slate-405 leading-relaxed">
                                                {c.description || <span className="text-slate-600 italic">No description provided</span>}
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                                                <button
                                                    onClick={() => handleEditClick(c)}
                                                    className="p-1.5 bg-slate-950 border border-slate-805 text-slate-350 hover:text-slate-105 hover:bg-slate-800 rounded transition-all inline-flex"
                                                    title="Edit Category Details"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(c.id)}
                                                    className="p-1.5 bg-slate-905 border border-slate-805 text-slate-501 hover:text-red-400 hover:bg-slate-800 rounded transition-all inline-flex"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Form Side editor details */}
                    {showForm && (
                        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-sm h-fit">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <h3 className="font-semibold text-sm text-white">
                                    {editingId ? "Modify Category Particulars" : "Create New Category Particulars"}
                                </h3>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-1 text-slate-500 hover:text-slate-300 rounded"
                                >
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-955/40 border border-red-900/30 p-2.5 rounded-lg flex items-start space-x-1.5 text-red-400 text-xs">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                                <div>
                                    <label className="block text-slate-400 mb-1.5 uppercase tracking-wider">Category Title Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Engine Oil Wash, Tyre Care"
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1.5 uppercase tracking-wider">Taxonomy Description</label>
                                    <textarea
                                        rows="3"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write details clarifying typical items resolved under this category tag..."
                                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-blue-505 focus:outline-none"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end space-x-2 border-t border-slate-850">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-350 rounded-xl hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-bold inline-flex items-center"
                                    >
                                        <Save className="w-3.5 h-3.5 mr-1" /> SAVE TAG
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}
