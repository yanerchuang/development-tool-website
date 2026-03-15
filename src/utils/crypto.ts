import CryptoJS from 'crypto-js';

// MD5 哈希
export const md5Hash = (text: string): string => {
  return CryptoJS.MD5(text).toString();
};

// SHA-1 哈希
export const sha1Hash = (text: string): string => {
  return CryptoJS.SHA1(text).toString();
};

// SHA-224 哈希
export const sha224Hash = (text: string): string => {
  return CryptoJS.SHA224(text).toString();
};

// SHA-256 哈希
export const sha256Hash = (text: string): string => {
  return CryptoJS.SHA256(text).toString();
};

// SHA-384 哈希
export const sha384Hash = (text: string): string => {
  return CryptoJS.SHA384(text).toString();
};

// SHA-512 哈希
export const sha512Hash = (text: string): string => {
  return CryptoJS.SHA512(text).toString();
};

// RIPEMD-160 哈希
export const ripemd160Hash = (text: string): string => {
  return CryptoJS.RIPEMD160(text).toString();
};

// 计算所有哈希
export const computeAllHashes = (text: string): Record<string, string> => {
  return {
    MD5: md5Hash(text),
    'SHA-1': sha1Hash(text),
    'SHA-224': sha224Hash(text),
    'SHA-256': sha256Hash(text),
    'SHA-384': sha384Hash(text),
    'SHA-512': sha512Hash(text),
    'RIPEMD-160': ripemd160Hash(text),
  };
};

// 文件哈希计算
export const fileHash = async (file: File): Promise<Record<string, string>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wordArray = CryptoJS.lib.WordArray.create(e.target?.result as ArrayBuffer);
        resolve({
          MD5: CryptoJS.MD5(wordArray).toString(),
          'SHA-1': CryptoJS.SHA1(wordArray).toString(),
          'SHA-256': CryptoJS.SHA256(wordArray).toString(),
          'SHA-512': CryptoJS.SHA512(wordArray).toString(),
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// AES 加密
export const aesEncrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

// AES 解密
export const aesDecrypt = (encryptedText: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '解密失败：密钥错误或数据损坏';
  }
};

// Base64 编码
export const base64Encode = (text: string): string => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

// Base64 解码
export const base64Decode = (encoded: string): string => {
  try {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encoded));
  } catch {
    return '解码失败：无效的Base64字符串';
  }
};

// JWT 解码
export const decodeJwt = (token: string): { header: unknown; payload: unknown; error?: string } => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { header: null, payload: null, error: '无效的JWT格式' };
    }
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    return { header, payload };
  } catch {
    return { header: null, payload: null, error: 'JWT解码失败' };
  }
};

// 生成随机密钥
export const generateRandomKey = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};