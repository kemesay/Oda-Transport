import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthenticated } from "../../store/reducers/authReducer";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import Hero from "./component/hero";
import Services from "./component/Services";
import Slider from "./component/slider";
import Portfolio from "./component/portfolio";
import AboutUs from "./component/about_us";
import Auth from "./component/auth";
import Fleet from "./component/Fleet";
import FAQ from "./component/FAQ";
import Contact from "./component/contact";
import { useNavigate, useLocation } from "react-router-dom";
import { Element } from 'react-scroll';
// Styled components for section wrappers
const SectionWrapper = styled(Box)(({ theme, bgcolor, pattern, isSkewed, isFirst }) => ({
  position: 'relative',
  backgroundColor: bgcolor || '#ffffff',
  padding: isFirst ? theme.spacing(3, 0) : theme.spacing(6, 0),
  overflow: 'hidden',
  backgroundImage: pattern,
  backgroundRepeat: 'repeat',
  isolation: 'isolate',

  '&:not(:first-of-type)': {
    marginTop: theme.spacing(0),
  },

  ...(isSkewed && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'inherit',
      transform: 'skewY(-2deg)',
      transformOrigin: 'top left',
      zIndex: -1,
    }
  }),

  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)',
  }
}));

function LandingPage({ usernameFocus, handleUsernameFocus, setUsernameFocus }) {
  const dispatch = useDispatch();
  const authRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.authReducer);

  // Get the skip sections from navigation state
  const skipSections = location.state?.skipSections || [];

  // Helper function to determine if a section should be rendered
  const shouldRenderSection = (sectionName) => {
    if (!isAuthenticated) return true;
    return !skipSections.includes(sectionName);
  };

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
    handleUsernameFocus();
  };
  
  const handleBooking = () => {
    navigate('/home/1');
  };

  useEffect(() => {
    dispatch(setIsAuthenticated());
    return () => setUsernameFocus(false);
  }, []);

  return (
    <Box sx={{ 
      overflow: 'hidden',
      mt: '-24px',
    }}>
      {/* Hero Section - Always show */}
      <SectionWrapper isFirst>
        <Hero onLoginClick={handleBooking} />
      </SectionWrapper>

      <SectionWrapper 
        bgcolor="#ffffff"
        sx={{
          py: { xs: 4, md: 5 },
        }}
      >
        <Services />
      </SectionWrapper>

      {/* Slider Section - Always show */}
      <SectionWrapper
        bgcolor="#f8f9fa"
        pattern="data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l7.9-7.9h-.83zm5.657 0L19.514 8.485 20.93 9.9l8.485-8.485h-1.415zM32.372 0L22.343 10.03 23.758 11.444l10.03-10.03h-1.415zm-5.657 0L18.686 8.03 20.1 9.444 28.13 1.414 26.714 0h-.002zm11.314 0L28.03 10.03 29.444 11.444 40.03 0h-2zM32.372 0L42.4 10.03 43.815 11.444 33.785 1.414 32.37 0zm5.657 0L49.657 11.628 51.07 13.043 39.443 1.414 38.03 0zM44.03 0L55.657 11.628 57.07 13.043 45.443 1.414 44.03 0zm5.657 0L62.314 13.628 63.728 15.043 50.1 1.414l-.03-.03.03-.028.142-.142L49.7 0h.002zM49.7 0l.142.142L49.7 0zM0 5.373l.828.83-1.415 1.415L0 5.373zm0 5.657l.828.83-1.415 1.415L0 11.03zm0 5.657l.828.83-1.415 1.415L0 16.687zm0 5.657l.828.83-1.415 1.415L0 22.344zm0 5.657l.828.83-1.415 1.415L0 28zm0 5.657l.828.83-1.415 1.415L0 33.657zm0 5.657l.828.83-1.415 1.415L0 39.314zm0 5.657l.828.83-1.415 1.415L0 44.97zm0 5.657l.828.83-1.415 1.415L0 50.627zm0 5.657l.828.83-1.415 1.415L0 56.284zM0 28L28 0h-2.828L0 25.172V28zm0 22.686L28 22.686h-2.828L0 47.858v2.828zm0-5.657L28 17.03h-2.828L0 42.2v2.828zm0-5.657L28 11.372h-2.828L0 36.544v2.828zm0-5.657L28 5.715h-2.828L0 30.887v2.828zM17.03 0L0 17.03v-2.828L14.202 0h2.828zM0 0h2.828L0 2.828V0z' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E"
        isSkewed
        sx={{
          mt: 0,
          pt: 4,
        }}
      >
      <Slider />
      </SectionWrapper>

      {/* Services Section - Always show */}


      {/* Portfolio Section - Always show */}
      <SectionWrapper
        bgcolor="#f0f7f0"
        pattern="linear-gradient(120deg, rgba(240,247,240,0.7) 0%, rgba(255,255,255,0.8) 100%)"
        isSkewed
        sx={{
          py: { xs: 4, md: 5 },
        }}
      >
        <Portfolio />
      </SectionWrapper>

      {/* Auth Section - Only show for non-authenticated users */}
      {shouldRenderSection("auth") && (
        <SectionWrapper 
          bgcolor="#ffffff"
          sx={{
            boxShadow: '0 0 40px rgba(0,0,0,0.05)',
            py: { xs: 4, md: 6 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
          }}
        >
          <motion.div
            ref={authRef}
            id="auth"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              width: '100%',
              maxWidth: '725px',
              margin: '0 auto',
              padding: '0 16px'
            }}
          >
            <Box
              sx={{ 
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #03930A, #04A80B)',
                }
              }}
            >
            <Auth usernameFocus={usernameFocus} />
            </Box>
          </motion.div>
        </SectionWrapper>
      )}

      {/* Fleet Section - Always show */}
      <SectionWrapper
        bgcolor="#161F36"
        pattern="data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l7.9-7.9h-.83zm5.657 0L19.514 8.485 20.93 9.9l8.485-8.485h-1.415zM32.372 0L22.343 10.03 23.758 11.444l10.03-10.03h-1.415zm-5.657 0L18.686 8.03 20.1 9.444 28.13 1.414 26.714 0h-.002zm11.314 0L28.03 10.03 29.444 11.444 40.03 0h-2zM32.372 0L42.4 10.03 43.815 11.444 33.785 1.414 32.37 0zm5.657 0L49.657 11.628 51.07 13.043 39.443 1.414 38.03 0zM44.03 0L55.657 11.628 57.07 13.043 45.443 1.414 44.03 0zm5.657 0L62.314 13.628 63.728 15.043 50.1 1.414l-.03-.03.03-.028.142-.142L49.7 0h.002zM49.7 0l.142.142L49.7 0zM0 5.373l.828.83-1.415 1.415L0 5.373zm0 5.657l.828.83-1.415 1.415L0 11.03zm0 5.657l.828.83-1.415 1.415L0 16.687zm0 5.657l.828.83-1.415 1.415L0 22.344zm0 5.657l.828.83-1.415 1.415L0 28zm0 5.657l.828.83-1.415 1.415L0 33.657zm0 5.657l.828.83-1.415 1.415L0 39.314zm0 5.657l.828.83-1.415 1.415L0 44.97zm0 5.657l.828.83-1.415 1.415L0 50.627zm0 5.657l.828.83-1.415 1.415L0 56.284zM0 28L28 0h-2.828L0 25.172V28zm0 22.686L28 22.686h-2.828L0 47.858v2.828zm0-5.657L28 17.03h-2.828L0 42.2v2.828zm0-5.657L28 11.372h-2.828L0 36.544v2.828zm0-5.657L28 5.715h-2.828L0 30.887v2.828zM17.03 0L0 17.03v-2.828L14.202 0h2.828zM0 0h2.828L0 2.828V0z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E"
        isSkewed
        sx={{
          py: { xs: 4, md: 5 }, 
        }}
      >
        <Fleet />
      </SectionWrapper>

      {/* About Us Section - Always show */}
      <SectionWrapper
        bgcolor="#ffffff"
        sx={{ 
          position: 'relative',
          py: { xs: 4, md: 5 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(180deg, rgba(3,147,10,0.05) 0%, rgba(255,255,255,0) 100%)',
            zIndex: -1,
          }
        }}
      >
          <AboutUs />
      </SectionWrapper>

      {/* Wrap Contact section with Element for better scroll handling */}
      <Element name="contact">
        <SectionWrapper
          bgcolor="#ffffff"
          sx={{
            py: { xs: 4, md: 5 },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '150px',
              background: 'linear-gradient(180deg, rgba(3,147,10,0.02) 0%, rgba(255,255,255,0) 100%)',
              zIndex: -1,
            },
            // Add scroll animation
            '&.active': {
              animation: 'fadeIn 0.6s ease-in-out',
            },
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          <Contact />
        </SectionWrapper>
      </Element>

      {/* FAQ Section - Always show */}
      <SectionWrapper
        bgcolor="#f8f9fa"
        pattern="linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
        isSkewed
        sx={{ 
          position: 'relative',
          py: { xs: 4, md: 5 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(180deg, rgba(3,147,10,0.05) 0%, rgba(255,255,255,0) 100%)',
            zIndex: -1,
          }
        }}
      >
        <FAQ />
      </SectionWrapper>
    </Box>
  );
}

export default LandingPage;

