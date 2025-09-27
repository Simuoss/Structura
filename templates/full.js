// 完整架构图模板
export const fullTemplate = `# 前端层 r:
## React/Vue前端
- 学生和教师界面
## Swagger UI文档
- FastAPI自动生成课程 API 文档
## 移动端应用
- 学习助手 · 待开发

# 后端层

## API路由层 c:

### 
#### 中间件
##### CORS
##### JWT验签
##### JWT解析
##### 错误捕获

#### 依赖注入
##### 时区转换
##### 多租户session分流

### 路由模块 [事务提交]
#### 认证
-  /api/v1/auth  
#### 课程
- /api/v1/course
#### 用户
- /api/v1/users
#### 成绩
- /api/v1/grades
#### AI Tutor
- /api/v1/tutor
#### ......

## 业务服务层
### 公共服务{style="background-color: #89e6e1"}
- 租户验证
- [访问public schema]
### 认证服务
- JWT管理/登录注册  
### 课程服务
- 课程 CRUD/筛选
### 用户服务
- 学生/教师资料管理
### 成绩服务
- 考试成绩统计/指标
### AI Tutor 服务
- 作业批改/学习建议
### 待办服务
- 任务管理
### ......

## Agent功能层 c:

### Agent
#### 工作流模式 - 节约token·效果稳定
##### 作业批改Agent
- 批量模式
##### 学习报告分析Agent
##### ......
#### Agent模式 - 功能强大·自由度高
##### 课程推荐Agent
##### 风险监测Agent
##### 学习答疑Agent
- 即时问答模式
##### ......

###
#### Agent工具
##### 联网搜索
##### 网页浏览
##### 文件下载
##### 知识检索
##### 相似检索
##### ....

#### MCP C/S
##### 本地 MCP Server
##### 云端 MCP Server
##### 本地 MCP Client

#### 知识库
##### 知识导入
##### 知识管理
##### 知识编排
##### 层级构建

### 模型管理
- AzureOpenAI · Qwen · ChatGLM · Kimi · Claude · OpenAI · Doubao · ......
#### LLMs/MultiModal-LLMs
#### Embeddings
#### Reranks
#### ASR
#### TTS
#### ......

##
### 外部集成层
#### 邮件适配器
- Microsoft Graph
- IMAP/POP3
- ...
#### IM软件适配器
- 企业微信
- 飞书
- ...
#### 教育系统适配器
- Blackboard
- Moodle
- ...
#### Agent适配器
- Dify
- n8b
- ...

### 异步任务层
- Celery Worker
#### 定时任务
##### 成绩计算
##### 数据同步
##### 报表生成
#### 异步任务
##### Agent任务
##### 作业批改
##### 学习分析

## 数据访问层

### Repository模式
- 对象关系映射 · 业务逻辑 · 事务管理
#### 课程repo
#### 公共repo
#### 用户repo
#### ......

### ORM模型
- SQLAlchemy 2.0 · 区分schema · 支持Alembic迁移
#### 用户模型
#### 课程模型
#### 成绩模型
#### ......

## 日志层 c: |
### 组件化绑定
- 区分模块
### 异步日志
- 避免阻塞事件循环
### 捕获 logging
- 捕获三方库日志
- 捕获子模块日志
### 文件配置
- 4 MB 轮转
- 30 天保留
- zip 存档
### 日志级别热切换
- 方便调试
### 协程崩溃捕获
- 防止"任务静默失败"

## 数据存储层
### PostgreSQL
- 主数据库
- 多租户Schema级强隔离
### MongoDB
- 存储课件文件
- 存储低热持久大集合
### Redis
- 缓存/会话
- JWT黑名单
- Celery
### Alembic
- 数据库迁移
- 版本管理
- 租户创建

# 部署层{layout=r}
## Docker
- 所有组件容器化
- 自动初始化数据库
- 自动初始化测试租户
- 自动初始化测试用户
## Docker Compose
- 便捷部署
## Nginx
- 支持API挂载
`;

// 导出模板对象，方便扩展更多模板
export const templates = {
    full: fullTemplate
};

// 默认模板（当前使用full模板）
export const defaultTemplate = fullTemplate;