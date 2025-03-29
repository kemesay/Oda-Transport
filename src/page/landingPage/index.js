import React, { useEffect, useRef } from "react";
import { Box, Container } from "@mui/material";
import { useDispatch } from "react-redux";
import { setIsAuthenticated } from "../../store/reducers/authReducer";
import { motion } from "framer-motion";
import Hero from "./component/hero";
import Services from "./component/Services";
import Slider from "./component/slider";
import ServiceCard from "./component/serviceCard";
import Portfolio from "./component/portfolio";
import AboutUs from "./component/about_us";
import Auth from "./component/auth";
import Fleet from "./component/Fleet";
import Faq from "./component/FAQ/index";
function LandingPage({ usernameFocus, handleUsernameFocus, setUsernameFocus }) {
  const dispatch = useDispatch();
  const authRef = useRef(null);

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
    handleUsernameFocus();
  };

  useEffect(() => {
    dispatch(setIsAuthenticated());
    return () => setUsernameFocus(false);
  }, []);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Hero onLoginClick={scrollToAuth} />
      <Slider />
      <Services />
      <Portfolio />
      
      {/* Auth Section with centered styling */}
      <Container 
        ref={authRef} 
        id="auth" 
        maxWidth="md"
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          py: { xs: 4, md: 8 },
          px: { xs: 2, md: 3 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 700,
            mx: 'auto',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #03930A, #04A80B)',
            }
          }}
        >
          <Auth usernameFocus={usernameFocus} />
        </Box>
      </Container>
      <Fleet />
      <AboutUs />
      <Faq />
    </Box>
  );
}

export default LandingPage;

