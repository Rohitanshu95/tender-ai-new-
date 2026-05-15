import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const logActivity = async (type, tenderId, message, details = {}) => {
  try {
    await axios.post(`${API_BASE_URL}/analytics/activity`, {
      type,
      tenderId,
      message,
      details
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
