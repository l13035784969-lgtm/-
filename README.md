# 旅游行程规划 App

一款以"行程规划"为核心场景的旅游应用，优先支持微信小程序 / H5。

- 架构设计文档：[docs/architecture.md](docs/architecture.md)

## 当前进度

阶段 0（项目骨架）+ 阶段 1（行程创建与编辑核心）已落地，代码可编译、可运行，
关键业务逻辑（AA 结算算法、命运轮盘抽签、文字快速记账解析）有单测覆盖。
后续按 [路线图](docs/architecture.md#7-开发路线图) 继续推进阶段 2（AA 记账进阶）、
阶段 3（分享）等。

## 目录结构

```
apps/
├── api/        # NestJS 后端
└── miniapp/    # Taro 小程序前端（微信小程序 / H5）
```

## 本地跑起来

### 后端

```bash
# 需要本地有 PostgreSQL，建一个库
createdb trip_planner

cd apps/api
pnpm install
DB_HOST=localhost DB_USER=postgres DB_PASSWORD=postgres DB_NAME=trip_planner \
  pnpm start:dev
```

跑单测（不需要数据库，纯业务逻辑单测）：

```bash
cd apps/api
pnpm test
```

### 小程序前端

```bash
cd apps/miniapp
pnpm install
pnpm build:weapp   # 产物在 dist/weapp，用微信开发者工具打开这个目录预览
```

## 已知待办（不是 bug，是有意识留到下一轮的范围）

- 鉴权目前是 `x-user-id` / `x-member-id` 请求头占位，真实的 `wx.login` 换 JWT 流程还没接
- `wx.chooseLocation` 选完点之后还没接到"存一条 POI 记录 -> 拿 poiId"这个环节，
  添加行程项时地点会先按纯文本存
- AA 记账页面（表单记账/离团结算/钱袋充值的前端界面）、分享的微信原生转发
  （`onShareAppMessage`）还没做前端页面，后端接口已经全部就绪并测试过
- 小程序 tabBar 图标先用纯文字，正式插画风图标定稿后再补 PNG 资源
