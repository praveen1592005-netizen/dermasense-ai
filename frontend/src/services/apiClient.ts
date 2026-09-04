import { supabase } from './supabaseClient';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

const handleResponse = async (response: Response, endpoint: string) => {
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
    // Session expired or unauthorized
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) {
    let errorMsg = `API error: ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody.detail) {
        errorMsg = typeof errBody.detail === 'string' ? errBody.detail : errBody.detail[0]?.msg || errorMsg;
      } else if (errBody.message) {
        errorMsg = errBody.message;
      }
    } catch (e) {
      // Ignore if not JSON
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

const getHeaders = async (customHeaders: any = {}) => {
  const token = await getAuthToken();
  const headers: any = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  async get(endpoint: string, headers = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(await getHeaders(headers)),
      },
    });
    return handleResponse(response, endpoint);
  },
  
  async post(endpoint: string, body: any, headers = {}) {
    const isFormData = body instanceof FormData;
    
    const requestHeaders: any = await getHeaders(headers);
    if (!isFormData) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: requestHeaders,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response, endpoint);
  },

  async put(endpoint: string, body: any, headers = {}) {
    const isFormData = body instanceof FormData;
    
    const requestHeaders: any = await getHeaders(headers);
    if (!isFormData) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: requestHeaders,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(response, endpoint);
  },

  async delete(endpoint: string, headers = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(await getHeaders(headers)),
      },
    });
    return handleResponse(response, endpoint);
  }
};
