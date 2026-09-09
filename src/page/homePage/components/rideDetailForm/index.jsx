import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import BillingModeToggle from "./BillingModeToggle";

import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  Stack,
  useTheme,
  useMediaQuery,
  Alert,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  Button,
  Divider,
} from "@mui/material";

import {
  useLoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { GrLocation } from "react-icons/gr";
import { TbCurrentLocation } from "react-icons/tb";
import { MdOutlineHotel, MdLocalAirport, MdClose, MdAddLocation } from "react-icons/md";
import RSRadio from "../../../../components/RSRadio";
import { useNavigate, useParams } from "react-router-dom";
import RSTypography from "../../../../components/RSTypography";
import { checkServiceLocation } from "../../../../util/locationUtil";
const libraries = ["places"];

function Index({
  formik,
  handleChangeTripType,
  selectedTripType,
  locationChecker,
  setLocationCkecker,
  setAccomAddrChecker,
  accomAddrChecker,
  airportLocChecker,
  setAirportLocChecker,
  /** When set (e.g. "1"|"2"|"3"), used instead of `/home/:id` route param — needed on `/update-booking`. */
  travelRouteId,
  /** If true, user cannot switch service type (update flow). */
  disableServiceTypeSwitch,
}) {
  const [trip, setTrip] = React.useState();
  const [latLng, setLatLng] = useState(null);
  const [searchOriginResult, setSearchOriginResult] = useState(null);
  const [searchDestinationResult, setSearchDestinationResult] = useState(null);
  const [searchAccomodationResult, setSearchAccomodationResult] =
    useState(null);
  const [searchAirportLocationResult, setSearchAirportLocationResult] =
    useState(null);
  const [directionsResponse, setDirectionsResponse] = useState();
  const sidePickAutocompleteRefs = useRef([]);
  const theme = useTheme();
  const matchXS = useMediaQuery(theme.breakpoints.down("md"));

  const params = useParams();
  const travelType = travelRouteId ?? params.id;
  const pickupPhysicalAddressRef = useRef();
  const dropDownAddressRef = useRef();
  const center = useMemo(() => ({ lat: 50, lng: -80 }), []);
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  const mapRef = useRef();
  const pointToPointTripTypes = useMemo(() => ["One-Way", "Round-Trip"]);
  const { isLoaded } = useLoadScript({
    // googleMapsApiKey: "AIzaSyCvm85RFSLVS4DV7zBb1l0UlOJ1tpSXRPQ",
    googleMapsApiKey: "AIzaSyAgAp1RwiIqCyZZg63gsmyP6TZBuVxw_8c",

    libraries: libraries,
  });

  // Serialized coordinates of every fully-geocoded side pick / detour stop.
  // Used as an effect dependency so the route (and therefore the map) is
  // always recalculated against the freshest stops, instead of relying on
  // the `setTimeout` + closure calls that used to run right after a stop
  // was added/edited/removed (those captured a stale `formik.values` from
  // before the edit, so the map could silently ignore the latest stop).
  const activeSidePicksKey = useMemo(
    () =>
      JSON.stringify(
        (formik.values.sidePicks || [])
          .filter((sp) => sp.latitude && sp.longitude)
          .map((sp) => [sp.latitude, sp.longitude])
      ),
    [formik.values.sidePicks]
  );

  useEffect(() => {
    if (formik.values.pickupLatitude &&
      formik.values.pickupLongitude &&
      formik.values.dropoffLatitude &&
      formik.values.dropoffLongitude
    ) {
      calculateDistance();
    }
  }, [formik.values.pickupLatitude &&
    formik.values.pickupLongitude &&
    formik.values.dropoffLatitude &&
    formik.values.dropoffLongitude,
    activeSidePicksKey]);

  useEffect(() => {
    if (
      formik.values.airportLocationLatitude &&
      formik.values.airportLocationLongitude &&
      formik.values.accommodationLatitude &&
      formik.values.accommodationLongitude
    ) {
      calculateAirportDistance();
    }
  }, [
    formik.values.airportLocationLatitude,
    formik.values.airportLocationLongitude,
    formik.values.accommodationLatitude,
    formik.values.accommodationLongitude,
    activeSidePicksKey,
  ]);

  const airportServiceTripTypes = useMemo(
    () => [
      "Ride to the airport(one way)",
      "Ride from the airport(one way)",
      "Ride to the airport(round trip)",
      "Ride from the airport(round trip)",
    ],
    []
  );

  const calculateDistance = async () => {
    const google = window.google;
    if (!google) return;
    const directionsService = new google.maps.DirectionsService();
    const originLatLng = {
      lat: formik.values.pickupLatitude,
      lng: formik.values.pickupLongitude,
    };
    const destinationLatLng = {
      lat: formik.values.dropoffLatitude,
      lng: formik.values.dropoffLongitude,
    };

    const activeSidePicks = (formik.values.sidePicks || []).filter(
      (sp) => sp.latitude && sp.longitude
    );
    const waypoints = activeSidePicks.map((sp) => ({
      location: { lat: sp.latitude, lng: sp.longitude },
      stopover: true,
    }));

    await directionsService
      .route({
        origin: originLatLng,
        destination: destinationLatLng,
        waypoints,
        travelMode: google.maps.TravelMode["DRIVING"],
      })
      .then((response) => {
        const totalMeters = response.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        );
        const distanceInMile = totalMeters / 1609.344;
        formik.setFieldValue("distanceInMiles", distanceInMile.toFixed(2));
        setDirectionsResponse(response);
        const totalSecs = response.routes[0].legs.reduce(
          (sum, leg) => sum + leg.duration.value,
          0
        );
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        formik.setFieldValue(
          "duration",
          hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`
        );
      });
  };

  const calculateAirportDistance = async () => {
    const google = window.google;
    if (!google) return;
    const directionsService = new google.maps.DirectionsService();
    const airportLatLng = {
      lat: formik.values.airportLocationLatitude,
      lng: formik.values.airportLocationLongitude,
    };
    const accomodationtLatLng = {
      lat: formik.values.accommodationLatitude,
      lng: formik.values.accommodationLongitude,
    };

    const activeSidePicks = (formik.values.sidePicks || []).filter(
      (sp) => sp.latitude && sp.longitude
    );
    const waypoints = activeSidePicks.map((sp) => ({
      location: { lat: sp.latitude, lng: sp.longitude },
      stopover: true,
    }));

    await directionsService
      .route({
        origin: airportLatLng,
        destination: accomodationtLatLng,
        waypoints,
        travelMode: google.maps.TravelMode["DRIVING"],
      })
      .then((response) => {
        const totalMeters = response.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        );
        const distanceInMile = totalMeters / 1609.344;
        formik.setFieldValue("distanceInMiles", distanceInMile.toFixed(2));
        setDirectionsResponse(response);
        const totalSecs = response.routes[0].legs.reduce(
          (sum, leg) => sum + leg.duration.value,
          0
        );
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        formik.setFieldValue(
          "duration",
          hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`
        );
      })
      .catch((error) => console.log("error2: ", error));
  };
  const getTripType = () => {
    if (travelType == 1) {
      return "airport";
    }
    if (travelType == 2) {
      return "point-to-point";
    }
  };

  const handleMapClick = async (e) => {
    const geocoder = new window.google.maps.Geocoder();
    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status == "OK") {
        if (results[0]) {
          console.log(results[0].formatted_address); // Location name
          console.log(latLng); // Latitude and Longitude
          setLatLng(latLng);
        } else {
          console.log("No results found");
        }

      } else {
        console.log(`Geocoder failed due to: ${status}`);
      }
    });
  };

  useEffect(() => {
    getRoundTripMenuData();
  }, [selectedTripType]);

  const getRoundTripMenuData = () => {
    const tripType = getTripType();
    switch (tripType) {
      case "airport":
        setTrip(airportServiceTripTypes);
        break;
      case "point-to-point":
        setTrip(pointToPointTripTypes);
        break;
      default:
        setTrip(null);
        break;
    }
  };

  function onOriginChanged() {
    if (searchOriginResult != null) {
      const place = searchOriginResult.getPlace();
      const address_components = place.address_components;

      const isInUsa = checkServiceLocation(address_components);

      const pickupPhysicalAddress = place.formatted_address;
      const latlng = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      formik.setFieldValue("pickupPhysicalAddress", pickupPhysicalAddress);
      formik.setFieldValue("pickupLatitude", latlng?.lat);
      formik.setFieldValue("pickupLongitude", latlng?.lng);

      if (!isInUsa) {
        setLocationCkecker({
          isUnsupportedLocation: true,
          errorMessage: "pickup address should be in US",
        });
        formik.setFieldValue("isUnsupportedPickupAddr", true);
      } else if (formik.values.isUnsupportedDropoffAddr) {
        setLocationCkecker({
          isUnsupportedLocation: true,
          errorMessage: "dropoff address should be in US",
        });
      }

      if (isInUsa) {
        if (formik.values.isUnsupportedDropoffAddr) {
          setLocationCkecker({
            isUnsupportedLocation: true,
            errorMessage: "dropoff address should be in US",
          });
        } else {
          setLocationCkecker({
            isUnsupportedLocation: false,
            errorMessage: "",
          });
        }
        formik.setFieldValue("isUnsupportedPickupAddr", false);
      }
    } else {
      alert("Please enter text");
    }
  }

  function onDestinationChanged() {
    if (searchDestinationResult != null) {
      const place = searchDestinationResult.getPlace();
      const address_components = place.address_components;

      const isInUsa = checkServiceLocation(address_components);

      const latlng = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      const dropoffPhysicalAddress = place.formatted_address;
      formik.setFieldValue("dropoffPhysicalAddress", dropoffPhysicalAddress);
      formik.setFieldValue("dropoffLatitude", latlng?.lat);
      formik.setFieldValue("dropoffLongitude", latlng?.lng);

      if (!isInUsa) {
        setLocationCkecker({
          isUnsupportedLocation: true,
          errorMessage: "dropoff address should be in US",
        });
        formik.setFieldValue("isUnsupportedDropoffAddr", true);
      } else if (formik.values.isUnsupportedPickupAddr) {
        setLocationCkecker({
          isUnsupportedLocation: true,
          errorMessage: "pickup address should be in US",
        });
      }

      if (isInUsa) {
        if (formik.values.isUnsupportedPickupAddr) {
          setLocationCkecker({
            isUnsupportedLocation: true,
            errorMessage: "pickup address should be in US",
          });
        } else {
          setLocationCkecker({
            isUnsupportedLocation: false,
            errorMessage: "",
          });
        }
        formik.setFieldValue("isUnsupportedDropoffAddr", false);
      }
    } else {
      alert("Please enter text");
    }
  }

  function onAccommodationChange() {
    if (searchAccomodationResult != null) {
      const place = searchAccomodationResult.getPlace();
      const address_components = place.address_components;

      const isInUsa = checkServiceLocation(address_components);

      const latlng = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      const accommodationAddress =
        place.formatted_address || place.name || "";
      formik.setFieldValue("hotel", accommodationAddress);
      formik.setFieldValue("accommodationAddress", accommodationAddress);
      formik.setFieldValue("accommodationLatitude", latlng?.lat);
      formik.setFieldValue("accommodationLongitude", latlng?.lng);

      if (!isInUsa) {
        setAccomAddrChecker({
          isUnsupportedLocation: true,
          errorMessage: "accommodation address should be in US",
        });
      } else {

        setAccomAddrChecker({
          isUnsupportedLocation: false,
          errorMessage: " ",
        });
      }
    } else {
      alert("Please enter text");
    }
  }

  function onLoadOriginFunc(autocomplete) {
    setSearchOriginResult(autocomplete);
  }
  function onLoadDestinationFunc(autocomplete) {
    setSearchDestinationResult(autocomplete);
  }

  function addSidePick() {
    const current = formik.values.sidePicks || [];
    formik.setFieldValue("sidePicks", [
      ...current,
      { address: "", latitude: null, longitude: null },
    ]);
    sidePickAutocompleteRefs.current.push(null);
  }

  function removeSidePick(idx) {
    const current = formik.values.sidePicks || [];
    const updated = current.filter((_, i) => i !== idx);
    formik.setFieldValue("sidePicks", updated);
    sidePickAutocompleteRefs.current.splice(idx, 1);
    // Route/map recalculation now runs via the activeSidePicksKey-keyed
    // effects above, once formik.values.sidePicks actually reflects this
    // removal — no need to (and no longer safe to) trigger it here directly.
  }

  function onLoadSidePickFunc(autocomplete, idx) {
    sidePickAutocompleteRefs.current[idx] = autocomplete;
  }

  function onSidePickChanged(idx) {
    const autocomplete = sidePickAutocompleteRefs.current[idx];
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place?.geometry) return;
    const latlng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    const address = place.formatted_address || place.name || "";
    const current = [...(formik.values.sidePicks || [])];
    current[idx] = { address, latitude: latlng.lat, longitude: latlng.lng };
    formik.setFieldValue("sidePicks", current);
    // Route/map recalculation now runs via the activeSidePicksKey-keyed
    // effects above, once formik.values.sidePicks actually reflects this
    // pick — no need to (and no longer safe to) trigger it here directly.
  }
  function onLoadAccomodationFunc(autocomplete) {
    setSearchAccomodationResult(autocomplete);
  }
  function onLoadAirportLocationFunc(autocomplete) {
    setSearchAirportLocationResult(autocomplete);
  }

  function onAirportLocationChanged() {
    if (searchAirportLocationResult != null) {
      const place = searchAirportLocationResult.getPlace();
      const address_components = place.address_components;
      const isInUsa = checkServiceLocation(address_components);
      const latlng = {
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };
      const airportLocationAddress = place.formatted_address || place.name || "";
      formik.setFieldValue("airportLocationAddress", airportLocationAddress);
      formik.setFieldValue("airportLocationLatitude", latlng?.lat);
      formik.setFieldValue("airportLocationLongitude", latlng?.lng);

      if (!isInUsa) {
        setAirportLocChecker?.({
          isUnsupportedLocation: true,
          errorMessage: "Airport/Terminal pick-up must be in the USA",
        });
      } else {
        setAirportLocChecker?.({
          isUnsupportedLocation: false,
          errorMessage: "",
        });
      }
    } else {
      alert("Please choose an airport or terminal from the suggestions");
    }
  }

  if (!isLoaded) {
    return (
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3} justifyContent={{ lg: "space-between", sm: "center" }}>
          <Grid item md={5} xs={12}>
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Stack>
          </Grid>
          <Grid item md={6} xs={12}>
            <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width={120} />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (travelType == null || travelType === "") {
    return (
      <Alert severity="error">
        Missing booking service type. Open Update Booking from Current Bookings.
      </Alert>
    );
  }

  return (
    <Box>
      <Grid
        container
        justifyContent={{ lg: "space-between", sm: "center" }}
        spacing={2}
      >
        <Grid item md={5} xs={12}>
          <Stack direction={"column"} spacing={2}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  mb: 0.5,
                }}
              >
                Select Type of Service
              </FormLabel>
              {disableServiceTypeSwitch ? (
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  {travelType == 1 && "Airport Service (editing existing booking)"}
                  {travelType == 2 && "Point to Point (editing existing booking)"}
                  {travelType == 3 && "Hourly Charter (editing existing booking)"}
                </Typography>
              ) : (
                <RadioGroup
                  row
                  defaultValue={travelType}
                  name="radio-buttons-group"
                  onChange={handleChangeTripType}
                >
                  <FormControlLabel
                    value={1}
                    control={<RSRadio />}
                    label="Airport Service"
                  />
                  <FormControlLabel
                    value={2}
                    control={<RSRadio />}
                    label="Point to Point"
                  />
                  <FormControlLabel
                    value={3}
                    control={<RSRadio />}
                    label="Hourly Charter"
                  />
                </RadioGroup>
              )}
            </FormControl>
            {locationChecker.isUnsupportedLocation &&
              (travelType == "2" || travelType === "3") && (
                <Alert severity="error">{locationChecker.errorMessage}</Alert>
              )}
            {accomAddrChecker.isUnsupportedLocation && travelType == "1" && (
              <Alert severity="error">{accomAddrChecker.errorMessage}</Alert>
            )}
            {airportLocChecker?.isUnsupportedLocation && travelType == "1" && (
              <Alert severity="error">{airportLocChecker.errorMessage}</Alert>
            )}
            {(travelType == 1 || travelType == 2) && (
              <FormControl fullWidth color="info">
                <InputLabel id="demo-simple-select-helper-label">
                  Select one way or round trip
                </InputLabel>
                <Select
                  label="Select one way or round trip"
                  name="tripType"
                  value={formik.values.tripType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.tripType && Boolean(formik.errors.tripType)
                  }
                  helperText={formik.touched.tripType && formik.errors.tripType}
                >
                  {trip?.map((key) => (
                    <MenuItem value={key} key={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.tripType && (
                  <FormHelperText sx={{ color: "red" }}>
                    {formik.errors.tripType}
                  </FormHelperText>
                )}
              </FormControl>
            )}

            {travelType == 1 && isLoaded && (
              <Autocomplete
                onPlaceChanged={onAirportLocationChanged}
                onLoad={onLoadAirportLocationFunc}
                options={{
                  types: ["establishment"],
                  componentRestrictions: { country: "us" },
                }}
              >
                <TextField
                  color="info"
                  label="Airport or terminal (search & select)"
                  fullWidth
                  name="airportLocationAddress"
                  value={formik.values.airportLocationAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.airportLocationAddress &&
                    Boolean(formik.errors.airportLocationAddress)
                  }
                  helperText={
                    (formik.touched.airportLocationAddress &&
                      formik.errors.airportLocationAddress) ||
                    "Pick an airport/terminal from suggestions so coordinates are sent"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdLocalAirport />
                      </InputAdornment>
                    ),
                  }}
                />
              </Autocomplete>
            )}

            {travelType == 3 && (
              <FormControl fullWidth color="info">
                <InputLabel id="hour label">Select Hours</InputLabel>
                <Select
                  label="Select Hours"
                  name="hour"
                  value={formik.values.hour}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.hour && Boolean(formik.errors.hour)}
                >
                  {Array.from({ length: 20 }, (_, index) => {
                    const hours = index + 4; // minimum booking is 4 hours
                    return (
                      <MenuItem key={hours} value={hours}>
                        {hours} hours{hours === 4 ? " (minimum)" : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
                {formik.touched.hour && (
                  <FormHelperText sx={{ color: "red" }}>
                    {formik.errors.hour}
                  </FormHelperText>
                )}
              </FormControl>
            )}

            {travelType == 3 && (
              <BillingModeToggle
                value={formik.values.billingMode || "PRE_BOOKED"}
                onChange={(mode) => formik.setFieldValue("billingMode", mode)}
              />
            )}

            {(travelType == 2 || travelType == 3) && isLoaded && (
              <Autocomplete
                onPlaceChanged={onOriginChanged}
                onLoad={onLoadOriginFunc}
              >
                <TextField
                  color="info"
                  label="Select pickup address"
                  fullWidth
                  name="pickupPhysicalAddress"
                  value={formik.values.pickupPhysicalAddress}
                  ref={pickupPhysicalAddressRef}
                  // value={formik.values.pickupPhysicalAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.pickupPhysicalAddress &&
                    Boolean(formik.errors.pickupPhysicalAddress)
                  }
                  helperText={
                    formik.touched.pickupPhysicalAddress &&
                    formik.errors.pickupPhysicalAddress
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GrLocation />
                      </InputAdornment>
                    ),
                  }}
                />
              </Autocomplete>
            )}

            {(travelType == 2 || travelType == 3) && (
              <Autocomplete
                onPlaceChanged={onDestinationChanged}
                onLoad={onLoadDestinationFunc}
              >
                <TextField
                  color="info"
                  fullWidth
                  label="Select Dropoff address"
                  name="dropoffPhysicalAddress"
                  ref={dropDownAddressRef}
                  // value={formik.values.dropoffPhysicalAddress}
                  value={formik.values.dropoffPhysicalAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.dropoffPhysicalAddress &&
                    Boolean(formik.errors.dropoffPhysicalAddress)
                  }
                  helperText={
                    formik.touched.dropoffPhysicalAddress &&
                    formik.errors.dropoffPhysicalAddress
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TbCurrentLocation />
                      </InputAdornment>
                    ),
                  }}
                />
              </Autocomplete>
            )}

            {travelType == 1 && (
              <Autocomplete
                onPlaceChanged={onAccommodationChange}
                onLoad={onLoadAccomodationFunc}
              >
                <TextField
                  label="Enter Hotel/ residence/ other"
                  fullWidth
                  name="accommodationAddress"
                  value={formik.values.accommodationAddress}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.accommodationAddress &&
                    Boolean(formik.errors.accommodationAddress)
                  }
                  helperText={
                    formik.touched.accommodationAddress &&
                    formik.errors.accommodationAddress
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdOutlineHotel />
                      </InputAdornment>
                    ),
                  }}
                />
              </Autocomplete>
            )}

            {(travelType == 1 || travelType == 2) && isLoaded && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600, whiteSpace: "nowrap" }}
                  >
                    Side Pick / Detour Stops
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Stack>

                {(formik.values.sidePicks || []).map((sp, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Autocomplete
                      onPlaceChanged={() => onSidePickChanged(idx)}
                      onLoad={(ac) => onLoadSidePickFunc(ac, idx)}
                    >
                      <TextField
                        color="info"
                        label={`Detour stop ${idx + 1}`}
                        fullWidth
                        value={sp.address}
                        onChange={(e) => {
                          const current = [...(formik.values.sidePicks || [])];
                          current[idx] = { ...current[idx], address: e.target.value };
                          formik.setFieldValue("sidePicks", current);
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MdAddLocation color="#f59e0b" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => removeSidePick(idx)}
                                sx={{ color: "error.main" }}
                              >
                                <MdClose />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText={
                          sp.latitude
                            ? `📍 ${sp.latitude?.toFixed(4)}, ${sp.longitude?.toFixed(4)}`
                            : "Search & select from suggestions to capture coordinates"
                        }
                      />
                    </Autocomplete>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<MdAddLocation />}
                  onClick={addSidePick}
                  sx={{ borderStyle: "dashed", width: "100%" }}
                >
                  + Add Detour Stop
                </Button>

                {(formik.values.sidePicks || []).length > 0 && (
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                    Detour stops add extra driving distance — fare updates automatically.
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </Grid>

        <Grid item md={6} xs={12}>
          <Stack
            direction={"column"}
            justifyContent={"space-between"}
            spacing={2}
            sx={{ width: "100%", height: "100%" }}
          >
            <GoogleMap
              zoom={3}
              center={center}
              onLoad={onLoad}
              mapContainerStyle={{
                width: "100%",
                height: matchXS && 400,
              }}
              mapContainerClassName="map-container"
              onClick={handleMapClick}
            >
              {latLng && <Marker position={latLng} />}
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}
            </GoogleMap>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent={"space-between"}
              sx={{
                background: "rgba(3,147,10,0.04)",
                border: "1px solid rgba(3,147,10,0.12)",
                borderRadius: 1.5,
                px: 2,
                py: 1.2,
                mt: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: formik.values.distanceInMiles ? "#03930A" : "#ccc",
                  }}
                />
                <RSTypography>
                  Distance:{" "}
                  <strong>
                    {formik.values.distanceInMiles
                      ? formik.values.distanceInMiles + " mi"
                      : "—"}
                  </strong>
                </RSTypography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: formik.values.duration ? "#03930A" : "#ccc",
                  }}
                />
                <RSTypography>
                  Duration:{" "}
                  <strong>
                    {formik.values.duration ? formik.values.duration : "—"}
                  </strong>
                </RSTypography>
              </Box>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Index;