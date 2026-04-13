const { getAllPools } = require("../services/poolService");
const { createPool } = require("../services/poolService");
const { getPoolById, joinPool, isMember } = require("../services/poolService");

const db = require("../config/db");

/*
exports.getPools = async (req, res) => {
    try {
        const pools = await getAllPools();
        res.json(pools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
*/

exports.createPool = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Basic validation
        if (!name || !password) {
            return res.status(400).json({ error: "Name and password required" });
        }

         //const userId = 1; // TEMP (later from auth)
         const userId = req.user.id;

        await createPool(name, password, userId);

        res.json({ message: "Pool created successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 

exports.joinPool = async (req, res) => {
    try {
        const { poolId, password } = req.body;
        const userId = req.user.id;

        // check pool exists
        const [pool] = await db.query(
            "SELECT * FROM pools WHERE id = ?",
            [poolId]
        );

        if (!pool.length) {
            return res.status(404).json({ error: "Pool not found" });
        }

        // verify password
        if (pool[0].password !== password) {
            return res.status(401).json({ error: "Wrong password" });
        }

        // check if already joined
        const [existing] = await db.query(
            "SELECT * FROM pool_members WHERE pool_id = ? AND user_id = ?",
            [poolId, userId]
        );

        // IMPORTANT CHANGE HERE ↓↓↓
        if (existing.length) {
            return res.json({
                message: "already joined",
                poolId
            });
        }

        // insert membership
        await db.query(
            "INSERT INTO pool_members (pool_id, user_id) VALUES (?, ?)",
            [poolId, userId]
        );

        return res.json({
            message: "joined successfully",
            poolId
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPools = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, created_by FROM pools");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePool = async (req, res) => {
    try {
        const poolId = req.params.id;
        const userId = req.user.id;

        // 1. Get pool
        const [pool] = await db.query(
            "SELECT * FROM pools WHERE id = ?",
            [poolId]
        );

        if (!pool.length) {
            return res.status(404).json({ error: "Pool not found" });
        }

        // 2. Check ownership (IMPORTANT CHANGE: created_by)
        if (pool[0].created_by !== userId) {
            return res.status(403).json({ error: "Only creator can delete pool" });
        }

        // 3. Delete messages
        await db.query("DELETE FROM messages WHERE pool_id = ?", [poolId]);

        // 4. Delete members
        await db.query("DELETE FROM pool_members WHERE pool_id = ?", [poolId]);

        // 5. Delete pool
        await db.query("DELETE FROM pools WHERE id = ?", [poolId]);

        res.json({ message: "Pool deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Admin Logic----- Get all pools and delete any pool (without ownership check)
exports.getAllPools = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM pools");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.adminDeletePool = async (req, res) => {
    try {
        const poolId = req.params.id;

        await db.query("DELETE FROM messages WHERE pool_id = ?", [poolId]);
        await db.query("DELETE FROM pool_members WHERE pool_id = ?", [poolId]);
        await db.query("DELETE FROM pools WHERE id = ?", [poolId]);

        res.json({ message: "Pool deleted by admin" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};