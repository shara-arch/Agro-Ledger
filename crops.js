//Storage Keys
const lsLoggedIn = "isLoggedIn";
const lsCrops = "al_crops";
const lsSupply = "al_supply;";
const ls_seeded = "al_seeded";
const cropsFile = "data/crops.json";

let crops = [];


//Load data
async function loadData() {
    try{
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
 
    crops = cropsData.crops || [];

    
    return { crops, };
}catch (err){
     console.error("[crops.js]Error loading data", err);
     crops = [];
     return { crops: [] }; // fallback
}
}
//renderCrops
async function renderCrops() {
    try {
        const container = document.querySelector("#cropsTableBody");
    if (!container) {
      console.error("Container #cropsTableBody not found");
      return;
    }

    container.innerHTML="";

    if (!crops || crops.length === 0) {
      container.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:1rem'>No crops found. Click ➕ Add Crop to get started.</td></tr>";
      return;
    }
   
    crops.forEach(crop =>{
        const row = document.createElement("tr");
        //days rem to harvest
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
        <td><button class="delete" onclick="deleteCrop(${crop.id})"> 🗑️</button> </td>
      `;
      container.appendChild(row);
    })
  } catch(err){
    console.error("Error found trying to renderCrops", err)
  }
}
// document.addEventListener("DOMContentLoaded",renderCrops);



// Load data and render initially
loadData()
  .then(() => {
    renderCrops();
  })
  .catch(err => {
    console.error("Error initializing data", err);
  });

//This is a function that adds items to the array crops
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-crop-Form");
  if (!form) {
    console.error("[crops,js]Form #add-crop-Form not found");
    return;
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

  const name = document.getElementById("cropName").value.trim(); //.trim() removes white space
  const type = document.getElementById("cropType").value;
  const qty = Number(document.getElementById("cropQuantity").value.trim());
  const stage = document.getElementById("growthStage").value;
  const harvestDate = document.getElementById("expectedHarvestDate").value;
  const cropSupplies = document.getElementById("cropSupplies").value.trim();

    const supplies = cropSupplies
      ? cropSupplies.split(",").map(item => item.trim()).filter(Boolean)
      : [];

  
  try {
    const res = await fetch("http://localhost:3000/api/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, qty, stage, harvestDate, supplies })
    });

    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

    const newCrop = await res.json();
    //Update local state immediately
    crops.push(newCrop);
    alert(`${newCrop.name} has been added`);
    form.reset();

    // Close the <details> wrapper
    const details = form.closest("details");
    if (details) details.open = false;
    //refresh UI
    renderCrops();
  }catch (err) {
    console.error("[crops.js]Save failed", err);
    alert(`Error saving supply: ${err.message}\n\nMake sure the server is running (node server.js).`);
  };
});
});

//Tthis function will be used to delete crops 
async function deleteCrop(id) {
  const numericId = Number(id);
 
  const crop = crops.find(c => c.id === numericId);
  if (!crop) {
    console.warn(`[crops.js] deleteCrop: no crop with id ${numericId} found in local state`);
    alert("Crop not found. Please refresh the page.");
    return;
  }
  
  if (!confirm(`Remove "${crop.name}" from the ledger?`)) return;

  try {
    // Call backend to delete crop
    const res = await fetch(`http://localhost:3000/api/crops/${numericId}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    // Update local state
    crops = crops.filter(c => c.id !== numericId);

    // Refresh UI
    renderCrops();

    alert(`${crop.name} removed.`);
  } catch (err) {
    console.error("[crops.js]Delete failed", err);
    alert(`Error deleting crop: ${err.message}\n\nMake sure the server is running (node server.js).`);
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  renderCrops();
});

