import React, { useEffect, useState } from "react";
import { Box, Grid, Divider, Stack, IconButton, Container } from "@mui/material";
import RSTypography from "../RSTypography";
import { useTheme } from "@emotion/react";
import { FaTelegram, FaPinterest, FaInstagram } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { RiTwitterXLine } from "react-icons/ri";
import axios from "axios";
import { remote_host } from "../../globalVariable";
import { useSelector, useDispatch } from "react-redux";
import { getFooterData } from "../../store/actions/footerAction";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.info.main,
  width: '100%',
  marginTop: 'auto', // Pushes footer to bottom when content is short
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(2),
}));

const FooterContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  border: '1px solid #FFF',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid #CCC',
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

function Footer() {
  const theme = useTheme();
  const [socialMedias, setSocialMedias] = useState();
  const { contactEmail, contactPhoneNumber, addressZipCode, addressState } =
    useSelector((state) => state.footerReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const white = theme.palette.text.main;

  const getSocialMediaLinks = async () => {
    await axios
      .get(`${remote_host}/api/v1/social-medias`)
      .then((res) => setSocialMedias(res.data));
  };
  useEffect(() => {
    getSocialMediaLinks();
    dispatch(getFooterData());
  }, []);

  const getIcon = (title) => {
    const iconProps = { color: "white", size: 18 };
    const title_lower = title.toLowerCase();
    
    const icons = {
      facebook: <FiFacebook {...iconProps} />,
      twitter: <RiTwitterXLine {...iconProps} />,
      telegram: <FaTelegram {...iconProps} />,
      instagram: <FaInstagram {...iconProps} />,
      pinterest: <FaPinterest {...iconProps} />,
    };

    return Object.entries(icons).find(([key]) => 
      title_lower.includes(key))?.[1] || null;
  };

  return (
    <FooterWrapper>
      <FooterContainer maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Useful Links Section */}
          <Grid item xs={12} sm={6} md={3}>
            <RSTypography 
              txtcolor={white} 
              fontsize="18px"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Useful Links
            </RSTypography>
            <Stack spacing={1.5}>
              <RSTypography
                txtcolor={white}
                fontsize="15px"
                sx={{ 
                  cursor: "pointer",
                  '&:hover': { opacity: 0.8 },
                  transition: 'opacity 0.3s'
                }}
                onClick={() => navigate("/privacy-policy")}
              >
                Safety and Trust Policy
              </RSTypography>
              <RSTypography
                txtcolor={white}
                fontsize="15px"
                sx={{ 
                  cursor: "pointer",
                  '&:hover': { opacity: 0.8 },
                  transition: 'opacity 0.3s'
                }}
                onClick={() => navigate("/terms-and-conditions")}
              >
                Terms and conditions
              </RSTypography>
            </Stack>
          </Grid>

          {/* Contact Section */}
          <Grid item xs={12} sm={6} md={4}>
            <RSTypography 
              txtcolor={white} 
              fontsize="18px"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Contact Us
            </RSTypography>
            <Stack spacing={1.5}>
              <RSTypography txtcolor={white} fontsize="15px">
                {addressState}
              </RSTypography>
              <RSTypography txtcolor={white} fontsize="15px">
                ZIP: {addressZipCode}
              </RSTypography>
              <RSTypography txtcolor={white} fontsize="15px">
                Email: {contactEmail}
              </RSTypography>
              <RSTypography txtcolor={white} fontsize="15px">
                Tel: {contactPhoneNumber}
              </RSTypography>
            </Stack>
          </Grid>

          {/* Social Media Section */}
          <Grid item xs={12} md={3}>
            <RSTypography 
              txtcolor={white} 
              fontsize="18px"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Follow Us
            </RSTypography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {socialMedias?.map(({ link, title }) => (
                <SocialButton
                  key={title}
                  component="a"
                  href={link}
                  target="_blank"
                  size="small"
                >
                  {getIcon(title)}
                </SocialButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ 
          borderColor: "text.main", 
          borderWidth: "1px", 
          my: 2,
          opacity: 0.2
        }} />

        <Box sx={{ 
          textAlign: 'center',
          py: 1
        }}>
          <RSTypography 
            txtcolor={white}
            fontsize="14px"
            sx={{ opacity: 0.9 }}
          >
            Copyright © {new Date().getFullYear()} ODA Black Car Service. All rights reserved!
          </RSTypography>
        </Box>
      </FooterContainer>
    </FooterWrapper>
  );
}

export default Footer;
