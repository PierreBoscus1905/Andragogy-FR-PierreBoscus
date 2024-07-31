import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/booklist.css';
const base = import.meta.env.VITE_BASE_API;

const BookList = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        fetch(base+'api/books', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => setBooks(data))
            .catch(error => console.error('Erreur:', error))
        fetch(base+'api/session', {
            credentials: 'include'
        })
            .then(response => {
                if(response.status === 200) return response.json()
                else throw new Error("Account not found")
            })
            .then(data => setUserRole(data.user.role || 'Guest'))
            .catch(error => setUserRole('Guest'))
    }, [])

    const handleBorrowBook = async (bookId) => {
        try {
            const response = await fetch(`${base}api/books/borrow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookId }),
                credentials: 'include'
            });

            if (response.status === 200) {
                setBooks(books.map(book =>
                    book.id === bookId ? { ...book, statut: 'emprunté' } : book
                ));
            } else {
                const data = await response.json();
                console.error('Erreur:', data.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleAddBook = () => {
        navigate('/add_book')
    }

    const handleHome = () => {
        navigate('/')
    }

    return (
        <div className="container">
            <h2>Liste des Livres - Librairie XYZ</h2>
            {books.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Date de publication</th>
                            <th>Statut</th>
                            <th>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id}>
                                <td><img className="book-image" src={book.photo_url} alt={book.titre} /></td>
                                <td>{book.titre}</td>
                                <td>{book.auteur}</td>
                                <td>{book.date_publication}</td>
                                <td>{book.statut}</td>
                                <td><a href={`${base}book/${book.id}`}>Voir les détails</a></td>
                                <td>
                                    {book.statut === 'disponible' && (
                                        <button onClick={() => handleBorrowBook(book.id)}>emprunter</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Erreur lors de la récupération des livres.</p>
            )}
            {userRole === 'admin' && (
                <button onClick={handleAddBook}>Ajouter un livre</button>
            )}
            <button onClick={handleHome}>Retour à l'accueil</button>
        </div>
    );
};

export default BookList