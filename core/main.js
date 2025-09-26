/**
 * 主要逻辑管理器
 * 负责应用的主要功能，包括生成渲染、代码预览、导出、主题管理等
 */
class MainManager {
    constructor() {
        this.currentTheme = 'default';
        this.availableThemes = [];
        this.themeCache = {};
        
        // DOM 元素引用
        this.inputTextArea = null;
        this.generateBtn = null;
        this.exportBtn = null;
        this.codePreview = null;
        this.diagramOutput = null;
        this.themeSelect = null;
        this.themeCss = null;
        this.showStructureTogglesCheckbox = null;
        this.hideOutlinesCheckbox = null;
        
        // 依赖的管理器实例
        this.astParser = null;
        this.renderer = null;
        this.configManager = null;
        
        // 持久化存储键名
        this.storageKeys = {
            inputContent: 'structura_input_content',
            settings: 'structura_settings'
        };
    }

    /**
     * 加载输入内容
     */
    async loadInputContent() {
        const savedInput = this.loadInput();
        if (savedInput && savedInput.trim()) {
            this.inputTextArea.value = savedInput;
        } else {
            // 如果没有保存的输入内容或内容为空，加载默认模板
            await this.loadDefaultTemplate();
        }
    }
    
    /**
     * 加载默认模板
     */
    async loadDefaultTemplate() {
        try {
            const response = await fetch('./template/full.js');
            const templateContent = await response.text();
            // 提取模板内容（去掉可能的export语句等）
            const match = templateContent.match(/`([^`]+)`/);
            if (match) {
                this.inputTextArea.value = match[1];
            } else {
                // 如果模板格式不对，使用备用默认内容
                this.inputTextArea.value = `# 前端层{layout=r}
## 用户界面
- 登录页面
- 主页面
- 设置页面

## 组件库
- 按钮组件
- 表单组件
- 图表组件`;
            }
        } catch (error) {
            console.warn('无法加载默认模板，使用内置默认内容:', error);
            this.inputTextArea.value = `# 前端层{layout=r}
## 用户界面
- 登录页面
- 主页面
- 设置页面

## 组件库
- 按钮组件
- 表单组件
- 图表组件`;
        }
    }
    
    // 保存数据到localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('保存到localStorage失败:', error);
        }
    }
    
    // 从localStorage读取数据
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('从localStorage读取失败:', error);
            return defaultValue;
        }
    }
    
    // 保存输入内容
    saveInputContent(content) {
        this.saveToStorage(this.storageKeys.inputContent, content);
    }
    
    // 保存当前输入框内容
    saveInput() {
        if (this.inputTextArea) {
            this.saveInputContent(this.inputTextArea.value);
        }
    }
    
    // 加载输入内容
    async loadInputContent() {
        const savedInput = this.loadFromStorage(this.storageKeys.inputContent, '');
        if (savedInput && savedInput.trim()) {
            this.inputTextArea.value = savedInput;
        } else {
            // 如果没有保存的输入内容或内容为空，加载默认模板
            await this.loadDefaultTemplate();
        }
    }
    
    // 保存设置
    saveSettings(settings) {
        this.saveToStorage(this.storageKeys.settings, settings);
    }
    
    // 加载设置
    loadSettings() {
        return this.loadFromStorage(this.storageKeys.settings, {});
    }
    
    // 重置设置（不重置输入内容）
    resetSettings() {
        localStorage.removeItem(this.storageKeys.settings);
        // 重新初始化配置管理器
        if (this.configManager) {
            this.configManager.resetToDefaults();
        }
        // 重置主题
        this.currentTheme = 'default';
        if (this.themeSelect) {
            this.themeSelect.value = 'default';
            this.switchTheme('default');
        }
    }

    /**
     * 初始化主管理器
     */
    async initialize() {
        this.initializeDOMElements();
        this.bindEvents();
        await this.initializeThemes();
        
        // 加载输入内容
        await this.loadInputContent();
        
        // 初始化配置管理器
        this.configManager = new ConfigManager(this);
        await this.configManager.initialize();
        
        this.generateAndRender();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeDOMElements() {
        this.inputTextArea = document.getElementById('input-textarea');
        this.generateBtn = document.getElementById('generate-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.resetSettingsBtn = document.getElementById('reset-settings-btn');
        this.codePreview = document.getElementById('code-preview');
        this.diagramOutput = document.getElementById('diagram-output');
        this.themeSelect = document.getElementById('theme-select');
        this.themeCss = document.getElementById('theme-css');
        this.showStructureTogglesCheckbox = document.getElementById('show-structure-toggles');
        this.hideOutlinesCheckbox = document.getElementById('hide-outlines');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 绑定按钮事件
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateAndRender());
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportHTML());
        }
        if (this.resetSettingsBtn) {
            this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        
        // 绑定输入框自动保存事件
        if (this.inputTextArea) {
            this.inputTextArea.addEventListener('input', () => this.saveInput());
        }
        
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', (e) => this.switchTheme(e.target.value));
        }
        
        // 结构层布局按钮显示控制
        if (this.showStructureTogglesCheckbox) {
            this.showStructureTogglesCheckbox.addEventListener('change', (e) => {
                this.toggleStructureLayoutButtons(e.target.checked);
                if (this.configManager) {
                    this.configManager.saveSettings();
                }
            });
        }
        
        // 轮廓线显示控制
        if (this.hideOutlinesCheckbox) {
            this.hideOutlinesCheckbox.addEventListener('change', (e) => {
                this.toggleOutlines(e.target.checked);
                if (this.configManager) {
                    this.configManager.saveSettings();
                }
            });
        }
    }

    /**
     * 设置依赖的管理器实例
     */
    setDependencies(astParser, renderer, configManager) {
        this.astParser = astParser;
        this.renderer = renderer;
        this.configManager = configManager;
    }

    /**
     * 生成并渲染图表
     */
    async generateAndRender() {
        const text = this.inputTextArea.value;
        const ast = this.astParser.parse(text);
        this.renderer.renderDiagram(ast);
        
        // 延迟应用间距倍数设置，确保DOM渲染完成
        setTimeout(() => {
            if (this.configManager && this.configManager.applySpacingMultipliers) {
                this.configManager.applySpacingMultipliers();
            }
        }, 100);
        
        await this.updateCodePreview();
    }

    /**
     * 更新代码预览
     */
    async updateCodePreview() {
        const clone = this.diagramOutput.cloneNode(true);
        clone.querySelectorAll('.layout-toggle').forEach(el => el.remove());
        const htmlContent = clone.innerHTML;
        
        // 异步获取CSS内容
        const cssContent = await this.getDiagramCSS();
        
        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>架构图</title>
    <style>
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        this.codePreview.textContent = fullHtml;
    }

    /**
     * 导出HTML文件
     */
    async exportHTML() {
        // 确保代码预览是最新的
        await this.updateCodePreview();
        
        const blob = new Blob([this.codePreview.textContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'architecture-diagram.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * 获取图表CSS样式
     */
    async getDiagramCSS() {
        try {
            const cssContent = await this.loadThemeCSS(this.currentTheme);
            return cssContent;
        } catch (error) {
            console.error('获取主题CSS失败:', error);
            // 如果加载失败，返回基本样式
            return `
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background-color: #f4f7f9; }
        .block { border: 1px solid #ddd; border-radius: 8px; background-color: #fff; padding: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.08); margin: 8px; }
        .structure-only-block { border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
        .block-title { font-weight: 600; margin: 0 0 8px 0; }
        .block-items-container { display: flex; flex-direction: column; gap: 8px; }
        .block-items-container p { margin: 0; }
        .markdown-content > *:first-child { margin-top: 0; } .markdown-content > *:last-child { margin-bottom: 0; }
        .text-content { white-space: pre; font-family: monospace; background-color: #f8f8f8; padding: 8px; border-radius: 4px; margin: 0;}
        .block-container { min-height: 20px; }
        .layout-vertical { display: flex; flex-direction: column; }
        .layout-horizontal { display: flex; flex-direction: row; align-items: stretch; }
        .layout-horizontal > .block { flex: 1; }
        .block-content-wrapper { display: flex; align-items: stretch; gap: 16px; }
        .block-main-content { flex: 1; min-width: 0; }
        .block-sidebar { flex: 0 0 240px; }
                `.trim();
        }
    }

    /**
     * 异步加载主题CSS文件内容
     */
    async loadThemeCSS(themeName) {
        // 如果已经缓存，直接返回
        if (this.themeCache[themeName]) {
            return this.themeCache[themeName];
        }
        
        try {
            const response = await fetch(`../themes/${themeName}.css`);
            if (!response.ok) {
                throw new Error(`无法加载主题文件: ${themeName}.css`);
            }
            const cssContent = await response.text();
            
            // 缓存CSS内容
            this.themeCache[themeName] = cssContent;
            return cssContent;
        } catch (error) {
            console.error(`加载主题 ${themeName} 失败:`, error);
            // 如果加载失败，返回空字符串或默认样式
            return '';
        }
    }

    /**
     * 动态扫描themes文件夹中的主题文件
     */
    async scanThemes() {
        try {
            // 尝试获取themes文件夹的文件列表
            const response = await fetch('themes/');
            const text = await response.text();
            
            // 解析HTML响应，提取.css文件（排除base.css）
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = doc.querySelectorAll('a[href$=".css"]');
            
            this.availableThemes = [];
            links.forEach(link => {
                const filename = link.getAttribute('href');
                if (filename && filename !== 'base.css') {
                    const themeName = filename.replace('.css', '');
                    this.availableThemes.push({
                        name: themeName,
                        displayName: this.getThemeDisplayName(themeName)
                    });
                }
            });
            
            // 如果无法通过目录列表获取，使用默认主题列表
            if (this.availableThemes.length === 0) {
                this.availableThemes = [
                    { name: 'default', displayName: '默认' },
                    { name: 'dark', displayName: '深色' },
                    { name: 'candy', displayName: '糖果' }
                ];
            }
            
            this.updateThemeSelector();
        } catch (error) {
            console.log('无法动态扫描主题，使用默认主题列表');
            // 使用默认主题列表
            this.availableThemes = [
                { name: 'default', displayName: '默认' },
                { name: 'dark', displayName: '深色' },
                { name: 'candy', displayName: '糖果' }
            ];
            this.updateThemeSelector();
        }
    }

    /**
     * 获取主题显示名称
     */
    getThemeDisplayName(themeName) {
        const displayNames = {
            'default': '默认',
            'dark': '深色',
            'candy': '糖果'
        };
        return displayNames[themeName] || themeName.charAt(0).toUpperCase() + themeName.slice(1);
    }

    /**
     * 更新主题选择器
     */
    updateThemeSelector() {
        // 清空现有选项
        this.themeSelect.innerHTML = '';
        
        // 添加新选项
        this.availableThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.name;
            option.textContent = theme.displayName;
            this.themeSelect.appendChild(option);
        });
        
        // 恢复保存的主题选择
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        if (this.availableThemes.some(theme => theme.name === savedTheme)) {
            this.themeSelect.value = savedTheme;
            this.switchTheme(savedTheme);
        } else {
            // 如果保存的主题不存在，使用第一个可用主题
            const firstTheme = this.availableThemes[0]?.name || 'default';
            this.themeSelect.value = firstTheme;
            this.switchTheme(firstTheme);
        }
    }

    /**
     * 切换主题
     */
    switchTheme(theme) {
        this.currentTheme = theme;
        this.themeCss.href = `themes/${theme}.css`;
        localStorage.setItem('selectedTheme', theme);
    }

    /**
     * 初始化主题系统
     */
    async initializeThemes() {
        await this.scanThemes();
    }

    /**
     * 切换结构层布局按钮显示
     */
    toggleStructureLayoutButtons(show) {
        const structureBlocks = document.querySelectorAll('.block[data-structure-only="true"]');
        structureBlocks.forEach(block => {
            const layoutToggle = block.querySelector('.layout-toggle');
            if (layoutToggle) {
                layoutToggle.style.display = show ? 'block' : 'none';
            }
            
            // 根据按钮显示状态切换结构层的视觉样式
            if (show) {
                block.classList.add('show-structure');
            } else {
                block.classList.remove('show-structure');
            }
        });
    }

    /**
     * 切换轮廓线显示
     */
    toggleOutlines(hide) {
        const diagramOutput = document.getElementById('diagram-output');
        if (hide) {
            diagramOutput.classList.add('hide-outlines');
        } else {
            diagramOutput.classList.remove('hide-outlines');
        }
    }
}

// 导出类以供使用
window.MainManager = MainManager;