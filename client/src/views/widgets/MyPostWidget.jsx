import {
  EditOutlined,
  ImageOutlined,
  LocationOnOutlined,
  VideoLibraryOutlined, // Icon for videos
  InsertDriveFileOutlined, // Icon for files
} from "@mui/icons-material";
import {
  Box,
  Typography,
  InputBase,
  useTheme,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import Adjustment from "components/Adjustment";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WrapperUser";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null); // Video state
  const [file, setFile] = useState(null); // File state for PDFs or DOCX
  const [preview, setPreview] = useState(null);
  const [post, setPost] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  // const main = palette.neutral.main;
  const { _id, firstName, lastName } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const availableLocations = [
    "12 Lê Lợi, Quận 1, Sài Gòn – TP HCM",
    "15C Nguyễn Huệ, Quận 1, Sài Gòn – TP HCM",
    "89 Bạch Đằng, Quận Tân Bình, Sài Gòn – TP HCM",
    "37 Trần Hưng Đạo, Quận 1, Sài Gòn – TP HCM",
    "20A Pasteur, Quận 3, Sài Gòn – TP HCM",
    "42 Phan Xích Long, Quận Phú Nhuận, Sài Gòn – TP HCM",
    "7A Võ Thị Sáu, Quận 3, Sài Gòn – TP HCM",
    "54 Điện Biên Phủ, Quận Bình Thạnh, Sài Gòn – TP HCM",
    "19 Nam Kỳ Khởi Nghĩa, Quận 1, Sài Gòn – TP HCM",
    "26 Nguyễn Thái Bình, Quận 1, Sài Gòn – TP HCM",
    "45A Cống Quỳnh, Quận 1, Sài Gòn – TP HCM",
    "31 Nguyễn Văn Cừ, Quận 5, Sài Gòn – TP HCM",
    "63 Nguyễn Đình Chiểu, Quận 3, Sài Gòn – TP HCM",
    "8 Trương Định, Quận 1, Sài Gòn – TP HCM",
    "39 Nguyễn Thị Minh Khai, Quận 1, Sài Gòn – TP HCM",
    "50 Võ Văn Tần, Quận 3, Sài Gòn – TP HCM",
    "22A Lý Tự Trọng, Quận 1, Sài Gòn – TP HCM",
    "14 Trần Quang Khải, Quận 1, Sài Gòn – TP HCM",
    "29 Nguyễn Trãi, Quận 5, Sài Gòn – TP HCM",
    "11 Huỳnh Văn Bánh, Quận Phú Nhuận, Sài Gòn – TP HCM",
    "36 Bùi Thị Xuân, Quận 1, Sài Gòn – TP HCM",
    "17 Nguyễn Thượng Hiền, Quận Bình Thạnh, Sài Gòn – TP HCM",
    "28 Phạm Ngọc Thạch, Quận 3, Sài Gòn – TP HCM",
    "44A Lê Hồng Phong, Quận 10, Sài Gòn – TP HCM",
    "91 Nguyễn Thị Nghĩa, Quận 1, Sài Gòn – TP HCM",
    "53 Lê Văn Sỹ, Quận 3, Sài Gòn – TP HCM",
    "25 Đinh Tiên Hoàng, Quận 1, Sài Gòn – TP HCM",
    "18 Nguyễn Công Trứ, Quận 1, Sài Gòn – TP HCM",
    "62 Tôn Thất Tùng, Quận 1, Sài Gòn – TP HCM",
    "30A Nam Kỳ Khởi Nghĩa, Quận 3, Sài Gòn – TP HCM",
  ];

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id); // Append user ID
    formData.append("description", post); // Append post description
    formData.append("destination", location || customLocation || ""); // Append location

    // Append image if present
    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
    }

    // // Append video if present
    // if (video) {
    //   formData.append("video", video);
    //   formData.append("videoPath", video.name);
    // }

    // // Append file if present
    // if (file) {
    //   formData.append("file", file);
    //   formData.append("filePath", file.name);
    //   formData.append("fileType", file.type);
    // }

    try {
      const response = await fetch(`http://localhost:3001/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData, 
      });

      if (response.ok) {
        const posts = await response.json(); // Get the new post data
        dispatch(setPosts({ posts })); // Dispatch new posts to the store
        resetPostForm(); // Reset the form after successful post
      } else {
        console.error("Failed to post");
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  const resetPostForm = () => {
    setImage(null);
    setPreview(null);
    setPost("");
    setVideo(null); // Reset video
    setFile(null); // Reset file
    setLocation("");
    setCustomLocation("");
    setSearchTerm("");
    setIsDialogOpen(false);
    setIsLocationDialogOpen(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setCustomLocation("");
    setIsLocationDialogOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.trim()); // Trim leading/trailing spaces
  };

  const filteredLocations = availableLocations.filter((loc) =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <WidgetWrapper
        boxShadow="0px 6px 13px 3px rgba(0, 0, 0, 0.1)"
        margin="-0.5rem 0rem 0rem 0rem"
      >
        <Box>
          <Adjustment gap="1.5rem" width="600px" marginBottom="10px">
            <UserImage image={picturePath} />
            <InputBase
              placeholder={`What's on your mind, ${firstName}?`}
              onClick={() => setIsDialogOpen(true)}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 2rem",
              }}
            />
          </Adjustment>
        </Box>
        <Divider />
        <Box
          display="flex"
          justifyContent="space-between"
          maxWidth="100%"
          padding="0 9%"
        >
          <Button
            onClick={() => setIsDialogOpen(true)}
            sx={{
              marginTop: "10px",
              padding: "0.5rem 1rem",
              width: "45%",
              color: "white",
              "&:hover": {
                background: "linear-gradient(310deg, #FF0080 0%, #7928CA 100%)",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              color={dark}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                "&:hover": {
                  color: "white",
                },
              }}
            >
              <ImageOutlined sx={{ marginRight: "0.5rem" }} />
              Add Image
            </Typography>
          </Button>

          <Button
            onClick={() => setIsDialogOpen(true)}
            sx={{
              marginTop: "10px",
              padding: "0.5rem 1rem",
              width: "45%",
              color: "white",
              "&:hover": {
                background: "linear-gradient(310deg, #FF0080 0%, #7928CA 100%)",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              color={dark}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                "&:hover": {
                  color: "white",
                },
              }}
            >
              <LocationOnOutlined sx={{ marginRight: "0.5rem" }} />
              Check In
            </Typography>
          </Button>
        </Box>
      </WidgetWrapper>

      <Dialog
        open={isDialogOpen}
        onClose={resetPostForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            borderBottom: "1px solid #999999",
          }}
        >
          Create Post
        </DialogTitle>
        <DialogContent sx={{ padding: "0.7rem" }}>
          
          <Box display="flex" alignItems="center" mb="0.5rem" mt="0.5rem">
            <UserImage image={picturePath} />
            <Typography variant="h6" ml="1rem">
              {firstName} {lastName}{" "}
              {location || customLocation
                ? `Volunteer In:  ${location || customLocation}`
                : ``}
            </Typography>
          </Box>

          <InputBase
            placeholder={`What's on your mind, ${firstName}?`}
            onChange={(e) => setPost(e.target.value)}
            value={post}
            multiline
            rows={3}
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "22px",
              marginBottom: "1rem",
              border: `1px solid ${palette.neutral.main}`,
            }}
          />
          
          <Box display="flex" alignItems="center" justifyContent="start">
            <Box marginRight="1rem"> Add Your Post: </Box>
            <Button
              onClick={() => setIsLocationDialogOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                color: "white",
                background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
                borderRadius: "2rem",
                padding: "0.5rem 0.5rem",
                marginRight: "1rem",
                "&:hover": {
                  background:
                    "linear-gradient(310deg, #FF0080 0%, #7928CA 100%)",
                },
              }}
            >
              <LocationOnOutlined sx={{ marginRight: "0.5rem" }} /> Check In
            </Button>

            <Button
              onClick={() => setImage(!image)}
              sx={{
                display: "flex",
                alignItems: "center",
                color: "white",
                background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
                borderRadius: "2rem",
                padding: "0.5rem 0.5rem",
                "&:hover": {
                  background:
                    "linear-gradient(310deg, #FF0080 0%, #7928CA 100%)",
                },
              }}
            >
              <ImageOutlined sx={{ marginRight: "0.5rem" }} /> Add Image
            </Button>
          </Box>

          {image && (
            <Box
              border={`1px solid ${medium}`}
              borderRadius="5px"
              mt="1rem"
              p="1rem"
            >
              <Dropzone
                acceptedFiles=".jpg,.jpeg,.png"
                multiple={false}
                onDrop={(acceptedFiles) => {
                  const file = acceptedFiles[0];
                  setImage(file);
                  setPreview(URL.createObjectURL(file)); // Generate preview URL
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <Box
                    {...getRootProps()}
                    border={`2px dashed ${palette.primary.main}`}
                    p="1rem"
                    sx={{ "&:hover": { cursor: "pointer" } }}
                  >
                    <input {...getInputProps()} />
                    {!preview ? (
                      <Typography>Add Image Here</Typography>
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                        <Typography>{image.name}</Typography>
                        <EditOutlined />
                      </Box>
                    )}
                  </Box>
                )}
              </Dropzone>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetPostForm} sx={{ marginRight: "auto" }}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={!post && !image}
            sx={{
              color: "white",
              background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
              borderRadius: "2rem",
              padding: "0.5rem 0.5rem",
              "&:hover": {
                background: "linear-gradient(310deg, #FF0080 0%, #7928CA 100%)",
              },
            }}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isLocationDialogOpen}
        onClose={() => setIsLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Choose Location</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Location"
            type="text"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <List>
            <ListItem>
              <InputBase
                placeholder="Add your location"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                sx={{ width: "100%" }}
              />
            </ListItem>
            {filteredLocations.map((loc, index) => (
              <ListItem key={index} onClick={() => handleLocationSelect(loc)}>
                <ListItemText primary={loc} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLocationDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setLocation(customLocation || "");
              setCustomLocation("");
              setSearchTerm("");
              setIsLocationDialogOpen(false);
            }}
            sx={{
              color: "white",
              background: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
              borderRadius: "2rem",
              padding: "0.5rem 0.5rem",
              "&:hover": {
                background: "linear-gradient(310deg, #FF0080 0%, #7928CA 100%)",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyPostWidget;
