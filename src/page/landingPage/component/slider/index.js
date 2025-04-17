import React, { useState, useEffect } from "react";
import Carousel from "react-material-ui-carousel";
import { Box, Grid, Typography, Container } from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import axios from "axios";
import { remote_host } from "../../../../globalVariable";
import { authHeader } from "../../../../util/authUtil";

const SideTracker = styled(Box)(({ theme, isLeft }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  left: isLeft ? 0 : 'auto',
  right: isLeft ? 'auto' : 0,
  height: '100px',
  width: '4px',
  backgroundColor: 'rgba(3, 147, 10, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const TrackerProgress = styled(motion.div)(({ theme }) => ({
  height: '0%',
  width: '100%',
  backgroundColor: '#03930A',
  borderRadius: '2px',
}));

const SlideContainer = styled(Container)(({ theme }) => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 0),
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2, 0),
  },
}));

const ImageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: '300px',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  padding: theme.spacing(2),
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  [theme.breakpoints.up('md')]: {
    minHeight: '400px',
  },
}));

const ContentBox = styled(Box)(({ theme, isEven }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  height: '100%',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
    marginLeft: isEven ? theme.spacing(2) : 0,
    marginRight: !isEven ? theme.spacing(2) : 0,
  },
}));

const SlideTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  marginTop: theme.spacing(3, 0),
  position: 'relative',
  textTransform: 'initial',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: 0,
    width: '60px',
    height: '3px',
    backgroundColor: '#03930A',
  },
}));

export default function Slider() {
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const getPopularPlaces = async () => {
      try {
        const res = await axios.get(`${remote_host}/api/v1/popular-places`, authHeader());
        setPopularPlaces(res.data);
      } catch (e) {
        console.error("Error fetching popular places:", e);
      }
    };
    getPopularPlaces();
  }, []);

  const handleChange = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', position: 'relative' }}>
      <SideTracker isLeft>
        <TrackerProgress
          animate={{
            height: `${((currentIndex + 1) / popularPlaces.length) * 100}%`
          }}
          transition={{ duration: 0.3 }}
        />
      </SideTracker>

      <Carousel
        animation="slide"
        swipe={true}
        duration={800}
        interval={6000}
        stopAutoPlayOnHover={true}
        onChange={handleChange}
        indicators={false}
        navButtonsProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: '#333',
            borderRadius: '50%',
            padding: '12px',
            margin: '0 20px',
            display: 'none',
          }
        }}
        sx={{
          minHeight: { xs: '400px', sm: '500px', md: '600px' },
          backgroundColor: 'background.paper',
        }}
      >
        {popularPlaces.map((place, index) => (
          <SlideItem
            key={index}
            data={place}
            isEven={index % 2 === 0}
            totalSlides={popularPlaces.length}
            currentIndex={currentIndex}
          />
        ))}
      </Carousel>

      <SideTracker>
        <TrackerProgress
          animate={{
            height: `${((currentIndex + 1) / popularPlaces.length) * 100}%`
          }}
          transition={{ duration: 0.3 }}
        />
      </SideTracker>
    </Box>
  );
}

function SlideItem({ data, isEven }) {
  const { image, title, description } = data;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(null);

  const handleImageLoad = (event) => {
    const img = event.target;
    setImageAspectRatio(img.naturalWidth / img.naturalHeight);
    setImageLoaded(true);
  };

  const getImageStyle = () => {
    if (!imageAspectRatio) return {};

    const style = {
      transition: 'all 0.5s ease',
      padding: '10px',
    };

    if (imageAspectRatio > 1) {
      return {
        ...style,
        width: '100%',
        height: 'auto',
        maxHeight: '100%',
        objectFit: 'contain',
      };
    } else {
      return {
        ...style,
        width: 'auto',
        height: '100%',
        maxWidth: '100%',
        objectFit: 'contain',
      };
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: isEven ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, x: isEven ? 50 : -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <SlideContainer maxWidth="xl">
      <Grid
        container
        spacing={2}
        alignItems="flex-start"
        direction={isEven ? 'row' : 'row-reverse'}
      >
        <Grid item xs={12} md={7}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
          >
            <ImageWrapper>
              <Box
                component="img"
                src={image}
                alt={title}
                onLoad={handleImageLoad}
                sx={{
                  opacity: imageLoaded ? 1 : 0,
                  ...getImageStyle(),
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.6s ease-in-out',
                  },
                }}
              />
              {!imageLoaded && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #03930A',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                      '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
                    },
                  }}
                />
              )}
            </ImageWrapper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={5}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <ContentBox isEven={isEven}>
              <SlideTitle
                variant="h4"
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.3rem', md: '2.8rem', lg: '2.5rem' },
                  mb: { xs: 1, md: 2 },
                  color: '#03930A',
                  marginTop: 0,
                }}
              >
                {title}
              </SlideTitle>
              <Typography
                variant="h6"
                fontWeight="300"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                  lineHeight: 1.2,
                  mb: 2
                }}
              >

                {description}
              </Typography>
            </ContentBox>
          </motion.div>
        </Grid>
      </Grid>
    </SlideContainer>
  );
}
