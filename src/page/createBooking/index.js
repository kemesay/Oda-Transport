import React from 'react';
import BookingForm from '../booking/BookingForm';
import { remote_host } from '../../globalVariable';
import axios from 'axios';
import { authHeader } from '../../util/authUtil';

function CreateBooking() {
  const handleCreate = async (values) => {
    const endpoint = `${remote_host}/api/v1/${values.travelType === '1' ? 'airport' : 
                     values.travelType === '2' ? 'point-to-point' : 
                     'hourly-charter'}-books`;
    
    const response = await axios.post(endpoint, values, authHeader());
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