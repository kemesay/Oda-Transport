import PaymentMethodSelector from './PaymentMethodSelector';

function ContactDetailForm({ formik, vehicleSummaryData, rideSummaryData, tripSummaryData }) {
  return (
    <Grid
      container
      direction={{ xs: "column-reverse", lg: "row" }}
      spacing={1}
      justifyContent={"start"}
    >
      <Grid item xs={3}>
        <StepSummary
          rideSummaryData={rideSummaryData}
          vehicleSummaryData={vehicleSummaryData}
          tripSummaryData={tripSummaryData}
          contactSummaryData={[]}
        />
      </Grid>
      <Grid item xs={8} spacing={{ xs: 12, md: 6 }}>
        {/* ... existing passenger info fields ... */}

        {/* Replace the CreditCardForm with PaymentMethodSelector */}
        <Grid item xs={12} mt={2}>
          <Box>
            <PaymentMethodSelector formik={formik} />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ContactDetailForm; 