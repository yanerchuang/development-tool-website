import { useState } from 'react';
import { Card, Button, Input, TextArea } from '../components/common';

type DataType = 'uuid' | 'email' | 'phone' | 'name' | 'address' | 'company' | 'date' | 'number' | 'color' | 'ip' | 'url' | 'creditCard';

interface DataGenerator {
  type: DataType;
  label: string;
  generate: () => string;
}

const generators: DataGenerator[] = [
  {
    type: 'uuid',
    label: 'UUID',
    generate: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
  },
  {
    type: 'email',
    label: '邮箱',
    generate: () => {
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'qq.com', '163.com'];
      const names = ['john', 'jane', 'mike', 'lisa', 'david', 'emma', 'alex', 'sarah', 'test', 'demo', 'user', 'admin'];
      return `${names[Math.floor(Math.random() * names.length)]}${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
  },
  {
    type: 'phone',
    label: '手机号',
    generate: () => {
      const prefixes = ['138', '139', '150', '151', '152', '158', '159', '186', '187', '188', '189'];
      return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    },
  },
  {
    type: 'name',
    label: '姓名',
    generate: () => {
      const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
      const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '华', '平', '刚'];
      return `${surnames[Math.floor(Math.random() * surnames.length)]}${names[Math.floor(Math.random() * names.length)]}`;
    },
  },
  {
    type: 'address',
    label: '地址',
    generate: () => {
      const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '四川省', '湖北省', '河南省'];
      const cities = ['朝阳区', '海淀区', '浦东新区', '天河区', '福田区', '江宁区', '西湖区'];
      const streets = ['中关村大街', '南京路', '中山路', '人民路', '建设路', '解放路', '和平路'];
      return `${provinces[Math.floor(Math.random() * provinces.length)]}${cities[Math.floor(Math.random() * cities.length)]}${streets[Math.floor(Math.random() * streets.length)]}${Math.floor(Math.random() * 200) + 1}号`;
    },
  },
  {
    type: 'company',
    label: '公司',
    generate: () => {
      const prefixes = ['腾讯', '阿里', '百度', '华为', '小米', '字节', '京东', '美团', '网易', '滴滴'];
      const suffixes = ['科技有限公司', '网络技术有限公司', '信息技术有限公司', '互联网有限公司', '软件有限公司'];
      return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    },
  },
  {
    type: 'date',
    label: '日期',
    generate: () => {
      const start = new Date(2000, 0, 1);
      const end = new Date();
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split('T')[0];
    },
  },
  {
    type: 'number',
    label: '数字',
    generate: () => {
      return Math.floor(Math.random() * 1000000).toString();
    },
  },
  {
    type: 'color',
    label: '颜色',
    generate: () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    },
  },
  {
    type: 'ip',
    label: 'IP地址',
    generate: () => {
      return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    },
  },
  {
    type: 'url',
    label: 'URL',
    generate: () => {
      const domains = ['example.com', 'test.org', 'demo.net', 'sample.io'];
      const paths = ['', '/api', '/users', '/products', '/data', '/page'];
      return `https://${domains[Math.floor(Math.random() * domains.length)]}${paths[Math.floor(Math.random() * paths.length)]}`;
    },
  },
  {
    type: 'creditCard',
    label: '银行卡号',
    generate: () => {
      const prefix = '6';
      let number = prefix;
      for (let i = 0; i < 18; i++) {
        number += Math.floor(Math.random() * 10);
      }
      return number;
    },
  },
];

export default function RandomData() {
  const [selectedTypes, setSelectedTypes] = useState<DataType[]>(['uuid', 'email', 'phone', 'name']);
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<'text' | 'json' | 'csv'>('text');

  const toggleType = (type: DataType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const generateData = () => {
    const results: Record<string, string[]>[] = [];

    for (let i = 0; i < count; i++) {
      const row: Record<string, string[]> = {};
      selectedTypes.forEach(type => {
        const generator = generators.find(g => g.type === type);
        if (generator) {
          row[generator.label] = [generator.generate()];
        }
      });
      results.push(row);
    }

    let formatted = '';
    if (format === 'json') {
      formatted = JSON.stringify(results.map(row => {
        const obj: Record<string, string> = {};
        Object.entries(row).forEach(([key, [value]]) => {
          obj[key] = value;
        });
        return obj;
      }), null, 2);
    } else if (format === 'csv') {
      const headers = selectedTypes.map(type => generators.find(g => g.type === type)?.label || type);
      formatted = headers.join(',') + '\n';
      results.forEach(row => {
        const values = selectedTypes.map(type => {
          const label = generators.find(g => g.type === type)?.label || type;
          return row[label]?.[0] || '';
        });
        formatted += values.join(',') + '\n';
      });
    } else {
      results.forEach((row, index) => {
        formatted += `--- 第 ${index + 1} 条 ---\n`;
        Object.entries(row).forEach(([key, [value]]) => {
          formatted += `${key}: ${value}\n`;
        });
        formatted += '\n';
      });
    }

    setOutput(formatted);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="随机数据生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Data Types */}
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>选择数据类型</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {generators.map(gen => (
                <Button
                  key={gen.type}
                  variant={selectedTypes.includes(gen.type) ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => toggleType(gen.type)}
                >
                  {gen.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Input
              label="生成数量"
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
              style={{ width: '120px' }}
            />
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>输出格式</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['text', 'json', 'csv'] as const).map(f => (
                  <Button
                    key={f}
                    variant={format === f ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFormat(f)}
                  >
                    {f.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button variant="primary" onClick={generateData}>生成数据</Button>
        </div>
      </Card>

      {/* Output */}
      <Card title="生成结果">
        <div style={{ display: 'grid', gap: '12px' }}>
          <div className="tool-panel-header">
            <span className="tool-panel-title">{count} 条数据</span>
            <div className="tool-actions">
              <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
            </div>
          </div>
          <TextArea
            value={output}
            readOnly
            placeholder="点击'生成数据'查看结果..."
            style={{ minHeight: '300px', fontFamily: format === 'json' ? 'monospace' : 'inherit' }}
          />
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 选择需要的数据类型，支持多选</div>
          <div>• 设置生成数量（1-1000条）</div>
          <div>• 选择输出格式：文本、JSON 或 CSV</div>
          <div>• 生成的数据仅用于测试目的，非真实数据</div>
        </div>
      </Card>
    </div>
  );
}