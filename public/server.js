// server.js

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // body-parser to easily handle POST request data
const fs = require('fs'); // File system module to work with files

const app = express();
const port = 3000; // You can choose any port number

// Middleware to parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    // 1. Read user data from the request body
    const { email, password } = req.body;

    // 2. Basic input validation (you can add more robust validation)
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // 3. Read existing users from users.json file
    fs.readFile('users.json', 'utf8', (err, data) => {
        let users = []; // Initialize users array
        if (!err) {
            try {
                users = JSON.parse(data); // Parse existing user data if file exists and is valid JSON
            } catch (parseError) {
                console.error('Error parsing users.json:', parseError);
                return res.status(500).send('Error reading user data.'); // Respond with error if JSON parsing fails
            }
        } else if (err.code !== 'ENOENT') { // If error is not "File Not Found"
            console.error('Error reading users.json:', err);
            return res.status(500).send('Error reading user data.'); // Respond with error if file reading fails (other than file not found)
        }

        // 4. Check if user with the given email already exists
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            return res.status(409).send('User with this email already exists.'); // 409 Conflict status code
        }

        // 5. Create new user object with email, password, and timestamp
        const newUser = {
            email: email,
            password: password, // In a real application, you should hash the password!
            timestamp: new Date().toISOString()
        };

        // 6. Add the new user to the users array
        users.push(newUser);

        // 7. Write the updated users array back to users.json
        fs.writeFile('users.json', JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to users.json:', writeErr);
                return res.status(500).send('Signup failed: Could not save user data.'); // Respond with error if writing to file fails
            }

            // 8. Respond with success message
            res.status(201).send('Signup successful!'); // 201 Created status code
        });
    });
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    // 1. Read login credentials from the request body
    const { email, password } = req.body;

    // 2. Basic input validation
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // 3. Read users from users.json file
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send('Login failed: Could not read user data.'); // Respond with error if file reading fails
        }

        let users = [];
        try {
            users = JSON.parse(data); // Parse user data from JSON string
        } catch (parseError) {
            console.error('Error parsing users.json:', parseError);
            return res.status(500).send('Error reading user data.'); // Respond with error if JSON parsing fails
        }

        // 4. Find the user by email
        const user = users.find(user => user.email === email);

        // 5. Check if user exists and password is correct
        if (user && user.password === password) { // In real app, compare hashed passwords
            // 6. Respond with success message
            res.status(200).send('Login successful!'); // 200 OK status code
        } else {
            // 7. Respond with error message for invalid credentials
            res.status(401).send('Invalid email or password.'); // 401 Unauthorized status code
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
