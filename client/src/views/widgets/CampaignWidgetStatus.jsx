import { Box, Typography } from "@mui/material";
import CampaignWidget from "views/widgets/CampaignWidget";
import { useSelector } from 'react-redux';

const CampaignWidgetStatus = () => {
  const { _id } = useSelector((state) => state.user);

  return (
    <Box>
      {/* Display campaigns in order of ongoing, upcoming, and ended */}
      <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Campaigns</Typography>
      <CampaignWidget userId={_id} status="ongoing" />
      <CampaignWidget userId={_id} status="upcoming" />
      <CampaignWidget userId={_id} status="ended" />
    </Box>
  );
};

export default CampaignWidgetStatus;