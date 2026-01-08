# 前端开发文档

## 1. 项目介绍

本项目为 **Microservice Orchestration Platform (Conductor)** 的前端部分。
平台采用 **监控中台** 风格，设计目标为 **极具科技感**、**高性能** 的工作流编排系统。

### 核心功能

1. **微服务工作流编排**：可视化拖拽编排微服务节点，配置输入输出接口连接。
2. **微服务管理**：上传、管理、编辑微服务元数据。
3. **数据库治理**：管理数据库文件，提供数据预览与编辑。
4. **微应用管理**：将工作流导出为可部署的微应用镜像。

## 2. 技术选型

- **框架**: React 18 + Vite + TypeScript
- **UI 库**: Tailwind CSS + Shadcn UI (Radix UI)
- **动画**: Framer Motion (用于页面切换、悬停特效、科技感交互)
- **工作流引擎**: React Flow (@xyflow/react)
- **状态管理**: Zustand
- **图标**: Lucide React
- **包管理**: pnpm

## 3. 项目结构

```text
src/
  ├── components/
  │   ├── layout/          # 全局布局 (Sidebar, Header)
  │   └── ui/              # 通用 UI 组件 (Button, Input, etc.)
  ├── features/
  │   └── workflow/        # 工作流编排功能模块
  │       ├── components/  # 工作流特定组件 (Node, Sidebar)
  │       ├── hooks/       # 工作流逻辑 Hooks
  │       └── types/       # 类型定义
  ├── lib/                 # 工具函数 (utils, cn)
  ├── App.tsx              # 路由配置
  └── index.css            # 全局样式 & Tailwind 配置
```

## 4. 详细功能说明

### 4.1 工作流编排 (Workflow Orchestration)

- **位置**: `src/features/workflow`
- **核心组件**: `WorkflowPage.tsx`
- **实现细节**:
  - 使用 `React Flow` 实现画布。
  - 自定义节点 `MicroserviceNode` (`src/features/workflow/components/MicroserviceNode.tsx`)，支持多输入多输出 Handle。
  - 侧边栏 `WorkflowSidebar` 支持 HTML5 Drag & Drop API 将节点拖入画布。
  - 状态流转：Idle -> Running (Blue) -> Success (Green) / Error (Red) / Warning (Yellow)。
  - 模拟运行逻辑在 `WorkflowPage` 的 `handleRun` 函数中。

### 4.2 样式与主题

- 采用 **Dark Mode** 为主色调。
- 核心色盘定义在 `src/index.css` (CSS Variables)。
- 主要颜色：
  - Primary: Neon Cyan (`#00f0ff`)
  - Secondary: Neon Purple (`#7000ff`)
  - Background: Deep Space Black (`#0a0a0f`)

## 5. 接口对接 (API Integration)

目前所有数据均为 **Mock Data**。真实对接时请遵循以下规范：

1. **服务层封装**: 在 `src/services` 下创建对应的 API 服务文件 (e.g., `workflowService.ts`).
2. **Mock 替换**: 找到组件中的 `initialNodes` 或 `handleRun` 中的模拟逻辑进行替换。
3. **API 列表 (预期)**:
   - `GET /api/services`: 获取可用微服务列表 (用于 Sidebar)。
   - `POST /api/workflow/run`: 提交工作流结构并开始执行。
   - `GET /api/workflow/:id/status`: 轮询工作流执行状态。
   - `POST /api/workflow/export`: 导出工作流为镜像。

## 6. 开发规范

请参考根目录下的 `standard.md`。

- **组件**: PascalCase, Functional Components.
- **样式**: 使用 Tailwind Utility Classes + `cn()` helper.
- **类型**: 严格 TypeScript 类型定义，避免 `any`.

## 7. 快速开始

1. 安装依赖: `pnpm install`
2. 启动开发服务器: `pnpm dev`
3. 构建: `pnpm build`
