const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_username', // Replace with your database username
    password: 'your_password', // Replace with your database password
    database: 'your_database' // Replace with your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
});

app.get('/produtos', (req, res) => {
    const sql = 'SELECT * FROM produtos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).send('Error fetching data');
        }
        res.json(results);
    });
});

// Endpoint to handle order submission
app.post('/submit_order', (req, res) => {
    const { flavor, quantity } = req.body;

    const sql = 'UPDATE produtos SET estoque_atual = estoque_atual - ? WHERE nome = ? AND estoque_atual >= ?';
    db.query(sql, [quantity, flavor, quantity], (err, result) => {
        if (err) {
            console.error('Error updating stock:', err);
            return res.status(500).send('Error updating stock');
        }
        if (result.affectedRows === 0) {
            return res.status(400).send('Not enough stock available');
        }
        res.status(200).send('Order placed successfully');
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
