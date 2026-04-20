// Storage Keys
const lsLoggedIn = "isLoggedIn";
const lsCrops    = "al_crops";
const lsSupply   = "al_supply";
const ls_seeded  = "al_seeded";
const cropsFile  = "data/crops.json";
const supplyFile = "data/supply.json";

// Session Guard
function guardPage() {
    if (localStorage.getItem(lsLoggedIn) !== "true") {
        window.location.href = "login.html";
    }
}

// Local Storage Helpers
function getCrops()  { return JSON.parse(localStorage.getItem(lsCrops)  || "[]"); }
function getSupply() { return JSON.parse(localStorage.getItem(lsSupply) || "[]"); }
function setCrops(data)  { localStorage.setItem(lsCrops,  JSON.stringify(data)); }
function setSupply(data) { localStorage.setItem(lsSupply, JSON.stringify(data)); }

// Seed on First Visit
async function seedIfNeeded() {
    if (localStorage.getItem(ls_seeded) === "true") return;
    try {
        const [cropsRes, supplyRes] = await Promise.all([fetch(cropsFile), fetch(supplyFile)]);
        const cropsData  = await cropsRes.json();
        const supplyData = await supplyRes.json();
        setCrops(cropsData.crops   || []);
        setSupply(supplyData.supply || []);
        localStorage.setItem(ls_seeded, "true");
    } catch (err) {
        console.warn("[crops.js] Seed fetch failed. Starting empty.", err);
        setCrops([]);
        setSupply([]);
        localStorage.setItem(ls_seeded, "true");
    }
}

// In-memory state
let crops  = [];
let supply = [];

// Logout
function logOut() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem(lsLoggedIn);
        window.location.href = "login.html";
    }
}

// Render Crops Table
function renderCrops() {
    const container = document.querySelector("#cropsTableBody");
    if (!container) return;

    container.innerHTML = "";

    if (!crops || crops.length === 0) {
        container.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:1rem'>No crops found. Click ➕ Add Crop to get started.</td></tr>";
        return;
    }

    crops.forEach(crop => {
        const row = document.createElement("tr");
        const harvestDate = new Date(crop.harvestDate);
        const today       = new Date();
        const daysRemaining = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));

        row.innerHTML = `
            <td>${crop.name}</td>
            <td>${crop.type}</td>
            <td>${crop.qty} kg</td>
            <td>${crop.stage}</td>
            <td>${crop.harvestDate || "—"} <span id="daysRemainingToHarvest">(${daysRemaining}d)</span></td>
            <td><button class="delete" onclick="deleteCrop(${crop.id})">🗑️</button></td>`;
        container.appendChild(row);
    });
}

// Add Crop
document.addEventListener("DOMContentLoaded", async () => {
    guardPage();

    await seedIfNeeded();
    crops  = getCrops();
    supply = getSupply();
    renderCrops();

    const form = document.getElementById("add-crop-Form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name        = document.getElementById("cropName").value.trim();
        const type        = document.getElementById("cropType").value;
        const qty         = Number(document.getElementById("cropQuantity").value);
        const stage       = document.getElementById("growthStage").value;
        const harvestDate = document.getElementById("expectedHarvestDate").value;
        const cropSupplies= document.getElementById("cropSupplies").value.trim();

        if (!name)             { alert("Crop name is required."); return; }
        if (!harvestDate)      { alert("Harvest date is required."); return; }
        if (isNaN(qty) || qty < 0) { alert("Enter a valid quantity."); return; }

        const supplies = cropSupplies
            ? cropSupplies.split(",").map(s => s.trim()).filter(Boolean)
            : [];

        const newCrop = { id: Date.now(), name, type, qty, stage, harvestDate, supplies };
        crops.push(newCrop);
        setCrops(crops);

        alert(`${newCrop.name} has been added`);
        form.reset();

        const details = form.closest("details");
        if (details) details.open = false;

        renderCrops();
    });
});

// Delete Crop
function deleteCrop(id) {
    const numericId = Number(id);
    const crop = crops.find(c => c.id === numericId);

    if (!crop) { alert("Crop not found. Try refreshing."); return; }
    if (!confirm(`Remove "${crop.name}" from the ledger?`)) return;

    crops = crops.filter(c => c.id !== numericId);
    setCrops(crops);
    renderCrops();
    alert(`${crop.name} removed.`);
}
