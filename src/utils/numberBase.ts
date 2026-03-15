// 进制转换
export interface NumberBase {
  name: string;
  base: number;
  prefix?: string;
}

export const numberBases: NumberBase[] = [
  { name: '二进制', base: 2, prefix: '0b' },
  { name: '八进制', base: 8, prefix: '0o' },
  { name: '十进制', base: 10 },
  { name: '十六进制', base: 16, prefix: '0x' },
];

// 将数字从任意进制转换为十进制
export const toDecimal = (value: string, fromBase: number): string => {
  try {
    // 处理前缀
    let cleanValue = value.trim().toLowerCase();
    if (fromBase === 2 && cleanValue.startsWith('0b')) {
      cleanValue = cleanValue.slice(2);
    } else if (fromBase === 8 && cleanValue.startsWith('0o')) {
      cleanValue = cleanValue.slice(2);
    } else if (fromBase === 16 && cleanValue.startsWith('0x')) {
      cleanValue = cleanValue.slice(2);
    }

    // 验证字符有效性
    const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, fromBase);
    for (const char of cleanValue) {
      if (!validChars.includes(char)) {
        return `错误：无效字符 "${char}" 对于 ${fromBase} 进制`;
      }
    }

    const decimal = parseInt(cleanValue, fromBase);
    if (isNaN(decimal)) {
      return '错误：无效的数字';
    }
    return decimal.toString();
  } catch {
    return '错误：转换失败';
  }
};

// 将十进制转换为任意进制
export const fromDecimal = (decimal: string, toBase: number): string => {
  try {
    const num = parseInt(decimal, 10);
    if (isNaN(num)) {
      return '错误：无效的十进制数';
    }

    const prefix = numberBases.find(b => b.base === toBase)?.prefix || '';
    return prefix + num.toString(toBase).toUpperCase();
  } catch {
    return '错误：转换失败';
  }
};

// 批量转换到所有进制
export const convertToAllBases = (value: string, fromBase: number): Record<string, string> => {
  const decimal = toDecimal(value, fromBase);

  if (decimal.startsWith('错误')) {
    return { '十进制': decimal };
  }

  const results: Record<string, string> = {
    '十进制': decimal,
  };

  for (const base of numberBases) {
    if (base.base !== 10) {
      results[base.name] = fromDecimal(decimal, base.base);
    }
  }

  return results;
};

// 验证数字在指定进制下是否有效
export const isValidNumberForBase = (value: string, base: number): boolean => {
  try {
    let cleanValue = value.trim().toLowerCase();

    // 移除前缀
    if (base === 2 && cleanValue.startsWith('0b')) {
      cleanValue = cleanValue.slice(2);
    } else if (base === 8 && cleanValue.startsWith('0o')) {
      cleanValue = cleanValue.slice(2);
    } else if (base === 16 && cleanValue.startsWith('0x')) {
      cleanValue = cleanValue.slice(2);
    }

    const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base);
    return cleanValue.split('').every(char => validChars.includes(char));
  } catch {
    return false;
  }
};

// 浮点数进制转换（简单实现，仅支持常用进制）
export const convertFloatToAllBases = (value: string): Record<string, string> => {
  const results: Record<string, string> = {};

  try {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { '错误': '无效的数字' };
    }

    // 整数部分
    const intPart = Math.floor(Math.abs(num));
    // 小数部分
    const fracPart = Math.abs(num) - intPart;

    // 二进制
    const binInt = intPart.toString(2);
    let binFrac = '';
    let tempFrac = fracPart;
    for (let i = 0; i < 20 && tempFrac > 0; i++) {
      tempFrac *= 2;
      binFrac += Math.floor(tempFrac).toString();
      tempFrac -= Math.floor(tempFrac);
    }
    results['二进制'] = '0b' + binInt + (binFrac ? '.' + binFrac : '');

    // 八进制
    const octInt = intPart.toString(8);
    let octFrac = '';
    tempFrac = fracPart;
    for (let i = 0; i < 10 && tempFrac > 0; i++) {
      tempFrac *= 8;
      octFrac += Math.floor(tempFrac).toString();
      tempFrac -= Math.floor(tempFrac);
    }
    results['八进制'] = '0o' + octInt + (octFrac ? '.' + octFrac : '');

    // 十进制
    results['十进制'] = num.toString();

    // 十六进制
    const hexInt = intPart.toString(16).toUpperCase();
    let hexFrac = '';
    tempFrac = fracPart;
    for (let i = 0; i < 10 && tempFrac > 0; i++) {
      tempFrac *= 16;
      hexFrac += Math.floor(tempFrac).toString(16).toUpperCase();
      tempFrac -= Math.floor(tempFrac);
    }
    results['十六进制'] = '0x' + hexInt + (hexFrac ? '.' + hexFrac : '');

  } catch {
    results['错误'] = '转换失败';
  }

  return results;
};