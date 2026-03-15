// URL 编码/解码
export const urlEncode = (str: string): string => {
  return encodeURIComponent(str);
};

export const urlDecode = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch {
    return '解码失败：无效的URL编码';
  }
};

// HTML 实体编码/解码
export const htmlEncode = (str: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char);
};

export const htmlDecode = (str: string): string => {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || '';
};

// Unicode 编码/解码
export const unicodeEncode = (str: string): string => {
  return str.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code > 127) {
      return '\\u' + code.toString(16).padStart(4, '0');
    }
    return char;
  }).join('');
};

export const unicodeDecode = (str: string): string => {
  try {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
  } catch {
    return '解码失败：无效的Unicode编码';
  }
};

// 字符串转义/反转义
export const escapeString = (str: string): string => {
  return JSON.stringify(str);
};

export const unescapeString = (str: string): string => {
  try {
    return JSON.parse(str);
  } catch {
    return '反转义失败：无效的字符串格式';
  }
};

// Base64 编码/解码（简单版本，用于文本）
export const textToBase64 = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return '编码失败';
  }
};

export const base64ToText = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '解码失败：无效的Base64字符串';
  }
};