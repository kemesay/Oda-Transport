export const checkServiceLocation = (addressComponents) => {
  var country = addressComponents.find((component) =>
    component.types.includes("country")
  )?.short_name;
  return country === "US";
};

// Service area: pickup must originate in California or Washington state;
// drop-off is unrestricted anywhere in the US (see checkServiceLocation).
export const isLocationInAllowedPickupState = (addressComponents) => {
  var country = addressComponents.find((component) =>
    component.types.includes("country")
  )?.short_name;
  var administrativeArea = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1")
  )?.short_name;
  return (
    country === "US" &&
    (administrativeArea === "CA" || administrativeArea === "WA")
  );
};
