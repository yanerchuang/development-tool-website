import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

const gitignoreTemplates: Record<string, string[]> = {
  node: [
    '# Dependencies',
    'node_modules/',
    '.pnp',
    '.pnp.js',
    '',
    '# Testing',
    'coverage/',
    '',
    '# Production',
    'build/',
    'dist/',
    '',
    '# Misc',
    '.DS_Store',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '',
    '# Env files',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
  ],
  python: [
    '# Byte-compiled / optimized / DLL files',
    '__pycache__/',
    '*.py[cod]',
    '*$py.class',
    '',
    '# Virtual environments',
    'venv/',
    'ENV/',
    '.venv/',
    '',
    '# Distribution / packaging',
    'dist/',
    'build/',
    '*.egg-info/',
    '',
    '# Testing',
    '.pytest_cache/',
    '.coverage',
    'htmlcov/',
    '',
    '# Jupyter Notebook',
    '.ipynb_checkpoints/',
    '',
    '# mypy',
    '.mypy_cache/',
  ],
  java: [
    '# Compiled class file',
    '*.class',
    '',
    '# Log file',
    '*.log',
    '',
    '# Package Files',
    '*.jar',
    '*.war',
    '*.nar',
    '*.ear',
    '*.zip',
    '*.tar.gz',
    '*.rar',
    '',
    '# Maven',
    'target/',
    '',
    '# Gradle',
    '.gradle/',
    'build/',
    '',
    '# IDE',
    '.idea/',
    '*.iml',
    '.settings/',
    '.project',
    '.classpath',
  ],
  go: [
    '# Binaries for programs and plugins',
    '*.exe',
    '*.exe~',
    '*.dll',
    '*.so',
    '*.dylib',
    '',
    '# Test binary, built with `go test -c`',
    '*.test',
    '',
    '# Output of the go coverage tool',
    '*.out',
    '',
    '# Go workspace file',
    'go.work',
    '',
    '# Dependency directories',
    'vendor/',
  ],
  rust: [
    '# Generated files',
    'target/',
    '',
    '# Cargo lock for libraries',
    'Cargo.lock',
    '',
    '# IDE',
    '.idea/',
    '*.iml',
    '',
    '# Build artifacts',
    '*.pdb',
  ],
  react: [
    '# Dependencies',
    'node_modules/',
    '',
    '# Production',
    'build/',
    'dist/',
    '',
    '# Testing',
    'coverage/',
    '',
    '# Misc',
    '.DS_Store',
    '*.log',
    '',
    '# Env',
    '.env',
    '.env.local',
    '',
    '# IDE',
    '.vscode/',
    '.idea/',
  ],
  vue: [
    '# Dependencies',
    'node_modules/',
    '',
    '# Production',
    'dist/',
    '',
    '# Log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '',
    '# Editor directories and files',
    '.idea',
    '.vscode',
    '*.suo',
    '*.ntvs*',
    '*.njsproj',
    '*.sln',
    '*.sw?',
  ],
  nextjs: [
    '# Dependencies',
    'node_modules/',
    '.pnp',
    '.pnp.js',
    '',
    '# Testing',
    'coverage/',
    '',
    '# Next.js',
    '.next/',
    'out/',
    '',
    '# Production',
    'build/',
    '',
    '# Misc',
    '.DS_Store',
    '*.log',
    '',
    '# Vercel',
    '.vercel',
    '',
    '# TypeScript',
    '*.tsbuildinfo',
    'next-env.d.ts',
  ],
  macos: [
    '# General',
    '.DS_Store',
    '.AppleDouble',
    '.LSOverride',
    '',
    '# Icon must end with two \\r',
    'Icon',
    '',
    '# Thumbnails',
    '._*',
    '',
    '# Files that might appear in the root of a volume',
    '.DocumentRevisions-V100',
    '.fseventsd',
    '.Spotlight-V100',
    '.TemporaryItems',
    '.Trashes',
    '.VolumeIcon.icns',
    '',
    '# Directories potentially created on remote AFP share',
    '.AppleDB',
    '.AppleDesktop',
    'Network Trash Folder',
    'Temporary Items',
    '.apdisk',
  ],
  windows: [
    '# Windows thumbnail cache files',
    'Thumbs.db',
    'ehthumbs.db',
    'ehthumbs_vista.db',
    '',
    '# Dump file',
    '*.stackdump',
    '',
    '# Folder config file',
    '[Dd]esktop.ini',
    '',
    '# Recycle Bin used on file shares',
    '$RECYCLE.BIN/',
    '',
    '# Windows Installer files',
    '*.cab',
    '*.msi',
    '*.msm',
    '*.msp',
    '',
    '# Windows shortcuts',
    '*.lnk',
  ],
  linux: [
    '*~',
    '',
    '# temporary files which can be created if a process still has a handle open of a deleted file',
    '.fuse_hidden*',
    '',
    '# KDE directory preferences',
    '.directory',
    '',
    '# Linux trash folder which might appear on any partition or disk',
    '.Trash-*',
    '',
    '# .nfs files are created when an open file is removed but is still being accessed',
    '.nfs*',
  ],
  vscode: [
    '.vscode/*',
    '!.vscode/settings.json',
    '!.vscode/tasks.json',
    '!.vscode/launch.json',
    '!.vscode/extensions.json',
    '!.vscode/*.code-snippets',
    '',
    '# Local History for Visual Studio Code',
    '.history/',
    '',
    '# Built Visual Studio Code Extensions',
    '*.vsix',
  ],
  jetbrains: [
    '# Covers JetBrains IDEs: IntelliJ, RubyMine, PhpStorm, AppCode, PyCharm, CLion, Android Studio, WebStorm and Rider',
    '.idea/',
    '',
    '# CMake',
    'cmake-build-*/',
    '',
    '# File-based project format',
    '*.iws',
    '',
    '# IntelliJ',
    'out/',
    '',
    '# mpeltonen/sbt-idea plugin',
    '.idea_modules/',
    '',
    '# JIRA plugin',
    'atlassian-ide-plugin.xml',
    '',
    '# Crashlytics plugin',
    'com_crashlytics_export_strings.xml',
    'crashlytics.properties',
    'crashlytics-build.properties',
    'fabric.properties',
  ],
};

const categories = [
  { id: 'languages', label: '编程语言', items: ['node', 'python', 'java', 'go', 'rust'] },
  { id: 'frameworks', label: '框架', items: ['react', 'vue', 'nextjs'] },
  { id: 'os', label: '操作系统', items: ['macos', 'windows', 'linux'] },
  { id: 'ide', label: 'IDE', items: ['vscode', 'jetbrains'] },
];

export default function GitignoreGenerator() {
  const [selectedItems, setSelectedItems] = useState<string[]>(['node']);
  const [customRules, setCustomRules] = useState('');
  const [output, setOutput] = useState('');

  const generateGitignore = () => {
    const lines: string[] = ['# .gitignore generated by DevTools', `# Generated at: ${new Date().toISOString()}`, ''];

    selectedItems.forEach(item => {
      if (gitignoreTemplates[item]) {
        lines.push(`# === ${item.toUpperCase()} ===`);
        lines.push(...gitignoreTemplates[item]);
        lines.push('');
      }
    });

    if (customRules.trim()) {
      lines.push('# === Custom Rules ===');
      lines.push(customRules.trim());
      lines.push('');
    }

    setOutput(lines.join('\n'));
  };

  const toggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const selectAll = () => {
    setSelectedItems(Object.keys(gitignoreTemplates));
  };

  const clearAll = () => {
    setSelectedItems([]);
    setCustomRules('');
    setOutput('');
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title=".gitignore 生成器">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          选择项目类型，自动生成对应的 .gitignore 文件
        </p>

        {categories.map(category => (
          <div key={category.id} style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>{category.label}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {category.items.map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    background: selectedItems.includes(item)
                      ? 'var(--accent-primary)'
                      : 'var(--bg-secondary)',
                    color: selectedItems.includes(item)
                      ? 'white'
                      : 'var(--text-primary)',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>自定义规则</div>
          <TextArea
            value={customRules}
            onChange={e => setCustomRules(e.target.value)}
            placeholder="添加自定义的忽略规则，每行一条..."
            style={{ minHeight: '100px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" onClick={generateGitignore}>生成</Button>
          <Button variant="secondary" onClick={selectAll}>全选</Button>
          <Button variant="secondary" onClick={clearAll}>清空</Button>
        </div>
      </Card>

      {output && (
        <Card title="生成结果">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
            <Button variant="primary" size="sm" onClick={downloadFile}>下载 .gitignore</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, maxHeight: '400px', overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}