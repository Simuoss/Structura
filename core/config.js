// 外观配置模块
class ConfigManager {
    constructor() {
        this.fontList = [
            { name: '系统默认', value: 'system', family: '' },
            { name: '[衬线] Georgia', value: 'georgia', family: 'Georgia, serif' },
            { name: '[衬线] Times New Roman', value: 'times', family: '"Times New Roman", Times, serif' },
            { name: '[衬线] Palatino', value: 'palatino', family: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
            { name: '[衬线] Garamond', value: 'garamond', family: 'Garamond, serif' },
            { name: '[无衬线] Arial', value: 'arial', family: 'Arial, sans-serif' },
            { name: '[无衬线] Helvetica', value: 'helvetica', family: 'Helvetica, Arial, sans-serif' },
            { name: '[无衬线][中字] Segoe UI', value: 'segoe', family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
            { name: '[无衬线][中字] Calibri', value: 'calibri', family: 'Calibri, sans-serif' },
            { name: '[等宽] Courier New', value: 'courier', family: '"Courier New", Courier, monospace' },
            { name: '[等宽][中字] Consolas', value: 'consolas', family: 'Consolas, "Lucida Console", monospace' },
            { name: '[等宽] Monaco', value: 'monaco', family: 'Monaco, "Menlo", "Ubuntu Mono", monospace' },
            { name: '[等宽][中字] Source Code Pro', value: 'source-code', family: '"Source Code Pro", "Courier New", monospace' },
            { name: '[无衬线][中字] 微软雅黑', value: 'microsoft-yahei', family: '"Microsoft YaHei", "微软雅黑", sans-serif' },
            { name: '[衬线][中字] 宋体', value: 'simsun', family: 'SimSun, "宋体", serif' },
            { name: '[等宽][中字] 等距更纱黑体', value: 'sarasa-mono', family: '"Sarasa Mono SC", "等距更纱黑体 SC", monospace' }
        ];
        
        this.spacingControls = {};
        this.spacingValues = {};
        this.fontFamilySelect = null;
        this.fontSizeSelect = null;
        this.diagramOutput = null;
        
        this.init();
    }
    
    init() {
        // 获取DOM元素
        this.fontFamilySelect = document.getElementById('font-family');
        this.fontSizeSelect = document.getElementById('font-size');
        this.diagramOutput = document.getElementById('diagram-output');
        
        // 初始化倍数控制元素
        this.spacingControls = {
            global: document.getElementById('global-spacing'),
            padding: document.getElementById('padding-multiplier'),
            margin: document.getElementById('margin-multiplier'),
            border: document.getElementById('border-multiplier'),
            borderRadius: document.getElementById('border-radius-multiplier')
        };
        
        this.spacingValues = {
            globalValue: document.getElementById('global-spacing-value'),
            paddingValue: document.getElementById('padding-value'),
            marginValue: document.getElementById('margin-value'),
            borderValue: document.getElementById('border-value'),
            borderRadiusValue: document.getElementById('border-radius-value')
        };
        
        // 初始化字体选项
        this.initializeFontOptions();
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 初始化倍数控制
        this.updateSpacingValues();
    }
    
    // 动态生成字体选项
    initializeFontOptions() {
        if (!this.fontFamilySelect) return;
        
        this.fontFamilySelect.innerHTML = '';
        this.fontList.forEach(font => {
            const option = document.createElement('option');
            option.value = font.value;
            option.textContent = font.name;
            this.fontFamilySelect.appendChild(option);
        });
    }
    
    // 更新字体设置
    updateFontSettings() {
        if (!this.diagramOutput || !this.fontFamilySelect || !this.fontSizeSelect) return;
        
        const fontValue = this.fontFamilySelect.value;
        const fontSize = this.fontSizeSelect.value;
        
        // 找到对应的字体
        const selectedFont = this.fontList.find(font => font.value === fontValue);
        
        // 直接设置字体族
        if (selectedFont && selectedFont.family) {
            this.diagramOutput.style.fontFamily = selectedFont.family;
        } else {
            this.diagramOutput.style.fontFamily = '';
        }
        
        // 设置字号
        this.diagramOutput.style.fontSize = fontSize + 'px';
    }
    
    // 更新倍数显示值
    updateSpacingValues() {
        if (!this.spacingControls.global) return;
        
        this.spacingValues.globalValue.textContent = parseFloat(this.spacingControls.global.value).toFixed(1);
        this.spacingValues.paddingValue.textContent = parseFloat(this.spacingControls.padding.value).toFixed(1);
        this.spacingValues.marginValue.textContent = parseFloat(this.spacingControls.margin.value).toFixed(1);
        this.spacingValues.borderValue.textContent = parseFloat(this.spacingControls.border.value).toFixed(1);
        this.spacingValues.borderRadiusValue.textContent = parseFloat(this.spacingControls.borderRadius.value).toFixed(1);
    }
    
    // 应用倍数到样式
    applySpacingMultipliers() {
        if (!this.diagramOutput || !this.spacingControls.global) return;
        
        const globalMultiplier = parseFloat(this.spacingControls.global.value);
        const paddingMultiplier = parseFloat(this.spacingControls.padding.value);
        const marginMultiplier = parseFloat(this.spacingControls.margin.value);
        const borderMultiplier = parseFloat(this.spacingControls.border.value);
        const borderRadiusMultiplier = parseFloat(this.spacingControls.borderRadius.value);
        
        // 设置CSS变量
        this.diagramOutput.style.setProperty('--global-spacing-multiplier', globalMultiplier);
        this.diagramOutput.style.setProperty('--padding-multiplier', paddingMultiplier);
        this.diagramOutput.style.setProperty('--margin-multiplier', marginMultiplier);
        this.diagramOutput.style.setProperty('--border-multiplier', borderMultiplier);
        this.diagramOutput.style.setProperty('--border-radius-multiplier', borderRadiusMultiplier);
        
        // 直接应用到所有相关元素
        const blocks = this.diagramOutput.querySelectorAll('.block');
        const sidebars = this.diagramOutput.querySelectorAll('.sidebar');
        
        [...blocks, ...sidebars].forEach(element => {
            // 获取原始样式值（如果没有设置过，使用默认值）
            const computedStyle = window.getComputedStyle(element);
            
            // 应用内边距倍数
            const originalPadding = element.dataset.originalPadding || computedStyle.padding || '8px';
            if (!element.dataset.originalPadding) {
                element.dataset.originalPadding = originalPadding;
            }
            const paddingValue = parseFloat(originalPadding) * globalMultiplier * paddingMultiplier;
            element.style.padding = paddingValue + 'px';
            
            // 应用外边距倍数
            const originalMargin = element.dataset.originalMargin || computedStyle.margin || '4px';
            if (!element.dataset.originalMargin) {
                element.dataset.originalMargin = originalMargin;
            }
            const marginValue = parseFloat(originalMargin) * globalMultiplier * marginMultiplier;
            element.style.margin = marginValue + 'px';
            
            // 应用边框倍数
            const originalBorderWidth = element.dataset.originalBorderWidth || computedStyle.borderWidth || '1px';
            if (!element.dataset.originalBorderWidth) {
                element.dataset.originalBorderWidth = originalBorderWidth;
            }
            const borderValue = parseFloat(originalBorderWidth) * globalMultiplier * borderMultiplier;
            element.style.borderWidth = borderValue + 'px';
            
            // 应用圆角倍数
            const originalBorderRadius = element.dataset.originalBorderRadius || computedStyle.borderRadius || '4px';
            if (!element.dataset.originalBorderRadius) {
                element.dataset.originalBorderRadius = originalBorderRadius;
            }
            const borderRadiusValue = parseFloat(originalBorderRadius) * globalMultiplier * borderRadiusMultiplier;
            element.style.borderRadius = borderRadiusValue + 'px';
        });
    }
    
    // 绑定事件监听器
    bindEvents() {
        // 字体设置事件
        if (this.fontFamilySelect) {
            this.fontFamilySelect.addEventListener('change', () => this.updateFontSettings());
        }
        if (this.fontSizeSelect) {
            this.fontSizeSelect.addEventListener('change', () => this.updateFontSettings());
        }
        
        // 倍数控制事件
        Object.values(this.spacingControls).forEach(control => {
            if (control) {
                control.addEventListener('input', () => {
                    this.updateSpacingValues();
                    this.applySpacingMultipliers();
                });
            }
        });
    }
    
    // 初始化方法，保持与其他管理器的一致性
    async initialize() {
        // 初始化字体选项
        this.initializeFontOptions();
        
        // 初始化字体设置
        this.updateFontSettings();
        
        // 初始化倍数控制显示
        this.updateSpacingValues();
        
        return Promise.resolve();
    }
}

// 导出配置管理器
window.ConfigManager = ConfigManager;