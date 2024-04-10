const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(cors());
app.use(bodyParser.json());

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

UserSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
    next();
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(500).send('Error creating user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Authentication failed');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(500).send('Login error');
    }
});

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = socketio(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => console.log('User disconnected'));
    socket.on('sendMessage', (msg) => io.emit('receiveMessage', msg));
});

// Add this near your other require statements
require('dotenv').config();

// Assuming you have dotenv installed and configured
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// Add a route to fetch weather information
app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        res.json({
            weather: data.weather[0].main,
            description: data.weather[0].description,
            temperature: data.main.temp,
            city: city
        });
    } catch (error) {
        console.error('OpenWeatherMap API Error:', error);
        res.status(500).json({ error: 'Failed to retrieve weather data' });
    }
});

// Yelp API Integration
app.get('/api/restaurants/:city', async (req, res) => {
    const city = req.params.city;
    const yelpApiKey = process.env.YELP_API_KEY; // Ensure you have YELP_API_KEY in your .env
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(city)}&categories=restaurants`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${yelpApiKey}` },
        });
        if (!response.ok) throw new Error('Failed to fetch Yelp data');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Yelp API Error:', error);
        res.status(500).json({ error: 'Failed to retrieve data from Yelp' });
    }
});

// Placeholder for MetaMask connectivity; actual implementation requires client-side interaction
app.get('/api/metamask/connect', (req, res) => {
    // This would be a client-side implementation; server sends a placeholder response
    res.json({ message: 'MetaMask connection initiated. Please handle connection client-side.' });
