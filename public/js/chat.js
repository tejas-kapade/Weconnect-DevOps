const token = localStorage.getItem("token");
const poolId = localStorage.getItem("poolId");
const poolName = localStorage.getItem("poolName");

console.log("pool name", poolName); 
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
    //addMessage(data);
    addMessage({ username: data.username, message: data.message, time: new Date() });
});
/*
socket.on("online_count", (count) => {
    document.getElementById("onlineCount").innerText = " online:" + count ;
});*/

function sendMessage() {
    const message = document.getElementById("msgInput").value;
    if (message.trim() === "") return;

    socket.emit("send_message", {
        poolId,
        message
    });

    document.getElementById("msgInput").value = "";
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(data) {
    const div = document.createElement("div");
    //console.log("TIME: "+ data.time);

    const myUsername = parseJwt(token).username;
    div.id="msg-container";

    if (data.username === myUsername) {
        div.className = "message right";
    } else {
        div.className = "message left";
    }

    //const timeObj = data.time ? new Date(data.time) : null;
    //const formattedTime = timeObj && !isNaN(timeObj) ? timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

    div.innerHTML = `
        <strong class="msg-username">${data.username}</strong>
        <div class="msg-body">${data.message}</div>
        <small class="msg-time">${formatTime(data.time)}</small>
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
 
    /* Old logic for displaying messages without time formatting */
    messages.forEach(msg => {
        addMessage({
            username: msg.username,
            message: msg.message,
            time: msg.created_at
        });
    }); 

    /* New logic for displaying messages with time formatting 

    messages.forEach(msg => {
    const isMe = msg.sender_id == user.id;

    const div = document.createElement("div");
    div.className = isMe ? "msg right" : "msg left";

    div.innerHTML = `
        <div class="msg-header">${msg.username}</div>
        <div class="msg-text">${msg.message}</div>
        <div class="msg-time">${formatTime(msg.created_at)}</div>
    `;

    chatBox.appendChild(div);
});*/
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

function exitChat() {
    localStorage.removeItem("poolId");
    window.location.href = "pools.html";
}

//Display pool name
document.getElementById("poolName").innerText = poolName;
document.getElementById("poolId").innerText = "Pool ID: " + poolId;

