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
    if(username === correctUser && password === correctPass) {
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
