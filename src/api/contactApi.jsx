
import axios from 'axios';

const API_BASE_URL = 'https://liftakids.koyeb.app/LiftAKids/api';

// Admin Contact Management APIs
export const getContactMessages = async (page = 0, size = 10, sortBy = 'submittedAt', sortDir = 'desc') => {
  const response = await axios.get(`${API_BASE_URL}/contact/messages`, {
    params: { page, size, sortBy, sortDir }
  });
  return response.data;
};

export const getUnreadMessages = async () => {
  const response = await axios.get(`${API_BASE_URL}/contact/messages/unread`);
  return response.data;
};

export const getMessageById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/contact/messages/${id}`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/contact/messages/${id}/read`);
  return response.data;
};

export const markAsUnread = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/contact/messages/${id}/unread`);
  return response.data;
};

export const replyToMessage = async (id, replyData) => {
  const response = await axios.post(`${API_BASE_URL}/contact/messages/${id}/reply`, replyData);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/contact/messages/${id}`);
  return response.data;
};

export const getContactStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/contact/messages/stats`);
  return response.data;
};

export const bulkMarkAsRead = async (messageIds) => {
  const response = await axios.post(`${API_BASE_URL}/contact/messages/bulk-read`, messageIds);
  return response.data;
};

export const sendCustomEmail = async (emailData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/email/send`, emailData);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendEmailToContact = async (contactId, emailData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/email/send-to-contact/${contactId}`, emailData);
    return response.data;
  } catch (error) {
    console.error('Error sending email to contact:', error);
    throw error;
  }
};
export const getSentEmails = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/sent-emails`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    throw error;
  }
};

export const getSentEmailStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/sent-emails/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent email stats:', error);
    throw error;
  }
};

export const getSentEmailsByRecipient = async (email) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/sent-emails/recipient/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent emails by recipient:', error);
    throw error;
  }
};