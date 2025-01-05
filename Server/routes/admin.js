import express from 'express';
import { promoteToAssistantAdmin, demoteToUser, getAllUsers, toggleUserActiveStatus, getAllCampaignTest, deleteCampaign, toggleCampaignStatus, getAllCampaign  } from '../controllers/admin.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { getAssistantAdminsAndCampaigns } from '../controllers/campaign.js'

const router = express.Router();

// Get all users with their roles
router.get('/users', verifyToken, verifyAdmin, getAllUsers);

router.get('/campaignadmin', verifyToken, verifyAdmin, getAllCampaign);

router.get('/campaignadmins', verifyToken, verifyAdmin, getAllCampaignTest);


// Promote user to Assistant Admin
router.patch('/promote/:id', verifyToken, verifyAdmin, promoteToAssistantAdmin);

// Demote Assistant Admin to User
router.patch('/demote/:id', verifyToken, verifyAdmin, demoteToUser);

// Toggle user active status
router.patch('/toggle-user-status/:id', verifyToken, verifyAdmin, toggleUserActiveStatus);

// Get assistant admins and their campaigns
router.get('/assistant-admins-campaigns', verifyToken, verifyAdmin, getAssistantAdminsAndCampaigns);

// Add a delete campaign endpoint
router.delete('/campaigns/:id', verifyToken, verifyAdmin, deleteCampaign);

// Toggle campaign active status
router.patch('/toggle-campaign-status/:id', verifyToken, verifyAdmin, toggleCampaignStatus);





export default router;
