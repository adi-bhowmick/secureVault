import labService from '../services/labService.js';
import userRepository from '../repositories/userRepository.js';

const listLabs = (req, res) => {
  const labs = labService.listLabs();
  return res.json({ success: true, data: { labs } });
};

const getLab = (req, res) => {
  const { slug } = req.params;
  const lab = labService.getLab(slug);
  if (!lab) {
    return res.status(404).json({ success: false, message: 'Lab not found' });
  }
  return res.json({ success: true, data: { lab } });
};

const submitFlag = async (req, res) => {
  try {
    const { slug } = req.params;
    const { flag, timeTaken } = req.body;

    if (!flag) {
      return res.status(400).json({ success: false, message: 'Flag is required' });
    }

    const result = await labService.submitFlag(req.user.id, slug, flag, timeTaken);

    if (result.valid) {
      const user = await userRepository.findById(req.user.id);
      return res.json({
        success: true,
        message: 'Correct! Points awarded.',
        data: { points: result.points, lab: result.lab, user },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Incorrect flag. Try again.',
      data: { lab: result.lab },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export default { listLabs, getLab, submitFlag };
