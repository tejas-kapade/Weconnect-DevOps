
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
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

    if (data.token) {
        localStorage.setItem("token", data.token);

        const user = parseJwt(data.token);
        // Role-based redirect
        if (user && user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "pools.html";
        }
    } 
    else {
        alert(data.error);
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
        alert("Registered successfully");
        window.location.href = "login.html";
    } else {
        alert(data.error);
    }
}

/*
const user = parseJwt(data.token);

if (user.role === "admin") {
    window.location.href = "admin.html";
} else {
    window.location.href = "pools.html";
}*/