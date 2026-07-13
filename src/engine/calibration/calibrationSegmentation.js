import { HISTORICAL_DATASET_PARTITIONS } from '../datasets/historicalDatasetValidation.js';
import { summarizeCalibrationSamples } from './calibrationMetrics.js';

const MINIMUM_CALIBRATION_SAMPLES = 30;

function summarizeWithAdequacy(samples) {
  const metrics = summarizeCalibrationSamples(samples);

  return {
    assessment: metrics.samples >= MINIMUM_CALIBRATION_SAMPLES
      ? 'eligible'
      : 'insufficient-sample',
    minimumSamples: MINIMUM_CALIBRATION_SAMPLES,
    metrics,
  };
}

function buildMarketCalibrationSegments(samples, marketTypes) {
  return Object.fromEntries(marketTypes.map((marketType) => {
    const marketSamples = samples.filter((sample) => sample.marketType === marketType);

    return [marketType, {
      marketType,
      overall: summarizeWithAdequacy(marketSamples),
      partitions: Object.fromEntries(HISTORICAL_DATASET_PARTITIONS.map((partition) => [
        partition,
        summarizeWithAdequacy(marketSamples.filter((sample) => sample.partition === partition)),
      ])),
    }];
  }));
}

export {
  MINIMUM_CALIBRATION_SAMPLES,
  buildMarketCalibrationSegments,
  summarizeWithAdequacy,
};
