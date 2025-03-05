import React from "react";
import { Box } from "@mui/material";
import CustomTab from "./CustomTab";
import Signin from "./signin";
function Index({ usernameFocus }) {
  return (
    <Box>
      <CustomTab usernameFocus={usernameFocus} />
    </Box>
  );
}

export default Index;
