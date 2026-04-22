const db = require("../config/db");

exports.runQuery = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== "string" || !query.trim()) {
            return res.status(400).json({ error: "Query is required" });
        }

        const trimmedQuery = query.trim();
        const [rows] = await db.query(trimmedQuery);

        if (Array.isArray(rows)) {
            return res.json({
                type: "rows",
                count: rows.length,
                rows
            });
        }

        return res.json({
            type: "result",
            result: rows
        });
    } catch (err) {
        return res.status(400).json({
            error: err.sqlMessage || err.message || "Query execution failed"
        });
    }
};
