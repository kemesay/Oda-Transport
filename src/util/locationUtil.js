// Service area: both pickup and drop-off are unrestricted anywhere in the US.
export const checkServiceLocation = (addressComponents) => {
  var country = addressComponents.find((component) =>
    component.types.includes("country")
  )?.short_name;
  return country === "US";
};
