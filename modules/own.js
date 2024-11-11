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
            ORDER BY rentals.rental_date ASC
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