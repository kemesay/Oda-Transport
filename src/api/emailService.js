import { BACKEND_API } from '../store/utils/API';

export const sendContactEmail = async (formData) => {
  try {
    const response = await BACKEND_API.post('/api/v1/email/contact', formData);
    return response.data;
  } catch (error) {
    throw error?.response?.data || { message: 'Failed to send email' };
  }
}; 