import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookList from "../components/BookList";
import { server, rest } from "msw";
import { setupServer } from "msw/node";

const mockBooks = [
  { id: 1, titre: 'Book 1', auteur: 'Author 1', date_publication: '2024-01-01', statut: 'disponible', photo_url: 'http://example.com/book1.jpg' },
  { id: 2, titre: 'Book 2', auteur: 'Author 2', date_publication: '2024-01-02', statut: 'disponible', photo_url: 'http://example.com/book2.jpg' }
];

// Mock server setup
const server = setupServer(
  rest.get(`${process.env.VITE_BASE_API}api/books`, (req, res, ctx) => {
    return res(ctx.json(mockBooks));
  }),
  rest.post(`${process.env.VITE_BASE_API}api/books/borrow`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Livre emprunté avec succès.' }));
  })
);

describe('BookList Component', () => {
  beforeEach(() => {
    cleanup();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it('should render the BookList component correctly', () => {
    render(
      <BrowserRouter>
        <BookList />
      </BrowserRouter>
    );
    expect(screen.getByText('Liste des Livres - Librairie XYZ')).toBeInTheDocument();
  });

  it('should render books and the borrow button', async () => {
    render(
      <BrowserRouter>
        <BookList />
      </BrowserRouter>
    );
    expect(await screen.findByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.getAllByText('Emprunter')).toHaveLength(2);
  });

  it('should display success message when borrowing a book', async () => {
    render(
      <BrowserRouter>
        <BookList />
      </BrowserRouter>
    );

    // Simulate borrowing a book
    fireEvent.click(screen.getAllByText('Emprunter')[0]);

    // Verify successful borrowing message
    expect(await screen.findByText('Livre emprunté avec succès.')).toBeInTheDocument();
  });
});
