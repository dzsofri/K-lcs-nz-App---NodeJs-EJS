const express = require('express');
const ejs = require('ejs');
const db = require('./database');
const router = express.Router();
const moment = require('moment');

// Kezdőlap betöltése
router.get('/', (req, res) => {
    ejs.renderFile('./views/index.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.error(err);
            return;
        }
        req.session.msg = '';
        res.send(html);
    });
});

// Módosítás oldal betöltése (GET kérés)
router.get('/edit/:id', (req, res) => {
    const itemId = req.params.id;

    db.query('SELECT * FROM items WHERE item_id = ?', [itemId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Hiba történt a termék lekérésekor');
        }

        if (result.length === 0) {
            return res.status(404).send('A termék nem található');
        }

        ejs.renderFile('./views/edit-item.ejs', {
            session: req.session,
            item: result[0]
        }, (err, html) => {
            if (err) {
                console.error(err);
                return;
            }
            req.session.msg = '';
            res.send(html);
        });
    });
});

// Admin oldal
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

        // Statisztikák lekérdezése
        const userStatsQuery = `
            SELECT users.name, COUNT(rentals.rental_id) AS rental_count
            FROM users
            LEFT JOIN rentals ON users.user_id = rentals.user_id
            GROUP BY users.user_id
            ORDER BY rental_count DESC
            LIMIT 3;
        `;

        const itemStatsQuery = `
            SELECT items.title, COUNT(rentals.rental_id) AS rental_count
            FROM items
            LEFT JOIN rentals ON items.item_id = rentals.item_id
            GROUP BY items.item_id
            ORDER BY rental_count DESC
            LIMIT 3;
        `;

        Promise.all([
            // Felhasználók lekérdezése
            new Promise((resolve, reject) => {
                db.query(userQuery, (err, users) => {
                    if (err) return reject(err);
                    users.forEach(user => {
                        user.membership_date = moment(user.membership_date).format("YYYY-MM-DD");
                    });
                    resolve(users);
                });
            }),

            // Kölcsönzések lekérdezése
            new Promise((resolve, reject) => {
                db.query(rentalQuery, (err, rentals) => {
                    if (err) return reject(err);
                    rentals.forEach(rental => {
                        rental.rental_date = moment(rental.rental_date).format("YYYY-MM-DD");
                        rental.return_date = rental.return_date
                            ? moment(rental.return_date).format("YYYY-MM-DD")
                            : "Nem elérhető";
                    });
                    resolve(rentals);
                });
            }),

            // Tárgyak lekérdezése
            new Promise((resolve, reject) => {
                db.query(itemsQuery, (err, items) => {
                    if (err) return reject(err);
                    items.forEach(item => {
                        item.available = item.available === 1 ? "Elérhető" : "Nem elérhető";
                    });
                    resolve(items);
                });
            }),

            // Statisztikai adatok lekérdezése
            new Promise((resolve, reject) => {
                db.query(userStatsQuery, (err, userStats) => {
                    if (err) return reject(err);
                    resolve(userStats);
                });
            }),

            new Promise((resolve, reject) => {
                db.query(itemStatsQuery, (err, itemStats) => {
                    if (err) return reject(err);
                    resolve(itemStats);
                });
            })
            
        ])
        .then(([users, rentals, items, userStats, itemStats]) => {
            // A statisztikák átadása az admin oldal EJS template-jének
            ejs.renderFile('./views/admin.ejs', {
                session: req.session,
                users,
                rentals,
                items,
                userStats, // Felhasználói statisztikák
                itemStats  // Tárgyi statisztikák
            }, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Hiba történt az admin oldal megjelenítésekor');
                }
                req.session.msg = '';
                res.send(html);
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Hiba történt az adatok lekérdezésekor');
        });
    } else {
        res.redirect('/');
    }
});


// Regisztrációs oldal betöltése
router.get('/reg', (req, res) => {
    ejs.renderFile('./views/regist.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.error(err);
            return;
        }
        req.session.msg = '';
        res.send(html);
    });
});

// Kölcsönző oldal betöltése
router.get('/kolcsonzo', (req, res) => {
    if (req.session.isLoggedIn) {
        // A type paraméter lekérése az URL query stringből
        const { type } = req.query;

        let query = `SELECT * FROM items WHERE available = 1`;
        let params = [];

        // Ha van típus, szűrjük a típus alapján
        if (type) {
            query += ` AND type = ?`;
            params.push(type);
        }

        // Lekérdezés az adatbázisból
        db.query(query, params, (err, results) => {
            if (err) {
                console.error(err);
                return;
            }

            // Eredmények feldolgozása
            results.forEach(item => {
                item.title = item.title;
                item.available = 'elérhető';
                item.item_id = item.item_id;
            });

            // EJS renderelése
            ejs.renderFile('./views/kolcsonzo.ejs', {
                session: req.session,
                results,
                type  // A kiválasztott típus átadása a sablonnak
            }, (err, html) => {
                if (err) {
                    console.error(err);
                    return;
                }
                req.session.msg = ''; // Üzenet törlése
                res.send(html); // A válasz elküldése
            });
        });
        return;
    }
    res.redirect('/'); // Ha nincs bejelentkezve a felhasználó, átirányítás a kezdőlapra
});

// Saját kölcsönzések megjelenítése
router.get('/own', (req, res) => {
    if (req.session.isLoggedIn) {
        db.query(`
            SELECT rentals.*, users.name AS user_name, items.title AS item_title
            FROM rentals
            JOIN users ON rentals.user_id = users.user_id
            JOIN items ON rentals.item_id = items.item_id
            WHERE rentals.user_id = ?
        `, [req.session.userID], (err, results) => {
            if (err) {
                console.error(err);
                return;
            }
            results.forEach(item => {
                item.rental_date = moment(item.rental_date).format('YYYY.MM.DD.');
                item.return_date = item.return_date
                    ? moment(item.return_date).format('YYYY.MM.DD.')
                    : "Nincs visszaadva";
            });

            ejs.renderFile('./views/sajatkolcsonzo.ejs', { session: req.session, results }, (err, html) => {
                if (err) {
                    console.error(err);
                    return;
                }
                req.session.msg = '';
                res.send(html);
            });
        });
        return;
    }
    res.redirect('/');
});

// Kijelentkezés
router.get('/logout', (req, res) => {
    req.session.isLoggedIn = false;
    req.session.isAdmin = false;
    req.session.userID = null;
    req.session.userName = null;
    req.session.userEmail = null;
    req.session.userRole = null;
    req.session.msg = 'Sikeres kijelentkezés!';
    req.session.severity = 'info';
    res.redirect('/');
});

module.exports = router;
