# CAPTCHA_Recognition_xuanke.tongji
A JavaScript tool to recognize the CAPTCHA of xuanke.tongji.edu.cn

## 依赖
- [Jimp](https://www.npmjs.com/package/jimp)
- [jpeg-js](https://www.npmjs.com/package/jpeg-js)
- [brain](https://www.npmjs.com/package/brain)

## 文件

- 图片抓取代码 ``get_xuanke_img.js``
- 图片 ``xuanke_code/*.jpg``
- 标签 ``xuanke_code/labels.txt``
- 图片读取和预处理以及神经网络训练 ``main.js``
- 可直接使用的包 ``parseCAPTCHA.js``
- 使用样例 ``test.js``

## 使用方法
在可直接使用的包中已经导出了预测函数，不再依赖brain.js
```
const forecast = require('./parseCAPTCHA');

//图片路径
let image_path = './xuanke_code/code_92.jpg';

//在回调函数中返回结果r
forecast(image_path, function (r) {
    console.log(r);
});
```

## 图片获取
使用普通的http请求抓取``http://xuanke.tongji.edu.cn/CheckImage``


## 步骤
1. 首先使用Jimp读取图片
2. 进行使用Jimp的crop接口裁剪成4张图片
3. 通过Jimp的getBuffer接口获取裁剪之后的Buffer
4. 用jpeg-js的decode接口解码之前裁剪之后的Buffer
5. 将Buffer解析成像素矩阵，每一个像素是rgba的一个四维数组
6. 将图像二值化，白色的地方成为0，黑色的地方成为1。由于验证码图像非常典型，直接识别r是否大于127来判断即可。
7. 手动加标签
8. 输入二值化之后的数组和标签到神经网络模型中训练