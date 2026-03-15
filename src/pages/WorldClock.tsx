import { useState, useEffect } from 'react';
import { Card, Button } from '../components/common';

interface TimeZoneInfo {
  id: string;
  name: string;
  offset: number;
  city: string;
}

const timeZones: TimeZoneInfo[] = [
  { id: 'Asia/Shanghai', name: '中国标准时间', offset: 8, city: '北京' },
  { id: 'Asia/Tokyo', name: '日本标准时间', offset: 9, city: '东京' },
  { id: 'Asia/Seoul', name: '韩国标准时间', offset: 9, city: '首尔' },
  { id: 'Asia/Singapore', name: '新加坡时间', offset: 8, city: '新加坡' },
  { id: 'Asia/Hong_Kong', name: '香港时间', offset: 8, city: '香港' },
  { id: 'Asia/Dubai', name: '海湾标准时间', offset: 4, city: '迪拜' },
  { id: 'Europe/London', name: '格林威治时间', offset: 0, city: '伦敦' },
  { id: 'Europe/Paris', name: '中欧时间', offset: 1, city: '巴黎' },
  { id: 'Europe/Berlin', name: '中欧时间', offset: 1, city: '柏林' },
  { id: 'Europe/Moscow', name: '莫斯科时间', offset: 3, city: '莫斯科' },
  { id: 'America/New_York', name: '东部时间', offset: -5, city: '纽约' },
  { id: 'America/Chicago', name: '中部时间', offset: -6, city: '芝加哥' },
  { id: 'America/Denver', name: '山地时间', offset: -7, city: '丹佛' },
  { id: 'America/Los_Angeles', name: '太平洋时间', offset: -8, city: '洛杉矶' },
  { id: 'America/Sao_Paulo', name: '巴西利亚时间', offset: -3, city: '圣保罗' },
  { id: 'Australia/Sydney', name: '澳大利亚东部时间', offset: 11, city: '悉尼' },
  { id: 'Pacific/Auckland', name: '新西兰时间', offset: 13, city: '奥克兰' },
  { id: 'Pacific/Honolulu', name: '夏威夷时间', offset: -10, city: '檀香山' },
];

export default function WorldClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedZones, setSelectedZones] = useState<TimeZoneInfo[]>(() => {
    const saved = localStorage.getItem('devtools-worldclock');
    return saved ? JSON.parse(saved) : timeZones.slice(0, 6);
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('devtools-worldclock', JSON.stringify(selectedZones));
  }, [selectedZones]);

  const getTimeInZone = (zone: TimeZoneInfo): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: zone.id,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return currentTime.toLocaleTimeString('zh-CN', options);
  };

  const getDateInZone = (zone: TimeZoneInfo): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: zone.id,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    };
    return currentTime.toLocaleDateString('zh-CN', options);
  };

  const addZone = (zoneId: string) => {
    const zone = timeZones.find(z => z.id === zoneId);
    if (zone && !selectedZones.find(z => z.id === zoneId)) {
      setSelectedZones(prev => [...prev, zone]);
    }
  };

  const removeZone = (zoneId: string) => {
    setSelectedZones(prev => prev.filter(z => z.id !== zoneId));
  };

  const formatOffset = (offset: number): string => {
    const sign = offset >= 0 ? '+' : '';
    return `UTC${sign}${offset}`;
  };

  const localTime = currentTime.toLocaleTimeString('zh-CN', { hour12: false });
  const localDate = currentTime.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="世界时钟">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Local Time */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              本地时间
            </div>
            <div style={{ fontSize: '36px', fontWeight: 600, fontFamily: 'monospace' }}>
              {localTime}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {localDate}
            </div>
          </div>

          {/* Add Zone */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="input"
              style={{ flex: 1 }}
              onChange={e => {
                addZone(e.target.value);
                e.target.value = '';
              }}
              value=""
            >
              <option value="">添加时区...</option>
              {timeZones
                .filter(z => !selectedZones.find(s => s.id === z.id))
                .map(z => (
                  <option key={z.id} value={z.id}>
                    {z.city} ({formatOffset(z.offset)})
                  </option>
                ))}
            </select>
          </div>

          {/* Time Zones Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {selectedZones.map(zone => (
              <div
                key={zone.id}
                style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => removeZone(zone.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  ×
                </button>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {zone.city}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'monospace', margin: '4px 0' }}>
                  {getTimeInZone(zone)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {getDateInZone(zone)} · {formatOffset(zone.offset)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Time Converter */}
      <Card title="时区转换">
        <TimeConverter />
      </Card>

      <Card title="说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 点击下拉菜单添加更多时区</div>
          <div>• 点击时区卡片右上角的 × 移除时区</div>
          <div>• 选择的时区会自动保存到浏览器</div>
          <div>• 时区偏移基于标准时间，夏令时可能有所不同</div>
        </div>
      </Card>
    </div>
  );
}

function TimeConverter() {
  const [sourceZone, setSourceZone] = useState('Asia/Shanghai');
  const [targetZone, setTargetZone] = useState('America/New_York');
  const [inputTime, setInputTime] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{ time: string; date: string } | null>(null);

  const convertTime = () => {
    if (!inputTime || !inputDate) return;

    const [hours, minutes] = inputTime.split(':').map(Number);
    const sourceDate = new Date(inputDate);
    sourceDate.setHours(hours, minutes, 0, 0);

    // Create formatter for target timezone
    const targetTime = sourceDate.toLocaleTimeString('zh-CN', {
      timeZone: targetZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const targetDate = sourceDate.toLocaleDateString('zh-CN', {
      timeZone: targetZone,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });

    setResult({ time: targetTime, date: targetDate });
  };

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>源时区</div>
          <select
            className="input"
            value={sourceZone}
            onChange={e => setSourceZone(e.target.value)}
          >
            {timeZones.map(z => (
              <option key={z.id} value={z.id}>{z.city}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>目标时区</div>
          <select
            className="input"
            value={targetZone}
            onChange={e => setTargetZone(e.target.value)}
          >
            {timeZones.map(z => (
              <option key={z.id} value={z.id}>{z.city}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>日期</div>
          <input
            type="date"
            className="input"
            value={inputDate}
            onChange={e => setInputDate(e.target.value)}
          />
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>时间</div>
          <input
            type="time"
            className="input"
            value={inputTime}
            onChange={e => setInputTime(e.target.value)}
          />
        </div>
      </div>
      <Button variant="primary" onClick={convertTime}>转换</Button>
      {result && (
        <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>{result.time}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{result.date}</div>
        </div>
      )}
    </div>
  );
}