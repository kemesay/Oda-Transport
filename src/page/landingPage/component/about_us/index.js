import React, { useState } from "react";
import { Box, Grid, Container, Typography, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import RSTypography from "../../../../components/RTSABOUT";
import logoUrl from "../../../../assets/images/newLogo.jpg";
import { CheckCircle } from "@mui/icons-material";
import { useSelector } from "react-redux";

// Styled components
const AboutUsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  position: "relative",
}));

const ImageSection = styled(motion.div)(({ theme }) => ({
  position: "relative",
  width: "100%",
  minHeight: "400px",
  borderRadius: theme.spacing(1.5),
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  padding: theme.spacing(0),
  [theme.breakpoints.down('md')]: {
    minHeight: "400px",
  },
  [theme.breakpoints.up('lg')]: {
    minHeight: "400px",
  },
}));

const ImageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledImage = styled('img')({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  borderRadius: "16px",
  transition: "transform 0.3s ease-in-out",
  '&:hover': {
    transform: "scale(1.02)",
  },
});

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: "#fff",
  borderRadius: theme.spacing(2),
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
}));

const FeatureItem = styled(motion.div)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StatBox = styled(motion.div)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  textAlign: "center",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

function AboutUs() {
  const theme = useTheme();
  const { aboutUsDescription } = useSelector((state) => state.footerReducer);

  const features = [
    "Professional and experienced chauffeurs",
    "Modern and well-maintained fleet of vehicles",
    "24/7 customer support and availability",
    "Customized transportation solutions",
    "Competitive and transparent pricing"
  ];

  const stats = [
    { value: "10+", label: "Years Experience" },
    { value: "10K+", label: "Happy Clients" },
    { value: "24/7", label: "Customer Support" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        duration: 0.8 
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

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(null);

  const handleImageLoad = (event) => {
    const img = event.target;
    setImageAspectRatio(img.naturalWidth / img.naturalHeight);
    setImageLoaded(true);
  };

  const getImageStyle = () => {
    if (!imageAspectRatio) return {};

    if (imageAspectRatio > 1) {
      // Landscape image
      return {
        width: '100%',
        height: 'auto',
      };
    } else {
      // Portrait image
      return {
        width: 'auto',
        height: '100%',
      };
    }
  };

  return (
    <AboutUsContainer maxWidth="xl" id="aboutus">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <Grid container spacing={6}>
          {/* Image Section */}
          <Grid item xs={12} md={5}>
            <ImageSection variants={itemVariants}>
              <ImageContainer>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageLoaded ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ height: '100%', display: 'flex', alignItems: 'center' }}
                >
                  <StyledImage
                    src={logoUrl}
                    alt="About ODA Transportation"
                    onLoad={handleImageLoad}
                    style={{
                      ...getImageStyle(),
                      opacity: imageLoaded ? 1 : 0,
                    }}
                  />
                </motion.div>
                {!imageLoaded && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #03930A',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
                      },
                    }}
                  />
                )}
              </ImageContainer>
            </ImageSection>
          </Grid>

          {/* Content Section */}
          <Grid item xs={12} md={7}>
            <ContentBox>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h5"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "#03930A",
                    textAlign: { xs: 'center', lg: 'left' },
                  }}
                >
                  About ODA Transportation
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <RSTypography
                  sx={{
                    mb: 4,
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    color: "text.secondary",
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                    [theme.breakpoints.down('sm')]: {
                      fontSize: "1rem",
                      lineHeight: 1.6,
                    }
                  }}
                >
                  {aboutUsDescription}
                </RSTypography>
              </motion.div>

              {/* Features List */}
              <Stack spacing={2} sx={{ mb: 6 }}>
                {features.map((feature, index) => (
                  <FeatureItem
                    key={index}
                    variants={itemVariants}
                  >
                    <CheckCircle sx={{ color: theme.palette.success.main }} />
                    <RSTypography>{feature}</RSTypography>
                  </FeatureItem>
                ))}
              </Stack>

              {/* Stats Section */}
              <Grid container spacing={3}>
                {stats.map((stat, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <StatBox variants={itemVariants}>
                      <RSTypography
                        fontsize="36px"
                        fontWeight="700"
                        sx={{ color: theme.palette.primary.main }}
                      >
                        {stat.value}
                      </RSTypography>
                      <RSTypography
                        fontsize="16px"
                        sx={{ color: "text.secondary" }}
                      >
                        {stat.label}
                      </RSTypography>
                    </StatBox>
                  </Grid>
                ))}
              </Grid>
            </ContentBox>
          </Grid>
        </Grid>
      </motion.div>
    </AboutUsContainer>
  );
}

export default AboutUs;