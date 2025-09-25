<div align="center">

# Structura 📜

**S**imuoss's **T**extual, **R**earrangeable & **U**niversal **C**harting **T**ool for **U**nified **R**endered **A**rchitecture

✨ 一个为AI时代设计的、所见即所得的交互式架构图生成工具 ✨

---

[**English**](#-english) | [中文](#-中文)

</div>

<a name="-english"></a>

## 🇬🇧 English

### 💡 What is Structura?

**Structura** is a simple, Markdown-like diagramming language designed for application architecture diagrams, suitable for both LLMs and humans to read and write. It transforms a simple, human-readable syntax into beautiful, interactive, and freely rearrangeable architecture diagrams.

Traditional diagramming languages like Mermaid or PlantUML are excellent but were designed for humans. While highly versatile, their relatively complex rules and syntax can be challenging for humans to learn. More importantly, current large models cannot fully grasp their syntax. In the age of AI, where writing code is incredibly fast, we shouldn't waste time on drawing diagrams. Therefore, we need a diagramming language with simple rules, perfectly suited for AI generation and rapid human refinement. **Structura was born for this purpose.**

### 🚀 Live Demo & Preview

Check out the interactive builder in action!

**(A GIF should be here, showcasing the tool's core features: typing text on the left, the diagram rendering in real-time, dragging a block to a new position, toggling a container's layout from vertical to horizontal, and the code preview instantly updating.)**

*Image: A GIF demonstrating Structura's core functionalities.*

### ✨ Core Features

* **🤖 AI-First Syntax**: A simple, line-based, hierarchical syntax using `#` and `-` that is trivial for Large Language Models to generate.
* **↔️ Interactive Drag & Drop**: Freely reorder any component within its container to achieve the perfect layout.
* **🎨 Dynamic Layouts**: Instantly switch any component group between **vertical** and **horizontal** layouts with a single click.
* **📐 Advanced Structuring**:
    * **Sidebars**: Attach vertical sidebars to the left or right of any component.
    * **Invisible Containers**: Use title-less blocks (`##`) to group components for layout purposes without adding visual clutter.
* **📚 Rich Content Support**:
    * Embed and render **Markdown** for detailed descriptions.
    * Use **multi-line text blocks** to preserve formatting for code snippets or logs.
* **💻 Code Generation & Export**: The tool generates clean, corresponding HTML & CSS in real-time. Export your final diagram as a self-contained HTML file.

### 📖 Syntax Guide

Structura's syntax is designed to be simple and intuitive.

| Syntax                     | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `# Title`                  | Creates a top-level block.                           |
| `## Title`, `### Title`... | Creates a nested sub-block (up to 10 levels).        |
| `##` (No title)            | Creates an invisible structural container.           |
| `##\| Title`                 | Creates a right sidebar relative to its parent.      |
| `\|## Title`                 | Creates a left sidebar relative to its parent.       |
| `- List item`              | Creates a simple text item inside a block.           |
| `- - List item`            | Renders the item with a leading `-`.                 |
| `-{ ... }`                 | Creates a multi-line, pre-formatted text block.      |
| `- \`\`\`md ... \`\`\``     | Creates a block where the content is rendered as Markdown. |

### 🤔 Why Structura?

While tools like Mermaid are fantastic, they produce static images. Modifying the layout or structure requires rewriting the code. **Structura is different.**

### 🛠️ How to Use

Visit directly: [Structura](http://structura.simuoss.cn)

### 🗺️ Roadmap

Structura is just getting started. Here are some ideas for the future:

- [ ] Theming and custom styling syntax.
- [ ] Color, border, position, size, shape, and connecting lines.
- [ ] Support for overlapping blocks.
- [ ] An Agent that can automatically scope and draw a system architecture diagram based on requirements.

### 📄 License

This project is licensed under the GNU GPLv3 License. See the [LICENSE](LICENSE) file for details.

---

<a name="-中文"></a>

## 🇨🇳 中文

### 💡 Structura 是什么？

**Structura** 是一款针对应用程序架构图而设计的，类似Markdown语法的，简单且适于LLM或人类阅读和编写的绘图语言，它能将一种简单而人类可读的语法，转换成美观、可交互、可自由重排的架构图。

像 Mermaid 或 PlantUML 这样的传统图表语言非常好用，但是它们都是为人类编写而设计的，虽然通用性很强，但较为复杂规则和语法却不利于人类学习，更重要的是，当前大模型并不能完全参透他们的语法。人工智能时代，AI写代码已经飞快了，我们不能把时间浪费在画图上，所以我们需要一种规则简单，适合大模型生成+人类快速调整的画图语言。**Structura** 正是为此而生。

### 🚀 实时演示与预览

查看交互式生成器的实际运行效果！

**(此处应有一个 GIF 动图，展示工具的核心功能：左侧输入文本，右侧实时渲染图表，用户拖动一个模块到新位置，一个容器的布局从垂直切换为水平，下方的代码预览随之立即更新。)**

*图片：一个演示 Structura 核心功能的 GIF 动图。*

### ✨ 核心功能

* **🤖 AI 优先的语法**: 使用 `#` 和 `-` 的简单、基于行的层级语法，对于大语言模型来说生成起来易如反掌。
* **↔️ 交互式拖拽排序**: 在容器内自由地重新排序任何组件，以获得完美的布局。
* **🎨 动态布局**: 只需单击一下，即可在**垂直**和**水平**布局之间即时切换任何组件组。
* **📐 高级结构**:
    * **侧边栏**: 在任何组件的左侧或右侧附加垂直的侧边栏。
    * **隐形容器**: 使用无标题的块 (`##`) 对组件进行分组以调整布局，而不会增加视觉混乱。
* **📚 丰富的内嵌内容**:
    * 嵌入并渲染 **Markdown** 以获取详尽的描述。
    * 使用**多行文本块**来保留代码片段或日志的格式。
* **💻 代码生成与导出**: 工具实时生成整洁、对应的 HTML 和 CSS。将您的最终图表导出为独立的 HTML 文件。

### 📖 语法指南

Structura 的语法旨在简单直观。

| 语法                     | 描述                                     |
| -------------------------- | ---------------------------------------- |
| `# 标题`                   | 创建一个顶级模块。                       |
| `## 标题`, `### 标题`... | 创建一个嵌套的子模块（最多10级）。       |
| `##` (无标题)            | 创建一个不可见的结构化容器。             |
| `##\| 标题`                | 创建一个父级的右侧边栏。                 |
| `\|## 标题`                | 创建一个父级的左侧边栏。                 |
| `- 列表项`                 | 在模块内创建一个简单的文本项。           |
| `- - 列表项`               | 渲染一个以 `-` 开头的列表项。            |
| `-{ ... }`                 | 创建一个多行、保留格式的文本块。         |
| `- \`\`\`md ... \`\`\``     | 创建一个内容被渲染为 Markdown 的块。     |

### 🤔 为什么选择 Structura?

尽管像 Mermaid 这样的工具非常出色，但它们生成的是静态图像。修改布局或结构需要重写代码。**Structura 与众不同。**

### 🛠️ 如何使用

直接访问：[Structura](http://structura.simuoss.cn)

### 🗺️ 发展蓝图

Structura 才刚刚起步。以下是一些对未来的构想：

- [ ] 主题和自定义样式语法
- [ ] 颜色 边框 位置 大小 形状 连接线
- [ ] 互有重叠的块
- [ ] 根据需求自动圈选系统架构范围并画出系统架构图的Agent

### 📄 开源许可

本项目采用 GNU3.0 许可证。有关详细信息，请参阅 [LICENSE](LICENSE) 文件。
