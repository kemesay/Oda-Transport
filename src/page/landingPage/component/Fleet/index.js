import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import axios from "axios";
import { Person, Luggage, ChevronLeft, ChevronRight } from "@mui/icons-material";
import RSButton from "../../../../components/RSButton";
import { useNavigate } from "react-router-dom";

const FleetContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(10, 2),
  position: 'relative',
}));

const FleetHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  color: '#03930A',
  marginBottom: theme.spacing(8),
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2, 0),
  overflow: 'hidden',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1, 0),
  },
}));

const CarouselTrack = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  position: 'relative',
}));

const CarCard = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  minHeight: 400,
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    minHeight: 300,
    padding: theme.spacing(1),
  },
}));

const CarInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  color: theme.palette.text.secondary,
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  borderRadius: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    color: 'black',
  },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: 48,
  height: 48,
  zIndex: 2,
  '&:hover': {
    backgroundColor: '#f8f8f8',
    transform: 'translateY(-50%) scale(1.1)',
  },
  transition: 'all 0.3s ease',
}));

export default function Fleet() {
  const [cars, setCars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('http://api.odatransportation.com/api/v1/cars');
        setCars(response.data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cars.length - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setCurrentIndex((prev) => (prev < cars.length - 1 ? prev + 1 : 0));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [currentIndex, isAnimating]);

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const slideVariants = {
    enterRight: {
      x: '100%',
      opacity: 0
    },
    enterLeft: {
      x: '-100%',
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1
    },
    exitLeft: {
      x: '-100%',
      opacity: 0
    },
    exitRight: {
      x: '100%',
      opacity: 0
    }
  };

  const getImageStyle = (imageUrl) => {
    return {
      maxWidth: '100%',
      maxHeight: '500px',
      objectFit: 'contain',
      margin: 'auto',
    };
  };

  const handleBooking = () => {
    navigate('/home/1');
  };

  return (
    <FleetContainer maxWidth="xl" id="fleet">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <FleetHeader>
          <Typography
            variant="h4"
            fontWeight="600"
            sx={{ mb: 2 }}
          >
            Our Fleet
          </Typography>
          <Typography
            variant="h6"
            color="text.white"

            sx={{ maxWidth: 800, mx: 'auto', color: 'white'}}
          >
            Explore our diverse range of premium vehicles designed to meet your
            transportation needs with style and comfort.
          </Typography>
        </FleetHeader>

        <CarouselContainer>
          {!loading && cars.length > 0 && (
            <>
              <NavigationButton
                onClick={handlePrevious}
                disabled={isAnimating}
                sx={{ 
                  left: { xs: 2, sm: 10, md: 20 },
                  opacity: isAnimating ? 0.5 : 1,
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                <ChevronLeft sx={{ fontSize: 28 }} />
              </NavigationButton>

              <Box
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                sx={{ overflow: 'hidden', width: '100%' }}
              >
                <motion.div
                  key={currentIndex}
                  initial={direction === 'right' ? 'enterRight' : 'enterLeft'}
                  animate="center"
                  exit={direction === 'right' ? 'exitLeft' : 'exitRight'}
                  variants={slideVariants}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  <CarCard>
                    <ImageContainer>
                      <motion.img
                        src={cars[currentIndex].carImageUrl}
                        alt={cars[currentIndex].carName}
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </ImageContainer>

                    <CarInfo>
                      <Box>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Typography
                            variant="h3"
                            fontWeight="700"
                            sx={{ 
                              mb: 2,
                              fontSize: { xs: '1.8rem', md: '2.2rem' },
                              color: 'text.primary',
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: 0,
                                width: 60,
                                height: 3,
                                backgroundColor: '#03930A',
                                borderRadius: 1,
                              }
                            }}
                          >
                            {cars[currentIndex].carName}
                          </Typography>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Typography
                            sx={{
                              mb: 4,
                              color: 'text.secondary',
                              fontSize: '1.1rem',
                              lineHeight: 1.6,
                            }}
                          >
                            {cars[currentIndex].carDescription}
                          </Typography>
                        </motion.div>

                        <Grid container spacing={2} sx={{ mb: 4 }}>
                          <Grid item xs={6}>
                            <FeatureItem>
                              <Person />
                              <Typography sx={{ fontWeight: 500 }}>
                                {cars[currentIndex].maxPassengers} passengers
                              </Typography>
                            </FeatureItem>
                          </Grid>
                          <Grid item xs={6}>
                            <FeatureItem>
                              <Luggage />
                              <Typography sx={{ fontWeight: 500 }}>
                                {cars[currentIndex].maxSuitcases} suitcases
                              </Typography>
                            </FeatureItem>
                          </Grid>
                        </Grid>
                      </Box>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <RSButton
                          variant="contained"
                          backgroundcolor="#03930A"
                          fullWidth
                          onClick={handleBooking}
                          sx={{
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px rgba(3, 147, 10, 0.2)',
                            }
                          }}
                        >
                          Book With One Of These Vehicles
                        </RSButton>
                      </motion.div>
                    </CarInfo>
                  </CarCard>
                </motion.div>
              </Box>

              <NavigationButton
                onClick={handleNext}
                disabled={isAnimating}
                sx={{ 
                  right: { xs: 2, sm: 10, md: 20 },
                  opacity: isAnimating ? 0.5 : 1,
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                <ChevronRight sx={{ fontSize: 28 }} />
              </NavigationButton>

              {/* Add swipe indicator for mobile */}
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  justifyContent: 'center',
                  mt: 2,
                  gap: 1,
                }}
              >
                {cars.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index === currentIndex ? '#03930A' : '#E0E0E0',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Box>
            </>
          )}

          {loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
              }}
            >
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #03930A',
                  }}
                />
              </motion.div>
            </Box>
          )}
        </CarouselContainer>
      </motion.div>
    </FleetContainer>
  );
} 