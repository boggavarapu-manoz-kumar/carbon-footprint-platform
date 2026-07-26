-- Seed realistic goals matching Goal entity schema
INSERT INTO goals (user_id, name, description, goal_type, target_emission, start_date, target_date, status, progress_percent, created_at, updated_at)
SELECT 
    u.id, 
    'Reduce Electricity Usage', 
    'Switch to LED lights and turn off unused appliances to reduce household carbon footprint.', 
    'ELECTRICITY', 
    150.00,
    CURRENT_DATE(),
    DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY), 
    'IN_PROGRESS', 
    50.00,
    NOW(), 
    NOW()
FROM users u LIMIT 1;

INSERT INTO goals (user_id, name, description, goal_type, target_emission, start_date, target_date, status, progress_percent, created_at, updated_at)
SELECT 
    u.id, 
    'Commute via Public Transit', 
    'Take bus or train 4 days a week instead of solo driving.', 
    'TRANSPORT', 
    200.00,
    DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY),
    DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 
    'ACHIEVED', 
    100.00,
    NOW(), 
    NOW()
FROM users u LIMIT 1;

INSERT INTO goals (user_id, name, description, goal_type, target_emission, start_date, target_date, status, progress_percent, created_at, updated_at)
SELECT 
    u.id, 
    'Zero Food Waste Challenge', 
    'Compost all organic waste and plan weekly grocery meals effectively.', 
    'FOOD', 
    80.00,
    CURRENT_DATE(),
    DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY), 
    'IN_PROGRESS', 
    25.00,
    NOW(), 
    NOW()
FROM users u LIMIT 1;

INSERT INTO goals (user_id, name, description, goal_type, target_emission, start_date, target_date, status, progress_percent, created_at, updated_at)
SELECT 
    u.id, 
    'Solar Water Heater Installation', 
    'Transition home water heating to solar power.', 
    'TARGET_CARBON_VALUE', 
    300.00,
    DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY),
    DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 
    'FAILED', 
    0.00,
    NOW(), 
    NOW()
FROM users u LIMIT 1;
