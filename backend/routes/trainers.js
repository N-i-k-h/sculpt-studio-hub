const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');

// Get all trainers
router.get('/', async (req, res) => {
    try {
        const trainers = await Trainer.find();
        res.json(trainers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add trainer
router.post('/', async (req, res) => {
    try {
        const { name, phone, specialty, salary } = req.body;
        const newTrainer = new Trainer({ name, phone, specialty, salary });
        const savedTrainer = await newTrainer.save();
        res.status(201).json(savedTrainer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete trainer
router.delete('/:id', async (req, res) => {
    try {
        await Trainer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trainer deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
