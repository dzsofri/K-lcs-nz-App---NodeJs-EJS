const express = require('express');
const ejs = require('ejs');
const db = require('./database');
const router = express.Router();
const moment = require('moment');

// CORE routes



// Kezdőlap betöltése
router.get('/', (req, res) => {

    
    ejs.renderFile('./views/index.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }   
        req.session.msg = '';
        res.send(html);
    });
});
// Módosítás oldal betöltése (GET kérés)
router.get('/edit/:id', (req, res) => {
    const itemId = req.params.id;  // Az 'id' paraméter lekérése

    // Az 'id' alapján lekérjük a terméket az adatbázisból
    db.query('SELECT * FROM items WHERE item_id = ?', [itemId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Hiba történt a termék lekérésekor');
        }
    })
});



router.get('/admin', (req, res) => {
    // Ellenőrzés, hogy a felhasználó be van-e jelentkezve
    if (req.session.isLoggedIn)  {
        // Felhasználói adatok lekérdezése
        db.query('SELECT user_id, username, email, role, registration_date FROM users', 
         (err, results) => {

        // Ellenőrizd, hogy találtunk-e ilyen terméket
        if (result.length === 0) {
            return res.status(404).send('A termék nem található');
        }

        // Ha a termék megtalálható, rendeljük hozzá a termék adatait a sablonhoz
        ejs.renderFile('./views/edit-item.ejs', {
            session: req.session,
            item: result[0]  // A termék adatainak átadása az EJS sablonnak
        }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            req.session.msg = '';
            res.send(html);  // Az EJS sablon elküldése válaszként
        });   
    });
}
});
    

router.get('/statistics', (req, res) => {
    if (req.session.isLoggedIn) {
        // SQL lekérdezések a legnépszerűbb felhasználók és tárgyak lekéréséhez
        const userStatsQuery = `
            SELECT users.name, COUNT(rentals.rental_id) AS rental_count
            FROM users
            LEFT JOIN rentals ON users.user_id = rentals.user_id
            GROUP BY users.user_id
            ORDER BY rental_count DESC
            LIMIT 10;
        `;

        const itemStatsQuery = `
            SELECT items.title, COUNT(rentals.rental_id) AS rental_count
            FROM items
            LEFT JOIN rentals ON items.item_id = rentals.item_id
            GROUP BY items.item_id
            ORDER BY rental_count DESC
            LIMIT 10;
        `;

        // Párhuzamos adatbázis lekérdezések
        Promise.all([
            new Promise((resolve, reject) => {
                db.query(userStatsQuery, (err, users) => {
                    if (err) return reject(err);
                    resolve(users); // Felhasználói statisztikák
                });
            }),
            new Promise((resolve, reject) => {
                db.query(itemStatsQuery, (err, items) => {
                    if (err) return reject(err);
                    resolve(items); // Tárgy statisztikák
                });
            })
        ])
        .then(([userStats, itemStats]) => {
            // EJS sablon renderelése a statisztikák megjelenítéséhez
            ejs.renderFile('./views/userstatics.ejs', {
                session: req.session,
                userStats,  // A legaktívabb felhasználók
                itemStats   // A legnépszerűbb tárgyak
            }, (err, html) => {

                if (err) {
                    console.error(err);
                    return res.status(500).send('Hiba történt a statisztikák megjelenítésekor');
                }
                res.send(html); // EJS sablon renderelése
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Hiba történt az adatok lekérdezésekor');
        });
    } else {
        res.redirect('/'); // Ha nincs bejelentkezve, irányítás a főoldalra
    }
});

router.get('/admin', (req, res) => {
    if (req.session.isLoggedIn) {
        const userQuery = `SELECT * FROM users`;
        const rentalQuery = `
            SELECT rentals.*, users.name AS user_name, items.title AS item_title
            FROM rentals
            JOIN users ON rentals.user_id = users.user_id
            JOIN items ON rentals.item_id = items.item_id
        `;
        const itemsQuery = `SELECT * FROM items`;

        // Az adatbázisból történő adatlekérdezés párhuzamosan történik
        Promise.all([
            new Promise((resolve, reject) => {
                db.query(userQuery, (err, users) => {
                    if (err) return reject(err);
                    // A tagsági dátum formázása
                    users.forEach(user => {
                        user.membership_date = moment(user.membership_date).format("YYYY-MM-DD");
                    });
                    resolve(users);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(rentalQuery, (err, rentals) => {
                    if (err) return reject(err);
                   
                    rentals.forEach(rental => {
                        rental.rental_date = moment(rental.rental_date).format("YYYY-MM-DD");
                        
                       
                        if (!rental.return_date) {
                            rental.return_date = "Nem elérhető"; 
                        } else {
                            rental.return_date = moment(rental.return_date).format("YYYY-MM-DD");
                        }
                    });
                    resolve(rentals);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(itemsQuery, (err, items) => {
                    if (err) return reject(err);
                    // Az elérhetőség formázása
                    items.forEach(item => {
                        item.available = item.available === 1 ? "Elérhető" : "Nem elérhető";
                    });
                    resolve(items);
                });
            })
        ])
        .then(([users, rentals, items]) => {
            // Az adatok átadása az EJS sablonhoz
            ejs.renderFile('./views/admin.ejs', { 
                session: req.session, 
                users, 
                rentals,
                items 
            }, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Hiba történt az admin oldal megjelenítésekor');
                }
                req.session.msg = ''; // Üzenet törlése
                res.send(html); // Az EJS sablon renderelése és visszaküldése
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Hiba történt az adatok lekérdezésekor');
        });
    } else {
        res.redirect('/'); // Ha nincs bejelentkezve, irányítás a főoldalra
    }
});


// Regisztrációs oldal betöltése
router.get('/reg', (req, res) => {
    ejs.renderFile('./views/regist.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }
        req.session.msg = '';
        res.send(html);
    });
});


// Kölcsönző oldal betöltése
router.get('/kolcsonzo', (req, res) => {
    if (req.session.isLoggedIn) {
        db.query(`
            SELECT * FROM items WHERE available = 1`,(err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            // Az összes kölcsönzés dátumát formázni
            results.forEach(item => {
                item.title = item.title
                    item.available = 'elérhető'
                    item.item_id = item.item_id
            });
 
            // EJS sablon renderelése
            ejs.renderFile('./views/kolcsonzo.ejs', { session: req.session, results }, (err, html) => {
                if (err) {
                    console.log(err);
                    return;
                }
                // Üzenet törlése
                req.session.msg = '';
                res.send(html);
            });
        });
        return;
    }
    // Ha a felhasználó nincs bejelentkezve, átirányítjuk a főoldalra
    res.redirect('/');
});

// Saját kölcsönzés lekérése
router.get('/own', (req, res) => {

    if (req.session.isLoggedIn) {

        // SQL lekérdezés a saját kölcsönzésekhez, felhasználó nevével és tárgy nevével
        db.query(`
            SELECT rentals.*, users.name AS user_name, items.title AS item_title
            FROM rentals
            JOIN users ON rentals.user_id = users.user_id
            JOIN items ON rentals.item_id = items.item_id
            WHERE rentals.user_id = ?
            
        `, [req.session.userID], (err, results) => {
            if (err) {

                console.log(err);
                return;
            }
console.log('User ID:', req.session.userID);

            // Ellenőrizd, hogy a 'results' tartalmaz adatokat
            console.log(results); // Ez segít megérteni, hogy miért nem jelennek meg az adatok

            // Az összes kölcsönzés dátumát formázni
            results.forEach(item => {
                item.rental_id = item.rental_id;
                item.rental_date = moment(item.rental_date).format('YYYY.MM.DD.');
                if (item.return_date) {
                    item.return_date = moment(item.return_date).format('YYYY.MM.DD.');
                }
            });

            // EJS sablon renderelése
            ejs.renderFile('./views/sajatkolcsonzo.ejs', { session: req.session, results }, (err, html) => {
                if (err) {
                    console.log(err);
                    return;
                }

                // Üzenet törlése
                req.session.msg = '';
                res.send(html);
            });
        });

        return;
    }

    // Ha a felhasználó nincs bejelentkezve, átirányítjuk a főoldalra
    res.redirect('/');
});






/*

// Új adat bevitele
router.get('/newdata', (req, res) => {
    if (req.session.isLoggedIn) {
        ejs.renderFile('./views/kolcsonzo.ejs', { session: req.session }, (err, html) => {
            if (err) {
                console.log(err);
                return;
            }
            req.session.msg = '';
            res.send(html);
        });
        return;
    }
    res.redirect('/');
});
*/


// Kijelentkezés
router.get('/logout', (req, res) => {
    req.session.isLoggedIn = false;
    req.session.isAdmin = false;
    req.session.userID = null;
    req.session.userName = null;
    req.session.userEmail = null;
    req.session.userRole = null;
    req.session.msg = 'You are logged out!';
    req.session.severity = 'info';
    res.redirect('/');
});

module.exports = router;
