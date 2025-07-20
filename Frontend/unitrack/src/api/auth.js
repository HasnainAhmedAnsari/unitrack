import api from './axios';

export const loginUser = async ({ id, password, role }) => {
  return api.post('/auth/login', { id, password, role });
};