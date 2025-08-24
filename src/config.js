// Function to get environment variable value
const getEnvVar = (key, defaultValue = '') => {
  // First try runtime environment variables (window._env_)
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  
  // Then try build-time environment variables (process.env)
  if (process.env[key]) {
    return process.env[key];
  }
  
  // Finally return default value
  return defaultValue;
};

const config = {
    REACT_APP_BASEURL: getEnvVar('REACT_APP_BASEURL', 'https://api.greenvy.store'),
    REACT_APP_EMAILJS_SERVICE_ID: getEnvVar('REACT_APP_EMAILJS_SERVICE_ID'),
    REACT_APP_EMAILJS_TEMPLATE_ID: getEnvVar('REACT_APP_EMAILJS_TEMPLATE_ID'),
    REACT_APP_EMAILJS_USER_ID: getEnvVar('REACT_APP_EMAILJS_USER_ID'),
    RZRPAY_KEYID: getEnvVar('RZRPAY_KEYID'),
    REACT_APP_SECRET_KEY: getEnvVar('REACT_APP_SECRET_KEY'),
    REACT_APP_IV: getEnvVar('REACT_APP_IV'),
};

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
    console.log('Config loaded:', {
        REACT_APP_BASEURL: config.REACT_APP_BASEURL,
        hasSecretKey: !!config.REACT_APP_SECRET_KEY,
        hasIV: !!config.REACT_APP_IV
    });
}

export default config;
  