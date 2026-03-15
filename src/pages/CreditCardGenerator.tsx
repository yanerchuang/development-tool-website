import { useState } from 'react';
import { Card, Button } from '../components/common';

interface CreditCard {
  number: string;
  type: string;
}

const cardPatterns: { pattern: RegExp; type: string }[] = [
  { pattern: /^4/, type: 'Visa' },
  { pattern: /^5[1-5]/, type: 'MasterCard' },
  { pattern: /^3[47]/, type: 'American Express' },
  { pattern: /^6(?:011|5)/, type: 'Discover' },
  { pattern: /^(?:2131|1800|35\d{3})/, type: 'JCB' },
  { pattern: /^3(?:0[0-5]|[68])/, type: 'Diners Club' },
  { pattern: /^(6304|6706|6709|6771)/, type: 'Laser' },
  { pattern: /^(5018|5020|5038|6304|6759|676[1-3])/, type: 'Maestro' },
];

const detectCardType = (number: string): string => {
  const cleanNumber = number.replace(/\D/g, '');
  for (const { pattern, type } of cardPatterns) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  return 'Unknown';
};

const luhnCheck = (number: string): boolean => {
  const cleanNumber = number.replace(/\D/g, '');
  if (!/^\d+$/.test(cleanNumber)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const generateCard = (type: string): string => {
  const prefixes: Record<string, string[]> = {
    'Visa': ['4'],
    'MasterCard': ['51', '52', '53', '54', '55'],
    'American Express': ['34', '37'],
    'Discover': ['6011', '65'],
  };

  const lengths: Record<string, number> = {
    'Visa': 16,
    'MasterCard': 16,
    'American Express': 15,
    'Discover': 16,
  };

  const prefix = prefixes[type]?.[Math.floor(Math.random() * prefixes[type].length)] || '4';
  const length = lengths[type] || 16;

  let number = prefix;
  while (number.length < length - 1) {
    number += Math.floor(Math.random() * 10).toString();
  }

  // Calculate check digit using Luhn algorithm
  let sum = 0;
  let isEven = true;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  number += checkDigit.toString();

  return number;
};

const formatCardNumber = (number: string): string => {
  const cleanNumber = number.replace(/\D/g, '');
  return cleanNumber.replace(/(\d{4})/g, '$1 ').trim();
};

export default function CreditCardGenerator() {
  const [cardNumber, setCardNumber] = useState('');
  const [generatedCards, setGeneratedCards] = useState<CreditCard[]>([]);
  const [selectedType, setSelectedType] = useState('Visa');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(value);
  };

  const validateCard = () => {
    if (!cardNumber) return;
    const isValid = luhnCheck(cardNumber);
    const type = detectCardType(cardNumber);
    return { isValid, type };
  };

  const generateSingle = () => {
    const number = generateCard(selectedType);
    const type = detectCardType(number);
    setGeneratedCards(prev => [{ number, type }, ...prev]);
  };

  const generateBulk = (count: number) => {
    const cards: CreditCard[] = [];
    for (let i = 0; i < count; i++) {
      const number = generateCard(selectedType);
      const type = detectCardType(number);
      cards.push({ number, type });
    }
    setGeneratedCards(prev => [...cards, ...prev]);
  };

  const copyCard = (number: string) => {
    navigator.clipboard.writeText(number);
  };

  const clearCards = () => {
    setGeneratedCards([]);
  };

  const validation = validateCard();

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="信用卡号验证">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '13px' }}>
              输入卡号
            </div>
            <input
              type="text"
              value={formatCardNumber(cardNumber)}
              onChange={handleInputChange}
              placeholder="XXXX XXXX XXXX XXXX"
              className="input"
              style={{ width: '100%', fontFamily: 'monospace' }}
              maxLength={19}
            />
          </div>

          {cardNumber && validation && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              display: 'grid',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>卡类型</span>
                <span style={{ fontWeight: 500 }}>{validation.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>验证结果</span>
                <span style={{
                  padding: '4px 8px',
                  background: validation.isValid ? 'var(--success)' : 'var(--error)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  {validation.isValid ? '有效' : '无效'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>位数</span>
                <span style={{ fontWeight: 500 }}>{cardNumber.length} 位</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="测试卡号生成">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Visa', 'MasterCard', 'American Express', 'Discover'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: selectedType === type ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: selectedType === type ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--border-radius)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={generateSingle}>生成1个</Button>
            <Button variant="secondary" onClick={() => generateBulk(5)}>生成5个</Button>
            <Button variant="secondary" onClick={() => generateBulk(10)}>生成10个</Button>
            {generatedCards.length > 0 && (
              <Button variant="secondary" onClick={clearCards}>清空</Button>
            )}
          </div>

          {generatedCards.length > 0 && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {generatedCards.map((card, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px' }}>
                      {formatCardNumber(card.number)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {card.type}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => copyCard(card.number)}>
                    复制
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="免责声明">
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>• 生成的卡号仅用于测试目的，不能用于实际交易</div>
          <div>• 这些卡号通过了 Luhn 算法验证，但不是真实的信用卡</div>
          <div>• 请勿将生成的卡号用于任何非法用途</div>
          <div>• Luhn 算法用于验证卡号格式，但不验证卡是否真实存在</div>
        </div>
      </Card>
    </div>
  );
}