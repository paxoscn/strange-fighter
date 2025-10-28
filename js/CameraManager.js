class CameraManager {
    constructor() {
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            return;
        }

        try {
            // 创建隐藏的 video 元素用于捕获摄像头
            this.video = document.createElement('video');
            this.video.style.display = 'none';
            this.video.autoplay = true;
            document.body.appendChild(this.video);

            // 创建隐藏的 canvas 用于捕获图像
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');

            // 请求摄像头访问
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            this.video.srcObject = this.stream;
            await this.video.play();

            this.isInitialized = true;
            console.log('Camera initialized successfully');
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            // throw new Error('无法访问摄像头，请确保已授予摄像头权限');
        }
    }

    captureImage(width = 200, height = 200) {
        if (!this.isInitialized || !this.video.videoWidth) {
            console.error('Camera not ready');
            return null;
        }

        // 设置 canvas 尺寸
        this.canvas.width = width;
        this.canvas.height = height;

        // 计算裁剪区域（居中裁剪为正方形）
        const videoAspect = this.video.videoWidth / this.video.videoHeight;
        let sx, sy, sWidth, sHeight;

        if (videoAspect > 1) {
            // 视频更宽，裁剪左右
            sHeight = this.video.videoHeight;
            sWidth = sHeight;
            sx = (this.video.videoWidth - sWidth) / 2;
            sy = 0;
        } else {
            // 视频更高，裁剪上下
            sWidth = this.video.videoWidth;
            sHeight = sWidth;
            sx = 0;
            sy = (this.video.videoHeight - sHeight) / 2;
        }

        // 绘制裁剪后的图像到 canvas
        this.ctx.drawImage(
            this.video,
            sx, sy, sWidth, sHeight,
            0, 0, width, height
        );

        // 转换为 data URL
        return this.canvas.toDataURL('image/png');
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.srcObject = null;
            if (this.video.parentNode) {
                this.video.parentNode.removeChild(this.video);
            }
            this.video = null;
        }

        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;

        console.log('Camera cleaned up');
    }
}

export default CameraManager;
