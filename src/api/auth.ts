import client from './client';

export const login = async (email: string, password: string) => {
  const { data } = await client.post('/auth/login', { email, password });
  return data; // { token, user }
};

export const getMe = async () => {
  const { data } = await client.get('/auth/me');
  return data; // user object
};

export const logout = async () => {
  try { await client.post('/auth/logout'); } catch {}
};

export const updateProfile = async (data: { displayName?: string; avatarUrl?: string; bio?: string }) => {
  const { data: res } = await client.patch('/auth/profile', data);
  return res.user ?? res;
};

export const register = async (payload: {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: string;
}) => {
  const { data } = await client.post('/auth/register', payload);
  return data; // { token, user }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  await client.post('/auth/change-password', { currentPassword, newPassword });
};

export const deleteAccount = async (password: string) => {
  await client.delete('/auth/account', { data: { password } });
};
