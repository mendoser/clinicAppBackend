const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/clinical_data', {

});

// Define patient schema and model
const clinicalDataSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    type: String,
    value: String
});

const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    clinicalData: [clinicalDataSchema],
    criticalCondition: { type: Boolean, default: false }
});


const Patient = mongoose.model('Patient', patientSchema);

// Routes

// Step 1: Create a new patient
app.post('/patients', async (req, res) => {
    const newPatient = new Patient({
        name: req.body.name,
        age: req.body.age,
        clinicalData: [],  // Start with no clinical data
        criticalCondition: false
    });

    try {
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Step 2: Update clinical data for an existing patient
app.put('/patients/:id/clinical-data', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Add clinical data to patient
        patient.clinicalData.push(req.body);

        // Check if the patient should be marked as critical (convert value to number for comparison)
        if (req.body.type === 'Blood Pressure') {
            const systolicPressure = parseInt(req.body.value.split('/')[0], 10); // Convert to number
            if (systolicPressure > 140) {
                patient.criticalCondition = true;
            }
        }

        const updatedPatient = await patient.save();
        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Find patients in critical condition
app.get('/patients/critical', async (req, res) => {
    try {
        const criticalPatients = await Patient.find({ criticalCondition: true });
        res.json(criticalPatients);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Get a patient by ID
app.get('/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Start server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});