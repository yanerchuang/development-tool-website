import { useState } from 'react';
import { Card, Button, TextArea } from '../components/common';

interface OptimizationStats {
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercent: number;
}

export default function SvgOptimizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    removeTitle: true,
    removeDesc: true,
    removeEmptyAttrs: true,
    removeEmptyContainers: true,
    removeUnusedNS: true,
    cleanupIDs: true,
    collapseGroups: true,
    removeDimensions: false,
  });

  const optimizeSvg = () => {
    let svg = input;
    const originalSize = new Blob([svg]).size;

    // Remove XML declaration
    svg = svg.replace(/<\?xml[^>]*\?>/gi, '');

    // Remove DOCTYPE
    svg = svg.replace(/<!DOCTYPE[^>]*>/gi, '');

    // Remove comments
    if (options.removeComments) {
      svg = svg.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove metadata
    if (options.removeMetadata) {
      svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    }

    // Remove title
    if (options.removeTitle) {
      svg = svg.replace(/<title[\s\S]*?<\/title>/gi, '');
    }

    // Remove desc
    if (options.removeDesc) {
      svg = svg.replace(/<desc[\s\S]*?<\/desc>/gi, '');
    }

    // Remove empty attributes
    if (options.removeEmptyAttrs) {
      svg = svg.replace(/\s+[a-zA-Z-]+=""/g, '');
      svg = svg.replace(/\s+[a-zA-Z-]+=''/g, '');
    }

    // Remove empty containers (g, defs, etc.)
    if (options.removeEmptyContainers) {
      const emptyTags = ['g', 'defs', 'clipPath', 'mask', 'pattern', 'symbol'];
      emptyTags.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>\\s*<\\/${tag}>`, 'gi');
        svg = svg.replace(regex, '');
      });
    }

    // Remove unused namespace declarations
    if (options.removeUnusedNS) {
      // Keep common namespaces
      const prefixRegex = /xmlns:([a-zA-Z0-9]+)=/g;
      let match;
      while ((match = prefixRegex.exec(svg)) !== null) {
        const prefix = match[1];
        // Check if prefix is used
        const useRegex = new RegExp(`<${prefix}:|${prefix}:`, 'g');
        if (!useRegex.test(svg)) {
          svg = svg.replace(new RegExp(`\\s*xmlns:${prefix}="[^"]*"`, 'g'), '');
        }
      }
    }

    // Cleanup IDs (simplify long IDs)
    if (options.cleanupIDs) {
      const ids = new Map<string, string>();
      let counter = 0;
      svg = svg.replace(/id="([^"]+)"/g, (_, id) => {
        if (id.length > 10) {
          if (!ids.has(id)) {
            ids.set(id, `i${counter++}`);
          }
          return `id="${ids.get(id)}"`;
        }
        return `id="${id}"`;
      });
      // Update references
      ids.forEach((newId, oldId) => {
        svg = svg.replace(new RegExp(`url\\(#${oldId}\\)`, 'g'), `url(#${newId})`);
        svg = svg.replace(new RegExp(`href="#${oldId}"`, 'g'), `href="#${newId}"`);
        svg = svg.replace(new RegExp(`xlink:href="#${oldId}"`, 'g'), `xlink:href="#${newId}"`);
      });
    }

    // Collapse unnecessary groups
    if (options.collapseGroups) {
      // Remove groups with no attributes
      svg = svg.replace(/<g\s*>([\s\S]*?)<\/g>/g, '$1');
    }

    // Remove dimensions (for inline SVG)
    if (options.removeDimensions) {
      svg = svg.replace(/\s+width="[^"]*"/g, '');
      svg = svg.replace(/\s+height="[^"]*"/g, '');
    }

    // Normalize whitespace
    svg = svg.replace(/>\s+</g, '><');
    svg = svg.trim();

    // Remove redundant spaces
    svg = svg.replace(/\s+/g, ' ');
    svg = svg.replace(/\s*([<>])\s*/g, '$1');

    const optimizedSize = new Blob([svg]).size;
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

    setStats({
      originalSize,
      optimizedSize,
      savedBytes,
      savedPercent,
    });
    setOutput(svg);
  };

  const prettifySvg = () => {
    let svg = output || input;
    let formatted = '';
    let indent = 0;
    const indentStr = '  ';

    svg = svg.replace(/>\s*</g, '>\n<');
    const lines = svg.split('\n');

    lines.forEach(line => {
      if (line.match(/^<\/\w/)) {
        indent = Math.max(0, indent - 1);
      }
      formatted += indentStr.repeat(indent) + line + '\n';
      if (line.match(/^<\w[^>]*[^\/]>$/) || line.match(/^<\w[^>]*>$/)) {
        indent++;
      }
    });

    setOutput(formatted.trim());
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadSvg = () => {
    const blob = new Blob([output], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStats(null);
  };

  const loadSample = () => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="200" height="200" viewBox="0 0 200 200">
  <!-- This is a sample SVG -->
  <title>Sample SVG</title>
  <desc>A sample SVG for testing optimization</desc>
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""/>
    </rdf:RDF>
  </metadata>
  <g id="main-group">
    <circle cx="100" cy="100" r="80" fill="none" stroke="#3498db" stroke-width="4"/>
    <circle cx="100" cy="100" r="50" fill="#3498db" opacity="0.5"/>
    <path d="M 100 50 L 150 100 L 100 150 L 50 100 Z" fill="#e74c3c"/>
  </g>
  <g></g>
  <rect x="10" y="10" width="180" height="180" fill="none" stroke="#2ecc71" stroke-width="2" rx="10" ry="10"/>
</svg>`);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="SVG 优化器">
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Button variant="secondary" size="sm" onClick={loadSample}>加载示例</Button>
          <Button variant="secondary" size="sm" onClick={clearAll}>清空</Button>
        </div>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="粘贴 SVG 代码..."
          style={{ minHeight: '200px', fontFamily: 'monospace' }}
        />
      </Card>

      <Card title="优化选项">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { key: 'removeComments', label: '移除注释' },
            { key: 'removeMetadata', label: '移除元数据' },
            { key: 'removeTitle', label: '移除标题' },
            { key: 'removeDesc', label: '移除描述' },
            { key: 'removeEmptyAttrs', label: '移除空属性' },
            { key: 'removeEmptyContainers', label: '移除空容器' },
            { key: 'removeUnusedNS', label: '移除未使用的命名空间' },
            { key: 'cleanupIDs', label: '简化 ID' },
            { key: 'collapseGroups', label: '合并分组' },
            { key: 'removeDimensions', label: '移除宽高属性' },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={options[opt.key as keyof typeof options]}
                onChange={() => toggleOption(opt.key as keyof typeof options)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="primary" onClick={optimizeSvg}>优化</Button>
        <Button variant="secondary" onClick={prettifySvg}>格式化</Button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>原始大小</div>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{formatBytes(stats.originalSize)}</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>优化后大小</div>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{formatBytes(stats.optimizedSize)}</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>减少</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-success)' }}>
                -{formatBytes(stats.savedBytes)}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>压缩率</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-success)' }}>
                {stats.savedPercent.toFixed(1)}%
              </div>
            </div>
          </Card>
        </div>
      )}

      {output && (
        <Card title="优化结果">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <Button variant="secondary" size="sm" onClick={copyOutput}>复制</Button>
            <Button variant="primary" size="sm" onClick={downloadSvg}>下载 SVG</Button>
          </div>
          <pre className="result-box" style={{ margin: 0, maxHeight: '300px', overflow: 'auto' }}>
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}