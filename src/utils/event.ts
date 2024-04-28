/*
 * File: event.ts
 * 本应用的事件总线，可在此文件中添加事件监听和触发函数，用于组件间通信
 */
import {EventEmitter} from 'events';

const eventEmitter = new EventEmitter();

const eventRecognize = 'startRecognize';

export function addListenerRecognize(handler: any) {
  eventEmitter.on(eventRecognize, handler);
}

export function doRecognize() {
  eventEmitter.emit(eventRecognize);
}
