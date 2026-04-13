const token = localStorage.getItem("token");
const poolId = localStorage.getItem("poolId");

//const db = require("./config/db");

const socket = io({
    auth: { token }
});

// join automatically

socket.emit("join_pool", poolId);
loadOldMessages();

/*
setTimeout(() => {
    loadOldMessages();
}, 200); */

// receive messages
socket.on("receive_message", (data) => {
    addMessage(data);
});

function sendMessage() {
    const message = document.getElementById("msgInput").value;

    socket.emit("send_message", {
        poolId,
        message
    });

    document.getElementById("msgInput").value = "";
}

function addMessage(data) {
    const div = document.createElement("div");

    const myUsername = parseJwt(token).username;

    if (data.username === myUsername) {
        div.className = "message right";
    } else {
        div.className = "message left";
    }

    div.innerHTML = `
        <strong>${data.username}</strong>
        <div>${data.message}</div>
        <small>${new Date(data.time).toLocaleTimeString()}</small>
    `;

    const messagesDiv = document.getElementById("messages");

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

//helper to parse JWT token and get username
function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}   

async function loadOldMessages() {
    const res = await fetch(`/messages/${poolId}`, {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const messages = await res.json();
    console.log("OLD MESSAGES:", messages);

    messages.forEach(msg => {
        addMessage({
            username: msg.username,
            message: msg.message,
            time: msg.created_at
        });
    });
}

//Key Support for Enter key to send message
document.getElementById("msgInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

//Logout function
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

//Display pool name
document.getElementById("poolName").innerText = "Pool ID: " + poolId;

