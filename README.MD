<div align="center">
  <a href="https://github.com/thecreazy/cerbero">
    <img src="https://github.com/thecreazy/cerbero/blob/master/docs/logo.png" alt="Icon" width="300"/>
  </a>
  <br>
  <br>
</div>

[![npm][npm]][npm-url]
[![codecov][codecov]][repo-url] [![CI - Test][citest]][repo-url]
[![GitHub license][githublicense]][license-url] [![Open Source Love svg1][opensource]][opensource-url]

# 🐾 Cerbero 

Cerbero is a simply js library that gives you the ability to track everything your users are doing on your web page. Furthermore, Cerbero, is designed to weigh as little as possible on the main thread by delegating the most complex computations to a webworker.

## Table of Contents

1. [Install](#install)
2. [Usage](#usage)
3. [Contributing](#contributing)
4. [Contributors](#contributors)
5. [License](#license)

<h2 align="center" id="install">Install</h2>
You can download Cerbero directly from npm/yarn

```bash
yarn add cerbero
```

Or include it from a cdn

```html
<script src="https://unpkg.com/cerbero@1.0.0/dist/cerbero.umd.js"></script>
```

<h2 align="center" id="usage">Usage</h2>
Use cerbero is really simple. After installing it, enter in your code the listner.

```javascript
import cerbero from "cerbero";

cerbero.addEventListner((event) => {
  JSON.stringify(event);
});
```

You can also set the following properties
<table>setTimeInPageInterval
<thead>
   <tr>
   <td>Function</td>
   <td>Receive</td>
   <td>Default</td>
   <td>Usage</td>
   </tr>
</thead>
<tbody>
    <tr>
      <td>
      setTimeInPageInterval(Number)
      </td>
      <td>
        Number
      </td>
      <td>
        2500
      </td>
      <td>
        Change the interval to receive the <b>timeInPage</b> event
      </td>
      </tr>
</tbody>
</table>

The events received may be the following:

**1. timeInPage**

Example
```json
{
   "type":"timeInPage",
   "time":1611403802219,
   "data":{
      "timePassed":69564
   }
}
```

**2. selection**

Example
```json
{
   "type":"selection",
   "time":1611404033755,
   "after":301101,
   "data":{
      "text":"These three method",
      "elements":{
         "anchorNode":{
            "type":"#text",
            "domType":"Text",
            "identifier":"#text",
            "domStructure":" > html > body > div#root > div > article > div > section > div > div > div#dd1f > p > mark > #text",
            "position":{
               
            },
            "data":"These three methods are ",
            "wholeText":"These three methods are ",
            "nodeValue":"These three methods are ",
            "textContent":"These three methods are ",
            "offset":0
         },
         "focusNode":{
            "type":"#text",
            "domType":"Text",
            "identifier":"#text",
            "domStructure":" > html > body > div#root > div > article > div > section > div > div > div#dd1f > p > mark > #text",
            "position":{
               
            },
            "data":"These three methods are ",
            "wholeText":"These three methods are ",
            "nodeValue":"These three methods are ",
            "textContent":"These three methods are ",
            "offset":18
         },
         "baseNode":{
            "type":"#text",
            "domType":"Text",
            "identifier":"#text",
            "domStructure":" > html > body > div#root > div > article > div > section > div > div > div#dd1f > p > mark > #text",
            "position":{
               
            },
            "data":"These three methods are ",
            "wholeText":"These three methods are ",
            "nodeValue":"These three methods are ",
            "textContent":"These three methods are ",
            "offset":0
         },
         "extentNode":{
            "type":"#text",
            "domType":"Text",
            "identifier":"#text",
            "domStructure":" > html > body > div#root > div > article > div > section > div > div > div#dd1f > p > mark > #text",
            "position":{
               
            },
            "data":"These three methods are ",
            "wholeText":"These three methods are ",
            "nodeValue":"These three methods are ",
            "textContent":"These three methods are ",
            "offset":18
         }
      }
   }
}
```

**3. scroll**

Example
```json
{
   "type":"scroll",
   "time":1611403973496,
   "after":240842,
   "data":{
      "scroll":{
         "fromTop":5608,
         "domHeight":10693,
         "percentage":53
      },
      "elements":{
         "srcElement":{
            "type":"#document",
            "domType":"HTMLDocument",
            "identifier":"#document",
            "domStructure":" > #document",
            "position":{
               
            }
         },
         "target":{
            "type":"#document",
            "domType":"HTMLDocument",
            "identifier":"#document",
            "domStructure":" > #document",
            "position":{
               
            }
         }
      }
   }
}
```

**4. mouseExit**

Example
```json
{
   "type":"mouseExit",
   "time":1611403836778,
   "after":104124,
   "data":{
      "position":{
         "screenX":744,
         "screenY":694,
         "clientX":744,
         "clientY":614,
         "pageX":744,
         "pageY":2470,
         "x":744,
         "y":614,
         "offsetX":124,
         "offsetY":239
      },
      "keys":{
         "ctrlKey":false,
         "shiftKey":false,
         "altKey":false,
         "metaKey":false
      },
      "elements":{
         "fromElement":{
            "id":"",
            "name":"",
            "className":"pb sk s t u hr ai ib",
            "type":"IMG",
            "domType":"HTMLImageElement",
            "identifier":"img",
            "domStructure":" > html > body > div#root > div > article > div > section > div > div > figure > div > div > div > div > img",
            "position":{
               "x":620,
               "y":375.171875,
               "width":680,
               "height":661.859375,
               "top":375.171875,
               "right":1300,
               "bottom":1037.03125,
               "left":620
            }
         }
      }
   }
}
```

**5. performance**

Example
```json
{
   "type":"performance",
   "time":1611403732932,
   "data":{
      "timing":{
         "navigationStart":1611403731806,
         "unloadEventStart":1611403731816,
         "unloadEventEnd":1611403731816,
         "redirectStart":0,
         "redirectEnd":0,
         "fetchStart":1611403731806,
         "domainLookupStart":1611403731809,
         "domainLookupEnd":1611403731809,
         "connectStart":1611403731809,
         "connectEnd":1611403731809,
         "secureConnectionStart":0,
         "requestStart":1611403731809,
         "responseStart":1611403731812,
         "responseEnd":1611403731885,
         "domLoading":1611403731827,
         "domInteractive":0,
         "domContentLoadedEventStart":0,
         "domContentLoadedEventEnd":0,
         "domComplete":0,
         "loadEventStart":0,
         "loadEventEnd":0
      },
      "navigation":{
         
      }
   }
}
```

**6. click**

Example
```json
{
   "type":"click",
   "time":1611403891403,
   "after":158749,
   "data":{
      "position":{
         "screenX":752,
         "screenY":244,
         "clientX":752,
         "clientY":164,
         "pageX":752,
         "pageY":3609,
         "x":752,
         "y":164,
         "offsetX":388,
         "offsetY":414
      },
      "keys":{
         "ctrlKey":false,
         "shiftKey":false,
         "altKey":false,
         "metaKey":false
      },
      "elements":{
         "target":{
            "id":"",
            "name":"",
            "className":"hp hq s t u hr ai ib",
            "type":"IMG",
            "domType":"HTMLImageElement",
            "identifier":"img",
            "domStructure":" > html > body > div#root > div > article > div > section > div > div > div > figure > div > div > div > div > img",
            "position":{
               "x":364,
               "y":-249.90625,
               "width":1192,
               "height":626.765625,
               "top":-249.90625,
               "right":1556,
               "bottom":376.859375,
               "left":364
            }
         }
      }
   }
}
```




<h2 align="center" id="contributing">Contributing</h2>

#### **Reporting bugs**

- Open a GitHub issue

#### **Contributing with patches and bug fixes**

- Open a new GitHub pull request with the patch.
- Ensure the PR description clearly describes the problem and solution.

<h2 align="center" id="contributors">Contributors</h2>
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="150" height="150" src="https://github.com/thecreazy.png?s=150">
        <br>
        <a href="https://github.com/thecreazy">Thecreazy</a>
        <p>Core</p>
      </td>
      <td align="center" valign="top">
        <img width="150" height="150" src="https://github.com/TheBous.png?s=150">
        <br>
        <a href="https://github.com/TheBous">TheBous</a>
        <p>Core</p>
      </td>
     </tr>
  </tbody>
</table>

<h2 align="center" id="license">License</h2>

[MIT][license-url]


[npm]: https://img.shields.io/npm/v/cerbero.svg
[npm-url]: https://npmjs.com/package/cerbero
[codecov]: https://codecov.io/gh/thecreazy/cerbero/branch/master/graph/badge.svg?token=ZCLT8ZZ9RH
[repo-url]: https://github.com/thecreazy/cerbero
[citest]: https://github.com/thecreazy/cerbero/workflows/CI%20-%20Test/badge.svg?branch=master
[githublicense]: https://img.shields.io/github/license/Naereen/StrapDown.js.svg
[license-url]: https://github.com/thecreazy/cerbero/blob/master/LICENSE.MD
[opensource]: https://badges.frapsoft.com/os/v1/open-source.svg?v=103
[opensource-url]: https://github.com/ellerbrock/open-source-badges/