import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';


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
      createdBy
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
      createdBy: new mongoose.Types.ObjectId(createdBy),  // Ensure that this is an ObjectId
      imageCampaing,  // Handle image upload\
    });

    // Save the campaign to the database
    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
};



// Controller to get all campaigns, categorized as upcoming, ongoing, or past
export const getAllCampaigns = async (req, res) => {
  try {
    const currentDate = new Date();

    // // Fetch all campaigns and populate the creator's details
    // const campaigns = await Campaign.find()
    //   .populate('createdBy', 'firstName lastName picturePath')
    //   .exec();

    //    // Count Upcoming Campaigns (registration has not started yet)
    // const upcomingCount = await Campaign.countDocuments({
    //   registrationStartDate: { $gt: now },
    // });

    // // Count Ongoing Campaigns (registration is active or campaign is ongoing but not ended)
    // const ongoingCount = await Campaign.countDocuments({
    //   $and: [
    //     {
    //       $or: [
    //         { registrationStartDate: { $lte: now }, registrationEndDate: { $gte: now } }, // Active registration period
    //         { campaignStartDate: { $lte: now }, campaignEndDate: { $gte: now } }, // Campaign is ongoing
    //       ]
    //     },
    //     {
    //       campaignEndDate: { $gte: now }, // Ensure campaign has not ended
    //     }
    //   ]
    // });

    // // Count Ended Campaigns (campaign has ended)
    // const endedCount = await Campaign.countDocuments({
    //   campaignEndDate: { $lt: now },
    // });

    res.status(200).json({
      upcoming: upcomingCampaigns,
      ongoing: ongoingCampaigns,
      past: pastCampaigns,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

// // Controller to get all campaigns, categorized as upcoming, ongoing, or past
// export const getAllCampaignsForManage = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const userId = req.user.id;

//     // Fetch campaigns created by the logged-in user
//     const campaigns = await Campaign.find({ createdBy: userId })
//       .populate('createdBy', 'firstName lastName picturePath')
//       .exec();

//     // Categorize campaigns by date
//     const upcomingCampaigns = campaigns.filter(
//       (campaign) => new Date(campaign.campaignStartDate) > currentDate
//     );
//     const ongoingCampaigns = campaigns.filter(
//       (campaign) =>
//         new Date(campaign.campaignStartDate) <= currentDate &&
//         new Date(campaign.campaignEndDate) >= currentDate
//     );
//     const pastCampaigns = campaigns.filter(
//       (campaign) => new Date(campaign.campaignEndDate) < currentDate
//     );

//     res.status(200).json({
//       upcoming: upcomingCampaigns,
//       ongoing: ongoingCampaigns,
//       past: pastCampaigns,
//     });
//   } catch (error) {
//     console.error("Error fetching campaigns:", error);
//     res.status(500).json({ error: "Failed to fetch campaigns" });
//   }
// };


export const registerCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id; // Extract userId from the verified JWT token

    // Find the campaign by ID
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Check if the campaign has ended
    const currentDate = new Date();
    if (campaign.campaignEndDate < currentDate) {
      return res.status(400).json({ message: "This campaign has already ended" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the user is already registered for the campaign
    if (user.joinedCampaigns.includes(campaignId)) {
      return res.status(400).json({ message: "You are already registered for this campaign" });
    }

    // Add the campaign to the user's joined campaigns
    user.joinedCampaigns.push(campaignId);
    await user.save();

    // Respond with success
    res.status(200).json({ message: "Successfully registered for the campaign" });
  } catch (error) {
    console.error("Error during campaign registration:", error);
    res.status(500).json({ message: "An error occurred while registering for the campaign" });
  }
};



export const getManagedCampaigns = async (req, res) => {
  try {
    const userId = req.user.id; 

    // Find campaigns created by the logged-in assistant admin or admin
    const campaigns = await Campaign.find({ createdBy: userId });

    if (!campaigns || campaigns.length === 0) {
      return res.status(404).json({ message: "No campaigns found for this user" });
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
    const updatedCampaign = await Campaign.findByIdAndUpdate(campaignId, updatedData, { new: true });
    if (!updatedCampaign) return res.status(404).json({ error: 'Campaign not found' });
    res.status(200).json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ error: 'Error editing campaign' });
  }
};

// Delete a specific campaign
export const deleteCampaign = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);
    if (!deletedCampaign) return res.status(404).json({ error: 'Campaign not found' });
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting campaign'});
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
        }
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
          }
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
        .populate('createdBy', 'firstName lastName picturePath') // Populate with username and picturePath
        .lean();
    } else if (status === "ongoing") {
      // Campaigns that are ongoing (within registration or campaign period)
      campaigns = await Campaign.find({
        $or: [
          { registrationStartDate: { $lte: now }, registrationEndDate: { $gte: now } },
          { campaignStartDate: { $lte: now }, campaignEndDate: { $gte: now } }
        ]
      })
        .sort({ campaignStartDate: 1 })
        .populate('createdBy', 'firstName lastName picturePath') // Populate with username and picturePath
        .lean();
    } else if (status === "ended") {
      // Campaigns that have already ended
      campaigns = await Campaign.find({ campaignEndDate: { $lt: now } })
        .sort({ campaignEndDate: -1 })
        .populate('createdBy', 'firstName lastName picturePath') // Populate with username and picturePath
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


// Get all assistant admins and their campaigns with detailed information
export const getAssistantAdminsAndCampaigns = async (req, res) => {
  try {
    // Fetch assistant admins with limited fields
    const assistantAdmins = await User.find({ role: "assistantAdmin" }, '_id username picturePath');

    // Fetch campaigns and populate necessary details
    const campaigns = await Campaign.find()
      .populate('createdBy', 'username picturePath') // Populate createdBy with username and picturePath
      .lean();

    // Process each campaign to include extra details for frontend
    const processedCampaigns = await Promise.all(
      campaigns.map(async (campaign) => {
        // Count total volunteers if joinedCampaigns is populated in the user model
        const totalVolunteers = await User.countDocuments({ joinedCampaigns: campaign._id });
        
        // Calculate progress as an example (can be based on milestones or other logic)
        const progress = calculateCampaignProgress(campaign.milestones);

        // Generate a basic demographic breakdown (e.g., male vs. female volunteers)
        const demographics = await calculateVolunteerDemographics(campaign._id);

        // Structure processed campaign data
        return {
          ...campaign,
          goal: campaign.maxVolunteers, // Assume maxVolunteers as goal
          status: calculateCampaignStatus(campaign), // Calculate based on campaign dates
          progress,
          totalVolunteers,
          demographics, // Demographic breakdown
        };
      })
    );

    // Prepare the response data
    const data = {
      assistantAdmins,
      campaigns: processedCampaigns,
    };

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching assistant admins and campaigns:", error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
};

// Helper function to calculate campaign progress based on milestones
const calculateCampaignProgress = (milestones) => {
  if (!milestones || milestones.length === 0) return 0;
  const completedMilestones = milestones.filter(m => m.completed).length;
  return Math.round((completedMilestones / milestones.length) * 100);
};

// Helper function to determine the status of the campaign based on start and end dates
const calculateCampaignStatus = (campaign) => {
  const now = new Date();
  if (now < new Date(campaign.campaignStartDate)) return "Upcoming";
  if (now > new Date(campaign.campaignEndDate)) return "Completed";
  return "Ongoing";
};

// Helper function to calculate volunteer demographics for the campaign
const calculateVolunteerDemographics = async (campaignId) => {
  const maleVolunteers = await User.countDocuments({ joinedCampaigns: campaignId, gender: "male" });
  const femaleVolunteers = await User.countDocuments({ joinedCampaigns: campaignId, gender: "female" });
  return [
    { name: "Male", value: maleVolunteers },
    { name: "Female", value: femaleVolunteers },
  ];
};