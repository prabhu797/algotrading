import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { establishConnection } from './src/connection.js';
import fs from 'fs';

dotenv.config();

//* .env file
//* API_KEY="your_api_key"
//* CUSTOMER_ID="your_customer_id"

const app = express();
const server = http.createServer(app);

const __dirname = path.resolve(); // Get the current directory

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory
// app.use('/', express.static(path.join(__dirname, 'src/public')));

//? APIs
// Serve index.html for the angel-login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Get the password and totp and establish connection
app.post('/submit', async (req, res) => {
    const { password, totp } = req.body;
    const result = await establishConnection(password, totp);
    res.json(result);
});

// Get the execution status
app.get('/is-execution-going-on', (req, res) => {
    const tokens = JSON.parse(fs.readFileSync('./src/tokens.json', 'utf-8'));
    const result = tokens.is_execution_going_on;
    res.json(result);
});

// Get the files
app.get('/files', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/files.html'));
});

// Get folders ending with _files
app.get('/get-folders', (req, res) => {
    const folders = fs.readdirSync(path.join(__dirname, 'src/files'))
        .filter(file => fs.statSync(path.join(__dirname, 'src/files', file)).isDirectory() && file.endsWith('_files'))
        .map(folder => folder.replace(/_files$/, '')); // Trim _files from folder name
    res.json(folders);
});

// Get files in a specific folder
app.get('/get-files', (req, res) => {
    const folder = req.query.folder;
    const files = fs.readdirSync(path.join(__dirname, 'src/files', `${folder}_files`))
        .filter(file => fs.statSync(path.join(__dirname, 'src/files', `${folder}_files`, file)).isFile());
    res.json(files);
});

// Download a specific file
app.get('/download-file', (req, res) => {
    const { folder, file } = req.query;
    const filePath = path.join(__dirname, 'src/files', `${folder}_files`, file);
    res.download(filePath); // Send file for download
});

// Start the server
const PORT = process.env.PORT || 5502;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
