# 前端开发文档

## 1. 项目介绍

本项目为 **Microservice Orchestration Platform (Conductor)** 的前端部分。
平台采用 **监控中台** 风格，设计目标为**高性能** 的工作流编排与微服务治理系统。

### 核心功能

1. **微服务工作流编排 (Workflow)**：可视化拖拽编排微服务节点，配置输入输出接口连接，支持模拟运行。
2. **微服务管理 (Services)**：查看与管理微服务状态、版本、类型及关联数据库。
3. **数据库治理 (Database)**：管理数据库文件，提供数据预览、上传与类型管理 (PostgreSQL, MySQL, SQLite 等)。
4. **微应用管理 (Apps)**：将多个微服务组合为微应用，支持导出部署配置 (Docker/K8s)。
5. **资源上传 (Upload)**：支持拖拽上传微应用制品 (JAR) 与配置文件 (YML/YAML)。

## 2. 技术选型

- **核心框架**: React 18 + Vite 6 + TypeScript
- **路由管理**: React Router v7
- **UI 组件库**: Tailwind CSS + Shadcn UI (基于 Radix UI)
- **动画交互**: Framer Motion (页面切换、悬停特效)
- **工作流引擎**: React Flow (@xyflow/react)
- **状态管理**: Zustand + TanStack Query (React Query)
- **数据表格**: TanStack Table (React Table)
- **图标库**: Lucide React
- **工具库**: date-fns, uuid, clsx, tailwind-merge
- **包管理**: pnpm

## 3. 项目结构

```text
src/
  ├── components/
  │   ├── layout/          # 全局布局 (Sidebar, Header, MainLayout)
  │   ├── ui/              # 通用 UI 组件 (Button, Card, Dialog, Table, etc.)
  │   ├── mode-toggle.tsx  # 主题切换
  │   └── theme-provider.tsx # 主题上下文
  ├── features/
  │   ├── apps/            # 微应用管理模块
  │   │   └── AppsPage.tsx
  │   ├── database/        # 数据库治理模块
  │   │   └── DatabasePage.tsx
  │   ├── services/        # 微服务列表模块
  │   │   └── ServicesPage.tsx
  │   ├── upload/          # 资源上传模块
  │   │   └── UploadPage.tsx
  │   └── workflow/        # 工作流编排模块
  │       ├── components/  # 工作流特定组件 (Node, Sidebar, ContextMenu)
  │       ├── types/       # 类型定义
  │       └── WorkflowPage.tsx
  ├── lib/                 # 工具函数 (utils.ts)
  ├── assets/              # 静态资源
  ├── App.tsx              # 路由配置与应用入口
  └── index.css            # 全局样式 & Tailwind 配置
```

## 4. 详细功能说明

### 4.1 工作流编排 (Workflow)

- **位置**: `src/features/workflow`
- **功能**:
  - 基于 `React Flow` 的画布交互。
  - 自定义 `MicroserviceNode` 支持多端口连接。
  - 侧边栏拖拽添加节点。
  - 状态模拟：Idle -> Running -> Success/Error。

### 4.2 微服务管理 (Services)

- **位置**: `src/features/services`
- **功能**:
  - 展示微服务列表 (Mock Data)。
  - 支持按名称或类型搜索。
  - 查看服务详情：版本、类型 (SpringBoot, NodeJS, etc.)、关联数据库。
  - 分页浏览。

### 4.3 数据库治理 (Database)

- **位置**: `src/features/database`
- **功能**:
  - 数据库文件列表管理。
  - 支持多种数据库类型标识 (PostgreSQL, MySQL, SQLite, MinIO)。
  - **数据预览**: 点击预览按钮可查看模拟的表数据。
  - 文件上传模拟。

### 4.4 微应用管理 (Apps)

- **位置**: `src/features/apps`
- **功能**:
  - 展示已编排的微应用。
  - **部署导出**: 支持下载 Docker 或 Kubernetes 部署配置包。

### 4.5 资源上传 (Upload)

- **位置**: `src/features/upload`
- **功能**:
  - 拖拽上传区域。
  - 支持 `.jar`, `.yml`, `.yaml` 文件格式。
  - 上传进度与成功状态反馈 (Mock)。

### 4.6 样式与主题

- **深色模式**: 默认 Dark Mode，采用 Cyberpunk/监控中台风格。
- **配色**:
  - Primary: Neon Cyan
  - Secondary: Neon Purple
  - Background: Deep Space Black
- **动画**: 使用 `Framer Motion` 实现平滑的页面过渡与组件入场动画。

## 5. 接口对接 (API Integration)

目前所有数据均为 **Mock Data**。真实对接建议：

1. **服务层**: 在 `src/services` 目录 (需创建) 下封装 API 请求。
2. **状态管理**: 结合 `TanStack Query` 进行服务端状态管理与缓存。
3. **预期 API**:
   - `GET /api/services`: 获取微服务列表。
   - `GET /api/databases`: 获取数据库文件列表。
   - `GET /api/apps`: 获取微应用列表.
   - `POST /api/upload`: 文件上传接口。
   - `POST /api/workflow/run`: 执行工作流。

## 6. 开发规范

- **组件**: PascalCase, Functional Components.
- **样式**: Tailwind Utility Classes + `cn()` helper.
- **状态**: 本地状态用 `useState`, 全局 UI 状态用 `Zustand`, 服务端数据用 `React Query`.
- **类型**: 严格 TypeScript 类型定义。

## 7. 快速开始

1. 安装依赖:
   ```bash
   pnpm install
   ```
2. 启动开发服务器:
   ```bash
   pnpm dev
   ```
3. 构建生产环境:
   ```bash
   pnpm build
   ```
4. 预览构建:
   ```bash
   pnpm preview
   ```
