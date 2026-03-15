import { useState } from 'react';
import { Card, Button } from '../components/common';

// Euler's totient function
const gcd = (a: number, b: number): number => {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
};

const modInverse = (a: number, m: number): number => {
  let [m0, x0, x1] = [m, 0, 1];
  if (m === 1) return 0;
  while (a > 1) {
    const q = Math.floor(a / m);
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0 ? x1 + m0 : x1;
};

const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
};

const modPow = (base: number, exp: number, mod: number): number => {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
};

export default function RSATool() {
  const [p, setP] = useState(61);
  const [q, setQ] = useState(53);
  const [e, setE] = useState(17);
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [publicKey, setPublicKey] = useState({ n: 0, e: 0 });
  const [privateKey, setPrivateKey] = useState({ n: 0, d: 0 });
  const [error, setError] = useState('');

  const generateKeys = () => {
    setError('');

    if (!isPrime(p) || !isPrime(q)) {
      setError('p 和 q 必须是质数');
      return;
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    if (gcd(e, phi) !== 1) {
      setError(`e=${e} 与 φ(n)=${phi} 不互质，请选择不同的 e`);
      return;
    }

    const d = modInverse(e, phi);

    setPublicKey({ n, e });
    setPrivateKey({ n, d });
  };

  const encrypt = () => {
    if (!message || publicKey.n === 0) return;

    const encryptedValues: number[] = [];
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i);
      if (charCode >= publicKey.n) {
        setError(`字符 "${message[i]}" 的 Unicode 值 ${charCode} 大于 n=${publicKey.n}，请使用更大的质数`);
        return;
      }
      const encrypted = modPow(charCode, publicKey.e, publicKey.n);
      encryptedValues.push(encrypted);
    }

    setEncrypted(encryptedValues.join(','));
  };

  const decrypt = () => {
    if (!encrypted || privateKey.n === 0) return;

    try {
      const values = encrypted.split(',').map(Number);
      let result = '';
      for (const val of values) {
        const decrypted = modPow(val, privateKey.d, privateKey.n);
        result += String.fromCharCode(decrypted);
      }
      setDecrypted(result);
    } catch {
      setError('解密失败：无效的密文格式');
    }
  };

  const generateRandomPrimes = () => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    const getRandomPrime = () => primes[Math.floor(Math.random() * primes.length)];
    setP(getRandomPrime());
    setQ(getRandomPrime());
    setE([3, 5, 17, 65537][Math.floor(Math.random() * 4)]);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="RSA 加解密演示">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Key Generation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>质数 p</div>
              <input
                type="number"
                value={p}
                onChange={e => setP(parseInt(e.target.value) || 0)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>质数 q</div>
              <input
                type="number"
                value={q}
                onChange={e => setQ(parseInt(e.target.value) || 0)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>公钥指数 e</div>
              <input
                type="number"
                value={e}
                onChange={e => setE(parseInt(e.target.value) || 0)}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={generateKeys}>生成密钥</Button>
            <Button variant="secondary" onClick={generateRandomPrimes}>随机质数</Button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Keys Display */}
          {publicKey.n > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>公钥 (n, e)</div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                  n = {publicKey.n}<br />
                  e = {publicKey.e}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>私钥 (n, d)</div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                  n = {privateKey.n}<br />
                  d = {privateKey.d}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="加密/解密">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Encrypt */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>明文</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="输入要加密的消息"
                className="input"
                style={{ flex: 1 }}
              />
              <Button variant="primary" onClick={encrypt} disabled={publicKey.n === 0}>加密</Button>
            </div>
          </div>

          {/* Encrypted */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>密文</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={encrypted}
                onChange={e => setEncrypted(e.target.value)}
                placeholder="加密后的消息"
                className="input"
                style={{ flex: 1, fontFamily: 'monospace' }}
              />
              <Button variant="primary" onClick={decrypt} disabled={privateKey.n === 0}>解密</Button>
            </div>
          </div>

          {/* Decrypted */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>解密结果</div>
            <div style={{
              padding: '12px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              fontFamily: decrypted ? 'inherit' : 'monospace',
            }}>
              {decrypted || '解密后的明文将显示在这里'}
            </div>
          </div>
        </div>
      </Card>

      <Card title="RSA 算法说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• RSA 是一种非对称加密算法，使用公钥加密、私钥解密</div>
          <div>• 密钥生成步骤：选择两个质数 p, q，计算 n=p×q 和 φ(n)=(p-1)(q-1)</div>
          <div>• 选择公钥指数 e，满足 1 &lt; e &lt; φ(n) 且 gcd(e, φ(n)) = 1</div>
          <div>• 计算私钥指数 d，满足 e × d ≡ 1 (mod φ(n))</div>
          <div>• 加密：c = m^e mod n</div>
          <div>• 解密：m = c^d mod n</div>
          <div>• 这是一个教学演示，实际 RSA 使用更大的质数（通常 1024-4096 位）</div>
        </div>
      </Card>
    </div>
  );
}