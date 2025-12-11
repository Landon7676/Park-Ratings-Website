const express = require('express');
const path = require('path');
const pool = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Adam Said
// GET /api/parks - list parks with average rating and review count
app.get('/api/parks', async (req, res) => {
    try {
        const [parks] = await pool.query(`
SELECT p.*,
COALESCE(AVG(r.rating),0) AS avg_rating,
COUNT(r.id) AS reviews_count
FROM parks p
LEFT JOIN reviews r ON r.park_id = p.id
GROUP BY p.id
ORDER BY p.created_at DESC
`);
        res.json(parks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});
// Hassan Mazraani
// GET /api/parks/:id - get park details + reviews
app.get('/api/parks/:id', async (req, res) => {
    const parkId = req.params.id;
    try {
        const [parks] = await pool.query('SELECT * FROM parks WHERE id = ?', [parkId]);
        if (!parks.length) return res.status(404).json({ error: 'Park not found' });


        const park = parks[0];
        const [reviews] = await pool.query('SELECT * FROM reviews WHERE park_id = ? ORDER BY created_at DESC', [parkId]);
        res.json({ park, reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Adam Said
// POST /api/parks - add new park
app.post('/api/parks', async (req, res) => {
    const { name, city, description, imageURL } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result] = await pool.query('INSERT INTO parks (name, city, description, imageURL) VALUES (?, ?, ?, ?)', [name, city || null, description || null, imageURL || null]);
        const [rows] = await pool.query('SELECT * FROM parks WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});

// Hassan Mazraani
app.put('/api/parks/:id', async (req, res) => {
    const parkId = req.params.id;
    const { name, city, description, imageURL } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const [result] = await pool.query(
            'UPDATE parks SET name = ?, city = ?, description = ?, imageURL = ? WHERE id = ?',
            [name, city || null, description || null, imageURL || null, parkId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Park not found' });
        }
        const [rows] = await pool.query('SELECT * FROM parks WHERE id = ?', [parkId]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});



// Adam Said
// POST /api/parks/:id/reviews - add a review
app.post('/api/parks/:id/reviews', async (req, res) => {
    const parkId = req.params.id;
    const { author, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating (1-5) is required' });
    try {
        // ensure park exists
        const [parks] = await pool.query('SELECT id FROM parks WHERE id = ?', [parkId]);
        if (!parks.length) return res.status(404).json({ error: 'Park not found' });


        const [result] = await pool.query('INSERT INTO reviews (park_id, author, rating, comment) VALUES (?, ?, ?, ?)', [parkId, author || 'Anonymous', rating, comment || null]);
        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Hassan Mazraani
// optional: delete review
app.delete('/api/reviews/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Adam Said
app.delete('/api/parks/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await pool.query('DELETE FROM parks WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB error' });
    }
});


// Hassan Mazraani
// fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));