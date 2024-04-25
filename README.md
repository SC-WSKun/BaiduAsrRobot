这是一个基于 React Native 框架开发的语音交互应用，语音 SDK 使用百度 SDK，需要先在[百度智能云](https://console.bce.baidu.com/ai/)下申请应用获取`APP_ID`、`APP_KEY`、`APP_SECRET`

# 环境配置

>**Note**: 完成 [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) 里的环境配置直到 "Creating a new application" 这一步之前

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

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

# 相关技术文档

To learn more about this project , take a look at the following resources:

- [React Native Website](https://reactnative.dev) - React Native官方文档
- [react-native-baidu-asr](https://github.com/gdoudeng/react-native-baidu-asr) - 提供了百度语音 SDK 的 React Native 接口
- [wxyy_backend]() - 我自己搭的文心一言服务器

# 可能用到的开发工具

- [Flipper](https://fbflipper.com/docs/getting-started/) - 一个方便调试 React Native 应用的工具