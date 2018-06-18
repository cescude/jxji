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

function explode(prefix, json) {
  if ( json === null ) {
    return [ { t: 'nul', n: prefix, v: null } ];
  }
  else if ( typeof json === 'object' && json.constructor === Array ) {
    return [ { t: 'arr', n: prefix, v: '' } ]
      .concat( flatmap(json, (el, idx) => explode(`${prefix}.${idx}`, el)) );
  }
  else if ( typeof json === 'object' ) {
    return [ { t: 'obj', n: prefix, v: '' } ]
      .concat( flatmap(Object.keys(json), (key) => explode(`${prefix}.${key}`, json[key]) ) );
  }
  else if ( typeof json === 'number' ) {
    return [ { t: 'num', n: prefix, v: json } ];
  }
  else if ( typeof json === 'boolean' ) {
    return [ { t: 'bln', n: prefix, v: json } ];
  }
  else if ( typeof json === 'string' ) {
    return [ { t: 'str', n: prefix, v: json } ];
  }

  return [ { t: '???', n: prefix, v: json } ];
}

read(process.stdin, text => {
  const json = JSON.parse(text);
  const lines = explode('', json);
  lines.shift();
  lines.forEach( line => console.log(`${line.n.substr(1)} ${line.t} ${line.v}`) );
});
