import React from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Box } from "@mui/material";
import Map from "./Map";

function RideGoogleMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  if (!isLoaded) return <>loading</>;
  return <Map />;
}

export default RideGoogleMap;
