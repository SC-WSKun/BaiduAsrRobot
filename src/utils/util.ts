export function hexdump(buffer: any, blockSize?: number) {
  if (typeof buffer === 'string') {
    console.log('buffer is string');
    //do nothing
  } else if (buffer instanceof ArrayBuffer && buffer.byteLength !== undefined) {
    console.log('buffer is ArrayBuffer');
    buffer = String.fromCharCode.apply(
      String,
      [].slice.call(new Uint8Array(buffer)),
    );
  } else if (Array.isArray(buffer)) {
    console.log('buffer is Array');
    buffer = String.fromCharCode.apply(String, buffer);
  } else if (buffer.constructor === Uint8Array) {
    console.log('buffer is Uint8Array');
    buffer = String.fromCharCode.apply(String, [].slice.call(buffer));
  } else {
    console.log('Error: buffer is unknown...');
    return false;
  }

  blockSize = blockSize || 16;
  var lines = [];
  var hex = '0123456789ABCDEF';
  for (var b = 0; b < buffer.length; b += blockSize) {
    var block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
    var addr = ('0000' + b.toString(16)).slice(-4);
    var codes = block
      .split('')
      .map(function (ch: string) {
        var code = ch.charCodeAt(0);
        return ' ' + hex[(0xf0 & code) >> 4] + hex[0x0f & code];
      })
      .join('');
    codes += '   '.repeat(blockSize - block.length);
    var chars = block.replace(/[\x00-\x1F\x20]/g, '.');
    chars += ' '.repeat(blockSize - block.length);
    // lines.push(addr + ' ' + codes + '  ' + chars)
    lines.push(chars);
  }
  return lines.join('');
}

export function concatenateUint8Arrays(
  buffer1: Uint8Array,
  buffer2: Uint8Array,
) {
  let newArray = new Uint8Array(buffer1.length + buffer2.length);
  newArray.set(buffer1, 0);
  newArray.set(buffer2, buffer1.length);
  return newArray;
}

export function concatDataViews(data1: DataView, data2: DataView) {
  let newBuffer = new ArrayBuffer(data1.byteLength + data2.byteLength);
  let newUint8Array = new Uint8Array(newBuffer);
  newUint8Array.set(new Uint8Array(data1.buffer), 0);
  newUint8Array.set(new Uint8Array(data2.buffer), data1.byteLength);
  return new DataView(newBuffer);
}
