import React, { useState } from "react";
import { Box, Grid, Container, Typography, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import RSTypography from "../../../../components/RTSABOUT";
import logoUrl from "../../../../assets/images/Website Social Media Open Graph_Business card - Back_black_car.jpg";
import { CheckCircle, Star, EmojiEvents, SupportAgent } from "@mui/icons-material";
import { useSelector } from "react-redux";

/* ── keyframes ──────────────────────────────────────────────────────────── */

const floatY = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
`;

/* ── styled ─────────────────────────────────────────────────────────────── */

const AboutUsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  position: "relative",
}));

const ImageSection = styled(motion.div)(({ theme }) => ({
  position: "relative",
  width: "100%",
  minHeight: "460px",
  borderRadius: theme.spacing(2.5),
  overflow: "visible",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.down("md")]: {
    minHeight: "300px",
  },
}));

const ImageFrame = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: "420px",
  borderRadius: theme.spacing(2.5),
  overflow: "hidden",
  background: "linear-gradient(145deg, #f0faf0 0%, #e8f5e9 60%, #f5fbf5 100%)",
  boxShadow: "0 24px 64px rgba(3,147,10,0.12), 0 4px 16px rgba(0,0,0,0.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.down("md")]: {
    minHeight: "300px",
  },
}));

const StyledImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  borderRadius: "16px",
  position: "relative",
  zIndex: 1,
  transition: "transform 0.5s ease-in-out",
  "&:hover": {
    transform: "scale(1.025)",
  },
});

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4.5),
  backgroundColor: "#ffffff",
  borderRadius: theme.spacing(2.5),
  boxShadow: "0 12px 40px rgba(3,147,10,0.07), 0 2px 8px rgba(0,0,0,0.04)",
  borderTop: "3px solid #03930A",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: -40,
    right: -40,
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(3,147,10,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
}));

const FeatureChip = styled(motion.div)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.1, 2),
  borderRadius: "100px",
  backgroundColor: "rgba(3,147,10,0.05)",
  border: "1px solid rgba(3,147,10,0.13)",
  transition: "all 0.22s ease",
  cursor: "default",
  "&:hover": {
    backgroundColor: "rgba(3,147,10,0.1)",
    borderColor: "rgba(3,147,10,0.3)",
    transform: "translateX(6px)",
    boxShadow: "0 4px 12px rgba(3,147,10,0.1)",
  },
}));

const StatCard = styled(motion.div)(({ theme }) => ({
  background: "#ffffff",
  border: "1px solid rgba(3,147,10,0.12)",
  borderTop: "3px solid #03930A",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  textAlign: "center",
  boxShadow: "0 4px 16px rgba(3,147,10,0.06)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-7px)",
    boxShadow: "0 16px 36px rgba(3,147,10,0.14)",
  },
}));

/* ── animation variants ─────────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, duration: 0.7 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ── component ──────────────────────────────────────────────────────────── */

function AboutUs() {
  const theme = useTheme();
  const { aboutUsDescription } = useSelector((state) => state.footerReducer);

  const features = [
    "Professional and experienced chauffeurs",
    "Modern and well-maintained fleet of vehicles",
    "24/7 customer support and availability",
    "Customized transportation solutions",
    "Competitive and transparent pricing",
  ];

  const stats = [
    { value: "11+",  label: "Years Experience", icon: <EmojiEvents sx={{ color: "#03930A", fontSize: 22 }} /> },
    { value: "11K+", label: "Happy Clients",    icon: <Star sx={{ color: "#03930A", fontSize: 22 }} /> },
    { value: "24/7", label: "Customer Support", icon: <SupportAgent sx={{ color: "#03930A", fontSize: 22 }} /> },
  ];

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(null);

  const handleImageLoad = (event) => {
    const img = event.target;
    setImageAspectRatio(img.naturalWidth / img.naturalHeight);
    setImageLoaded(true);
  };

  const getImageStyle = () => {
    if (!imageAspectRatio) return {};
    return imageAspectRatio > 1 ? { width: "100%", height: "auto" } : { width: "auto", height: "100%" };
  };

  return (
    <AboutUsContainer maxWidth="xl" id="aboutus">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
        <Grid container spacing={6} alignItems="stretch">

          {/* ── Image column ────────────────────────────────────── */}
          <Grid item xs={12} md={5}>
            <ImageSection variants={itemVariants}>

              {/* Green corner accent — top-left */}
              <Box sx={{ position: "absolute", top: -8, left: -8, width: 60, height: 4, borderRadius: 2, background: "#03930A", zIndex: 2 }} />
              <Box sx={{ position: "absolute", top: -8, left: -8, width: 4, height: 60, borderRadius: 2, background: "#03930A", zIndex: 2 }} />

              {/* Green corner accent — bottom-right */}
              <Box sx={{ position: "absolute", bottom: -8, right: -8, width: 60, height: 4, borderRadius: 2, background: "#03930A", zIndex: 2 }} />
              <Box sx={{ position: "absolute", bottom: -8, right: -8, width: 4, height: 60, borderRadius: 2, background: "#03930A", zIndex: 2 }} />

              <ImageFrame>
                {/* subtle radial green glow centre */}
                <Box sx={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(ellipse at center, rgba(3,147,10,0.07) 0%, transparent 70%)",
                }} />

                {/* dot-grid overlay */}
                <Box sx={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  backgroundImage: "radial-gradient(circle, rgba(3,147,10,0.12) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  opacity: 0.6,
                }} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.96 }}
                  transition={{ duration: 0.6 }}
                  style={{ height: "100%", display: "flex", alignItems: "center", position: "relative", zIndex: 2, padding: "24px" }}
                >
                  <StyledImage
                    src={logoUrl}
                    alt="About ODA Black Car Service"
                    onLoad={handleImageLoad}
                    style={{ ...getImageStyle(), opacity: imageLoaded ? 1 : 0 }}
                  />
                </motion.div>

                {!imageLoaded && (
                  <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 48, height: 48, borderRadius: "50%",
                    border: "3px solid rgba(3,147,10,0.15)",
                    borderTop: "3px solid #03930A",
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%":   { transform: "translate(-50%, -50%) rotate(0deg)" },
                      "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
                    },
                  }} />
                )}
              </ImageFrame>

              {/* floating badge */}
              <Box sx={{
                position: "absolute", bottom: 24, right: -16,
                background: "#fff",
                borderRadius: 3,
                px: 2, py: 1.2,
                boxShadow: "0 8px 24px rgba(3,147,10,0.18)",
                border: "1px solid rgba(3,147,10,0.15)",
                display: "flex", alignItems: "center", gap: 1.2,
                zIndex: 3,
                animation: `${floatY} 4s ease-in-out infinite`,
              }}>
                <Box sx={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "rgba(3,147,10,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Star sx={{ color: "#03930A", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#111", lineHeight: 1 }}>
                    5-Star Rated
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.45)", mt: 0.2 }}>
                    11,000+ happy clients
                  </Typography>
                </Box>
              </Box>
            </ImageSection>
          </Grid>

          {/* ── Content column ──────────────────────────────────── */}
          <Grid item xs={12} md={7}>
            <ContentBox>

              {/* label + heading */}
              <motion.div variants={itemVariants}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box sx={{ width: 28, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #03930A, #4CB051)" }} />
                  <Typography sx={{ color: "#03930A", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>
                    Who We Are
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{
                  mb: 1.5, fontWeight: 800,
                  color: "text.primary",
                  fontSize: { xs: "1.6rem", sm: "2rem", md: "2.2rem" },
                  textAlign: { xs: "center", lg: "left" },
                  letterSpacing: "-0.3px",
                }}>
                  About ODA Black Car Service
                </Typography>
              </motion.div>

              {/* description */}
              <motion.div variants={itemVariants}>
                <RSTypography sx={{
                  mb: 3.5,
                  fontSize: "1.05rem",
                  lineHeight: 1.85,
                  color: "text.secondary",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  [theme.breakpoints.down("sm")]: { fontSize: "0.97rem" },
                }}>
                  {aboutUsDescription}
                </RSTypography>
              </motion.div>

              {/* feature chips */}
              <Stack spacing={1.2} sx={{ mb: 4.5 }}>
                {features.map((feature, i) => (
                  <FeatureChip key={i} variants={itemVariants}>
                    <CheckCircle sx={{ color: "#03930A", fontSize: 18, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.97rem", fontWeight: 500, color: "text.primary" }}>
                      {feature}
                    </Typography>
                  </FeatureChip>
                ))}
              </Stack>

              {/* stat cards */}
              <Grid container spacing={2.5}>
                {stats.map((stat, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <StatCard variants={itemVariants}>
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <Box sx={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: "rgba(3,147,10,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {stat.icon}
                        </Box>
                      </Box>
                      <Typography sx={{ color: "#03930A", fontWeight: 900, fontSize: "2rem", lineHeight: 1, mb: 0.4 }}>
                        {stat.value}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        {stat.label}
                      </Typography>
                    </StatCard>
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
