// In friend.js (or wherever your route handlers are defined)
import express from 'express';
import { sendFriendRequest, acceptFriendRequest, removeFriend, followUser, unfollowUser } from "../controllers/friend.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


// Example route with verifyToken
router.post('/send-request/:senderId/:friendId', verifyToken, sendFriendRequest);

router.patch("/accept-request/:friendId", verifyToken, acceptFriendRequest);
router.delete("/remove-friend/:friendId", verifyToken, removeFriend);

// Follow-related routes
router.post("/follow/:friendId", verifyToken, followUser);
router.delete("/unfollow/:friendId", verifyToken, unfollowUser);

export default router;