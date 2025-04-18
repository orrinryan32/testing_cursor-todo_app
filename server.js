const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('todos.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create todos table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API Routes
// Get all todos
app.get('/api/todos', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single todo
app.get('/api/todos/:id', (req, res) => {
    db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Create todo
app.post('/api/todos', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
    }
    
    db.run('INSERT INTO todos (title, description) VALUES (?, ?)',
        [title, description],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                title,
                description
            });
        }
    );
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
    const { title, description, status } = req.body;
    
    // Get the current todo first
    db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, todo) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!todo) {
            res.status(404).json({ error: "Todo not found" });
            return;
        }

        // Update with new values or keep existing ones
        const updatedTitle = title || todo.title;
        const updatedDescription = description || todo.description;
        const updatedStatus = status || todo.status;

        db.run(
            'UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ?',
            [updatedTitle, updatedDescription, updatedStatus, req.params.id],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({
                    id: req.params.id,
                    title: updatedTitle,
                    description: updatedDescription,
                    status: updatedStatus
                });
            }
        );
    });
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
    db.run('DELETE FROM todos WHERE id = ?', req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Todo deleted", id: req.params.id });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 