// ============================================================
//  supply.js  —  Agro Ledger
// ============================================================

// ── Storage keys (must match index.js) ───────────────────
const LS_LOGGED_IN = "isLoggedIn";
const LS_CROPS     = "al_crops";
const LS_SUPPLY    = "al_supply";
const LS_SEEDED    = "al_seeded";
const cropsFile    = "data/crops.json";
const supplyFile   = "data/supply.json";

// ── Task 1: session guard ─────────────────────────────────
function guardPage() {
    if (localStorage.getItem(LS_LOGGED_IN) !== "true") {
        window.location.href = "login.html";
    }
}

// ── Task 2: localStorage helpers ─────────────────────────
function getCrops()  { return JSON.parse(localStorage.getItem(LS_CROPS)  || "[]"); }
function getSupply() { return JSON.parse(localStorage.getItem(LS_SUPPLY) || "[]"); }
function setCrops(data)  { localStorage.setItem(LS_CROPS,  JSON.stringify(data)); }
function setSupply(data) { localStorage.setItem(LS_SUPPLY, JSON.stringify(data)); }

async function seedIfNeeded() {
    if (localStorage.getItem(LS_SEEDED) === "true") return;
    try {
        const [cropsRes, supplyRes] = await Promise.all([fetch(cropsFile), fetch(supplyFile)]);
        const cropsData  = await cropsRes.json();
        const supplyData = await supplyRes.json();
        setCrops(cropsData.crops   || []);
        setSupply(supplyData.supply || []);
        localStorage.setItem(LS_SEEDED, "true");
    } catch (err) {
        console.warn("[supply.js] Seed fetch failed. Starting empty.", err);
        setCrops([]);
        setSupply([]);
        localStorage.setItem(LS_SEEDED, "true");
    }
}

// ── In-memory state ───────────────────────────────────────
let supply = [];

// ── logOut ────────────────────────────────────────────────
function logOut() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem(LS_LOGGED_IN);
        window.location.href = "login.html";
    }
}

// ── Render supply table ───────────────────────────────────
function renderSupply() {
    const container = document.querySelector("#supplyTableBody");
    if (!container) return;

    container.innerHTML = "";

    if (!supply || supply.length === 0) {
        container.innerHTML = "<tr><td colspan='8' style='text-align:center;padding:1rem'>No supply found. Click ➕ Add Supply to get started.</td></tr>";
        return;
    }

    supply.forEach(item => {
        if (!item.name) return;

        const stockStatus = item.stock > item.minLevel ? "In Stock" : "Low Stock";
        const row = document.createElement("tr");

        // NOTE: no supply-status-card class on <tr> — that class has
        // display:flex which breaks the table layout (all cells collapse to col 1)

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>${item.unit}</td>
            <td>${item.minLevel}</td>
            <td class="${stockStatus === "In Stock" ? "status-in-stock" : "status-low"}">${stockStatus}</td>
            <td>${item.notes || ""}</td>
            <td><button class="delete" onclick="deleteSupply(${item.id})" title="Delete">🗑️</button></td>`;
        container.appendChild(row);
    });
}

// ── Add supply ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    guardPage();

    await seedIfNeeded();
    supply = getSupply();
    renderSupply();

    const form = document.getElementById("add-supply-Form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name     = document.getElementById("itemName").value.trim();
        const category = document.getElementById("supplyCategory").value;
        const stock    = Number(document.getElementById("stockValue").value);
        const unit     = document.getElementById("unit").value;
        const minLevel = Number(document.getElementById("minLevel").value);
        const notes    = document.getElementById("notes").value.trim();

        if (!name)                      { alert("Supply name is required."); return; }
        if (isNaN(stock)  || stock < 0) { alert("Enter a valid stock quantity."); return; }
        if (isNaN(minLevel)||minLevel<0) { alert("Enter a valid minimum level."); return; }

        const newItem = { id: Date.now(), name, category, stock, unit, minLevel, notes };
        supply.push(newItem);
        setSupply(supply);

        alert(`${newItem.name} has been added`);
        form.reset();

        const details = form.closest("details");
        if (details) details.open = false;

        renderSupply();
    });
});

// ── Delete supply ─────────────────────────────────────────
function deleteSupply(id) {
    const numericId = Number(id);
    const item = supply.find(s => s.id === numericId);

    if (!item) { alert("Item not found. Try refreshing."); return; }
    if (!confirm(`Remove "${item.name}" from the ledger?`)) return;

    supply = supply.filter(s => s.id !== numericId);
    setSupply(supply);
    renderSupply();
    alert(`${item.name} removed.`);
}