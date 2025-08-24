import CryptoJS from "crypto-js";
import config from '../config';

const encrypt = (payload) => {
  try {
    const secretKey = config.REACT_APP_SECRET_KEY;
    const iv = config.REACT_APP_IV;
    
    if (!secretKey || !iv) {
      console.error('Missing encryption keys:', { 
        hasSecretKey: !!secretKey, 
        hasIV: !!iv 
      });
      throw new Error('Encryption configuration missing');
    }
    
    const derived_key = CryptoJS.enc.Base64.parse(secretKey);
    const iv_parsed = CryptoJS.enc.Utf8.parse(iv);
    
    const encryptionOptions = {
      iv: iv_parsed,
      mode: CryptoJS.mode.CBC,
    };

    const encrypted = CryptoJS.AES.encrypt(
      payload,
      derived_key,
      encryptionOptions
    ).toString();

    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export default encrypt;
