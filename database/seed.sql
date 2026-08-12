-- AI Vehicle Service Assistant Mock Seeding File
USE vehicle_service_assistant;

-- Clear previous entries if running again
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE ai_analyses;
TRUNCATE TABLE expenses;
TRUNCATE TABLE maintenance_reminders;
TRUNCATE TABLE service_records;
TRUNCATE TABLE service_categories;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE users;
TRUNCATE TABLE service_centers;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 1. SEED USERS
-- Passwords: user123 = $2a$10$iIpx7bXy7M4a1e94iLq8W.zT/uQ1y3eWcEqDkBwB4c77y176p158O (equivalent bcrypt for: password123)
--            admin123 = $2a$10$L1E76aO5K22S1g94iLq8W.qO/uQ1y3eWcEqDkBwB4c77y176p158O (equivalent bcrypt for: admin123)
-- =========================================================================
INSERT INTO users (id, name, email, password_hash, phone, role, status) VALUES 
(1, 'John Doe', 'user@example.com', '$2a$10$oX3O.L64uAExb3Zte2oI8epG22uYmZ7k.c.BqBvUq35n3.UeQ9qQy', '9876543210', 'owner', 'active'),
(2, 'Admin Assistant', 'admin@example.com', '$2a$10$7Z2oTusZlIuAxm5Lqy3vIec4pW0uYmZ7k.c.BqBvUq35n3.UeQ9qQy', '9988776655', 'admin', 'active');

-- =========================================================================
-- 2. SEED VEHICLES
-- =========================================================================
INSERT INTO vehicles (id, user_id, brand, model, year, fuel_type, current_mileage, registration_number, purchase_date, last_service_date, last_service_mileage) VALUES 
(1, 1, 'Honda', 'Activa 6G', 2021, 'petrol', 12500, 'KA-03-HL-1234', '2021-04-12', '2025-12-05', 12000),
(2, 1, 'Hyundai', 'i20', 2019, 'petrol', 48200, 'KA-51-MD-9988', '2019-10-18', '2026-01-20', 47500);

-- =========================================================================
-- 3. SEED SERVICE CATEGORIES
-- =========================================================================
INSERT INTO service_categories (id, name, description) VALUES 
(1, 'Engine Tune-ups', 'Regular checkup of the key engine elements, spark plugs tuning, filter cleanups'),
(2, 'Brake Care & Repair', 'Caliper inspection, disc resurfacing, brake pad replacement and fluid checkout'),
(3, 'Battery & Electrical', 'Voltage load tests, alternators inspection, wiring analysis, terminal cleanups'),
(4, 'Tyre Rotation & Wheel Alignment', 'Periodic alignment adjustments, balancing and tread inspections'),
(5, 'Fluid & Lubrication Services', 'Coolants flush, engine oil change, gearbox oil overhaul, brake fluid fills'),
(6, 'General Check-up', 'Comprehensive overall safety checks and fluid status verification');

-- =========================================================================
-- 4. SEED SERVICE RECORDS
-- =========================================================================
INSERT INTO service_records (id, vehicle_id, category_id, service_date, mileage, service_center, cost, description, notes) VALUES 
(1, 1, 5, '2025-12-05', 12000, 'A1 Motors Honda Garage', 1200.00, 'Engine Oil swap, spark plugs cleanup, air filter replacement', 'Rear brake adjustment recommended'),
(2, 2, 2, '2026-01-20', 47500, 'SafeRide Multi-brand Service Station', 4500.00, 'Front brake pads replacement and front rotor surfacing', 'Rear brakes inspected - 50% wear remaining');

-- =========================================================================
-- 5. SEED MAINTENANCE REMINDERS
-- =========================================================================
INSERT INTO maintenance_reminders (id, vehicle_id, category_id, title, description, due_date, due_mileage, status) VALUES 
(1, 1, 5, 'Engine Oil Checkup', 'Periodic check and top up for engine motor oil.', '2026-09-01', 15000, 'pending'),
(2, 1, 6, 'Annual General Fitness Test', 'General alignment, electricals, and overall system fitness checkout.', '2026-10-15', 16000, 'pending'),
(3, 2, 4, 'Wheel Realignment & Balance', 'Tyre wear optimization checkup', '2026-08-30', 52000, 'pending');

-- =========================================================================
-- 6. SEED EXPENSES
-- =========================================================================
INSERT INTO expenses (id, vehicle_id, service_record_id, category, amount, date, description) VALUES 
(1, 1, 1, 'service', 1200.00, '2025-12-05', 'Engine Oil swap, spark plugs cleanup, air filter replacement'),
(2, 2, 2, 'service', 4500.00, '2026-01-20', 'Front brake pads replacement and front rotor surfacing'),
(3, 1, NULL, 'fuel', 500.00, '2026-02-05', 'Power Petrol fuel filling - shell'),
(4, 2, NULL, 'insurance', 12000.00, '2026-01-10', 'Annual zero depreciation insurance package renewal');

-- =========================================================================
-- 7. SEED SERVICE CENTERS
-- =========================================================================
INSERT INTO service_centers (id, name, address, city, phone, email, opening_hours, services, rating) VALUES 
(1, 'A1 Motors Honda Garage', '124 Auto Hub, Sector 2', 'Bengaluru', '+91 99001 22334', 'info@a1motors.com', '09:00 AM - 07:00 PM', 'Two wheelers general tuneup, parts changes, washing, engine checks', 4.8),
(2, 'SafeRide Multi-brand Service Station', '88 Ring Road, Indira Nagar', 'Bengaluru', '+91 98888 77777', 'support@saferide.in', '08:30 AM - 08:00 PM', 'Four wheelers alignment, brake care, battery swap, body work', 4.5),
(3, 'City Auto Spares & Garage', '412 Main Street, Koramangala', 'Bengaluru', '+91 97775 55666', 'koramangala@cityauto.com', '10:00 AM - 06:30 PM', 'Engine repairs, AC recovery service, wiring diagnostics', 4.2);

-- =========================================================================
-- 8. SEED AI ANALYSES
-- =========================================================================
INSERT INTO ai_analyses (id, user_id, vehicle_id, query_text, response_category, response_causes, response_severity, response_action, response_warning, raw_response) VALUES 
(1, 1, 1, 'grinding sound from front wheel when braking', 'Brake Care & Repair', 'Worn out brake pads, loose caliper bolts, warped brake rotors', 'High', 'Get the front brake calipers and pad thickness inspected immediately.', 'Avoid high speeds or mountain driving until brake system checks are complete to prevent sudden braking losses.', '{"category": "Brake Care & Repair", "causes": ["Worn out brake pads", "Loose caliper bolts", "Warped brake rotors"], "severity": "High", "recommendedAction": "Get the front brake calipers and pad thickness inspected immediately.", "safetyWarning": "Avoid high speeds or mountain driving until brake system checks are complete to prevent sudden braking losses."}');
