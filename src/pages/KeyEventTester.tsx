import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '../components/common';

interface KeyEvent {
  key: string;
  code: string;
  keyCode: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  timestamp: number;
}

export default function KeyEventTester() {
  const [events, setEvents] = useState<KeyEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastEvent, setLastEvent] = useState<KeyEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const event: KeyEvent = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        timestamp: Date.now(),
      };

      setLastEvent(event);
      setEvents(prev => [event, ...prev].slice(0, 20));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    setEvents([]);
    setLastEvent(null);
    containerRef.current?.focus();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const clearEvents = () => {
    setEvents([]);
    setLastEvent(null);
  };

  const formatModifier = (e: KeyEvent) => {
    const mods: string[] = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.shiftKey) mods.push('Shift');
    if (e.altKey) mods.push('Alt');
    if (e.metaKey) mods.push('Meta');
    return mods.length > 0 ? mods.join(' + ') : '-';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="键盘事件测试">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isListening ? (
              <Button variant="primary" onClick={startListening}>开始监听</Button>
            ) : (
              <Button variant="secondary" onClick={stopListening}>停止监听</Button>
            )}
            <Button variant="secondary" onClick={clearEvents}>清空记录</Button>
            {isListening && (
              <span style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>
                正在监听键盘事件...
              </span>
            )}
          </div>

          {/* Current Event Display */}
          <div
            ref={containerRef}
            tabIndex={isListening ? 0 : -1}
            style={{
              padding: '24px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              textAlign: 'center',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {lastEvent ? (
              <>
                <div style={{ fontSize: '48px', fontWeight: 600, marginBottom: '8px' }}>
                  {lastEvent.key === ' ' ? 'Space' : lastEvent.key}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Code: <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{lastEvent.code}</code>
                  {' | '}
                  KeyCode: <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{lastEvent.keyCode}</code>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  修饰键: {formatModifier(lastEvent)}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                {isListening ? '按下任意键查看事件信息' : '点击"开始监听"按钮开始'}
              </div>
            )}
          </div>

          {/* Event History */}
          {events.length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                历史记录 (最近20个)
              </div>
              <div style={{ display: 'grid', gap: '4px', maxHeight: '300px', overflow: 'auto' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 80px 100px 60px 1fr',
                  gap: '8px',
                  padding: '8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}>
                  <span>Key</span>
                  <span>Code</span>
                  <span>KeyCode</span>
                  <span>修饰</span>
                  <span>操作</span>
                </div>
                {events.map((event, index) => (
                  <div
                    key={event.timestamp}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 80px 100px 60px 1fr',
                      gap: '8px',
                      padding: '8px',
                      background: index === 0 ? 'var(--bg-tertiary)' : 'transparent',
                      borderRadius: 'var(--border-radius)',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{event.key === ' ' ? 'Space' : event.key}</span>
                    <span style={{ fontFamily: 'monospace' }}>{event.code}</span>
                    <span style={{ fontFamily: 'monospace' }}>{event.keyCode}</span>
                    <span>{formatModifier(event)}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(event.code)}
                      >
                        复制Code
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(event.keyCode.toString())}
                      >
                        复制KeyCode
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="常用键码参考">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '13px' }}>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Enter: </span>
            <code>Enter</code> (13)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Escape: </span>
            <code>Escape</code> (27)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Backspace: </span>
            <code>Backspace</code> (8)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tab: </span>
            <code>Tab</code> (9)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Space: </span>
            <code>Space</code> (32)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Arrow Keys: </span>
            <code>ArrowUp/Down/Left/Right</code>
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Delete: </span>
            <code>Delete</code> (46)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Insert: </span>
            <code>Insert</code> (45)
          </div>
        </div>
      </Card>
    </div>
  );
}