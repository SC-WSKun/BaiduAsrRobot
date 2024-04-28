import {EventEmitter} from 'events';

const eventEmitter = new EventEmitter();

const eventRecognize = 'startRecognize';

export function addListenerRecognize(handler: any) {
  eventEmitter.on(eventRecognize, handler);
}

export function doRecognize() {
  eventEmitter.emit(eventRecognize);
}
