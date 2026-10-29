import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 10000,
  headers: {
    'User-Agent': 'PlacesTravelPlannerApp/1.0',
    Accept: 'application/json',
  },
});
