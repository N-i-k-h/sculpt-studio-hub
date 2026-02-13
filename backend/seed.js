const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const Package = require('./models/Package');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Member.deleteMany({});
        await Trainer.deleteMany({});
        await Package.deleteMany({});
        await Transaction.deleteMany({});

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('admin', salt);
        await User.create({
            email: 'admin@gym.com',
            password,
            role: 'admin'
        });
        console.log('Admin User Seeded');

        // Create Packages
        const packages = await Package.insertMany([
            { name: 'Basic', price: 1000, duration: 30 },
            { name: 'Standard', price: 2500, duration: 90 },
            { name: 'Premium', price: 5000, duration: 180 },
        ]);

        console.log('Packages Seeded');

        // Create Trainers
        const trainers = await Trainer.insertMany([
            { name: 'John Doe', phone: '1234567890', specialty: 'Cardio', salary: 20000 },
            { name: 'Jane Smith', phone: '0987654321', specialty: 'Strength', salary: 25000 },
        ]);

        console.log('Trainers Seeded');

        // Create Members
        const members = await Member.insertMany([
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '1112223333',
                packageId: packages[0]._id.toString(),
                dateOfJoining: new Date().toISOString().split('T')[0],
                expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                amountPaid: 500,
                gender: 'Female'
            },
            {
                name: 'Bob Brown',
                email: 'bob@example.com',
                phone: '4445556666',
                packageId: packages[1]._id.toString(),
                dateOfJoining: new Date().toISOString().split('T')[0],
                expiryDate: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString().split('T')[0],
                amountPaid: 2500,
                gender: 'Male'
            }
        ]);

        console.log('Members Seeded');

        // Create Transactions
        await Transaction.insertMany([
            {
                memberId: members[0]._id.toString(),
                memberName: members[0].name,
                packageName: packages[0].name,
                totalPrice: packages[0].price,
                amountPaid: 500,
                dueAmount: 500,
                date: new Date().toISOString().split('T')[0]
            },
            {
                memberId: members[1]._id.toString(),
                memberName: members[1].name,
                packageName: packages[1].name,
                totalPrice: packages[1].price,
                amountPaid: 2500,
                dueAmount: 0,
                date: new Date().toISOString().split('T')[0]
            }
        ]);

        console.log('Transactions Seeded');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
