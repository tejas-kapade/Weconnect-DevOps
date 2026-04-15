const token = localStorage.getItem("token");
function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}

function showNotification(msg) {
    const box = document.getElementById("notification");

    box.innerText = msg;
    box.classList.remove("hidden");

    setTimeout(() => {
        box.classList.add("hidden");
    }, 4000);
}


function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

async function loadPools() {
    const res = await fetch("/pools/admin/all", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    const container = document.getElementById("adminPools");
    container.innerHTML = "";

    data.forEach(pool => {
        const div = document.createElement("div");
        div.classList.add("container");

        div.innerHTML = `
            <h3>${pool.name}</h3>
            <button onclick="deletePool(${pool.id}, '${pool.name}')">Delete</button>
        `;

        container.appendChild(div);
    });
}

async function confirmDelete() {
    closeDeleteModal();
    showNotification(`Pool "${deletePoolName}" will be deleted shortly By Admin...`);

    console.log("Deleting pool ID:", deletePoolId); // DEBUG

    setTimeout(async () => {
    const res = await fetch(`/pools/admin/${deletePoolId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    if (data.message) {
        location.reload();
    }
    else{
        showNotification(data.error);
    }
    }, 1500);
}

function deletePool(poolId, poolName) {
    deletePoolId = poolId;
    deletePoolName = poolName;

    document.getElementById("deleteText").innerHTML =
        `Confirm Delete pool: "${poolName}"? <br><br> <p style="color:tomato;">All chats will be deleted permanently!</p>`;

    //document.getElementById("deleteModal").classList.remove("hidden");
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
}
loadPools();