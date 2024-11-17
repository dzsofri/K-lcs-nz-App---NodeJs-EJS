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


router.post('/delete/:id', (req, res) => {
    const itemId = req.params.id;
console.log(itemId)
    // Törlés SQL lekérdezés
    const deleteQuery = `DELETE FROM items WHERE item_id = ?`;

    db.query(deleteQuery, [itemId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Hiba történt a termék törlésekor');
        }

        // A törlés sikeres, átirányítás a termékek listájához
        res.redirect('/admin');
    });
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





// Új termék hozzáadása
router.post('/add', (req, res) => {
    const { item_name, type } = req.body;
    console.log(item_name, type)
    db.query(
        `INSERT INTO items (item_id, title, type, available) VALUES (?, ?, ?, ?)`,
        [uuid.v4(), item_name, type, 1],
        (err, result) => {
            if (err) {
                
                console.error(err);
                return res.status(500).send('Hiba történt a termék hozzáadása során');
            }
            res.redirect('/admin'); // Visszairányítás a CRUD oldalra sikeres hozzáadás után
        }
       
    );
   
});



router.get('/kolcsonzes', async (req, res) => {
    const { title, type } = req.query;
  
    // Alap SQL lekérdezés, amely lehetőséget ad a szűrésre
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];
  
    // Ha van cím, szűrj a címre
    if (title) {
      query += ' AND title LIKE ?';
      params.push(`%${title}%`);
    }
  
    // Ha van típus, szűrj a típusra
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
  
    try {
      // Az adatbázis lekérdezésének végrehajtása
      const results = await db.execute(query, params);
  
      // A válaszban visszaadjuk a találatokat és a keresési paramétereket
      res.render('kolcsonzes', { 
        results, 
        title,  // A cím szűrő paraméter
        type    // A típus szűrő paraméter
      });
    } catch (err) {
      console.error('Database query failed', err);
      res.status(500).send('Internal Server Error');
    }
  });


// Módosítás mentése (POST kérés)
router.post('/edit/:id', (req, res) => {
    const item_id = req.params.id; // Az ID lekérése a URL-ből
    const { item_name, type } = req.body; // Az új adatokat a formból

    db.query(`
        UPDATE items 
        SET title = ?, type = ? 
        WHERE item_id = ?`, 
        [item_name, type, item_id], 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Hiba történt a termék módosítása során');
            }
            res.redirect('/admin'); // Átirányítás a CRUD oldalra sikeres módosítás után
        }
    );
});

module.exports = router;
