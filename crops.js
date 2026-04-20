//Storage Keys
const lsLoggedIn = "isLoggedIn";
const lsCrops = "al_crops";
const lsSupply = "al_supply;";
const ls_seeded = "al_seeded";
const cropsFile = "data/crops.json";

//Session Guard
function guardPage(){
    if (localStorage.getItem(lsLoggedIn) !== "true") {
        window.location.href = "login.html";
    }
}
// Local Storage Helpers
function getCrops()  { 
    return JSON.parse(localStorage.getItem(lsCrops)  || "[]"); 
}
function setCrops(data)  { 
    localStorage.setItem(lsCrops,  JSON.stringify(data)); 
}
//Seed on First Visit
async function seedIfNeeded() {
    if (localStorage.getItem(ls_seeded) === "true") return; // already seeded
    try {
        const [cropsRes] = await Promise.all([
            fetch(cropsFile),
        ]);
        const cropsData  = await cropsRes.json();
        setCrops(cropsData.crops   || []);
        localStorage.setItem(ls_seeded, "true");
    } catch (err) {
        console.warn("[crops.js] Could not fetch seed data. Starting empty.", err);
        setCrops([]);
        localStorage.setItem(ls_seeded, "true");
    }
}
//In memory state
let crops = [];

//logOut
function logOut() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem(lsLoggedIn);
        window.location.href = "login.html";
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
//----ADD CROP-----------

//This is a function that adds items to the array crops
document.addEventListener("DOMContentLoaded", () => {
  guardPage();
  //Seed Once then load to memory
  await seedIfNeeded();
  crops = getCrops();
  renderCrops();
  
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

  
        // Create new crop and save to localStorage
        const newCrop = { id: Date.now(), name, type, qty, stage, harvestDate, supplies };
        crops.push(newCrop);
        setCrops(crops);
 
        alert(`${newCrop.name} has been added`);
        form.reset();
 
        // Close the <details> accordion
        const details = form.closest("details");
        if (details) details.open = false;
 
        renderCrops();
});
});
//------------Delete Crop----------------
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
 
    crops = crops.filter(c => c.id !== numericId);
    setCrops(crops);
    renderCrops();
    alert(`${crop.name} removed.`);
}
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  renderCrops();
});

