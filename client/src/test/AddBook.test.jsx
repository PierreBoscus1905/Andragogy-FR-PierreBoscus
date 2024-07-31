import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AddBook from "../components/AddBook";
import { server, rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.post(`${process.env.VITE_BASE_API}api/books`, (req, res, ctx) => {
    const { title, author, date_publication, isbn, description, status, cover } = req.body;
    if (title && author && date_publication && isbn && description && status && cover) {
      return res(ctx.status(200), ctx.json({ message: 'Livre ajouté avec succès.' }));
    } else {
      return res(ctx.status(400), ctx.json({ message: 'Erreur d\'envoi.' }));
    }
  })
);

describe('AddBook Component', () => {
  beforeEach(() => {
    cleanup();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it('should render the AddBook component correctly', () => {
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );
    expect(screen.getByText('Ajouter un livre')).toBeInTheDocument();
  });

  it('should render the Add button', () => {
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );
    expect(screen.getByText('Ajouter')).toBeInTheDocument();
  });

  it('should render form with required labels', () => {
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );
    expect(screen.getByText('Titre:')).toBeInTheDocument();
    expect(screen.getByText('Auteur:')).toBeInTheDocument();
    expect(screen.getByText('Date de publication:')).toBeInTheDocument();
    expect(screen.getByText('ISBN:')).toBeInTheDocument();
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Statut:')).toBeInTheDocument();
    expect(screen.getByText('URL de la couverture:')).toBeInTheDocument();
  });

  it('should add a book successfully', async () => {
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Titre'), { target: { value: 'New Book' } });
    fireEvent.change(screen.getByPlaceholderText('Auteur'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByPlaceholderText('Date de publication'), { target: { value: '2024-02-02' } });
    fireEvent.change(screen.getByPlaceholderText('ISBN'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Description of the new book' } });
    fireEvent.change(screen.getByPlaceholderText('Statut'), { target: { value: 'disponible' } });
    fireEvent.change(screen.getByPlaceholderText('URL de la couverture'), { target: { value: 'http://example.com/newbook.jpg' } });

    // Submit the form
    fireEvent.click(screen.getByText('Ajouter'));

    // Verify success message
    expect(await screen.findByText('Livre ajouté avec succès.')).toBeInTheDocument();
  });

  it('should show error on invalid form submission', async () => {
    render(
      <BrowserRouter>
        <AddBook />
      </BrowserRouter>
    );

    // Submit the form with empty fields
    fireEvent.click(screen.getByText('Ajouter'));

    // Verify error message
    expect(await screen.findByText('Erreur d\'envoi.')).toBeInTheDocument();
  });
});
