// src/apiService.js


// Helper function to handle token storage and refresh
let accessToken = null;
let refreshToken = null;

const setTokens = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  localStorage.setItem('refreshToken', newRefreshToken);
};

const getRefreshToken = () => localStorage.getItem('refreshToken');


export const refreshAccessToken = async () => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: currentRefreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  return data;
};

// Example of how to use the access token
export const fetchProtectedData = async () => {
  try {
    const response = await fetch(`${API_URL}/protected`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Access token might be expired, try to refresh
      await refreshAccessToken();
      // Retry the request with the new access token
      return fetchProtectedData();
    }

    return response.json();

  } catch (error) {
    console.error('Error fetching protected data:', error);
  }
};
