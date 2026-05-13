import React from 'react';
import BookingForm from '../booking/BookingForm';
import { BACKEND_API } from '../../store/utils/API';
import { authHeader } from '../../util/authUtil';

function CreateBooking() {
  const handleCreate = async (values) => {
    const endpoint = `/api/v1/${values.travelType === '1' ? 'airport' : 
                     values.travelType === '2' ? 'point-to-point' : 
                     'hourly-charter'}-books`;
    
    const response = await BACKEND_API.post(endpoint, values, authHeader());
    return response.data;
  };

  return (
    <BookingForm 
      isEditing={false}
      onSubmit={handleCreate}
    />
  );
}

export default CreateBooking; 