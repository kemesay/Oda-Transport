const StepSummary = ({ vehicleSummaryData, ...props }) => {
  // Ensure vehicleSummaryData is always an array
  const vehicles = Array.isArray(vehicleSummaryData) ? vehicleSummaryData : [];
  
  return (
    <div>
      {vehicles.map((vehicle) => (
        // render vehicle information
        <div key={vehicle.id}>
          {/* Add actual vehicle rendering logic here */}
        </div>
      ))}
    </div>
  );
}; 