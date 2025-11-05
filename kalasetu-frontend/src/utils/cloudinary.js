export const optimizeImage = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';
  const { width = 400, height = 400, crop = 'fill', quality = 'auto', format = 'auto' } = options;
  if (!url.includes('/upload/')) return url;
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/`
  );
};


