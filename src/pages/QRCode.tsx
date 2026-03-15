import { useState, useMemo } from 'react';
import { Card, Button, Input } from '../components/common';
import { generateQRCodeUrl, downloadQRCode, formatQRData, type QRDataType } from '../utils/qrcode';

interface QRTypeOption {
  type: QRDataType;
  label: string;
  icon: string;
}

const qrTypes: QRTypeOption[] = [
  { type: 'text', label: '文本', icon: '📝' },
  { type: 'url', label: '链接', icon: '🔗' },
  { type: 'email', label: '邮箱', icon: '📧' },
  { type: 'phone', label: '电话', icon: '📱' },
  { type: 'wifi', label: 'WiFi', icon: '📶' },
  { type: 'vcard', label: '名片', icon: '👤' },
];

export default function QRCode() {
  const [qrType, setQrType] = useState<QRDataType>('text');
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');

  // WiFi 特有字段
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // vCard 特有字段
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const qrData = useMemo(() => {
    if (qrType === 'wifi') {
      if (!ssid) return '';
      return formatQRData({ type: 'wifi', ssid, password, security });
    }
    if (qrType === 'vcard') {
      if (!name) return '';
      return formatQRData({ type: 'vcard', name, phone, email, address });
    }
    if (!text) return '';
    return formatQRData({ type: qrType, value: text });
  }, [qrType, text, ssid, password, security, name, phone, email, address]);

  const qrCodeUrl = useMemo(() => {
    if (!qrData) return '';
    return generateQRCodeUrl(qrData, { size, bgColor, fgColor });
  }, [qrData, size, bgColor, fgColor]);

  const handleDownload = async () => {
    if (!qrData) return;
    await downloadQRCode(qrData, { size, bgColor, fgColor, filename: `qrcode-${qrType}.png` });
  };

  const handleCopy = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderInputFields = () => {
    switch (qrType) {
      case 'wifi':
        return (
          <div style={{ display: 'grid', gap: '12px' }}>
            <Input
              label="WiFi 名称 (SSID)"
              value={ssid}
              onChange={e => setSsid(e.target.value)}
              placeholder="输入 WiFi 名称..."
            />
            <Input
              label="密码"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="输入 WiFi 密码..."
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>加密方式：</span>
              {(['WPA', 'WEP', 'nopass'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSecurity(s)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    background: security === s ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: security === s ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {s === 'nopass' ? '无密码' : s}
                </button>
              ))}
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div style={{ display: 'grid', gap: '12px' }}>
            <Input
              label="姓名"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入姓名..."
            />
            <Input
              label="电话"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="输入电话号码..."
            />
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="输入邮箱地址..."
            />
            <Input
              label="地址"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="输入地址..."
            />
          </div>
        );

      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {qrType === 'url' ? '链接地址' : qrType === 'email' ? '邮箱地址' : qrType === 'phone' ? '电话号码' : '文本内容'}
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={
                qrType === 'url'
                  ? 'https://example.com'
                  : qrType === 'email'
                  ? 'example@email.com'
                  : qrType === 'phone'
                  ? '+8613800138000'
                  : '输入文本内容...'
              }
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                resize: 'vertical',
              }}
            />
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
      {/* 左侧：输入 */}
      <div style={{ display: 'grid', gap: '20px' }}>
        <Card title="二维码类型">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {qrTypes.map(item => (
              <button
                key={item.type}
                onClick={() => {
                  setQrType(item.type);
                  setText('');
                  setSsid('');
                  setPassword('');
                  setName('');
                  setPhone('');
                  setEmail('');
                  setAddress('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  background: qrType === item.type ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: qrType === item.type ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card title="内容输入">{renderInputFields()}</Card>

        <Card title="样式设置">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                尺寸: {size}px
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={size}
                onChange={e => setSize(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                前景色
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={e => setFgColor(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                背景色
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 右侧：预览 */}
      <Card title="预览">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            minHeight: '300px',
          }}
        >
          {qrCodeUrl ? (
            <>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 'var(--border-radius)',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary" onClick={handleDownload}>
                  下载
                </Button>
                <Button variant="secondary" onClick={handleCopy}>
                  复制图片
                </Button>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 20px' }}>
              输入内容后生成二维码
            </div>
          )}
        </div>

        {qrData && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>编码数据：</div>
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                maxHeight: '80px',
                overflow: 'auto',
              }}
            >
              {qrData}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}