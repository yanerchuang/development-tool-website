// 单位转换工具

// 长度单位
export const lengthUnits = [
  { name: '毫米', key: 'mm', factor: 0.001 },
  { name: '厘米', key: 'cm', factor: 0.01 },
  { name: '米', key: 'm', factor: 1 },
  { name: '千米', key: 'km', factor: 1000 },
  { name: '英寸', key: 'in', factor: 0.0254 },
  { name: '英尺', key: 'ft', factor: 0.3048 },
  { name: '码', key: 'yd', factor: 0.9144 },
  { name: '英里', key: 'mi', factor: 1609.344 },
  { name: '海里', key: 'nmi', factor: 1852 },
];

// 重量单位
export const weightUnits = [
  { name: '毫克', key: 'mg', factor: 0.000001 },
  { name: '克', key: 'g', factor: 0.001 },
  { name: '千克', key: 'kg', factor: 1 },
  { name: '吨', key: 't', factor: 1000 },
  { name: '盎司', key: 'oz', factor: 0.028349523125 },
  { name: '磅', key: 'lb', factor: 0.45359237 },
  { name: '斤', key: 'jin', factor: 0.5 },
  { name: '两', key: 'liang', factor: 0.05 },
];

// 温度单位
export const temperatureUnits = [
  { name: '摄氏度', key: 'c' },
  { name: '华氏度', key: 'f' },
  { name: '开尔文', key: 'k' },
];

// 面积单位
export const areaUnits = [
  { name: '平方毫米', key: 'mm2', factor: 0.000001 },
  { name: '平方厘米', key: 'cm2', factor: 0.0001 },
  { name: '平方米', key: 'm2', factor: 1 },
  { name: '公顷', key: 'ha', factor: 10000 },
  { name: '平方千米', key: 'km2', factor: 1000000 },
  { name: '平方英寸', key: 'in2', factor: 0.00064516 },
  { name: '平方英尺', key: 'ft2', factor: 0.09290304 },
  { name: '亩', key: 'mu', factor: 666.666666667 },
  { name: '英亩', key: 'acre', factor: 4046.8564224 },
];

// 体积单位
export const volumeUnits = [
  { name: '毫升', key: 'ml', factor: 0.000001 },
  { name: '升', key: 'l', factor: 0.001 },
  { name: '立方米', key: 'm3', factor: 1 },
  { name: '加仑(美)', key: 'gal', factor: 0.003785411784 },
  { name: '品脱(美)', key: 'pt', factor: 0.000473176473 },
  { name: '液量盎司(美)', key: 'floz', factor: 0.000029573529563 },
];

// 时间单位
export const timeUnits = [
  { name: '毫秒', key: 'ms', factor: 0.001 },
  { name: '秒', key: 's', factor: 1 },
  { name: '分钟', key: 'min', factor: 60 },
  { name: '小时', key: 'h', factor: 3600 },
  { name: '天', key: 'd', factor: 86400 },
  { name: '周', key: 'wk', factor: 604800 },
  { name: '月(30天)', key: 'mo', factor: 2592000 },
  { name: '年(365天)', key: 'yr', factor: 31536000 },
];

// 数据存储单位
export const dataUnits = [
  { name: 'Bit', key: 'bit', factor: 0.125 },
  { name: 'Byte', key: 'B', factor: 1 },
  { name: 'KB', key: 'KB', factor: 1024 },
  { name: 'MB', key: 'MB', factor: 1048576 },
  { name: 'GB', key: 'GB', factor: 1073741824 },
  { name: 'TB', key: 'TB', factor: 1099511627776 },
  { name: 'PB', key: 'PB', factor: 1125899906842624 },
];

// 速度单位
export const speedUnits = [
  { name: '米/秒', key: 'mps', factor: 1 },
  { name: '千米/时', key: 'kmh', factor: 0.277778 },
  { name: '英里/时', key: 'mph', factor: 0.44704 },
  { name: '节', key: 'kn', factor: 0.514444 },
  { name: '马赫', key: 'mach', factor: 340.29 },
];

// 转换函数
export const convertUnit = (value: number, fromKey: string, toKey: string, units: { key: string; factor: number }[]): number => {
  const fromUnit = units.find(u => u.key === fromKey);
  const toUnit = units.find(u => u.key === toKey);
  if (!fromUnit || !toUnit) return NaN;
  const baseValue = value * fromUnit.factor;
  return baseValue / toUnit.factor;
};

// 温度转换
export const convertTemperature = (value: number, from: string, to: string): number => {
  let celsius: number;
  switch (from) {
    case 'c': celsius = value; break;
    case 'f': celsius = (value - 32) * 5 / 9; break;
    case 'k': celsius = value - 273.15; break;
    default: return NaN;
  }
  switch (to) {
    case 'c': return celsius;
    case 'f': return celsius * 9 / 5 + 32;
    case 'k': return celsius + 273.15;
    default: return NaN;
  }
};

// 批量转换
export const convertToAll = (value: number, fromKey: string, units: { name: string; key: string; factor: number }[]): Record<string, number> => {
  const fromUnit = units.find(u => u.key === fromKey);
  if (!fromUnit) return {};
  const baseValue = value * fromUnit.factor;
  const results: Record<string, number> = {};
  units.forEach(u => {
    if (u.key !== fromKey) {
      results[u.name] = baseValue / u.factor;
    }
  });
  return results;
};