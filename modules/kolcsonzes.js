const express = require('express');
const router = express.Router();
const db = require('./database');
const uuid = require('uuid');


// Example of route definition
router.post('/return/:id', async (req, res) => {
    const rentalId = req.params.id; // Capture the rental_id from the URL
    const currentDate = new Date(); // Get the current date

    try {
        // Assuming db is properly configured to query your database
        db.query(`
            UPDATE rentals  
            SET return_date = ?
            WHERE rental_id = ?`, 
            [currentDate, rentalId], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error updating the rental item');
                }

                // After the update, you can return a response or render a template
                res.send('Item returned successfully!');
            });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
});


router.post('/kolcsonzes/:id', async (req, res) => {
    const rentalId = req.params.id; // Capture the rental_id from the URL
    const currentDate = new Date(); // Get the current date

    try {
        // Assuming db is properly configured to query your database
        db.query(`
        INSERT INTO rentals (rental_id, user_id, item_id, rental_date) VALUES (?, ?, ?, ?)`, 
            [uuid.v4(), req.session.userID, rentalId, currentDate], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error updating the rental item');
                }

                // After the update, you can return a response or render a template
                res.send('Item rented successfully!');
            });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
});





module.exports = router;
