const express = require('express');
const router = express.Router();
const db = require('./database');



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

                // Assuming rentals table has a reference to the item in item_id
                db.query(`
                    UPDATE items 
                    SET available = 1  -- Set available to true (or 1, depending on your schema)
                    WHERE item_id = (
                        SELECT item_id FROM rentals WHERE rental_id = ?
                    )`, [rentalId], (err, results) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send('Error updating item availability');
                        }

                        // After the updates, send a success response
                        res.send('Item returned and marked as available!');
                    });
            });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
});


module.exports = router;
