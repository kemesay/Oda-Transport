import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  TextField, 
  MenuItem, 
  Button,
  Stack,
  Typography,
  CircularProgress
} from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Phone, Email, LocationOn, AccessTime } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { sendContactEmail } from '../../../../api/emailService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Styled components
const ContactContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(8, 2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10, 3),
  },
}));

const InfoCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  height: '100%',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));


const ServicesDescription = styled(Typography)(({ theme }) => ({
    fontSize: "1.1rem",
    color: theme.palette.text.secondary,
    maxWidth: "800px",
    margin: "0 auto",
    marginBottom: theme.spacing(6),
  }));


const ContactForm = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const services = [
  'Airport Service',
  'City Tour',
  'Corporate Travel',
  'Special Events',
  'Long Distance',
];

// Validation schema
const validationSchema = Yup.object({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name too short'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9()-\s]+$/, 'Invalid phone number')
    .required('Phone number is required'),
  service: Yup.string()
    .required('Please select a service'),
  message: Yup.string()
    .required('Message is required')
    .min(10, 'Message too short'),
});

// Add custom theme with the new primary color
const theme = createTheme({
  palette: {
    primary: {
      main: '#03930A',
    },
  },
});

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      
      try {
        const emailData = {
          from_name: values.fullName,
          from_email: values.email,
          from_phone: values.phone,
          service: values.service,
          message: values.message,
          subject: `New Contact Form Submission - ${values.service}`,
          to_email: 'info@odatransportation.com'
        };

        await sendContactEmail(emailData);

        toast.success('Message sent successfully! We will contact you soon.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            background: '#03930A',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '16px',
            fontWeight: 500,
          },
          containerId: 'contact-section-toast'
        });
        resetForm();
      } catch (error) {
        console.error('Email sending failed:', error);
        toast.error(error.message || 'Failed to send message. Please try again later.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '16px',
            fontWeight: 500,
          },
          containerId: 'contact-section-toast'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box position="relative" id="contact">
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: '#03930A',
            transformOrigin: '0%',
            scaleX,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '100%',
            maxWidth: '500px',
            pointerEvents: 'none',
          }}
        >
          <ToastContainer
            enableMultiContainer
            containerId="contact-section-toast"
            position="top-center"
            autoClose={5000}
            limit={1}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{
              position: 'relative',
              top: '20px',
              width: 'auto',
              maxWidth: '500px',
            }}
            toastStyle={{
              fontFamily: 'inherit',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </Box>

        <ContactContainer maxWidth="lg" padding={0} textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={6}>
              <Typography variant="h3" component="h2" gutterBottom color="#03930A">
                Contact Us
              </Typography>
              <ServicesDescription>
                Have questions or ready to book? Get in touch with our team for personalized assistance.
              </ServicesDescription>
            </Box>
          </motion.div>

          <Grid container spacing={2}>
            {/* Get In Touch Section */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <InfoCard>
                  <Typography variant="h4" gutterBottom>
                    Get In Touch
                  </Typography>

                  <Stack spacing={3} mt={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Phone sx={{ color: '#03930A' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Phone
                        </Typography>
                        <Typography>(714) 313-4269</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available 24/7
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <Email sx={{ color: '#03930A' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Email
                        </Typography>
                        <Typography>info@odatransportation.com</Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <LocationOn sx={{ color: '#03930A' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Address
                        </Typography>
                        <Typography>Los Angeles & Anahiem</Typography>
                        <Typography>California</Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <AccessTime sx={{ color: '#03930A' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Business Hours
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={7}>
                            <Typography>Monday - Friday:</Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography>5:00 AM - 8:00 PM</Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Typography>Saturday:</Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography>9:00 AM - 6:00 PM</Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <Typography>Sunday:</Typography>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography>10:00 AM - 4:00 PM</Typography>
                          </Grid>
                        </Grid>
                        <Typography variant="body2" sx={{ color: '#03930A' }} mt={1}>
                          24/7 Booking & Support Available
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </InfoCard>
              </motion.div>
            </Grid>

            {/* Updated Send Message Section */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <ContactForm component="form" onSubmit={formik.handleSubmit}>
                  <Typography variant="h4" gutterBottom>
                    Send Us a Message
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        name="fullName"
                        label="Full Name"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                        helperText={formik.touched.fullName && formik.errors.fullName}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        name="email"
                        label="Email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        name="phone"
                        label="Phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <StyledTextField
                        select
                        fullWidth
                        name="service"
                        label="Service Needed"
                        value={formik.values.service}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.service && Boolean(formik.errors.service)}
                        helperText={formik.touched.service && formik.errors.service}
                      >
                        <MenuItem value="">Select a service</MenuItem>
                        {services.map((service) => (
                          <MenuItem key={service} value={service}>
                            {service}
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </Grid>

                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        multiline
                        rows={4}
                        name="message"
                        label="Message"
                        value={formik.values.message}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.message && Boolean(formik.errors.message)}
                        helperText={formik.touched.message && formik.errors.message}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isSubmitting}
                        startIcon={!isSubmitting && <SendIcon />}  // ✅ Add this line

                        sx={{
                          mt: 4,
                          px: { xs: 2, sm: 3, md: 4 },
                          py: { xs: 1.2, sm: 1.7 },
                          letterSpacing: "1.5px",
                          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.6rem" }, // responsive
                          fontWeight: 50,
                          boxShadow: "0 2px 7px rgba(3, 147, 10, 0.2)",
                          transition: "all 0.3s ease-in-out",
                          textTransform: "initial",

                          '&:hover': {
                            transform: "scale(1.05)",
                            boxShadow: "0 3px 10px rgba(3, 147, 10, 0.3)",
                          },
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </ContactForm>
              </motion.div>
            </Grid>
          </Grid>
        </ContactContainer>
      </Box>
    </ThemeProvider>
  );
}

export default Contact; 