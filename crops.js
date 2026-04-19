//Load data 
//File paths
const cropsFile = "data/crops.json";
const supplyFile = "data/supply.json";

let crops = [];
let supply = [];

//Load data
async function loadData() {
    try{
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyRes.json();
    
    crops = cropsData.crops || [];
    supply = supplyData.supply || [];
    
    return { crops, supply };
}catch (err){
     console.error("Error loading data", err);
     crops = [];
     supply = [];
     return { crops: [], supply: [] }; // fallback
}
}
//renderCrops
async function renderCrops() {
    try {
        const container = document.querySelector("#cropsTableBody");
    if (!container) {
      console.error("Container #cropsList not found");
      return;
    }

    container.innerHTML="";

    if (!crops || crops.length === 0) {
      container.innerHTML = "<tr><td colspan='6'>No crops found.</td></tr>";
      return;
    }
   
    crops.forEach(crop =>{
        const row = document.createElement("tr");
        const harvestDate = new Date(crop.harvestDate);
        const today = new Date();
        const diffTime = harvestDate - today;
        const daysRemainingToHarvest = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      row.innerHTML = `
        <td>${crop.name}</td>
        <td>${crop.type}</td>
        <td>${crop.qty} kg</td>
        <td>${crop.stage}</td>
        <td>${crop.harvestDate} <span id="daysRemainingToHarvest">(${daysRemainingToHarvest}d)</span></td>
        <td><button class="edit">✏️</button> <button class="delete"> 🗑️</button> </td>
      `;
      container.appendChild(row);
    })
  } catch(err){
    console.error("Error found trying to renderCrops", err)
  }
}
document.addEventListener("DOMContentLoaded",renderCrops);

async function renderSupply() {
    try {
        const container = document.querySelector("#supplyTableBody");
    if (!container) {
      console.error("Container #supplyTableBody not found");
      return;
    }

    container.innerHTML="";

    if (!supply || supply.length === 0) {
      container.innerHTML = "<tr><td colspan='8'>No supply found.</td></tr>";
      return;
    }


    supply.forEach(item => {
         if (!item.name) return; // skip invalid entries

        const supplyStatus = item.stock > item.minLevel ? "In Stock" : "Low stock";
        const row = document.createElement("tr");
        row.classList.add("supply-status-card");

          row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>${item.unit}</td>
            <td>${item.minLevel}</td>
            <td class="${supplyStatus === "In Stock" ? "status-in-stock" : "status-low"}">${supplyStatus}</td>
            <td>${item.notes || ""}</td>
            <td >
              <button class="edit">✏️</button>
              <button class="delete">🗑️</button>
            </td>`;
        container.appendChild(row);
    });
    } catch(err){
        console.error(`Error rendering Supply Status`, err);
    }
}
document.addEventListener("DOMContentLoaded",renderSupply);

// Load data and render initially
loadData()
  .then(() => {
    renderCrops();
    renderSupply();
  })
  .catch(err => {
    console.error("Error initializing data", err);
  });

//This is a function that adds items to the array crops
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-crop-Form");
  if (!form) {
    console.error("Form #add-crop-Form not found");
    return;
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

  const name = document.getElementById("cropName").value.trim(); //.trim() removes white space
  const type = document.getElementById("cropType").value;
  const qty = document.getElementById("cropQuantity").value.trim();
  const stage = document.getElementById("growthStage").value;
  const harvestDate = document.getElementById("expectedHarvestDate").value;
  const cropSupplies = document.getElementById("cropSupplies").value.trim();

    const suppliesArray = cropSupplies
      ? cropSupplies.split(",").map(item => item.trim()).filter(item => item)
      : [];

  
  try {
    const res = await fetch("http://localhost:3000/api/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, qty, stage, harvestDate, cropSupplies })
    });
      const newItem = await res.json();
    alert(`${newItem.name} has been added`);
    form.reset();  
    //refresh UI
       renderCrops();
  }catch (err) {
    console.error("Save failed", err);
    alert(`Error saving supply: ${err.message}`);
  };
});
});

//This is a function that adds items to the array supply
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-supply-Form");
  if (!form) {
    console.error("Form #add-supply-Form not found");
    return;
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("itemName").value.trim(); // trim whitespace
    const category = document.getElementById("supplyCategory").value;
    const stock = Number(document.getElementById("stockValue").value);
    const unit = document.getElementById("unit").value;
    const minLevel = Number(document.getElementById("minLevel").value);
    const notes = document.getElementById("notes").value.trim();

    if (!name || !category || Number.isNaN(stock) || !unit || Number.isNaN(minLevel) || !notes) {
      alert("Please complete all supply fields with valid values.");
      return;
    }
    try {
    const response = await fetch("http://localhost:3000/api/supply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, stock, unit, minLevel, notes })
    });

     if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const newItem = await response.json();
    alert(`${newItem.name} has been added`);
    form.reset();

    //refresh UI
    renderSupply();
  } catch (err) {
    console.error("Save failed", err);
    alert(`Error saving supply: ${err.message}`);
  };
});
});

// supplies
