import { useState } from 'react';
import { Card, Button } from '../components/common';

const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高'];
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '玉兰', '萍'];
const streets = ['中山路', '人民路', '建设路', '解放路', '长安街', '和平路', '胜利路', '青年路', '文化路', '科技路', '朝阳路', '复兴路'];
const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆', '苏州', '天津'];
const companies = ['科技', '网络', '信息', '软件', '互联网', '数据', '智能', '云计算', '人工智能', '区块链'];
const companySuffixes = ['有限公司', '股份有限公司', '科技有限公司', '网络技术有限公司', '信息技术有限公司'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const result: T[] = [];
  const copy = [...arr];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

const generateId = (): string => {
  const areas = ['110000', '310000', '440100', '440300', '330100', '320100'];
  const area = pick(areas);
  const year = 1970 + Math.floor(Math.random() * 40);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 999)).padStart(3, '0');

  const base = area + year + month + day + seq;

  // Calculate check digit
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(base[i]) * weights[i];
  }

  return base + checkCodes[sum % 11];
};

const generatePhone = (): string => {
  const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  const prefix = pick(prefixes);
  const suffix = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return prefix + suffix;
};

const generateEmail = (): string => {
  const domains = ['qq.com', '163.com', '126.com', 'gmail.com', 'outlook.com', 'sina.com', 'foxmail.com'];
  const pinyin = ['zhang', 'wang', 'li', 'zhao', 'liu', 'chen', 'yang', 'huang', 'zhou', 'wu'];
  const prefix = pick(pinyin) + Math.floor(Math.random() * 1000);
  return `${prefix}@${pick(domains)}`;
};

const generateAddress = (): string => {
  const province = pick(['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省']);
  const city = pick(cities);
  const street = pick(streets);
  const number = Math.floor(Math.random() * 999) + 1;
  const building = Math.floor(Math.random() * 20) + 1;
  const room = Math.floor(Math.random() * 1000) + 1;
  return `${province}${city}市${street}${number}号${building}栋${room}室`;
};

const generateCompany = (): string => {
  const city = pick(cities);
  const name = pickN(companies, 2).join('');
  const suffix = pick(companySuffixes);
  return `${city}${name}${suffix}`;
};

const generateBankCard = (): string => {
  const prefixes = ['6222', '6228', '6217', '6225', '6214'];
  let card = pick(prefixes);
  while (card.length < 16) {
    card += Math.floor(Math.random() * 10);
  }
  return card;
};

interface FakeData {
  name: string;
  gender: string;
  age: number;
  phone: string;
  email: string;
  idCard: string;
  address: string;
  company: string;
  job: string;
  bankCard: string;
}

export default function FakeDataGenerator() {
  const [count, setCount] = useState(5);
  const [data, setData] = useState<FakeData[]>([]);

  const generate = () => {
    const results: FakeData[] = [];
    for (let i = 0; i < count; i++) {
      const gender = Math.random() > 0.5 ? '男' : '女';
      const firstName = pick(firstNames);
      const lastName = pick(lastNames);
      const name = firstName + lastName;

      results.push({
        name,
        gender,
        age: 20 + Math.floor(Math.random() * 40),
        phone: generatePhone(),
        email: generateEmail(),
        idCard: generateId(),
        address: generateAddress(),
        company: generateCompany(),
        job: pick(['前端工程师', '后端工程师', '产品经理', 'UI设计师', '运营专员', '数据分析师', '项目经理', '测试工程师']),
        bankCard: generateBankCard(),
      });
    }
    setData(results);
  };

  const copyData = (item: FakeData) => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
  };

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const exportCSV = () => {
    const headers = ['姓名', '性别', '年龄', '手机号', '邮箱', '身份证', '地址', '公司', '职位', '银行卡'];
    const rows = data.map(item => [
      item.name, item.gender, item.age, item.phone, item.email, item.idCard, item.address, item.company, item.job, item.bankCard
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="假数据生成器">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>生成数量:</span>
              <input
                type="number"
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="input"
                style={{ width: '80px' }}
                min={1}
                max={100}
              />
            </div>
            <Button variant="primary" onClick={generate}>生成数据</Button>
          </div>

          {data.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={copyAll}>复制全部JSON</Button>
                <Button variant="secondary" onClick={exportCSV}>导出CSV</Button>
                <Button variant="secondary" onClick={exportJSON}>导出JSON</Button>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {data.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--border-radius)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 600 }}>{item.name}</span>
                      <Button variant="secondary" size="sm" onClick={() => copyData(item)}>复制</Button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '13px' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>性别:</span> {item.gender}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>年龄:</span> {item.age}岁</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>手机:</span> {item.phone}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>邮箱:</span> {item.email}</div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>身份证:</span> {item.idCard}</div>
                      <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>地址:</span> {item.address}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>公司:</span> {item.company}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>职位:</span> {item.job}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>银行卡:</span> {item.bankCard}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <Card title="使用说明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 生成符合中国国情的虚拟个人信息</div>
          <div>• 包含姓名、性别、年龄、手机号、邮箱、身份证号、地址等</div>
          <div>• 身份证号通过校验算法生成，但非真实号码</div>
          <div>• 支持导出为 JSON 或 CSV 格式</div>
          <div>• 仅用于测试开发，请勿用于非法用途</div>
        </div>
      </Card>
    </div>
  );
}