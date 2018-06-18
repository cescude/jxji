#!/usr/bin/env node

'use strict';

const fs = require('fs');

function read(inp, done) {
  new Promise(resolve => {
    const chunks = [];
    inp.setEncoding('utf8');
    inp.on('readable', () => {
      let chunk;
      while (chunk=inp.read())
        chunks.push(chunk);
    });
    inp.on('end', () => resolve(chunks.join('')));
  }).then(done);
}

function flatmap(arr, fn) {
  return Array.prototype.concat.apply([], arr.map(fn));
}

function implode(obj, type, path, value) {
  if ( path.length === 0 ) {
  }
  else if ( path.length !== 1 ) {
    implode(obj[path[0]], type, path.slice(1), value);
  }
  else if ( type === 'arr' ) {
    obj[path[0]] = [];
  }
  else if ( type === 'obj' ) {
    obj[path[0]] = {};
  }
  else if ( type === 'nul' ) {
    obj[path[0]] = null;
  }
  else if ( type === 'num' ) {
    obj[path[0]] = new Number(value);
  }
  else if ( type === 'bln' ) {
    obj[path[0]] = value === 'true';
  }
  else if ( type === 'str' ) {
    obj[path[0]] = value;
  }
  return obj;
}

function foldleft(zero, arr, fn) {
  let result = zero;
  while ( arr.length ) {
    const el = arr.shift();
    result = fn(result, el);
  }
  return result;
}

function split(str) {
  /(\S+)\s+(\S+)\s+(.*)/.test(str);
  return [RegExp.$1, RegExp.$2, RegExp.$3];
}


read(process.stdin, text => {
  const lines = text.split('\n');
  const result = foldleft({}, lines, (obj, line) => {
    const fields = split(line);
    return implode(obj, fields[1], fields[0].split('.'), fields[2]);
  });
  console.log(JSON.stringify(result));
});
