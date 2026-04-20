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
        console.warn("[search.js] Seed fetch failed. Starting empty.", err);
        setCrops([]);
        setSupply([]);
        localStorage.setItem(ls_seeded, "true");
    }
}

// Logout
function logOut() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem(lsLoggedIn);
        window.location.href = "login.html";
    }
}

// Perform Search
function performSearch() {
    const query           = document.getElementById("search-input").value.toLowerCase();
    const checkCrops      = document.getElementById("filter-crops").checked;
    const checkSupply     = document.getElementById("filter-supplies").checked;
    const resultContainer = document.getElementById("search-results");

    resultContainer.innerHTML = "";
    if (!query) return;

    const crops  = getCrops();
    const supply = getSupply();
    let results = [];

    if (checkCrops) {
        const cropMatches = crops.filter(c => c.name.toLowerCase().includes(query));
        results.push(...cropMatches.map(c => ({ ...c, itemCategory: "Crop" })));
    }
    if (checkSupply) {
        const supplyMatches = supply.filter(s => s.name.toLowerCase().includes(query));
        results.push(...supplyMatches.map(s => ({ ...s, itemCategory: "Supply" })));
    }

    if (results.length === 0) {
        resultContainer.textContent = "No matching items found.";
        return;
    }

    results.forEach(item => {
        const div = document.createElement("div");
        let daysLabel = "";

        if (item.itemCategory === "Crop" && item.harvestDate) {
            const daysLeft = Math.ceil((new Date(item.harvestDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (!isNaN(daysLeft)) daysLabel = `<span id="daysRemainingToHarvest"> (${daysLeft}d)</span>`;
        }

        div.classList.add("resultcard");
        div.innerHTML = `
            <section class="result-container">
                <h3>${item.name}</h3>
                <p>
                    ${item.type        ? `<span>${item.type} • </span>` : ""}
                    ${item.qty         ? `<span>${item.qty} • </span>` : ""}
                    ${item.stage       ? `<span>Stage: ${item.stage} • </span>` : ""}
                    ${item.harvestDate ? `<span>Harvest: ${item.harvestDate}${daysLabel} • </span>` : ""}
                    ${item.category    ? `<span>Category: ${item.category} • </span>` : ""}
                    ${item.stock !== undefined ? `<span>Stock: ${item.stock} • </span>` : ""}
                    ${item.minLevel    ? `<span>Minimum Level: ${item.minLevel}</span>` : ""}
                </p>
            </section>
            <div id="itemCategory">${item.itemCategory}</div>`;
        resultContainer.appendChild(div);
    });
}

// Bootstrap
document.addEventListener("DOMContentLoaded", async () => {
    guardPage();
    await seedIfNeeded();

    document.getElementById("search-input").addEventListener("input", performSearch);
    document.getElementById("filter-crops").addEventListener("change", performSearch);
    document.getElementById("filter-supplies").addEventListener("change", performSearch);
});
