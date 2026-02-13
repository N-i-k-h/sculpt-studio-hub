const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String },
    packageId: { type: String }, // Can be ObjectId or string ID
    customPlan: { type: Boolean, default: false },
    customPrice: { type: Number, default: 0 },
    customDuration: { type: Number },
    dateOfJoining: { type: String }, // Store as YYYY-MM-DD or similar
    expiryDate: { type: String }, // Store as YYYY-MM-DD
    amountPaid: { type: Number, default: 0 }
});

module.exports = mongoose.model('Member', memberSchema);
