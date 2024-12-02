class TextureProcessor {
    constructor() {
        this.originalCanvas = document.getElementById('originalCanvas');
        this.processedCanvas = document.getElementById('processedCanvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.processedCtx = this.processedCanvas.getContext('2d');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.stitchPattern = null;
        this.loadStitchPattern();

        this.setupEventListeners();
    }

    setupEventListeners() {
        const imageInput = document.getElementById('imageInput');
        const effectSelect = document.getElementById('effectSelect');

        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        effectSelect.addEventListener('change', (e) => this.applyEffect(e.target.value));
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 设置画布大小
                    this.originalCanvas.width = img.width;
                    this.originalCanvas.height = img.height;
                    this.processedCanvas.width = img.width;
                    this.processedCanvas.height = img.height;

                    // 绘制原始图片
                    this.originalCtx.drawImage(img, 0, 0);
                    this.processedCtx.drawImage(img, 0, 0);

                    // 启用下载按钮
                    this.downloadBtn.disabled = false;

                    // 应用当前选择的效果
                    const effectSelect = document.getElementById('effectSelect');
                    this.applyEffect(effectSelect.value);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    downloadImage(targetHeight) {
        try {
            // 创建一个新的画布
            const downloadCanvas = document.createElement('canvas');
            const ctx = downloadCanvas.getContext('2d');

            // 计算等比例宽度并确保是整数
            const aspectRatio = this.processedCanvas.width / this.processedCanvas.height;
            const targetWidth = Math.floor(targetHeight * aspectRatio);

            // 设置画布大小
            downloadCanvas.width = targetWidth;
            downloadCanvas.height = targetHeight;

            // 绘制图像
            ctx.drawImage(
                this.processedCanvas,
                0, 0,
                this.processedCanvas.width,
                this.processedCanvas.height,
                0, 0,
                targetWidth,
                targetHeight
            );

            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            const effect = document.getElementById('effectSelect').value;

            // 使用 processedCanvas 而不是 downloadCanvas
            link.href = this.processedCanvas.toDataURL('image/png');
            link.download = `processed-${effect}-${targetHeight}p-${timestamp}.png`;

            // 触发下载
            link.click();

        } catch (error) {
            console.error('下载图片时出错:', error);
            alert('下载失败，请重试');
        }
    }

    setupDownloadButtons() {
        document.getElementById('download720').addEventListener('click', async () => {
            try {
                await this.downloadImage(720);
            } catch (error) {
                console.error('720p 下载失败:', error);
                alert('下载失败，请重试');
            }
        });

        document.getElementById('download1280').addEventListener('click', async () => {
            try {
                await this.downloadImage(1280);
            } catch (error) {
                console.error('1280p 下载失败:', error);
                alert('下载失败，请重试');
            }
        });
    }

    applyEffect(effectType) {
        // 首先复制原始图片
        this.processedCtx.drawImage(this.originalCanvas, 0, 0);

        const imageData = this.processedCtx.getImageData(
            0, 0,
            this.processedCanvas.width,
            this.processedCanvas.height
        );

        switch (effectType) {
            case 'metal':
                this.applyMetalEffect(imageData);
                break;
            case 'glass':
                this.applyGlassEffect(imageData);
                break;
            case 'plastic':
                this.applyPlasticEffect(imageData);
                break;
            case 'wood':
                this.applyWoodEffect(imageData);
                break;
            case 'embroidery':
                this.applyEmbroideryEffect(imageData);
                break;
            case 'crossStitch':
                this.applyCrossStitchEffect(imageData);
                break;
            case 'crossStitch2':
                this.applyCrossStitch2Effect(imageData);
                break;
            case 'whiteInk':
                this.applyWhiteInkEffect(imageData);
                break;
            case 'directInk':
                this.applyDirectInkEffect(imageData);
                break;
        }

        if (effectType !== 'normal') {
            this.processedCtx.putImageData(imageData, 0, 0);
        }
    }

    applyMetalEffect(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // 增加对比度和亮度
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const factor = 1.5; // 对比度因子

            data[i] = Math.min(255, avg + (data[i] - avg) * factor);     // R
            data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * factor); // G
            data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * factor); // B

            // 添加金属光泽
            if (avg > 200) {
                data[i] = Math.min(255, data[i] * 1.2);
                data[i + 1] = Math.min(255, data[i + 1] * 1.2);
                data[i + 2] = Math.min(255, data[i + 2] * 1.2);
            }
        }
    }

    applyGlassEffect(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 创建临时数组存储原始数据
        const tempData = new Uint8ClampedArray(data);

        // 模拟玻璃折射效果
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const offset = (y * width + x) * 4;
                const offsetX = Math.sin(y * 0.1) * 2; // 水平扭曲
                const offsetY = Math.cos(x * 0.1) * 2; // 垂直扭曲

                const sourceOffset = (
                    ((y + Math.round(offsetY)) * width +
                    (x + Math.round(offsetX))) * 4
                );

                // 确保源位置在有效范围内
                if (sourceOffset >= 0 && sourceOffset < data.length - 3) {
                    data[offset] = tempData[sourceOffset];
                    data[offset + 1] = tempData[sourceOffset + 1];
                    data[offset + 2] = tempData[sourceOffset + 2];
                }
            }
        }

        // 增加透明度效果
        for (let i = 0; i < data.length; i += 4) {
            data[i + 3] = 200; // 设置透明度
        }
    }

    applyPlasticEffect(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // 增加饱和度
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const factor = 1.3; // 饱和度因子

            data[i] = avg + (data[i] - avg) * factor;     // R
            data[i + 1] = avg + (data[i + 1] - avg) * factor; // G
            data[i + 2] = avg + (data[i + 2] - avg) * factor; // B

            // 添加光泽
            if (avg > 180) {
                data[i] = Math.min(255, data[i] * 1.1);
                data[i + 1] = Math.min(255, data[i + 1] * 1.1);
                data[i + 2] = Math.min(255, data[i + 2] * 1.1);
            }
        }
    }

    applyWoodEffect(imageData) {
        const data = imageData.data;
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const offset = (y * imageData.width + x) * 4;

                // 创建木纹纹理
                const noise = Math.sin(x * 0.1) * 20 + Math.sin(y * 0.05) * 20;
                const woodPattern = (noise + 20) % 40 < 20 ? 1.2 : 0.8;

                // 调整颜色为褐色调
                data[offset] = Math.min(255, data[offset] * woodPattern * 1.2);     // R
                data[offset + 1] = Math.min(255, data[offset + 1] * woodPattern * 0.8); // G
                data[offset + 2] = Math.min(255, data[offset + 2] * woodPattern * 0.5); // B
            }
        }
    }

    applyEmbroideryEffect(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 创建临时数组存储原始数据
        const tempData = new Uint8ClampedArray(data);

        // 刺绣效果参数
        const stitchSize = 4;  // 针脚大小
        const stitchGap = 2;   // 针脚间隔

        // 创建刺绣效果
        for (let y = 0; y < height; y += stitchSize) {
            for (let x = 0; x < width; x += stitchSize) {
                // 计算当前区块的平均颜色
                let r = 0, g = 0, b = 0, count = 0;

                // 收集区块内的颜色
                for (let sy = 0; sy < stitchSize && y + sy < height; sy++) {
                    for (let sx = 0; sx < stitchSize && x + sx < width; sx++) {
                        const offset = ((y + sy) * width + (x + sx)) * 4;
                        r += tempData[offset];
                        g += tempData[offset + 1];
                        b += tempData[offset + 2];
                        count++;
                    }
                }

                // 计算平均值
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);

                // 应用针脚效果
                for (let sy = 0; sy < stitchSize && y + sy < height; sy++) {
                    for (let sx = 0; sx < stitchSize && x + sx < width; sx++) {
                        const offset = ((y + sy) * width + (x + sx)) * 4;

                        // 使用原始像素的颜色
                        const pixelR = tempData[offset];
                        const pixelG = tempData[offset + 1];
                        const pixelB = tempData[offset + 2];

                        // 创建针脚纹理
                        const distanceToCenter = Math.sqrt(
                            Math.pow(sx - stitchSize/2, 2) +
                            Math.pow(sy - stitchSize/2, 2)
                        );

                        // 模拟线条效果
                        const threadEffect = Math.sin(distanceToCenter * Math.PI / 2) * 0.3;

                        // 应用颜色和纹理，使用原始像素的颜色
                        data[offset] = Math.min(255, pixelR * (1 + threadEffect));
                        data[offset + 1] = Math.min(255, pixelG * (1 + threadEffect));
                        data[offset + 2] = Math.min(255, pixelB * (1 + threadEffect));

                        // 在针脚边缘添加阴影效果
                        if (distanceToCenter > stitchSize/2 - stitchGap) {
                            data[offset] = Math.max(0, data[offset] - 30);
                            data[offset + 1] = Math.max(0, data[offset + 1] - 30);
                            data[offset + 2] = Math.max(0, data[offset + 2] - 30);
                        }
                    }
                }
            }
        }

        // 增强整体纹理
        for (let i = 0; i < data.length; i += 4) {
            // 添加细微的纹理变化
            const noise = (Math.random() - 0.5) * 15;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
    }

    applyCrossStitchEffect(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 创建临时数组存储原始数据
        const tempData = new Uint8ClampedArray(data);

        // 十字绣参数
        const stitchSize = 8;  // 每个十字绣格子的大小
        const crossSize = 6;   // 十字的大小
        const gap = 1;        // 格子之间的间隔

        // 创建十字绣效果
        for (let y = 0; y < height; y += stitchSize) {
            for (let x = 0; x < width; x += stitchSize) {
                // 计算当前格子的平均颜色
                let r = 0, g = 0, b = 0, count = 0;

                // 收集格子内的颜色
                for (let sy = 0; sy < stitchSize && y + sy < height; sy++) {
                    for (let sx = 0; sx < stitchSize && x + sx < width; sx++) {
                        const offset = ((y + sy) * width + (x + sx)) * 4;
                        r += tempData[offset];
                        g += tempData[offset + 1];
                        b += tempData[offset + 2];
                        count++;
                    }
                }

                // 计算平均值
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);

                // 绘制十字绣格子
                for (let sy = 0; sy < stitchSize && y + sy < height; sy++) {
                    for (let sx = 0; sx < stitchSize && x + sx < width; sx++) {
                        const offset = ((y + sy) * width + (x + sx)) * 4;

                        // 创建背景色（浅色布料效果）
                        const bgColor = 245;
                        data[offset] = bgColor;
                        data[offset + 1] = bgColor;
                        data[offset + 2] = bgColor;

                        // 相对于格子中心的位置
                        const relX = sx - stitchSize / 2;
                        const relY = sy - stitchSize / 2;

                        // 创建十字绣效果
                        const isOnCross = this.isOnCrossStitch(relX, relY, crossSize);

                        if (isOnCross) {
                            // 添加线条效果
                            const threadEffect = Math.random() * 0.2 + 0.8; // 随机线条明暗

                            // 应用颜色
                            data[offset] = Math.min(255, r * threadEffect);
                            data[offset + 1] = Math.min(255, g * threadEffect);
                            data[offset + 2] = Math.min(255, b * threadEffect);

                            // 添加阴影效果
                            if (Math.abs(relX) > crossSize/2 - gap || Math.abs(relY) > crossSize/2 - gap) {
                                data[offset] = Math.max(0, data[offset] - 40);
                                data[offset + 1] = Math.max(0, data[offset + 1] - 40);
                                data[offset + 2] = Math.max(0, data[offset + 2] - 40);
                            }
                        }
                    }
                }
            }
        }

        // 添加整体织物纹理
        this.addFabricTexture(data);
    }

    // 判断像素是否在十字绣线条上
    isOnCrossStitch(x, y, size) {
        // 主对角线
        const onMainDiagonal = Math.abs(y - x) < 1.2;
        // 副对角线
        const onSecondaryDiagonal = Math.abs(y + x) < 1.2;

        // 检查是否在十字范围内
        const inRange = Math.abs(x) <= size/2 && Math.abs(y) <= size/2;

        return inRange && (onMainDiagonal || onSecondaryDiagonal);
    }

    // 添加织物纹理
    addFabricTexture(data) {
        for (let i = 0; i < data.length; i += 4) {
            // 添加细微的织物纹理
            const noise = (Math.random() - 0.5) * 10;
            // 应用噪点，但保持较小的变化范围
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
    }

    // 加载十字绣图案
    loadStitchPattern() {
        const img = new Image();
        img.onload = () => {
            // 创建临时canvas来存储图案
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            this.stitchPattern = tempCtx.getImageData(0, 0, img.width, img.height);
        };
        img.src = 'test2.png'; // 确保test.jpg在正确的路径下
    }

    // 添加新的十字绣效果
    applyCrossStitch2Effect(imageData) {
        if (!this.stitchPattern) {
            console.error('Stitch pattern not loaded');
            return;
        }

        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 创建临时画布来构建最终图
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        // ���字绣参数
        const stitchSize = 8;  // 每个十字绣的大小

        // 遍历原图的每个网格
        for (let y = 0; y < height; y += stitchSize) {
            for (let x = 0; x < width; x += stitchSize) {
                // 计算当前网格的平均颜色
                let r = 0, g = 0, b = 0, count = 0;

                // 收集网格内的颜色
                for (let sy = 0; sy < stitchSize && y + sy < height; sy++) {
                    for (let sx = 0; sx < stitchSize && x + sx < width; sx++) {
                        const offset = ((y + sy) * width + (x + sx)) * 4;
                        r += data[offset];
                        g += data[offset + 1];
                        b += data[offset + 2];
                        count++;
                    }
                }

                // 计算平均颜色
                const brightnessBoost = 1.2; // 增加 20% 的亮度
                r = Math.min(255, Math.round((r / count) * brightnessBoost));
                g = Math.min(255, Math.round((g / count) * brightnessBoost));
                b = Math.min(255, Math.round((b / count) * brightnessBoost));

                // 绘制着色后的十字绣图案
                this.drawColoredStitchPattern(
                    tempCtx,
                    x, y,
                    stitchSize,
                    { r, g, b }
                );
            }
        }

        // 将临时画布的内容复制回原始imageData
        const finalImageData = tempCtx.getImageData(0, 0, width, height);
        for (let i = 0; i < data.length; i++) {
            data[i] = finalImageData.data[i];
        }
    }

    // 绘制着色后的十字绣图案
    drawColoredStitchPattern(ctx, x, y, size, color) {
        // 创建临时画布来处理个十字绣图案
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = this.stitchPattern.width;
        patternCanvas.height = this.stitchPattern.height;
        const patternCtx = patternCanvas.getContext('2d');

        // 将原始图案绘制到临时画布
        const patternImageData = new ImageData(
            new Uint8ClampedArray(this.stitchPattern.data),
            this.stitchPattern.width,
            this.stitchPattern.height
        );

        // 对图案进行着色
        const patternData = patternImageData.data;
        for (let i = 0; i < patternData.length; i += 4) {
            // 检查原始图案的透明度
            const alpha = patternData[i + 3];

            if (alpha > 0) {
                // 只对非完全透明的像素进行着色
                patternData[i] = color.r;       // R
                patternData[i + 1] = color.g;   // G
                patternData[i + 2] = color.b;   // B
                patternData[i + 3] = 255;       // 设置完全不透明
            } else {
                // 完全透明的像素设置为完全透明的白色
                patternData[i] = 255;     // R
                patternData[i + 1] = 255; // G
                patternData[i + 2] = 255; // B
                patternData[i + 3] = 0;   // 完全透明
            }
        }

        patternCtx.putImageData(patternImageData, 0, 0);

        // 在绘制之前，清除目标区域为透明
        ctx.clearRect(x, y, size, size);

        // 将着色后的图绘制到目标置
        ctx.drawImage(
            patternCanvas,
            0, 0, patternCanvas.width, patternCanvas.height,
            x, y, size, size
        );
    }

    // 添加白墨烫画效果方法
    applyWhiteInkEffect(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 创建临时数组存储原始数据
        const tempData = new Uint8ClampedArray(data);

        // 首先创建白色背景
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            data[i + 3] = 255; // A
        }

        // DTF 效果参数
        const dotSize = 2;        // 墨点大小
        const dotSpacing = 2;     // 点间距
        const whiteThreshold = 200; // 白色阈值

        // 处理每个点
        for (let y = 0; y < height; y += dotSpacing) {
            for (let x = 0; x < width; x += dotSpacing) {
                const idx = (y * width + x) * 4;

                // 获取原始颜色
                const r = tempData[idx];
                const g = tempData[idx + 1];
                const b = tempData[idx + 2];

                // 计算亮度
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

                // 如果亮度高于阈值，使用白色；否则使用原始颜色
                const useWhite = brightness > whiteThreshold;

                // 绘制点
                for (let dy = -dotSize; dy <= dotSize; dy++) {
                    for (let dx = -dotSize; dx <= dotSize; dx++) {
                        const targetX = x + dx;
                        const targetY = y + dy;

                        if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance <= dotSize) {
                                const targetIdx = (targetY * width + targetX) * 4;
                                const intensity = 1 - (distance / dotSize);

                                if (useWhite) {
                                    // 白色部分添加微弱的纹理
                                    const whiteNoise = Math.random() * 10;
                                    data[targetIdx] = Math.min(255, 255 - whiteNoise);
                                    data[targetIdx + 1] = Math.min(255, 255 - whiteNoise);
                                    data[targetIdx + 2] = Math.min(255, 255 - whiteNoise);
                                    data[targetIdx + 3] = Math.min(255, 255 * intensity);
                                } else {
                                    // 彩色部分
                                    data[targetIdx] = Math.min(255, r * intensity);
                                    data[targetIdx + 1] = Math.min(255, g * intensity);
                                    data[targetIdx + 2] = Math.min(255, b * intensity);
                                    data[targetIdx + 3] = 255;

                                    // 添加细微纹理
                                    const noise = (Math.random() - 0.5) * 15;
                                    data[targetIdx] = Math.max(0, Math.min(255, data[targetIdx] + noise));
                                    data[targetIdx + 1] = Math.max(0, Math.min(255, data[targetIdx + 1] + noise));
                                    data[targetIdx + 2] = Math.max(0, Math.min(255, data[targetIdx + 2] + noise));
                                }
                            }
                        }
                    }
                }
            }
        }

        // 添加整体的薄膜质感
        for (let i = 0; i < data.length; i += 4) {
            // 添加轻微的光泽
            const gloss = Math.random() * 10;
            data[i] = Math.min(255, data[i] + gloss);
            data[i + 1] = Math.min(255, data[i + 1] + gloss);
            data[i + 2] = Math.min(255, data[i + 2] + gloss);
        }
    }

    // 添加直喷效果方法
    applyDirectInkEffect(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 创建临时数组存储原始数据
        const tempData = new Uint8ClampedArray(data);

        // DTG 参数
        const dotSize = 3;         // 墨点大小
        const dotSpacing = 2;      // 墨点间距
        const fabricTexture = 0.15; // 布料纹理强度
        const inkSpread = 0.8;     // 墨水扩散程度

        // 创建布料纹理背景
        for (let i = 0; i < data.length; i += 4) {
            // 添加布料纹理
            const textureNoise = ((Math.random() - 0.5) * 20) * fabricTexture;
            const baseColor = 250; // 接近白色的底色
            data[i] = baseColor + textureNoise;     // R
            data[i + 1] = baseColor + textureNoise; // G
            data[i + 2] = baseColor + textureNoise; // B
            data[i + 3] = 255;                      // A
        }

        // 处理每个墨点
        for (let y = 0; y < height; y += dotSpacing) {
            for (let x = 0; x < width; x += dotSpacing) {
                const idx = (y * width + x) * 4;

                // 获取原始颜色
                const r = tempData[idx];
                const g = tempData[idx + 1];
                const b = tempData[idx + 2];

                // 计算颜色亮度
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

                // 绘制主要墨点
                for (let dy = -dotSize; dy <= dotSize; dy++) {
                    for (let dx = -dotSize; dx <= dotSize; dx++) {
                        const targetX = x + dx;
                        const targetY = y + dy;

                        if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance <= dotSize) {
                                const targetIdx = (targetY * width + targetX) * 4;

                                // 模拟墨水在布料上的扩散
                                const spread = Math.pow(1 - distance / dotSize, inkSpread);
                                const intensity = spread * (1 - brightness / 510); // 亮度越高，墨水越少

                                // 模拟墨水渗透
                                const inkBlend = (color, base) => {
                                    const penetration = Math.random() * 0.2 + 0.8; // 墨水渗透程度
                                    return Math.floor(color * intensity * penetration +
                                                   base * (1 - intensity * penetration));
                                };

                                // 应用颜色并模拟墨水渗透
                                data[targetIdx] = inkBlend(r, data[targetIdx]);
                                data[targetIdx + 1] = inkBlend(g, data[targetIdx + 1]);
                                data[targetIdx + 2] = inkBlend(b, data[targetIdx + 2]);

                                // 添加纤维纹理
                                if (Math.random() < 0.3) {
                                    const fiberNoise = (Math.random() - 0.5) * 15;
                                    data[targetIdx] = Math.max(0, Math.min(255, data[targetIdx] + fiberNoise));
                                    data[targetIdx + 1] = Math.max(0, Math.min(255, data[targetIdx + 1] + fiberNoise));
                                    data[targetIdx + 2] = Math.max(0, Math.min(255, data[targetIdx + 2] + fiberNoise));
                                }
                            }
                        }
                    }
                }

                // 添加墨水微小扩散效果
                if (Math.random() < 0.2 && brightness < 200) {
                    const spreadRadius = Math.floor(dotSize * 1.5);
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * spreadRadius;

                    const spreadX = x + Math.cos(angle) * distance;
                    const spreadY = y + Math.sin(angle) * distance;

                    if (spreadX >= 0 && spreadX < width && spreadY >= 0 && spreadY < height) {
                        const spreadIdx = (Math.floor(spreadY) * width + Math.floor(spreadX)) * 4;
                        const spreadIntensity = 0.3 * (1 - distance / spreadRadius);

                        data[spreadIdx] = Math.floor(r * spreadIntensity + data[spreadIdx] * (1 - spreadIntensity));
                        data[spreadIdx + 1] = Math.floor(g * spreadIntensity + data[spreadIdx + 1] * (1 - spreadIntensity));
                        data[spreadIdx + 2] = Math.floor(b * spreadIntensity + data[spreadIdx + 2] * (1 - spreadIntensity));
                    }
                }
            }
        }
    }
}

// 初始化处理器
window.addEventListener('DOMContentLoaded', () => {
    new TextureProcessor();
});
