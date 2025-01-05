import User from '../models/User.js';
import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';  

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id firstName lastName email role lastLogin picturePath isActive');
    console.log('Fetched users:', users); // Log the users to debug
    const usersWithFullName = users.map(user => ({
      id: user._id, 
      userName: user.userName,
      fullName: `${user.firstName} ${user.lastName}`, // Combine first and last name
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      picturePath: user.picturePath,
      isActive: user.isActive
    }));

    res.status(200).json(usersWithFullName);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};




// Promote a user to Assistant Admin
export const promoteToAssistantAdmin = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const user = await User.findByIdAndUpdate(id, { role: 'assistantAdmin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User promoted to Assistant Admin', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
};

// Demote to User
export const demoteToUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const user = await User.findByIdAndUpdate(id, { role: 'user' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User demoted to User', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to demote user' });
  }
};

// toggleUserActiveStatus user is active and deactivated
export const toggleUserActiveStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
};

export const toggleCampaignStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    campaign.isActive = !campaign.isActive;
    await campaign.save();

    res.status(200).json({ message: `Campaign ${campaign.isActive ? 'enabled' : 'disabled'}`, campaign });
  } catch (error) {
    res.status(500).json({ error: "Failed to update campaign status" });
  }
};

export const getAllCampaign = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("createdBy", "firstName lastName username picturePath") 
      .lean();

    res.status(200).json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to retrieve campaigns" });
  }
};

export const getAllCampaignTest = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
    res.status(200).json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to retrieve campaigns" });
  }
};


export const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    // Log the received ID to verify it's correct
    console.log("Deleting campaign with ID:", id);

    // Delete the campaign from the database
    const deletedCampaign = await Campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // Return a success response
    res.status(200).json({ message: 'Campaign deleted successfully.' });
  } catch (error) {
    console.error("Error deleting campaign:", error);  // Log the error for debugging
    res.status(500).json({ message: 'Error deleting campaign.', error: error.message });
  }
};
