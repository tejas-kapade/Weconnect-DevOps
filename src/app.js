require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const client = require("prom-client");

const db = require("./config/db");

//const { connectDB } = require("./config/db");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Metacore@989/";
const PORT = Number(process.env.PORT) || 3000;

// const poolUsers = {}; // { poolId: Set(userIds) }

const app = express();
const register = new client.Registry();
const connectedSocketsGauge = new client.Gauge({
    name: "weconnect_connected_socket_clients",
    help: "Number of currently connected Socket.IO clients"
});
const httpRequestCounter = new client.Counter({
    name: "weconnect_http_requests_total",
    help: "Total HTTP requests handled by the app",
    labelNames: ["method", "route", "status_code"]
});
const httpRequestDuration = new client.Histogram({
    name: "weconnect_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

register.setDefaultLabels({ service: "weconnect-app" });
client.collectDefaultMetrics({ register });
register.registerMetric(connectedSocketsGauge);
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    const endTimer = httpRequestDuration.startTimer();

    res.on("finish", () => {
        const route = req.route?.path || req.baseUrl || req.path;
        const labels = {
            method: req.method,
            route,
            status_code: String(res.statusCode)
        };

        httpRequestCounter.inc(labels);
        endTimer(labels);
    });

    next();
});

app.use(express.static("public"));

// Test route
/*
app.get("/", (req, res) => {
    res.send("WeConnect Backend Running 🚀");
});
*/

const path = require("path");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error.message);
    }
});

//For routing requests to user routes
//const userRoutes = require("./routes/userRoutes");
//app.use("/user", userRoutes);

//For routing requests to pool routes
const poolRoutes = require("./routes/poolRoutes");
app.use("/pools", poolRoutes);

//For routing requests to message routes
const messageRoutes = require("./routes/messageRoutes");
app.use("/messages", messageRoutes);

//For Auth routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

//MIDDLEWARE FOR SOCKET.IO AUTHENTICATION
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("No token"));
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        socket.user = decoded; 

        next();

    } catch (err) {
        next(new Error("Invalid token"));
    }
});

//Socket Logic
io.on("connection", (socket) => {
    require("dotenv").config();
    
    console.log("User connected:", socket.id);
    connectedSocketsGauge.inc();

    // Join pool room
    socket.on("join_pool", (poolId) => {
        socket.join(`pool_${poolId}`);
        console.log(`User joined pool_${poolId}`);
        /*
        if (!poolUsers[poolId]) {
        poolUsers[poolId] = new Set();
        }

        poolUsers[poolId].add(userId);
        console.log(`Pool ${poolId} users:`, poolUsers[poolId]);

        io.to(poolId).emit("online_count", poolUsers[poolId].size);*/
    });

    // Send message in real-time
    socket.on("send_message", async (data) => {
    try {
        const { poolId, message } = data;

        const userId = socket.user.id;
        const username = socket.user.username;

        // Save to DB
        await db.query(
            "INSERT INTO messages (pool_id, sender_id, message) VALUES (?, ?, ?)",
            [poolId, userId, message]
        );

        // Broadcast Old Logic for broadcasting
        
        io.to(`pool_${poolId}`).emit("receive_message", {
            message,
            username,
            poolId,
            time: new Date()
        });
        
        /*
        //New logic for broadcasting with time formatting
        io.to(data.poolId).emit("receive_message", {
            username: data.username,
            message: data.message,
            time: new Date() //IMPORTANT
        }); */

    } catch (err) {
        console.error(err);
    }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        connectedSocketsGauge.dec();
        /*
        for (let poolId in poolUsers) {
        poolUsers[poolId].delete(socket.userId);

        io.to(poolId).emit("online_count", poolUsers[poolId].size);
        }
        */
    });
});

// Server
/*
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
*/

//IMPORTANT: use server.listen NOT app.listen
/* Old code, before adding DB connection retry logic */
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/*Below code should be added to ensure that server starts only after DB connection is established, and also adds retry logic for DB connection
(async () => {
    await connectDB();
    app.listen(3000, () => console.log("Server running"));
})();
*/
