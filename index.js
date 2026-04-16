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

//Load Data
const fs = require('fs');
const path = require('path');

// File paths
const cropsFile = path.join(__dirname, 'data','crops.json');
const suppliesFile = path.join(__dirname, 'data','supplies.json');

// Load data
function loadData() {
  const cropsData = JSON.parse(fs.readFileSync(cropsFile, 'utf-8'));
  const suppliesData = JSON.parse(fs.readFileSync(suppliesFile, 'utf-8'));
  return { crops: cropsData.crops, supplies: suppliesData.supplies };
}



