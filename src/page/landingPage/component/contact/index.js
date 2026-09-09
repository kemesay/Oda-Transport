import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  CircularProgress,
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

/* ── theme ──────────────────────────────────────────────────────────────── */

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#03930A' },
    background: { paper: 'rgba(255,255,255,0.05)' },
  },
});

/* ── styled ─────────────────────────────────────────────────────────────── */

const GlassCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(4),
  height: '100%',
  transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(3,147,10,0.3)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  },
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(1.8, 2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(3,147,10,0.08)',
    borderColor: 'rgba(3,147,10,0.2)',
  },
}));

const IconBubble = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'rgba(3,147,10,0.15)',
  border: '1px solid rgba(3,147,10,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const DarkTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.2),
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.14)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(3,147,10,0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#03930A',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.45)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4CB051',
  },
  '& .MuiFormHelperText-root': {
    color: '#f87171',
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255,255,255,0.45)',
  },
  '& input': {
    color: '#fff',
  },
  '& textarea': {
    color: '#fff',
  },
}));

const services = [
  'Airport Service',
  'City Tour',
  'Corporate Travel',
  'Special Events',
  'Long Distance',
];

const validationSchema = Yup.object({
  fullName: Yup.string().required('Full name is required').min(2, 'Name too short'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(/^[0-9()-\s]+$/, 'Invalid phone number').required('Phone number is required'),
  service: Yup.string().required('Please select a service'),
  message: Yup.string().required('Message is required').min(10, 'Message too short'),
});

const menuDarkPaper = {
  PaperProps: {
    sx: {
      bgcolor: '#0f1e35',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      '& .MuiMenuItem-root': {
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.95rem',
        '&:hover': { bgcolor: 'rgba(3,147,10,0.12)' },
        '&.Mui-selected': { bgcolor: 'rgba(3,147,10,0.18)', color: '#4CB051' },
      },
    },
  },
};

/* ── component ──────────────────────────────────────────────────────────── */

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();

  // Same admin-editable CMS data the site Footer/About/Terms sections use
  // (src/store/actions/footerAction.js), so contact details here never
  // drift out of sync with what an admin sets in the dashboard.
  const {
    contactEmail,
    contactPhoneNumber,
    addressState,
    addressZipCode,
  } = useSelector((state) => state.footerReducer);

  const displayPhone = contactPhoneNumber || '(714) 313-4269';
  const displayEmail = contactEmail || 'info@odatransportation.com';
  const displayLocation = addressState || 'California, USA';
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const formik = useFormik({
    initialValues: { fullName: '', email: '', phone: '', service: '', message: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        await sendContactEmail({
          from_name: values.fullName,
          from_email: values.email,
          from_phone: values.phone,
          service: values.service,
          message: values.message,
          subject: `New Contact Form Submission - ${values.service}`,
          to_email: displayEmail,
        });
        toast.success('Message sent successfully! We will contact you soon.', {
          position: 'top-center', autoClose: 5000, theme: 'colored',
          style: { background: '#03930A', borderRadius: '8px', fontSize: '16px' },
          containerId: 'contact-section-toast',
        });
        resetForm();
      } catch (error) {
        toast.error(error.message || 'Failed to send message. Please try again later.', {
          position: 'top-center', autoClose: 5000, theme: 'colored',
          style: { borderRadius: '8px', fontSize: '16px' },
          containerId: 'contact-section-toast',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        id="contact"
        position="relative"
        sx={{
          background: 'linear-gradient(135deg, #060d1a 0%, #0a1628 55%, #07111f 100%)',
          overflow: 'hidden',
        }}
      >
        {/* ── decorative background blobs ─────────────────────── */}
        <Box sx={{
          position: 'absolute', top: '-15%', right: '-8%',
          width: '50vw', height: '50vw', maxWidth: 700,
          background: 'radial-gradient(circle, rgba(3,147,10,0.09) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-10%', left: '-6%',
          width: '40vw', height: '40vw', maxWidth: 560,
          background: 'radial-gradient(circle, rgba(3,147,10,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* dot-grid texture */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* scroll progress bar */}
        <motion.div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #03930A, #4CB051)',
          transformOrigin: '0%', scaleX, zIndex: 10,
        }} />

        {/* toast container */}
        <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '100%', maxWidth: '500px', pointerEvents: 'none' }}>
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
            style={{ position: 'relative', top: '20px', width: 'auto', maxWidth: '500px' }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 7, md: 9 } }}>

          {/* ── section heading ────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Box textAlign="center" mb={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.2 }}>
                <Box sx={{ width: 32, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, transparent, #03930A)' }} />
                <Typography sx={{ color: '#4CB051', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                  Get in Touch
                </Typography>
                <Box sx={{ width: 32, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #03930A, transparent)' }} />
              </Box>
              <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: '#fff', mb: 1.5, letterSpacing: '-0.5px', fontSize: { xs: '2rem', md: '2.8rem' } }}>
                Contact Us
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: { xs: '1rem', md: '1.1rem' }, maxWidth: 560, mx: 'auto', lineHeight: 1.75 }}>
                Have questions or ready to book? Get in touch with our team for personalized assistance.
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3} alignItems="stretch">

            {/* ── Left: Get In Touch ──────────────────────────── */}
            <Grid item xs={12} md={5}>
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: '100%' }}>
                <GlassCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                    <Box sx={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #03930A, #4CB051)' }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                      Get In Touch
                    </Typography>
                  </Box>

                  <Stack spacing={1.8}>
                    <InfoRow>
                      <IconBubble>
                        <Phone sx={{ color: '#4CB051', fontSize: 18 }} />
                      </IconBubble>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 0.3 }}>
                          Phone
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{displayPhone}</Typography>
                        <Typography sx={{ color: '#4CB051', fontSize: '0.8rem' }}>Available 24/7</Typography>
                      </Box>
                    </InfoRow>

                    <InfoRow>
                      <IconBubble>
                        <Email sx={{ color: '#4CB051', fontSize: 18 }} />
                      </IconBubble>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 0.3 }}>
                          Email
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{displayEmail}</Typography>
                      </Box>
                    </InfoRow>

                    <InfoRow>
                      <IconBubble>
                        <LocationOn sx={{ color: '#4CB051', fontSize: 18 }} />
                      </IconBubble>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', mb: 0.3 }}>
                          Location
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Los Angeles &amp; Anaheim</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
                          {displayLocation}{addressZipCode ? ` ${addressZipCode}` : ''}
                        </Typography>
                      </Box>
                    </InfoRow>

                    <InfoRow sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <IconBubble>
                          <AccessTime sx={{ color: '#4CB051', fontSize: 18 }} />
                        </IconBubble>
                        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Business Hours
                        </Typography>
                      </Box>
                      <Box sx={{ pl: 0.5, width: '100%' }}>
                        {[
                          { day: 'Monday – Friday', hours: '5:00 AM – 8:00 PM' },
                          { day: 'Saturday',        hours: '9:00 AM – 6:00 PM' },
                          { day: 'Sunday',          hours: '10:00 AM – 4:00 PM' },
                        ].map(({ day, hours }) => (
                          <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>{day}</Typography>
                            <Typography sx={{ color: '#fff', fontSize: '0.88rem', fontWeight: 600 }}>{hours}</Typography>
                          </Box>
                        ))}
                        <Box sx={{ mt: 1.2, pt: 1.2, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                          <Typography sx={{ color: '#4CB051', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                            24/7 Booking &amp; Support Available
                          </Typography>
                        </Box>
                      </Box>
                    </InfoRow>
                  </Stack>
                </GlassCard>
              </motion.div>
            </Grid>

            {/* ── Right: Send Message ─────────────────────────── */}
            <Grid item xs={12} md={7}>
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: '100%' }}>
                <GlassCard component="form" onSubmit={formik.handleSubmit} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                    <Box sx={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #03930A, #4CB051)' }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                      Send Us a Message
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5} sx={{ flex: 1 }}>
                    <Grid item xs={12}>
                      <DarkTextField
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
                      <DarkTextField
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
                      <DarkTextField
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
                      <DarkTextField
                        select
                        fullWidth
                        name="service"
                        label="Service Needed"
                        value={formik.values.service}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.service && Boolean(formik.errors.service)}
                        helperText={formik.touched.service && formik.errors.service}
                        SelectProps={{ MenuProps: menuDarkPaper }}
                      >
                        <MenuItem value="" sx={{ color: 'rgba(255,255,255,0.4)' }}>Select a service</MenuItem>
                        {services.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </DarkTextField>
                    </Grid>

                    <Grid item xs={12}>
                      <DarkTextField
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
                        startIcon={!isSubmitting && <SendIcon />}
                        sx={{
                          mt: 1,
                          py: 1.7,
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          letterSpacing: '1px',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #03930A 0%, #047A0A 100%)',
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(3,147,10,0.35)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #04A80B 0%, #03930A 100%)',
                            boxShadow: '0 8px 32px rgba(3,147,10,0.5)',
                            transform: 'translateY(-2px)',
                          },
                          '&.Mui-disabled': { opacity: 0.5 },
                        }}
                      >
                        {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </GlassCard>
              </motion.div>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Contact;
