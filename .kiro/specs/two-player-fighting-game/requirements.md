# 需求文档

## 简介

这是一个基于HTML5的双人格斗游戏，运行在桌面浏览器中。两名玩家通过键盘控制各自的角色进行战斗，每个角色有两次生命机会，当一方两次血量归零后游戏结束。游戏支持动态加载角色和背景配置。

## 术语表

- **Game System**: 整个双人格斗游戏系统
- **Character**: 可选择的游戏角色，具有血量、攻击力和多种状态
- **Player**: 游戏参与者，分为Player 1和Player 2
- **Health Point**: 角色的血量值
- **Attack Power**: 角色攻击造成的伤害值
- **Character State**: 角色的状态（默认、攻击、挨打、倒地）
- **Hit Box**: 角色可受打击的坐标范围
- **Attack Box**: 角色攻击的坐标范围
- **Revival**: 角色血量归零后的复活机会
- **Background**: 游戏战斗场景的背景图片
- **Character Selection Screen**: 角色选择界面
- **Battle Screen**: 战斗进行界面
- **Victory Screen**: 胜利结果展示界面

## 需求

### 需求 1: 角色选择流程

**用户故事:** 作为玩家，我希望能够通过鼠标选择我的角色，以便开始游戏对战

#### 验收标准

1. WHEN Player 1 clicks on a character avatar, THE Game System SHALL highlight that character as Player 1's selection
2. WHEN Player 2 clicks on a character avatar after Player 1 has selected, THE Game System SHALL highlight that character as Player 2's selection
3. WHEN a Player clicks on their already selected character, THE Game System SHALL deselect that character and remove the highlight
4. WHILE both players have not completed their selections, THE Game System SHALL prevent the game from starting
5. THE Game System SHALL load character data from the "./characters.json" file and display all available character avatars on the Character Selection Screen

### 需求 2: 游戏开始与背景选择

**用户故事:** 作为玩家，我希望在选择完角色后按空格键开始游戏，以便进入战斗

#### 验收标准

1. WHEN both players have selected their characters AND the spacebar key is pressed, THE Game System SHALL transition from Character Selection Screen to Battle Screen
2. WHEN transitioning to Battle Screen, THE Game System SHALL randomly select one background from "./backgrounds.json" file
3. WHEN Battle Screen loads, THE Game System SHALL display both selected characters with their initial Health Points
4. WHEN Battle Screen loads, THE Game System SHALL position Player 1's character on the left side and Player 2's character on the right side

### 需求 3: 角色移动控制

**用户故事:** 作为玩家，我希望使用键盘控制我的角色移动，以便在战斗中调整位置

#### 验收标准

1. WHEN the "A" key is pressed, THE Game System SHALL move Player 1's character to the left
2. WHEN the "S" key is pressed, THE Game System SHALL move Player 1's character to the right
3. WHEN the "K" key is pressed, THE Game System SHALL move Player 2's character to the left
4. WHEN the "L" key is pressed, THE Game System SHALL move Player 2's character to the right
5. WHILE a character is in knocked state or during knockback animation, THE Game System SHALL ignore movement input for that character

### 需求 4: 角色攻击控制

**用户故事:** 作为玩家，我希望使用键盘发起攻击，以便对对手造成伤害

#### 验收标准

1. WHEN the "D" key is pressed, THE Game System SHALL trigger Player 1's character attack action
2. WHEN the "J" key is pressed, THE Game System SHALL trigger Player 2's character attack action
3. WHEN a character enters attacking state, THE Game System SHALL display the corresponding attack animation frames
4. WHEN a character's attack state duration expires, THE Game System SHALL return that character to normal state
5. WHEN a key combination matching a character's status keys is pressed within 0.5 seconds, THE Game System SHALL trigger the corresponding special attack state

### 需求 5: 碰撞检测与伤害计算

**用户故事:** 作为玩家，我希望我的攻击能够对对手造成伤害，以便赢得游戏

#### 验收标准

1. WHEN a character's Attack Box overlaps with the opponent's Hit Box, THE Game System SHALL reduce the opponent's Health Point by the attacker's Attack Power value
2. WHEN a successful hit occurs, THE Game System SHALL change the hit character's state to attacked state
3. WHEN a successful hit occurs, THE Game System SHALL push both characters apart by a fixed distance
4. WHILE characters are being pushed apart, THE Game System SHALL prevent both characters from performing any actions
5. WHEN the knockback animation completes, THE Game System SHALL return both characters to normal state

### 需求 6: 角色状态管理

**用户故事:** 作为玩家，我希望看到角色的不同状态动画，以便了解当前的战斗情况

#### 验收标准

1. THE Game System SHALL cycle through the imgs array for the current character state, displaying each image for its specified duration
2. WHEN a character is in normal state, THE Game System SHALL continuously loop the normal state animation
3. WHEN a character enters attacking state, THE Game System SHALL play the attack animation once and return to normal state after the duration expires
4. WHEN a character enters attacked state, THE Game System SHALL play the attacked animation and then return to normal state
5. WHEN a character enters knocked state, THE Game System SHALL play the knocked animation and keep the character in that state until revival

### 需求 7: 复活机制

**用户故事:** 作为玩家，我希望在第一次血量归零后能够复活，以便有第二次机会

#### 验收标准

1. WHEN a character's Health Point reaches zero or below for the first time, THE Game System SHALL change that character to knocked state
2. WHEN a character is knocked for the first time, THE Game System SHALL restore that character's Health Point to the initial value after a brief delay
3. WHEN a character's Health Point is restored, THE Game System SHALL return that character to normal state
4. THE Game System SHALL track the number of times each character has been knocked down

### 需求 8: 游戏结束与胜利判定

**用户故事:** 作为玩家，我希望在对手两次血量归零后看到胜利画面，以便确认我赢得了游戏

#### 验收标准

1. WHEN a character's Health Point reaches zero or below for the second time, THE Game System SHALL transition to Victory Screen
2. WHEN Victory Screen is displayed, THE Game System SHALL show a congratulatory message
3. WHEN Victory Screen is displayed, THE Game System SHALL display the name of the winning character
4. WHEN Victory Screen is displayed, THE Game System SHALL keep the defeated character in knocked state
5. THE Game System SHALL determine the winner as the player whose character has not been knocked down twice

### 需求 9: 游戏重置

**用户故事:** 作为玩家，我希望在游戏结束后按空格键返回角色选择界面，以便开始新的一局

#### 验收标准

1. WHEN the spacebar key is pressed on Victory Screen, THE Game System SHALL transition back to Character Selection Screen
2. WHEN returning to Character Selection Screen, THE Game System SHALL clear all previous character selections
3. WHEN returning to Character Selection Screen, THE Game System SHALL reset all character Health Points to initial values
4. WHEN returning to Character Selection Screen, THE Game System SHALL reset all knockdown counters to zero

### 需求 10: 配置文件加载

**用户故事:** 作为游戏管理员，我希望通过JSON配置文件定义角色和背景，以便灵活扩展游戏内容

#### 验收标准

1. WHEN the game initializes, THE Game System SHALL load character definitions from "./characters.json" file
2. WHEN the game initializes, THE Game System SHALL load background definitions from "./backgrounds.json" file
3. IF "./characters.json" file cannot be loaded, THEN THE Game System SHALL display an error message and prevent game start
4. IF "./backgrounds.json" file cannot be loaded, THEN THE Game System SHALL display an error message and prevent game start
5. THE Game System SHALL validate that each character has exactly one normal state, one attacked state, and one knocked state
