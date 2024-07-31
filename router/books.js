const express = require('express')
const router = express.Router()
const db = require('./../services/database')

router

.get('/', (_, res) => {
    const sql = 'SELECT * FROM livres'
    db.query(sql, (err, results) => {
        if (err) throw err
        res.json(results)
    })
})

.post('/', (req, res) => {
    const { title, author, date_publication, isbn, description, status, cover } = req.body
    const sql = 'INSERT INTO livres (titre, auteur, date_publication, isbn, description, statut, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    db.query(sql, [title, author, date_publication, isbn, description, status || "disponible", cover], (err) => {
        if (err) res.staus(400).send("Erreur d'envoi")
        res.send('Livre ajouté')
    })
})

.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM livres WHERE id = ?'
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err
        res.json(result)
    })
})

.put('/:id', (req, res) => {
    const { title, author, published_date, isbn, description, status, photo_url } = req.body
    const sql = 'UPDATE livres SET titre = ?, auteur = ?, date_publication = ?, isbn = ?, description = ?, statut = ?, photo_url = ? WHERE id = ?'
    db.query(sql, [title, author, published_date, isbn, description, status, photo_url, req.params.id], (err, result) => {
        if (err) throw err
        res.send('Livre mis à jour')
    })
})

.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM livres WHERE id = ?'
    db.query(sql, [req.params.id], (err) => {
        if (err) throw err
        res.send('Livre supprimé')
    })
})

.post('/borrow', (req, res) => {
    const { bookId, userId } = req.body

    // Vérifier que le livre existe et est disponible
    const checkBookSql = 'SELECT * FROM livres WHERE id = ? AND statut = "disponible"'
    db.query(checkBookSql, [bookId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification du livre:', err)
            return res.status(500).json({ message: 'Erreur du serveur. Veuillez réessayer.' })
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Livre non disponible ou n\'existe pas.' })
        }

        // Enregistrer l'emprunt dans la table `emprunts`
        const now = new Date();
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + 14); // Date de retour prévue dans 2 semaines

        const insertLoanSql = 'INSERT INTO emprunts (id_livre, date_emprunt, date_retour_prevue) VALUES (?, ?, ?)'
        db.query(insertLoanSql, [bookId, now.toISOString().split('T')[0], dueDate.toISOString().split('T')[0]], (err) => {
            if (err) {
                console.error('Erreur lors de l\'enregistrement de l\'emprunt:', err);
                return res.status(500).json({ message: 'Erreur du serveur. Veuillez réessayer.' })
            }

            // Mettre à jour le statut du livre
            const updateBookSql = 'UPDATE livres SET statut = "Emprunté" WHERE id = ?';
            db.query(updateBookSql, [bookId], (err) => {
                if (err) {
                    console.error('Erreur lors de la mise à jour du livre:', err)
                    return res.status(500).json({ message: 'Erreur du serveur. Veuillez réessayer.' })
                }
                res.status(200).json({ message: 'Livre emprunté avec succès.' })
            })
        })
    })
})

module.exports = router