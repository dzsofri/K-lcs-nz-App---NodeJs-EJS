const express = require('express');
const ejs = require('ejs');
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
router.get('/reg', (req, res) => {
    ejs.renderFile('./views/kolcsonzo.ejs', { session: req.session }, (err, html) => {
        if (err) {
            console.log(err);
            return;
        }
        req.session.msg = '';
        res.send(html);
    });
});



/*
// Új adat bevitele
router.get('/newdata', (req, res) => {
    if (req.session.isLoggedIn) {
        ejs.renderFile('./views/newdata.ejs', { session: req.session }, (err, html) => {
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
});*/



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
