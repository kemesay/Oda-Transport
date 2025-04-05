import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Skeleton } from "@mui/material";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";

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

const TermItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '&:last-child': {
    marginBottom: 0,
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

const TermTitle = styled(Typography)(({ theme }) => ({
  color: '#03930A',
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'flex-start',
  fontSize: {
    xs: '1.1rem',
    sm: '1.2rem',
    md: '1.25rem'
  },
  lineHeight: 1.4,
  '&::before': {
    content: '""',
    width: '8px',
    height: '8px',
    backgroundColor: '#03930A',
    borderRadius: '50%',
    marginRight: theme.spacing(2),
    marginTop: '0.5rem',
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
      width: '6px',
      height: '6px',
      marginRight: theme.spacing(1.5),
    },
  },
}));

const TermContent = styled(Typography)(({ theme }) => ({
  color: '#555',
  lineHeight: 1.8,
  textAlign: 'left',
  paddingLeft: theme.spacing(4),
  fontSize: {
    xs: '0.95rem',
    sm: '1rem',
    md: '1.1rem'
  },
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(3),
    lineHeight: 1.6,
    paddingRight: theme.spacing(1),
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

const TermAndCondition = () => {
  const { termsAndCondition } = useSelector((state) => state.footerReducer);
  const [parsedTerms, setParsedTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (termsAndCondition) {
      // Create a temporary div to parse HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = termsAndCondition;

      // Extract terms from HTML content
      const terms = [];
      const titleElements = tempDiv.querySelectorAll('strong, b, h1, h2, h3, h4, h5, h6');
      
      titleElements.forEach(titleElement => {
        const title = titleElement.textContent.trim();
        let content = '';
        
        // Get content until next title or end
        let nextElement = titleElement.nextSibling;
        while (nextElement && !['STRONG', 'B', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.nodeName)) {
          if (nextElement.textContent.trim()) {
            content += nextElement.textContent.trim() + ' ';
          }
          nextElement = nextElement.nextSibling;
        }

        if (title && content) {
          terms.push({
            title: title.replace(/[:.]$/, ''),
            content: content.trim()
          });
        }
      });

      setParsedTerms(terms);
      setLoading(false);
    }
  }, [termsAndCondition]);

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 3, md: 6 },
      px: { xs: 2, md: 3 }
    }}>
      <StyledPaper elevation={0}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            mb: { xs: 3, md: 4 },
            fontWeight: 600,
            color: '#161F36',
            position: 'relative',
            fontSize: { 
              xs: '1.5rem',
              sm: '1.75rem',
              md: '2rem'
            },
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
          Terms and Conditions
        </Typography>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Box sx={{ 
            mt: { xs: 4, md: 6 }
          }}>
            {parsedTerms.map((term, index) => (
              <TermItem key={index}>
                <TermTitle variant="h6">
                  {term.title}
                </TermTitle>
                <TermContent variant="body1">
                  {term.content}
                </TermContent>
              </TermItem>
            ))}
          </Box>
        )}
      </StyledPaper>
    </Container>
  );
};

export default TermAndCondition;
