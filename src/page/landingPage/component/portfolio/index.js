import React from "react";
import { Box, Grid, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { 
  Security, 
  Speed, 
  EmojiTransportation, 
  Support 
} from "@mui/icons-material";

const FeatureCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease",
  height: "100%",
  "&:hover": {
    transform: "translateY(-8px)",
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.light,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& svg": {
    fontSize: 30,
    color: theme.palette.success.main,
  }
}));

const features = [
  {
    icon: Security,
    title: "Safe & Secure",
    description: "All our drivers are thoroughly vetted and background checked for your safety."
  },
  {
    icon: Speed,
    title: "Fast & Reliable",
    description: "Punctual service with real-time tracking and updates for your peace of mind."
  },
  {
    icon: EmojiTransportation,
    title: "Modern Fleet",
    description: "Well-maintained vehicles equipped with latest amenities for your comfort."
  },
  {
    icon: Support,
    title: "24/7 Support",
    description: "Round-the-clock customer service to assist you whenever you need."
  }
];

function Portfolio() {
  return (
    <Box 
      sx={{ 
        py: { xs: 6, md: 10 },
        backgroundColor: "background.default" 
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight="600"
            sx={{ mb: 6 }}
          >
            Why Choose <span style={{ color: "#03930A" }}>Oda Transportation</span>
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <FeatureCard>
                  <IconWrapper>
                    <feature.icon />
                  </IconWrapper>
                  <Typography
                    variant="h5"
                    fontWeight="200"
                    sx={{ mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    fontWeight="200"
                    fontSize="1rem"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Portfolio; 