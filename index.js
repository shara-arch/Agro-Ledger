//Login function
function handleLogin(maxAttempts, correctUser, correctPass) {  
    let attempts = 0;

    return function login() {
        const userName = document.getElementById("username").value;
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
            alert("Incorrect credentials. Attempts left:" + (maxAttempts - attempts));
        } else {
            alert("Too many Attempts! Access denied.")
            //disble login button
            document.getElementById("login-btn").disabled = true;
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
const supplyFile = "data/crops.json"

//Load data
async function loadData() {
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyFile.json();
    const crops = cropsData.crops || [];
    const supply = supplyData.supply || [];
    return {
        crops: cropsData.crops,
        supply: supplyData.supply
    }
}

//Load OverView Data
async function loadOverview () {
    try {
    const cropsRes = await fetch(cropsFile);
    const cropsData = await cropsRes.json();
    const supplyRes = await fetch(supplyFile);
    const supplyData = await supplyFile.json();
    const crops = cropsData.crops || [];
    const supply = supplyData.supply || [];

    //compute summary metrics for dashboard
    const totalCrops = crops.length;
    const supplyItems = supply.length;
    const lowStockAlerts = supply.filter(item => item.stock < minLevel).length;
    const currentDate = new Date();
    const upcomingHarvests = crops.filter(crop => new Date(crop.harvestDate) > currentDate).length;

    // Update DOM
    document.getElementById("totalCropsValue").textContent = totalCrops;
    document.getElementById("supplyItemsValue").textContent = supplyItems;
    document.getElementById("lowStockValue").textContent = lowStockAlerts;
    document.getElementById("upcomingHarvestsValue").textContent = upcomingHarvests;
        
    return {
        crops, supply,
        overview: { totalCrops, supplyItems, lowStockAlerts, upcomingHarvests}
    }
    } catch(err) {
        console.error("Error loading overview data", err);
        return {
            crops: [], supply: [], overview: {}
        }
    }
}
