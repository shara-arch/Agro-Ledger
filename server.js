const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json()); // parse JSON request bodies

// File paths
const cropsFile = path.join(__dirname, 'data', 'crops.json');
const suppliesFile = path.join(__dirname, 'data', 'supplies.json');

// Helper functions
function loadData(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Crops API ---
app.post('/api/crops', (req, res) => {
  const data = loadData(cropsFile);
  const newCrop = { id: Date.now(), ...req.body };
  data.crops.push(newCrop);
  saveData(cropsFile, data);
  res.status(201).json(newCrop);
});

// --- Supplies API ---
app.post('/api/supplies', (req, res) => {
  const data = loadData(suppliesFile);
  const newSupply = { id: Date.now(), ...req.body };
  data.supplies.push(newSupply);
  saveData(suppliesFile, data);
  res.status(201).json(newSupply);
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));
