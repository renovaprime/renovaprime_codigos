-- ============================================
-- Seed Permissions and Role Permissions
-- Run this SQL script in your MySQL database
-- ============================================

-- Insert all required permissions
INSERT IGNORE INTO permissions (code, description, created_at) VALUES
('admin.view_pending_doctors', 'View pending doctors', NOW()),
('admin.approve_doctor', 'Approve doctors', NOW()),
('admin.reject_doctor', 'Reject doctors', NOW()),
('admin.view_appointments', 'View all appointments', NOW()),
('admin.manage_specialties', 'Manage medical specialties', NOW()),
('prescription.emit', 'Emit prescriptions', NOW()),
('prescription.view', 'View prescriptions', NOW()),
('patient.view_appointments', 'View patient appointments', NOW()),
('doctor.schedule', 'Manage doctor schedule', NOW()),
('doctor.view_appointments', 'View doctor appointments', NOW()),
('appointment.create', 'Create appointments', NOW()),
('appointment.start', 'Start appointments', NOW()),
('appointment.finish', 'Finish appointments', NOW()),
('appointment.cancel', 'Cancel appointments', NOW());

-- Assign all permissions to admin role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- Show results
SELECT 'Permissions created:' as status;
SELECT * FROM permissions ORDER BY id;

SELECT 'Admin role permissions:' as status;
SELECT p.code, p.description 
FROM permissions p
INNER JOIN role_permissions rp ON p.id = rp.permission_id
INNER JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'admin'
ORDER BY p.code;
