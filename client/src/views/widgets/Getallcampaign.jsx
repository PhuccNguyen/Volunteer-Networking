import React, { useState, useEffect } from "react";
// Import necessary hooks
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  TableCell,
  DialogContent,
  Table,
  TableBody,
  DialogTitle,
  TableRow,
  TableHead,
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
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // For campaign details
  const token = useSelector((state) => state.token);

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

 
  // Filtering campaigns based on the search query
  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.location.toLowerCase().includes(searchQuery.toLowerCase())
  );


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


  const handleCloseDialog = () => {
    setSelectedCampaign(null);
  };




  return (

    
    <Box padding="2rem">


<Table
            sx={{
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Start Date</strong>
                </TableCell>
                <TableCell>
                  <strong>End Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow
                  key={campaign._id}
                  hover
                  sx={{
                  }}
                >
                  <TableCell>
                    <Typography variant="body1">{campaign.title}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(
                        campaign.campaignStartDate
                      ).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(campaign.campaignEndDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                  <Typography variant="body1">{campaign.description}</Typography>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
            
          </Table>

      <Box display="flex" alignItems="center" mb={3}>

      </Box>
    </Box>
  );
};

export default CampaignPage;
