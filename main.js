import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { establishConnection } from './connection.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the HTML file
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle POST request
app.post('/submit', async (req, res) => {
  const { password, totp } = req.body;

  try {
    // Call the function from connection.js and await its result
    const result = await establishConnection(password, totp);

    // Send the result as a response
    res.json(result);
  } catch (error) {
    // Handle any errors that occur during the call
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
