import { markets } from '../data/markets.js';
import { mockRequest } from './mockApi.js';

function getMarkets() {
  return mockRequest('markets', markets);
}

function getMarketById(id) {
  return mockRequest('markets', markets.find((market) => market.id === Number(id)));
}

export { getMarketById, getMarkets };
