const token = localStorage.getItem("token");

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
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

function setOutput(content) {
    document.getElementById("queryOutput").textContent = content;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatCellValue(value) {
    if (value === null || value === undefined) {
        return '<span class="admin-null">NULL</span>';
    }

    if (typeof value === "object") {
        return escapeHtml(JSON.stringify(value));
    }

    return escapeHtml(value);
}

function renderRowsTable(rows, count) {
    const output = document.getElementById("queryOutput");

    if (!rows.length) {
        output.innerHTML = `
            <div class="admin-output-meta">Query OK, 0 rows returned</div>
            <div class="admin-output-empty">Empty set</div>
        `;
        return;
    }

    const columns = Object.keys(rows[0]);
    const headerHtml = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const bodyHtml = rows
        .map((row) => {
            const cells = columns
                .map((column) => `<td>${formatCellValue(row[column])}</td>`)
                .join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    output.innerHTML = `
        <div class="admin-output-meta">${count} row${count === 1 ? "" : "s"} returned</div>
        <div class="admin-table-wrap">
            <table class="admin-output-table">
                <thead>
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody>
                    ${bodyHtml}
                </tbody>
            </table>
        </div>
    `;
}

function renderResult(result) {
    const output = document.getElementById("queryOutput");
    output.innerHTML = `
        <div class="admin-output-meta">Query executed successfully</div>
        <pre class="admin-result-json">${escapeHtml(JSON.stringify(result, null, 2))}</pre>
    `;
}

if (!token) {
    showNotification("Unauthorized. Redirecting to login...");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

const user = parseJwt(token);
if (!user || user.role !== "admin") {
    showNotification("Admin access only. Redirecting...");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

async function runQuery() {
    const query = document.getElementById("queryInput").value.trim();

    if (!query) {
        showNotification("Please enter a SQL query.");
        return;
    }

    setOutput("Running query...");

    try {
        const res = await fetch("/admin/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ query })
        });

        const data = await res.json();

        if (!res.ok) {
            setOutput(data.error || "Query failed.");
            return;
        }

        if (Array.isArray(data.rows)) {
            renderRowsTable(data.rows, data.count || data.rows.length);
            return;
        }

        renderResult(data.result || data);
    } catch (err) {
        setOutput("Request failed. Please try again.");
    }
}

document.getElementById("queryInput").addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        runQuery();
    }
});
