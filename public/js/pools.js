const token = localStorage.getItem("token");

function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
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
        alert("Error loading pools");
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
            ? `<button class="delete-btn" onclick="deletePool(${pool.id})">✖</button>`
            : console.log("pool name:"+pool.created_by, "user ID:"+user.id)
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
        alert(data.error || "Join failed");
    }
}

loadPools();

async function createPool() {
    const name = document.getElementById("poolName").value;
    const password = document.getElementById("poolPass").value;

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
        alert("Pool created!");
        location.reload();
    } else {
        alert(data.error);
    }
}


async function deletePool(poolId) {
    const confirmDelete = confirm("Are you sure? All chats will be deleted.");

    if (!confirmDelete) return;

    const res = await fetch(`/pools/${poolId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    if (data.message) {
        alert("Pool deleted");
        location.reload();
    } else {
        alert(data.error);
    }
}