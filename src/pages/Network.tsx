import { useState } from 'react';
import { Card, Button, TextArea, Input } from '../components/common';

type TabType = 'url' | 'http' | 'network' | 'tools';

export default function Network() {
  const [activeTab, setActiveTab] = useState<TabType>('url');

  // URL 解析
  const [urlInput, setUrlInput] = useState('');
  const [urlParsed, setUrlParsed] = useState<Record<string, string> | null>(null);

  // HTTP 请求
  const [httpUrl, setHttpUrl] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpHeaders, setHttpHeaders] = useState('');
  const [httpBody, setHttpBody] = useState('');
  const [httpResponse, setHttpResponse] = useState('');
  const [httpLoading, setHttpLoading] = useState(false);

  // User-Agent 解析
  const [uaInput, setUaInput] = useState('');
  const [uaParsed, setUaParsed] = useState<{ browser: string; os: string; device: string } | null>(null);

  // IP 信息
  const [ipInput, setIpInput] = useState('');
  const [ipInfo, setIpInfo] = useState<Record<string, string> | null>(null);

  // 端口检测
  const [portHost, setPortHost] = useState('');
  const [portStart, setPortStart] = useState(80);
  const [portEnd, setPortEnd] = useState(443);
  const [portResults, setPortResults] = useState<string[]>([]);

  // DNS 记录
  const [dnsDomain, setDnsDomain] = useState('');
  const [dnsType, setDnsType] = useState('A');
  const [dnsResult, setDnsResult] = useState('');

  // 网速测试
  const [speedResult, setSpeedResult] = useState<{ download: number; upload: number } | null>(null);

  // URL 解析
  const handleParseUrl = () => {
    try {
      const url = new URL(urlInput);
      const parsed: Record<string, string> = {
        协议: url.protocol.replace(':', ''),
        主机: url.host,
        域名: url.hostname,
        端口: url.port || '(默认)',
        路径: url.pathname,
        查询: url.search || '(无)',
        锚点: url.hash || '(无)',
      };
      if (url.search) {
        const params = new URLSearchParams(url.search);
        params.forEach((value, key) => { parsed[`参数: ${key}`] = value; });
      }
      setUrlParsed(parsed);
    } catch { setUrlParsed(null); }
  };

  // URL 编解码
  const handleUrlEncode = () => setUrlInput(encodeURIComponent(urlInput));
  const handleUrlDecode = () => { try { setUrlInput(decodeURIComponent(urlInput)); } catch { /* invalid URL */ } };

  // HTTP 请求
  const handleSendRequest = async () => {
    setHttpLoading(true);
    setHttpResponse('');
    try {
      const headers: Record<string, string> = {};
      if (httpHeaders) {
        httpHeaders.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) headers[key] = value;
        });
      }
      const response = await fetch(httpUrl, { method: httpMethod, headers, body: httpMethod !== 'GET' ? httpBody : undefined });
      const text = await response.text();
      let result = `状态: ${response.status} ${response.statusText}\n\nHeaders:\n`;
      response.headers.forEach((value, key) => { result += `  ${key}: ${value}\n`; });
      result += `\nBody:\n${text.substring(0, 5000)}`;
      setHttpResponse(result);
    } catch (e) { setHttpResponse(`请求失败: ${(e as Error).message}`); }
    setHttpLoading(false);
  };

  // User-Agent 解析
  const handleParseUa = () => {
    const ua = uaInput.toLowerCase();
    let browser = '未知', os = '未知', device = '桌面设备';
    if (ua.includes('edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('firefox/')) browser = 'Firefox';
    else if (ua.includes('chrome/')) browser = 'Chrome';
    else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';
    if (ua.includes('windows nt 10')) os = 'Windows 10/11';
    else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
    else if (ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('linux')) os = 'Linux';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = '移动设备';
    else if (ua.includes('tablet') || ua.includes('ipad')) device = '平板设备';
    setUaParsed({ browser, os, device });
  };

  // IP 查询
  const handleIpLookup = async () => {
    try {
      const ip = ipInput || '';
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      if (data.error) {
        setIpInfo({ 错误: data.reason });
      } else {
        setIpInfo({
          IP: data.ip,
          城市: data.city,
          地区: data.region,
          国家: data.country_name,
          运营商: data.org,
          时区: data.timezone,
          经纬度: `${data.latitude}, ${data.longitude}`,
        });
      }
    } catch (e) {
      setIpInfo({ 错误: (e as Error).message });
    }
  };

  // 获取本机 IP
  const handleGetMyIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpInput(data.ip);
    } catch { /* ignore fetch errors */ }
  };

  // 端口扫描（模拟）
  const handlePortScan = () => {
    const results: string[] = [];
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 993, 995, 3306, 3389, 5432, 6379, 8080, 8443, 27017];
    commonPorts.forEach(port => {
      if (port >= portStart && port <= portEnd) {
        results.push(`端口 ${port}: ${getPortService(port)}`);
      }
    });
    setPortResults(results);
  };

  const getPortService = (port: number): string => {
    const services: Record<number, string> = {
      21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'HTTP',
      110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 465: 'SMTPS', 993: 'IMAPS',
      995: 'POP3S', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
      6379: 'Redis', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt', 27017: 'MongoDB',
    };
    return services[port] || '未知服务';
  };

  // DNS 查询（模拟）
  const handleDnsLookup = () => {
    setDnsResult(`DNS ${dnsType} 记录查询结果（模拟）:\n\n域名: ${dnsDomain}\n类型: ${dnsType}\n结果: 此功能需要后端支持`);
  };

  // 网速测试
  const handleSpeedTest = async () => {
    setSpeedResult(null);
    const start = Date.now();
    try {
      await fetch('https://speed.cloudflare.com/__down?bytes=1000000');
      const duration = (Date.now() - start) / 1000;
      const speed = (1 / duration) * 8; // Mbps
      setSpeedResult({ download: Math.round(speed * 100) / 100, upload: 0 });
    } catch {
      setSpeedResult({ download: 0, upload: 0 });
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'url', label: 'URL工具' },
    { key: 'http', label: 'HTTP请求' },
    { key: 'network', label: '网络查询' },
    { key: 'tools', label: '实用工具' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'url' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="URL 解析">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="输入 URL..." style={{ flex: 1 }} />
                <Button variant="primary" onClick={handleParseUrl}>解析</Button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={handleUrlEncode}>编码</Button>
                <Button variant="secondary" size="sm" onClick={handleUrlDecode}>解码</Button>
              </div>
              {urlParsed && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  {Object.entries(urlParsed).map(([key, value]) => (
                    <><span style={{ color: 'var(--text-secondary)' }}>{key}:</span><span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span></>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'http' && (
        <Card title="HTTP 请求构造器">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="select" value={httpMethod} onChange={e => setHttpMethod(e.target.value)} style={{ width: '100px' }}>
                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option><option>HEAD</option><option>OPTIONS</option>
              </select>
              <Input value={httpUrl} onChange={e => setHttpUrl(e.target.value)} placeholder="输入请求 URL" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Headers</div>
                <TextArea value={httpHeaders} onChange={e => setHttpHeaders(e.target.value)} placeholder="Content-Type: application/json" style={{ minHeight: '80px' }} />
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>Body</div>
                <TextArea value={httpBody} onChange={e => setHttpBody(e.target.value)} placeholder='{"key": "value"}' style={{ minHeight: '80px' }} />
              </div>
            </div>
            <Button variant="primary" onClick={handleSendRequest} disabled={httpLoading || !httpUrl}>{httpLoading ? '请求中...' : '发送请求'}</Button>
            {httpResponse && <pre style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', overflow: 'auto', maxHeight: '300px', margin: 0, fontSize: '12px' }}>{httpResponse}</pre>}
          </div>
        </Card>
      )}

      {activeTab === 'network' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="IP 地址查询">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input value={ipInput} onChange={e => setIpInput(e.target.value)} placeholder="输入 IP 地址（留空查询本机）" style={{ flex: 1 }} />
                <Button variant="secondary" onClick={handleGetMyIp}>获取本机IP</Button>
                <Button variant="primary" onClick={handleIpLookup}>查询</Button>
              </div>
              {ipInfo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                  {Object.entries(ipInfo).map(([key, value]) => (
                    <><span style={{ color: 'var(--text-secondary)' }}>{key}:</span><span>{value}</span></>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="端口服务查询">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <Input label="主机" value={portHost} onChange={e => setPortHost(e.target.value)} placeholder="hostname" style={{ flex: 1 }} />
                <Input label="起始端口" type="number" value={portStart} onChange={e => setPortStart(parseInt(e.target.value) || 1)} style={{ width: '100px' }} />
                <Input label="结束端口" type="number" value={portEnd} onChange={e => setPortEnd(parseInt(e.target.value) || 65535)} style={{ width: '100px' }} />
                <Button variant="primary" onClick={handlePortScan}>查询</Button>
              </div>
              {portResults.length > 0 && (
                <div style={{ display: 'grid', gap: '4px' }}>
                  {portResults.map((r, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '13px' }}>{r}</div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="DNS 记录查询">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <Input value={dnsDomain} onChange={e => setDnsDomain(e.target.value)} placeholder="输入域名" style={{ flex: 1 }} />
                <select className="select" value={dnsType} onChange={e => setDnsType(e.target.value)} style={{ width: '100px' }}>
                  <option>A</option><option>AAAA</option><option>MX</option><option>NS</option><option>TXT</option><option>CNAME</option>
                </select>
                <Button variant="primary" onClick={handleDnsLookup}>查询</Button>
              </div>
              {dnsResult && <pre style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', margin: 0 }}>{dnsResult}</pre>}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <Card title="User-Agent 解析">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input value={uaInput} onChange={e => setUaInput(e.target.value)} placeholder="输入 User-Agent 字符串" style={{ flex: 1 }} />
                <Button variant="primary" onClick={handleParseUa}>解析</Button>
              </div>
              {uaParsed && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[{ label: '浏览器', value: uaParsed.browser }, { label: '操作系统', value: uaParsed.os }, { label: '设备类型', value: uaParsed.device }].map(item => (
                    <div key={item.label} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="网速测试">
            <div style={{ display: 'grid', gap: '12px' }}>
              <Button variant="primary" onClick={handleSpeedTest}>开始测速</Button>
              {speedResult && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>下载速度</div>
                    <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--accent-primary)' }}>{speedResult.download}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Mbps</div>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>上传速度</div>
                    <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--accent-success)' }}>{speedResult.upload}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Mbps</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}