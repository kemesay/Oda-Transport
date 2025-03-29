import React from "react";
import { Box, Stack, Typography, Card, CardMedia } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RSButton from "../../../../components/RSButton";

function ServiceCard({ imgUrl, text, id, delay }) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ width: "100%" }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: "row",
          width: { xs: "100%", md: "90%", lg: "85%" },
          minHeight: { xs: "70px", sm: "90px", md: "110px", lg: "130px" },
          maxHeight: { xs: "80px", sm: "100px", md: "120px", lg: "140px" },
          backgroundColor: "background.paper",
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
          p: { xs: 0.75, sm: 1, md: 1.5 },
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: "45px", sm: "65px", md: "85px", lg: "100px" },
            height: { xs: "35px", sm: "55px", md: "75px", lg: "90px" },
            flexShrink: 0,
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            borderRadius: 1,
            mr: { xs: 0.75, sm: 1, md: 1.5 },
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: "auto",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              objectPosition: "center",
              borderRadius: 1,
              transform: "scale(0.9)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(0.95)",
              },
              filter: "contrast(1.05) brightness(1.02)",
            }}
            image={imgUrl}
            alt={text}
            loading="lazy"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 0.75, sm: 1, md: 1.5 },
            py: { xs: 0.25, sm: 0.5, md: 0.75 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.1rem" },
              fontWeight: 900,
              flex: 1,
              mr: 1.5,
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
            }}
          >
            {text}
          </Typography>
          <Stack direction="row" spacing={1}>
            <RSButton
              backgroundcolor={theme.palette.info.main}
              radius={5}
              fullWidth
              sx={{
                minWidth: { xs: "100%", sm: "auto", md: "100px" },
                height: { xs: "22px", sm: "28px", md: "34px" },
                fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.8rem" },
                whiteSpace: "nowrap",
                p: { xs: "2px 4px", sm: "3px 8px", md: "4px 12px" },
                position: "relative",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                },
              }}
              onClick={() => navigate(`/home/${id}`)}
            >
              Book Now
            </RSButton>
          </Stack>
        </Box>
      </Card>
    </motion.div>
  );
}

export default ServiceCard;
