// Import Express module
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const app = express();

// Configure the region (ensure it's the region your DynamoDB is in)
AWS.config.update({ region: 'us-east-1' });

// Create a DynamoDB instance
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Define the port for the server to listen on
const port = 8080;

// enable cors
app.use(cors());

// parse JSON bodies in requests
app.use(express.json());

// A basic route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Book Management API!');
});

// Route to get all books
app.get('/books', (req, res) => {
  const params = {
    TableName: 'Books'
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.error('Error getting books:', err);
      res.status(500).json({ error: 'Could not retrieve books' });
    } else {
      res.json(data.Items);
    }
  });
});

// Route to add a new book
app.post('/books', (req, res) => {
  const { id, name, author, edition } = req.body;

  const params = {
    TableName: 'Books',
    Item: {
      id: id,
      name: name,
      author: author,
      edition: edition
    },
    ConditionExpression: 'attribute_not_exists(id) AND attribute_not_exists(name)'
  };

  dynamodb.put(params, (err) => {
    if (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        res.status(400).json({ error: 'Book with the same ID or name already exists.' });
      } else {
        console.error('Error adding book:', err);
        res.status(500).json({ error: 'Could not add book' });
      }
    } else {
      res.status(201).json({ message: 'Book added successfully', book: { id, name, author, edition } });
    }
  });
});

// Route to delete a book by ID
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: 'Books',
    Key: {
      id: id
    },
    ConditionExpression: 'attribute_exists(id)'
  };

  dynamodb.delete(params, (err) => {
    if (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        res.status(404).json({ error: 'Book not found' });
      } else {
        console.error('Error deleting book:', err);
        res.status(500).json({ error: 'Could not delete book' });
      }
    } else {
      res.json({ message: 'Book deleted successfully' });
    }
  });
});

// Route to search for a book by name
app.get('/books/search/:name', (req, res) => {
  const { name } = req.params;

  const params = {
    TableName: 'Books',
    FilterExpression: 'contains(#name, :name)',
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': name
    }
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.error('Error searching for book:', err);
      res.status(500).json({ error: 'Could not search for book' });
    } else if (data.Items.length === 0) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.json(data.Items[0]);
    }
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
