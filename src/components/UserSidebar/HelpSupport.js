import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Help as HelpIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Article as ArticleIcon,
  LiveHelp as LiveHelpIcon,
} from '@mui/icons-material';

const faqData = [
  {
    category: 'Booking & Rides',
    questions: [
      {
        q: 'How do I book a ride?',
        a: 'You can book a ride through our app by selecting your pickup location, destination, and preferred service type. Follow the simple booking steps and confirm your ride.'
      },
      {
        q: 'Can I schedule a ride in advance?',
        a: 'Yes, you can schedule rides up to 30 days in advance. Simply select your desired pickup date and time during the booking process.'
      },
      {
        q: 'How do I cancel a booking?',
        a: 'To cancel a booking, go to "My Bookings" in your account, select the booking you wish to cancel, and click the cancel button. Cancellation fees may apply depending on the timing.'
      }
    ]
  },
  {
    category: 'Payment & Billing',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit cards, debit cards, and digital wallets. You can manage your payment methods in the Payment section.'
      },
      {
        q: 'How do I apply a promo code?',
        a: 'Enter your promo code in the designated field during the booking process or in the Promo Codes section of your account.'
      }
    ]
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'Click on "Forgot Password" on the login screen, enter your email address, and follow the instructions sent to your email.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, we use industry-standard encryption and security measures to protect your payment and personal information.'
      }
    ]
  }
];

const supportContacts = [
  {
    icon: <PhoneIcon />,
    title: '24/7 Phone Support',
    detail: '+1 (800) 123-4567',
    action: 'Call Now'
  },
  {
    icon: <EmailIcon />,
    title: 'Email Support',
    detail: 'support@example.com',
    action: 'Send Email'
  },
  {
    icon: <ChatIcon />,
    title: 'Live Chat',
    detail: 'Available 24/7',
    action: 'Start Chat'
  }
];

function HelpSupport() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitAlert, setSubmitAlert] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement contact form submission logic here
    setSubmitAlert({
      type: 'success',
      message: 'Your message has been sent. We\'ll get back to you soon!'
    });
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    setTimeout(() => setSubmitAlert(null), 5000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        Help & Support
      </Typography>

      {/* Quick Support Options */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {supportContacts.map((contact, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <Box sx={{
                  bgcolor: 'rgba(3, 147, 10, 0.1)',
                  borderRadius: '50%',
                  p: 2,
                  mb: 2
                }}>
                  {React.cloneElement(contact.icon, { sx: { color: '#03930A', fontSize: 30 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {contact.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {contact.detail}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#03930A',
                    borderColor: '#03930A',
                    '&:hover': {
                      borderColor: '#03830A',
                      bgcolor: 'rgba(3, 147, 10, 0.1)',
                    }
                  }}
                >
                  {contact.action}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Frequently Asked Questions
      </Typography>
      {faqData.map((category, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: '#03930A', mb: 1 }}>
            {category.category}
          </Typography>
          {category.questions.map((faq, faqIndex) => (
            <Accordion key={faqIndex} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      {/* Contact Form */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LiveHelpIcon sx={{ mr: 1, color: '#03930A' }} />
            Contact Support
          </Typography>
          
          {submitAlert && (
            <Alert severity={submitAlert.type} sx={{ mb: 2 }}>
              {submitAlert.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#03930A',
                    '&:hover': { bgcolor: '#03830A' }
                  }}
                >
                  Send Message
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Help Resources */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ArticleIcon sx={{ mr: 1, color: '#03930A' }} />
            Additional Resources
          </Typography>
          <List>
            <ListItem button component="a" href="/terms">
              <ListItemIcon>
                <ArticleIcon sx={{ color: '#03930A' }} />
              </ListItemIcon>
              <ListItemText primary="Terms of Service" />
            </ListItem>
            <ListItem button component="a" href="/privacy">
              <ListItemIcon>
                <ArticleIcon sx={{ color: '#03930A' }} />
              </ListItemIcon>
              <ListItemText primary="Privacy Policy" />
            </ListItem>
            <ListItem button component="a" href="/guide">
              <ListItemIcon>
                <ArticleIcon sx={{ color: '#03930A' }} />
              </ListItemIcon>
              <ListItemText primary="User Guide" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

export default HelpSupport; 