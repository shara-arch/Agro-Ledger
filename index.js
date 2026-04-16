//Login function
function handleLogin(maxAttempt, correctUser, correctpass) {  
    let attempts = 0;

    return function login() {
        const userName = document.getElementById("username").value;
        const password = document.getElementById("password").value;
    }
    //Check if already logged in 
    if(localStorage.getItem("isLoggedIn") === "true"){
        window.location.href = "index.html";
    }
}
