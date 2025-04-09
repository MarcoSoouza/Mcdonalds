const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2255',
    database: 'sabores_sorveteria'
});

// Endpoint to submit order
app.post('/submit_order', (req, res) => {
    const { flavor, quantity, customerName } = req.body; // Assuming these fields are added
    const insertQuery = 'INSERT INTO sabores_sorveteria (flavor, quantity, customerName) VALUES (?, ?, ?)';
    const updateQuery = 'UPDATE sabores_sorveteria SET quantity = quantity - ? WHERE flavor = ? AND quantity >= ?';
    
    connection.query(updateQuery, [quantity, flavor, quantity], (error, results) => {
        if (error) {
            return res.status(500).send('Error updating stock');
        }
        if (results.affectedRows === 0) {
            return res.status(400).send('Not enough stock available');
        }
        connection.query(insertQuery, [flavor, quantity, customerName], (error, results) => {
            if (error) {
                return res.status(500).send('Error inserting order');
            }
            res.status(200).send('Order submitted successfully');
        });
    });
});

// Endpoint to fetch available flavors
app.get('/produtos', (req, res) => {
    const sql = 'SELECT nome FROM produtos'; // Assuming 'nome' is the field for flavor name
    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching flavors');
        }
        res.json(results);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
