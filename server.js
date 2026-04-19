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
//delete crop by id
app.delete('/api/crops/:id', (req, res) => {
  try {
    const id   = Number(req.params.id);
    const data = loadData(cropsFile);
    const idx  = data.crops.findIndex(c => c.id === id);
 
    if (idx === -1) {
      return res.status(404).json({ error: `Crop with id ${id} not found.` });
    }
 
    const [removed] = data.crops.splice(idx, 1);
    saveData(cropsFile, data);
    res.json({ message: `Crop "${removed.name}" deleted.`, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

app.delete('/api/supply/:id', (req, res) => {
  try {
    const id   = Number(req.params.id);
    const data = loadData(supplyFile);
    const idx  = data.supply.findIndex(s => s.id === id);
 
    if (idx === -1) {
      return res.status(404).json({ error: `Supply item with id ${id} not found.` });
    }
 
    const [removed] = data.supply.splice(idx, 1);
    saveData(supplyFile, data);
    res.json({ message: `Supply "${removed.name}" deleted.`, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Agro Ledger API running at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT}/index.html to view the app`);
});


