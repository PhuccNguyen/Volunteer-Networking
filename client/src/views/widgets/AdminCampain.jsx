import React, { useState, useEffect } from "react";
// Import necessary hooks
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Avatar,
} from "@mui/material";
import { Search, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import UserImage from "components/UserImage";

const CampaignPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(0); // 0 for ongoing, 1 for completed
  const [campaigns, setCampaigns] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false); // State to manage Enable/Disable button
  const [selectedCampaign, setSelectedCampaign] = useState(null); // For campaign details
  const [campaignToDelete, setCampaignToDelete] = useState(null); // For delete dialog
  const token = useSelector((state) => state.token);
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/admin/campaignadmin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Ensure token is valid
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
        } else {
          console.error("Expected an array of campaigns, but received:", data);
          setCampaigns([]); // Fallback to empty array if no valid data
        }
      })
      .catch((error) => {
        console.error("Error fetching campaigns:", error);
        setCampaigns([]); // Fallback to empty array on error
      });
  }, []); // Runs once when the component mounts

  // Handle close confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setErrorMessage(""); // Reset error message
    setSuccessMessage(""); // Reset success message
  };

  const openDeleteDialog = (campaignId) => {
    setDeleteDialogOpen(true);
    setSelectedCampaignId(campaignId); // Store the campaign ID to delete
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaignId) return; // Ensure campaign ID is available

    setLoading(true); // Show loading indicator

    try {
      // Perform DELETE request
      const response = await fetch(
        `http://localhost:3001/admin/campaigns/${selectedCampaignId}`,
        {
          method: "DELETE", // Use DELETE method
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Make sure token is passed
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to delete campaign");
      }

      // Update campaigns after successful deletion
      setCampaigns((prev) =>
        prev.filter((campaign) => campaign._id !== selectedCampaignId)
      );
      setSuccessMessage("Campaign deleted successfully");
      setDeleteDialogOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error deleting campaign:", error);
      setErrorMessage(
        error.message ||
          "An unexpected error occurred while deleting the campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtering campaigns based on the search query
  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Your existing JSX rendering code for the campaigns

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  function getCampaignStatus(startDate, endDate) {
    const currentDate = new Date();
    const registrationStartDate = new Date(startDate);
    const registrationEndDate = new Date(endDate);

    if (
      currentDate >= registrationStartDate &&
      currentDate <= registrationEndDate
    ) {
      return "Ongoing";
    } else if (currentDate > registrationEndDate) {
      return "Ended";
    } else {
      return "Upcoming"; // In case the campaign hasn't started yet.
    }
  }

  const handleEditCampaign = (campaignId) => {
    if (window.confirm("Are you sure you want to edit this campaign?")) {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign._id === campaignId
            ? { ...campaign, title: campaign.title + " (edited)" } // Example of editing
            : campaign
        )
      );
    }
  };

  const handleCloseDialog = () => {
    setSelectedCampaign(null);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const toggleDisableButton = () => {
    setIsDisabled((prevState) => !prevState);
  };

  return (
    <Box padding="2rem">
      <Box display="flex" alignItems="center" mb={3}>
        <InputBase
          placeholder="Search campaigns by title or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        />
        <IconButton
          sx={{
            ml: 2,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            padding: "0.75rem",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          onClick={() => setSearchQuery(searchQuery.trim())}
        >
          <Search />
        </IconButton>
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} centered>
        <Tab label="All Campaigns" />
      </Tabs>

      <Grid container spacing={4} mt={1}>
        {filteredCampaigns.map((campaign) => (
          <Grid item xs={12} md={6} lg={4} key={campaign._id}>
            <Card
              sx={{
                borderRadius: "16px", // Slightly rounder corners
                boxShadow: "0 6px 15px rgba(0,0,0,0.1)", // Subtle elevation for better separation
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <UserImage
                    image={
                      campaign.createdBy?.picturePath || "/default-image.jpg"
                    }
                    alt={`${campaign.createdBy?.firstName || "Unknown"} ${
                      campaign.createdBy?.lastName || "User"
                    }`}
                    size="40px" // Slightly larger image
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginLeft: "12px" }} // Adjust spacing
                  >
                    {`${campaign.createdBy?.firstName || "Unknown"} ${
                      campaign.createdBy?.lastName || "User"
                    }`}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {campaign.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px", // Adds some spacing between text and icons
                  }}
                >
                  📍 Location: {campaign.location}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  👥 Volunteers: {campaign.maxVolunteers}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  🗓️ {campaign.campaignStartDate} - {campaign.campaignEndDate}
                </Typography>
              </CardContent>

              <CardActions sx={{ padding: "16px" }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleCampaignClick(campaign)}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    padding: "10px 0", // Add padding for better click experience
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedCampaign && (
        <Dialog
          open={!!selectedCampaign}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#fff",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f4f6f8",
              padding: "24px",
              borderBottom: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {selectedCampaign.title}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color:
                  selectedCampaign.status === "active"
                    ? "#000000"
                    : selectedCampaign.status === "inactive"
                    ? "#000000"
                    : "#000000",
                fontWeight: "bold",
              }}
            >
              Status:{" "}
              {getCampaignStatus(
                selectedCampaign.registrationStartDate,
                selectedCampaign.registrationEndDate
              )}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ padding: "24px" }}>
            {/* Campaign Image Section */}
            {selectedCampaign.imageCampaing && (
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <img
                  src={`http://localhost:3001/assets/${selectedCampaign.imageCampaing}`}
                  alt={selectedCampaign.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}

            {/* Description Section */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Description
            </Typography>
            <Typography
              paragraph
              sx={{
                marginBottom: "24px",
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              {selectedCampaign.description || "No description provided."}
            </Typography>

            {/* Details Section */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Campaign Details
            </Typography>
            <Grid container spacing={2} sx={{ marginBottom: "24px" }}>
              <Grid item xs={6}>
                <Typography color="text.secondary">
                  <strong>Location:</strong>{" "}
                  {selectedCampaign.location || "Not specified"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">
                  <strong>Volunteers: </strong>
                  {selectedCampaign.maxVolunteers || "N/A"}
                </Typography>
              </Grid>

              {/* Registration Period */}
              <Grid item xs={6}>
                <Typography color="text.secondary">
                  <strong>Registration Period:</strong>{" "}
                  {selectedCampaign.registrationStartDate &&
                  selectedCampaign.registrationEndDate
                    ? `${new Date(
                        selectedCampaign.registrationStartDate
                      ).toLocaleDateString()} - ${new Date(
                        selectedCampaign.registrationEndDate
                      ).toLocaleDateString()}`
                    : "Not specified"}
                </Typography>
              </Grid>

              {/* Campaign Duration */}
              <Grid item xs={6}>
                <Typography color="text.secondary">
                  <strong>Campaign Duration:</strong>{" "}
                  {selectedCampaign.campaignStartDate &&
                  selectedCampaign.campaignEndDate
                    ? `${new Date(
                        selectedCampaign.campaignStartDate
                      ).toLocaleDateString()} - ${new Date(
                        selectedCampaign.campaignEndDate
                      ).toLocaleDateString()}`
                    : "Not specified"}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              padding: "16px",
              backgroundColor: "#f4f6f8",
              borderTop: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* Action Buttons */}
            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <Button
                variant="outlined"
                onClick={handleCloseDialog}
                sx={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  color: "primary.main",
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                Close
              </Button>

              {/* Edit and Delete Buttons (Admin only) */}
              <Box ml={2}>
                {/* <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditCampaign(selectedCampaign._id)}
                  sx={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    marginRight: "8px",
                  }}
                >
                  Edit
                </Button> */}

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => openDeleteDialog(selectedCampaign._id)}
                  sx={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                  }}
                >
                  Delete
                </Button>

                <Dialog
                  open={deleteDialogOpen}
                  onClose={handleCloseDeleteDialog}
                >
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogContent>
                    <Typography>
                      Are you sure you want to delete this campaign? This action
                      cannot be undone.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteCampaign}
                      color="error"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Delete"}
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Display success or error message */}
                {successMessage && (
                  <Snackbar open={true} message={successMessage} />
                )}
                {errorMessage && (
                  <Snackbar open={true} message={errorMessage} />
                )}

                {/* Success Snackbar */}
                <Snackbar
                  open={!!successMessage}
                  autoHideDuration={3000}
                  onClose={() => setSuccessMessage("")}
                >
                  <Alert severity="success" sx={{ width: "100%" }}>
                    {successMessage}
                  </Alert>
                </Snackbar>

                {/* Error Snackbar */}
                <Snackbar
                  open={!!errorMessage}
                  autoHideDuration={3000}
                  onClose={() => setErrorMessage("")}
                >
                  <Alert severity="error" sx={{ width: "100%" }}>
                    {errorMessage}
                  </Alert>
                </Snackbar>
              </Box>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CampaignPage;
