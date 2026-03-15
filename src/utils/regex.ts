// 常用正则表达式模板
export const regexTemplates = [
  { name: '邮箱', pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, example: 'test@example.com' },
  { name: '手机号（中国）', pattern: /^1[3-9]\d{9}$/, example: '13812345678' },
  { name: 'URL', pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/, example: 'https://example.com/path' },
  { name: 'IPv4 地址', pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, example: '192.168.1.1' },
  { name: '身份证号（中国）', pattern: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, example: '110101199001011234' },
  { name: '日期 (YYYY-MM-DD)', pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, example: '2024-01-15' },
  { name: '时间 (HH:MM:SS)', pattern: /^([01]?\d|2[0-3]):[0-5]\d:[0-5]\d$/, example: '14:30:00' },
  { name: '十六进制颜色', pattern: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, example: '#FF5733' },
  { name: '用户名 (字母开头)', pattern: /^[a-zA-Z][a-zA-Z0-9_-]{2,15}$/, example: 'john_doe' },
  { name: '密码 (8位以上含数字字母)', pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, example: 'Password123' },
  { name: '中文字符', pattern: /^[\u4e00-\u9fa5]+$/, example: '中文测试' },
  { name: '数字', pattern: /^-?\d+(\.\d+)?$/, example: '123.45' },
  { name: '正整数', pattern: /^[1-9]\d*$/, example: '123' },
  { name: 'UUID', pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, example: '550e8400-e29b-41d4-a716-446655440000' },
  { name: 'HTML 标签', pattern: /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/gi, example: '<div class="test">content</div>' },
];

// 测试正则表达式
export interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups?: Record<string, string>;
}

export const testRegex = (
  pattern: string,
  text: string,
  flags: string = 'g'
): { matches: RegexMatch[]; error?: string } => {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (flags.includes('g')) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups: match.groups,
        });
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        matches.push({
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups: match.groups,
        });
      }
    }

    return { matches };
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
};

// 转义正则特殊字符
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 验证正则表达式语法
export const isValidRegex = (pattern: string): { valid: boolean; error?: string } => {
  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
};