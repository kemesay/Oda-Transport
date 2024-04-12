import React from "react";
import { Box, Grid, Typography, Stack } from "@mui/material";
import { useLocation } from "react-router-dom";
import { Height } from "@mui/icons-material";
function ViewCarDetail(props) {
  const location = useLocation();
  const {
    carId,
    carName,
    carImageUrl,
    carDescription,
    maxSuitcases,
    carType,
    pricePerMile,
    currency,
    engineType,
    length,
    interiorColor,
    exteriorColor,
    power,
    transmissionType,
    fuelType,
    extras,
  } = location.state?.rowData || {};
  const Field = ({ label, value }) => {
    return (
      <Grid item xs={6}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{ backgroundColor: "#EEE", padding: 2, borderRadius: 2 }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "20px" }}>{value}</Typography>
        </Stack>
      </Grid>
    );
  };
  return (
    <Grid container justifyContent={"center"} alignItems={"center"}>
      <Grid item xs={11} lg={8}>
        <center>
          <img
            src={`${carImageUrl}`}
            style={{
              objectFit: "fill",
              width: "100%",
              // borderRadius: "100%",
              border: "5px solid #999",
            }}
          />
        </center>
      </Grid>
      <Grid item container xs={11} lg={8} spacing={2} mt={2}>
        <Field label="Car Name" value={carName} />
        <Field label="Description" value={carDescription} />
        <Field label="Max suitcase" value={maxSuitcases} />
        <Field label="Car Type" value={carType} />
        <Field label="Price Per-mile" value={pricePerMile} />
        <Field label="Currency" value={currency} />
        <Field label="Engine Type" value={engineType} />
        <Field label="Length" value={length} />
        <Field label="Interior Color" value={interiorColor} />
        <Field label="Exterior Color" value={exteriorColor} />
        <Field label="Power" value={power} />
        <Field label="Transmission Type" value={transmissionType} />
        <Field label="Fuel Type" value={fuelType} />
        <Field label="Extras" value={extras} />
      </Grid>
      {/* <Grid item container xs={12} md={6}>
        
      </Grid> */}
    </Grid>
  );
}
export default ViewCarDetail;
