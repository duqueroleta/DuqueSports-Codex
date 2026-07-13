function createRequestTracker() {
  let active = 0;
  let totalStarted = 0;

  function getSnapshot() {
    return Object.freeze({ active, totalStarted });
  }

  function track(handler) {
    return (request, response) => {
      let released = false;
      active += 1;
      totalStarted += 1;

      function release() {
        if (released) {
          return;
        }

        released = true;
        active = Math.max(0, active - 1);
        response.off('finish', release);
        response.off('close', release);
      }

      response.once('finish', release);
      response.once('close', release);

      try {
        handler(request, response);
      } catch (error) {
        release();
        throw error;
      }
    };
  }

  return Object.freeze({ getSnapshot, track });
}

export { createRequestTracker };
