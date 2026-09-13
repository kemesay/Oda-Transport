import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Stack,
  Grid,
  FormLabel,
  FormControlLabel,
  FormControl,
  FormHelperText,
  RadioGroup,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  Alert,
  TextField,
  Button,
  CircularProgress,
  Typography,
  InputAdornment,
} from "@mui/material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import RSTextField from "../../../../components/RSTextField";
import RSRadio from "../../../../components/RSRadio";
import StepSummary from "../StepSummary";
import { getAllPreferences } from "../../../../store/actions/preferenceAction";
import { BACKEND_API } from "../../../../store/utils/API";
import {
  addAirportPreferenceFee,
} from "../../../../store/reducers/bookReducers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
function Index({ formik, vehicleSummaryData, rideSummaryData, travelRouteId }) {
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoStatus, setPromoStatus] = useState("idle"); // idle | loading | applied | error
  const [promoMessage, setPromoMessage] = useState("");
  const { fee, totalFee } = useSelector((state) => state.bookReducer);
  const userTimezone = useMemo(() => dayjs.tz.guess(), []);
  const toUserZone = useCallback(
    (value) => (value ? dayjs(value).tz(userTimezone) : null),
    [userTimezone]
  );
  const getFormattdTime = useCallback(
    (time) => {
      const zoned = toUserZone(time);
      return zoned ? zoned.format("HH:mm:ss") : null;
    },
    [toUserZone]
  );
  const location = useLocation();
  const dispatch = useDispatch();
  const { preferences } = useSelector((state) => state.preferenceReducer);
  var travelType = travelRouteId ?? location.pathname.split("/").pop();
  const tripType = rideSummaryData.tripType;
  const erroSlot = (field) => {
    return {
      textField: {
        helperText:
          formik.touched[field] && formik.errors[field] && formik.errors[field],
        error: formik.touched[field] && Boolean(formik.errors[field]),
        sx: { color: "red" },
      },
    };
  };
  
  const isAirportTravel = travelType === "1";
  const isPointToPointTravel = travelType === "2";
  const isHourlyTravel = travelType === "3";

  const isRoundTrip = () => {
    return (
      (tripType == "Round-Trip" ||
        tripType == "Ride to the airport(round trip)" ||
        tripType == "Ride from the airport(round trip)") &&
      !(travelType === "3")
    );
  };
  const promoBookingType = () => {
    if (isAirportTravel) return "Airport Service";
    if (isHourlyTravel) return "Hourly Charter";
    return "Point to point";
  };

  const handleApplyPromoCode = async () => {
    const code = promoCodeInput.trim();
    if (!code) return;

    // Reconstruct the pre-discount fare so re-checking a new code never
    // validates against an amount that already has a previous discount
    // baked into it.
    const currentDiscount = Number(formik.values.promoDiscount) || 0;
    const baseFare = (Number(totalFee) || 0) + currentDiscount;

    setPromoStatus("loading");
    setPromoMessage("");
    try {
      const response = await BACKEND_API.post("/api/v1/promo-codes/validate", {
        code,
        bookingType: promoBookingType(),
        fareAmount: baseFare > 0 ? baseFare : 0.01,
      });
      const { discount } = response.data;
      formik.setFieldValue("promoCode", code.toUpperCase());
      formik.setFieldValue("promoDiscount", discount);
      setPromoStatus("applied");
      setPromoMessage(`Promo code applied — you saved $${Number(discount).toFixed(2)}.`);
    } catch (error) {
      formik.setFieldValue("promoDiscount", 0);
      setPromoStatus("error");
      setPromoMessage(
        error?.response?.data?.message || "That promo code isn't valid for this trip."
      );
    }
  };

  const handleRemovePromoCode = () => {
    formik.setFieldValue("promoCode", "");
    formik.setFieldValue("promoDiscount", 0);
    setPromoCodeInput("");
    setPromoStatus("idle");
    setPromoMessage("");
  };

  useEffect(() => {
    dispatch(getAllPreferences());
  }, []);

  const [currentDateTime, setCurrentDateTime] = useState(() =>
    dayjs().tz(userTimezone)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(dayjs().tz(userTimezone));
    }, 60000);
    return () => clearInterval(interval);
  }, [userTimezone]);

  const minimumPickupLeadTime = useMemo(
    () => currentDateTime.add(1, "hour").second(0).millisecond(0),
    [currentDateTime]
  );

  const minimumPickupDate = useMemo(
    () => minimumPickupLeadTime.startOf("day"),
    [minimumPickupLeadTime]
  );

  const pickupDateInZone = useMemo(
    () => toUserZone(formik.values.pickupDate)?.startOf("day") || null,
    [formik.values.pickupDate, toUserZone]
  );

  const isPickupDateSameAsMinimum = useMemo(() => {
    if (!pickupDateInZone) return false;
    return pickupDateInZone.isSame(minimumPickupLeadTime, "day");
  }, [pickupDateInZone, minimumPickupLeadTime]);

  const minTimeForPickup = useMemo(() => {
    if (isPickupDateSameAsMinimum) {
      return minimumPickupLeadTime;
    }
    const pickupDate = toUserZone(formik.values.pickupDate);
    return pickupDate ? pickupDate.startOf("day") : null;
  }, [
    formik.values.pickupDate,
    isPickupDateSameAsMinimum,
    minimumPickupLeadTime,
    toUserZone,
  ]);

  const combineDateAndTime = useCallback(
    (dateValue, timeValue) => {
      if (!dateValue || !timeValue) return null;
      const dateZoned = toUserZone(dateValue).startOf("day");
      const timeZoned = toUserZone(timeValue);
      return dateZoned
        .hour(timeZoned.hour())
        .minute(timeZoned.minute())
        .second(timeZoned.second())
        .millisecond(0);
    },
    [toUserZone]
  );

  const ensureValidPickupTime = useCallback(
    (dateValue, timeValue) => {
      if (!timeValue) {
        return { time: null, formatted: null };
      }
      const zonedTime = toUserZone(timeValue);
      if (!zonedTime) {
        return { time: null, formatted: null };
      }

      if (!dateValue) {
        return {
          time: zonedTime,
          formatted: getFormattdTime(zonedTime),
        };
      }

      const combined = combineDateAndTime(dateValue, zonedTime);
      if (combined && combined.isBefore(minimumPickupLeadTime)) {
        return {
          time: minimumPickupLeadTime,
          formatted: getFormattdTime(minimumPickupLeadTime),
        };
      }

      return {
        time: zonedTime,
        formatted: getFormattdTime(zonedTime),
      };
    },
    [
      combineDateAndTime,
      getFormattdTime,
      minimumPickupLeadTime,
      toUserZone,
    ]
  );

  const shouldDisablePickupTime = useCallback(
    (value, view) => {
      if (!isPickupDateSameAsMinimum || !value) {
        return false;
      }

      if (view === "hours") {
        return value.hour() < minimumPickupLeadTime.hour();
      }

      if (view === "minutes") {
        if (value.hour() < minimumPickupLeadTime.hour()) return true;
        if (value.hour() > minimumPickupLeadTime.hour()) return false;
        return value.minute() < minimumPickupLeadTime.minute();
      }

      if (view === "seconds") {
        if (value.hour() < minimumPickupLeadTime.hour()) return true;
        if (value.hour() > minimumPickupLeadTime.hour()) return false;
        if (value.minute() < minimumPickupLeadTime.minute()) return true;
        if (value.minute() > minimumPickupLeadTime.minute()) return false;
        return value.second() < minimumPickupLeadTime.second();
      }

      return false;
    },
    [isPickupDateSameAsMinimum, minimumPickupLeadTime]
  );

  const pickupDateTime = useMemo(
    () => combineDateAndTime(formik.values.pickupDate, formik.values.pickupTime),
    [combineDateAndTime, formik.values.pickupDate, formik.values.pickupTime]
  );

  const minimumReturnDateTime = useMemo(() => {
    if (!pickupDateTime) return null;
    return pickupDateTime.add(1, "hour");
  }, [pickupDateTime]);

  const minimumReturnDate = useMemo(() => {
    if (minimumReturnDateTime) {
      return minimumReturnDateTime.startOf("day");
    }
    return minimumPickupDate;
  }, [minimumPickupDate, minimumReturnDateTime]);

  const returnDateInZone = useMemo(
    () => toUserZone(formik.values.returnPickupDate)?.startOf("day") || null,
    [formik.values.returnPickupDate, toUserZone]
  );

  const isReturnDateSameAsMinimum = useMemo(() => {
    if (!minimumReturnDateTime || !returnDateInZone) return false;
    return returnDateInZone.isSame(minimumReturnDateTime, "day");
  }, [minimumReturnDateTime, returnDateInZone]);

  const minTimeForReturn = useMemo(() => {
    if (isReturnDateSameAsMinimum && minimumReturnDateTime) {
      return minimumReturnDateTime;
    }
    const returnDate = toUserZone(formik.values.returnPickupDate);
    return returnDate ? returnDate.startOf("day") : null;
  }, [
    formik.values.returnPickupDate,
    isReturnDateSameAsMinimum,
    minimumReturnDateTime,
    toUserZone,
  ]);

  const ensureValidReturnTime = useCallback(
    (dateValue, timeValue) => {
      if (!timeValue && !dateValue) {
        return {
          time: null,
          formatted: null,
          date: null,
          formattedDate: null,
        };
      }

      const zonedDate = dateValue
        ? toUserZone(dateValue).startOf("day")
        : null;
      const zonedTime = timeValue ? toUserZone(timeValue) : null;

      if (!zonedTime) {
        if (minimumReturnDateTime) {
          const minDate = minimumReturnDateTime.startOf("day");
          return {
            time: minimumReturnDateTime,
            formatted: getFormattdTime(minimumReturnDateTime),
            date: minDate,
            formattedDate: minDate.format("YYYY-MM-DD"),
          };
        }
        return {
          time: null,
          formatted: null,
          date: zonedDate,
          formattedDate: zonedDate ? zonedDate.format("YYYY-MM-DD") : null,
        };
      }

      if (!zonedDate) {
        if (minimumReturnDateTime) {
          const minDate = minimumReturnDateTime.startOf("day");
          return {
            time: minimumReturnDateTime,
            formatted: getFormattdTime(minimumReturnDateTime),
            date: minDate,
            formattedDate: minDate.format("YYYY-MM-DD"),
          };
        }
        return {
          time: zonedTime,
          formatted: getFormattdTime(zonedTime),
          date: null,
          formattedDate: null,
        };
      }

      const combined = combineDateAndTime(zonedDate, zonedTime);

      if (
        minimumReturnDateTime &&
        combined &&
        combined.isBefore(minimumReturnDateTime)
      ) {
        const minDate = minimumReturnDateTime.startOf("day");
        return {
          time: minimumReturnDateTime,
          formatted: getFormattdTime(minimumReturnDateTime),
          date: minDate,
          formattedDate: minDate.format("YYYY-MM-DD"),
        };
      }

      return {
        time: zonedTime,
        formatted: getFormattdTime(zonedTime),
        date: zonedDate,
        formattedDate: zonedDate.format("YYYY-MM-DD"),
      };
    },
    [
      combineDateAndTime,
      getFormattdTime,
      minimumReturnDateTime,
      toUserZone,
    ]
  );

  const shouldDisableReturnTime = useCallback(
    (value, view) => {
      if (
        !minimumReturnDateTime ||
        !isReturnDateSameAsMinimum ||
        !value
      ) {
        return false;
      }

      if (view === "hours") {
        return value.hour() < minimumReturnDateTime.hour();
      }

      if (view === "minutes") {
        if (value.hour() < minimumReturnDateTime.hour()) return true;
        if (value.hour() > minimumReturnDateTime.hour()) return false;
        return value.minute() < minimumReturnDateTime.minute();
      }

      if (view === "seconds") {
        if (value.hour() < minimumReturnDateTime.hour()) return true;
        if (value.hour() > minimumReturnDateTime.hour()) return false;
        if (value.minute() < minimumReturnDateTime.minute()) return true;
        if (value.minute() > minimumReturnDateTime.minute()) return false;
        return value.second() < minimumReturnDateTime.second();
      }

      return false;
    },
    [isReturnDateSameAsMinimum, minimumReturnDateTime]
  );

  useEffect(() => {
    if (!formik.values.pickupDate || !formik.values.pickupTime) {
      if (!formik.values.pickupDate && formik.values.pickupTime) {
        return;
      }
    }
    if (!isPickupDateSameAsMinimum) {
      return;
    }
    const combined = combineDateAndTime(
      formik.values.pickupDate,
      formik.values.pickupTime
    );
    if (combined && combined.isBefore(minimumPickupLeadTime)) {
      formik.setFieldValue("pickupTime", minimumPickupLeadTime);
      formik.setFieldValue(
        "formattedPickupTime",
        getFormattdTime(minimumPickupLeadTime)
      );
    }
  }, [
    combineDateAndTime,
    formik,
    getFormattdTime,
    isPickupDateSameAsMinimum,
    minimumPickupLeadTime,
  ]);

  useEffect(() => {
    if (formik.values.pickupTime) {
      return;
    }
    if (!minTimeForPickup) {
      return;
    }
    formik.setFieldValue("pickupTime", minTimeForPickup);
    formik.setFieldValue(
      "formattedPickupTime",
      getFormattdTime(minTimeForPickup)
    );
  }, [formik, getFormattdTime, minTimeForPickup]);

  useEffect(() => {
    if (!minimumReturnDateTime) {
      return;
    }

    const combined = combineDateAndTime(
      formik.values.returnPickupDate,
      formik.values.returnPickupTime
    );

    if (!combined || combined.isBefore(minimumReturnDateTime)) {
      const minDate = minimumReturnDateTime.startOf("day");
      formik.setFieldValue("returnPickupDate", minDate);
      formik.setFieldValue(
        "formattedReturnPickupDate",
        minDate.format("YYYY-MM-DD")
      );
      formik.setFieldValue("returnPickupTime", minimumReturnDateTime);
      formik.setFieldValue(
        "formattedReturnPickupTime",
        getFormattdTime(minimumReturnDateTime)
      );
    }
  }, [
    combineDateAndTime,
    formik,
    getFormattdTime,
    minimumReturnDateTime,
  ]);


  return (
    <Box>
      <Grid
        container
        direction={{ xs: "column-reverse", lg: "row" }}
        spacing={1}
      >
        <Grid item xs={3}>
          <StepSummary
            rideSummaryData={rideSummaryData}
            vehicleSummaryData={vehicleSummaryData}
            tripSummaryData={[]}
            contactSummaryData={[]}
            travelRouteId={travelRouteId}
          />
        </Grid>
        <Grid item xs={8} mt={-1}>
          <Stack direction={"column"} spacing={2}>
            {/* {isAirportTravel && (
              <Alert severity="info" variant="outlined">
                Airport add-ons: pickup preferences are loaded from{" "}
                <strong>/api/v1/airport/pickup-preference</strong>, additional
                stops from <strong>/api/v1/additional-stops</strong> (same as new
                bookings). Gratuity options are on the last step from{" "}
                <strong>/api/v1/gratuities</strong>.
              </Alert>
            )} */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker", "TimePicker"]}>
                <DatePicker
                  label="Pickup Date"
                  disablePast
                  value={formik.values.pickupDate}
                  onChange={(date) => {
                    const zonedDate = toUserZone(date)?.startOf("day") || null;
                    formik.setFieldValue("pickupDate", zonedDate);
                    formik.setFieldValue(
                      "formattedPickupDate",
                      zonedDate && zonedDate.format("YYYY-MM-DD")
                    );
                    if (zonedDate && formik.values.pickupTime) {
                      const { time, formatted } = ensureValidPickupTime(
                        zonedDate,
                        formik.values.pickupTime
                      );
                      formik.setFieldValue("pickupTime", time);
                      formik.setFieldValue("formattedPickupTime", formatted);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  onError={
                    formik.touched.formattedPickupDate &&
                    Boolean(formik.errors.formattedPickupDate)
                  }
                  slotProps={erroSlot("formattedPickupDate")}
                  minDate={minimumPickupDate}
                />

                <TimePicker
                  label="Pickup time"
                  value={formik.values.pickupTime}
                  onChange={(time) => {
                    const { time: sanitized, formatted } = ensureValidPickupTime(
                      formik.values.pickupDate,
                      time
                    );
                    formik.setFieldValue("pickupTime", sanitized);
                    formik.setFieldValue("formattedPickupTime", formatted);
                  }}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.formattedPickupTime &&
                    Boolean(formik.errors.formattedPickupTime)
                  }
                  sx={{ width: "100%" }}
                  slotProps={erroSlot("formattedPickupTime")}
                  minTime={minTimeForPickup}
                  disablePast={isPickupDateSameAsMinimum}
                  shouldDisableTime={shouldDisablePickupTime}
                />
              </DemoContainer>
            </LocalizationProvider>
            {isRoundTrip() && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker", "TimePicker"]}>
                  <DatePicker
                    disablePast
                    label="Return Pickup Date"
                    value={formik.values.returnPickupDate}
                    onChange={(date) => {
                      const zonedDate = toUserZone(date)?.startOf("day") || null;
                      const sanitized = ensureValidReturnTime(
                        zonedDate,
                        formik.values.returnPickupTime
                      );
                      formik.setFieldValue(
                        "returnPickupDate",
                        sanitized.date || zonedDate
                      );
                      formik.setFieldValue(
                        "formattedReturnPickupDate",
                        sanitized.formattedDate ||
                          (zonedDate && zonedDate.format("YYYY-MM-DD"))
                      );
                      formik.setFieldValue("returnPickupTime", sanitized.time);
                      formik.setFieldValue(
                        "formattedReturnPickupTime",
                        sanitized.formatted
                      );
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.formattedReturnPickupDate &&
                      Boolean(formik.errors.formattedReturnPickupDate)
                    }
                    sx={{ width: "100%" }}
                    slotProps={erroSlot("formattedReturnPickupDate")}
                    minDate={minimumReturnDate}
                  />

                  <TimePicker
                    label="Return Pickup Time"
                    value={formik.values.returnPickupTime}
                    onChange={(time) => {
                      const sanitized = ensureValidReturnTime(
                        formik.values.returnPickupDate,
                        time
                      );
                      formik.setFieldValue("returnPickupDate", sanitized.date);
                      formik.setFieldValue(
                        "formattedReturnPickupDate",
                        sanitized.formattedDate
                      );
                      formik.setFieldValue("returnPickupTime", sanitized.time);
                      formik.setFieldValue(
                        "formattedReturnPickupTime",
                        sanitized.formatted
                      );
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.formattedReturnPickupTime &&
                      Boolean(formik.errors.formattedReturnPickupTime)
                    }
                    sx={{ width: "100%" }}
                    slotProps={erroSlot("formattedReturnPickupTime")}
                    minTime={minTimeForReturn}
                    shouldDisableTime={shouldDisableReturnTime}
                  />
                </DemoContainer>
              </LocalizationProvider>
            )}


            {isAirportTravel && (
              <RSTextField
                fullWidth
                color="info"
                name="airline"
                onBlur={formik.handleBlur}
                label="Airline (arrival)"
                value={formik.values.airline}
                onChange={formik.handleChange}
                error={formik.touched.airline && Boolean(formik.errors.airline)}
                helperText={formik.touched.airline && formik.errors.airline}
                multiline
              />
            )}
            {isAirportTravel && (
              <RSTextField
                fullWidth
                color="info"
                name="arrivalFlightNumber"
                onBlur={formik.handleBlur}
                label="Flight Number (arrival)"
                value={formik.values.arrivalFlightNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.arrivalFlightNumber &&
                  Boolean(formik.errors.arrivalFlightNumber)
                }
                helperText={
                  formik.touched.arrivalFlightNumber &&
                  formik.errors.arrivalFlightNumber
                }
                multiline
              />
            )}
            {isAirportTravel && isRoundTrip() && (
              <RSTextField
                fullWidth
                color="info"
                name="returnAirline"
                onBlur={formik.handleBlur}
                label="airline (return)"
                value={formik.values.returnAirline}
                onChange={formik.handleChange}
                error={formik.touched.returnAirline && Boolean(formik.errors.returnAirline)}
                helperText={formik.touched.returnAirline && formik.errors.returnAirline}
                multiline
              />
            )}
            {isAirportTravel && isRoundTrip() && (
              <RSTextField
                fullWidth
                color="info"
                name="returnFlightNumber"
                onBlur={formik.handleBlur}
                label="Flight Number (return)"
                value={formik.values.returnFlightNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.returnFlightNumber &&
                  Boolean(formik.errors.returnFlightNumber)
                }
                helperText={
                  formik.touched.returnFlightNumber &&
                  formik.errors.returnFlightNumber
                }
                multiline
              />
            )}







            <RSTextField
              fullWidth
              color="info"
              name="instruction"
              onBlur={formik.handleBlur}
              label="Special Instructions"
              value={formik.values.instruction}
              onChange={formik.handleChange}
              error={
                formik.touched.instruction && Boolean(formik.errors.instruction)
              }
              helperText={
                formik.touched.instruction && formik.errors.instruction
              }
              multiline
              rows={4}
            />
            {isAirportTravel && (
              <FormControl fullWidth>
                <FormLabel sx={{ color: "info" }}>
                  Airport Pickup Preference :
                </FormLabel>
                <RadioGroup
                  row
                  name="pickupPreference"
                  onBlur={formik.handleBlur}
                  label="Special pickupPreferences"
                  value={String(formik.values.pickupPreference ?? "")}
                  onChange={(e) => {
                    const id = e.target.value;
                    formik.setFieldValue("pickupPreference", id);
                    const pref = preferences.find(
                      (p) => String(p.pickupPreferenceId) === String(id)
                    );
                    if (!pref) return;
                    const prefFee = parseFloat(pref.preferencePrice);
                    const prevPrefFee = parseFloat(formik.values.prevPickupPrefValue) || 0;
                    dispatch(addAirportPreferenceFee({ prefFee, prevPrefFee }));
                    formik.setFieldValue("prevPickupPrefValue", prefFee);
                    formik.setFieldValue("pickupPreferenceFee", prefFee);
                  }}
                  error={
                    formik.touched.pickupPreference &&
                    Boolean(formik.errors.pickupPreference)
                  }
                  helperText={
                    formik.touched.pickupPreference &&
                    formik.errors.pickupPreference
                  }
                >
                  {preferences?.map((preference) => (
                    <FormControlLabel
                      key={preference.pickupPreferenceId}
                      value={String(preference.pickupPreferenceId)}
                      control={<RSRadio />}
                      label={`${preference.preferenceName} ($${preference.preferencePrice})`}
                    />
                  ))}
                </RadioGroup>

                {formik.touched.pickupPreference && (
                  <FormHelperText sx={{ color: "red" }}>
                    {formik.errors.pickupPreference}
                  </FormHelperText>
                )}
              </FormControl>
            )}

            {isHourlyTravel && (
              <FormControl fullWidth color="info">
                <InputLabel id="occation">Occation</InputLabel>
                <Select
                  label="occation"
                  name="occation"
                  value={formik.values.occation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.occation && Boolean(formik.errors.occation)
                  }
                >
                  <MenuItem value="Wedding">Wedding</MenuItem>
                  <MenuItem value="tour">Tour</MenuItem>
                  <MenuItem value="prom">Promotion</MenuItem>
                  <MenuItem value="gradiation">Graduation</MenuItem>
                  <MenuItem value="concert">Concert</MenuItem>
                </Select>
                {formik.touched.occation && formik.errors.occation && (
                  <FormHelperText sx={{ color: "#F00" }}>
                    {formik.errors.occation}
                  </FormHelperText>
                )}
              </FormControl>
            )}



            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "#03930A",
                }}
              >
                <LocalOfferOutlinedIcon fontSize="small" />
                Promo Code
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", sm: "flex-start" }}
              >
                <TextField
                  fullWidth
                  color="info"
                  label="Enter promo code"
                  placeholder="e.g. WELCOME10"
                  value={promoCodeInput}
                  disabled={promoStatus === "applied"}
                  onChange={(e) =>
                    setPromoCodeInput(e.target.value.toUpperCase())
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyPromoCode();
                    }
                  }}
                />
                {promoStatus === "applied" ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={handleRemovePromoCode}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleApplyPromoCode}
                    disabled={promoStatus === "loading" || !promoCodeInput.trim()}
                    sx={{
                      whiteSpace: "nowrap",
                      backgroundColor: "#03930A",
                      "&:hover": { backgroundColor: "#027c08" },
                    }}
                  >
                    {promoStatus === "loading" ? (
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </Stack>
              {promoMessage && (
                <Alert
                  severity={
                    promoStatus === "applied"
                      ? "success"
                      : promoStatus === "error"
                      ? "error"
                      : "info"
                  }
                  icon={promoStatus === "applied" ? <CheckCircleIcon fontSize="inherit" /> : undefined}
                  sx={{ mt: 1.5 }}
                >
                  {promoMessage}
                </Alert>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Index;