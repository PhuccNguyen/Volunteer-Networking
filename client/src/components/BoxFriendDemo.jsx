import { MoreHoriz, DeleteOutline, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Typography,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserImage from "./UserImage";

const BoxFriend = ({
  friendId,
  postUserId,
  firstName,
  lastName,
  subtitle,
  userPicturePath,
  postId,
  description,
  location,
  destination,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const { _id: loggedInUserId } = useSelector((state) => state.user);

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  const [friendRequestStatus, setFriendRequestStatus] = useState("not_friends");
  const [anchorEl, setAnchorEl] = useState(null); // For opening Menu
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedLocation, setEditedLocation] = useState(location);
  const [editedDestination, setEditedDestination] = useState(destination);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  const handleDeleteConfirm = async () => {
    await handleDeletePost();
    setOpenDeleteDialog(false);
  };

  // Log relevant variables
  console.log("loggedInUserId:", loggedInUserId);
  console.log("postUserId:", postUserId);
  console.log("friendId:", friendId);

  // Fetch friend request status on mount
  useEffect(() => {
    const fetchFriendRequestStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/friends/${loggedInUserId}/${friendId}/friend-status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setFriendRequestStatus(data.status);
      } catch (error) {
        console.error("Error fetching friend request status:", error);
      }
    };

    fetchFriendRequestStatus();
  }, [friendId, loggedInUserId, token]);

  const handleSendFriendRequest = async () => {
    try {
      await fetch(`http://localhost:3001/friends/send-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          targetUserId: friendId,
        }),
      });
      setFriendRequestStatus("request_sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      await fetch(`http://localhost:3001/friends/accept-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId, requesterId: friendId }),
      });
      setFriendRequestStatus("friends");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleCancelFriendRequest = async () => {
    try {
      await fetch(`http://localhost:3001/friends/cancel-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          targetUserId: friendId,
        }),
      });
      setFriendRequestStatus("not_friends");
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  const handleDeleteFriend = async () => {
    try {
      await fetch(`http://localhost:3001/friends/delete-friend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId, friendId }),
      });
      setFriendRequestStatus("not_friends");
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting friend:", error);
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget); // Open menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close menu
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true); // Open the edit dialog
    handleMenuClose(); // Close the menu
  };

  const handleEditSubmit = async () => {
    if (!postId) {
      console.error("Post ID is missing");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/posts/${postId}/edit`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: editedDescription,
            location: editedLocation,
            destination: editedDestination,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the post.");
      }

      const updatedPost = await response.json();
      console.log("Post updated successfully:", updatedPost);
      setOpenEditDialog(false);
      setAlertMessage("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!postId) {
      console.error("Post ID is missing");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete the post.");
      }

      console.log("Post deleted successfully");
      setAlertMessage("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const renderActionButton = () => {
    console.log("loggedInUserId:", loggedInUserId, "friendId:", friendId);

    if (loggedInUserId === friendId) {
      return (
        <>
          <MenuItem onClick={handleOpenEditDialog} startIcon={<Edit />}>
            Edit Post
          </MenuItem>
          <MenuItem
            onClick={handleOpenDeleteDialog}
            startIcon={<DeleteOutline />}
          >
            Delete Post
          </MenuItem>
        </>
      );
    }

    // Handle friend request status actions
    switch (friendRequestStatus) {
      case "not_friends":
        return (
          <MenuItem onClick={handleSendFriendRequest}>Add Friend</MenuItem>
        );
      case "request_sent":
        return (
          <MenuItem onClick={handleCancelFriendRequest}>
            Cancel Request
          </MenuItem>
        );
      case "request_received":
        return (
          <MenuItem onClick={handleAcceptFriendRequest}>
            Accept Request
          </MenuItem>
        );
      case "friends":
        return (
          <MenuItem onClick={handleDeleteFriend} startIcon={<DeleteOutline />}>
            Remove Friend
          </MenuItem>
        );
      default:
        return null;
    }
  };

  return (
    <Box display="flex" alignItems="center" gap="1rem" p="0.5rem">
      <UserImage image={userPicturePath} size="55px" />
      
      <Box
        onClick={() => navigate(`/profile/${friendId}`)}
        sx={{ flex: 1, cursor: "pointer" }}
      >
        <Typography color={main} variant="h5" fontWeight="500">
          {firstName} {lastName}
        </Typography>
        <Typography color={medium} fontSize="0.75rem">
          {subtitle}
        </Typography>
      </Box>

      <IconButton onClick={handleMenuClick} style={{ zIndex: 1000 }}>
        <MoreHoriz />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {renderActionButton()}
      </Menu>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            padding: "1.5rem",
            borderRadius: "12px",
          },
        }}
      >
        {/* Enhanced Dialog Title */}
        <DialogTitle
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            color: "#7928CA", // Matching the gradient's starting color
            marginBottom: "1.5rem",
          }}
        >
          Edit Post
        </DialogTitle>

        {/* Header Section with Profile Image and Name */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          sx={{
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <UserImage
            image={userPicturePath}
            size="80px"
            sx={{ marginBottom: "1rem" }}
          />
          <Typography color={main} variant="h5" fontWeight="600">
            {firstName} {lastName}
          </Typography>
        </Box>

        {/* Content Section for Editing */}
        <DialogContent sx={{ padding: 0 }}>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            sx={{ marginBottom: "1.5rem" }}
          />
          <TextField
            margin="dense"
            label="Destination"
            fullWidth
            variant="outlined"
            value={editedDestination}
            onChange={(e) => setEditedDestination(e.target.value)}
          />
        </DialogContent>

        {/* Action Buttons */}
        <DialogActions
          sx={{
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              textTransform: "none",
              padding: "0.5rem 2rem",
              background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
              color: "#fff", // Set the text color to white
              "&:hover": {
                background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
                opacity: 0.9,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            sx={{
              textTransform: "none",
              padding: "0.5rem 2rem",
              background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
              color: "#fff", // Set the text color to white
              "&:hover": {
                background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
                opacity: 0.9,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {alertMessage && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            width: "300px",
          }}
        >
          <Alert onClose={() => setAlertMessage("")} severity="success">
            {alertMessage}
          </Alert>
        </div>
      )}
    </Box>
  );
};

export default BoxFriend;
