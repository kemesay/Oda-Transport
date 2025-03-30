import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useDispatch } from "react-redux";
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

// Styled components for section wrappers
const SectionWrapper = styled(Box)(({ theme, bgcolor, pattern, isSkewed }) => ({
  position: 'relative',
  backgroundColor: bgcolor || '#ffffff',
  padding: theme.spacing(8, 0),
  overflow: 'hidden',
  backgroundImage: pattern,
  backgroundRepeat: 'repeat',
  isolation: 'isolate',

  // Add spacing between sections
  '&:not(:first-of-type)': {
    marginTop: theme.spacing(2),
  },

  // Skewed background effect
  ...(isSkewed && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'inherit',
      transform: 'skewY(-3deg)',
      transformOrigin: 'top left',
      zIndex: -1,
    }
  }),

  // Section separator
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
}));

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
      {/* Hero Section - Dark gradient background */}
      <SectionWrapper>
        <Hero onLoginClick={scrollToAuth} />
      </SectionWrapper>

      {/* Slider Section - Light pattern background */}
      <SectionWrapper
        bgcolor="#f8f9fa"
        pattern="data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l7.9-7.9h-.83zm5.657 0L19.514 8.485 20.93 9.9l8.485-8.485h-1.415zM32.372 0L22.343 10.03 23.758 11.444l10.03-10.03h-1.415zm-5.657 0L18.686 8.03 20.1 9.444 28.13 1.414 26.714 0h-.002zm11.314 0L28.03 10.03 29.444 11.444 40.03 0h-2zM32.372 0L42.4 10.03 43.815 11.444 33.785 1.414 32.37 0zm5.657 0L49.657 11.628 51.07 13.043 39.443 1.414 38.03 0zM44.03 0L55.657 11.628 57.07 13.043 45.443 1.414 44.03 0zm5.657 0L62.314 13.628 63.728 15.043 50.1 1.414l-.03-.03.03-.028.142-.142L49.7 0h.002zM49.7 0l.142.142L49.7 0zM0 5.373l.828.83-1.415 1.415L0 5.373zm0 5.657l.828.83-1.415 1.415L0 11.03zm0 5.657l.828.83-1.415 1.415L0 16.687zm0 5.657l.828.83-1.415 1.415L0 22.344zm0 5.657l.828.83-1.415 1.415L0 28zm0 5.657l.828.83-1.415 1.415L0 33.657zm0 5.657l.828.83-1.415 1.415L0 39.314zm0 5.657l.828.83-1.415 1.415L0 44.97zm0 5.657l.828.83-1.415 1.415L0 50.627zm0 5.657l.828.83-1.415 1.415L0 56.284zM0 28L28 0h-2.828L0 25.172V28zm0 22.686L28 22.686h-2.828L0 47.858v2.828zm0-5.657L28 17.03h-2.828L0 42.2v2.828zm0-5.657L28 11.372h-2.828L0 36.544v2.828zm0-5.657L28 5.715h-2.828L0 30.887v2.828zM17.03 0L0 17.03v-2.828L14.202 0h2.828zM0 0h2.828L0 2.828V0z' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E"
        isSkewed
      >
      <Slider />
      </SectionWrapper>

      {/* Services Section - White with green accent */}
      <SectionWrapper bgcolor="#ffffff">
        <Services />
      </SectionWrapper>

      {/* Portfolio Section - Light green gradient */}
      <SectionWrapper
        bgcolor="#f0f7f0"
        pattern="linear-gradient(120deg, rgba(240,247,240,0.7) 0%, rgba(255,255,255,0.8) 100%)"
        isSkewed
      >
        <Portfolio />
      </SectionWrapper>

      {/* Auth Section - Clean white with box shadow */}
      <SectionWrapper 
        bgcolor="#ffffff"
          sx={{
          boxShadow: '0 0 40px rgba(0,0,0,0.05)',
          py: { xs: 6, md: 10 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
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
            maxWidth: '600px',
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
                height: '4px',
                background: 'linear-gradient(90deg, #03930A, #04A80B)',
              }
            }}
          >
            <Auth usernameFocus={usernameFocus} />
          </Box>
        </motion.div>
      </SectionWrapper>

      {/* Fleet Section - Dark pattern */}
      <SectionWrapper
        bgcolor="#161F36"
        pattern="data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l7.9-7.9h-.83zm5.657 0L19.514 8.485 20.93 9.9l8.485-8.485h-1.415zM32.372 0L22.343 10.03 23.758 11.444l10.03-10.03h-1.415zm-5.657 0L18.686 8.03 20.1 9.444 28.13 1.414 26.714 0h-.002zm11.314 0L28.03 10.03 29.444 11.444 40.03 0h-2zM32.372 0L42.4 10.03 43.815 11.444 33.785 1.414 32.37 0zm5.657 0L49.657 11.628 51.07 13.043 39.443 1.414 38.03 0zM44.03 0L55.657 11.628 57.07 13.043 45.443 1.414 44.03 0zm5.657 0L62.314 13.628 63.728 15.043 50.1 1.414l-.03-.03.03-.028.142-.142L49.7 0h.002zM49.7 0l.142.142L49.7 0zM0 5.373l.828.83-1.415 1.415L0 5.373zm0 5.657l.828.83-1.415 1.415L0 11.03zm0 5.657l.828.83-1.415 1.415L0 16.687zm0 5.657l.828.83-1.415 1.415L0 22.344zm0 5.657l.828.83-1.415 1.415L0 28zm0 5.657l.828.83-1.415 1.415L0 33.657zm0 5.657l.828.83-1.415 1.415L0 39.314zm0 5.657l.828.83-1.415 1.415L0 44.97zm0 5.657l.828.83-1.415 1.415L0 50.627zm0 5.657l.828.83-1.415 1.415L0 56.284zM0 28L28 0h-2.828L0 25.172V28zm0 22.686L28 22.686h-2.828L0 47.858v2.828zm0-5.657L28 17.03h-2.828L0 42.2v2.828zm0-5.657L28 11.372h-2.828L0 36.544v2.828zm0-5.657L28 5.715h-2.828L0 30.887v2.828zM17.03 0L0 17.03v-2.828L14.202 0h2.828zM0 0h2.828L0 2.828V0z' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E"
        isSkewed
      >
        <Fleet />
      </SectionWrapper>

      {/* About Us Section - Light with waves */}
      <SectionWrapper
        bgcolor="#ffffff"
              sx={{ 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
            height: '200px',
            background: 'linear-gradient(180deg, rgba(3,147,10,0.05) 0%, rgba(255,255,255,0) 100%)',
                  zIndex: -1,
          }
        }}
      >
          <AboutUs />
      </SectionWrapper>

      {/* FAQ Section - Light gray with subtle gradient */}
      <SectionWrapper
        bgcolor="#f8f9fa"
        pattern="linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
        isSkewed
      >
        <FAQ />
      </SectionWrapper>
    </Box>
  );
}

export default LandingPage;

