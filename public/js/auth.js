
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

    if(username == '' || password == ''){
        showNotification("Ahhh... How will I know who are you buddy? \n Please enter your username and password...");
        return;
    }

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
    if(data.error == "User not found"){
        showNotification("Heyyy I could NOT find this username in my database, \nYou want to register ??");
        return;
    }
    else {
        showNotification("My dear "+username+" this password is wrong...\n Think Think I know you will find it out!!  \nError: " +data.error);
    }
}

function goRegister() {
    window.location.href = "register.html";
}

async function register() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(username == '' || email == '' || password == ''){
        showNotification("Please fill all the fields properly...\nNo worries it will take few seconds i bet...");
        return;
    }
    /*  We need to add email validation logic here, below code does not work.
    email_validity= email.checkValidity();
    if(!email_validity){
        showNotification("Please enter valid email... \nExample: "+username+"@weconnect.com");
        console.log(email_validity);
        return;
    }*/
    const res = await fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (data.message) {
        showNotification("Registration successful! Redirecting to login...\n WELCOME "+username+"!");
       
        setTimeout(() => {
         window.location.href = "login.html";
    }, 2000);
    } else {
        showNotification("Username: '"+ username+ "' is already exist, \nPlease choose different one...");
    }
}

/*
const user = parseJwt(data.token);

if (user.role === "admin") {
    window.location.href = "admin.html";
} else {
    window.location.href = "pools.html";
}*/