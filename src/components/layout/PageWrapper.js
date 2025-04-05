import { Box } from '@mui/material';
import styled from '@emotion/styled';

const PageWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh', // Full viewport height
});

const MainContent = styled(Box)({
  flex: 1, // Takes up remaining space
  display: 'flex',
  flexDirection: 'column',
});

export default function Layout({ children }) {
  return (
    <PageWrapper>
      {/* Your Header component would go here */}
      <MainContent>
        {children}
      </MainContent>
      {/* Footer will automatically stay at bottom */}
    </PageWrapper>
  );
} 