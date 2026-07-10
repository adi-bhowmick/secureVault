import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LABS_DIR = path.resolve(__dirname, '../../labs');

const labCache = new Map();

const loadLab = (slug) => {
  const labDir = path.join(LABS_DIR, slug);

  if (!fs.existsSync(labDir)) return null;

  const configPath = path.join(labDir, 'config.json');
  if (!fs.existsSync(configPath)) return null;

  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw);

  let explanation = '';
  let solution = '';
  let flag = '';

  const explanationPath = path.join(labDir, 'explanation.md');
  if (fs.existsSync(explanationPath)) {
    explanation = fs.readFileSync(explanationPath, 'utf-8');
  }

  const solutionPath = path.join(labDir, 'solution.md');
  if (fs.existsSync(solutionPath)) {
    solution = fs.readFileSync(solutionPath, 'utf-8');
  }

  const flagPath = path.join(labDir, 'flag.txt');
  if (fs.existsSync(flagPath)) {
    flag = fs.readFileSync(flagPath, 'utf-8').trim();
  }

  return { slug, config, explanation, solution, flag };
};

const loadAllLabs = () => {
  labCache.clear();

  if (!fs.existsSync(LABS_DIR)) {
    fs.mkdirSync(LABS_DIR, { recursive: true });
  }

  const entries = fs.readdirSync(LABS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const lab = loadLab(entry.name);
      if (lab) {
        labCache.set(entry.name, lab);
      }
    }
  }

  return labCache;
};

const getLab = (slug) => {
  if (labCache.has(slug)) return labCache.get(slug);
  const lab = loadLab(slug);
  if (lab) labCache.set(slug, lab);
  return lab;
};

const getLabSummaries = () => {
  const summaries = [];
  for (const [slug, lab] of labCache) {
    summaries.push({
      slug,
      name: lab.config.name,
      description: lab.config.description,
      difficulty: lab.config.difficulty,
      category: lab.config.category,
      points: lab.config.points,
    });
  }
  return summaries;
};

const verifyFlag = (slug, submittedFlag) => {
  const lab = labCache.get(slug);
  if (!lab) return { valid: false, reason: 'Lab not found' };
  if (!lab.flag) return { valid: false, reason: 'No flag configured' };

  const clean = submittedFlag.trim();
  if (clean === lab.flag) {
    return { valid: true, points: lab.config.points || 100 };
  }
  return { valid: false, points: 0 };
};

export default { loadAllLabs, getLab, getLabSummaries, verifyFlag };
