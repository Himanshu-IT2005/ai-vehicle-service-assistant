import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Create an axios instance
const apiClient = axios.create({
    baseURL: API_BASE
});

// Request interceptor to attach JWT token if present
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('v_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle session expiration (401 Unauthorized)
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('v_token');
        localStorage.removeItem('v_current_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

// Helper to map snake_case backend parameters to camelCase for the frontend templates
const mapVehicle = (v) => {
    if (!v) return null;
    const currentMileage = v.current_mileage !== undefined ? v.current_mileage : (v.currentMileage || 0);
    const lastServiceMileage = v.last_service_mileage !== undefined ? v.last_service_mileage : v.lastServiceMileage;

    // Determine a base health score
    const healthScore = v.healthScore !== undefined ? v.healthScore : 90;

    return {
        id: v.id,
        userId: v.user_id || v.userId,
        brand: v.brand,
        model: v.model,
        year: v.year,
        fuelType: v.fuel_type || v.fuelType,
        currentMileage: currentMileage,
        registrationNumber: v.registration_number || v.registrationNumber,
        purchaseDate: v.purchase_date ? v.purchase_date.split('T')[0] : (v.purchaseDate || ''),
        lastServiceDate: v.last_service_date ? v.last_service_date.split('T')[0] : (v.lastServiceDate || ''),
        lastServiceMileage: lastServiceMileage,
        healthScore: healthScore,
        healthDetail: v.healthDetail || {
            engine: Math.min(100, healthScore + 3),
            brakes: Math.min(100, Math.max(30, healthScore - 2)),
            tyres: Math.min(100, Math.max(30, healthScore - 5)),
            battery: Math.min(100, healthScore)
        },
        nextServiceMileage: lastServiceMileage ? (lastServiceMileage + 10000) : (currentMileage + 5000)
    };
};

export const db = {
    // Authentication
    getCurrentUser: () => {
        const userStr = localStorage.getItem('v_current_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setCurrentUser: (user) => {
        if (user) {
            localStorage.setItem('v_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('v_current_user');
        }
    },

    getProfile: async () => {
        try {
            const res = await apiClient.get('/users/profile');
            if (res.data && res.data.success) {
                const user = res.data.data;
                db.setCurrentUser(user);
                return user;
            }
            throw new Error(res.data.message || "Failed to get profile");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                db.setCurrentUser(null);
                localStorage.removeItem('v_token');
            }
            throw new Error(err.response?.data?.message || err.message || "Session expired");
        }
    },

    logout: async () => {
        localStorage.removeItem('v_current_user');
        localStorage.removeItem('v_token');
    },

    login: async (email, password) => {
        try {
            const res = await apiClient.post('/auth/login', { email, password });
            if (res.data && res.data.success) {
                const { token, user } = res.data;
                localStorage.setItem('v_token', token);
                db.setCurrentUser(user);
                return user;
            }
            throw new Error(res.data.message || "Failed to log in");
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Invalid credentials");
        }
    },

    register: async (name, email, password, phone = '') => {
        try {
            const res = await apiClient.post('/auth/register', { name, email, password, phone });
            if (res.data && res.data.success) {
                const { token, user } = res.data;
                localStorage.setItem('v_token', token);
                db.setCurrentUser(user);
                return user;
            }
            throw new Error(res.data.message || "Registration failed");
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Registration failed");
        }
    },

    forgotPassword: async (email) => {
        try {
            const res = await apiClient.post('/auth/forgot-password', { email });
            if (res.data && res.data.success) {
                return res.data.message || "Instructions sent successfully.";
            }
            throw new Error(res.data.message || "Failed to initiate password reset");
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to initiate password reset");
        }
    },

    updateProfile: async (userId, data) => {
        try {
            const res = await apiClient.put('/users/profile', { name: data.name, phone: data.phone });
            if (res.data && res.data.success) {
                const updatedUser = res.data.data;
                db.setCurrentUser(updatedUser);
                return updatedUser;
            }
            throw new Error(res.data.message || "Failed to update profile");
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to update profile");
        }
    },

    changePassword: async (oldPassword, newPassword) => {
        try {
            const res = await apiClient.put('/users/change-password', { oldPassword, newPassword });
            if (res.data && res.data.success) {
                return true;
            }
            throw new Error(res.data.message || "Failed to change password");
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to change password");
        }
    },

    // Vehicles
    getVehicles: async () => {
        try {
            const res = await apiClient.get('/vehicles');
            return (res.data.data || []).map(mapVehicle);
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    getVehicle: async (id) => {
        try {
            const res = await apiClient.get(`/vehicles/${id}/details`);
            return mapVehicle(res.data.data);
        } catch (err) {
            const resBase = await apiClient.get(`/vehicles/${id}`);
            return mapVehicle(resBase.data.data);
        }
    },

    addVehicle: async (vehicleData) => {
        try {
            const res = await apiClient.post('/vehicles', {
                brand: vehicleData.brand,
                model: vehicleData.model,
                year: parseInt(vehicleData.year),
                fuelType: vehicleData.fuelType,
                registrationNumber: vehicleData.registrationNumber,
                currentMileage: parseInt(vehicleData.currentMileage),
                purchaseDate: vehicleData.purchaseDate || null,
                lastServiceDate: vehicleData.lastServiceDate || null,
                lastServiceMileage: vehicleData.lastServiceMileage ? parseInt(vehicleData.lastServiceMileage) : null
            });
            return mapVehicle(res.data.data);
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to add vehicle");
        }
    },

    updateVehicle: async (id, vehicleData) => {
        try {
            const res = await apiClient.put(`/vehicles/${id}`, {
                brand: vehicleData.brand,
                model: vehicleData.model,
                year: parseInt(vehicleData.year),
                fuelType: vehicleData.fuelType,
                registrationNumber: vehicleData.registrationNumber,
                currentMileage: parseInt(vehicleData.currentMileage),
                purchaseDate: vehicleData.purchaseDate || null,
                lastServiceDate: vehicleData.lastServiceDate || null,
                lastServiceMileage: vehicleData.lastServiceMileage ? parseInt(vehicleData.lastServiceMileage) : null
            });
            return mapVehicle(res.data.data);
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to update vehicle");
        }
    },

    deleteVehicle: async (id) => {
        try {
            await apiClient.delete(`/vehicles/${id}`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to delete vehicle");
        }
    },

    // Service Records
    getServiceRecords: async (vehicleId = null) => {
        try {
            const url = vehicleId ? `/service-records/records?vehicleId=${vehicleId}` : '/service-records/records';
            const res = await apiClient.get(url);
            const records = res.data.data || [];
            return records.map(r => ({
                ...r,
                serviceDate: r.service_date ? r.service_date.split('T')[0] : '',
                mileageAtService: r.mileage,
                serviceCenter: r.service_center,
                categoryId: r.category_id,
                categoryName: r.category_name,
                vehicleId: r.vehicle_id
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    addServiceRecord: async (recordData) => {
        try {
            const res = await apiClient.post('/service-records/records', {
                vehicleId: parseInt(recordData.vehicleId),
                categoryId: parseInt(recordData.categoryId),
                serviceDate: recordData.serviceDate,
                mileage: parseInt(recordData.mileageAtService),
                serviceCenter: recordData.serviceCenter,
                cost: parseFloat(recordData.cost),
                description: recordData.description,
                notes: recordData.notes || ""
            });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to log service record");
        }
    },

    // Service Categories
    getCategories: async () => {
        try {
            const res = await apiClient.get('/service-records/categories');
            return res.data.data || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    // Admin Categories CRUD
    adminAddCategory: async (category) => {
        try {
            const res = await apiClient.post('/service-records/categories', {
                name: category.name,
                description: category.description
            });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to add category");
        }
    },

    adminUpdateCategory: async (id, category) => {
        try {
            const res = await apiClient.put(`/service-records/categories/${id}`, {
                name: category.name,
                description: category.description
            });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to update category");
        }
    },

    adminDeleteCategory: async (id) => {
        try {
            await apiClient.delete(`/service-records/categories/${id}`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to delete category");
        }
    },

    // Reminders
    getReminders: async (vehicleId = null) => {
        try {
            const res = await apiClient.get('/reminders');
            let list = res.data.data || [];
            if (vehicleId) {
                list = list.filter(r => r.vehicle_id === parseInt(vehicleId));
            }
            return list.map(r => ({
                ...r,
                dueDate: r.due_date ? r.due_date.split('T')[0] : '',
                dueMileage: r.due_mileage,
                categoryId: r.category_id,
                categoryName: r.category_name,
                vehicleId: r.vehicle_id
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    addReminder: async (reminderData) => {
        try {
            const res = await apiClient.post('/reminders', {
                vehicleId: parseInt(reminderData.vehicleId),
                categoryId: parseInt(reminderData.categoryId),
                title: reminderData.title,
                description: reminderData.description,
                dueDate: reminderData.dueDate,
                dueMileage: reminderData.dueMileage ? parseInt(reminderData.dueMileage) : null
            });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to add reminder");
        }
    },

    updateReminderStatus: async (id, status) => {
        try {
            const res = await apiClient.patch(`/reminders/${id}/complete`, { status });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to update reminder status");
        }
    },

    deleteReminder: async (id) => {
        try {
            await apiClient.delete(`/reminders/${id}`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to delete reminder");
        }
    },

    // Expenses
    getExpenses: async (vehicleId = null) => {
        try {
            const url = vehicleId ? `/expenses?vehicleId=${vehicleId}` : '/expenses';
            const res = await apiClient.get(url);
            const list = res.data.data || [];
            return list.map(e => ({
                ...e,
                expenseDate: e.date ? e.date.split('T')[0] : '',
                vehicleId: e.vehicle_id,
                categoryId: e.category_id || e.category, // fallback check
                amount: parseFloat(e.amount)
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    addExpense: async (expenseData) => {
        try {
            const res = await apiClient.post('/expenses', {
                vehicleId: parseInt(expenseData.vehicleId),
                description: expenseData.description,
                amount: parseFloat(expenseData.amount),
                category: expenseData.category || "other",
                date: expenseData.expenseDate
            });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to log expense");
        }
    },

    deleteExpense: async (id) => {
        try {
            await apiClient.delete(`/expenses/${id}`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to delete expense");
        }
    },

    // Service Centers
    getServiceCenters: async () => {
        try {
            const res = await apiClient.get('/service-centers');
            const list = res.data.data || [];
            return list.map(c => {
                const ratingValue = parseFloat(c.rating || 4.5);
                return {
                    ...c,
                    location: `${c.address}, ${c.city}`,
                    contact: c.phone,
                    openingHours: c.opening_hours,
                    services: c.services ? c.services.split(', ') : [],
                    timings: c.opening_hours || '09:00 AM - 06:00 PM',
                    specialization: c.services ? c.services.split(', ')[0] : 'General Service',
                    rating: isNaN(ratingValue) ? 4.5 : ratingValue,
                    reviews: c.id ? (c.id * 17 + 29) : 45,
                    distance: `${((c.id || 1) * 1.2).toFixed(1)} km`
                };
            });
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    addServiceCenter: async (center) => {
        try {
            const res = await apiClient.post('/service-centers', {
                name: center.name,
                address: center.location.split(',')[0] || center.location,
                city: center.location.split(',')[1]?.trim() || 'Default City',
                phone: center.contact,
                email: center.email || null,
                openingHours: center.openingHours || "09:00 AM - 06:00 PM",
                services: typeof center.services === 'string' ? center.services : center.services?.join(', ') || '',
                rating: 5.0
            });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to add service center");
        }
    },

    // AI Vehicle Problems
    getAiHistory: async () => {
        try {
            const res = await apiClient.get('/ai-analyses');
            const list = res.data.data || [];
            return list.map(a => ({
                ...a,
                responseCategory: a.response_category,
                responseCauses: a.response_causes ? a.response_causes.split(', ') : [],
                responseSeverity: a.response_severity,
                responseAction: a.response_action,
                responseWarning: a.response_warning,
                createdAt: a.created_at,
                vehicleId: a.vehicle_id,
                userId: a.user_id
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    getAiAnalysis: async (id) => {
        try {
            const res = await apiClient.get(`/ai-analyses/${id}`);
            const a = res.data.data;
            return {
                ...a,
                responseCategory: a.response_category,
                responseCauses: a.response_causes ? a.response_causes.split(', ') : [],
                responseSeverity: a.response_severity,
                responseAction: a.response_action,
                responseWarning: a.response_warning,
                createdAt: a.created_at,
                vehicleId: a.vehicle_id,
                userId: a.user_id
            };
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to retrieve analysis info");
        }
    },

    analyzeVehicleProblem: async (vehicleId, problemText, context = {}) => {
        try {
            const res = await apiClient.post('/ai-analyses', {
                vehicleId: vehicleId ? parseInt(vehicleId) : null,
                queryText: problemText,
                context
            });
            const a = res.data.data;
            return {
                ...a,
                responseCategory: a.response_category,
                responseCauses: a.response_causes ? a.response_causes.split(', ') : [],
                responseSeverity: a.response_severity,
                responseAction: a.response_action,
                responseWarning: a.response_warning,
                createdAt: a.created_at,
                vehicleId: a.vehicle_id,
                userId: a.user_id
            };
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to get AI diagnosis");
        }
    },

    // Admin Dashboard stats
    getAdminStats: async () => {
        try {
            const res = await apiClient.get('/admin/dashboard');
            return res.data.data;
        } catch (err) {
            console.error(err);
            return {
                totalUsers: 0,
                totalVehicles: 0,
                totalRecords: 0,
                totalAnalyses: 0,
                totalExpenses: 0
            };
        }
    },

    // Admin user list management
    adminGetUsers: async () => {
        try {
            const res = await apiClient.get('/admin/users');
            return res.data.data || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    adminGetVehicles: async () => {
        try {
            const res = await apiClient.get('/admin/vehicles');
            return (res.data.data || []).map(v => ({
                ...mapVehicle(v),
                ownerName: v.owner_name,
                ownerEmail: v.owner_email
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    adminUpdateUserRole: async (userId, role) => {
        try {
            const detailRes = await apiClient.get(`/admin/users/${userId}`);
            const status = detailRes.data.data.profile.status;
            const res = await apiClient.put(`/admin/users/${userId}`, { role, status });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to update user role");
        }
    },

    adminUpdateUserStatus: async (userId, status) => {
        try {
            const detailRes = await apiClient.get(`/admin/users/${userId}`);
            const role = detailRes.data.data.profile.role;
            const res = await apiClient.put(`/admin/users/${userId}`, { role, status });
            return res.data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to update user status");
        }
    },

    adminDeleteUser: async (id) => {
        try {
            await apiClient.delete(`/admin/users/${id}`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Failed to delete user");
        }
    },

    // Notifications
    getNotifications: async () => {
        try {
            const res = await apiClient.get('/notifications');
            return res.data.data || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    markNotificationsRead: async () => {
        try {
            await apiClient.put('/notifications/read');
        } catch (err) {
            console.error(err);
        }
    }
};
