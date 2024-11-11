const express = require('express');
const ejs = require('ejs');
const db = require('./database');
const router = express.Router();

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
            SELECT * FROM items
            ORDER BY rentals.rental_date ASC
        `,(err, results) => {
            if (err) {
 
                console.log(err);
                return;
            }
 
            
            
 
            // Az összes kölcsönzés dátumát formázni
            results.forEach(item => {
                item.title = item.title
                if(item.available == 1){
                    item.available = 'elérhető'
                }else{
                    item.available = 'nem elérhető'
                }
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
    req.session.userID = null;
    req.session.userName = null;
    req.session.userEmail = null;
    req.session.userRole = null;
    req.session.msg = 'You are logged out!';
    req.session.severity = 'info';
    res.redirect('/');
});

module.exports = router;
