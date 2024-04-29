/*
 * File: event.ts
 * 本应用的事件总线，可在此文件中添加事件监听和触发函数，用于组件间通信
 */
import {EventEmitter} from 'events';

const eventEmitter = new EventEmitter();

export function addRobotEventListener(eventName: string, handler: any) {
  eventEmitter.on(eventName, handler);
}

export function doRobotEvent(eventName: string, args: any) {
  eventEmitter.emit(eventName, args);
}
