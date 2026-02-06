# 气球照片文件夹

## 📸 用途
此文件夹用于存放首页浮动气球效果的照片。

## 📝 命名规则

照片必须按照以下格式命名：

```
balloon1.jpg
balloon2.jpg
balloon3.jpg
...
balloon16.jpg
```

### 命名要求：
- **前缀**：必须是 `balloon`
- **编号**：从 1 开始的连续数字
- **格式**：支持 `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## 🎈 如何添加新照片

### 步骤 1：添加照片文件
将照片放入此文件夹，命名为 `balloon17.jpg`, `balloon18.jpg` 等

### 步骤 2：更新代码配置
打开 `scripts/floating-balloons.js`，在 `availableImages` 数组中添加新文件名：

```javascript
availableImages: [
    'balloon1.jpg',
    'balloon2.jpg',
    // ... 现有的照片 ...
    'balloon16.jpg',
    'balloon17.jpg',  // 新添加
    'balloon18.jpg'   // 新添加
]
```

### 步骤 3：刷新浏览器
所有配置的照片都会自动显示在首页！

## 📐 照片建议

- **尺寸**：建议 500x500 到 1000x1000 像素
- **格式**：推荐使用 `.jpg` 或 `.webp`（文件更小）
- **大小**：单张照片建议不超过 500KB
- **内容**：团队成员照片、活动照片等

## ⚙️ 工作原理

首页会自动：
1. 读取 `availableImages` 数组中配置的所有照片
2. 将所有照片显示为浮动气球
3. 气球会随机大小、随机位置、随机速度飘动
4. 气球之间会碰撞反弹

## 🎯 示例

假设你有 20 张团队照片：

```
images/balloon_images/
├── balloon1.jpg   (张三)
├── balloon2.jpg   (李四)
├── balloon3.jpg   (王五)
...
├── balloon20.jpg  (团队合照)
└── README.md
```

配置后，所有 20 张照片都会在首页飘动！

## 💡 提示

- 可以跳号命名（如只有 balloon1, balloon3, balloon5），但需要在代码中只配置存在的文件
- 照片数量没有限制，但太多可能影响性能（建议 10-30 张）
- 照片会被裁剪为圆形显示

