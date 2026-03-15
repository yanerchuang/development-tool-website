// 生成 UUID v4
export const generateUuidV4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 生成 UUID v1 (模拟版本，基于时间戳)
export const generateUuidV1 = (): string => {
  const now = Date.now();
  const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0');
  const timeHi = ((now >> 48) & 0x0fff).toString(16).padStart(4, '0');
  const clockSeq = Math.floor(Math.random() * 0x3fff).toString(16).padStart(4, '0');
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');

  return `${timeLow}-${timeMid}-1${timeHi.slice(1)}-${clockSeq}-${node}`;
};

// 批量生成 UUID
export const generateUuids = (count: number, version: 'v1' | 'v4' = 'v4'): string[] => {
  const generator = version === 'v1' ? generateUuidV1 : generateUuidV4;
  return Array.from({ length: count }, () => generator());
};

// 生成短 UUID (无连字符)
export const generateShortUuid = (): string => {
  return generateUuidV4().replace(/-/g, '');
};

// 验证 UUID 格式
export const isValidUuid = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};