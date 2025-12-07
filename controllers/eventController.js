const pool = require('../db');

const createEvent = async (req, res) => {
    const { title, description, event_date, venue_id, category_id, image_url } = req.body;
    const creator_id = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const eventRes = await client.query(
            'INSERT INTO events (title, description, event_date, creator_id, venue_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [title, description, event_date, creator_id, venue_id, image_url]
        );
        const newEventId = eventRes.rows[0].id;

        if (category_id) {
            await client.query(
                'INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)',
                [newEventId, category_id]
            );
        }
        await client.query('COMMIT');
        res.status(201).json({ msg: "Event created", eventId: newEventId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
};

const getAllEvents = async (req, res) => {
    try {
        const query = `
            SELECT e.*, 
                   v.name as venue_name, v.city, 
                   c.name as category_name 
            FROM events e 
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN event_categories ec ON e.id = ec.event_id
            LEFT JOIN categories c ON ec.category_id = c.id
            ORDER BY e.event_date ASC
        `;
        const result = await pool.query(query);
        const uniqueEvents = [];
        const map = new Map();
        for (const item of result.rows) {
            if(!map.has(item.id)){
                map.set(item.id, true);
                uniqueEvents.push(item);
            }
        }

        res.json(uniqueEvents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Помилка сервера: " + err.message });
    }
};

const getEventById = async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ msg: "Invalid ID format" });
    }

    try {
        const query = `
            SELECT e.*,
                   v.name as venue_name, v.city, v.address,
                   u.username as creator_name
            FROM events e
                     LEFT JOIN venues v ON e.venue_id = v.id
                     LEFT JOIN users u ON e.creator_id = u.id
            WHERE e.id = $1
        `;
        const event = await pool.query(query, [id]);

        if (event.rows.length === 0) {
            return res.status(404).json({ msg: "Event not found" });
        }
        res.json(event.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, venue_id } = req.body;

    try {
        const updateEvent = await pool.query(
            'UPDATE events SET title = $1, description = $2, event_date = $3, venue_id = $4 WHERE id = $5 RETURNING *',
            [title, description, event_date, venue_id, id]
        );

        if (updateEvent.rows.length === 0) {
            return res.status(404).json({ msg: "Event not found" });
        }

        res.json({ msg: "Event updated", event: updateEvent.rows[0] });
    } catch (err) {
        console.error(err.message);
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteEvent = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);

        if (deleteEvent.rows.length === 0) {
            return res.status(404).json({ msg: "Event not found" });
        }

        res.json({ msg: "Event deleted" });
    } catch (err) {
        console.error(err.message);
    }
};

const getFormData = async (req, res) => {
    try {
        const venues = await pool.query('SELECT id, name, city FROM venues ORDER BY name');
        const categories = await pool.query('SELECT id, name FROM categories ORDER BY name');

        res.json({
            venues: venues.rows,
            categories: categories.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const createVenue = async (req, res) => {
    const { name, address, city, lat, lng } = req.body;
    try {
        const newVenue = await pool.query(
            'INSERT INTO venues (name, address, city) VALUES ($1, $2, $3) RETURNING *',
            [name, address, city]
        );
        res.status(201).json(newVenue.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getFormData, createVenue};

