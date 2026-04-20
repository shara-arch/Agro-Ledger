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
//Login Error Handling
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

//initialize login
window.login = handleLogin(4, correctUser, correctPass);
//Log-out Function
function logOut() {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if(confirmLogout) {
    localStorage.removeItem(lsLoggedIn); //clears login state
    alert("You have been logged out.");
    window.location.href = "login.html";// redirects back to login page
    } else {
        alert("Logout Cancelled.")
    }
}
//Auto-redirect if user is already logged in
(function redirectIfLoggedIn() {
    const onLoginPage = window.location.pathname.endsWith("login.html");
    if (onLoginPage && localStorage.getItem(LS_LOGGED_IN) === "true") {
        window.location.href = "index.html"
    }
})();

//Load data 
//Helpers
function getCrops()  { 
    return JSON.parse(localStorage.getItem(LS_CROPS)  || "[]"); 
}
function getSupply() { 
    return JSON.parse(localStorage.getItem(LS_SUPPLY) || "[]"); 
}
function setCrops(data)  { 
    localStorage.setItem(LS_CROPS,  JSON.stringify(data)); 
}
function setSupply(data) { 
    localStorage.setItem(LS_SUPPLY, JSON.stringify(data)); 
}
//Seed on First Visit
async function seedIfNeeded() {
    if (localStorage.getItem(LS_SEEDED) === "true") return; // already seeded
    try {
        const [cropsRes, supplyRes] = await Promise.all([
            fetch(cropsFile),
            fetch(supplyFile)
        ]);
        const cropsData  = await cropsRes.json();
        const supplyData = await supplyRes.json();
        setCrops(cropsData.crops   || []);
        setSupply(supplyData.supply || []);
        localStorage.setItem(LS_SEEDED, "true");
    } catch (err) {
        console.warn("[index.js] Could not fetch seed data. Starting empty.", err);
        setCrops([]);
        setSupply([]);
        localStorage.setItem(LS_SEEDED, "true");
    }
}

//---Index.html-----------------------
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
