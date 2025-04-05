import axios from 'axios';
import { remote_host } from '../globalVariable';

export const sendContactEmail = async (formData) => {
  try {
    const response = await axios.post(`${remote_host}/api/v1/email/contact`, formData);
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: 'Failed to send email' };
  }
}; 