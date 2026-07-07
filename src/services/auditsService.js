import { audits } from '../data/audits.js';
import { mockRequest } from './mockApi.js';

function getAudits() {
  return mockRequest('audits', audits);
}

export { getAudits };
