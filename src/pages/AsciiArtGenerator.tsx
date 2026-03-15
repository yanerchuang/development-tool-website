import { useState } from 'react';
import { Card, Button } from '../components/common';

const fonts = {
  standard: {
    ' ': '     ',
    '!': '  !  ',
    '"': ' " " ',
    '#': ' ### ',
    '$': '$$$$ ',
    '%': '%  % ',
    '&': ' & & ',
    "'": "  '  ",
    '(': ' (   ',
    ')': '   ) ',
    '*': ' *** ',
    '+': '  +  ',
    ',': '   , ',
    '-': ' --- ',
    '.': '   . ',
    '/': '  /  ',
    '0': ' 000 ',
    '1': '  1  ',
    '2': ' 222 ',
    '3': ' 33  ',
    '4': '4 4 4',
    '5': ' 555 ',
    '6': ' 666 ',
    '7': '7777 ',
    '8': ' 888 ',
    '9': ' 999 ',
    ':': '  :  ',
    ';': '  ;  ',
    '<': '  <  ',
    '=': ' === ',
    '>': '  >  ',
    '?': ' ??? ',
    '@': '@@@@@',
    A: ' AAA ',
    B: 'BBB  ',
    C: ' CCC ',
    D: 'DDD  ',
    E: 'EEE  ',
    F: 'FFF  ',
    G: ' GGG ',
    H: 'H   H',
    I: ' III ',
    J: 'JJJ  ',
    K: 'K  K ',
    L: 'L    ',
    M: 'M M M',
    N: 'N  N ',
    O: ' OOO ',
    P: 'PPP  ',
    Q: ' QQQ ',
    R: 'RRR  ',
    S: ' SSS ',
    T: 'TTTTT',
    U: 'U   U',
    V: 'V   V',
    W: 'W   W',
    X: 'X   X',
    Y: 'Y   Y',
    Z: 'ZZZZZ',
    '[': ' [   ',
    '\\': '  \\  ',
    ']': '   ] ',
    '^': '  ^  ',
    _: '____ ',
    '`': '  `  ',
    a: ' aaa ',
    b: 'b  b ',
    c: ' ccc ',
    d: 'd  d ',
    e: ' eee ',
    f: 'f    ',
    g: ' ggg ',
    h: 'h   h',
    i: '  i  ',
    j: '  j  ',
    k: 'k  k ',
    l: 'l    ',
    m: 'm m m',
    n: 'n  n ',
    o: ' ooo ',
    p: 'p    ',
    q: ' q q ',
    r: 'r    ',
    s: ' sss ',
    t: ' t   ',
    u: 'u   u',
    v: 'v   v',
    w: 'w   w',
    x: 'x   x',
    y: 'y   y',
    z: 'zzzz ',
    '{': ' {   ',
    '|': '  |  ',
    '}': '   } ',
    '~': ' ~~~ ',
  },
  block: {
    ' ': '   ',
    '!': ' ! ',
    '.': ' . ',
    '?': ' ? ',
    A: '▀▄▀',
    B: '█▄▀',
    C: '▀▀ ',
    D: '█▄█',
    E: '█▀ ',
    F: '█▀ ',
    G: '▀▄█',
    H: '█ █',
    I: '█',
    J: ' ▄█',
    K: '█▄▀',
    L: '█  ',
    M: '█▄█',
    N: '██▄',
    O: '▄▀▄',
    P: '█▀ ',
    Q: '▄▀▄',
    R: '█▄▀',
    S: '▀▄▀',
    T: '▀█▀',
    U: '█ █',
    V: '█ ▀',
    W: '█▄█',
    X: '▀ ▄',
    Y: '█ ▀',
    Z: '▀▄▀',
    a: '▄▀',
    b: '█▄',
    c: '▄ ',
    d: '▄█',
    e: '▄▀',
    f: '▀ ',
    g: '▄█',
    h: '█ █',
    i: '█',
    j: ' ▄',
    k: '█▄',
    l: '█',
    m: '█▄',
    n: '█▄',
    o: '▄▀',
    p: '█▀',
    q: '▄█',
    r: '▄ ',
    s: '▄▀',
    t: '▀',
    u: '█ █',
    v: '█ ▀',
    w: '█▄',
    x: '▀ ▄',
    y: '█ ▀',
    z: '▀▄',
    '0': '▄▀▄',
    '1': '▄█',
    '2': '▀▄▀',
    '3': '▀▄▀',
    '4': '█ █',
    '5': '█▄▀',
    '6': '▄▄▀',
    '7': '▀▀█',
    '8': '▄▀▄',
    '9': '▀▄▄',
  },
  banner: {
    ' ': '   ',
    A: ' # ',
    B: '#  ',
    C: ' # ',
    D: '# #',
    E: '## ',
    F: '## ',
    G: ' # ',
    H: '# #',
    I: '#',
    J: ' #',
    K: '# #',
    L: '#  ',
    M: '# #',
    N: '# #',
    O: '###',
    P: '## ',
    Q: '###',
    R: '## ',
    S: ' # ',
    T: ' # ',
    U: '# #',
    V: '# #',
    W: '# #',
    X: '# #',
    Y: ' # ',
    Z: '###',
    a: ' # ',
    b: '#  ',
    c: ' # ',
    d: '# #',
    e: '## ',
    f: '#  ',
    g: ' # ',
    h: '# #',
    i: '#',
    j: ' #',
    k: '# #',
    l: '#  ',
    m: '# #',
    n: '# #',
    o: '# #',
    p: '## ',
    q: '###',
    r: '## ',
    s: ' # ',
    t: ' # ',
    u: '# #',
    v: '# #',
    w: '# #',
    x: '# #',
    y: ' # ',
    z: '###',
    '0': '# #',
    '1': ' #',
    '2': ' # ',
    '3': '# #',
    '4': '# #',
    '5': '## ',
    '6': '# #',
    '7': ' ##',
    '8': '# #',
    '9': '# #',
  },
};

export default function AsciiArtGenerator() {
  const [text, setText] = useState('Hello');
  const [font, setFont] = useState<keyof typeof fonts>('standard');
  const [result, setResult] = useState('');

  const generateAscii = () => {
    const selectedFont = fonts[font];
    const lines: string[] = ['', '', ''];

    for (const char of text) {
      const pattern = selectedFont[char.toUpperCase() as keyof typeof selectedFont] || '   ';
      const charLines = pattern.split('\n');
      for (let i = 0; i < lines.length; i++) {
        lines[i] += (charLines[i] || '   ') + ' ';
      }
    }

    // For block and banner fonts, use simpler approach
    if (font === 'block' || font === 'banner') {
      const simpleResult = text
        .toUpperCase()
        .split('')
        .map(char => selectedFont[char as keyof typeof selectedFont] || '   ')
        .join(' ');
      setResult(simpleResult);
    } else {
      setResult(lines.join('\n'));
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="ASCII 艺术生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="输入文字..."
              className="input"
              style={{ fontSize: '16px' }}
            />
            <select
              value={font}
              onChange={e => setFont(e.target.value as keyof typeof fonts)}
              className="input"
            >
              <option value="standard">标准</option>
              <option value="block">方块</option>
              <option value="banner">横幅</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={generateAscii}>生成</Button>
            <Button variant="secondary" onClick={copyResult} disabled={!result}>复制</Button>
          </div>

          {result && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre',
              overflow: 'auto',
              lineHeight: 1.2,
            }}>
              {result}
            </div>
          )}
        </div>
      </Card>

      <Card title="ASCII 艺术示例">
        <div style={{ display: 'grid', gap: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <pre style={{ margin: 0 }}>{`
  _____   _____   _____   _____   _   _
 |  __ \\ |  __ \\ |  __ \\ |  __ \\ | | | |
 | |  | || |  | || |  | || |  | || |_| |
 | |  | || |  | || |  | || |  | ||  _  |
 | |__| || |__| || |__| || |__| || | | |
 |_____/ |_____/ |_____/ |_____/ |_| |_|
`}</pre>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <pre style={{ margin: 0 }}>{`
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████║███████║██║     █████╔╝ █████╗  ██████╔╝
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`}</pre>
          </div>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 输入文字，选择字体风格，点击生成按钮</div>
          <div>• 支持英文字母、数字和常用符号</div>
          <div>• 点击复制按钮可以将生成的 ASCII 艺术复制到剪贴板</div>
          <div>• 可用于代码注释、README 文件、终端输出等场景</div>
        </div>
      </Card>
    </div>
  );
}