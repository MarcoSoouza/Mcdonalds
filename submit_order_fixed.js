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
const { flavor, quantity, customerName, contactInfo } = req.body; // Assuming these fields are added
    const insertQuery = 'INSERT INTO sabores_sorveteria (flavor, quantity) VALUES (?, ?)';
    const updateQuery = 'UPDATE sabores_sorveteria SET quantity = quantity - ? WHERE flavor = ? AND quantity >= ?';
    
    connection.query(updateQuery, [quantity, flavor, quantity], (error, results) => {
        if (error) {
            return res.status(500).send('Error updating stock');
        }
        if (results.affectedRows === 0) {
            return res.status(400).send('Not enough stock available');
        }
        connection.query(insertQuery, [flavor, quantity], (error, results) => {
            if (error) {
                return res.status(500).send('Error inserting order');
            }
            res.status(200).send('Order submitted successfully');
        });
    });
});

app.get('/latest_order', (req, res) => {
    // Here you would typically fetch the latest order from the database
    // For demonstration, I'm sending back a static response
    res.status(200).json({
        flavor: 'Chocolate', // Example data
        quantity: 2,
        customerName: 'John Doe',
        contactInfo: 'john.doe@example.com'
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
