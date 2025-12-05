-- schema.sql


CREATE TABLE IF NOT EXISTS parks (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
city VARCHAR(255),
description TEXT,
    imageURL VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS reviews (
id INT AUTO_INCREMENT PRIMARY KEY,
park_id INT NOT NULL,
author VARCHAR(255) DEFAULT 'Anonymous',
rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
comment TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE CASCADE
);


-- sample seed data
INSERT INTO parks (name, city, description, imageURL) VALUES
('Riverside Park','Detroit','A lovely riverside park with walking paths.', 'https://example.com/riverside-park.jpg'),
('Maple Grove Park','Ann Arbor','Playgrounds, picnic areas, and a small pond.', 'https://example.com/maple-grove-park.jpg');


INSERT INTO reviews (park_id, author, rating, comment) VALUES
(1,'Sam',5,'Amazing views and well-kept paths.'),
(2,'Alex',4,'Great for families, a bit crowded on weekends.');