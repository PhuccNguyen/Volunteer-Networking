import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "crypto";
import http from "http";
import { Server } from "socket.io";

// Import Routes
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import postsRoutes from "./routes/post.js";
import friendRoutes from "./routes/friend.js";
import adminRoutes from "./routes/admin.js";
import volunteerRoutes from "./routes/volunteer.js";
import notificationRoutes from "./routes/notifications.js";

// Import Controllers
import { createPost } from "./controllers/post.js";
import { register } from "./controllers/auth.js";
import { createCampaign } from "./controllers/campaign.js";
import { searchInformation } from "./controllers/search.js";

// Import Middleware
import { verifyToken, verifyAssistantAdmin } from "./middleware/auth.js";
import { apiLimiter, authLimiter, passwordLimiter, contactUpdateLimiter } from "./middleware/rateLimiter.js";
import { sanitizeInput, validateRegistration } from "./middleware/validation.js";

// Load environment variables
dotenv.config();

// Configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Security Middleware - Apply security headers first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// CORS Configuration - More restrictive for security
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://phuccnguyen.github.io'] // Only allow production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Dev domains
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing with security limits
app.use(express.json({ limit: "10mb" })); // Reduced from 30mb for security
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Logging
app.use(morgan("combined")); // More detailed logging for security

// Static files with security headers
app.use("/assets", express.static(path.join(__dirname, "public/assets"), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Apply general API rate limiting to all routes
app.use(apiLimiter);

// Remove debug logging for production security
if (process.env.NODE_ENV !== 'production') {
  console.log("MONGO_URL:", process.env.MONGO_URL ? "***SET***" : "NOT SET");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "***SET***" : "NOT SET");
  console.log("PORT:", process.env.PORT);
}

// File storage (multer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    // Generate a unique identifier
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const originalName = path.parse(file.originalname).name; // Get name without extension
    const extension = path.extname(file.originalname); // Get the file extension

    // New filename with unique suffix
    const newFileName = `${originalName}-${uniqueSuffix}${extension}`;
    req.file = { ...req.file, filename: newFileName }; // Store filename in req.file for MongoDB storage

    cb(null, newFileName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


// Routes with files - Apply specific rate limiting
app.post("/auth/register", authLimiter, sanitizeInput, validateRegistration, upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
app.post("/campaigns", verifyToken, verifyAssistantAdmin, upload.single("imageCampaing"), createCampaign);
app.get("/search", verifyToken, searchInformation);

// Routes with rate limiting
app.use("/auth", authLimiter, authRoutes);
app.use("/users", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/friends", verifyToken, friendRoutes);
app.use("/volunteer", volunteerRoutes);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationRoutes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});
// Socket.IO: Track and handle connections
io.onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on("registerUser", (userId) => {
    io.onlineUsers.set(userId, socket.id);

    console.log(`User ${userId} registered for notifications`);
  });

  socket.on("disconnect", () => {
    const userId = Array.from(io.onlineUsers.entries()).find(([_, value]) => value === socket.id)?.[0];
    io.onlineUsers.delete(userId);
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Export Socket.IO instance
export { io };

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 4001;
mongoose.connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("MongoDB connection successful");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
