import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MdExpandMore } from "react-icons/md";

import { Divider, useMediaQuery, useTheme } from "@mui/material";

export default function FaqAccordion({ FAQ }) {
  const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.up("md"));
  
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div
      style={{
        width: "100%",
        marginLeft: !isMatch && "20px",
        marginRight: !isMatch && "20px",
      }}
    >
      {FAQ && FAQ.map((item, index) => (
        <Accordion
          key={index}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{ 
            backgroundColor: "#F5F5F5",
            mb: 1,
            '&:hover': {
              backgroundColor: "#F8F8F8",
            },
            '&.Mui-expanded': {
              backgroundColor: "#FFFFFF",
            }
          }}
        >
          <AccordionSummary
            expandIcon={<MdExpandMore size={24} color="#03930A" />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(3, 147, 10, 0.04)',
              }
            }}
          >
            <Typography 
              sx={{ 
                width: "100%", 
                flexShrink: 0,
                fontWeight: expanded === `panel${index}` ? 500 : 400,
                color: expanded === `panel${index}` ? '#03930A' : 'text.primary',
              }}
            >
              {item.summary}
            </Typography>
          </AccordionSummary>
          <Divider sx={{ backgroundColor: "#03930A", opacity: 0.1 }} />
          <AccordionDetails
            sx={{
              backgroundColor: 'rgba(3, 147, 10, 0.02)',
              padding: theme.spacing(3),
            }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {item.data}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
