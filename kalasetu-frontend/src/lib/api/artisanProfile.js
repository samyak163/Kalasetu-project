import api from '../axios';

export const getArtisanProfile = async () => {
  const { data } = await api.get('/api/artisan/profile');
  return data.data ?? data;
};

export const updateArtisanProfile = async (payload) => {
  const { data } = await api.put('/api/artisan/profile', payload);
  return data.data ?? data;
};

export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/api/artisan/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.data ?? data;
};

export const deleteProfilePhoto = async () => {
  const { data } = await api.delete('/api/artisan/profile/photo');
  return data.data ?? data;
};

export const updateDocuments = async (payload) => {
  const { data } = await api.put('/api/artisan/profile/documents', payload);
  return data.data ?? data;
};

export const getVerificationStatus = async () => {
  const { data } = await api.get('/api/artisan/profile/verification-status');
  return data.data ?? data;
};

export const updateBankDetails = async (payload) => {
  const { data } = await api.put('/api/artisan/profile/bank', payload);
  return data.data ?? data;
};

export const uploadVerificationDocument = async (file, type) => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post(`/api/artisan/profile/documents/upload?type=${encodeURIComponent(type)}` , fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data.data ?? data;
};

export const setSlug = async (slug) => {
  const { data } = await api.put('/api/artisan/profile/slug', { slug });
  return data.data ?? data;
};

export const initiateEmailChange = async (newEmail) => {
  const { data } = await api.post('/api/artisan/profile/verify/email/initiate', { newEmail });
  return data;
};

export const confirmEmailChange = async (code) => {
  const { data } = await api.post('/api/artisan/profile/verify/email/confirm', { code });
  return data;
};

export default {
  getArtisanProfile,
  updateArtisanProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateDocuments,
  getVerificationStatus,
  updateBankDetails,
  uploadVerificationDocument,
  setSlug,
  initiateEmailChange,
  confirmEmailChange,
};
