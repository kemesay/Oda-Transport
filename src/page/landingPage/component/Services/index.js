import React from "react";
import { Container, Grid, Typography, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import ServiceCard from "./ServiceCard";
import { FlightTakeoff, DirectionsCar, AccessTime } from "@mui/icons-material";

const ServicesContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  textAlign: "center",
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  fontWeight: 600,
  letterSpacing: "3px",
  textTransform: "uppercase",
  color: "#03930A",
  marginBottom: theme.spacing(1),
}));

const ServicesTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2.4rem",
  fontWeight: 700,
  marginBottom: theme.spacing(1.5),
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.9rem",
  },
}));

const ServicesDescription = styled(Typography)(({ theme }) => ({
  fontSize: "1.05rem",
  color: theme.palette.text.secondary,
  maxWidth: "680px",
  margin: "0 auto",
  marginBottom: theme.spacing(5),
  lineHeight: 1.7,
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.95rem",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(0, 1),
  },
}));

const services = [
  {
    id: "airport",
    title: "Airport Service",
    description: "Reliable pickups & drop-offs to all major Southern California airports with real-time flight tracking.",
    icon: FlightTakeoff,
    features: [
      "Flight tracking for delays",
      "Meet & greet service",
      "Luggage assistance",
      "LAX, SNA, LGB, BUR, ONT",
    ],
    path: "/services/airport",
  },
  {
    id: "point-to-point",
    title: "Point to Point",
    description: "Efficient transportation between any two locations — perfect for business meetings and special events.",
    icon: DirectionsCar,
    features: [
      "Multiple vehicle options",
      "Professional chauffeurs",
      "Consistent transparent pricing",
      "Business & event ready",
    ],
    path: "/services/point-to-point",
  },
  {
    id: "hourly",
    title: "Hourly Charter",
    description: "Flexible hourly bookings for city tours, corporate events, weddings, and multi-stop itineraries.",
    icon: AccessTime,
    features: [
      "Minimum 5-hour booking",
      "Multiple stops included",
      "Customizable itinerary",
      "Weddings & events",
    ],
    path: "/services/hourly",
  },
];

function Services() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: isMobile ? 0.15 : 0.2 },
    },
  };

  return (
    <ServicesContainer maxWidth="xl" id="services">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <SectionLabel>What we offer</SectionLabel>
        <ServicesTitle variant="h2">Our Services</ServicesTitle>
        <ServicesDescription>
          Premium transportation solutions tailored to your schedule — every ride
          delivered with professionalism, comfort, and reliability.
        </ServicesDescription>

        <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
          {services.map((service, index) => (
            <Grid item xs={12} sm={12} md={4} key={service.id}>
              <ServiceCard service={service} delay={isMobile ? index * 0.12 : index * 0.18} />
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </ServicesContainer>
  );
}

export default Services;
