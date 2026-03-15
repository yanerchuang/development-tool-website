// 使用 QR Server API 生成二维码
export const generateQRCodeUrl = (
  text: string,
  options: {
    size?: number;
    bgColor?: string;
    fgColor?: string;
  } = {}
): string => {
  const { size = 200, bgColor = 'ffffff', fgColor = '000000' } = options;

  // 使用 QR Server API (免费，无需 API key)
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    bgcolor: bgColor.replace('#', ''),
    color: fgColor.replace('#', ''),
  });

  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
};

// 下载二维码图片
export const downloadQRCode = async (
  text: string,
  options: {
    size?: number;
    bgColor?: string;
    fgColor?: string;
    filename?: string;
  } = {}
): Promise<void> => {
  const url = generateQRCodeUrl(text, options);

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = options.filename || 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Failed to download QR code:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};

// 支持的数据类型
export type QRDataType = 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'vcard';

export interface QRData {
  type: QRDataType;
  value?: string;
  ssid?: string;
  password?: string;
  security?: 'WPA' | 'WEP' | 'nopass';
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// 格式化二维码数据
export const formatQRData = (data: QRData): string => {
  const value = data.value || '';
  switch (data.type) {
    case 'url':
      return value.startsWith('http') ? value : `https://${value}`;
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value}`;
    case 'wifi':
      return `WIFI:T:${data.security || 'WPA'};S:${data.ssid || ''};P:${data.password || ''};;`;
    case 'vcard':
      return `BEGIN:VCARD
VERSION:3.0
FN:${data.name || ''}
TEL:${data.phone || ''}
EMAIL:${data.email || ''}
ADR:;;${data.address || ''};;;
END:VCARD`;
    default:
      return value;
  }
};