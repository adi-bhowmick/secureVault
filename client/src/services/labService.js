import api from './api.js';

const labService = {
  listLabs: () => api.get('/labs'),
  getLab: (slug) => api.get(`/labs/${slug}`),
  submitFlag: (slug, flag, timeTaken) =>
    api.post(`/labs/${slug}/submit`, { flag, timeTaken }),
};

export default labService;
