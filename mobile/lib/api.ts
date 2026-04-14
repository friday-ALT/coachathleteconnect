import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Add auth token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Helper functions
export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  googleLogin: async (data: { idToken?: string; email: string; firstName: string; lastName: string; googleId: string; photoUrl?: string }) => {
    const response = await api.post('/api/auth/google', data);
    return response.data;
  },
  
  demoLogin: async () => {
    const response = await api.post('/api/auth/demo-login');
    return response.data;
  },
  
  signup: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  getUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  
  resendVerification: async (email: string) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  },
};

export const profileApi = {
  createAthleteProfile: async (data: any) => {
    const response = await api.post('/api/profiles/athlete', data);
    return response.data;
  },
  
  createCoachProfile: async (data: any) => {
    const response = await api.post('/api/profiles/coach', data);
    return response.data;
  },
  
  getAthleteProfile: async () => {
    const response = await api.get('/api/profiles/athlete');
    return response.data;
  },
  
  getCoachProfile: async () => {
    const response = await api.get('/api/profiles/coach');
    return response.data;
  },
  
  updateAthleteProfile: async (data: any) => {
    const response = await api.put('/api/profiles/athlete', data);
    return response.data;
  },
  
  updateCoachProfile: async (data: any) => {
    const response = await api.put('/api/profiles/coach', data);
    return response.data;
  },
};

export const sessionApi = {
  getSession: async () => {
    const response = await api.get('/api/auth/session');
    return response.data;
  },
  
  enterRole: async (role: 'athlete' | 'coach') => {
    const response = await api.post('/api/auth/enter-role', { role });
    return response.data;
  },
  
  exitRole: async () => {
    const response = await api.post('/api/auth/exit-role');
    return response.data;
  },
};

export const coachApi = {
  searchCoaches: async (params: { q?: string; skillLevel?: string; groupSize?: string }) => {
    const response = await api.get('/api/coaches', { params });
    return response.data;
  },
  
  getCoach: async (coachId: string) => {
    const response = await api.get(`/api/coaches/${coachId}`);
    return response.data;
  },
  
  getCoachSchedule30Days: async (coachId: string) => {
    const response = await api.get(`/api/coaches/${coachId}/schedule-30days`);
    return response.data;
  },
};

export const connectionApi = {
  createConnection: async (coachId: string) => {
    const response = await api.post('/api/connections', { coachId });
    return response.data;
  },
  
  getConnections: async (role: 'athlete' | 'coach') => {
    const response = await api.get('/api/connections', { params: { role } });
    return response.data;
  },
  
  checkConnection: async (coachId: string) => {
    const response = await api.get(`/api/connections/check/${coachId}`);
    return response.data;
  },
  
  updateConnection: async (id: string, status: string) => {
    const response = await api.patch(`/api/connections/${id}`, { status });
    return response.data;
  },
};

export const requestApi = {
  createRequest: async (data: any) => {
    const response = await api.post('/api/requests', data);
    return response.data;
  },
  
  getRequests: async (role: 'athlete' | 'coach') => {
    const response = await api.get('/api/requests', { params: { role } });
    return response.data;
  },
  
  updateRequest: async (id: string, status: string) => {
    const response = await api.patch(`/api/requests/${id}`, { status });
    return response.data;
  },

  cancelRequest: async (id: string) => {
    const response = await api.delete(`/api/requests/${id}`);
    return response.data;
  },
};

export const availabilityApi = {
  getRules: async (coachId: string) => {
    const response = await api.get(`/api/availability/${coachId}/rules`);
    return response.data;
  },

  setRules: async (rules: any[]) => {
    const response = await api.put('/api/availability/rules', { rules });
    return response.data;
  },
};

export const sessionBookingApi = {
  bookSession: async (data: any) => {
    const response = await api.post('/api/sessions', data);
    return response.data;
  },
};

export const reviewApi = {
  createReview: async (coachId: string, rating: number, comment?: string) => {
    const response = await api.post('/api/reviews', { coachId, rating, comment });
    return response.data;
  },
  
  getCoachReviews: async (coachId: string) => {
    const response = await api.get(`/api/reviews/coach/${coachId}`);
    return response.data;
  },
  
  getMyReviews: async () => {
    const response = await api.get('/api/reviews/my-reviews');
    return response.data;
  },
  
  getAcceptedCoaches: async () => {
    const response = await api.get('/api/reviews/accepted-coaches');
    return response.data;
  },

  getPendingReviews: async () => {
    const response = await api.get('/api/reviews/pending');
    return response.data;
  },
};

export const paymentApi = {
  createCheckout: async (data: {
    coachId: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime?: string;
    durationMins: number;
    message?: string;
  }) => {
    const response = await api.post('/api/payments/create-checkout', data);
    return response.data; // { url, checkoutSessionId }
  },

  checkoutStatus: async (sessionId: string) => {
    const response = await api.get(`/api/payments/checkout-status/${sessionId}`);
    return response.data; // { status: 'paid' | 'unpaid' | 'no_payment_required', requestId? }
  },

  getCoachStripeStatus: async () => {
    const response = await api.get('/api/payments/coach/status');
    return response.data;
  },

  startCoachOnboarding: async () => {
    const response = await api.post('/api/payments/coach/onboard');
    return response.data; // { url }
  },

  getTransactions: async () => {
    const response = await api.get('/api/payments/transactions');
    return response.data;
  },
};
