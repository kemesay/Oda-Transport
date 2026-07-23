import React from "react";
import {
  Box,
  Card,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { CheckCircle } from "@mui/icons-material";
import RSButton from "../../../../components/RSButton";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(3.5),
  borderRadius: theme.spacing(2),
  boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  backgroundColor: theme.palette.background.paper,
  border: "1px solid rgba(0,0,0,0.06)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 36px rgba(3,147,10,0.12)",
    "& .card-accent": {
      width: "100%",
    },
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.5),
    "&:hover": {
      transform: "translateY(-3px)",
    },
  },
}));

const CardAccent = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  height: "3px",
  width: "60px",
  background: "linear-gradient(90deg, #03930A, #4CB051)",
  transition: "width 0.4s ease",
  borderRadius: "0 0 2px 0",
});

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  minWidth: 52,
  borderRadius: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(3,147,10,0.12) 0%, rgba(76,176,81,0.08) 100%)",
  border: "1px solid rgba(3,147,10,0.2)",
  color: "#03930A",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: 44,
    height: 44,
    minWidth: 44,
  },
  "& svg": {
    fontSize: 26,
    [theme.breakpoints.down("sm")]: {
      fontSize: 22,
    },
  },
}));

const FeatureRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.75),
}));

function ServiceCard({ service, delay }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const getBookingPath = (serviceId) => {
    switch (serviceId) {
      case "airport":      return "/home/1";
      case "point-to-point": return "/home/2";
      case "hourly":       return "/home/3";
      default:             return "/home/1";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay, ease: "easeOut" },
    },
  };

  return (
    <motion.div variants={cardVariants} style={{ height: "100%" }}>
      <StyledCard>
        <CardAccent className="card-accent" />

        <Box display="flex" flexDirection="column" height="100%">
          {/* Icon */}
          <IconWrapper>
            <service.icon />
          </IconWrapper>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.15rem" },
              color: "text.primary",
              mb: 1,
            }}
          >
            {service.title}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.88rem", sm: "0.92rem" },
              lineHeight: 1.65,
              mb: 2.5,
            }}
          >
            {service.description}
          </Typography>

          {/* Features list */}
          {service.features && service.features.length > 0 && (
            <Box sx={{ mb: 3, flex: 1 }}>
              {service.features.map((feature, i) => (
                <FeatureRow key={i}>
                  <CheckCircle
                    sx={{
                      color: "#03930A",
                      fontSize: 17,
                      mt: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.87rem",
                      color: "text.secondary",
                      lineHeight: 1.5,
                    }}
                  >
                    {feature}
                  </Typography>
                </FeatureRow>
              ))}
            </Box>
          )}

          {/* CTA */}
          <Box mt="auto">
            <RSButton
              onClick={() => navigate(getBookingPath(service.id))}
              backgroundcolor="success.main"
              sx={{
                width: "100%",
                py: { xs: 1.1, sm: 1.3 },
                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                fontWeight: 600,
                letterSpacing: "0.5px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(3,147,10,0.18)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: isMobile ? "none" : "translateY(-1px)",
                  boxShadow: "0 4px 16px rgba(3,147,10,0.3)",
                },
              }}
            >
              Book Now
            </RSButton>
          </Box>
        </Box>
      </StyledCard>
    </motion.div>
  );
}

export default ServiceCard;
