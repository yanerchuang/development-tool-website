export interface PasswordOptions {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customChars?: string;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;:.<>';

// 生成密码
export const generatePassword = (options: PasswordOptions): string => {
  let chars = '';
  let requiredChars = '';

  if (options.includeLowercase) {
    let lower = LOWERCASE;
    if (options.excludeSimilar) {
      lower = lower.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
    }
    chars += lower;
    requiredChars += lower[Math.floor(Math.random() * lower.length)];
  }

  if (options.includeUppercase) {
    let upper = UPPERCASE;
    if (options.excludeSimilar) {
      upper = upper.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
    }
    chars += upper;
    requiredChars += upper[Math.floor(Math.random() * upper.length)];
  }

  if (options.includeNumbers) {
    let numbers = NUMBERS;
    if (options.excludeSimilar) {
      numbers = numbers.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
    }
    chars += numbers;
    requiredChars += numbers[Math.floor(Math.random() * numbers.length)];
  }

  if (options.includeSymbols) {
    let symbols = SYMBOLS;
    if (options.excludeAmbiguous) {
      symbols = symbols.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('');
    }
    chars += symbols;
    requiredChars += symbols[Math.floor(Math.random() * symbols.length)];
  }

  if (options.customChars) {
    chars = options.customChars;
    requiredChars = '';
  }

  if (!chars) {
    chars = LOWERCASE + NUMBERS;
  }

  // 生成剩余字符
  let password = '';
  const remainingLength = Math.max(0, options.length - requiredChars.length);

  // 使用 crypto.getRandomValues 生成更安全的随机数
  const randomValues = new Uint32Array(remainingLength);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < remainingLength; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  // 插入必需字符
  for (const char of requiredChars) {
    const pos = Math.floor(Math.random() * (password.length + 1));
    password = password.slice(0, pos) + char + password.slice(pos);
  }

  return password.slice(0, options.length);
};

// 批量生成密码
export const generatePasswords = (count: number, options: PasswordOptions): string[] => {
  return Array.from({ length: count }, () => generatePassword(options));
};

// 计算密码强度
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  // 长度评分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // 字符类型评分
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // 重复字符惩罚
  const uniqueChars = new Set(password).size;
  if (uniqueChars < password.length * 0.5) score -= 1;

  // 连续字符惩罚
  if (/(.)\1{2,}/.test(password)) score -= 1;

  // 限制分数范围
  score = Math.max(0, Math.min(5, score));

  const levels = [
    { label: '很弱', color: '#fa5252' },
    { label: '弱', color: '#fab005' },
    { label: '一般', color: '#fd7e14' },
    { label: '强', color: '#40c057' },
    { label: '很强', color: '#12b886' },
    { label: '极强', color: '#0ca678' },
  ];

  return {
    score,
    ...levels[score],
  };
};

// 生成易记密码（ passphrase ）
export const generatePassphrase = (wordCount: number = 4, separator: string = '-'): string => {
  const words = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'harbor',
    'island', 'jungle', 'knight', 'lemon', 'mountain', 'nature', 'ocean', 'palace',
    'queen', 'river', 'sunset', 'thunder', 'umbrella', 'valley', 'water', 'xenon',
    'yellow', 'zebra', 'bridge', 'cloud', 'diamond', 'emerald', 'flower', 'golden',
    'horizon', 'jade', 'karma', 'lunar', 'mystic', 'nova', 'orchid', 'phoenix',
    'quartz', 'royal', 'silver', 'tiger', 'ultra', 'vivid', 'wisdom', 'crystal',
  ];

  const randomValues = new Uint32Array(wordCount);
  crypto.getRandomValues(randomValues);

  const selectedWords = [];
  for (let i = 0; i < wordCount; i++) {
    selectedWords.push(words[randomValues[i] % words.length]);
  }

  return selectedWords.join(separator);
};