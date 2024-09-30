// Import Express module
const express = require('express');
const app = express();

// Define the port for the server to listen on
const port = 8080;

// Middleware to parse JSON bodies in requests
app.use(express.json());

// A basic route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Book Management API!');
});

// Sample book data (in-memory storage)
let books = [];

// Route to get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Route to add a new book
app.post('/books', (req, res) => {
  const { id, name, author, edition } = req.body;

  // Check if the book already exists by ID or Name
  const existingBook = books.find(book => book.id === id || book.name === name);
  if (existingBook) {
    return res.status(400).json({ error: 'Book with the same ID or name already exists.' });
  }

  // Add the new book to the books array
  books.push({ id, name, author, edition });
  res.status(201).json({ message: 'Book added successfully', book: { id, name, author, edition } });
});

// Route to delete a book by ID
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;

  // Find the book by ID
  const bookIndex = books.findIndex(book => book.id == id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Remove the book from the books array
  books.splice(bookIndex, 1);
  res.json({ message: 'Book deleted successfully' });
});

// Route to search for a book by name
app.get('/books/search/:name', (req, res) => {
  const { name } = req.params;

  // Find the book by name
  const book = books.find(book => book.name.toLowerCase() === name.toLowerCase());
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json(book);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});