import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import RSButton from "../../../../components/RSButton";
import logoUrlLowOpacity from "../../../../assets/images/grayLogo-transparent.png";
import { useNavigate } from "react-router-dom";

const HeroContainer = styled(Box)(({ theme }) => ({
  height: { xs: "60vh", md: "80vh" },
  width: "100%",
  background: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url(${logoUrlLowOpacity})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(45deg, rgba(3, 147, 10, 0.1), transparent)",
  }
}));

const ContentWrapper = styled(Stack)(({ theme }) => ({
  zIndex: 2,
  maxWidth: "1000px",
  padding: theme.spacing(4),
  textAlign: "center",
}));



const HighlightText = styled("span")(({ theme }) => ({
  color: theme.palette.success.main,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-4px",
    left: 0,
    width: "100%",
    height: "2px",
    background: theme.palette.success.main,
    transform: "scaleX(0)",
    transition: "transform 0.3s ease",
  },
  "&:hover::after": {
    transform: "scaleX(1)",
  }
}));

function Hero({ onLoginClick }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }

  };


  return (
    <HeroContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <ContentWrapper spacing={4}>
          <motion.div variants={itemVariants}>
            <Typography
              variant="h4"
              fontWeight="600"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              Fast, Easy, & Accurate Transportation with{" "}
              <HighlightText>Oda Transportation</HighlightText>
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              fontWeight="400"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                margin: "0 auto",
                lineHeight: 1.6
              }}
            >
              Looking for an easy and fast way to manage your transportation?
              Look no further than <strong>Oda Transportation</strong>!
              Experience premium service with our professional chauffeurs and
              modern fleet.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <RSButton
              onClick={onLoginClick}
              backgroundcolor="success.main"
              sx={{
                mt: 4,
                px: { xs: 4, sm: 6, md: 8 },
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: "1.2rem", sm: "1.6rem", md: "2rem" }, // responsive
                fontWeight: 500,
                // textTransform: "uppercase",
                letterSpacing: "2px",
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(3, 147, 10, 0.2)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 20px rgba(3, 147, 10, 0.3)",
                },
              }}
            >
              Book Ride Now
            </RSButton>
          </motion.div>
        </ContentWrapper>
      </motion.div>
    </HeroContainer>
  );
}

export default Hero;

