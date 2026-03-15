// 中文假文词库
const chineseWords = [
  '的', '一', '是', '在', '不', '了', '有', '和', '人', '这', '中', '大', '为', '上', '个',
  '国', '我', '以', '要', '他', '时', '来', '用', '们', '生', '到', '作', '地', '于', '出',
  '就', '分', '对', '成', '会', '可', '主', '发', '年', '动', '同', '工', '也', '能', '下',
  '过', '子', '说', '产', '种', '面', '而', '方', '后', '多', '定', '行', '学', '法', '所',
  '民', '得', '经', '十', '三', '之', '进', '着', '等', '部', '度', '家', '电', '力', '里',
  '如', '水', '化', '高', '自', '二', '理', '起', '小', '物', '现实', '加', '量', '都', '两',
  '体', '制', '机', '当', '使', '点', '从', '业', '本', '去', '把', '性', '好', '应', '开',
  '它', '合', '还', '因', '由', '其', '些', '然', '前', '外', '天', '政', '四', '日', '那',
  '社', '义', '事', '平', '形', '相', '全', '表', '间', '样', '与', '关', '各', '重', '新',
  '线', '内', '数', '正', '心', '反', '你', '明', '看', '原', '又', '么', '利', '比', '或',
  '但', '质', '气', '第', '向', '道', '命', '此', '变', '条', '只', '没', '结', '解', '问',
  '意', '建', '月', '公', '无', '系', '军', '很', '情', '者', '最', '立', '代', '想', '已',
  '通', '并', '提', '直', '题', '党', '程', '展', '五', '果', '料', '象', '员', '革', '位',
  '入', '常', '文', '总', '次', '品', '式', '活', '设', '及', '管', '特', '件', '长', '求',
  '老', '头', '基', '资', '边', '流', '路', '级', '少', '图', '山', '统', '接', '知', '较',
];

// 英文 Lorem Ipsum 词库
const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
];

// 生成句子
const generateSentence = (lang: 'zh' | 'en', minWords: number, maxWords: number): string => {
  const words = lang === 'zh' ? chineseWords : loremWords;
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

  const sentence: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const word = words[Math.floor(Math.random() * words.length)];
    sentence.push(word);
  }

  let result = sentence.join(lang === 'zh' ? '' : ' ');

  // 英文首字母大写
  if (lang === 'en') {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result + (lang === 'zh' ? '。' : '.');
};

// 生成段落
export const generateParagraph = (lang: 'zh' | 'en', minSentences: number, maxSentences: number): string => {
  const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
  const sentences: string[] = [];

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(lang, 8, 20));
  }

  return sentences.join(lang === 'zh' ? '' : ' ');
};

// 生成多段落文本
export const generateLorem = (options: {
  lang: 'zh' | 'en';
  type: 'paragraphs' | 'sentences' | 'words';
  count: number;
}): string => {
  const { lang, type, count } = options;

  switch (type) {
    case 'paragraphs': {
      const paragraphs: string[] = [];
      for (let i = 0; i < count; i++) {
        paragraphs.push(generateParagraph(lang, 3, 7));
      }
      return paragraphs.join('\n\n');
    }
    case 'sentences': {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence(lang, 10, 20));
      }
      return sentences.join(lang === 'zh' ? '' : ' ');
    }
    case 'words': {
      const words = lang === 'zh' ? chineseWords : loremWords;
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        result.push(words[Math.floor(Math.random() * words.length)]);
      }
      return result.join(lang === 'zh' ? '' : ' ');
    }
  }
};

// 生成标题
export const generateTitle = (lang: 'zh' | 'en'): string => {
  const words = lang === 'zh' ? chineseWords : loremWords;
  const wordCount = Math.floor(Math.random() * 3) + 2;
  const title: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    let word = words[Math.floor(Math.random() * words.length)];
    if (lang === 'en' && i === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    title.push(word);
  }

  return title.join(lang === 'zh' ? '' : ' ');
};

// 生成完整文章（带标题）
export const generateArticle = (lang: 'zh' | 'en', paragraphCount: number): string => {
  const title = generateTitle(lang);
  const paragraphs = generateLorem({ lang, type: 'paragraphs', count: paragraphCount });

  return `${title}\n\n${paragraphs}`;
};