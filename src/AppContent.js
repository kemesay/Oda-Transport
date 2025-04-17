import { useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from './components/layout/PageWrapper';
import Header from "./components/Appbar";
import { Box } from '@mui/material';
import LandingPage from "./page/landingPage/index";
import HomePage from "./page/homePage/index";
import Dashboard from "./components/Dashboard/Dashboard";
import ErrorMessage from "./components/errorMessage";
import Footer from "./components/footer";
import { isAdminAuthenticated, isUserAuthenticated } from "./util/authUtil";
import UserSidebar from "./components/UserSidebar";
import UserProfile from './components/UserSidebar/UserProfile';
import PaymentCards from './components/UserSidebar/PaymentCards';
import PaymentHistory from './components/UserSidebar/PaymentHistory';
import SavedAddresses from './components/UserSidebar/SavedAddresses';
import FavoriteRoutes from './components/UserSidebar/FavoriteRoutes';
import PromoCodes from './components/UserSidebar/PromoCodes';
import Notifications from './components/UserSidebar/Notifications';
import UserSettings from './components/UserSidebar/UserSettings';
import HelpSupport from './components/UserSidebar/HelpSupport';
import Order from "./page/order";
// Import other components as needed

function AppContent() {
  const [usernameFocus, setUsernameFocus] = useState(false);
  const location = useLocation();

  const handleUsernameFocus = () => {
    setUsernameFocus(true);
  };

  const PrivateUserRoute = ({ children }) => {
    if (!isUserAuthenticated()) {
      return <Navigate to="/" replace />;
    }

    if (location.pathname === '/') {
      return <Navigate to="/user/profile" replace />;
    }

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <UserSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: '#f5f5f5',
            marginTop: '64px',
          }}
        >
          {children}
        </Box>
      </Box>
    );
  };

  const PrivateAdminRoute = ({ children }) => {
    return isAdminAuthenticated() ? (
      <>{children}</>
    ) : (
      <Navigate to="/error" replace />
    );
  };

  return (
    <Layout>
      <Header handleUsernameFocus={handleUsernameFocus} />
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              usernameFocus={usernameFocus}
              setUsernameFocus={setUsernameFocus}
              handleUsernameFocus={handleUsernameFocus}
            />
          }
        />

        {/* User Routes */}
        <Route path="/user" element={<PrivateUserRoute><Outlet /></PrivateUserRoute>}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="payment/cards" element={<PaymentCards />} />
          <Route path="payment/history" element={<PaymentHistory />} />
          <Route path="addresses" element={<SavedAddresses />} />
          <Route path="favorites" element={<FavoriteRoutes />} />
          <Route path="promo-codes" element={<PromoCodes />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>

        {/* Protected User Routes */}
        <Route
          path="/home/:id"
          element={
            <PrivateUserRoute>
              <HomePage />
            </PrivateUserRoute>
          }
        />
        <Route
          path="/my-order"
          element={
            <PrivateUserRoute>
              <Order />
            </PrivateUserRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateAdminRoute>
              <Dashboard />
            </PrivateAdminRoute>
          }
        />

        {/* Error Route */}
        <Route path="*" element={<ErrorMessage />} />
      </Routes>
      <Box sx={{
        height: theme => theme.spacing(4),
        backgroundColor: 'transparent',
      }} />
      <Footer />
    </Layout>
  );
}

export default AppContent; 