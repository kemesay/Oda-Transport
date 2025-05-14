// import React, { useState, useEffect } from "react";
// import Cards from "react-credit-cards-2";
// import { CircularProgress, Alert, Checkbox, FormControlLabel } from "@mui/material";
// import axios from "axios";
// import "react-credit-cards-2/dist/es/styles-compiled.css";
// import { remote_host } from "../../../../globalVariable";

// const CreditCardForm = ({ formik, onSubmit, shouldValidate }) => {
//   // Initialize state with values from formik if they exist
//   const [cardInfo, setCardInfo] = useState({
//     number: formik.values.cardDetails?.creditCardNumber || "",
//     name: formik.values.cardDetails?.cardOwnerName || "",
//     expiry: formik.values.cardDetails?.expirationDate || "",
//     cvc: formik.values.cardDetails?.securityCode || "",
//     zipCode: formik.values.cardDetails?.zipCode || "",
//     focus: "",
//   });

//   const [validationState, setValidationState] = useState({
//     isLoading: false,
//     error: null,
//     success: false
//   });

//   // Get authentication token if user is logged in
//   const isAuthenticated = !formik.values.isGuestBooking;
//   const authToken = isAuthenticated ? sessionStorage.getItem('access_token') : null;

//   useEffect(() => {
//     // Initialize formik values if they don't exist
//     if (!formik.values.cardDetails) {
//       formik.setFieldValue('cardDetails', {
//         cardOwnerName: '',
//         creditCardNumber: '',
//         expirationDate: '',
//         securityCode: '',
//         zipCode: '',
//       });
//     }
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "expiry") {
//       // Format expiration date as MM/YY
//       let formattedValue = value.replace(/[^0-9]/g, '');
//       if (formattedValue.length > 2) {
//         formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
//       }
      
//       // Validate month is between 01-12
//       if (formattedValue.length >= 2) {
//         const month = parseInt(formattedValue.substring(0, 2));
//         if (month < 1 || month > 12) return;
//       }
      
//       if (formattedValue.length <= 5) {
//         setCardInfo(prev => ({ ...prev, [name]: formattedValue }));
//         updateFormikCardDetails(name, formattedValue);
//       }
//     } else if (name === "number") {
//       // Limit card number length and only allow digits
//       const digitsOnly = value.replace(/[^0-9]/g, '');
//       if (digitsOnly.length <= 16) {
//         setCardInfo(prev => ({ ...prev, [name]: digitsOnly }));
//         updateFormikCardDetails(name, digitsOnly);
//       }
//     } else if (name === "cvc") {
//       // Limit CVC length to 3-4 digits
//       const digitsOnly = value.replace(/[^0-9]/g, '');
//       if (digitsOnly.length <= 4) {
//         setCardInfo(prev => ({ ...prev, [name]: digitsOnly }));
//         updateFormikCardDetails(name, digitsOnly);
//       }
//     } else {
//       setCardInfo(prev => ({ ...prev, [name]: value }));
//       updateFormikCardDetails(name, value);
//     }
//   };

//   const updateFormikCardDetails = (fieldName, value) => {
//     const fieldMapping = {
//       number: 'creditCardNumber',
//       name: 'cardOwnerName',
//       expiry: 'expirationDate',
//       cvc: 'securityCode',
//       zipCode: 'zipCode',
//       isPrimary: 'isPrimary'
//     };

//     const formikFieldName = fieldMapping[fieldName];
//     if (formikFieldName) {
//       formik.setFieldValue('cardDetails', {
//         ...formik.values.cardDetails,
//         [formikFieldName]: value,
//       });
      
//       // Clear any previous validation state when user edits
//       if (validationState.success || validationState.error) {
//         setValidationState({
//           isLoading: false,
//           error: null,
//           success: false
//         });
//         formik.setFieldValue('isValidCardInfo', false);
//       }
//     }
//   };

//   const handleInputFocus = (e) => {
//     setCardInfo(prev => ({ ...prev, focus: e.target.name }));
//   };

//   const validateCard = async () => {
//     setValidationState({ isLoading: true, error: null, success: false });
    
//     try {
//       // Client-side validation first
//       if (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvc || !cardInfo.zipCode) {
//         throw new Error('All card fields are required');
//       }
      
//       if (!isValidCardNumber(cardInfo.number)) {
//         throw new Error('Invalid card number');
//       }
      
//       if (!isValidExpiration(cardInfo.expiry)) {
//         throw new Error('Invalid expiration date (MM/YY)');
//       }
      
//       if (cardInfo.cvc.length < 3 || cardInfo.cvc.length > 4) {
//         throw new Error('Security code must be 3-4 digits');
//       }

//       // If client-side validation passes, optionally validate with backend
//       if (shouldValidate) {
//         const headers = {
//           'Content-Type': 'application/json',
//           ...(authToken && { Authorization: `Bearer ${authToken}` })
//         };

//         const cardDetails = {
//           cardOwnerName: cardInfo.name,
//           creditCardNumber: cardInfo.number,
//           expirationDate: cardInfo.expiry,
//           securityCode: cardInfo.cvc,
//           zipCode: cardInfo.zipCode,
//           isPrimary: false,
//         };

//         await axios.post(
//           `${remote_host}/api/v1/users/payment-detail/validate-card`,
//           cardDetails,
//           { headers }
//         );
//       }

//       setValidationState({ isLoading: false, error: null, success: true });
//       formik.setFieldValue('isValidCardInfo', true);
//       return true;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || error.message || "Card validation failed";
//       setValidationState({ isLoading: false, error: errorMsg, success: false });
//       formik.setFieldValue('isValidCardInfo', false);
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const isValid = await validateCard();
//     if (isValid) {
//       onSubmit({
//         cardOwnerName: cardInfo.name,
//         creditCardNumber: cardInfo.number,
//         expirationDate: cardInfo.expiry,
//         securityCode: cardInfo.cvc,
//         zipCode: cardInfo.zipCode,
//         isPrimary: false,
//       });
//     }
//   };

//   // Helper validation functions
//   const isValidCardNumber = (number) => {
//     // Simple Luhn check
//     let sum = 0;
//     let shouldDouble = false;
//     const cleaned = number.replace(/\D/g, '');
    
//     if (cleaned.length < 13 || cleaned.length > 19) return false;
    
//     for (let i = cleaned.length - 1; i >= 0; i--) {
//       let digit = parseInt(cleaned.charAt(i), 10);
      
//       if (shouldDouble) {
//         digit *= 2;
//         if (digit > 9) digit -= 9;
//       }
      
//       sum += digit;
//       shouldDouble = !shouldDouble;
//     }
    
//     return (sum % 10) === 0;
//   };

//   const isValidExpiration = (exp) => {
//     if (!exp) return false;
    
//     const [month, year] = exp.split('/').map(Number);
//     if (!month || !year || month < 1 || month > 12) return false;
    
//     const currentYear = new Date().getFullYear() % 100;
//     const currentMonth = new Date().getMonth() + 1;
    
//     if (year < currentYear) return false;
//     if (year === currentYear && month < currentMonth) return false;
    
//     return true;
//   };

//   return (
//     <div>
//       <Cards
//         number={cardInfo.number}
//         expiry={cardInfo.expiry}
//         cvc={cardInfo.cvc}
//         name={cardInfo.name}
//         focused={cardInfo.focus}
//       />
      
//       <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
//         <div style={{ marginBottom: '15px' }}>
//           <input
//             type="text"
//             name="name"
//             className="form-control"
//             placeholder="Cardholder Name"
//             value={cardInfo.name}
//             onChange={handleInputChange}
//             onFocus={handleInputFocus}
//             required
//             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
//           />
//         </div>
        
//         <div style={{ marginBottom: '15px' }}>
//           <input
//             type="text"
//             name="number"
//             className="form-control"
//             placeholder="Card Number"
//             value={cardInfo.number}
//             onChange={handleInputChange}
//             onFocus={handleInputFocus}
//             required
//             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
//           />
//         </div>

//         <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
//           <div style={{ flex: 1 }}>
//             <input
//               type="text"
//               name="expiry"
//               className="form-control"
//               placeholder="MM/YY"
//               value={cardInfo.expiry}
//               onChange={handleInputChange}
//               onFocus={handleInputFocus}
//               required
//               style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
//             />
//           </div>
//           <div style={{ flex: 1 }}>
//             <input
//               type="text"
//               name="cvc"
//               className="form-control"
//               placeholder="CVC"
//               value={cardInfo.cvc}
//               onChange={handleInputChange}
//               onFocus={handleInputFocus}
//               required
//               style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
//             />
//           </div>
//         </div>
        
//         <div style={{ marginBottom: '15px' }}>
//           <input
//             type="text"
//             name="zipCode"
//             className="form-control"
//             placeholder="Zip Code"
//             value={cardInfo.zipCode}
//             onChange={handleInputChange}
//             onFocus={handleInputFocus}
//             required
//             style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
//           />
//         </div>

//         {isAuthenticated && (
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={formik.values.saveCard || false}
//                 onChange={(e) => formik.setFieldValue('saveCard', e.target.checked)}
//                 color="primary"
//               />
//             }
//             label="Save this card for future use"
//             style={{ marginBottom: '15px' }}
//           />
//         )}

//         <button 
//           type="submit"
//           disabled={validationState.isLoading}
//           style={{
//             width: '100%',
//             padding: '12px',
//             backgroundColor: '#03930A',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '16px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '8px'
//           }}
//         >
//           {validationState.isLoading ? (
//             <>
//               <CircularProgress size={20} style={{ color: 'white' }} />
//               Validating...
//             </>
//           ) : shouldValidate ? (
//             "Validate Card"
//           ) : (
//             "Save Card Details"
//           )}
//         </button>
//       </form>

//       {validationState.error && (
//         <Alert severity="error" style={{ marginTop: '20px' }}>
//           {validationState.error}
//         </Alert>
//       )}
      
//       {validationState.success && (
//         <Alert severity="success" style={{ marginTop: '20px' }}>
//           Card validated successfully!
//         </Alert>
//       )}
//     </div>
//   );
// };

// export default CreditCardForm;



import React, { useState, useEffect } from "react";
import Cards from "react-credit-cards-2";
import { CircularProgress, Alert, Checkbox, FormControlLabel } from "@mui/material";
import axios from "axios";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { remote_host } from "../../../../globalVariable";

const CreditCardForm = ({ formik, onSubmit, shouldValidate }) => {
  const [cardInfo, setCardInfo] = useState({
    number: formik.values.cardDetails?.creditCardNumber || "",
    name: formik.values.cardDetails?.cardOwnerName || "",
    expiry: formik.values.cardDetails?.expirationDate || "",
    cvc: formik.values.cardDetails?.securityCode || "",
    zipCode: formik.values.cardDetails?.zipCode || "",
    focus: "",
  });

  const [validationState, setValidationState] = useState({
    isLoading: false,
    error: null,
    success: false
  });

  const isAuthenticated = !formik.values.isGuestBooking;
  const authToken = isAuthenticated ? sessionStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!formik.values.cardDetails) {
      formik.setFieldValue('cardDetails', {
        cardOwnerName: '',
        creditCardNumber: '',
        expirationDate: '',
        securityCode: '',
        zipCode: '',
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "expiry") {
      let formattedValue = value.replace(/[^0-9]/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      
      if (formattedValue.length >= 2) {
        const month = parseInt(formattedValue.substring(0, 2));
        if (month < 1 || month > 12) return;
      }
      
      if (formattedValue.length <= 5) {
        setCardInfo(prev => ({ ...prev, [name]: formattedValue }));
        updateFormikCardDetails(name, formattedValue);
      }
    } else if (name === "number") {
      const digitsOnly = value.replace(/[^0-9]/g, '');
      if (digitsOnly.length <= 16) {
        setCardInfo(prev => ({ ...prev, [name]: digitsOnly }));
        updateFormikCardDetails(name, digitsOnly);
      }
    } else if (name === "cvc") {
      const digitsOnly = value.replace(/[^0-9]/g, '');
      if (digitsOnly.length <= 4) {
        setCardInfo(prev => ({ ...prev, [name]: digitsOnly }));
        updateFormikCardDetails(name, digitsOnly);
      }
    } else {
      setCardInfo(prev => ({ ...prev, [name]: value }));
      updateFormikCardDetails(name, value);
    }
  };

  const updateFormikCardDetails = (fieldName, value) => {
    const fieldMapping = {
      number: 'creditCardNumber',
      name: 'cardOwnerName',
      expiry: 'expirationDate',
      cvc: 'securityCode',
      zipCode: 'zipCode',
    };

    const formikFieldName = fieldMapping[fieldName];
    if (formikFieldName) {
      formik.setFieldValue('cardDetails', {
        ...formik.values.cardDetails,
        [formikFieldName]: value,
      });
      
      if (validationState.success || validationState.error) {
        setValidationState({
          isLoading: false,
          error: null,
          success: false
        });
        formik.setFieldValue('isValidCardInfo', false);
      }
    }
  };

  const handleInputFocus = (e) => {
    setCardInfo(prev => ({ ...prev, focus: e.target.name }));
  };

  const validateCard = async () => {
    setValidationState({ isLoading: true, error: null, success: false });
    
    try {
      // Client-side validation for all users
      if (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvc || !cardInfo.zipCode) {
        throw new Error('All card fields are required');
      }
      
      if (!isValidCardNumber(cardInfo.number)) {
        throw new Error('Invalid card number');
      }
      
      if (!isValidExpiration(cardInfo.expiry)) {
        throw new Error('Invalid expiration date (MM/YY)');
      }
      
      if (cardInfo.cvc.length < 3 || cardInfo.cvc.length > 4) {
        throw new Error('Security code must be 3-4 digits');
      }

      // For authenticated users, validate with backend
      if (isAuthenticated && shouldValidate) {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        };

        const cardDetails = {
          cardOwnerName: cardInfo.name,
          creditCardNumber: cardInfo.number,
          expirationDate: cardInfo.expiry,
          securityCode: cardInfo.cvc,
          zipCode: cardInfo.zipCode,
          isPrimary: formik.values.cardDetails?.isPrimary || false,
        };

        await axios.post(
          `${remote_host}/api/v1/users/payment-detail/validate-card`,
          cardDetails,
          { headers }
        );
      }

      // For guest users, we just do client-side validation
      setValidationState({ isLoading: false, error: null, success: true });
      formik.setFieldValue('isValidCardInfo', true);
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Card validation failed";
      setValidationState({ isLoading: false, error: errorMsg, success: false });
      formik.setFieldValue('isValidCardInfo', false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateCard();
    if (isValid) {
      const cardDetails = {
        cardOwnerName: cardInfo.name,
        creditCardNumber: cardInfo.number,
        expirationDate: cardInfo.expiry,
        securityCode: cardInfo.cvc,
        zipCode: cardInfo.zipCode,
        isPrimary: formik.values.cardDetails?.isPrimary || false,
      };
      
      onSubmit(cardDetails);
    }
  };

  // Helper validation functions (same as before)
  const isValidCardNumber = (number) => {
    let sum = 0;
    let shouldDouble = false;
    const cleaned = number.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  };

  const isValidExpiration = (exp) => {
    if (!exp) return false;
    
    const [month, year] = exp.split('/').map(Number);
    if (!month || !year || month < 1 || month > 12) return false;
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  return (
    <div>
      <Cards
        number={cardInfo.number}
        expiry={cardInfo.expiry}
        cvc={cardInfo.cvc}
        name={cardInfo.name}
        focused={cardInfo.focus}
      />
      
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        {/* Form inputs remain the same */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Cardholder Name"
            value={cardInfo.name}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="number"
            className="form-control"
            placeholder="Card Number"
            value={cardInfo.number}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="expiry"
              className="form-control"
              placeholder="MM/YY"
              value={cardInfo.expiry}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="cvc"
              className="form-control"
              placeholder="CVC"
              value={cardInfo.cvc}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="zipCode"
            className="form-control"
            placeholder="Zip Code"
            value={cardInfo.zipCode}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        {isAuthenticated && (
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.cardDetails?.isPrimary || false}
                onChange={(e) => formik.setFieldValue('cardDetails.isPrimary', e.target.checked)}
                color="primary"
              />
            }
            label="Set as primary card"
            style={{ marginBottom: '15px' }}
          />
        )}

        {isAuthenticated && (
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.saveCard || false}
                onChange={(e) => formik.setFieldValue('saveCard', e.target.checked)}
                color="primary"
              />
            }
            label="Save this card for future use"
            style={{ marginBottom: '15px' }}
          />
        )}

        <button 
          type="submit"
          disabled={validationState.isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#03930A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {validationState.isLoading ? (
            <>
              <CircularProgress size={20} style={{ color: 'white' }} />
              Validating...
            </>
          ) : isAuthenticated ? (
            "Validate & Save Card"
          ) : (
            "Validate Card"
          )}
        </button>
      </form>

      {validationState.error && (
        <Alert severity="error" style={{ marginTop: '20px' }}>
          {validationState.error}
        </Alert>
      )}
      
      {validationState.success && (
        <Alert severity="success" style={{ marginTop: '20px' }}>
          {isAuthenticated ? "Card validated and saved successfully!" : "Card validated successfully!"}
        </Alert>
      )}
    </div>
  );
};

export default CreditCardForm;