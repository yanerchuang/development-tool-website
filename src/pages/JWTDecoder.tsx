import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface JWTPart {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  decodedAt: number;
}

export default function JWTDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<JWTPart | null>(null);
  const [error, setError] = useState('');

  const decodeJWT = (token: string): JWTPart | null => {
    const parts = token.split('.');
    if (parts.length !== 3) {
      setError('无效的 JWT 格式：需要三个部分（header.payload.signature）');
      return null;
    }

    try {
      // Decode header
      const headerJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const header = JSON.parse(headerJson);

      // Decode payload
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);

      return {
        header,
        payload,
        signature: parts[2],
        decodedAt: Math.floor(Date.now() / 1000),
      };
    } catch {
      setError('JWT 解码失败：无效的 Base64 或 JSON 格式');
      return null;
    }
  };

  const handleDecode = () => {
    setError('');
    setDecoded(null);

    if (!input.trim()) {
      setError('请输入 JWT Token');
      return;
    }

    const result = decodeJWT(input.trim());
    if (result) {
      setDecoded(result);
    }
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (timestamp: number): string => {
    if (typeof timestamp !== 'number') return String(timestamp);
    const date = new Date(timestamp * 1000);
    return `${date.toLocaleString('zh-CN')} (${timestamp})`;
  };

  const checkExpiration = (exp?: number, decodedAt?: number): { text: string; color: string } => {
    if (!exp) return { text: '无过期时间', color: 'var(--text-muted)' };
    const now = decodedAt ?? 0;
    if (exp < now) {
      return { text: '已过期', color: 'var(--accent-danger)' };
    }
    const remaining = exp - now;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return { text: `剩余 ${days}天 ${hours}时 ${minutes}分`, color: 'var(--accent-success)' };
  };

  const analyzePayload = (payload: Record<string, unknown>) => {
    const claims: { key: string; value: string; description: string }[] = [];

    const standardClaims: Record<string, string> = {
      iss: '签发者 (Issuer)',
      sub: '主题 (Subject)',
      aud: '受众 (Audience)',
      exp: '过期时间 (Expiration)',
      nbf: '生效时间 (Not Before)',
      iat: '签发时间 (Issued At)',
      jti: 'JWT ID',
    };

    Object.entries(payload).forEach(([key, value]) => {
      let displayValue = String(value);
      const description = standardClaims[key] || '自定义声明';

      // Format timestamps
      if (['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number') {
        displayValue = formatTimestamp(value);
      }

      claims.push({ key, value: displayValue, description });
    });

    return claims;
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="JWT 解码器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="tool-panel-header">
            <span className="tool-panel-title">输入 JWT Token</span>
            <div className="tool-actions">
              <Button variant="secondary" size="sm" onClick={handleClear}>清空</Button>
            </div>
          </div>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="粘贴 JWT Token..."
            style={{ minHeight: '120px', fontFamily: 'monospace' }}
          />
          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
          <Button variant="primary" onClick={handleDecode}>解码</Button>
        </div>
      </Card>

      {decoded && (
        <>
          <Card title="Header (头部)">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>算法: {decoded.header.alg as string || '未知'}</span>
                <Button variant="secondary" size="sm" onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2))}>复制</Button>
              </div>
              <pre className="result-box" style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
          </Card>

          <Card title="Payload (载荷)">
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    background: checkExpiration(decoded.payload.exp as number, decoded.decodedAt).color,
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: 'white',
                  }}>
                    {checkExpiration(decoded.payload.exp as number, decoded.decodedAt).text}
                  </span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2))}>复制</Button>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {analyzePayload(decoded.payload).map(claim => (
                  <div key={claim.key} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--accent-primary)' }}>{claim.key}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{claim.description}</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all' }}>{claim.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Signature (签名)">
            <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              {decoded.signature}
            </div>
          </Card>
        </>
      )}

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>JWT</strong> (JSON Web Token) 是一种开放标准，用于在各方之间安全传输信息</div>
          <div>• JWT 由三部分组成：Header（头部）、Payload（载荷）、Signature（签名）</div>
          <div>• Header 和 Payload 使用 Base64Url 编码</div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
            注意：此工具仅用于解码和查看 JWT 内容，不会验证签名的有效性
          </div>
        </div>
      </Card>
    </div>
  );
}