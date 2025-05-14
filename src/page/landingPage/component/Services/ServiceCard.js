import React from "react";
import { 
  Box, 
  Card, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery
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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.5),
    "&:hover": {
      transform: "translateY(-4px)",
    },
  },
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.2),
    marginBottom: theme.spacing(1.2),
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  minWidth: 48,
  minHeight: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #03930A 60%, #4CAF50 100%)",
  color: theme.palette.common.white,
  boxShadow: "0 2px 8px rgba(3,147,10,0.10)",
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
  },
  "& svg": {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      fontSize: 20,
    },
  },
}));

const ServiceTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.35rem",
  fontWeight: 700,
  // marginBottom: theme.spacing(2),
  color: "#03930A",
  [theme.breakpoints.down('sm')]: {
    letterSpacing: "0.5px",
    fontSize: "1.25rem",
    // marginBottom: theme.spacing(1.5),
  },
}));

const ServiceDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
  lineHeight: 1.6,
  [theme.breakpoints.down('sm')]: {
    fontSize: "0.9rem",
    marginBottom: theme.spacing(2),
    lineHeight: 1.5,
  },
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
          <HeaderRow>
            <IconWrapper component={motion.div} whileHover={{ scale: 1.1 }}>
              <service.icon />
            </IconWrapper>
            <ServiceTitle variant="h5">
              {service.title}
            </ServiceTitle>
          </HeaderRow>

          {/* <ServiceTitle variant="h5">
            {service.title}
          </ServiceTitle> */}

          <ServiceDescription>
            {service.description}
          </ServiceDescription>



          <Box mt="auto">
            <RSButton
              onClick={handleBooking}
              backgroundcolor="success.main"
              sx={{
                mt: { xs: 2, sm: 3, md: 4 },
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 1, sm: 1.5, md: 1.7 },
                fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
                fontWeight: 50,
                letterSpacing: { xs: "1px", sm: "1.5px" },
                borderRadius: { xs: 1.5, sm: 2 },
                boxShadow: "0 2px 7px rgba(3, 147, 10, 0.2)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: isMobile ? "scale(1.02)" : "scale(1.05)",
                  boxShadow: "0 3px 10px rgba(3, 147, 10, 0.3)",
                },
              }}
            >
              Book Ride Now
            </RSButton>
          </Box>
        </Box>
      </StyledCard>
    </motion.div>
  );
}

export default ServiceCard; 