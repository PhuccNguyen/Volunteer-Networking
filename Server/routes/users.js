import express from 'express';
import {
    getUser, getUserFriends,
    deleteUserFriend, 
    updateUser,
    savePosts,
    getSavedPosts,
    getUserJoinedCampaigns,
    updateUserAchievements,
    updateProfilePic ,
} from "../controllers/users.js";
import { verifyToken } from '../middleware/auth.js';
import { passwordLimiter, contactUpdateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeInput, validateEmail, validateMobile } from '../middleware/validation.js';
import multer from 'multer'; // File upload handler
import crypto from 'crypto';
import path from 'path';  // Make sure to import the path module
const router = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage 
({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/'); 
  },
  filename: function (req, file, cb) {

    const originalName = path.parse(file.originalname).name;  // Get the name without extension
    const extension = path.extname(file.originalname);  // Get the file extension

    // Create a new filename with a unique suffix
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const newFileName = `${originalName}-${uniqueSuffix}${extension}`;

    // Save the file with the new filename in the request object for MongoDB
    req.file = { filename: newFileName };

    cb(null, newFileName); 
  }
});

// Initialize multer with the storage configuration
const upload = multer
({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB file size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


// Get user profile
router.get("/:id", verifyToken, getUser);

// Update user information with security validation
router.patch("/:id", verifyToken, sanitizeInput, validateEmail, validateMobile, contactUpdateLimiter, updateUser);

// Dedicated route for password changes with enhanced security
router.patch("/:id/password", verifyToken, passwordLimiter, sanitizeInput, updateUser);

// Route for updating user profile picture
router.post("/:id/updateProfilePic", verifyToken, upload.single('file'), updateProfilePic);

// Delete a friend
router.delete("/:id/friends/:friendId", verifyToken, deleteUserFriend);

// Get user friends
router.get("/:id/friends", verifyToken, getUserFriends);

// Save or unsave a post
router.post("/:id/saved", (req, res, next) => {
       console.log("Middleware: Route accessed");
    next();
}, verifyToken, (req, res, next) => {
    console.log("Middleware: Token verified");
    next();
}, savePosts);

// Get all saved posts
router.post("/:id/savedPosts", verifyToken, getSavedPosts);


// Endpoint to get all campaigns a user has joined
router.get("/:userId/joinedcampaigns", verifyToken, getUserJoinedCampaigns);

// Route to get user profile with achievements
router.get("/:id/profileWithAchievements", verifyToken, async (req, res) => {
    try {
      const userId = req.params.id;
      const profile = await updateUserAchievements(userId); 
  
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(profile);
    } catch (error) {
      console.error("Error fetching user profile with achievements:", error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  });


export default router;
