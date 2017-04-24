/**
 * Created by tsengkasing on 4/18/2017.
 */
const fs = require('fs');
const Jimp = require('jimp');
const jpeg = require('jpeg-js');

const image_folder_path = './xuanke_code/';

main();

function main() {

    let labels = fs.readFileSync(`${image_folder_path}labels.txt`).toString();
    try {
        labels = JSON.parse(labels);
    }catch (err){
        console.error('labels file error');
        return null;
    }

    loadImages(labels.length)
        .then(function (typed_arrays) {
            return parseDataSet(typed_arrays ,labels);
        })
        .then(function (dataSet) {
            return trainNeuralNetwork(dataSet);
        })
        .then(function (net) {
            storeNeuralNetworkModel(net);
        });

}

//解析训练集和标签
function parseDataSet(typed_arrays, labels) {
    return new Promise(function (resolve) {
        if(Object.keys(typed_arrays).length !== labels.length * 4) {
            console.error(`${Object.keys(typed_arrays).length} & ${labels.length * 4}`);
            throw new Error('Length Not Equal');
        }

        let train_feature = [];
        let train_label = [];
        for(let i = 0; i < labels.length; i++) {

            for(let j = 0; j < labels[i].length; j++) {
                let digits_array = typed_arrays[`code_${i}_${j}`];

                train_feature.push(digits_array);

                let label_bool = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                label_bool[labels[i][j]] = 1;

                train_label.push(label_bool);
            }


        }

        console.log(`训练数据总共${labels.length * 4}个数字`);
        resolve({train_feature, train_label});
    });
}

//训练神经网络
function trainNeuralNetwork(dataSet) {
    return new Promise(function (resolve) {
        let {train_feature, train_label} = dataSet;
        let brain = require('brain');
        let net = new brain.NeuralNetwork();


        //训练前200个数字
        let inputSet = [];
        for(let i = 0; i < 200; i++) {
            inputSet.push({
                input: train_feature[i],
                output: train_label[i]
            });
        }
        net.train(inputSet);

        //测试后56个数字
        let digits_correct = 0, digits_all = 0;
        for(let i = 200; i < train_label.length; i++) {
            let output = net.run(train_feature[i]);

            let predict_index = output.indexOf(Math.max(...output));
            let label_index = train_label[i].indexOf(1);

            digits_all++;
            if(predict_index === label_index){
                digits_correct++;
            }
        }
        console.log(`准确率：${digits_correct / digits_all * 100}%`);

        resolve(net);
    });
}

//将预测函数导出到文件，之后可以单独使用，不需要引用依赖包。
function storeNeuralNetworkModel(net) {
    let forecast = net.toFunction();

    fs.writeFileSync(`./parseCAPTCHA.js`, forecast.toString());
}



//提取像素到矩阵
function extractPixel(typed_array) {
    if(typed_array.length % 4 !== 0) throw 'Pixel Not In RGBA Format';
    let pixels = [];
    for(let i = 0; i < typed_array.length; i = i + 4) {
        let pixel = [typed_array[i], typed_array[i + 1], typed_array[i + 2], typed_array[i + 3]];
        pixels.push(pixel);
    }
    return pixels;
}

//图像二值化
function binarizeImage(pixels) {
    for(let i = 0; i < pixels.length; i++) {
        if(pixels[i][1] > 127)
            pixels[i] = 1;
        else
            pixels[i] = 0;
    }
    return pixels;
}

//分割图片成4个数字
function splitImageTo4Parts(img) {
    const single_digit_width = img.bitmap.width / 4.2;
    const single_digit_height = img.bitmap.height * 0.8;
    const single_digit_y = 2;

    let i0 = img.clone();
    i0.crop(1, single_digit_y, single_digit_width, single_digit_height);
    let i1 = img.clone();
    i1.crop(single_digit_width, single_digit_y, single_digit_width, single_digit_height);
    let i2 = img.clone();
    i2.crop(single_digit_width * 2, single_digit_y, single_digit_width, single_digit_height);
    let i3 = img.clone();
    i3.crop(single_digit_width * 3, single_digit_y, single_digit_width, single_digit_height);

    return [i0, i1, i2, i3];
}

//将单个数字图片转换成扁平的二值化数组
function decodeImageToTypedArray(images, index, files_typed_array) {
    let promises = [];
    for (let _img = 0; _img < images.length; _img++) {
        let _promise_get_array =
            new Promise(function (__resolve) {
                images[_img].getBuffer(Jimp.MIME_JPEG, function (err, buffer) {
                    __resolve(buffer);
                });
            }).then(function (buffer) {
                return new Promise(function (_resolve) {
                    files_typed_array[`code_${index}_${_img}`] =
                        binarizeImage(extractPixel(jpeg.decode(buffer, true).data));
                    _resolve();
                });
            });

        promises.push(_promise_get_array);
    }
    return promises;
}

//加载图片
function loadImages(length_labels) {
    return new Promise(function (resolve) {
        let files_typed_array = {};
        let promises = [];
        let promises_image = [];

        for(let i = 0; i < length_labels; i++) {
            const img_path = `${image_folder_path}code_${i}.jpg`;

            promises_image.push(Jimp.read(img_path));
        }

        Promise.all(promises_image).then(function (images) {
            for (let index = 0;index < images.length; index++) {
                const img = images[index];

                let _imgs = splitImageTo4Parts(img);

                promises.push(...decodeImageToTypedArray(_imgs, index, files_typed_array));
            }

            Promise.all(promises).then(function () {
                console.log('Images Loaded.');
                resolve(files_typed_array);
            });
        }).catch(function (err) {
            console.error(err);
        });

    });

}

