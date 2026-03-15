export interface CronField {
  name: string;
  value: string;
  description: string;
}

export interface CronParseResult {
  fields: CronField[];
  description: string;
  nextRuns: Date[];
  error?: string;
}

const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 解析单个字段
const parseField = (field: string, min: number, max: number): number[] => {
  if (field === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  const values: number[] = [];

  // 处理逗号分隔
  const parts = field.split(',');
  for (const part of parts) {
    // 处理步长
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr);

      let start: number, end: number;
      if (range === '*') {
        start = min;
        end = max;
      } else if (range.includes('-')) {
        const [s, e] = range.split('-').map(Number);
        start = s;
        end = e;
      } else {
        start = end = parseInt(range);
      }

      for (let i = start; i <= end; i += step) {
        if (i >= min && i <= max) {
          values.push(i);
        }
      }
    }
    // 处理范围
    else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        if (i >= min && i <= max) {
          values.push(i);
        }
      }
    }
    // 单个值
    else {
      const val = parseInt(part);
      if (val >= min && val <= max) {
        values.push(val);
      }
    }
  }

  return [...new Set(values)].sort((a, b) => a - b);
};

// 验证 cron 表达式
export const validateCron = (expression: string): { valid: boolean; error?: string } => {
  const parts = expression.trim().split(/\s+/);

  if (parts.length < 5 || parts.length > 6) {
    return { valid: false, error: 'Cron 表达式必须包含 5 或 6 个字段' };
  }

  return { valid: true };
};

// 解析 cron 表达式
export const parseCron = (expression: string): CronParseResult => {
  const parts = expression.trim().split(/\s+/);

  if (parts.length < 5 || parts.length > 6) {
    return {
      fields: [],
      description: '',
      nextRuns: [],
      error: 'Cron 表达式必须包含 5 或 6 个字段',
    };
  }

  // 标准 5 字段格式
  const minute = parts[0];
  const hour = parts[1];
  const dayOfMonth = parts[2];
  const month = parts[3];
  const dayOfWeek = parts[4];

  const fieldDescriptions = [
    { name: '分钟', value: minute, min: 0, max: 59 },
    { name: '小时', value: hour, min: 0, max: 23 },
    { name: '日期', value: dayOfMonth, min: 1, max: 31 },
    { name: '月份', value: month, min: 1, max: 12 },
    { name: '星期', value: dayOfWeek, min: 0, max: 6 },
  ];

  const fields: CronField[] = fieldDescriptions.map(f => {
    const parsed = parseField(f.value, f.min, f.max);
    let description = '';

    if (f.value === '*') {
      description = `每${f.name}`;
    } else if (f.value.includes('/')) {
      const step = f.value.split('/')[1];
      description = `每 ${step} ${f.name}`;
    } else if (f.value.includes('-')) {
      description = `${f.name} ${parsed.join(', ')}`;
    } else {
      description = `${f.name} ${parsed.join(', ')}`;
    }

    return {
      name: f.name,
      value: f.value,
      description,
    };
  });

  // 生成人类可读描述
  let description = '';
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    description = '每分钟执行';
  } else if (hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    if (minute.includes('/')) {
      description = `每隔 ${minute.split('/')[1]} 分钟执行`;
    } else {
      description = `每小时的第 ${parseField(minute, 0, 59).join(', ')} 分钟执行`;
    }
  } else if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    description = `每天 ${parseField(hour, 0, 23).join(', ')}:${parseField(minute, 0, 59).map(m => m.toString().padStart(2, '0')).join(', ')} 执行`;
  } else if (month === '*' && dayOfWeek === '*') {
    description = `每月 ${parseField(dayOfMonth, 1, 31).join(', ')} 日 ${parseField(hour, 0, 23).join(', ')}:${parseField(minute, 0, 59).map(m => m.toString().padStart(2, '0')).join(', ')} 执行`;
  } else if (month === '*' && dayOfMonth === '*') {
    const days = parseField(dayOfWeek, 0, 6).map(d => dayNames[d]);
    description = `每${days.join('、')} ${parseField(hour, 0, 23).join(', ')}:${parseField(minute, 0, 59).map(m => m.toString().padStart(2, '0')).join(', ')} 执行`;
  } else {
    description = '自定义时间执行';
  }

  // 计算下次执行时间
  const nextRuns = calculateNextRuns(parts, 5);

  return { fields, description, nextRuns };
};

// 计算下次执行时间
const calculateNextRuns = (parts: string[], count: number): Date[] => {
  const runs: Date[] = [];
  let current = new Date();
  current.setSeconds(0);
  current.setMilliseconds(0);

  const minute = parseField(parts[0], 0, 59);
  const hour = parseField(parts[1], 0, 23);
  const dayOfMonth = parseField(parts[2], 1, 31);
  const month = parseField(parts[3], 1, 12);
  const dayOfWeek = parseField(parts[4], 0, 6);

  // 最多尝试 1000 次找到有效的执行时间
  for (let i = 0; i < 1000 && runs.length < count; i++) {
    current = new Date(current.getTime() + 60000); // 加一分钟

    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    if (
      minute.includes(m) &&
      hour.includes(h) &&
      dayOfMonth.includes(dom) &&
      month.includes(mon) &&
      (dayOfWeek.includes(dow) || parts[4] === '*')
    ) {
      runs.push(new Date(current));
    }
  }

  return runs;
};

// 常用 cron 表达式
export const cronPresets = [
  { expression: '* * * * *', description: '每分钟' },
  { expression: '0 * * * *', description: '每小时' },
  { expression: '0 0 * * *', description: '每天凌晨' },
  { expression: '0 9 * * *', description: '每天上午 9 点' },
  { expression: '0 9 * * 1-5', description: '工作日上午 9 点' },
  { expression: '0 0 * * 0', description: '每周日凌晨' },
  { expression: '0 0 1 * *', description: '每月 1 号凌晨' },
  { expression: '0 0 1 1 *', description: '每年 1 月 1 号凌晨' },
  { expression: '*/5 * * * *', description: '每 5 分钟' },
  { expression: '*/15 * * * *', description: '每 15 分钟' },
  { expression: '*/30 * * * *', description: '每 30 分钟' },
  { expression: '0 */2 * * *', description: '每 2 小时' },
];

// 格式化日期
export const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const dow = dayNames[date.getDay()];

  return `${year}-${month}-${day} ${hour}:${minute} (${dow})`;
};