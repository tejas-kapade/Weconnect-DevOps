require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/db");


const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Metacore@989/";

const app = express();

// Middleware
app.use(express.json());
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

        socket.user = decoded; // 👈 attach user

        next();

    } catch (err) {
        next(new Error("Invalid token"));
    }
});

//Socket Logic
io.on("connection", (socket) => {
    require("dotenv").config();
    
    console.log("User connected:", socket.id);

    // Join pool room
    socket.on("join_pool", (poolId) => {
        socket.join(`pool_${poolId}`);
        console.log(`User joined pool_${poolId}`);
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
server.listen(3000, () => {
    console.log("Server running on port 3000");
});