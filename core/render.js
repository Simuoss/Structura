/**
 * 渲染模块 - 负责将AST渲染为DOM元素
 * 支持新的AST结构：
 * - block类型节点
 * - listItem类型节点  
 * - codeBlock类型节点
 * - 侧边栏支持（left/right）
 * - 不可见结构层支持
 */
class Renderer {
    constructor() {
        this.showStructureTogglesCheckbox = null;
        this.init();
    }
    
    init() {
        // 获取结构切换复选框
        this.showStructureTogglesCheckbox = document.getElementById('show-structure-toggles');
    }

    /**
     * 渲染文档AST
     * @param {Object} ast - 文档AST对象
     */
    renderDocument(ast) {
        const diagramOutput = document.getElementById('diagram-output');
        if (!diagramOutput) return;

        // 清空输出区域
        diagramOutput.innerHTML = '';

        if (ast.type === 'document' && ast.children) {
            this.renderBlocks(ast.children, diagramOutput);
        }

        // 设置交互功能
        this.setupSortable();
        this.setupLayoutToggles();
    }

    /**
     * 渲染块列表
     * @param {Array} blocks - 块数组
     * @param {HTMLElement} parentElement - 父元素
     * @param {string} defaultLayout - 默认布局
     */
    renderBlocks(blocks, parentElement, defaultLayout = null) {
        if (!blocks || blocks.length === 0) return;

        // 按侧边栏类型分组
        const leftSidebarBlocks = blocks.filter(block => block.sidebar === 'left');
        const rightSidebarBlocks = blocks.filter(block => block.sidebar === 'right');
        const mainBlocks = blocks.filter(block => !block.sidebar || block.sidebar === null);

        const hasSidebar = leftSidebarBlocks.length > 0 || rightSidebarBlocks.length > 0;

        let targetParent = parentElement;

        // 如果有侧边栏，创建包装器
        if (hasSidebar) {
            const wrapper = document.createElement('div');
            wrapper.className = 'block-content-wrapper';

            // 左侧边栏
            if (leftSidebarBlocks.length > 0) {
                const leftSidebar = document.createElement('div');
                leftSidebar.className = 'block-sidebar block-sidebar-left';
                this.renderBlockGroup(leftSidebarBlocks, leftSidebar, 'layout-vertical');
                wrapper.appendChild(leftSidebar);
            }

            // 主内容区域
            const mainContent = document.createElement('div');
            mainContent.className = 'block-main-content';
            wrapper.appendChild(mainContent);
            targetParent = mainContent;

            // 右侧边栏
            if (rightSidebarBlocks.length > 0) {
                const rightSidebar = document.createElement('div');
                rightSidebar.className = 'block-sidebar block-sidebar-right';
                this.renderBlockGroup(rightSidebarBlocks, rightSidebar, 'layout-vertical');
                wrapper.appendChild(rightSidebar);
            }

            parentElement.appendChild(wrapper);
        }

        // 渲染主要块
        this.renderBlockGroup(mainBlocks, targetParent, defaultLayout);
    }

    /**
     * 渲染块组
     * @param {Array} blocks - 块数组
     * @param {HTMLElement} parentElement - 父元素
     * @param {string} defaultLayout - 默认布局
     */
    renderBlockGroup(blocks, parentElement, defaultLayout = null) {
        if (!blocks || blocks.length === 0) return;

        const container = document.createElement('div');
        const level = blocks[0].level || 1;
        
        // 确定布局
        let layout = defaultLayout;
        if (!layout) {
            layout = level <= 2 ? 'layout-vertical' : 'layout-horizontal';
        }
        
        container.className = `block-container ${layout}`;
        parentElement.appendChild(container);

        blocks.forEach(block => {
            const blockElement = this.renderBlock(block);
            if (blockElement) {
                container.appendChild(blockElement);
            }
        });
    }

    /**
     * 渲染单个块
     * @param {Object} block - 块对象
     * @returns {HTMLElement} 块DOM元素
     */
    renderBlock(block) {
        if (block.type !== 'block') return null;

        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.setAttribute('data-level', block.level);

        // 设置块ID
        if (block.id) {
            blockElement.setAttribute('id', block.id);
            blockElement.setAttribute('data-block-id', block.id);
        }

        // 处理不可见结构层
        if (block.invisible) {
            blockElement.classList.add('structure-only-block');
            blockElement.setAttribute('data-structure-only', 'true');
        }

        // 应用块属性
        if (block.attributes) {
            // 对于不可见结构层，只处理非样式属性
            if (block.invisible) {
                // 处理layout属性 - 这个属性控制子块的排列方式
                if (block.attributes.layout) {
                    blockElement.setAttribute('data-layout', block.attributes.layout);
                }

                // 处理其他自定义属性（除了style）
                Object.keys(block.attributes).forEach(key => {
                    if (key !== 'style' && key !== 'layout') {
                        blockElement.setAttribute('data-' + key, block.attributes[key]);
                    }
                });
            } else {
                // 对于普通块，处理所有属性
                // 处理style属性
                if (block.attributes.style) {
                    const existingStyle = blockElement.getAttribute('style') || '';
                    blockElement.setAttribute('style', existingStyle + '; ' + block.attributes.style);
                }

                // 处理layout属性 - 这个属性控制子块的排列方式
                if (block.attributes.layout) {
                    blockElement.setAttribute('data-layout', block.attributes.layout);
                }

                // 处理其他自定义属性
                Object.keys(block.attributes).forEach(key => {
                    if (key !== 'style' && key !== 'layout') {
                        blockElement.setAttribute('data-' + key, block.attributes[key]);
                    }
                });
            }
        }

        // 添加标题（如果不是不可见结构层且有标题）
        if (!block.invisible && block.title) {
            const title = document.createElement('h3');
            title.className = 'block-title';
            title.textContent = block.title;
            blockElement.appendChild(title);
        }

        // 渲染子内容
        if (block.children && block.children.length > 0) {
            const hasChildBlocks = block.children.some(child => child.type === 'block');
            const hasListItems = block.children.some(child => child.type === 'listItem' || child.type === 'codeBlock');

            // 渲染列表项和代码块
            if (hasListItems) {
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'block-items-container';
                
                block.children.forEach(child => {
                    if (child.type === 'listItem') {
                        const itemElement = this.renderListItem(child);
                        if (itemElement) {
                            itemsContainer.appendChild(itemElement);
                        }
                    } else if (child.type === 'codeBlock') {
                        const codeElement = this.renderCodeBlock(child);
                        if (codeElement) {
                            itemsContainer.appendChild(codeElement);
                        }
                    }
                });
                
                blockElement.appendChild(itemsContainer);
            }

            // 渲染子块
            if (hasChildBlocks) {
                // 添加布局切换按钮
                const layoutToggle = document.createElement('div');
                layoutToggle.className = 'layout-toggle';
                layoutToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line></svg>`;
                layoutToggle.title = "切换布局";

                // 处理结构层的显示
                if (block.invisible) {
                    if (!this.showStructureTogglesCheckbox || !this.showStructureTogglesCheckbox.checked) {
                        layoutToggle.style.display = 'none';
                    } else {
                        blockElement.classList.add('show-structure');
                    }
                }

                blockElement.appendChild(layoutToggle);

                // 渲染子块
                const childBlocks = block.children.filter(child => child.type === 'block');
                
                // 检查是否有layout属性来决定子块的排列方式
                let childLayout = null;
                if (block.attributes && block.attributes.layout) {
                    if (block.attributes.layout === 'r') {
                        childLayout = 'layout-horizontal';
                    } else if (block.attributes.layout === 'c') {
                        childLayout = 'layout-vertical';
                    }
                }
                
                this.renderBlocks(childBlocks, blockElement, childLayout);
            }
        }

        return blockElement;
    }

    /**
     * 渲染列表项
     * @param {Object} listItem - 列表项对象
     * @returns {HTMLElement} 列表项DOM元素
     */
    renderListItem(listItem) {
        if (listItem.type !== 'listItem') return null;

        const itemElement = document.createElement('p');
        itemElement.className = 'list-item';
        
        if (listItem.showDash) {
            itemElement.textContent = `- ${listItem.content}`;
        } else {
            itemElement.textContent = listItem.content;
        }

        return itemElement;
    }

    /**
     * 渲染代码块
     * @param {Object} codeBlock - 代码块对象
     * @returns {HTMLElement} 代码块DOM元素
     */
    renderCodeBlock(codeBlock) {
        if (codeBlock.type !== 'codeBlock') return null;

        if (codeBlock.language === 'markdown') {
            const mdDiv = document.createElement('div');
            mdDiv.className = 'markdown-content';
            mdDiv.innerHTML = marked.parse(codeBlock.content);
            return mdDiv;
        } else {
            const pre = document.createElement('pre');
            pre.className = 'text-content';
            pre.textContent = codeBlock.content;
            return pre;
        }
    }

    /**
     * 兼容旧接口的渲染方法
     * @param {Array} nodes - 节点数组（旧格式）
     * @param {HTMLElement} parentElement - 父元素
     */
    renderDiagram(nodes, parentElement = null) {
        const target = parentElement || document.getElementById('diagram-output');
        if (!target) return;

        target.innerHTML = '';

        // 如果是新的AST格式
        if (nodes && nodes.type === 'document') {
            this.renderDocument(nodes);
            return;
        }

        // 如果是块数组
        if (Array.isArray(nodes)) {
            this.renderBlocks(nodes, target);
        }
    }

    /**
     * 设置可排序功能
     */
    setupSortable() {
        document.querySelectorAll('.block-container').forEach(container => {
            new Sortable(container, {
                group: 'nested',
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                fallbackOnBody: true,
                swapThreshold: 0.65,
                onEnd: async () => {
                    // 触发代码预览更新
                    if (window.updateCodePreview) {
                        await window.updateCodePreview();
                    }
                },
            });
        });
    }

    /**
     * 设置布局切换功能
     */
    setupLayoutToggles() {
        document.querySelectorAll('.layout-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const container = toggle.parentElement.querySelector('.block-container');
                if (container) {
                    if (container.classList.contains('layout-vertical')) {
                        container.classList.remove('layout-vertical');
                        container.classList.add('layout-horizontal');
                    } else {
                        container.classList.remove('layout-horizontal');
                        container.classList.add('layout-vertical');
                    }
                }
            });
        });
    }

    /**
     * 切换轮廓线显示
     */
    toggleOutlines(hide) {
        const diagramOutput = document.getElementById('diagram-output');
        if (diagramOutput) {
            if (hide) {
                diagramOutput.classList.add('hide-outlines');
            } else {
                diagramOutput.classList.remove('hide-outlines');
            }
        }
    }

    /**
     * 切换结构层显示
     */
    toggleStructureBlocks(show) {
        const diagramOutput = document.getElementById('diagram-output');
        if (!diagramOutput) return;

        const structureBlocks = diagramOutput.querySelectorAll('[data-structure-only="true"]');
        const layoutToggles = diagramOutput.querySelectorAll('.structure-only-block .layout-toggle');

        structureBlocks.forEach(block => {
            if (show) {
                block.classList.add('show-structure');
            } else {
                block.classList.remove('show-structure');
            }
        });

        layoutToggles.forEach(toggle => {
            toggle.style.display = show ? 'block' : 'none';
        });
    }

    /**
     * 清空渲染区域
     */
    clearOutput() {
        const diagramOutput = document.getElementById('diagram-output');
        if (diagramOutput) {
            diagramOutput.innerHTML = '';
        }
    }

    /**
     * 滚动到视图
     */
    scrollIntoView(element) {
        if (element && element.scrollIntoView) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * 初始化方法（保持与其他管理器一致）
     */
    initialize() {
        // 渲染器的初始化已在构造函数中完成
        return this;
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.Renderer = Renderer;
}

// 支持模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}