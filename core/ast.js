/**
 * AST Parser for Structura
 * 支持用户定义的语法规范：
 * - # 标题: 定义一个块
 * - ## (无标题): 定义一个不可见的结构层
 * - ##| 标题: 定义左侧边栏
 * - ## 标题|: 定义右侧边栏
 * - - item: 定义一个列表项
 * - - - item: 显示一个带'-'的列表项
 * - - ``` ... ```: 定义普通文本块
 * - - ```md ... ```: 定义Markdown块
 */

class ASTParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.lines = [];
        this.currentIndex = 0;
        this.ast = {
            type: 'document',
            children: []
        };
    }

    /**
     * 解析文本为AST
     * @param {string} text - 输入文本
     * @returns {Object} AST对象
     */
    parse(text) {
        this.reset();
        this.lines = text.split('\n');
        this.currentIndex = 0;

        const blocks = [];
        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex].trim();
            
            // 跳过空行和注释
            if (!line || line.startsWith('//')) {
                this.currentIndex++;
                continue;
            }

            // 解析块
            const block = this.parseBlock();
            if (block) {
                blocks.push(block);
            } else {
                this.currentIndex++;
            }
        }

        this.ast.children = this.buildNestedStructure(blocks);
        return this.ast;
    }

    /**
     * 构建嵌套结构
     * @param {Array} blocks - 扁平的块数组
     * @returns {Array} 嵌套的块数组
     */
    buildNestedStructure(blocks) {
        if (!blocks || blocks.length === 0) return [];

        const result = [];
        const stack = [];

        for (const block of blocks) {
            // 找到当前块应该插入的位置
            while (stack.length > 0 && stack[stack.length - 1].level >= block.level) {
                stack.pop();
            }

            if (stack.length === 0) {
                // 顶级块
                result.push(block);
            } else {
                // 子块
                const parent = stack[stack.length - 1];
                if (!parent.children) {
                    parent.children = [];
                }
                parent.children.push(block);
            }

            stack.push(block);
        }

        return result;
    }

    /**
     * 解析块（Block）
     */
    parseBlock() {
        if (this.currentIndex >= this.lines.length) return null;

        const currentLine = this.lines[this.currentIndex].trim();
        
        // 检查是否是块头部
        if (!currentLine.startsWith('#')) {
            return null;
        }

        const blockHeader = this.parseBlockHeader(currentLine);
        if (!blockHeader) return null;

        this.currentIndex++; // 移动到下一行

        // 解析块内容（只解析列表项和代码块，不解析子块）
        const children = [];
        
        while (this.currentIndex < this.lines.length) {
            const nextLine = this.lines[this.currentIndex].trim();
            
            // 如果遇到新的块头部，停止解析当前块
            if (nextLine.startsWith('#')) {
                break;
            }

            // 跳过空行
            if (!nextLine) {
                this.currentIndex++;
                continue;
            }

            // 只解析列表项，不解析子块
            if (nextLine.startsWith('-')) {
                const listItem = this.parseListItem();
                if (listItem) {
                    children.push(listItem);
                }
            } else {
                this.currentIndex++;
            }
        }

        return {
            type: 'block',
            level: blockHeader.level,
            title: blockHeader.title,
            sidebar: blockHeader.sidebar, // 'left', 'right', null
            invisible: blockHeader.invisible,
            id: blockHeader.id,
            attributes: blockHeader.attributes,
            children: children
        };
    }

    /**
     * 解析块头部
     * @param {string} line - 行内容
     */
    parseBlockHeader(line) {
        // 匹配 # 的数量
        const hashMatch = line.match(/^(#+)/);
        if (!hashMatch) return null;

        const level = hashMatch[1].length;
        let remaining = line.substring(level).trim();

        let sidebar = null;
        let invisible = false;
        let title = '';
        let id = null;
        let attributes = {};

        // 检查侧边栏语法
        if (remaining.startsWith('|')) {
            // ##| 标题 - 左侧边栏
            sidebar = 'left';
            remaining = remaining.substring(1).trim();
        } else if (remaining.endsWith('|')) {
            // ## 标题| - 右侧边栏
            sidebar = 'right';
            remaining = remaining.substring(0, remaining.length - 1).trim();
        }

        // 检查是否是不可见结构层（只有##没有标题和属性）
        if (!remaining && level >= 1) {
            invisible = true;
            title = '';
        } else if (remaining.startsWith('{') && remaining.endsWith('}') && !remaining.includes(' ') && !remaining.includes(':')) {
            // 只有属性的结构层，如 ## {layout=r}
            invisible = true;
            title = '';
            const parts = this.parseTitle(remaining);
            attributes = parts.attributes;
        } else {
            // 解析标题、ID和属性
            const parts = this.parseTitle(remaining);
            title = parts.title;
            id = parts.id;
            attributes = parts.attributes;
        }

        return {
            level,
            title,
            sidebar,
            invisible,
            id,
            attributes
        };
    }

    /**
     * 解析标题、ID和属性
     * @param {string} text - 标题文本
     */
    parseTitle(text) {
        let title = '';
        let id = null;
        let attributes = {};
        let remaining = text.trim();

        // 首先提取属性 {key=value,key2=value2}
        const attrMatch = remaining.match(/\{([^}]+)\}$/);
        if (attrMatch) {
            const attrString = attrMatch[1];
            remaining = remaining.substring(0, attrMatch.index).trim();
            
            // 解析属性
            const attrs = attrString.split(',');
            attrs.forEach(attr => {
                const equalIndex = attr.indexOf('=');
                if (equalIndex > 0) {
                    const key = attr.substring(0, equalIndex).trim();
                    const value = attr.substring(equalIndex + 1).trim();
                    if (key && value) {
                        // 移除值两端的引号（如果有）
                        attributes[key] = value.replace(/^["']|["']$/g, '');
                    }
                }
            });
        }

        // 然后解析冒号语法 (:)
        const colonIndex = remaining.lastIndexOf(':');
        if (colonIndex > 0) {
            const beforeColon = remaining.substring(0, colonIndex).trim();
            const afterColon = remaining.substring(colonIndex + 1).trim();
            
            // 检查冒号前面是否是布局标识符 (r 或 c)
            const layoutMatch = beforeColon.match(/^(.+?)\s+([rc])$/);
            if (layoutMatch) {
                // 布局语法糖: ## 标题 r: 或 ## 标题 r:block-id
                title = layoutMatch[1].trim();
                const layout = layoutMatch[2] === 'r' ? 'r' : 'c';
                attributes.layout = layout;
                
                // 如果冒号后面有内容，作为ID
                if (afterColon && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(afterColon)) {
                    id = afterColon;
                }
            } else {
                // 原有的简单ID语法: ## 标题:block-id
                if (afterColon && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(afterColon)) {
                    title = beforeColon;
                    id = afterColon;
                } else {
                    title = remaining;
                }
            }
        } else {
            title = remaining;
        }

        return { title, id, attributes };
    }

    /**
     * 解析列表项
     */
    parseListItem() {
        const line = this.lines[this.currentIndex].trim();
        
        if (!line.startsWith('-')) {
            return null;
        }

        this.currentIndex++;

        // 检查是否是带'-'的列表项 (- - item)
        if (line.startsWith('- -')) {
            return {
                type: 'listItem',
                showDash: true,
                content: line.substring(3).trim()
            };
        }

        // 检查是否是代码块
        if (line.startsWith('- ```')) {
            return this.parseCodeBlock(line);
        }

        // 普通列表项
        return {
            type: 'listItem',
            showDash: false,
            content: line.substring(1).trim()
        };
    }

    /**
     * 解析代码块
     * @param {string} firstLine - 第一行内容
     */
    parseCodeBlock(firstLine) {
        let isMarkdown = false;
        let content = '';

        // 检查是否是单行代码块
        if (firstLine.includes('```', 5)) {
            // 单行代码块: - ``` content ```
            const match = firstLine.match(/^- ```(md)?\s*(.*?)\s*```$/);
            if (match) {
                isMarkdown = !!match[1];
                content = match[2] || '';
                return {
                    type: 'codeBlock',
                    language: isMarkdown ? 'markdown' : 'text',
                    content: content
                };
            }
        }

        // 多行代码块
        if (firstLine.startsWith('- ```md')) {
            isMarkdown = true;
        }

        // 收集代码块内容
        const contentLines = [];
        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex];
            
            if (line.trim() === '```') {
                this.currentIndex++;
                break;
            }
            
            contentLines.push(line);
            this.currentIndex++;
        }

        content = contentLines.join('\n');

        return {
            type: 'codeBlock',
            language: isMarkdown ? 'markdown' : 'text',
            content: content
        };
    }

    /**
     * 初始化方法（保持与其他管理器一致）
     */
    initialize() {
        // AST解析器不需要特殊初始化
        return this;
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.ASTParser = ASTParser;
}

// 支持模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTParser;
}