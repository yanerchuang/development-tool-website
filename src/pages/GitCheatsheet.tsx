import { useState, useMemo } from 'react';
import { Card, Button } from '../components/common';

interface GitCommand {
  command: string;
  description: string;
  category: string;
}

const gitCommands: GitCommand[] = [
  // 初始化
  { command: 'git init', description: '初始化新仓库', category: '初始化' },
  { command: 'git clone <url>', description: '克隆远程仓库', category: '初始化' },
  { command: 'git clone <url> <directory>', description: '克隆到指定目录', category: '初始化' },

  // 配置
  { command: 'git config --global user.name "<name>"', description: '设置用户名', category: '配置' },
  { command: 'git config --global user.email "<email>"', description: '设置邮箱', category: '配置' },
  { command: 'git config --global --list', description: '查看全局配置', category: '配置' },
  { command: 'git config --local --list', description: '查看当前仓库配置', category: '配置' },

  // 基本操作
  { command: 'git status', description: '查看工作区状态', category: '基本操作' },
  { command: 'git add <file>', description: '添加文件到暂存区', category: '基本操作' },
  { command: 'git add .', description: '添加所有文件到暂存区', category: '基本操作' },
  { command: 'git add -A', description: '添加所有变更（包括删除）', category: '基本操作' },
  { command: 'git commit -m "<message>"', description: '提交暂存区更改', category: '基本操作' },
  { command: 'git commit -am "<message>"', description: '添加并提交已跟踪文件', category: '基本操作' },
  { command: 'git commit --amend -m "<message>"', description: '修改最后一次提交', category: '基本操作' },

  // 分支
  { command: 'git branch', description: '列出本地分支', category: '分支' },
  { command: 'git branch -a', description: '列出所有分支（含远程）', category: '分支' },
  { command: 'git branch <name>', description: '创建新分支', category: '分支' },
  { command: 'git branch -d <name>', description: '删除分支', category: '分支' },
  { command: 'git branch -D <name>', description: '强制删除分支', category: '分支' },
  { command: 'git branch -m <old> <new>', description: '重命名分支', category: '分支' },
  { command: 'git checkout <branch>', description: '切换分支', category: '分支' },
  { command: 'git checkout -b <branch>', description: '创建并切换分支', category: '分支' },
  { command: 'git switch <branch>', description: '切换分支（新版）', category: '分支' },
  { command: 'git switch -c <branch>', description: '创建并切换分支（新版）', category: '分支' },
  { command: 'git merge <branch>', description: '合并分支', category: '分支' },
  { command: 'git merge --no-ff <branch>', description: '禁用快进合并', category: '分支' },
  { command: 'git merge --abort', description: '取消合并', category: '分支' },

  // 远程
  { command: 'git remote -v', description: '查看远程仓库', category: '远程' },
  { command: 'git remote add <name> <url>', description: '添加远程仓库', category: '远程' },
  { command: 'git remote remove <name>', description: '移除远程仓库', category: '远程' },
  { command: 'git remote rename <old> <new>', description: '重命名远程仓库', category: '远程' },
  { command: 'git fetch <remote>', description: '获取远程更新', category: '远程' },
  { command: 'git fetch --all', description: '获取所有远程更新', category: '远程' },
  { command: 'git pull <remote> <branch>', description: '拉取并合并', category: '远程' },
  { command: 'git pull --rebase', description: '变基拉取', category: '远程' },
  { command: 'git push <remote> <branch>', description: '推送到远程', category: '远程' },
  { command: 'git push -u origin <branch>', description: '推送并设置上游', category: '远程' },
  { command: 'git push --force', description: '强制推送（谨慎使用）', category: '远程' },
  { command: 'git push --all', description: '推送所有分支', category: '远程' },
  { command: 'git push --tags', description: '推送所有标签', category: '远程' },

  // 日志
  { command: 'git log', description: '查看提交历史', category: '日志' },
  { command: 'git log --oneline', description: '简洁查看历史', category: '日志' },
  { command: 'git log --graph', description: '图形化显示历史', category: '日志' },
  { command: 'git log --graph --oneline --all', description: '图形化显示全部历史', category: '日志' },
  { command: 'git log -n <number>', description: '显示最近n次提交', category: '日志' },
  { command: 'git log --since="2 weeks ago"', description: '显示两周内的提交', category: '日志' },
  { command: 'git log --author="<name>"', description: '按作者筛选', category: '日志' },
  { command: 'git log --grep="<pattern>"', description: '按提交信息筛选', category: '日志' },
  { command: 'git show <commit>', description: '显示某次提交详情', category: '日志' },
  { command: 'git blame <file>', description: '查看文件每行的修改记录', category: '日志' },

  // 差异
  { command: 'git diff', description: '查看工作区差异', category: '差异' },
  { command: 'git diff --cached', description: '查看暂存区差异', category: '差异' },
  { command: 'git diff <commit1> <commit2>', description: '比较两次提交', category: '差异' },
  { command: 'git diff <branch1> <branch2>', description: '比较两个分支', category: '差异' },

  // 撤销
  { command: 'git restore <file>', description: '撤销工作区修改', category: '撤销' },
  { command: 'git restore --staged <file>', description: '取消暂存', category: '撤销' },
  { command: 'git checkout -- <file>', description: '撤销工作区修改（旧版）', category: '撤销' },
  { command: 'git reset HEAD <file>', description: '取消暂存（旧版）', category: '撤销' },
  { command: 'git reset --soft HEAD~1', description: '软重置（保留更改）', category: '撤销' },
  { command: 'git reset --mixed HEAD~1', description: '混合重置（默认）', category: '撤销' },
  { command: 'git reset --hard HEAD~1', description: '硬重置（丢弃更改）', category: '撤销' },
  { command: 'git revert <commit>', description: '创建撤销提交', category: '撤销' },
  { command: 'git revert --no-commit <commit>', description: '撤销但不自动提交', category: '撤销' },
  { command: 'git clean -fd', description: '删除未跟踪的文件和目录', category: '撤销' },

  // 暂存
  { command: 'git stash', description: '暂存当前更改', category: '暂存' },
  { command: 'git stash save "<message>"', description: '带消息暂存', category: '暂存' },
  { command: 'git stash list', description: '列出暂存记录', category: '暂存' },
  { command: 'git stash pop', description: '恢复并删除最近暂存', category: '暂存' },
  { command: 'git stash apply', description: '恢复但不删除暂存', category: '暂存' },
  { command: 'git stash drop', description: '删除最近暂存', category: '暂存' },
  { command: 'git stash clear', description: '清空所有暂存', category: '暂存' },

  // 标签
  { command: 'git tag', description: '列出标签', category: '标签' },
  { command: 'git tag <name>', description: '创建轻量标签', category: '标签' },
  { command: 'git tag -a <name> -m "<message>"', description: '创建附注标签', category: '标签' },
  { command: 'git tag -d <name>', description: '删除本地标签', category: '标签' },
  { command: 'git push origin <tag>', description: '推送标签', category: '标签' },
  { command: 'git push origin --delete <tag>', description: '删除远程标签', category: '标签' },

  // 变基
  { command: 'git rebase <branch>', description: '变基到目标分支', category: '变基' },
  { command: 'git rebase -i HEAD~n', description: '交互式变基最近n次提交', category: '变基' },
  { command: 'git rebase --continue', description: '继续变基', category: '变基' },
  { command: 'git rebase --abort', description: '取消变基', category: '变基' },
  { command: 'git rebase --skip', description: '跳过当前提交', category: '变基' },

  // 子模块
  { command: 'git submodule add <url>', description: '添加子模块', category: '子模块' },
  { command: 'git submodule init', description: '初始化子模块', category: '子模块' },
  { command: 'git submodule update', description: '更新子模块', category: '子模块' },
  { command: 'git submodule update --init --recursive', description: '递归初始化更新', category: '子模块' },

  // 其他
  { command: 'git gc', description: '清理仓库', category: '其他' },
  { command: 'git fsck', description: '检查仓库完整性', category: '其他' },
  { command: 'git reflog', description: '查看引用日志', category: '其他' },
  { command: 'git cherry-pick <commit>', description: '选择性合并提交', category: '其他' },
  { command: 'git bisect start', description: '开始二分查找', category: '其他' },
  { command: 'git bisect bad', description: '标记当前为问题版本', category: '其他' },
  { command: 'git bisect good <commit>', description: '标记正常版本', category: '其他' },
];

const categories = ['全部', ...new Set(gitCommands.map(c => c.category))];

export default function GitCheatsheet() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const filteredCommands = useMemo(() => {
    return gitCommands.filter(cmd => {
      const matchesSearch = !searchTerm ||
        cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '全部' || cmd.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const groupedCommands = useMemo(() => {
    const groups: Record<string, GitCommand[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card title="Git 命令速查表">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          快速查找 Git 命令，点击复制使用
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索命令或描述..."
            className="input"
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat ? 'white' : 'var(--text-primary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {Object.entries(groupedCommands).map(([category, commands]) => (
        <Card key={category} title={category}>
          <div style={{ display: 'grid', gap: '8px' }}>
            {commands.map((cmd, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all',
                  }}
                >
                  {cmd.command}
                </code>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', flexShrink: 0 }}>
                  {cmd.description}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyCommand(cmd.command)}
                >
                  {copiedCommand === cmd.command ? '已复制' : '复制'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>
        共 {filteredCommands.length} 条命令
      </div>
    </div>
  );
}