UPDATE badges SET points = 10, xp = 100, level = 1 WHERE difficulty = 'COMMON';
UPDATE badges SET points = 50, xp = 500, level = 2 WHERE difficulty = 'RARE';
UPDATE badges SET points = 100, xp = 1000, level = 3 WHERE difficulty = 'EPIC';
UPDATE badges SET points = 250, xp = 2500, level = 4 WHERE difficulty = 'LEGENDARY';
