import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import ServiceCard from "./ServiceCard";
import { FlightTakeoff, DirectionsCar, AccessTime } from "@mui/icons-material";

const ServicesContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(8, 2),
  textAlign: "center",
}));

const ServicesTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: "#03930A",
}));

const ServicesDescription = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  color: theme.palette.text.secondary,
  maxWidth: "800px",
  margin: "0 auto",
  marginBottom: theme.spacing(6),
}));

const services = [
  {
    id: "airport",
    title: "Airport Service",
    description: "Reliable and punctual airport pickups and drop-offs available 24/7. Our professional chauffeurs track your flight and adjust for any delays, ensuring a stress-free travel experience.",
    icon: FlightTakeoff,
    features: [
      "Flight tracking",
      "Meet & greet service",
      "Luggage assistance",
      "No waiting charges for delayed flights"
    ],
    path: "/services/airport"
  },
  {
    id: "point-to-point",
    title: "Point to Point Service",
    description: "Efficient transportation between any two locations with our premium vehicles. Perfect for business meetings, special events, or any occasion requiring reliable transportation.",
    icon: DirectionsCar,
    features: [
      "Direct routes",
      "Fixed pricing",
      "Multiple vehicle options",
      "Professional chauffeurs"
    ],
    path: "/services/point-to-point"
  },
  {
    id: "hourly",
    title: "Hourly Charter Service",
    description: "Flexible transportation solutions charged by the hour. Ideal for multiple stops, shopping trips, business meetings, or when your schedule is uncertain.",
    icon: AccessTime,
    features: [
      "Minimum 5-hour booking",
      "Multiple stops",
      "Wait time included",
      "Customizable itinerary"
    ],
    path: "/services/hourly"
  }
];

function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  return (
    <ServicesContainer maxWidth="xl" id="services">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <ServicesTitle variant="h2">
          Our Services
        </ServicesTitle>
        <ServicesDescription>
          We provide premium transportation services tailored to meet your specific
          needs with professionalism and comfort.
        </ServicesDescription>

        <Grid container spacing={4} justifyContent="center">
          {services.map((service, index) => (
            <Grid item xs={12} md={4} key={service.id}>
              <ServiceCard 
                service={service} 
                delay={index * 0.2} 
              />
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </ServicesContainer>
  );
}

export default Services; 