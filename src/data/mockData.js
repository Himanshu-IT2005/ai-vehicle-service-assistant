export const initialUsers = [
    {
        id: 1,
        name: "Alex Johnson",
        email: "user@example.com",
        password: "password123", // Simple mock password
        role: "owner",
        phone: "+1 (555) 019-2834",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
    },
    {
        id: 2,
        name: "Admin Specialist",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        phone: "+1 (555) 777-8888",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120"
    }
];

export const initialVehicles = [
    {
        id: 1,
        userId: 1,
        brand: "Honda",
        model: "Activa 6G",
        year: 2023,
        fuelType: "petrol",
        registrationNumber: "MH-12-TR-4567",
        currentMileage: 18500,
        nextServiceMileage: 20000,
        healthScore: 89,
        healthDetail: {
            engine: 90,
            brakes: 75, // Lower than usual, warning trigger
            tyres: 95,
            battery: 88,
            suspension: 92
        },
        purchaseDate: "2023-04-12",
        lastServiceDate: "2026-02-15",
        lastServiceMileage: 15200,
        image: "scooter" // Identifier for icons
    },
    {
        id: 2,
        userId: 1,
        brand: "Hyundai",
        model: "i20",
        year: 2022,
        fuelType: "petrol",
        registrationNumber: "DL-3C-AL-9981",
        currentMileage: 25000,
        nextServiceMileage: 30000,
        healthScore: 82,
        healthDetail: {
            engine: 85,
            brakes: 90,
            tyres: 65, // Low tyre health
            battery: 78,
            suspension: 80
        },
        purchaseDate: "2022-08-25",
        lastServiceDate: "2025-11-10",
        lastServiceMileage: 20000,
        image: "car"
    }
];

export const initialServiceCategories = [
    { id: 1, name: "General Service", description: "Regular periodic servicing and checkup" },
    { id: 2, name: "Engine oil change", description: "Oil and filter replacement" },
    { id: 3, name: "Brake maintenance", description: "Brake pads, shoe, and fluid inspection/replacement" },
    { id: 4, name: "Tyre replacement", description: "Installing new tyres or tyre rotation" },
    { id: 5, name: "Battery replacement", description: "Installing a new vehicle battery" },
    { id: 6, name: "Suspension fix", description: "repairing dampers, struts, or bushes" }
];

export const initialServiceRecords = [
    {
        id: 1,
        vehicleId: 1,
        categoryId: 1,
        serviceDate: "2026-02-15",
        mileageAtService: 15200,
        cost: 1500,
        serviceCenter: "Apex Honda Care",
        description: "Standard oil change, chain lubrication, brake adjustment, spark plug cleaning.",
        notes: "Front brake pad wear is at 40%. Will need replacement in the next service.",
        status: "completed"
    },
    {
        id: 2,
        vehicleId: 2,
        categoryId: 2,
        serviceDate: "2025-11-10",
        mileageAtService: 20000,
        cost: 4500,
        serviceCenter: "GoMechanic Select",
        description: "Synthetic engine oil replacement, oil filter change, air filter replacement, coolant top up.",
        notes: "Everything checked out fine. Battery voltage is 12.4V.",
        status: "completed"
    },
    {
        id: 3,
        vehicleId: 2,
        categoryId: 3,
        serviceDate: "2024-05-18",
        mileageAtService: 10500,
        cost: 2800,
        serviceCenter: "Hyundai Service World",
        description: "Brake cleaning, front brake pad replacement, brake disc lathe polishing.",
        notes: "Brakes feel highly responsive now. Pad thickness is standard.",
        status: "completed"
    }
];

export const initialExpenses = [
    {
        id: 1,
        vehicleId: 1,
        description: "General Service",
        amount: 1500,
        category: "service",
        expenseDate: "2026-02-15"
    },
    {
        id: 2,
        vehicleId: 2,
        description: "Engine oil change & filters",
        amount: 4500,
        category: "service",
        expenseDate: "2025-11-10"
    },
    {
        id: 3,
        vehicleId: 2,
        description: "Fuel tank full",
        amount: 3200,
        category: "fuel",
        expenseDate: "2026-07-28"
    },
    {
        id: 4,
        vehicleId: 2,
        description: "Brake maintenance",
        amount: 2800,
        category: "parts",
        expenseDate: "2024-05-18"
    },
    {
        id: 5,
        vehicleId: 1,
        description: "Third Party Insurance update",
        amount: 1900,
        category: "insurance",
        expenseDate: "2026-01-10"
    }
];

export const initialReminders = [
    {
        id: 1,
        vehicleId: 1,
        categoryId: 2,
        title: "Engine Oil Change",
        description: "Periodic engine oil renewal (required every 5000 km).",
        dueDate: "2026-09-15",
        dueMileage: 20200,
        status: "pending"
    },
    {
        id: 2,
        vehicleId: 2,
        categoryId: 4,
        title: "Tyre Replacement",
        description: "Replace Front and Rear tyres. Current tread thickness is low.",
        dueDate: "2026-10-30",
        dueMileage: 27000,
        status: "pending"
    },
    {
        id: 3,
        vehicleId: 2,
        categoryId: 1,
        title: "Premium General Service",
        description: "Comprehensive vehicle health diagnostics, filter replacements, fluid check.",
        dueDate: "2026-11-20",
        dueMileage: 30000,
        status: "pending"
    }
];

export const initialAiAnalyses = [
    {
        id: 1,
        userId: 1,
        vehicleId: 1,
        queryText: "My scooter is vibrating a lot at high speed and when accelerating.",
        responseCategory: "Transmission & Drive System",
        responseCauses: [
            "Clutch shoe wear or glazing",
            "Variator rollers/sliders flat spots",
            "Loose drive belt or tension issues",
            "Engine mounting bush wear"
        ],
        responseSeverity: "Medium",
        responseAction: "Inspect the CVT transmission case, clean the clutch assembly, and check the condition of rollers.",
        responseWarning: "Prolonged vibration can cause damage to engine bearings or the transmission belt, which could snap during driving.",
        rawResponse: "Simulated AI analysis response code.",
        createdAt: "2026-05-10T14:32:00.000Z"
    },
    {
        id: 2,
        userId: 1,
        vehicleId: 2,
        queryText: "My brake is squeaking when I slow down from high speed.",
        responseCategory: "Brake System",
        responseCauses: [
            "Thin brake friction pads",
            "Loose brake caliper assembly",
            "Glazed brake rotors/drums",
            "Dust and moisture build-up"
        ],
        responseSeverity: "High",
        responseAction: "Get your brakes checked by a certified technician immediately. Replace brake pads if they have reached the minimum threshold.",
        responseWarning: "If the squeak turns into a grinding sound, brake discs could become scored, leading to reduced stopping power.",
        rawResponse: "Simulated AI analysis response code for brakes.",
        createdAt: "2026-06-20T10:15:00.000Z"
    }
];

export const initialServiceCenters = [
    {
        id: 1,
        name: "Express Vehicle Solutions",
        location: "Downtown Auto Lane, Block B",
        rating: 4.8,
        services: ["Engine Tuning", "Brake Repair", "Tyre Change", "Diagnostics"],
        contact: "+1 (555) 123-4567",
        openingHours: "08:00 AM - 07:00 PM"
    },
    {
        id: 2,
        name: "Autobahn Services (Multi-brand)",
        location: "Industrial ring road near North Highway",
        rating: 4.6,
        services: ["General Service", "AC Service", "Washing", "Clutch Refurbish"],
        contact: "+1 (555) 987-6543",
        openingHours: "09:00 AM - 08:00 PM"
    },
    {
        id: 3,
        name: "Eco-Charge Workshop (EV & Hybrid Specialist)",
        location: "Green Valleys Blvd, Suite 10",
        rating: 4.9,
        services: ["Battery Diagnostics", "Electrical Check", "Motor Overhaul"],
        contact: "+1 (555) 345-6789",
        openingHours: "09:00 AM - 06:00 PM"
    }
];
