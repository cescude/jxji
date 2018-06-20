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

    $ cat test.json | jx
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

    $ cat test.json | jx | column -t
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

And you can turn it back into JSON by running it back through `jx`:

    $ cat test.json | jx | jx
    {"a":1,"b":[2,"yes this is a string",{"c":3,"reallylongkeyname":34.3,"d":false},null],"e":{}}

You can manipulate the data using `awk` and `sed` (and whatever else you'd
like). For example, to rename the `b` array:

    $ cat test.json | jx | sed 's/^b/p/' | column -t
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

    $ cat test.json | jx | sed 's/^b/p/' | sed '/^p.2.reallylongkeyname/d' | column -t
    a      num  1
    p      arr
    p.0    num  2
    p.1    str  indeed
    p.2    obj
    p.2.c  num  3
    p.2.d  bln  false
    p.3    nul  null
    e      obj

And then turn it back into JSON with `jx`:

    $ cat test.json | jx | sed 's/^b/p/'| sed '/^p.2.reallylongkeyname/d' | jx
    {"a":1,"p":[2,"indeed",{"c":3,"d":false},null],"e":{}}
    
# Installing

Clone the repo locally, then link `jx.js` and `ji.js` to someplace on your path:

    $ ln jx.js ~/bin/jx
    $ ln ji.js ~/bin/jx
