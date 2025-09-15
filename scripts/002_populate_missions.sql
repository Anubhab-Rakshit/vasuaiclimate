-- Populate missions table with real climate missions
INSERT INTO missions (title, description, category, difficulty, points, duration_days) VALUES
-- Energy missions
('Switch to LED Bulbs', 'Replace 5 incandescent bulbs with LED bulbs in your home', 'energy', 'easy', 50, 1),
('Unplug Electronics', 'Unplug all electronics when not in use for a week', 'energy', 'easy', 30, 7),
('Use Natural Light', 'Avoid artificial lighting during daylight hours for 3 days', 'energy', 'easy', 40, 3),
('Energy Audit', 'Conduct a home energy audit and identify 3 improvement areas', 'energy', 'medium', 100, 1),
('Smart Thermostat', 'Install and configure a programmable thermostat', 'energy', 'medium', 150, 1),
('Solar Panel Research', 'Research and get quotes for solar panel installation', 'energy', 'hard', 200, 7),
('Energy Star Appliances', 'Replace one major appliance with Energy Star certified model', 'energy', 'hard', 300, 1),

-- Transport missions
('Walk or Bike', 'Use walking or biking instead of driving for trips under 2 miles', 'transport', 'easy', 40, 1),
('Public Transport Day', 'Use only public transportation for all trips today', 'transport', 'easy', 60, 1),
('Carpool Week', 'Organize carpooling for work commute for one week', 'transport', 'medium', 120, 7),
('Car-Free Weekend', 'Complete a full weekend without using a personal vehicle', 'transport', 'medium', 100, 2),
('Bike to Work', 'Bike to work for 5 consecutive days', 'transport', 'medium', 150, 5),
('Electric Vehicle Test', 'Test drive an electric vehicle and research purchase options', 'transport', 'hard', 200, 1),
('Carbon Offset Flight', 'Calculate and purchase carbon offsets for your next flight', 'transport', 'hard', 250, 1),

-- Waste missions
('Zero Waste Day', 'Produce zero landfill waste for an entire day', 'waste', 'medium', 80, 1),
('Plastic-Free Week', 'Avoid single-use plastics for one week', 'waste', 'medium', 120, 7),
('Composting Setup', 'Set up a home composting system', 'waste', 'easy', 70, 1),
('Recycling Audit', 'Audit your recycling habits and improve sorting accuracy', 'waste', 'easy', 50, 1),
('Upcycling Project', 'Complete an upcycling project using household waste', 'waste', 'medium', 90, 3),
('E-Waste Collection', 'Properly dispose of electronic waste at certified facility', 'waste', 'easy', 60, 1),
('Repair Instead of Replace', 'Repair 3 items instead of throwing them away', 'waste', 'medium', 100, 7),

-- Water missions
('5-Minute Showers', 'Take showers under 5 minutes for one week', 'water', 'easy', 60, 7),
('Fix Water Leaks', 'Identify and fix all water leaks in your home', 'water', 'medium', 100, 1),
('Rain Water Collection', 'Set up a rain water collection system', 'water', 'medium', 120, 1),
('Low-Flow Fixtures', 'Install low-flow showerheads and faucet aerators', 'water', 'medium', 80, 1),
('Native Plant Garden', 'Plant drought-resistant native plants in your garden', 'water', 'hard', 200, 1),
('Greywater System', 'Research and plan a greywater recycling system', 'water', 'hard', 250, 7),
('Water Usage Tracking', 'Track daily water usage for two weeks', 'water', 'easy', 40, 14),

-- Food missions
('Meatless Monday', 'Eat vegetarian meals every Monday for a month', 'food', 'easy', 80, 30),
('Local Food Week', 'Buy only locally sourced food for one week', 'food', 'medium', 100, 7),
('Food Waste Reduction', 'Reduce food waste by 50% for two weeks', 'food', 'medium', 120, 14),
('Grow Your Own', 'Start growing herbs or vegetables at home', 'food', 'easy', 70, 1),
('Meal Planning', 'Plan all meals for a week to reduce waste', 'food', 'easy', 50, 7),
('Plant-Based Day', 'Eat only plant-based foods for 3 consecutive days', 'food', 'medium', 90, 3),
('Community Garden', 'Join or start a community garden project', 'food', 'hard', 200, 1),
('Seasonal Eating', 'Eat only seasonal produce for two weeks', 'food', 'medium', 110, 14),

-- Bonus challenge missions
('Eco-Friendly Cleaning', 'Make and use homemade eco-friendly cleaning products', 'waste', 'medium', 80, 7),
('Digital Detox', 'Reduce screen time by 50% to save energy for 3 days', 'energy', 'medium', 70, 3),
('Green Gift Giving', 'Give only sustainable, eco-friendly gifts this month', 'waste', 'easy', 60, 30),
('Environmental Education', 'Teach 3 people about climate action this week', 'energy', 'easy', 90, 7),
('Carbon Footprint Calculator', 'Calculate your annual carbon footprint and create reduction plan', 'energy', 'medium', 100, 1),
('Eco-Challenge Friend', 'Recruit a friend to join you in climate action challenges', 'energy', 'easy', 80, 1);
