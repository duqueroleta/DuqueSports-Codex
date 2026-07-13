const CALIBRATION_BUCKET_WIDTH = 10;
const CALIBRATION_BUCKET_COUNT = 100 / CALIBRATION_BUCKET_WIDTH;

function roundMetric(value) {
  return Number(value.toFixed(6));
}

function createBuckets() {
  return Array.from({ length: CALIBRATION_BUCKET_COUNT }, (_, index) => ({
    index,
    minProbability: index * CALIBRATION_BUCKET_WIDTH,
    maxProbability: (index + 1) * CALIBRATION_BUCKET_WIDTH,
    includesUpperBound: index === CALIBRATION_BUCKET_COUNT - 1,
    samples: [],
  }));
}

function getBucketIndex(probability) {
  return Math.min(
    CALIBRATION_BUCKET_COUNT - 1,
    Math.floor(probability / CALIBRATION_BUCKET_WIDTH),
  );
}

function summarizeCalibrationSamples(samples) {
  const normalizedSamples = Array.isArray(samples) ? samples : [];
  const buckets = createBuckets();

  normalizedSamples.forEach((sample) => {
    buckets[getBucketIndex(sample.probability)].samples.push(sample);
  });

  const summarizedBuckets = buckets.map((bucket) => {
    if (bucket.samples.length === 0) {
      return {
        ...bucket,
        samples: 0,
        meanProbability: null,
        observedRate: null,
        calibrationGap: null,
        absoluteGap: null,
      };
    }

    const count = bucket.samples.length;
    const meanProbability = bucket.samples.reduce((total, sample) => total + sample.probability, 0) / count;
    const observedRate = bucket.samples.filter((sample) => sample.observed).length / count * 100;
    const calibrationGap = observedRate - meanProbability;

    return {
      ...bucket,
      samples: count,
      meanProbability: roundMetric(meanProbability),
      observedRate: roundMetric(observedRate),
      calibrationGap: roundMetric(calibrationGap),
      absoluteGap: roundMetric(Math.abs(calibrationGap)),
    };
  });
  const populatedBuckets = summarizedBuckets.filter((bucket) => bucket.samples > 0);
  const total = normalizedSamples.length;
  const expectedCalibrationError = total === 0
    ? null
    : populatedBuckets.reduce((sum, bucket) => sum + (bucket.samples / total * bucket.absoluteGap), 0);
  const maximumCalibrationError = populatedBuckets.length === 0
    ? null
    : Math.max(...populatedBuckets.map((bucket) => bucket.absoluteGap));
  const brierScore = total === 0
    ? null
    : normalizedSamples.reduce((sum, sample) => {
      const probability = sample.probability / 100;
      const observed = sample.observed ? 1 : 0;
      return sum + ((probability - observed) ** 2);
    }, 0) / total;

  return {
    samples: total,
    expectedCalibrationError: expectedCalibrationError === null ? null : roundMetric(expectedCalibrationError),
    maximumCalibrationError: maximumCalibrationError === null ? null : roundMetric(maximumCalibrationError),
    brierScore: brierScore === null ? null : roundMetric(brierScore),
    buckets: summarizedBuckets,
  };
}

export {
  CALIBRATION_BUCKET_COUNT,
  CALIBRATION_BUCKET_WIDTH,
  getBucketIndex,
  summarizeCalibrationSamples,
};
