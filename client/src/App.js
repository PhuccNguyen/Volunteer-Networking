import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "views/homePage";
import LoginPage from "views/loginPage";
import ProfilePage from "views/ProfilePage";
import SavePost from "views/savepost";
import VolunteerPage from "views/VolunteerPage";
import Admin from "views/Admin";
import SavedPostsPage from "views/SavedPostsPage";
import ManageCampaign from "views/ManageCampaign";
import UserRegisterCampaign from "views/UserRegisterCampaign";
import LandingPage from "views/LandingPage";
import FriendPage from "views/friendPage";
import NotFoundPage from "views/NotFoundPage"; 
import NotificationComponent from "./components/NotificationComponent.jsx"; 
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";


function App() {

  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  const userId = useSelector((state) => state.user?.id); 


  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {isAuth && userId && <NotificationComponent userId={userId} />} 
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/volunteer" element={isAuth ? <VolunteerPage /> : <Navigate to="/LoginPage" />} />
            <Route path="/SavedPostsPage" element={isAuth ? <SavedPostsPage /> : <Navigate to="/LoginPage" />} />
            <Route path="/FriendPage" element={isAuth ? <FriendPage /> : <Navigate to="/LoginPage" />} />
            <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/LoginPage" />} />
            <Route path="/profile/:userId" element={isAuth ? <ProfilePage /> : <Navigate to="/LoginPage" />} />
            <Route path="/savepost/:userId" element={isAuth ? <SavePost /> : <Navigate to="/LoginPage" />} />
            <Route path="/Admin" element={isAuth ? <Admin /> : <Navigate to="/LoginPage" />} />
            <Route path="/ManageCampaign" element={isAuth ? <ManageCampaign /> : <Navigate to="/LoginPage" />} />
            <Route path="/UserRegisterCampaign" element={isAuth ? <UserRegisterCampaign /> : <Navigate to="/LoginPage" />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            
            {/* Wildcard route for 404 page */}
            <Route  path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
