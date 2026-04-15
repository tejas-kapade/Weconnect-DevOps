
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function showNotification(msg) {
    const box = document.getElementById("notification");

    box.innerText = msg;
    box.classList.remove("hidden");

    setTimeout(() => {
        box.classList.add("hidden");
    }, 4000);
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("data",data); // DEBUG

    if (data.token) {
        localStorage.setItem("token", data.token);

        const user = parseJwt(data.token);
        console.log("user", user); // DEBUG
        //return; // DEBUG - Remove this line after verifying token parsing
        // Role-based redirect
        if (user && user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "pools.html";
        }
    } 
    else {
        showNotification("Login failed. Please check your credentials.  || " +data.error);
    }
}

function goRegister() {
    window.location.href = "register.html";
}

async function register() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (data.message) {
        showNotification("Registration successful! Redirecting to login...");
       
        setTimeout(() => {
         window.location.href = "login.html";
    }, 2000);
    } else {
        showNotification("Registration failed. Please try again.");
    }
}

/*
const user = parseJwt(data.token);

if (user.role === "admin") {
    window.location.href = "admin.html";
} else {
    window.location.href = "pools.html";
}*/