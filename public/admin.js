const token = localStorage.getItem("token");

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

async function deletePool(id, name) {
    if (!confirm(`Delete ${name}?`)) return;

    const res = await fetch(`/pools/admin/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    if (data.message) {
        alert("Deleted");
        loadPools();
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

loadPools();