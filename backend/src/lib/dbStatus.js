let isDbDown = false;
let lastDbCheck = 0;
const RETRY_INTERVAL_MS = 60000; // Check DB availability once every 60s if down

const dbStatus = {
  shouldTryDb() {
    if (!isDbDown) return true;
    if (Date.now() - lastDbCheck > RETRY_INTERVAL_MS) {
      return true;
    }
    return false;
  },
  markDbDown() {
    isDbDown = true;
    lastDbCheck = Date.now();
  },
  markDbUp() {
    isDbDown = false;
  },
  isDown() {
    return isDbDown;
  },
};

module.exports = dbStatus;
