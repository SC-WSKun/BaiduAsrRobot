这是一个基于 React Native 框架开发的语音交互应用，语音 SDK 使用百度 SDK，需要先在[百度智能云](https://console.bce.baidu.com/ai/)下申请应用获取`APP_ID`、`APP_KEY`、`APP_SECRET`

# 环境配置

## 完成React Native 基础环境配置

>**Note**: 完成 [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) 里的环境配置直到 "Creating a new application" 这一步之前。

## ~~完成Three适配~~（已使用Polyfill适配，无需再修改）

本项目使用[react-three-fiber](https://github.com/pmndrs/react-three-fiber)渲染3D模型，由于里面使用了WebAPI，会导致启动时报错`TextDecoder doesn't exist`等错误，所以需要在`node_module/react-native/Library/LogBox/LogBox.js`中添加下面的代码：
```typescript
const TextEncodingPolyfill = require('text-encoding');
const BigInt = require('big-integer');
Object.assign(global,{
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  BigInt: BigInt,
})
```

## 修改 react-native-polyfill-globals 中错误的引用
1. 找到 `node_modules/react-native-polyfill-globals/index.js`
2. 更改为下面的代码，将`readable-stream`和`fetch`注释掉，`encoding`一定要保留，其它可以自己试试有没有影响
    ```js
    export default () => {
    [
        require('./src/base64'),
        require('./src/encoding'),
        // require('./src/readable-stream'),
        require('./src/url'),
        // require('./src/fetch'),
        require('./src/crypto'),
    ].forEach(({ polyfill }) => polyfill());
    };
    ```

# 调试应用
## Step 1: 启动 Metro Server

在根目录下运行下面的指令

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: 启动应用

另起一个终端，在根目录下运行下面的指令

```bash
npm run android
```

# 打包应用（安卓）

## Step 1: 清空缓存
在根目录下执行下列指令：
```bash
# 进入安卓目录
cd android 
# 清空缓存
./gradlew clean
```

## Step 2: 打包应用
```bash
# 打包 apk
./gradlew assembleRelease
# 打包 aab(Google Play)
./gradlew bundleRelease
```


# 自定义修改

## 更改百度智能云应用信息

### app.config.json
```json
{
    "APP_ID": "自己的APP_ID",
    "APP_KEY": "自己的APP_KEY",
    "SECRET": "自己的SECRET"
}
```

### android / app / src / main / assets / auth.properties

此文件为百度语音合成服务鉴权文件，如果语音合成有问题可以排查下这里

```
# 在线Android SDK 鉴权信息
## 1.修改这个文件4个鉴权信息
## 2.修改app/build.gradle里 defaultConfig.applicationId为你网页上应用填写的android包名
# 网页上应用的appId，申请纯离线SDK鉴权的必备信息
appId:[自己的APP_ID]
# 网页上应用的appKey, 在线模式和离在线混合模式需要。
appKey:[自己的APP_KEY]
# 网页上应用的secretKey, 在线模式和离在线混合模式需要。
secretKey:[自己的SECRET]
# 包名，这个值必须和app/build.gradle 里 defaultConfig.applicationId一致,即必须为context.getPackageName()
applicationId:[自己的包名]
```

## 更改唤醒词

### Step 1: 获取唤醒词文件

前往`https://ai.baidu.com/tech/speech/wake#tech-demo`生成自己想要的唤醒词文件`WakeUp.bin`

### Step 2: 替换唤醒词文件

唤醒词文件在`android / app / src / main / assets / WakeUp.bin`

# 相关技术文档

To learn more about this project , take a look at the following resources:

- [React Native Website](https://reactnative.dev) - React Native官方文档
- [react-native-baidu-asr](https://github.com/gdoudeng/react-native-baidu-asr) - 提供了百度语音 SDK 的 React Native 接口
- [wxyy_backend](https://github.com/SC-WSKun/wxyy_backend) - 我自己搭的文心一言服务器
- [react-three-fiber](https://github.com/pmndrs/react-three-fiber) - 提供 Three.js 的 React 版本(部分兼容React Native)
- [r3f-native-orbitcontrols](https://github.com/TiagoCavalcante/r3f-native-orbitcontrols/tree/main) - 提供 R3F 的 React Native 版本 OrbitControls

# 可能用到的开发工具

- [Flipper](https://fbflipper.com/docs/getting-started/) - 一个方便调试 React Native 应用的工具