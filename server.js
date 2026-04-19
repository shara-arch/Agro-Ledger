//  Serves static files and provides REST API for crops/supply
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require("cors");

const app = express();
app.use(express.json()); // parse JSON request bodies
app.use(cors());
//Serve Static files
app.use(express.static(path.join(__dirname)));

// File paths
const cropsFile = path.join(__dirname, 'data', 'crops.json');
const supplyFile = path.join(__dirname, 'data', 'supply.json');

// Helper functions
function loadData(file) {
  try{
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}catch(err){
  console.error(`[server.js]Failed to read ${file}:`, err.message);
  throw new Error ("Couldn't read data file.");
}}
function saveData(file, data) {
  try {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }catch(err){
  console.error(`[server.js] Failed to write ${file}:`, err.message);
  throw new Error('Could not write data file.');
}}

// --- Crops API ---
app.get('/api/crops', (req, res) => {
  const data = loadData(cropsFile);
  res.json(data);
});

app.post('/api/crops', (req, res) => {
  const data = loadData(cropsFile);
  const newCrop = { id: Date.now(), ...req.body };
  data.crops.push(newCrop);
  saveData(cropsFile, data);
  res.status(201).json(newCrop);
});

// --- Supply API ---
app.get('/api/supply', (req, res) => {
  const data = loadData(supplyFile);
  res.json(data);
});

app.post('/api/supply', (req, res) => {
  const data = loadData(supplyFile);
  const newSupply = { id: Date.now(), ...req.body };
  data.supply.push(newSupply);
  saveData(supplyFile, data);
  res.status(201).json(newSupply);
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));


// supplies