import { useState } from 'react';
import { Card, Button, Input } from '../components/common';

interface IPInfo {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
  cidr: number;
  ipClass: string;
  ipType: string;
  wildcardMask: string;
  binaryIP: string;
  binaryMask: string;
}

export default function IPCalculator() {
  const [ipAddress, setIPAddress] = useState('192.168.1.1');
  const [cidr, setCIDR] = useState(24);
  const [result, setResult] = useState<IPInfo | null>(null);
  const [error, setError] = useState('');

  const ipToInt = (ip: string): number => {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  };

  const intToIP = (int: number): string => {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255,
    ].join('.');
  };

  const intToBinary = (int: number): string => {
    return int.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.') || '';
  };

  const getIPClass = (firstOctet: number): string => {
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D (组播)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E (保留)';
    return '未知';
  };

  const getIPType = (ip: string): string => {
    const parts = ip.split('.').map(Number);
    const [first, second] = parts;

    if (first === 10) return '私有地址 (A类)';
    if (first === 172 && second >= 16 && second <= 31) return '私有地址 (B类)';
    if (first === 192 && second === 168) return '私有地址 (C类)';
    if (first === 127) return '回环地址';
    if (first === 169 && second === 254) return '链路本地地址';
    if (first >= 224 && first <= 239) return '组播地址';
    if (first === 255 && second === 255 && parts[2] === 255 && parts[3] === 255) return '广播地址';
    return '公网地址';
  };

  const calculateIP = () => {
    setError('');

    // Validate IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      setError('无效的 IP 地址格式');
      setResult(null);
      return;
    }

    const parts = ipAddress.split('.').map(Number);
    if (parts.some(p => p < 0 || p > 255)) {
      setError('IP 地址各部分必须在 0-255 之间');
      setResult(null);
      return;
    }

    if (cidr < 0 || cidr > 32) {
      setError('CIDR 必须在 0-32 之间');
      setResult(null);
      return;
    }

    const ipInt = ipToInt(ipAddress);
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
    const wildcardInt = (~maskInt) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

    const info: IPInfo = {
      network: intToIP(networkInt),
      broadcast: intToIP(broadcastInt),
      firstHost: cidr >= 31 ? intToIP(networkInt) : intToIP(networkInt + 1),
      lastHost: cidr >= 31 ? intToIP(broadcastInt) : intToIP(broadcastInt - 1),
      totalHosts,
      usableHosts,
      subnetMask: intToIP(maskInt),
      cidr,
      ipClass: getIPClass(parts[0]),
      ipType: getIPType(ipAddress),
      wildcardMask: intToIP(wildcardInt),
      binaryIP: intToBinary(ipInt),
      binaryMask: intToBinary(maskInt),
    };

    setResult(info);
  };

  const commonSubnets = [
    { cidr: 8, name: 'A类', hosts: '16,777,214' },
    { cidr: 16, name: 'B类', hosts: '65,534' },
    { cidr: 20, name: '大型网络', hosts: '4,094' },
    { cidr: 24, name: 'C类/小型网络', hosts: '254' },
    { cidr: 25, name: '128主机', hosts: '126' },
    { cidr: 26, name: '64主机', hosts: '62' },
    { cidr: 27, name: '32主机', hosts: '30' },
    { cidr: 28, name: '16主机', hosts: '14' },
    { cidr: 29, name: '8主机', hosts: '6' },
    { cidr: 30, name: '点对点', hosts: '2' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="IP 地址计算器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Input
              label="IP 地址"
              value={ipAddress}
              onChange={e => setIPAddress(e.target.value)}
              placeholder="192.168.1.1"
              style={{ flex: 2, minWidth: '150px' }}
            />
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>CIDR / 子网掩码</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <input
                  type="number"
                  min="0"
                  max="32"
                  value={cidr}
                  onChange={e => setCIDR(Number(e.target.value))}
                  className="input"
                  style={{ width: '80px' }}
                />
              </div>
            </div>
            <Button variant="primary" onClick={calculateIP}>计算</Button>
          </div>

          {error && <div style={{ color: 'var(--accent-danger)', fontSize: '13px' }}>{error}</div>}
        </div>
      </Card>

      {result && (
        <Card title="计算结果">
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Main Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>网络地址</div>
                <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'monospace' }}>{result.network}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{result.cidr}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>广播地址</div>
                <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'monospace' }}>{result.broadcast}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>子网掩码</div>
                <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'monospace' }}>{result.subnetMask}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>可用主机数</div>
                <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'monospace' }}>{result.usableHosts.toLocaleString()}</div>
              </div>
            </div>

            {/* Host Range */}
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>主机范围</div>
              <div style={{ fontFamily: 'monospace' }}>
                {result.firstHost} - {result.lastHost}
              </div>
            </div>

            {/* Additional Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>IP 类型</div>
                <div style={{ fontWeight: 500 }}>{result.ipType}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>IP 类别</div>
                <div style={{ fontWeight: 500 }}>{result.ipClass}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>通配符掩码</div>
                <div style={{ fontFamily: 'monospace' }}>{result.wildcardMask}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>总地址数</div>
                <div>{result.totalHosts.toLocaleString()}</div>
              </div>
            </div>

            {/* Binary */}
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>IP 地址 (二进制)</div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  {result.binaryIP}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>子网掩码 (二进制)</div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  {result.binaryMask}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card title="常用子网参考">
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', gap: '12px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', fontWeight: 500, fontSize: '13px' }}>
            <span>CIDR</span>
            <span>描述</span>
            <span>可用主机</span>
          </div>
          {commonSubnets.map(subnet => (
            <button
              key={subnet.cidr}
              onClick={() => setCIDR(subnet.cidr)}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px',
                gap: '12px',
                padding: '8px',
                background: cidr === subnet.cidr ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: cidr === subnet.cidr ? 'white' : 'inherit',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              <span style={{ fontFamily: 'monospace' }}>/{subnet.cidr}</span>
              <span>{subnet.name}</span>
              <span style={{ fontFamily: 'monospace' }}>{subnet.hosts}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• <strong>CIDR</strong> (无类别域间路由) 表示网络前缀的位数</div>
          <div>• 子网掩码决定了一个网络的大小和可用主机数量</div>
          <div>• 私有地址范围：10.0.0.0/8、172.16.0.0/12、192.168.0.0/16</div>
          <div>• /31 子网用于点对点链路，/32 表示单个主机</div>
        </div>
      </Card>
    </div>
  );
}