const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    packageName: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    dueAmount: { type: Number, default: 0 },
    date: { type: String, required: true },
});

module.exports = mongoose.model('Transaction', transactionSchema);
