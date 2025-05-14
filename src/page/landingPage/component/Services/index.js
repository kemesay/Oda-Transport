import React from "react";
import { Container, Grid, Typography, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import ServiceCard from "./ServiceCard";
import { FlightTakeoff, DirectionsCar, AccessTime } from "@mui/icons-material";

const ServicesContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(-1),
  textAlign: "center",
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(-1),
  },
}));

const ServicesTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: "#03930A",
  [theme.breakpoints.down('sm')]: {
    fontSize: "2rem",
    marginBottom: theme.spacing(1),
  },
}));

const ServicesDescription = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  color: theme.palette.text.secondary,
  maxWidth: "800px",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: "1rem",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0, 2),
  },
}));

const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& .MuiGrid-item': {
      padding: theme.spacing(1, 1),
    },
  },
}));

const services = [
  {
    id: "airport",
    title: "Airport Service",
    description: "Reliable airport Pickups & Drop-offs services.",
    icon: FlightTakeoff,
    // features: [
    //   "Flight tracking",
    //   "Meet & greet service",
    //   "Luggage assistance",
    //   // "No waiting charges for delayed flights"
    // ],
    path: "/services/airport"
  },
  {
    id: "point-to-point",
    title: "Point to Point Service",
    description: "Efficient transportation between any two locations. Perfect for business meetings & special events.",
    icon: DirectionsCar,
    // features: [
    //   "Multiple vehicle options",
    //   "Professional chauffeurs",
    //   // "Direct routes",
    //   "Fixed pricing",

    // ],
    path: "/services/point-to-point"
  },
  {
    id: "hourly",
    title: "Hourly Charter Service",
    description: "The idea for multiple stops a city tour,  business meeting, wedding & much more.",
    icon: AccessTime,
    // features: [
    //   "Minimum 5-hour booking",
    //   "Multiple stops",
    //   "Wait time included",
    //   // "Customizable itinerary"
    // ],
    path: "/services/hourly"
  }
];

function Services() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.2 : 0.3
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

        <ResponsiveGrid 
          container 
          spacing={isMobile ? 1.5 : 3} 
          justifyContent="center"
        >
          {services.map((service, index) => (
            <Grid 
              item 
              xs={12} 
              sm={12} 
              md={4} 
              key={service.id}
            >
              <ServiceCard
                service={service}
                delay={isMobile ? index * 0.15 : index * 0.2}
              />
            </Grid>
          ))}
        </ResponsiveGrid>
      </motion.div>
    </ServicesContainer>
  );
}

export default Services; 
