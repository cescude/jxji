#!/usr/bin/env node

'use strict';

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

function foldleft(zero, arr, fn) {
  let result = zero;
  while ( arr.length ) {
    const el = arr.shift();
    result = fn(result, el);
  }
  return result;
}

function implode(obj, type, path, value) {
  if ( path.length === 0 ) {
  }
  else if ( path.length !== 1 ) {

    // Fuzzy create element;
    // abc.0 => make obj.abc an array
    // abc.def => make obj.abc an object
    if ( !obj.hasOwnProperty(path[0]) ) {
      obj[path[0]] = /^\d+$/.test(path[1]) ? [] : {};
    }
    
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

function compress_arrays(obj) {
  Object.keys(obj).forEach( key => {
    if ( obj[key] && typeof obj[key] === 'object' && obj[key].constructor === Array ) {
      const trimmed = [];
      Object.keys(obj[key]).forEach( k => {
        trimmed.push(obj[key][k])
      });
      obj[key] = trimmed;
    }

    if ( obj[key] && typeof obj[key] === 'object' ) {
      compress_arrays(obj[key]);
    }
  });
}

function implode_text(text, compress) {
  function split(str) {
      /(\S+)\s+(\S+)\s+(.*)/.test(str);
    return [RegExp.$1, RegExp.$2, RegExp.$3];
  }

  const lines = text.split('\n');
  const result = foldleft({}, lines, (obj, line) => {
    const fields = split(line);
    return implode(obj, fields[1], fields[0].split('.'), fields[2]);
  });

  if ( compress ) compress_arrays(result);
  
  console.log( JSON.stringify(result, undefined, 2) );
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

function explode_text(text, tab_separator) {
  const json = JSON.parse(text);
  const lines = explode('', json);
  lines.shift();
  lines.forEach( line => console.log([line.n.substr(1), line.t, line.v]
                                     .join(tab_separator ? '\t' : ' ')) );
}

read(process.stdin, text => {
  try {
    explode_text(text, process.argv.includes('-t'));
  }
  catch (e) {
    try {
      implode_text(text, process.argv.includes('-c'));
    }
    catch (e) {
      console.log(e);
    }
  }
});
