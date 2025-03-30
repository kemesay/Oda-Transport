import React from "react";
import { 
  Box, 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { Check } from "@mui/icons-material";
import RSButton from "../../../../components/RSButton";
import { useNavigate } from "react-router-dom";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease-in-out",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-8px)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  backgroundColor: "#03930A",
  color: theme.palette.common.white,
  "& svg": {
    fontSize: "32px",
  },
}));

const ServiceTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: "#03930A",
}));

const ServiceDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
  lineHeight: 1.6,
}));

const FeatureList = styled(List)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FeatureItem = styled(ListItem)({
  padding: 0,
  marginBottom: "8px",
});

const CheckIcon = styled(Check)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: "20px",
}));

function ServiceCard({ service, delay }) {
  const navigate = useNavigate();
  
  const getBookingPath = (serviceId) => {
    switch (serviceId) {
      case 'airport':
        return '/home/1';
      case 'point-to-point':
        return '/home/2';
      case 'hourly':
        return '/home/3';
      default:
        return '/home/1';
    }
  };

  const handleBooking = () => {
    const path = getBookingPath(service.id);
    navigate(path);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div variants={cardVariants}>
      <StyledCard>
        <Box display="flex" flexDirection="column" height="100%">
          <IconWrapper component={motion.div} whileHover={{ scale: 1.1 }}>
            <service.icon />
          </IconWrapper>

          <ServiceTitle variant="h5">
            {service.title}
          </ServiceTitle>

          <ServiceDescription>
            {service.description}
          </ServiceDescription>

          <FeatureList>
            {service.features.map((feature, index) => (
              <FeatureItem key={index}>
                <ListItemIcon sx={{ minWidth: "32px" }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={feature}
                  primaryTypographyProps={{
                    sx: { fontSize: "0.95rem" }
                  }}
                />
              </FeatureItem>
            ))}
          </FeatureList>

          <Box mt="auto">
            <RSButton
              fullWidth
              variant="contained"
              backgroundcolor="primary.main"
              onClick={handleBooking}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
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