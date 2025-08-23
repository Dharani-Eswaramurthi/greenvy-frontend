const config = {
    REACT_APP_BASEURL: window._env_?.REACT_APP_BASEURL || "https://api.greenvy.store",
    REACT_APP_EMAILJS_SERVICE_ID: window._env_?.REACT_APP_EMAILJS_SERVICE_ID,
    REACT_APP_EMAILJS_TEMPLATE_ID: window._env_?.REACT_APP_EMAILJS_TEMPLATE_ID,
    REACT_APP_EMAILJS_USER_ID: window._env_?.REACT_APP_EMAILJS_USER_ID,
    RZRPAY_KEYID: window._env_?.RZRPAY_KEYID,
    REACT_APP_SECRET_KEY: window._env_?.REACT_APP_SECRET_KEY,
    REACT_APP_IV: window._env_?.REACT_APP_IV,
  };
  
  export default config;
  