const token = localStorage.getItem("token");
//console.log("Token:", token); // DEBUG
function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}
//If no token, show notification and redirect to login
if(!token){
    showNotification("Unautohrized! [No Token found] Redirecting to login...");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 3000);
}

const user = parseJwt(token);
document.getElementById("username").innerText = user.username;

function showNotification(msg) {
    const box = document.getElementById("notification");

    box.innerText = msg;
    box.classList.remove("hidden");

    setTimeout(() => {
        box.classList.add("hidden");
    }, 4000);
}

/* OLD LOGIN LOGIC
async function loadPools() {
    const res = await fetch("/pools", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const pools = await res.json();

    const container = document.getElementById("poolsContainer");

    pools.forEach(pool => {
        const div = document.createElement("div");
        div.className = "pool-box";

        div.innerHTML = `
            <h3>${pool.name}</h3>
            <input type="password" placeholder="Enter password" id="pass-${pool.id}">
            <button onclick="join(${pool.id})">Join</button>
        `;

        container.appendChild(div);
    });
}
    */

//New login logic with error handling and debug logs
async function loadPools() {
    const res = await fetch("/pools", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    console.log("Pools:", data); // DEBUG

    if (!Array.isArray(data)) {
        //alert("Error loading pools");
        showNotification("ERROR LOADING POOLS: " + data.error +"  //Try Login again");
        return;
    }

    const container = document.getElementById("poolsContainer");

    data.forEach(pool => {
        const div = document.createElement("div");
        const user = parseJwt(token);
        div.className = "pool-box";

        div.innerHTML = `
    <div class="pool-header">
        <h3>${pool.name}</h3>
        ${
            pool.created_by === user.id
            ? `<button class="delete-btn" onclick="deletePool(${pool.id}, '${pool.name}')">✖</button>`
            : ""
        }
    </div>

    <input type="password" id="pass-${pool.id}" placeholder="Password">
    <button onclick="join(${pool.id})">Join</button>
`;

        container.appendChild(div);
    });
}


async function join(poolId) {
    const password = document.getElementById(`pass-${poolId}`).value;

    const res = await fetch("/pools/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({ poolId, password })
    });

    const data = await res.json();

    console.log("JOIN RESPONSE:", data);

    // ALWAYS ENTER CHAT IF SUCCESS OR ALREADY JOINED
    if (data.poolId) {
        localStorage.setItem("poolId", poolId);
        window.location.href = "chat.html";
    } else {
        //alert(data.error || "Join failed");
        showNotification(data.error || "Join failed");
    }
}



async function createPool() {
    const name = document.getElementById("poolName").value;
    const password = document.getElementById("poolPass").value;

    showNotification(`Your pool "${name}" will be created shortly...`);

    setTimeout(async () => {
        const res = await fetch("/pools/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ name, password })
        });

        const data = await res.json();

        if (data.message) {
            location.reload(); // clean reload avoids duplicates
        } else {
            showNotification(data.error);
        }
    }, 1500);
}

/*
async function deletePool(poolId, poolName) {
    const confirmDelete = confirm("Are you sure to delete POOL? All chats will be deleted, Cannot be retrieved!");
    document.getElementById("deleteModal").classList.add("active");
    console.log("Delete Pool ID:", poolId); // DEBUG

    if (!confirmDelete) return;

    const res = await fetch(`/pools/${poolId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    if (data.message) {
        showNotification("Pool deleted");
        location.reload();
    } else {
        alert(data.error);
    }
}
    */

function toggleCreatePanel() {
    const panel = document.getElementById("createPanel");
    //panel.classList.toggle("hidden");
    //document.getElementById("createModal").classList.toggle("hidden");
    document.getElementById("createModal").classList.toggle("active");
    //document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.add("active");
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}


//DELETE POOL MODEL--------------------------------------------------------
let deletePoolId = null;
let deletePoolName = "";

function deletePool(poolId, poolName) {
    deletePoolId = poolId;
    deletePoolName = poolName;

    document.getElementById("deleteText").innerHTML =
        `Confirm Delete pool: "${poolName}"? <br><br> <p style="color:tomato;">All chats will be deleted permanently!</p>`;

    //document.getElementById("deleteModal").classList.remove("hidden");
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
}


//CONFIRM DELETE WITH NOTIFICATION AND DELAY FOR BETTER UX--------------------

async function confirmDelete() {
    closeDeleteModal();

    showNotification(`Your pool "${deletePoolName}" will be deleted shortly...`);

    setTimeout(async () => {
        const res = await fetch(`/pools/${deletePoolId}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        if (data.message) {
            location.reload();
        } else {
            showNotification(data.error);
        }
    }, 1500);
}

//Calling Functions --------------------------------------------------------
loadPools();