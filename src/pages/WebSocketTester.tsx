import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function WebSocketTester() {
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<{type: 'sent' | 'received' | 'system'; message: string; time: string}[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = () => {
    if (ws) {
      ws.close();
      return;
    }

    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        setConnected(true);
        addLog('system', '连接已建立');
      };

      socket.onmessage = (event) => {
        addLog('received', event.data);
      };

      socket.onclose = () => {
        setConnected(false);
        setWs(null);
        addLog('system', '连接已关闭');
      };

      socket.onerror = () => {
        addLog('system', '连接错误');
      };

      setWs(socket);
      addLog('system', '正在连接...');
    } catch (err) {
      addLog('system', '连接失败: ' + String(err));
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
    }
  };

  const send = () => {
    if (!ws || !message) return;

    try {
      ws.send(message);
      addLog('sent', message);
      setMessage('');
    } catch (err) {
      addLog('system', '发送失败: ' + String(err));
    }
  };

  const addLog = (type: 'sent' | 'received' | 'system', message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, time }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const loadPreset = (preset: 'echo' | 'binance' | 'demo') => {
    switch (preset) {
      case 'echo':
        setUrl('wss://echo.websocket.org');
        break;
      case 'binance':
        setUrl('wss://stream.binance.com:9443/ws/btcusdt@trade');
        break;
      case 'demo':
        setUrl('wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3ei7jF9Myf &notify_self=1');
        break;
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="WebSocket 测试">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Connection */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="ws:// 或 wss:// URL"
              className="input"
              style={{ flex: 1, minWidth: '200px' }}
              disabled={connected}
            />
            <Button
              variant={connected ? 'secondary' : 'primary'}
              onClick={connected ? disconnect : connect}
            >
              {connected ? '断开' : '连接'}
            </Button>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: connected ? '#22c55e' : '#ef4444',
            }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {connected ? '已连接' : '未连接'}
            </span>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('echo')}>
              Echo Server
            </Button>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('binance')}>
              Binance BTC
            </Button>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('demo')}>
              Demo Server
            </Button>
          </div>

          {/* Send Message */}
          <div style={{ display: 'grid', gap: '8px' }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="输入要发送的消息..."
              className="input"
              style={{ width: '100%', minHeight: '80px', fontFamily: 'monospace', fontSize: '13px' }}
              disabled={!connected}
            />
            <Button
              variant="primary"
              onClick={send}
              disabled={!connected || !message}
            >
              发送
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card title="消息日志">
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={clearLogs}>清空日志</Button>
          </div>
          <div
            style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '12px',
              borderRadius: 'var(--border-radius)',
              fontFamily: 'monospace',
              fontSize: '12px',
              minHeight: '200px',
              maxHeight: '400px',
              overflow: 'auto',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#666' }}>// 消息日志将显示在这里</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#666', marginRight: '8px' }}>[{log.time}]</span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginRight: '8px',
                    background: log.type === 'sent' ? '#3b82f6' : log.type === 'received' ? '#22c55e' : '#6b7280',
                    color: 'white',
                    fontSize: '11px',
                  }}>
                    {log.type === 'sent' ? '发送' : log.type === 'received' ? '接收' : '系统'}
                  </span>
                  <span style={{
                    color: log.type === 'system' ? '#f59e0b' : '#d4d4d4',
                    wordBreak: 'break-all',
                  }}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 输入 WebSocket URL (ws:// 或 wss://)</div>
          <div>• 点击"连接"建立 WebSocket 连接</div>
          <div>• Echo Server 会将收到的消息原样返回</div>
          <div>• Binance 是实时 BTC 价格流</div>
          <div>• 消息日志记录所有发送和接收的消息</div>
        </div>
      </Card>
    </div>
  );
}