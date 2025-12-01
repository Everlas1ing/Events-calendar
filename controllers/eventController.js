const pool = require('../db');

const createEvent = async (req, res) => {
    const { title, description, event_date, creator_id, venue_id } = req.body;

    try {
        const newEvent = await pool.query(
            'INSERT INTO events (title, description, event_date, creator_id, venue_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, event_date, creator_id, venue_id]
        );

        res.status(201).json(newEvent.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
};

const getAllEvents = async (req, res) => {
    try {
        console.log("1. Робимо запит до бази даних...");

        // Виконуємо запит
        const result = await pool.query('SELECT * FROM events');

        // ПЕРЕВІРКА: Давайте подивимось, що повернула база
        console.log("2. Результат від БД:", result);

        // Захист від помилки "undefined"
        if (!result) {
            throw new Error("База даних повернула null або undefined");
        }

        // Якщо немає властивості rows - створюємо порожній масив, щоб не було помилки
        const rows = result.rows || [];

        console.log(`3. Знайдено подій: ${rows.length}`);

        // Відправляємо дані на фронтенд
        res.json(rows);

    } catch (err) {
        console.error("!!! КРИТИЧНА ПОМИЛКА У КОНТРОЛЕРІ !!!");
        console.error(err); // Виведе повну помилку в термінал
        res.status(500).json({ error: "Помилка сервера: " + err.message });
    }
};

const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const event = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

        if (event.rows.length === 0) {
            return res.status(404).json({ msg: "Event not found" });
        }

        res.json(event.rows[0]);
    } catch (err) {
        console.error(err.message);
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

module.exports = {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent};