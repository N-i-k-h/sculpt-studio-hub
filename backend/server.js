const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // For development, allow all. For production, specify your frontend URL.
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Load Models
const initializeModels = async () => {
    // Models will be defined via require()
    require('./models/Member');
    require('./models/Trainer');
    require('./models/Transaction');
    require('./models/Package');
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/packages', require('./routes/packages'));

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        await initializeModels();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();
