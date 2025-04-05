import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Skeleton } from "@mui/material";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import ShieldIcon from '@mui/icons-material/Shield';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 6),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  backgroundColor: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #03930A, #04A80B)',
  },
}));

const PolicyItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&:last-child': {
    marginBottom: 0,
  },
  '&:hover': {
    '& .policy-icon': {
      transform: 'scale(1.1)',
      color: '#03930A',
    }
  },
}));

const PolicyTitle = styled(Typography)(({ theme }) => ({
  color: '#161F36',
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  fontSize: {
    xs: '1.1rem',
    sm: '1.2rem',
    md: '1.25rem'
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.5),
  },
  '& .policy-icon': {
    color: '#03930A',
    transition: 'all 0.3s ease',
  },
}));

const PolicyContent = styled(Typography)(({ theme }) => ({
  color: '#555',
  lineHeight: 1.8,
  textAlign: 'left',
  paddingLeft: theme.spacing(6),
  position: 'relative',
  fontSize: {
    xs: '0.95rem',
    sm: '1rem',
    md: '1.1rem'
  },
  paddingRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    lineHeight: 1.6,
    '&::before': {
      left: '16px',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '24px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: 'linear-gradient(to bottom, #03930A 0%, transparent 100%)',
  },
  '& p': {
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0
    }
  }
}));

const LoadingSkeleton = () => (
  <Box sx={{ mt: 6 }}>
    {[...Array(5)].map((_, index) => (
      <Box key={index} sx={{ mb: 4 }}>
        <Skeleton width="40%" height={32} sx={{ mb: 1 }} />
        <Skeleton width="100%" height={20} />
        <Skeleton width="95%" height={20} />
      </Box>
    ))}
  </Box>
);

const Trust = () => {
  const { safetyandTrust } = useSelector((state) => state.footerReducer);
  const [parsedPolicies, setParsedPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (safetyandTrust) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = safetyandTrust;

      const policies = [];
      const titleElements = tempDiv.querySelectorAll('strong, b, h1, h2, h3, h4, h5, h6');

      titleElements.forEach(titleElement => {
        const title = titleElement.textContent.trim();
        let content = '';

        let nextElement = titleElement.nextSibling;
        while (nextElement && !['STRONG', 'B', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.nodeName)) {
          if (nextElement.textContent.trim()) {
            content += nextElement.textContent.trim() + ' ';
          }
          nextElement = nextElement.nextSibling;
        }

        if (title && content) {
          policies.push({
            title: title.replace(/[:.]$/, ''),
            content: content.trim()
          });
        }
      });

      setParsedPolicies(policies);
      setLoading(false);
    }
  }, [safetyandTrust]);

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 3, md: 6 },
      px: { xs: 2, md: 3 }
    }}>
      <StyledPaper elevation={0}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, md: 6 },
          position: 'relative' 
        }}>
          <ShieldIcon 
            sx={{ 
              fontSize: { xs: 32, md: 40 },
              color: '#03930A',
              mb: { xs: 1, md: 2 },
              transform: 'rotate(10deg)',
            }} 
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: '#161F36',
              position: 'relative',
              display: 'inline-block',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: '40px', md: '60px' },
                height: '3px',
                backgroundColor: '#03930A',
              }
            }}
          >
            Safety and Trust Policy
          </Typography>
        </Box>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Box sx={{ 
            mt: { xs: 4, md: 6 }
          }}>
            {parsedPolicies.map((policy, index) => (
              <PolicyItem key={index} sx={{
                mb: { xs: 3, md: 4 }
              }}>
                <PolicyTitle variant="h6">
                  <ShieldIcon 
                    className="policy-icon" 
                    sx={{ 
                      fontSize: { xs: 20, md: 24 }
                    }} 
                  />
                  {policy.title}
                </PolicyTitle>
                <PolicyContent variant="body1">
                  {policy.content}
                </PolicyContent>
              </PolicyItem>
            ))}
          </Box>
        )}
      </StyledPaper>
    </Container>
  );
};

export default Trust;
