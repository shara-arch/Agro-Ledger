// Credentials
const correctUser = "farmer_shara";
const correctPass = "iLoveFarming";

//Storage Keys
// Note : Local Storage = ls
const lsLoggedIn = "isLoggedIn";
const lsCrops = "al_crops";
const lsSupply = "al_supply;";
const ls_seeded = "al_seeded";
//Login function
function handleLogin(maxAttempts, correctUser, correctPass) {  
    let attempts = 0;

    return function login() {
        const userName = document.getElementById("username").trim();
        const password = document.getElementById("password").value;
    
    //Check if already logged in 
    if(localStorage.getItem("isLoggedIn") === "true"){
        window.location.href = "index.html";
    }
    //Authenticate username and password
    if(userName === correctUser && password === correctPass) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "index.html";
    } else {
        attempts++;
        if (attempts < maxAttempts) {
 showLoginError("Incorrect credentials. Attempts left: " + (maxAttempts - attempts));
        } else {
            showLoginError("Too many failed attempts. Access denied.");
            //disble login button
            const btn = document.getElementById("login-btn");
            if (btn) btn.disabled = true;
        }
    }
 };
}
//initialize login
window.login = handleLogin(4, "farmer_shara", "iLoveFarming");
//Log-out Function
function logOut() {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if(confirmLogout) {
        localStorage.removeItem("isLoggedIn"); //clears login state
    alert("You have been logged out.");
    window.location.href = "login.html";// redirects back to login page
    } else {
        alert("Logout Cancelled.")
    }
}
//Auto-redirect if user is already logged in
window.onload = function() {
    if(localStorage.getItem("isLoggedIn")=== "true") {
        window.location.href = "index.html"
    }
};

//Load data 
//File paths
const cropsFile = "data/crops.json";
const supplyFile = "data/supply.json";

//Load data
async function loadData() {
    try{
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyRes.json();
    const crops = cropsData.crops || [];
    const supply = supplyData.supply || [];
    return { crops, supply };
        // crops: cropsData.crops,
        // supply: supplyData.supply
    
}catch (err){
     console.error("Error loading data", err);
        return { crops: [], supply: [] }; // fallback
}
}

//Load OverView Data
async function loadOverview () {
    try {
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyRes.json();
    const crops = cropsData.crops || [];
    const supply = supplyData.supply || [];

    //compute summary metrics for dashboard
    const totalCrops = crops.length;
    const supplyItems = supply.length;
    const lowStockAlerts = supply.filter(item => item.stock < item.minLevel).length;
    const currentDate = new Date();
    const upcomingHarvests = crops.filter(crop => new Date(crop.harvestDate) > currentDate).length;

    // Update DOM
    document.getElementById("totalCropsValue").textContent = totalCrops;
    document.getElementById("supplyItemsValue").textContent = supplyItems;
    document.getElementById("lowStockAlertsValue").textContent = lowStockAlerts;
    document.getElementById("upcomingHarvestsValue").textContent = upcomingHarvests;
    document.getElementById("notifCount").textContent = lowStockAlerts;

        
    return {
        crops, supply,
        overview: { totalCrops, supplyItems, lowStockAlerts, upcomingHarvests}
    }
    } catch(err) {
        console.error("Error loading overview data", err);
        return {
            crops: [], supply: [], overview: {}
        };
    }
}
//call loadOverview on page reload
document.addEventListener('DOMContentLoaded', async () => {
    await loadOverview();
});

async function displayNotif() {
    try {
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyRes.json();
    const crops = cropsData.crops || [];
    const supply = supplyData.supply || [];

    //DOM
    const container = document.querySelector("#notifList");
    

    container.innerHTML = "";
    const lowStock = supply.filter(item => item.stock < item.minLevel);

    if(lowStock.length === 0 ) {
        container.textContent = "✔ Stock Levels are sufficient. No new alerts at the moment.";
        return;
    }
    //Styling to make background red/green
    const notifPanel = document.querySelectorAll(".notif-panel");
    //--------------------------------------------------------------------
    lowStock.forEach(item => {
        const p = document.createElement("p");
        p.textContent = `⚠️${item.name}: only ${item.stock}${item.unit} remaining.`;
        container.appendChild(p);
        
    });
    div.classList.add("low-stock");

}catch(err) {
        console.error("Error displaying notifictaions", err);
        
    }
}
//This creates infinite recursion
setInterval(displayNotif, 60000); //runs every 60 sec

//Create global Function to fetch data
async function displayRecentCrops() {
    try{
    const { crops } = await loadData();
    const container = document.querySelector("#summaryCropsList");

    if (!container) {
      console.error("Container #summaryCropsList not found");
      return;
    }

    container.innerHTML="";

    if (!crops || crops.length === 0) {
      container.textContent = "No crops found.";
      return;
    }

    crops.forEach(crop =>{
        const card = document.createElement("div");
        card.classList.add("recent-crop-card");

        card.innerHTML = `<p><span>${crop.name}</span>  <span>${crop.stage}</span></p>`;
        container.appendChild(card);
    })
  } catch (err) {
    console.error("Error displaying recent crops", err)
  }
}
// setInterval(displayRecentCrops, 60000);
displayRecentCrops();

//Function that displays Supply Status
async function renderSupplyStatus() {
    try {
        const { supply } = await loadData();
        const container = document.querySelector("#summarySupplyList")
    if (!container) {
      console.error("Container #summarySupplyList not found");
      return;
    }

    container.innerHTML="";

    if (!supply || supply.length === 0) {
      container.textContent = "No supply found.";
      return;
    }


    supply.forEach(item => {
         if (!item.name) return; // skip invalid entries

        const supplyStatus = item.stock > item.minLevel ? "In Stock" : "Low stock";
        const card = document.createElement("div");
        card.classList.add("supply-status-card");

        card.innerHTML = `<p><span>${item.name}</span>  <span>${supplyStatus}</span></p>`;
        container.appendChild(card);
    });
    } catch(err){
        console.error(`Error rendering Supply Status`, err);
    }
}
renderSupplyStatus();

//Styling to switch active class
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".side-panel a");

  links.forEach(link => {
    link.addEventListener("click", function() {
      // remove active from all links
      links.forEach(l => l.classList.remove("active"));
      // add active to the clicked link
      this.classList.add("active");
    });
  });
});
