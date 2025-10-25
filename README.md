# 双人格斗游戏 (Two-Player Fighting Game)

一个基于HTML5 Canvas的双人格斗游戏，使用纯JavaScript实现。

## 功能特性

- 🎮 双人本地对战
- 👥 3个可选角色（战士、法师、忍者）
- 🎨 多个战斗背景
- ⚔️ 基本攻击和特殊技能（组合技）
- 💚 血量系统和复活机制
- 🎯 碰撞检测和击退效果
- ✨ 视觉反馈（血条颜色变化、击中闪光效果）

## 如何运行

### 方法1: 使用Python内置服务器

```bash
python3 -m http.server 8000
```

然后在浏览器中访问: http://localhost:8000

### 方法2: 使用Node.js http-server

```bash
npx http-server -p 8000
```

然后在浏览器中访问: http://localhost:8000

### 方法3: 使用VS Code Live Server扩展

1. 安装 "Live Server" 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 游戏玩法

### 角色选择

1. 游戏开始时，会显示角色选择界面
2. 玩家1点击选择一个角色（显示绿色边框）
3. 玩家2点击选择另一个角色（显示蓝色边框）
4. 双方选择完成后，按**空格键**开始游戏

### 战斗控制

#### Player 1 (左侧角色)
- **A**: 向左移动
- **S**: 向右移动
- **D**: 攻击

#### Player 2 (右侧角色)
- **K**: 向左移动
- **L**: 向右移动
- **J**: 攻击

### 特殊技能（组合技）

每个角色都有独特的特殊技能，通过快速输入按键序列触发（0.5秒内）：

#### 战士 (Warrior)
- **基本攻击**: D 或 J
- **特殊技能**: A-S-D 或 K-L-J（后退-前进-攻击）
- 伤害: 基本15，特殊25

#### 法师 (Mage)
- **基本攻击**: D 或 J
- **火球术**: S-S-D 或 L-L-J（前进-前进-攻击）
- 伤害: 基本20，火球30

#### 忍者 (Ninja)
- **基本攻击**: D 或 J
- **疾风斩**: A-A-D 或 K-K-J（后退-后退-攻击）
- 伤害: 基本18，疾风22

### 游戏规则

1. **血量系统**: 每个角色有初始血量（战士100，法师80，忍者90）
2. **复活机制**: 第一次血量归零后，角色会倒地并在2秒后复活，血量恢复满值
3. **胜利条件**: 当一方角色第二次血量归零时，游戏结束，另一方获胜
4. **击退效果**: 攻击命中时，双方角色会被推开一定距离
5. **重新开始**: 在胜利界面按**空格键**返回角色选择界面

### UI说明

- **血条**: 显示在屏幕顶部，颜色根据血量变化（绿色→黄色→红色）
- **生命指示器**: 血条下方的红色圆点表示剩余生命次数
- **角色名称**: 显示在血条上方

## 技术栈

- HTML5 Canvas
- Vanilla JavaScript (ES6+)
- CSS3

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 项目结构

```
.
├── index.html              # 主HTML文件
├── styles.css              # 样式文件
├── js/
│   ├── main.js            # 入口文件
│   ├── GameManager.js     # 游戏管理器
│   ├── ConfigLoader.js    # 配置加载器
│   ├── Character.js       # 角色类
│   ├── CharacterState.js  # 角色状态类
│   ├── InputHandler.js    # 输入处理器
│   ├── CollisionDetector.js # 碰撞检测器
│   ├── Renderer.js        # 渲染器
│   └── CharacterSelectionManager.js # 角色选择管理器
├── characters.json         # 角色配置
├── backgrounds.json        # 背景配置
└── assets/                # 资源文件夹（需要添加图片资源）
    ├── characters/        # 角色图片
    └── backgrounds/       # 背景图片
```

## 配置文件

### characters.json

定义所有可选角色的属性、动画和技能。每个角色包含：
- `url`: 头像图片路径
- `point`: 初始血量
- `status`: 状态数组（normal、attacking、attacked、knocked）

### backgrounds.json

定义所有可用的战斗背景图片。

## 开发说明

### 添加新角色

1. 在 `characters.json` 中添加新角色配置
2. 准备角色的所有状态动画图片
3. 确保包含必需的状态：normal、attacked、knocked
4. 至少包含一个attacking状态

### 添加新背景

1. 在 `backgrounds.json` 中添加新背景配置
2. 将背景图片放在 `assets/backgrounds/` 目录

### 调整游戏参数

在相应的类文件中可以调整：
- 移动速度: `Character.js` 中的 `moveSpeed`
- 击退距离: `CollisionDetector.js` 中的 `knockbackDistance`
- 击退持续时间: `CollisionDetector.js` 中的 `knockbackDuration`
- 复活延迟: `GameManager.js` 中的复活检查时间

## 许可证

MIT License

## 贡献

欢迎提交问题和拉取请求！

## 注意事项

⚠️ 本游戏需要图片资源才能正常运行。请确保 `assets/` 目录中包含所有必需的角色和背景图片，路径与配置文件中定义的一致。

如果图片资源缺失，游戏仍可运行，但角色和背景将不会显示。
