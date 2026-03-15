import { useState } from 'react';
import { Card, Button } from '../components/common';

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

export default function MorseCode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const encode = (text: string): string => {
    return text.toUpperCase()
      .split('')
      .map(char => {
        if (MORSE_CODE[char] !== undefined) {
          return MORSE_CODE[char];
        }
        return '';
      })
      .filter(s => s !== '')
      .join(' ');
  };

  const decode = (morse: string): string => {
    const parts = morse.trim().split(/\s+/);
    const result: string[] = [];
    const unknown: string[] = [];

    for (const part of parts) {
      if (REVERSE_MORSE[part] !== undefined) {
        result.push(REVERSE_MORSE[part]);
      } else if (part === '/') {
        result.push(' ');
      } else if (part) {
        unknown.push(part);
      }
    }

    if (unknown.length > 0) {
      setError(`无法解码: ${unknown.join(', ')}`);
    } else {
      setError('');
    }

    return result.join('');
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    if (mode === 'encode') {
      setOutput(encode(input));
      setError('');
    } else {
      setOutput(decode(input));
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'decode');
    setError('');
  };

  const playMorse = () => {
    if (!output) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    let time = audioContext.currentTime;

    for (const char of output) {
      if (char === '.') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.setValueAtTime(0, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
        time += 0.15;
      } else if (char === '-') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.setValueAtTime(0, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
        time += 0.35;
      } else if (char === ' ') {
        time += 0.2;
      }
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="摩斯码转换">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setMode('encode')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: mode === 'encode' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: mode === 'encode' ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              文字 → 摩斯码
            </button>
            <button
              onClick={() => setMode('decode')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: mode === 'decode' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: mode === 'decode' ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              摩斯码 → 文字
            </button>
          </div>

          {/* Input */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              {mode === 'encode' ? '输入文字' : '输入摩斯码 (用空格分隔，/ 表示空格)'}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要转换的文字...' : '.- -... -.-.'}
              className="input"
              style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={handleConvert}>转换</Button>
            <Button variant="secondary" onClick={handleSwap}>交换</Button>
            {output && <Button variant="secondary" onClick={copyOutput}>复制结果</Button>}
            {mode === 'encode' && output && (
              <Button variant="secondary" onClick={playMorse}>播放声音</Button>
            )}
          </div>

          {/* Output */}
          {output && (
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
                {mode === 'encode' ? '摩斯码' : '文字'}
              </div>
              <div style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontFamily: mode === 'encode' ? 'monospace' : 'inherit',
                wordBreak: 'break-all',
              }}>
                {output}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ color: 'var(--error)', fontSize: '13px' }}>{error}</div>
          )}
        </div>
      </Card>

      <Card title="摩斯码对照表">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '4px', fontSize: '12px' }}>
          {Object.entries(MORSE_CODE)
            .filter(([k]) => /[A-Z0-9]/.test(k))
            .map(([char, code]) => (
              <div
                key={char}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                }}
              >
                <span style={{ fontWeight: 500 }}>{char}</span>
                <span style={{ fontFamily: 'monospace' }}>{code}</span>
              </div>
            ))}
        </div>
      </Card>

      <Card title="关于摩斯码">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 摩斯码是一种时通时断的信号代码，通过不同的排列顺序来表达不同的英文字母、数字和标点符号</div>
          <div>• 点 (.) = 1个单位长度，划 (-) = 3个单位长度</div>
          <div>• 字符内点划间隔 = 1个单位，字符间间隔 = 3个单位，单词间间隔 = 7个单位</div>
          <div>• SOS 求救信号: ... --- ...</div>
        </div>
      </Card>
    </div>
  );
}