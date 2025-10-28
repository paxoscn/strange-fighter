# 摄像头关闭快速检查 ⚡

## 🎯 一分钟检查清单

### ✅ 摄像头已正确关闭的标志

1. **硬件指示灯** ⚫ 熄灭
2. **浏览器图标** 🎥 消失/变灰
3. **控制台日志** 显示 "Camera cleanup completed successfully"
4. **轨道状态** `readyState: ended`

### ❌ 摄像头未关闭的标志

1. **硬件指示灯** 🟢 仍然亮着
2. **浏览器图标** 🎥 仍然显示
3. **控制台错误** 有错误消息
4. **轨道状态** `readyState: live`

## 🔧 快速修复

### 在控制台执行 (F12)

```javascript
// 1. 检查状态
window.gameManager.cameraManager.isInitialized
// 应该返回: false

// 2. 如果返回 true，手动清理
window.gameManager.cameraManager.cleanup()

// 3. 再次检查
window.gameManager.cameraManager.isInitialized
// 现在应该返回: false
```

### 如果还是不行

```javascript
// 强制停止所有轨道
if (window.gameManager.cameraManager.stream) {
    window.gameManager.cameraManager.stream.getTracks().forEach(t => t.stop());
}
```

### 终极方案

1. 刷新页面 (F5)
2. 重启浏览器
3. 检查其他标签页

## 📊 预期控制台输出

```
✅ 正确的输出:
Initializing camera...
Camera initialized successfully
Capturing image...
Captured head for player 1
Closing camera...
Starting camera cleanup...
Stopping 1 media track(s)...
Track stopped: ended          ← 关键！
Camera cleanup completed successfully
```

```
❌ 错误的输出:
Track stopped: live           ← 问题！
```

## 🧪 快速测试

### 方法1: 使用游戏
```
1. 打开 http://localhost:8000
2. 按 Q 键
3. 等待 1 秒
4. 检查摄像头指示灯 → 应该熄灭
```

### 方法2: 使用测试页面
```
1. 打开 http://localhost:8000/test-camera-cleanup.html
2. 点击"初始化摄像头" → 灯亮
3. 点击"关闭摄像头" → 灯灭
4. 查看日志确认
```

## 📞 需要帮助？

查看详细文档：
- [DEBUG_CAMERA.md](DEBUG_CAMERA.md) - 完整调试指南
- [CAMERA_CLEANUP_IMPROVEMENTS.md](CAMERA_CLEANUP_IMPROVEMENTS.md) - 改进说明
- [test-camera-cleanup.html](test-camera-cleanup.html) - 测试页面

## 💡 记住

- 摄像头指示灯是最可靠的指标
- 控制台日志是第二可靠的指标
- 如果有疑问，刷新页面
