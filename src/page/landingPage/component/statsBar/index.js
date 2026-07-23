import React from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import {
  EmojiEvents,
  PeopleAlt,
  AccessTime,
  FlightLand,
  Star,
  VerifiedUser,
  LocalAtm,
  SupportAgent,
} from "@mui/icons-material";

const BarContainer = styled(Box)({
  background: "linear-gradient(100deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)",
  borderTop: "1px solid rgba(3,147,10,0.2)",
  borderBottom: "1px solid rgba(3,147,10,0.2)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(3,147,10,0.6), transparent)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(3,147,10,0.4), transparent)",
  },
});

const StatItem = styled(motion.div)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2.5, 2),
  position: "relative",
  "&:not(:last-child)::after": {
    content: '""',
    position: "absolute",
    right: 0,
    top: "25%",
    height: "50%",
    width: "1px",
    background: "rgba(255,255,255,0.08)",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

const IconBox = styled(Box)({
  width: 44,
  height: 44,
  borderRadius: "12px",
  background: "rgba(3,147,10,0.15)",
  border: "1px solid rgba(3,147,10,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 12px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(3,147,10,0.25)",
    transform: "scale(1.08)",
  },
});

const stats = [
  { icon: EmojiEvents, value: "11+",   label: "Years Experience",    accent: true },
  { icon: PeopleAlt,   value: "11K+",  label: "Happy Clients",       accent: false },
  { icon: Star,        value: "5.0★",  label: "Average Rating",      accent: true },
  { icon: FlightLand,  value: "50K+",  label: "Airport Rides",       accent: false },
  { icon: AccessTime,  value: "24/7",  label: "Always Available",    accent: true },
  { icon: VerifiedUser,value: "100%",  label: "Licensed & Insured",  accent: false },
  { icon: LocalAtm,    value: "Consistent", label: "Transparent Pricing", accent: true },
  { icon: SupportAgent,value: "< 5m",  label: "Response Time",       accent: false },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function StatsBar() {
  return (
    <BarContainer>
      <Container maxWidth="xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <Grid container>
            {stats.map(({ icon: Icon, value, label, accent }) => (
              <Grid item xs={6} sm={3} md={1.5} key={label}>
                <StatItem variants={itemVariants}>
                  <IconBox>
                    <Icon sx={{ color: "#4CB051", fontSize: 20 }} />
                  </IconBox>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.5rem", sm: "1.8rem" },
                      fontWeight: 800,
                      color: accent ? "#ffffff" : "#4CB051",
                      lineHeight: 1,
                      mb: 0.5,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.45)",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </Typography>
                </StatItem>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </BarContainer>
  );
}

export default StatsBar;
