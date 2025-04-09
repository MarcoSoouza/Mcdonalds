const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow requests from the front-end
app.use(express.json()); // Middleware to parse JSON requests

// Database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'meu_banco'
});

// Connect to the database
db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Endpoint to submit an order
app.post('/submit_order', (req, res) => {
    const { flavor, quantity, customerName } = req.body;
    
    // Fetch the product price from the database
    db.query('SELECT preco FROM produtos WHERE nome = ?', [flavor], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const productPrice = results[0].preco;
            const totalPrice = productPrice * quantity;

            // Insert the new order into the database
            const query = 'INSERT INTO orders (flavor, quantity, customerName, totalPrice) VALUES (?, ?, ?, ?)';
            db.query(query, [flavor, quantity, customerName, totalPrice], (err, result) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'Order placed successfully!',
                    customerName: customerName,
                    totalPrice: totalPrice.toFixed(2), // Format to 2 decimal places
                    estimatedDeliveryTime: 'Your order will be delivered in approximately 30 minutes.' // Estimated delivery time
                });
            });
        } else {
            res.status(404).send('Product not found.');
        }
    });
});

// Endpoint to fetch all orders
app.get('/all_orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Endpoint to fetch the latest order
app.get('/latest_order', (req, res) => {
    db.query('SELECT * FROM orders ORDER BY id DESC LIMIT 1', (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('No orders found.');
        }
    });
});

// Endpoint to fetch products
app.get('/produtos', (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/todos', (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ message: 'Task is required.' });
    }
    db.query('INSERT INTO todos (task) VALUES (?)', [task], (err, result) => {
        if (err) throw err;
        res.status(201).json({ id: result.insertId, task, completed: false });
    });
});

app.get('/todos', (req, res) => {
    db.query('SELECT * FROM todos', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task, completed } = req.body;
    db.query('UPDATE todos SET task = ?, completed = ? WHERE id = ?', [task, completed, id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
            res.json({ id, task, completed });
        } else {
            res.status(404).send('Todo not found.');
        }
    });
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Todo not found.');
        }
    });
});
app.listen(3000, () => console.log('Server running on port 3000'));
