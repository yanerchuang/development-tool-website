import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';
import {
  md5Hash,
  sha1Hash,
  sha256Hash,
  sha512Hash,
  aesEncrypt,
  aesDecrypt,
  decodeJwt,
  generateRandomKey,
} from '../utils/crypto';

type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512';

export default function Crypto() {
  // 哈希
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [hashType, setHashType] = useState<HashType>('sha256');

  // AES
  const [aesInput, setAesInput] = useState('');
  const [aesKey, setAesKey] = useState('');
  const [aesOutput, setAesOutput] = useState('');

  // JWT
  const [jwtInput, setJwtInput] = useState('');
  const [jwtOutput, setJwtOutput] = useState<{ header: unknown; payload: unknown } | null>(null);

  // 哈希计算
  const handleHash = () => {
    switch (hashType) {
      case 'md5':
        setHashOutput(md5Hash(hashInput));
        break;
      case 'sha1':
        setHashOutput(sha1Hash(hashInput));
        break;
      case 'sha256':
        setHashOutput(sha256Hash(hashInput));
        break;
      case 'sha512':
        setHashOutput(sha512Hash(hashInput));
        break;
    }
  };

  // AES 加密
  const handleAesEncrypt = () => {
    if (!aesKey) {
      setAesOutput('请输入密钥');
      return;
    }
    setAesOutput(aesEncrypt(aesInput, aesKey));
  };

  // AES 解密
  const handleAesDecrypt = () => {
    if (!aesKey) {
      setAesOutput('请输入密钥');
      return;
    }
    setAesOutput(aesDecrypt(aesInput, aesKey));
  };

  // 生成随机密钥
  const handleGenerateKey = () => {
    setAesKey(generateRandomKey(32));
  };

  // JWT 解码
  const handleJwtDecode = () => {
    const result = decodeJwt(jwtInput);
    if (result.error) {
      setJwtOutput(null);
    } else {
      setJwtOutput({ header: result.header, payload: result.payload });
    }
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* 哈希计算 */}
      <Card title="哈希计算">
        <div style={{ display: 'grid', gap: '12px' }}>
          <TextArea
            value={hashInput}
            onChange={e => setHashInput(e.target.value)}
            placeholder="输入要计算哈希的内容..."
            style={{ minHeight: '100px' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['md5', 'sha1', 'sha256', 'sha512'] as const).map(type => (
              <Button
                key={type}
                variant={hashType === type ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setHashType(type)}
              >
                {type.toUpperCase()}
              </Button>
            ))}
            <div style={{ flex: 1 }} />
            <Button variant="primary" onClick={handleHash}>
              计算
            </Button>
          </div>
          {hashOutput && (
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {hashOutput}
            </div>
          )}
        </div>
      </Card>

      {/* AES 加解密 */}
      <Card title="AES 加解密">
        <div style={{ display: 'grid', gap: '12px' }}>
          <TextArea
            value={aesInput}
            onChange={e => setAesInput(e.target.value)}
            placeholder="输入要加密或解密的内容..."
            style={{ minHeight: '100px' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <Input
              label="密钥"
              value={aesKey}
              onChange={e => setAesKey(e.target.value)}
              placeholder="输入密钥"
              style={{ flex: 1 }}
            />
            <Button variant="secondary" size="sm" onClick={handleGenerateKey}>
              生成随机密钥
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={handleAesEncrypt}>
              加密
            </Button>
            <Button variant="secondary" onClick={handleAesDecrypt}>
              解密
            </Button>
          </div>
          {aesOutput && (
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {aesOutput}
            </div>
          )}
        </div>
      </Card>

      {/* JWT 解码 */}
      <Card title="JWT 解码">
        <div style={{ display: 'grid', gap: '12px' }}>
          <TextArea
            value={jwtInput}
            onChange={e => setJwtInput(e.target.value)}
            placeholder="输入 JWT Token..."
            style={{ minHeight: '100px' }}
          />
          <Button variant="primary" onClick={handleJwtDecode} style={{ width: 'fit-content' }}>
            解码
          </Button>
          {jwtOutput && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Header</div>
                <pre style={{ margin: 0, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', overflow: 'auto' }}>
                  {JSON.stringify(jwtOutput.header, null, 2)}
                </pre>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Payload</div>
                <pre style={{ margin: 0, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', overflow: 'auto' }}>
                  {JSON.stringify(jwtOutput.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}