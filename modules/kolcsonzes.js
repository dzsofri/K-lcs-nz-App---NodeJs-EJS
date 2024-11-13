const express = require('express');
const router = express.Router();
const db = require('./database');
const uuid = require('uuid');


router.post('/return/:id', async (req, res) => {
    const rentalId = req.params.id; // Capture the rental_id from the URL
    const currentDate = new Date(); // Get the current date

    try {
        // Update the rentals table to set the return date
        db.query(`
            UPDATE rentals  
            SET return_date = ?
            WHERE rental_id = ?`, 
            [currentDate, rentalId], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error updating the rental item');
                }

                if (results.affectedRows === 0) {
                    // No rental found with the given rental_id
                    return res.status(404).send('Rental not found');
                }

                // Update the items table to mark the item as available
                db.query(`
                    UPDATE items 
                    SET available = 1  -- Set available to true (or 1, depending on your schema)
                    WHERE item_id = (
                        SELECT item_id FROM rentals WHERE rental_id = ?
                    )`, [rentalId], (err, results) => {
                        if (err) {
                            console.error(err);
                            req.session.msg = 'Error updating item availability';
                            req.session.severity = 'danger';
                            res.redirect('/own');
                            return;
                        }

                        if (results.affectedRows === 0) {
                            // No item found associated with the rental
                            req.session.msg = 'Item associated with rental not found';
                            req.session.severity = 'danger';
                            res.redirect('/own');
                            return;
                        }

                        // After successful updates, send a success response
                        req.session.msg = 'Item returned and marked as available!';
                        req.session.severity = 'success';
                        res.redirect('/own');
                        return;
                    });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});




router.post('/kolcsonzes/:id', async (req, res) => {
    const item_id = req.params.id; // Capture the item_id from the URL
    const currentDate = new Date(); // Get the current date

    try {
        // Insert a new record into the rentals table
        db.query(`
        INSERT INTO rentals (rental_id, user_id, item_id, rental_date) VALUES (?, ?, ?, ?)`, 
            [uuid.v4(), req.session.userID, item_id, currentDate], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error adding rental record');
                }

                // Update the availability of the item in the items table
                db.query(`
                    UPDATE items 
                    SET available = 0  
                    WHERE item_id = ?`, [item_id], (err, results) => {
                        if (err) {
                            req.session.msg = 'Error updating item availability';
                            req.session.severity = 'danger';
                            res.redirect('/kolcsonzo');
                            return;
                        }

                        req.session.msg = 'Item rented and marked as unavailable!';
                        req.session.severity = 'success';
                        res.redirect('/kolcsonzo');
                        return;
                    });
            });

    } catch (error) {
        console.log(error);
        return res.status(500).send('Server error');
    }
});


router.get('/kolcsonzo', (req, res) => {
    const { type } = req.query;  // Lekérjük a query paramétert (pl. ?type=film)

    let sql = 'SELECT * FROM items';  // Alap SQL lekérdezés
    const queryParams = [];

    // Ha van típus paraméter, akkor szűrünk
    if (type) {
        sql += ' WHERE type LIKE ?';  // A 'type' mező alapján szűrünk
        queryParams.push(`%${type}%`);  // A LIKE operátorral részleges egyezést keresünk
    }

    // Adatbázis lekérdezése
    db.query(sql, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Hiba történt az adatbázis lekérdezése közben');
        }

        // Rendereljük az oldalt a szűrt eredményekkel
        // Átadjuk a 'type' változót, hogy elérhető legyen az EJS-ben
        res.render('kolcsonzo', { results, type: type || '' });  // Ha nincs 'type', akkor üres stringet adunk
    });
});






module.exports = router;
