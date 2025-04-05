import React, { useState } from "react";
import { Box, Container, Grid, Typography, Tabs, Tab } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import FaqAccordion from "./Accordion";

const QuestionMark = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  fontStyle: "normal",
  fontWeight: "400",
  fontSize: "378px",
  lineHeight: "457px",
  color: "#161F36",
  opacity: 0.1,
  userSelect: "none",
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontSize: "16px",
  fontWeight: 200,
  minWidth: 120,
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: "#03930A",
    fontWeight: 200,
  },
}));

// FAQ data organized by categories
const faqCategories = {
  general: [
    {
      summary: "How do I book a ride with ODA Transportation?",
      data: "You can book a ride through our website by filling out the booking form, calling our 24/7 booking line, or sending us an email. We recommend booking at least 24 hours in advance for guaranteed availability, though we do accommodate last-minute requests when possible.",
    },
    {
      summary: "What areas do you serve?",
      data: "We provide transportation services throughout the USA, but we are based pickup address in the state of California. We also offer long-distance transportation to neighboring cities and states. Please contact us for specific service area information.",
    },
    {
      summary: "What types of vehicles do you have in your fleet?",
      data: "Our fleet includes luxury sedans, executive SUVs, luxury vans, and stretch limousines. All vehicles are late models, meticulously maintained, and equipped with modern amenities for your comfort.",
    },
    {
      summary: "Are your drivers professionally trained?",
      data: "Yes, all our chauffeurs are professionally trained, licensed, and insured. They undergo rigorous background checks, defensive driving courses, and customer service training to ensure the highest level of professionalism and safety.",
    },
    {
      summary: "Do you offer corporate accounts?",
      data: "Yes, we offer corporate accounts with specialized services including dedicated account managers, customized billing options, priority booking, and volume discounts. Please contact our corporate services department for more information.",
    },
  ],
  airport: [
    {
      summary: "How does your flight tracking service work?",
      data: "We monitor your flight status in real-time and adjust your pickup time accordingly if your flight is delayed or arrives early. This ensures our chauffeur will be there when you arrive, regardless of schedule changes.",
    },
    {
      summary: "Where will the driver meet me at the airport?",
      data: "For domestic flights, our chauffeur will meet you at baggage claim holding a sign with your name. For international flights, the meeting point is typically just outside customs. Specific meeting locations can be arranged during booking.",
    },
    {
      summary: "Is there an additional charge if my flight is delayed?",
      data: "No, we do not charge extra for flight delays. Our flight tracking system allows us to adjust pickup times automatically, and waiting time due to flight delays is complimentary.",
    },
    {
      summary: "How much luggage can I bring?",
      data: "Luggage capacity depends on the vehicle type. Sedans can typically accommodate 3 large suitcases, SUVs can fit 5-6 suitcases, and vans can handle 8+ pieces of luggage. Please specify your luggage requirements when booking.",
    },
    {
      summary: "How far in advance should I book airport transportation?",
      data: "We recommend booking airport transportation at least 24-48 hours in advance, especially during peak travel seasons. For early morning flights, booking the day before is essential to secure your reservation.",
    },
  ],
  pointToPoint: [
    {
      summary: "How is pricing determined for Point to Point service?",
      data: "Point to Point service pricing is based on the distance between locations and the vehicle type selected. We offer fixed rates with no hidden fees, and you'll receive the exact price quote before confirming your booking.",
    },
    {
      summary: "Can I make a quick stop during a Point to Point trip?",
      data: "Brief stops (under 10 minutes) can usually be accommodated within a Point to Point service. For multiple stops or longer waiting periods, we recommend our Hourly Charter Service for more flexibility or we charge for the waiting time.",
    },
    {
      summary: "Is there a minimum distance requirement for Point to Point service?",
      data: "There is no minimum distance requirement, but there is a minimum fare of fee for any Point to Point service regardless of distance.",
    },
    {
      summary: "Can I schedule recurring Point to Point transportation?",
      data: "Yes, we offer scheduling for recurring transportation needs such as regular commutes, weekly appointments, or other routine travel. Discounted rates are available for recurring bookings.",
    },
    {
      summary: "What happens if I need to change my destination after booking?",
      data: "If you need to change your destination, please notify us as soon as possible. Changes made more than 3 hours before pickup can usually be accommodated without additional fees, though price adjustments may apply based on the new distance.",
    },
  ],
  hourlyCharter: [
    {
      summary: "What is the minimum booking time for Hourly Charter Service?",
      data: "Our Hourly Charter Service requires a minimum booking of any hours. This ensures we can provide you with dedicated service and flexibility for your transportation needs.",
    },
    {
      summary: "How does billing work for Hourly Charter Service?",
      data: "Billing begins at your scheduled pickup time and continues until you release the vehicle. Time is billed in 30-minute increments after the minimum 2-hour period.",
    },
    {
      summary: "Can I extend my Hourly Charter Service during the trip?",
      data: "Yes, you can extend your service during the trip, subject to the chauffeur's availability. Simply inform your chauffeur that you'd like to extend, and they'll check availability and confirm the additional time.",
    },
    {
      summary: "Is there a limit to how many stops I can make?",
      data: "There is no limit to the number of stops you can make during an Hourly Charter Service. You have the flexibility to customize your itinerary as needed within your booked hours.",
    },
    {
      summary: "Can I book Hourly Charter Service for special events?",
      data: "Our Hourly Charter Service is perfect for special events like weddings, proms, anniversaries, or corporate events. We offer special packages for events, including decorated vehicles upon request.",
    },
  ],
  payment: [
    {
      summary: "What payment methods do you accept?",
      data: "We accept all major credit cards, corporate checks, and electronic transfers. Cash payments are also accepted for certain services. All payments must be secured with a credit card at the time of booking, but for now we only accept credit card or cash payments and we will coming soon with a card management system.",
    },
    {
      summary: "When will I be charged for my reservation?",
      data: "For standard bookings, a 25% deposit is charged at the time of reservation, with the remaining balance charged after service completion. For special events and peak season bookings, full payment may be required in advance.",
    },
    {
      summary: "Is gratuity included in the price?",
      data: "Gratuity is not included in our base rates. The industry standard is 18-20% of the total fare, but gratuity is always at your discretion based on the service received.",
    },
    {
      summary: "Do you offer any discounts?",
      data: "We offer discounts for corporate accounts, frequent clients, round-trip bookings, and off-peak travel times. Special rates are also available for military personnel, seniors, and group bookings.",
    },
    {
      summary: "What is your cancellation policy?",
      data: "Cancellations made more than 12 hours before scheduled service receive a full refund. Cancellations within 12-24 hours incur a 50% fee. Cancellations less than 12 hours before service or no-shows are charged the full amount.",
    },
  ],
};

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("general");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box 
      component="section" 
      id="faq" 
      sx={{ 
        py: { xs: 2, md:3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={0}>
          <Grid item lg={2}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <QuestionMark>?</QuestionMark>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={10}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: "#03930A",
                  textAlign: { xs: 'center', lg: 'left' },
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 6,
                  textAlign: { xs: 'center', lg: 'left' },
                }}
              >
                Find answers to common questions about our transportation services.
              </Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="FAQ categories"
                >
                  <StyledTab label="General" value="general" />
                  <StyledTab label="Airport Service" value="airport" />
                  <StyledTab label="Point to Point" value="pointToPoint" />
                  <StyledTab label="Hourly Charter" value="hourlyCharter" />
                  <StyledTab label="Payment & Policies" value="payment" />
                </Tabs>
              </Box>

              <Box sx={{ mt: 4 }}>
                <FaqAccordion FAQ={faqCategories[activeTab]} />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
