import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 获取当前时间戳
export const getCurrentTimestamp = (): { seconds: number; milliseconds: number } => {
  return {
    seconds: Math.floor(Date.now() / 1000),
    milliseconds: Date.now(),
  };
};

// 时间戳转日期
export const timestampToDate = (timestamp: number, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
  return dayjs(ts).format(format);
};

// 日期转时间戳
export const dateToTimestamp = (dateStr: string): { seconds: number; milliseconds: number } | null => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;
  return {
    seconds: date.unix(),
    milliseconds: date.valueOf(),
  };
};

// 获取时区列表
export const getTimezones = (): string[] => {
  return [
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Asia/Dubai',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];
};

// 时区转换
export const convertTimezone = (
  date: string | Date,
  fromTz: string,
  toTz: string,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  return dayjs(date).tz(fromTz).tz(toTz).format(format);
};

// 相对时间
export const getRelativeTime = (date: string | Date): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 30) return `${diffDays} 天前`;
  return target.format('YYYY-MM-DD');
};

// 格式化持续时间
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天 ${hours % 24}时 ${minutes % 60}分`;
  if (hours > 0) return `${hours}时 ${minutes % 60}分 ${seconds % 60}秒`;
  if (minutes > 0) return `${minutes}分 ${seconds % 60}秒`;
  return `${seconds}秒`;
};