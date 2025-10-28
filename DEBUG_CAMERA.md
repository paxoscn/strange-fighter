# 摄像头关闭调试指南

## 🔍 如何检查摄像头是否关闭

### 1. 硬件指示灯
- **笔记本电脑**: 检查摄像头旁边的 LED 指示灯
  - 🟢 亮起 = 摄像头正在使用
  - ⚫ 熄灭 = 摄像头已关闭
- **外置摄像头**: 检查设备上的指示灯

### 2. 浏览器指示
- **Chrome/Edge**: 地址栏右侧的摄像头图标
  - 🎥 红色 = 摄像头正在使用
  - 🎥 灰色/消失 = 摄像头已关闭
- **Firefox**: 地址栏左侧的摄像头图标
- **Safari**: 地址栏的摄像头图标

### 3. 控制台日志
打开浏览器控制台 (F12)，查看以下日志：

```
正常流程：
1. "Initializing camera..."
2. "Camera initialized successfully"
3. "Capturing image..."
4. "Captured head for player X"
5. "Closing camera..."
6. "Starting camera cleanup..."
7. "Stopping 1 media track(s)..."
8. "Stopping track: video, enabled: true, readyState: live"
9. "Track stopped: ended"
10. "Cleaning up video element..."
11. "Camera cleanup completed successfully"
12. "Camera cleanup completed"
```

### 4. 系统设置检查

#### macOS
```bash
# 检查正在使用摄像头的进程
lsof | grep "AppleCamera"
```

#### Windows
- 打开任务管理器
- 查看"性能"标签
- 检查摄像头使用情况

#### Linux
```bash
# 检查视频设备
lsof /dev/video0
```

## 🐛 常见问题

### 问题1: 摄像头指示灯一直亮着

**可能原因:**
1. `cleanup()` 方法没有被调用
2. 媒体轨道没有正确停止
3. 浏览器缓存了视频流
4. 其他标签页也在使用摄像头

**解决方法:**
```javascript
// 在控制台手动执行
window.gameManager.cameraManager.cleanup();
```

### 问题2: 控制台显示 "Track stopped: live"

**问题:** 轨道状态仍然是 "live" 而不是 "ended"

**解决方法:**
检查是否有其他引用持有视频流：
```javascript
// 在控制台检查
console.log(window.gameManager.cameraManager.stream);
console.log(window.gameManager.cameraManager.video);
```

### 问题3: 多次捕获后摄像头无法关闭

**可能原因:** 创建了多个摄像头实例

**解决方法:**
确保只有一个 `CameraManager` 实例：
```javascript
// 在控制台检查
console.log(window.gameManager.cameraManager.isInitialized);
```

## 🔧 调试步骤

### 步骤1: 启用详细日志
代码已经添加了详细的日志输出，打开控制台查看。

### 步骤2: 手动测试 cleanup
在控制台执行：
```javascript
// 获取 gameManager 实例
const gm = window.gameManager;

// 检查摄像头状态
console.log('Camera initialized:', gm.cameraManager.isInitialized);
console.log('Stream:', gm.cameraManager.stream);
console.log('Video:', gm.cameraManager.video);

// 手动清理
gm.cameraManager.cleanup();

// 再次检查
console.log('After cleanup - initialized:', gm.cameraManager.isInitialized);
console.log('After cleanup - stream:', gm.cameraManager.stream);
```

### 步骤3: 检查媒体轨道状态
```javascript
// 在捕获前检查
const stream = gm.cameraManager.stream;
if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => {
        console.log('Track:', track.kind);
        console.log('Enabled:', track.enabled);
        console.log('ReadyState:', track.readyState);
        console.log('Muted:', track.muted);
    });
}
```

### 步骤4: 强制停止所有轨道
如果摄像头仍然打开，在控制台执行：
```javascript
// 获取所有媒体设备
navigator.mediaDevices.enumerateDevices().then(devices => {
    console.log('Media devices:', devices);
});

// 强制停止（如果有 stream 引用）
if (window.gameManager.cameraManager.stream) {
    window.gameManager.cameraManager.stream.getTracks().forEach(track => {
        console.log('Force stopping:', track);
        track.stop();
    });
}
```

## 📊 预期行为

### 正确的时间线
```
0ms:    按下 Q/P 键
0ms:    初始化摄像头
100ms:  摄像头指示灯亮起
1000ms: 捕获图像
1001ms: 调用 cleanup()
1002ms: 停止媒体轨道
1003ms: 移除 video 元素
1004ms: 摄像头指示灯熄灭
1005ms: 显示头像预览
```

### 控制台输出示例
```
[GameManager] Initializing camera...
[CameraManager] Camera initialized successfully
[GameManager] Capturing image...
[GameManager] Captured head for player 1
[GameManager] Closing camera...
[CameraManager] Starting camera cleanup...
[CameraManager] Stopping 1 media track(s)...
[CameraManager] Stopping track: video, enabled: true, readyState: live
[CameraManager] Track stopped: ended
[CameraManager] Cleaning up video element...
[CameraManager] Camera cleanup completed successfully
[GameManager] Camera cleanup completed
```

## 🎯 验证清单

- [ ] 控制台显示 "Camera cleanup completed successfully"
- [ ] 控制台显示 "Track stopped: ended"
- [ ] 摄像头硬件指示灯熄灭
- [ ] 浏览器地址栏摄像头图标消失
- [ ] `isInitialized` 变为 `false`
- [ ] `stream` 变为 `null`
- [ ] `video` 变为 `null`
- [ ] 可以再次捕获（重新初始化）

## 💡 提示

1. **刷新页面**: 如果摄像头卡住，刷新页面会强制释放
2. **检查其他标签**: 确保其他标签页没有使用摄像头
3. **浏览器权限**: 检查浏览器设置中的摄像头权限
4. **重启浏览器**: 极端情况下，重启浏览器可以释放所有资源

## 🔗 相关资源

- [MDN: MediaStreamTrack.stop()](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop)
- [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Chrome DevTools: Media Panel](https://developer.chrome.com/docs/devtools/media-panel/)
