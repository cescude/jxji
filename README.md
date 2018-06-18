# Synopsis

Given some JSON input:

    $ cat test.json
    {
      "a": 1,
      "b": [
        2,
        "indeed",
        {
          "c": 3,
          "reallylongkeyname": 34.3,
          "d": false
        },
        null
      ],
      "e": {}
    }

You can "explode" it into `KEY TYPE DATA...` with `jx`, which shows the full
path on each line:

    $ cat test.json | node jx.js
    a num 1
    b arr
    b.0 num 2
    b.1 str indeed
    b.2 obj
    b.2.c num 3
    b.2.reallylongkeyname num 34.3
    b.2.d bln false
    b.3 nul null
    e obj

(pass through something like `column -t` to not have it mash together):

    $ cat test.json | node jx.js | column -t
    a                      num  1
    b                      arr
    b.0                    num  2
    b.1                    str  indeed
    b.2                    obj
    b.2.c                  num  3
    b.2.reallylongkeyname  num  34.3
    b.2.d                  bln  false
    b.3                    nul  null
    e                      obj

And you can turn it back into JSON by imploding with `ji`:

    $ cat test.json | node jx.js | node ji.js
    {"a":1,"b":[2,"yes this is a string",{"c":3,"reallylongkeyname":34.3,"d":false},null],"e":{}}

You can manipulate the data using `awk` and `sed` (and whatever else you'd
like). For example, to rename the `b` array

    $ cat test.json | node jx.js | sed 's/^b/p/' | column -t
    a                      num  1
    p                      arr
    p.0                    num  2
    p.1                    str  indeed 
    p.2                    obj
    p.2.c                  num  3
    p.2.reallylongkeyname  num  34.3
    p.2.d                  bln  false
    p.3                    nul  null
    e                      obj

You can then delete the really long key like so:

    $ cat test.json | node jx.js | sed 's/^b/p/' | sed '/^p.2.reallylongkeyname/d' | column -t
    a      num  1
    p      arr
    p.0    num  2
    p.1    str  indeed
    p.2    obj
    p.2.c  num  3
    p.2.d  bln  false
    p.3    nul  null
    e      obj

And then turn it back into JSON with `ji`:

    $ cat test.json | ./jx.js | sed 's/^b/p/'| sed '/^p.2.reallylongkeyname/d' | ./ji.js
    {"a":1,"p":[2,"indeed",{"c":3,"d":false},null],"e":{}}
    
