import { useState } from 'react';
import { Card, Button } from '../components/common';

export default function ApiTester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [headers, setHeaders] = useState('[\n  {"key": "Content-Type", "value": "application/json"}\n]');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: string;
    body: string;
    time: number;
    size: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{method: string; url: string; time: string}[]>([]);

  const sendRequest = async () => {
    if (!url) return;

    setLoading(true);
    const startTime = performance.now();

    try {
      let parsedHeaders: Record<string, string> = {};
      try {
        const headerArray = JSON.parse(headers);
        headerArray.forEach((h: {key: string; value: string}) => {
          parsedHeaders[h.key] = h.value;
        });
      } catch {
        parsedHeaders = { 'Content-Type': 'application/json' };
      }

      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const responseText = await res.text();

      let formattedBody: string;
      try {
        formattedBody = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch {
        formattedBody = responseText;
      }

      const responseHeaders: string[] = [];
      res.headers.forEach((value, key) => {
        responseHeaders.push(`${key}: ${value}`);
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders.join('\n'),
        body: formattedBody,
        time: Math.round(endTime - startTime),
        size: (new Blob([responseText]).size / 1024).toFixed(2) + ' KB',
      });

      setHistory(prev => [{
        method,
        url,
        time: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 9)]);

    } catch (err) {
      const endTime = performance.now();
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: '',
        body: String(err),
        time: Math.round(endTime - startTime),
        size: '0 KB',
      });
    }

    setLoading(false);
  };

  const loadPreset = (preset: 'jsonplaceholder' | 'httpbin' | 'reqres') => {
    switch (preset) {
      case 'jsonplaceholder':
        setUrl('https://jsonplaceholder.typicode.com/posts/1');
        setMethod('GET');
        setBody('');
        break;
      case 'httpbin':
        setUrl('https://httpbin.org/post');
        setMethod('POST');
        setBody(JSON.stringify({ message: 'Hello, World!' }, null, 2));
        break;
      case 'reqres':
        setUrl('https://reqres.in/api/users');
        setMethod('POST');
        setHeaders('[\n  {"key": "Content-Type", "value": "application/json"},\n  {"key": "x-api-key", "value": "reqres-free-v1"}\n]');
        setBody(JSON.stringify({ name: 'Test User', job: 'Developer' }, null, 2));
        break;
    }
  };

  const clearAll = () => {
    setUrl('');
    setBody('');
    setResponse(null);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="API 测试工具">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* URL and Method */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as typeof method)}
              className="input"
              style={{ width: '100px' }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="输入 API URL..."
              className="input"
              style={{ flex: 1, minWidth: '200px' }}
            />
          </div>

          {/* Preset APIs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('jsonplaceholder')}>
              JSONPlaceholder
            </Button>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('httpbin')}>
              HTTPBin
            </Button>
            <Button variant="secondary" size="sm" onClick={() => loadPreset('reqres')}>
              ReqRes
            </Button>
          </div>

          {/* Headers */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>请求头 (JSON)</div>
            <textarea
              value={headers}
              onChange={e => setHeaders(e.target.value)}
              className="input"
              style={{ width: '100%', minHeight: '80px', fontFamily: 'monospace', fontSize: '12px' }}
            />
          </div>

          {/* Body */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>请求体</div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="input"
                style={{ width: '100%', minHeight: '100px', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="primary" onClick={sendRequest} disabled={loading || !url}>
              {loading ? '发送中...' : '发送请求'}
            </Button>
            <Button variant="secondary" onClick={clearAll}>清空</Button>
          </div>

          {/* Response */}
          {response && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>状态码</div>
                  <div style={{
                    fontFamily: 'monospace',
                    color: response.status >= 200 && response.status < 300 ? '#22c55e' : response.status >= 400 ? '#ef4444' : '#f59e0b',
                  }}>
                    {response.status} {response.statusText}
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>耗时</div>
                  <div style={{ fontFamily: 'monospace' }}>{response.time} ms</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>大小</div>
                  <div style={{ fontFamily: 'monospace' }}>{response.size}</div>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>响应头</div>
                <pre
                  className="result-box"
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: '150px',
                    overflow: 'auto',
                  }}
                >
                  {response.headers || '无'}
                </pre>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>响应体</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(response.body)}
                  >
                    复制
                  </Button>
                </div>
                <pre
                  className="result-box"
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: '400px',
                    overflow: 'auto',
                  }}
                >
                  {response.body}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card title="请求历史">
          <div style={{ display: 'grid', gap: '8px' }}>
            {history.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '8px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setUrl(item.url);
                  setMethod(item.method as typeof method);
                }}
              >
                <span style={{
                  padding: '2px 8px',
                  background: item.method === 'GET' ? '#22c55e' : item.method === 'POST' ? '#3b82f6' : '#f59e0b',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>
                  {item.method}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 支持 GET、POST、PUT、DELETE、PATCH 请求方法</div>
          <div>• 请求头使用 JSON 数组格式</div>
          <div>• 请求体支持 JSON 格式</div>
          <div>• 点击预设按钮可快速测试 API</div>
          <div>• 注意：目标服务器需要支持 CORS</div>
        </div>
      </Card>
    </div>
  );
}