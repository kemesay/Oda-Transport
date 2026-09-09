import React, { useEffect, useState } from "react";
import { Grid, Typography, Stack, Switch, FormControlLabel, Chip, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import BACKEND_API from "../../../../../store/utils/API";

function AirportPickupPreferenceDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    pickupPreferenceId,
    preferenceName,
    preferencePrice,
    currency,
  } = location.state?.rowData || {};

  const [isActive, setIsActive] = useState(
    location.state?.rowData?.status === "Active"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsActive(location.state?.rowData?.status === "Active");
  }, [location.state]);

  const handleToggleStatus = async () => {
    const goingActive = !isActive;
    setLoading(true);
    try {
      const response = await BACKEND_API.put(
        `/api/v1/airport/pickup-preference/${pickupPreferenceId}/${goingActive ? "enable" : "disable"}`
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(
          response?.data?.message ||
            `Preference ${goingActive ? "enabled" : "disabled"} successfully!`,
          { autoClose: 6000 }
        );
        setIsActive(goingActive);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Network error...");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value }) => {
    return (
      <Grid item xs={12} sm={6}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{ backgroundColor: "#EEE", padding: 2, borderRadius: 2 }} >
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "18px" }}>{value}</Typography>
        </Stack>
      </Grid>
    );
  };

  return (
    <Grid container justifyContent={"center"} alignItems={"center"}>
      <Grid item xs={11} lg={8} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#03930A" }}>
          Airport Pickup Preference
        </Typography>
        <Chip
          label={isActive ? "Active" : "Disabled"}
          size="small"
          sx={{
            ml: "auto",
            fontWeight: 700,
            color: isActive ? "#03930A" : "#8B1D1D",
            bgcolor: isActive ? "rgba(3,147,10,0.1)" : "rgba(211,47,47,0.1)",
            border: `1px solid ${isActive ? "rgba(3,147,10,0.3)" : "rgba(211,47,47,0.3)"}`,
          }}
        />
      </Grid>
      <Grid item container xs={11} lg={8} spacing={2} mt={1}>
        <Field label="Pickup Preference Id" value={pickupPreferenceId} />
        <Field label="Preference Name" value={preferenceName} />
        <Field
          label="Preference Price"
          value={`${currency || "USD"} $${Number(preferencePrice || 0).toFixed(2)}`}
        />
        <Field label="Currency" value={currency || "USD"} />
      </Grid>
      <Grid item container xs={11} lg={8} mt={2} justifyContent="flex-start">
        <FormControlLabel
          control={
            loading ? (
              <CircularProgress size={24} sx={{ mx: 1.75, color: "#03930A" }} />
            ) : (
              <Switch
                checked={isActive}
                onChange={handleToggleStatus}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#03930A" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#03930A",
                  },
                }}
              />
            )
          }
          label={isActive ? "Active — visible to customers" : "Disabled — hidden from customers"}
        />
      </Grid>
      <ToastContainer position="top-center" />
    </Grid>
  );
}
export default AirportPickupPreferenceDetail;
