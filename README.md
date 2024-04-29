这是一个基于 React Native 框架开发的语音交互应用，语音 SDK 使用百度 SDK，需要先在[百度智能云](https://console.bce.baidu.com/ai/)下申请应用获取`APP_ID`、`APP_KEY`、`APP_SECRET`

# 环境配置

>**Note**: 完成 [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) 里的环境配置直到 "Creating a new application" 这一步之前。

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
npx expo run
```
# 自定义修改

## 更改百度智能云应用信息

### app.config.json
```
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

# 可能用到的开发工具

- [Flipper](https://fbflipper.com/docs/getting-started/) - 一个方便调试 React Native 应用的工具