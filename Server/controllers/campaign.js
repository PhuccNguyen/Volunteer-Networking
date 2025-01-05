import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";

// Controller for creating a new campaign
export const createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      registrationStartDate,
      registrationEndDate,
      maxVolunteers,
      location,
      campaignStartDate,
      campaignStartTime,
      campaignEndDate,
      campaignEndTime,
      milestones,
      createdBy,
    } = req.body;

    // Parse milestones if needed
    let parsedMilestones = [];
    if (milestones) {
      parsedMilestones = JSON.parse(milestones);
    }

    const imageCampaing = req.file ? req.file.filename : null;

    // Create a new Campaign document
    const newCampaign = new Campaign({
      title,
      description,
      registrationStartDate,
      registrationEndDate,
      maxVolunteers,
      location,
      campaignStartDate,
      campaignStartTime,
      campaignEndDate,
      campaignEndTime,
      milestones: parsedMilestones,
      createdBy: new mongoose.Types.ObjectId(createdBy), // Ensure that this is an ObjectId
      imageCampaing, // Handle image upload\
    });

    // Save the campaign to the database
    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

// Fetch all campaigns created by the logged-in user
export const getAllCampaignsForManage = async (req, res) => {
  try {
    // Extract the user ID from the JWT token
    const userId = req.user.id;

    // Find campaigns created by the user
    const campaigns = await Campaign.find({ createdBy: userId })
      .populate("createdBy", "username picturePath") // Populate the user's name and profile picture
      .sort({ createdAt: -1 }) // Sort by newest first (optional)
      .lean();

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching user's campaigns:", error);
    res.status(500).json({ error: "Failed to fetch user's campaigns" });
  }
};

export const registerCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id; // Extract userId from the verified JWT token

    // Find the campaign by ID
    const campaign = await Campaign.findById(campaignId);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    // Check if the campaign has ended
    const currentDate = new Date();
    if (campaign.registrationEndDate < currentDate) {
      return res
        .status(400)
        .json({ message: "This campaign has already ended" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the user is already registered for the campaign
    if (user.joinedCampaigns.includes(campaignId)) {
      return res
        .status(400)
        .json({ message: "You are already registered for this campaign" });
    }

    // Add the campaign to the user's joined campaigns
    user.joinedCampaigns.push(campaignId);
    await user.save();

    // Respond with success
    res
      .status(200)
      .json({ message: "Successfully registered for the campaign" });
  } catch (error) {
    console.error("Error during campaign registration:", error);
    res.status(500).json({
      message: "An error occurred while registering for the campaign",
    });
  }
};

export const getManagedCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find campaigns created by the logged-in assistant admin or admin
    const campaigns = await Campaign.find({ createdBy: userId });

    if (!campaigns || campaigns.length === 0) {
      return res
        .status(404)
        .json({ message: "No campaigns found for this user" });
    }

    res.status(200).json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit a specific campaign
export const editCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const updatedData = req.body;

  try {
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      updatedData,
      { new: true }
    );
    if (!updatedCampaign)
      return res.status(404).json({ error: "Campaign not found" });
    res.status(200).json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ error: "Error editing campaign" });
  }
};

// Delete a specific campaign
export const deleteCampaign = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);
    if (!deletedCampaign)
      return res.status(404).json({ error: "Campaign not found" });
    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting campaign" });
  }
};

export const getCampaignCounts = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user.id;

    // Count Upcoming Campaigns (registration has not started yet)
    const upcomingCount = await Campaign.countDocuments({
      createdBy: userId,
      registrationStartDate: { $gt: now },
    });

    // Count Ongoing Campaigns (registration is active or campaign has started but not ended)
    const ongoingCount = await Campaign.countDocuments({
      createdBy: userId,
      $or: [
        {
          registrationStartDate: { $lte: now },
          registrationEndDate: { $gte: now },
        },
        {
          campaignStartDate: { $lte: now },
          campaignEndDate: { $gte: now },
        },
      ],
    });

    // Count Ended Campaigns (campaign end date is in the past)
    const endedCount = await Campaign.countDocuments({
      createdBy: userId,
      campaignEndDate: { $lt: now },
    });

    res.status(200).json({
      upcoming: upcomingCount,
      ongoing: ongoingCount,
      ended: endedCount,
    });
  } catch (error) {
    console.error("Error fetching campaign counts:", error);
    res.status(500).json({ error: "Failed to fetch campaign counts" });
  }
};

export const getCampaignsByStatus = async (req, res) => {
  const { status } = req.query;
  const now = new Date();
  const userId = req.user.id;
  

  try {
    let campaigns;

    if (status === "upcoming") {
      // Upcoming campaigns: registration has not started yet
      campaigns = await Campaign.find({
        createdBy: userId,
        registrationStartDate: { $gt: now },
      });
      
    } else if (status === "ongoing") {
      // Ongoing campaigns: in the registration period or actively in progress
      campaigns = await Campaign.find({
        createdBy: userId,
        $or: [
          {
            // Registration period active
            registrationStartDate: { $lte: now },
            registrationEndDate: { $gte: now },
          },
          {
            // Campaign has started and is ongoing
            campaignStartDate: { $lte: now },
            campaignEndDate: { $gte: now },
          },
        ],
      });
    } else if (status === "ended") {
      // Ended campaigns: campaign has completed
      campaigns = await Campaign.find({
        createdBy: userId,
        campaignEndDate: { $lt: now },
      });
    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns by status:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

export const getCampaignsByStatusUser = async (req, res) => {
  const { status } = req.query;
  const now = new Date();

  try {
    let campaigns;

    if (status === "upcoming") {
      // Campaigns where registration has not started yet
      campaigns = await Campaign.find({ registrationStartDate: { $gt: now } })
        .sort({ registrationStartDate: 1 })
        .populate("createdBy", "firstName lastName picturePath") // Populate with username and picturePath
        .lean();
    } else if (status === "ongoing") {
      // Campaigns that are ongoing (within registration or campaign period)
      campaigns = await Campaign.find({
        $or: [
          {
            registrationStartDate: { $lte: now },
            registrationEndDate: { $gte: now },
          },
          { campaignStartDate: { $lte: now }, campaignEndDate: { $gte: now } },
        ],
      })
        .sort({ campaignStartDate: 1 })
        .populate("createdBy", "firstName lastName picturePath") // Populate with username and picturePath
        .lean();
    } else if (status === "ended") {
      // Campaigns that have already ended
      campaigns = await Campaign.find({ campaignEndDate: { $lt: now } })
        .sort({ campaignEndDate: -1 })
        .populate("createdBy", "firstName lastName picturePath") // Populate with username and picturePath
        .lean();
    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns by status:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

// Helper function to calculate volunteer demographics (gender and age) for the campaign
const calculateVolunteerDemographics = async (campaignId) => {
  
  // Count gender demographics
  const genderData = await User.aggregate([
    { $match: { joinedCampaigns: campaignId } },
    { $group: { _id: "$gender", count: { $sum: 1 } } },
  ]);

  // Count age demographics
  const ageData = await User.aggregate([
    { $match: { joinedCampaigns: campaignId } },
    {
      $project: {
        age: { $subtract: [new Date().getFullYear(), { $year: "$birthday" }] },
      },
    },
    {
      $bucket: {
        groupBy: "$age",
        boundaries: [12, 18, 25, 35, 45, 60, 120],
        default: "Unknown",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const formattedAgeData = ageData.map((bucket) => ({
    range:
      bucket._id === "Unknown" ? "Unknown" : `${bucket._id}–${bucket._id + 5}`,
    count: bucket.count,
  }));

  // Count location demographics
  const locationData = await User.aggregate([
    { $match: { joinedCampaigns: campaignId } },
    { $group: { _id: "$location", count: { $sum: 1 } } },
  ]);

  return {
    genderData,
    ageData: formattedAgeData,
    locationData,
  };
};

// Get all assistant admins and their campaigns with detailed information
export const getAssistantAdminsAndCampaigns = async (req, res) => {
  try {
    const assistantAdmins = await User.find(
      { role: "assistantAdmin" },
      "_id username picturePath"
    );

    const campaigns = await Campaign.find()
      .populate("createdBy", "username picturePath")
      .lean();

    const processedCampaigns = await Promise.all(
      campaigns.map(async (campaign) => {
        const totalVolunteers = await User.countDocuments({
          joinedCampaigns: campaign._id,
        });

        const status = calculateCampaignStatus(campaign);
        const progress = calculateCampaignProgress(campaign, status);
        const demographics = await calculateVolunteerDemographics(campaign._id);

        return {
          ...campaign,
          goal: campaign.maxVolunteers,
          status,
          progress,
          totalVolunteers,
          demographics,
        };
      })
    );

    res.status(200).json({ assistantAdmins, campaigns: processedCampaigns });
  } catch (error) {
    console.error("Error fetching assistant admins and campaigns:", error);
    res.status(500).json({ error: "Failed to retrieve data" });
  }
};

// Helper function to calculate campaign progress based on milestones and status
const calculateCampaignProgress = (campaign, status) => {
  const { milestones } = campaign;
  if (!milestones || milestones.length === 0) return 0;

  // Sort milestones by percentage to track progress stages in ascending order
  const sortedMilestones = [...milestones].sort(
    (a, b) => parseFloat(a.percentage) - parseFloat(b.percentage)
  );
  // Calculate progress based on status
  if (status === "Upcoming") {
    return parseFloat(sortedMilestones[0].percentage) || 0;
  } else if (status === "Ongoing") {

    // Find the current milestone based on completion dates
    const now = new Date();
    for (let milestone of sortedMilestones) {
      if (!milestone.completed && new Date() < new Date(milestone.targetDate)) {
        return parseFloat(milestone.percentage);
      }
    }
    return (
      parseFloat(sortedMilestones[sortedMilestones.length - 1].percentage) ||
      100
    );
  } else {
    return 100;
  }
};

// Helper function to determine the status of the campaign based on start and end dates
const calculateCampaignStatus = (campaign) => {
  const now = new Date();
  if (now < new Date(campaign.campaignStartDate)) return "Upcoming";
  if (now > new Date(campaign.campaignEndDate)) return "Completed";
  return "Ongoing";
};
