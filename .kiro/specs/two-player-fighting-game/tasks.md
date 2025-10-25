# 实现计划

- [x] 1. 创建项目基础结构和HTML页面
  - 创建index.html，包含Canvas元素和基本页面结构
  - 创建styles.css，定义Canvas样式和页面布局
  - 创建js目录和所有必需的JavaScript文件骨架
  - _需求: 10.1, 10.2_

- [x] 2. 实现配置加载器（ConfigLoader）
  - [x] 2.1 实现JSON文件加载功能
    - 编写异步加载characters.json和backgrounds.json的方法
    - 实现错误处理，当文件不存在或格式错误时抛出异常
    - _需求: 10.1, 10.2, 10.3, 10.4_
  
  - [x] 2.2 实现配置验证功能
    - 验证角色配置必须包含url、point和status字段
    - 验证每个角色必须有且仅有一个normal、attacked和knocked状态
    - 验证背景配置包含url字段
    - _需求: 10.5_

- [x] 3. 实现角色状态类（CharacterState）
  - 创建CharacterState类，存储状态的所有属性（keys、images、hitBox、attackBox等）
  - 实现getCurrentFrame方法，根据计时器返回当前动画帧
  - 实现isAnimationComplete方法，判断动画是否播放完成
  - _需求: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. 实现角色类（Character）
  - [x] 4.1 实现角色基本属性和初始化
    - 定义角色属性：name、maxHealthPoint、currentHealthPoint、knockdownCount、position等
    - 在构造函数中初始化角色，加载所有状态
    - 设置初始状态为normal状态
    - _需求: 1.5, 7.4_
  
  - [x] 4.2 实现角色状态管理
    - 实现changeState方法，切换角色状态并重置计时器
    - 实现update方法，更新状态计时器和动画帧
    - 实现状态自动恢复逻辑（attacking和attacked状态结束后返回normal）
    - _需求: 4.3, 4.4, 6.3, 6.4_
  
  - [x] 4.3 实现角色移动功能
    - 实现moveLeft和moveRight方法，更新角色position
    - 添加边界检查，防止角色移出Canvas
    - 在knocked状态和击退过程中禁用移动
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.4 实现角色攻击功能
    - 实现attack方法，切换到attacking状态
    - 在knocked状态和击退过程中禁用攻击
    - _需求: 4.1, 4.2_
  
  - [x] 4.5 实现伤害和复活机制
    - 实现takeDamage方法，减少血量并切换到attacked状态
    - 当血量小于等于0时，增加knockdownCount并切换到knocked状态
    - 实现revive方法，恢复血量并返回normal状态
    - 实现isKnockedOut方法，判断角色是否已两次倒地
    - _需求: 5.1, 5.2, 7.1, 7.2, 7.3, 8.1_
  
  - [x] 4.6 实现碰撞框获取方法
    - 实现getHitBox方法，返回当前状态的受击框绝对坐标
    - 实现getAttackBox方法，返回当前状态的攻击框绝对坐标（如果存在）
    - 根据角色朝向（isLeftSide）调整框的位置
    - _需求: 5.1_

- [x] 5. 实现碰撞检测器（CollisionDetector）
  - [x] 5.1 实现矩形碰撞检测
    - 实现checkCollision静态方法，判断两个矩形是否重叠
    - _需求: 5.1_
  
  - [x] 5.2 实现攻击命中检测
    - 实现checkAttackHit静态方法，检测攻击框和受击框是否重叠
    - 只在攻击者处于attacking状态时进行检测
    - _需求: 5.1_
  
  - [x] 5.3 实现击退效果计算
    - 实现calculateKnockback静态方法，计算双方击退的目标位置
    - 根据双方相对位置决定击退方向
    - 返回击退持续时间和目标位置
    - _需求: 5.3, 5.4_

- [x] 6. 实现输入处理器（InputHandler）
  - [x] 6.1 实现基本按键监听
    - 监听keydown和keyup事件
    - 维护keysPressed集合，记录当前按下的按键
    - 定义按键映射（A/S/D for Player1, K/L/J for Player2, Space for start）
    - _需求: 2.1, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 9.1_
  
  - [x] 6.2 实现按键序列检测
    - 维护每个玩家的按键序列数组和计时器
    - 在update方法中更新计时器，超过0.5秒清空序列
    - 实现normalizeSequence方法，将移动键转换为相对方向（B/F）
    - 实现checkKeySequence方法，匹配目标按键序列
    - _需求: 4.5_
  
  - [x] 6.3 实现玩家动作获取
    - 实现getPlayerActions方法，返回玩家当前的动作（移动、攻击、特殊技能）
    - 检查按键序列是否匹配特殊技能
    - 返回基本动作（左移、右移、攻击）
    - _需求: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.5_

- [x] 7. 实现渲染器（Renderer）
  - [x] 7.1 实现基本渲染方法
    - 实现clear方法，清空Canvas
    - 实现drawBackground方法，绘制背景图片
    - 实现drawText方法，绘制文本（支持字体、颜色、对齐等选项）
    - _需求: 2.3_
  
  - [x] 7.2 实现角色渲染
    - 实现drawCharacter方法，绘制角色当前动画帧
    - 根据角色朝向（isLeftSide）决定是否水平翻转图片
    - _需求: 2.4, 6.1_
  
  - [x] 7.3 实现UI渲染
    - 实现drawHealthBar方法，绘制血条和血量数值
    - 实现drawCharacterSelection方法，绘制角色选择界面
    - 实现drawVictoryScreen方法，绘制胜利画面
    - _需求: 1.1, 1.2, 1.3, 2.3, 8.2, 8.3_

- [x] 8. 实现角色选择管理器（CharacterSelectionManager）
  - [x] 8.1 实现角色选择逻辑
    - 维护player1Selection和player2Selection状态
    - 实现handleClick方法，处理鼠标点击事件
    - 点击已选角色时取消选择
    - _需求: 1.1, 1.2, 1.3_
  
  - [x] 8.2 实现选择完成检查
    - 实现isSelectionComplete方法，判断双方是否都已选择
    - 实现getSelectedCharacters方法，返回选中的角色数据
    - 实现reset方法，清空选择状态
    - _需求: 1.4, 9.2_

- [x] 9. 实现游戏管理器（GameManager）
  - [x] 9.1 实现游戏初始化
    - 加载配置文件（characters.json和backgrounds.json）
    - 预加载所有图片资源
    - 初始化Canvas和各个管理器
    - 设置初始状态为CHARACTER_SELECTION
    - _需求: 10.1, 10.2_
  
  - [x] 9.2 实现角色选择状态逻辑
    - 监听鼠标点击事件，调用CharacterSelectionManager处理选择
    - 监听空格键，当双方都选择后切换到BATTLE状态
    - 随机选择一个背景
    - 创建两个Character实例
    - _需求: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4_
  
  - [x] 9.3 实现战斗状态逻辑
    - 在update方法中处理玩家输入，调用角色的移动和攻击方法
    - 更新两个角色的状态和动画
    - 检测碰撞，应用伤害和击退效果
    - 管理击退状态，在击退期间禁用双方操作
    - 检查是否有角色两次倒地，切换到VICTORY状态
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 8.1_
  
  - [x] 9.4 实现胜利状态逻辑
    - 显示胜利画面，包含祝贺语和胜者名称
    - 监听空格键，切换回CHARACTER_SELECTION状态
    - 重置所有游戏状态
    - _需求: 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4_
  
  - [x] 9.5 实现主游戏循环
    - 使用requestAnimationFrame创建游戏循环
    - 计算deltaTime（帧间隔时间）
    - 调用update和render方法
    - _需求: 所有需求_

- [x] 10. 创建示例配置文件
  - [x] 10.1 创建characters.json示例
    - 创建至少2个角色的完整配置
    - 每个角色包含normal、attacking、attacked、knocked状态
    - 添加至少一个组合技（使用keys序列）
    - _需求: 1.5, 10.1_
  
  - [x] 10.2 创建backgrounds.json示例
    - 创建至少2个背景配置
    - _需求: 2.2, 10.2_

- [x] 11. 集成和调试
  - [x] 11.1 集成所有模块
    - 在main.js中创建GameManager实例并启动游戏
    - 确保所有模块正确导入和初始化
    - _需求: 所有需求_
  
  - [x] 11.2 调试核心功能
    - 测试角色选择流程
    - 测试战斗流程（移动、攻击、碰撞）
    - 测试复活和游戏结束
    - 测试游戏重置
    - _需求: 所有需求_
  
  - [x] 11.3 优化和完善
    - 调整碰撞框和攻击框的位置和大小
    - 调整击退距离和持续时间
    - 优化动画播放效果
    - 添加必要的视觉反馈（如血条颜色变化）
    - _需求: 所有需求_
