import { useState, useMemo } from 'react';
import { Card } from '../components/common';

interface ParsedUrl {
  valid: true;
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
  username: string;
  password: string;
}

interface ParseError {
  valid: false;
}

type ParseResult = ParsedUrl | ParseError;

export default function UrlParser() {
  const [url, setUrl] = useState('https://www.example.com:8080/path/to/page?query=value&foo=bar#section');

  const parsed = useMemo((): ParseResult => {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return {
        valid: true,
        href: urlObj.href,
        origin: urlObj.origin,
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        params,
        username: urlObj.username,
        password: urlObj.password,
      };
    } catch {
      return { valid: false };
    }
  }, [url]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const encodeUrl = () => {
    try {
      return encodeURIComponent(url);
    } catch {
      return '';
    }
  };

  const decodeUrl = () => {
    try {
      return decodeURIComponent(url);
    } catch {
      return '';
    }
  };

  if (parsed.valid) {
    const items = [
      { label: '完整 URL', value: parsed.href },
      { label: 'Origin', value: parsed.origin },
      { label: '协议', value: parsed.protocol },
      { label: '主机', value: parsed.host },
      { label: '主机名', value: parsed.hostname },
      { label: '端口', value: parsed.port || '(默认)' },
      { label: '路径', value: parsed.pathname },
      { label: '查询字符串', value: parsed.search || '(无)' },
      { label: '哈希', value: parsed.hash || '(无)' },
      { label: '用户名', value: parsed.username || '(无)' },
      { label: '密码', value: parsed.password || '(无)' },
    ];

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        <Card title="URL 解析器">
          <div style={{ display: 'grid', gap: '16px' }}>
            <textarea
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="输入 URL..."
              className="input"
              style={{
                width: '100%',
                height: '80px',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            />

            <div style={{ display: 'grid', gap: '12px' }}>
              {items.map(item => (
                <div
                  key={item.label}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                      {item.value}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 8px', flexShrink: 0 }}
                    onClick={() => copyToClipboard(item.value)}
                  >
                    复制
                  </button>
                </div>
              ))}

              {Object.keys(parsed.params).length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>
                    查询参数
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {Object.entries(parsed.params).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--border-radius)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          <span style={{ color: 'var(--accent-primary)' }}>{key}</span>
                          <span style={{ color: 'var(--text-secondary)' }}> = </span>
                          <span>{value}</span>
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '11px', padding: '2px 6px' }}
                          onClick={() => copyToClipboard(value)}
                        >
                          复制
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="URL 编码/解码">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>URL 编码</span>
                <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(encodeUrl())}>复制</button>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>
                {encodeUrl()}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>URL 解码</span>
                <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(decodeUrl())}>复制</button>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>
                {decodeUrl()}
              </div>
            </div>
          </div>
        </Card>

        <Card title="URL 组成说明">
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>protocol</strong>: 协议，如 https:、http:、ftp:
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>host</strong>: 主机名 + 端口，如 example.com:8080
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>pathname</strong>: 路径，如 /path/to/page
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>search</strong>: 查询字符串，如 ?key=value
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <strong>hash</strong>: 片段标识符，如 #section
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="URL 解析器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <textarea
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="输入 URL..."
            className="input"
            style={{
              width: '100%',
              height: '80px',
              resize: 'vertical',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          />
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
            无效的 URL 格式
          </div>
        </div>
      </Card>

      <Card title="URL 编码/解码">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>URL 编码</span>
              <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(encodeUrl())}>复制</button>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>
              {encodeUrl()}
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>URL 解码</span>
              <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => copyToClipboard(decodeUrl())}>复制</button>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>
              {decodeUrl()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}