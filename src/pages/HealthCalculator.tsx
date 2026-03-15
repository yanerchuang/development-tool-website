import { useState } from 'react';
import { Card, Button, Input } from '../components/common';

type HealthType = 'bmi' | 'bodyFat' | 'bmr' | 'bloodPressure' | 'bloodSugar' | 'uricAcid' | 'bloodLipid' | 'waist';

interface HealthResult {
  value: number | string;
  status: string;
  statusColor: string;
  description: string;
  recommendations?: string[];
}

export default function HealthCalculator() {
  const [activeTab, setActiveTab] = useState<HealthType>('bmi');

  // BMI
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<HealthResult | null>(null);

  // Body Fat
  const [waist, setWaist] = useState('');
  const [neck, setNeck] = useState('');
  const [hip, setHip] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [bodyFatResult, setBodyFatResult] = useState<HealthResult | null>(null);

  // BMR
  const [bmrResult, setBmrResult] = useState<HealthResult | null>(null);
  const [activityLevel, setActivityLevel] = useState(1.2);

  // Blood Pressure
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bpResult, setBpResult] = useState<HealthResult | null>(null);

  // Blood Sugar
  const [bloodSugar, setBloodSugar] = useState('');
  const [sugarType, setSugarType] = useState<'fasting' | 'afterMeal' | 'random'>('fasting');
  const [sugarResult, setSugarResult] = useState<HealthResult | null>(null);

  // Uric Acid
  const [uricAcidValue, setUricAcidValue] = useState('');
  const [uricAcidUnit, setUricAcidUnit] = useState<'umol' | 'mgdl'>('umol');
  const [uricAcidGender, setUricAcidGender] = useState<'male' | 'female'>('male');
  const [uricAcidResult, setUricAcidResult] = useState<HealthResult | null>(null);

  // Blood Lipid
  const [totalCholesterol, setTotalCholesterol] = useState('');
  const [ldl, setLdl] = useState('');
  const [hdl, setHdl] = useState('');
  const [triglycerides, setTriglycerides] = useState('');
  const [lipidResult, setLipidResult] = useState<HealthResult | null>(null);

  // Waist to Height
  const [waistHeight, setWaistHeight] = useState('');
  const [waistResult, setWaistResult] = useState<HealthResult | null>(null);

  // BMI Calculation
  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // cm to m
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) {
      return;
    }

    const bmi = w / (h * h);
    let status: string;
    let statusColor: string;
    let description: string;
    const recommendations: string[] = [];

    if (bmi < 18.5) {
      status = '偏瘦';
      statusColor = '#3b82f6';
      description = '体重过轻，可能存在营养不良风险';
      recommendations.push('增加优质蛋白质摄入', '适量增加碳水化合物', '规律进餐，避免挑食');
    } else if (bmi < 24) {
      status = '正常';
      statusColor = '#22c55e';
      description = '体重在健康范围内，继续保持';
      recommendations.push('保持均衡饮食', '坚持适量运动', '定期体检');
    } else if (bmi < 28) {
      status = '超重';
      statusColor = '#f59e0b';
      description = '体重超标，需要关注';
      recommendations.push('控制总热量摄入', '增加有氧运动', '减少高脂高糖食物');
    } else {
      status = '肥胖';
      statusColor = '#ef4444';
      description = '肥胖，建议咨询医生制定减重计划';
      recommendations.push('寻求专业医疗建议', '严格控制饮食', '循序渐进增加运动量');
    }

    setBmiResult({
      value: bmi.toFixed(1),
      status,
      statusColor,
      description,
      recommendations,
    });
  };

  // Body Fat Calculation (US Navy Method)
  const calculateBodyFat = () => {
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(hip);
    const a = parseFloat(age);
    const heightCm = parseFloat(height);

    if (!w || !n || !heightCm || !a) return;

    let bodyFatPercent: number;

    if (gender === 'male') {
      bodyFatPercent = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      if (!h) return;
      bodyFatPercent = 495 / (1.29579 - 0.35004 * Math.log10(w + h - n) + 0.22100 * Math.log10(heightCm)) - 450;
    }

    let status: string;
    let statusColor: string;

    if (gender === 'male') {
      if (bodyFatPercent < 6) { status = '必需脂肪'; statusColor = '#3b82f6'; }
      else if (bodyFatPercent < 14) { status = '运动员'; statusColor = '#22c55e'; }
      else if (bodyFatPercent < 18) { status = '健康'; statusColor = '#22c55e'; }
      else if (bodyFatPercent < 25) { status = '可接受'; statusColor = '#f59e0b'; }
      else { status = '肥胖'; statusColor = '#ef4444'; }
    } else {
      if (bodyFatPercent < 14) { status = '必需脂肪'; statusColor = '#3b82f6'; }
      else if (bodyFatPercent < 21) { status = '运动员'; statusColor = '#22c55e'; }
      else if (bodyFatPercent < 25) { status = '健康'; statusColor = '#22c55e'; }
      else if (bodyFatPercent < 32) { status = '可接受'; statusColor = '#f59e0b'; }
      else { status = '肥胖'; statusColor = '#ef4444'; }
    }

    setBodyFatResult({
      value: bodyFatPercent.toFixed(1) + '%',
      status,
      statusColor,
      description: `根据美国海军体脂计算公式估算，您的体脂率为 ${bodyFatPercent.toFixed(1)}%`,
    });
  };

  // BMR Calculation (Mifflin-St Jeor)
  const calculateBMR = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);

    if (!h || !w || !a) return;

    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    const tdee = bmr * activityLevel;

    setBmrResult({
      value: `${Math.round(bmr)} kcal/天`,
      status: '基础代谢率',
      statusColor: '#3b82f6',
      description: `每日总能量消耗(TDEE): ${Math.round(tdee)} kcal`,
      recommendations: [
        `减重建议摄入: ${Math.round(tdee - 500)} kcal/天`,
        `维持体重摄入: ${Math.round(tdee)} kcal/天`,
        `增重建议摄入: ${Math.round(tdee + 300)} kcal/天`,
      ],
    });
  };

  // Blood Pressure Evaluation
  const evaluateBloodPressure = () => {
    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);

    if (!sys || !dia) return;

    let status: string;
    let statusColor: string;
    let description: string;

    if (sys < 90 || dia < 60) {
      status = '低血压';
      statusColor = '#3b82f6';
      description = '血压偏低，可能出现头晕、乏力等症状';
    } else if (sys < 120 && dia < 80) {
      status = '理想血压';
      statusColor = '#22c55e';
      description = '血压在理想范围内，继续保持健康生活方式';
    } else if (sys < 140 && dia < 90) {
      status = '正常高值';
      statusColor = '#f59e0b';
      description = '血压偏高但未达高血压标准，建议改善生活方式';
    } else if (sys < 160 || dia < 100) {
      status = '高血压1级';
      statusColor = '#f97316';
      description = '轻度高血压，建议就医并改善生活方式';
    } else if (sys < 180 || dia < 110) {
      status = '高血压2级';
      statusColor = '#ef4444';
      description = '中度高血压，需要药物治疗，请及时就医';
    } else {
      status = '高血压3级';
      statusColor = '#dc2626';
      description = '重度高血压，请立即就医！';
    }

    setBpResult({
      value: `${sys}/${dia} mmHg`,
      status,
      statusColor,
      description,
    });
  };

  // Blood Sugar Evaluation
  const evaluateBloodSugar = () => {
    const sugar = parseFloat(bloodSugar);

    if (!sugar) return;

    let status: string;
    let statusColor: string;
    const normalRanges: Record<string, string> = {
      fasting: '3.9-6.1 mmol/L',
      afterMeal: '<7.8 mmol/L',
      random: '<11.1 mmol/L',
    };

    if (sugarType === 'fasting') {
      if (sugar < 3.9) {
        status = '低血糖';
        statusColor = '#3b82f6';
      } else if (sugar <= 6.1) {
        status = '正常';
        statusColor = '#22c55e';
      } else if (sugar <= 7.0) {
        status = '空腹血糖受损';
        statusColor = '#f59e0b';
      } else {
        status = '疑似糖尿病';
        statusColor = '#ef4444';
      }
    } else if (sugarType === 'afterMeal') {
      if (sugar < 7.8) {
        status = '正常';
        statusColor = '#22c55e';
      } else if (sugar <= 11.1) {
        status = '糖耐量异常';
        statusColor = '#f59e0b';
      } else {
        status = '疑似糖尿病';
        statusColor = '#ef4444';
      }
    } else {
      if (sugar < 11.1) {
        status = '正常';
        statusColor = '#22c55e';
      } else {
        status = '疑似糖尿病';
        statusColor = '#ef4444';
      }
    }

    setSugarResult({
      value: `${sugar} mmol/L`,
      status,
      statusColor,
      description: `正常参考范围: ${normalRanges[sugarType]}`,
    });
  };

  // Uric Acid Evaluation
  const evaluateUricAcid = () => {
    const ua = parseFloat(uricAcidValue);

    if (!ua) return;

    // Convert mg/dL to μmol/L if needed (1 mg/dL = 59.48 μmol/L)
    const umolValue = uricAcidUnit === 'mgdl' ? ua * 59.48 : ua;

    let status: string;
    let statusColor: string;
    let description: string;

    const normalRange = uricAcidGender === 'male' ? '208-428 μmol/L' : '155-357 μmol/L';
    const lowThreshold = uricAcidGender === 'male' ? 208 : 155;
    const highThreshold = uricAcidGender === 'male' ? 428 : 357;

    if (umolValue < lowThreshold) {
      status = '偏低';
      statusColor = '#3b82f6';
      description = '尿酸偏低，可能与营养不良或肝脏问题有关';
    } else if (umolValue <= highThreshold) {
      status = '正常';
      statusColor = '#22c55e';
      description = `尿酸在正常范围内 (${normalRange})`;
    } else if (umolValue <= highThreshold + 100) {
      status = '偏高';
      statusColor = '#f59e0b';
      description = '尿酸偏高，建议控制饮食，减少高嘌呤食物摄入';
    } else {
      status = '明显升高';
      statusColor = '#ef4444';
      description = '尿酸明显升高，高尿酸血症风险，建议就医';
    }

    setUricAcidResult({
      value: `${Math.round(umolValue)} μmol/L`,
      status,
      statusColor,
      description,
      recommendations: [
        '减少高嘌呤食物（海鲜、动物内脏、啤酒）',
        '多喝水，促进尿酸排泄',
        '适当运动，控制体重',
      ],
    });
  };

  // Blood Lipid Evaluation
  const evaluateBloodLipid = () => {
    const tc = parseFloat(totalCholesterol);
    const ldlVal = parseFloat(ldl);
    const hdlVal = parseFloat(hdl);
    const tg = parseFloat(triglycerides);

    if (!tc) return;

    const results: string[] = [];

    // Total Cholesterol
    if (tc < 5.2) {
      results.push(`总胆固醇 ${tc} mmol/L - 正常 (<5.2)`);
    } else if (tc < 6.2) {
      results.push(`总胆固醇 ${tc} mmol/L - 边缘升高 (5.2-6.2)`);
    } else {
      results.push(`总胆固醇 ${tc} mmol/L - 升高 (≥6.2)`);
    }

    // LDL
    if (ldlVal) {
      if (ldlVal < 3.4) {
        results.push(`低密度脂蛋白 ${ldlVal} mmol/L - 正常 (<3.4)`);
      } else if (ldlVal < 4.1) {
        results.push(`低密度脂蛋白 ${ldlVal} mmol/L - 边缘升高 (3.4-4.1)`);
      } else {
        results.push(`低密度脂蛋白 ${ldlVal} mmol/L - 升高 (≥4.1)`);
      }
    }

    // HDL
    if (hdlVal) {
      if (hdlVal >= 1.0) {
        results.push(`高密度脂蛋白 ${hdlVal} mmol/L - 正常 (≥1.0)`);
      } else {
        results.push(`高密度脂蛋白 ${hdlVal} mmol/L - 偏低 (<1.0)`);
      }
    }

    // Triglycerides
    if (tg) {
      if (tg < 1.7) {
        results.push(`甘油三酯 ${tg} mmol/L - 正常 (<1.7)`);
      } else if (tg < 2.3) {
        results.push(`甘油三酯 ${tg} mmol/L - 边缘升高 (1.7-2.3)`);
      } else {
        results.push(`甘油三酯 ${tg} mmol/L - 升高 (≥2.3)`);
      }
    }

    setLipidResult({
      value: tc + ' mmol/L',
      status: tc >= 6.2 ? '血脂异常' : '基本正常',
      statusColor: tc >= 6.2 ? '#ef4444' : '#22c55e',
      description: results.join('\n'),
    });
  };

  // Waist to Height Ratio
  const calculateWaistHeightRatio = () => {
    const w = parseFloat(waist);
    const h = parseFloat(waistHeight);

    if (!w || !h) return;

    const ratio = w / h;
    let status: string;
    let statusColor: string;

    if (ratio < 0.4) {
      status = '过瘦';
      statusColor = '#3b82f6';
    } else if (ratio < 0.5) {
      status = '健康';
      statusColor = '#22c55e';
    } else if (ratio < 0.6) {
      status = '需注意';
      statusColor = '#f59e0b';
    } else {
      status = '高风险';
      statusColor = '#ef4444';
    }

    setWaistResult({
      value: ratio.toFixed(2),
      status,
      statusColor,
      description: `腰高比 = 腰围/身高，健康范围 < 0.5`,
    });
  };

  const tabs: { key: HealthType; label: string }[] = [
    { key: 'bmi', label: 'BMI' },
    { key: 'bodyFat', label: '体脂率' },
    { key: 'bmr', label: '代谢率' },
    { key: 'bloodPressure', label: '血压' },
    { key: 'bloodSugar', label: '血糖' },
    { key: 'uricAcid', label: '尿酸' },
    { key: 'bloodLipid', label: '血脂' },
    { key: 'waist', label: '腰高比' },
  ];

  const renderResult = (result: HealthResult | null) => {
    if (!result) return null;
    return (
      <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'monospace' }}>{result.value}</span>
          <span style={{ padding: '6px 12px', background: result.statusColor, color: 'white', borderRadius: '20px', fontSize: '14px', fontWeight: 500 }}>
            {result.status}
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)', marginBottom: result.recommendations ? '12px' : 0 }}>
          {result.description}
        </div>
        {result.recommendations && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>建议：</div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {result.recommendations.map((rec, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* BMI */}
      {activeTab === 'bmi' && (
        <Card title="BMI 身体质量指数">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="身高 (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
              <Input label="体重 (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" />
            </div>
            <Button variant="primary" onClick={calculateBMI}>计算 BMI</Button>
            {renderResult(bmiResult)}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>BMI 参考标准：</strong><br />
              偏瘦 &lt; 18.5 | 正常 18.5-23.9 | 超重 24-27.9 | 肥胖 ≥ 28
            </div>
          </div>
        </Card>
      )}

      {/* Body Fat */}
      {activeTab === 'bodyFat' && (
        <Card title="体脂率计算">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant={gender === 'male' ? 'primary' : 'secondary'} onClick={() => setGender('male')}>男性</Button>
              <Button variant={gender === 'female' ? 'primary' : 'secondary'} onClick={() => setGender('female')}>女性</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Input label="身高 (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
              <Input label="年龄" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
              <Input label="颈围 (cm)" type="number" value={neck} onChange={e => setNeck(e.target.value)} placeholder="38" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="腰围 (cm)" type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="85" />
              {gender === 'female' && (
                <Input label="臀围 (cm)" type="number" value={hip} onChange={e => setHip(e.target.value)} placeholder="95" />
              )}
            </div>
            <Button variant="primary" onClick={calculateBodyFat}>计算体脂率</Button>
            {renderResult(bodyFatResult)}
          </div>
        </Card>
      )}

      {/* BMR */}
      {activeTab === 'bmr' && (
        <Card title="基础代谢率 (BMR)">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant={gender === 'male' ? 'primary' : 'secondary'} onClick={() => setGender('male')}>男性</Button>
              <Button variant={gender === 'female' ? 'primary' : 'secondary'} onClick={() => setGender('female')}>女性</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <Input label="身高 (cm)" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
              <Input label="体重 (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" />
              <Input label="年龄" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>活动水平</div>
              <select className="select" value={activityLevel} onChange={e => setActivityLevel(Number(e.target.value))}>
                <option value={1.2}>久坐不动 (办公室工作)</option>
                <option value={1.375}>轻度活动 (每周运动1-3次)</option>
                <option value={1.55}>中度活动 (每周运动3-5次)</option>
                <option value={1.725}>高度活动 (每周运动6-7次)</option>
                <option value={1.9}>极高活动 (体力劳动/运动员)</option>
              </select>
            </div>
            <Button variant="primary" onClick={calculateBMR}>计算代谢率</Button>
            {renderResult(bmrResult)}
          </div>
        </Card>
      )}

      {/* Blood Pressure */}
      {activeTab === 'bloodPressure' && (
        <Card title="血压评估">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="收缩压 (mmHg)" type="number" value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="120" />
              <Input label="舒张压 (mmHg)" type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="80" />
            </div>
            <Button variant="primary" onClick={evaluateBloodPressure}>评估血压</Button>
            {renderResult(bpResult)}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>血压参考标准：</strong><br />
              理想 &lt;120/80 | 正常高值 120-139/80-89 | 高血压1级 140-159/90-99 | 高血压2级 160-179/100-109 | 高血压3级 ≥180/110
            </div>
          </div>
        </Card>
      )}

      {/* Blood Sugar */}
      {activeTab === 'bloodSugar' && (
        <Card title="血糖评估">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant={sugarType === 'fasting' ? 'primary' : 'secondary'} size="sm" onClick={() => setSugarType('fasting')}>空腹血糖</Button>
              <Button variant={sugarType === 'afterMeal' ? 'primary' : 'secondary'} size="sm" onClick={() => setSugarType('afterMeal')}>餐后2小时</Button>
              <Button variant={sugarType === 'random' ? 'primary' : 'secondary'} size="sm" onClick={() => setSugarType('random')}>随机血糖</Button>
            </div>
            <Input label="血糖值 (mmol/L)" type="number" step="0.1" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} placeholder="5.5" />
            <Button variant="primary" onClick={evaluateBloodSugar}>评估血糖</Button>
            {renderResult(sugarResult)}
          </div>
        </Card>
      )}

      {/* Uric Acid */}
      {activeTab === 'uricAcid' && (
        <Card title="尿酸评估">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant={uricAcidGender === 'male' ? 'primary' : 'secondary'} onClick={() => setUricAcidGender('male')}>男性</Button>
              <Button variant={uricAcidGender === 'female' ? 'primary' : 'secondary'} onClick={() => setUricAcidGender('female')}>女性</Button>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <Input label="尿酸值" type="number" value={uricAcidValue} onChange={e => setUricAcidValue(e.target.value)} placeholder="360" style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button variant={uricAcidUnit === 'umol' ? 'primary' : 'secondary'} size="sm" onClick={() => setUricAcidUnit('umol')}>μmol/L</Button>
                <Button variant={uricAcidUnit === 'mgdl' ? 'primary' : 'secondary'} size="sm" onClick={() => setUricAcidUnit('mgdl')}>mg/dL</Button>
              </div>
            </div>
            <Button variant="primary" onClick={evaluateUricAcid}>评估尿酸</Button>
            {renderResult(uricAcidResult)}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>尿酸参考范围：</strong><br />
              男性: 208-428 μmol/L | 女性: 155-357 μmol/L
            </div>
          </div>
        </Card>
      )}

      {/* Blood Lipid */}
      {activeTab === 'bloodLipid' && (
        <Card title="血脂评估">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="总胆固醇 (mmol/L)" type="number" step="0.1" value={totalCholesterol} onChange={e => setTotalCholesterol(e.target.value)} placeholder="5.0" />
              <Input label="低密度脂蛋白 (mmol/L)" type="number" step="0.1" value={ldl} onChange={e => setLdl(e.target.value)} placeholder="3.0" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="高密度脂蛋白 (mmol/L)" type="number" step="0.1" value={hdl} onChange={e => setHdl(e.target.value)} placeholder="1.2" />
              <Input label="甘油三酯 (mmol/L)" type="number" step="0.1" value={triglycerides} onChange={e => setTriglycerides(e.target.value)} placeholder="1.5" />
            </div>
            <Button variant="primary" onClick={evaluateBloodLipid}>评估血脂</Button>
            {lipidResult && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 500 }}>总胆固醇 {lipidResult.value}</span>
                  <span style={{ padding: '6px 12px', background: lipidResult.statusColor, color: 'white', borderRadius: '20px', fontSize: '14px' }}>
                    {lipidResult.status}
                  </span>
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {lipidResult.description}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Waist to Height Ratio */}
      {activeTab === 'waist' && (
        <Card title="腰高比">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="腰围 (cm)" type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="85" />
              <Input label="身高 (cm)" type="number" value={waistHeight} onChange={e => setWaistHeight(e.target.value)} placeholder="170" />
            </div>
            <Button variant="primary" onClick={calculateWaistHeightRatio}>计算腰高比</Button>
            {renderResult(waistResult)}
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>腰高比参考标准：</strong><br />
              过瘦 &lt; 0.4 | 健康 0.4-0.5 | 需注意 0.5-0.6 | 高风险 ≥ 0.6
            </div>
          </div>
        </Card>
      )}

      <Card title="免责声明">
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          本工具提供的健康指标计算和评估结果仅供参考，不能作为医学诊断依据。如有健康问题，请咨询专业医疗机构。
          不同医院和实验室的参考范围可能略有差异，具体请以体检报告为准。
        </div>
      </Card>
    </div>
  );
}