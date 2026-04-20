// Credentials
const correctUser = "farmer_shara";
const correctPass = "iLoveFarming";

// Storage Keys
const lsLoggedIn = "isLoggedIn";
const lsCrops    = "al_crops";
const lsSupply   = "al_supply";
const ls_seeded  = "al_seeded";

// Seed File paths
const cropsFile  = "data/crops.json";
const supplyFile = "data/supply.json";

// Session Guard
function guardPage() {
    const onLoginPage = window.location.pathname.endsWith("login.html");
    if (onLoginPage) return;
    if (localStorage.getItem(lsLoggedIn) !== "true") {
        window.location.href = "login.html";
    }
}

// Login Error Handling
function showLoginError(msg) {
    const el = document.getElementById("login-error");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
}
function clearLoginError() {
    const el = document.getElementById("login-error");
    if (el) el.classList.add("hidden");
}

// Login Function
function handleLogin(maxAttempts, correctUser, correctPass) {
    let attempts = 0;

    return function login() {
        clearLoginError();
        const userName = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (userName === correctUser && password === correctPass) {
            localStorage.setItem(lsLoggedIn, "true");
            window.location.href = "index.html";
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                showLoginError("Incorrect credentials. Attempts left: " + (maxAttempts - attempts));
            } else {
                showLoginError("Too many failed attempts. Access denied.");
                const btn = document.getElementById("login-btn");
                if (btn) btn.disabled = true;
            }
        }
    };
}
window.login = handleLogin(4, correctUser, correctPass);

// Logout
function logOut() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem(lsLoggedIn);
        window.location.href = "login.html";
    }
}

// Auto-redirect if already logged in
(function redirectIfLoggedIn() {
    const onLoginPage = window.location.pathname.endsWith("login.html");
    if (onLoginPage && localStorage.getItem(lsLoggedIn) === "true") {
        window.location.href = "index.html";
    }
})();

// Helpers
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
        console.warn("[index.js] Could not fetch seed data. Starting empty.", err);
        setCrops([]);
        setSupply([]);
        localStorage.setItem(ls_seeded, "true");
    }
}

// Load Data
async function loadData() {
    await seedIfNeeded();
    return { crops: getCrops(), supply: getSupply() };
}

// Dashboard Functions
async function loadOverview() {
    try {
        const { crops, supply } = await loadData();
        const totalCrops       = crops.length;
        const supplyItems      = supply.length;
        const lowStockAlerts   = supply.filter(s => s.stock < s.minLevel).length;
        const currentDate      = new Date();
        const upcomingHarvests = crops.filter(c => new Date(c.harvestDate) > currentDate).length;

        document.getElementById("totalCropsValue").textContent       = totalCrops;
        document.getElementById("supplyItemsValue").textContent      = supplyItems;
        document.getElementById("lowStockAlertsValue").textContent   = lowStockAlerts;
        document.getElementById("upcomingHarvestsValue").textContent = upcomingHarvests;
        document.getElementById("notifCount").textContent            = lowStockAlerts;

        return { crops, supply, overview: { totalCrops, supplyItems, lowStockAlerts, upcomingHarvests } };
    } catch (err) {
        console.error("Error loading overview data", err);
        return { crops: [], supply: [], overview: {} };
    }
}

async function displayNotif() {
    try {
        const { supply } = await loadData();
        const container  = document.querySelector("#notifList");
        if (!container) return;

        container.innerHTML = "";
        const lowStock = supply.filter(s => s.stock < s.minLevel);

        if (lowStock.length === 0) {
            container.textContent = "✔ Stock Levels are sufficient. No new alerts at the moment.";
            return;
        }
        lowStock.forEach(item => {
            const p = document.createElement("p");
            p.textContent = `⚠️ ${item.name}: only ${item.stock} ${item.unit} remaining.`;
            container.appendChild(p);
        });
    } catch (err) {
        console.error("Error displaying notifications", err);
    }
}

async function displayRecentCrops() {
    try {
        const { crops } = await loadData();
        const container = document.querySelector("#summaryCropsList");
        if (!container) return;

        container.innerHTML = "";
        if (!crops || crops.length === 0) {
            container.textContent = "No crops found.";
            return;
        }
        crops.forEach(crop => {
            const card = document.createElement("div");
            card.classList.add("recent-crop-card");
            card.innerHTML = `<p><span>${crop.name}</span><span>${crop.stage}</span></p>`;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error displaying recent crops", err);
    }
}

async function renderSupplyStatus() {
    try {
        const { supply } = await loadData();
        const container  = document.querySelector("#summarySupplyList");
        if (!container) return;

        container.innerHTML = "";
        if (!supply || supply.length === 0) {
            container.textContent = "No supply found.";
            return;
        }
        supply.forEach(item => {
            if (!item.name) return;
            const supplyStatus = item.stock > item.minLevel ? "In Stock" : "Low stock";
            const card = document.createElement("div");
            card.classList.add("supply-status-card");
            card.innerHTML = `<p><span>${item.name}</span><span>${supplyStatus}</span></p>`;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error rendering Supply Status", err);
    }
}

// Dashboard Bootstrap
document.addEventListener("DOMContentLoaded", async () => {
    guardPage();
    await loadOverview();
    await displayRecentCrops();
    await renderSupplyStatus();

    const links = document.querySelectorAll(".side-panel a");
    links.forEach(link => {
        link.addEventListener("click", function () {
            links.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });
});
