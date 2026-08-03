/**
 * Antigravity IDE Frontend — app.js
 * Full interactive workbench implementation
 */

'use strict';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  theme: 'dark',
  sidebarVisible: true,
  panelVisible: true,
  jetskiVisible: true,
  activeActivityView: 'explorer',
  activeTab: null,
  tabs: [],
  activePanelTab: 'terminal',
  sidebarWidth: 260,
  panelHeight: 220,
  jetskiWidth: 380,
  openFolders: new Set(['src', 'components', 'utils']),
  commandHistory: [],
  terminalOutput: [],
  jetskiMessages: [
    { role: 'assistant', content: 'Hello! I\'m Antigravity, your AI coding assistant. How can I help you today?' }
  ],
};

// ─── DOM References ───────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ─── File Tree Data ───────────────────────────────────────────────────────────
const fileTree = [
  {
    name: 'src', type: 'folder', open: true, children: [
      { name: 'components', type: 'folder', open: false, children: [
        { name: 'App.tsx', type: 'file', icon: 'icon-ts', ext: 'tsx' },
        { name: 'Button.tsx', type: 'file', icon: 'icon-ts', ext: 'tsx' },
        { name: 'Layout.tsx', type: 'file', icon: 'icon-ts', ext: 'tsx' },
      ]},
      { name: 'utils', type: 'folder', open: false, children: [
        { name: 'api.ts', type: 'file', icon: 'icon-ts', ext: 'ts' },
        { name: 'helpers.ts', type: 'file', icon: 'icon-ts', ext: 'ts' },
      ]},
      { name: 'index.tsx', type: 'file', icon: 'icon-ts', ext: 'tsx' },
      { name: 'styles.css', type: 'file', icon: 'icon-css', ext: 'css' },
      { name: 'types.ts', type: 'file', icon: 'icon-ts', ext: 'ts' },
    ]
  },
  { name: 'public', type: 'folder', open: false, children: [
    { name: 'index.html', type: 'file', icon: 'icon-html', ext: 'html' },
    { name: 'favicon.ico', type: 'file', icon: '', ext: 'ico' },
  ]},
  { name: '.gitignore', type: 'file', icon: 'icon-git', ext: 'gitignore' },
  { name: 'package.json', type: 'file', icon: 'icon-json', ext: 'json' },
  { name: 'README.md', type: 'file', icon: 'icon-md', ext: 'md' },
  { name: 'tsconfig.json', type: 'file', icon: 'icon-json', ext: 'json' },
  { name: 'vite.config.ts', type: 'file', icon: 'icon-ts', ext: 'ts' },
];

// ─── Command Palette Data ─────────────────────────────────────────────────────
const commands = [
  { id: 'new-file', icon: 'codicon-new-file', label: 'File: New File', shortcut: 'Ctrl+N' },
  { id: 'open-file', icon: 'codicon-go-to-file', label: 'File: Open File...', shortcut: 'Ctrl+O' },
  { id: 'save', icon: 'codicon-save', label: 'File: Save', shortcut: 'Ctrl+S' },
  { id: 'save-all', icon: 'codicon-save-all', label: 'File: Save All', shortcut: 'Ctrl+Shift+S' },
  { id: 'close-tab', icon: 'codicon-close', label: 'File: Close Editor', shortcut: 'Ctrl+W' },
  { id: 'command-palette', icon: 'codicon-search', label: 'View: Command Palette', shortcut: 'Ctrl+Shift+P' },
  { id: 'toggle-sidebar', icon: 'codicon-layout-sidebar-left-off', label: 'View: Toggle Sidebar', shortcut: 'Ctrl+B' },
  { id: 'toggle-panel', icon: 'codicon-layout-panel-off', label: 'View: Toggle Panel', shortcut: 'Ctrl+J' },
  { id: 'toggle-terminal', icon: 'codicon-terminal', label: 'View: Toggle Terminal', shortcut: 'Ctrl+`' },
  { id: 'split-editor', icon: 'codicon-split-horizontal', label: 'View: Split Editor Right', shortcut: 'Ctrl+\\' },
  { id: 'format-document', icon: 'codicon-wand', label: 'Format Document', shortcut: 'Shift+Alt+F' },
  { id: 'find', icon: 'codicon-search', label: 'Find', shortcut: 'Ctrl+F' },
  { id: 'replace', icon: 'codicon-edit', label: 'Replace', shortcut: 'Ctrl+H' },
  { id: 'go-to-line', icon: 'codicon-chevron-right', label: 'Go to Line...', shortcut: 'Ctrl+G' },
  { id: 'go-to-symbol', icon: 'codicon-symbol-file', label: 'Go to Symbol...', shortcut: 'Ctrl+Shift+O' },
  { id: 'toggle-theme', icon: 'codicon-circle-filled', label: 'Preferences: Toggle Theme', shortcut: '' },
  { id: 'open-settings', icon: 'codicon-settings-gear', label: 'Preferences: Open Settings', shortcut: 'Ctrl+,' },
  { id: 'open-jetski', icon: 'codicon-robot', label: 'Antigravity: Open AI Chat', shortcut: 'Ctrl+Shift+A' },
  { id: 'git-stage', icon: 'codicon-source-control', label: 'Git: Stage All Changes', shortcut: '' },
  { id: 'git-commit', icon: 'codicon-git-commit', label: 'Git: Commit', shortcut: '' },
];

// ─── Sample file content ──────────────────────────────────────────────────────
const fileContents = {
  'index.tsx': `<span class="token-keyword">import</span> React <span class="token-keyword">from</span> <span class="token-string">'react'</span>;
<span class="token-keyword">import</span> ReactDOM <span class="token-keyword">from</span> <span class="token-string">'react-dom/client'</span>;
<span class="token-keyword">import</span> App <span class="token-keyword">from</span> <span class="token-string">'./components/App'</span>;
<span class="token-keyword">import</span> <span class="token-string">'./styles.css'</span>;

<span class="token-keyword">const</span> <span class="token-variable">root</span> <span class="token-operator">=</span> ReactDOM.<span class="token-function">createRoot</span>(
  document.<span class="token-function">getElementById</span>(<span class="token-string">'root'</span>) <span class="token-keyword">as</span> HTMLElement
);

root.<span class="token-function">render</span>(
  <span class="token-operator">&lt;</span>React.StrictMode<span class="token-operator">&gt;</span>
    <span class="token-operator">&lt;</span>App <span class="token-operator">/&gt;</span>
  <span class="token-operator">&lt;/</span>React.StrictMode<span class="token-operator">&gt;</span>
);`,

  'App.tsx': `<span class="token-keyword">import</span> React, { useState } <span class="token-keyword">from</span> <span class="token-string">'react'</span>;

<span class="token-keyword">interface</span> <span class="token-type">AppProps</span> {
  title<span class="token-operator">?:</span> <span class="token-type">string</span>;
}

<span class="token-keyword">const</span> <span class="token-function">App</span>: React.<span class="token-type">FC</span><span class="token-operator">&lt;</span><span class="token-type">AppProps</span><span class="token-operator">&gt;</span> <span class="token-operator">=</span> ({ title <span class="token-operator">=</span> <span class="token-string">'My App'</span> }) <span class="token-operator">=&gt;</span> {
  <span class="token-keyword">const</span> [<span class="token-variable">count</span>, <span class="token-variable">setCount</span>] <span class="token-operator">=</span> <span class="token-function">useState</span><span class="token-operator">&lt;</span><span class="token-type">number</span><span class="token-operator">&gt;</span>(<span class="token-number">0</span>);

  <span class="token-keyword">return</span> (
    <span class="token-operator">&lt;</span>div className<span class="token-operator">=</span><span class="token-string">"app"</span><span class="token-operator">&gt;</span>
      <span class="token-operator">&lt;</span>h1<span class="token-operator">&gt;</span>{title}<span class="token-operator">&lt;/</span>h1<span class="token-operator">&gt;</span>
      <span class="token-operator">&lt;</span>button onClick<span class="token-operator">=</span>{() <span class="token-operator">=&gt;</span> <span class="token-function">setCount</span>(c <span class="token-operator">=&gt;</span> c <span class="token-operator">+</span> <span class="token-number">1</span>)}<span class="token-operator">&gt;</span>
        Count: {count}
      <span class="token-operator">&lt;/</span>button<span class="token-operator">&gt;</span>
    <span class="token-operator">&lt;/</span>div<span class="token-operator">&gt;</span>
  );
};

<span class="token-keyword">export default</span> App;`,

  'package.json': `{
  <span class="token-string">"name"</span>: <span class="token-string">"my-app"</span>,
  <span class="token-string">"version"</span>: <span class="token-string">"1.0.0"</span>,
  <span class="token-string">"scripts"</span>: {
    <span class="token-string">"dev"</span>: <span class="token-string">"vite"</span>,
    <span class="token-string">"build"</span>: <span class="token-string">"tsc && vite build"</span>,
    <span class="token-string">"preview"</span>: <span class="token-string">"vite preview"</span>
  },
  <span class="token-string">"dependencies"</span>: {
    <span class="token-string">"react"</span>: <span class="token-string">"^18.2.0"</span>,
    <span class="token-string">"react-dom"</span>: <span class="token-string">"^18.2.0"</span>
  },
  <span class="token-string">"devDependencies"</span>: {
    <span class="token-string">"typescript"</span>: <span class="token-string">"^5.0.0"</span>,
    <span class="token-string">"vite"</span>: <span class="token-string">"^4.0.0"</span>,
    <span class="token-string">"@types/react"</span>: <span class="token-string">"^18.0.0"</span>
  }
}`,

  'styles.css': `<span class="token-comment">/* Global styles */</span>
<span class="token-operator">*</span> {
  <span class="token-variable">box-sizing</span>: <span class="token-string">border-box</span>;
  <span class="token-variable">margin</span>: <span class="token-number">0</span>;
  <span class="token-variable">padding</span>: <span class="token-number">0</span>;
}

<span class="token-class">body</span> {
  <span class="token-variable">font-family</span>: <span class="token-string">system-ui, sans-serif</span>;
  <span class="token-variable">background</span>: <span class="token-string">#0f0f0f</span>;
  <span class="token-variable">color</span>: <span class="token-string">#e8e8e8</span>;
  <span class="token-variable">line-height</span>: <span class="token-number">1.5</span>;
}

<span class="token-class">.app</span> {
  <span class="token-variable">display</span>: <span class="token-string">flex</span>;
  <span class="token-variable">flex-direction</span>: <span class="token-string">column</span>;
  <span class="token-variable">align-items</span>: <span class="token-string">center</span>;
  <span class="token-variable">padding</span>: <span class="token-number">2rem</span>;
}`,

  'README.md': `<span class="token-comment"># My Project

Welcome to this project!

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Fast development with Vite
- TypeScript support
- React 18
</span>`,
};

// ─── Tab Management ───────────────────────────────────────────────────────────
function openTab(name, icon, ext) {
  const existing = state.tabs.find(t => t.name === name);
  if (existing) {
    setActiveTab(existing.id);
    return;
  }
  const id = Date.now().toString();
  state.tabs.push({ id, name, icon, ext, dirty: false });
  setActiveTab(id);
  renderTabs();
  renderEditor(name);
}

function closeTab(id, e) {
  e && e.stopPropagation();
  const idx = state.tabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  state.tabs.splice(idx, 1);
  if (state.activeTab === id) {
    const next = state.tabs[Math.min(idx, state.tabs.length - 1)];
    state.activeTab = next ? next.id : null;
    if (next) renderEditor(next.name);
    else showWelcome();
  }
  renderTabs();
}

function setActiveTab(id) {
  state.activeTab = id;
  renderTabs();
  const tab = state.tabs.find(t => t.id === id);
  if (tab) renderEditor(tab.name);
}

function renderTabs() {
  const bar = $('tab-bar');
  if (!bar) return;
  bar.innerHTML = state.tabs.map(tab => `
    <div class="editor-tab ${tab.id === state.activeTab ? 'active' : ''}" onclick="setActiveTab('${tab.id}')" title="${tab.name}">
      <span class="tab-icon codicon ${getFileIcon(tab.name)}"></span>
      <span class="tab-label">${tab.name}</span>
      ${tab.dirty ? '<span class="tab-dirty"></span>' : ''}
      <button class="tab-close" onclick="closeTab('${tab.id}', event)" title="Close">
        <span class="codicon codicon-close"></span>
      </button>
    </div>
  `).join('');
}

function getFileIcon(name) {
  const ext = name.split('.').pop();
  const map = {
    tsx: 'codicon-file-code', ts: 'codicon-file-code',
    js: 'codicon-file-code', jsx: 'codicon-file-code',
    css: 'codicon-file-code', html: 'codicon-file-code',
    json: 'codicon-file-code', md: 'codicon-book',
    py: 'codicon-file-code', gitignore: 'codicon-git-branch',
  };
  return map[ext] || 'codicon-file-code';
}

function showWelcome() {
  const content = $('editor-content');
  if (!content) return;
  content.innerHTML = `
    <div id="welcome-screen">
      <img src="jetski-logo-white.svg" class="welcome-logo" onerror="this.style.display='none'" alt="Antigravity">
      <div class="welcome-title">Antigravity IDE</div>
      <div class="welcome-subtitle">Coding Assistant Powered by Gemini</div>
      <div class="welcome-actions">
        <button class="welcome-action-btn primary" onclick="showCommandPalette()">
          <span class="codicon codicon-go-to-file"></span> Open File
        </button>
        <button class="welcome-action-btn secondary" onclick="openNewFile()">
          <span class="codicon codicon-new-file"></span> New File
        </button>
        <button class="welcome-action-btn secondary" onclick="toggleJetski()">
          <span class="codicon codicon-robot"></span> Ask Antigravity
        </button>
      </div>
    </div>
  `;
}

function renderEditor(filename) {
  const content = $('editor-content');
  if (!content) return;
  const code = fileContents[filename] || generatePlaceholderContent(filename);
  const lines = code.split('\n');
  const lineNumbers = lines.map((_, i) => i + 1).join('\n');
  const breadcrumb = $('breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <span class="breadcrumb-item"><span>${getWorkspaceName()}</span></span>
      <span class="breadcrumb-sep codicon codicon-chevron-right"></span>
      <span class="breadcrumb-item"><span>src</span></span>
      <span class="breadcrumb-sep codicon codicon-chevron-right"></span>
      <span class="breadcrumb-item" style="color:var(--vscode-button-background)"><span>${filename}</span></span>
    `;
  }
  content.innerHTML = `
    <div class="editor-gutter">${lineNumbers}</div>
    <div class="editor-code" contenteditable="true" spellcheck="false">${code}</div>
  `;
}

function generatePlaceholderContent(filename) {
  return `<span class="token-comment">// ${filename}</span>\n<span class="token-comment">// Start coding here...</span>\n`;
}

function getWorkspaceName() { return 'my-project'; }

// ─── File Tree Rendering ──────────────────────────────────────────────────────
function renderFileTree(nodes, container, depth = 0) {
  nodes.forEach(node => {
    const indent = depth * 16;
    const item = document.createElement('div');
    item.className = 'file-tree-item';
    item.style.paddingLeft = `${12 + indent}px`;

    if (node.type === 'folder') {
      const isOpen = state.openFolders.has(node.name);
      item.innerHTML = `
        <span class="codicon ${isOpen ? 'codicon-chevron-down' : 'codicon-chevron-right'}" style="font-size:12px;opacity:0.7"></span>
        <span class="codicon ${isOpen ? 'codicon-folder-opened' : 'codicon-files'} icon-folder" style="font-size:16px"></span>
        <span class="item-label">${node.name}</span>
      `;
      item.onclick = () => toggleFolder(node, container, depth);
      container.appendChild(item);
      if (isOpen && node.children) {
        const childContainer = document.createElement('div');
        childContainer.dataset.folder = node.name;
        renderFileTree(node.children, childContainer, depth + 1);
        container.appendChild(childContainer);
      }
    } else {
      const ext = node.name.split('.').pop();
      item.innerHTML = `
        <span style="width:16px;display:inline-block"></span>
        <span class="codicon codicon-file-code ${getFileColorClass(ext)}" style="font-size:14px"></span>
        <span class="item-label">${node.name}</span>
      `;
      item.onclick = () => {
        $$('.file-tree-item.active').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        openTab(node.name, '', ext);
      };
      container.appendChild(item);
    }
  });
}

function getFileColorClass(ext) {
  const map = { tsx: 'icon-ts', ts: 'icon-ts', js: 'icon-js', jsx: 'icon-js', html: 'icon-html', css: 'icon-css', json: 'icon-json', md: 'icon-md', py: 'icon-py' };
  return map[ext] || '';
}

function toggleFolder(node, container) {
  if (state.openFolders.has(node.name)) {
    state.openFolders.delete(node.name);
  } else {
    state.openFolders.add(node.name);
  }
  container.innerHTML = '';
  renderFileTree(fileTree, container, 0);
}

// ─── Activity Bar ─────────────────────────────────────────────────────────────
function switchActivity(view) {
  if (state.activeActivityView === view) {
    toggleSidebar();
    return;
  }
  state.activeActivityView = view;
  if (!state.sidebarVisible) {
    state.sidebarVisible = true;
    applyLayout();
  }
  $$('.activity-item').forEach(el => el.classList.remove('active'));
  const btn = document.querySelector(`[data-view="${view}"]`);
  if (btn) btn.classList.add('active');
  renderSidebarView(view);
}

function renderSidebarView(view) {
  const sidebar = $('sidebar-content');
  if (!sidebar) return;
  switch (view) {
    case 'explorer': renderExplorer(sidebar); break;
    case 'search': renderSearch(sidebar); break;
    case 'scm': renderSCM(sidebar); break;
    case 'debug': renderDebug(sidebar); break;
    case 'extensions': renderExtensions(sidebar); break;
    default: renderExplorer(sidebar);
  }
}

function renderExplorer(container) {
  container.innerHTML = `
    <div class="sidebar-title-bar">Explorer</div>
    <div class="sidebar-explorer-header">
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;opacity:0.6">My Project</span>
      <div class="sidebar-toolbar" style="display:flex;gap:2px;padding:0">
        <button class="codicon-btn" title="New File"><span class="codicon codicon-new-file"></span></button>
        <button class="codicon-btn" title="New Folder"><span class="codicon codicon-new-folder"></span></button>
        <button class="codicon-btn" title="Refresh"><span class="codicon codicon-refresh"></span></button>
        <button class="codicon-btn" title="Collapse All"><span class="codicon codicon-collapse-all"></span></button>
      </div>
    </div>
    <div class="file-tree" id="file-tree-root"></div>
  `;
  const treeRoot = $('file-tree-root');
  if (treeRoot) renderFileTree(fileTree, treeRoot, 0);
}

function renderSearch(container) {
  container.innerHTML = `
    <div class="sidebar-title-bar">Search</div>
    <div style="padding:8px">
      <div class="search-input-wrap" style="margin:0 0 8px">
        <span class="codicon codicon-search"></span>
        <input type="text" placeholder="Search" id="search-input" />
      </div>
      <div class="search-input-wrap" style="margin:0">
        <span class="codicon codicon-replace"></span>
        <input type="text" placeholder="Replace" />
      </div>
    </div>
    <div style="padding:0 8px;font-size:12px;opacity:0.5">Type to search across files...</div>
  `;
}

function renderSCM(container) {
  container.innerHTML = `
    <div class="sidebar-title-bar">Source Control</div>
    <div style="padding:8px">
      <div style="background:var(--vscode-input-background);border-radius:4px;padding:6px 8px;font-size:12px;opacity:0.8">
        <input type="text" style="background:transparent;border:none;outline:none;color:inherit;width:100%;font-family:inherit;font-size:12px" placeholder="Message (Ctrl+Enter to commit)" />
      </div>
      <button style="margin-top:8px;width:100%;padding:5px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:4px;font-size:12px;cursor:pointer">Commit</button>
    </div>
    <div class="sidebar-header" style="margin-top:8px">
      <span class="codicon codicon-chevron-down" style="font-size:12px"></span>
      Changes (3)
    </div>
    <div style="padding:0 4px">
      <div class="source-control-item"><span class="sc-letter modified">M</span><span>src/App.tsx</span></div>
      <div class="source-control-item"><span class="sc-letter added">A</span><span>src/components/Button.tsx</span></div>
      <div class="source-control-item"><span class="sc-letter deleted">D</span><span>src/old.ts</span></div>
    </div>
  `;
}

function renderDebug(container) {
  container.innerHTML = `
    <div class="sidebar-title-bar">Run and Debug</div>
    <div style="padding:16px;text-align:center">
      <button class="welcome-action-btn primary" style="width:100%;justify-content:center" onclick="addNotification('info', 'Debug', 'No debug configuration found. Add a launch.json.')">
        <span class="codicon codicon-debug-alt"></span> Run and Debug
      </button>
      <div style="margin-top:12px;font-size:12px;opacity:0.6;line-height:1.6">
        To customize Run and Debug<br>create a launch.json file.
      </div>
    </div>
    <div class="sidebar-header">
      <span class="codicon codicon-chevron-right" style="font-size:12px"></span>
      Variables
    </div>
    <div class="sidebar-header">
      <span class="codicon codicon-chevron-right" style="font-size:12px"></span>
      Watch
    </div>
    <div class="sidebar-header">
      <span class="codicon codicon-chevron-right" style="font-size:12px"></span>
      Call Stack
    </div>
    <div class="sidebar-header">
      <span class="codicon codicon-chevron-right" style="font-size:12px"></span>
      Breakpoints
    </div>
  `;
}

function renderExtensions(container) {
  const extensions = [
    { name: 'ESLint', author: 'Microsoft', installs: '32.8M', icon: 'codicon-check' },
    { name: 'Prettier', author: 'Prettier', installs: '28.1M', icon: 'codicon-wand' },
    { name: 'GitLens', author: 'GitKraken', installs: '25.3M', icon: 'codicon-git-branch' },
    { name: 'Tailwind CSS IntelliSense', author: 'Tailwind Labs', installs: '15.2M', icon: 'codicon-sparkle' },
    { name: 'vscode-icons', author: 'VSCode Icons Team', installs: '18.4M', icon: 'codicon-files' },
  ];
  container.innerHTML = `
    <div class="sidebar-title-bar">Extensions</div>
    <div style="padding:8px">
      <div class="search-input-wrap" style="margin:0">
        <span class="codicon codicon-search"></span>
        <input type="text" placeholder="Search Extensions in Marketplace" />
      </div>
    </div>
    <div class="sidebar-header">
      <span class="codicon codicon-chevron-down" style="font-size:12px"></span>
      Installed
    </div>
    <div>
      ${extensions.map(ext => `
        <div class="file-tree-item" style="height:auto;padding:6px 12px;gap:8px;flex-wrap:wrap">
          <span class="codicon ${ext.icon}" style="font-size:24px;color:var(--vscode-button-background)"></span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600">${ext.name}</div>
            <div style="font-size:11px;opacity:0.6">${ext.author} · ${ext.installs} installs</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Layout Controls ──────────────────────────────────────────────────────────
function toggleSidebar() {
  state.sidebarVisible = !state.sidebarVisible;
  applyLayout();
}

function togglePanel() {
  state.panelVisible = !state.panelVisible;
  applyLayout();
}

function toggleJetski() {
  state.jetskiVisible = !state.jetskiVisible;
  applyLayout();
}

function applyLayout() {
  const sidebar = $('sidebar');
  const panel = $('panel');
  const jetski = $('jetski-panel');

  if (sidebar) sidebar.classList.toggle('hidden', !state.sidebarVisible);
  if (panel) panel.classList.toggle('hidden', !state.panelVisible);
  if (jetski) jetski.classList.toggle('hidden', !state.jetskiVisible);
}

// ─── Panel Tabs ───────────────────────────────────────────────────────────────
function switchPanelTab(tabId) {
  state.activePanelTab = tabId;
  $$('.panel-tab').forEach(el => el.classList.remove('active'));
  $$('.panel-view').forEach(el => el.classList.remove('active'));
  const tab = document.querySelector(`[data-panel="${tabId}"]`);
  const view = document.querySelector(`[data-panel-view="${tabId}"]`);
  if (tab) tab.classList.add('active');
  if (view) view.classList.add('active');
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
function initTerminal() {
  const term = $('terminal-output');
  if (!term) return;
  const promptLine = createPromptLine();
  term.appendChild(promptLine);
  term.scrollTop = term.scrollHeight;
}

function createPromptLine() {
  const line = document.createElement('div');
  line.style.cssText = 'display:flex;align-items:center;gap:4px;';
  line.innerHTML = `
    <span style="color:#73c991">user</span><span style="color:#888">@</span><span style="color:#6fc3df">antigravity</span><span style="color:#888">:</span><span style="color:#73c991">~/project</span><span style="color:#888">$</span>
    <span id="terminal-input-line" contenteditable="true" style="flex:1;outline:none;background:transparent;caret-color:#aeafad;min-width:10px" onkeydown="handleTerminalInput(event)"></span>
    <span class="terminal-cursor"></span>
  `;
  return line;
}

function handleTerminalInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const input = e.target.textContent.trim();
    e.target.contentEditable = false;
    e.target.nextElementSibling?.remove(); // remove cursor
    processTerminalCommand(input);
  }
}

function processTerminalCommand(cmd) {
  const term = $('terminal-output');
  if (!term) return;
  const responses = {
    'ls': 'src  public  node_modules  package.json  README.md  tsconfig.json  vite.config.ts',
    'pwd': '/home/user/project',
    'node --version': 'v20.11.0',
    'npm --version': '10.2.4',
    'git status': 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n  modified:   src/App.tsx\n  \nnew file: src/components/Button.tsx',
    'git log --oneline -5': 'a3f9d21 feat: add Button component\nb7e2c18 fix: resolve import error\nc1d0e45 chore: update dependencies\nd4f3b12 docs: update README\ne9a8c67 init: initial commit',
    'npm run dev': '  VITE v4.0.0  ready in 523 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose',
    'clear': null,
    'help': 'Available commands: ls, pwd, node --version, npm --version, git status, git log, npm run dev, clear',
  };

  if (cmd === 'clear') {
    term.innerHTML = '';
    const p = createPromptLine();
    term.appendChild(p);
    return;
  }

  const output = responses[cmd] || `zsh: command not found: ${cmd}`;
  const outDiv = document.createElement('div');
  outDiv.style.cssText = 'white-space:pre;padding:2px 0;line-height:1.6';
  outDiv.textContent = output;
  term.appendChild(outDiv);

  const nextPrompt = createPromptLine();
  term.appendChild(nextPrompt);
  term.scrollTop = term.scrollHeight;
  const inputLine = nextPrompt.querySelector('#terminal-input-line');
  if (inputLine) inputLine.focus();
}

// ─── Command Palette ──────────────────────────────────────────────────────────
function showCommandPalette() {
  const overlay = $('command-palette-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');
  const input = $('command-palette-input');
  if (input) {
    input.value = '';
    input.focus();
    renderCommandList('');
  }
}

function hideCommandPalette() {
  const overlay = $('command-palette-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function renderCommandList(filter) {
  const list = $('command-palette-list');
  if (!list) return;
  const filtered = filter
    ? commands.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()))
    : commands;
  list.innerHTML = filtered.map((cmd, i) => `
    <div class="cmd-item ${i === 0 ? 'focused' : ''}" onclick="executeCommand('${cmd.id}')">
      <span class="codicon ${cmd.icon}"></span>
      <span class="cmd-label">${highlightMatch(cmd.label, filter)}</span>
      ${cmd.shortcut ? `<span class="cmd-shortcut">${cmd.shortcut}</span>` : ''}
    </div>
  `).join('');
}

function highlightMatch(text, filter) {
  if (!filter) return text;
  const idx = text.toLowerCase().indexOf(filter.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + `<strong>${text.slice(idx, idx + filter.length)}</strong>` + text.slice(idx + filter.length);
}

function executeCommand(cmdId) {
  hideCommandPalette();
  switch (cmdId) {
    case 'toggle-sidebar': toggleSidebar(); break;
    case 'toggle-panel': togglePanel(); break;
    case 'toggle-terminal': state.activePanelTab = 'terminal'; if (!state.panelVisible) togglePanel(); else switchPanelTab('terminal'); break;
    case 'toggle-theme': toggleTheme(); break;
    case 'open-jetski': state.jetskiVisible = true; applyLayout(); break;
    case 'new-file': openNewFile(); break;
    case 'open-settings': openTab('settings.json', '', 'json'); break;
    default: addNotification('info', 'Command', `Executed: ${cmdId}`);
  }
}

// ─── Context Menu ─────────────────────────────────────────────────────────────
function showContextMenu(e, items) {
  e.preventDefault();
  const menu = $('context-menu');
  if (!menu) return;
  menu.innerHTML = items.map(item => {
    if (item.type === 'separator') return '<div class="context-menu-item separator"></div>';
    return `
      <div class="context-menu-item" onclick="${item.action}">
        <span class="codicon ${item.icon}"></span>
        <span>${item.label}</span>
        ${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}
      </div>
    `;
  }).join('');
  menu.style.left = `${Math.min(e.clientX, window.innerWidth - 200)}px`;
  menu.style.top = `${Math.min(e.clientY, window.innerHeight - 200)}px`;
  menu.classList.add('visible');
}

function hideContextMenu() {
  const menu = $('context-menu');
  if (menu) menu.classList.remove('visible');
}

// ─── Notifications ────────────────────────────────────────────────────────────
function addNotification(type, title, body, buttons) {
  const container = $('notifications');
  if (!container) return;
  const id = Date.now().toString();
  const icons = { info: 'codicon-info', warning: 'codicon-warning', error: 'codicon-error' };
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.id = `notif-${id}`;
  notif.innerHTML = `
    <div class="notif-header">
      <span class="codicon ${icons[type] || 'codicon-info'} notif-icon ${type}"></span>
      <span class="notif-title">${title}</span>
      <button class="notif-close codicon codicon-close" onclick="removeNotification('${id}')"></button>
    </div>
    <div class="notif-body">${body}</div>
    ${buttons ? `<div class="notif-actions">${buttons.map(b => `<button class="notif-btn ${b.primary ? 'primary' : ''}" onclick="${b.action}">${b.label}</button>`).join('')}</div>` : ''}
  `;
  container.appendChild(notif);
  setTimeout(() => removeNotification(id), 6000);
}

function removeNotification(id) {
  const el = $(`notif-${id}`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(110%)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme === 'light' ? 'light' : '';
  const themeItem = $('statusbar-theme');
  if (themeItem) themeItem.textContent = state.theme === 'dark' ? 'Dark+' : 'Light+';
}

// ─── Open New File ────────────────────────────────────────────────────────────
function openNewFile() {
  const name = `Untitled-${state.tabs.length + 1}`;
  openTab(name, '', 'txt');
}

// ─── Menu Bar ─────────────────────────────────────────────────────────────────
const menuData = {
  File: [
    { label: 'New File', icon: 'codicon-new-file', shortcut: 'Ctrl+N', action: "openNewFile()" },
    { label: 'New Window', icon: 'codicon-files', shortcut: 'Ctrl+Shift+N', action: "" },
    { type: 'separator' },
    { label: 'Open File...', icon: 'codicon-go-to-file', shortcut: 'Ctrl+O', action: "showCommandPalette()" },
    { label: 'Open Folder...', icon: 'codicon-files', shortcut: 'Ctrl+K Ctrl+O', action: "" },
    { type: 'separator' },
    { label: 'Save', icon: 'codicon-save', shortcut: 'Ctrl+S', action: "" },
    { label: 'Save All', icon: 'codicon-save-all', shortcut: 'Ctrl+Shift+S', action: "" },
    { type: 'separator' },
    { label: 'Close Editor', icon: 'codicon-close', shortcut: 'Ctrl+W', action: "" },
    { label: 'Exit', icon: 'codicon-close', shortcut: 'Alt+F4', action: "" },
  ],
  Edit: [
    { label: 'Undo', icon: 'codicon-arrow-left', shortcut: 'Ctrl+Z', action: "document.execCommand('undo')" },
    { label: 'Redo', icon: 'codicon-arrow-right', shortcut: 'Ctrl+Y', action: "document.execCommand('redo')" },
    { type: 'separator' },
    { label: 'Cut', icon: 'codicon-copy', shortcut: 'Ctrl+X', action: "document.execCommand('cut')" },
    { label: 'Copy', icon: 'codicon-copy', shortcut: 'Ctrl+C', action: "document.execCommand('copy')" },
    { label: 'Paste', icon: 'codicon-add', shortcut: 'Ctrl+V', action: "document.execCommand('paste')" },
    { type: 'separator' },
    { label: 'Find', icon: 'codicon-search', shortcut: 'Ctrl+F', action: "" },
    { label: 'Replace', icon: 'codicon-edit', shortcut: 'Ctrl+H', action: "" },
  ],
  View: [
    { label: 'Command Palette...', icon: 'codicon-search', shortcut: 'Ctrl+Shift+P', action: "showCommandPalette()" },
    { type: 'separator' },
    { label: 'Explorer', icon: 'codicon-files', shortcut: 'Ctrl+Shift+E', action: "switchActivity('explorer')" },
    { label: 'Search', icon: 'codicon-search', shortcut: 'Ctrl+Shift+F', action: "switchActivity('search')" },
    { label: 'Source Control', icon: 'codicon-source-control', shortcut: 'Ctrl+Shift+G', action: "switchActivity('scm')" },
    { label: 'Debug', icon: 'codicon-debug-alt', shortcut: 'Ctrl+Shift+D', action: "switchActivity('debug')" },
    { label: 'Extensions', icon: 'codicon-extensions', shortcut: 'Ctrl+Shift+X', action: "switchActivity('extensions')" },
    { type: 'separator' },
    { label: 'Toggle Sidebar', icon: 'codicon-layout-sidebar-left-off', shortcut: 'Ctrl+B', action: "toggleSidebar()" },
    { label: 'Toggle Panel', icon: 'codicon-layout-panel-off', shortcut: 'Ctrl+J', action: "togglePanel()" },
    { label: 'Toggle Terminal', icon: 'codicon-terminal', shortcut: 'Ctrl+`', action: "switchPanelTab('terminal');if(!state.panelVisible)togglePanel()" },
    { type: 'separator' },
    { label: 'Toggle Theme', icon: 'codicon-circle-filled', shortcut: '', action: "toggleTheme()" },
  ],
  Terminal: [
    { label: 'New Terminal', icon: 'codicon-add', shortcut: 'Ctrl+Shift+`', action: "switchPanelTab('terminal');if(!state.panelVisible)togglePanel()" },
    { type: 'separator' },
    { label: 'Split Terminal', icon: 'codicon-split-horizontal', shortcut: 'Ctrl+Shift+5', action: "" },
    { label: 'Kill Terminal', icon: 'codicon-trash', shortcut: '', action: "" },
  ],
  Help: [
    { label: 'Welcome', icon: 'codicon-home', shortcut: '', action: "showWelcome()" },
    { label: 'Documentation', icon: 'codicon-book', shortcut: '', action: "" },
    { type: 'separator' },
    { label: 'About Antigravity IDE', icon: 'codicon-info', shortcut: '', action: "addNotification('info','Antigravity IDE','Version 2.1.1 — Powered by Google Gemini')" },
  ],
};

function showMenu(menuName, btn) {
  hideAllMenus();
  const existing = document.querySelector('.dropdown-menu.visible');
  if (existing && existing.dataset.menu === menuName) return;

  const menu = document.createElement('div');
  menu.className = 'dropdown-menu visible';
  menu.dataset.menu = menuName;
  const items = menuData[menuName] || [];
  menu.innerHTML = items.map(item => {
    if (item.type === 'separator') return '<div class="menu-separator"></div>';
    return `
      <div class="menu-option" onclick="${item.action};hideAllMenus()">
        <span class="codicon ${item.icon}"></span>
        <span>${item.label}</span>
        ${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}
      </div>
    `;
  }).join('');
  const rect = btn.getBoundingClientRect();
  menu.style.top = `${rect.bottom}px`;
  menu.style.left = `${rect.left}px`;
  document.body.appendChild(menu);
}

function hideAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(el => el.remove());
}

// ─── Jetski AI Panel ──────────────────────────────────────────────────────────
function renderJetskiMessages() {
  const container = $('jetski-messages');
  if (!container) return;
  container.innerHTML = state.jetskiMessages.map(msg => `
    <div class="jetski-message ${msg.role}">
      <div class="msg-role">${msg.role === 'assistant' ? 'Antigravity' : 'You'}</div>
      <div class="msg-content">${msg.content}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

function sendJetskiMessage() {
  const input = $('jetski-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  state.jetskiMessages.push({ role: 'user', content: text });
  input.value = '';
  renderJetskiMessages();
  setTimeout(() => {
    const responses = [
      'I can help you with that! Let me analyze the code...',
      'Here\'s a suggestion for your code:\n\n```typescript\nconst result = await fetch(\'/api/data\');\nconst data = await result.json();\nconsole.log(data);\n```',
      'That\'s a great approach. Consider also adding error handling with try/catch blocks.',
      'I\'ve reviewed the file structure. Your component architecture looks clean and well-organized.',
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    state.jetskiMessages.push({ role: 'assistant', content: reply });
    renderJetskiMessages();
  }, 800);
}

// ─── Resize Handlers ──────────────────────────────────────────────────────────
function initResizeHandles() {
  // Sidebar resize
  const sidebarResizer = document.createElement('div');
  sidebarResizer.className = 'resize-handle horizontal';
  sidebarResizer.style.cssText = 'right:0;top:0;bottom:0;';
  const sidebar = $('sidebar');
  if (sidebar) {
    sidebar.style.position = 'relative';
    sidebar.appendChild(sidebarResizer);
    let dragging = false;
    let startX, startW;
    sidebarResizer.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX;
      startW = sidebar.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const w = Math.max(150, Math.min(600, startW + e.clientX - startX));
      sidebar.style.width = w + 'px';
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  // Panel resize
  const panelResizer = document.createElement('div');
  panelResizer.className = 'resize-handle vertical';
  panelResizer.style.cssText = 'top:0;left:0;right:0;';
  const panel = $('panel');
  if (panel) {
    panel.style.position = 'relative';
    panel.insertBefore(panelResizer, panel.firstChild);
    let dragging = false;
    let startY, startH;
    panelResizer.addEventListener('mousedown', e => {
      dragging = true;
      startY = e.clientY;
      startH = panel.offsetHeight;
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const h = Math.max(80, Math.min(window.innerHeight * 0.7, startH - (e.clientY - startY)));
      panel.style.height = h + 'px';
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function initTooltips() {
  const tooltip = document.createElement('div');
  tooltip.id = 'tooltip';
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  document.querySelectorAll('[title]').forEach(el => {
    const title = el.getAttribute('title');
    if (!title) return;
    el.removeAttribute('title');
    el.dataset.tooltip = title;

    el.addEventListener('mouseenter', e => {
      tooltip.textContent = title;
      tooltip.classList.add('visible');
      const rect = el.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.bottom + 6}px`;
    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });
}

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.shiftKey && e.key === 'P') { e.preventDefault(); showCommandPalette(); }
    else if (ctrl && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
    else if (ctrl && e.key === 'j') { e.preventDefault(); togglePanel(); }
    else if (ctrl && e.key === '`') { e.preventDefault(); if (!state.panelVisible) togglePanel(); switchPanelTab('terminal'); }
    else if (ctrl && e.key === 'n') { e.preventDefault(); openNewFile(); }
    else if (ctrl && e.shiftKey && e.key === 'E') { e.preventDefault(); switchActivity('explorer'); }
    else if (ctrl && e.shiftKey && e.key === 'F') { e.preventDefault(); switchActivity('search'); }
    else if (ctrl && e.shiftKey && e.key === 'G') { e.preventDefault(); switchActivity('scm'); }
    else if (ctrl && e.shiftKey && e.key === 'X') { e.preventDefault(); switchActivity('extensions'); }
    else if (ctrl && e.shiftKey && e.key === 'A') { e.preventDefault(); toggleJetski(); }
    else if (e.key === 'Escape') { hideCommandPalette(); hideContextMenu(); hideAllMenus(); }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  // Show welcome
  showWelcome();

  // Set initial activity
  const activeBtn = document.querySelector(`[data-view="explorer"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Render sidebar
  const sidebarContent = $('sidebar-content');
  if (sidebarContent) renderExplorer(sidebarContent);

  // Init terminal
  initTerminal();

  // Render jetski messages
  renderJetskiMessages();

  // Init resize handles
  initResizeHandles();

  // Init keyboard shortcuts
  initKeyboardShortcuts();

  // Init tooltips (delayed to allow DOM to settle)
  setTimeout(initTooltips, 100);

  // Command palette input
  const cpInput = $('command-palette-input');
  if (cpInput) {
    cpInput.addEventListener('input', () => renderCommandList(cpInput.value));
    cpInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideCommandPalette();
      if (e.key === 'Enter') {
        const focused = document.querySelector('.cmd-item.focused');
        if (focused) focused.click();
      }
    });
  }

  // Command palette overlay click to close
  const cpOverlay = $('command-palette-overlay');
  if (cpOverlay) {
    cpOverlay.addEventListener('click', e => {
      if (e.target === cpOverlay) hideCommandPalette();
    });
  }

  // Global click to hide menus
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-item') && !e.target.closest('.dropdown-menu')) {
      hideAllMenus();
    }
    if (!e.target.closest('#context-menu') && !e.target.closest('[data-contextmenu]')) {
      hideContextMenu();
    }
  });

  // Context menu on editor area
  const editorContent = $('editor-content');
  if (editorContent) {
    editorContent.addEventListener('contextmenu', e => {
      showContextMenu(e, [
        { label: 'Cut', icon: 'codicon-copy', shortcut: 'Ctrl+X', action: "document.execCommand('cut')" },
        { label: 'Copy', icon: 'codicon-copy', shortcut: 'Ctrl+C', action: "document.execCommand('copy')" },
        { label: 'Paste', icon: 'codicon-add', shortcut: 'Ctrl+V', action: "document.execCommand('paste')" },
        { type: 'separator' },
        { label: 'Format Document', icon: 'codicon-wand', shortcut: 'Shift+Alt+F', action: "addNotification('info','Format','Document formatted')" },
        { label: 'Rename Symbol', icon: 'codicon-edit', shortcut: 'F2', action: "" },
        { type: 'separator' },
        { label: 'Open Integrated Terminal', icon: 'codicon-terminal', shortcut: '', action: "if(!state.panelVisible)togglePanel();switchPanelTab('terminal')" },
      ]);
    });
  }

  // Jetski input
  const jetskiInput = $('jetski-input');
  if (jetskiInput) {
    jetskiInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendJetskiMessage();
      }
    });
  }

  // Welcome notification
  setTimeout(() => {
    addNotification('info', 'Antigravity IDE', 'Welcome! Start coding or ask the AI assistant for help.', [
      { label: 'Open AI Chat', primary: true, action: "toggleJetski();removeNotification(this.closest('.notification').id.replace('notif-',''))" }
    ]);
  }, 1500);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
