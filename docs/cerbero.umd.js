!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(e=e||self).cerbero=n()}(this,(function(){"use strict";
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */var e=function(){return(e=Object.assign||function(e){for(var n,t=1,r=arguments.length;t<r;t++)for(var o in n=arguments[t])Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o]);return e}).apply(this,arguments)};const n="[object process]"===Object.prototype.toString.call("undefined"!=typeof process?process:0)&&"function"==typeof module.require?module.require:null;var t=function(e){if(n){const t=n("worker_threads").Worker;return function(n){return new t(e,n)}}return function(n){return new Worker(e,n)}}("web-worker-0.js");return new function(){var n=this;if(this.textEncoder=new TextEncoder,this.formatEvent=function(n){var t={};for(var r in n)n[r]instanceof window.InputDeviceCapabilities||"function"==typeof n[r]?t[r]=null:n[r]instanceof Node?t[r]="Node":n[r]instanceof Window?t[r]="Window":t[r]=n[r];return t.path=null,e({},t)},this.sendToWorker=function(e,t,r){void 0===r&&(r=!1);var o=r?n.formatEvent(t):t;o=n.textEncoder.encode(JSON.stringify(o)),n.cerberoWorker.postMessage({type:e,event:o})},this.initListener=function(){document.addEventListener("click",(function(e){return n.sendToWorker("click",e,!0)}))},"undefined"==typeof Worker)return null;this.cerberoWorker=new t,this.initListener=this.initListener.bind(this),this.sendToWorker=this.sendToWorker.bind(this),this.formatEvent=this.formatEvent.bind(this),this.sendToWorker("performance",window.performance),this.initListener()}}));
