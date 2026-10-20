"use strict";
(globalThis["webpackChunkdocs"] = globalThis["webpackChunkdocs"] || []).push([[52723],{

/***/ 74139
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  MaxResolution: () => (/* reexport */ dist_rr),
  MediaError: () => (/* reexport */ f),
  MinResolution: () => (/* reexport */ dist_nr),
  RenditionOrder: () => (/* reexport */ dist_or),
  "default": () => (/* binding */ mux_player_react_dist_ze),
  generatePlayerInitTime: () => (/* reexport */ dist_Gr),
  playerSoftwareName: () => (/* binding */ dist_fe),
  playerSoftwareVersion: () => (/* binding */ mux_player_react_dist_de)
});

// EXTERNAL MODULE: ../node_modules/react/index.js
var react = __webpack_require__(63696);
;// ../node_modules/@mux/playback-core/node_modules/mux-embed/dist/mux.mjs
var Zr=Object.create;var _t=Object.defineProperty;var ea=Object.getOwnPropertyDescriptor;var ta=Object.getOwnPropertyNames;var ra=Object.getPrototypeOf,aa=Object.prototype.hasOwnProperty;var ft=function(r,e){return function(){return r&&(e=r(r=0)),e}};var B=function(r,e){return function(){return e||r((e={exports:{}}).exports,e),e.exports}};var ia=function(r,e,t,i){if(e&&typeof e=="object"||typeof e=="function")for(var a=ta(e),n=0,o=a.length,s;n<o;n++)s=a[n],!aa.call(r,s)&&s!==t&&_t(r,s,{get:function(u){return e[u]}.bind(null,s),enumerable:!(i=ea(e,s))||i.enumerable});return r};var G=function(r,e,t){return t=r!=null?Zr(ra(r)):{},ia(e||!r||!r.__esModule?_t(t,"default",{value:r,enumerable:!0}):t,r)};var Q=B(function(Xi,ht){var xe;typeof window!="undefined"?xe=window:typeof globalThis!="undefined"?xe=globalThis:typeof self!="undefined"?xe=self:xe={};ht.exports=xe});function U(r,e){return e!=null&&typeof Symbol!="undefined"&&e[Symbol.hasInstance]?!!e[Symbol.hasInstance](r):U(r,e)}var te=ft(function(){te()});function Le(r){"@swc/helpers - typeof";return r&&typeof Symbol!="undefined"&&r.constructor===Symbol?"symbol":typeof r}var Je=ft(function(){});var Ke=B(function(Ss,cr){var lr=Array.prototype.slice;cr.exports=La;function La(r,e){for(("length"in r)||(r=[r]),r=lr.call(r);r.length;){var t=r.shift(),i=e(t);if(i)return i;t.childNodes&&t.childNodes.length&&(r=lr.call(t.childNodes).concat(r))}}});var fr=B(function(Rs,_r){te();_r.exports=ve;function ve(r,e){if(!U(this,ve))return new ve(r,e);this.data=r,this.nodeValue=r,this.length=r.length,this.ownerDocument=e||null}ve.prototype.nodeType=8;ve.prototype.nodeName="#comment";ve.prototype.toString=function(){return"[object Comment]"}});var mr=B(function(Ps,pr){te();pr.exports=ae;function ae(r,e){if(!U(this,ae))return new ae(r);this.data=r||"",this.length=this.data.length,this.ownerDocument=e||null}ae.prototype.type="DOMTextNode";ae.prototype.nodeType=3;ae.prototype.nodeName="#text";ae.prototype.toString=function(){return this.data};ae.prototype.replaceData=function(e,t,i){var a=this.data,n=a.substring(0,e),o=a.substring(e+t,a.length);this.data=n+i+o,this.length=this.data.length}});var Ye=B(function(Os,vr){vr.exports=Na;function Na(r){var e=this,t=r.type;r.target||(r.target=e),e.listeners||(e.listeners={});var i=e.listeners[t];if(i)return i.forEach(function(a){r.currentTarget=e,typeof a=="function"?a(r):a.handleEvent(r)});e.parentNode&&e.parentNode.dispatchEvent(r)}});var Xe=B(function(Is,hr){hr.exports=Ca;function Ca(r,e){var t=this;t.listeners||(t.listeners={}),t.listeners[r]||(t.listeners[r]=[]),t.listeners[r].indexOf(e)===-1&&t.listeners[r].push(e)}});var $e=B(function(Ls,yr){yr.exports=Ma;function Ma(r,e){var t=this;if(t.listeners&&t.listeners[r]){var i=t.listeners[r],a=i.indexOf(e);a!==-1&&i.splice(a,1)}}});var Tr=B(function(Cs,wr){Je();wr.exports=gr;var Ha=["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr"];function gr(r){switch(r.nodeType){case 3:return Ze(r.data);case 8:return"<!--"+r.data+"-->";default:return Ba(r)}}function Ba(r){var e=[],t=r.tagName;return r.namespaceURI==="http://www.w3.org/1999/xhtml"&&(t=t.toLowerCase()),e.push("<"+t+ja(r)+Va(r)),Ha.indexOf(t)>-1?e.push(" />"):(e.push(">"),r.childNodes.length?e.push.apply(e,r.childNodes.map(gr)):r.textContent||r.innerText?e.push(Ze(r.textContent||r.innerText)):r.innerHTML&&e.push(r.innerHTML),e.push("</"+t+">")),e.join("")}function Ua(r,e){var t=Le(r[e]);return e==="style"&&Object.keys(r.style).length>0?!0:r.hasOwnProperty(e)&&(t==="string"||t==="boolean"||t==="number")&&e!=="nodeName"&&e!=="className"&&e!=="tagName"&&e!=="textContent"&&e!=="innerText"&&e!=="namespaceURI"&&e!=="innerHTML"}function Fa(r){if(typeof r=="string")return r;var e="";return Object.keys(r).forEach(function(t){var i=r[t];t=t.replace(/[A-Z]/g,function(a){return"-"+a.toLowerCase()}),e+=t+":"+i+";"}),e}function Va(r){var e=r.dataset,t=[];for(var i in e)t.push({name:"data-"+i,value:e[i]});return t.length?br(t):""}function br(r){var e=[];return r.forEach(function(t){var i=t.name,a=t.value;i==="style"&&(a=Fa(a)),e.push(i+'="'+Wa(a)+'"')}),e.length?" "+e.join(" "):""}function ja(r){var e=[];for(var t in r)Ua(r,t)&&e.push({name:t,value:r[t]});for(var i in r._attributes)for(var a in r._attributes[i]){var n=r._attributes[i][a],o=(n.prefix?n.prefix+":":"")+a;e.push({name:o,value:n.value})}return r.className&&e.push({name:"class",value:r.className}),e.length?br(e):""}function Ze(r){var e="";return typeof r=="string"?e=r:r&&(e=r.toString()),e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Wa(r){return Ze(r).replace(/"/g,"&quot;")}});var tt=B(function(Hs,kr){te();var et=Ke(),Ga=Ye(),Ja=Xe(),Qa=$e(),za=Tr(),Er="http://www.w3.org/1999/xhtml";kr.exports=I;function I(r,e,t){if(!U(this,I))return new I(r);var i=t===void 0?Er:t||null;this.tagName=i===Er?String(r).toUpperCase():r,this.nodeName=this.tagName,this.className="",this.dataset={},this.childNodes=[],this.parentNode=null,this.style={},this.ownerDocument=e||null,this.namespaceURI=i,this._attributes={},this.tagName==="INPUT"&&(this.type="text")}I.prototype.type="DOMElement";I.prototype.nodeType=1;I.prototype.appendChild=function(e){return e.parentNode&&e.parentNode.removeChild(e),this.childNodes.push(e),e.parentNode=this,e};I.prototype.replaceChild=function(e,t){e.parentNode&&e.parentNode.removeChild(e);var i=this.childNodes.indexOf(t);return t.parentNode=null,this.childNodes[i]=e,e.parentNode=this,t};I.prototype.removeChild=function(e){var t=this.childNodes.indexOf(e);return this.childNodes.splice(t,1),e.parentNode=null,e};I.prototype.insertBefore=function(e,t){e.parentNode&&e.parentNode.removeChild(e);var i=t==null?-1:this.childNodes.indexOf(t);return i>-1?this.childNodes.splice(i,0,e):this.childNodes.push(e),e.parentNode=this,e};I.prototype.setAttributeNS=function(e,t,i){var a=null,n=t,o=t.indexOf(":");if(o>-1&&(a=t.substr(0,o),n=t.substr(o+1)),this.tagName==="INPUT"&&t==="type")this.type=i;else{var s=this._attributes[e]||(this._attributes[e]={});s[n]={value:i,prefix:a}}};I.prototype.getAttributeNS=function(e,t){var i=this._attributes[e],a=i&&i[t]&&i[t].value;return this.tagName==="INPUT"&&t==="type"?this.type:typeof a!="string"?null:a};I.prototype.removeAttributeNS=function(e,t){var i=this._attributes[e];i&&delete i[t]};I.prototype.hasAttributeNS=function(e,t){var i=this._attributes[e];return!!i&&t in i};I.prototype.setAttribute=function(e,t){return this.setAttributeNS(null,e,t)};I.prototype.getAttribute=function(e){return this.getAttributeNS(null,e)};I.prototype.removeAttribute=function(e){return this.removeAttributeNS(null,e)};I.prototype.hasAttribute=function(e){return this.hasAttributeNS(null,e)};I.prototype.removeEventListener=Qa;I.prototype.addEventListener=Ja;I.prototype.dispatchEvent=Ga;I.prototype.focus=function(){};I.prototype.toString=function(){return za(this)};I.prototype.getElementsByClassName=function(e){var t=e.split(" "),i=[];return et(this,function(a){if(a.nodeType===1){var n=a.className||"",o=n.split(" ");t.every(function(s){return o.indexOf(s)!==-1})&&i.push(a)}}),i};I.prototype.getElementsByTagName=function(e){e=e.toLowerCase();var t=[];return et(this.childNodes,function(i){i.nodeType===1&&(e==="*"||i.tagName.toLowerCase()===e)&&t.push(i)}),t};I.prototype.contains=function(e){return et(this,function(t){return e===t})||!1}});var Dr=B(function(Us,xr){te();var rt=tt();xr.exports=K;function K(r){if(!U(this,K))return new K;this.childNodes=[],this.parentNode=null,this.ownerDocument=r||null}K.prototype.type="DocumentFragment";K.prototype.nodeType=11;K.prototype.nodeName="#document-fragment";K.prototype.appendChild=rt.prototype.appendChild;K.prototype.replaceChild=rt.prototype.replaceChild;K.prototype.removeChild=rt.prototype.removeChild;K.prototype.toString=function(){return this.childNodes.map(function(e){return String(e)}).join("")}});var qr=B(function(Fs,Sr){Sr.exports=at;function at(r){}at.prototype.initEvent=function(e,t,i){this.type=e,this.bubbles=t,this.cancelable=i};at.prototype.preventDefault=function(){}});var Ar=B(function(js,Rr){te();var Ka=Ke(),Ya=fr(),Xa=mr(),qe=tt(),$a=Dr(),Za=qr(),ei=Ye(),ti=Xe(),ri=$e();Rr.exports=Be;function Be(){if(!U(this,Be))return new Be;this.head=this.createElement("head"),this.body=this.createElement("body"),this.documentElement=this.createElement("html"),this.documentElement.appendChild(this.head),this.documentElement.appendChild(this.body),this.childNodes=[this.documentElement],this.nodeType=9}var j=Be.prototype;j.createTextNode=function(e){return new Xa(e,this)};j.createElementNS=function(e,t){var i=e===null?null:String(e);return new qe(t,this,i)};j.createElement=function(e){return new qe(e,this)};j.createDocumentFragment=function(){return new $a(this)};j.createEvent=function(e){return new Za(e)};j.createComment=function(e){return new Ya(e,this)};j.getElementById=function(e){e=String(e);var t=Ka(this.childNodes,function(i){if(String(i.id)===e)return i});return t||null};j.getElementsByClassName=qe.prototype.getElementsByClassName;j.getElementsByTagName=qe.prototype.getElementsByTagName;j.contains=qe.prototype.contains;j.removeEventListener=ri;j.addEventListener=ti;j.dispatchEvent=ei});var Or=B(function(Ws,Pr){var ai=Ar();Pr.exports=new ai});var it=B(function(Gs,Lr){var Ir=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:{},ii=Or(),Re;typeof document!="undefined"?Re=document:(Re=Ir["__GLOBAL_DOCUMENT_CACHE@4"],Re||(Re=Ir["__GLOBAL_DOCUMENT_CACHE@4"]=ii));Lr.exports=Re});function pt(r){if(Array.isArray(r))return r}function mt(r,e){var t=r==null?null:typeof Symbol!="undefined"&&r[Symbol.iterator]||r["@@iterator"];if(t!=null){var i=[],a=!0,n=!1,o,s;try{for(t=t.call(r);!(a=(o=t.next()).done)&&(i.push(o.value),!(e&&i.length===e));a=!0);}catch(u){n=!0,s=u}finally{try{!a&&t.return!=null&&t.return()}finally{if(n)throw s}}return i}}function vt(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function ke(r,e){(e==null||e>r.length)&&(e=r.length);for(var t=0,i=new Array(e);t<e;t++)i[t]=r[t];return i}function Ae(r,e){if(r){if(typeof r=="string")return ke(r,e);var t=Object.prototype.toString.call(r).slice(8,-1);if(t==="Object"&&r.constructor&&(t=r.constructor.name),t==="Map"||t==="Set")return Array.from(t);if(t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return ke(r,e)}}function H(r,e){return pt(r)||mt(r,e)||Ae(r,e)||vt()}var be=G(Q());var Ge=G(Q());var yt=G(Q()),na={now:function(){var r=yt.default.performance,e=r&&r.timing,t=e&&e.navigationStart,i=typeof t=="number"&&typeof r.now=="function"?t+r.now():Date.now();return Math.round(i)}},A=na;var ee=function(){var e,t,i;if(typeof((e=Ge.default.crypto)===null||e===void 0?void 0:e.getRandomValues)=="function"){i=new Uint8Array(32),Ge.default.crypto.getRandomValues(i);for(var a=0;a<32;a++)i[a]=i[a]%16}else{i=[];for(var n=0;n<32;n++)i[n]=Math.random()*16|0}var o=0;t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(f){var g=f==="x"?i[o]:i[o]&3|8;return o++,g.toString(16)});var s=A.now(),u=s==null?void 0:s.toString(16).substring(3);return u?t.substring(0,28)+u:t},Pe=function(){return("000000"+(Math.random()*Math.pow(36,6)<<0).toString(36)).slice(-6)};var J=function(e){if(e&&typeof e.nodeName!="undefined")return e.muxId||(e.muxId=Pe()),e.muxId;var t;try{t=document.querySelector(e)}catch(i){}return t&&!t.muxId&&(t.muxId=e),(t==null?void 0:t.muxId)||e},se=function(e){var t;e&&typeof e.nodeName!="undefined"?(t=e,e=J(t)):t=document.querySelector(e);var i=t&&t.nodeName?t.nodeName.toLowerCase():"";return[t,e,i]};function gt(r){if(Array.isArray(r))return ke(r)}function bt(r){if(typeof Symbol!="undefined"&&r[Symbol.iterator]!=null||r["@@iterator"]!=null)return Array.from(r)}function wt(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function V(r){return gt(r)||bt(r)||Ae(r)||wt()}var Y={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},Tt=function(r){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:3,t,i,a,n,o,s=r?[console,r]:[console],u=(t=console.trace).bind.apply(t,V(s)),f=(i=console.info).bind.apply(i,V(s)),g=(a=console.debug).bind.apply(a,V(s)),k=(n=console.warn).bind.apply(n,V(s)),h=(o=console.error).bind.apply(o,V(s)),c=e;return{trace:function(){for(var w=arguments.length,x=new Array(w),v=0;v<w;v++)x[v]=arguments[v];if(!(c>Y.TRACE))return u.apply(void 0,V(x))},debug:function(){for(var w=arguments.length,x=new Array(w),v=0;v<w;v++)x[v]=arguments[v];if(!(c>Y.DEBUG))return g.apply(void 0,V(x))},info:function(){for(var w=arguments.length,x=new Array(w),v=0;v<w;v++)x[v]=arguments[v];if(!(c>Y.INFO))return f.apply(void 0,V(x))},warn:function(){for(var w=arguments.length,x=new Array(w),v=0;v<w;v++)x[v]=arguments[v];if(!(c>Y.WARN))return k.apply(void 0,V(x))},error:function(){for(var w=arguments.length,x=new Array(w),v=0;v<w;v++)x[v]=arguments[v];if(!(c>Y.ERROR))return h.apply(void 0,V(x))},get level(){return c},set level(m){m!==this.level&&(c=m!=null?m:e)}}};var R=Tt("[mux]");var Oe=G(Q());function ce(){var r=Oe.default.doNotTrack||Oe.default.navigator&&Oe.default.navigator.doNotTrack;return r==="1"}function b(r){if(r===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return r}te();function D(r,e){if(!U(r,e))throw new TypeError("Cannot call a class as a function")}function Et(r,e){for(var t=0;t<e.length;t++){var i=e[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(r,i.key,i)}}function N(r,e,t){return e&&Et(r.prototype,e),t&&Et(r,t),r}function l(r,e,t){return e in r?Object.defineProperty(r,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):r[e]=t,r}function X(r){return X=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},X(r)}function kt(r,e){for(;!Object.prototype.hasOwnProperty.call(r,e)&&(r=X(r),r!==null););return r}function De(r,e,t){return typeof Reflect!="undefined"&&Reflect.get?De=Reflect.get:De=function(a,n,o){var s=kt(a,n);if(s){var u=Object.getOwnPropertyDescriptor(s,n);return u.get?u.get.call(o||a):u.value}},De(r,e,t||r)}function Ie(r,e){return Ie=Object.setPrototypeOf||function(i,a){return i.__proto__=a,i},Ie(r,e)}function xt(r,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function");r.prototype=Object.create(e&&e.prototype,{constructor:{value:r,writable:!0,configurable:!0}}),e&&Ie(r,e)}function Dt(r,e){if(r==null)return{};var t={},i=Object.keys(r),a,n;for(n=0;n<i.length;n++)a=i[n],!(e.indexOf(a)>=0)&&(t[a]=r[a]);return t}function St(r,e){if(r==null)return{};var t=Dt(r,e),i,a;if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(r);for(a=0;a<n.length;a++)i=n[a],!(e.indexOf(i)>=0)&&Object.prototype.propertyIsEnumerable.call(r,i)&&(t[i]=r[i])}return t}function qt(){if(typeof Reflect=="undefined"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(r){return!1}}Je();function Rt(r,e){return e&&(Le(e)==="object"||typeof e=="function")?e:b(r)}function At(r){var e=qt();return function(){var i=X(r),a;if(e){var n=X(this).constructor;a=Reflect.construct(i,arguments,n)}else a=i.apply(this,arguments);return Rt(this,a)}}var F=function(r){return re(r)[0]};var re=function(r){if(typeof r!="string"||r==="")return["localhost"];var e=/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,t=r.match(e)||[],i=t[4],a;return i&&(a=(i.match(/[^\.]+\.[^\.]+$/)||[])[0]),[i,a]};var Ne=G(Q()),oa={exists:function(){var r=Ne.default.performance,e=r&&r.timing;return e!==void 0},domContentLoadedEventEnd:function(){var r=Ne.default.performance,e=r&&r.timing;return e&&e.domContentLoadedEventEnd},navigationStart:function(){var r=Ne.default.performance,e=r&&r.timing;return e&&e.navigationStart}},_e=oa;function P(r,e,t){t=t===void 0?1:t,r[e]=r[e]||0,r[e]+=t}function ue(r){for(var e=1;e<arguments.length;e++){var t=arguments[e]!=null?arguments[e]:{},i=Object.keys(t);typeof Object.getOwnPropertySymbols=="function"&&(i=i.concat(Object.getOwnPropertySymbols(t).filter(function(a){return Object.getOwnPropertyDescriptor(t,a).enumerable}))),i.forEach(function(a){l(r,a,t[a])})}return r}function sa(r,e){var t=Object.keys(r);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(r);e&&(i=i.filter(function(a){return Object.getOwnPropertyDescriptor(r,a).enumerable})),t.push.apply(t,i)}return t}function fe(r,e){return e=e!=null?e:{},Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(e)):sa(Object(e)).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(e,t))}),r}var ua=["x-cdn","content-type"],Pt=["x-request-id","cf-ray","x-amz-cf-id","x-akamai-request-id"],da=ua.concat(Pt);function pe(r){r=r||"";var e={},t=r.trim().split(/[\r\n]+/);return t.forEach(function(i){if(i){var a=i.split(": "),n=a.shift();n&&(da.indexOf(n.toLowerCase())>=0||n.toLowerCase().indexOf("x-litix-")===0)&&(e[n]=a.join(": "))}}),e}function de(r){if(r){var e=Pt.find(function(t){return r[t]!==void 0});return e?r[e]:void 0}}var la=function(r){var e={};for(var t in r){var i=r[t],a=i["DATA-ID"].search("io.litix.data.");if(a!==-1){var n=i["DATA-ID"].replace("io.litix.data.","");e[n]=i.VALUE}}return e},Ce=la;var Me=function(r){if(!r)return{};var e=_e.navigationStart(),t=r.loading,i=t?t.start:r.trequest,a=t?t.first:r.tfirst,n=t?t.end:r.tload;return{bytesLoaded:r.total,requestStart:Math.round(e+i),responseStart:Math.round(e+a),responseEnd:Math.round(e+n)}},Se=function(r){if(!(!r||typeof r.getAllResponseHeaders!="function"))return pe(r.getAllResponseHeaders())},Ot=function(r,e,t){var i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},a=arguments.length>4?arguments[4]:void 0,n=r.log,o=r.utils.secondsToMs,s=function(v){var p=parseInt(a.version),_;return p===1&&v.programDateTime!==null&&(_=v.programDateTime),p===0&&v.pdt!==null&&(_=v.pdt),_};if(!_e.exists()){n.warn("performance timing not supported. Not tracking HLS.js.");return}var u=function(v,p){return r.emit(e,v,p)},f=function(v,p){var _=p.levels,d=p.audioTracks,y=p.url,T=p.stats,E=p.networkDetails,S=p.sessionData,L={},M={};_.forEach(function(W,oe){L[oe]={width:W.width,height:W.height,bitrate:W.bitrate,attrs:W.attrs}}),d.forEach(function(W,oe){M[oe]={name:W.name,language:W.lang,bitrate:W.bitrate}});var O=Me(T),q=O.bytesLoaded,Z=O.requestStart,we=O.responseStart,Te=O.responseEnd;u("requestcompleted",fe(ue({},Ce(S)),{request_event_type:v,request_bytes_loaded:q,request_start:Z,request_response_start:we,request_response_end:Te,request_type:"manifest",request_hostname:F(y),request_response_headers:Se(E),request_rendition_lists:{media:L,audio:M,video:{}}}))};t.on(a.Events.MANIFEST_LOADED,f);var g=function(v,p){var _=p.details,d=p.level,y=p.networkDetails,T=p.stats,E=Me(T),S=E.bytesLoaded,L=E.requestStart,M=E.responseStart,O=E.responseEnd,q=_.fragments[_.fragments.length-1],Z=s(q)+o(q.duration);u("requestcompleted",{request_event_type:v,request_bytes_loaded:S,request_start:L,request_response_start:M,request_response_end:O,request_current_level:d,request_type:"manifest",request_hostname:F(_.url),request_response_headers:Se(y),video_holdback:_.holdBack&&o(_.holdBack),video_part_holdback:_.partHoldBack&&o(_.partHoldBack),video_part_target_duration:_.partTarget&&o(_.partTarget),video_target_duration:_.targetduration&&o(_.targetduration),video_source_is_live:_.live,player_manifest_newest_program_time:isNaN(Z)?void 0:Z})};t.on(a.Events.LEVEL_LOADED,g);var k=function(v,p){var _=p.details,d=p.networkDetails,y=p.stats,T=Me(y),E=T.bytesLoaded,S=T.requestStart,L=T.responseStart,M=T.responseEnd;u("requestcompleted",{request_event_type:v,request_bytes_loaded:E,request_start:S,request_response_start:L,request_response_end:M,request_type:"manifest",request_hostname:F(_.url),request_response_headers:Se(d)})};t.on(a.Events.AUDIO_TRACK_LOADED,k);var h=function(v,p){var _=p.stats,d=p.networkDetails,y=p.frag;_=_||y.stats;var T=Me(_),E=T.bytesLoaded,S=T.requestStart,L=T.responseStart,M=T.responseEnd,O=d?Se(d):void 0,q={request_event_type:v,request_bytes_loaded:E,request_start:S,request_response_start:L,request_response_end:M,request_hostname:d?F(d.responseURL):void 0,request_id:O?de(O):void 0,request_response_headers:O,request_media_duration:y.duration,request_url:d==null?void 0:d.responseURL};y.type==="main"?(q.request_type="media",q.request_current_level=y.level,q.request_video_width=(t.levels[y.level]||{}).width,q.request_video_height=(t.levels[y.level]||{}).height,q.request_labeled_bitrate=(t.levels[y.level]||{}).bitrate):q.request_type=y.type,u("requestcompleted",q)};t.on(a.Events.FRAG_LOADED,h);var c=function(v,p){var _=p.frag,d=_.start,y=s(_),T={currentFragmentPDT:y,currentFragmentStart:o(d)};u("fragmentchange",T)};t.on(a.Events.FRAG_CHANGED,c);var m=function(v,p){var _=p.type,d=p.details,y=p.response,T=p.fatal,E=p.frag,S=p.networkDetails,L=(E==null?void 0:E.url)||p.url||"",M=S?Se(S):void 0;if((d===a.ErrorDetails.MANIFEST_LOAD_ERROR||d===a.ErrorDetails.MANIFEST_LOAD_TIMEOUT||d===a.ErrorDetails.FRAG_LOAD_ERROR||d===a.ErrorDetails.FRAG_LOAD_TIMEOUT||d===a.ErrorDetails.LEVEL_LOAD_ERROR||d===a.ErrorDetails.LEVEL_LOAD_TIMEOUT||d===a.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||d===a.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT||d===a.ErrorDetails.SUBTITLE_LOAD_ERROR||d===a.ErrorDetails.SUBTITLE_LOAD_TIMEOUT||d===a.ErrorDetails.KEY_LOAD_ERROR||d===a.ErrorDetails.KEY_LOAD_TIMEOUT)&&u("requestfailed",{request_error:d,request_url:L,request_hostname:F(L),request_id:M?de(M):void 0,request_type:d===a.ErrorDetails.FRAG_LOAD_ERROR||d===a.ErrorDetails.FRAG_LOAD_TIMEOUT?"media":d===a.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||d===a.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT?"audio":d===a.ErrorDetails.SUBTITLE_LOAD_ERROR||d===a.ErrorDetails.SUBTITLE_LOAD_TIMEOUT?"subtitle":d===a.ErrorDetails.KEY_LOAD_ERROR||d===a.ErrorDetails.KEY_LOAD_TIMEOUT?"encryption":"manifest",request_error_code:y==null?void 0:y.code,request_error_text:y==null?void 0:y.text}),T){var O,q="".concat(L?"url: ".concat(L,"\n"):"")+"".concat(y&&(y.code||y.text)?"response: ".concat(y.code,", ").concat(y.text,"\n"):"")+"".concat(p.reason?"failure reason: ".concat(p.reason,"\n"):"")+"".concat(p.level?"level: ".concat(p.level,"\n"):"")+"".concat(p.parent?"parent stream controller: ".concat(p.parent,"\n"):"")+"".concat(p.buffer?"buffer length: ".concat(p.buffer,"\n"):"")+"".concat(p.error?"error: ".concat(p.error,"\n"):"")+"".concat(p.event?"event: ".concat(p.event,"\n"):"")+"".concat(p.err?"error message: ".concat((O=p.err)===null||O===void 0?void 0:O.message,"\n"):"");u("error",{player_error_code:_,player_error_message:d,player_error_context:q})}};t.on(a.Events.ERROR,m);var w=function(v,p){var _=p.frag,d=_&&_._url||"";u("requestcanceled",{request_event_type:v,request_url:d,request_type:"media",request_hostname:F(d)})};t.on(a.Events.FRAG_LOAD_EMERGENCY_ABORTED,w);var x=function(v,p){var _=p.level,d=t.levels[_];if(d&&d.attrs&&d.attrs.BANDWIDTH){var y=d.attrs.BANDWIDTH,T,E=parseFloat(d.attrs["FRAME-RATE"]);isNaN(E)||(T=E),y?u("renditionchange",{video_source_fps:T,video_source_bitrate:y,video_source_width:d.width,video_source_height:d.height,video_source_rendition_name:d.name,video_source_codec:d==null?void 0:d.videoCodec}):n.warn("missing BANDWIDTH from HLS manifest parsed by HLS.js")}};t.on(a.Events.LEVEL_SWITCHED,x),t._stopMuxMonitor=function(){t.off(a.Events.MANIFEST_LOADED,f),t.off(a.Events.LEVEL_LOADED,g),t.off(a.Events.AUDIO_TRACK_LOADED,k),t.off(a.Events.FRAG_LOADED,h),t.off(a.Events.FRAG_CHANGED,c),t.off(a.Events.ERROR,m),t.off(a.Events.FRAG_LOAD_EMERGENCY_ABORTED,w),t.off(a.Events.LEVEL_SWITCHED,x),t.off(a.Events.DESTROYING,t._stopMuxMonitor),delete t._stopMuxMonitor},t.on(a.Events.DESTROYING,t._stopMuxMonitor)},It=function(r){r&&typeof r._stopMuxMonitor=="function"&&r._stopMuxMonitor()};var Lt=function(r,e){if(!r||!r.requestEndDate)return{};var t=F(r.url),i=r.url,a=r.bytesLoaded,n=new Date(r.requestStartDate).getTime(),o=new Date(r.firstByteDate).getTime(),s=new Date(r.requestEndDate).getTime(),u=isNaN(r.duration)?0:r.duration,f=typeof e.getMetricsFor=="function"?e.getMetricsFor(r.mediaType).HttpList:e.getDashMetrics().getHttpRequests(r.mediaType),g;f.length>0&&(g=pe(f[f.length-1]._responseHeaders||""));var k=g?de(g):void 0;return{requestStart:n,requestResponseStart:o,requestResponseEnd:s,requestBytesLoaded:a,requestResponseHeaders:g,requestMediaDuration:u,requestHostname:t,requestUrl:i,requestId:k}},ca=function(r,e){var t=e.getQualityFor(r),i=e.getCurrentTrackFor(r).bitrateList;return i?{currentLevel:t,renditionWidth:i[t].width||null,renditionHeight:i[t].height||null,renditionBitrate:i[t].bandwidth}:{}},_a=function(r){var e;return(e=r.match(/.*codecs\*?="(.*)"/))===null||e===void 0?void 0:e[1]},fa=function(e){try{var t,i,a=(i=e.getVersion)===null||i===void 0||(t=i.call(e))===null||t===void 0?void 0:t.split(".").map(function(n){return parseInt(n)})[0];return a}catch(n){return!1}},Nt=function(r,e,t){var i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},a=r.log;if(!t||!t.on){a.warn("Invalid dash.js player reference. Monitoring blocked.");return}var n=fa(t),o=function(_,d){return r.emit(e,_,d)},s=function(_){var d=_.type,y=_.data,T=(y||{}).url;o("requestcompleted",{request_event_type:d,request_start:0,request_response_start:0,request_response_end:0,request_bytes_loaded:-1,request_type:"manifest",request_hostname:F(T),request_url:T})};t.on("manifestLoaded",s);var u={},f=function(_){if(typeof _.getRequests!="function")return null;var d=_.getRequests({state:"executed"});return d.length===0?null:d[d.length-1]},g=function(_){var d=_.type,y=_.fragmentModel,T=_.chunk,E=f(y);k({type:d,request:E,chunk:T})},k=function(_){var d=_.type,y=_.chunk,T=_.request,E=(y||{}).mediaInfo,S=E||{},L=S.type,M=S.bitrateList;M=M||[];var O={};M.forEach(function(Ee,z){O[z]={},O[z].width=Ee.width,O[z].height=Ee.height,O[z].bitrate=Ee.bandwidth,O[z].attrs={}}),L==="video"?u.video=O:L==="audio"?u.audio=O:u.media=O;var q=Lt(T,t),Z=q.requestStart,we=q.requestResponseStart,Te=q.requestResponseEnd,W=q.requestResponseHeaders,oe=q.requestMediaDuration,Ve=q.requestHostname,je=q.requestUrl,We=q.requestId;o("requestcompleted",{request_event_type:d,request_start:Z,request_response_start:we,request_response_end:Te,request_bytes_loaded:-1,request_type:L+"_init",request_response_headers:W,request_hostname:Ve,request_id:We,request_url:je,request_media_duration:oe,request_rendition_lists:u})};n>=4?t.on("initFragmentLoaded",k):t.on("initFragmentLoaded",g);var h=function(_){var d=_.type,y=_.fragmentModel,T=_.chunk,E=f(y);c({type:d,request:E,chunk:T})},c=function(_){var d=_.type,y=_.chunk,T=_.request,E=y||{},S=E.mediaInfo,L=E.start,M=S||{},O=M.type,q=Lt(T,t),Z=q.requestStart,we=q.requestResponseStart,Te=q.requestResponseEnd,W=q.requestBytesLoaded,oe=q.requestResponseHeaders,Ve=q.requestMediaDuration,je=q.requestHostname,We=q.requestUrl,Ee=q.requestId,z=ca(O,t),Kr=z.currentLevel,Yr=z.renditionWidth,Xr=z.renditionHeight,$r=z.renditionBitrate;o("requestcompleted",{request_event_type:d,request_start:Z,request_response_start:we,request_response_end:Te,request_bytes_loaded:W,request_type:O,request_response_headers:oe,request_hostname:je,request_id:Ee,request_url:We,request_media_start_time:L,request_media_duration:Ve,request_current_level:Kr,request_labeled_bitrate:$r,request_video_width:Yr,request_video_height:Xr})};n>=4?t.on("mediaFragmentLoaded",c):t.on("mediaFragmentLoaded",h);var m={video:void 0,audio:void 0,totalBitrate:void 0},w=function(){if(m.video&&typeof m.video.bitrate=="number"){if(!(m.video.width&&m.video.height)){a.warn("have bitrate info for video but missing width/height");return}var _=m.video.bitrate;if(m.audio&&typeof m.audio.bitrate=="number"&&(_+=m.audio.bitrate),_!==m.totalBitrate)return m.totalBitrate=_,{video_source_bitrate:_,video_source_height:m.video.height,video_source_width:m.video.width,video_source_codec:_a(m.video.codec)}}},x=function(_,d,y){if(typeof _.newQuality!="number"){a.warn("missing evt.newQuality in qualityChangeRendered event",_);return}var T=_.mediaType;if(T==="audio"||T==="video"){var E=t.getBitrateInfoListFor(T).find(function(L){var M=L.qualityIndex;return M===_.newQuality});if(!(E&&typeof E.bitrate=="number")){a.warn("missing bitrate info for ".concat(T));return}m[T]=fe(ue({},E),{codec:t.getCurrentTrackFor(T).codec});var S=w();S&&o("renditionchange",S)}};t.on("qualityChangeRendered",x);var v=function(_){var d=_.request,y=_.mediaType;d=d||{},o("requestcanceled",{request_event_type:d.type+"_"+d.action,request_url:d.url,request_type:y,request_hostname:F(d.url)})};t.on("fragmentLoadingAbandoned",v);var p=function(_){var d=_.error,y,T,E=(d==null||(y=d.data)===null||y===void 0?void 0:y.request)||{},S=(d==null||(T=d.data)===null||T===void 0?void 0:T.response)||{};(d==null?void 0:d.code)===27&&o("requestfailed",{request_error:E.type+"_"+E.action,request_url:E.url,request_hostname:F(E.url),request_type:E.mediaType,request_error_code:S.status,request_error_text:S.statusText});var L="".concat(E!=null&&E.url?"url: ".concat(E.url,"\n"):"")+"".concat(S!=null&&S.status||S!=null&&S.statusText?"response: ".concat(S==null?void 0:S.status,", ").concat(S==null?void 0:S.statusText,"\n"):"");o("error",{player_error_code:d==null?void 0:d.code,player_error_message:d==null?void 0:d.message,player_error_context:L})};t.on("error",p),t._stopMuxMonitor=function(){t.off("manifestLoaded",s),t.off("initFragmentLoaded",k),t.off("mediaFragmentLoaded",c),t.off("qualityChangeRendered",x),t.off("error",p),t.off("fragmentLoadingAbandoned",v),delete t._stopMuxMonitor}},Ct=function(r){r&&typeof r._stopMuxMonitor=="function"&&r._stopMuxMonitor()};var Mt=0,pa=function(){"use strict";function r(){D(this,r),l(this,"_listeners",void 0)}return N(r,[{key:"on",value:function(t,i,a){return i._eventEmitterGuid=i._eventEmitterGuid||++Mt,this._listeners=this._listeners||{},this._listeners[t]=this._listeners[t]||[],a&&(i=i.bind(a)),this._listeners[t].push(i),i}},{key:"off",value:function(t,i){var a=this._listeners&&this._listeners[t];a&&a.forEach(function(n,o){n._eventEmitterGuid===i._eventEmitterGuid&&a.splice(o,1)})}},{key:"one",value:function(t,i,a){var n=this;i._eventEmitterGuid=i._eventEmitterGuid||++Mt;var o=function(){n.off(t,o),i.apply(a||this,arguments)};o._eventEmitterGuid=i._eventEmitterGuid,this.on(t,o)}},{key:"emit",value:function(t,i){var a=this;if(this._listeners){i=i||{};var n=this._listeners["before"+t]||[],o=this._listeners["before*"]||[],s=this._listeners[t]||[],u=this._listeners["after"+t]||[],f=function(g,k){g=g.slice(),g.forEach(function(h){h.call(a,{type:t},k)})};f(n,i),f(o,i),f(s,i),f(u,i)}}}]),r}(),Ht=pa;var He=G(Q()),ma=function(){"use strict";function r(e){var t=this;D(this,r),l(this,"_playbackHeartbeatInterval",void 0),l(this,"_playheadShouldBeProgressing",void 0),l(this,"pm",void 0),this.pm=e,this._playbackHeartbeatInterval=null,this._playheadShouldBeProgressing=!1,e.on("playing",function(){t._playheadShouldBeProgressing=!0}),e.on("play",this._startPlaybackHeartbeatInterval.bind(this)),e.on("playing",this._startPlaybackHeartbeatInterval.bind(this)),e.on("adbreakstart",this._startPlaybackHeartbeatInterval.bind(this)),e.on("adplay",this._startPlaybackHeartbeatInterval.bind(this)),e.on("adplaying",this._startPlaybackHeartbeatInterval.bind(this)),e.on("devicewake",this._startPlaybackHeartbeatInterval.bind(this)),e.on("viewstart",this._startPlaybackHeartbeatInterval.bind(this)),e.on("rebufferstart",this._startPlaybackHeartbeatInterval.bind(this)),e.on("pause",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("ended",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("viewend",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("error",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("aderror",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("adpause",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("adended",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("adbreakend",this._stopPlaybackHeartbeatInterval.bind(this)),e.on("seeked",function(){e.data.player_is_paused?t._stopPlaybackHeartbeatInterval():t._startPlaybackHeartbeatInterval()}),e.on("timeupdate",function(){t._playbackHeartbeatInterval!==null&&e.emit("playbackheartbeat")}),e.on("devicesleep",function(i,a){t._playbackHeartbeatInterval!==null&&(He.default.clearInterval(t._playbackHeartbeatInterval),e.emit("playbackheartbeatend",{viewer_time:a.viewer_time}),t._playbackHeartbeatInterval=null)})}return N(r,[{key:"_startPlaybackHeartbeatInterval",value:function(){var t=this;this._playbackHeartbeatInterval===null&&(this.pm.emit("playbackheartbeat"),this._playbackHeartbeatInterval=He.default.setInterval(function(){t.pm.emit("playbackheartbeat")},this.pm.playbackHeartbeatTime))}},{key:"_stopPlaybackHeartbeatInterval",value:function(){this._playheadShouldBeProgressing=!1,this._playbackHeartbeatInterval!==null&&(He.default.clearInterval(this._playbackHeartbeatInterval),this.pm.emit("playbackheartbeatend"),this._playbackHeartbeatInterval=null)}}]),r}(),Bt=ma;var va=function r(e){"use strict";var t=this;D(this,r),l(this,"viewErrored",void 0),e.on("viewinit",function(){t.viewErrored=!1}),e.on("error",function(i,a){try{var n=e.errorTranslator({player_error_code:a.player_error_code,player_error_message:a.player_error_message,player_error_context:a.player_error_context,player_error_severity:a.player_error_severity,player_error_business_exception:a.player_error_business_exception});n&&(e.data.player_error_code=n.player_error_code||a.player_error_code,e.data.player_error_message=n.player_error_message||a.player_error_message,e.data.player_error_context=n.player_error_context||a.player_error_context,e.data.player_error_severity=n.player_error_severity||a.player_error_severity,e.data.player_error_business_exception=n.player_error_business_exception||a.player_error_business_exception,t.viewErrored=!0)}catch(o){e.mux.log.warn("Exception in error translator callback.",o),t.viewErrored=!0}}),e.on("aftererror",function(){var i,a,n,o,s;(i=e.data)===null||i===void 0||delete i.player_error_code,(a=e.data)===null||a===void 0||delete a.player_error_message,(n=e.data)===null||n===void 0||delete n.player_error_context,(o=e.data)===null||o===void 0||delete o.player_error_severity,(s=e.data)===null||s===void 0||delete s.player_error_business_exception})},Ut=va;var ha=function(){"use strict";function r(e){D(this,r),l(this,"_watchTimeTrackerLastCheckedTime",void 0),l(this,"pm",void 0),this.pm=e,this._watchTimeTrackerLastCheckedTime=null,e.on("playbackheartbeat",this._updateWatchTime.bind(this)),e.on("playbackheartbeatend",this._clearWatchTimeState.bind(this))}return N(r,[{key:"_updateWatchTime",value:function(t,i){var a=i.viewer_time;this._watchTimeTrackerLastCheckedTime===null&&(this._watchTimeTrackerLastCheckedTime=a),P(this.pm.data,"view_watch_time",a-this._watchTimeTrackerLastCheckedTime),this._watchTimeTrackerLastCheckedTime=a}},{key:"_clearWatchTimeState",value:function(t,i){this._updateWatchTime(t,i),this._watchTimeTrackerLastCheckedTime=null}}]),r}(),Ft=ha;var ya=function(){"use strict";function r(e){var t=this;D(this,r),l(this,"_playbackTimeTrackerLastPlayheadPosition",void 0),l(this,"_lastTime",void 0),l(this,"_isAdPlaying",void 0),l(this,"_callbackUpdatePlaybackTime",void 0),l(this,"pm",void 0),this.pm=e,this._playbackTimeTrackerLastPlayheadPosition=-1,this._lastTime=A.now(),this._isAdPlaying=!1,this._callbackUpdatePlaybackTime=null,e.on("viewinit",function(){t.pm.data.view_playing_time_ms_cumulative=0});var i=this._startPlaybackTimeTracking.bind(this);e.on("playing",i),e.on("adplaying",i),e.on("seeked",i),e.on("rebufferend",i);var a=this._stopPlaybackTimeTracking.bind(this);e.on("playbackheartbeatend",a),e.on("seeking",a),e.on("rebufferstart",a),e.on("adplaying",function(){t._isAdPlaying=!0}),e.on("adended",function(){t._isAdPlaying=!1}),e.on("adpause",function(){t._isAdPlaying=!1}),e.on("adbreakstart",function(){t._isAdPlaying=!1}),e.on("adbreakend",function(){t._isAdPlaying=!1}),e.on("adplay",function(){t._isAdPlaying=!1}),e.on("viewinit",function(){t._playbackTimeTrackerLastPlayheadPosition=-1,t._lastTime=A.now(),t._isAdPlaying=!1,t._callbackUpdatePlaybackTime=null})}return N(r,[{key:"_startPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime===null&&(this._callbackUpdatePlaybackTime=this._updatePlaybackTime.bind(this),this._playbackTimeTrackerLastPlayheadPosition=this.pm.data.player_playhead_time,this._lastTime=A.now(),this.pm.on("playbackheartbeat",this._callbackUpdatePlaybackTime))}},{key:"_stopPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime&&(this._updatePlaybackTime(),this.pm.off("playbackheartbeat",this._callbackUpdatePlaybackTime),this._callbackUpdatePlaybackTime=null,this._playbackTimeTrackerLastPlayheadPosition=-1)}},{key:"_updatePlaybackTime",value:function(){var t=this.pm.data.player_playhead_time||0,i=A.now(),a=i-this._lastTime,n=-1;this._playbackTimeTrackerLastPlayheadPosition>=0&&t>this._playbackTimeTrackerLastPlayheadPosition?n=t-this._playbackTimeTrackerLastPlayheadPosition:this._isAdPlaying&&(n=a),n>0&&n<=1e3&&P(this.pm.data,"view_content_playback_time",n),this._callbackUpdatePlaybackTime!==null&&a>0&&a<=1e3&&(this._isAdPlaying&&P(this.pm.data,"ad_playing_time_ms_cumulative",a),P(this.pm.data,"view_playing_time_ms_cumulative",a)),this._playbackTimeTrackerLastPlayheadPosition=t,this._lastTime=i}}]),r}(),Vt=ya;var ga=function(){"use strict";function r(e){D(this,r),l(this,"pm",void 0),this.pm=e;var t=this._updatePlayheadTime.bind(this);e.on("playbackheartbeat",t),e.on("playbackheartbeatend",t),e.on("timeupdate",t),e.on("destroy",function(){e.off("timeupdate",t)})}return N(r,[{key:"_updateMaxPlayheadPosition",value:function(){this.pm.data.view_max_playhead_position=typeof this.pm.data.view_max_playhead_position=="undefined"?this.pm.data.player_playhead_time:Math.max(this.pm.data.view_max_playhead_position,this.pm.data.player_playhead_time)}},{key:"_updatePlayheadTime",value:function(t,i){var a=this,n=function(){a.pm.currentFragmentPDT&&a.pm.currentFragmentStart&&(a.pm.data.player_program_time=a.pm.currentFragmentPDT+a.pm.data.player_playhead_time-a.pm.currentFragmentStart)};if(i&&i.player_playhead_time)this.pm.data.player_playhead_time=i.player_playhead_time,n(),this._updateMaxPlayheadPosition();else if(this.pm.getPlayheadTime){var o=this.pm.getPlayheadTime();typeof o!="undefined"&&(this.pm.data.player_playhead_time=o,n(),this._updateMaxPlayheadPosition())}}}]),r}(),jt=ga;var Wt=5*60*1e3,ba=function r(e){"use strict";if(D(this,r),!e.disableRebufferTracking){var t,i=function(n,o){a(o),t=void 0},a=function(n){if(t){var o=n.viewer_time-t;P(e.data,"view_rebuffer_duration",o),t=n.viewer_time,e.data.view_rebuffer_duration>Wt&&(e.emit("viewend"),e.send("viewend"),e.mux.log.warn("Ending view after rebuffering for longer than ".concat(Wt,"ms, future events will be ignored unless a programchange or videochange occurs.")))}e.data.view_watch_time>=0&&e.data.view_rebuffer_count>0&&(e.data.view_rebuffer_frequency=e.data.view_rebuffer_count/e.data.view_watch_time,e.data.view_rebuffer_percentage=e.data.view_rebuffer_duration/e.data.view_watch_time)};e.on("playbackheartbeat",function(n,o){return a(o)}),e.on("rebufferstart",function(n,o){t||(P(e.data,"view_rebuffer_count",1),t=o.viewer_time,e.one("rebufferend",i))}),e.on("viewinit",function(){t=void 0,e.off("rebufferend",i)})}},Gt=ba;var wa=function(){"use strict";function r(e){var t=this;D(this,r),l(this,"_lastCheckedTime",void 0),l(this,"_lastPlayheadTime",void 0),l(this,"_lastPlayheadTimeUpdatedTime",void 0),l(this,"_rebuffering",void 0),l(this,"pm",void 0),this.pm=e,!(e.disableRebufferTracking||e.disablePlayheadRebufferTracking)&&(this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null,e.on("playbackheartbeat",this._checkIfRebuffering.bind(this)),e.on("playbackheartbeatend",this._cleanupRebufferTracker.bind(this)),e.on("seeking",function(){t._cleanupRebufferTracker(null,{viewer_time:A.now()})}))}return N(r,[{key:"_checkIfRebuffering",value:function(t,i){if(this.pm.seekingTracker.isSeeking||this.pm.adTracker.isAdBreak||!this.pm.playbackHeartbeat._playheadShouldBeProgressing){this._cleanupRebufferTracker(t,i);return}if(this._lastCheckedTime===null){this._prepareRebufferTrackerState(i.viewer_time);return}if(this._lastPlayheadTime!==this.pm.data.player_playhead_time){this._cleanupRebufferTracker(t,i,!0);return}var a=i.viewer_time-this._lastPlayheadTimeUpdatedTime;typeof this.pm.sustainedRebufferThreshold=="number"&&a>=this.pm.sustainedRebufferThreshold&&(this._rebuffering||(this._rebuffering=!0,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}))),this._lastCheckedTime=i.viewer_time}},{key:"_clearRebufferTrackerState",value:function(){this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null}},{key:"_prepareRebufferTrackerState",value:function(t){this._lastCheckedTime=t,this._lastPlayheadTime=this.pm.data.player_playhead_time,this._lastPlayheadTimeUpdatedTime=t}},{key:"_cleanupRebufferTracker",value:function(t,i){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1;if(this._rebuffering)this._rebuffering=!1,this.pm.emit("rebufferend",{viewer_time:i.viewer_time});else{if(this._lastCheckedTime===null)return;var n=this.pm.data.player_playhead_time-this._lastPlayheadTime,o=i.viewer_time-this._lastPlayheadTimeUpdatedTime;typeof this.pm.minimumRebufferDuration=="number"&&n>0&&o-n>this.pm.minimumRebufferDuration&&(this._lastCheckedTime=null,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}),this.pm.emit("rebufferend",{viewer_time:this._lastPlayheadTimeUpdatedTime+o-n}))}a?this._prepareRebufferTrackerState(i.viewer_time):this._clearRebufferTrackerState()}}]),r}(),Jt=wa;var Ta=function(){"use strict";function r(e){var t=this;D(this,r),l(this,"pm",void 0),this.pm=e,e.on("viewinit",function(){var i=e.data,a=i.view_id;if(!i.view_program_changed){var n=function(o,s){var u=s.viewer_time;o.type==="playing"&&typeof e.data.view_time_to_first_frame=="undefined"?t.calculateTimeToFirstFrame(u||A.now(),a):o.type==="adplaying"&&(typeof e.data.view_time_to_first_frame=="undefined"||t._inPrerollPosition())&&t.calculateTimeToFirstFrame(u||A.now(),a)};e.one("playing",n),e.one("adplaying",n),e.one("viewend",function(){e.off("playing",n),e.off("adplaying",n)})}})}return N(r,[{key:"_inPrerollPosition",value:function(){return typeof this.pm.data.view_content_playback_time=="undefined"||this.pm.data.view_content_playback_time<=1e3}},{key:"calculateTimeToFirstFrame",value:function(t,i){i===this.pm.data.view_id&&(this.pm.watchTimeTracker._updateWatchTime(null,{viewer_time:t}),this.pm.data.view_time_to_first_frame=this.pm.data.view_watch_time,(this.pm.data.player_autoplay_on||this.pm.data.video_is_autoplay)&&this.pm.pageLoadInitTime&&(this.pm.data.view_aggregate_startup_time=this.pm.data.view_start+this.pm.data.view_watch_time-this.pm.pageLoadInitTime))}}]),r}(),Qt=Ta;var Ea=function r(e){"use strict";var t=this;D(this,r),l(this,"_lastPlayerHeight",void 0),l(this,"_lastPlayerWidth",void 0),l(this,"_lastPlayheadPosition",void 0),l(this,"_lastSourceHeight",void 0),l(this,"_lastSourceWidth",void 0),e.on("viewinit",function(){t._lastPlayheadPosition=-1});var i=["pause","rebufferstart","seeking","error","adbreakstart","hb","renditionchange","orientationchange","viewend","playbackmodechange"],a=["playing","hb","renditionchange","orientationchange","playbackmodechange"];i.forEach(function(n){e.on(n,function(){if(t._lastPlayheadPosition>=0&&e.data.player_playhead_time>=0&&t._lastPlayerWidth>=0&&t._lastSourceWidth>0&&t._lastPlayerHeight>=0&&t._lastSourceHeight>0){var o=e.data.player_playhead_time-t._lastPlayheadPosition;if(o<0){t._lastPlayheadPosition=-1;return}var s=Math.min(t._lastPlayerWidth/t._lastSourceWidth,t._lastPlayerHeight/t._lastSourceHeight),u=Math.max(0,s-1),f=Math.max(0,1-s);e.data.view_max_upscale_percentage=Math.max(e.data.view_max_upscale_percentage||0,u),e.data.view_max_downscale_percentage=Math.max(e.data.view_max_downscale_percentage||0,f),P(e.data,"view_total_content_playback_time",o),P(e.data,"view_total_upscaling",u*o),P(e.data,"view_total_downscaling",f*o)}t._lastPlayheadPosition=-1})}),a.forEach(function(n){e.on(n,function(){t._lastPlayheadPosition=e.data.player_playhead_time,t._lastPlayerWidth=e.data.player_width,t._lastPlayerHeight=e.data.player_height,t._lastSourceWidth=e.data.video_source_width,t._lastSourceHeight=e.data.video_source_height})})},zt=Ea;var ka=2e3,xa=function r(e){"use strict";var t=this;D(this,r),l(this,"isSeeking",void 0),this.isSeeking=!1;var i=-1,a=function(){var n=A.now(),o=(e.data.viewer_time||n)-(i||n);P(e.data,"view_seek_duration",o),e.data.view_max_seek_time=Math.max(e.data.view_max_seek_time||0,o),t.isSeeking=!1,i=-1};e.on("seeking",function(n,o){if(Object.assign(e.data,o),t.isSeeking&&o.viewer_time-i<=ka){i=o.viewer_time;return}t.isSeeking&&a(),t.isSeeking=!0,i=o.viewer_time,P(e.data,"view_seek_count",1),e.send("seeking")}),e.on("seeked",function(){a()}),e.on("viewend",function(){t.isSeeking&&(a(),e.send("seeked")),t.isSeeking=!1,i=-1})},Kt=xa;var Yt=function(e,t){e.push(t),e.sort(function(i,a){return i.viewer_time-a.viewer_time})},Da=["adbreakstart","adrequest","adresponse","adplay","adplaying","adpause","adended","adbreakend","aderror","adclicked","adskipped"],Sa=function(){"use strict";function r(e){var t=this;D(this,r),l(this,"_adHasPlayed",void 0),l(this,"_adRequests",void 0),l(this,"_adResponses",void 0),l(this,"_currentAdRequestNumber",void 0),l(this,"_currentAdResponseNumber",void 0),l(this,"_prerollPlayTime",void 0),l(this,"_wouldBeNewAdPlay",void 0),l(this,"isAdBreak",void 0),l(this,"pm",void 0),this.pm=e,e.on("viewinit",function(){t.isAdBreak=!1,t._currentAdRequestNumber=0,t._currentAdResponseNumber=0,t._adRequests=[],t._adResponses=[],t._adHasPlayed=!1,t._wouldBeNewAdPlay=!0,t._prerollPlayTime=void 0}),Da.forEach(function(a){return e.on(a,t._updateAdData.bind(t))});var i=function(){t.isAdBreak=!1};e.on("adbreakstart",function(){t.isAdBreak=!0}),e.on("play",i),e.on("playing",i),e.on("viewend",i),e.on("adrequest",function(a,n){n=Object.assign({ad_request_id:"generatedAdRequestId"+t._currentAdRequestNumber++},n),Yt(t._adRequests,n),P(e.data,"view_ad_request_count"),t.inPrerollPosition()&&(e.data.view_preroll_requested=!0,t._adHasPlayed||P(e.data,"view_preroll_request_count"))}),e.on("adresponse",function(a,n){n=Object.assign({ad_request_id:"generatedAdRequestId"+t._currentAdResponseNumber++},n),Yt(t._adResponses,n);var o=t.findAdRequest(n.ad_request_id);o&&P(e.data,"view_ad_request_time",Math.max(0,n.viewer_time-o.viewer_time))}),e.on("adplay",function(a,n){t._adHasPlayed=!0,t._wouldBeNewAdPlay&&(t._wouldBeNewAdPlay=!1,P(e.data,"view_ad_played_count")),t.inPrerollPosition()&&!e.data.view_preroll_played&&(e.data.view_preroll_played=!0,t._adRequests.length>0&&(e.data.view_preroll_request_time=Math.max(0,n.viewer_time-t._adRequests[0].viewer_time)),e.data.view_start&&(e.data.view_startup_preroll_request_time=Math.max(0,n.viewer_time-e.data.view_start)),t._prerollPlayTime=n.viewer_time)}),e.on("adplaying",function(a,n){t.inPrerollPosition()&&typeof e.data.view_preroll_load_time=="undefined"&&typeof t._prerollPlayTime!="undefined"&&(e.data.view_preroll_load_time=n.viewer_time-t._prerollPlayTime,e.data.view_startup_preroll_load_time=n.viewer_time-t._prerollPlayTime)}),e.on("adclicked",function(a,n){t._wouldBeNewAdPlay||P(e.data,"view_ad_clicked_count")}),e.on("adskipped",function(a,n){t._wouldBeNewAdPlay||P(e.data,"view_ad_skipped_count")}),e.on("adended",function(){t._wouldBeNewAdPlay=!0}),e.on("aderror",function(){t._wouldBeNewAdPlay=!0})}return N(r,[{key:"inPrerollPosition",value:function(){return typeof this.pm.data.view_content_playback_time=="undefined"||this.pm.data.view_content_playback_time<=1e3}},{key:"findAdRequest",value:function(t){for(var i=0;i<this._adRequests.length;i++)if(this._adRequests[i].ad_request_id===t)return this._adRequests[i]}},{key:"_updateAdData",value:function(t,i){if(this.inPrerollPosition()){if(!this.pm.data.view_preroll_ad_tag_hostname&&i.ad_tag_url){var a=H(re(i.ad_tag_url),2),n=a[0],o=a[1];this.pm.data.view_preroll_ad_tag_domain=o,this.pm.data.view_preroll_ad_tag_hostname=n}if(!this.pm.data.view_preroll_ad_asset_hostname&&i.ad_asset_url){var s=H(re(i.ad_asset_url),2),u=s[0],f=s[1];this.pm.data.view_preroll_ad_asset_domain=f,this.pm.data.view_preroll_ad_asset_hostname=u}this.pm.data.ad_type="preroll"}this.pm.data.ad_asset_url=i==null?void 0:i.ad_asset_url,this.pm.data.ad_tag_url=i==null?void 0:i.ad_tag_url,this.pm.data.ad_creative_id=i==null?void 0:i.ad_creative_id,this.pm.data.ad_id=i==null?void 0:i.ad_id,this.pm.data.ad_universal_id=i==null?void 0:i.ad_universal_id,i!=null&&i.ad_type&&(this.pm.data.ad_type=i==null?void 0:i.ad_type)}}]),r}(),Xt=Sa;var qa=function r(e){"use strict";var t=this;D(this,r),l(this,"lastWallClockTime",void 0);var i=function(){t.lastWallClockTime=A.now(),e.on("before*",a)},a=function(n){var o=A.now(),s=t.lastWallClockTime;t.lastWallClockTime=o,o-s>3e4&&(e.emit("devicesleep",{viewer_time:s}),Object.assign(e.data,{viewer_time:s}),e.send("devicesleep"),e.emit("devicewake",{viewer_time:o}),Object.assign(e.data,{viewer_time:o}),e.send("devicewake"))};e.one("playbackheartbeat",i),e.on("playbackheartbeatend",function(){e.off("before*",a),e.one("playbackheartbeat",i)})},$t=qa;var Ue=G(Q());var Qe=function(r){return r()}(function(){var r=function(){for(var i=0,a={};i<arguments.length;i++){var n=arguments[i];for(var o in n)a[o]=n[o]}return a};function e(t){function i(a,n,o){var s;if(typeof document!="undefined"){if(arguments.length>1){if(o=r({path:"/"},i.defaults,o),typeof o.expires=="number"){var u=new Date;u.setMilliseconds(u.getMilliseconds()+o.expires*864e5),o.expires=u}try{s=JSON.stringify(n),/^[\{\[]/.test(s)&&(n=s)}catch(w){}return t.write?n=t.write(n,a):n=encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),a=encodeURIComponent(String(a)),a=a.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),a=a.replace(/[\(\)]/g,escape),document.cookie=[a,"=",n,o.expires?"; expires="+o.expires.toUTCString():"",o.path?"; path="+o.path:"",o.domain?"; domain="+o.domain:"",o.secure?"; secure":""].join("")}a||(s={});for(var f=document.cookie?document.cookie.split("; "):[],g=/(%[0-9A-Z]{2})+/g,k=0;k<f.length;k++){var h=f[k].split("="),c=h.slice(1).join("=");c.charAt(0)==='"'&&(c=c.slice(1,-1));try{var m=h[0].replace(g,decodeURIComponent);if(c=t.read?t.read(c,m):t(c,m)||c.replace(g,decodeURIComponent),this.json)try{c=JSON.parse(c)}catch(w){}if(a===m){s=c;break}a||(s[m]=c)}catch(w){}}return s}}return i.set=i,i.get=function(a){return i.call(i,a)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(a,n){i(a,"",r(n,{expires:-1}))},i.withConverter=e,i}return e(function(){})});var Zt="muxData",Ra=function(r){return Object.entries(r).map(function(e){var t=H(e,2),i=t[0],a=t[1];return"".concat(i,"=").concat(a)}).join("&")},Aa=function(r){return r.split("&").reduce(function(e,t){var i=H(t.split("="),2),a=i[0],n=i[1],o=+n,s=n&&o==n?o:n;return e[a]=s,e},{})},er=function(){var e;try{e=Aa(Qe.get(Zt)||"")}catch(t){e={}}return e},tr=function(e){try{Qe.set(Zt,Ra(e),{expires:365})}catch(t){}},rr=function(){var e=er();return e.mux_viewer_id=e.mux_viewer_id||ee(),e.msn=e.msn||Math.random(),tr(e),{mux_viewer_id:e.mux_viewer_id,mux_sample_number:e.msn}},ar=function(){var e=er(),t=A.now();return e.session_start&&(e.sst=e.session_start,delete e.session_start),e.session_id&&(e.sid=e.session_id,delete e.session_id),e.session_expires&&(e.sex=e.session_expires,delete e.session_expires),(!e.sex||e.sex<t)&&(e.sid=ee(),e.sst=t),e.sex=t+25*60*1e3,tr(e),{session_id:e.sid,session_start:e.sst,session_expires:e.sex}};function ze(r,e){var t=e.beaconCollectionDomain,i=e.beaconDomain;if(t)return"https://"+t;r=r||"inferred";var a=i||"litix.io";return r.match(/^[a-z0-9]+$/)?"https://"+r+"."+a:"https://img.litix.io/a.gif"}var ir=G(Q()),nr=function(){var e;switch(or()){case"cellular":e="cellular";break;case"ethernet":e="wired";break;case"wifi":e="wifi";break;case void 0:break;default:e="other"}return e},or=function(){var e=ir.default.navigator,t=e&&(e.connection||e.mozConnection||e.webkitConnection);return t&&t.type};nr.getConnectionFromAPI=or;var sr=nr;var Pa={a:"env",b:"beacon",c:"custom",d:"ad",e:"event",f:"experiment",i:"internal",m:"mux",n:"response",p:"player",q:"request",r:"retry",s:"session",t:"timestamp",u:"viewer",v:"video",w:"page",x:"view",y:"sub"},Oa=dr(Pa),Ia={ad:"ad",af:"affiliate",ag:"aggregate",ap:"api",al:"application",ao:"audio",ar:"architecture",as:"asset",au:"autoplay",av:"average",bi:"bitrate",bn:"brand",br:"break",bw:"browser",by:"bytes",bz:"business",ca:"cached",cb:"cancel",cc:"codec",cd:"code",cg:"category",ch:"changed",ci:"client",ck:"clicked",cl:"canceled",cm:"cmcd",cn:"config",co:"count",ce:"counter",cp:"complete",cq:"creator",cr:"creative",cs:"captions",ct:"content",cu:"current",cv:"cumulative",cx:"connection",cz:"context",da:"data",dg:"downscaling",dm:"domain",dn:"cdn",do:"downscale",dr:"drm",dp:"dropped",du:"duration",dv:"device",dy:"dynamic",eb:"enabled",ec:"encoding",ed:"edge",en:"end",eg:"engine",em:"embed",er:"error",ep:"experiments",es:"errorcode",et:"errortext",ee:"event",ev:"events",ex:"expires",ez:"exception",fa:"failed",fi:"first",fm:"family",ft:"format",fp:"fps",fq:"frequency",fr:"frame",fs:"fullscreen",ha:"has",hb:"holdback",he:"headers",ho:"host",hn:"hostname",ht:"height",id:"id",ii:"init",in:"instance",ip:"ip",is:"is",ke:"key",la:"language",lb:"labeled",le:"level",li:"live",ld:"loaded",lo:"load",ls:"lists",lt:"latency",ma:"max",md:"media",me:"message",mf:"manifest",mi:"mime",ml:"midroll",mm:"min",mn:"manufacturer",mo:"model",mp:"mode",ms:"ms",mx:"mux",ne:"newest",nm:"name",no:"number",on:"on",or:"origin",os:"os",pa:"paused",pb:"playback",pd:"producer",pe:"percentage",pf:"played",pg:"program",ph:"playhead",pi:"plugin",pl:"preroll",pn:"playing",po:"poster",pp:"pip",pr:"preload",ps:"position",pt:"part",pv:"previous",py:"property",px:"pop",pz:"plan",ra:"rate",rd:"requested",re:"rebuffer",rf:"rendition",rg:"range",rm:"remote",ro:"ratio",rp:"response",rq:"request",rs:"requests",sa:"sample",sd:"skipped",se:"session",sh:"shift",sk:"seek",sm:"stream",so:"source",sq:"sequence",sr:"series",ss:"status",st:"start",su:"startup",sv:"server",sw:"software",sy:"severity",ta:"tag",tc:"tech",te:"text",tg:"target",th:"throughput",ti:"time",tl:"total",to:"to",tt:"title",ty:"type",ug:"upscaling",un:"universal",up:"upscale",ur:"url",us:"user",va:"variant",vd:"viewed",vi:"video",ve:"version",vw:"view",vr:"viewer",wd:"width",wa:"watch",wt:"waiting"},ur=dr(Ia);function dr(r){var e={};for(var t in r)r.hasOwnProperty(t)&&(e[r[t]]=t);return e}function me(r){var e={},t={};return Object.keys(r).forEach(function(i){var a=!1;if(r.hasOwnProperty(i)&&r[i]!==void 0){var n=i.split("_"),o=n[0],s=Oa[o];s||(R.info("Data key word `"+n[0]+"` not expected in "+i),s=o+"_"),n.splice(1).forEach(function(u){u==="url"&&(a=!0),ur[u]?s+=ur[u]:Number.isInteger(Number(u))?s+=u:(R.info("Data key word `"+u+"` not expected in "+i),s+="_"+u+"_")}),a?t[s]=r[i]:e[s]=r[i]}}),Object.assign(e,t)}var ie=G(Q()),Nr=G(it());var ni={maxBeaconSize:300,maxQueueLength:3600,baseTimeBetweenBeacons:1e4,maxPayloadKBSize:500},oi=56*1024,si=["hb","requestcompleted","requestfailed","requestcanceled"],ui="https://img.litix.io",$=function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};this._beaconUrl=e||ui,this._eventQueue=[],this._postInFlight=!1,this._resendAfterPost=!1,this._failureCount=0,this._sendTimeout=!1,this._options=Object.assign({},ni,t)};$.prototype.queueEvent=function(r,e){var t=Object.assign({},e);return this._eventQueue.length<=this._options.maxQueueLength||r==="eventrateexceeded"?(this._eventQueue.push(t),this._sendTimeout||this._startBeaconSending(),this._eventQueue.length<=this._options.maxQueueLength):!1};$.prototype.flushEvents=function(){var r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!1;if(r&&this._eventQueue.length===1){this._eventQueue.pop();return}this._eventQueue.length&&this._sendBeaconQueue(),this._startBeaconSending()};$.prototype.destroy=function(){var r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!1;this.destroyed=!0,r?this._clearBeaconQueue():this.flushEvents(),ie.default.clearTimeout(this._sendTimeout)};$.prototype._clearBeaconQueue=function(){var r=this._eventQueue.length>this._options.maxBeaconSize?this._eventQueue.length-this._options.maxBeaconSize:0,e=this._eventQueue.slice(r);r>0&&Object.assign(e[e.length-1],me({mux_view_message:"event queue truncated"}));var t=this._createPayload(e);Cr(this._beaconUrl,t,!0,function(){})};$.prototype._sendBeaconQueue=function(){var r=this;if(this._postInFlight){this._resendAfterPost=!0;return}var e=this._eventQueue.slice(0,this._options.maxBeaconSize);this._eventQueue=this._eventQueue.slice(this._options.maxBeaconSize),this._postInFlight=!0;var t=this._createPayload(e),i=A.now();Cr(this._beaconUrl,t,!1,function(a,n){n?(r._eventQueue=e.concat(r._eventQueue),r._failureCount+=1,R.info("Error sending beacon: "+n)):r._failureCount=0,r._roundTripTime=A.now()-i,r._postInFlight=!1,r._resendAfterPost&&(r._resendAfterPost=!1,r._eventQueue.length>0&&r._sendBeaconQueue())})};$.prototype._getNextBeaconTime=function(){if(!this._failureCount)return this._options.baseTimeBetweenBeacons;var r=Math.pow(2,this._failureCount-1);return r=r*Math.random(),(1+r)*this._options.baseTimeBetweenBeacons};$.prototype._startBeaconSending=function(){var r=this;ie.default.clearTimeout(this._sendTimeout),!this.destroyed&&(this._sendTimeout=ie.default.setTimeout(function(){r._eventQueue.length&&r._sendBeaconQueue(),r._startBeaconSending()},this._getNextBeaconTime()))};$.prototype._createPayload=function(r){var e=this,t={transmission_timestamp:Math.round(A.now())};this._roundTripTime&&(t.rtt_ms=Math.round(this._roundTripTime));var i,a,n,o=function(){i=JSON.stringify({metadata:t,events:a||r}),n=i.length/1024},s=function(){return n<=e._options.maxPayloadKBSize};return o(),s()||(R.info("Payload size is too big ("+n+" kb). Removing unnecessary events."),a=r.filter(function(u){return si.indexOf(u.e)===-1}),o()),s()||(R.info("Payload size still too big ("+n+" kb). Cropping fields.."),a.forEach(function(u){for(var f in u){var g=u[f],k=50*1024;typeof g=="string"&&g.length>k&&(u[f]=g.substring(0,k))}}),o()),i};var di=typeof Nr.default.exitPictureInPicture=="function"?function(r){return r.length<=oi}:function(r){return!1},Cr=function(r,e,t,i){if(t&&navigator&&navigator.sendBeacon&&navigator.sendBeacon(r,e)){i();return}if(ie.default.fetch){ie.default.fetch(r,{method:"POST",body:e,headers:{"Content-Type":"text/plain"},keepalive:di(e)}).then(function(n){return i(null,n.ok?null:"Error")}).catch(function(n){return i(null,n)});return}if(ie.default.XMLHttpRequest){var a=new ie.default.XMLHttpRequest;a.onreadystatechange=function(){if(a.readyState===4)return i(null,a.status!==200?"error":void 0)},a.open("POST",r),a.setRequestHeader("Content-Type","text/plain"),a.send(e);return}i()},Mr=$;var li=["env_key","view_id","view_sequence_number","player_sequence_number","beacon_domain","player_playhead_time","viewer_time","mux_api_version","event","video_id","player_instance_id","player_error_code","player_error_message","player_error_context","player_error_severity","player_error_business_exception","view_playing_time_ms_cumulative","ad_playing_time_ms_cumulative"],ci=["adplay","adplaying","adpause","adfirstquartile","admidpoint","adthirdquartile","adended","adresponse","adrequest"],_i=["ad_id","ad_creative_id","ad_universal_id"],fi=["viewstart","error","ended","viewend"],pi=10*60*1e3,Hr=function(){"use strict";function r(e,t){var i=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};D(this,r);var a,n,o,s,u,f,g,k,h,c,m,w;l(this,"mux",void 0),l(this,"envKey",void 0),l(this,"options",void 0),l(this,"eventQueue",void 0),l(this,"sampleRate",void 0),l(this,"disableCookies",void 0),l(this,"respectDoNotTrack",void 0),l(this,"previousBeaconData",void 0),l(this,"lastEventTime",void 0),l(this,"rateLimited",void 0),l(this,"pageLevelData",void 0),l(this,"viewerData",void 0),this.mux=e,this.envKey=t,this.options=i,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.eventQueue=new Mr(ze(this.envKey,this.options));var x;this.sampleRate=(x=this.options.sampleRate)!==null&&x!==void 0?x:1;var v;this.disableCookies=(v=this.options.disableCookies)!==null&&v!==void 0?v:!1;var p;this.respectDoNotTrack=(p=this.options.respectDoNotTrack)!==null&&p!==void 0?p:!1,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.pageLevelData={mux_api_version:this.mux.API_VERSION,mux_embed:this.mux.NAME,mux_embed_version:this.mux.VERSION,viewer_application_name:(a=this.options.platform)===null||a===void 0?void 0:a.name,viewer_application_version:(n=this.options.platform)===null||n===void 0?void 0:n.version,viewer_application_engine:(o=this.options.platform)===null||o===void 0?void 0:o.layout,viewer_device_name:(s=this.options.platform)===null||s===void 0?void 0:s.product,viewer_device_category:"",viewer_device_manufacturer:(u=this.options.platform)===null||u===void 0?void 0:u.manufacturer,viewer_os_family:(g=this.options.platform)===null||g===void 0||(f=g.os)===null||f===void 0?void 0:f.family,viewer_os_architecture:(h=this.options.platform)===null||h===void 0||(k=h.os)===null||k===void 0?void 0:k.architecture,viewer_os_version:(m=this.options.platform)===null||m===void 0||(c=m.os)===null||c===void 0?void 0:c.version,viewer_connection_type:sr(),page_url:Ue.default===null||Ue.default===void 0||(w=Ue.default.location)===null||w===void 0?void 0:w.href},this.viewerData=this.disableCookies?{}:rr()}return N(r,[{key:"send",value:function(t,i){if(!(!t||!(i!=null&&i.view_id))){if(this.respectDoNotTrack&&ce())return R.info("Not sending `"+t+"` because Do Not Track is enabled");if(!i||typeof i!="object")return R.error("A data object was expected in send() but was not provided");var a=this.disableCookies?{}:ar(),n=fe(ue({},this.pageLevelData,i,a,this.viewerData),{event:t,env_key:this.envKey});n.user_id&&(n.viewer_user_id=n.user_id,delete n.user_id);var o,s=((o=n.mux_sample_number)!==null&&o!==void 0?o:0)>=this.sampleRate,u=this._deduplicateBeaconData(t,n),f=me(u);if(this.lastEventTime=this.mux.utils.now(),s)return R.info("Not sending event due to sample rate restriction",t,n,f);if(this.envKey||R.info("Missing environment key (envKey) - beacons will be dropped if the video source is not a valid mux video URL",t,n,f),!this.rateLimited)if(R.info("Sending event",t,n,f),this.rateLimited=!this.eventQueue.queueEvent(t,f),this.mux.WINDOW_UNLOADING&&t==="viewend")this.eventQueue.destroy(!0);else{if(this.mux.WINDOW_HIDDEN&&t==="hb")this.eventQueue.flushEvents(!0);else if(fi.indexOf(t)>=0){if(t==="error"&&i.player_error_severity==="warning")return;this.eventQueue.flushEvents()}if(this.rateLimited)return n.event="eventrateexceeded",f=me(n),this.eventQueue.queueEvent(n.event,f),R.error("Beaconing disabled due to rate limit.")}}}},{key:"destroy",value:function(){this.eventQueue.destroy(!1)}},{key:"_deduplicateBeaconData",value:function(t,i){var a=this,n={},o=i.view_id;if(o==="-1"||t==="viewstart"||t==="viewend"||!this.previousBeaconData||this.mux.utils.now()-this.lastEventTime>=pi)n=ue({},i),o&&(this.previousBeaconData=n),o&&t==="viewend"&&(this.previousBeaconData=null);else{var s=t.indexOf("request")===0;Object.entries(i).forEach(function(u){var f=H(u,2),g=f[0],k=f[1];a.previousBeaconData&&(k!==a.previousBeaconData[g]||li.indexOf(g)>-1||a.objectHasChanged(s,g,k,a.previousBeaconData[g])||a.eventRequiresKey(t,g))&&(n[g]=k,a.previousBeaconData[g]=k)})}return n}},{key:"objectHasChanged",value:function(t,i,a,n){return!t||i.indexOf("request_")!==0?!1:i==="request_response_headers"||typeof a!="object"||typeof n!="object"?!0:Object.keys(a||{}).length!==Object.keys(n||{}).length}},{key:"eventRequiresKey",value:function(t,i){return!!(t==="renditionchange"&&i.indexOf("video_source_")===0||_i.includes(i)&&ci.includes(t))}}]),r}();var mi=function r(e){"use strict";D(this,r);var t=0,i=0,a=0,n=0,o=0,s=0,u=0,f=function(h,c){var m=c.request_start,w=c.request_response_start,x=c.request_response_end,v=c.request_bytes_loaded;n++;var p,_;if(w?(p=w-(m!=null?m:0),_=(x!=null?x:0)-w):_=(x!=null?x:0)-(m!=null?m:0),_>0&&v&&v>0){var d=v/_*8e3;o++,i+=v,a+=_,e.data.view_min_request_throughput=Math.min(e.data.view_min_request_throughput||1/0,d),e.data.view_average_request_throughput=i/a*8e3,e.data.view_request_count=n,p>0&&(t+=p,e.data.view_max_request_latency=Math.max(e.data.view_max_request_latency||0,p),e.data.view_average_request_latency=t/o)}},g=function(h,c){n++,s++,e.data.view_request_count=n,e.data.view_request_failed_count=s},k=function(h,c){n++,u++,e.data.view_request_count=n,e.data.view_request_canceled_count=u};e.on("requestcompleted",f),e.on("requestfailed",g),e.on("requestcanceled",k)},Br=mi;var vi=60*60*1e3,hi=function r(e){"use strict";var t=this;D(this,r),l(this,"_lastEventTime",void 0),e.on("before*",function(i,a){var n=a.viewer_time,o=A.now(),s=t._lastEventTime;if(t._lastEventTime=o,s&&o-s>vi){var u=Object.keys(e.data).reduce(function(g,k){return k.indexOf("video_")===0?Object.assign(g,l({},k,e.data[k])):g},{});e.mux.log.info("Received event after at least an hour inactivity, creating a new view");var f=e.playbackHeartbeat._playheadShouldBeProgressing;e._resetView(Object.assign({viewer_time:n},u)),e.playbackHeartbeat._playheadShouldBeProgressing=f,e.playbackHeartbeat._playheadShouldBeProgressing&&i.type!=="play"&&i.type!=="adbreakstart"&&(e.emit("play",{viewer_time:n}),i.type!=="playing"&&e.emit("playing",{viewer_time:n}))}})},Ur=hi;var yi=function r(e){"use strict";D(this,r);var t=function(u){var f=gi(u),g=bi(u);if(f!=null&&!Fr(f,n)&&o<=g){n=f,o=g;var k={video_cdn:f};e.emit("cdnchange",k)}},i=null,a=null,n=null,o=0;e.on("viewinit",function(){i=null,a=null,n=null,o=0}),e.on("beforecdnchange",function(s,u){var f=u==null?void 0:u.video_cdn;f&&(typeof u.video_previous_cdn=="undefined"||u.video_previous_cdn===null)&&(Fr(f,a)?u.video_previous_cdn=i!=null?i:void 0:(u.video_previous_cdn=a!=null?a:void 0,i=a,a=f))}),e.on("requestcompleted",function(s,u){t(u)})};function Fr(r,e){return(r==null?void 0:r.toLowerCase())===(e==null?void 0:e.toLowerCase())}function gi(r){var e;return r!=null&&r.request_type&&(r.request_type==="media"||r.request_type==="video")&&(!((e=r.request_response_headers)===null||e===void 0)&&e["x-cdn"])?r.request_response_headers["x-cdn"]:r!=null&&r.video_cdn?r.video_cdn:null}function bi(r){return r!=null&&r.request_start?r.request_start:r!=null&&r.viewer_time?r.viewer_time:Date.now()}var Vr=yi;var wi=function(r){try{return JSON.parse(r),!0}catch(e){return!1}},Ti=function r(e){"use strict";var t=this;D(this,r),l(this,"_emittingAutomaticEvent",!1),l(this,"_hasInitialized",!1),e.on("viewstart",function(){t._hasInitialized||(t._hasInitialized=!0,t._emittingAutomaticEvent=!0,e.emit("playbackmodechange",{player_playback_mode:"standard",player_playback_mode_data:"{}"}),t._emittingAutomaticEvent=!1)}),e.on("viewend",function(){t._hasInitialized=!1}),e.on("playbackmodechange",function(i,a){t._emittingAutomaticEvent||(a.player_playback_mode_data?wi(a.player_playback_mode_data)||(e.mux.log.warn("Invalid JSON string for player_playback_mode_data"),a.player_playback_mode_data="{}"):a.player_playback_mode_data="{}",e.data.player_playback_mode_data=a.player_playback_mode_data,e.data.player_playback_mode=a.player_playback_mode)})},jr=Ti;var Ei=["viewstart","ended","loadstart","pause","play","playing","ratechange","waiting","adplay","adpause","adended","aderror","adplaying","adrequest","adresponse","adbreakstart","adbreakend","adfirstquartile","admidpoint","adthirdquartile","rebufferstart","rebufferend","seeked","error","hb","requestcompleted","requestfailed","requestcanceled","renditionchange","cdnchange","playbackmodechange"],ki=new Set(["requestcompleted","requestfailed","requestcanceled"]),xi=function(r){"use strict";xt(t,r);var e=At(t);function t(i,a,n){D(this,t);var o;o=e.call(this),l(b(o),"pageLoadEndTime",void 0),l(b(o),"pageLoadInitTime",void 0),l(b(o),"_destroyed",void 0),l(b(o),"_heartBeatTimeout",void 0),l(b(o),"adTracker",void 0),l(b(o),"dashjs",void 0),l(b(o),"data",void 0),l(b(o),"disablePlayheadRebufferTracking",void 0),l(b(o),"disableRebufferTracking",void 0),l(b(o),"errorTracker",void 0),l(b(o),"errorTranslator",void 0),l(b(o),"emitTranslator",void 0),l(b(o),"getAdData",void 0),l(b(o),"getPlayheadTime",void 0),l(b(o),"getStateData",void 0),l(b(o),"stateDataTranslator",void 0),l(b(o),"hlsjs",void 0),l(b(o),"id",void 0),l(b(o),"longResumeTracker",void 0),l(b(o),"minimumRebufferDuration",void 0),l(b(o),"mux",void 0),l(b(o),"playbackEventDispatcher",void 0),l(b(o),"playbackHeartbeat",void 0),l(b(o),"playbackHeartbeatTime",void 0),l(b(o),"playheadTime",void 0),l(b(o),"seekingTracker",void 0),l(b(o),"sustainedRebufferThreshold",void 0),l(b(o),"watchTimeTracker",void 0),l(b(o),"currentFragmentPDT",void 0),l(b(o),"currentFragmentStart",void 0),o.pageLoadInitTime=_e.navigationStart(),o.pageLoadEndTime=_e.domContentLoadedEventEnd();var s={debug:!1,minimumRebufferDuration:250,sustainedRebufferThreshold:1e3,playbackHeartbeatTime:25,beaconDomain:"litix.io",sampleRate:1,disableCookies:!1,respectDoNotTrack:!1,disableRebufferTracking:!1,disablePlayheadRebufferTracking:!1,errorTranslator:function(h){return h},emitTranslator:function(){for(var h=arguments.length,c=new Array(h),m=0;m<h;m++)c[m]=arguments[m];return c},stateDataTranslator:function(h){return h}};o.mux=i,o.id=a,n!=null&&n.beaconDomain&&o.mux.log.warn("The `beaconDomain` setting has been deprecated in favor of `beaconCollectionDomain`. Please change your integration to use `beaconCollectionDomain` instead of `beaconDomain`."),n=Object.assign(s,n),n.data=n.data||{},n.data.property_key&&(n.data.env_key=n.data.property_key,delete n.data.property_key),R.level=n.debug?Y.DEBUG:Y.WARN,o.getPlayheadTime=n.getPlayheadTime,o.getStateData=n.getStateData||function(){return{}},o.getAdData=n.getAdData||function(){},o.minimumRebufferDuration=n.minimumRebufferDuration,o.sustainedRebufferThreshold=n.sustainedRebufferThreshold,o.playbackHeartbeatTime=n.playbackHeartbeatTime,o.disableRebufferTracking=n.disableRebufferTracking,o.disableRebufferTracking&&o.mux.log.warn("Disabling rebuffer tracking. This should only be used in specific circumstances as a last resort when your player is known to unreliably track rebuffering."),o.disablePlayheadRebufferTracking=n.disablePlayheadRebufferTracking,o.errorTranslator=n.errorTranslator,o.emitTranslator=n.emitTranslator,o.stateDataTranslator=n.stateDataTranslator,o.playbackEventDispatcher=new Hr(i,n.data.env_key,n),o.data={player_instance_id:ee(),mux_sample_rate:n.sampleRate,beacon_domain:n.beaconCollectionDomain||n.beaconDomain},o.data.view_sequence_number=1,o.data.player_sequence_number=1;var u=function(){typeof this.data.view_start=="undefined"&&(this.data.view_start=this.mux.utils.now(),this.emit("viewstart"))}.bind(b(o));if(o.on("viewinit",function(h,c){this._resetVideoData(),this._resetViewData(),this._resetErrorData(),this._updateStateData(),Object.assign(this.data,c),this._initializeViewData(),this.one("play",u),this.one("adbreakstart",u)}),o.on("videochange",function(h,c){this._resetView(c)}),o.on("programchange",function(h,c){this.data.player_is_paused&&this.mux.log.warn("The `programchange` event is intended to be used when the content changes mid playback without the video source changing, however the video is not currently playing. If the video source is changing please use the videochange event otherwise you will lose startup time information."),this._resetView(Object.assign(c,{view_program_changed:!0})),u(),this.emit("play"),this.emit("playing")}),o.on("fragmentchange",function(h,c){this.currentFragmentPDT=c.currentFragmentPDT,this.currentFragmentStart=c.currentFragmentStart}),o.on("destroy",o.destroy),typeof window!="undefined"&&typeof window.addEventListener=="function"&&typeof window.removeEventListener=="function"){var f=function(){var h=typeof o.data.view_start!="undefined";o.mux.WINDOW_HIDDEN=document.visibilityState==="hidden",h&&o.mux.WINDOW_HIDDEN&&(o.data.player_is_paused||o.emit("hb"))};window.addEventListener("visibilitychange",f,!1);var g=function(h){h.persisted||o.destroy()};window.addEventListener("pagehide",g,!1),o.on("destroy",function(){window.removeEventListener("visibilitychange",f),window.removeEventListener("pagehide",g)})}o.on("playerready",function(h,c){Object.assign(this.data,c)}),Ei.forEach(function(h){o.on(h,function(c,m){h.indexOf("ad")!==0&&this._updateStateData(),Object.assign(this.data,m),this._sanitizeData()}),o.on("after"+h,function(){(h!=="error"||this.errorTracker.viewErrored)&&this.send(h)})}),o.on("viewend",function(h,c){Object.assign(o.data,c)});var k=function(c){var m=this.mux.utils.now();this.data.player_init_time&&(this.data.player_startup_time=m-this.data.player_init_time),this.pageLoadInitTime=this.data.page_load_init_time||this.pageLoadInitTime,this.pageLoadEndTime=this.data.page_load_end_time||this.pageLoadEndTime,!this.mux.PLAYER_TRACKED&&this.pageLoadInitTime&&(this.mux.PLAYER_TRACKED=!0,(this.data.player_init_time||this.pageLoadEndTime)&&(this.data.page_load_time=Math.min(this.data.player_init_time||1/0,this.pageLoadEndTime||1/0)-this.pageLoadInitTime)),this.send("playerready"),delete this.data.player_startup_time,delete this.data.page_load_time};return o.one("playerready",k),o.longResumeTracker=new Ur(b(o)),o.errorTracker=new Ut(b(o)),new $t(b(o)),o.seekingTracker=new Kt(b(o)),o.playheadTime=new jt(b(o)),o.playbackHeartbeat=new Bt(b(o)),new zt(b(o)),o.watchTimeTracker=new Ft(b(o)),new Vt(b(o)),o.adTracker=new Xt(b(o)),new Jt(b(o)),new Gt(b(o)),new Qt(b(o)),new Br(b(o)),new Vr(b(o)),new jr(b(o)),n.hlsjs&&o.addHLSJS(n),n.dashjs&&o.addDashJS(n),o.emit("viewinit",n.data),o}return N(t,[{key:"emit",value:function(a,n){var o,s=Object.assign({viewer_time:this.mux.utils.now()},n),u=[a,s];if(this.emitTranslator)try{u=this.emitTranslator(a,s)}catch(f){this.mux.log.warn("Exception in emit translator callback.",f)}u!=null&&u.length&&(o=De(X(t.prototype),"emit",this)).call.apply(o,[this].concat(V(u)))}},{key:"destroy",value:function(){this._destroyed||(this._destroyed=!0,typeof this.data.view_start!="undefined"&&(this.emit("viewend"),this.send("viewend")),this.playbackEventDispatcher.destroy(),this.removeHLSJS(),this.removeDashJS(),window.clearTimeout(this._heartBeatTimeout))}},{key:"send",value:function(a){if(this.data.view_id){var n=Object.assign({},this.data),o=["player_program_time","player_manifest_newest_program_time","player_live_edge_program_time","player_program_time","video_holdback","video_part_holdback","video_target_duration","video_part_target_duration"];if(n.video_source_is_live===void 0&&(n.player_source_duration===1/0||n.video_source_duration===1/0?n.video_source_is_live=!0:(n.player_source_duration>0||n.video_source_duration>0)&&(n.video_source_is_live=!1)),n.video_source_is_live||o.forEach(function(g){n[g]=void 0}),n.video_source_url=n.video_source_url||n.player_source_url,n.video_source_url){var s=H(re(n.video_source_url),2),u=s[0],f=s[1];n.video_source_domain=f,n.video_source_hostname=u}delete n.ad_request_id,this.playbackEventDispatcher.send(a,n),this.data.view_sequence_number++,this.data.player_sequence_number++,ki.has(a)||this._restartHeartBeat(),a==="viewend"&&delete this.data.view_id}}},{key:"_resetView",value:function(a){this.emit("viewend"),this.send("viewend"),this.emit("viewinit",a)}},{key:"_updateStateData",value:function(){var a,n=this.getStateData();if(typeof this.stateDataTranslator=="function")try{n=this.stateDataTranslator(n)}catch(u){this.mux.log.warn("Exception in stateDataTranslator translator callback.",u)}if(!((a=this.data)===null||a===void 0)&&a.video_cdn&&(n!=null&&n.video_cdn)){var o=n.video_cdn,s=St(n,["video_cdn"]);n=s}Object.assign(this.data,n),this.playheadTime._updatePlayheadTime(),this._sanitizeData()}},{key:"_sanitizeData",value:function(){var a=this,n=["player_width","player_height","video_source_width","video_source_height","player_playhead_time","video_source_bitrate"];n.forEach(function(s){var u=parseInt(a.data[s],10);a.data[s]=isNaN(u)?void 0:u});var o=["player_source_url","video_source_url"];o.forEach(function(s){if(a.data[s]){var u=a.data[s].toLowerCase();(u.indexOf("data:")===0||u.indexOf("blob:")===0)&&(a.data[s]="MSE style URL")}})}},{key:"_resetVideoData",value:function(){var a=this;Object.keys(this.data).forEach(function(n){n.indexOf("video_")===0&&delete a.data[n]})}},{key:"_resetViewData",value:function(){var a=this;Object.keys(this.data).forEach(function(n){n.indexOf("view_")===0&&delete a.data[n]}),this.data.view_sequence_number=1}},{key:"_resetErrorData",value:function(){delete this.data.player_error_code,delete this.data.player_error_message,delete this.data.player_error_context,delete this.data.player_error_severity,delete this.data.player_error_business_exception}},{key:"_initializeViewData",value:function(){var a=this,n=this.data.view_id=ee(),o=function(){n===a.data.view_id&&P(a.data,"player_view_count",1)};this.data.player_is_paused?this.one("play",o):o()}},{key:"_restartHeartBeat",value:function(){var a=this;window.clearTimeout(this._heartBeatTimeout),this._heartBeatTimeout=window.setTimeout(function(){a.data.player_is_paused||a.emit("hb")},1e4)}},{key:"addHLSJS",value:function(a){if(!a.hlsjs){this.mux.log.warn("You must pass a valid hlsjs instance in order to track it.");return}if(this.hlsjs){this.mux.log.warn("An instance of HLS.js is already being monitored for this player.");return}this.hlsjs=a.hlsjs,Ot(this.mux,this.id,a.hlsjs,{},a.Hls||window.Hls)}},{key:"removeHLSJS",value:function(){this.hlsjs&&(It(this.hlsjs),this.hlsjs=void 0)}},{key:"addDashJS",value:function(a){if(!a.dashjs){this.mux.log.warn("You must pass a valid dashjs instance in order to track it.");return}if(this.dashjs){this.mux.log.warn("An instance of Dash.js is already being monitored for this player.");return}this.dashjs=a.dashjs,Nt(this.mux,this.id,a.dashjs)}},{key:"removeDashJS",value:function(){this.dashjs&&(Ct(this.dashjs),this.dashjs=void 0)}}]),t}(Ht),Wr=xi;var he=G(it());function nt(){return he.default&&!!(he.default.fullscreenElement||he.default.webkitFullscreenElement||he.default.mozFullScreenElement||he.default.msFullscreenElement)}var Di=["loadstart","pause","play","playing","seeking","seeked","timeupdate","ratechange","stalled","waiting","error","ended"],Si={1:"MEDIA_ERR_ABORTED",2:"MEDIA_ERR_NETWORK",3:"MEDIA_ERR_DECODE",4:"MEDIA_ERR_SRC_NOT_SUPPORTED"};function ot(r,e,t){var i=H(se(e),3),a=i[0],n=i[1],o=i[2],s=r.log,u=r.utils.getComputedStyle,f=r.utils.secondsToMs,g={automaticErrorTracking:!0};if(a){if(o!=="video"&&o!=="audio")return s.error("The element of `"+n+"` was not a media element.")}else return s.error("No element was found with the `"+n+"` query selector.");a.mux&&(a.mux.destroy(),delete a.mux,s.warn("Already monitoring this video element, replacing existing event listeners"));var k={getPlayheadTime:function(){return f(a.currentTime)},getStateData:function(){var m,w,x,v=((m=(w=this).getPlayheadTime)===null||m===void 0?void 0:m.call(w))||f(a.currentTime),p=this.hlsjs&&this.hlsjs.url,_=this.dashjs&&typeof this.dashjs.getSource=="function"&&this.dashjs.getSource(),d={player_is_paused:a.paused,player_width:parseInt(u(a,"width")),player_height:parseInt(u(a,"height")),player_autoplay_on:a.autoplay,player_preload_on:a.preload,player_language_code:a.lang,player_is_fullscreen:nt(),video_poster_url:a.poster,video_source_url:p||_||a.currentSrc,video_source_duration:f(a.duration),video_source_height:a.videoHeight,video_source_width:a.videoWidth,view_dropped_frame_count:a==null||(x=a.getVideoPlaybackQuality)===null||x===void 0?void 0:x.call(a).droppedVideoFrames};if(a.getStartDate&&v>0){var y=a.getStartDate();if(y&&typeof y.getTime=="function"&&y.getTime()){var T=y.getTime();if(d.player_program_time=T+v,a.seekable.length>0){var E=T+a.seekable.end(a.seekable.length-1);d.player_live_edge_program_time=E}}}return d}};t=Object.assign(g,t,k),t.data=Object.assign({player_software:"HTML5 Video Element",player_mux_plugin_name:"VideoElementMonitor",player_mux_plugin_version:r.VERSION},t.data),a.mux=a.mux||{},a.mux.deleted=!1,a.mux.emit=function(c,m){r.emit(n,c,m)},a.mux.updateData=function(c){a.mux.emit("hb",c)};var h=function(){s.error("The monitor for this video element has already been destroyed.")};a.mux.destroy=function(){Object.keys(a.mux.listeners).forEach(function(c){a.removeEventListener(c,a.mux.listeners[c],!1)}),delete a.mux.listeners,a.mux.destroy=h,a.mux.swapElement=h,a.mux.emit=h,a.mux.addHLSJS=h,a.mux.addDashJS=h,a.mux.removeHLSJS=h,a.mux.removeDashJS=h,a.mux.updateData=h,a.mux.setEmitTranslator=h,a.mux.setStateDataTranslator=h,a.mux.setGetPlayheadTime=h,a.mux.deleted=!0,r.emit(n,"destroy")},a.mux.swapElement=function(c){var m=H(se(c),3),w=m[0],x=m[1],v=m[2];if(w){if(v!=="video"&&v!=="audio")return r.log.error("The element of `"+x+"` was not a media element.")}else return r.log.error("No element was found with the `"+x+"` query selector.");w.muxId=a.muxId,delete a.muxId,w.mux=w.mux||{},w.mux.listeners=Object.assign({},a.mux.listeners),delete a.mux.listeners,Object.keys(w.mux.listeners).forEach(function(p){a.removeEventListener(p,w.mux.listeners[p],!1),w.addEventListener(p,w.mux.listeners[p],!1)}),w.mux.swapElement=a.mux.swapElement,w.mux.destroy=a.mux.destroy,delete a.mux,a=w},a.mux.addHLSJS=function(c){r.addHLSJS(n,c)},a.mux.addDashJS=function(c){r.addDashJS(n,c)},a.mux.removeHLSJS=function(){r.removeHLSJS(n)},a.mux.removeDashJS=function(){r.removeDashJS(n)},a.mux.setEmitTranslator=function(c){r.setEmitTranslator(n,c)},a.mux.setStateDataTranslator=function(c){r.setStateDataTranslator(n,c)},a.mux.setGetPlayheadTime=function(c){c||(c=t.getPlayheadTime),r.setGetPlayheadTime(n,c)},r.init(n,t),r.emit(n,"playerready"),a.paused||(r.emit(n,"play"),a.readyState>2&&r.emit(n,"playing")),a.mux.listeners={},Di.forEach(function(c){c==="error"&&!t.automaticErrorTracking||(a.mux.listeners[c]=function(){var m={};if(c==="error"){if(!a.error||a.error.code===1)return;m.player_error_code=a.error.code,m.player_error_message=Si[a.error.code]||a.error.message}r.emit(n,c,m)},a.addEventListener(c,a.mux.listeners[c],!1))})}function st(r,e,t,i){var a=i;if(r&&typeof r[e]=="function")try{a=r[e].apply(r,t)}catch(n){R.info("safeCall error",n)}return a}var ge=G(Q()),ye;ge.default&&ge.default.WeakMap&&(ye=new WeakMap);function ut(r,e){if(!r||!e||!ge.default||typeof ge.default.getComputedStyle!="function")return"";var t;return ye&&ye.has(r)&&(t=ye.get(r)),t||(t=ge.default.getComputedStyle(r,null),ye&&ye.set(r,t)),t.getPropertyValue(e)}function dt(r){return Math.floor(r*1e3)}var le={TARGET_DURATION:"#EXT-X-TARGETDURATION",PART_INF:"#EXT-X-PART-INF",SERVER_CONTROL:"#EXT-X-SERVER-CONTROL",INF:"#EXTINF",PROGRAM_DATE_TIME:"#EXT-X-PROGRAM-DATE-TIME",VERSION:"#EXT-X-VERSION",SESSION_DATA:"#EXT-X-SESSION-DATA"},Fe=function(e){return this.buffer="",this.manifest={segments:[],serverControl:{},sessionData:{}},this.currentUri={},this.process(e),this.manifest};Fe.prototype.process=function(r){var e;for(this.buffer+=r,e=this.buffer.indexOf("\n");e>-1;e=this.buffer.indexOf("\n"))this.processLine(this.buffer.substring(0,e)),this.buffer=this.buffer.substring(e+1)};Fe.prototype.processLine=function(r){var e=r.indexOf(":"),t=Pi(r,e),i=t[0],a=t.length===2?ct(t[1]):void 0;if(i[0]!=="#")this.currentUri.uri=i,this.manifest.segments.push(this.currentUri),this.manifest.targetDuration&&!("duration"in this.currentUri)&&(this.currentUri.duration=this.manifest.targetDuration),this.currentUri={};else switch(i){case le.TARGET_DURATION:{if(!isFinite(a)||a<0)return;this.manifest.targetDuration=a,this.setHoldBack();break}case le.PART_INF:{lt(this.manifest,t),this.manifest.partInf.partTarget&&(this.manifest.partTargetDuration=this.manifest.partInf.partTarget),this.setHoldBack();break}case le.SERVER_CONTROL:{lt(this.manifest,t),this.setHoldBack();break}case le.INF:{a===0?this.currentUri.duration=.01:a>0&&(this.currentUri.duration=a);break}case le.PROGRAM_DATE_TIME:{var n=a,o=new Date(n);this.manifest.dateTimeString||(this.manifest.dateTimeString=n,this.manifest.dateTimeObject=o),this.currentUri.dateTimeString=n,this.currentUri.dateTimeObject=o;break}case le.VERSION:{lt(this.manifest,t);break}case le.SESSION_DATA:{var s=Oi(t[1]),u=Ce(s);Object.assign(this.manifest.sessionData,u)}}};Fe.prototype.setHoldBack=function(){var r=this.manifest,e=r.serverControl,t=r.targetDuration,i=r.partTargetDuration;if(e){var a="holdBack",n="partHoldBack",o=t&&t*3,s=i&&i*2;t&&!e.hasOwnProperty(a)&&(e[a]=o),o&&e[a]<o&&(e[a]=o),i&&!e.hasOwnProperty(n)&&(e[n]=i*3),i&&e[n]<s&&(e[n]=s)}};var lt=function(r,e){var t=Gr(e[0].replace("#EXT-X-","")),i;Ai(e[1])?(i={},i=Object.assign(Ri(e[1]),i)):i=ct(e[1]),r[t]=i},Gr=function(r){return r.toLowerCase().replace(/-(\w)/g,function(e){return e[1].toUpperCase()})},ct=function(r){if(r.toLowerCase()==="yes"||r.toLowerCase()==="no")return r.toLowerCase()==="yes";var e=r.indexOf(":")!==-1?r:parseFloat(r);return isNaN(e)?r:e},qi=function(r){var e={},t=r.split("=");if(t.length>1){var i=Gr(t[0]);e[i]=ct(t[1])}return e},Ri=function(r){for(var e=r.split(","),t={},i=0;e.length>i;i++){var a=e[i],n=qi(a);t=Object.assign(n,t)}return t},Ai=function(r){return r.indexOf("=")>-1},Pi=function(r,e){return e===-1?[r]:[r.substring(0,e),r.substring(e+1)]},Oi=function(r){var e={};if(r){var t=r.search(","),i=r.slice(0,t),a=r.slice(t+1),n=[i,a];return n.forEach(function(o,s){for(var u=o.replace(/['"]+/g,"").split("="),f=0;f<u.length;f++)u[f]==="DATA-ID"&&(e["DATA-ID"]=u[1-f]),u[f]==="VALUE"&&(e.VALUE=u[1-f])}),{data:e}}},Jr=Fe;var Ii={safeCall:st,safeIncrement:P,getComputedStyle:ut,secondsToMs:dt,assign:Object.assign,headersStringToObject:pe,cdnHeadersToRequestId:de,extractHostnameAndDomain:re,extractHostname:F,manifestParser:Jr,generateShortID:Pe,generateUUID:ee,now:A.now,findMediaElement:se},Qr=Ii;var Li={PLAYER_READY:"playerready",VIEW_INIT:"viewinit",VIDEO_CHANGE:"videochange",PLAY:"play",PAUSE:"pause",PLAYING:"playing",TIME_UPDATE:"timeupdate",SEEKING:"seeking",SEEKED:"seeked",REBUFFER_START:"rebufferstart",REBUFFER_END:"rebufferend",ERROR:"error",ENDED:"ended",RENDITION_CHANGE:"renditionchange",ORIENTATION_CHANGE:"orientationchange",PLAYBACK_MODE_CHANGE:"playbackmodechange",AD_REQUEST:"adrequest",AD_RESPONSE:"adresponse",AD_BREAK_START:"adbreakstart",AD_PLAY:"adplay",AD_PLAYING:"adplaying",AD_PAUSE:"adpause",AD_FIRST_QUARTILE:"adfirstquartile",AD_MID_POINT:"admidpoint",AD_THIRD_QUARTILE:"adthirdquartile",AD_ENDED:"adended",AD_BREAK_END:"adbreakend",AD_ERROR:"aderror",REQUEST_COMPLETED:"requestcompleted",REQUEST_FAILED:"requestfailed",REQUEST_CANCELLED:"requestcanceled",HEARTBEAT:"hb",DESTROY:"destroy"},zr=Li;var Ni="mux-embed",Ci="5.13.0",Mi="2.1",C={},ne=function(e){var t=arguments;typeof e=="string"?ne.hasOwnProperty(e)?be.default.setTimeout(function(){t=Array.prototype.splice.call(t,1),ne[e].apply(null,t)},0):R.warn("`"+e+"` is an unknown task"):typeof e=="function"?be.default.setTimeout(function(){e(ne)},0):R.warn("`"+e+"` is invalid.")},Hi={loaded:A.now(),NAME:Ni,VERSION:Ci,API_VERSION:Mi,PLAYER_TRACKED:!1,monitor:function(e,t){return ot(ne,e,t)},destroyMonitor:function(e){var t=H(se(e),1),i=t[0];i&&i.mux&&typeof i.mux.destroy=="function"?i.mux.destroy():R.error("A video element monitor for `"+e+"` has not been initialized via `mux.monitor`.")},addHLSJS:function(e,t){var i=J(e);C[i]?C[i].addHLSJS(t):R.error("A monitor for `"+i+"` has not been initialized.")},addDashJS:function(e,t){var i=J(e);C[i]?C[i].addDashJS(t):R.error("A monitor for `"+i+"` has not been initialized.")},removeHLSJS:function(e){var t=J(e);C[t]?C[t].removeHLSJS():R.error("A monitor for `"+t+"` has not been initialized.")},removeDashJS:function(e){var t=J(e);C[t]?C[t].removeDashJS():R.error("A monitor for `"+t+"` has not been initialized.")},init:function(e,t){ce()&&t&&t.respectDoNotTrack&&R.info("The browser's Do Not Track flag is enabled - Mux beaconing is disabled.");var i=J(e);C[i]=new Wr(ne,i,t)},emit:function(e,t,i){var a=J(e);C[a]?(C[a].emit(t,i),t==="destroy"&&delete C[a]):R.error("A monitor for `"+a+"` has not been initialized.")},updateData:function(e,t){var i=J(e);C[i]?C[i].emit("hb",t):R.error("A monitor for `"+i+"` has not been initialized.")},setEmitTranslator:function(e,t){var i=J(e);C[i]?C[i].emitTranslator=t:R.error("A monitor for `"+i+"` has not been initialized.")},setStateDataTranslator:function(e,t){var i=J(e);C[i]?C[i].stateDataTranslator=t:R.error("A monitor for `"+i+"` has not been initialized.")},setGetPlayheadTime:function(e,t){var i=J(e);C[i]?C[i].getPlayheadTime=t:R.error("A monitor for `"+i+"` has not been initialized.")},checkDoNotTrack:ce,log:R,utils:Qr,events:zr,WINDOW_HIDDEN:!1,WINDOW_UNLOADING:!1};Object.assign(ne,Hi);typeof be.default!="undefined"&&typeof be.default.addEventListener=="function"&&be.default.addEventListener("pagehide",function(r){r.persisted||(ne.WINDOW_UNLOADING=!0)},!1);var Cd=ne;
/*!
* JavaScript Cookie v2.1.3
* https://github.com/js-cookie/js-cookie
*
* Copyright 2006, 2015 Klaus Hartl & Fagner Brack
* Released under the MIT license
*/

// EXTERNAL MODULE: ../node_modules/hls.js/dist/hls.mjs
var hls = __webpack_require__(152);
;// ../node_modules/@mux/playback-core/dist/index.mjs
var g=hls/* default */.Ay;var dist_C={VIDEO:"video",THUMBNAIL:"thumbnail",STORYBOARD:"storyboard",DRM:"drm"},dist_D={NOT_AN_ERROR:0,NETWORK_OFFLINE:2000002,NETWORK_UNKNOWN_ERROR:2e6,NETWORK_NO_STATUS:2000001,NETWORK_INVALID_URL:24e5,NETWORK_NOT_FOUND:2404e3,NETWORK_NOT_READY:2412e3,NETWORK_GENERIC_SERVER_FAIL:25e5,NETWORK_TOKEN_MISSING:2403201,NETWORK_TOKEN_MALFORMED:2412202,NETWORK_TOKEN_EXPIRED:2403210,NETWORK_TOKEN_AUD_MISSING:2403221,NETWORK_TOKEN_AUD_MISMATCH:2403222,NETWORK_TOKEN_SUB_MISMATCH:2403232,ENCRYPTED_ERROR:5e6,ENCRYPTED_UNSUPPORTED_KEY_SYSTEM:5000001,ENCRYPTED_GENERATE_REQUEST_FAILED:5000002,ENCRYPTED_UPDATE_LICENSE_FAILED:5000003,ENCRYPTED_UPDATE_SERVER_CERT_FAILED:5000004,ENCRYPTED_CDM_ERROR:5000005,ENCRYPTED_OUTPUT_RESTRICTED:5000006,ENCRYPTED_MISSING_TOKEN:5000002},dist_V=e=>e===dist_C.VIDEO?"playback":e,L=class L extends Error{constructor(t,r=L.MEDIA_ERR_CUSTOM,n,o){var a;super(t),this.name="MediaError",this.code=r,this.context=o,this.fatal=n!=null?n:r>=L.MEDIA_ERR_NETWORK&&r<=L.MEDIA_ERR_ENCRYPTED,this.message||(this.message=(a=L.defaultMessages[this.code])!=null?a:"")}};L.MEDIA_ERR_ABORTED=1,L.MEDIA_ERR_NETWORK=2,L.MEDIA_ERR_DECODE=3,L.MEDIA_ERR_SRC_NOT_SUPPORTED=4,L.MEDIA_ERR_ENCRYPTED=5,L.MEDIA_ERR_CUSTOM=100,L.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail.",3:"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",4:"An unsupported error occurred. The server or network failed, or your browser does not support this format.",5:"The media is encrypted and there are no keys to decrypt it."};var f=L;var at=e=>e==null,O=(e,t)=>at(t)?!1:e in t,K={ANY:"any",MUTED:"muted"},dist_={ON_DEMAND:"on-demand",LIVE:"live",UNKNOWN:"unknown"},dist_X={MSE:"mse",NATIVE:"native"},S={HEADER:"header",QUERY:"query",NONE:"none"},dist_Zt=Object.values(S),I={M3U8:"application/vnd.apple.mpegurl",MP4:"video/mp4"},W={HLS:I.M3U8},dist_er=Object.keys(W),dist_tr=[...Object.values(I),"hls","HLS"],dist_rr={upTo720p:"720p",upTo1080p:"1080p",upTo1440p:"1440p",upTo2160p:"2160p"},dist_nr={noLessThan480p:"480p",noLessThan540p:"540p",noLessThan720p:"720p",noLessThan1080p:"1080p",noLessThan1440p:"1440p",noLessThan2160p:"2160p"},dist_or={DESCENDING:"desc"};var dist_st="en",dist_Y={code:dist_st};var v=(e,t,r,n,o=e)=>{o.addEventListener(t,r,n),e.addEventListener("teardown",()=>{o.removeEventListener(t,r)},{once:!0})};function Te(e,t,r){t&&r>t&&(r=t);for(let n=0;n<e.length;n++)if(e.start(n)<=r&&e.end(n)>=r)return!0;return!1}var dist_F=e=>{let t=e.indexOf("?");if(t<0)return[e];let r=e.slice(0,t),n=e.slice(t);return[r,n]},dist_U=e=>{let{type:t}=e;if(t){let r=t.toUpperCase();return O(r,W)?W[r]:t}return dist_it(e)},dist_Q=e=>e==="VOD"?dist_.ON_DEMAND:dist_.LIVE,Z=e=>e==="EVENT"?Number.POSITIVE_INFINITY:e==="VOD"?Number.NaN:0,dist_it=e=>{let{src:t}=e;if(!t)return"";let r="";try{r=new URL(t).pathname}catch{console.error("invalid url")}let n=r.lastIndexOf(".");if(n<0)return dist_ut(e)?I.M3U8:"";let a=r.slice(n+1).toUpperCase();return O(a,I)?I[a]:""},dist_ct="mux.com",dist_ut=({src:e,customDomain:t=dist_ct})=>{let r;try{r=new URL(`${e}`)}catch{return!1}let n=r.protocol==="https:",o=r.hostname===`stream.${t}`.toLowerCase(),a=r.pathname.split("/"),i=a.length===2,c=!(a!=null&&a[1].includes("."));return n&&o&&i&&c},dist_ee=e=>{let t=(e!=null?e:"").split(".")[1];if(t)try{let r=t.replace(/-/g,"+").replace(/_/g,"/"),n=decodeURIComponent(atob(r).split("").map(function(o){return"%"+("00"+o.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(n)}catch{return}},dist_ye=({exp:e},t=Date.now())=>!e||e*1e3<t,dist_me=({sub:e},t)=>e!==t,Ee=({aud:e},t)=>!e,dist_ge=({aud:e},t)=>e!==t,dist_Me="en";function x(e,t=!0){var o,a;let r=t&&(a=(o=dist_Y)==null?void 0:o[e])!=null?a:e,n=t?dist_Y.code:dist_Me;return new z(r,n)}var z=class{constructor(t,r=(n=>(n=dist_Y)!=null?n:dist_Me)()){this.message=t,this.locale=r}format(t){return this.message.replace(/\{(\w+)\}/g,(r,n)=>{var o;return(o=t[n])!=null?o:""})}toString(){return this.message}};var dist_dt=Object.values(K),xe=e=>typeof e=="boolean"||typeof e=="string"&&dist_dt.includes(e),Re=(e,t,r)=>{let{autoplay:n}=e,o=!1,a=!1,i=xe(n)?n:!!n,c=()=>{o||v(t,"playing",()=>{o=!0},{once:!0})};if(c(),v(t,"loadstart",()=>{o=!1,c(),dist_te(t,i)},{once:!0}),v(t,"loadstart",()=>{r||(e.streamType&&e.streamType!==dist_.UNKNOWN?a=e.streamType===dist_.LIVE:a=!Number.isFinite(t.duration)),dist_te(t,i)},{once:!0}),r&&r.once(g.Events.LEVEL_LOADED,(u,s)=>{var p;e.streamType&&e.streamType!==dist_.UNKNOWN?a=e.streamType===dist_.LIVE:a=(p=s.details.live)!=null?p:!1}),!i){let u=()=>{!a||Number.isFinite(e.startTime)||(r!=null&&r.liveSyncPosition?t.currentTime=r.liveSyncPosition:Number.isFinite(t.seekable.end(0))&&(t.currentTime=t.seekable.end(0)))};r&&v(t,"play",()=>{t.preload==="metadata"?r.once(g.Events.LEVEL_UPDATED,u):u()},{once:!0})}return u=>{o||(i=xe(u)?u:!!u,dist_te(t,i))}},dist_te=(e,t)=>{if(!t)return;let r=e.muted,n=()=>e.muted=r;switch(t){case K.ANY:e.play().catch(()=>{e.muted=!0,e.play().catch(n)});break;case K.MUTED:e.muted=!0,e.play().catch(n);break;default:e.play().catch(()=>{});break}};var dist_be=({preload:e,src:t},r,n)=>{let o=p=>{p!=null&&["","none","metadata","auto"].includes(p)?r.setAttribute("preload",p):r.removeAttribute("preload")};if(!n)return o(e),o;let a=!1,i=!1,c=n.config.maxBufferLength,d=n.config.maxBufferSize,u=p=>{o(p);let l=p!=null?p:r.preload;i||l==="none"||(l==="metadata"?(n.config.maxBufferLength=1,n.config.maxBufferSize=1):(n.config.maxBufferLength=c,n.config.maxBufferSize=d),s())},s=()=>{!a&&t&&(a=!0,n.loadSource(t))};return v(r,"play",()=>{i=!0,n.config.maxBufferLength=c,n.config.maxBufferSize=d,s()},{once:!0}),u(e),u};function dist_De(e,t){var c;if(!("videoTracks"in e))return;let r=new WeakMap;t.on(g.Events.MANIFEST_PARSED,function(d,u){i();let s=e.addVideoTrack("main");s.selected=!0;for(let[p,l]of u.levels.entries()){let T=s.addRendition(l.url[0],l.width,l.height,l.videoCodec,l.bitrate);r.set(l,`${p}`),T.id=`${p}`}}),t.on(g.Events.AUDIO_TRACKS_UPDATED,function(d,u){a();for(let s of u.audioTracks){let p=s.default?"main":"alternative",l=e.addAudioTrack(p,s.name,s.lang);l.id=`${s.id}`,s.default&&(l.enabled=!0)}}),e.audioTracks.addEventListener("change",()=>{var s;let d=+((s=[...e.audioTracks].find(p=>p.enabled))==null?void 0:s.id),u=t.audioTracks.map(p=>p.id);d!=t.audioTrack&&u.includes(d)&&(t.audioTrack=d)}),t.on(g.Events.LEVELS_UPDATED,function(d,u){var l;let s=e.videoTracks[(l=e.videoTracks.selectedIndex)!=null?l:0];if(!s)return;let p=u.levels.map(T=>r.get(T));for(let T of e.videoRenditions)T.id&&!p.includes(T.id)&&s.removeRendition(T)});let n=d=>{let u=d.target.selectedIndex;u!=t.nextLevel&&(t.nextLevel=u)};(c=e.videoRenditions)==null||c.addEventListener("change",n);let o=()=>{for(let d of e.videoTracks)e.removeVideoTrack(d)},a=()=>{for(let d of e.audioTracks)e.removeAudioTrack(d)},i=()=>{o(),a()};t.once(g.Events.DESTROYING,i)}var dist_re=e=>"time"in e?e.time:e.startTime;function dist_Ce(e,t){t.on(g.Events.NON_NATIVE_TEXT_TRACKS_FOUND,(o,{tracks:a})=>{a.forEach(i=>{var s,p;let c=(s=i.subtitleTrack)!=null?s:i.closedCaptions,d=t.subtitleTracks.findIndex(({lang:l,name:T,type:m})=>l==(c==null?void 0:c.lang)&&T===i.label&&m.toLowerCase()===i.kind),u=((p=i._id)!=null?p:i.default)?"default":`${i.kind}${d}`;dist_ne(e,i.kind,i.label,c==null?void 0:c.lang,u,i.default)})});let r=()=>{if(!t.subtitleTracks.length)return;let o=Array.from(e.textTracks).find(c=>c.id&&c.mode==="showing"&&["subtitles","captions"].includes(c.kind));if(!o)return;let a=t.subtitleTracks[t.subtitleTrack],i=a?a.default?"default":`${t.subtitleTracks[t.subtitleTrack].type.toLowerCase()}${t.subtitleTrack}`:void 0;if(t.subtitleTrack<0||(o==null?void 0:o.id)!==i){let c=t.subtitleTracks.findIndex(({lang:d,name:u,type:s,default:p})=>o.id==="default"&&p||d==o.language&&u===o.label&&s.toLowerCase()===o.kind);t.subtitleTrack=c}(o==null?void 0:o.id)===i&&o.cues&&Array.from(o.cues).forEach(c=>{o.addCue(c)})};e.textTracks.addEventListener("change",r),t.on(g.Events.CUES_PARSED,(o,{track:a,cues:i})=>{let c=e.textTracks.getTrackById(a);if(!c)return;let d=c.mode==="disabled";d&&(c.mode="hidden"),i.forEach(u=>{var s;(s=c.cues)!=null&&s.getCueById(u.id)||c.addCue(u)}),d&&(c.mode="disabled")}),t.once(g.Events.DESTROYING,()=>{e.textTracks.removeEventListener("change",r),e.querySelectorAll("track[data-removeondestroy]").forEach(a=>{a.remove()})});let n=()=>{Array.from(e.textTracks).forEach(o=>{var a,i;if(!["subtitles","caption"].includes(o.kind)&&(o.label==="thumbnails"||o.kind==="chapters")){if(!((a=o.cues)!=null&&a.length)){let c="track";o.kind&&(c+=`[kind="${o.kind}"]`),o.label&&(c+=`[label="${o.label}"]`);let d=e.querySelector(c),u=(i=d==null?void 0:d.getAttribute("src"))!=null?i:"";d==null||d.removeAttribute("src"),setTimeout(()=>{d==null||d.setAttribute("src",u)},0)}o.mode!=="hidden"&&(o.mode="hidden")}})};t.once(g.Events.MANIFEST_LOADED,n),t.once(g.Events.MEDIA_ATTACHED,n)}function dist_ne(e,t,r,n,o,a){let i=document.createElement("track");return i.kind=t,i.label=r,n&&(i.srclang=n),o&&(i.id=o),a&&(i.default=!0),i.track.mode=["subtitles","captions"].includes(t)?"disabled":"hidden",i.setAttribute("data-removeondestroy",""),e.append(i),i.track}function dist_lt(e,t){let r=Array.prototype.find.call(e.querySelectorAll("track"),n=>n.track===t);r==null||r.remove()}function w(e,t,r){var n;return(n=Array.from(e.querySelectorAll("track")).find(o=>o.track.label===t&&o.track.kind===r))==null?void 0:n.track}async function ve(e,t,r,n){let o=w(e,r,n);return o||(o=dist_ne(e,n,r),o.mode="hidden",await new Promise(a=>setTimeout(()=>a(void 0),0))),o.mode!=="hidden"&&(o.mode="hidden"),[...t].sort((a,i)=>dist_re(i)-dist_re(a)).forEach(a=>{var d,u;let i=a.value,c=dist_re(a);if("endTime"in a&&a.endTime!=null)o==null||o.addCue(new VTTCue(c,a.endTime,n==="chapters"?i:JSON.stringify(i!=null?i:null)));else{let s=Array.prototype.findIndex.call(o==null?void 0:o.cues,m=>m.startTime>=c),p=(d=o==null?void 0:o.cues)==null?void 0:d[s],l=p?p.startTime:Number.isFinite(e.duration)?e.duration:Number.MAX_SAFE_INTEGER,T=(u=o==null?void 0:o.cues)==null?void 0:u[s-1];T&&(T.endTime=c),o==null||o.addCue(new VTTCue(c,l,n==="chapters"?i:JSON.stringify(i!=null?i:null)))}}),e.textTracks.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),o}var oe="cuepoints",dist_Pe=Object.freeze({label:oe});async function dist_e(e,t,r=dist_Pe){return ve(e,t,r.label,"metadata")}var dist_$=e=>({time:e.startTime,value:JSON.parse(e.text)});function dist_pt(e,t={label:oe}){let r=w(e,t.label,"metadata");return r!=null&&r.cues?Array.from(r.cues,n=>dist_$(n)):[]}function dist_ke(e,t={label:oe}){var a,i;let r=w(e,t.label,"metadata");if(!((a=r==null?void 0:r.activeCues)!=null&&a.length))return;if(r.activeCues.length===1)return dist_$(r.activeCues[0]);let{currentTime:n}=e,o=Array.prototype.find.call((i=r.activeCues)!=null?i:[],({startTime:c,endTime:d})=>c<=n&&d>n);return dist_$(o||r.activeCues[0])}async function dist_he(e,t=dist_Pe){return new Promise(r=>{v(e,"loadstart",async()=>{let n=await dist_e(e,[],t);v(e,"cuechange",()=>{let o=dist_ke(e);if(o){let a=new CustomEvent("cuepointchange",{composed:!0,bubbles:!0,detail:o});e.dispatchEvent(a)}},{},n),r(n)})})}var ae="chapters",dist_Le=Object.freeze({label:ae}),dist_B=e=>({startTime:e.startTime,endTime:e.endTime,value:e.text});async function dist_Ne(e,t,r=dist_Le){return ve(e,t,r.label,"chapters")}function dist_ft(e,t={label:ae}){var n;let r=w(e,t.label,"chapters");return(n=r==null?void 0:r.cues)!=null&&n.length?Array.from(r.cues,o=>dist_B(o)):[]}function dist_Ie(e,t={label:ae}){var a,i;let r=w(e,t.label,"chapters");if(!((a=r==null?void 0:r.activeCues)!=null&&a.length))return;if(r.activeCues.length===1)return dist_B(r.activeCues[0]);let{currentTime:n}=e,o=Array.prototype.find.call((i=r.activeCues)!=null?i:[],({startTime:c,endTime:d})=>c<=n&&d>n);return dist_B(o||r.activeCues[0])}async function dist_Ae(e,t=dist_Le){return new Promise(r=>{v(e,"loadstart",async()=>{let n=await dist_Ne(e,[],t);v(e,"cuechange",()=>{let o=dist_Ie(e);if(o){let a=new CustomEvent("chapterchange",{composed:!0,bubbles:!0,detail:o});e.dispatchEvent(a)}},{},n),r(n)})})}function dist_Tt(e,t){if(t){let r=t.playingDate;if(r!=null)return new Date(r.getTime()-e.currentTime*1e3)}return typeof e.getStartDate=="function"?e.getStartDate():new Date(NaN)}function dist_yt(e,t){if(t&&t.playingDate)return t.playingDate;if(typeof e.getStartDate=="function"){let r=e.getStartDate();return new Date(r.getTime()+e.currentTime*1e3)}return new Date(NaN)}var dist_se={VIDEO:"v",THUMBNAIL:"t",STORYBOARD:"s",DRM:"d"},dist_mt=e=>{if(e===dist_C.VIDEO)return dist_se.VIDEO;if(e===dist_C.DRM)return dist_se.DRM},dist_Et=(e,t)=>{var o,a;let r=dist_V(e),n=`${r}Token`;return(o=t.tokens)!=null&&o[r]?(a=t.tokens)==null?void 0:a[r]:O(n,t)?t[n]:void 0},dist_H=(e,t,r,n,o=!1,a=!(i=>(i=globalThis.navigator)==null?void 0:i.onLine)())=>{var M,h;if(a){let b=x("Your device appears to be offline",o),E=void 0,y=f.MEDIA_ERR_NETWORK,k=new f(b,y,!1,E);return k.errorCategory=t,k.muxCode=dist_D.NETWORK_OFFLINE,k.data=e,k}let c="status"in e?e.status:e.code,d=Date.now(),u=f.MEDIA_ERR_NETWORK;if(c===200)return;let s=dist_V(t),p=dist_Et(t,r),l=dist_mt(t),[T]=dist_F((M=r.playbackId)!=null?M:"");if(!c||!T)return;let m=dist_ee(p);if(p&&!m){let b=x("The {tokenNamePrefix}-token provided is invalid or malformed.",o).format({tokenNamePrefix:s}),E=x("Compact JWT string: {token}",o).format({token:p}),y=new f(b,u,!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_TOKEN_MALFORMED,y.data=e,y}if(c>=500){let b=new f("",u,n!=null?n:!0);return b.errorCategory=t,b.muxCode=dist_D.NETWORK_UNKNOWN_ERROR,b}if(c===403)if(m){if(dist_ye(m,d)){let b={timeStyle:"medium",dateStyle:"medium"},E=x("The video\u2019s secured {tokenNamePrefix}-token has expired.",o).format({tokenNamePrefix:s}),y=x("Expired at: {expiredDate}. Current time: {currentDate}.",o).format({expiredDate:new Intl.DateTimeFormat("en",b).format((h=m.exp)!=null?h:0*1e3),currentDate:new Intl.DateTimeFormat("en",b).format(d)}),k=new f(E,u,!0,y);return k.errorCategory=t,k.muxCode=dist_D.NETWORK_TOKEN_EXPIRED,k.data=e,k}if(dist_me(m,T)){let b=x("The video\u2019s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",o).format({tokenNamePrefix:s}),E=x("Specified playback ID: {playbackId} and the playback ID encoded in the {tokenNamePrefix}-token: {tokenPlaybackId}",o).format({tokenNamePrefix:s,playbackId:T,tokenPlaybackId:m.sub}),y=new f(b,u,!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_TOKEN_SUB_MISMATCH,y.data=e,y}if(Ee(m,l)){let b=x("The {tokenNamePrefix}-token is formatted with incorrect information.",o).format({tokenNamePrefix:s}),E=x("The {tokenNamePrefix}-token has no aud value. aud value should be {expectedAud}.",o).format({tokenNamePrefix:s,expectedAud:l}),y=new f(b,u,!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_TOKEN_AUD_MISSING,y.data=e,y}if(dist_ge(m,l)){let b=x("The {tokenNamePrefix}-token is formatted with incorrect information.",o).format({tokenNamePrefix:s}),E=x("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.",o).format({tokenNamePrefix:s,expectedAud:l,aud:m.aud}),y=new f(b,u,!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_TOKEN_AUD_MISMATCH,y.data=e,y}}else{let b=x("Authorization error trying to access this {category} URL. If this is a signed URL, you might need to provide a {tokenNamePrefix}-token.",o).format({tokenNamePrefix:s,category:t}),E=x("Specified playback ID: {playbackId}",o).format({playbackId:T}),y=new f(b,u,n!=null?n:!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_TOKEN_MISSING,y.data=e,y}if(c===412){let b=x("This playback-id may belong to a live stream that is not currently active or an asset that is not ready.",o),E=x("Specified playback ID: {playbackId}",o).format({playbackId:T}),y=new f(b,u,n!=null?n:!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_NOT_READY,y.streamType=r.streamType===dist_.LIVE?"live":r.streamType===dist_.ON_DEMAND?"on-demand":"unknown",y.data=e,y}if(c===404){let b=x("This URL or playback-id does not exist. You may have used an Asset ID or an ID from a different resource.",o),E=x("Specified playback ID: {playbackId}",o).format({playbackId:T}),y=new f(b,u,n!=null?n:!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_NOT_FOUND,y.data=e,y}if(c===400){let b=x("The URL or playback-id was invalid. You may have used an invalid value as a playback-id."),E=x("Specified playback ID: {playbackId}",o).format({playbackId:T}),y=new f(b,u,n!=null?n:!0,E);return y.errorCategory=t,y.muxCode=dist_D.NETWORK_INVALID_URL,y.data=e,y}let R=new f("",u,n!=null?n:!0);return R.errorCategory=t,R.muxCode=dist_D.NETWORK_UNKNOWN_ERROR,R.data=e,R};var dist_Se=g.DefaultConfig.capLevelController,j=class j extends dist_Se{constructor(t){super(t)}get levels(){var t;return(t=this.hls.levels)!=null?t:[]}getValidLevels(t){return this.levels.filter((r,n)=>this.isLevelAllowed(r)&&n<=t)}getMaxLevel(t){let r=super.getMaxLevel(t),n=this.getValidLevels(t);if(!n[r])return r;let o=Math.min(n[r].width,n[r].height),a=j.minMaxResolution;return o>=a?r:dist_Se.getMaxLevelByMediaSize(n,a*(16/9),a)}};j.minMaxResolution=720;var dist_ie=j,we=dist_ie;var dist_J={FAIRPLAY:"fairplay",PLAYREADY:"playready",WIDEVINE:"widevine"},dist_gt=e=>{if(e.includes("fps"))return dist_J.FAIRPLAY;if(e.includes("playready"))return dist_J.PLAYREADY;if(e.includes("widevine"))return dist_J.WIDEVINE},dist_Mt=e=>{let t=e.split(`
`).find((r,n,o)=>n&&o[n-1].startsWith("#EXT-X-STREAM-INF"));return fetch(t).then(r=>r.status!==200?Promise.reject(r):r.text())},dist_xt=e=>{let t=e.split(`
`).filter(n=>n.startsWith("#EXT-X-SESSION-DATA"));if(!t.length)return{};let r={};for(let n of t){let o=dist_bt(n),a=o["DATA-ID"];a&&(r[a]={...o})}return{sessionData:r}},dist_Rt=/([A-Z0-9-]+)="?(.*?)"?(?:,|$)/g;function dist_bt(e){let t=[...e.matchAll(dist_Rt)];return Object.fromEntries(t.map(([,r,n])=>[r,n]))}var dist_Dt=e=>{var c,d,u;let t=e.split(`
`),n=(d=((c=t.find(s=>s.startsWith("#EXT-X-PLAYLIST-TYPE")))!=null?c:"").split(":")[1])==null?void 0:d.trim(),o=dist_Q(n),a=Z(n),i;if(o===dist_.LIVE){let s=t.find(l=>l.startsWith("#EXT-X-PART-INF"));if(!!s)i=+s.split(":")[1].split("=")[1]*2;else{let l=t.find(R=>R.startsWith("#EXT-X-TARGETDURATION")),T=(u=l==null?void 0:l.split(":"))==null?void 0:u[1];i=+(T!=null?T:6)*3}}return{streamType:o,targetLiveWindow:a,liveEdgeStartOffset:i}},dist_Ct=async(e,t)=>{if(t===I.MP4)return{streamType:dist_.ON_DEMAND,targetLiveWindow:Number.NaN,liveEdgeStartOffset:void 0,sessionData:void 0};if(t===I.M3U8){let r=await fetch(e);if(!r.ok)return Promise.reject(r);let n=await r.text(),o=await dist_Mt(n);return{...dist_xt(n),...dist_Dt(o)}}return console.error(`Media type ${t} is an unrecognized or unsupported type for src ${e}.`),{streamType:void 0,targetLiveWindow:void 0,liveEdgeStartOffset:void 0,sessionData:void 0}},dist_vt=async(e,t,r=dist_U({src:e}))=>{var d,u,s,p;let{streamType:n,targetLiveWindow:o,liveEdgeStartOffset:a,sessionData:i}=await dist_Ct(e,r),c=i==null?void 0:i["com.apple.hls.chapters"];(c!=null&&c.URI||c!=null&&c.VALUE.toLocaleLowerCase().startsWith("http"))&&dist_de((d=c.URI)!=null?d:c.VALUE,t),((u=dist_P.get(t))!=null?u:{}).liveEdgeStartOffset=a,((s=dist_P.get(t))!=null?s:{}).targetLiveWindow=o,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((p=dist_P.get(t))!=null?p:{}).streamType=n,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},dist_de=async(e,t)=>{var r,n;try{let o=await fetch(e);if(!o.ok)throw new Error(`Failed to fetch Mux metadata: ${o.status} ${o.statusText}`);let a=await o.json(),i={};if(!((r=a==null?void 0:a[0])!=null&&r.metadata))return;for(let d of a[0].metadata)d.key&&d.value&&(i[d.key]=d.value);((n=dist_P.get(t))!=null?n:{}).metadata=i;let c=new CustomEvent("muxmetadata");t.dispatchEvent(c)}catch(o){console.error(o)}},dist_Pt=e=>{var i;let t=e.type,r=dist_Q(t),n=Z(t),o,a=!!((i=e.partList)!=null&&i.length);return r===dist_.LIVE&&(o=a?e.partTarget*2:e.targetduration*3),{streamType:r,targetLiveWindow:n,liveEdgeStartOffset:o,lowLatency:a}},dist_t=(e,t,r)=>{var c,d,u,s,p,l,T,m;let{streamType:n,targetLiveWindow:o,liveEdgeStartOffset:a,lowLatency:i}=dist_Pt(e);if(n===dist_.LIVE){i?(r.config.backBufferLength=(c=r.userConfig.backBufferLength)!=null?c:4,r.config.maxFragLookUpTolerance=(d=r.userConfig.maxFragLookUpTolerance)!=null?d:.001,r.config.abrBandWidthUpFactor=(u=r.userConfig.abrBandWidthUpFactor)!=null?u:r.config.abrBandWidthFactor):r.config.backBufferLength=(s=r.userConfig.backBufferLength)!=null?s:8;let R=Object.freeze({get length(){return t.seekable.length},start(M){return t.seekable.start(M)},end(M){var h;return M>this.length||M<0||Number.isFinite(t.duration)?t.seekable.end(M):(h=r.liveSyncPosition)!=null?h:t.seekable.end(M)}});((p=dist_P.get(t))!=null?p:{}).seekable=R}((l=dist_P.get(t))!=null?l:{}).liveEdgeStartOffset=a,((T=dist_P.get(t))!=null?T:{}).targetLiveWindow=o,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((m=dist_P.get(t))!=null?m:{}).streamType=n,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},dist_He,Ve,dist_kt=(Ve=(dist_He=globalThis==null?void 0:globalThis.navigator)==null?void 0:dist_He.userAgent)!=null?Ve:"",dist_Ke,We,dist_Ye,ht=(dist_Ye=(We=(dist_Ke=globalThis==null?void 0:globalThis.navigator)==null?void 0:dist_Ke.userAgentData)==null?void 0:We.platform)!=null?dist_Ye:"",dist_Fe,dist_$e,Be,dist_Lt=(Be=(dist_$e=(dist_Fe=globalThis==null?void 0:globalThis.navigator)==null?void 0:dist_Fe.userAgentData)==null?void 0:dist_$e.brands)!=null?Be:[],dist_Nt=dist_kt.toLowerCase().includes("android")||["x11","android"].some(e=>ht.toLowerCase().includes(e)),dist_Oe=dist_Lt.find(e=>e.brand==="Google Chrome"),dist_It=e=>{var t;return dist_Oe&&parseInt((t=dist_Oe.version)!=null?t:"0")>=141&&!!e.canPlayType("application/vnd.apple.mpegurl")},dist_P=new WeakMap,dist_A="mux.com",je,dist_Je,dist_Ge=(dist_Je=(je=g).isSupported)==null?void 0:dist_Je.call(je),dist_At=e=>dist_Nt||dist_It(e),dist_Gr=()=>Cd.utils.now(),dist_St=Cd.utils.generateUUID,dist_qr=({playbackId:e,customDomain:t=dist_A,maxResolution:r,minResolution:n,renditionOrder:o,programStartTime:a,programEndTime:i,assetStartTime:c,assetEndTime:d,playbackToken:u,tokens:{playback:s=u}={},extraSourceParams:p={}}={})=>{if(!e)return;let[l,T=""]=dist_F(e),m=new URL(`https://stream.${t}/${l}.m3u8${T}`);return s||m.searchParams.has("token")?(m.searchParams.forEach((R,M)=>{M!="token"&&m.searchParams.delete(M)}),s&&m.searchParams.set("token",s)):(r&&m.searchParams.set("max_resolution",r),n&&(m.searchParams.set("min_resolution",n),r&&+r.slice(0,-1)<+n.slice(0,-1)&&console.error("minResolution must be <= maxResolution","minResolution",n,"maxResolution",r)),o&&m.searchParams.set("rendition_order",o),a&&m.searchParams.set("program_start_time",`${a}`),i&&m.searchParams.set("program_end_time",`${i}`),c&&m.searchParams.set("asset_start_time",`${c}`),d&&m.searchParams.set("asset_end_time",`${d}`),Object.entries(p).forEach(([R,M])=>{M!=null&&m.searchParams.set(R,M)})),m.toString()},q=e=>{if(!e)return;let[t]=e.split("?");return t||void 0},qe=e=>{if(!e||!e.startsWith("https://stream."))return;let[t]=new URL(e).pathname.slice(1).split(/\.m3u8|\//);return t||void 0},dist_wt=e=>{var t,r,n;return(t=e==null?void 0:e.metadata)!=null&&t.video_id?e.metadata.video_id:dist_tt(e)&&(n=(r=q(e.playbackId))!=null?r:qe(e.src))!=null?n:e.src},dist_Ot=e=>{var t;return(t=dist_P.get(e))==null?void 0:t.error},Xr=e=>{var t;return(t=dist_P.get(e))==null?void 0:t.metadata},dist_Ue=e=>{var t,r;return(r=(t=dist_P.get(e))==null?void 0:t.streamType)!=null?r:dist_.UNKNOWN},dist_zr=e=>{var t,r;return(r=(t=dist_P.get(e))==null?void 0:t.targetLiveWindow)!=null?r:Number.NaN},dist_Xe=e=>{var t,r;return(r=(t=dist_P.get(e))==null?void 0:t.seekable)!=null?r:e.seekable},dist_Qr=e=>{var n;let t=(n=dist_P.get(e))==null?void 0:n.liveEdgeStartOffset;if(typeof t!="number")return Number.NaN;let r=dist_Xe(e);return r.length?r.end(r.length-1)-t:Number.NaN},dist_le=.034,dist_Ut=(e,t,r=dist_le)=>Math.abs(e-t)<=r,dist_ze=(e,t,r=dist_le)=>e>t||dist_Ut(e,t,r),dist_Ht=(e,t=dist_le)=>e.paused&&dist_ze(e.currentTime,e.duration,t),dist_Qe=(e,t)=>{var u,s,p;if(!t||!e.buffered.length)return;if(e.readyState>2)return!1;let r=t.currentLevel>=0?(s=(u=t.levels)==null?void 0:u[t.currentLevel])==null?void 0:s.details:(p=t.levels.find(l=>!!l.details))==null?void 0:p.details;if(!r||r.live)return;let{fragments:n}=r;if(!(n!=null&&n.length))return;if(e.currentTime<e.duration-(r.targetduration+.5))return!1;let o=n[n.length-1];if(e.currentTime<=o.start)return!1;let a=o.start+o.duration/2,i=e.buffered.start(e.buffered.length-1),c=e.buffered.end(e.buffered.length-1);return a>i&&a<c},dist_Vt=(e,t)=>e.ended||e.loop?e.ended:t&&dist_Qe(e,t)?!0:dist_Ht(e),dist_Zr=(e,t,r)=>{dist_Kt(t,r,e);let{metadata:n={}}=e,{view_session_id:o=dist_St()}=n,a=dist_wt(e);n.view_session_id=o,n.video_id=a,e.metadata=n;let i=s=>{var p;(p=t.mux)==null||p.emit("hb",{view_drm_type:s})};e.drmTypeCb=i,dist_P.set(t,{retryCount:0});let c=dist_Wt(e,t),d=dist_be(e,t,c);e!=null&&e.muxDataKeepSession&&(t!=null&&t.mux)&&!t.mux.deleted?c&&t.mux.addHLSJS({hlsjs:c,Hls:c?g:void 0}):dist_Jt(e,t,c),dist_Gt(e,t,c),dist_he(t),dist_Ae(t);let u=Re(e,t,c);return{engine:c,setAutoplay:u,setPreload:d}},dist_Kt=(e,t,r)=>{let n=t==null?void 0:t.engine;e!=null&&e.mux&&!e.mux.deleted&&(r!=null&&r.muxDataKeepSession?n&&e.mux.removeHLSJS():(e.mux.destroy(),delete e.mux)),n&&(n.detachMedia(),n.destroy()),e&&(e.hasAttribute("src")&&(e.removeAttribute("src"),e.load()),e.removeEventListener("error",dist_nt),e.removeEventListener("error",dist_ce),e.removeEventListener("durationchange",rt),dist_P.delete(e),e.dispatchEvent(new Event("teardown")))};function Ze(e,t){var u;let r=dist_U(e);if(!(r===I.M3U8))return!0;let o=!r||((u=t.canPlayType(r))!=null?u:!0),{preferPlayback:a}=e,i=a===dist_X.MSE,c=a===dist_X.NATIVE,d=dist_Ge&&(i||dist_At(t));return o&&(c||!d)}var dist_Wt=(e,t)=>{let{debug:r,streamType:n,startTime:o=-1,metadata:a,preferCmcd:i,_hlsConfig:c={}}=e,u=dist_U(e)===I.M3U8,s=Ze(e,t);if(u&&!s&&dist_Ge){let p={backBufferLength:30,renderTextTracksNatively:!1,liveDurationInfinity:!0,capLevelToPlayerSize:!0,capLevelOnFPSDrop:!0},l=dist_Yt(n),T=dist_Ft(e),m=[S.QUERY,S.HEADER].includes(i)?{useHeaders:i===S.HEADER,sessionId:a==null?void 0:a.view_session_id,contentId:a==null?void 0:a.video_id}:void 0,R=c.capLevelToPlayerSize==null?{capLevelController:we}:{},M=new g({debug:r,startPosition:o,cmcd:m,xhrSetup:(h,b)=>{var k,pe;if(i&&i!==S.QUERY)return;let E=new URL(b);if(!E.searchParams.has("CMCD"))return;let y=((pe=(k=E.searchParams.get("CMCD"))==null?void 0:k.split(","))!=null?pe:[]).filter(fe=>fe.startsWith("sid")||fe.startsWith("cid")).join(",");E.searchParams.set("CMCD",y),h.open("GET",E)},...R,...p,...l,...T,...c});return M.on(g.Events.MANIFEST_PARSED,async function(h,b){var y,k;let E=(y=b.sessionData)==null?void 0:y["com.apple.hls.chapters"];(E!=null&&E.URI||E!=null&&E.VALUE.toLocaleLowerCase().startsWith("http"))&&dist_de((k=E==null?void 0:E.URI)!=null?k:E==null?void 0:E.VALUE,t)}),M}},dist_Yt=e=>e===dist_.LIVE?{backBufferLength:8}:{},dist_Ft=e=>{let{tokens:{drm:t}={},playbackId:r,drmTypeCb:n}=e,o=q(r);return!t||!o?{}:{emeEnabled:!0,drmSystems:{"com.apple.fps":{licenseUrl:dist_G(e,"fairplay"),serverCertificateUrl:et(e,"fairplay")},"com.widevine.alpha":{licenseUrl:dist_G(e,"widevine")},"com.microsoft.playready":{licenseUrl:dist_G(e,"playready")}},requestMediaKeySystemAccessFunc:(a,i)=>(a==="com.widevine.alpha"&&(i=[...i.map(c=>{var u;let d=(u=c.videoCapabilities)==null?void 0:u.map(s=>({...s,robustness:"HW_SECURE_ALL"}));return{...c,videoCapabilities:d}}),...i]),navigator.requestMediaKeySystemAccess(a,i).then(c=>{let d=dist_gt(a);return n==null||n(d),c}))}},dist_$t=async e=>{let t=await fetch(e);return t.status!==200?Promise.reject(t):await t.arrayBuffer()},dist_Bt=async(e,t)=>{let r=await fetch(t,{method:"POST",headers:{"Content-type":"application/octet-stream"},body:e});if(r.status!==200)return Promise.reject(r);let n=await r.arrayBuffer();return new Uint8Array(n)},dist_jt=(e,t)=>{v(t,"encrypted",async n=>{try{let o=n.initDataType;if(o!=="skd"){console.error(`Received unexpected initialization data type "${o}"`);return}if(!t.mediaKeys){let u=await navigator.requestMediaKeySystemAccess("com.apple.fps",[{initDataTypes:[o],videoCapabilities:[{contentType:"application/vnd.apple.mpegurl",robustness:""}],distinctiveIdentifier:"not-allowed",persistentState:"not-allowed",sessionTypes:["temporary"]}]).then(p=>{var l;return(l=e.drmTypeCb)==null||l.call(e,dist_J.FAIRPLAY),p}).catch(()=>{let p=x("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),l=new f(p,f.MEDIA_ERR_ENCRYPTED,!0);l.errorCategory=dist_C.DRM,l.muxCode=dist_D.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM,dist_N(t,l)});if(!u)return;let s=await u.createMediaKeys();try{let p=await dist_$t(et(e,"fairplay")).catch(l=>{if(l instanceof Response){let T=dist_H(l,dist_C.DRM,e);return console.error("mediaError",T==null?void 0:T.message,T==null?void 0:T.context),T?Promise.reject(T):Promise.reject(new Error("Unexpected error in app cert request"))}return Promise.reject(l)});await s.setServerCertificate(p).catch(()=>{let l=x("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."),T=new f(l,f.MEDIA_ERR_ENCRYPTED,!0);return T.errorCategory=dist_C.DRM,T.muxCode=dist_D.ENCRYPTED_UPDATE_SERVER_CERT_FAILED,Promise.reject(T)})}catch(p){dist_N(t,p);return}await t.setMediaKeys(s)}let a=n.initData;if(a==null){console.error(`Could not start encrypted playback due to missing initData in ${n.type} event`);return}let i=t.mediaKeys.createSession();i.addEventListener("keystatuseschange",()=>{i.keyStatuses.forEach(u=>{let s;if(u==="internal-error"){let p=x("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser.");s=new f(p,f.MEDIA_ERR_ENCRYPTED,!0),s.errorCategory=dist_C.DRM,s.muxCode=dist_D.ENCRYPTED_CDM_ERROR}else if(u==="output-restricted"||u==="output-downscaled"){let p=x("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");s=new f(p,f.MEDIA_ERR_ENCRYPTED,!1),s.errorCategory=dist_C.DRM,s.muxCode=dist_D.ENCRYPTED_OUTPUT_RESTRICTED}s&&dist_N(t,s)})});let c=await Promise.all([i.generateRequest(o,a).catch(()=>{let u=x("Failed to generate a DRM license request. This may be an issue with the player or your protected content."),s=new f(u,f.MEDIA_ERR_ENCRYPTED,!0);s.errorCategory=dist_C.DRM,s.muxCode=dist_D.ENCRYPTED_GENERATE_REQUEST_FAILED,dist_N(t,s)}),new Promise(u=>{i.addEventListener("message",s=>{u(s.message)},{once:!0})})]).then(([,u])=>u),d=await dist_Bt(c,dist_G(e,"fairplay")).catch(u=>{if(u instanceof Response){let s=dist_H(u,dist_C.DRM,e);return console.error("mediaError",s==null?void 0:s.message,s==null?void 0:s.context),s?Promise.reject(s):Promise.reject(new Error("Unexpected error in license key request"))}return Promise.reject(u)});await i.update(d).catch(()=>{let u=x("Failed to update DRM license. This may be an issue with the player or your protected content."),s=new f(u,f.MEDIA_ERR_ENCRYPTED,!0);return s.errorCategory=dist_C.DRM,s.muxCode=dist_D.ENCRYPTED_UPDATE_LICENSE_FAILED,Promise.reject(s)})}catch(o){dist_N(t,o);return}})},dist_G=({playbackId:e,tokens:{drm:t}={},customDomain:r=dist_A},n)=>{let o=q(e);return`https://license.${r.toLocaleLowerCase().endsWith(dist_A)?r:dist_A}/license/${n}/${o}?token=${t}`},et=({playbackId:e,tokens:{drm:t}={},customDomain:r=dist_A},n)=>{let o=q(e);return`https://license.${r.toLocaleLowerCase().endsWith(dist_A)?r:dist_A}/appcert/${n}/${o}?token=${t}`},dist_tt=({playbackId:e,src:t,customDomain:r})=>{if(e)return!0;if(typeof t!="string")return!1;let n=window==null?void 0:window.location.href,o=new URL(t,n).hostname.toLocaleLowerCase();return o.includes(dist_A)||!!r&&o.includes(r.toLocaleLowerCase())},dist_Jt=(e,t,r)=>{var d;let{envKey:n,disableTracking:o,muxDataSDK:a=Cd,muxDataSDKOptions:i={}}=e,c=dist_tt(e);if(!o&&(n||c)){let{playerInitTime:u,playerSoftwareName:s,playerSoftwareVersion:p,beaconCollectionDomain:l,debug:T,disableCookies:m}=e,R={...e.metadata,video_title:((d=e==null?void 0:e.metadata)==null?void 0:d.video_title)||void 0},M=h=>typeof h.player_error_code=="string"?!1:typeof e.errorTranslator=="function"?e.errorTranslator(h):h;a.monitor(t,{debug:T,beaconCollectionDomain:l,hlsjs:r,Hls:r?g:void 0,automaticErrorTracking:!1,errorTranslator:M,disableCookies:m,...i,data:{...n?{env_key:n}:{},player_software_name:s,player_software:s,player_software_version:p,player_init_time:u,...R}})}},dist_Gt=(e,t,r)=>{var s,p;let n=Ze(e,t),{src:o,customDomain:a=dist_A}=e,i=()=>{t.ended||e.disablePseudoEnded||!dist_Vt(t,r)||(dist_Qe(t,r)?t.currentTime=t.buffered.end(t.buffered.length-1):t.dispatchEvent(new Event("ended")))},c,d,u=()=>{let l=dist_Xe(t),T,m;l.length>0&&(T=l.start(0),m=l.end(0)),(d!==m||c!==T)&&t.dispatchEvent(new CustomEvent("seekablechange",{composed:!0})),c=T,d=m};if(v(t,"durationchange",u),t&&n){let l=dist_U(e);if(typeof o=="string"){if(o.endsWith(".mp4")&&o.includes(a)){let R=qe(o),M=new URL(`https://stream.${a}/${R}/metadata.json`);dist_de(M.toString(),t)}let T=()=>{if(dist_Ue(t)!==dist_.LIVE||Number.isFinite(t.duration))return;let R=setInterval(u,1e3);t.addEventListener("teardown",()=>{clearInterval(R)},{once:!0}),v(t,"durationchange",()=>{Number.isFinite(t.duration)&&clearInterval(R)})},m=async()=>dist_vt(o,t,l).then(T).catch(R=>{if(R instanceof Response){let M=dist_H(R,dist_C.VIDEO,e);if(M){dist_N(t,M);return}}else R instanceof Error});if(t.preload==="none"){let R=()=>{m(),t.removeEventListener("loadedmetadata",M)},M=()=>{m(),t.removeEventListener("play",R)};v(t,"play",R,{once:!0}),v(t,"loadedmetadata",M,{once:!0})}else m();(s=e.tokens)!=null&&s.drm?dist_jt(e,t):v(t,"encrypted",()=>{let R=x("Attempting to play DRM-protected content without providing a DRM token."),M=new f(R,f.MEDIA_ERR_ENCRYPTED,!0);M.errorCategory=dist_C.DRM,M.muxCode=dist_D.ENCRYPTED_MISSING_TOKEN,dist_N(t,M)},{once:!0}),t.setAttribute("src",o),e.startTime&&(((p=dist_P.get(t))!=null?p:{}).startTime=e.startTime,t.addEventListener("durationchange",rt,{once:!0}))}else t.removeAttribute("src");t.addEventListener("error",dist_nt),t.addEventListener("error",dist_ce),t.addEventListener("emptied",()=>{t.querySelectorAll("track[data-removeondestroy]").forEach(m=>{m.remove()})},{once:!0}),v(t,"pause",i),v(t,"seeked",i),v(t,"play",()=>{t.ended||dist_ze(t.currentTime,t.duration)&&(t.currentTime=t.seekable.length?t.seekable.start(0):0)})}else r&&o?(r.once(g.Events.LEVEL_LOADED,(l,T)=>{dist_t(T.details,t,r),u(),dist_Ue(t)===dist_.LIVE&&!Number.isFinite(t.duration)&&(r.on(g.Events.LEVEL_UPDATED,u),v(t,"durationchange",()=>{Number.isFinite(t.duration)&&r.off(g.Events.LEVELS_UPDATED,u)}))}),r.on(g.Events.ERROR,(l,T)=>{var R,M;let m=dist_qt(T,e);if(m.muxCode===dist_D.NETWORK_NOT_READY){let b=(R=dist_P.get(t))!=null?R:{},E=(M=b.retryCount)!=null?M:0;if(E<6){let y=E===0?5e3:6e4,k=new f(`Retrying in ${y/1e3} seconds...`,m.code,m.fatal);Object.assign(k,m),dist_N(t,k),setTimeout(()=>{b.retryCount=E+1,T.details==="manifestLoadError"&&T.url&&r.loadSource(T.url)},y);return}else{b.retryCount=0;let y=new f('Try again later or <a href="#" onclick="window.location.reload(); return false;" style="color: #4a90e2;">click here to retry</a>',m.code,m.fatal);Object.assign(y,m),dist_N(t,y);return}}dist_N(t,m)}),r.on(g.Events.MANIFEST_LOADED,()=>{let l=dist_P.get(t);l&&l.error&&(l.error=null,l.retryCount=0,t.dispatchEvent(new Event("emptied")),t.dispatchEvent(new Event("loadstart")))}),t.addEventListener("error",dist_ce),v(t,"waiting",i),dist_De(e,r),dist_Ce(t,r),r.attachMedia(t)):console.error("It looks like the video you're trying to play will not work on this system! If possible, try upgrading to the newest versions of your browser or software.")};function rt(e){var n;let t=e.target,r=(n=dist_P.get(t))==null?void 0:n.startTime;if(r&&Te(t.seekable,t.duration,r)){let o=t.preload==="auto";o&&(t.preload="none"),t.currentTime=r,o&&(t.preload="auto")}}async function dist_nt(e){if(!e.isTrusted)return;e.stopImmediatePropagation();let t=e.target;if(!(t!=null&&t.error))return;let{message:r,code:n}=t.error,o=new f(r,n);if(t.src&&n===f.MEDIA_ERR_SRC_NOT_SUPPORTED&&t.readyState===HTMLMediaElement.HAVE_NOTHING){setTimeout(()=>{var i;let a=(i=dist_Ot(t))!=null?i:t.error;(a==null?void 0:a.code)===f.MEDIA_ERR_SRC_NOT_SUPPORTED&&dist_N(t,o)},500);return}if(t.src&&(n!==f.MEDIA_ERR_DECODE||n!==void 0))try{let{status:a}=await fetch(t.src);o.data={response:{code:a}}}catch{}dist_N(t,o)}function dist_N(e,t){var r;t.fatal&&(((r=dist_P.get(e))!=null?r:{}).error=t,e.dispatchEvent(new CustomEvent("error",{detail:t})))}function dist_ce(e){var n,o;if(!(e instanceof CustomEvent)||!(e.detail instanceof f))return;let t=e.target,r=e.detail;!r||!r.fatal||(((n=dist_P.get(t))!=null?n:{}).error=r,(o=t.mux)==null||o.emit("error",{player_error_code:r.code,player_error_message:r.message,player_error_context:r.context}))}var dist_qt=(e,t)=>{var c,d,u;console.error("getErrorFromHlsErrorData()",e);let r={[g.ErrorTypes.NETWORK_ERROR]:f.MEDIA_ERR_NETWORK,[g.ErrorTypes.MEDIA_ERROR]:f.MEDIA_ERR_DECODE,[g.ErrorTypes.KEY_SYSTEM_ERROR]:f.MEDIA_ERR_ENCRYPTED},n=s=>[g.ErrorDetails.KEY_SYSTEM_LICENSE_REQUEST_FAILED,g.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED].includes(s.details)?f.MEDIA_ERR_NETWORK:r[s.type],o=s=>{if(s.type===g.ErrorTypes.KEY_SYSTEM_ERROR)return dist_C.DRM;if(s.type===g.ErrorTypes.NETWORK_ERROR)return dist_C.VIDEO},a,i=n(e);if(i===f.MEDIA_ERR_NETWORK&&e.response){let s=(c=o(e))!=null?c:dist_C.VIDEO;a=(d=dist_H(e.response,s,t,e.fatal))!=null?d:new f("",i,e.fatal)}else if(i===f.MEDIA_ERR_ENCRYPTED)if(e.details===g.ErrorDetails.KEY_SYSTEM_NO_CONFIGURED_LICENSE){let s=x("Attempting to play DRM-protected content without providing a DRM token.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,e.fatal),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_MISSING_TOKEN}else if(e.details===g.ErrorDetails.KEY_SYSTEM_NO_ACCESS){let s=x("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,e.fatal),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM}else if(e.details===g.ErrorDetails.KEY_SYSTEM_NO_SESSION){let s=x("Failed to generate a DRM license request. This may be an issue with the player or your protected content.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,!0),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_GENERATE_REQUEST_FAILED}else if(e.details===g.ErrorDetails.KEY_SYSTEM_SESSION_UPDATE_FAILED){let s=x("Failed to update DRM license. This may be an issue with the player or your protected content.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,e.fatal),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_UPDATE_LICENSE_FAILED}else if(e.details===g.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED){let s=x("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,e.fatal),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_UPDATE_SERVER_CERT_FAILED}else if(e.details===g.ErrorDetails.KEY_SYSTEM_STATUS_INTERNAL_ERROR){let s=x("The DRM Content Decryption Module system had an internal failure. Try reloading the page, upading your browser, or playing in another browser.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,e.fatal),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_CDM_ERROR}else if(e.details===g.ErrorDetails.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED){let s=x("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");a=new f(s,f.MEDIA_ERR_ENCRYPTED,!1),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_OUTPUT_RESTRICTED}else a=new f(e.error.message,f.MEDIA_ERR_ENCRYPTED,e.fatal),a.errorCategory=dist_C.DRM,a.muxCode=dist_D.ENCRYPTED_ERROR;else a=new f("",i,e.fatal);return a.context||(a.context=`${e.url?`url: ${e.url}
`:""}${e.response&&(e.response.code||e.response.text)?`response: ${e.response.code}, ${e.response.text}
`:""}${e.reason?`failure reason: ${e.reason}
`:""}${e.level?`level: ${e.level}
`:""}${e.parent?`parent stream controller: ${e.parent}
`:""}${e.buffer?`buffer length: ${e.buffer}
`:""}${e.error?`error: ${e.error}
`:""}${e.event?`event: ${e.event}
`:""}${e.err?`error message: ${(u=e.err)==null?void 0:u.message}
`:""}`),a.data=e,a};
//# sourceMappingURL=index.mjs.map

// EXTERNAL MODULE: ../node_modules/custom-media-element/dist/custom-media-element.js
var custom_media_element = __webpack_require__(12495);
;// ../node_modules/@mux/mux-video/dist/base.mjs
var base_C=s=>{throw TypeError(s)};var base_N=(s,a,t)=>a.has(s)||base_C("Cannot "+t);var n=(s,a,t)=>(base_N(s,a,"read from private field"),t?t.call(s):a.get(s)),u=(s,a,t)=>a.has(s)?base_C("Cannot add the same private member more than once"):a instanceof WeakSet?a.add(s):a.set(s,t),o=(s,a,t,i)=>(base_N(s,a,"write to private field"),i?i.call(s,t):a.set(s,t),t),base_I=(s,a,t)=>(base_N(s,a,"access private method"),t);var base_B=()=>{try{return"0.27.2"}catch{}return"UNKNOWN"},base_Y=base_B(),base_P=()=>base_Y;var base_D=`
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" part="logo" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 1600 500"><g fill="#fff"><path d="M994.287 93.486c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m0-93.486c-34.509 0-62.484 27.976-62.484 62.486v187.511c0 68.943-56.09 125.033-125.032 125.033s-125.03-56.09-125.03-125.033V62.486C681.741 27.976 653.765 0 619.256 0s-62.484 27.976-62.484 62.486v187.511C556.772 387.85 668.921 500 806.771 500c137.851 0 250.001-112.15 250.001-250.003V62.486c0-34.51-27.976-62.486-62.485-62.486M1537.51 468.511c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m-275.883-218.509-143.33 143.329c-24.402 24.402-24.402 63.966 0 88.368 24.402 24.402 63.967 24.402 88.369 0l143.33-143.329 143.328 143.329c24.402 24.4 63.967 24.402 88.369 0 24.403-24.402 24.403-63.966.001-88.368l-143.33-143.329.001-.004 143.329-143.329c24.402-24.402 24.402-63.965 0-88.367s-63.967-24.402-88.369 0L1349.996 161.63 1206.667 18.302c-24.402-24.401-63.967-24.402-88.369 0s-24.402 63.965 0 88.367l143.329 143.329v.004ZM437.511 468.521c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31M461.426 4.759C438.078-4.913 411.2.432 393.33 18.303L249.999 161.632 106.669 18.303C88.798.432 61.922-4.913 38.573 4.759 15.224 14.43-.001 37.214-.001 62.488v375.026c0 34.51 27.977 62.486 62.487 62.486 34.51 0 62.486-27.976 62.486-62.486V213.341l80.843 80.844c24.404 24.402 63.965 24.402 88.369 0l80.843-80.844v224.173c0 34.51 27.976 62.486 62.486 62.486s62.486-27.976 62.486-62.486V62.488c0-25.274-15.224-48.058-38.573-57.729" style="fill-rule:nonzero"/></g></svg>`;var base_e={BEACON_COLLECTION_DOMAIN:"beacon-collection-domain",CUSTOM_DOMAIN:"custom-domain",DEBUG:"debug",DISABLE_TRACKING:"disable-tracking",DISABLE_COOKIES:"disable-cookies",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended",DRM_TOKEN:"drm-token",PLAYBACK_TOKEN:"playback-token",ENV_KEY:"env-key",MAX_RESOLUTION:"max-resolution",MIN_RESOLUTION:"min-resolution",RENDITION_ORDER:"rendition-order",PROGRAM_START_TIME:"program-start-time",PROGRAM_END_TIME:"program-end-time",ASSET_START_TIME:"asset-start-time",ASSET_END_TIME:"asset-end-time",METADATA_URL:"metadata-url",PLAYBACK_ID:"playback-id",PLAYER_SOFTWARE_NAME:"player-software-name",PLAYER_SOFTWARE_VERSION:"player-software-version",PLAYER_INIT_TIME:"player-init-time",PREFER_CMCD:"prefer-cmcd",PREFER_PLAYBACK:"prefer-playback",START_TIME:"start-time",STREAM_TYPE:"stream-type",TARGET_LIVE_WINDOW:"target-live-window",LIVE_EDGE_OFFSET:"live-edge-offset",TYPE:"type",LOGO:"logo"},base_at=Object.values(base_e),base_v=base_P(),base_x="mux-video",base_l,base_f,base_b,base_A,c,T,_,p,base_O,base_g,m,y,base_K=class extends custom_media_element/* CustomVideoElement */.lB{constructor(){super();u(this,m);u(this,base_l);u(this,base_f);u(this,base_b);u(this,base_A,{});u(this,c,{});u(this,T);u(this,_);u(this,p);u(this,base_O);u(this,base_g,"");o(this,base_b,dist_Gr()),this.nativeEl.addEventListener("muxmetadata",t=>{var d;let i=Xr(this.nativeEl),r=(d=this.metadata)!=null?d:{};this.metadata={...i,...r},(i==null?void 0:i["com.mux.video.branding"])==="mux-free-plan"&&(o(this,base_g,"default"),this.updateLogo())})}static get NAME(){return base_x}static get VERSION(){return base_v}static get observedAttributes(){var t;return[...base_at,...(t=custom_media_element/* CustomVideoElement */.lB.observedAttributes)!=null?t:[]]}static getLogoHTML(t){return!t||t==="false"?"":t==="default"?base_D:`<img part="logo" src="${t}" />`}static getTemplateHTML(t={}){var i;return`
      ${custom_media_element/* CustomVideoElement */.lB.getTemplateHTML(t)}
      <style>
        :host {
          position: relative;
        }
        slot[name="logo"] {
          display: flex;
          justify-content: end;
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
          z-index: 1;
        }
        slot[name="logo"]:has([part="logo"]) {
          opacity: 1;
        }
        slot[name="logo"] [part="logo"] {
          width: 5rem;
          pointer-events: none;
          user-select: none;
        }
      </style>
      <slot name="logo">
        ${this.getLogoHTML((i=t[base_e.LOGO])!=null?i:"")}
      </slot>
    `}get preferCmcd(){var t;return(t=this.getAttribute(base_e.PREFER_CMCD))!=null?t:void 0}set preferCmcd(t){t!==this.preferCmcd&&(t?dist_Zt.includes(t)?this.setAttribute(base_e.PREFER_CMCD,t):console.warn(`Invalid value for preferCmcd. Must be one of ${dist_Zt.join()}`):this.removeAttribute(base_e.PREFER_CMCD))}get playerInitTime(){return this.hasAttribute(base_e.PLAYER_INIT_TIME)?+this.getAttribute(base_e.PLAYER_INIT_TIME):n(this,base_b)}set playerInitTime(t){t!=this.playerInitTime&&(t==null?this.removeAttribute(base_e.PLAYER_INIT_TIME):this.setAttribute(base_e.PLAYER_INIT_TIME,`${+t}`))}get playerSoftwareName(){var t;return(t=n(this,p))!=null?t:base_x}set playerSoftwareName(t){o(this,p,t)}get playerSoftwareVersion(){var t;return(t=n(this,_))!=null?t:base_v}set playerSoftwareVersion(t){o(this,_,t)}get _hls(){var t;return(t=n(this,base_l))==null?void 0:t.engine}get mux(){var t;return(t=this.nativeEl)==null?void 0:t.mux}get error(){var t;return(t=dist_Ot(this.nativeEl))!=null?t:null}get errorTranslator(){return n(this,base_O)}set errorTranslator(t){o(this,base_O,t)}get src(){return this.getAttribute("src")}set src(t){t!==this.src&&(t==null?this.removeAttribute("src"):this.setAttribute("src",t))}get type(){var t;return(t=this.getAttribute(base_e.TYPE))!=null?t:void 0}set type(t){t!==this.type&&(t?this.setAttribute(base_e.TYPE,t):this.removeAttribute(base_e.TYPE))}get preload(){let t=this.getAttribute("preload");return t===""?"auto":["none","metadata","auto"].includes(t)?t:super.preload}set preload(t){t!=this.getAttribute("preload")&&(["","none","metadata","auto"].includes(t)?this.setAttribute("preload",t):this.removeAttribute("preload"))}get debug(){return this.getAttribute(base_e.DEBUG)!=null}set debug(t){t!==this.debug&&(t?this.setAttribute(base_e.DEBUG,""):this.removeAttribute(base_e.DEBUG))}get disableTracking(){return this.hasAttribute(base_e.DISABLE_TRACKING)}set disableTracking(t){t!==this.disableTracking&&this.toggleAttribute(base_e.DISABLE_TRACKING,!!t)}get disableCookies(){return this.hasAttribute(base_e.DISABLE_COOKIES)}set disableCookies(t){t!==this.disableCookies&&(t?this.setAttribute(base_e.DISABLE_COOKIES,""):this.removeAttribute(base_e.DISABLE_COOKIES))}get disablePseudoEnded(){return this.hasAttribute(base_e.DISABLE_PSEUDO_ENDED)}set disablePseudoEnded(t){t!==this.disablePseudoEnded&&(t?this.setAttribute(base_e.DISABLE_PSEUDO_ENDED,""):this.removeAttribute(base_e.DISABLE_PSEUDO_ENDED))}get startTime(){let t=this.getAttribute(base_e.START_TIME);if(t==null)return;let i=+t;return Number.isNaN(i)?void 0:i}set startTime(t){t!==this.startTime&&(t==null?this.removeAttribute(base_e.START_TIME):this.setAttribute(base_e.START_TIME,`${t}`))}get playbackId(){var t;return this.hasAttribute(base_e.PLAYBACK_ID)?this.getAttribute(base_e.PLAYBACK_ID):(t=qe(this.src))!=null?t:void 0}set playbackId(t){t!==this.playbackId&&(t?this.setAttribute(base_e.PLAYBACK_ID,t):this.removeAttribute(base_e.PLAYBACK_ID))}get maxResolution(){var t;return(t=this.getAttribute(base_e.MAX_RESOLUTION))!=null?t:void 0}set maxResolution(t){t!==this.maxResolution&&(t?this.setAttribute(base_e.MAX_RESOLUTION,t):this.removeAttribute(base_e.MAX_RESOLUTION))}get minResolution(){var t;return(t=this.getAttribute(base_e.MIN_RESOLUTION))!=null?t:void 0}set minResolution(t){t!==this.minResolution&&(t?this.setAttribute(base_e.MIN_RESOLUTION,t):this.removeAttribute(base_e.MIN_RESOLUTION))}get renditionOrder(){var t;return(t=this.getAttribute(base_e.RENDITION_ORDER))!=null?t:void 0}set renditionOrder(t){t!==this.renditionOrder&&(t?this.setAttribute(base_e.RENDITION_ORDER,t):this.removeAttribute(base_e.RENDITION_ORDER))}get programStartTime(){let t=this.getAttribute(base_e.PROGRAM_START_TIME);if(t==null)return;let i=+t;return Number.isNaN(i)?void 0:i}set programStartTime(t){t==null?this.removeAttribute(base_e.PROGRAM_START_TIME):this.setAttribute(base_e.PROGRAM_START_TIME,`${t}`)}get programEndTime(){let t=this.getAttribute(base_e.PROGRAM_END_TIME);if(t==null)return;let i=+t;return Number.isNaN(i)?void 0:i}set programEndTime(t){t==null?this.removeAttribute(base_e.PROGRAM_END_TIME):this.setAttribute(base_e.PROGRAM_END_TIME,`${t}`)}get assetStartTime(){let t=this.getAttribute(base_e.ASSET_START_TIME);if(t==null)return;let i=+t;return Number.isNaN(i)?void 0:i}set assetStartTime(t){t==null?this.removeAttribute(base_e.ASSET_START_TIME):this.setAttribute(base_e.ASSET_START_TIME,`${t}`)}get assetEndTime(){let t=this.getAttribute(base_e.ASSET_END_TIME);if(t==null)return;let i=+t;return Number.isNaN(i)?void 0:i}set assetEndTime(t){t==null?this.removeAttribute(base_e.ASSET_END_TIME):this.setAttribute(base_e.ASSET_END_TIME,`${t}`)}get customDomain(){var t;return(t=this.getAttribute(base_e.CUSTOM_DOMAIN))!=null?t:void 0}set customDomain(t){t!==this.customDomain&&(t?this.setAttribute(base_e.CUSTOM_DOMAIN,t):this.removeAttribute(base_e.CUSTOM_DOMAIN))}get drmToken(){var t;return(t=this.getAttribute(base_e.DRM_TOKEN))!=null?t:void 0}set drmToken(t){t!==this.drmToken&&(t?this.setAttribute(base_e.DRM_TOKEN,t):this.removeAttribute(base_e.DRM_TOKEN))}get playbackToken(){var t,i,r,d;if(this.hasAttribute(base_e.PLAYBACK_TOKEN))return(t=this.getAttribute(base_e.PLAYBACK_TOKEN))!=null?t:void 0;if(this.hasAttribute(base_e.PLAYBACK_ID)){let[,h]=dist_F((i=this.playbackId)!=null?i:"");return(r=new URLSearchParams(h).get("token"))!=null?r:void 0}if(this.src)return(d=new URLSearchParams(this.src).get("token"))!=null?d:void 0}set playbackToken(t){t!==this.playbackToken&&(t?this.setAttribute(base_e.PLAYBACK_TOKEN,t):this.removeAttribute(base_e.PLAYBACK_TOKEN))}get tokens(){let t=this.getAttribute(base_e.PLAYBACK_TOKEN),i=this.getAttribute(base_e.DRM_TOKEN);return{...n(this,c),...t!=null?{playback:t}:{},...i!=null?{drm:i}:{}}}set tokens(t){o(this,c,t!=null?t:{})}get ended(){return dist_Vt(this.nativeEl,this._hls)}get envKey(){var t;return(t=this.getAttribute(base_e.ENV_KEY))!=null?t:void 0}set envKey(t){t!==this.envKey&&(t?this.setAttribute(base_e.ENV_KEY,t):this.removeAttribute(base_e.ENV_KEY))}get beaconCollectionDomain(){var t;return(t=this.getAttribute(base_e.BEACON_COLLECTION_DOMAIN))!=null?t:void 0}set beaconCollectionDomain(t){t!==this.beaconCollectionDomain&&(t?this.setAttribute(base_e.BEACON_COLLECTION_DOMAIN,t):this.removeAttribute(base_e.BEACON_COLLECTION_DOMAIN))}get streamType(){var t;return(t=this.getAttribute(base_e.STREAM_TYPE))!=null?t:dist_Ue(this.nativeEl)}set streamType(t){t!==this.streamType&&(t?this.setAttribute(base_e.STREAM_TYPE,t):this.removeAttribute(base_e.STREAM_TYPE))}get targetLiveWindow(){return this.hasAttribute(base_e.TARGET_LIVE_WINDOW)?+this.getAttribute(base_e.TARGET_LIVE_WINDOW):dist_zr(this.nativeEl)}set targetLiveWindow(t){t!=this.targetLiveWindow&&(t==null?this.removeAttribute(base_e.TARGET_LIVE_WINDOW):this.setAttribute(base_e.TARGET_LIVE_WINDOW,`${+t}`))}get liveEdgeStart(){var t,i;if(this.hasAttribute(base_e.LIVE_EDGE_OFFSET)){let{liveEdgeOffset:r}=this,d=(t=this.nativeEl.seekable.end(0))!=null?t:0,h=(i=this.nativeEl.seekable.start(0))!=null?i:0;return Math.max(h,d-r)}return dist_Qr(this.nativeEl)}get liveEdgeOffset(){if(this.hasAttribute(base_e.LIVE_EDGE_OFFSET))return+this.getAttribute(base_e.LIVE_EDGE_OFFSET)}set liveEdgeOffset(t){t!=this.liveEdgeOffset&&(t==null?this.removeAttribute(base_e.LIVE_EDGE_OFFSET):this.setAttribute(base_e.LIVE_EDGE_OFFSET,`${+t}`))}get seekable(){return dist_Xe(this.nativeEl)}async addCuePoints(t){return dist_e(this.nativeEl,t)}get activeCuePoint(){return dist_ke(this.nativeEl)}get cuePoints(){return dist_pt(this.nativeEl)}async addChapters(t){return dist_Ne(this.nativeEl,t)}get activeChapter(){return dist_Ie(this.nativeEl)}get chapters(){return dist_ft(this.nativeEl)}getStartDate(){return dist_Tt(this.nativeEl,this._hls)}get currentPdt(){return dist_yt(this.nativeEl,this._hls)}get preferPlayback(){let t=this.getAttribute(base_e.PREFER_PLAYBACK);if(t===dist_X.MSE||t===dist_X.NATIVE)return t}set preferPlayback(t){t!==this.preferPlayback&&(t===dist_X.MSE||t===dist_X.NATIVE?this.setAttribute(base_e.PREFER_PLAYBACK,t):this.removeAttribute(base_e.PREFER_PLAYBACK))}get metadata(){return{...this.getAttributeNames().filter(i=>i.startsWith("metadata-")&&![base_e.METADATA_URL].includes(i)).reduce((i,r)=>{let d=this.getAttribute(r);return d!=null&&(i[r.replace(/^metadata-/,"").replace(/-/g,"_")]=d),i},{}),...n(this,base_A)}}set metadata(t){o(this,base_A,t!=null?t:{}),this.mux&&this.mux.emit("hb",n(this,base_A))}get _hlsConfig(){return n(this,T)}set _hlsConfig(t){o(this,T,t)}get logo(){var t;return(t=this.getAttribute(base_e.LOGO))!=null?t:n(this,base_g)}set logo(t){t?this.setAttribute(base_e.LOGO,t):this.removeAttribute(base_e.LOGO)}load(){o(this,base_l,dist_Zr(this,this.nativeEl,n(this,base_l)))}unload(){dist_Kt(this.nativeEl,n(this,base_l),this),o(this,base_l,void 0)}attributeChangedCallback(t,i,r){var h,L;switch(custom_media_element/* CustomVideoElement */.lB.observedAttributes.includes(t)&&!["src","autoplay","preload"].includes(t)&&super.attributeChangedCallback(t,i,r),t){case base_e.PLAYER_SOFTWARE_NAME:this.playerSoftwareName=r!=null?r:void 0;break;case base_e.PLAYER_SOFTWARE_VERSION:this.playerSoftwareVersion=r!=null?r:void 0;break;case"src":{let E=!!i,S=!!r;!E&&S?base_I(this,m,y).call(this):E&&!S?this.unload():E&&S&&(this.unload(),base_I(this,m,y).call(this));break}case"autoplay":if(r===i)break;(h=n(this,base_l))==null||h.setAutoplay(this.autoplay);break;case"preload":if(r===i)break;(L=n(this,base_l))==null||L.setPreload(r);break;case base_e.PLAYBACK_ID:this.src=dist_qr(this);break;case base_e.DEBUG:{let E=this.debug;this.mux&&console.info("Cannot toggle debug mode of mux data after initialization. Make sure you set all metadata to override before setting the src."),this._hls&&(this._hls.config.debug=E);break}case base_e.METADATA_URL:r&&fetch(r).then(E=>E.json()).then(E=>this.metadata=E).catch(()=>console.error(`Unable to load or parse metadata JSON from metadata-url ${r}!`));break;case base_e.STREAM_TYPE:(r==null||r!==i)&&this.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}));break;case base_e.TARGET_LIVE_WINDOW:(r==null||r!==i)&&this.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0,detail:this.targetLiveWindow}));break;case base_e.LOGO:(r==null||r!==i)&&this.updateLogo();break}}updateLogo(){if(!this.shadowRoot)return;let t=this.shadowRoot.querySelector('slot[name="logo"]');if(!t)return;let i=this.constructor.getLogoHTML(n(this,base_g)||this.logo);t.innerHTML=i}connectedCallback(){var t;(t=super.connectedCallback)==null||t.call(this),this.nativeEl&&this.src&&!n(this,base_l)&&base_I(this,m,y).call(this)}disconnectedCallback(){this.unload()}handleEvent(t){t.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(t.type,{composed:!0,detail:t.detail}))}};base_l=new WeakMap,base_f=new WeakMap,base_b=new WeakMap,base_A=new WeakMap,c=new WeakMap,T=new WeakMap,_=new WeakMap,p=new WeakMap,base_O=new WeakMap,base_g=new WeakMap,m=new WeakSet,y=async function(){n(this,base_f)||(await o(this,base_f,Promise.resolve()),o(this,base_f,null),this.load())};
//# sourceMappingURL=base.mjs.map

;// ../node_modules/castable-video/castable-utils.js
/* global WeakRef */

const privateProps = new WeakMap();

class InvalidStateError extends Error {}
class NotSupportedError extends Error {}
class NotFoundError extends (/* unused pure expression or super */ null && (Error)) {}

const HLS_RESPONSE_HEADERS = ['application/x-mpegURL','application/vnd.apple.mpegurl','audio/mpegurl']

// Fallback to a plain Set if WeakRef is not available.
const IterableWeakSet = globalThis.WeakRef ?
  class extends Set {
    add(el) {
      super.add(new WeakRef(el));
    }
    forEach(fn) {
      super.forEach((ref) => {
        const value = ref.deref();
        if (value) fn(value);
      });
    }
  } : Set;

function onCastApiAvailable(callback) {
  if (!globalThis.chrome?.cast?.isAvailable) {
    globalThis.__onGCastApiAvailable = () => {
      // The globalThis.__onGCastApiAvailable callback alone is not reliable for
      // the added cast.framework. It's loaded in a separate JS file.
      // https://www.gstatic.com/eureka/clank/101/cast_sender.js
      // https://www.gstatic.com/cast/sdk/libs/sender/1.0/cast_framework.js
      customElements
        .whenDefined('google-cast-button')
        .then(callback);
    };
  } else if (!globalThis.cast?.framework) {
    customElements
      .whenDefined('google-cast-button')
      .then(callback);
  } else {
    callback();
  }
}

function requiresCastFramework() {
  // todo: exclude for Android>=56 which supports the Remote Playback API natively.
  return globalThis.chrome;
}

function loadCastFramework() {
  const sdkUrl = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  if (globalThis.chrome?.cast || document.querySelector(`script[src="${sdkUrl}"]`)) return;

  const script = document.createElement('script');
  script.src = sdkUrl;
  document.head.append(script);
}

function castContext() {
  return globalThis.cast?.framework?.CastContext.getInstance();
}

function currentSession() {
  return castContext()?.getCurrentSession();
}

function currentMedia() {
  return currentSession()?.getSessionObj().media[0];
}

function editTracksInfo(request) {
  return new Promise((resolve, reject) => {
    currentMedia().editTracksInfo(request, resolve, reject);
  });
}

function getMediaStatus(request) {
  return new Promise((resolve, reject) => {
    currentMedia().getStatus(request, resolve, reject);
  });
}

function setCastOptions(options) {
  return castContext().setOptions({
    ...getDefaultCastOptions(),
    ...options,
  });
}

function getDefaultCastOptions() {
  return {
    // Set the receiver application ID to your own (created in the
    // Google Cast Developer Console), or optionally
    // use the chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    receiverApplicationId: 'CC1AD845',

    // Auto join policy can be one of the following three:
    // ORIGIN_SCOPED - Auto connect from same appId and page origin
    // TAB_AND_ORIGIN_SCOPED - Auto connect from same appId, page origin, and tab
    // PAGE_SCOPED - No auto connect
    autoJoinPolicy: 'origin_scoped',

    // The following flag enables Cast Connect(requires Chrome 87 or higher)
    // https://developers.googleblog.com/2020/08/introducing-cast-connect-android-tv.html
    androidReceiverCompatible: false,

    language: 'en-US',
    resumeSavedSession: true,
  };
}

//Get the segment format given the end of the URL (.m4s, .ts, etc)
function getFormat(segment) {
  if (!segment) return undefined;

  const regex = /\.([a-zA-Z0-9]+)(?:\?.*)?$/;
  const match = segment.match(regex);
  return match ? match[1] : null;
}

function parsePlaylistUrls(playlistContent) {
  const lines = playlistContent.split('\n');
  const urls = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Locate available video playlists and get the next line which is the URI (https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-17#section-4.4.6.2)
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
      if (nextLine && !nextLine.startsWith('#')) {
        urls.push(nextLine);
      }
    }
  }

  return urls;
}

function parseSegment(playlistContent){
  const lines = playlistContent.split('\n');

  const url = lines.find(line => !line.trim().startsWith('#') && line.trim() !== '');

  return url;
}

async function isHls(url) {
  try {
    const response = await fetch(url, {method: 'HEAD'});
    const contentType = response.headers.get('Content-Type');

    return HLS_RESPONSE_HEADERS.some((header) => contentType === header);
  } catch (err) {
    console.error('Error while trying to get the Content-Type of the manifest', err);
    return false;
  }
}

async function getPlaylistSegmentFormat(url) {
  try {
    const mainManifestContent = await (await fetch(url)).text();
    let availableChunksContent = mainManifestContent;

    const playlists = parsePlaylistUrls(mainManifestContent);
    if (playlists.length > 0) {    
      const chosenPlaylistUrl = new URL(playlists[0], url).toString();
      availableChunksContent = await (await fetch(chosenPlaylistUrl)).text();
    }

    const segment = parseSegment(availableChunksContent);
    const format = getFormat(segment);
    return format
  } catch (err) {
    console.error('Error while trying to parse the manifest playlist', err);
    return undefined;
  }
}
;// ../node_modules/castable-video/castable-remote-playback.js
/* global chrome, cast */


const remoteInstances = new IterableWeakSet();
const castElementRef = new WeakSet();

let cf;

onCastApiAvailable(() => {
  if (!globalThis.chrome?.cast?.isAvailable) {
    // Useful to see in verbose logs if this shows undefined or false.
    console.debug('chrome.cast.isAvailable', globalThis.chrome?.cast?.isAvailable);
    return;
  }

  if (!cf) {
    cf = cast.framework;

    castContext().addEventListener(cf.CastContextEventType.CAST_STATE_CHANGED, (e) => {
      remoteInstances.forEach((r) => privateProps.get(r).onCastStateChanged?.(e));
    });

    castContext().addEventListener(cf.CastContextEventType.SESSION_STATE_CHANGED, (e) => {
      remoteInstances.forEach((r) => privateProps.get(r).onSessionStateChanged?.(e));
    });

    remoteInstances.forEach((r) => privateProps.get(r).init?.());
  }
});


let remotePlaybackCallbackIdCount = 0;

/**
 * Remote Playback shim for the Google cast SDK.
 * https://w3c.github.io/remote-playback/
 */
class RemotePlayback extends EventTarget {
  #media;
  #isInit;
  #remotePlayer;
  #remoteListeners;
  #state = 'disconnected';
  #available = false;
  #callbacks = new Set();
  #callbackIds = new WeakMap();

  constructor(media) {
    super();

    this.#media = media;

    remoteInstances.add(this);
    privateProps.set(this, {
      init: () => this.#init(),
      onCastStateChanged: () => this.#onCastStateChanged(),
      onSessionStateChanged: () => this.#onSessionStateChanged(),
      getCastPlayer: () => this.#castPlayer,
    });

    this.#init();
  }

  get #castPlayer() {
    if (castElementRef.has(this.#media)) return this.#remotePlayer;
    return undefined;
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/RemotePlayback/state
   * @return {'disconnected'|'connecting'|'connected'}
   */
  get state() {
    return this.#state;
  }

  async watchAvailability(callback) {
    if (this.#media.disableRemotePlayback) {
      throw new InvalidStateError('disableRemotePlayback attribute is present.');
    }

    this.#callbackIds.set(callback, ++remotePlaybackCallbackIdCount);
    this.#callbacks.add(callback);

    // https://w3c.github.io/remote-playback/#getting-the-remote-playback-devices-availability-information
    queueMicrotask(() => callback(this.#hasDevicesAvailable()));

    return remotePlaybackCallbackIdCount;
  }

  async cancelWatchAvailability(callback) {
    if (this.#media.disableRemotePlayback) {
      throw new InvalidStateError('disableRemotePlayback attribute is present.');
    }

    if (callback) {
      this.#callbacks.delete(callback);
    } else {
      this.#callbacks.clear();
    }
  }

  async prompt() {
    if (this.#media.disableRemotePlayback) {
      throw new InvalidStateError('disableRemotePlayback attribute is present.');
    }

    if (!globalThis.chrome?.cast?.isAvailable) {
      throw new NotSupportedError('The RemotePlayback API is disabled on this platform.');
    }

    const willDisconnect = castElementRef.has(this.#media);
    castElementRef.add(this.#media);

    setCastOptions(this.#media.castOptions);

    Object.entries(this.#remoteListeners).forEach(([event, listener]) => {
      this.#remotePlayer.controller.addEventListener(event, listener);
    });

    try {
      // Open browser cast menu.
      await castContext().requestSession();
    } catch (err) {
      // If there will be no disconnect, reset some state here.
      if (!willDisconnect) {
        castElementRef.delete(this.#media);
      }

      // Don't throw an error if disconnecting or cancelling.
      if (err === 'cancel') {
        return;
      }

      throw new Error(err);
    }

    privateProps.get(this.#media)?.loadOnPrompt?.();
  }

  #disconnect() {
    if (!castElementRef.has(this.#media)) return;

    Object.entries(this.#remoteListeners).forEach(([event, listener]) => {
      this.#remotePlayer.controller.removeEventListener(event, listener);
    });

    castElementRef.delete(this.#media);

    // isMuted is not in savedPlayerState. should we sync this back to local?
    this.#media.muted = this.#remotePlayer.isMuted;
    this.#media.currentTime = this.#remotePlayer.savedPlayerState.currentTime;
    if (this.#remotePlayer.savedPlayerState.isPaused === false) {
      this.#media.play();
    }
  }

  #hasDevicesAvailable() {
    // Cast state: NO_DEVICES_AVAILABLE, NOT_CONNECTED, CONNECTING, CONNECTED
    // https://developers.google.com/cast/docs/reference/web_sender/cast.framework#.CastState
    const castState = castContext()?.getCastState();
    return castState && castState !== 'NO_DEVICES_AVAILABLE';
  }

  #onCastStateChanged() {
    // Cast state: NO_DEVICES_AVAILABLE, NOT_CONNECTED, CONNECTING, CONNECTED
    // https://developers.google.com/cast/docs/reference/web_sender/cast.framework#.CastState
    const castState = castContext().getCastState();

    if (castElementRef.has(this.#media)) {
      if (castState === 'CONNECTING') {
        this.#state = 'connecting';
        this.dispatchEvent(new Event('connecting'));
      }
    }

    if (!this.#available && castState?.includes('CONNECT')) {
      this.#available = true;
      for (let callback of this.#callbacks) callback(true);
    }
    else if (this.#available && (!castState || castState === 'NO_DEVICES_AVAILABLE')) {
      this.#available = false;
      for (let callback of this.#callbacks) callback(false);
    }
  }

  async #onSessionStateChanged() {
    // Session states: NO_SESSION, SESSION_STARTING, SESSION_STARTED, SESSION_START_FAILED,
    //                 SESSION_ENDING, SESSION_ENDED, SESSION_RESUMED
    // https://developers.google.com/cast/docs/reference/web_sender/cast.framework#.SessionState

    const { SESSION_RESUMED } = cf.SessionState;
    if (castContext().getSessionState() === SESSION_RESUMED) {
      /**
       * Figure out if this was the video that started the resumed session.
       * @TODO make this more specific than just checking against the video src!! (WL)
       *
       * If this video element can get the same unique id on each browser refresh
       * it would be possible to pass this unique id w/ `LoadRequest.customData`
       * and verify against currentMedia().customData below.
       */
      if (this.#media.castSrc === currentMedia()?.media.contentId) {
        castElementRef.add(this.#media);

        Object.entries(this.#remoteListeners).forEach(([event, listener]) => {
          this.#remotePlayer.controller.addEventListener(event, listener);
        });

        /**
         * There is cast framework resume session bug when you refresh the page a few
         * times the this.#remotePlayer.currentTime will not be in sync with the receiver :(
         * The below status request syncs it back up.
         */
        try {
          await getMediaStatus(new chrome.cast.media.GetStatusRequest());
        } catch (error) {
          console.error(error);
        }

        // Dispatch the play, playing events manually to sync remote playing state.
        this.#remoteListeners[cf.RemotePlayerEventType.IS_PAUSED_CHANGED]();
        this.#remoteListeners[cf.RemotePlayerEventType.PLAYER_STATE_CHANGED]();
      }
    }
  }

  #init() {
    if (!cf || this.#isInit) return;
    this.#isInit = true;

    setCastOptions(this.#media.castOptions);

    /**
     * @TODO add listeners for addtrack, removetrack (WL)
     * This only has an impact on <track> with a `src` because these have to be
     * loaded manually in the load() method. This will require a new load() call
     * for each added/removed track w/ src.
     */
    this.#media.textTracks.addEventListener('change', () => this.#updateRemoteTextTrack());

    this.#onCastStateChanged();

    this.#remotePlayer = new cf.RemotePlayer();
    new cf.RemotePlayerController(this.#remotePlayer);

    this.#remoteListeners = {
      [cf.RemotePlayerEventType.IS_CONNECTED_CHANGED]: ({ value }) => {
        if (value === true) {
          this.#state = 'connected';
          this.dispatchEvent(new Event('connect'));
        } else {
          this.#disconnect();
          this.#state = 'disconnected';
          this.dispatchEvent(new Event('disconnect'));
        }
      },
      [cf.RemotePlayerEventType.DURATION_CHANGED]: () => {
        this.#media.dispatchEvent(new Event('durationchange'));
      },
      [cf.RemotePlayerEventType.VOLUME_LEVEL_CHANGED]: () => {
        this.#media.dispatchEvent(new Event('volumechange'));
      },
      [cf.RemotePlayerEventType.IS_MUTED_CHANGED]: () => {
        this.#media.dispatchEvent(new Event('volumechange'));
      },
      [cf.RemotePlayerEventType.CURRENT_TIME_CHANGED]: () => {
        if (!this.#castPlayer?.isMediaLoaded) return;
        this.#media.dispatchEvent(new Event('timeupdate'));
      },
      [cf.RemotePlayerEventType.VIDEO_INFO_CHANGED]: () => {
        this.#media.dispatchEvent(new Event('resize'));
      },
      [cf.RemotePlayerEventType.IS_PAUSED_CHANGED]: () => {
        this.#media.dispatchEvent(new Event(this.paused ? 'pause' : 'play'));
      },
      [cf.RemotePlayerEventType.PLAYER_STATE_CHANGED]: () => {
        // Player states: IDLE, PLAYING, PAUSED, BUFFERING
        // https://developers.google.com/cast/docs/reference/web_sender/chrome.cast.media#.PlayerState

        // pause event is handled above.
        if (this.#castPlayer?.playerState === chrome.cast.media.PlayerState.PAUSED) {
          return;
        }

        this.#media.dispatchEvent(
          new Event(
            {
              [chrome.cast.media.PlayerState.PLAYING]: 'playing',
              [chrome.cast.media.PlayerState.BUFFERING]: 'waiting',
              [chrome.cast.media.PlayerState.IDLE]: 'emptied',
            }[this.#castPlayer?.playerState]
          )
        );
      },
      [cf.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED]: async () => {
        if (!this.#castPlayer?.isMediaLoaded) return;

        // mediaInfo is not immediately available due to a bug? wait one tick
        await Promise.resolve();
        this.#onRemoteMediaLoaded();
      },
    };
  }

  #onRemoteMediaLoaded() {
    this.#updateRemoteTextTrack();
  }

  async #updateRemoteTextTrack() {
    if (!this.#castPlayer) return;

    // Get the tracks w/ trackId's that have been loaded; manually or via a playlist like a M3U8 or MPD.
    const remoteTracks = this.#remotePlayer.mediaInfo?.tracks ?? [];
    const remoteSubtitles = remoteTracks.filter(
      ({ type }) => type === chrome.cast.media.TrackType.TEXT
    );

    const localSubtitles = [...this.#media.textTracks].filter(
      ({ kind }) => kind === 'subtitles' || kind === 'captions'
    );

    // Create a new array from the local subs w/ the trackId's from the remote subs.
    const subtitles = remoteSubtitles
      .map(({ language, name, trackId }) => {
        // Find the corresponding local text track and assign the trackId.
        const { mode } =
          localSubtitles.find(
            (local) => local.language === language && local.label === name
          ) ?? {};
        if (mode) return { mode, trackId };
        return false;
      })
      .filter(Boolean);

    const hiddenSubtitles = subtitles.filter(
      ({ mode }) => mode !== 'showing'
    );
    const hiddenTrackIds = hiddenSubtitles.map(({ trackId }) => trackId);
    const showingSubtitle = subtitles.find(({ mode }) => mode === 'showing');

    // Note this could also include audio or video tracks, diff against local state.
    const activeTrackIds =
      currentSession()?.getSessionObj().media[0]
        ?.activeTrackIds ?? [];
    let requestTrackIds = activeTrackIds;

    if (activeTrackIds.length) {
      // Filter out all local hidden subtitle trackId's.
      requestTrackIds = requestTrackIds.filter(
        (id) => !hiddenTrackIds.includes(id)
      );
    }

    if (showingSubtitle?.trackId) {
      requestTrackIds = [...requestTrackIds, showingSubtitle.trackId];
    }

    // Remove duplicate ids.
    requestTrackIds = [...new Set(requestTrackIds)];

    const arrayEquals = (a, b) =>
      a.length === b.length && a.every((a) => b.includes(a));
    if (!arrayEquals(activeTrackIds, requestTrackIds)) {
      try {
        const request = new chrome.cast.media.EditTracksInfoRequest(
          requestTrackIds
        );
        await editTracksInfo(request);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

;// ../node_modules/castable-video/castable-mixin.js
/* global chrome */



/**
 * CastableMediaMixin
 *
 * This mixin function provides a way to compose multiple classes.
 * @see https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 *
 * @param  {HTMLMediaElement} superclass - HTMLMediaElement or an extended class of it.
 * @return {CastableMedia}
 */
const CastableMediaMixin = (superclass) =>
  class CastableMedia extends superclass {

    static observedAttributes = [
      ...(superclass.observedAttributes ?? []),
      'cast-src',
      'cast-content-type',
      'cast-stream-type',
      'cast-receiver',
    ];

    #localState = { paused: false };
    #castOptions = getDefaultCastOptions();
    #castCustomData;
    #remote;

    get remote() {
      if (this.#remote) return this.#remote;

      if (requiresCastFramework()) {
        // No need to load the Cast framework if it's disabled.
        if (!this.disableRemotePlayback) {
          loadCastFramework();
        }

        privateProps.set(this, {
          loadOnPrompt: () => this.#loadOnPrompt()
        });

        return (this.#remote = new RemotePlayback(this));
      }

      return super.remote;
    }

    get #castPlayer() {
      return privateProps.get(this.remote)?.getCastPlayer?.();
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
      super.attributeChangedCallback(attrName, oldValue, newValue);

      if (attrName === 'cast-receiver' && newValue) {
        this.#castOptions.receiverApplicationId = newValue;
        return;
      }

      if (!this.#castPlayer) return;

      switch (attrName) {
        case 'cast-stream-type':
        case 'cast-src':
          this.load();
          break;
      }
    }

    async #loadOnPrompt() {
      // Pause locally when the session is created.
      this.#localState.paused = super.paused;
      super.pause();

      // Sync over the muted state but not volume, 100% is different on TV's :P
      this.muted = super.muted;

      try {
        await this.load();
      } catch (err) {
        console.error(err);
      }
    }

    async load() {
      if (!this.#castPlayer) return super.load();

      const mediaInfo = new chrome.cast.media.MediaInfo(this.castSrc, this.castContentType);
      mediaInfo.customData = this.castCustomData;

      // Manually add text tracks with a `src` attribute.
      // M3U8's load text tracks in the receiver, handle these in the media loaded event.
      const subtitles = [...this.querySelectorAll('track')].filter(
        ({ kind, src }) => src && (kind === 'subtitles' || kind === 'captions')
      );

      const activeTrackIds = [];
      let textTrackIdCount = 0;

      if (subtitles.length) {
        mediaInfo.tracks = subtitles.map((trackEl) => {
          const trackId = ++textTrackIdCount;
          // only activate 1 subtitle text track.
          if (activeTrackIds.length === 0 && trackEl.track.mode === 'showing') {
            activeTrackIds.push(trackId);
          }

          const track = new chrome.cast.media.Track(
            trackId,
            chrome.cast.media.TrackType.TEXT
          );
          track.trackContentId = trackEl.src;
          track.trackContentType = 'text/vtt';
          track.subtype =
            trackEl.kind === 'captions'
              ? chrome.cast.media.TextTrackType.CAPTIONS
              : chrome.cast.media.TextTrackType.SUBTITLES;
          track.name = trackEl.label;
          track.language = trackEl.srclang;
          return track;
        });
      }

      if (this.castStreamType === 'live') {
        mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
      } else {
        mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
      }

      mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = this.title;
      mediaInfo.metadata.images = [{ url: this.poster }];

      if (isHls(this.castSrc)) {
        const segmentFormat = await getPlaylistSegmentFormat(this.castSrc);
        const isFragmentedMP4 = segmentFormat?.includes('m4s') || segmentFormat?.includes('mp4');
        if (isFragmentedMP4) {
          mediaInfo.hlsSegmentFormat = chrome.cast.media.HlsSegmentFormat.FMP4;
          mediaInfo.hlsVideoSegmentFormat = chrome.cast.media.HlsVideoSegmentFormat.FMP4;
        } else if (segmentFormat?.includes('ts')) {
          mediaInfo.hlsSegmentFormat = chrome.cast.media.HlsSegmentFormat.TS;
          mediaInfo.hlsVideoSegmentFormat = chrome.cast.media.HlsVideoSegmentFormat.TS;
        }
      }

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.currentTime = super.currentTime ?? 0;
      request.autoplay = !this.#localState.paused;
      request.activeTrackIds = activeTrackIds;

      await currentSession()?.loadMedia(request);

      this.dispatchEvent(new Event('volumechange'));
    }

    play() {
      if (this.#castPlayer) {
        if (this.#castPlayer.isPaused) {
          this.#castPlayer.controller?.playOrPause();
        }
        return;
      }
      return super.play();
    }

    pause() {
      if (this.#castPlayer) {
        if (!this.#castPlayer.isPaused) {
          this.#castPlayer.controller?.playOrPause();
        }
        return;
      }
      super.pause();
    }

    /**
     * @see https://developers.google.com/cast/docs/reference/web_sender/cast.framework.CastOptions
     * @readonly
     *
     * @typedef {Object} CastOptions
     * @property {string} [receiverApplicationId='CC1AD845'] - The app id of the cast receiver.
     * @property {string} [autoJoinPolicy='origin_scoped'] - The auto join policy.
     * @property {string} [language='en-US'] - The language to use for the cast receiver.
     * @property {boolean} [androidReceiverCompatible=false] - Whether to use the Cast Connect.
     * @property {boolean} [resumeSavedSession=true] - Whether to resume the last session.
     *
     * @return {CastOptions}
     */
    get castOptions() {
      return this.#castOptions;
    }

    get castReceiver() {
      return this.getAttribute('cast-receiver') ?? undefined;
    }

    set castReceiver(val) {
      if (this.castReceiver == val) return;
      this.setAttribute('cast-receiver', `${val}`);
    }

    // Allow the cast source url to be different than <video src>, could be a blob.
    get castSrc() {
      // Try the first <source src> for usage with even more native markup.
      return (
        this.getAttribute('cast-src') ??
        this.querySelector('source')?.src ??
        this.currentSrc
      );
    }

    set castSrc(val) {
      if (this.castSrc == val) return;
      this.setAttribute('cast-src', `${val}`);
    }

    get castContentType() {
      return this.getAttribute('cast-content-type') ?? undefined;
    }

    set castContentType(val) {
      this.setAttribute('cast-content-type', `${val}`);
    }

    get castStreamType() {
      // NOTE: Per https://github.com/video-dev/media-ui-extensions/issues/3 `streamType` may yield `"unknown"`
      return this.getAttribute('cast-stream-type') ?? this.streamType ?? undefined;
    }

    set castStreamType(val) {
      this.setAttribute('cast-stream-type', `${val}`);
    }

    get castCustomData() {
      return this.#castCustomData;
    }

    set castCustomData(val) {
      const valType = typeof val;
      if (!['object', 'undefined'].includes(valType)) {
        console.error(`castCustomData must be nullish or an object but value was of type ${valType}`);
        return;
      }

      this.#castCustomData = val;
    }

    get readyState() {
      if (this.#castPlayer) {
        switch (this.#castPlayer.playerState) {
          case chrome.cast.media.PlayerState.IDLE:
            return 0;
          case chrome.cast.media.PlayerState.BUFFERING:
            return 2;
          default:
            return 3;
        }
      }
      return super.readyState;
    }

    get paused() {
      if (this.#castPlayer) return this.#castPlayer.isPaused;
      return super.paused;
    }

    get muted() {
      if (this.#castPlayer) return this.#castPlayer?.isMuted;
      return super.muted;
    }

    set muted(val) {
      if (this.#castPlayer) {
        if (
          (val && !this.#castPlayer.isMuted) ||
          (!val && this.#castPlayer.isMuted)
        ) {
          this.#castPlayer.controller?.muteOrUnmute();
        }
        return;
      }
      super.muted = val;
    }

    get volume() {
      if (this.#castPlayer) return this.#castPlayer?.volumeLevel ?? 1;
      return super.volume;
    }

    set volume(val) {
      if (this.#castPlayer) {
        this.#castPlayer.volumeLevel = +val;
        this.#castPlayer.controller?.setVolumeLevel();
        return;
      }
      super.volume = val;
    }

    get duration() {
      // castPlayer duration returns `0` when no media is loaded.
      if (this.#castPlayer && this.#castPlayer?.isMediaLoaded) {
        return this.#castPlayer?.duration ?? NaN;
      }
      return super.duration;
    }

    get currentTime() {
      if (this.#castPlayer && this.#castPlayer?.isMediaLoaded) {
        return this.#castPlayer?.currentTime ?? 0;
      }
      return super.currentTime;
    }

    set currentTime(val) {
      if (this.#castPlayer) {
        this.#castPlayer.currentTime = val;
        this.#castPlayer.controller?.seek();
        return;
      }
      super.currentTime = val;
    }
  };

const CastableVideoMixin = (/* unused pure expression or super */ null && (CastableMediaMixin));

// EXTERNAL MODULE: ../node_modules/media-tracks/dist/index.js + 12 modules
var dist = __webpack_require__(39837);
;// ../node_modules/@mux/mux-video/dist/index.mjs
var dist_f=e=>{throw TypeError(e)};var dist_g=(e,o,t)=>o.has(e)||dist_f("Cannot "+t);var dist_u=(e,o,t)=>(dist_g(e,o,"read from private field"),t?t.call(e):o.get(e)),dist_m=(e,o,t)=>o.has(e)?dist_f("Cannot add the same private member more than once"):o instanceof WeakSet?o.add(e):o.set(e,t),d=(e,o,t,l)=>(dist_g(e,o,"write to private field"),l?l.call(e,t):o.set(e,t),t);var s=class{addEventListener(){}removeEventListener(){}dispatchEvent(o){return!0}};if(typeof DocumentFragment=="undefined"){class e extends s{}globalThis.DocumentFragment=e}var dist_n=class extends s{},dist_p=class extends s{},dist_x={get(e){},define(e,o,t){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(dist_n)}},a,h=class{constructor(o,t={}){dist_m(this,a);d(this,a,t==null?void 0:t.detail)}get detail(){return dist_u(this,a)}initCustomEvent(){}};a=new WeakMap;function mux_video_dist_C(e,o){return new dist_n}var dist_y={document:{createElement:mux_video_dist_C},DocumentFragment,customElements:dist_x,CustomEvent:h,EventTarget:s,HTMLElement:dist_n,HTMLVideoElement:dist_p},dist_b=typeof window=="undefined"||typeof globalThis.customElements=="undefined",dist_c=dist_b?dist_y:globalThis,k=dist_b?dist_y.document:globalThis.document;var r,i=class extends CastableMediaMixin((0,dist/* MediaTracksMixin */.u6)(base_K)){constructor(){super(...arguments);dist_m(this,r)}get autoplay(){let t=this.getAttribute("autoplay");return t===null?!1:t===""?!0:t}set autoplay(t){let l=this.autoplay;t!==l&&(t?this.setAttribute("autoplay",typeof t=="string"?t:""):this.removeAttribute("autoplay"))}get muxCastCustomData(){return{mux:{playbackId:this.playbackId,minResolution:this.minResolution,maxResolution:this.maxResolution,renditionOrder:this.renditionOrder,customDomain:this.customDomain,tokens:{drm:this.drmToken},envKey:this.envKey,metadata:this.metadata,disableCookies:this.disableCookies,disableTracking:this.disableTracking,beaconCollectionDomain:this.beaconCollectionDomain,startTime:this.startTime,preferCmcd:this.preferCmcd}}}get castCustomData(){var t;return(t=dist_u(this,r))!=null?t:this.muxCastCustomData}set castCustomData(t){d(this,r,t)}};r=new WeakMap;dist_c.customElements.get("mux-video")||(dist_c.customElements.define("mux-video",i),dist_c.MuxVideoElement=i);var mux_video_dist_F=(/* unused pure expression or super */ null && (i));
//# sourceMappingURL=index.mjs.map

;// ../node_modules/media-chrome/dist/constants.js
const MediaUIEvents = {
  MEDIA_PLAY_REQUEST: "mediaplayrequest",
  MEDIA_PAUSE_REQUEST: "mediapauserequest",
  MEDIA_MUTE_REQUEST: "mediamuterequest",
  MEDIA_UNMUTE_REQUEST: "mediaunmuterequest",
  MEDIA_VOLUME_REQUEST: "mediavolumerequest",
  MEDIA_SEEK_REQUEST: "mediaseekrequest",
  MEDIA_AIRPLAY_REQUEST: "mediaairplayrequest",
  MEDIA_ENTER_FULLSCREEN_REQUEST: "mediaenterfullscreenrequest",
  MEDIA_EXIT_FULLSCREEN_REQUEST: "mediaexitfullscreenrequest",
  MEDIA_PREVIEW_REQUEST: "mediapreviewrequest",
  MEDIA_ENTER_PIP_REQUEST: "mediaenterpiprequest",
  MEDIA_EXIT_PIP_REQUEST: "mediaexitpiprequest",
  MEDIA_ENTER_CAST_REQUEST: "mediaentercastrequest",
  MEDIA_EXIT_CAST_REQUEST: "mediaexitcastrequest",
  MEDIA_SHOW_TEXT_TRACKS_REQUEST: "mediashowtexttracksrequest",
  MEDIA_HIDE_TEXT_TRACKS_REQUEST: "mediahidetexttracksrequest",
  MEDIA_SHOW_SUBTITLES_REQUEST: "mediashowsubtitlesrequest",
  MEDIA_DISABLE_SUBTITLES_REQUEST: "mediadisablesubtitlesrequest",
  MEDIA_TOGGLE_SUBTITLES_REQUEST: "mediatogglesubtitlesrequest",
  MEDIA_PLAYBACK_RATE_REQUEST: "mediaplaybackraterequest",
  MEDIA_RENDITION_REQUEST: "mediarenditionrequest",
  MEDIA_AUDIO_TRACK_REQUEST: "mediaaudiotrackrequest",
  MEDIA_SEEK_TO_LIVE_REQUEST: "mediaseektoliverequest",
  REGISTER_MEDIA_STATE_RECEIVER: "registermediastatereceiver",
  UNREGISTER_MEDIA_STATE_RECEIVER: "unregistermediastatereceiver"
};
const MediaStateReceiverAttributes = {
  MEDIA_CHROME_ATTRIBUTES: "mediachromeattributes",
  MEDIA_CONTROLLER: "mediacontroller"
};
const MediaUIProps = {
  MEDIA_AIRPLAY_UNAVAILABLE: "mediaAirplayUnavailable",
  MEDIA_AUDIO_TRACK_ENABLED: "mediaAudioTrackEnabled",
  MEDIA_AUDIO_TRACK_LIST: "mediaAudioTrackList",
  MEDIA_AUDIO_TRACK_UNAVAILABLE: "mediaAudioTrackUnavailable",
  MEDIA_BUFFERED: "mediaBuffered",
  MEDIA_CAST_UNAVAILABLE: "mediaCastUnavailable",
  MEDIA_CHAPTERS_CUES: "mediaChaptersCues",
  MEDIA_CURRENT_TIME: "mediaCurrentTime",
  MEDIA_DURATION: "mediaDuration",
  MEDIA_ENDED: "mediaEnded",
  MEDIA_ERROR: "mediaError",
  MEDIA_ERROR_CODE: "mediaErrorCode",
  MEDIA_ERROR_MESSAGE: "mediaErrorMessage",
  MEDIA_FULLSCREEN_UNAVAILABLE: "mediaFullscreenUnavailable",
  MEDIA_HAS_PLAYED: "mediaHasPlayed",
  MEDIA_HEIGHT: "mediaHeight",
  MEDIA_IS_AIRPLAYING: "mediaIsAirplaying",
  MEDIA_IS_CASTING: "mediaIsCasting",
  MEDIA_IS_FULLSCREEN: "mediaIsFullscreen",
  MEDIA_IS_PIP: "mediaIsPip",
  MEDIA_LOADING: "mediaLoading",
  MEDIA_MUTED: "mediaMuted",
  MEDIA_PAUSED: "mediaPaused",
  MEDIA_PIP_UNAVAILABLE: "mediaPipUnavailable",
  MEDIA_PLAYBACK_RATE: "mediaPlaybackRate",
  MEDIA_PREVIEW_CHAPTER: "mediaPreviewChapter",
  MEDIA_PREVIEW_COORDS: "mediaPreviewCoords",
  MEDIA_PREVIEW_IMAGE: "mediaPreviewImage",
  MEDIA_PREVIEW_TIME: "mediaPreviewTime",
  MEDIA_RENDITION_LIST: "mediaRenditionList",
  MEDIA_RENDITION_SELECTED: "mediaRenditionSelected",
  MEDIA_RENDITION_UNAVAILABLE: "mediaRenditionUnavailable",
  MEDIA_SEEKABLE: "mediaSeekable",
  MEDIA_STREAM_TYPE: "mediaStreamType",
  MEDIA_SUBTITLES_LIST: "mediaSubtitlesList",
  MEDIA_SUBTITLES_SHOWING: "mediaSubtitlesShowing",
  MEDIA_TARGET_LIVE_WINDOW: "mediaTargetLiveWindow",
  MEDIA_TIME_IS_LIVE: "mediaTimeIsLive",
  MEDIA_VOLUME: "mediaVolume",
  MEDIA_VOLUME_LEVEL: "mediaVolumeLevel",
  MEDIA_VOLUME_UNAVAILABLE: "mediaVolumeUnavailable",
  MEDIA_LANG: "mediaLang",
  MEDIA_WIDTH: "mediaWidth"
};
const MediaUIPropsEntries = Object.entries(
  MediaUIProps
);
const MediaUIAttributes = MediaUIPropsEntries.reduce(
  (dictObj, [key, propName]) => {
    dictObj[key] = propName.toLowerCase();
    return dictObj;
  },
  {}
);
const AdditionalStateChangeEvents = {
  USER_INACTIVE_CHANGE: "userinactivechange",
  BREAKPOINTS_CHANGE: "breakpointchange",
  BREAKPOINTS_COMPUTED: "breakpointscomputed"
};
const MediaStateChangeEvents = MediaUIPropsEntries.reduce(
  (dictObj, [key, propName]) => {
    dictObj[key] = propName.toLowerCase();
    return dictObj;
  },
  { ...AdditionalStateChangeEvents }
);
const StateChangeEventToAttributeMap = Object.entries(
  MediaStateChangeEvents
).reduce(
  (mapObj, [key, eventType]) => {
    const attrName = MediaUIAttributes[key];
    if (attrName) {
      mapObj[eventType] = attrName;
    }
    return mapObj;
  },
  { userinactivechange: "userinactive" }
);
const AttributeToStateChangeEventMap = Object.entries(
  MediaUIAttributes
).reduce(
  (mapObj, [key, attrName]) => {
    const evtType = MediaStateChangeEvents[key];
    if (evtType) {
      mapObj[attrName] = evtType;
    }
    return mapObj;
  },
  { userinactive: "userinactivechange" }
);
const TextTrackKinds = {
  SUBTITLES: "subtitles",
  CAPTIONS: "captions",
  DESCRIPTIONS: "descriptions",
  CHAPTERS: "chapters",
  METADATA: "metadata"
};
const TextTrackModes = {
  DISABLED: "disabled",
  HIDDEN: "hidden",
  SHOWING: "showing"
};
const ReadyStates = {
  HAVE_NOTHING: 0,
  HAVE_METADATA: 1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA: 3,
  HAVE_ENOUGH_DATA: 4
};
const PointerTypes = {
  MOUSE: "mouse",
  PEN: "pen",
  TOUCH: "touch"
};
const AvailabilityStates = {
  UNAVAILABLE: "unavailable",
  UNSUPPORTED: "unsupported"
};
const StreamTypes = {
  LIVE: "live",
  ON_DEMAND: "on-demand",
  UNKNOWN: "unknown"
};
const VolumeLevels = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  OFF: "off"
};
const WebkitPresentationModes = {
  INLINE: "inline",
  FULLSCREEN: "fullscreen",
  PICTURE_IN_PICTURE: "picture-in-picture"
};


;// ../node_modules/media-chrome/dist/utils/utils.js
function stringifyRenditionList(renditions) {
  return renditions == null ? void 0 : renditions.map(stringifyRendition).join(" ");
}
function parseRenditionList(renditions) {
  return renditions == null ? void 0 : renditions.split(/\s+/).map(parseRendition);
}
function stringifyRendition(rendition) {
  if (rendition) {
    const { id, width, height } = rendition;
    return [id, width, height].filter((a) => a != null).join(":");
  }
}
function parseRendition(rendition) {
  if (rendition) {
    const [id, width, height] = rendition.split(":");
    return { id, width: +width, height: +height };
  }
}
function stringifyAudioTrackList(audioTracks) {
  return audioTracks == null ? void 0 : audioTracks.map(stringifyAudioTrack).join(" ");
}
function parseAudioTrackList(audioTracks) {
  return audioTracks == null ? void 0 : audioTracks.split(/\s+/).map(parseAudioTrack);
}
function stringifyAudioTrack(audioTrack) {
  if (audioTrack) {
    const { id, kind, language, label } = audioTrack;
    return [id, kind, language, label].filter((a) => a != null).join(":");
  }
}
function parseAudioTrack(audioTrack) {
  if (audioTrack) {
    const [id, kind, language, label] = audioTrack.split(":");
    return {
      id,
      kind,
      language,
      label
    };
  }
}
function dashedToCamel(word) {
  return word.split("-").map(function(x, i) {
    return (i ? x[0].toUpperCase() : x[0].toLowerCase()) + x.slice(1).toLowerCase();
  }).join("");
}
function constToCamel(word, upperFirst = false) {
  return word.split("_").map(function(x, i) {
    return (i || upperFirst ? x[0].toUpperCase() : x[0].toLowerCase()) + x.slice(1).toLowerCase();
  }).join("");
}
function camelCase(name) {
  return name.replace(/[-_]([a-z])/g, ($0, $1) => $1.toUpperCase());
}
function isValidNumber(x) {
  return typeof x === "number" && !Number.isNaN(x) && Number.isFinite(x);
}
function isNumericString(str) {
  if (typeof str != "string")
    return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const capitalize = (str) => str && str[0].toUpperCase() + str.slice(1);


;// ../node_modules/media-chrome/dist/utils/time.js

const UnitLabels = [
  {
    singular: "hour",
    plural: "hours"
  },
  {
    singular: "minute",
    plural: "minutes"
  },
  {
    singular: "second",
    plural: "seconds"
  }
];
const toTimeUnitPhrase = (timeUnitValue, unitIndex) => {
  const unitLabel = timeUnitValue === 1 ? UnitLabels[unitIndex].singular : UnitLabels[unitIndex].plural;
  return `${timeUnitValue} ${unitLabel}`;
};
const formatAsTimePhrase = (seconds) => {
  if (!isValidNumber(seconds))
    return "";
  const positiveSeconds = Math.abs(seconds);
  const negative = positiveSeconds !== seconds;
  const secondsDateTime = new Date(0, 0, 0, 0, 0, positiveSeconds, 0);
  const timeParts = [
    secondsDateTime.getHours(),
    secondsDateTime.getMinutes(),
    secondsDateTime.getSeconds()
  ];
  const timeString = timeParts.map(
    (timeUnitValue, index) => timeUnitValue && toTimeUnitPhrase(timeUnitValue, index)
  ).filter((x) => x).join(", ");
  const negativeSuffix = negative ? " remaining" : "";
  return `${timeString}${negativeSuffix}`;
};
function formatTime(seconds, guide) {
  let negative = false;
  if (seconds < 0) {
    negative = true;
    seconds = 0 - seconds;
  }
  seconds = seconds < 0 ? 0 : seconds;
  let s = Math.floor(seconds % 60);
  let m = Math.floor(seconds / 60 % 60);
  let h = Math.floor(seconds / 3600);
  const gm = Math.floor(guide / 60 % 60);
  const gh = Math.floor(guide / 3600);
  if (isNaN(seconds) || seconds === Infinity) {
    h = m = s = "0";
  }
  h = h > 0 || gh > 0 ? h + ":" : "";
  m = ((h || gm >= 10) && m < 10 ? "0" + m : m) + ":";
  s = s < 10 ? "0" + s : s;
  return (negative ? "-" : "") + h + m + s;
}
const emptyTimeRanges = Object.freeze({
  length: 0,
  start(index) {
    const unsignedIdx = index >>> 0;
    if (unsignedIdx >= this.length) {
      throw new DOMException(
        `Failed to execute 'start' on 'TimeRanges': The index provided (${unsignedIdx}) is greater than or equal to the maximum bound (${this.length}).`
      );
    }
    return 0;
  },
  end(index) {
    const unsignedIdx = index >>> 0;
    if (unsignedIdx >= this.length) {
      throw new DOMException(
        `Failed to execute 'end' on 'TimeRanges': The index provided (${unsignedIdx}) is greater than or equal to the maximum bound (${this.length}).`
      );
    }
    return 0;
  }
});
function serializeTimeRanges(timeRanges = emptyTimeRanges) {
  return Array.from(timeRanges).map(
    (_, i) => [
      Number(timeRanges.start(i).toFixed(3)),
      Number(timeRanges.end(i).toFixed(3))
    ].join(":")
  ).join(" ");
}


;// ../node_modules/media-chrome/dist/lang/en.js
const En = {
  "Start airplay": "Start airplay",
  "Stop airplay": "Stop airplay",
  Audio: "Audio",
  Captions: "Captions",
  "Enable captions": "Enable captions",
  "Disable captions": "Disable captions",
  "Start casting": "Start casting",
  "Stop casting": "Stop casting",
  "Enter fullscreen mode": "Enter fullscreen mode",
  "Exit fullscreen mode": "Exit fullscreen mode",
  Mute: "Mute",
  Unmute: "Unmute",
  "Enter picture in picture mode": "Enter picture in picture mode",
  "Exit picture in picture mode": "Exit picture in picture mode",
  Play: "Play",
  Pause: "Pause",
  "Playback rate": "Playback rate",
  "Playback rate {playbackRate}": "Playback rate {playbackRate}",
  Quality: "Quality",
  "Seek backward": "Seek backward",
  "Seek forward": "Seek forward",
  Settings: "Settings",
  Auto: "Auto",
  "audio player": "audio player",
  "video player": "video player",
  volume: "volume",
  seek: "seek",
  "closed captions": "closed captions",
  "current playback rate": "current playback rate",
  "playback time": "playback time",
  "media loading": "media loading",
  settings: "settings",
  "audio tracks": "audio tracks",
  quality: "quality",
  play: "play",
  pause: "pause",
  mute: "mute",
  unmute: "unmute",
  "chapter: {chapterName}": "chapter: {chapterName}",
  live: "live",
  Off: "Off",
  "start airplay": "start airplay",
  "stop airplay": "stop airplay",
  "start casting": "start casting",
  "stop casting": "stop casting",
  "enter fullscreen mode": "enter fullscreen mode",
  "exit fullscreen mode": "exit fullscreen mode",
  "enter picture in picture mode": "enter picture in picture mode",
  "exit picture in picture mode": "exit picture in picture mode",
  "seek to live": "seek to live",
  "playing live": "playing live",
  "seek back {seekOffset} seconds": "seek back {seekOffset} seconds",
  "seek forward {seekOffset} seconds": "seek forward {seekOffset} seconds",
  "Network Error": "Network Error",
  "Decode Error": "Decode Error",
  "Source Not Supported": "Source Not Supported",
  "Encryption Error": "Encryption Error",
  "A network error caused the media download to fail.": "A network error caused the media download to fail.",
  "A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.": "A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",
  "An unsupported error occurred. The server or network failed, or your browser does not support this format.": "An unsupported error occurred. The server or network failed, or your browser does not support this format.",
  "The media is encrypted and there are no keys to decrypt it.": "The media is encrypted and there are no keys to decrypt it."
};


;// ../node_modules/media-chrome/dist/utils/i18n.js
var i18n_a;

const translations = {
  en: En
};
let currentLang = ((i18n_a = globalThis.navigator) == null ? void 0 : i18n_a.language) || "en";
const setLanguage = (langCode) => {
  currentLang = langCode;
};
const addTranslation = (lang, languageDictionary) => {
  translations[lang] = languageDictionary;
};
const resolveTranslation = (key) => {
  var _a2, _b, _c;
  const [base] = currentLang.split("-");
  return ((_a2 = translations[currentLang]) == null ? void 0 : _a2[key]) || ((_b = translations[base]) == null ? void 0 : _b[key]) || ((_c = translations.en) == null ? void 0 : _c[key]) || key;
};
const t = (key, vars = {}) => resolveTranslation(key).replace(
  /\{(\w+)\}/g,
  (_, v) => v in vars ? String(vars[v]) : `{${v}}`
);


;// ../node_modules/media-chrome/dist/utils/server-safe-globals.js
class server_safe_globals_EventTarget {
  addEventListener() {
  }
  removeEventListener() {
  }
  dispatchEvent() {
    return true;
  }
}
class Node extends server_safe_globals_EventTarget {
}
class server_safe_globals_Element extends Node {
  constructor() {
    super(...arguments);
    this.role = null;
  }
}
class ResizeObserver {
  observe() {
  }
  unobserve() {
  }
  disconnect() {
  }
}
const documentShim = {
  createElement: function() {
    return new globalThisShim.HTMLElement();
  },
  createElementNS: function() {
    return new globalThisShim.HTMLElement();
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  dispatchEvent(_event) {
    return false;
  }
};
const globalThisShim = {
  ResizeObserver,
  document: documentShim,
  Node,
  Element: server_safe_globals_Element,
  HTMLElement: class HTMLElement extends server_safe_globals_Element {
    constructor() {
      super(...arguments);
      this.innerHTML = "";
    }
    get content() {
      return new globalThisShim.DocumentFragment();
    }
  },
  DocumentFragment: class DocumentFragment extends server_safe_globals_EventTarget {
  },
  customElements: {
    get: function() {
    },
    define: function() {
    },
    whenDefined: function() {
    }
  },
  localStorage: {
    getItem(_key) {
      return null;
    },
    setItem(_key, _value) {
    },
    removeItem(_key) {
    }
  },
  CustomEvent: function CustomEvent() {
  },
  getComputedStyle: function() {
  },
  navigator: {
    languages: [],
    get userAgent() {
      return "";
    }
  },
  matchMedia(media) {
    return {
      matches: false,
      media
    };
  },
  DOMParser: class DOMParser {
    parseFromString(string, _contentType) {
      return {
        body: {
          textContent: string
        }
      };
    }
  }
};
const isServer = typeof window === "undefined" || typeof window.customElements === "undefined";
const isShimmed = Object.keys(globalThisShim).every((key) => key in globalThis);
const GlobalThis = isServer && !isShimmed ? globalThisShim : globalThis;
const server_safe_globals_Document = isServer && !isShimmed ? documentShim : globalThis.document;


;// ../node_modules/media-chrome/dist/utils/resize-observer.js

const callbacksMap = /* @__PURE__ */ new WeakMap();
const getCallbacks = (element) => {
  let callbacks = callbacksMap.get(element);
  if (!callbacks)
    callbacksMap.set(element, callbacks = /* @__PURE__ */ new Set());
  return callbacks;
};
const observer = new GlobalThis.ResizeObserver(
  (entries) => {
    for (const entry of entries) {
      for (const callback of getCallbacks(entry.target)) {
        callback(entry);
      }
    }
  }
);
function observeResize(element, callback) {
  getCallbacks(element).add(callback);
  observer.observe(element);
}
function unobserveResize(element, callback) {
  const callbacks = getCallbacks(element);
  callbacks.delete(callback);
  if (!callbacks.size) {
    observer.unobserve(element);
  }
}


;// ../node_modules/media-chrome/dist/utils/element-utils.js

function namedNodeMapToObject(namedNodeMap) {
  const obj = {};
  for (const attr of namedNodeMap) {
    obj[attr.name] = attr.value;
  }
  return obj;
}
function getMediaController(host) {
  var _a;
  return (_a = getAttributeMediaController(host)) != null ? _a : closestComposedNode(host, "media-controller");
}
function getAttributeMediaController(host) {
  var _a;
  const { MEDIA_CONTROLLER } = MediaStateReceiverAttributes;
  const mediaControllerId = host.getAttribute(MEDIA_CONTROLLER);
  if (mediaControllerId) {
    return (_a = getDocumentOrShadowRoot(host)) == null ? void 0 : _a.getElementById(
      mediaControllerId
    );
  }
}
const updateIconText = (svg, value, selector = ".value") => {
  const node = svg.querySelector(selector);
  if (!node)
    return;
  node.textContent = value;
};
const getAllSlotted = (el, name) => {
  const slotSelector = `slot[name="${name}"]`;
  const slot = el.shadowRoot.querySelector(slotSelector);
  if (!slot)
    return [];
  return slot.children;
};
const getSlotted = (el, name) => getAllSlotted(el, name)[0];
const containsComposedNode = (rootNode, childNode) => {
  if (!rootNode || !childNode)
    return false;
  if (rootNode == null ? void 0 : rootNode.contains(childNode))
    return true;
  return containsComposedNode(
    rootNode,
    childNode.getRootNode().host
  );
};
const closestComposedNode = (childNode, selector) => {
  if (!childNode)
    return null;
  const closest = childNode.closest(selector);
  if (closest)
    return closest;
  return closestComposedNode(
    childNode.getRootNode().host,
    selector
  );
};
function getActiveElement(root = document) {
  var _a;
  const activeEl = root == null ? void 0 : root.activeElement;
  if (!activeEl)
    return null;
  return (_a = getActiveElement(activeEl.shadowRoot)) != null ? _a : activeEl;
}
function getDocumentOrShadowRoot(node) {
  var _a;
  const rootNode = (_a = node == null ? void 0 : node.getRootNode) == null ? void 0 : _a.call(node);
  if (rootNode instanceof ShadowRoot || rootNode instanceof Document) {
    return rootNode;
  }
  return null;
}
function isElementVisible(element, { depth = 3, checkOpacity = true, checkVisibilityCSS = true } = {}) {
  if (element.checkVisibility) {
    return element.checkVisibility({
      checkOpacity,
      checkVisibilityCSS
    });
  }
  let el = element;
  while (el && depth > 0) {
    const style = getComputedStyle(el);
    if (checkOpacity && style.opacity === "0" || checkVisibilityCSS && style.visibility === "hidden" || style.display === "none") {
      return false;
    }
    el = el.parentElement;
    depth--;
  }
  return true;
}
function getPointProgressOnLine(x, y, p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0)
    return 0;
  const projection = ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSquared;
  return Math.max(0, Math.min(1, projection));
}
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
function getOrInsertCSSRule(styleParent, selectorText) {
  const cssRule = getCSSRule(styleParent, (st) => st === selectorText);
  if (cssRule)
    return cssRule;
  return insertCSSRule(styleParent, selectorText);
}
function getCSSRule(styleParent, predicate) {
  var _a, _b;
  let style;
  for (style of (_a = styleParent.querySelectorAll("style:not([media])")) != null ? _a : []) {
    let cssRules;
    try {
      cssRules = (_b = style.sheet) == null ? void 0 : _b.cssRules;
    } catch {
      continue;
    }
    for (const rule of cssRules != null ? cssRules : []) {
      if (predicate(rule.selectorText))
        return rule;
    }
  }
}
function insertCSSRule(styleParent, selectorText) {
  var _a, _b;
  const styles = (_a = styleParent.querySelectorAll("style:not([media])")) != null ? _a : [];
  const style = styles == null ? void 0 : styles[styles.length - 1];
  if (!(style == null ? void 0 : style.sheet)) {
    console.warn(
      "Media Chrome: No style sheet found on style tag of",
      styleParent
    );
    return {
      // @ts-ignore
      style: {
        setProperty: () => {
        },
        removeProperty: () => "",
        getPropertyValue: () => ""
      }
    };
  }
  style == null ? void 0 : style.sheet.insertRule(`${selectorText}{}`, style.sheet.cssRules.length);
  return (
    /** @type {CSSStyleRule} */
    (_b = style.sheet.cssRules) == null ? void 0 : _b[style.sheet.cssRules.length - 1]
  );
}
function getNumericAttr(el, attrName, defaultValue = Number.NaN) {
  const attrVal = el.getAttribute(attrName);
  return attrVal != null ? +attrVal : defaultValue;
}
function setNumericAttr(el, attrName, value) {
  const nextNumericValue = +value;
  if (value == null || Number.isNaN(nextNumericValue)) {
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
    }
    return;
  }
  if (getNumericAttr(el, attrName, void 0) === nextNumericValue)
    return;
  el.setAttribute(attrName, `${nextNumericValue}`);
}
function getBooleanAttr(el, attrName) {
  return el.hasAttribute(attrName);
}
function setBooleanAttr(el, attrName, value) {
  if (value == null) {
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
    }
    return;
  }
  if (getBooleanAttr(el, attrName) == value)
    return;
  el.toggleAttribute(attrName, value);
}
function getStringAttr(el, attrName, defaultValue = null) {
  var _a;
  return (_a = el.getAttribute(attrName)) != null ? _a : defaultValue;
}
function setStringAttr(el, attrName, value) {
  if (value == null) {
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
    }
    return;
  }
  const nextValue = `${value}`;
  if (getStringAttr(el, attrName, void 0) === nextValue)
    return;
  el.setAttribute(attrName, nextValue);
}


;// ../node_modules/media-chrome/dist/media-gesture-receiver.js
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _mediaController;



function getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `
  );
}
class MediaGestureReceiver extends GlobalThis.HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _mediaController, void 0);
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
  }
  // NOTE: Currently "baking in" actions + attrs until we come up with
  // a more robust architecture (CJP)
  static get observedAttributes() {
    return [
      MediaStateReceiverAttributes.MEDIA_CONTROLLER,
      MediaUIAttributes.MEDIA_PAUSED
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = __privateGet(this, _mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        __privateSet(this, _mediaController, null);
      }
      if (newValue && this.isConnected) {
        __privateSet(this, _mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = __privateGet(this, _mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    }
  }
  connectedCallback() {
    var _a, _b, _c, _d;
    this.tabIndex = -1;
    this.setAttribute("aria-hidden", "true");
    __privateSet(this, _mediaController, getMediaControllerEl(this));
    if (this.getAttribute(MediaStateReceiverAttributes.MEDIA_CONTROLLER)) {
      (_b = (_a = __privateGet(this, _mediaController)) == null ? void 0 : _a.associateElement) == null ? void 0 : _b.call(_a, this);
    }
    (_c = __privateGet(this, _mediaController)) == null ? void 0 : _c.addEventListener("pointerdown", this);
    (_d = __privateGet(this, _mediaController)) == null ? void 0 : _d.addEventListener("click", this);
  }
  disconnectedCallback() {
    var _a, _b, _c, _d;
    if (this.getAttribute(MediaStateReceiverAttributes.MEDIA_CONTROLLER)) {
      (_b = (_a = __privateGet(this, _mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    }
    (_c = __privateGet(this, _mediaController)) == null ? void 0 : _c.removeEventListener("pointerdown", this);
    (_d = __privateGet(this, _mediaController)) == null ? void 0 : _d.removeEventListener("click", this);
    __privateSet(this, _mediaController, null);
  }
  handleEvent(event) {
    var _a;
    const composedTarget = (_a = event.composedPath()) == null ? void 0 : _a[0];
    const allowList = ["video", "media-controller"];
    if (!allowList.includes(composedTarget == null ? void 0 : composedTarget.localName))
      return;
    if (event.type === "pointerdown") {
      this._pointerType = event.pointerType;
    } else if (event.type === "click") {
      const { clientX, clientY } = event;
      const { left, top, width, height } = this.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      if (x < 0 || y < 0 || x > width || y > height || // In case this element has no dimensions (or display: none) return.
      width === 0 && height === 0) {
        return;
      }
      const pointerType = this._pointerType || "mouse";
      this._pointerType = void 0;
      if (pointerType === PointerTypes.TOUCH) {
        this.handleTap(event);
        return;
      } else if (pointerType === PointerTypes.MOUSE || pointerType === PointerTypes.PEN) {
        this.handleMouseClick(event);
        return;
      }
    }
  }
  /**
   * @type {boolean} Is the media paused
   */
  get mediaPaused() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }
  set mediaPaused(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }
  // NOTE: Currently "baking in" actions + attrs until we come up with
  // a more robust architecture (CJP)
  /**
   * @abstract
   * @argument {Event} e
   */
  handleTap(e) {
  }
  // eslint-disable-line
  // eslint-disable-next-line
  handleMouseClick(e) {
    const eventName = this.mediaPaused ? MediaUIEvents.MEDIA_PLAY_REQUEST : MediaUIEvents.MEDIA_PAUSE_REQUEST;
    this.dispatchEvent(
      new GlobalThis.CustomEvent(eventName, { composed: true, bubbles: true })
    );
  }
}
_mediaController = new WeakMap();
MediaGestureReceiver.shadowRootOptions = { mode: "open" };
MediaGestureReceiver.getTemplateHTML = getTemplateHTML;
function getMediaControllerEl(controlEl) {
  var _a;
  const mediaControllerId = controlEl.getAttribute(
    MediaStateReceiverAttributes.MEDIA_CONTROLLER
  );
  if (mediaControllerId) {
    return (_a = controlEl.getRootNode()) == null ? void 0 : _a.getElementById(mediaControllerId);
  }
  return closestComposedNode(controlEl, "media-controller");
}
if (!GlobalThis.customElements.get("media-gesture-receiver")) {
  GlobalThis.customElements.define(
    "media-gesture-receiver",
    MediaGestureReceiver
  );
}
var media_gesture_receiver_default = MediaGestureReceiver;


;// ../node_modules/media-chrome/dist/media-container.js
var media_container_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_container_privateGet = (obj, member, getter) => {
  media_container_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_container_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_container_privateSet = (obj, member, value, setter) => {
  media_container_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  media_container_accessCheck(obj, member, "access private method");
  return method;
};
var _pointerDownTimeStamp, _currentMedia, _inactiveTimeout, _autohide, _mutationObserver, _handleMutation, handleMutation_fn, _isResizePending, _handleResize, _handlePointerMove, handlePointerMove_fn, _handlePointerUp, handlePointerUp_fn, _setInactive, setInactive_fn, _setActive, setActive_fn, _scheduleInactive, scheduleInactive_fn;







const Attributes = {
  AUDIO: "audio",
  AUTOHIDE: "autohide",
  BREAKPOINTS: "breakpoints",
  GESTURES_DISABLED: "gesturesdisabled",
  KEYBOARD_CONTROL: "keyboardcontrol",
  NO_AUTOHIDE: "noautohide",
  USER_INACTIVE: "userinactive",
  AUTOHIDE_OVER_CONTROLS: "autohideovercontrols"
};
function media_container_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      ${/*
    * outline on media is turned off because it is allowed to get focus to faciliate hotkeys.
    * However, on keyboard interactions, the focus outline is shown,
    * which is particularly noticeable when going fullscreen via hotkeys.
    */
    ""}
      :host([${MediaUIAttributes.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
        overflow: hidden;
      }

      :host(:not([${Attributes.AUDIO}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      ${/*
    * when in audio mode, hide the slotted media element by default
    */
    ""}
      :host([${Attributes.AUDIO}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      ${/*
    * when in audio mode, hide the gesture-layer which causes media-controller to be taller than the control bar
    */
    ""}
      :host([${Attributes.AUDIO}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      ${/*
    * if gestures are disabled, don't accept pointer-events
    */
    ""}
      :host(:not([${Attributes.AUDIO}])[${Attributes.GESTURES_DISABLED}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${Attributes.AUDIO}])[${Attributes.GESTURES_DISABLED}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      ${/*
    * any slotted element that isn't a poster or media slot should be pointer-events auto
    * we'll want to add here any slotted elements that shouldn't get pointer-events by default when slotted
    */
    ""}
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${Attributes.AUDIO}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${Attributes.AUDIO}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${Attributes.AUDIO}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      ${/* Position the media and poster elements to fill the container */
    ""}
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      ${/* Video specific styles */
    ""}
      :host(:not([${Attributes.AUDIO}])) .spacer {
        flex-grow: 1;
      }

      ${/* Safari needs this to actually make the element fill the window */
    ""}
      :host(:-webkit-full-screen) {
        ${/* Needs to use !important otherwise easy to break */
    ""}
        width: 100% !important;
        height: 100% !important;
      }

      ${/* Only add these if auto hide is not disabled */
    ""}
      ::slotted(:not([slot=media]):not([slot=poster]):not([${Attributes.NO_AUTOHIDE}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      ${/* Hide controls when inactive, not paused, not audio and auto hide not disabled */
    ""}
      :host([${Attributes.USER_INACTIVE}]:not([${MediaUIAttributes.MEDIA_PAUSED}]):not([${MediaUIAttributes.MEDIA_IS_AIRPLAYING}]):not([${MediaUIAttributes.MEDIA_IS_CASTING}]):not([${Attributes.AUDIO}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${Attributes.NO_AUTOHIDE}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${Attributes.USER_INACTIVE}]:not([${Attributes.NO_AUTOHIDE}]):not([${MediaUIAttributes.MEDIA_PAUSED}]):not([${MediaUIAttributes.MEDIA_IS_CASTING}]):not([${Attributes.AUDIO}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${Attributes.USER_INACTIVE}][${Attributes.AUTOHIDE_OVER_CONTROLS}]:not([${Attributes.NO_AUTOHIDE}]):not([${MediaUIAttributes.MEDIA_PAUSED}]):not([${MediaUIAttributes.MEDIA_IS_CASTING}]):not([${Attributes.AUDIO}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      ${/* ::slotted([slot=poster]) doesn't work for slot fallback content so hide parent slot instead */
    ""}
      :host(:not([${Attributes.AUDIO}])[${MediaUIAttributes.MEDIA_HAS_PLAYED}]) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${media_gesture_receiver_default.shadowRootOptions.mode}">
          ${media_gesture_receiver_default.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      ${/* default, effectively "bottom-chrome" */
    ""}
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `
  );
}
const MEDIA_UI_ATTRIBUTE_NAMES = Object.values(MediaUIAttributes);
const defaultBreakpoints = "sm:384 md:576 lg:768 xl:960";
function resizeCallback(entry) {
  setBreakpoints(entry.target, entry.contentRect.width);
}
function setBreakpoints(container, width) {
  var _a;
  if (!container.isConnected)
    return;
  const breakpoints = (_a = container.getAttribute(Attributes.BREAKPOINTS)) != null ? _a : defaultBreakpoints;
  const ranges = createBreakpointMap(breakpoints);
  const activeBreakpoints = getBreakpoints(ranges, width);
  let changed = false;
  Object.keys(ranges).forEach((name) => {
    if (activeBreakpoints.includes(name)) {
      if (!container.hasAttribute(`breakpoint${name}`)) {
        container.setAttribute(`breakpoint${name}`, "");
        changed = true;
      }
      return;
    }
    if (container.hasAttribute(`breakpoint${name}`)) {
      container.removeAttribute(`breakpoint${name}`);
      changed = true;
    }
  });
  if (changed) {
    const evt = new CustomEvent(MediaStateChangeEvents.BREAKPOINTS_CHANGE, {
      detail: activeBreakpoints
    });
    container.dispatchEvent(evt);
  }
  if (!container.breakpointsComputed) {
    container.breakpointsComputed = true;
    container.dispatchEvent(
      new CustomEvent(MediaStateChangeEvents.BREAKPOINTS_COMPUTED, {
        bubbles: true,
        composed: true
      })
    );
  }
}
function createBreakpointMap(breakpoints) {
  const pairs = breakpoints.split(/\s+/);
  return Object.fromEntries(pairs.map((pair) => pair.split(":")));
}
function getBreakpoints(breakpoints, width) {
  return Object.keys(breakpoints).filter((name) => {
    return width >= parseInt(breakpoints[name]);
  });
}
class MediaContainer extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_container_privateAdd(this, _handleMutation);
    media_container_privateAdd(this, _handlePointerMove);
    media_container_privateAdd(this, _handlePointerUp);
    media_container_privateAdd(this, _setInactive);
    media_container_privateAdd(this, _setActive);
    media_container_privateAdd(this, _scheduleInactive);
    media_container_privateAdd(this, _pointerDownTimeStamp, 0);
    media_container_privateAdd(this, _currentMedia, null);
    media_container_privateAdd(this, _inactiveTimeout, null);
    media_container_privateAdd(this, _autohide, void 0);
    this.breakpointsComputed = false;
    media_container_privateAdd(this, _mutationObserver, new MutationObserver(__privateMethod(this, _handleMutation, handleMutation_fn).bind(this)));
    media_container_privateAdd(this, _isResizePending, false);
    media_container_privateAdd(this, _handleResize, (entry) => {
      if (media_container_privateGet(this, _isResizePending))
        return;
      setTimeout(() => {
        resizeCallback(entry);
        media_container_privateSet(this, _isResizePending, false);
      }, 0);
      media_container_privateSet(this, _isResizePending, true);
    });
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      const html = this.constructor.getTemplateHTML(attrs);
      this.shadowRoot.setHTMLUnsafe ? this.shadowRoot.setHTMLUnsafe(html) : this.shadowRoot.innerHTML = html;
    }
    const chainedSlot = this.querySelector(
      ":scope > slot[slot=media]"
    );
    if (chainedSlot) {
      chainedSlot.addEventListener("slotchange", () => {
        const slotEls = chainedSlot.assignedElements({ flatten: true });
        if (!slotEls.length) {
          if (media_container_privateGet(this, _currentMedia)) {
            this.mediaUnsetCallback(media_container_privateGet(this, _currentMedia));
          }
          return;
        }
        this.handleMediaUpdated(this.media);
      });
    }
  }
  static get observedAttributes() {
    return [Attributes.AUTOHIDE, Attributes.GESTURES_DISABLED].concat(MEDIA_UI_ATTRIBUTE_NAMES).filter(
      (name) => ![
        MediaUIAttributes.MEDIA_RENDITION_LIST,
        MediaUIAttributes.MEDIA_AUDIO_TRACK_LIST,
        MediaUIAttributes.MEDIA_CHAPTERS_CUES,
        MediaUIAttributes.MEDIA_WIDTH,
        MediaUIAttributes.MEDIA_HEIGHT,
        MediaUIAttributes.MEDIA_ERROR,
        MediaUIAttributes.MEDIA_ERROR_MESSAGE
      ].includes(name)
    );
  }
  // Could share this code with media-chrome-html-element instead
  attributeChangedCallback(attrName, _oldValue, newValue) {
    if (attrName.toLowerCase() == Attributes.AUTOHIDE) {
      this.autohide = newValue;
    }
  }
  // First direct child with slot=media, or null
  get media() {
    let media = this.querySelector(":scope > [slot=media]");
    if ((media == null ? void 0 : media.nodeName) == "SLOT")
      media = media.assignedElements({ flatten: true })[0];
    return media;
  }
  async handleMediaUpdated(media) {
    if (!media)
      return;
    media_container_privateSet(this, _currentMedia, media);
    if (media.localName.includes("-")) {
      await GlobalThis.customElements.whenDefined(media.localName);
    }
    this.mediaSetCallback(media);
  }
  connectedCallback() {
    var _a;
    media_container_privateGet(this, _mutationObserver).observe(this, { childList: true, subtree: true });
    observeResize(this, media_container_privateGet(this, _handleResize));
    const isAudioChrome = this.getAttribute(Attributes.AUDIO) != null;
    const label = isAudioChrome ? t("audio player") : t("video player");
    this.setAttribute("role", "region");
    this.setAttribute("aria-label", label);
    this.handleMediaUpdated(this.media);
    this.setAttribute(Attributes.USER_INACTIVE, "");
    setBreakpoints(this, this.getBoundingClientRect().width);
    this.addEventListener("pointerdown", this);
    this.addEventListener("pointermove", this);
    this.addEventListener("pointerup", this);
    this.addEventListener("mouseleave", this);
    this.addEventListener("keyup", this);
    (_a = GlobalThis.window) == null ? void 0 : _a.addEventListener("mouseup", this);
  }
  disconnectedCallback() {
    var _a;
    media_container_privateGet(this, _mutationObserver).disconnect();
    unobserveResize(this, media_container_privateGet(this, _handleResize));
    if (this.media) {
      this.mediaUnsetCallback(this.media);
    }
    (_a = GlobalThis.window) == null ? void 0 : _a.removeEventListener("mouseup", this);
  }
  /**
   * @abstract
   */
  mediaSetCallback(_media) {
  }
  mediaUnsetCallback(_media) {
    media_container_privateSet(this, _currentMedia, null);
  }
  handleEvent(event) {
    switch (event.type) {
      case "pointerdown":
        media_container_privateSet(this, _pointerDownTimeStamp, event.timeStamp);
        break;
      case "pointermove":
        __privateMethod(this, _handlePointerMove, handlePointerMove_fn).call(this, event);
        break;
      case "pointerup":
        __privateMethod(this, _handlePointerUp, handlePointerUp_fn).call(this, event);
        break;
      case "mouseleave":
        __privateMethod(this, _setInactive, setInactive_fn).call(this);
        break;
      case "mouseup":
        this.removeAttribute(Attributes.KEYBOARD_CONTROL);
        break;
      case "keyup":
        __privateMethod(this, _scheduleInactive, scheduleInactive_fn).call(this);
        this.setAttribute(Attributes.KEYBOARD_CONTROL, "");
        break;
    }
  }
  set autohide(seconds) {
    const parsedSeconds = Number(seconds);
    media_container_privateSet(this, _autohide, isNaN(parsedSeconds) ? 0 : parsedSeconds);
  }
  get autohide() {
    return (media_container_privateGet(this, _autohide) === void 0 ? 2 : media_container_privateGet(this, _autohide)).toString();
  }
  get breakpoints() {
    return getStringAttr(this, Attributes.BREAKPOINTS);
  }
  set breakpoints(value) {
    setStringAttr(this, Attributes.BREAKPOINTS, value);
  }
  get audio() {
    return getBooleanAttr(this, Attributes.AUDIO);
  }
  set audio(value) {
    setBooleanAttr(this, Attributes.AUDIO, value);
  }
  get gesturesDisabled() {
    return getBooleanAttr(this, Attributes.GESTURES_DISABLED);
  }
  set gesturesDisabled(value) {
    setBooleanAttr(this, Attributes.GESTURES_DISABLED, value);
  }
  get keyboardControl() {
    return getBooleanAttr(this, Attributes.KEYBOARD_CONTROL);
  }
  set keyboardControl(value) {
    setBooleanAttr(this, Attributes.KEYBOARD_CONTROL, value);
  }
  get noAutohide() {
    return getBooleanAttr(this, Attributes.NO_AUTOHIDE);
  }
  set noAutohide(value) {
    setBooleanAttr(this, Attributes.NO_AUTOHIDE, value);
  }
  get autohideOverControls() {
    return getBooleanAttr(this, Attributes.AUTOHIDE_OVER_CONTROLS);
  }
  set autohideOverControls(value) {
    setBooleanAttr(this, Attributes.AUTOHIDE_OVER_CONTROLS, value);
  }
  get userInteractive() {
    return getBooleanAttr(this, Attributes.USER_INACTIVE);
  }
  set userInteractive(value) {
    setBooleanAttr(this, Attributes.USER_INACTIVE, value);
  }
}
_pointerDownTimeStamp = new WeakMap();
_currentMedia = new WeakMap();
_inactiveTimeout = new WeakMap();
_autohide = new WeakMap();
_mutationObserver = new WeakMap();
_handleMutation = new WeakSet();
handleMutation_fn = function(mutationsList) {
  const media = this.media;
  for (const mutation of mutationsList) {
    if (mutation.type !== "childList")
      continue;
    const removedNodes = mutation.removedNodes;
    for (const node of removedNodes) {
      if (node.slot != "media" || mutation.target != this)
        continue;
      let previousSibling = mutation.previousSibling && mutation.previousSibling.previousElementSibling;
      if (!previousSibling || !media) {
        this.mediaUnsetCallback(node);
      } else {
        let wasFirst = previousSibling.slot !== "media";
        while ((previousSibling = previousSibling.previousSibling) !== null) {
          if (previousSibling.slot == "media")
            wasFirst = false;
        }
        if (wasFirst)
          this.mediaUnsetCallback(node);
      }
    }
    if (media) {
      for (const node of mutation.addedNodes) {
        if (node === media)
          this.handleMediaUpdated(media);
      }
    }
  }
};
_isResizePending = new WeakMap();
_handleResize = new WeakMap();
_handlePointerMove = new WeakSet();
handlePointerMove_fn = function(event) {
  if (event.pointerType !== "mouse") {
    const MAX_TAP_DURATION = 250;
    if (event.timeStamp - media_container_privateGet(this, _pointerDownTimeStamp) < MAX_TAP_DURATION)
      return;
  }
  __privateMethod(this, _setActive, setActive_fn).call(this);
  clearTimeout(media_container_privateGet(this, _inactiveTimeout));
  const autohideOverControls = this.hasAttribute(
    Attributes.AUTOHIDE_OVER_CONTROLS
  );
  if ([this, this.media].includes(event.target) || autohideOverControls) {
    __privateMethod(this, _scheduleInactive, scheduleInactive_fn).call(this);
  }
};
_handlePointerUp = new WeakSet();
handlePointerUp_fn = function(event) {
  if (event.pointerType === "touch") {
    const controlsVisible = !this.hasAttribute(Attributes.USER_INACTIVE);
    if ([this, this.media].includes(event.target) && controlsVisible) {
      __privateMethod(this, _setInactive, setInactive_fn).call(this);
    } else {
      __privateMethod(this, _scheduleInactive, scheduleInactive_fn).call(this);
    }
  } else if (event.composedPath().some(
    (el) => ["media-play-button", "media-fullscreen-button"].includes(
      el == null ? void 0 : el.localName
    )
  )) {
    __privateMethod(this, _scheduleInactive, scheduleInactive_fn).call(this);
  }
};
_setInactive = new WeakSet();
setInactive_fn = function() {
  if (media_container_privateGet(this, _autohide) < 0)
    return;
  if (this.hasAttribute(Attributes.USER_INACTIVE))
    return;
  this.setAttribute(Attributes.USER_INACTIVE, "");
  const evt = new GlobalThis.CustomEvent(
    MediaStateChangeEvents.USER_INACTIVE_CHANGE,
    { composed: true, bubbles: true, detail: true }
  );
  this.dispatchEvent(evt);
};
_setActive = new WeakSet();
setActive_fn = function() {
  if (!this.hasAttribute(Attributes.USER_INACTIVE))
    return;
  this.removeAttribute(Attributes.USER_INACTIVE);
  const evt = new GlobalThis.CustomEvent(
    MediaStateChangeEvents.USER_INACTIVE_CHANGE,
    { composed: true, bubbles: true, detail: false }
  );
  this.dispatchEvent(evt);
};
_scheduleInactive = new WeakSet();
scheduleInactive_fn = function() {
  __privateMethod(this, _setActive, setActive_fn).call(this);
  clearTimeout(media_container_privateGet(this, _inactiveTimeout));
  const autohide = parseInt(this.autohide);
  if (autohide < 0)
    return;
  media_container_privateSet(this, _inactiveTimeout, setTimeout(() => {
    __privateMethod(this, _setInactive, setInactive_fn).call(this);
  }, autohide * 1e3));
};
MediaContainer.shadowRootOptions = { mode: "open" };
MediaContainer.getTemplateHTML = media_container_getTemplateHTML;
if (!GlobalThis.customElements.get("media-container")) {
  GlobalThis.customElements.define("media-container", MediaContainer);
}
var media_container_default = (/* unused pure expression or super */ null && (MediaContainer));


;// ../node_modules/media-chrome/dist/utils/attribute-token-list.js
var attribute_token_list_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var attribute_token_list_privateGet = (obj, member, getter) => {
  attribute_token_list_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var attribute_token_list_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var attribute_token_list_privateSet = (obj, member, value, setter) => {
  attribute_token_list_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _el, _attr, _defaultSet, _tokenSet, _tokens, tokens_get;
class AttributeTokenList {
  constructor(el, attr, { defaultValue } = { defaultValue: void 0 }) {
    attribute_token_list_privateAdd(this, _tokens);
    attribute_token_list_privateAdd(this, _el, void 0);
    attribute_token_list_privateAdd(this, _attr, void 0);
    attribute_token_list_privateAdd(this, _defaultSet, void 0);
    attribute_token_list_privateAdd(this, _tokenSet, /* @__PURE__ */ new Set());
    attribute_token_list_privateSet(this, _el, el);
    attribute_token_list_privateSet(this, _attr, attr);
    attribute_token_list_privateSet(this, _defaultSet, new Set(defaultValue));
  }
  [Symbol.iterator]() {
    return attribute_token_list_privateGet(this, _tokens, tokens_get).values();
  }
  get length() {
    return attribute_token_list_privateGet(this, _tokens, tokens_get).size;
  }
  get value() {
    var _a;
    return (_a = [...attribute_token_list_privateGet(this, _tokens, tokens_get)].join(" ")) != null ? _a : "";
  }
  set value(val) {
    var _a;
    if (val === this.value)
      return;
    attribute_token_list_privateSet(this, _tokenSet, /* @__PURE__ */ new Set());
    this.add(...(_a = val == null ? void 0 : val.split(" ")) != null ? _a : []);
  }
  toString() {
    return this.value;
  }
  item(index) {
    return [...attribute_token_list_privateGet(this, _tokens, tokens_get)][index];
  }
  values() {
    return attribute_token_list_privateGet(this, _tokens, tokens_get).values();
  }
  forEach(callback, thisArg) {
    attribute_token_list_privateGet(this, _tokens, tokens_get).forEach(callback, thisArg);
  }
  add(...tokens) {
    var _a, _b;
    tokens.forEach((t) => attribute_token_list_privateGet(this, _tokenSet).add(t));
    if (this.value === "" && !((_a = attribute_token_list_privateGet(this, _el)) == null ? void 0 : _a.hasAttribute(`${attribute_token_list_privateGet(this, _attr)}`))) {
      return;
    }
    (_b = attribute_token_list_privateGet(this, _el)) == null ? void 0 : _b.setAttribute(`${attribute_token_list_privateGet(this, _attr)}`, `${this.value}`);
  }
  remove(...tokens) {
    var _a;
    tokens.forEach((t) => attribute_token_list_privateGet(this, _tokenSet).delete(t));
    (_a = attribute_token_list_privateGet(this, _el)) == null ? void 0 : _a.setAttribute(`${attribute_token_list_privateGet(this, _attr)}`, `${this.value}`);
  }
  contains(token) {
    return attribute_token_list_privateGet(this, _tokens, tokens_get).has(token);
  }
  toggle(token, force) {
    if (typeof force !== "undefined") {
      if (force) {
        this.add(token);
        return true;
      } else {
        this.remove(token);
        return false;
      }
    }
    if (this.contains(token)) {
      this.remove(token);
      return false;
    }
    this.add(token);
    return true;
  }
  replace(oldToken, newToken) {
    this.remove(oldToken);
    this.add(newToken);
    return oldToken === newToken;
  }
}
_el = new WeakMap();
_attr = new WeakMap();
_defaultSet = new WeakMap();
_tokenSet = new WeakMap();
_tokens = new WeakSet();
tokens_get = function() {
  return attribute_token_list_privateGet(this, _tokenSet).size ? attribute_token_list_privateGet(this, _tokenSet) : attribute_token_list_privateGet(this, _defaultSet);
};


;// ../node_modules/media-chrome/dist/utils/captions.js

const splitTextTracksStr = (textTracksStr = "") => textTracksStr.split(/\s+/);
const parseTextTrackStr = (textTrackStr = "") => {
  const [kind, language, encodedLabel] = textTrackStr.split(":");
  const label = encodedLabel ? decodeURIComponent(encodedLabel) : void 0;
  return {
    kind: kind === "cc" ? TextTrackKinds.CAPTIONS : TextTrackKinds.SUBTITLES,
    language,
    label
  };
};
const parseTextTracksStr = (textTracksStr = "", textTrackLikeObj = {}) => {
  return splitTextTracksStr(textTracksStr).map((textTrackStr) => {
    const textTrackObj = parseTextTrackStr(textTrackStr);
    return {
      ...textTrackLikeObj,
      ...textTrackObj
    };
  });
};
const parseTracks = (trackOrTracks) => {
  if (!trackOrTracks)
    return [];
  if (Array.isArray(trackOrTracks)) {
    return trackOrTracks.map((trackObjOrStr) => {
      if (typeof trackObjOrStr === "string") {
        return parseTextTrackStr(trackObjOrStr);
      }
      return trackObjOrStr;
    });
  }
  if (typeof trackOrTracks === "string") {
    return parseTextTracksStr(trackOrTracks);
  }
  return [trackOrTracks];
};
const formatTextTrackObj = ({ kind, label, language } = { kind: "subtitles" }) => {
  if (!label)
    return language;
  return `${kind === "captions" ? "cc" : "sb"}:${language}:${encodeURIComponent(
    label
  )}`;
};
const stringifyTextTrackList = (textTracks = []) => {
  return Array.prototype.map.call(textTracks, formatTextTrackObj).join(" ");
};
const isMatchingPropOf = (key, value) => (obj) => obj[key] === value;
const textTrackObjAsPred = (filterObj) => {
  const preds = Object.entries(filterObj).map(([key, value]) => {
    return isMatchingPropOf(key, value);
  });
  return (textTrack) => preds.every((pred) => pred(textTrack));
};
const updateTracksModeTo = (mode, tracks = [], tracksToUpdate = []) => {
  const preds = parseTracks(tracksToUpdate).map(textTrackObjAsPred);
  const isTrackToUpdate = (textTrack) => {
    return preds.some((pred) => pred(textTrack));
  };
  Array.from(tracks).filter(isTrackToUpdate).forEach((textTrack) => {
    textTrack.mode = mode;
  });
};
const getTextTracksList = (media, filterPredOrObj = () => true) => {
  if (!(media == null ? void 0 : media.textTracks))
    return [];
  const filterPred = typeof filterPredOrObj === "function" ? filterPredOrObj : textTrackObjAsPred(filterPredOrObj);
  return Array.from(media.textTracks).filter(filterPred);
};
const areSubsOn = (el) => {
  var _a;
  const showingSubtitles = !!((_a = el.mediaSubtitlesShowing) == null ? void 0 : _a.length) || el.hasAttribute(MediaUIAttributes.MEDIA_SUBTITLES_SHOWING);
  return showingSubtitles;
};


;// ../node_modules/media-chrome/dist/utils/fullscreen-api.js



const enterFullscreen = (stateOwners) => {
  var _a;
  const { media, fullscreenElement } = stateOwners;
  try {
    const enterFullscreenKey = fullscreenElement && "requestFullscreen" in fullscreenElement ? "requestFullscreen" : fullscreenElement && "webkitRequestFullScreen" in fullscreenElement ? "webkitRequestFullScreen" : void 0;
    if (enterFullscreenKey) {
      const maybePromise = (_a = fullscreenElement[enterFullscreenKey]) == null ? void 0 : _a.call(fullscreenElement);
      if (maybePromise instanceof Promise) {
        return maybePromise.catch(() => {
        });
      }
    } else if (media == null ? void 0 : media.webkitEnterFullscreen) {
      media.webkitEnterFullscreen();
    } else if (media == null ? void 0 : media.requestFullscreen) {
      media.requestFullscreen();
    }
  } catch (e) {
    console.error(e);
  }
};
const exitFullscreenKey = "exitFullscreen" in server_safe_globals_Document ? "exitFullscreen" : "webkitExitFullscreen" in server_safe_globals_Document ? "webkitExitFullscreen" : "webkitCancelFullScreen" in server_safe_globals_Document ? "webkitCancelFullScreen" : void 0;
const exitFullscreen = (stateOwners) => {
  var _a;
  const { documentElement } = stateOwners;
  if (exitFullscreenKey) {
    const maybePromise = (_a = documentElement == null ? void 0 : documentElement[exitFullscreenKey]) == null ? void 0 : _a.call(documentElement);
    if (maybePromise instanceof Promise) {
      return maybePromise.catch(() => {
      });
    }
  }
};
const fullscreenElementKey = "fullscreenElement" in server_safe_globals_Document ? "fullscreenElement" : "webkitFullscreenElement" in server_safe_globals_Document ? "webkitFullscreenElement" : void 0;
const getFullscreenElement = (stateOwners) => {
  const { documentElement, media } = stateOwners;
  const docFullscreenElement = documentElement == null ? void 0 : documentElement[fullscreenElementKey];
  if (!docFullscreenElement && "webkitDisplayingFullscreen" in media && "webkitPresentationMode" in media && media.webkitDisplayingFullscreen && media.webkitPresentationMode === WebkitPresentationModes.FULLSCREEN) {
    return media;
  }
  return docFullscreenElement;
};
const isFullscreen = (stateOwners) => {
  var _a;
  const { media, documentElement, fullscreenElement = media } = stateOwners;
  if (!media || !documentElement)
    return false;
  const currentFullscreenElement = getFullscreenElement(stateOwners);
  if (!currentFullscreenElement)
    return false;
  if (currentFullscreenElement === fullscreenElement || currentFullscreenElement === media) {
    return true;
  }
  if (currentFullscreenElement.localName.includes("-")) {
    let currentRoot = currentFullscreenElement.shadowRoot;
    if (!(fullscreenElementKey in currentRoot)) {
      return containsComposedNode(
        currentFullscreenElement,
        /** @TODO clean up type assumptions (e.g. Node) (CJP) */
        // @ts-ignore
        fullscreenElement
      );
    }
    while (currentRoot == null ? void 0 : currentRoot[fullscreenElementKey]) {
      if (currentRoot[fullscreenElementKey] === fullscreenElement)
        return true;
      currentRoot = (_a = currentRoot[fullscreenElementKey]) == null ? void 0 : _a.shadowRoot;
    }
  }
  return false;
};
const fullscreenEnabledKey = "fullscreenEnabled" in server_safe_globals_Document ? "fullscreenEnabled" : "webkitFullscreenEnabled" in server_safe_globals_Document ? "webkitFullscreenEnabled" : void 0;
const isFullscreenEnabled = (stateOwners) => {
  const { documentElement, media } = stateOwners;
  return !!(documentElement == null ? void 0 : documentElement[fullscreenEnabledKey]) || media && "webkitSupportsFullscreen" in media;
};


;// ../node_modules/media-chrome/dist/utils/platform-tests.js



let testMediaEl;
const getTestMediaEl = () => {
  var _a, _b;
  if (testMediaEl)
    return testMediaEl;
  testMediaEl = (_b = (_a = server_safe_globals_Document) == null ? void 0 : _a.createElement) == null ? void 0 : _b.call(_a, "video");
  return testMediaEl;
};
const hasVolumeSupportAsync = async (mediaEl = getTestMediaEl()) => {
  if (!mediaEl)
    return false;
  const prevVolume = mediaEl.volume;
  mediaEl.volume = prevVolume / 2 + 0.1;
  const abortController = new AbortController();
  const volumeSupported = await Promise.race([
    dispatchedVolumeChange(mediaEl, abortController.signal),
    volumeChanged(mediaEl, prevVolume)
  ]);
  abortController.abort();
  return volumeSupported;
};
const dispatchedVolumeChange = (mediaEl, signal) => {
  return new Promise((resolve) => {
    mediaEl.addEventListener("volumechange", () => resolve(true), { signal });
  });
};
const volumeChanged = async (mediaEl, prevVolume) => {
  for (let i = 0; i < 10; i++) {
    if (mediaEl.volume === prevVolume)
      return false;
    await delay(10);
  }
  return mediaEl.volume !== prevVolume;
};
const isSafari = /.*Version\/.*Safari\/.*/.test(
  GlobalThis.navigator.userAgent
);
const hasPipSupport = (mediaEl = getTestMediaEl()) => {
  if (GlobalThis.matchMedia("(display-mode: standalone)").matches && isSafari)
    return false;
  return typeof (mediaEl == null ? void 0 : mediaEl.requestPictureInPicture) === "function";
};
const hasFullscreenSupport = (mediaEl = getTestMediaEl()) => {
  return isFullscreenEnabled({ documentElement: server_safe_globals_Document, media: mediaEl });
};
const fullscreenSupported = hasFullscreenSupport();
const pipSupported = hasPipSupport();
const airplaySupported = !!GlobalThis.WebKitPlaybackTargetAvailabilityEvent;
const castSupported = !!GlobalThis.chrome;


;// ../node_modules/media-chrome/dist/media-store/util.js


const getSubtitleTracks = (stateOwners) => {
  return getTextTracksList(stateOwners.media, (textTrack) => {
    return [TextTrackKinds.SUBTITLES, TextTrackKinds.CAPTIONS].includes(
      textTrack.kind
    );
  }).sort((a, b) => a.kind >= b.kind ? 1 : -1);
};
const getShowingSubtitleTracks = (stateOwners) => {
  return getTextTracksList(stateOwners.media, (textTrack) => {
    return textTrack.mode === TextTrackModes.SHOWING && [TextTrackKinds.SUBTITLES, TextTrackKinds.CAPTIONS].includes(
      textTrack.kind
    );
  });
};
const toggleSubtitleTracks = (stateOwners, force) => {
  const tracks = getSubtitleTracks(stateOwners);
  const showingSubitleTracks = getShowingSubtitleTracks(stateOwners);
  const subtitlesShowing = !!showingSubitleTracks.length;
  if (!tracks.length)
    return;
  if (force === false || subtitlesShowing && force !== true) {
    updateTracksModeTo(TextTrackModes.DISABLED, tracks, showingSubitleTracks);
  } else if (force === true || !subtitlesShowing && force !== false) {
    let subTrack = tracks[0];
    const { options } = stateOwners;
    if (!(options == null ? void 0 : options.noSubtitlesLangPref)) {
      const subtitlesPref = globalThis.localStorage.getItem(
        "media-chrome-pref-subtitles-lang"
      );
      const userLangPrefs = subtitlesPref ? [subtitlesPref, ...globalThis.navigator.languages] : globalThis.navigator.languages;
      const preferredAvailableSubs = tracks.filter((textTrack) => {
        return userLangPrefs.some(
          (lang) => textTrack.language.toLowerCase().startsWith(lang.split("-")[0])
        );
      }).sort((textTrackA, textTrackB) => {
        const idxA = userLangPrefs.findIndex(
          (lang) => textTrackA.language.toLowerCase().startsWith(lang.split("-")[0])
        );
        const idxB = userLangPrefs.findIndex(
          (lang) => textTrackB.language.toLowerCase().startsWith(lang.split("-")[0])
        );
        return idxA - idxB;
      });
      if (preferredAvailableSubs[0]) {
        subTrack = preferredAvailableSubs[0];
      }
    }
    const { language, label, kind } = subTrack;
    updateTracksModeTo(TextTrackModes.DISABLED, tracks, showingSubitleTracks);
    updateTracksModeTo(TextTrackModes.SHOWING, tracks, [
      { language, label, kind }
    ]);
  }
};
const areValuesEq = (x, y) => {
  if (x === y)
    return true;
  if (x == null || y == null)
    return false;
  if (typeof x !== typeof y)
    return false;
  if (typeof x === "number" && Number.isNaN(x) && Number.isNaN(y))
    return true;
  if (typeof x !== "object")
    return false;
  if (Array.isArray(x))
    return areArraysEq(x, y);
  return Object.entries(x).every(
    // NOTE: Checking key in y to disambiguate between between missing keys and keys whose value are undefined (CJP)
    ([key, value]) => key in y && areValuesEq(value, y[key])
  );
};
const areArraysEq = (xs, ys) => {
  const xIsArray = Array.isArray(xs);
  const yIsArray = Array.isArray(ys);
  if (xIsArray !== yIsArray)
    return false;
  if (!(xIsArray || yIsArray))
    return true;
  if (xs.length !== ys.length)
    return false;
  return xs.every((x, i) => areValuesEq(x, ys[i]));
};


;// ../node_modules/media-chrome/dist/media-store/state-mediator.js








const StreamTypeValues = Object.values(StreamTypes);
let volumeSupported;
const volumeSupportPromise = hasVolumeSupportAsync().then((supported) => {
  volumeSupported = supported;
  return volumeSupported;
});
const prepareStateOwners = async (...stateOwners) => {
  await Promise.all(
    stateOwners.filter((x) => x).map(async (stateOwner) => {
      if (!("localName" in stateOwner && stateOwner instanceof GlobalThis.HTMLElement)) {
        return;
      }
      const name = stateOwner.localName;
      if (!name.includes("-"))
        return;
      const classDef = GlobalThis.customElements.get(name);
      if (classDef && stateOwner instanceof classDef)
        return;
      await GlobalThis.customElements.whenDefined(name);
      GlobalThis.customElements.upgrade(stateOwner);
    })
  );
};
const domParser = new GlobalThis.DOMParser();
const parseHtmlToText = (text) => text ? domParser.parseFromString(text, "text/html").body.textContent || text : text;
const state_mediator_stateMediator = {
  mediaError: {
    get(stateOwners, event) {
      const { media } = stateOwners;
      if ((event == null ? void 0 : event.type) === "playing")
        return;
      return media == null ? void 0 : media.error;
    },
    mediaEvents: ["emptied", "error", "playing"]
  },
  mediaErrorCode: {
    get(stateOwners, event) {
      var _a;
      const { media } = stateOwners;
      if ((event == null ? void 0 : event.type) === "playing")
        return;
      return (_a = media == null ? void 0 : media.error) == null ? void 0 : _a.code;
    },
    mediaEvents: ["emptied", "error", "playing"]
  },
  mediaErrorMessage: {
    get(stateOwners, event) {
      var _a, _b;
      const { media } = stateOwners;
      if ((event == null ? void 0 : event.type) === "playing")
        return;
      return (_b = (_a = media == null ? void 0 : media.error) == null ? void 0 : _a.message) != null ? _b : "";
    },
    mediaEvents: ["emptied", "error", "playing"]
  },
  mediaWidth: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.videoWidth) != null ? _a : 0;
    },
    mediaEvents: ["resize"]
  },
  mediaHeight: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.videoHeight) != null ? _a : 0;
    },
    mediaEvents: ["resize"]
  },
  mediaPaused: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.paused) != null ? _a : true;
    },
    set(value, stateOwners) {
      var _a;
      const { media } = stateOwners;
      if (!media)
        return;
      if (value) {
        media.pause();
      } else {
        (_a = media.play()) == null ? void 0 : _a.catch(() => {
        });
      }
    },
    mediaEvents: ["play", "playing", "pause", "emptied"]
  },
  mediaHasPlayed: {
    // We want to let the user know that the media started playing at any point (`media-has-played`).
    // Since these propagators are all called when boostrapping state, let's verify this is
    // a real playing event by checking that 1) there's media and 2) it isn't currently paused.
    get(stateOwners, event) {
      const { media } = stateOwners;
      if (!media)
        return false;
      if (!event)
        return !media.paused;
      return event.type === "playing";
    },
    mediaEvents: ["playing", "emptied"]
  },
  mediaEnded: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.ended) != null ? _a : false;
    },
    mediaEvents: ["seeked", "ended", "emptied"]
  },
  mediaPlaybackRate: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.playbackRate) != null ? _a : 1;
    },
    set(value, stateOwners) {
      const { media } = stateOwners;
      if (!media)
        return;
      if (!Number.isFinite(+value))
        return;
      media.playbackRate = +value;
    },
    mediaEvents: ["ratechange", "loadstart"]
  },
  mediaMuted: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.muted) != null ? _a : false;
    },
    set(value, stateOwners) {
      const { media, options: { noMutedPref } = {} } = stateOwners;
      if (!media)
        return;
      media.muted = value;
      try {
        const hasLocalStoragePrefMuted = GlobalThis.localStorage.getItem("media-chrome-pref-muted") !== null;
        const hasMutedAttribute = media.hasAttribute("muted");
        if (noMutedPref) {
          if (hasLocalStoragePrefMuted)
            GlobalThis.localStorage.removeItem("media-chrome-pref-muted");
          return;
        }
        if (hasMutedAttribute && !hasLocalStoragePrefMuted) {
          return;
        }
        GlobalThis.localStorage.setItem(
          "media-chrome-pref-muted",
          value ? "true" : "false"
        );
      } catch (e) {
        console.debug("Error setting muted pref", e);
      }
    },
    mediaEvents: ["volumechange"],
    stateOwnersUpdateHandlers: [
      (handler, stateOwners) => {
        const {
          options: { noMutedPref }
        } = stateOwners;
        const { media } = stateOwners;
        if (!media || media.muted || noMutedPref)
          return;
        try {
          const mutedPref = GlobalThis.localStorage.getItem("media-chrome-pref-muted") === "true";
          state_mediator_stateMediator.mediaMuted.set(mutedPref, stateOwners);
          handler(mutedPref);
        } catch (e) {
          console.debug("Error getting muted pref", e);
        }
      }
    ]
  },
  mediaVolume: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.volume) != null ? _a : 1;
    },
    set(value, stateOwners) {
      const { media, options: { noVolumePref } = {} } = stateOwners;
      if (!media)
        return;
      try {
        if (value == null) {
          GlobalThis.localStorage.removeItem("media-chrome-pref-volume");
        } else if (!media.hasAttribute("muted") && !noVolumePref) {
          GlobalThis.localStorage.setItem(
            "media-chrome-pref-volume",
            value.toString()
          );
        }
      } catch (e) {
        console.debug("Error setting volume pref", e);
      }
      if (!Number.isFinite(+value))
        return;
      media.volume = +value;
    },
    mediaEvents: ["volumechange"],
    stateOwnersUpdateHandlers: [
      (handler, stateOwners) => {
        const {
          options: { noVolumePref }
        } = stateOwners;
        if (noVolumePref)
          return;
        try {
          const { media } = stateOwners;
          if (!media)
            return;
          const volumePref = GlobalThis.localStorage.getItem(
            "media-chrome-pref-volume"
          );
          if (volumePref == null)
            return;
          state_mediator_stateMediator.mediaVolume.set(+volumePref, stateOwners);
          handler(+volumePref);
        } catch (e) {
          console.debug("Error getting volume pref", e);
        }
      }
    ]
  },
  // NOTE: Keeping this roughly equivalent to prior impl to reduce number of changes,
  // however we may want to model "derived" state differently from "primary" state
  // (in this case, derived === mediaVolumeLevel, primary === mediaMuted, mediaVolume) (CJP)
  mediaVolumeLevel: {
    get(stateOwners) {
      const { media } = stateOwners;
      if (typeof (media == null ? void 0 : media.volume) == "undefined")
        return "high";
      if (media.muted || media.volume === 0)
        return "off";
      if (media.volume < 0.5)
        return "low";
      if (media.volume < 0.75)
        return "medium";
      return "high";
    },
    mediaEvents: ["volumechange"]
  },
  mediaCurrentTime: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return (_a = media == null ? void 0 : media.currentTime) != null ? _a : 0;
    },
    set(value, stateOwners) {
      const { media } = stateOwners;
      if (!media || !isValidNumber(value))
        return;
      media.currentTime = value;
    },
    mediaEvents: ["timeupdate", "loadedmetadata"]
  },
  mediaDuration: {
    get(stateOwners) {
      const { media, options: { defaultDuration } = {} } = stateOwners;
      if (defaultDuration && (!media || !media.duration || Number.isNaN(media.duration) || !Number.isFinite(media.duration))) {
        return defaultDuration;
      }
      return Number.isFinite(media == null ? void 0 : media.duration) ? media.duration : Number.NaN;
    },
    mediaEvents: ["durationchange", "loadedmetadata", "emptied"]
  },
  mediaLoading: {
    get(stateOwners) {
      const { media } = stateOwners;
      return (media == null ? void 0 : media.readyState) < 3;
    },
    mediaEvents: ["waiting", "playing", "emptied"]
  },
  mediaSeekable: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      if (!((_a = media == null ? void 0 : media.seekable) == null ? void 0 : _a.length))
        return void 0;
      const start = media.seekable.start(0);
      const end = media.seekable.end(media.seekable.length - 1);
      if (!start && !end)
        return void 0;
      return [Number(start.toFixed(3)), Number(end.toFixed(3))];
    },
    mediaEvents: ["loadedmetadata", "emptied", "progress", "seekablechange"]
  },
  mediaBuffered: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      const timeRanges = (_a = media == null ? void 0 : media.buffered) != null ? _a : [];
      return Array.from(timeRanges).map((_, i) => [
        Number(timeRanges.start(i).toFixed(3)),
        Number(timeRanges.end(i).toFixed(3))
      ]);
    },
    mediaEvents: ["progress", "emptied"]
  },
  mediaStreamType: {
    get(stateOwners) {
      const { media, options: { defaultStreamType } = {} } = stateOwners;
      const usedDefaultStreamType = [
        StreamTypes.LIVE,
        StreamTypes.ON_DEMAND
      ].includes(defaultStreamType) ? defaultStreamType : void 0;
      if (!media)
        return usedDefaultStreamType;
      const { streamType } = media;
      if (StreamTypeValues.includes(streamType)) {
        if (streamType === StreamTypes.UNKNOWN) {
          return usedDefaultStreamType;
        }
        return streamType;
      }
      const duration = media.duration;
      if (duration === Infinity) {
        return StreamTypes.LIVE;
      } else if (Number.isFinite(duration)) {
        return StreamTypes.ON_DEMAND;
      }
      return usedDefaultStreamType;
    },
    mediaEvents: [
      "emptied",
      "durationchange",
      "loadedmetadata",
      "streamtypechange"
    ]
  },
  mediaTargetLiveWindow: {
    get(stateOwners) {
      const { media } = stateOwners;
      if (!media)
        return Number.NaN;
      const { targetLiveWindow } = media;
      const streamType = state_mediator_stateMediator.mediaStreamType.get(stateOwners);
      if ((targetLiveWindow == null || Number.isNaN(targetLiveWindow)) && streamType === StreamTypes.LIVE) {
        return 0;
      }
      return targetLiveWindow;
    },
    mediaEvents: [
      "emptied",
      "durationchange",
      "loadedmetadata",
      "streamtypechange",
      "targetlivewindowchange"
    ]
  },
  mediaTimeIsLive: {
    get(stateOwners) {
      const {
        media,
        // Default to 10 seconds
        options: { liveEdgeOffset = 10 } = {}
      } = stateOwners;
      if (!media)
        return false;
      if (typeof media.liveEdgeStart === "number") {
        if (Number.isNaN(media.liveEdgeStart))
          return false;
        return media.currentTime >= media.liveEdgeStart;
      }
      const live = state_mediator_stateMediator.mediaStreamType.get(stateOwners) === StreamTypes.LIVE;
      if (!live)
        return false;
      const seekable = media.seekable;
      if (!seekable)
        return true;
      if (!seekable.length)
        return false;
      const liveEdgeStart = seekable.end(seekable.length - 1) - liveEdgeOffset;
      return media.currentTime >= liveEdgeStart;
    },
    mediaEvents: ["playing", "timeupdate", "progress", "waiting", "emptied"]
  },
  // Text Tracks modeling
  mediaSubtitlesList: {
    get(stateOwners) {
      return getSubtitleTracks(stateOwners).map(
        ({ kind, label, language }) => ({ kind, label, language })
      );
    },
    mediaEvents: ["loadstart"],
    textTracksEvents: ["addtrack", "removetrack"]
  },
  mediaSubtitlesShowing: {
    get(stateOwners) {
      return getShowingSubtitleTracks(stateOwners).map(
        ({ kind, label, language }) => ({ kind, label, language })
      );
    },
    mediaEvents: ["loadstart"],
    textTracksEvents: ["addtrack", "removetrack", "change"],
    stateOwnersUpdateHandlers: [
      (_handler, stateOwners) => {
        var _a, _b;
        const { media, options } = stateOwners;
        if (!media)
          return;
        const updateDefaultSubtitlesCallback = (event) => {
          var _a2;
          if (!options.defaultSubtitles)
            return;
          const nonSubsEvent = event && ![TextTrackKinds.CAPTIONS, TextTrackKinds.SUBTITLES].includes(
            // @ts-ignore
            (_a2 = event == null ? void 0 : event.track) == null ? void 0 : _a2.kind
          );
          if (nonSubsEvent)
            return;
          toggleSubtitleTracks(stateOwners, true);
        };
        media.addEventListener(
          "loadstart",
          updateDefaultSubtitlesCallback
        );
        (_a = media.textTracks) == null ? void 0 : _a.addEventListener(
          "addtrack",
          updateDefaultSubtitlesCallback
        );
        (_b = media.textTracks) == null ? void 0 : _b.addEventListener(
          "removetrack",
          updateDefaultSubtitlesCallback
        );
        return () => {
          var _a2, _b2;
          media.removeEventListener(
            "loadstart",
            updateDefaultSubtitlesCallback
          );
          (_a2 = media.textTracks) == null ? void 0 : _a2.removeEventListener(
            "addtrack",
            updateDefaultSubtitlesCallback
          );
          (_b2 = media.textTracks) == null ? void 0 : _b2.removeEventListener(
            "removetrack",
            updateDefaultSubtitlesCallback
          );
        };
      }
    ]
  },
  mediaChaptersCues: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      if (!media)
        return [];
      const [chaptersTrack] = getTextTracksList(media, {
        kind: TextTrackKinds.CHAPTERS
      });
      return Array.from((_a = chaptersTrack == null ? void 0 : chaptersTrack.cues) != null ? _a : []).map(
        ({ text, startTime, endTime }) => ({
          text: parseHtmlToText(text),
          startTime,
          endTime
        })
      );
    },
    mediaEvents: ["loadstart", "loadedmetadata"],
    textTracksEvents: ["addtrack", "removetrack", "change"],
    stateOwnersUpdateHandlers: [
      (handler, stateOwners) => {
        var _a;
        const { media } = stateOwners;
        if (!media)
          return;
        const chaptersTrack = media.querySelector(
          'track[kind="chapters"][default][src]'
        );
        const shadowChaptersTrack = (_a = media.shadowRoot) == null ? void 0 : _a.querySelector(
          ':is(video,audio) > track[kind="chapters"][default][src]'
        );
        chaptersTrack == null ? void 0 : chaptersTrack.addEventListener("load", handler);
        shadowChaptersTrack == null ? void 0 : shadowChaptersTrack.addEventListener("load", handler);
        return () => {
          chaptersTrack == null ? void 0 : chaptersTrack.removeEventListener("load", handler);
          shadowChaptersTrack == null ? void 0 : shadowChaptersTrack.removeEventListener("load", handler);
        };
      }
    ]
  },
  // Modeling state tied to root node
  mediaIsPip: {
    get(stateOwners) {
      var _a, _b;
      const { media, documentElement } = stateOwners;
      if (!media || !documentElement)
        return false;
      if (!documentElement.pictureInPictureElement)
        return false;
      if (documentElement.pictureInPictureElement === media)
        return true;
      if (documentElement.pictureInPictureElement instanceof HTMLMediaElement) {
        if (!((_a = media.localName) == null ? void 0 : _a.includes("-")))
          return false;
        return containsComposedNode(
          media,
          documentElement.pictureInPictureElement
        );
      }
      if (documentElement.pictureInPictureElement.localName.includes("-")) {
        let currentRoot = documentElement.pictureInPictureElement.shadowRoot;
        while (currentRoot == null ? void 0 : currentRoot.pictureInPictureElement) {
          if (currentRoot.pictureInPictureElement === media)
            return true;
          currentRoot = (_b = currentRoot.pictureInPictureElement) == null ? void 0 : _b.shadowRoot;
        }
      }
      return false;
    },
    set(value, stateOwners) {
      const { media } = stateOwners;
      if (!media)
        return;
      if (value) {
        if (!server_safe_globals_Document.pictureInPictureEnabled) {
          console.warn("MediaChrome: Picture-in-picture is not enabled");
          return;
        }
        if (!media.requestPictureInPicture) {
          console.warn(
            "MediaChrome: The current media does not support picture-in-picture"
          );
          return;
        }
        const warnNotReady = () => {
          console.warn(
            "MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0."
          );
        };
        media.requestPictureInPicture().catch((err) => {
          if (err.code === 11) {
            if (!media.src) {
              console.warn(
                "MediaChrome: The media is not ready for picture-in-picture. It must have a src set."
              );
              return;
            }
            if (media.readyState === 0 && media.preload === "none") {
              const cleanup = () => {
                media.removeEventListener("loadedmetadata", tryPip);
                media.preload = "none";
              };
              const tryPip = () => {
                media.requestPictureInPicture().catch(warnNotReady);
                cleanup();
              };
              media.addEventListener("loadedmetadata", tryPip);
              media.preload = "metadata";
              setTimeout(() => {
                if (media.readyState === 0)
                  warnNotReady();
                cleanup();
              }, 1e3);
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        });
      } else if (server_safe_globals_Document.pictureInPictureElement) {
        server_safe_globals_Document.exitPictureInPicture();
      }
    },
    mediaEvents: ["enterpictureinpicture", "leavepictureinpicture"]
  },
  mediaRenditionList: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return [...(_a = media == null ? void 0 : media.videoRenditions) != null ? _a : []].map((videoRendition) => ({
        ...videoRendition
      }));
    },
    mediaEvents: ["emptied", "loadstart"],
    videoRenditionsEvents: ["addrendition", "removerendition"]
  },
  /** @TODO Model this as a derived value? (CJP) */
  mediaRenditionSelected: {
    get(stateOwners) {
      var _a, _b, _c;
      const { media } = stateOwners;
      return (_c = (_b = media == null ? void 0 : media.videoRenditions) == null ? void 0 : _b[(_a = media.videoRenditions) == null ? void 0 : _a.selectedIndex]) == null ? void 0 : _c.id;
    },
    set(value, stateOwners) {
      const { media } = stateOwners;
      if (!(media == null ? void 0 : media.videoRenditions)) {
        console.warn(
          "MediaController: Rendition selection not supported by this media."
        );
        return;
      }
      const renditionId = value;
      const index = Array.prototype.findIndex.call(
        media.videoRenditions,
        (r) => r.id == renditionId
      );
      if (media.videoRenditions.selectedIndex != index) {
        media.videoRenditions.selectedIndex = index;
      }
    },
    mediaEvents: ["emptied"],
    videoRenditionsEvents: ["addrendition", "removerendition", "change"]
  },
  mediaAudioTrackList: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      return [...(_a = media == null ? void 0 : media.audioTracks) != null ? _a : []];
    },
    mediaEvents: ["emptied", "loadstart"],
    audioTracksEvents: ["addtrack", "removetrack"]
  },
  mediaAudioTrackEnabled: {
    get(stateOwners) {
      var _a, _b;
      const { media } = stateOwners;
      return (_b = [...(_a = media == null ? void 0 : media.audioTracks) != null ? _a : []].find(
        (audioTrack) => audioTrack.enabled
      )) == null ? void 0 : _b.id;
    },
    set(value, stateOwners) {
      const { media } = stateOwners;
      if (!(media == null ? void 0 : media.audioTracks)) {
        console.warn(
          "MediaChrome: Audio track selection not supported by this media."
        );
        return;
      }
      const audioTrackId = value;
      for (const track of media.audioTracks) {
        track.enabled = audioTrackId == track.id;
      }
    },
    mediaEvents: ["emptied"],
    audioTracksEvents: ["addtrack", "removetrack", "change"]
  },
  mediaIsFullscreen: {
    get(stateOwners) {
      return isFullscreen(stateOwners);
    },
    set(value, stateOwners, event) {
      var _a;
      if (!value) {
        exitFullscreen(stateOwners);
      } else {
        enterFullscreen(stateOwners);
        const isPointer = event.detail;
        if (isPointer)
          (_a = stateOwners.media) == null ? void 0 : _a.focus();
      }
    },
    // older Safari version may require webkit-specific events
    rootEvents: ["fullscreenchange", "webkitfullscreenchange"],
    // iOS requires webkit-specific events on the video.
    mediaEvents: [
      "webkitbeginfullscreen",
      "webkitendfullscreen",
      "webkitpresentationmodechanged"
    ]
  },
  mediaIsCasting: {
    // Note this relies on a customized castable-video element.
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      if (!(media == null ? void 0 : media.remote) || ((_a = media.remote) == null ? void 0 : _a.state) === "disconnected")
        return false;
      return !!media.remote.state;
    },
    set(value, stateOwners) {
      var _a, _b;
      const { media } = stateOwners;
      if (!media)
        return;
      if (value && ((_a = media.remote) == null ? void 0 : _a.state) !== "disconnected")
        return;
      if (!value && ((_b = media.remote) == null ? void 0 : _b.state) !== "connected")
        return;
      if (typeof media.remote.prompt !== "function") {
        console.warn(
          "MediaChrome: Casting is not supported in this environment"
        );
        return;
      }
      media.remote.prompt().catch(() => {
      });
    },
    remoteEvents: ["connect", "connecting", "disconnect"]
  },
  // NOTE: Newly added state for tracking airplaying
  mediaIsAirplaying: {
    // NOTE: Cannot know if airplaying since Safari doesn't fully support HTMLMediaElement::remote yet (e.g. remote::state) (CJP)
    get() {
      return false;
    },
    set(_value, stateOwners) {
      const { media } = stateOwners;
      if (!media)
        return;
      if (!(media.webkitShowPlaybackTargetPicker && GlobalThis.WebKitPlaybackTargetAvailabilityEvent)) {
        console.error(
          "MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment"
        );
        return;
      }
      media.webkitShowPlaybackTargetPicker();
    },
    mediaEvents: ["webkitcurrentplaybacktargetiswirelesschanged"]
  },
  mediaFullscreenUnavailable: {
    get(stateOwners) {
      const { media } = stateOwners;
      if (!fullscreenSupported || !hasFullscreenSupport(media))
        return AvailabilityStates.UNSUPPORTED;
      return void 0;
    }
  },
  mediaPipUnavailable: {
    get(stateOwners) {
      const { media } = stateOwners;
      if (!pipSupported || !hasPipSupport(media))
        return AvailabilityStates.UNSUPPORTED;
      else if (media == null ? void 0 : media.disablePictureInPicture)
        return AvailabilityStates.UNAVAILABLE;
      return void 0;
    }
  },
  mediaVolumeUnavailable: {
    get(stateOwners) {
      const { media } = stateOwners;
      if (volumeSupported === false || (media == null ? void 0 : media.volume) == void 0) {
        return AvailabilityStates.UNSUPPORTED;
      }
      return void 0;
    },
    // NOTE: Slightly different impl here. Added generic support for
    // "stateOwnersUpdateHandlers" since the original impl had to hack around
    // race conditions. (CJP)
    stateOwnersUpdateHandlers: [
      (handler) => {
        if (volumeSupported == null) {
          volumeSupportPromise.then(
            (supported) => handler(supported ? void 0 : AvailabilityStates.UNSUPPORTED)
          );
        }
      }
    ]
  },
  mediaCastUnavailable: {
    // @ts-ignore
    get(stateOwners, { availability = "not-available" } = {}) {
      var _a;
      const { media } = stateOwners;
      if (!castSupported || !((_a = media == null ? void 0 : media.remote) == null ? void 0 : _a.state)) {
        return AvailabilityStates.UNSUPPORTED;
      }
      if (availability == null || availability === "available")
        return void 0;
      return AvailabilityStates.UNAVAILABLE;
    },
    stateOwnersUpdateHandlers: [
      (handler, stateOwners) => {
        var _a;
        const { media } = stateOwners;
        if (!media)
          return;
        const remotePlaybackDisabled = media.disableRemotePlayback || media.hasAttribute("disableremoteplayback");
        if (!remotePlaybackDisabled) {
          (_a = media == null ? void 0 : media.remote) == null ? void 0 : _a.watchAvailability((availabilityBool) => {
            const availability = availabilityBool ? "available" : "not-available";
            handler({ availability });
          }).catch((error) => {
            if (error.name === "NotSupportedError") {
              handler({ availability: null });
            } else {
              handler({ availability: "not-available" });
            }
          });
        }
        return () => {
          var _a2;
          (_a2 = media == null ? void 0 : media.remote) == null ? void 0 : _a2.cancelWatchAvailability().catch(() => {
          });
        };
      }
    ]
  },
  mediaAirplayUnavailable: {
    get(_stateOwners, event) {
      if (!airplaySupported)
        return AvailabilityStates.UNSUPPORTED;
      if ((event == null ? void 0 : event.availability) === "not-available") {
        return AvailabilityStates.UNAVAILABLE;
      }
      return void 0;
    },
    // NOTE: Keeping this event, as it's still the documented way of monitoring
    // for AirPlay availability from Apple.
    // See: https://developer.apple.com/documentation/webkitjs/adding_an_airplay_button_to_your_safari_media_controls#2940021 (CJP)
    mediaEvents: ["webkitplaybacktargetavailabilitychanged"],
    stateOwnersUpdateHandlers: [
      (handler, stateOwners) => {
        var _a;
        const { media } = stateOwners;
        if (!media)
          return;
        const remotePlaybackDisabled = media.disableRemotePlayback || media.hasAttribute("disableremoteplayback");
        if (!remotePlaybackDisabled) {
          (_a = media == null ? void 0 : media.remote) == null ? void 0 : _a.watchAvailability((availabilityBool) => {
            const availability = availabilityBool ? "available" : "not-available";
            handler({ availability });
          }).catch((error) => {
            if (error.name === "NotSupportedError") {
              handler({ availability: null });
            } else {
              handler({ availability: "not-available" });
            }
          });
        }
        return () => {
          var _a2;
          (_a2 = media == null ? void 0 : media.remote) == null ? void 0 : _a2.cancelWatchAvailability().catch(() => {
          });
        };
      }
    ]
  },
  mediaRenditionUnavailable: {
    get(stateOwners) {
      var _a;
      const { media } = stateOwners;
      if (!(media == null ? void 0 : media.videoRenditions)) {
        return AvailabilityStates.UNSUPPORTED;
      }
      if (!((_a = media.videoRenditions) == null ? void 0 : _a.length)) {
        return AvailabilityStates.UNAVAILABLE;
      }
      return void 0;
    },
    mediaEvents: ["emptied", "loadstart"],
    videoRenditionsEvents: ["addrendition", "removerendition"]
  },
  mediaAudioTrackUnavailable: {
    get(stateOwners) {
      var _a, _b;
      const { media } = stateOwners;
      if (!(media == null ? void 0 : media.audioTracks)) {
        return AvailabilityStates.UNSUPPORTED;
      }
      if (((_b = (_a = media.audioTracks) == null ? void 0 : _a.length) != null ? _b : 0) <= 1) {
        return AvailabilityStates.UNAVAILABLE;
      }
      return void 0;
    },
    mediaEvents: ["emptied", "loadstart"],
    audioTracksEvents: ["addtrack", "removetrack"]
  },
  mediaLang: {
    get(stateOwners) {
      const { options: { mediaLang } = {} } = stateOwners;
      return mediaLang != null ? mediaLang : "en";
    }
  }
};


;// ../node_modules/media-chrome/dist/media-store/request-map.js




const request_map_requestMap = {
  /**
   * @TODO Consider adding state to `StateMediator` for e.g. `mediaThumbnailCues` and use that for derived state here (CJP)
   */
  [MediaUIEvents.MEDIA_PREVIEW_REQUEST](stateMediator, stateOwners, { detail }) {
    var _a, _b, _c;
    const { media } = stateOwners;
    const mediaPreviewTime = detail != null ? detail : void 0;
    let mediaPreviewImage = void 0;
    let mediaPreviewCoords = void 0;
    if (media && mediaPreviewTime != null) {
      const [track] = getTextTracksList(media, {
        kind: TextTrackKinds.METADATA,
        label: "thumbnails"
      });
      const cue = Array.prototype.find.call((_a = track == null ? void 0 : track.cues) != null ? _a : [], (c, i, cs) => {
        if (i === 0)
          return c.endTime > mediaPreviewTime;
        if (i === cs.length - 1)
          return c.startTime <= mediaPreviewTime;
        return c.startTime <= mediaPreviewTime && c.endTime > mediaPreviewTime;
      });
      if (cue) {
        const base = !/'^(?:[a-z]+:)?\/\//i.test(cue.text) ? (_b = media == null ? void 0 : media.querySelector(
          'track[label="thumbnails"]'
        )) == null ? void 0 : _b.src : void 0;
        const url = new URL(cue.text, base);
        const previewCoordsStr = new URLSearchParams(url.hash).get("#xywh");
        mediaPreviewCoords = previewCoordsStr.split(",").map((numStr) => +numStr);
        mediaPreviewImage = url.href;
      }
    }
    const mediaDuration = stateMediator.mediaDuration.get(stateOwners);
    const mediaChaptersCues = stateMediator.mediaChaptersCues.get(stateOwners);
    let mediaPreviewChapter = (_c = mediaChaptersCues.find((c, i, cs) => {
      if (i === cs.length - 1 && mediaDuration === c.endTime) {
        return c.startTime <= mediaPreviewTime && c.endTime >= mediaPreviewTime;
      }
      return c.startTime <= mediaPreviewTime && c.endTime > mediaPreviewTime;
    })) == null ? void 0 : _c.text;
    if (detail != null && mediaPreviewChapter == null) {
      mediaPreviewChapter = "";
    }
    return {
      mediaPreviewTime,
      mediaPreviewImage,
      mediaPreviewCoords,
      mediaPreviewChapter
    };
  },
  [MediaUIEvents.MEDIA_PAUSE_REQUEST](stateMediator, stateOwners) {
    const key = "mediaPaused";
    const value = true;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_PLAY_REQUEST](stateMediator, stateOwners) {
    var _a, _b, _c, _d;
    const key = "mediaPaused";
    const value = false;
    const isLive = stateMediator.mediaStreamType.get(stateOwners) === StreamTypes.LIVE;
    const canAutoSeekToLive = !((_a = stateOwners.options) == null ? void 0 : _a.noAutoSeekToLive);
    const isDVR = stateMediator.mediaTargetLiveWindow.get(stateOwners) > 0;
    if (isLive && canAutoSeekToLive && !isDVR) {
      const seekableEnd = (_b = stateMediator.mediaSeekable.get(stateOwners)) == null ? void 0 : _b[1];
      if (seekableEnd) {
        const seekToLiveOffset = (_d = (_c = stateOwners.options) == null ? void 0 : _c.seekToLiveOffset) != null ? _d : 0;
        const liveEdgeTime = seekableEnd - seekToLiveOffset;
        stateMediator.mediaCurrentTime.set(liveEdgeTime, stateOwners);
      }
    }
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST](stateMediator, stateOwners, { detail }) {
    const key = "mediaPlaybackRate";
    const value = detail;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_MUTE_REQUEST](stateMediator, stateOwners) {
    const key = "mediaMuted";
    const value = true;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_UNMUTE_REQUEST](stateMediator, stateOwners) {
    const key = "mediaMuted";
    const value = false;
    if (!stateMediator.mediaVolume.get(stateOwners)) {
      stateMediator.mediaVolume.set(0.25, stateOwners);
    }
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_VOLUME_REQUEST](stateMediator, stateOwners, { detail }) {
    const key = "mediaVolume";
    const value = detail;
    if (value && stateMediator.mediaMuted.get(stateOwners)) {
      stateMediator.mediaMuted.set(false, stateOwners);
    }
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_SEEK_REQUEST](stateMediator, stateOwners, { detail }) {
    const key = "mediaCurrentTime";
    const value = detail;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_SEEK_TO_LIVE_REQUEST](stateMediator, stateOwners) {
    var _a, _b, _c;
    const key = "mediaCurrentTime";
    const seekableEnd = (_a = stateMediator.mediaSeekable.get(stateOwners)) == null ? void 0 : _a[1];
    if (Number.isNaN(Number(seekableEnd)))
      return;
    const seekToLiveOffset = (_c = (_b = stateOwners.options) == null ? void 0 : _b.seekToLiveOffset) != null ? _c : 0;
    const value = seekableEnd - seekToLiveOffset;
    stateMediator[key].set(value, stateOwners);
  },
  // Text Tracks state change requests
  [MediaUIEvents.MEDIA_SHOW_SUBTITLES_REQUEST](_stateMediator, stateOwners, { detail }) {
    var _a;
    const { options } = stateOwners;
    const tracks = getSubtitleTracks(stateOwners);
    const tracksToUpdate = parseTracks(detail);
    const preferredLanguage = (_a = tracksToUpdate[0]) == null ? void 0 : _a.language;
    if (preferredLanguage && !options.noSubtitlesLangPref) {
      GlobalThis.localStorage.setItem(
        "media-chrome-pref-subtitles-lang",
        preferredLanguage
      );
    }
    updateTracksModeTo(TextTrackModes.SHOWING, tracks, tracksToUpdate);
  },
  [MediaUIEvents.MEDIA_DISABLE_SUBTITLES_REQUEST](_stateMediator, stateOwners, { detail }) {
    const tracks = getSubtitleTracks(stateOwners);
    const tracksToUpdate = detail != null ? detail : [];
    updateTracksModeTo(TextTrackModes.DISABLED, tracks, tracksToUpdate);
  },
  [MediaUIEvents.MEDIA_TOGGLE_SUBTITLES_REQUEST](_stateMediator, stateOwners, { detail }) {
    toggleSubtitleTracks(stateOwners, detail);
  },
  // Renditions/Tracks state change requests
  [MediaUIEvents.MEDIA_RENDITION_REQUEST](stateMediator, stateOwners, { detail }) {
    const key = "mediaRenditionSelected";
    const value = detail;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_AUDIO_TRACK_REQUEST](stateMediator, stateOwners, { detail }) {
    const key = "mediaAudioTrackEnabled";
    const value = detail;
    stateMediator[key].set(value, stateOwners);
  },
  // State change requests dependent on root node
  [MediaUIEvents.MEDIA_ENTER_PIP_REQUEST](stateMediator, stateOwners) {
    const key = "mediaIsPip";
    const value = true;
    if (stateMediator.mediaIsFullscreen.get(stateOwners)) {
      stateMediator.mediaIsFullscreen.set(false, stateOwners);
    }
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_EXIT_PIP_REQUEST](stateMediator, stateOwners) {
    const key = "mediaIsPip";
    const value = false;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_ENTER_FULLSCREEN_REQUEST](stateMediator, stateOwners, event) {
    const key = "mediaIsFullscreen";
    const value = true;
    if (stateMediator.mediaIsPip.get(stateOwners)) {
      stateMediator.mediaIsPip.set(false, stateOwners);
    }
    stateMediator[key].set(value, stateOwners, event);
  },
  [MediaUIEvents.MEDIA_EXIT_FULLSCREEN_REQUEST](stateMediator, stateOwners) {
    const key = "mediaIsFullscreen";
    const value = false;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_ENTER_CAST_REQUEST](stateMediator, stateOwners) {
    const key = "mediaIsCasting";
    const value = true;
    if (stateMediator.mediaIsFullscreen.get(stateOwners)) {
      stateMediator.mediaIsFullscreen.set(false, stateOwners);
    }
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_EXIT_CAST_REQUEST](stateMediator, stateOwners) {
    const key = "mediaIsCasting";
    const value = false;
    stateMediator[key].set(value, stateOwners);
  },
  [MediaUIEvents.MEDIA_AIRPLAY_REQUEST](stateMediator, stateOwners) {
    const key = "mediaIsAirplaying";
    const value = true;
    stateMediator[key].set(value, stateOwners);
  }
};


;// ../node_modules/media-chrome/dist/media-store/media-store.js



const createMediaStore = ({
  media,
  fullscreenElement,
  documentElement,
  stateMediator = state_mediator_stateMediator,
  requestMap = request_map_requestMap,
  options = {},
  monitorStateOwnersOnlyWithSubscriptions = true
}) => {
  const callbacks = [];
  const stateOwners = {
    // Spreading options here since folks should not rely on holding onto references
    // for any app-level logic wrt options.
    options: { ...options }
  };
  let state = Object.freeze({
    mediaPreviewTime: void 0,
    mediaPreviewImage: void 0,
    mediaPreviewCoords: void 0,
    mediaPreviewChapter: void 0
  });
  const updateState = (nextStateDelta) => {
    if (nextStateDelta == void 0)
      return;
    if (areValuesEq(nextStateDelta, state)) {
      return;
    }
    state = Object.freeze({
      ...state,
      ...nextStateDelta
    });
    callbacks.forEach((cb) => cb(state));
  };
  const updateStateFromFacade = () => {
    const nextState = Object.entries(stateMediator).reduce(
      (nextState2, [stateName, { get }]) => {
        nextState2[stateName] = get(stateOwners);
        return nextState2;
      },
      {}
    );
    updateState(nextState);
  };
  const stateUpdateHandlers = {};
  let nextStateOwners = void 0;
  const updateStateOwners = async (nextStateOwnersDelta, nextSubscriberCount) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const pendingUpdate = !!nextStateOwners;
    nextStateOwners = {
      ...stateOwners,
      ...nextStateOwners != null ? nextStateOwners : {},
      ...nextStateOwnersDelta
    };
    if (pendingUpdate)
      return;
    await prepareStateOwners(...Object.values(nextStateOwnersDelta));
    const shouldTeardownFromSubscriberCount = callbacks.length > 0 && nextSubscriberCount === 0 && monitorStateOwnersOnlyWithSubscriptions;
    const mediaChanged = stateOwners.media !== nextStateOwners.media;
    const textTracksChanged = ((_a = stateOwners.media) == null ? void 0 : _a.textTracks) !== ((_b = nextStateOwners.media) == null ? void 0 : _b.textTracks);
    const videoRenditionsChanged = ((_c = stateOwners.media) == null ? void 0 : _c.videoRenditions) !== ((_d = nextStateOwners.media) == null ? void 0 : _d.videoRenditions);
    const audioTracksChanged = ((_e = stateOwners.media) == null ? void 0 : _e.audioTracks) !== ((_f = nextStateOwners.media) == null ? void 0 : _f.audioTracks);
    const remoteChanged = ((_g = stateOwners.media) == null ? void 0 : _g.remote) !== ((_h = nextStateOwners.media) == null ? void 0 : _h.remote);
    const rootNodeChanged = stateOwners.documentElement !== nextStateOwners.documentElement;
    const teardownMedia = !!stateOwners.media && (mediaChanged || shouldTeardownFromSubscriberCount);
    const teardownTextTracks = !!((_i = stateOwners.media) == null ? void 0 : _i.textTracks) && (textTracksChanged || shouldTeardownFromSubscriberCount);
    const teardownVideoRenditions = !!((_j = stateOwners.media) == null ? void 0 : _j.videoRenditions) && (videoRenditionsChanged || shouldTeardownFromSubscriberCount);
    const teardownAudioTracks = !!((_k = stateOwners.media) == null ? void 0 : _k.audioTracks) && (audioTracksChanged || shouldTeardownFromSubscriberCount);
    const teardownRemote = !!((_l = stateOwners.media) == null ? void 0 : _l.remote) && (remoteChanged || shouldTeardownFromSubscriberCount);
    const teardownRootNode = !!stateOwners.documentElement && (rootNodeChanged || shouldTeardownFromSubscriberCount);
    const teardownSomething = teardownMedia || teardownTextTracks || teardownVideoRenditions || teardownAudioTracks || teardownRemote || teardownRootNode;
    const shouldSetupFromSubscriberCount = callbacks.length === 0 && nextSubscriberCount === 1 && monitorStateOwnersOnlyWithSubscriptions;
    const setupMedia = !!nextStateOwners.media && (mediaChanged || shouldSetupFromSubscriberCount);
    const setupTextTracks = !!((_m = nextStateOwners.media) == null ? void 0 : _m.textTracks) && (textTracksChanged || shouldSetupFromSubscriberCount);
    const setupVideoRenditions = !!((_n = nextStateOwners.media) == null ? void 0 : _n.videoRenditions) && (videoRenditionsChanged || shouldSetupFromSubscriberCount);
    const setupAudioTracks = !!((_o = nextStateOwners.media) == null ? void 0 : _o.audioTracks) && (audioTracksChanged || shouldSetupFromSubscriberCount);
    const setupRemote = !!((_p = nextStateOwners.media) == null ? void 0 : _p.remote) && (remoteChanged || shouldSetupFromSubscriberCount);
    const setupRootNode = !!nextStateOwners.documentElement && (rootNodeChanged || shouldSetupFromSubscriberCount);
    const setupSomething = setupMedia || setupTextTracks || setupVideoRenditions || setupAudioTracks || setupRemote || setupRootNode;
    const somethingToDo = teardownSomething || setupSomething;
    if (!somethingToDo) {
      Object.entries(nextStateOwners).forEach(
        ([stateOwnerName, stateOwner]) => {
          stateOwners[stateOwnerName] = stateOwner;
        }
      );
      updateStateFromFacade();
      nextStateOwners = void 0;
      return;
    }
    Object.entries(stateMediator).forEach(
      ([
        stateName,
        {
          get,
          mediaEvents = [],
          textTracksEvents = [],
          videoRenditionsEvents = [],
          audioTracksEvents = [],
          remoteEvents = [],
          rootEvents = [],
          stateOwnersUpdateHandlers = []
        }
      ]) => {
        if (!stateUpdateHandlers[stateName]) {
          stateUpdateHandlers[stateName] = {};
        }
        const handler = (event) => {
          const nextValue = get(stateOwners, event);
          updateState({ [stateName]: nextValue });
        };
        let prevHandler;
        prevHandler = stateUpdateHandlers[stateName].mediaEvents;
        mediaEvents.forEach((eventType) => {
          if (prevHandler && teardownMedia) {
            stateOwners.media.removeEventListener(eventType, prevHandler);
            stateUpdateHandlers[stateName].mediaEvents = void 0;
          }
          if (setupMedia) {
            nextStateOwners.media.addEventListener(eventType, handler);
            stateUpdateHandlers[stateName].mediaEvents = handler;
          }
        });
        prevHandler = stateUpdateHandlers[stateName].textTracksEvents;
        textTracksEvents.forEach((eventType) => {
          var _a2, _b2;
          if (prevHandler && teardownTextTracks) {
            (_a2 = stateOwners.media.textTracks) == null ? void 0 : _a2.removeEventListener(
              eventType,
              prevHandler
            );
            stateUpdateHandlers[stateName].textTracksEvents = void 0;
          }
          if (setupTextTracks) {
            (_b2 = nextStateOwners.media.textTracks) == null ? void 0 : _b2.addEventListener(
              eventType,
              handler
            );
            stateUpdateHandlers[stateName].textTracksEvents = handler;
          }
        });
        prevHandler = stateUpdateHandlers[stateName].videoRenditionsEvents;
        videoRenditionsEvents.forEach((eventType) => {
          var _a2, _b2;
          if (prevHandler && teardownVideoRenditions) {
            (_a2 = stateOwners.media.videoRenditions) == null ? void 0 : _a2.removeEventListener(
              eventType,
              prevHandler
            );
            stateUpdateHandlers[stateName].videoRenditionsEvents = void 0;
          }
          if (setupVideoRenditions) {
            (_b2 = nextStateOwners.media.videoRenditions) == null ? void 0 : _b2.addEventListener(
              eventType,
              handler
            );
            stateUpdateHandlers[stateName].videoRenditionsEvents = handler;
          }
        });
        prevHandler = stateUpdateHandlers[stateName].audioTracksEvents;
        audioTracksEvents.forEach((eventType) => {
          var _a2, _b2;
          if (prevHandler && teardownAudioTracks) {
            (_a2 = stateOwners.media.audioTracks) == null ? void 0 : _a2.removeEventListener(
              eventType,
              prevHandler
            );
            stateUpdateHandlers[stateName].audioTracksEvents = void 0;
          }
          if (setupAudioTracks) {
            (_b2 = nextStateOwners.media.audioTracks) == null ? void 0 : _b2.addEventListener(
              eventType,
              handler
            );
            stateUpdateHandlers[stateName].audioTracksEvents = handler;
          }
        });
        prevHandler = stateUpdateHandlers[stateName].remoteEvents;
        remoteEvents.forEach((eventType) => {
          var _a2, _b2;
          if (prevHandler && teardownRemote) {
            (_a2 = stateOwners.media.remote) == null ? void 0 : _a2.removeEventListener(
              eventType,
              prevHandler
            );
            stateUpdateHandlers[stateName].remoteEvents = void 0;
          }
          if (setupRemote) {
            (_b2 = nextStateOwners.media.remote) == null ? void 0 : _b2.addEventListener(eventType, handler);
            stateUpdateHandlers[stateName].remoteEvents = handler;
          }
        });
        prevHandler = stateUpdateHandlers[stateName].rootEvents;
        rootEvents.forEach((eventType) => {
          if (prevHandler && teardownRootNode) {
            stateOwners.documentElement.removeEventListener(
              eventType,
              prevHandler
            );
            stateUpdateHandlers[stateName].rootEvents = void 0;
          }
          if (setupRootNode) {
            nextStateOwners.documentElement.addEventListener(
              eventType,
              handler
            );
            stateUpdateHandlers[stateName].rootEvents = handler;
          }
        });
        const prevHandlerTeardown = stateUpdateHandlers[stateName].stateOwnersUpdateHandlers;
        stateOwnersUpdateHandlers.forEach((fn) => {
          if (prevHandlerTeardown && teardownSomething) {
            prevHandlerTeardown();
          }
          if (setupSomething) {
            stateUpdateHandlers[stateName].stateOwnersUpdateHandlers = fn(
              handler,
              nextStateOwners
            );
          }
        });
      }
    );
    Object.entries(nextStateOwners).forEach(([stateOwnerName, stateOwner]) => {
      stateOwners[stateOwnerName] = stateOwner;
    });
    updateStateFromFacade();
    nextStateOwners = void 0;
  };
  updateStateOwners({ media, fullscreenElement, documentElement, options });
  return {
    // note that none of these cases directly interact with the media element, root node, full screen element, etc.
    // note these "actions" could just be the events if we wanted, especially if we normalize on "detail" for
    // any payload-relevant values
    // This is roughly equivalent to our used to be in our state requests dictionary object, though much of the
    // "heavy lifting" is now moved into the facade `set()`
    dispatch(action) {
      const { type, detail } = action;
      if (requestMap[type] && state.mediaErrorCode == null) {
        updateState(requestMap[type](stateMediator, stateOwners, action));
        return;
      }
      if (type === "mediaelementchangerequest") {
        updateStateOwners({ media: detail });
      } else if (type === "fullscreenelementchangerequest") {
        updateStateOwners({ fullscreenElement: detail });
      } else if (type === "documentelementchangerequest") {
        updateStateOwners({ documentElement: detail });
      } else if (type === "optionschangerequest") {
        Object.entries(detail != null ? detail : {}).forEach(([optionName, optionValue]) => {
          stateOwners.options[optionName] = optionValue;
        });
        updateStateFromFacade();
      }
    },
    getState() {
      return state;
    },
    subscribe(callback) {
      updateStateOwners({}, callbacks.length + 1);
      callbacks.push(callback);
      callback(state);
      return () => {
        const idx = callbacks.indexOf(callback);
        if (idx >= 0) {
          updateStateOwners({}, callbacks.length - 1);
          callbacks.splice(idx, 1);
        }
      };
    }
  };
};
var media_store_default = (/* unused pure expression or super */ null && (createMediaStore));


;// ../node_modules/media-chrome/dist/media-controller.js
var media_controller_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_controller_privateGet = (obj, member, getter) => {
  media_controller_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_controller_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_controller_privateSet = (obj, member, value, setter) => {
  media_controller_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_controller_privateMethod = (obj, member, method) => {
  media_controller_accessCheck(obj, member, "access private method");
  return method;
};
var _hotKeys, _fullscreenElement, _mediaStore, _mediaStateCallback, _mediaStoreUnsubscribe, _mediaStateEventHandler, _setupDefaultStore, setupDefaultStore_fn, _keyUpHandler, keyUpHandler_fn, _keyDownHandler, keyDownHandler_fn;









const ButtonPressedKeys = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Enter",
  " ",
  "f",
  "m",
  "k",
  "c"
];
const DEFAULT_SEEK_OFFSET = 10;
const DEFAULT_VOLUME_STEP = 0.025;
const media_controller_Attributes = {
  DEFAULT_SUBTITLES: "defaultsubtitles",
  DEFAULT_STREAM_TYPE: "defaultstreamtype",
  DEFAULT_DURATION: "defaultduration",
  FULLSCREEN_ELEMENT: "fullscreenelement",
  HOTKEYS: "hotkeys",
  KEYS_USED: "keysused",
  LIVE_EDGE_OFFSET: "liveedgeoffset",
  SEEK_TO_LIVE_OFFSET: "seektoliveoffset",
  NO_AUTO_SEEK_TO_LIVE: "noautoseektolive",
  NO_HOTKEYS: "nohotkeys",
  NO_VOLUME_PREF: "novolumepref",
  NO_MUTED_PREF: "nomutedpref",
  NO_SUBTITLES_LANG_PREF: "nosubtitleslangpref",
  NO_DEFAULT_STORE: "nodefaultstore",
  KEYBOARD_FORWARD_SEEK_OFFSET: "keyboardforwardseekoffset",
  KEYBOARD_BACKWARD_SEEK_OFFSET: "keyboardbackwardseekoffset",
  KEYBOARD_UP_VOLUME_STEP: "keyboardupvolumestep",
  KEYBOARD_DOWN_VOLUME_STEP: "keyboarddownvolumestep",
  LANG: "lang"
};
class MediaController extends MediaContainer {
  constructor() {
    super();
    media_controller_privateAdd(this, _setupDefaultStore);
    media_controller_privateAdd(this, _keyUpHandler);
    media_controller_privateAdd(this, _keyDownHandler);
    this.mediaStateReceivers = [];
    this.associatedElementSubscriptions = /* @__PURE__ */ new Map();
    media_controller_privateAdd(this, _hotKeys, new AttributeTokenList(this, media_controller_Attributes.HOTKEYS));
    media_controller_privateAdd(this, _fullscreenElement, void 0);
    media_controller_privateAdd(this, _mediaStore, void 0);
    media_controller_privateAdd(this, _mediaStateCallback, void 0);
    media_controller_privateAdd(this, _mediaStoreUnsubscribe, void 0);
    media_controller_privateAdd(this, _mediaStateEventHandler, (event) => {
      var _a;
      (_a = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _a.dispatch(event);
    });
    this.associateElement(this);
    let prevState = {};
    media_controller_privateSet(this, _mediaStateCallback, (nextState) => {
      Object.entries(nextState).forEach(([stateName, stateValue]) => {
        if (stateName in prevState && prevState[stateName] === stateValue)
          return;
        this.propagateMediaState(stateName, stateValue);
        const attrName = stateName.toLowerCase();
        const evt = new GlobalThis.CustomEvent(
          AttributeToStateChangeEventMap[attrName],
          { composed: true, detail: stateValue }
        );
        this.dispatchEvent(evt);
      });
      prevState = nextState;
    });
    this.hasAttribute(media_controller_Attributes.NO_HOTKEYS) ? this.disableHotkeys() : this.enableHotkeys();
  }
  static get observedAttributes() {
    return super.observedAttributes.concat(
      media_controller_Attributes.NO_HOTKEYS,
      media_controller_Attributes.HOTKEYS,
      media_controller_Attributes.DEFAULT_STREAM_TYPE,
      media_controller_Attributes.DEFAULT_SUBTITLES,
      media_controller_Attributes.DEFAULT_DURATION,
      media_controller_Attributes.NO_MUTED_PREF,
      media_controller_Attributes.NO_VOLUME_PREF,
      media_controller_Attributes.LANG
    );
  }
  get mediaStore() {
    return media_controller_privateGet(this, _mediaStore);
  }
  set mediaStore(value) {
    var _a, _b;
    if (media_controller_privateGet(this, _mediaStore)) {
      (_a = media_controller_privateGet(this, _mediaStoreUnsubscribe)) == null ? void 0 : _a.call(this);
      media_controller_privateSet(this, _mediaStoreUnsubscribe, void 0);
    }
    media_controller_privateSet(this, _mediaStore, value);
    if (!media_controller_privateGet(this, _mediaStore) && !this.hasAttribute(media_controller_Attributes.NO_DEFAULT_STORE)) {
      media_controller_privateMethod(this, _setupDefaultStore, setupDefaultStore_fn).call(this);
      return;
    }
    media_controller_privateSet(this, _mediaStoreUnsubscribe, (_b = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _b.subscribe(
      media_controller_privateGet(this, _mediaStateCallback)
    ));
  }
  get fullscreenElement() {
    var _a;
    return (_a = media_controller_privateGet(this, _fullscreenElement)) != null ? _a : this;
  }
  set fullscreenElement(element) {
    var _a;
    if (this.hasAttribute(media_controller_Attributes.FULLSCREEN_ELEMENT)) {
      this.removeAttribute(media_controller_Attributes.FULLSCREEN_ELEMENT);
    }
    media_controller_privateSet(this, _fullscreenElement, element);
    (_a = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _a.dispatch({
      type: "fullscreenelementchangerequest",
      detail: this.fullscreenElement
    });
  }
  get defaultSubtitles() {
    return getBooleanAttr(this, media_controller_Attributes.DEFAULT_SUBTITLES);
  }
  set defaultSubtitles(value) {
    setBooleanAttr(this, media_controller_Attributes.DEFAULT_SUBTITLES, value);
  }
  get defaultStreamType() {
    return getStringAttr(this, media_controller_Attributes.DEFAULT_STREAM_TYPE);
  }
  set defaultStreamType(value) {
    setStringAttr(this, media_controller_Attributes.DEFAULT_STREAM_TYPE, value);
  }
  get defaultDuration() {
    return getNumericAttr(this, media_controller_Attributes.DEFAULT_DURATION);
  }
  set defaultDuration(value) {
    setNumericAttr(this, media_controller_Attributes.DEFAULT_DURATION, value);
  }
  get noHotkeys() {
    return getBooleanAttr(this, media_controller_Attributes.NO_HOTKEYS);
  }
  set noHotkeys(value) {
    setBooleanAttr(this, media_controller_Attributes.NO_HOTKEYS, value);
  }
  get keysUsed() {
    return getStringAttr(this, media_controller_Attributes.KEYS_USED);
  }
  set keysUsed(value) {
    setStringAttr(this, media_controller_Attributes.KEYS_USED, value);
  }
  get liveEdgeOffset() {
    return getNumericAttr(this, media_controller_Attributes.LIVE_EDGE_OFFSET);
  }
  set liveEdgeOffset(value) {
    setNumericAttr(this, media_controller_Attributes.LIVE_EDGE_OFFSET, value);
  }
  get noAutoSeekToLive() {
    return getBooleanAttr(this, media_controller_Attributes.NO_AUTO_SEEK_TO_LIVE);
  }
  set noAutoSeekToLive(value) {
    setBooleanAttr(this, media_controller_Attributes.NO_AUTO_SEEK_TO_LIVE, value);
  }
  get noVolumePref() {
    return getBooleanAttr(this, media_controller_Attributes.NO_VOLUME_PREF);
  }
  set noVolumePref(value) {
    setBooleanAttr(this, media_controller_Attributes.NO_VOLUME_PREF, value);
  }
  get noMutedPref() {
    return getBooleanAttr(this, media_controller_Attributes.NO_MUTED_PREF);
  }
  set noMutedPref(value) {
    setBooleanAttr(this, media_controller_Attributes.NO_MUTED_PREF, value);
  }
  get noSubtitlesLangPref() {
    return getBooleanAttr(this, media_controller_Attributes.NO_SUBTITLES_LANG_PREF);
  }
  set noSubtitlesLangPref(value) {
    setBooleanAttr(this, media_controller_Attributes.NO_SUBTITLES_LANG_PREF, value);
  }
  get noDefaultStore() {
    return getBooleanAttr(this, media_controller_Attributes.NO_DEFAULT_STORE);
  }
  set noDefaultStore(value) {
    setBooleanAttr(this, media_controller_Attributes.NO_DEFAULT_STORE, value);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === media_controller_Attributes.NO_HOTKEYS) {
      if (newValue !== oldValue && newValue === "") {
        if (this.hasAttribute(media_controller_Attributes.HOTKEYS)) {
          console.warn(
            "Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."
          );
        }
        this.disableHotkeys();
      } else if (newValue !== oldValue && newValue === null) {
        this.enableHotkeys();
      }
    } else if (attrName === media_controller_Attributes.HOTKEYS) {
      media_controller_privateGet(this, _hotKeys).value = newValue;
    } else if (attrName === media_controller_Attributes.DEFAULT_SUBTITLES && newValue !== oldValue) {
      (_a = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _a.dispatch({
        type: "optionschangerequest",
        detail: {
          defaultSubtitles: this.hasAttribute(media_controller_Attributes.DEFAULT_SUBTITLES)
        }
      });
    } else if (attrName === media_controller_Attributes.DEFAULT_STREAM_TYPE) {
      (_c = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _c.dispatch({
        type: "optionschangerequest",
        detail: {
          defaultStreamType: (_b = this.getAttribute(media_controller_Attributes.DEFAULT_STREAM_TYPE)) != null ? _b : void 0
        }
      });
    } else if (attrName === media_controller_Attributes.LIVE_EDGE_OFFSET) {
      (_d = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _d.dispatch({
        type: "optionschangerequest",
        detail: {
          liveEdgeOffset: this.hasAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) ? +this.getAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) : void 0,
          seekToLiveOffset: !this.hasAttribute(media_controller_Attributes.SEEK_TO_LIVE_OFFSET) ? +this.getAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) : void 0
        }
      });
    } else if (attrName === media_controller_Attributes.SEEK_TO_LIVE_OFFSET) {
      (_e = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _e.dispatch({
        type: "optionschangerequest",
        detail: {
          seekToLiveOffset: this.hasAttribute(media_controller_Attributes.SEEK_TO_LIVE_OFFSET) ? +this.getAttribute(media_controller_Attributes.SEEK_TO_LIVE_OFFSET) : void 0
        }
      });
    } else if (attrName === media_controller_Attributes.NO_AUTO_SEEK_TO_LIVE) {
      (_f = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _f.dispatch({
        type: "optionschangerequest",
        detail: {
          noAutoSeekToLive: this.hasAttribute(media_controller_Attributes.NO_AUTO_SEEK_TO_LIVE)
        }
      });
    } else if (attrName === media_controller_Attributes.FULLSCREEN_ELEMENT) {
      const el = newValue ? (_g = this.getRootNode()) == null ? void 0 : _g.getElementById(newValue) : void 0;
      media_controller_privateSet(this, _fullscreenElement, el);
      (_h = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _h.dispatch({
        type: "fullscreenelementchangerequest",
        detail: this.fullscreenElement
      });
    } else if (attrName === media_controller_Attributes.LANG && newValue !== oldValue) {
      setLanguage(newValue);
      (_i = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _i.dispatch({
        type: "optionschangerequest",
        detail: {
          mediaLang: newValue
        }
      });
    } else if (attrName === media_controller_Attributes.NO_VOLUME_PREF && newValue !== oldValue) {
      (_j = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _j.dispatch({
        type: "optionschangerequest",
        detail: {
          noVolumePref: this.hasAttribute(media_controller_Attributes.NO_VOLUME_PREF)
        }
      });
    } else if (attrName === media_controller_Attributes.NO_MUTED_PREF && newValue !== oldValue) {
      (_k = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _k.dispatch({
        type: "optionschangerequest",
        detail: {
          noMutedPref: this.hasAttribute(media_controller_Attributes.NO_MUTED_PREF)
        }
      });
    }
  }
  connectedCallback() {
    var _a, _b;
    if (!media_controller_privateGet(this, _mediaStore) && !this.hasAttribute(media_controller_Attributes.NO_DEFAULT_STORE)) {
      media_controller_privateMethod(this, _setupDefaultStore, setupDefaultStore_fn).call(this);
    }
    (_a = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _a.dispatch({
      type: "documentelementchangerequest",
      detail: server_safe_globals_Document
    });
    super.connectedCallback();
    if (media_controller_privateGet(this, _mediaStore) && !media_controller_privateGet(this, _mediaStoreUnsubscribe)) {
      media_controller_privateSet(this, _mediaStoreUnsubscribe, (_b = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _b.subscribe(
        media_controller_privateGet(this, _mediaStateCallback)
      ));
    }
    this.hasAttribute(media_controller_Attributes.NO_HOTKEYS) ? this.disableHotkeys() : this.enableHotkeys();
  }
  disconnectedCallback() {
    var _a, _b, _c, _d;
    (_a = super.disconnectedCallback) == null ? void 0 : _a.call(this);
    if (media_controller_privateGet(this, _mediaStore)) {
      (_b = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _b.dispatch({
        type: "documentelementchangerequest",
        detail: void 0
      });
      (_c = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _c.dispatch({
        type: MediaUIEvents.MEDIA_TOGGLE_SUBTITLES_REQUEST,
        detail: false
      });
    }
    if (media_controller_privateGet(this, _mediaStoreUnsubscribe)) {
      (_d = media_controller_privateGet(this, _mediaStoreUnsubscribe)) == null ? void 0 : _d.call(this);
      media_controller_privateSet(this, _mediaStoreUnsubscribe, void 0);
    }
  }
  /**
   * @override
   * @param {HTMLMediaElement} media
   */
  mediaSetCallback(media) {
    var _a;
    super.mediaSetCallback(media);
    (_a = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _a.dispatch({
      type: "mediaelementchangerequest",
      detail: media
    });
    if (!media.hasAttribute("tabindex")) {
      media.tabIndex = -1;
    }
  }
  /**
   * @override
   * @param {HTMLMediaElement} media
   */
  mediaUnsetCallback(media) {
    var _a;
    super.mediaUnsetCallback(media);
    (_a = media_controller_privateGet(this, _mediaStore)) == null ? void 0 : _a.dispatch({
      type: "mediaelementchangerequest",
      detail: void 0
    });
  }
  propagateMediaState(stateName, state) {
    propagateMediaState(this.mediaStateReceivers, stateName, state);
  }
  associateElement(element) {
    if (!element)
      return;
    const { associatedElementSubscriptions } = this;
    if (associatedElementSubscriptions.has(element))
      return;
    const registerMediaStateReceiver = this.registerMediaStateReceiver.bind(this);
    const unregisterMediaStateReceiver = this.unregisterMediaStateReceiver.bind(this);
    const unsubscribe = monitorForMediaStateReceivers(
      element,
      registerMediaStateReceiver,
      unregisterMediaStateReceiver
    );
    Object.values(MediaUIEvents).forEach((eventName) => {
      element.addEventListener(eventName, media_controller_privateGet(this, _mediaStateEventHandler));
    });
    associatedElementSubscriptions.set(element, unsubscribe);
  }
  unassociateElement(element) {
    if (!element)
      return;
    const { associatedElementSubscriptions } = this;
    if (!associatedElementSubscriptions.has(element))
      return;
    const unsubscribe = associatedElementSubscriptions.get(element);
    unsubscribe();
    associatedElementSubscriptions.delete(element);
    Object.values(MediaUIEvents).forEach((eventName) => {
      element.removeEventListener(eventName, media_controller_privateGet(this, _mediaStateEventHandler));
    });
  }
  registerMediaStateReceiver(el) {
    if (!el)
      return;
    const els = this.mediaStateReceivers;
    const index = els.indexOf(el);
    if (index > -1)
      return;
    els.push(el);
    if (media_controller_privateGet(this, _mediaStore)) {
      Object.entries(media_controller_privateGet(this, _mediaStore).getState()).forEach(
        ([stateName, stateValue]) => {
          propagateMediaState([el], stateName, stateValue);
        }
      );
    }
  }
  unregisterMediaStateReceiver(el) {
    const els = this.mediaStateReceivers;
    const index = els.indexOf(el);
    if (index < 0)
      return;
    els.splice(index, 1);
  }
  enableHotkeys() {
    this.addEventListener("keydown", media_controller_privateMethod(this, _keyDownHandler, keyDownHandler_fn));
  }
  disableHotkeys() {
    this.removeEventListener("keydown", media_controller_privateMethod(this, _keyDownHandler, keyDownHandler_fn));
    this.removeEventListener("keyup", media_controller_privateMethod(this, _keyUpHandler, keyUpHandler_fn));
  }
  get hotkeys() {
    return getStringAttr(this, media_controller_Attributes.HOTKEYS);
  }
  set hotkeys(value) {
    setStringAttr(this, media_controller_Attributes.HOTKEYS, value);
  }
  keyboardShortcutHandler(e) {
    var _a, _b, _c, _d, _e, _f, _g;
    const target = e.target;
    const keysUsed = ((_c = (_b = (_a = target.getAttribute(media_controller_Attributes.KEYS_USED)) == null ? void 0 : _a.split(" ")) != null ? _b : target == null ? void 0 : target.keysUsed) != null ? _c : []).map((key) => key === "Space" ? " " : key).filter(Boolean);
    if (keysUsed.includes(e.key)) {
      return;
    }
    let eventName, detail, evt;
    if (media_controller_privateGet(this, _hotKeys).contains(`no${e.key.toLowerCase()}`))
      return;
    if (e.key === " " && media_controller_privateGet(this, _hotKeys).contains(`nospace`))
      return;
    switch (e.key) {
      case " ":
      case "k":
        eventName = media_controller_privateGet(this, _mediaStore).getState().mediaPaused ? MediaUIEvents.MEDIA_PLAY_REQUEST : MediaUIEvents.MEDIA_PAUSE_REQUEST;
        this.dispatchEvent(
          new GlobalThis.CustomEvent(eventName, {
            composed: true,
            bubbles: true
          })
        );
        break;
      case "m":
        eventName = this.mediaStore.getState().mediaVolumeLevel === "off" ? MediaUIEvents.MEDIA_UNMUTE_REQUEST : MediaUIEvents.MEDIA_MUTE_REQUEST;
        this.dispatchEvent(
          new GlobalThis.CustomEvent(eventName, {
            composed: true,
            bubbles: true
          })
        );
        break;
      case "f":
        eventName = this.mediaStore.getState().mediaIsFullscreen ? MediaUIEvents.MEDIA_EXIT_FULLSCREEN_REQUEST : MediaUIEvents.MEDIA_ENTER_FULLSCREEN_REQUEST;
        this.dispatchEvent(
          new GlobalThis.CustomEvent(eventName, {
            composed: true,
            bubbles: true
          })
        );
        break;
      case "c":
        this.dispatchEvent(
          new GlobalThis.CustomEvent(
            MediaUIEvents.MEDIA_TOGGLE_SUBTITLES_REQUEST,
            { composed: true, bubbles: true }
          )
        );
        break;
      case "ArrowLeft": {
        const offsetValue = this.hasAttribute(
          media_controller_Attributes.KEYBOARD_BACKWARD_SEEK_OFFSET
        ) ? +this.getAttribute(media_controller_Attributes.KEYBOARD_BACKWARD_SEEK_OFFSET) : DEFAULT_SEEK_OFFSET;
        detail = Math.max(
          ((_d = this.mediaStore.getState().mediaCurrentTime) != null ? _d : 0) - offsetValue,
          0
        );
        evt = new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
          composed: true,
          bubbles: true,
          detail
        });
        this.dispatchEvent(evt);
        break;
      }
      case "ArrowRight": {
        const offsetValue = this.hasAttribute(
          media_controller_Attributes.KEYBOARD_FORWARD_SEEK_OFFSET
        ) ? +this.getAttribute(media_controller_Attributes.KEYBOARD_FORWARD_SEEK_OFFSET) : DEFAULT_SEEK_OFFSET;
        detail = Math.max(
          ((_e = this.mediaStore.getState().mediaCurrentTime) != null ? _e : 0) + offsetValue,
          0
        );
        evt = new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
          composed: true,
          bubbles: true,
          detail
        });
        this.dispatchEvent(evt);
        break;
      }
      case "ArrowUp": {
        const step = this.hasAttribute(media_controller_Attributes.KEYBOARD_UP_VOLUME_STEP) ? +this.getAttribute(media_controller_Attributes.KEYBOARD_UP_VOLUME_STEP) : DEFAULT_VOLUME_STEP;
        detail = Math.min(
          ((_f = this.mediaStore.getState().mediaVolume) != null ? _f : 1) + step,
          1
        );
        evt = new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_VOLUME_REQUEST, {
          composed: true,
          bubbles: true,
          detail
        });
        this.dispatchEvent(evt);
        break;
      }
      case "ArrowDown": {
        const step = this.hasAttribute(media_controller_Attributes.KEYBOARD_DOWN_VOLUME_STEP) ? +this.getAttribute(media_controller_Attributes.KEYBOARD_DOWN_VOLUME_STEP) : DEFAULT_VOLUME_STEP;
        detail = Math.max(
          ((_g = this.mediaStore.getState().mediaVolume) != null ? _g : 1) - step,
          0
        );
        evt = new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_VOLUME_REQUEST, {
          composed: true,
          bubbles: true,
          detail
        });
        this.dispatchEvent(evt);
        break;
      }
      default:
        break;
    }
  }
}
_hotKeys = new WeakMap();
_fullscreenElement = new WeakMap();
_mediaStore = new WeakMap();
_mediaStateCallback = new WeakMap();
_mediaStoreUnsubscribe = new WeakMap();
_mediaStateEventHandler = new WeakMap();
_setupDefaultStore = new WeakSet();
setupDefaultStore_fn = function() {
  var _a;
  this.mediaStore = createMediaStore({
    media: this.media,
    fullscreenElement: this.fullscreenElement,
    options: {
      defaultSubtitles: this.hasAttribute(media_controller_Attributes.DEFAULT_SUBTITLES),
      defaultDuration: this.hasAttribute(media_controller_Attributes.DEFAULT_DURATION) ? +this.getAttribute(media_controller_Attributes.DEFAULT_DURATION) : void 0,
      defaultStreamType: (
        /** @type {import('./media-store/state-mediator.js').StreamTypeValue} */
        (_a = this.getAttribute(
          media_controller_Attributes.DEFAULT_STREAM_TYPE
        )) != null ? _a : void 0
      ),
      liveEdgeOffset: this.hasAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) ? +this.getAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) : void 0,
      seekToLiveOffset: this.hasAttribute(media_controller_Attributes.SEEK_TO_LIVE_OFFSET) ? +this.getAttribute(media_controller_Attributes.SEEK_TO_LIVE_OFFSET) : this.hasAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) ? +this.getAttribute(media_controller_Attributes.LIVE_EDGE_OFFSET) : void 0,
      noAutoSeekToLive: this.hasAttribute(media_controller_Attributes.NO_AUTO_SEEK_TO_LIVE),
      // NOTE: This wasn't updated if it was changed later. Should it be? (CJP)
      noVolumePref: this.hasAttribute(media_controller_Attributes.NO_VOLUME_PREF),
      noMutedPref: this.hasAttribute(media_controller_Attributes.NO_MUTED_PREF),
      noSubtitlesLangPref: this.hasAttribute(
        media_controller_Attributes.NO_SUBTITLES_LANG_PREF
      )
    }
  });
};
_keyUpHandler = new WeakSet();
keyUpHandler_fn = function(e) {
  const { key } = e;
  if (!ButtonPressedKeys.includes(key)) {
    this.removeEventListener("keyup", media_controller_privateMethod(this, _keyUpHandler, keyUpHandler_fn));
    return;
  }
  this.keyboardShortcutHandler(e);
};
_keyDownHandler = new WeakSet();
keyDownHandler_fn = function(e) {
  const { metaKey, altKey, key } = e;
  if (metaKey || altKey || !ButtonPressedKeys.includes(key)) {
    this.removeEventListener("keyup", media_controller_privateMethod(this, _keyUpHandler, keyUpHandler_fn));
    return;
  }
  const target = e.target;
  const isRangeInput = target instanceof HTMLElement && (target.tagName.toLowerCase() === "media-volume-range" || target.tagName.toLowerCase() === "media-time-range");
  if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key) && !(media_controller_privateGet(this, _hotKeys).contains(`no${key.toLowerCase()}`) || key === " " && media_controller_privateGet(this, _hotKeys).contains("nospace")) && !isRangeInput) {
    e.preventDefault();
  }
  this.addEventListener("keyup", media_controller_privateMethod(this, _keyUpHandler, keyUpHandler_fn), { once: true });
};
const media_controller_MEDIA_UI_ATTRIBUTE_NAMES = Object.values(MediaUIAttributes);
const MEDIA_UI_PROP_NAMES = Object.values(MediaUIProps);
const getMediaUIAttributesFrom = (child) => {
  var _a, _b, _c, _d;
  let { observedAttributes } = child.constructor;
  if (!observedAttributes && ((_a = child.nodeName) == null ? void 0 : _a.includes("-"))) {
    GlobalThis.customElements.upgrade(child);
    ({ observedAttributes } = child.constructor);
  }
  const mediaChromeAttributesList = (_d = (_c = (_b = child == null ? void 0 : child.getAttribute) == null ? void 0 : _b.call(child, MediaStateReceiverAttributes.MEDIA_CHROME_ATTRIBUTES)) == null ? void 0 : _c.split) == null ? void 0 : _d.call(_c, /\s+/);
  if (!Array.isArray(observedAttributes || mediaChromeAttributesList))
    return [];
  return (observedAttributes || mediaChromeAttributesList).filter(
    (attrName) => media_controller_MEDIA_UI_ATTRIBUTE_NAMES.includes(attrName)
  );
};
const hasMediaUIProps = (mediaStateReceiverCandidate) => {
  var _a, _b;
  if (((_a = mediaStateReceiverCandidate.nodeName) == null ? void 0 : _a.includes("-")) && !!GlobalThis.customElements.get(
    (_b = mediaStateReceiverCandidate.nodeName) == null ? void 0 : _b.toLowerCase()
  ) && !(mediaStateReceiverCandidate instanceof GlobalThis.customElements.get(
    mediaStateReceiverCandidate.nodeName.toLowerCase()
  ))) {
    GlobalThis.customElements.upgrade(mediaStateReceiverCandidate);
  }
  return MEDIA_UI_PROP_NAMES.some(
    (propName) => propName in mediaStateReceiverCandidate
  );
};
const isMediaStateReceiver = (child) => {
  return hasMediaUIProps(child) || !!getMediaUIAttributesFrom(child).length;
};
const serializeTuple = (tuple) => {
  var _a;
  return (_a = tuple == null ? void 0 : tuple.join) == null ? void 0 : _a.call(tuple, ":");
};
const CustomAttrSerializer = {
  [MediaUIAttributes.MEDIA_SUBTITLES_LIST]: stringifyTextTrackList,
  [MediaUIAttributes.MEDIA_SUBTITLES_SHOWING]: stringifyTextTrackList,
  [MediaUIAttributes.MEDIA_SEEKABLE]: serializeTuple,
  [MediaUIAttributes.MEDIA_BUFFERED]: (tuples) => tuples == null ? void 0 : tuples.map(serializeTuple).join(" "),
  [MediaUIAttributes.MEDIA_PREVIEW_COORDS]: (coords) => coords == null ? void 0 : coords.join(" "),
  [MediaUIAttributes.MEDIA_RENDITION_LIST]: stringifyRenditionList,
  [MediaUIAttributes.MEDIA_AUDIO_TRACK_LIST]: stringifyAudioTrackList
};
const setAttr = async (child, attrName, attrValue) => {
  var _a, _b;
  if (!child.isConnected) {
    await delay(0);
  }
  if (typeof attrValue === "boolean" || attrValue == null) {
    return setBooleanAttr(child, attrName, attrValue);
  }
  if (typeof attrValue === "number") {
    return setNumericAttr(child, attrName, attrValue);
  }
  if (typeof attrValue === "string") {
    return setStringAttr(child, attrName, attrValue);
  }
  if (Array.isArray(attrValue) && !attrValue.length) {
    return child.removeAttribute(attrName);
  }
  const val = (_b = (_a = CustomAttrSerializer[attrName]) == null ? void 0 : _a.call(CustomAttrSerializer, attrValue)) != null ? _b : attrValue;
  return child.setAttribute(attrName, val);
};
const isMediaSlotElementDescendant = (el) => {
  var _a;
  return !!((_a = el.closest) == null ? void 0 : _a.call(el, '*[slot="media"]'));
};
const traverseForMediaStateReceivers = (rootNode, mediaStateReceiverCallback) => {
  if (isMediaSlotElementDescendant(rootNode)) {
    return;
  }
  const traverseForMediaStateReceiversSync = (rootNode2, mediaStateReceiverCallback2) => {
    var _a, _b;
    if (isMediaStateReceiver(rootNode2)) {
      mediaStateReceiverCallback2(rootNode2);
    }
    const { children = [] } = rootNode2 != null ? rootNode2 : {};
    const shadowChildren = (_b = (_a = rootNode2 == null ? void 0 : rootNode2.shadowRoot) == null ? void 0 : _a.children) != null ? _b : [];
    const allChildren = [...children, ...shadowChildren];
    allChildren.forEach(
      (child) => traverseForMediaStateReceivers(
        child,
        mediaStateReceiverCallback2
      )
    );
  };
  const name = rootNode == null ? void 0 : rootNode.nodeName.toLowerCase();
  if (name.includes("-") && !isMediaStateReceiver(rootNode)) {
    GlobalThis.customElements.whenDefined(name).then(() => {
      traverseForMediaStateReceiversSync(rootNode, mediaStateReceiverCallback);
    });
    return;
  }
  traverseForMediaStateReceiversSync(rootNode, mediaStateReceiverCallback);
};
const propagateMediaState = (els, stateName, val) => {
  els.forEach((el) => {
    if (stateName in el) {
      el[stateName] = val;
      return;
    }
    const relevantAttrs = getMediaUIAttributesFrom(el);
    const attrName = stateName.toLowerCase();
    if (!relevantAttrs.includes(attrName))
      return;
    setAttr(el, attrName, val);
  });
};
const monitorForMediaStateReceivers = (rootNode, registerMediaStateReceiver, unregisterMediaStateReceiver) => {
  traverseForMediaStateReceivers(rootNode, registerMediaStateReceiver);
  const registerMediaStateReceiverHandler = (evt) => {
    var _a;
    const el = (_a = evt == null ? void 0 : evt.composedPath()[0]) != null ? _a : evt.target;
    registerMediaStateReceiver(el);
  };
  const unregisterMediaStateReceiverHandler = (evt) => {
    var _a;
    const el = (_a = evt == null ? void 0 : evt.composedPath()[0]) != null ? _a : evt.target;
    unregisterMediaStateReceiver(el);
  };
  rootNode.addEventListener(
    MediaUIEvents.REGISTER_MEDIA_STATE_RECEIVER,
    registerMediaStateReceiverHandler
  );
  rootNode.addEventListener(
    MediaUIEvents.UNREGISTER_MEDIA_STATE_RECEIVER,
    unregisterMediaStateReceiverHandler
  );
  const mutationCallback = (mutationsList) => {
    mutationsList.forEach((mutationRecord) => {
      const {
        addedNodes = [],
        removedNodes = [],
        type,
        target,
        attributeName
      } = mutationRecord;
      if (type === "childList") {
        Array.prototype.forEach.call(
          addedNodes,
          (node) => traverseForMediaStateReceivers(
            node,
            registerMediaStateReceiver
          )
        );
        Array.prototype.forEach.call(
          removedNodes,
          (node) => traverseForMediaStateReceivers(
            node,
            unregisterMediaStateReceiver
          )
        );
      } else if (type === "attributes" && attributeName === MediaStateReceiverAttributes.MEDIA_CHROME_ATTRIBUTES) {
        if (isMediaStateReceiver(target)) {
          registerMediaStateReceiver(target);
        } else {
          unregisterMediaStateReceiver(target);
        }
      }
    });
  };
  let prevSlotted = [];
  const slotChangeHandler = (event) => {
    const slotEl = event.target;
    if (slotEl.name === "media")
      return;
    prevSlotted.forEach(
      (node) => traverseForMediaStateReceivers(node, unregisterMediaStateReceiver)
    );
    prevSlotted = [
      ...slotEl.assignedElements({ flatten: true })
    ];
    prevSlotted.forEach(
      (node) => traverseForMediaStateReceivers(node, registerMediaStateReceiver)
    );
  };
  rootNode.addEventListener("slotchange", slotChangeHandler);
  const observer = new MutationObserver(mutationCallback);
  observer.observe(rootNode, {
    childList: true,
    attributes: true,
    subtree: true
  });
  const unsubscribe = () => {
    traverseForMediaStateReceivers(rootNode, unregisterMediaStateReceiver);
    rootNode.removeEventListener("slotchange", slotChangeHandler);
    observer.disconnect();
    rootNode.removeEventListener(
      MediaUIEvents.REGISTER_MEDIA_STATE_RECEIVER,
      registerMediaStateReceiverHandler
    );
    rootNode.removeEventListener(
      MediaUIEvents.UNREGISTER_MEDIA_STATE_RECEIVER,
      unregisterMediaStateReceiverHandler
    );
  };
  return unsubscribe;
};
if (!GlobalThis.customElements.get("media-controller")) {
  GlobalThis.customElements.define("media-controller", MediaController);
}
var media_controller_default = MediaController;


;// ../node_modules/media-chrome/dist/media-tooltip.js


const media_tooltip_Attributes = {
  PLACEMENT: "placement",
  BOUNDS: "bounds"
};
function media_tooltip_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `
  );
}
class MediaTooltip extends GlobalThis.HTMLElement {
  constructor() {
    super();
    // Adjusts tooltip position relative to the closest specified container
    // such that it doesn't spill out of the left or right sides. Only applies
    // to 'top' and 'bottom' placed tooltips.
    this.updateXOffset = () => {
      var _a;
      if (!isElementVisible(this, { checkOpacity: false, checkVisibilityCSS: false }))
        return;
      const placement = this.placement;
      if (placement === "left" || placement === "right") {
        this.style.removeProperty("--media-tooltip-offset-x");
        return;
      }
      const tooltipStyle = getComputedStyle(this);
      const containingEl = (_a = closestComposedNode(this, "#" + this.bounds)) != null ? _a : getMediaController(this);
      if (!containingEl)
        return;
      const { x: containerX, width: containerWidth } = containingEl.getBoundingClientRect();
      const { x: tooltipX, width: tooltipWidth } = this.getBoundingClientRect();
      const tooltipRight = tooltipX + tooltipWidth;
      const containerRight = containerX + containerWidth;
      const offsetXVal = tooltipStyle.getPropertyValue(
        "--media-tooltip-offset-x"
      );
      const currOffsetX = offsetXVal ? parseFloat(offsetXVal.replace("px", "")) : 0;
      const marginVal = tooltipStyle.getPropertyValue(
        "--media-tooltip-container-margin"
      );
      const currMargin = marginVal ? parseFloat(marginVal.replace("px", "")) : 0;
      const leftDiff = tooltipX - containerX + currOffsetX - currMargin;
      const rightDiff = tooltipRight - containerRight + currOffsetX + currMargin;
      if (leftDiff < 0) {
        this.style.setProperty("--media-tooltip-offset-x", `${leftDiff}px`);
        return;
      }
      if (rightDiff > 0) {
        this.style.setProperty("--media-tooltip-offset-x", `${rightDiff}px`);
        return;
      }
      this.style.removeProperty("--media-tooltip-offset-x");
    };
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
    this.arrowEl = this.shadowRoot.querySelector("#arrow");
    if (Object.prototype.hasOwnProperty.call(this, "placement")) {
      const placement = this.placement;
      delete this.placement;
      this.placement = placement;
    }
  }
  static get observedAttributes() {
    return [media_tooltip_Attributes.PLACEMENT, media_tooltip_Attributes.BOUNDS];
  }
  /**
   * Get or set tooltip placement
   */
  get placement() {
    return getStringAttr(this, media_tooltip_Attributes.PLACEMENT);
  }
  set placement(value) {
    setStringAttr(this, media_tooltip_Attributes.PLACEMENT, value);
  }
  /**
   * Get or set tooltip container ID selector that will constrain the tooltips
   * horizontal position.
   */
  get bounds() {
    return getStringAttr(this, media_tooltip_Attributes.BOUNDS);
  }
  set bounds(value) {
    setStringAttr(this, media_tooltip_Attributes.BOUNDS, value);
  }
}
MediaTooltip.shadowRootOptions = { mode: "open" };
MediaTooltip.getTemplateHTML = media_tooltip_getTemplateHTML;
if (!GlobalThis.customElements.get("media-tooltip")) {
  GlobalThis.customElements.define("media-tooltip", MediaTooltip);
}
var media_tooltip_default = MediaTooltip;


;// ../node_modules/media-chrome/dist/media-chrome-button.js
var media_chrome_button_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_chrome_button_privateGet = (obj, member, getter) => {
  media_chrome_button_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_chrome_button_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_chrome_button_privateSet = (obj, member, value, setter) => {
  media_chrome_button_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_chrome_button_privateMethod = (obj, member, method) => {
  media_chrome_button_accessCheck(obj, member, "access private method");
  return method;
};
var media_chrome_button_mediaController, _clickListener, _positionTooltip, _keyupListener, _keydownListener, _setupTooltip, setupTooltip_fn;




const media_chrome_button_Attributes = {
  TOOLTIP_PLACEMENT: "tooltipplacement",
  DISABLED: "disabled",
  NO_TOOLTIP: "notooltip"
};
function media_chrome_button_getTemplateHTML(_attrs, _props = {}) {
  return (
    /*html*/
    `
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      ${/*
      Only show outline when keyboard focusing.
      https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
    */
    ""}
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }
      ${/*
    * hide default focus ring, particularly when using mouse
    */
    ""}
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        ${/** Make sure unpositioned tooltip doesn't cause page overflow (scroll). */
    ""}
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(_attrs, _props)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${media_tooltip_default.shadowRootOptions.mode}">
          ${media_tooltip_default.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(_attrs)}
        </slot>
      </media-tooltip>
    </slot>
  `
  );
}
function getSlotTemplateHTML(_attrs, _props) {
  return (
    /*html*/
    `
    <slot></slot>
  `
  );
}
function getTooltipContentHTML() {
  return "";
}
class MediaChromeButton extends GlobalThis.HTMLElement {
  constructor() {
    super();
    // Called when we know the tooltip is ready / defined
    media_chrome_button_privateAdd(this, _setupTooltip);
    media_chrome_button_privateAdd(this, media_chrome_button_mediaController, void 0);
    this.preventClick = false;
    this.tooltipEl = null;
    media_chrome_button_privateAdd(this, _clickListener, (e) => {
      if (!this.preventClick) {
        this.handleClick(e);
      }
      setTimeout(media_chrome_button_privateGet(this, _positionTooltip), 0);
    });
    media_chrome_button_privateAdd(this, _positionTooltip, () => {
      var _a, _b;
      (_b = (_a = this.tooltipEl) == null ? void 0 : _a.updateXOffset) == null ? void 0 : _b.call(_a);
    });
    // NOTE: There are definitely some "false positive" cases with multi-key pressing,
    // but this should be good enough for most use cases.
    media_chrome_button_privateAdd(this, _keyupListener, (e) => {
      const { key } = e;
      if (!this.keysUsed.includes(key)) {
        this.removeEventListener("keyup", media_chrome_button_privateGet(this, _keyupListener));
        return;
      }
      if (!this.preventClick) {
        this.handleClick(e);
      }
    });
    media_chrome_button_privateAdd(this, _keydownListener, (e) => {
      const { metaKey, altKey, key } = e;
      if (metaKey || altKey || !this.keysUsed.includes(key)) {
        this.removeEventListener("keyup", media_chrome_button_privateGet(this, _keyupListener));
        return;
      }
      this.addEventListener("keyup", media_chrome_button_privateGet(this, _keyupListener), { once: true });
    });
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      const html = this.constructor.getTemplateHTML(attrs);
      this.shadowRoot.setHTMLUnsafe ? this.shadowRoot.setHTMLUnsafe(html) : this.shadowRoot.innerHTML = html;
    }
    this.tooltipEl = this.shadowRoot.querySelector("media-tooltip");
  }
  static get observedAttributes() {
    return [
      "disabled",
      media_chrome_button_Attributes.TOOLTIP_PLACEMENT,
      MediaStateReceiverAttributes.MEDIA_CONTROLLER,
      MediaUIAttributes.MEDIA_LANG
    ];
  }
  enable() {
    this.addEventListener("click", media_chrome_button_privateGet(this, _clickListener));
    this.addEventListener("keydown", media_chrome_button_privateGet(this, _keydownListener));
    this.tabIndex = 0;
  }
  disable() {
    this.removeEventListener("click", media_chrome_button_privateGet(this, _clickListener));
    this.removeEventListener("keydown", media_chrome_button_privateGet(this, _keydownListener));
    this.removeEventListener("keyup", media_chrome_button_privateGet(this, _keyupListener));
    this.tabIndex = -1;
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_chrome_button_privateGet(this, media_chrome_button_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_chrome_button_privateSet(this, media_chrome_button_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_chrome_button_privateSet(this, media_chrome_button_mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = media_chrome_button_privateGet(this, media_chrome_button_mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    } else if (attrName === "disabled" && newValue !== oldValue) {
      if (newValue == null) {
        this.enable();
      } else {
        this.disable();
      }
    } else if (attrName === media_chrome_button_Attributes.TOOLTIP_PLACEMENT && this.tooltipEl && newValue !== oldValue) {
      this.tooltipEl.placement = newValue;
    } else if (attrName === MediaUIAttributes.MEDIA_LANG) {
      this.shadowRoot.querySelector('slot[name="tooltip-content"]').innerHTML = this.constructor.getTooltipContentHTML();
    }
    media_chrome_button_privateGet(this, _positionTooltip).call(this);
  }
  connectedCallback() {
    var _a, _b, _c;
    const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
    style.setProperty(
      "display",
      `var(--media-control-display, var(--${this.localName}-display, inline-flex))`
    );
    if (!this.hasAttribute("disabled")) {
      this.enable();
    } else {
      this.disable();
    }
    this.setAttribute("role", "button");
    const mediaControllerId = this.getAttribute(
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    );
    if (mediaControllerId) {
      media_chrome_button_privateSet(
        this,
        media_chrome_button_mediaController,
        // @ts-ignore
        (_a = this.getRootNode()) == null ? void 0 : _a.getElementById(mediaControllerId)
      );
      (_c = (_b = media_chrome_button_privateGet(this, media_chrome_button_mediaController)) == null ? void 0 : _b.associateElement) == null ? void 0 : _c.call(_b, this);
    }
    GlobalThis.customElements.whenDefined("media-tooltip").then(() => media_chrome_button_privateMethod(this, _setupTooltip, setupTooltip_fn).call(this));
  }
  disconnectedCallback() {
    var _a, _b;
    this.disable();
    (_b = (_a = media_chrome_button_privateGet(this, media_chrome_button_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_chrome_button_privateSet(this, media_chrome_button_mediaController, null);
    this.removeEventListener("mouseenter", media_chrome_button_privateGet(this, _positionTooltip));
    this.removeEventListener("focus", media_chrome_button_privateGet(this, _positionTooltip));
    this.removeEventListener("click", media_chrome_button_privateGet(this, _clickListener));
  }
  get keysUsed() {
    return ["Enter", " "];
  }
  /**
   * Get or set tooltip placement
   */
  get tooltipPlacement() {
    return getStringAttr(this, media_chrome_button_Attributes.TOOLTIP_PLACEMENT);
  }
  set tooltipPlacement(value) {
    setStringAttr(this, media_chrome_button_Attributes.TOOLTIP_PLACEMENT, value);
  }
  get mediaController() {
    return getStringAttr(this, MediaStateReceiverAttributes.MEDIA_CONTROLLER);
  }
  set mediaController(value) {
    setStringAttr(this, MediaStateReceiverAttributes.MEDIA_CONTROLLER, value);
  }
  get disabled() {
    return getBooleanAttr(this, media_chrome_button_Attributes.DISABLED);
  }
  set disabled(value) {
    setBooleanAttr(this, media_chrome_button_Attributes.DISABLED, value);
  }
  get noTooltip() {
    return getBooleanAttr(this, media_chrome_button_Attributes.NO_TOOLTIP);
  }
  set noTooltip(value) {
    setBooleanAttr(this, media_chrome_button_Attributes.NO_TOOLTIP, value);
  }
  /**
   * @abstract
   * @argument {Event} e
   */
  handleClick(e) {
  }
  // eslint-disable-line
}
media_chrome_button_mediaController = new WeakMap();
_clickListener = new WeakMap();
_positionTooltip = new WeakMap();
_keyupListener = new WeakMap();
_keydownListener = new WeakMap();
_setupTooltip = new WeakSet();
setupTooltip_fn = function() {
  this.addEventListener("mouseenter", media_chrome_button_privateGet(this, _positionTooltip));
  this.addEventListener("focus", media_chrome_button_privateGet(this, _positionTooltip));
  this.addEventListener("click", media_chrome_button_privateGet(this, _clickListener));
  const initialPlacement = this.tooltipPlacement;
  if (initialPlacement && this.tooltipEl) {
    this.tooltipEl.placement = initialPlacement;
  }
};
MediaChromeButton.shadowRootOptions = { mode: "open" };
MediaChromeButton.getTemplateHTML = media_chrome_button_getTemplateHTML;
MediaChromeButton.getSlotTemplateHTML = getSlotTemplateHTML;
MediaChromeButton.getTooltipContentHTML = getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-chrome-button")) {
  GlobalThis.customElements.define("media-chrome-button", MediaChromeButton);
}
var media_chrome_button_default = (/* unused pure expression or super */ null && (MediaChromeButton));


;// ../node_modules/media-chrome/dist/media-airplay-button.js





const airplayIcon = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`;
function media_airplay_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host([${MediaUIAttributes.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      ${/* Double negative, but safer if display doesn't equal 'block' */
    ""}
      :host(:not([${MediaUIAttributes.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${MediaUIAttributes.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${airplayIcon}</slot>
      <slot name="exit">${airplayIcon}</slot>
    </slot>
  `
  );
}
function media_airplay_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-enter">${t("start airplay")}</slot>
    <slot name="tooltip-exit">${t("stop airplay")}</slot>
  `
  );
}
const updateAriaLabel = (el) => {
  const label = el.mediaIsAirplaying ? t("stop airplay") : t("start airplay");
  el.setAttribute("aria-label", label);
};
class MediaAirplayButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_IS_AIRPLAYING,
      MediaUIAttributes.MEDIA_AIRPLAY_UNAVAILABLE
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_IS_AIRPLAYING) {
      updateAriaLabel(this);
    }
  }
  /**
   * Are we currently airplaying
   */
  get mediaIsAirplaying() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_IS_AIRPLAYING);
  }
  set mediaIsAirplaying(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_IS_AIRPLAYING, value);
  }
  /**
   * Airplay unavailability state
   */
  get mediaAirplayUnavailable() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_AIRPLAY_UNAVAILABLE);
  }
  set mediaAirplayUnavailable(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_AIRPLAY_UNAVAILABLE, value);
  }
  handleClick() {
    const evt = new GlobalThis.CustomEvent(
      MediaUIEvents.MEDIA_AIRPLAY_REQUEST,
      {
        composed: true,
        bubbles: true
      }
    );
    this.dispatchEvent(evt);
  }
}
MediaAirplayButton.getSlotTemplateHTML = media_airplay_button_getSlotTemplateHTML;
MediaAirplayButton.getTooltipContentHTML = media_airplay_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-airplay-button")) {
  GlobalThis.customElements.define("media-airplay-button", MediaAirplayButton);
}
var media_airplay_button_default = (/* unused pure expression or super */ null && (MediaAirplayButton));


;// ../node_modules/media-chrome/dist/media-captions-button.js





const ccIconOn = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`;
const ccIconOff = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;
function media_captions_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      ${/* Double negative, but safer if display doesn't equal 'block' */
    ""}
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${ccIconOn}</slot>
      <slot name="off">${ccIconOff}</slot>
    </slot>
  `
  );
}
function media_captions_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-enable">${t("Enable captions")}</slot>
    <slot name="tooltip-disable">${t("Disable captions")}</slot>
  `
  );
}
const updateAriaChecked = (el) => {
  el.setAttribute("aria-checked", areSubsOn(el).toString());
};
class MediaCaptionsButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_SUBTITLES_LIST,
      MediaUIAttributes.MEDIA_SUBTITLES_SHOWING
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "switch");
    this.setAttribute("aria-label", t("closed captions"));
    updateAriaChecked(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_SUBTITLES_SHOWING) {
      updateAriaChecked(this);
    }
  }
  /**
   * An array of TextTrack-like objects.
   * Objects must have the properties: kind, language, and label.
   */
  get mediaSubtitlesList() {
    return getSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_LIST);
  }
  set mediaSubtitlesList(list) {
    setSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_LIST, list);
  }
  /**
   * An array of TextTrack-like objects.
   * Objects must have the properties: kind, language, and label.
   */
  get mediaSubtitlesShowing() {
    return getSubtitlesListAttr(
      this,
      MediaUIAttributes.MEDIA_SUBTITLES_SHOWING
    );
  }
  set mediaSubtitlesShowing(list) {
    setSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_SHOWING, list);
  }
  handleClick() {
    this.dispatchEvent(
      new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_TOGGLE_SUBTITLES_REQUEST, {
        composed: true,
        bubbles: true
      })
    );
  }
}
MediaCaptionsButton.getSlotTemplateHTML = media_captions_button_getSlotTemplateHTML;
MediaCaptionsButton.getTooltipContentHTML = media_captions_button_getTooltipContentHTML;
const getSubtitlesListAttr = (el, attrName) => {
  const attrVal = el.getAttribute(attrName);
  return attrVal ? parseTextTracksStr(attrVal) : [];
};
const setSubtitlesListAttr = (el, attrName, list) => {
  if (!(list == null ? void 0 : list.length)) {
    el.removeAttribute(attrName);
    return;
  }
  const newValStr = stringifyTextTrackList(list);
  const oldVal = el.getAttribute(attrName);
  if (oldVal === newValStr)
    return;
  el.setAttribute(attrName, newValStr);
};
if (!GlobalThis.customElements.get("media-captions-button")) {
  GlobalThis.customElements.define(
    "media-captions-button",
    MediaCaptionsButton
  );
}
var media_captions_button_default = (/* unused pure expression or super */ null && (MediaCaptionsButton));


;// ../node_modules/media-chrome/dist/media-cast-button.js





const enterIcon = `<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg>`;
const exitIcon = `<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg>`;
function media_cast_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host([${MediaUIAttributes.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      ${/* Double negative, but safer if display doesn't equal 'block' */
    ""}
      :host(:not([${MediaUIAttributes.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${MediaUIAttributes.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${enterIcon}</slot>
      <slot name="exit">${exitIcon}</slot>
    </slot>
  `
  );
}
function media_cast_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-enter">${t("Start casting")}</slot>
    <slot name="tooltip-exit">${t("Stop casting")}</slot>
  `
  );
}
const media_cast_button_updateAriaLabel = (el) => {
  const label = el.mediaIsCasting ? t("stop casting") : t("start casting");
  el.setAttribute("aria-label", label);
};
class MediaCastButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_IS_CASTING,
      MediaUIAttributes.MEDIA_CAST_UNAVAILABLE
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    media_cast_button_updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_IS_CASTING) {
      media_cast_button_updateAriaLabel(this);
    }
  }
  /**
   * @type {boolean} Are we currently casting
   */
  get mediaIsCasting() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_IS_CASTING);
  }
  set mediaIsCasting(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_IS_CASTING, value);
  }
  /**
   * @type {string | undefined} Cast unavailability state
   */
  get mediaCastUnavailable() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_CAST_UNAVAILABLE);
  }
  set mediaCastUnavailable(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_CAST_UNAVAILABLE, value);
  }
  handleClick() {
    const eventName = this.mediaIsCasting ? MediaUIEvents.MEDIA_EXIT_CAST_REQUEST : MediaUIEvents.MEDIA_ENTER_CAST_REQUEST;
    this.dispatchEvent(
      new GlobalThis.CustomEvent(eventName, { composed: true, bubbles: true })
    );
  }
}
MediaCastButton.getSlotTemplateHTML = media_cast_button_getSlotTemplateHTML;
MediaCastButton.getTooltipContentHTML = media_cast_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-cast-button")) {
  GlobalThis.customElements.define("media-cast-button", MediaCastButton);
}
var media_cast_button_default = (/* unused pure expression or super */ null && (MediaCastButton));


;// ../node_modules/media-chrome/dist/media-chrome-dialog.js
var media_chrome_dialog_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_chrome_dialog_privateGet = (obj, member, getter) => {
  media_chrome_dialog_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_chrome_dialog_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_chrome_dialog_privateSet = (obj, member, value, setter) => {
  media_chrome_dialog_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_chrome_dialog_privateMethod = (obj, member, method) => {
  media_chrome_dialog_accessCheck(obj, member, "access private method");
  return method;
};
var _isInit, _previouslyFocused, _invokerElement, _init, init_fn, _handleOpen, handleOpen_fn, _handleClosed, handleClosed_fn, _handleInvoke, handleInvoke_fn, _handleFocusOut, handleFocusOut_fn, _handleKeyDown, handleKeyDown_fn;


function media_chrome_dialog_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        ${/** The hide transition is defined below after a short delay. */
    ""}
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(_attrs)}
  `
  );
}
function media_chrome_dialog_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <slot id="content"></slot>
  `
  );
}
const media_chrome_dialog_Attributes = {
  OPEN: "open",
  ANCHOR: "anchor"
};
class MediaChromeDialog extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_chrome_dialog_privateAdd(this, _init);
    media_chrome_dialog_privateAdd(this, _handleOpen);
    media_chrome_dialog_privateAdd(this, _handleClosed);
    media_chrome_dialog_privateAdd(this, _handleInvoke);
    media_chrome_dialog_privateAdd(this, _handleFocusOut);
    media_chrome_dialog_privateAdd(this, _handleKeyDown);
    media_chrome_dialog_privateAdd(this, _isInit, false);
    media_chrome_dialog_privateAdd(this, _previouslyFocused, null);
    media_chrome_dialog_privateAdd(this, _invokerElement, null);
    this.addEventListener("invoke", this);
    this.addEventListener("focusout", this);
    this.addEventListener("keydown", this);
  }
  static get observedAttributes() {
    return [media_chrome_dialog_Attributes.OPEN, media_chrome_dialog_Attributes.ANCHOR];
  }
  get open() {
    return getBooleanAttr(this, media_chrome_dialog_Attributes.OPEN);
  }
  set open(value) {
    setBooleanAttr(this, media_chrome_dialog_Attributes.OPEN, value);
  }
  handleEvent(event) {
    switch (event.type) {
      case "invoke":
        media_chrome_dialog_privateMethod(this, _handleInvoke, handleInvoke_fn).call(this, event);
        break;
      case "focusout":
        media_chrome_dialog_privateMethod(this, _handleFocusOut, handleFocusOut_fn).call(this, event);
        break;
      case "keydown":
        media_chrome_dialog_privateMethod(this, _handleKeyDown, handleKeyDown_fn).call(this, event);
        break;
    }
  }
  connectedCallback() {
    media_chrome_dialog_privateMethod(this, _init, init_fn).call(this);
    if (!this.role) {
      this.role = "dialog";
    }
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    media_chrome_dialog_privateMethod(this, _init, init_fn).call(this);
    if (attrName === media_chrome_dialog_Attributes.OPEN && newValue !== oldValue) {
      if (this.open) {
        media_chrome_dialog_privateMethod(this, _handleOpen, handleOpen_fn).call(this);
      } else {
        media_chrome_dialog_privateMethod(this, _handleClosed, handleClosed_fn).call(this);
      }
    }
  }
  focus() {
    media_chrome_dialog_privateSet(this, _previouslyFocused, getActiveElement());
    const focusCancelled = !this.dispatchEvent(new Event("focus", { composed: true, cancelable: true }));
    const focusInCancelled = !this.dispatchEvent(new Event("focusin", { composed: true, bubbles: true, cancelable: true }));
    if (focusCancelled || focusInCancelled)
      return;
    const focusable = this.querySelector(
      '[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]'
    );
    focusable == null ? void 0 : focusable.focus();
  }
  get keysUsed() {
    return ["Escape", "Tab"];
  }
}
_isInit = new WeakMap();
_previouslyFocused = new WeakMap();
_invokerElement = new WeakMap();
_init = new WeakSet();
init_fn = function() {
  if (media_chrome_dialog_privateGet(this, _isInit))
    return;
  media_chrome_dialog_privateSet(this, _isInit, true);
  if (!this.shadowRoot) {
    this.attachShadow(this.constructor.shadowRootOptions);
    const attrs = namedNodeMapToObject(this.attributes);
    this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    queueMicrotask(() => {
      const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
      style.setProperty(
        "transition",
        `display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in`
      );
    });
  }
};
_handleOpen = new WeakSet();
handleOpen_fn = function() {
  var _a;
  (_a = media_chrome_dialog_privateGet(this, _invokerElement)) == null ? void 0 : _a.setAttribute("aria-expanded", "true");
  this.dispatchEvent(new Event("open", { composed: true, bubbles: true }));
  this.addEventListener("transitionend", () => this.focus(), { once: true });
};
_handleClosed = new WeakSet();
handleClosed_fn = function() {
  var _a;
  (_a = media_chrome_dialog_privateGet(this, _invokerElement)) == null ? void 0 : _a.setAttribute("aria-expanded", "false");
  this.dispatchEvent(new Event("close", { composed: true, bubbles: true }));
};
_handleInvoke = new WeakSet();
handleInvoke_fn = function(event) {
  media_chrome_dialog_privateSet(this, _invokerElement, event.relatedTarget);
  if (!containsComposedNode(this, event.relatedTarget)) {
    this.open = !this.open;
  }
};
_handleFocusOut = new WeakSet();
handleFocusOut_fn = function(event) {
  var _a;
  if (!containsComposedNode(this, event.relatedTarget)) {
    (_a = media_chrome_dialog_privateGet(this, _previouslyFocused)) == null ? void 0 : _a.focus();
    if (media_chrome_dialog_privateGet(this, _invokerElement) && media_chrome_dialog_privateGet(this, _invokerElement) !== event.relatedTarget && this.open) {
      this.open = false;
    }
  }
};
_handleKeyDown = new WeakSet();
handleKeyDown_fn = function(event) {
  var _a, _b, _c, _d, _e;
  const { key, ctrlKey, altKey, metaKey } = event;
  if (ctrlKey || altKey || metaKey) {
    return;
  }
  if (!this.keysUsed.includes(key)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (key === "Tab") {
    if (event.shiftKey) {
      (_b = (_a = this.previousElementSibling) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
    } else {
      (_d = (_c = this.nextElementSibling) == null ? void 0 : _c.focus) == null ? void 0 : _d.call(_c);
    }
    this.blur();
  } else if (key === "Escape") {
    (_e = media_chrome_dialog_privateGet(this, _previouslyFocused)) == null ? void 0 : _e.focus();
    this.open = false;
  }
};
MediaChromeDialog.shadowRootOptions = { mode: "open" };
MediaChromeDialog.getTemplateHTML = media_chrome_dialog_getTemplateHTML;
MediaChromeDialog.getSlotTemplateHTML = media_chrome_dialog_getSlotTemplateHTML;
if (!GlobalThis.customElements.get("media-chrome-dialog")) {
  GlobalThis.customElements.define("media-chrome-dialog", MediaChromeDialog);
}
var media_chrome_dialog_default = (/* unused pure expression or super */ null && (MediaChromeDialog));


;// ../node_modules/media-chrome/dist/media-chrome-range.js
var media_chrome_range_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_chrome_range_privateGet = (obj, member, getter) => {
  media_chrome_range_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_chrome_range_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_chrome_range_privateSet = (obj, member, value, setter) => {
  media_chrome_range_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_chrome_range_privateMethod = (obj, member, method) => {
  media_chrome_range_accessCheck(obj, member, "access private method");
  return method;
};
var media_chrome_range_mediaController, _isInputTarget, _startpoint, _endpoint, _cssRules, _segments, _onFocusIn, _onFocusOut, _updateComputedStyles, _updateActiveSegment, updateActiveSegment_fn, _enableUserEvents, enableUserEvents_fn, _disableUserEvents, disableUserEvents_fn, _handlePointerDown, handlePointerDown_fn, _handlePointerEnter, handlePointerEnter_fn, media_chrome_range_handlePointerUp, media_chrome_range_handlePointerUp_fn, _handlePointerLeave, handlePointerLeave_fn, media_chrome_range_handlePointerMove, media_chrome_range_handlePointerMove_fn;




function media_chrome_range_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        ${/* Don't horizontal align w/ justify-content! #container can go negative on the x-axis w/ small width. */
    ""}
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; ${/* Prevent scrolling when dragging on mobile. */
    ""}
      }

      ${/* Reset before `outline` on track could be set by a CSS var */
    ""}
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        ${/* Not using the CSS `padding` prop makes it easier for slide open volume ranges so the width can be zero. */
    ""}
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        ${/* The input range acts as a hover and hit zone for input events. */
    ""}
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, -7px);
        height: var(--media-time-range-hover-height, max(100% + 7px, 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; ${/* Hides the slider so that custom slider can be made */
    ""}
        -webkit-tap-highlight-color: transparent;
        background: transparent; ${/* Otherwise white in Chrome */
    ""}
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, -5px);
          height: var(--media-time-range-hover-height, max(100% + 5px, 20px));
        }
      }

      ${/* Special styling for WebKit/Blink */
    ""}
      ${/* Make thumb width/height small so it has no effect on range click position. */
    ""}
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      ${/* The thumb is not positioned relative to the track in Firefox */
    ""}
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        ${/* Required for Safari to stop glitching track height on hover */
    ""}
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
      <input id="range" type="range" min="0" max="1" step="any" value="0">
    </div>
    <div id="rightgap"></div>
  `
  );
}
class MediaChromeRange extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_chrome_range_privateAdd(this, _updateActiveSegment);
    media_chrome_range_privateAdd(this, _enableUserEvents);
    media_chrome_range_privateAdd(this, _disableUserEvents);
    media_chrome_range_privateAdd(this, _handlePointerDown);
    media_chrome_range_privateAdd(this, _handlePointerEnter);
    media_chrome_range_privateAdd(this, media_chrome_range_handlePointerUp);
    media_chrome_range_privateAdd(this, _handlePointerLeave);
    media_chrome_range_privateAdd(this, media_chrome_range_handlePointerMove);
    media_chrome_range_privateAdd(this, media_chrome_range_mediaController, void 0);
    media_chrome_range_privateAdd(this, _isInputTarget, void 0);
    media_chrome_range_privateAdd(this, _startpoint, void 0);
    media_chrome_range_privateAdd(this, _endpoint, void 0);
    media_chrome_range_privateAdd(this, _cssRules, {});
    media_chrome_range_privateAdd(this, _segments, []);
    media_chrome_range_privateAdd(this, _onFocusIn, () => {
      if (this.range.matches(":focus-visible")) {
        const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
        style.setProperty(
          "--_focus-visible-box-shadow",
          "var(--_focus-box-shadow)"
        );
      }
    });
    media_chrome_range_privateAdd(this, _onFocusOut, () => {
      const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
      style.removeProperty("--_focus-visible-box-shadow");
    });
    media_chrome_range_privateAdd(this, _updateComputedStyles, () => {
      const clipping = this.shadowRoot.querySelector("#segments-clipping");
      if (clipping)
        clipping.parentNode.append(clipping);
    });
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      const html = this.constructor.getTemplateHTML(attrs);
      this.shadowRoot.setHTMLUnsafe ? this.shadowRoot.setHTMLUnsafe(html) : this.shadowRoot.innerHTML = html;
    }
    this.container = this.shadowRoot.querySelector("#container");
    media_chrome_range_privateSet(this, _startpoint, this.shadowRoot.querySelector("#startpoint"));
    media_chrome_range_privateSet(this, _endpoint, this.shadowRoot.querySelector("#endpoint"));
    this.range = this.shadowRoot.querySelector("#range");
    this.appearance = this.shadowRoot.querySelector("#appearance");
  }
  static get observedAttributes() {
    return [
      "disabled",
      "aria-disabled",
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_chrome_range_privateGet(this, media_chrome_range_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_chrome_range_privateSet(this, media_chrome_range_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_chrome_range_privateSet(this, media_chrome_range_mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = media_chrome_range_privateGet(this, media_chrome_range_mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    } else if (attrName === "disabled" || attrName === "aria-disabled" && oldValue !== newValue) {
      if (newValue == null) {
        this.range.removeAttribute(attrName);
        media_chrome_range_privateMethod(this, _enableUserEvents, enableUserEvents_fn).call(this);
      } else {
        this.range.setAttribute(attrName, newValue);
        media_chrome_range_privateMethod(this, _disableUserEvents, disableUserEvents_fn).call(this);
      }
    }
  }
  connectedCallback() {
    var _a, _b, _c;
    const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
    style.setProperty(
      "display",
      `var(--media-control-display, var(--${this.localName}-display, inline-flex))`
    );
    media_chrome_range_privateGet(this, _cssRules).pointer = getOrInsertCSSRule(this.shadowRoot, "#pointer");
    media_chrome_range_privateGet(this, _cssRules).progress = getOrInsertCSSRule(this.shadowRoot, "#progress");
    media_chrome_range_privateGet(this, _cssRules).thumb = getOrInsertCSSRule(
      this.shadowRoot,
      '#thumb, ::slotted([slot="thumb"])'
    );
    media_chrome_range_privateGet(this, _cssRules).activeSegment = getOrInsertCSSRule(
      this.shadowRoot,
      "#segments-clipping rect:nth-child(0)"
    );
    const mediaControllerId = this.getAttribute(
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    );
    if (mediaControllerId) {
      media_chrome_range_privateSet(this, media_chrome_range_mediaController, (_a = this.getRootNode()) == null ? void 0 : _a.getElementById(
        mediaControllerId
      ));
      (_c = (_b = media_chrome_range_privateGet(this, media_chrome_range_mediaController)) == null ? void 0 : _b.associateElement) == null ? void 0 : _c.call(_b, this);
    }
    this.updateBar();
    this.shadowRoot.addEventListener("focusin", media_chrome_range_privateGet(this, _onFocusIn));
    this.shadowRoot.addEventListener("focusout", media_chrome_range_privateGet(this, _onFocusOut));
    media_chrome_range_privateMethod(this, _enableUserEvents, enableUserEvents_fn).call(this);
    observeResize(this.container, media_chrome_range_privateGet(this, _updateComputedStyles));
  }
  disconnectedCallback() {
    var _a, _b;
    media_chrome_range_privateMethod(this, _disableUserEvents, disableUserEvents_fn).call(this);
    (_b = (_a = media_chrome_range_privateGet(this, media_chrome_range_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_chrome_range_privateSet(this, media_chrome_range_mediaController, null);
    this.shadowRoot.removeEventListener("focusin", media_chrome_range_privateGet(this, _onFocusIn));
    this.shadowRoot.removeEventListener("focusout", media_chrome_range_privateGet(this, _onFocusOut));
    unobserveResize(this.container, media_chrome_range_privateGet(this, _updateComputedStyles));
  }
  updatePointerBar(evt) {
    var _a;
    (_a = media_chrome_range_privateGet(this, _cssRules).pointer) == null ? void 0 : _a.style.setProperty(
      "width",
      `${this.getPointerRatio(evt) * 100}%`
    );
  }
  updateBar() {
    var _a, _b;
    const rangePercent = this.range.valueAsNumber * 100;
    (_a = media_chrome_range_privateGet(this, _cssRules).progress) == null ? void 0 : _a.style.setProperty("width", `${rangePercent}%`);
    (_b = media_chrome_range_privateGet(this, _cssRules).thumb) == null ? void 0 : _b.style.setProperty("left", `${rangePercent}%`);
  }
  updateSegments(segments) {
    const clipping = this.shadowRoot.querySelector("#segments-clipping");
    clipping.textContent = "";
    this.container.classList.toggle("segments", !!(segments == null ? void 0 : segments.length));
    if (!(segments == null ? void 0 : segments.length))
      return;
    const normalized = [
      .../* @__PURE__ */ new Set([
        +this.range.min,
        ...segments.flatMap((s) => [s.start, s.end]),
        +this.range.max
      ])
    ];
    media_chrome_range_privateSet(this, _segments, [...normalized]);
    const lastMarker = normalized.pop();
    for (const [i, marker] of normalized.entries()) {
      const [isFirst, isLast] = [i === 0, i === normalized.length - 1];
      const x = isFirst ? "calc(var(--segments-gap) / -1)" : `${marker * 100}%`;
      const x2 = isLast ? lastMarker : normalized[i + 1];
      const width = `calc(${(x2 - marker) * 100}%${isFirst || isLast ? "" : ` - var(--segments-gap)`})`;
      const segmentEl = server_safe_globals_Document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      const cssRule = getOrInsertCSSRule(
        this.shadowRoot,
        `#segments-clipping rect:nth-child(${i + 1})`
      );
      cssRule.style.setProperty("x", x);
      cssRule.style.setProperty("width", width);
      clipping.append(segmentEl);
    }
  }
  getPointerRatio(evt) {
    return getPointProgressOnLine(
      evt.clientX,
      evt.clientY,
      media_chrome_range_privateGet(this, _startpoint).getBoundingClientRect(),
      media_chrome_range_privateGet(this, _endpoint).getBoundingClientRect()
    );
  }
  get dragging() {
    return this.hasAttribute("dragging");
  }
  handleEvent(evt) {
    switch (evt.type) {
      case "pointermove":
        media_chrome_range_privateMethod(this, media_chrome_range_handlePointerMove, media_chrome_range_handlePointerMove_fn).call(this, evt);
        break;
      case "input":
        this.updateBar();
        break;
      case "pointerenter":
        media_chrome_range_privateMethod(this, _handlePointerEnter, handlePointerEnter_fn).call(this, evt);
        break;
      case "pointerdown":
        media_chrome_range_privateMethod(this, _handlePointerDown, handlePointerDown_fn).call(this, evt);
        break;
      case "pointerup":
        media_chrome_range_privateMethod(this, media_chrome_range_handlePointerUp, media_chrome_range_handlePointerUp_fn).call(this);
        break;
      case "pointerleave":
        media_chrome_range_privateMethod(this, _handlePointerLeave, handlePointerLeave_fn).call(this);
        break;
    }
  }
  get keysUsed() {
    return ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  }
}
media_chrome_range_mediaController = new WeakMap();
_isInputTarget = new WeakMap();
_startpoint = new WeakMap();
_endpoint = new WeakMap();
_cssRules = new WeakMap();
_segments = new WeakMap();
_onFocusIn = new WeakMap();
_onFocusOut = new WeakMap();
_updateComputedStyles = new WeakMap();
_updateActiveSegment = new WeakSet();
updateActiveSegment_fn = function(evt) {
  const rule = media_chrome_range_privateGet(this, _cssRules).activeSegment;
  if (!rule)
    return;
  const pointerRatio = this.getPointerRatio(evt);
  const segmentIndex = media_chrome_range_privateGet(this, _segments).findIndex((start, i, arr) => {
    const end = arr[i + 1];
    return end != null && pointerRatio >= start && pointerRatio <= end;
  });
  const selectorText = `#segments-clipping rect:nth-child(${segmentIndex + 1})`;
  if (rule.selectorText != selectorText || !rule.style.transform) {
    rule.selectorText = selectorText;
    rule.style.setProperty(
      "transform",
      "var(--media-range-segment-hover-transform, scaleY(2))"
    );
  }
};
_enableUserEvents = new WeakSet();
enableUserEvents_fn = function() {
  if (this.hasAttribute("disabled"))
    return;
  this.addEventListener("input", this);
  this.addEventListener("pointerdown", this);
  this.addEventListener("pointerenter", this);
};
_disableUserEvents = new WeakSet();
disableUserEvents_fn = function() {
  var _a, _b;
  this.removeEventListener("input", this);
  this.removeEventListener("pointerdown", this);
  this.removeEventListener("pointerenter", this);
  (_a = GlobalThis.window) == null ? void 0 : _a.removeEventListener("pointerup", this);
  (_b = GlobalThis.window) == null ? void 0 : _b.removeEventListener("pointermove", this);
};
_handlePointerDown = new WeakSet();
handlePointerDown_fn = function(evt) {
  var _a;
  media_chrome_range_privateSet(this, _isInputTarget, evt.composedPath().includes(this.range));
  (_a = GlobalThis.window) == null ? void 0 : _a.addEventListener("pointerup", this);
};
_handlePointerEnter = new WeakSet();
handlePointerEnter_fn = function(evt) {
  var _a;
  if (evt.pointerType !== "mouse")
    media_chrome_range_privateMethod(this, _handlePointerDown, handlePointerDown_fn).call(this, evt);
  this.addEventListener("pointerleave", this);
  (_a = GlobalThis.window) == null ? void 0 : _a.addEventListener("pointermove", this);
};
media_chrome_range_handlePointerUp = new WeakSet();
media_chrome_range_handlePointerUp_fn = function() {
  var _a;
  (_a = GlobalThis.window) == null ? void 0 : _a.removeEventListener("pointerup", this);
  this.toggleAttribute("dragging", false);
  this.range.disabled = this.hasAttribute("disabled");
};
_handlePointerLeave = new WeakSet();
handlePointerLeave_fn = function() {
  var _a, _b;
  this.removeEventListener("pointerleave", this);
  (_a = GlobalThis.window) == null ? void 0 : _a.removeEventListener("pointermove", this);
  this.toggleAttribute("dragging", false);
  this.range.disabled = this.hasAttribute("disabled");
  (_b = media_chrome_range_privateGet(this, _cssRules).activeSegment) == null ? void 0 : _b.style.removeProperty("transform");
};
media_chrome_range_handlePointerMove = new WeakSet();
media_chrome_range_handlePointerMove_fn = function(evt) {
  if (evt.pointerType === "pen" && evt.buttons === 0) {
    return;
  }
  this.toggleAttribute(
    "dragging",
    evt.buttons === 1 || evt.pointerType !== "mouse"
  );
  this.updatePointerBar(evt);
  media_chrome_range_privateMethod(this, _updateActiveSegment, updateActiveSegment_fn).call(this, evt);
  if (this.dragging && (evt.pointerType !== "mouse" || !media_chrome_range_privateGet(this, _isInputTarget))) {
    this.range.disabled = true;
    this.range.valueAsNumber = this.getPointerRatio(evt);
    this.range.dispatchEvent(
      new Event("input", { bubbles: true, composed: true })
    );
  }
};
MediaChromeRange.shadowRootOptions = { mode: "open" };
MediaChromeRange.getTemplateHTML = media_chrome_range_getTemplateHTML;
if (!GlobalThis.customElements.get("media-chrome-range")) {
  GlobalThis.customElements.define("media-chrome-range", MediaChromeRange);
}
var media_chrome_range_default = (/* unused pure expression or super */ null && (MediaChromeRange));


;// ../node_modules/media-chrome/dist/media-control-bar.js
var media_control_bar_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_control_bar_privateGet = (obj, member, getter) => {
  media_control_bar_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_control_bar_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_control_bar_privateSet = (obj, member, value, setter) => {
  media_control_bar_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_control_bar_mediaController;



function media_control_bar_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        ${/* Need position to display above video for some reason */
    ""}
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `
  );
}
class MediaControlBar extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_control_bar_privateAdd(this, media_control_bar_mediaController, void 0);
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
  }
  static get observedAttributes() {
    return [MediaStateReceiverAttributes.MEDIA_CONTROLLER];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_control_bar_privateGet(this, media_control_bar_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_control_bar_privateSet(this, media_control_bar_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_control_bar_privateSet(this, media_control_bar_mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = media_control_bar_privateGet(this, media_control_bar_mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    }
  }
  connectedCallback() {
    var _a, _b, _c;
    const mediaControllerId = this.getAttribute(
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    );
    if (mediaControllerId) {
      media_control_bar_privateSet(this, media_control_bar_mediaController, (_a = this.getRootNode()) == null ? void 0 : _a.getElementById(
        mediaControllerId
      ));
      (_c = (_b = media_control_bar_privateGet(this, media_control_bar_mediaController)) == null ? void 0 : _b.associateElement) == null ? void 0 : _c.call(_b, this);
    }
  }
  disconnectedCallback() {
    var _a, _b;
    (_b = (_a = media_control_bar_privateGet(this, media_control_bar_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_control_bar_privateSet(this, media_control_bar_mediaController, null);
  }
}
media_control_bar_mediaController = new WeakMap();
MediaControlBar.shadowRootOptions = { mode: "open" };
MediaControlBar.getTemplateHTML = media_control_bar_getTemplateHTML;
if (!GlobalThis.customElements.get("media-control-bar")) {
  GlobalThis.customElements.define("media-control-bar", MediaControlBar);
}
var media_control_bar_default = (/* unused pure expression or super */ null && (MediaControlBar));


;// ../node_modules/media-chrome/dist/media-text-display.js
var media_text_display_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_text_display_privateGet = (obj, member, getter) => {
  media_text_display_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_text_display_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_text_display_privateSet = (obj, member, value, setter) => {
  media_text_display_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_text_display_mediaController;



function media_text_display_getTemplateHTML(_attrs, _props = {}) {
  return (
    /*html*/
    `
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      ${/*
      Only show outline when keyboard focusing.
      https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
    */
    ""}
      :host(:focus-visible) {
        box-shadow: inset 0 0 0 2px rgb(27 127 204 / .9);
        outline: 0;
      }

      ${/*
    * hide default focus ring, particularly when using mouse
    */
    ""}
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(_attrs, _props)}
  `
  );
}
function media_text_display_getSlotTemplateHTML(_attrs, _props) {
  return (
    /*html*/
    `
    <slot></slot>
  `
  );
}
class MediaTextDisplay extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_text_display_privateAdd(this, media_text_display_mediaController, void 0);
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
  }
  static get observedAttributes() {
    return [MediaStateReceiverAttributes.MEDIA_CONTROLLER];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_text_display_privateGet(this, media_text_display_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_text_display_privateSet(this, media_text_display_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_text_display_privateSet(this, media_text_display_mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = media_text_display_privateGet(this, media_text_display_mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    }
  }
  connectedCallback() {
    var _a, _b, _c;
    const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
    style.setProperty(
      "display",
      `var(--media-control-display, var(--${this.localName}-display, inline-flex))`
    );
    const mediaControllerId = this.getAttribute(
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    );
    if (mediaControllerId) {
      media_text_display_privateSet(this, media_text_display_mediaController, (_a = this.getRootNode()) == null ? void 0 : _a.getElementById(
        mediaControllerId
      ));
      (_c = (_b = media_text_display_privateGet(this, media_text_display_mediaController)) == null ? void 0 : _b.associateElement) == null ? void 0 : _c.call(_b, this);
    }
  }
  disconnectedCallback() {
    var _a, _b;
    (_b = (_a = media_text_display_privateGet(this, media_text_display_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_text_display_privateSet(this, media_text_display_mediaController, null);
  }
}
media_text_display_mediaController = new WeakMap();
MediaTextDisplay.shadowRootOptions = { mode: "open" };
MediaTextDisplay.getTemplateHTML = media_text_display_getTemplateHTML;
MediaTextDisplay.getSlotTemplateHTML = media_text_display_getSlotTemplateHTML;
if (!GlobalThis.customElements.get("media-text-display")) {
  GlobalThis.customElements.define("media-text-display", MediaTextDisplay);
}
var media_text_display_default = (/* unused pure expression or super */ null && (MediaTextDisplay));


;// ../node_modules/media-chrome/dist/media-duration-display.js
var media_duration_display_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_duration_display_privateGet = (obj, member, getter) => {
  media_duration_display_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_duration_display_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_duration_display_privateSet = (obj, member, value, setter) => {
  media_duration_display_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _slot;





function media_duration_display_getSlotTemplateHTML(_attrs, props) {
  return (
    /*html*/
    `
    <slot>${formatTime(props.mediaDuration)}</slot>
  `
  );
}
class MediaDurationDisplay extends MediaTextDisplay {
  constructor() {
    var _a;
    super();
    media_duration_display_privateAdd(this, _slot, void 0);
    media_duration_display_privateSet(this, _slot, this.shadowRoot.querySelector("slot"));
    media_duration_display_privateGet(this, _slot).textContent = formatTime((_a = this.mediaDuration) != null ? _a : 0);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, MediaUIAttributes.MEDIA_DURATION];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === MediaUIAttributes.MEDIA_DURATION) {
      media_duration_display_privateGet(this, _slot).textContent = formatTime(+newValue);
    }
    super.attributeChangedCallback(attrName, oldValue, newValue);
  }
  /**
   * @type {number | undefined} In seconds
   */
  get mediaDuration() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_DURATION);
  }
  set mediaDuration(time) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_DURATION, time);
  }
}
_slot = new WeakMap();
MediaDurationDisplay.getSlotTemplateHTML = media_duration_display_getSlotTemplateHTML;
if (!GlobalThis.customElements.get("media-duration-display")) {
  GlobalThis.customElements.define(
    "media-duration-display",
    MediaDurationDisplay
  );
}
var media_duration_display_default = (/* unused pure expression or super */ null && (MediaDurationDisplay));


;// ../node_modules/media-chrome/dist/labels/labels.js

const defaultErrorTitles = {
  2: t("Network Error"),
  3: t("Decode Error"),
  4: t("Source Not Supported"),
  5: t("Encryption Error")
};
const defaultErrorMessages = {
  2: t("A network error caused the media download to fail."),
  3: t(
    "A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."
  ),
  4: t(
    "An unsupported error occurred. The server or network failed, or your browser does not support this format."
  ),
  5: t("The media is encrypted and there are no keys to decrypt it.")
};
const formatError = (error) => {
  var _a, _b;
  if (error.code === 1)
    return null;
  return {
    title: (_a = defaultErrorTitles[error.code]) != null ? _a : `Error ${error.code}`,
    message: (_b = defaultErrorMessages[error.code]) != null ? _b : error.message
  };
};


;// ../node_modules/media-chrome/dist/media-error-dialog.js
var media_error_dialog_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_error_dialog_privateGet = (obj, member, getter) => {
  media_error_dialog_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_error_dialog_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_error_dialog_privateSet = (obj, member, value, setter) => {
  media_error_dialog_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _mediaError;





function media_error_dialog_getSlotTemplateHTML(attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${attrs.mediaerrorcode}" id="content">
      ${formatErrorMessage({ code: +attrs.mediaerrorcode, message: attrs.mediaerrormessage })}
    </slot>
  `
  );
}
function shouldOpenErrorDialog(error) {
  return error.code && formatError(error) !== null;
}
function formatErrorMessage(error) {
  var _a;
  const { title, message } = (_a = formatError(error)) != null ? _a : {};
  let html = "";
  if (title)
    html += `<slot name="error-${error.code}-title"><h3>${title}</h3></slot>`;
  if (message)
    html += `<slot name="error-${error.code}-message"><p>${message}</p></slot>`;
  return html;
}
const observedAttributes = [
  MediaUIAttributes.MEDIA_ERROR_CODE,
  MediaUIAttributes.MEDIA_ERROR_MESSAGE
];
class MediaErrorDialog extends MediaChromeDialog {
  constructor() {
    super(...arguments);
    media_error_dialog_privateAdd(this, _mediaError, null);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, ...observedAttributes];
  }
  formatErrorMessage(error) {
    return this.constructor.formatErrorMessage(error);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a;
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (!observedAttributes.includes(attrName))
      return;
    const mediaError = (_a = this.mediaError) != null ? _a : {
      code: this.mediaErrorCode,
      message: this.mediaErrorMessage
    };
    this.open = shouldOpenErrorDialog(mediaError);
    if (this.open) {
      this.shadowRoot.querySelector("slot").name = `error-${this.mediaErrorCode}`;
      this.shadowRoot.querySelector("#content").innerHTML = this.formatErrorMessage(mediaError);
    }
  }
  get mediaError() {
    return media_error_dialog_privateGet(this, _mediaError);
  }
  set mediaError(value) {
    media_error_dialog_privateSet(this, _mediaError, value);
  }
  get mediaErrorCode() {
    return getNumericAttr(this, "mediaerrorcode");
  }
  set mediaErrorCode(value) {
    setNumericAttr(this, "mediaerrorcode", value);
  }
  get mediaErrorMessage() {
    return getStringAttr(this, "mediaerrormessage");
  }
  set mediaErrorMessage(value) {
    setStringAttr(this, "mediaerrormessage", value);
  }
}
_mediaError = new WeakMap();
MediaErrorDialog.getSlotTemplateHTML = media_error_dialog_getSlotTemplateHTML;
MediaErrorDialog.formatErrorMessage = formatErrorMessage;
if (!GlobalThis.customElements.get("media-error-dialog")) {
  GlobalThis.customElements.define("media-error-dialog", MediaErrorDialog);
}
var media_error_dialog_default = MediaErrorDialog;


;// ../node_modules/media-chrome/dist/media-fullscreen-button.js
var media_fullscreen_button_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_fullscreen_button_privateGet = (obj, member, getter) => {
  media_fullscreen_button_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_fullscreen_button_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_fullscreen_button_privateSet = (obj, member, value, setter) => {
  media_fullscreen_button_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _lastActionEvent;





const enterFullscreenIcon = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`;
const exitFullscreenIcon = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`;
function media_fullscreen_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host([${MediaUIAttributes.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      ${/* Double negative, but safer if display doesn't equal 'block' */
    ""}
      :host(:not([${MediaUIAttributes.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${MediaUIAttributes.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${enterFullscreenIcon}</slot>
      <slot name="exit">${exitFullscreenIcon}</slot>
    </slot>
  `
  );
}
function media_fullscreen_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-enter">${t("Enter fullscreen mode")}</slot>
    <slot name="tooltip-exit">${t("Exit fullscreen mode")}</slot>
  `
  );
}
const media_fullscreen_button_updateAriaLabel = (el) => {
  const label = el.mediaIsFullscreen ? t("exit fullscreen mode") : t("enter fullscreen mode");
  el.setAttribute("aria-label", label);
};
class MediaFullscreenButton extends MediaChromeButton {
  constructor() {
    super(...arguments);
    media_fullscreen_button_privateAdd(this, _lastActionEvent, null);
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_IS_FULLSCREEN,
      MediaUIAttributes.MEDIA_FULLSCREEN_UNAVAILABLE
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    media_fullscreen_button_updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_IS_FULLSCREEN) {
      media_fullscreen_button_updateAriaLabel(this);
    }
  }
  /**
   * @type {string | undefined} Fullscreen unavailability state
   */
  get mediaFullscreenUnavailable() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_FULLSCREEN_UNAVAILABLE);
  }
  set mediaFullscreenUnavailable(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_FULLSCREEN_UNAVAILABLE, value);
  }
  /**
   * @type {boolean} Whether fullscreen is available
   */
  get mediaIsFullscreen() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_IS_FULLSCREEN);
  }
  set mediaIsFullscreen(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_IS_FULLSCREEN, value);
  }
  handleClick(e) {
    media_fullscreen_button_privateSet(this, _lastActionEvent, e);
    const isPointerEvent = media_fullscreen_button_privateGet(this, _lastActionEvent) instanceof PointerEvent;
    const event = this.mediaIsFullscreen ? new GlobalThis.CustomEvent(
      MediaUIEvents.MEDIA_EXIT_FULLSCREEN_REQUEST,
      { composed: true, bubbles: true }
    ) : new GlobalThis.CustomEvent(
      MediaUIEvents.MEDIA_ENTER_FULLSCREEN_REQUEST,
      { composed: true, bubbles: true, detail: isPointerEvent }
    );
    this.dispatchEvent(event);
  }
}
_lastActionEvent = new WeakMap();
MediaFullscreenButton.getSlotTemplateHTML = media_fullscreen_button_getSlotTemplateHTML;
MediaFullscreenButton.getTooltipContentHTML = media_fullscreen_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-fullscreen-button")) {
  GlobalThis.customElements.define(
    "media-fullscreen-button",
    MediaFullscreenButton
  );
}
var media_fullscreen_button_default = (/* unused pure expression or super */ null && (MediaFullscreenButton));


;// ../node_modules/media-chrome/dist/media-live-button.js





const { MEDIA_TIME_IS_LIVE, MEDIA_PAUSED } = MediaUIAttributes;
const { MEDIA_SEEK_TO_LIVE_REQUEST, MEDIA_PLAY_REQUEST } = MediaUIEvents;
const indicatorSVG = '<svg viewBox="0 0 6 12"><circle cx="3" cy="6" r="2"></circle></svg>';
function media_live_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        ${/* Override styles for icon-only buttons */
    ""}
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${MEDIA_TIME_IS_LIVE}]:not([${MEDIA_PAUSED}])) slot[name=indicator] > *,
      :host([${MEDIA_TIME_IS_LIVE}]:not([${MEDIA_PAUSED}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${MEDIA_TIME_IS_LIVE}]:not([${MEDIA_PAUSED}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator">${indicatorSVG}</slot>
    ${/*
      A new line between spacer and text creates inconsistent spacing
      between slotted items and default slots.
    */
    ""}
    <slot name="spacer">&nbsp;</slot><slot name="text">${t("live")}</slot>
  `
  );
}
const updateAriaAttributes = (el) => {
  var _a;
  const isPausedOrNotLive = el.mediaPaused || !el.mediaTimeIsLive;
  const label = isPausedOrNotLive ? t("seek to live") : t("playing live");
  el.setAttribute("aria-label", label);
  const textSlot = (_a = el.shadowRoot) == null ? void 0 : _a.querySelector('slot[name="text"]');
  if (textSlot)
    textSlot.textContent = t("live");
  isPausedOrNotLive ? el.removeAttribute("aria-disabled") : el.setAttribute("aria-disabled", "true");
};
class MediaLiveButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MEDIA_TIME_IS_LIVE,
      MEDIA_PAUSED
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    updateAriaAttributes(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    updateAriaAttributes(this);
  }
  /**
   * @type {boolean} Is the media paused
   */
  get mediaPaused() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }
  set mediaPaused(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }
  /**
   * @type {boolean} Is the media playback currently live
   */
  get mediaTimeIsLive() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_TIME_IS_LIVE);
  }
  set mediaTimeIsLive(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_TIME_IS_LIVE, value);
  }
  handleClick() {
    if (!this.mediaPaused && this.mediaTimeIsLive)
      return;
    this.dispatchEvent(
      new GlobalThis.CustomEvent(MEDIA_SEEK_TO_LIVE_REQUEST, {
        composed: true,
        bubbles: true
      })
    );
    if (this.hasAttribute(MEDIA_PAUSED)) {
      this.dispatchEvent(
        new GlobalThis.CustomEvent(MEDIA_PLAY_REQUEST, {
          composed: true,
          bubbles: true
        })
      );
    }
  }
}
MediaLiveButton.getSlotTemplateHTML = media_live_button_getSlotTemplateHTML;
if (!GlobalThis.customElements.get("media-live-button")) {
  GlobalThis.customElements.define("media-live-button", MediaLiveButton);
}
var media_live_button_default = (/* unused pure expression or super */ null && (MediaLiveButton));


;// ../node_modules/media-chrome/dist/media-loading-indicator.js
var media_loading_indicator_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_loading_indicator_privateGet = (obj, member, getter) => {
  media_loading_indicator_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_loading_indicator_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_loading_indicator_privateSet = (obj, member, value, setter) => {
  media_loading_indicator_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_loading_indicator_mediaController, _delay;




const media_loading_indicator_Attributes = {
  LOADING_DELAY: "loadingdelay",
  NO_AUTOHIDE: "noautohide"
};
const DEFAULT_LOADING_DELAY = 500;
const loadingIndicatorIcon = `
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;
function media_loading_indicator_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, ${DEFAULT_LOADING_DELAY}ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${MediaUIAttributes.MEDIA_LOADING}]:not([${MediaUIAttributes.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${MediaUIAttributes.MEDIA_LOADING}]:not([${MediaUIAttributes.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${MediaUIAttributes.MEDIA_LOADING}]:not([${MediaUIAttributes.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${loadingIndicatorIcon}</slot>
    <div id="status" role="status" aria-live="polite">${t("media loading")}</div>
  `
  );
}
class MediaLoadingIndicator extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_loading_indicator_privateAdd(this, media_loading_indicator_mediaController, void 0);
    media_loading_indicator_privateAdd(this, _delay, DEFAULT_LOADING_DELAY);
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
  }
  static get observedAttributes() {
    return [
      MediaStateReceiverAttributes.MEDIA_CONTROLLER,
      MediaUIAttributes.MEDIA_PAUSED,
      MediaUIAttributes.MEDIA_LOADING,
      media_loading_indicator_Attributes.LOADING_DELAY
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if (attrName === media_loading_indicator_Attributes.LOADING_DELAY && oldValue !== newValue) {
      this.loadingDelay = Number(newValue);
    } else if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_loading_indicator_privateGet(this, media_loading_indicator_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_loading_indicator_privateSet(this, media_loading_indicator_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_loading_indicator_privateSet(this, media_loading_indicator_mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = media_loading_indicator_privateGet(this, media_loading_indicator_mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    }
  }
  connectedCallback() {
    var _a, _b, _c;
    const mediaControllerId = this.getAttribute(
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    );
    if (mediaControllerId) {
      media_loading_indicator_privateSet(this, media_loading_indicator_mediaController, (_a = this.getRootNode()) == null ? void 0 : _a.getElementById(
        mediaControllerId
      ));
      (_c = (_b = media_loading_indicator_privateGet(this, media_loading_indicator_mediaController)) == null ? void 0 : _b.associateElement) == null ? void 0 : _c.call(_b, this);
    }
  }
  disconnectedCallback() {
    var _a, _b;
    (_b = (_a = media_loading_indicator_privateGet(this, media_loading_indicator_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_loading_indicator_privateSet(this, media_loading_indicator_mediaController, null);
  }
  /**
   * Delay in ms
   */
  get loadingDelay() {
    return media_loading_indicator_privateGet(this, _delay);
  }
  set loadingDelay(delay) {
    media_loading_indicator_privateSet(this, _delay, delay);
    const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
    style.setProperty(
      "--_loading-indicator-delay",
      `var(--media-loading-indicator-transition-delay, ${delay}ms)`
    );
  }
  /**
   * Is the media paused
   */
  get mediaPaused() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }
  set mediaPaused(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }
  /**
   * Is the media loading
   */
  get mediaLoading() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_LOADING);
  }
  set mediaLoading(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_LOADING, value);
  }
  get mediaController() {
    return getStringAttr(this, MediaStateReceiverAttributes.MEDIA_CONTROLLER);
  }
  set mediaController(value) {
    setStringAttr(this, MediaStateReceiverAttributes.MEDIA_CONTROLLER, value);
  }
  get noAutohide() {
    return getBooleanAttr(this, media_loading_indicator_Attributes.NO_AUTOHIDE);
  }
  set noAutohide(value) {
    setBooleanAttr(this, media_loading_indicator_Attributes.NO_AUTOHIDE, value);
  }
}
media_loading_indicator_mediaController = new WeakMap();
_delay = new WeakMap();
MediaLoadingIndicator.shadowRootOptions = { mode: "open" };
MediaLoadingIndicator.getTemplateHTML = media_loading_indicator_getTemplateHTML;
if (!GlobalThis.customElements.get("media-loading-indicator")) {
  GlobalThis.customElements.define(
    "media-loading-indicator",
    MediaLoadingIndicator
  );
}
var media_loading_indicator_default = (/* unused pure expression or super */ null && (MediaLoadingIndicator));


;// ../node_modules/media-chrome/dist/media-mute-button.js





const offIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`;
const lowIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`;
const highIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;
function media_mute_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host(:not([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${MediaUIAttributes.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${offIcon}</slot>
      <slot name="low">${lowIcon}</slot>
      <slot name="medium">${lowIcon}</slot>
      <slot name="high">${highIcon}</slot>
    </slot>
  `
  );
}
function media_mute_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-mute">${t("Mute")}</slot>
    <slot name="tooltip-unmute">${t("Unmute")}</slot>
  `
  );
}
const media_mute_button_updateAriaLabel = (el) => {
  const muted = el.mediaVolumeLevel === "off";
  const label = muted ? t("unmute") : t("mute");
  el.setAttribute("aria-label", label);
};
class MediaMuteButton extends MediaChromeButton {
  static get observedAttributes() {
    return [...super.observedAttributes, MediaUIAttributes.MEDIA_VOLUME_LEVEL];
  }
  connectedCallback() {
    super.connectedCallback();
    media_mute_button_updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_VOLUME_LEVEL) {
      media_mute_button_updateAriaLabel(this);
    }
  }
  /**
   * @type {string | undefined}
   */
  get mediaVolumeLevel() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_VOLUME_LEVEL);
  }
  set mediaVolumeLevel(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_VOLUME_LEVEL, value);
  }
  handleClick() {
    const eventName = this.mediaVolumeLevel === "off" ? MediaUIEvents.MEDIA_UNMUTE_REQUEST : MediaUIEvents.MEDIA_MUTE_REQUEST;
    this.dispatchEvent(
      new GlobalThis.CustomEvent(eventName, { composed: true, bubbles: true })
    );
  }
}
MediaMuteButton.getSlotTemplateHTML = media_mute_button_getSlotTemplateHTML;
MediaMuteButton.getTooltipContentHTML = media_mute_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-mute-button")) {
  GlobalThis.customElements.define("media-mute-button", MediaMuteButton);
}
var media_mute_button_default = (/* unused pure expression or super */ null && (MediaMuteButton));


;// ../node_modules/media-chrome/dist/media-pip-button.js





const pipIcon = `<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`;
function media_pip_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host([${MediaUIAttributes.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${MediaUIAttributes.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${MediaUIAttributes.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${pipIcon}</slot>
      <slot name="exit">${pipIcon}</slot>
    </slot>
  `
  );
}
function media_pip_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-enter">${t("Enter picture in picture mode")}</slot>
    <slot name="tooltip-exit">${t("Exit picture in picture mode")}</slot>
  `
  );
}
const media_pip_button_updateAriaLabel = (el) => {
  const label = el.mediaIsPip ? t("exit picture in picture mode") : t("enter picture in picture mode");
  el.setAttribute("aria-label", label);
};
class MediaPipButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_IS_PIP,
      MediaUIAttributes.MEDIA_PIP_UNAVAILABLE
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    media_pip_button_updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_IS_PIP) {
      media_pip_button_updateAriaLabel(this);
    }
  }
  /**
   * @type {string | undefined} Pip unavailability state
   */
  get mediaPipUnavailable() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_PIP_UNAVAILABLE);
  }
  set mediaPipUnavailable(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_PIP_UNAVAILABLE, value);
  }
  /**
   * @type {boolean} Is the media currently playing picture-in-picture
   */
  get mediaIsPip() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_IS_PIP);
  }
  set mediaIsPip(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_IS_PIP, value);
  }
  handleClick() {
    const eventName = this.mediaIsPip ? MediaUIEvents.MEDIA_EXIT_PIP_REQUEST : MediaUIEvents.MEDIA_ENTER_PIP_REQUEST;
    this.dispatchEvent(
      new GlobalThis.CustomEvent(eventName, { composed: true, bubbles: true })
    );
  }
}
MediaPipButton.getSlotTemplateHTML = media_pip_button_getSlotTemplateHTML;
MediaPipButton.getTooltipContentHTML = media_pip_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-pip-button")) {
  GlobalThis.customElements.define("media-pip-button", MediaPipButton);
}
var media_pip_button_default = (/* unused pure expression or super */ null && (MediaPipButton));


;// ../node_modules/media-chrome/dist/media-playback-rate-button.js
var media_playback_rate_button_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_playback_rate_button_privateGet = (obj, member, getter) => {
  media_playback_rate_button_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_playback_rate_button_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var _rates;






const media_playback_rate_button_Attributes = {
  RATES: "rates"
};
const DEFAULT_RATES = [1, 1.2, 1.5, 1.7, 2];
const DEFAULT_RATE = 1;
function media_playback_rate_button_getSlotTemplateHTML(attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${attrs["mediaplaybackrate"] || DEFAULT_RATE}x</slot>
  `
  );
}
function media_playback_rate_button_getTooltipContentHTML() {
  return t("Playback rate");
}
class MediaPlaybackRateButton extends MediaChromeButton {
  constructor() {
    var _a;
    super();
    media_playback_rate_button_privateAdd(this, _rates, new AttributeTokenList(this, media_playback_rate_button_Attributes.RATES, {
      defaultValue: DEFAULT_RATES
    }));
    this.container = this.shadowRoot.querySelector('slot[name="icon"]');
    this.container.innerHTML = `${(_a = this.mediaPlaybackRate) != null ? _a : DEFAULT_RATE}x`;
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE,
      media_playback_rate_button_Attributes.RATES
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === media_playback_rate_button_Attributes.RATES) {
      media_playback_rate_button_privateGet(this, _rates).value = newValue;
    }
    if (attrName === MediaUIAttributes.MEDIA_PLAYBACK_RATE) {
      const newPlaybackRate = newValue ? +newValue : Number.NaN;
      const playbackRate = !Number.isNaN(newPlaybackRate) ? newPlaybackRate : DEFAULT_RATE;
      this.container.innerHTML = `${playbackRate}x`;
      this.setAttribute(
        "aria-label",
        t("Playback rate {playbackRate}", { playbackRate })
      );
    }
  }
  /**
   * Get the playback rates for the button.
   */
  get rates() {
    return media_playback_rate_button_privateGet(this, _rates);
  }
  /**
   * Set the playback rates for the button.
   * For React 19+ compatibility, accept a string of space-separated rates.
   */
  set rates(value) {
    if (!value) {
      media_playback_rate_button_privateGet(this, _rates).value = "";
    } else if (Array.isArray(value)) {
      media_playback_rate_button_privateGet(this, _rates).value = value.join(" ");
    } else if (typeof value === "string") {
      media_playback_rate_button_privateGet(this, _rates).value = value;
    }
  }
  /**
   * @type {number} The current playback rate
   */
  get mediaPlaybackRate() {
    return getNumericAttr(
      this,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE,
      DEFAULT_RATE
    );
  }
  set mediaPlaybackRate(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_PLAYBACK_RATE, value);
  }
  handleClick() {
    var _a, _b;
    const availableRates = Array.from(media_playback_rate_button_privateGet(this, _rates).values(), (str) => +str).sort(
      (a, b) => a - b
    );
    const detail = (_b = (_a = availableRates.find((r) => r > this.mediaPlaybackRate)) != null ? _a : availableRates[0]) != null ? _b : DEFAULT_RATE;
    const evt = new GlobalThis.CustomEvent(
      MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
      { composed: true, bubbles: true, detail }
    );
    this.dispatchEvent(evt);
  }
}
_rates = new WeakMap();
MediaPlaybackRateButton.getSlotTemplateHTML = media_playback_rate_button_getSlotTemplateHTML;
MediaPlaybackRateButton.getTooltipContentHTML = media_playback_rate_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-playback-rate-button")) {
  GlobalThis.customElements.define(
    "media-playback-rate-button",
    MediaPlaybackRateButton
  );
}
var media_playback_rate_button_default = (/* unused pure expression or super */ null && (MediaPlaybackRateButton));


;// ../node_modules/media-chrome/dist/media-play-button.js





const playIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`;
const pauseIcon = `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`;
function media_play_button_getSlotTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host([${MediaUIAttributes.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${MediaUIAttributes.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${MediaUIAttributes.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${MediaUIAttributes.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${playIcon}</slot>
      <slot name="pause">${pauseIcon}</slot>
    </slot>
  `
  );
}
function media_play_button_getTooltipContentHTML() {
  return (
    /*html*/
    `
    <slot name="tooltip-play">${t("Play")}</slot>
    <slot name="tooltip-pause">${t("Pause")}</slot>
  `
  );
}
const media_play_button_updateAriaLabel = (el) => {
  const label = el.mediaPaused ? t("play") : t("pause");
  el.setAttribute("aria-label", label);
};
class MediaPlayButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PAUSED,
      MediaUIAttributes.MEDIA_ENDED
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    media_play_button_updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_PAUSED || attrName === MediaUIAttributes.MEDIA_LANG) {
      media_play_button_updateAriaLabel(this);
    }
  }
  /**
   * Is the media paused
   */
  get mediaPaused() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }
  set mediaPaused(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }
  handleClick() {
    const eventName = this.mediaPaused ? MediaUIEvents.MEDIA_PLAY_REQUEST : MediaUIEvents.MEDIA_PAUSE_REQUEST;
    this.dispatchEvent(
      new GlobalThis.CustomEvent(eventName, { composed: true, bubbles: true })
    );
  }
}
MediaPlayButton.getSlotTemplateHTML = media_play_button_getSlotTemplateHTML;
MediaPlayButton.getTooltipContentHTML = media_play_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-play-button")) {
  GlobalThis.customElements.define("media-play-button", MediaPlayButton);
}
var media_play_button_default = (/* unused pure expression or super */ null && (MediaPlayButton));


;// ../node_modules/media-chrome/dist/media-poster-image.js


const media_poster_image_Attributes = {
  PLACEHOLDER_SRC: "placeholdersrc",
  SRC: "src"
};
function media_poster_image_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `
  );
}
const unsetBackgroundImage = (el) => {
  el.style.removeProperty("background-image");
};
const setBackgroundImage = (el, image) => {
  el.style["background-image"] = `url('${image}')`;
};
class MediaPosterImage extends GlobalThis.HTMLElement {
  static get observedAttributes() {
    return [media_poster_image_Attributes.PLACEHOLDER_SRC, media_poster_image_Attributes.SRC];
  }
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
    this.image = this.shadowRoot.querySelector("#image");
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === media_poster_image_Attributes.SRC) {
      if (newValue == null) {
        this.image.removeAttribute(media_poster_image_Attributes.SRC);
      } else {
        this.image.setAttribute(media_poster_image_Attributes.SRC, newValue);
      }
    }
    if (attrName === media_poster_image_Attributes.PLACEHOLDER_SRC) {
      if (newValue == null) {
        unsetBackgroundImage(this.image);
      } else {
        setBackgroundImage(this.image, newValue);
      }
    }
  }
  /**
   *
   */
  get placeholderSrc() {
    return getStringAttr(this, media_poster_image_Attributes.PLACEHOLDER_SRC);
  }
  set placeholderSrc(value) {
    setStringAttr(this, media_poster_image_Attributes.SRC, value);
  }
  /**
   *
   */
  get src() {
    return getStringAttr(this, media_poster_image_Attributes.SRC);
  }
  set src(value) {
    setStringAttr(this, media_poster_image_Attributes.SRC, value);
  }
}
MediaPosterImage.shadowRootOptions = { mode: "open" };
MediaPosterImage.getTemplateHTML = media_poster_image_getTemplateHTML;
if (!GlobalThis.customElements.get("media-poster-image")) {
  GlobalThis.customElements.define("media-poster-image", MediaPosterImage);
}
var media_poster_image_default = (/* unused pure expression or super */ null && (MediaPosterImage));


;// ../node_modules/media-chrome/dist/media-preview-chapter-display.js
var media_preview_chapter_display_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_preview_chapter_display_privateGet = (obj, member, getter) => {
  media_preview_chapter_display_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_preview_chapter_display_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_preview_chapter_display_privateSet = (obj, member, value, setter) => {
  media_preview_chapter_display_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_preview_chapter_display_slot;





class MediaPreviewChapterDisplay extends MediaTextDisplay {
  constructor() {
    super();
    media_preview_chapter_display_privateAdd(this, media_preview_chapter_display_slot, void 0);
    media_preview_chapter_display_privateSet(this, media_preview_chapter_display_slot, this.shadowRoot.querySelector("slot"));
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PREVIEW_CHAPTER,
      MediaUIAttributes.MEDIA_LANG
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_PREVIEW_CHAPTER || attrName === MediaUIAttributes.MEDIA_LANG) {
      if (newValue !== oldValue && newValue != null) {
        media_preview_chapter_display_privateGet(this, media_preview_chapter_display_slot).textContent = newValue;
        if (newValue !== "") {
          const ariaValueText = t("chapter: {chapterName}", {
            chapterName: newValue
          });
          this.setAttribute("aria-valuetext", ariaValueText);
        } else {
          this.removeAttribute("aria-valuetext");
        }
      }
    }
  }
  /**
   * @type {string | undefined} Timeline preview chapter
   */
  get mediaPreviewChapter() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_PREVIEW_CHAPTER);
  }
  set mediaPreviewChapter(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_PREVIEW_CHAPTER, value);
  }
}
media_preview_chapter_display_slot = new WeakMap();
if (!GlobalThis.customElements.get("media-preview-chapter-display")) {
  GlobalThis.customElements.define(
    "media-preview-chapter-display",
    MediaPreviewChapterDisplay
  );
}
var media_preview_chapter_display_default = (/* unused pure expression or super */ null && (MediaPreviewChapterDisplay));


;// ../node_modules/media-chrome/dist/media-preview-thumbnail.js
var media_preview_thumbnail_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_preview_thumbnail_privateGet = (obj, member, getter) => {
  media_preview_thumbnail_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_preview_thumbnail_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_preview_thumbnail_privateSet = (obj, member, value, setter) => {
  media_preview_thumbnail_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_preview_thumbnail_mediaController;



function media_preview_thumbnail_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `
  );
}
class MediaPreviewThumbnail extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_preview_thumbnail_privateAdd(this, media_preview_thumbnail_mediaController, void 0);
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
  }
  static get observedAttributes() {
    return [
      MediaStateReceiverAttributes.MEDIA_CONTROLLER,
      MediaUIAttributes.MEDIA_PREVIEW_IMAGE,
      MediaUIAttributes.MEDIA_PREVIEW_COORDS
    ];
  }
  connectedCallback() {
    var _a, _b, _c;
    const mediaControllerId = this.getAttribute(
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    );
    if (mediaControllerId) {
      media_preview_thumbnail_privateSet(
        this,
        media_preview_thumbnail_mediaController,
        // @ts-ignore
        (_a = this.getRootNode()) == null ? void 0 : _a.getElementById(mediaControllerId)
      );
      (_c = (_b = media_preview_thumbnail_privateGet(this, media_preview_thumbnail_mediaController)) == null ? void 0 : _b.associateElement) == null ? void 0 : _c.call(_b, this);
    }
  }
  disconnectedCallback() {
    var _a, _b;
    (_b = (_a = media_preview_thumbnail_privateGet(this, media_preview_thumbnail_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_preview_thumbnail_privateSet(this, media_preview_thumbnail_mediaController, null);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d, _e;
    if ([
      MediaUIAttributes.MEDIA_PREVIEW_IMAGE,
      MediaUIAttributes.MEDIA_PREVIEW_COORDS
    ].includes(attrName)) {
      this.update();
    }
    if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_preview_thumbnail_privateGet(this, media_preview_thumbnail_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_preview_thumbnail_privateSet(this, media_preview_thumbnail_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_preview_thumbnail_privateSet(this, media_preview_thumbnail_mediaController, (_c = this.getRootNode()) == null ? void 0 : _c.getElementById(newValue));
        (_e = (_d = media_preview_thumbnail_privateGet(this, media_preview_thumbnail_mediaController)) == null ? void 0 : _d.associateElement) == null ? void 0 : _e.call(_d, this);
      }
    }
  }
  /**
   * @type {string | undefined} The url of the preview image
   */
  get mediaPreviewImage() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_PREVIEW_IMAGE);
  }
  set mediaPreviewImage(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_PREVIEW_IMAGE, value);
  }
  /**
   * @type {Array<number> | undefined} Fixed length array [x, y, width, height] or undefined
   */
  get mediaPreviewCoords() {
    const attrVal = this.getAttribute(MediaUIAttributes.MEDIA_PREVIEW_COORDS);
    if (!attrVal)
      return void 0;
    return attrVal.split(/\s+/).map((coord) => +coord);
  }
  set mediaPreviewCoords(value) {
    if (!value) {
      this.removeAttribute(MediaUIAttributes.MEDIA_PREVIEW_COORDS);
      return;
    }
    this.setAttribute(MediaUIAttributes.MEDIA_PREVIEW_COORDS, value.join(" "));
  }
  update() {
    const coords = this.mediaPreviewCoords;
    const previewImage = this.mediaPreviewImage;
    if (!(coords && previewImage))
      return;
    const [x, y, w, h] = coords;
    const src = previewImage.split("#")[0];
    const computedStyle = getComputedStyle(this);
    const { maxWidth, maxHeight, minWidth, minHeight } = computedStyle;
    const maxRatio = Math.min(parseInt(maxWidth) / w, parseInt(maxHeight) / h);
    const minRatio = Math.max(parseInt(minWidth) / w, parseInt(minHeight) / h);
    const isScalingDown = maxRatio < 1;
    const scale = isScalingDown ? maxRatio : minRatio > 1 ? minRatio : 1;
    const { style } = getOrInsertCSSRule(this.shadowRoot, ":host");
    const imgStyle = getOrInsertCSSRule(this.shadowRoot, "img").style;
    const img = this.shadowRoot.querySelector("img");
    const extremum = isScalingDown ? "min" : "max";
    style.setProperty(`${extremum}-width`, "initial", "important");
    style.setProperty(`${extremum}-height`, "initial", "important");
    style.width = `${w * scale}px`;
    style.height = `${h * scale}px`;
    const resize = () => {
      imgStyle.width = `${this.imgWidth * scale}px`;
      imgStyle.height = `${this.imgHeight * scale}px`;
      imgStyle.display = "block";
    };
    if (img.src !== src) {
      img.onload = () => {
        this.imgWidth = img.naturalWidth;
        this.imgHeight = img.naturalHeight;
        resize();
      };
      img.src = src;
      resize();
    }
    resize();
    imgStyle.transform = `translate(-${x * scale}px, -${y * scale}px)`;
  }
}
media_preview_thumbnail_mediaController = new WeakMap();
MediaPreviewThumbnail.shadowRootOptions = { mode: "open" };
MediaPreviewThumbnail.getTemplateHTML = media_preview_thumbnail_getTemplateHTML;
if (!GlobalThis.customElements.get("media-preview-thumbnail")) {
  GlobalThis.customElements.define(
    "media-preview-thumbnail",
    MediaPreviewThumbnail
  );
}
var media_preview_thumbnail_default = MediaPreviewThumbnail;


;// ../node_modules/media-chrome/dist/media-preview-time-display.js
var media_preview_time_display_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_preview_time_display_privateGet = (obj, member, getter) => {
  media_preview_time_display_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_preview_time_display_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_preview_time_display_privateSet = (obj, member, value, setter) => {
  media_preview_time_display_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_preview_time_display_slot;





class MediaPreviewTimeDisplay extends MediaTextDisplay {
  constructor() {
    super();
    media_preview_time_display_privateAdd(this, media_preview_time_display_slot, void 0);
    media_preview_time_display_privateSet(this, media_preview_time_display_slot, this.shadowRoot.querySelector("slot"));
    media_preview_time_display_privateGet(this, media_preview_time_display_slot).textContent = formatTime(0);
  }
  static get observedAttributes() {
    return [...super.observedAttributes, MediaUIAttributes.MEDIA_PREVIEW_TIME];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_PREVIEW_TIME && newValue != null) {
      media_preview_time_display_privateGet(this, media_preview_time_display_slot).textContent = formatTime(parseFloat(newValue));
    }
  }
  /**
   * Timeline preview time
   */
  get mediaPreviewTime() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_PREVIEW_TIME);
  }
  set mediaPreviewTime(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_PREVIEW_TIME, value);
  }
}
media_preview_time_display_slot = new WeakMap();
if (!GlobalThis.customElements.get("media-preview-time-display")) {
  GlobalThis.customElements.define(
    "media-preview-time-display",
    MediaPreviewTimeDisplay
  );
}
var media_preview_time_display_default = (/* unused pure expression or super */ null && (MediaPreviewTimeDisplay));


;// ../node_modules/media-chrome/dist/media-seek-backward-button.js





const media_seek_backward_button_Attributes = {
  SEEK_OFFSET: "seekoffset"
};
const media_seek_backward_button_DEFAULT_SEEK_OFFSET = 30;
const backwardIcon = (seekOffset) => `
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${seekOffset}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`;
function media_seek_backward_button_getSlotTemplateHTML(_attrs, props) {
  return (
    /*html*/
    `
    <slot name="icon">${backwardIcon(props.seekOffset)}</slot>
  `
  );
}
function media_seek_backward_button_getTooltipContentHTML() {
  return t("Seek backward");
}
const DEFAULT_TIME = 0;
class MediaSeekBackwardButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_CURRENT_TIME,
      media_seek_backward_button_Attributes.SEEK_OFFSET
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    this.seekOffset = getNumericAttr(
      this,
      media_seek_backward_button_Attributes.SEEK_OFFSET,
      media_seek_backward_button_DEFAULT_SEEK_OFFSET
    );
  }
  attributeChangedCallback(attrName, _oldValue, newValue) {
    super.attributeChangedCallback(attrName, _oldValue, newValue);
    if (attrName === media_seek_backward_button_Attributes.SEEK_OFFSET) {
      this.seekOffset = getNumericAttr(
        this,
        media_seek_backward_button_Attributes.SEEK_OFFSET,
        media_seek_backward_button_DEFAULT_SEEK_OFFSET
      );
    }
  }
  // Own props
  /**
   * Seek amount in seconds
   */
  get seekOffset() {
    return getNumericAttr(this, media_seek_backward_button_Attributes.SEEK_OFFSET, media_seek_backward_button_DEFAULT_SEEK_OFFSET);
  }
  set seekOffset(value) {
    setNumericAttr(this, media_seek_backward_button_Attributes.SEEK_OFFSET, value);
    this.setAttribute(
      "aria-label",
      t("seek back {seekOffset} seconds", { seekOffset: this.seekOffset })
    );
    updateIconText(getSlotted(this, "icon"), this.seekOffset);
  }
  // Props derived from Media UI Attributes
  /**
   * The current time in seconds
   */
  get mediaCurrentTime() {
    return getNumericAttr(
      this,
      MediaUIAttributes.MEDIA_CURRENT_TIME,
      DEFAULT_TIME
    );
  }
  set mediaCurrentTime(time) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME, time);
  }
  handleClick() {
    const detail = Math.max(this.mediaCurrentTime - this.seekOffset, 0);
    const evt = new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
      composed: true,
      bubbles: true,
      detail
    });
    this.dispatchEvent(evt);
  }
}
MediaSeekBackwardButton.getSlotTemplateHTML = media_seek_backward_button_getSlotTemplateHTML;
MediaSeekBackwardButton.getTooltipContentHTML = media_seek_backward_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-seek-backward-button")) {
  GlobalThis.customElements.define(
    "media-seek-backward-button",
    MediaSeekBackwardButton
  );
}
var media_seek_backward_button_default = (/* unused pure expression or super */ null && (MediaSeekBackwardButton));


;// ../node_modules/media-chrome/dist/media-seek-forward-button.js





const media_seek_forward_button_Attributes = {
  SEEK_OFFSET: "seekoffset"
};
const media_seek_forward_button_DEFAULT_SEEK_OFFSET = 30;
const forwardIcon = (seekOffset) => `
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${seekOffset}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`;
function media_seek_forward_button_getSlotTemplateHTML(_attrs, props) {
  return (
    /*html*/
    `
    <slot name="icon">${forwardIcon(props.seekOffset)}</slot>
  `
  );
}
function media_seek_forward_button_getTooltipContentHTML() {
  return t("Seek forward");
}
const media_seek_forward_button_DEFAULT_TIME = 0;
class MediaSeekForwardButton extends MediaChromeButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_CURRENT_TIME,
      media_seek_forward_button_Attributes.SEEK_OFFSET
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    this.seekOffset = getNumericAttr(
      this,
      media_seek_forward_button_Attributes.SEEK_OFFSET,
      media_seek_forward_button_DEFAULT_SEEK_OFFSET
    );
  }
  attributeChangedCallback(attrName, _oldValue, newValue) {
    super.attributeChangedCallback(attrName, _oldValue, newValue);
    if (attrName === media_seek_forward_button_Attributes.SEEK_OFFSET) {
      this.seekOffset = getNumericAttr(
        this,
        media_seek_forward_button_Attributes.SEEK_OFFSET,
        media_seek_forward_button_DEFAULT_SEEK_OFFSET
      );
    }
  }
  // Own props
  /**
   * Seek amount in seconds
   */
  get seekOffset() {
    return getNumericAttr(this, media_seek_forward_button_Attributes.SEEK_OFFSET, media_seek_forward_button_DEFAULT_SEEK_OFFSET);
  }
  set seekOffset(value) {
    setNumericAttr(this, media_seek_forward_button_Attributes.SEEK_OFFSET, value);
    this.setAttribute(
      "aria-label",
      t("seek forward {seekOffset} seconds", { seekOffset: this.seekOffset })
    );
    updateIconText(getSlotted(this, "icon"), this.seekOffset);
  }
  // Props derived from Media UI Attributes
  /**
   * The current time in seconds
   */
  get mediaCurrentTime() {
    return getNumericAttr(
      this,
      MediaUIAttributes.MEDIA_CURRENT_TIME,
      media_seek_forward_button_DEFAULT_TIME
    );
  }
  set mediaCurrentTime(time) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME, time);
  }
  handleClick() {
    const detail = this.mediaCurrentTime + this.seekOffset;
    const evt = new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
      composed: true,
      bubbles: true,
      detail
    });
    this.dispatchEvent(evt);
  }
}
MediaSeekForwardButton.getSlotTemplateHTML = media_seek_forward_button_getSlotTemplateHTML;
MediaSeekForwardButton.getTooltipContentHTML = media_seek_forward_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-seek-forward-button")) {
  GlobalThis.customElements.define(
    "media-seek-forward-button",
    MediaSeekForwardButton
  );
}
var media_seek_forward_button_default = (/* unused pure expression or super */ null && (MediaSeekForwardButton));


;// ../node_modules/media-chrome/dist/media-time-display.js
var media_time_display_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_time_display_privateGet = (obj, member, getter) => {
  media_time_display_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_time_display_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_time_display_privateSet = (obj, member, value, setter) => {
  media_time_display_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_time_display_slot;






const media_time_display_Attributes = {
  REMAINING: "remaining",
  SHOW_DURATION: "showduration",
  NO_TOGGLE: "notoggle"
};
const CombinedAttributes = [
  ...Object.values(media_time_display_Attributes),
  MediaUIAttributes.MEDIA_CURRENT_TIME,
  MediaUIAttributes.MEDIA_DURATION,
  MediaUIAttributes.MEDIA_SEEKABLE
];
const media_time_display_ButtonPressedKeys = ["Enter", " "];
const DEFAULT_TIMES_SEP = "&nbsp;/&nbsp;";
const formatTimesLabel = (el, { timesSep = DEFAULT_TIMES_SEP } = {}) => {
  var _a, _b;
  const currentTime = (_a = el.mediaCurrentTime) != null ? _a : 0;
  const [, seekableEnd] = (_b = el.mediaSeekable) != null ? _b : [];
  let endTime = 0;
  if (Number.isFinite(el.mediaDuration)) {
    endTime = el.mediaDuration;
  } else if (Number.isFinite(seekableEnd)) {
    endTime = seekableEnd;
  }
  const timeLabel = el.remaining ? formatTime(0 - (endTime - currentTime)) : formatTime(currentTime);
  if (!el.showDuration)
    return timeLabel;
  return `${timeLabel}${timesSep}${formatTime(endTime)}`;
};
const DEFAULT_MISSING_TIME_PHRASE = "video not loaded, unknown time.";
const updateAriaValueText = (el) => {
  var _a;
  const currentTime = el.mediaCurrentTime;
  const [, seekableEnd] = (_a = el.mediaSeekable) != null ? _a : [];
  let endTime = null;
  if (Number.isFinite(el.mediaDuration)) {
    endTime = el.mediaDuration;
  } else if (Number.isFinite(seekableEnd)) {
    endTime = seekableEnd;
  }
  if (currentTime == null || endTime === null) {
    el.setAttribute("aria-valuetext", DEFAULT_MISSING_TIME_PHRASE);
    return;
  }
  const currentTimePhrase = el.remaining ? formatAsTimePhrase(0 - (endTime - currentTime)) : formatAsTimePhrase(currentTime);
  if (!el.showDuration) {
    el.setAttribute("aria-valuetext", currentTimePhrase);
    return;
  }
  const totalTimePhrase = formatAsTimePhrase(endTime);
  const fullPhrase = `${currentTimePhrase} of ${totalTimePhrase}`;
  el.setAttribute("aria-valuetext", fullPhrase);
};
function media_time_display_getSlotTemplateHTML(_attrs, props) {
  return (
    /*html*/
    `
    <slot>${formatTimesLabel(props)}</slot>
  `
  );
}
class MediaTimeDisplay extends MediaTextDisplay {
  constructor() {
    super();
    media_time_display_privateAdd(this, media_time_display_slot, void 0);
    media_time_display_privateSet(this, media_time_display_slot, this.shadowRoot.querySelector("slot"));
    media_time_display_privateGet(this, media_time_display_slot).innerHTML = `${formatTimesLabel(this)}`;
  }
  static get observedAttributes() {
    return [...super.observedAttributes, ...CombinedAttributes, "disabled"];
  }
  connectedCallback() {
    const { style } = getOrInsertCSSRule(
      this.shadowRoot,
      ":host(:hover:not([notoggle]))"
    );
    style.setProperty("cursor", "var(--media-cursor, pointer)");
    style.setProperty(
      "background",
      "var(--media-control-hover-background, rgba(50 50 70 / .7))"
    );
    if (!this.hasAttribute("disabled")) {
      this.enable();
    }
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-label", t("playback time"));
    const keyUpHandler = (evt) => {
      const { key } = evt;
      if (!media_time_display_ButtonPressedKeys.includes(key)) {
        this.removeEventListener("keyup", keyUpHandler);
        return;
      }
      this.toggleTimeDisplay();
    };
    this.addEventListener("keydown", (evt) => {
      const { metaKey, altKey, key } = evt;
      if (metaKey || altKey || !media_time_display_ButtonPressedKeys.includes(key)) {
        this.removeEventListener("keyup", keyUpHandler);
        return;
      }
      this.addEventListener("keyup", keyUpHandler);
    });
    this.addEventListener("click", this.toggleTimeDisplay);
    super.connectedCallback();
  }
  toggleTimeDisplay() {
    if (this.noToggle) {
      return;
    }
    if (this.hasAttribute("remaining")) {
      this.removeAttribute("remaining");
    } else {
      this.setAttribute("remaining", "");
    }
  }
  disconnectedCallback() {
    this.disable();
    super.disconnectedCallback();
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (CombinedAttributes.includes(attrName)) {
      this.update();
    } else if (attrName === "disabled" && newValue !== oldValue) {
      if (newValue == null) {
        this.enable();
      } else {
        this.disable();
      }
    }
    super.attributeChangedCallback(attrName, oldValue, newValue);
  }
  enable() {
    this.tabIndex = 0;
  }
  disable() {
    this.tabIndex = -1;
  }
  // Own props
  /**
   * Whether to show the remaining time
   */
  get remaining() {
    return getBooleanAttr(this, media_time_display_Attributes.REMAINING);
  }
  set remaining(show) {
    setBooleanAttr(this, media_time_display_Attributes.REMAINING, show);
  }
  /**
   * Whether to show the duration
   */
  get showDuration() {
    return getBooleanAttr(this, media_time_display_Attributes.SHOW_DURATION);
  }
  set showDuration(show) {
    setBooleanAttr(this, media_time_display_Attributes.SHOW_DURATION, show);
  }
  /**
   * Disable the default behavior that toggles between current and remaining time
   */
  get noToggle() {
    return getBooleanAttr(this, media_time_display_Attributes.NO_TOGGLE);
  }
  set noToggle(noToggle) {
    setBooleanAttr(this, media_time_display_Attributes.NO_TOGGLE, noToggle);
  }
  // Props derived from media UI attributes
  /**
   * Get the duration
   */
  get mediaDuration() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_DURATION);
  }
  set mediaDuration(time) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_DURATION, time);
  }
  /**
   * The current time in seconds
   */
  get mediaCurrentTime() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME);
  }
  set mediaCurrentTime(time) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME, time);
  }
  /**
   * Range of values that can be seeked to.
   * An array of two numbers [start, end]
   */
  get mediaSeekable() {
    const seekable = this.getAttribute(MediaUIAttributes.MEDIA_SEEKABLE);
    if (!seekable)
      return void 0;
    return seekable.split(":").map((time) => +time);
  }
  set mediaSeekable(range) {
    if (range == null) {
      this.removeAttribute(MediaUIAttributes.MEDIA_SEEKABLE);
      return;
    }
    this.setAttribute(MediaUIAttributes.MEDIA_SEEKABLE, range.join(":"));
  }
  update() {
    const timesLabel = formatTimesLabel(this);
    updateAriaValueText(this);
    if (timesLabel !== media_time_display_privateGet(this, media_time_display_slot).innerHTML) {
      media_time_display_privateGet(this, media_time_display_slot).innerHTML = timesLabel;
    }
  }
}
media_time_display_slot = new WeakMap();
MediaTimeDisplay.getSlotTemplateHTML = media_time_display_getSlotTemplateHTML;
if (!GlobalThis.customElements.get("media-time-display")) {
  GlobalThis.customElements.define("media-time-display", MediaTimeDisplay);
}
var media_time_display_default = (/* unused pure expression or super */ null && (MediaTimeDisplay));


;// ../node_modules/media-chrome/dist/utils/range-animation.js
var range_animation_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var range_animation_privateGet = (obj, member, getter) => {
  range_animation_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var range_animation_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var range_animation_privateSet = (obj, member, value, setter) => {
  range_animation_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    range_animation_privateSet(obj, member, value, setter);
  },
  get _() {
    return range_animation_privateGet(obj, member, getter);
  }
});
var _range, _startTime, _previousTime, _deltaTime, _frameCount, _updateTimestamp, _updateStartValue, _lastRangeIncrease, _id, _animate;
class RangeAnimation {
  constructor(range, callback, fps) {
    range_animation_privateAdd(this, _range, void 0);
    range_animation_privateAdd(this, _startTime, void 0);
    range_animation_privateAdd(this, _previousTime, void 0);
    range_animation_privateAdd(this, _deltaTime, void 0);
    range_animation_privateAdd(this, _frameCount, void 0);
    range_animation_privateAdd(this, _updateTimestamp, void 0);
    range_animation_privateAdd(this, _updateStartValue, void 0);
    range_animation_privateAdd(this, _lastRangeIncrease, void 0);
    range_animation_privateAdd(this, _id, 0);
    range_animation_privateAdd(this, _animate, (now = performance.now()) => {
      range_animation_privateSet(this, _id, requestAnimationFrame(range_animation_privateGet(this, _animate)));
      range_animation_privateSet(this, _deltaTime, performance.now() - range_animation_privateGet(this, _previousTime));
      const fpsInterval = 1e3 / this.fps;
      if (range_animation_privateGet(this, _deltaTime) > fpsInterval) {
        range_animation_privateSet(this, _previousTime, now - range_animation_privateGet(this, _deltaTime) % fpsInterval);
        const fps = 1e3 / ((now - range_animation_privateGet(this, _startTime)) / ++__privateWrapper(this, _frameCount)._);
        const delta = (now - range_animation_privateGet(this, _updateTimestamp)) / 1e3 / this.duration;
        let value = range_animation_privateGet(this, _updateStartValue) + delta * this.playbackRate;
        const increase = value - range_animation_privateGet(this, _range).valueAsNumber;
        if (increase > 0) {
          range_animation_privateSet(this, _lastRangeIncrease, this.playbackRate / this.duration / fps);
        } else {
          range_animation_privateSet(this, _lastRangeIncrease, 0.995 * range_animation_privateGet(this, _lastRangeIncrease));
          value = range_animation_privateGet(this, _range).valueAsNumber + range_animation_privateGet(this, _lastRangeIncrease);
        }
        this.callback(value);
      }
    });
    range_animation_privateSet(this, _range, range);
    this.callback = callback;
    this.fps = fps;
  }
  start() {
    if (range_animation_privateGet(this, _id) !== 0)
      return;
    range_animation_privateSet(this, _previousTime, performance.now());
    range_animation_privateSet(this, _startTime, range_animation_privateGet(this, _previousTime));
    range_animation_privateSet(this, _frameCount, 0);
    range_animation_privateGet(this, _animate).call(this);
  }
  stop() {
    if (range_animation_privateGet(this, _id) === 0)
      return;
    cancelAnimationFrame(range_animation_privateGet(this, _id));
    range_animation_privateSet(this, _id, 0);
  }
  update({ start, duration, playbackRate }) {
    const increase = start - range_animation_privateGet(this, _range).valueAsNumber;
    const durationDelta = Math.abs(duration - this.duration);
    if (increase > 0 || increase < -0.03 || durationDelta >= 0.5) {
      this.callback(start);
    }
    range_animation_privateSet(this, _updateStartValue, start);
    range_animation_privateSet(this, _updateTimestamp, performance.now());
    this.duration = duration;
    this.playbackRate = playbackRate;
  }
}
_range = new WeakMap();
_startTime = new WeakMap();
_previousTime = new WeakMap();
_deltaTime = new WeakMap();
_frameCount = new WeakMap();
_updateTimestamp = new WeakMap();
_updateStartValue = new WeakMap();
_lastRangeIncrease = new WeakMap();
_id = new WeakMap();
_animate = new WeakMap();


;// ../node_modules/media-chrome/dist/media-time-range.js
var media_time_range_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_time_range_privateGet = (obj, member, getter) => {
  media_time_range_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_time_range_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_time_range_privateSet = (obj, member, value, setter) => {
  media_time_range_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_time_range_privateMethod = (obj, member, method) => {
  media_time_range_accessCheck(obj, member, "access private method");
  return method;
};
var _rootNode, _animation, _boxes, _previewTime, _previewBox, _currentBox, _boxPaddingLeft, _boxPaddingRight, _mediaChaptersCues, _isPointerDown, _toggleRangeAnimation, toggleRangeAnimation_fn, _shouldRangeAnimate, shouldRangeAnimate_fn, _updateRange, _getElementRects, getElementRects_fn, _getBoxPosition, getBoxPosition_fn, _getBoxShiftPosition, getBoxShiftPosition_fn, media_time_range_handlePointerMove, media_time_range_handlePointerMove_fn, _previewRequest, previewRequest_fn, _seekRequest, seekRequest_fn;













const media_time_range_DEFAULT_MISSING_TIME_PHRASE = "video not loaded, unknown time.";
const media_time_range_updateAriaValueText = (el) => {
  const range = el.range;
  const currentTimePhrase = formatAsTimePhrase(+calcTimeFromRangeValue(el));
  const totalTimePhrase = formatAsTimePhrase(+el.mediaSeekableEnd);
  const fullPhrase = !(currentTimePhrase && totalTimePhrase) ? media_time_range_DEFAULT_MISSING_TIME_PHRASE : `${currentTimePhrase} of ${totalTimePhrase}`;
  range.setAttribute("aria-valuetext", fullPhrase);
};
function media_time_range_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${MediaChromeRange.getTemplateHTML(_attrs)}
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        ${/* 1% rail width trick was off in Safari, contain: layout seems to
    prevent the horizontal overflow as well. */
    ""}
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        ${/* absolute position is needed here so the box doesn't overflow the bounds */
    ""}
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}], [${MediaUIAttributes.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}], [${MediaUIAttributes.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        ${/* delay changing these CSS props until the preview box transition is ended */
    ""}
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${MediaUIAttributes.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        ${/* delay changing these CSS props until the preview box transition is ended */
    ""}
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${MediaUIAttributes.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${MediaUIAttributes.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        ${/* delay changing these CSS props until the preview box transition is ended */
    ""}
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${MediaUIAttributes.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${MediaUIAttributes.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        ${/* border-color has to come before border-top-color! */
    ""}
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${media_preview_thumbnail_default.shadowRootOptions.mode}">
            ${media_preview_thumbnail_default.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        ${/* Example: add the current time w/ arrow to the playhead
    <media-time-display slot="current"></media-time-display>
    <div part="arrow" slot="current"></div> */
    ""}
      </slot>
    </div>
  `
  );
}
const calcRangeValueFromTime = (el, time = el.mediaCurrentTime) => {
  const startTime = Number.isFinite(el.mediaSeekableStart) ? el.mediaSeekableStart : 0;
  const endTime = Number.isFinite(el.mediaDuration) ? el.mediaDuration : el.mediaSeekableEnd;
  if (Number.isNaN(endTime))
    return 0;
  const value = (time - startTime) / (endTime - startTime);
  return Math.max(0, Math.min(value, 1));
};
const calcTimeFromRangeValue = (el, value = el.range.valueAsNumber) => {
  const startTime = Number.isFinite(el.mediaSeekableStart) ? el.mediaSeekableStart : 0;
  const endTime = Number.isFinite(el.mediaDuration) ? el.mediaDuration : el.mediaSeekableEnd;
  if (Number.isNaN(endTime))
    return 0;
  return value * (endTime - startTime) + startTime;
};
class MediaTimeRange extends MediaChromeRange {
  constructor() {
    super();
    media_time_range_privateAdd(this, _toggleRangeAnimation);
    media_time_range_privateAdd(this, _shouldRangeAnimate);
    media_time_range_privateAdd(this, _getElementRects);
    /**
     * Get the position, max and min for the box in percentage.
     * It's important this is in percentage so when the player is resized
     * the box will move accordingly.
     */
    media_time_range_privateAdd(this, _getBoxPosition);
    media_time_range_privateAdd(this, _getBoxShiftPosition);
    media_time_range_privateAdd(this, media_time_range_handlePointerMove);
    media_time_range_privateAdd(this, _previewRequest);
    media_time_range_privateAdd(this, _seekRequest);
    media_time_range_privateAdd(this, _rootNode, void 0);
    media_time_range_privateAdd(this, _animation, void 0);
    media_time_range_privateAdd(this, _boxes, void 0);
    media_time_range_privateAdd(this, _previewTime, void 0);
    media_time_range_privateAdd(this, _previewBox, void 0);
    media_time_range_privateAdd(this, _currentBox, void 0);
    media_time_range_privateAdd(this, _boxPaddingLeft, void 0);
    media_time_range_privateAdd(this, _boxPaddingRight, void 0);
    media_time_range_privateAdd(this, _mediaChaptersCues, void 0);
    media_time_range_privateAdd(this, _isPointerDown, void 0);
    media_time_range_privateAdd(this, _updateRange, (value) => {
      if (this.dragging)
        return;
      if (isValidNumber(value)) {
        this.range.valueAsNumber = value;
      }
      if (!media_time_range_privateGet(this, _isPointerDown)) {
        this.updateBar();
      }
    });
    const track = this.shadowRoot.querySelector("#track");
    track.insertAdjacentHTML(
      "afterbegin",
      '<div id="buffered" part="buffered"></div>'
    );
    media_time_range_privateSet(this, _boxes, this.shadowRoot.querySelectorAll('[part~="box"]'));
    media_time_range_privateSet(this, _previewBox, this.shadowRoot.querySelector('[part~="preview-box"]'));
    media_time_range_privateSet(this, _currentBox, this.shadowRoot.querySelector('[part~="current-box"]'));
    const computedStyle = getComputedStyle(this);
    media_time_range_privateSet(this, _boxPaddingLeft, parseInt(
      computedStyle.getPropertyValue("--media-box-padding-left")
    ));
    media_time_range_privateSet(this, _boxPaddingRight, parseInt(
      computedStyle.getPropertyValue("--media-box-padding-right")
    ));
    media_time_range_privateSet(this, _animation, new RangeAnimation(this.range, media_time_range_privateGet(this, _updateRange), 60));
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PAUSED,
      MediaUIAttributes.MEDIA_DURATION,
      MediaUIAttributes.MEDIA_SEEKABLE,
      MediaUIAttributes.MEDIA_CURRENT_TIME,
      MediaUIAttributes.MEDIA_PREVIEW_IMAGE,
      MediaUIAttributes.MEDIA_PREVIEW_TIME,
      MediaUIAttributes.MEDIA_PREVIEW_CHAPTER,
      MediaUIAttributes.MEDIA_BUFFERED,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE,
      MediaUIAttributes.MEDIA_LOADING,
      MediaUIAttributes.MEDIA_ENDED
    ];
  }
  connectedCallback() {
    var _a;
    super.connectedCallback();
    this.range.setAttribute("aria-label", t("seek"));
    media_time_range_privateMethod(this, _toggleRangeAnimation, toggleRangeAnimation_fn).call(this);
    media_time_range_privateSet(this, _rootNode, this.getRootNode());
    (_a = media_time_range_privateGet(this, _rootNode)) == null ? void 0 : _a.addEventListener("transitionstart", this);
  }
  disconnectedCallback() {
    var _a;
    super.disconnectedCallback();
    media_time_range_privateMethod(this, _toggleRangeAnimation, toggleRangeAnimation_fn).call(this);
    (_a = media_time_range_privateGet(this, _rootNode)) == null ? void 0 : _a.removeEventListener("transitionstart", this);
    media_time_range_privateSet(this, _rootNode, null);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (oldValue == newValue)
      return;
    if (attrName === MediaUIAttributes.MEDIA_CURRENT_TIME || attrName === MediaUIAttributes.MEDIA_PAUSED || attrName === MediaUIAttributes.MEDIA_ENDED || attrName === MediaUIAttributes.MEDIA_LOADING || attrName === MediaUIAttributes.MEDIA_DURATION || attrName === MediaUIAttributes.MEDIA_SEEKABLE) {
      media_time_range_privateGet(this, _animation).update({
        start: calcRangeValueFromTime(this),
        duration: this.mediaSeekableEnd - this.mediaSeekableStart,
        playbackRate: this.mediaPlaybackRate
      });
      media_time_range_privateMethod(this, _toggleRangeAnimation, toggleRangeAnimation_fn).call(this);
      media_time_range_updateAriaValueText(this);
    } else if (attrName === MediaUIAttributes.MEDIA_BUFFERED) {
      this.updateBufferedBar();
    }
    if (attrName === MediaUIAttributes.MEDIA_DURATION || attrName === MediaUIAttributes.MEDIA_SEEKABLE) {
      this.mediaChaptersCues = media_time_range_privateGet(this, _mediaChaptersCues);
      this.updateBar();
    }
  }
  get mediaChaptersCues() {
    return media_time_range_privateGet(this, _mediaChaptersCues);
  }
  set mediaChaptersCues(value) {
    var _a;
    media_time_range_privateSet(this, _mediaChaptersCues, value);
    this.updateSegments(
      (_a = media_time_range_privateGet(this, _mediaChaptersCues)) == null ? void 0 : _a.map((c) => ({
        start: calcRangeValueFromTime(this, c.startTime),
        end: calcRangeValueFromTime(this, c.endTime)
      }))
    );
  }
  /**
   * Is the media paused
   */
  get mediaPaused() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }
  set mediaPaused(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }
  /**
   * Is the media loading
   */
  get mediaLoading() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_LOADING);
  }
  set mediaLoading(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_LOADING, value);
  }
  /**
   *
   */
  get mediaDuration() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_DURATION);
  }
  set mediaDuration(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_DURATION, value);
  }
  /**
   *
   */
  get mediaCurrentTime() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME);
  }
  set mediaCurrentTime(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_CURRENT_TIME, value);
  }
  /**
   *
   */
  get mediaPlaybackRate() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_PLAYBACK_RATE, 1);
  }
  set mediaPlaybackRate(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_PLAYBACK_RATE, value);
  }
  /**
   * An array of ranges, each range being an array of two numbers.
   * e.g. [[1, 2], [3, 4]]
   */
  get mediaBuffered() {
    const buffered = this.getAttribute(MediaUIAttributes.MEDIA_BUFFERED);
    if (!buffered)
      return [];
    return buffered.split(" ").map((timePair) => timePair.split(":").map((timeStr) => +timeStr));
  }
  set mediaBuffered(list) {
    if (!list) {
      this.removeAttribute(MediaUIAttributes.MEDIA_BUFFERED);
      return;
    }
    const strVal = list.map((tuple) => tuple.join(":")).join(" ");
    this.setAttribute(MediaUIAttributes.MEDIA_BUFFERED, strVal);
  }
  /**
   * Range of values that can be seeked to
   * An array of two numbers [start, end]
   */
  get mediaSeekable() {
    const seekable = this.getAttribute(MediaUIAttributes.MEDIA_SEEKABLE);
    if (!seekable)
      return void 0;
    return seekable.split(":").map((time) => +time);
  }
  set mediaSeekable(range) {
    if (range == null) {
      this.removeAttribute(MediaUIAttributes.MEDIA_SEEKABLE);
      return;
    }
    this.setAttribute(MediaUIAttributes.MEDIA_SEEKABLE, range.join(":"));
  }
  /**
   *
   */
  get mediaSeekableEnd() {
    var _a;
    const [, end = this.mediaDuration] = (_a = this.mediaSeekable) != null ? _a : [];
    return end;
  }
  get mediaSeekableStart() {
    var _a;
    const [start = 0] = (_a = this.mediaSeekable) != null ? _a : [];
    return start;
  }
  /**
   * The url of the preview image
   */
  get mediaPreviewImage() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_PREVIEW_IMAGE);
  }
  set mediaPreviewImage(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_PREVIEW_IMAGE, value);
  }
  /**
   *
   */
  get mediaPreviewTime() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_PREVIEW_TIME);
  }
  set mediaPreviewTime(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_PREVIEW_TIME, value);
  }
  /**
   *
   */
  get mediaEnded() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_ENDED);
  }
  set mediaEnded(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_ENDED, value);
  }
  /* Add a buffered progress bar */
  updateBar() {
    super.updateBar();
    this.updateBufferedBar();
    this.updateCurrentBox();
  }
  updateBufferedBar() {
    var _a;
    const buffered = this.mediaBuffered;
    if (!buffered.length) {
      return;
    }
    let relativeBufferedEnd;
    if (!this.mediaEnded) {
      const currentTime = this.mediaCurrentTime;
      const [, bufferedEnd = this.mediaSeekableStart] = (_a = buffered.find(
        ([start, end]) => start <= currentTime && currentTime <= end
      )) != null ? _a : [];
      relativeBufferedEnd = calcRangeValueFromTime(this, bufferedEnd);
    } else {
      relativeBufferedEnd = 1;
    }
    const { style } = getOrInsertCSSRule(this.shadowRoot, "#buffered");
    style.setProperty("width", `${relativeBufferedEnd * 100}%`);
  }
  updateCurrentBox() {
    const currentSlot = this.shadowRoot.querySelector(
      'slot[name="current"]'
    );
    if (!currentSlot.assignedElements().length)
      return;
    const currentRailRule = getOrInsertCSSRule(
      this.shadowRoot,
      "#current-rail"
    );
    const currentBoxRule = getOrInsertCSSRule(
      this.shadowRoot,
      '[part~="current-box"]'
    );
    const rects = media_time_range_privateMethod(this, _getElementRects, getElementRects_fn).call(this, media_time_range_privateGet(this, _currentBox));
    const boxPos = media_time_range_privateMethod(this, _getBoxPosition, getBoxPosition_fn).call(this, rects, this.range.valueAsNumber);
    const boxShift = media_time_range_privateMethod(this, _getBoxShiftPosition, getBoxShiftPosition_fn).call(this, rects, this.range.valueAsNumber);
    currentRailRule.style.transform = `translateX(${boxPos})`;
    currentRailRule.style.setProperty("--_range-width", `${rects.range.width}`);
    currentBoxRule.style.setProperty("--_box-shift", `${boxShift}`);
    currentBoxRule.style.setProperty("--_box-width", `${rects.box.width}px`);
    currentBoxRule.style.setProperty("visibility", "initial");
  }
  handleEvent(evt) {
    super.handleEvent(evt);
    switch (evt.type) {
      case "input":
        media_time_range_privateMethod(this, _seekRequest, seekRequest_fn).call(this);
        break;
      case "pointermove":
        media_time_range_privateMethod(this, media_time_range_handlePointerMove, media_time_range_handlePointerMove_fn).call(this, evt);
        break;
      case "pointerup":
        if (media_time_range_privateGet(this, _isPointerDown))
          media_time_range_privateSet(this, _isPointerDown, false);
        break;
      case "pointerdown":
        media_time_range_privateSet(this, _isPointerDown, true);
        break;
      case "pointerleave":
        media_time_range_privateMethod(this, _previewRequest, previewRequest_fn).call(this, null);
        break;
      case "transitionstart":
        if (containsComposedNode(evt.target, this)) {
          setTimeout(() => media_time_range_privateMethod(this, _toggleRangeAnimation, toggleRangeAnimation_fn).call(this), 0);
        }
        break;
    }
  }
}
_rootNode = new WeakMap();
_animation = new WeakMap();
_boxes = new WeakMap();
_previewTime = new WeakMap();
_previewBox = new WeakMap();
_currentBox = new WeakMap();
_boxPaddingLeft = new WeakMap();
_boxPaddingRight = new WeakMap();
_mediaChaptersCues = new WeakMap();
_isPointerDown = new WeakMap();
_toggleRangeAnimation = new WeakSet();
toggleRangeAnimation_fn = function() {
  if (media_time_range_privateMethod(this, _shouldRangeAnimate, shouldRangeAnimate_fn).call(this)) {
    media_time_range_privateGet(this, _animation).start();
  } else {
    media_time_range_privateGet(this, _animation).stop();
  }
};
_shouldRangeAnimate = new WeakSet();
shouldRangeAnimate_fn = function() {
  return this.isConnected && !this.mediaPaused && !this.mediaLoading && !this.mediaEnded && this.mediaSeekableEnd > 0 && isElementVisible(this);
};
_updateRange = new WeakMap();
_getElementRects = new WeakSet();
getElementRects_fn = function(box) {
  var _a;
  const bounds = (_a = this.getAttribute("bounds") ? closestComposedNode(this, `#${this.getAttribute("bounds")}`) : this.parentElement) != null ? _a : this;
  const boundsRect = bounds.getBoundingClientRect();
  const rangeRect = this.range.getBoundingClientRect();
  const width = box.offsetWidth;
  const min = -(rangeRect.left - boundsRect.left - width / 2);
  const max = boundsRect.right - rangeRect.left - width / 2;
  return {
    box: { width, min, max },
    bounds: boundsRect,
    range: rangeRect
  };
};
_getBoxPosition = new WeakSet();
getBoxPosition_fn = function(rects, ratio) {
  let position = `${ratio * 100}%`;
  const { width, min, max } = rects.box;
  if (!width)
    return position;
  if (!Number.isNaN(min)) {
    const pad = `var(--media-box-padding-left)`;
    const minPos = `calc(1 / var(--_range-width) * 100 * ${min}% + ${pad})`;
    position = `max(${minPos}, ${position})`;
  }
  if (!Number.isNaN(max)) {
    const pad = `var(--media-box-padding-right)`;
    const maxPos = `calc(1 / var(--_range-width) * 100 * ${max}% - ${pad})`;
    position = `min(${position}, ${maxPos})`;
  }
  return position;
};
_getBoxShiftPosition = new WeakSet();
getBoxShiftPosition_fn = function(rects, ratio) {
  const { width, min, max } = rects.box;
  const pointerX = ratio * rects.range.width;
  if (pointerX < min + media_time_range_privateGet(this, _boxPaddingLeft)) {
    const offset = rects.range.left - rects.bounds.left - media_time_range_privateGet(this, _boxPaddingLeft);
    return `${pointerX - width / 2 + offset}px`;
  }
  if (pointerX > max - media_time_range_privateGet(this, _boxPaddingRight)) {
    const offset = rects.bounds.right - rects.range.right - media_time_range_privateGet(this, _boxPaddingRight);
    return `${pointerX + width / 2 - offset - rects.range.width}px`;
  }
  return 0;
};
media_time_range_handlePointerMove = new WeakSet();
media_time_range_handlePointerMove_fn = function(evt) {
  const isOverBoxes = [...media_time_range_privateGet(this, _boxes)].some(
    (b) => evt.composedPath().includes(b)
  );
  if (!this.dragging && (isOverBoxes || !evt.composedPath().includes(this))) {
    media_time_range_privateMethod(this, _previewRequest, previewRequest_fn).call(this, null);
    return;
  }
  const duration = this.mediaSeekableEnd;
  if (!duration)
    return;
  const previewRailRule = getOrInsertCSSRule(
    this.shadowRoot,
    "#preview-rail"
  );
  const previewBoxRule = getOrInsertCSSRule(
    this.shadowRoot,
    '[part~="preview-box"]'
  );
  const rects = media_time_range_privateMethod(this, _getElementRects, getElementRects_fn).call(this, media_time_range_privateGet(this, _previewBox));
  let pointerRatio = (evt.clientX - rects.range.left) / rects.range.width;
  pointerRatio = Math.max(0, Math.min(1, pointerRatio));
  const boxPos = media_time_range_privateMethod(this, _getBoxPosition, getBoxPosition_fn).call(this, rects, pointerRatio);
  const boxShift = media_time_range_privateMethod(this, _getBoxShiftPosition, getBoxShiftPosition_fn).call(this, rects, pointerRatio);
  previewRailRule.style.transform = `translateX(${boxPos})`;
  previewRailRule.style.setProperty("--_range-width", `${rects.range.width}`);
  previewBoxRule.style.setProperty("--_box-shift", `${boxShift}`);
  previewBoxRule.style.setProperty("--_box-width", `${rects.box.width}px`);
  const diff = Math.round(media_time_range_privateGet(this, _previewTime)) - Math.round(pointerRatio * duration);
  if (Math.abs(diff) < 1 && pointerRatio > 0.01 && pointerRatio < 0.99)
    return;
  media_time_range_privateSet(this, _previewTime, pointerRatio * duration);
  media_time_range_privateMethod(this, _previewRequest, previewRequest_fn).call(this, media_time_range_privateGet(this, _previewTime));
};
_previewRequest = new WeakSet();
previewRequest_fn = function(detail) {
  this.dispatchEvent(
    new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_PREVIEW_REQUEST, {
      composed: true,
      bubbles: true,
      detail
    })
  );
};
_seekRequest = new WeakSet();
seekRequest_fn = function() {
  media_time_range_privateGet(this, _animation).stop();
  const detail = calcTimeFromRangeValue(this);
  this.dispatchEvent(
    new GlobalThis.CustomEvent(MediaUIEvents.MEDIA_SEEK_REQUEST, {
      composed: true,
      bubbles: true,
      detail
    })
  );
};
MediaTimeRange.shadowRootOptions = { mode: "open" };
MediaTimeRange.getTemplateHTML = media_time_range_getTemplateHTML;
if (!GlobalThis.customElements.get("media-time-range")) {
  GlobalThis.customElements.define("media-time-range", MediaTimeRange);
}
var media_time_range_default = (/* unused pure expression or super */ null && (MediaTimeRange));


;// ../node_modules/media-chrome/dist/media-volume-range.js





const DEFAULT_VOLUME = 1;
const toVolume = (el) => {
  if (el.mediaMuted)
    return 0;
  return el.mediaVolume;
};
const formatAsPercentString = (value) => `${Math.round(value * 100)}%`;
class MediaVolumeRange extends MediaChromeRange {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_VOLUME,
      MediaUIAttributes.MEDIA_MUTED,
      MediaUIAttributes.MEDIA_VOLUME_UNAVAILABLE
    ];
  }
  constructor() {
    super();
    this.range.addEventListener("input", () => {
      const detail = this.range.value;
      const evt = new GlobalThis.CustomEvent(
        MediaUIEvents.MEDIA_VOLUME_REQUEST,
        {
          composed: true,
          bubbles: true,
          detail
        }
      );
      this.dispatchEvent(evt);
    });
  }
  connectedCallback() {
    super.connectedCallback();
    this.range.setAttribute("aria-label", t("volume"));
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_VOLUME || attrName === MediaUIAttributes.MEDIA_MUTED) {
      this.range.valueAsNumber = toVolume(this);
      this.range.setAttribute(
        "aria-valuetext",
        formatAsPercentString(this.range.valueAsNumber)
      );
      this.updateBar();
    }
  }
  /**
   *
   */
  get mediaVolume() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_VOLUME, DEFAULT_VOLUME);
  }
  set mediaVolume(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_VOLUME, value);
  }
  /**
   * Is the media currently muted
   */
  get mediaMuted() {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_MUTED);
  }
  set mediaMuted(value) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_MUTED, value);
  }
  /**
   * The volume unavailability state
   */
  get mediaVolumeUnavailable() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_VOLUME_UNAVAILABLE);
  }
  set mediaVolumeUnavailable(value) {
    setStringAttr(this, MediaUIAttributes.MEDIA_VOLUME_UNAVAILABLE, value);
  }
}
if (!GlobalThis.customElements.get("media-volume-range")) {
  GlobalThis.customElements.define("media-volume-range", MediaVolumeRange);
}
var media_volume_range_default = (/* unused pure expression or super */ null && (MediaVolumeRange));


;// ../node_modules/media-chrome/dist/index.js



































;// ../node_modules/media-chrome/dist/utils/template-parts.js
var template_parts_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var template_parts_privateGet = (obj, member, getter) => {
  template_parts_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var template_parts_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var template_parts_privateSet = (obj, member, value, setter) => {
  template_parts_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _parts, _processor, _items, _value, _element, _attributeName, _namespaceURI, _list, list_get, _parentNode, _nodes;

const ELEMENT = 1;
const STRING = 0;
const PART = 1;
const defaultProcessor = {
  processCallback(instance, parts, state) {
    if (!state)
      return;
    for (const [expression, part] of parts) {
      if (expression in state) {
        const value = state[expression];
        if (typeof value === "boolean" && part instanceof AttrPart && typeof part.element[part.attributeName] === "boolean") {
          part.booleanValue = value;
        } else if (typeof value === "function" && part instanceof AttrPart) {
          part.element[part.attributeName] = value;
        } else {
          part.value = value;
        }
      }
    }
  }
};
class TemplateInstance extends GlobalThis.DocumentFragment {
  constructor(template, state, processor = defaultProcessor) {
    var _a;
    super();
    template_parts_privateAdd(this, _parts, void 0);
    template_parts_privateAdd(this, _processor, void 0);
    this.append(template.content.cloneNode(true));
    template_parts_privateSet(this, _parts, parse(this));
    template_parts_privateSet(this, _processor, processor);
    (_a = processor.createCallback) == null ? void 0 : _a.call(processor, this, template_parts_privateGet(this, _parts), state);
    processor.processCallback(this, template_parts_privateGet(this, _parts), state);
  }
  update(state) {
    template_parts_privateGet(this, _processor).processCallback(this, template_parts_privateGet(this, _parts), state);
  }
}
_parts = new WeakMap();
_processor = new WeakMap();
const parse = (element, parts = []) => {
  let type, value;
  for (const attr of element.attributes || []) {
    if (attr.value.includes("{{")) {
      const list = new AttrPartList();
      for ([type, value] of tokenize(attr.value)) {
        if (!type)
          list.append(value);
        else {
          const part = new AttrPart(element, attr.name, attr.namespaceURI);
          list.append(part);
          parts.push([value, part]);
        }
      }
      attr.value = list.toString();
    }
  }
  for (const node of element.childNodes) {
    if (node.nodeType === ELEMENT && !(node instanceof HTMLTemplateElement)) {
      parse(node, parts);
    } else {
      const data = node.data;
      if (node.nodeType === ELEMENT || data.includes("{{")) {
        const items = [];
        if (data) {
          for ([type, value] of tokenize(data))
            if (!type)
              items.push(new Text(value));
            else {
              const part = new ChildNodePart(element);
              items.push(part);
              parts.push([value, part]);
            }
        } else if (node instanceof HTMLTemplateElement) {
          const part = new InnerTemplatePart(element, node);
          items.push(part);
          parts.push([part.expression, part]);
        }
        node.replaceWith(
          ...items.flatMap((part) => part.replacementNodes || [part])
        );
      }
    }
  }
  return parts;
};
const mem = {};
const tokenize = (text) => {
  let value = "", open = 0, tokens = mem[text], i = 0, c;
  if (tokens)
    return tokens;
  else
    tokens = [];
  for (; c = text[i]; i++) {
    if (c === "{" && text[i + 1] === "{" && text[i - 1] !== "\\" && text[i + 2] && ++open == 1) {
      if (value)
        tokens.push([STRING, value]);
      value = "";
      i++;
    } else if (c === "}" && text[i + 1] === "}" && text[i - 1] !== "\\" && !--open) {
      tokens.push([PART, value.trim()]);
      value = "";
      i++;
    } else
      value += c || "";
  }
  if (value)
    tokens.push([STRING, (open > 0 ? "{{" : "") + value]);
  return mem[text] = tokens;
};
const FRAGMENT = 11;
class Part {
  get value() {
    return "";
  }
  set value(val) {
  }
  toString() {
    return this.value;
  }
}
const attrPartToList = /* @__PURE__ */ new WeakMap();
class AttrPartList {
  constructor() {
    template_parts_privateAdd(this, _items, []);
  }
  [Symbol.iterator]() {
    return template_parts_privateGet(this, _items).values();
  }
  get length() {
    return template_parts_privateGet(this, _items).length;
  }
  item(index) {
    return template_parts_privateGet(this, _items)[index];
  }
  append(...items) {
    for (const item of items) {
      if (item instanceof AttrPart) {
        attrPartToList.set(item, this);
      }
      template_parts_privateGet(this, _items).push(item);
    }
  }
  toString() {
    return template_parts_privateGet(this, _items).join("");
  }
}
_items = new WeakMap();
class AttrPart extends Part {
  constructor(element, attributeName, namespaceURI) {
    super();
    template_parts_privateAdd(this, _list);
    template_parts_privateAdd(this, _value, "");
    template_parts_privateAdd(this, _element, void 0);
    template_parts_privateAdd(this, _attributeName, void 0);
    template_parts_privateAdd(this, _namespaceURI, void 0);
    template_parts_privateSet(this, _element, element);
    template_parts_privateSet(this, _attributeName, attributeName);
    template_parts_privateSet(this, _namespaceURI, namespaceURI);
  }
  get attributeName() {
    return template_parts_privateGet(this, _attributeName);
  }
  get attributeNamespace() {
    return template_parts_privateGet(this, _namespaceURI);
  }
  get element() {
    return template_parts_privateGet(this, _element);
  }
  get value() {
    return template_parts_privateGet(this, _value);
  }
  set value(newValue) {
    if (template_parts_privateGet(this, _value) === newValue)
      return;
    template_parts_privateSet(this, _value, newValue);
    if (!template_parts_privateGet(this, _list, list_get) || template_parts_privateGet(this, _list, list_get).length === 1) {
      if (newValue == null) {
        template_parts_privateGet(this, _element).removeAttributeNS(
          template_parts_privateGet(this, _namespaceURI),
          template_parts_privateGet(this, _attributeName)
        );
      } else {
        template_parts_privateGet(this, _element).setAttributeNS(
          template_parts_privateGet(this, _namespaceURI),
          template_parts_privateGet(this, _attributeName),
          newValue
        );
      }
    } else {
      template_parts_privateGet(this, _element).setAttributeNS(
        template_parts_privateGet(this, _namespaceURI),
        template_parts_privateGet(this, _attributeName),
        template_parts_privateGet(this, _list, list_get).toString()
      );
    }
  }
  get booleanValue() {
    return template_parts_privateGet(this, _element).hasAttributeNS(
      template_parts_privateGet(this, _namespaceURI),
      template_parts_privateGet(this, _attributeName)
    );
  }
  set booleanValue(value) {
    if (!template_parts_privateGet(this, _list, list_get) || template_parts_privateGet(this, _list, list_get).length === 1)
      this.value = value ? "" : null;
    else
      throw new DOMException("Value is not fully templatized");
  }
}
_value = new WeakMap();
_element = new WeakMap();
_attributeName = new WeakMap();
_namespaceURI = new WeakMap();
_list = new WeakSet();
list_get = function() {
  return attrPartToList.get(this);
};
class ChildNodePart extends Part {
  constructor(parentNode, nodes) {
    super();
    template_parts_privateAdd(this, _parentNode, void 0);
    template_parts_privateAdd(this, _nodes, void 0);
    template_parts_privateSet(this, _parentNode, parentNode);
    template_parts_privateSet(this, _nodes, nodes ? [...nodes] : [new Text()]);
  }
  get replacementNodes() {
    return template_parts_privateGet(this, _nodes);
  }
  get parentNode() {
    return template_parts_privateGet(this, _parentNode);
  }
  get nextSibling() {
    return template_parts_privateGet(this, _nodes)[template_parts_privateGet(this, _nodes).length - 1].nextSibling;
  }
  get previousSibling() {
    return template_parts_privateGet(this, _nodes)[0].previousSibling;
  }
  // FIXME: not sure why do we need string serialization here? Just because parent class has type DOMString?
  get value() {
    return template_parts_privateGet(this, _nodes).map((node) => node.textContent).join("");
  }
  set value(newValue) {
    this.replace(newValue);
  }
  replace(...nodes) {
    const normalisedNodes = nodes.flat().flatMap(
      (node) => node == null ? [new Text()] : node.forEach ? [...node] : node.nodeType === FRAGMENT ? [...node.childNodes] : node.nodeType ? [node] : [new Text(node)]
    );
    if (!normalisedNodes.length)
      normalisedNodes.push(new Text());
    template_parts_privateSet(this, _nodes, swapdom(
      template_parts_privateGet(this, _nodes)[0].parentNode,
      template_parts_privateGet(this, _nodes),
      normalisedNodes,
      this.nextSibling
    ));
  }
}
_parentNode = new WeakMap();
_nodes = new WeakMap();
class InnerTemplatePart extends ChildNodePart {
  constructor(parentNode, template) {
    const directive = template.getAttribute("directive") || template.getAttribute("type");
    let expression = template.getAttribute("expression") || template.getAttribute(directive) || "";
    if (expression.startsWith("{{"))
      expression = expression.trim().slice(2, -2).trim();
    super(parentNode);
    this.expression = expression;
    this.template = template;
    this.directive = directive;
  }
}
function swapdom(parent, a, b, end = null) {
  let i = 0, cur, next, bi, n = b.length, m = a.length;
  while (i < n && i < m && a[i] == b[i])
    i++;
  while (i < n && i < m && b[n - 1] == a[m - 1])
    end = b[--m, --n];
  if (i == m)
    while (i < n)
      parent.insertBefore(b[i++], end);
  if (i == n)
    while (i < m)
      parent.removeChild(a[i++]);
  else {
    cur = a[i];
    while (i < n) {
      bi = b[i++], next = cur ? cur.nextSibling : end;
      if (cur == bi)
        cur = next;
      else if (i < n && b[i] == next)
        parent.replaceChild(bi, cur), cur = next;
      else
        parent.insertBefore(bi, cur);
    }
    while (cur != end)
      next = cur.nextSibling, parent.removeChild(cur), cur = next;
  }
  return b;
}


;// ../node_modules/media-chrome/dist/utils/template-processor.js


const pipeModifiers = {
  string: (value) => String(value)
};
class PartialTemplate {
  constructor(template) {
    this.template = template;
    this.state = void 0;
  }
}
const templates = /* @__PURE__ */ new WeakMap();
const templateInstances = /* @__PURE__ */ new WeakMap();
const Directives = {
  partial: (part, state) => {
    state[part.expression] = new PartialTemplate(part.template);
  },
  if: (part, state) => {
    var _a;
    if (evaluateExpression(part.expression, state)) {
      if (templates.get(part) !== part.template) {
        templates.set(part, part.template);
        const tpl = new TemplateInstance(part.template, state, processor);
        part.replace(tpl);
        templateInstances.set(part, tpl);
      } else {
        (_a = templateInstances.get(part)) == null ? void 0 : _a.update(state);
      }
    } else {
      part.replace("");
      templates.delete(part);
      templateInstances.delete(part);
    }
  }
};
const DirectiveNames = Object.keys(Directives);
const processor = {
  processCallback(instance, parts, state) {
    var _a, _b;
    if (!state)
      return;
    for (const [expression, part] of parts) {
      if (part instanceof InnerTemplatePart) {
        if (!part.directive) {
          const directive = DirectiveNames.find(
            (n) => part.template.hasAttribute(n)
          );
          if (directive) {
            part.directive = directive;
            part.expression = part.template.getAttribute(directive);
          }
        }
        (_a = Directives[part.directive]) == null ? void 0 : _a.call(Directives, part, state);
        continue;
      }
      let value = evaluateExpression(expression, state);
      if (value instanceof PartialTemplate) {
        if (templates.get(part) !== value.template) {
          templates.set(part, value.template);
          value = new TemplateInstance(value.template, value.state, processor);
          part.value = value;
          templateInstances.set(part, value);
        } else {
          (_b = templateInstances.get(part)) == null ? void 0 : _b.update(value.state);
        }
        continue;
      }
      if (value) {
        if (part instanceof AttrPart) {
          if (part.attributeName.startsWith("aria-")) {
            value = String(value);
          }
        }
        if (part instanceof AttrPart) {
          if (typeof value === "boolean") {
            part.booleanValue = value;
          } else if (typeof value === "function") {
            part.element[part.attributeName] = value;
          } else {
            part.value = value;
          }
        } else {
          part.value = value;
          templates.delete(part);
          templateInstances.delete(part);
        }
      } else {
        if (part instanceof AttrPart) {
          part.value = void 0;
        } else {
          part.value = void 0;
          templates.delete(part);
          templateInstances.delete(part);
        }
      }
    }
  }
};
const operators = {
  "!": (a) => !a,
  "!!": (a) => !!a,
  "==": (a, b) => a == b,
  "!=": (a, b) => a != b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  "??": (a, b) => a != null ? a : b,
  "|": (a, b) => {
    var _a;
    return (_a = pipeModifiers[b]) == null ? void 0 : _a.call(pipeModifiers, a);
  }
};
function tokenizeExpression(expr) {
  return template_processor_tokenize(expr, {
    boolean: /true|false/,
    number: /-?\d+\.?\d*/,
    string: /(["'])((?:\\.|[^\\])*?)\1/,
    operator: /[!=><][=!]?|\?\?|\|/,
    ws: /\s+/,
    param: /[$a-z_][$\w]*/i
  }).filter(({ type }) => type !== "ws");
}
function evaluateExpression(expr, state = {}) {
  var _a, _b, _c, _d, _e, _f, _g;
  const tokens = tokenizeExpression(expr);
  if (tokens.length === 0 || tokens.some(({ type }) => !type)) {
    return invalidExpression(expr);
  }
  if (((_a = tokens[0]) == null ? void 0 : _a.token) === ">") {
    const partial = state[(_b = tokens[1]) == null ? void 0 : _b.token];
    if (!partial) {
      return invalidExpression(expr);
    }
    const partialState = { ...state };
    partial.state = partialState;
    const args = tokens.slice(2);
    for (let i = 0; i < args.length; i += 3) {
      const name = (_c = args[i]) == null ? void 0 : _c.token;
      const operator = (_d = args[i + 1]) == null ? void 0 : _d.token;
      const value = (_e = args[i + 2]) == null ? void 0 : _e.token;
      if (name && operator === "=") {
        partialState[name] = getParamValue(value, state);
      }
    }
    return partial;
  }
  if (tokens.length === 1) {
    if (!isValidParam(tokens[0])) {
      return invalidExpression(expr);
    }
    return getParamValue(tokens[0].token, state);
  }
  if (tokens.length === 2) {
    const operator = (_f = tokens[0]) == null ? void 0 : _f.token;
    const run = operators[operator];
    if (!run || !isValidParam(tokens[1])) {
      return invalidExpression(expr);
    }
    const a = getParamValue(tokens[1].token, state);
    return run(a);
  }
  if (tokens.length === 3) {
    const operator = (_g = tokens[1]) == null ? void 0 : _g.token;
    const run = operators[operator];
    if (!run || !isValidParam(tokens[0]) || !isValidParam(tokens[2])) {
      return invalidExpression(expr);
    }
    const a = getParamValue(tokens[0].token, state);
    if (operator === "|") {
      return run(a, tokens[2].token);
    }
    const b = getParamValue(tokens[2].token, state);
    return run(a, b);
  }
}
function invalidExpression(expr) {
  console.warn(`Warning: invalid expression \`${expr}\``);
  return false;
}
function isValidParam({ type }) {
  return ["number", "boolean", "string", "param"].includes(type);
}
function getParamValue(raw, state) {
  const firstChar = raw[0];
  const lastChar = raw.slice(-1);
  if (raw === "true" || raw === "false") {
    return raw === "true";
  }
  if (firstChar === lastChar && [`'`, `"`].includes(firstChar)) {
    return raw.slice(1, -1);
  }
  if (isNumericString(raw)) {
    return parseFloat(raw);
  }
  return state[raw];
}
function template_processor_tokenize(str, parsers) {
  let len, match, token;
  const tokens = [];
  while (str) {
    token = null;
    len = str.length;
    for (const key in parsers) {
      match = parsers[key].exec(str);
      if (match && match.index < len) {
        token = {
          token: match[0],
          type: key,
          matches: match.slice(1)
        };
        len = match.index;
      }
    }
    if (len) {
      tokens.push({
        token: str.substr(0, len),
        type: void 0
      });
    }
    if (token) {
      tokens.push(token);
    }
    str = str.substr(len + (token ? token.token.length : 0));
  }
  return tokens;
}


;// ../node_modules/media-chrome/dist/media-theme-element.js
var media_theme_element_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_theme_element_privateGet = (obj, member, getter) => {
  media_theme_element_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_theme_element_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_theme_element_privateSet = (obj, member, value, setter) => {
  media_theme_element_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_theme_element_privateMethod = (obj, member, method) => {
  media_theme_element_accessCheck(obj, member, "access private method");
  return method;
};
var _template, _prevTemplate, _prevTemplateId, _upgradeProperty, upgradeProperty_fn, _updateTemplate, updateTemplate_fn;






const observedMediaAttributes = {
  mediatargetlivewindow: "targetlivewindow",
  mediastreamtype: "streamtype"
};
const prependTemplate = server_safe_globals_Document.createElement("template");
prependTemplate.innerHTML = /*html*/
`
  <style>
    :host {
      display: inline-block;
      line-height: 0;
    }

    media-controller {
      width: 100%;
      height: 100%;
    }

    media-captions-button:not([mediasubtitleslist]),
    media-captions-menu:not([mediasubtitleslist]),
    media-captions-menu-button:not([mediasubtitleslist]),
    media-audio-track-menu[mediaaudiotrackunavailable],
    media-audio-track-menu-button[mediaaudiotrackunavailable],
    media-rendition-menu[mediarenditionunavailable],
    media-rendition-menu-button[mediarenditionunavailable],
    media-volume-range[mediavolumeunavailable],
    media-airplay-button[mediaairplayunavailable],
    media-fullscreen-button[mediafullscreenunavailable],
    media-cast-button[mediacastunavailable],
    media-pip-button[mediapipunavailable] {
      display: none;
    }
  </style>
`;
class MediaThemeElement extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_theme_element_privateAdd(this, _upgradeProperty);
    media_theme_element_privateAdd(this, _updateTemplate);
    media_theme_element_privateAdd(this, _template, void 0);
    media_theme_element_privateAdd(this, _prevTemplate, void 0);
    media_theme_element_privateAdd(this, _prevTemplateId, void 0);
    if (this.shadowRoot) {
      this.renderRoot = this.shadowRoot;
    } else {
      this.renderRoot = this.attachShadow({ mode: "open" });
      this.createRenderer();
    }
    const observer = new MutationObserver((mutationList) => {
      var _a;
      if (this.mediaController && !((_a = this.mediaController) == null ? void 0 : _a.breakpointsComputed))
        return;
      if (mutationList.some((mutation) => {
        const target = mutation.target;
        if (target === this)
          return true;
        if (target.localName !== "media-controller")
          return false;
        if (observedMediaAttributes[mutation.attributeName])
          return true;
        if (mutation.attributeName.startsWith("breakpoint"))
          return true;
        return false;
      })) {
        this.render();
      }
    });
    observer.observe(this, { attributes: true });
    observer.observe(this.renderRoot, {
      attributes: true,
      subtree: true
    });
    this.addEventListener(
      MediaStateChangeEvents.BREAKPOINTS_COMPUTED,
      this.render
    );
    media_theme_element_privateMethod(this, _upgradeProperty, upgradeProperty_fn).call(this, "template");
  }
  /** @type {HTMLElement & { breakpointsComputed?: boolean }} */
  get mediaController() {
    return this.renderRoot.querySelector("media-controller");
  }
  get template() {
    var _a;
    return (_a = media_theme_element_privateGet(this, _template)) != null ? _a : this.constructor.template;
  }
  set template(value) {
    if (value === null) {
      this.removeAttribute("template");
      return;
    }
    if (typeof value === "string") {
      this.setAttribute("template", value);
    } else if (value instanceof HTMLTemplateElement) {
      media_theme_element_privateSet(this, _template, value);
      media_theme_element_privateSet(this, _prevTemplateId, null);
      this.createRenderer();
    }
  }
  get props() {
    var _a, _b, _c;
    const observedAttributes = [
      ...Array.from((_b = (_a = this.mediaController) == null ? void 0 : _a.attributes) != null ? _b : []).filter(
        ({ name }) => {
          return observedMediaAttributes[name] || name.startsWith("breakpoint");
        }
      ),
      ...Array.from(this.attributes)
    ];
    const props = {};
    for (const attr of observedAttributes) {
      const name = (_c = observedMediaAttributes[attr.name]) != null ? _c : camelCase(attr.name);
      let { value } = attr;
      if (value != null) {
        if (isNumericString(value)) {
          value = parseFloat(value);
        }
        props[name] = value === "" ? true : value;
      } else {
        props[name] = false;
      }
    }
    return props;
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === "template" && oldValue != newValue) {
      media_theme_element_privateMethod(this, _updateTemplate, updateTemplate_fn).call(this);
    }
  }
  connectedCallback() {
    media_theme_element_privateMethod(this, _updateTemplate, updateTemplate_fn).call(this);
  }
  createRenderer() {
    if (this.template instanceof HTMLTemplateElement && this.template !== media_theme_element_privateGet(this, _prevTemplate)) {
      media_theme_element_privateSet(this, _prevTemplate, this.template);
      this.renderer = new TemplateInstance(
        this.template,
        this.props,
        // @ts-ignore
        this.constructor.processor
      );
      this.renderRoot.textContent = "";
      this.renderRoot.append(
        prependTemplate.content.cloneNode(true),
        this.renderer
      );
    }
  }
  render() {
    var _a;
    (_a = this.renderer) == null ? void 0 : _a.update(this.props);
  }
}
_template = new WeakMap();
_prevTemplate = new WeakMap();
_prevTemplateId = new WeakMap();
_upgradeProperty = new WeakSet();
upgradeProperty_fn = function(prop) {
  if (Object.prototype.hasOwnProperty.call(this, prop)) {
    const value = this[prop];
    delete this[prop];
    this[prop] = value;
  }
};
_updateTemplate = new WeakSet();
updateTemplate_fn = function() {
  var _a;
  const templateId = this.getAttribute("template");
  if (!templateId || templateId === media_theme_element_privateGet(this, _prevTemplateId))
    return;
  const rootNode = this.getRootNode();
  const template = (_a = rootNode == null ? void 0 : rootNode.getElementById) == null ? void 0 : _a.call(
    rootNode,
    templateId
  );
  if (template) {
    media_theme_element_privateSet(this, _prevTemplateId, templateId);
    media_theme_element_privateSet(this, _template, template);
    this.createRenderer();
    return;
  }
  if (isValidUrl(templateId)) {
    media_theme_element_privateSet(this, _prevTemplateId, templateId);
    request(templateId).then((data) => {
      const template2 = server_safe_globals_Document.createElement("template");
      template2.innerHTML = data;
      media_theme_element_privateSet(this, _template, template2);
      this.createRenderer();
    }).catch(console.error);
  }
};
MediaThemeElement.observedAttributes = ["template"];
MediaThemeElement.processor = processor;
function isValidUrl(url) {
  if (!/^(\/|\.\/|https?:\/\/)/.test(url))
    return false;
  const base = /^https?:\/\//.test(url) ? void 0 : location.origin;
  try {
    new URL(url, base);
  } catch (e) {
    return false;
  }
  return true;
}
async function request(resource) {
  const response = await fetch(resource);
  if (response.status !== 200) {
    throw new Error(
      `Failed to load resource: the server responded with a status of ${response.status}`
    );
  }
  return response.text();
}
if (!GlobalThis.customElements.get("media-theme")) {
  GlobalThis.customElements.define("media-theme", MediaThemeElement);
}


;// ../node_modules/media-chrome/dist/utils/anchor-utils.js
function computePosition({
  anchor,
  floating,
  placement
}) {
  const rects = getElementRects({ anchor, floating });
  const { x, y } = computeCoordsFromPlacement(rects, placement);
  return { x, y };
}
function getElementRects({
  anchor,
  floating
}) {
  return {
    anchor: getRectRelativeToOffsetParent(anchor, floating.offsetParent),
    floating: {
      x: 0,
      y: 0,
      width: floating.offsetWidth,
      height: floating.offsetHeight
    }
  };
}
function getRectRelativeToOffsetParent(element, offsetParent) {
  var _a;
  const rect = element.getBoundingClientRect();
  const offsetRect = (_a = offsetParent == null ? void 0 : offsetParent.getBoundingClientRect()) != null ? _a : { x: 0, y: 0 };
  return {
    x: rect.x - offsetRect.x,
    y: rect.y - offsetRect.y,
    width: rect.width,
    height: rect.height
  };
}
function computeCoordsFromPlacement({ anchor, floating }, placement) {
  const alignmentAxis = getSideAxis(placement) === "x" ? "y" : "x";
  const alignLength = alignmentAxis === "y" ? "height" : "width";
  const side = getSide(placement);
  const commonX = anchor.x + anchor.width / 2 - floating.width / 2;
  const commonY = anchor.y + anchor.height / 2 - floating.height / 2;
  const commonAlign = anchor[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = { x: commonX, y: anchor.y - floating.height };
      break;
    case "bottom":
      coords = { x: commonX, y: anchor.y + anchor.height };
      break;
    case "right":
      coords = { x: anchor.x + anchor.width, y: commonY };
      break;
    case "left":
      coords = { x: anchor.x - floating.width, y: commonY };
      break;
    default:
      coords = { x: anchor.x, y: anchor.y };
  }
  switch (placement.split("-")[1]) {
    case "start":
      coords[alignmentAxis] -= commonAlign;
      break;
    case "end":
      coords[alignmentAxis] += commonAlign;
      break;
  }
  return coords;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}


;// ../node_modules/media-chrome/dist/utils/events.js
class InvokeEvent extends Event {
  /**
   * @param init - The event options.
   */
  constructor({ action = "auto", relatedTarget, ...options }) {
    super("invoke", options);
    this.action = action;
    this.relatedTarget = relatedTarget;
  }
}
class ToggleEvent extends Event {
  /**
   * @param init - The event options.
   */
  constructor({ newState, oldState, ...options }) {
    super("toggle", options);
    this.newState = newState;
    this.oldState = oldState;
  }
}


;// ../node_modules/media-chrome/dist/menu/media-chrome-menu.js
var media_chrome_menu_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_chrome_menu_privateGet = (obj, member, getter) => {
  media_chrome_menu_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_chrome_menu_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_chrome_menu_privateSet = (obj, member, value, setter) => {
  media_chrome_menu_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_chrome_menu_privateMethod = (obj, member, method) => {
  media_chrome_menu_accessCheck(obj, member, "access private method");
  return method;
};
var media_chrome_menu_mediaController, media_chrome_menu_previouslyFocused, media_chrome_menu_invokerElement, _previousItems, media_chrome_menu_mutationObserver, _isPopover, _cssRule, _handleSlotChange, handleSlotChange_fn, _toggleHeader, toggleHeader_fn, _handleMenuItems, _updateLayoutStyle, updateLayoutStyle_fn, media_chrome_menu_handleInvoke, media_chrome_menu_handleInvoke_fn, media_chrome_menu_handleOpen, media_chrome_menu_handleOpen_fn, media_chrome_menu_handleClosed, media_chrome_menu_handleClosed_fn, _handleBoundsResize, _handleMenuResize, _positionMenu, positionMenu_fn, _resizeMenu, resizeMenu_fn, _handleClick, handleClick_fn, _backButtonElement, backButtonElement_get, _handleToggle, handleToggle_fn, _checkSubmenuHasExpanded, checkSubmenuHasExpanded_fn, media_chrome_menu_handleFocusOut, media_chrome_menu_handleFocusOut_fn, media_chrome_menu_handleKeyDown, media_chrome_menu_handleKeyDown_fn, _getItem, getItem_fn, _getTabItem, getTabItem_fn, _setTabItem, setTabItem_fn, _selectItem, selectItem_fn;






function createMenuItem({
  type,
  text,
  value,
  checked
}) {
  const item = server_safe_globals_Document.createElement(
    "media-chrome-menu-item"
  );
  item.type = type != null ? type : "";
  item.part.add("menu-item");
  if (type)
    item.part.add(type);
  item.value = value;
  item.checked = checked;
  const label = server_safe_globals_Document.createElement("span");
  label.textContent = text;
  item.append(label);
  return item;
}
function createIndicator(el, name) {
  let customIndicator = el.querySelector(`:scope > [slot="${name}"]`);
  if ((customIndicator == null ? void 0 : customIndicator.nodeName) == "SLOT")
    customIndicator = customIndicator.assignedElements({ flatten: true })[0];
  if (customIndicator) {
    customIndicator = customIndicator.cloneNode(true);
    return customIndicator;
  }
  const fallbackIndicator = el.shadowRoot.querySelector(
    `[name="${name}"] > svg`
  );
  if (fallbackIndicator) {
    return fallbackIndicator.cloneNode(true);
  }
  return "";
}
function media_chrome_menu_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-menu-background, var(--media-control-background, var(--media-secondary-color, var(--_menu-bg))));
        border-radius: var(--media-menu-border-radius);
        border: var(--media-menu-border, none);
        display: var(--media-menu-display, inline-flex) !important;
        ${/* ^^Prevent override by Tailwind CSS causing the menu to not hide properly. */
    ""}
        transition: var(--media-menu-transition-in,
          visibility 0s,
          opacity .2s ease-out,
          transform .15s ease-out,
          left .2s ease-in-out,
          min-width .2s ease-in-out,
          min-height .2s ease-in-out
        ) !important;
        ${/* ^^Prevent transition override by media-container */
    ""}
        visibility: var(--media-menu-visibility, visible);
        opacity: var(--media-menu-opacity, 1);
        max-height: var(--media-menu-max-height, var(--_menu-max-height, 300px));
        transform: var(--media-menu-transform-in, translateY(0) scale(1));
        flex-direction: column;
        ${/* Prevent overflowing a flex container */
    ""}
        min-height: 0;
        position: relative;
        bottom: var(--_menu-bottom);
        box-sizing: border-box;
      } 

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([hidden]) {
        transition: var(--media-menu-transition-out,
          visibility .15s ease-in,
          opacity .15s ease-in,
          transform .15s ease-in
        ) !important;
        visibility: var(--media-menu-hidden-visibility, hidden);
        opacity: var(--media-menu-hidden-opacity, 0);
        max-height: var(--media-menu-hidden-max-height,
          var(--media-menu-max-height, var(--_menu-max-height, 300px)));
        transform: var(--media-menu-transform-out, translateY(2px) scale(.99));
        pointer-events: none;
      }

      :host([slot="submenu"]) {
        background: none;
        width: 100%;
        min-height: 100%;
        position: absolute;
        bottom: 0;
        right: -100%;
      }

      #container {
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: transform .2s ease-out;
        transform: translate(0, 0);
      }

      #container.has-expanded {
        transition: transform .2s ease-in;
        transform: translate(-100%, 0);
      }

      button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        outline: inherit;
        display: inline-flex;
        align-items: center;
      }

      slot[name="header"][hidden] {
        display: none;
      }

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .7em;
        border-bottom: 1px solid rgb(255 255 255 / .25);
        cursor: var(--media-cursor, default);
      }

      slot[name="header"] > button[part~="back"],
      slot[name="header"]::slotted(button[part~="back"]) {
        cursor: var(--media-cursor, pointer);
      }

      svg[part~="back"] {
        height: var(--media-menu-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
        margin-right: .5ch;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap);
        flex-direction: var(--media-menu-flex-direction, column);
        overflow: var(--media-menu-overflow, hidden auto);
        display: flex;
        min-height: 0;
      }

      :host([role="menu"]) slot:not([name]) {
        padding-block: .4em;
      }

      slot:not([name])::slotted([role="menu"]) {
        background: none;
      }

      media-chrome-menu-item > span {
        margin-right: .5ch;
        max-width: var(--media-menu-item-max-width);
        text-overflow: ellipsis;
        overflow: hidden;
      }
    </style>
    <style id="layout-row" media="width:0">

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .5em;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap, .25em);
        flex-direction: var(--media-menu-flex-direction, row);
        padding-inline: .5em;
      }

      media-chrome-menu-item {
        padding: .3em .5em;
      }

      media-chrome-menu-item[aria-checked="true"] {
        background: var(--media-menu-item-checked-background, rgb(255 255 255 / .2));
      }

      ${/* In row layout hide the checked indicator completely. */
    ""}
      media-chrome-menu-item::part(checked-indicator) {
        display: var(--media-menu-item-checked-indicator-display, none);
      }
    </style>
    <div id="container" part="container">
      <slot name="header" hidden>
        <button part="back button" aria-label="Back to previous menu">
          <slot name="back-icon">
            <svg aria-hidden="true" viewBox="0 0 20 24" part="back indicator">
              <path d="m11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z"/>
            </svg>
          </slot>
          <slot name="title"></slot>
        </button>
      </slot>
      <slot></slot>
    </div>
    <slot name="checked-indicator" hidden></slot>
  `
  );
}
const media_chrome_menu_Attributes = {
  STYLE: "style",
  HIDDEN: "hidden",
  DISABLED: "disabled",
  ANCHOR: "anchor"
};
class MediaChromeMenu extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_chrome_menu_privateAdd(this, _handleSlotChange);
    media_chrome_menu_privateAdd(this, _toggleHeader);
    /**
     * Sets the layout style for the menu.
     * It can be a row or column layout. e.g. playback-rate-menu
     */
    media_chrome_menu_privateAdd(this, _updateLayoutStyle);
    media_chrome_menu_privateAdd(this, media_chrome_menu_handleInvoke);
    media_chrome_menu_privateAdd(this, media_chrome_menu_handleOpen);
    media_chrome_menu_privateAdd(this, media_chrome_menu_handleClosed);
    /**
     * Updates the popover menu position based on the anchor element.
     * @param  {number} [menuWidth]
     */
    media_chrome_menu_privateAdd(this, _positionMenu);
    /**
     * Resize this menu to fit the submenu.
     * @param  {boolean} animate
     */
    media_chrome_menu_privateAdd(this, _resizeMenu);
    media_chrome_menu_privateAdd(this, _handleClick);
    media_chrome_menu_privateAdd(this, _backButtonElement);
    /**
     * Handle the toggle event of submenus.
     * Closes all other open submenus when opening a submenu.
     * Resizes this menu to fit the submenu.
     *
     * @param  {ToggleEvent} event
     */
    media_chrome_menu_privateAdd(this, _handleToggle);
    /**
     * Check if any submenu is expanded and update the container class accordingly.
     * When the CSS :has() selector is supported, this can be done with CSS only.
     */
    media_chrome_menu_privateAdd(this, _checkSubmenuHasExpanded);
    media_chrome_menu_privateAdd(this, media_chrome_menu_handleFocusOut);
    media_chrome_menu_privateAdd(this, media_chrome_menu_handleKeyDown);
    media_chrome_menu_privateAdd(this, _getItem);
    media_chrome_menu_privateAdd(this, _getTabItem);
    media_chrome_menu_privateAdd(this, _setTabItem);
    media_chrome_menu_privateAdd(this, _selectItem);
    media_chrome_menu_privateAdd(this, media_chrome_menu_mediaController, null);
    media_chrome_menu_privateAdd(this, media_chrome_menu_previouslyFocused, null);
    media_chrome_menu_privateAdd(this, media_chrome_menu_invokerElement, null);
    media_chrome_menu_privateAdd(this, _previousItems, /* @__PURE__ */ new Set());
    media_chrome_menu_privateAdd(this, media_chrome_menu_mutationObserver, void 0);
    media_chrome_menu_privateAdd(this, _isPopover, false);
    media_chrome_menu_privateAdd(this, _cssRule, null);
    /**
     * Fires an event when a menu item is added or removed.
     * This is needed to update the description slot of an ancestor menu item.
     */
    media_chrome_menu_privateAdd(this, _handleMenuItems, () => {
      const previousItems = media_chrome_menu_privateGet(this, _previousItems);
      const currentItems = new Set(this.items);
      for (const item of previousItems) {
        if (!currentItems.has(item)) {
          this.dispatchEvent(new CustomEvent("removemenuitem", { detail: item }));
        }
      }
      for (const item of currentItems) {
        if (!previousItems.has(item)) {
          this.dispatchEvent(new CustomEvent("addmenuitem", { detail: item }));
        }
      }
      media_chrome_menu_privateSet(this, _previousItems, currentItems);
    });
    media_chrome_menu_privateAdd(this, _handleBoundsResize, () => {
      media_chrome_menu_privateMethod(this, _positionMenu, positionMenu_fn).call(this);
      media_chrome_menu_privateMethod(this, _resizeMenu, resizeMenu_fn).call(this, false);
    });
    media_chrome_menu_privateAdd(this, _handleMenuResize, () => {
      media_chrome_menu_privateMethod(this, _positionMenu, positionMenu_fn).call(this);
    });
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
    this.container = this.shadowRoot.querySelector("#container");
    this.defaultSlot = this.shadowRoot.querySelector(
      "slot:not([name])"
    );
    this.shadowRoot.addEventListener("slotchange", this);
    media_chrome_menu_privateSet(this, media_chrome_menu_mutationObserver, new MutationObserver(media_chrome_menu_privateGet(this, _handleMenuItems)));
    media_chrome_menu_privateGet(this, media_chrome_menu_mutationObserver).observe(this.defaultSlot, { childList: true });
  }
  static get observedAttributes() {
    return [
      media_chrome_menu_Attributes.DISABLED,
      media_chrome_menu_Attributes.HIDDEN,
      media_chrome_menu_Attributes.STYLE,
      media_chrome_menu_Attributes.ANCHOR,
      MediaStateReceiverAttributes.MEDIA_CONTROLLER
    ];
  }
  static formatMenuItemText(text, _data) {
    return text;
  }
  enable() {
    this.addEventListener("click", this);
    this.addEventListener("focusout", this);
    this.addEventListener("keydown", this);
    this.addEventListener("invoke", this);
    this.addEventListener("toggle", this);
  }
  disable() {
    this.removeEventListener("click", this);
    this.removeEventListener("focusout", this);
    this.removeEventListener("keyup", this);
    this.removeEventListener("invoke", this);
    this.removeEventListener("toggle", this);
  }
  handleEvent(event) {
    switch (event.type) {
      case "slotchange":
        media_chrome_menu_privateMethod(this, _handleSlotChange, handleSlotChange_fn).call(this, event);
        break;
      case "invoke":
        media_chrome_menu_privateMethod(this, media_chrome_menu_handleInvoke, media_chrome_menu_handleInvoke_fn).call(this, event);
        break;
      case "click":
        media_chrome_menu_privateMethod(this, _handleClick, handleClick_fn).call(this, event);
        break;
      case "toggle":
        media_chrome_menu_privateMethod(this, _handleToggle, handleToggle_fn).call(this, event);
        break;
      case "focusout":
        media_chrome_menu_privateMethod(this, media_chrome_menu_handleFocusOut, media_chrome_menu_handleFocusOut_fn).call(this, event);
        break;
      case "keydown":
        media_chrome_menu_privateMethod(this, media_chrome_menu_handleKeyDown, media_chrome_menu_handleKeyDown_fn).call(this, event);
        break;
    }
  }
  connectedCallback() {
    var _a, _b;
    media_chrome_menu_privateSet(this, _cssRule, insertCSSRule(this.shadowRoot, ":host"));
    media_chrome_menu_privateMethod(this, _updateLayoutStyle, updateLayoutStyle_fn).call(this);
    if (!this.hasAttribute("disabled")) {
      this.enable();
    }
    if (!this.role) {
      this.role = "menu";
    }
    media_chrome_menu_privateSet(this, media_chrome_menu_mediaController, getAttributeMediaController(this));
    (_b = (_a = media_chrome_menu_privateGet(this, media_chrome_menu_mediaController)) == null ? void 0 : _a.associateElement) == null ? void 0 : _b.call(_a, this);
    if (!this.hidden) {
      observeResize(getBoundsElement(this), media_chrome_menu_privateGet(this, _handleBoundsResize));
      observeResize(this, media_chrome_menu_privateGet(this, _handleMenuResize));
    }
    media_chrome_menu_privateMethod(this, _toggleHeader, toggleHeader_fn).call(this);
  }
  disconnectedCallback() {
    var _a, _b;
    unobserveResize(getBoundsElement(this), media_chrome_menu_privateGet(this, _handleBoundsResize));
    unobserveResize(this, media_chrome_menu_privateGet(this, _handleMenuResize));
    this.disable();
    (_b = (_a = media_chrome_menu_privateGet(this, media_chrome_menu_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
    media_chrome_menu_privateSet(this, media_chrome_menu_mediaController, null);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    var _a, _b, _c, _d;
    if (attrName === media_chrome_menu_Attributes.HIDDEN && newValue !== oldValue) {
      if (!media_chrome_menu_privateGet(this, _isPopover))
        media_chrome_menu_privateSet(this, _isPopover, true);
      if (this.hidden) {
        media_chrome_menu_privateMethod(this, media_chrome_menu_handleClosed, media_chrome_menu_handleClosed_fn).call(this);
      } else {
        media_chrome_menu_privateMethod(this, media_chrome_menu_handleOpen, media_chrome_menu_handleOpen_fn).call(this);
      }
      this.dispatchEvent(
        new ToggleEvent({
          oldState: this.hidden ? "open" : "closed",
          newState: this.hidden ? "closed" : "open",
          bubbles: true
        })
      );
    } else if (attrName === MediaStateReceiverAttributes.MEDIA_CONTROLLER) {
      if (oldValue) {
        (_b = (_a = media_chrome_menu_privateGet(this, media_chrome_menu_mediaController)) == null ? void 0 : _a.unassociateElement) == null ? void 0 : _b.call(_a, this);
        media_chrome_menu_privateSet(this, media_chrome_menu_mediaController, null);
      }
      if (newValue && this.isConnected) {
        media_chrome_menu_privateSet(this, media_chrome_menu_mediaController, getAttributeMediaController(this));
        (_d = (_c = media_chrome_menu_privateGet(this, media_chrome_menu_mediaController)) == null ? void 0 : _c.associateElement) == null ? void 0 : _d.call(_c, this);
      }
    } else if (attrName === media_chrome_menu_Attributes.DISABLED && newValue !== oldValue) {
      if (newValue == null) {
        this.enable();
      } else {
        this.disable();
      }
    } else if (attrName === media_chrome_menu_Attributes.STYLE && newValue !== oldValue) {
      media_chrome_menu_privateMethod(this, _updateLayoutStyle, updateLayoutStyle_fn).call(this);
    }
  }
  formatMenuItemText(text, data) {
    return this.constructor.formatMenuItemText(
      text,
      data
    );
  }
  get anchor() {
    return this.getAttribute("anchor");
  }
  set anchor(value) {
    this.setAttribute("anchor", `${value}`);
  }
  /**
   * Returns the anchor element when it is a floating menu.
   */
  get anchorElement() {
    var _a;
    if (this.anchor) {
      return (_a = getDocumentOrShadowRoot(this)) == null ? void 0 : _a.querySelector(
        `#${this.anchor}`
      );
    }
    return null;
  }
  /**
   * Returns the menu items.
   */
  get items() {
    return this.defaultSlot.assignedElements({ flatten: true }).filter(isMenuItem);
  }
  get radioGroupItems() {
    return this.items.filter((item) => item.role === "menuitemradio");
  }
  get checkedItems() {
    return this.items.filter((item) => item.checked);
  }
  get value() {
    var _a, _b;
    return (_b = (_a = this.checkedItems[0]) == null ? void 0 : _a.value) != null ? _b : "";
  }
  set value(newValue) {
    const item = this.items.find((item2) => item2.value === newValue);
    if (!item)
      return;
    media_chrome_menu_privateMethod(this, _selectItem, selectItem_fn).call(this, item);
  }
  focus() {
    media_chrome_menu_privateSet(this, media_chrome_menu_previouslyFocused, getActiveElement());
    if (this.items.length) {
      media_chrome_menu_privateMethod(this, _setTabItem, setTabItem_fn).call(this, this.items[0]);
      this.items[0].focus();
      return;
    }
    const focusable = this.querySelector(
      '[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]'
    );
    focusable == null ? void 0 : focusable.focus();
  }
  handleSelect(event) {
    var _a;
    const item = media_chrome_menu_privateMethod(this, _getItem, getItem_fn).call(this, event);
    if (!item)
      return;
    media_chrome_menu_privateMethod(this, _selectItem, selectItem_fn).call(this, item, item.type === "checkbox");
    if (media_chrome_menu_privateGet(this, media_chrome_menu_invokerElement) && !this.hidden) {
      (_a = media_chrome_menu_privateGet(this, media_chrome_menu_previouslyFocused)) == null ? void 0 : _a.focus();
      this.hidden = true;
    }
  }
  get keysUsed() {
    return [
      "Enter",
      "Escape",
      "Tab",
      " ",
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End"
    ];
  }
  handleMove(event) {
    var _a, _b;
    const { key } = event;
    const items = this.items;
    const currentItem = (_b = (_a = media_chrome_menu_privateMethod(this, _getItem, getItem_fn).call(this, event)) != null ? _a : media_chrome_menu_privateMethod(this, _getTabItem, getTabItem_fn).call(this)) != null ? _b : items[0];
    const currentIndex = items.indexOf(currentItem);
    let index = Math.max(0, currentIndex);
    if (key === "ArrowDown") {
      index++;
    } else if (key === "ArrowUp") {
      index--;
    } else if (event.key === "Home") {
      index = 0;
    } else if (event.key === "End") {
      index = items.length - 1;
    }
    if (index < 0) {
      index = items.length - 1;
    }
    if (index > items.length - 1) {
      index = 0;
    }
    media_chrome_menu_privateMethod(this, _setTabItem, setTabItem_fn).call(this, items[index]);
    items[index].focus();
  }
}
media_chrome_menu_mediaController = new WeakMap();
media_chrome_menu_previouslyFocused = new WeakMap();
media_chrome_menu_invokerElement = new WeakMap();
_previousItems = new WeakMap();
media_chrome_menu_mutationObserver = new WeakMap();
_isPopover = new WeakMap();
_cssRule = new WeakMap();
_handleSlotChange = new WeakSet();
handleSlotChange_fn = function(event) {
  const slot = event.target;
  for (const node of slot.assignedNodes({ flatten: true })) {
    if (node.nodeType === 3 && node.textContent.trim() === "") {
      node.remove();
    }
  }
  if (["header", "title"].includes(slot.name)) {
    media_chrome_menu_privateMethod(this, _toggleHeader, toggleHeader_fn).call(this);
  }
  if (!slot.name) {
    media_chrome_menu_privateGet(this, _handleMenuItems).call(this);
  }
};
_toggleHeader = new WeakSet();
toggleHeader_fn = function() {
  const header = this.shadowRoot.querySelector(
    'slot[name="header"]'
  );
  const title = this.shadowRoot.querySelector(
    'slot[name="title"]'
  );
  header.hidden = title.assignedNodes().length === 0 && header.assignedNodes().length === 0;
};
_handleMenuItems = new WeakMap();
_updateLayoutStyle = new WeakSet();
updateLayoutStyle_fn = function() {
  var _a;
  const layoutRowStyle = this.shadowRoot.querySelector("#layout-row");
  const menuLayout = (_a = getComputedStyle(this).getPropertyValue("--media-menu-layout")) == null ? void 0 : _a.trim();
  layoutRowStyle.setAttribute("media", menuLayout === "row" ? "" : "width:0");
};
media_chrome_menu_handleInvoke = new WeakSet();
media_chrome_menu_handleInvoke_fn = function(event) {
  media_chrome_menu_privateSet(this, media_chrome_menu_invokerElement, event.relatedTarget);
  if (!containsComposedNode(this, event.relatedTarget)) {
    this.hidden = !this.hidden;
  }
};
media_chrome_menu_handleOpen = new WeakSet();
media_chrome_menu_handleOpen_fn = function() {
  var _a;
  (_a = media_chrome_menu_privateGet(this, media_chrome_menu_invokerElement)) == null ? void 0 : _a.setAttribute("aria-expanded", "true");
  this.addEventListener("transitionend", () => this.focus(), { once: true });
  observeResize(getBoundsElement(this), media_chrome_menu_privateGet(this, _handleBoundsResize));
  observeResize(this, media_chrome_menu_privateGet(this, _handleMenuResize));
};
media_chrome_menu_handleClosed = new WeakSet();
media_chrome_menu_handleClosed_fn = function() {
  var _a;
  (_a = media_chrome_menu_privateGet(this, media_chrome_menu_invokerElement)) == null ? void 0 : _a.setAttribute("aria-expanded", "false");
  unobserveResize(getBoundsElement(this), media_chrome_menu_privateGet(this, _handleBoundsResize));
  unobserveResize(this, media_chrome_menu_privateGet(this, _handleMenuResize));
};
_handleBoundsResize = new WeakMap();
_handleMenuResize = new WeakMap();
_positionMenu = new WeakSet();
positionMenu_fn = function(menuWidth) {
  if (this.hasAttribute("mediacontroller") && !this.anchor)
    return;
  if (this.hidden || !this.anchorElement)
    return;
  const { x, y } = computePosition({
    anchor: this.anchorElement,
    floating: this,
    placement: "top-start"
  });
  menuWidth != null ? menuWidth : menuWidth = this.offsetWidth;
  const bounds = getBoundsElement(this);
  const boundsRect = bounds.getBoundingClientRect();
  const right = boundsRect.width - x - menuWidth;
  const bottom = boundsRect.height - y - this.offsetHeight;
  const { style } = media_chrome_menu_privateGet(this, _cssRule);
  style.setProperty("position", "absolute");
  style.setProperty("right", `${Math.max(0, right)}px`);
  style.setProperty("--_menu-bottom", `${bottom}px`);
  const computedStyle = getComputedStyle(this);
  const isBottomCalc = style.getPropertyValue("--_menu-bottom") === computedStyle.bottom;
  const realBottom = isBottomCalc ? bottom : parseFloat(computedStyle.bottom);
  const maxHeight = boundsRect.height - realBottom - parseFloat(computedStyle.marginBottom);
  this.style.setProperty("--_menu-max-height", `${maxHeight}px`);
};
_resizeMenu = new WeakSet();
resizeMenu_fn = function(animate) {
  const expandedMenuItem = this.querySelector(
    '[role="menuitem"][aria-haspopup][aria-expanded="true"]'
  );
  const expandedSubmenu = expandedMenuItem == null ? void 0 : expandedMenuItem.querySelector(
    '[role="menu"]'
  );
  const { style } = media_chrome_menu_privateGet(this, _cssRule);
  if (!animate) {
    style.setProperty("--media-menu-transition-in", "none");
  }
  if (expandedSubmenu) {
    const height = expandedSubmenu.offsetHeight;
    const width = Math.max(
      expandedSubmenu.offsetWidth,
      expandedMenuItem.offsetWidth
    );
    this.style.setProperty("min-width", `${width}px`);
    this.style.setProperty("min-height", `${height}px`);
    media_chrome_menu_privateMethod(this, _positionMenu, positionMenu_fn).call(this, width);
  } else {
    this.style.removeProperty("min-width");
    this.style.removeProperty("min-height");
    media_chrome_menu_privateMethod(this, _positionMenu, positionMenu_fn).call(this);
  }
  style.removeProperty("--media-menu-transition-in");
};
_handleClick = new WeakSet();
handleClick_fn = function(event) {
  var _a;
  event.stopPropagation();
  if (event.composedPath().includes(media_chrome_menu_privateGet(this, _backButtonElement, backButtonElement_get))) {
    (_a = media_chrome_menu_privateGet(this, media_chrome_menu_previouslyFocused)) == null ? void 0 : _a.focus();
    this.hidden = true;
    return;
  }
  const item = media_chrome_menu_privateMethod(this, _getItem, getItem_fn).call(this, event);
  if (!item || item.hasAttribute("disabled"))
    return;
  media_chrome_menu_privateMethod(this, _setTabItem, setTabItem_fn).call(this, item);
  this.handleSelect(event);
};
_backButtonElement = new WeakSet();
backButtonElement_get = function() {
  var _a;
  const headerSlot = this.shadowRoot.querySelector(
    'slot[name="header"]'
  );
  return (_a = headerSlot.assignedElements({ flatten: true })) == null ? void 0 : _a.find((el) => el.matches('button[part~="back"]'));
};
_handleToggle = new WeakSet();
handleToggle_fn = function(event) {
  if (event.target === this)
    return;
  media_chrome_menu_privateMethod(this, _checkSubmenuHasExpanded, checkSubmenuHasExpanded_fn).call(this);
  const menuItemsWithSubmenu = Array.from(
    this.querySelectorAll('[role="menuitem"][aria-haspopup]')
  );
  for (const item of menuItemsWithSubmenu) {
    if (item.invokeTargetElement == event.target)
      continue;
    if (event.newState == "open" && item.getAttribute("aria-expanded") == "true" && !item.invokeTargetElement.hidden) {
      item.invokeTargetElement.dispatchEvent(
        new InvokeEvent({ relatedTarget: item })
      );
    }
  }
  for (const item of menuItemsWithSubmenu) {
    item.setAttribute("aria-expanded", `${!item.submenuElement.hidden}`);
  }
  media_chrome_menu_privateMethod(this, _resizeMenu, resizeMenu_fn).call(this, true);
};
_checkSubmenuHasExpanded = new WeakSet();
checkSubmenuHasExpanded_fn = function() {
  const selector = '[role="menuitem"] > [role="menu"]:not([hidden])';
  const expandedMenuItem = this.querySelector(selector);
  this.container.classList.toggle("has-expanded", !!expandedMenuItem);
};
media_chrome_menu_handleFocusOut = new WeakSet();
media_chrome_menu_handleFocusOut_fn = function(event) {
  var _a;
  if (!containsComposedNode(this, event.relatedTarget)) {
    if (media_chrome_menu_privateGet(this, _isPopover)) {
      (_a = media_chrome_menu_privateGet(this, media_chrome_menu_previouslyFocused)) == null ? void 0 : _a.focus();
    }
    if (media_chrome_menu_privateGet(this, media_chrome_menu_invokerElement) && media_chrome_menu_privateGet(this, media_chrome_menu_invokerElement) !== event.relatedTarget && !this.hidden) {
      this.hidden = true;
    }
  }
};
media_chrome_menu_handleKeyDown = new WeakSet();
media_chrome_menu_handleKeyDown_fn = function(event) {
  var _a, _b, _c, _d, _e;
  const { key, ctrlKey, altKey, metaKey } = event;
  if (ctrlKey || altKey || metaKey) {
    return;
  }
  if (!this.keysUsed.includes(key)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (key === "Tab") {
    if (media_chrome_menu_privateGet(this, _isPopover)) {
      this.hidden = true;
      return;
    }
    if (event.shiftKey) {
      (_b = (_a = this.previousElementSibling) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
    } else {
      (_d = (_c = this.nextElementSibling) == null ? void 0 : _c.focus) == null ? void 0 : _d.call(_c);
    }
    this.blur();
  } else if (key === "Escape") {
    (_e = media_chrome_menu_privateGet(this, media_chrome_menu_previouslyFocused)) == null ? void 0 : _e.focus();
    if (media_chrome_menu_privateGet(this, _isPopover)) {
      this.hidden = true;
    }
  } else if (key === "Enter" || key === " ") {
    this.handleSelect(event);
  } else {
    this.handleMove(event);
  }
};
_getItem = new WeakSet();
getItem_fn = function(event) {
  return event.composedPath().find((el) => {
    return ["menuitemradio", "menuitemcheckbox"].includes(
      el.role
    );
  });
};
_getTabItem = new WeakSet();
getTabItem_fn = function() {
  return this.items.find((item) => item.tabIndex === 0);
};
_setTabItem = new WeakSet();
setTabItem_fn = function(tabItem) {
  for (const item of this.items) {
    item.tabIndex = item === tabItem ? 0 : -1;
  }
};
_selectItem = new WeakSet();
selectItem_fn = function(item, toggle) {
  const oldCheckedItems = [...this.checkedItems];
  if (item.type === "radio") {
    this.radioGroupItems.forEach((el) => el.checked = false);
  }
  if (toggle) {
    item.checked = !item.checked;
  } else {
    item.checked = true;
  }
  if (this.checkedItems.some((opt, i) => opt != oldCheckedItems[i])) {
    this.dispatchEvent(
      new Event("change", { bubbles: true, composed: true })
    );
  }
};
MediaChromeMenu.shadowRootOptions = { mode: "open" };
MediaChromeMenu.getTemplateHTML = media_chrome_menu_getTemplateHTML;
function isMenuItem(element) {
  return ["menuitem", "menuitemradio", "menuitemcheckbox"].includes(
    element == null ? void 0 : element.role
  );
}
function getBoundsElement(host) {
  var _a;
  return (_a = host.getAttribute("bounds") ? closestComposedNode(host, `#${host.getAttribute("bounds")}`) : getMediaController(host) || host.parentElement) != null ? _a : host;
}
if (!GlobalThis.customElements.get("media-chrome-menu")) {
  GlobalThis.customElements.define("media-chrome-menu", MediaChromeMenu);
}
var media_chrome_menu_default = (/* unused pure expression or super */ null && (MediaChromeMenu));


;// ../node_modules/media-chrome/dist/menu/media-chrome-menu-item.js
var media_chrome_menu_item_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_chrome_menu_item_privateGet = (obj, member, getter) => {
  media_chrome_menu_item_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_chrome_menu_item_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_chrome_menu_item_privateSet = (obj, member, value, setter) => {
  media_chrome_menu_item_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_chrome_menu_item_privateMethod = (obj, member, method) => {
  media_chrome_menu_item_accessCheck(obj, member, "access private method");
  return method;
};
var _dirty, _ownerElement, media_chrome_menu_item_handleSlotChange, media_chrome_menu_item_handleSlotChange_fn, _submenuConnected, submenuConnected_fn, _submenuDisconnected, submenuDisconnected_fn, _handleMenuItem, _handleKeyUp, handleKeyUp_fn, media_chrome_menu_item_handleKeyDown, media_chrome_menu_item_handleKeyDown_fn, _reset, reset_fn;



function media_chrome_menu_item_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        transition: var(--media-menu-item-transition,
          background .15s linear,
          opacity .2s ease-in-out
        );
        outline: var(--media-menu-item-outline, 0);
        outline-offset: var(--media-menu-item-outline-offset, -1px);
        cursor: var(--media-cursor, pointer);
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-self: stretch;
        white-space: nowrap;
        white-space-collapse: collapse;
        text-wrap: nowrap;
        padding: .4em .8em .4em 1em;
      }

      :host(:focus-visible) {
        box-shadow: var(--media-menu-item-focus-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: var(--media-menu-item-hover-outline, 0);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host(:hover) {
        cursor: var(--media-cursor, pointer);
        background: var(--media-menu-item-hover-background, rgb(92 92 102 / .5));
        outline: var(--media-menu-item-hover-outline);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host([aria-checked="true"]) {
        background: var(--media-menu-item-checked-background);
      }

      :host([hidden]) {
        display: none;
      }

      :host([disabled]) {
        pointer-events: none;
        color: rgba(255, 255, 255, .3);
      }

      slot:not([name]) {
        width: 100%;
      }

      slot:not([name="submenu"]) {
        display: inline-flex;
        align-items: center;
        transition: inherit;
        opacity: var(--media-menu-item-opacity, 1);
      }

      slot[name="description"] {
        justify-content: end;
      }

      slot[name="description"] > span {
        display: inline-block;
        margin-inline: 1em .2em;
        max-width: var(--media-menu-item-description-max-width, 100px);
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: .8em;
        font-weight: 400;
        text-align: right;
        position: relative;
        top: .04em;
      }

      slot[name="checked-indicator"] {
        display: none;
      }

      :host(:is([role="menuitemradio"],[role="menuitemcheckbox"])) slot[name="checked-indicator"] {
        display: var(--media-menu-item-checked-indicator-display, inline-block);
      }

      ${/* For all slotted icons in prefix and suffix. */
    ""}
      svg, img, ::slotted(svg), ::slotted(img) {
        height: var(--media-menu-item-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
      }

      ${/* Only for indicator icons like checked-indicator or captions-indicator. */
    ""}
      [part~="indicator"],
      ::slotted([part~="indicator"]) {
        fill: var(--media-menu-item-indicator-fill,
          var(--media-icon-color, var(--media-primary-color, rgb(238 238 238))));
        height: var(--media-menu-item-indicator-height, 1.25em);
        margin-right: .5ch;
      }

      [part~="checked-indicator"] {
        visibility: hidden;
      }

      :host([aria-checked="true"]) [part~="checked-indicator"] {
        visibility: visible;
      }
    </style>
    <slot name="checked-indicator">
      <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
        <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
      </svg>
    </slot>
    <slot name="prefix"></slot>
    <slot></slot>
    <slot name="description"></slot>
    <slot name="suffix">
      ${this.getSuffixSlotInnerHTML(_attrs)}
    </slot>
    <slot name="submenu"></slot>
  `
  );
}
function getSuffixSlotInnerHTML(_attrs) {
  return "";
}
const media_chrome_menu_item_Attributes = {
  TYPE: "type",
  VALUE: "value",
  CHECKED: "checked",
  DISABLED: "disabled"
};
class MediaChromeMenuItem extends GlobalThis.HTMLElement {
  constructor() {
    super();
    media_chrome_menu_item_privateAdd(this, media_chrome_menu_item_handleSlotChange);
    media_chrome_menu_item_privateAdd(this, _submenuConnected);
    media_chrome_menu_item_privateAdd(this, _submenuDisconnected);
    media_chrome_menu_item_privateAdd(this, _handleKeyUp);
    media_chrome_menu_item_privateAdd(this, media_chrome_menu_item_handleKeyDown);
    media_chrome_menu_item_privateAdd(this, _reset);
    media_chrome_menu_item_privateAdd(this, _dirty, false);
    media_chrome_menu_item_privateAdd(this, _ownerElement, void 0);
    /**
     * If there is a slotted submenu the fallback content of the description slot
     * is populated with the text of the first checked item.
     */
    media_chrome_menu_item_privateAdd(this, _handleMenuItem, () => {
      var _a, _b;
      if (this.submenuElement.items) {
        this.setAttribute("submenusize", `${this.submenuElement.items.length}`);
      }
      const descriptionSlot = this.shadowRoot.querySelector(
        'slot[name="description"]'
      );
      const checkedItem = (_a = this.submenuElement.checkedItems) == null ? void 0 : _a[0];
      const description = (_b = checkedItem == null ? void 0 : checkedItem.dataset.description) != null ? _b : checkedItem == null ? void 0 : checkedItem.text;
      const span = server_safe_globals_Document.createElement("span");
      span.textContent = description != null ? description : "";
      descriptionSlot.replaceChildren(span);
    });
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      const attrs = namedNodeMapToObject(this.attributes);
      this.shadowRoot.innerHTML = this.constructor.getTemplateHTML(attrs);
    }
    this.shadowRoot.addEventListener("slotchange", this);
  }
  static get observedAttributes() {
    return [
      media_chrome_menu_item_Attributes.TYPE,
      media_chrome_menu_item_Attributes.DISABLED,
      media_chrome_menu_item_Attributes.CHECKED,
      media_chrome_menu_item_Attributes.VALUE
    ];
  }
  enable() {
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "-1");
    }
    if (isCheckable(this) && !this.hasAttribute("aria-checked")) {
      this.setAttribute("aria-checked", "false");
    }
    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
  }
  disable() {
    this.removeAttribute("tabindex");
    this.removeEventListener("click", this);
    this.removeEventListener("keydown", this);
    this.removeEventListener("keyup", this);
  }
  handleEvent(event) {
    switch (event.type) {
      case "slotchange":
        media_chrome_menu_item_privateMethod(this, media_chrome_menu_item_handleSlotChange, media_chrome_menu_item_handleSlotChange_fn).call(this, event);
        break;
      case "click":
        this.handleClick(event);
        break;
      case "keydown":
        media_chrome_menu_item_privateMethod(this, media_chrome_menu_item_handleKeyDown, media_chrome_menu_item_handleKeyDown_fn).call(this, event);
        break;
      case "keyup":
        media_chrome_menu_item_privateMethod(this, _handleKeyUp, handleKeyUp_fn).call(this, event);
        break;
    }
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === media_chrome_menu_item_Attributes.CHECKED && isCheckable(this) && !media_chrome_menu_item_privateGet(this, _dirty)) {
      this.setAttribute("aria-checked", newValue != null ? "true" : "false");
    } else if (attrName === media_chrome_menu_item_Attributes.TYPE && newValue !== oldValue) {
      this.role = "menuitem" + newValue;
    } else if (attrName === media_chrome_menu_item_Attributes.DISABLED && newValue !== oldValue) {
      if (newValue == null) {
        this.enable();
      } else {
        this.disable();
      }
    }
  }
  connectedCallback() {
    if (!this.hasAttribute(media_chrome_menu_item_Attributes.DISABLED)) {
      this.enable();
    }
    this.role = "menuitem" + this.type;
    media_chrome_menu_item_privateSet(this, _ownerElement, closestMenuItemsContainer(this, this.parentNode));
    media_chrome_menu_item_privateMethod(this, _reset, reset_fn).call(this);
    if (this.submenuElement) {
      media_chrome_menu_item_privateMethod(this, _submenuConnected, submenuConnected_fn).call(this);
    }
  }
  disconnectedCallback() {
    this.disable();
    media_chrome_menu_item_privateMethod(this, _reset, reset_fn).call(this);
    media_chrome_menu_item_privateSet(this, _ownerElement, null);
  }
  get invokeTarget() {
    return this.getAttribute("invoketarget");
  }
  set invokeTarget(value) {
    this.setAttribute("invoketarget", `${value}`);
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute
   * or the slotted submenu element.
   */
  get invokeTargetElement() {
    var _a;
    if (this.invokeTarget) {
      return (_a = getDocumentOrShadowRoot(this)) == null ? void 0 : _a.querySelector(
        `#${this.invokeTarget}`
      );
    }
    return this.submenuElement;
  }
  /**
   * Returns the slotted submenu element.
   */
  get submenuElement() {
    const submenuSlot = this.shadowRoot.querySelector(
      'slot[name="submenu"]'
    );
    return submenuSlot.assignedElements({
      flatten: true
    })[0];
  }
  get type() {
    var _a;
    return (_a = this.getAttribute(media_chrome_menu_item_Attributes.TYPE)) != null ? _a : "";
  }
  set type(val) {
    this.setAttribute(media_chrome_menu_item_Attributes.TYPE, `${val}`);
  }
  get value() {
    var _a;
    return (_a = this.getAttribute(media_chrome_menu_item_Attributes.VALUE)) != null ? _a : this.text;
  }
  set value(val) {
    this.setAttribute(media_chrome_menu_item_Attributes.VALUE, val);
  }
  get text() {
    var _a;
    return ((_a = this.textContent) != null ? _a : "").trim();
  }
  get checked() {
    if (!isCheckable(this))
      return void 0;
    return this.getAttribute("aria-checked") === "true";
  }
  set checked(value) {
    if (!isCheckable(this))
      return;
    media_chrome_menu_item_privateSet(this, _dirty, true);
    this.setAttribute("aria-checked", value ? "true" : "false");
    if (value) {
      this.part.add("checked");
    } else {
      this.part.remove("checked");
    }
  }
  handleClick(event) {
    if (isCheckable(this))
      return;
    if (this.invokeTargetElement && containsComposedNode(this, event.target)) {
      this.invokeTargetElement.dispatchEvent(
        new InvokeEvent({ relatedTarget: this })
      );
    }
  }
  get keysUsed() {
    return ["Enter", " "];
  }
}
_dirty = new WeakMap();
_ownerElement = new WeakMap();
media_chrome_menu_item_handleSlotChange = new WeakSet();
media_chrome_menu_item_handleSlotChange_fn = function(event) {
  const slot = event.target;
  const isDefaultSlot = !(slot == null ? void 0 : slot.name);
  if (isDefaultSlot) {
    for (const node of slot.assignedNodes({ flatten: true })) {
      if (node instanceof Text && node.textContent.trim() === "") {
        node.remove();
      }
    }
  }
  if (slot.name === "submenu") {
    if (this.submenuElement) {
      media_chrome_menu_item_privateMethod(this, _submenuConnected, submenuConnected_fn).call(this);
    } else {
      media_chrome_menu_item_privateMethod(this, _submenuDisconnected, submenuDisconnected_fn).call(this);
    }
  }
};
_submenuConnected = new WeakSet();
submenuConnected_fn = async function() {
  this.setAttribute("aria-haspopup", "menu");
  this.setAttribute("aria-expanded", `${!this.submenuElement.hidden}`);
  this.submenuElement.addEventListener("change", media_chrome_menu_item_privateGet(this, _handleMenuItem));
  this.submenuElement.addEventListener("addmenuitem", media_chrome_menu_item_privateGet(this, _handleMenuItem));
  this.submenuElement.addEventListener(
    "removemenuitem",
    media_chrome_menu_item_privateGet(this, _handleMenuItem)
  );
  media_chrome_menu_item_privateGet(this, _handleMenuItem).call(this);
};
_submenuDisconnected = new WeakSet();
submenuDisconnected_fn = function() {
  this.removeAttribute("aria-haspopup");
  this.removeAttribute("aria-expanded");
  this.submenuElement.removeEventListener("change", media_chrome_menu_item_privateGet(this, _handleMenuItem));
  this.submenuElement.removeEventListener(
    "addmenuitem",
    media_chrome_menu_item_privateGet(this, _handleMenuItem)
  );
  this.submenuElement.removeEventListener(
    "removemenuitem",
    media_chrome_menu_item_privateGet(this, _handleMenuItem)
  );
  media_chrome_menu_item_privateGet(this, _handleMenuItem).call(this);
};
_handleMenuItem = new WeakMap();
_handleKeyUp = new WeakSet();
handleKeyUp_fn = function(event) {
  const { key } = event;
  if (!this.keysUsed.includes(key)) {
    this.removeEventListener("keyup", media_chrome_menu_item_privateMethod(this, _handleKeyUp, handleKeyUp_fn));
    return;
  }
  this.handleClick(event);
};
media_chrome_menu_item_handleKeyDown = new WeakSet();
media_chrome_menu_item_handleKeyDown_fn = function(event) {
  const { metaKey, altKey, key } = event;
  if (metaKey || altKey || !this.keysUsed.includes(key)) {
    this.removeEventListener("keyup", media_chrome_menu_item_privateMethod(this, _handleKeyUp, handleKeyUp_fn));
    return;
  }
  this.addEventListener("keyup", media_chrome_menu_item_privateMethod(this, _handleKeyUp, handleKeyUp_fn), { once: true });
};
_reset = new WeakSet();
reset_fn = function() {
  var _a;
  const items = (_a = media_chrome_menu_item_privateGet(this, _ownerElement)) == null ? void 0 : _a.radioGroupItems;
  if (!items)
    return;
  let checkedItem = items.filter((item) => item.getAttribute("aria-checked") === "true").pop();
  if (!checkedItem)
    checkedItem = items[0];
  for (const item of items) {
    item.setAttribute("aria-checked", "false");
  }
  checkedItem == null ? void 0 : checkedItem.setAttribute("aria-checked", "true");
};
MediaChromeMenuItem.shadowRootOptions = { mode: "open" };
MediaChromeMenuItem.getTemplateHTML = media_chrome_menu_item_getTemplateHTML;
MediaChromeMenuItem.getSuffixSlotInnerHTML = getSuffixSlotInnerHTML;
function isCheckable(item) {
  return item.type === "radio" || item.type === "checkbox";
}
function closestMenuItemsContainer(childNode, parentNode) {
  if (!childNode)
    return null;
  const { host } = childNode.getRootNode();
  if (!parentNode && host)
    return closestMenuItemsContainer(childNode, host);
  if (parentNode == null ? void 0 : parentNode.items)
    return parentNode;
  return closestMenuItemsContainer(parentNode, parentNode == null ? void 0 : parentNode.parentNode);
}
if (!GlobalThis.customElements.get("media-chrome-menu-item")) {
  GlobalThis.customElements.define(
    "media-chrome-menu-item",
    MediaChromeMenuItem
  );
}
var media_chrome_menu_item_default = (/* unused pure expression or super */ null && (MediaChromeMenuItem));


;// ../node_modules/media-chrome/dist/menu/media-settings-menu.js



function media_settings_menu_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${MediaChromeMenu.getTemplateHTML(_attrs)}
    <style>
      :host {
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
        min-width: var(--media-settings-menu-min-width, 170px);
        border-radius: 2px 2px 0 0;
        overflow: hidden;
      }

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([role="menu"]) {
        ${/* Bottom fix setting menu items for animation when the height expands. */
    ""}
        justify-content: end;
      }

      slot:not([name]) {
        justify-content: var(--media-settings-menu-justify-content);
        flex-direction: var(--media-settings-menu-flex-direction, column);
        overflow: visible;
      }

      #container.has-expanded {
        --media-settings-menu-item-opacity: 0;
      }
    </style>
  `
  );
}
class MediaSettingsMenu extends MediaChromeMenu {
  /**
   * Returns the anchor element when it is a floating menu.
   */
  get anchorElement() {
    if (this.anchor !== "auto")
      return super.anchorElement;
    return getMediaController(this).querySelector(
      "media-settings-menu-button"
    );
  }
}
MediaSettingsMenu.getTemplateHTML = media_settings_menu_getTemplateHTML;
if (!GlobalThis.customElements.get("media-settings-menu")) {
  GlobalThis.customElements.define("media-settings-menu", MediaSettingsMenu);
}
var media_settings_menu_default = (/* unused pure expression or super */ null && (MediaSettingsMenu));


;// ../node_modules/media-chrome/dist/menu/media-settings-menu-item.js


function media_settings_menu_item_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${MediaChromeMenuItem.getTemplateHTML.call(this, _attrs)}
    <style>
      slot:not([name="submenu"]) {
        opacity: var(--media-settings-menu-item-opacity, var(--media-menu-item-opacity));
      }

      :host([aria-expanded="true"]:hover) {
        background: transparent;
      }
    </style>
  `
  );
}
function media_settings_menu_item_getSuffixSlotInnerHTML(_attrs) {
  return (
    /*html*/
    `
    <svg aria-hidden="true" viewBox="0 0 20 24">
      <path d="m8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z"/>
    </svg>
  `
  );
}
class MediaSettingsMenuItem extends MediaChromeMenuItem {
}
MediaSettingsMenuItem.shadowRootOptions = { mode: "open" };
MediaSettingsMenuItem.getTemplateHTML = media_settings_menu_item_getTemplateHTML;
MediaSettingsMenuItem.getSuffixSlotInnerHTML = media_settings_menu_item_getSuffixSlotInnerHTML;
if (!GlobalThis.customElements.get("media-settings-menu-item")) {
  GlobalThis.customElements.define(
    "media-settings-menu-item",
    MediaSettingsMenuItem
  );
}
var media_settings_menu_item_default = (/* unused pure expression or super */ null && (MediaSettingsMenuItem));


;// ../node_modules/media-chrome/dist/menu/media-chrome-menu-button.js




class MediaChromeMenuButton extends MediaChromeButton {
  connectedCallback() {
    super.connectedCallback();
    if (this.invokeTargetElement) {
      this.setAttribute("aria-haspopup", "menu");
    }
  }
  get invokeTarget() {
    return this.getAttribute("invoketarget");
  }
  set invokeTarget(value) {
    this.setAttribute("invoketarget", `${value}`);
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute.
   * @return {HTMLElement | null}
   */
  get invokeTargetElement() {
    var _a;
    if (this.invokeTarget) {
      return (_a = getDocumentOrShadowRoot(this)) == null ? void 0 : _a.querySelector(
        `#${this.invokeTarget}`
      );
    }
    return null;
  }
  handleClick() {
    var _a;
    (_a = this.invokeTargetElement) == null ? void 0 : _a.dispatchEvent(
      new InvokeEvent({ relatedTarget: this })
    );
  }
}
if (!GlobalThis.customElements.get("media-chrome-menu-button")) {
  GlobalThis.customElements.define(
    "media-chrome-menu-button",
    MediaChromeMenuButton
  );
}
var media_chrome_menu_button_default = (/* unused pure expression or super */ null && (MediaChromeMenuButton));


;// ../node_modules/media-chrome/dist/menu/media-settings-menu-button.js




function media_settings_menu_button_getSlotTemplateHTML() {
  return (
    /*html*/
    `
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
      </svg>
    </slot>
  `
  );
}
function media_settings_menu_button_getTooltipContentHTML() {
  return t("Settings");
}
class MediaSettingsMenuButton extends MediaChromeMenuButton {
  static get observedAttributes() {
    return [...super.observedAttributes, "target"];
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("aria-label", t("settings"));
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute.
   * @return {HTMLElement | null}
   */
  get invokeTargetElement() {
    if (this.invokeTarget != void 0)
      return super.invokeTargetElement;
    return getMediaController(this).querySelector("media-settings-menu");
  }
}
MediaSettingsMenuButton.getSlotTemplateHTML = media_settings_menu_button_getSlotTemplateHTML;
MediaSettingsMenuButton.getTooltipContentHTML = media_settings_menu_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-settings-menu-button")) {
  GlobalThis.customElements.define(
    "media-settings-menu-button",
    MediaSettingsMenuButton
  );
}
var media_settings_menu_button_default = (/* unused pure expression or super */ null && (MediaSettingsMenuButton));


;// ../node_modules/media-chrome/dist/menu/media-audio-track-menu.js
var media_audio_track_menu_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_audio_track_menu_privateGet = (obj, member, getter) => {
  media_audio_track_menu_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_audio_track_menu_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_audio_track_menu_privateSet = (obj, member, value, setter) => {
  media_audio_track_menu_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_audio_track_menu_privateMethod = (obj, member, method) => {
  media_audio_track_menu_accessCheck(obj, member, "access private method");
  return method;
};
var _audioTrackList, _prevState, _render, render_fn, _onChange, onChange_fn;





class MediaAudioTrackMenu extends MediaChromeMenu {
  constructor() {
    super(...arguments);
    media_audio_track_menu_privateAdd(this, _render);
    media_audio_track_menu_privateAdd(this, _onChange);
    media_audio_track_menu_privateAdd(this, _audioTrackList, []);
    media_audio_track_menu_privateAdd(this, _prevState, void 0);
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_AUDIO_TRACK_LIST,
      MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED,
      MediaUIAttributes.MEDIA_AUDIO_TRACK_UNAVAILABLE
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED && oldValue !== newValue) {
      this.value = newValue;
    } else if (attrName === MediaUIAttributes.MEDIA_AUDIO_TRACK_LIST && oldValue !== newValue) {
      media_audio_track_menu_privateSet(this, _audioTrackList, parseAudioTrackList(newValue != null ? newValue : ""));
      media_audio_track_menu_privateMethod(this, _render, render_fn).call(this);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("change", media_audio_track_menu_privateMethod(this, _onChange, onChange_fn));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("change", media_audio_track_menu_privateMethod(this, _onChange, onChange_fn));
  }
  /**
   * Returns the anchor element when it is a floating menu.
   */
  get anchorElement() {
    var _a;
    if (this.anchor !== "auto")
      return super.anchorElement;
    return (_a = getMediaController(this)) == null ? void 0 : _a.querySelector(
      "media-audio-track-menu-button"
    );
  }
  get mediaAudioTrackList() {
    return media_audio_track_menu_privateGet(this, _audioTrackList);
  }
  set mediaAudioTrackList(list) {
    media_audio_track_menu_privateSet(this, _audioTrackList, list);
    media_audio_track_menu_privateMethod(this, _render, render_fn).call(this);
  }
  /**
   * Get enabled audio track id.
   */
  get mediaAudioTrackEnabled() {
    var _a;
    return (_a = getStringAttr(this, MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED)) != null ? _a : "";
  }
  set mediaAudioTrackEnabled(id) {
    setStringAttr(this, MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED, id);
  }
}
_audioTrackList = new WeakMap();
_prevState = new WeakMap();
_render = new WeakSet();
render_fn = function() {
  if (media_audio_track_menu_privateGet(this, _prevState) === JSON.stringify(this.mediaAudioTrackList))
    return;
  media_audio_track_menu_privateSet(this, _prevState, JSON.stringify(this.mediaAudioTrackList));
  const audioTrackList = this.mediaAudioTrackList;
  this.defaultSlot.textContent = "";
  audioTrackList.sort((a, b) => a.id.localeCompare(b.id, void 0, { numeric: true }));
  for (const audioTrack of audioTrackList) {
    const text = this.formatMenuItemText(audioTrack.label, audioTrack);
    const item = createMenuItem({
      type: "radio",
      text,
      value: `${audioTrack.id}`,
      checked: audioTrack.enabled
    });
    item.prepend(createIndicator(this, "checked-indicator"));
    this.defaultSlot.append(item);
  }
};
_onChange = new WeakSet();
onChange_fn = function() {
  if (this.value == null)
    return;
  const event = new GlobalThis.CustomEvent(
    MediaUIEvents.MEDIA_AUDIO_TRACK_REQUEST,
    {
      composed: true,
      bubbles: true,
      detail: this.value
    }
  );
  this.dispatchEvent(event);
};
if (!GlobalThis.customElements.get("media-audio-track-menu")) {
  GlobalThis.customElements.define(
    "media-audio-track-menu",
    MediaAudioTrackMenu
  );
}
var media_audio_track_menu_default = (/* unused pure expression or super */ null && (MediaAudioTrackMenu));


;// ../node_modules/media-chrome/dist/menu/media-audio-track-menu-button.js





const audioTrackIcon = (
  /*html*/
  `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M11 17H9.5V7H11v10Zm-3-3H6.5v-4H8v4Zm6-5h-1.5v6H14V9Zm3 7h-1.5V8H17v8Z"/>
  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-2 0a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/>
</svg>`
);
function media_audio_track_menu_button_getSlotTemplateHTML() {
  return (
    /*html*/
    `
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${audioTrackIcon}</slot>
  `
  );
}
function media_audio_track_menu_button_getTooltipContentHTML() {
  return t("Audio");
}
const media_audio_track_menu_button_updateAriaLabel = (el) => {
  const label = t("Audio");
  el.setAttribute("aria-label", label);
};
class MediaAudioTrackMenuButton extends MediaChromeMenuButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED,
      MediaUIAttributes.MEDIA_AUDIO_TRACK_UNAVAILABLE
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    media_audio_track_menu_button_updateAriaLabel(this);
  }
  attributeChangedCallback(attrName, _oldValue, newValue) {
    super.attributeChangedCallback(attrName, _oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_LANG) {
      media_audio_track_menu_button_updateAriaLabel(this);
    }
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute.
   * @return {HTMLElement | null}
   */
  get invokeTargetElement() {
    var _a;
    if (this.invokeTarget != void 0)
      return super.invokeTargetElement;
    return (_a = getMediaController(this)) == null ? void 0 : _a.querySelector("media-audio-track-menu");
  }
  /**
   * Get enabled audio track id.
   * @return {string}
   */
  get mediaAudioTrackEnabled() {
    var _a;
    return (_a = getStringAttr(this, MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED)) != null ? _a : "";
  }
  set mediaAudioTrackEnabled(id) {
    setStringAttr(this, MediaUIAttributes.MEDIA_AUDIO_TRACK_ENABLED, id);
  }
}
MediaAudioTrackMenuButton.getSlotTemplateHTML = media_audio_track_menu_button_getSlotTemplateHTML;
MediaAudioTrackMenuButton.getTooltipContentHTML = media_audio_track_menu_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-audio-track-menu-button")) {
  GlobalThis.customElements.define(
    "media-audio-track-menu-button",
    MediaAudioTrackMenuButton
  );
}
var media_audio_track_menu_button_default = (/* unused pure expression or super */ null && (MediaAudioTrackMenuButton));


;// ../node_modules/media-chrome/dist/menu/media-captions-menu.js
var media_captions_menu_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_captions_menu_privateGet = (obj, member, getter) => {
  media_captions_menu_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_captions_menu_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_captions_menu_privateSet = (obj, member, value, setter) => {
  media_captions_menu_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_captions_menu_privateMethod = (obj, member, method) => {
  media_captions_menu_accessCheck(obj, member, "access private method");
  return method;
};
var media_captions_menu_prevState, media_captions_menu_render, media_captions_menu_render_fn, media_captions_menu_onChange, media_captions_menu_onChange_fn;






const ccIcon = (
  /*html*/
  `
  <svg aria-hidden="true" viewBox="0 0 26 24" part="captions-indicator indicator">
    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
  </svg>`
);
function media_captions_menu_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${MediaChromeMenu.getTemplateHTML(_attrs)}
    <slot name="captions-indicator" hidden>${ccIcon}</slot>
  `
  );
}
class MediaCaptionsMenu extends MediaChromeMenu {
  constructor() {
    super(...arguments);
    media_captions_menu_privateAdd(this, media_captions_menu_render);
    media_captions_menu_privateAdd(this, media_captions_menu_onChange);
    media_captions_menu_privateAdd(this, media_captions_menu_prevState, void 0);
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_SUBTITLES_LIST,
      MediaUIAttributes.MEDIA_SUBTITLES_SHOWING
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_SUBTITLES_LIST && oldValue !== newValue) {
      media_captions_menu_privateMethod(this, media_captions_menu_render, media_captions_menu_render_fn).call(this);
    } else if (attrName === MediaUIAttributes.MEDIA_SUBTITLES_SHOWING && oldValue !== newValue) {
      this.value = newValue;
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("change", media_captions_menu_privateMethod(this, media_captions_menu_onChange, media_captions_menu_onChange_fn));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("change", media_captions_menu_privateMethod(this, media_captions_menu_onChange, media_captions_menu_onChange_fn));
  }
  /**
   * Returns the anchor element when it is a floating menu.
   */
  get anchorElement() {
    if (this.anchor !== "auto")
      return super.anchorElement;
    return getMediaController(this).querySelector("media-captions-menu-button");
  }
  /**
   * @type {Array<object>} An array of TextTrack-like objects.
   * Objects must have the properties: kind, language, and label.
   */
  get mediaSubtitlesList() {
    return media_captions_menu_getSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_LIST);
  }
  set mediaSubtitlesList(list) {
    media_captions_menu_setSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_LIST, list);
  }
  /**
   * An array of TextTrack-like objects.
   * Objects must have the properties: kind, language, and label.
   */
  get mediaSubtitlesShowing() {
    return media_captions_menu_getSubtitlesListAttr(
      this,
      MediaUIAttributes.MEDIA_SUBTITLES_SHOWING
    );
  }
  set mediaSubtitlesShowing(list) {
    media_captions_menu_setSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_SHOWING, list);
  }
}
media_captions_menu_prevState = new WeakMap();
media_captions_menu_render = new WeakSet();
media_captions_menu_render_fn = function() {
  var _a;
  if (media_captions_menu_privateGet(this, media_captions_menu_prevState) === JSON.stringify(this.mediaSubtitlesList))
    return;
  media_captions_menu_privateSet(this, media_captions_menu_prevState, JSON.stringify(this.mediaSubtitlesList));
  this.defaultSlot.textContent = "";
  const isOff = !this.value;
  const item = createMenuItem({
    type: "radio",
    text: this.formatMenuItemText(t("Off")),
    value: "off",
    checked: isOff
  });
  item.prepend(createIndicator(this, "checked-indicator"));
  this.defaultSlot.append(item);
  const subtitlesList = this.mediaSubtitlesList;
  for (const subs of subtitlesList) {
    const item2 = createMenuItem({
      type: "radio",
      text: this.formatMenuItemText(subs.label, subs),
      value: formatTextTrackObj(subs),
      checked: this.value == formatTextTrackObj(subs)
    });
    item2.prepend(createIndicator(this, "checked-indicator"));
    const type = (_a = subs.kind) != null ? _a : "subs";
    if (type === "captions") {
      item2.append(createIndicator(this, "captions-indicator"));
    }
    this.defaultSlot.append(item2);
  }
};
media_captions_menu_onChange = new WeakSet();
media_captions_menu_onChange_fn = function() {
  const showingSubs = this.mediaSubtitlesShowing;
  const showingSubsStr = this.getAttribute(
    MediaUIAttributes.MEDIA_SUBTITLES_SHOWING
  );
  const localStateChange = this.value !== showingSubsStr;
  if ((showingSubs == null ? void 0 : showingSubs.length) && localStateChange) {
    this.dispatchEvent(
      new GlobalThis.CustomEvent(
        MediaUIEvents.MEDIA_DISABLE_SUBTITLES_REQUEST,
        {
          composed: true,
          bubbles: true,
          detail: showingSubs
        }
      )
    );
  }
  if (!this.value || !localStateChange)
    return;
  const event = new GlobalThis.CustomEvent(
    MediaUIEvents.MEDIA_SHOW_SUBTITLES_REQUEST,
    {
      composed: true,
      bubbles: true,
      detail: this.value
    }
  );
  this.dispatchEvent(event);
};
MediaCaptionsMenu.getTemplateHTML = media_captions_menu_getTemplateHTML;
const media_captions_menu_getSubtitlesListAttr = (el, attrName) => {
  const attrVal = el.getAttribute(attrName);
  return attrVal ? parseTextTracksStr(attrVal) : [];
};
const media_captions_menu_setSubtitlesListAttr = (el, attrName, list) => {
  if (!(list == null ? void 0 : list.length)) {
    el.removeAttribute(attrName);
    return;
  }
  const newValStr = stringifyTextTrackList(list);
  const oldVal = el.getAttribute(attrName);
  if (oldVal === newValStr)
    return;
  el.setAttribute(attrName, newValStr);
};
if (!GlobalThis.customElements.get("media-captions-menu")) {
  GlobalThis.customElements.define("media-captions-menu", MediaCaptionsMenu);
}
var media_captions_menu_default = (/* unused pure expression or super */ null && (MediaCaptionsMenu));


;// ../node_modules/media-chrome/dist/menu/media-captions-menu-button.js






const media_captions_menu_button_ccIconOn = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`;
const media_captions_menu_button_ccIconOff = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;
function media_captions_menu_button_getSlotTemplateHTML() {
  return (
    /*html*/
    `
    <style>
      :host([data-captions-enabled="true"]) slot[name=off] {
        display: none !important;
      }

      ${/* Double negative, but safer if display doesn't equal 'block' */
    ""}
      :host(:not([data-captions-enabled="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${media_captions_menu_button_ccIconOn}</slot>
      <slot name="off">${media_captions_menu_button_ccIconOff}</slot>
    </slot>
  `
  );
}
function media_captions_menu_button_getTooltipContentHTML() {
  return t("Captions");
}
const media_captions_menu_button_updateAriaChecked = (el) => {
  el.setAttribute("data-captions-enabled", areSubsOn(el).toString());
};
const media_captions_menu_button_updateAriaLabel = (el) => {
  el.setAttribute("aria-label", t("closed captions"));
};
class MediaCaptionsMenuButton extends MediaChromeMenuButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_SUBTITLES_LIST,
      MediaUIAttributes.MEDIA_SUBTITLES_SHOWING,
      MediaUIAttributes.MEDIA_LANG
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    media_captions_menu_button_updateAriaLabel(this);
    media_captions_menu_button_updateAriaChecked(this);
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_SUBTITLES_SHOWING) {
      media_captions_menu_button_updateAriaChecked(this);
    } else if (attrName === MediaUIAttributes.MEDIA_LANG) {
      media_captions_menu_button_updateAriaLabel(this);
    }
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute.
   * @return {HTMLElement | null}
   */
  get invokeTargetElement() {
    var _a;
    if (this.invokeTarget != void 0)
      return super.invokeTargetElement;
    return (_a = getMediaController(this)) == null ? void 0 : _a.querySelector("media-captions-menu");
  }
  /**
   * An array of TextTrack-like objects.
   * Objects must have the properties: kind, language, and label.
   */
  get mediaSubtitlesList() {
    return media_captions_menu_button_getSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_LIST);
  }
  set mediaSubtitlesList(list) {
    media_captions_menu_button_setSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_LIST, list);
  }
  /**
   * An array of TextTrack-like objects.
   * Objects must have the properties: kind, language, and label.
   */
  get mediaSubtitlesShowing() {
    return media_captions_menu_button_getSubtitlesListAttr(
      this,
      MediaUIAttributes.MEDIA_SUBTITLES_SHOWING
    );
  }
  set mediaSubtitlesShowing(list) {
    media_captions_menu_button_setSubtitlesListAttr(this, MediaUIAttributes.MEDIA_SUBTITLES_SHOWING, list);
  }
}
MediaCaptionsMenuButton.getSlotTemplateHTML = media_captions_menu_button_getSlotTemplateHTML;
MediaCaptionsMenuButton.getTooltipContentHTML = media_captions_menu_button_getTooltipContentHTML;
const media_captions_menu_button_getSubtitlesListAttr = (el, attrName) => {
  const attrVal = el.getAttribute(attrName);
  return attrVal ? parseTextTracksStr(attrVal) : [];
};
const media_captions_menu_button_setSubtitlesListAttr = (el, attrName, list) => {
  if (!(list == null ? void 0 : list.length)) {
    el.removeAttribute(attrName);
    return;
  }
  const newValStr = stringifyTextTrackList(list);
  const oldVal = el.getAttribute(attrName);
  if (oldVal === newValStr)
    return;
  el.setAttribute(attrName, newValStr);
};
if (!GlobalThis.customElements.get("media-captions-menu-button")) {
  GlobalThis.customElements.define(
    "media-captions-menu-button",
    MediaCaptionsMenuButton
  );
}
var media_captions_menu_button_default = (/* unused pure expression or super */ null && (MediaCaptionsMenuButton));


;// ../node_modules/media-chrome/dist/menu/media-playback-rate-menu.js
var media_playback_rate_menu_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_playback_rate_menu_privateGet = (obj, member, getter) => {
  media_playback_rate_menu_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_playback_rate_menu_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_playback_rate_menu_privateMethod = (obj, member, method) => {
  media_playback_rate_menu_accessCheck(obj, member, "access private method");
  return method;
};
var media_playback_rate_menu_rates, media_playback_rate_menu_render, media_playback_rate_menu_render_fn, media_playback_rate_menu_onChange, media_playback_rate_menu_onChange_fn;






const media_playback_rate_menu_Attributes = {
  RATES: "rates"
};
class MediaPlaybackRateMenu extends MediaChromeMenu {
  constructor() {
    super();
    media_playback_rate_menu_privateAdd(this, media_playback_rate_menu_render);
    media_playback_rate_menu_privateAdd(this, media_playback_rate_menu_onChange);
    media_playback_rate_menu_privateAdd(this, media_playback_rate_menu_rates, new AttributeTokenList(this, media_playback_rate_menu_Attributes.RATES, {
      defaultValue: DEFAULT_RATES
    }));
    media_playback_rate_menu_privateMethod(this, media_playback_rate_menu_render, media_playback_rate_menu_render_fn).call(this);
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE,
      media_playback_rate_menu_Attributes.RATES
    ];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_PLAYBACK_RATE && oldValue != newValue) {
      this.value = newValue;
    } else if (attrName === media_playback_rate_menu_Attributes.RATES && oldValue != newValue) {
      media_playback_rate_menu_privateGet(this, media_playback_rate_menu_rates).value = newValue;
      media_playback_rate_menu_privateMethod(this, media_playback_rate_menu_render, media_playback_rate_menu_render_fn).call(this);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("change", media_playback_rate_menu_privateMethod(this, media_playback_rate_menu_onChange, media_playback_rate_menu_onChange_fn));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("change", media_playback_rate_menu_privateMethod(this, media_playback_rate_menu_onChange, media_playback_rate_menu_onChange_fn));
  }
  /**
   * Returns the anchor element when it is a floating menu.
   */
  get anchorElement() {
    if (this.anchor !== "auto")
      return super.anchorElement;
    return getMediaController(this).querySelector(
      "media-playback-rate-menu-button"
    );
  }
  /**
   * Get the playback rates for the button.
   */
  get rates() {
    return media_playback_rate_menu_privateGet(this, media_playback_rate_menu_rates);
  }
  /**
   * Set the playback rates for the button.
   * For React 19+ compatibility, accept a string of space-separated rates.
   */
  set rates(value) {
    if (!value) {
      media_playback_rate_menu_privateGet(this, media_playback_rate_menu_rates).value = "";
    } else if (Array.isArray(value)) {
      media_playback_rate_menu_privateGet(this, media_playback_rate_menu_rates).value = value.join(" ");
    } else if (typeof value === "string") {
      media_playback_rate_menu_privateGet(this, media_playback_rate_menu_rates).value = value;
    }
    media_playback_rate_menu_privateMethod(this, media_playback_rate_menu_render, media_playback_rate_menu_render_fn).call(this);
  }
  /**
   * The current playback rate
   */
  get mediaPlaybackRate() {
    return getNumericAttr(
      this,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE,
      DEFAULT_RATE
    );
  }
  set mediaPlaybackRate(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_PLAYBACK_RATE, value);
  }
}
media_playback_rate_menu_rates = new WeakMap();
media_playback_rate_menu_render = new WeakSet();
media_playback_rate_menu_render_fn = function() {
  this.defaultSlot.textContent = "";
  for (const rate of media_playback_rate_menu_privateGet(this, media_playback_rate_menu_rates)) {
    const item = createMenuItem({
      type: "radio",
      text: this.formatMenuItemText(`${rate}x`, rate),
      value: rate,
      checked: this.mediaPlaybackRate === Number(rate)
    });
    item.prepend(createIndicator(this, "checked-indicator"));
    this.defaultSlot.append(item);
  }
};
media_playback_rate_menu_onChange = new WeakSet();
media_playback_rate_menu_onChange_fn = function() {
  if (!this.value)
    return;
  const event = new GlobalThis.CustomEvent(
    MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
    {
      composed: true,
      bubbles: true,
      detail: this.value
    }
  );
  this.dispatchEvent(event);
};
if (!GlobalThis.customElements.get("media-playback-rate-menu")) {
  GlobalThis.customElements.define(
    "media-playback-rate-menu",
    MediaPlaybackRateMenu
  );
}
var media_playback_rate_menu_default = (/* unused pure expression or super */ null && (MediaPlaybackRateMenu));


;// ../node_modules/media-chrome/dist/menu/media-playback-rate-menu-button.js





const media_playback_rate_menu_button_DEFAULT_RATE = 1;
function media_playback_rate_menu_button_getSlotTemplateHTML(attrs) {
  return (
    /*html*/
    `
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
      
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${attrs["mediaplaybackrate"] || media_playback_rate_menu_button_DEFAULT_RATE}x</slot>
  `
  );
}
function media_playback_rate_menu_button_getTooltipContentHTML() {
  return t("Playback rate");
}
class MediaPlaybackRateMenuButton extends MediaChromeMenuButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE
    ];
  }
  constructor() {
    var _a;
    super();
    this.container = this.shadowRoot.querySelector('slot[name="icon"]');
    this.container.innerHTML = `${(_a = this.mediaPlaybackRate) != null ? _a : media_playback_rate_menu_button_DEFAULT_RATE}x`;
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_PLAYBACK_RATE) {
      const newPlaybackRate = newValue ? +newValue : Number.NaN;
      const playbackRate = !Number.isNaN(newPlaybackRate) ? newPlaybackRate : media_playback_rate_menu_button_DEFAULT_RATE;
      this.container.innerHTML = `${playbackRate}x`;
      this.setAttribute(
        "aria-label",
        t("Playback rate {playbackRate}", { playbackRate })
      );
    }
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute.
   */
  get invokeTargetElement() {
    if (this.invokeTarget != void 0)
      return super.invokeTargetElement;
    return getMediaController(this).querySelector("media-playback-rate-menu");
  }
  /**
   * The current playback rate
   */
  get mediaPlaybackRate() {
    return getNumericAttr(
      this,
      MediaUIAttributes.MEDIA_PLAYBACK_RATE,
      media_playback_rate_menu_button_DEFAULT_RATE
    );
  }
  set mediaPlaybackRate(value) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_PLAYBACK_RATE, value);
  }
}
MediaPlaybackRateMenuButton.getSlotTemplateHTML = media_playback_rate_menu_button_getSlotTemplateHTML;
MediaPlaybackRateMenuButton.getTooltipContentHTML = media_playback_rate_menu_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-playback-rate-menu-button")) {
  GlobalThis.customElements.define(
    "media-playback-rate-menu-button",
    MediaPlaybackRateMenuButton
  );
}
var media_playback_rate_menu_button_default = (/* unused pure expression or super */ null && (MediaPlaybackRateMenuButton));


;// ../node_modules/media-chrome/dist/menu/media-rendition-menu.js
var media_rendition_menu_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_rendition_menu_privateGet = (obj, member, getter) => {
  media_rendition_menu_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_rendition_menu_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_rendition_menu_privateSet = (obj, member, value, setter) => {
  media_rendition_menu_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_rendition_menu_privateMethod = (obj, member, method) => {
  media_rendition_menu_accessCheck(obj, member, "access private method");
  return method;
};
var _renditionList, media_rendition_menu_prevState, media_rendition_menu_render, media_rendition_menu_render_fn, media_rendition_menu_onChange, media_rendition_menu_onChange_fn;






class MediaRenditionMenu extends MediaChromeMenu {
  constructor() {
    super(...arguments);
    media_rendition_menu_privateAdd(this, media_rendition_menu_render);
    media_rendition_menu_privateAdd(this, media_rendition_menu_onChange);
    media_rendition_menu_privateAdd(this, _renditionList, []);
    media_rendition_menu_privateAdd(this, media_rendition_menu_prevState, {});
  }
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_RENDITION_LIST,
      MediaUIAttributes.MEDIA_RENDITION_SELECTED,
      MediaUIAttributes.MEDIA_RENDITION_UNAVAILABLE,
      MediaUIAttributes.MEDIA_HEIGHT
    ];
  }
  static formatMenuItemText(text, rendition) {
    return super.formatMenuItemText(text, rendition);
  }
  static formatRendition(rendition, { showBitrate = false } = {}) {
    const renditionText = `${Math.min(
      rendition.width,
      rendition.height
    )}p`;
    if (showBitrate && rendition.bitrate) {
      const mbps = rendition.bitrate / 1e6;
      const bitrateText = `${mbps.toFixed(mbps < 1 ? 1 : 0)} Mbps`;
      return `${renditionText} (${bitrateText})`;
    }
    return this.formatMenuItemText(renditionText, rendition);
  }
  static compareRendition(a, b) {
    var _a, _b;
    return b.height === a.height ? ((_a = b.bitrate) != null ? _a : 0) - ((_b = a.bitrate) != null ? _b : 0) : b.height - a.height;
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    super.attributeChangedCallback(attrName, oldValue, newValue);
    if (attrName === MediaUIAttributes.MEDIA_RENDITION_SELECTED && oldValue !== newValue) {
      this.value = newValue != null ? newValue : "auto";
      media_rendition_menu_privateMethod(this, media_rendition_menu_render, media_rendition_menu_render_fn).call(this);
    } else if (attrName === MediaUIAttributes.MEDIA_RENDITION_LIST && oldValue !== newValue) {
      media_rendition_menu_privateSet(this, _renditionList, parseRenditionList(newValue));
      media_rendition_menu_privateMethod(this, media_rendition_menu_render, media_rendition_menu_render_fn).call(this);
    } else if (attrName === MediaUIAttributes.MEDIA_HEIGHT && oldValue !== newValue) {
      media_rendition_menu_privateMethod(this, media_rendition_menu_render, media_rendition_menu_render_fn).call(this);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("change", media_rendition_menu_privateMethod(this, media_rendition_menu_onChange, media_rendition_menu_onChange_fn));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("change", media_rendition_menu_privateMethod(this, media_rendition_menu_onChange, media_rendition_menu_onChange_fn));
  }
  /**
   * Returns the anchor element when it is a floating menu.
   */
  get anchorElement() {
    if (this.anchor !== "auto")
      return super.anchorElement;
    return getMediaController(this).querySelector(
      "media-rendition-menu-button"
    );
  }
  get mediaRenditionList() {
    return media_rendition_menu_privateGet(this, _renditionList);
  }
  set mediaRenditionList(list) {
    media_rendition_menu_privateSet(this, _renditionList, list);
    media_rendition_menu_privateMethod(this, media_rendition_menu_render, media_rendition_menu_render_fn).call(this);
  }
  /**
   * Get selected rendition id.
   */
  get mediaRenditionSelected() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_RENDITION_SELECTED);
  }
  set mediaRenditionSelected(id) {
    setStringAttr(this, MediaUIAttributes.MEDIA_RENDITION_SELECTED, id);
  }
  get mediaHeight() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_HEIGHT);
  }
  set mediaHeight(height) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_HEIGHT, height);
  }
  compareRendition(a, b) {
    const ctor = this.constructor;
    return ctor.compareRendition(a, b);
  }
  formatMenuItemText(text, rendition) {
    const ctor = this.constructor;
    return ctor.formatMenuItemText(text, rendition);
  }
  formatRendition(rendition, options) {
    const ctor = this.constructor;
    return ctor.formatRendition(rendition, options);
  }
  showRenditionBitrate(rendition) {
    return this.mediaRenditionList.some(
      (r) => r !== rendition && r.height === rendition.height && r.bitrate !== rendition.bitrate
    );
  }
}
_renditionList = new WeakMap();
media_rendition_menu_prevState = new WeakMap();
media_rendition_menu_render = new WeakSet();
media_rendition_menu_render_fn = function() {
  if (media_rendition_menu_privateGet(this, media_rendition_menu_prevState).mediaRenditionList === JSON.stringify(this.mediaRenditionList) && media_rendition_menu_privateGet(this, media_rendition_menu_prevState).mediaHeight === this.mediaHeight)
    return;
  media_rendition_menu_privateGet(this, media_rendition_menu_prevState).mediaRenditionList = JSON.stringify(
    this.mediaRenditionList
  );
  media_rendition_menu_privateGet(this, media_rendition_menu_prevState).mediaHeight = this.mediaHeight;
  const renditionList = this.mediaRenditionList.sort(
    this.compareRendition.bind(this)
  );
  const selectedRendition = renditionList.find(
    (rendition) => rendition.id === this.mediaRenditionSelected
  );
  for (const rendition of renditionList) {
    rendition.selected = rendition === selectedRendition;
  }
  this.defaultSlot.textContent = "";
  const isAuto = !this.mediaRenditionSelected;
  for (const rendition of renditionList) {
    const text = this.formatRendition(rendition, {
      showBitrate: this.showRenditionBitrate(rendition)
    });
    const item2 = createMenuItem({
      type: "radio",
      text,
      value: `${rendition.id}`,
      checked: rendition.selected && !isAuto
    });
    item2.prepend(createIndicator(this, "checked-indicator"));
    this.defaultSlot.append(item2);
  }
  const showSelectedBitrate = selectedRendition && this.showRenditionBitrate(selectedRendition);
  const autoText = isAuto ? (
    // Auto • 1080p (4 Mbps)
    selectedRendition ? this.formatMenuItemText(
      `${t("Auto")} \u2022 ${this.formatRendition(selectedRendition, {
        showBitrate: showSelectedBitrate
      })}`,
      selectedRendition
    ) : this.formatMenuItemText(`${t("Auto")} (${this.mediaHeight}p)`)
  ) : this.formatMenuItemText(t("Auto"));
  const item = createMenuItem({
    type: "radio",
    text: autoText,
    value: "auto",
    checked: isAuto
  });
  item.dataset.description = autoText;
  item.prepend(createIndicator(this, "checked-indicator"));
  this.defaultSlot.append(item);
};
media_rendition_menu_onChange = new WeakSet();
media_rendition_menu_onChange_fn = function() {
  if (this.value == null)
    return;
  const event = new GlobalThis.CustomEvent(
    MediaUIEvents.MEDIA_RENDITION_REQUEST,
    {
      composed: true,
      bubbles: true,
      detail: this.value
    }
  );
  this.dispatchEvent(event);
};
if (!GlobalThis.customElements.get("media-rendition-menu")) {
  GlobalThis.customElements.define("media-rendition-menu", MediaRenditionMenu);
}
var media_rendition_menu_default = (/* unused pure expression or super */ null && (MediaRenditionMenu));


;// ../node_modules/media-chrome/dist/menu/media-rendition-menu-button.js





const renditionIcon = (
  /*html*/
  `<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M13.5 2.5h2v6h-2v-2h-11v-2h11v-2Zm4 2h4v2h-4v-2Zm-12 4h2v6h-2v-2h-3v-2h3v-2Zm4 2h12v2h-12v-2Zm1 4h2v6h-2v-2h-8v-2h8v-2Zm4 2h7v2h-7v-2Z" />
</svg>`
);
function media_rendition_menu_button_getSlotTemplateHTML() {
  return (
    /*html*/
    `
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${renditionIcon}</slot>
  `
  );
}
function media_rendition_menu_button_getTooltipContentHTML() {
  return t("Quality");
}
class MediaRenditionMenuButton extends MediaChromeMenuButton {
  static get observedAttributes() {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_RENDITION_SELECTED,
      MediaUIAttributes.MEDIA_RENDITION_UNAVAILABLE,
      MediaUIAttributes.MEDIA_HEIGHT
    ];
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("aria-label", t("quality"));
  }
  /**
   * Returns the element with the id specified by the `invoketarget` attribute.
   */
  get invokeTargetElement() {
    if (this.invokeTarget != void 0)
      return super.invokeTargetElement;
    return getMediaController(this).querySelector("media-rendition-menu");
  }
  /**
   * Get selected rendition id.
   */
  get mediaRenditionSelected() {
    return getStringAttr(this, MediaUIAttributes.MEDIA_RENDITION_SELECTED);
  }
  set mediaRenditionSelected(id) {
    setStringAttr(this, MediaUIAttributes.MEDIA_RENDITION_SELECTED, id);
  }
  get mediaHeight() {
    return getNumericAttr(this, MediaUIAttributes.MEDIA_HEIGHT);
  }
  set mediaHeight(height) {
    setNumericAttr(this, MediaUIAttributes.MEDIA_HEIGHT, height);
  }
}
MediaRenditionMenuButton.getSlotTemplateHTML = media_rendition_menu_button_getSlotTemplateHTML;
MediaRenditionMenuButton.getTooltipContentHTML = media_rendition_menu_button_getTooltipContentHTML;
if (!GlobalThis.customElements.get("media-rendition-menu-button")) {
  GlobalThis.customElements.define(
    "media-rendition-menu-button",
    MediaRenditionMenuButton
  );
}
var media_rendition_menu_button_default = (/* unused pure expression or super */ null && (MediaRenditionMenuButton));


;// ../node_modules/media-chrome/dist/menu/media-context-menu.js
var media_context_menu_accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var media_context_menu_privateGet = (obj, member, getter) => {
  media_context_menu_accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var media_context_menu_privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var media_context_menu_privateSet = (obj, member, value, setter) => {
  media_context_menu_accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var media_context_menu_privateMethod = (obj, member, method) => {
  media_context_menu_accessCheck(obj, member, "access private method");
  return method;
};
var _isContextMenuOpen, _updateVisibility, updateVisibility_fn, _closeContextMenu, closeContextMenu_fn, _closeOtherContextMenus, closeOtherContextMenus_fn, _isVideoContainer, isVideoContainer_fn, _onControllerContextMenu, _onContextMenu, onContextMenu_fn, _onDocumentClick, _onKeyDown, _onMenuClick;



function media_context_menu_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
      ${MediaChromeMenu.getTemplateHTML(_attrs)}
      <style>
        :host {
          --_menu-bg: rgb(20 20 30 / .8);
          background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
          min-width: var(--media-settings-menu-min-width, 170px);
          border-radius: 2px;
          overflow: hidden;
        }
      </style>
    `
  );
}
class MediaContextMenu extends MediaChromeMenu {
  constructor() {
    super();
    media_context_menu_privateAdd(this, _updateVisibility);
    media_context_menu_privateAdd(this, _closeContextMenu);
    media_context_menu_privateAdd(this, _closeOtherContextMenus);
    media_context_menu_privateAdd(this, _isVideoContainer);
    media_context_menu_privateAdd(this, _onContextMenu);
    media_context_menu_privateAdd(this, _isContextMenuOpen, false);
    media_context_menu_privateAdd(this, _onControllerContextMenu, (event) => {
      const target = event.target;
      const isVideoElement = (target == null ? void 0 : target.nodeName) === "VIDEO";
      const isVideoContainer = media_context_menu_privateMethod(this, _isVideoContainer, isVideoContainer_fn).call(this, target);
      if (isVideoElement || isVideoContainer) {
        if (!media_context_menu_privateGet(this, _isContextMenuOpen)) {
          media_context_menu_privateMethod(this, _onContextMenu, onContextMenu_fn).call(this, event);
        } else {
          media_context_menu_privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
        }
      }
    });
    media_context_menu_privateAdd(this, _onDocumentClick, (event) => {
      const target = event.target;
      const isInsideMenu = this.contains(target);
      const isRightClick = event.button === 2;
      const isVideo = (target == null ? void 0 : target.nodeName) === "VIDEO";
      const isVideoContainer = media_context_menu_privateMethod(this, _isVideoContainer, isVideoContainer_fn).call(this, target);
      if (isInsideMenu) {
        return;
      }
      const isRightClickOnVideo = isRightClick && (isVideo || isVideoContainer);
      if (isRightClickOnVideo) {
        return;
      }
      media_context_menu_privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
    });
    media_context_menu_privateAdd(this, _onKeyDown, (event) => {
      if (event.key === "Escape") {
        media_context_menu_privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
      }
    });
    media_context_menu_privateAdd(this, _onMenuClick, (event) => {
      var _a, _b;
      const target = event.target;
      if ((_a = target.matches) == null ? void 0 : _a.call(target, 'button[invoke="copy"]')) {
        const input = (_b = target.closest("media-context-menu-item")) == null ? void 0 : _b.querySelector('input[slot="copy"]');
        input && navigator.clipboard.writeText(input.value);
      }
      media_context_menu_privateMethod(this, _closeContextMenu, closeContextMenu_fn).call(this);
    });
    this.setAttribute("noautohide", "");
    media_context_menu_privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
  }
  connectedCallback() {
    super.connectedCallback();
    getMediaController(this).addEventListener(
      "contextmenu",
      media_context_menu_privateGet(this, _onControllerContextMenu)
    );
    this.addEventListener("click", media_context_menu_privateGet(this, _onMenuClick));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    getMediaController(this).removeEventListener(
      "contextmenu",
      media_context_menu_privateGet(this, _onControllerContextMenu)
    );
    this.removeEventListener("click", media_context_menu_privateGet(this, _onMenuClick));
    document.removeEventListener("mousedown", media_context_menu_privateGet(this, _onDocumentClick));
    document.removeEventListener("keydown", media_context_menu_privateGet(this, _onKeyDown));
  }
}
_isContextMenuOpen = new WeakMap();
_updateVisibility = new WeakSet();
updateVisibility_fn = function() {
  this.hidden = !media_context_menu_privateGet(this, _isContextMenuOpen);
};
_closeContextMenu = new WeakSet();
closeContextMenu_fn = function() {
  media_context_menu_privateSet(this, _isContextMenuOpen, false);
  media_context_menu_privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
};
_closeOtherContextMenus = new WeakSet();
closeOtherContextMenus_fn = function() {
  const allContextMenus = document.querySelectorAll("media-context-menu");
  allContextMenus.forEach((menu) => {
    var _a;
    if (menu !== this) {
      media_context_menu_privateMethod(_a = menu, _closeContextMenu, closeContextMenu_fn).call(_a);
    }
  });
};
_isVideoContainer = new WeakSet();
isVideoContainer_fn = function(element) {
  if (!element)
    return false;
  if (element.hasAttribute("slot") && element.getAttribute("slot") === "media") {
    return true;
  }
  if (element.nodeName.includes("-") && element.tagName.includes("-")) {
    const hasVideoAttributes = element.hasAttribute("src") || element.hasAttribute("poster") || element.hasAttribute("preload") || element.hasAttribute("playsinline");
    return hasVideoAttributes;
  }
  return false;
};
_onControllerContextMenu = new WeakMap();
_onContextMenu = new WeakSet();
onContextMenu_fn = function(event) {
  event.preventDefault();
  media_context_menu_privateMethod(this, _closeOtherContextMenus, closeOtherContextMenus_fn).call(this);
  media_context_menu_privateSet(this, _isContextMenuOpen, true);
  this.style.position = "fixed";
  this.style.left = `${event.clientX}px`;
  this.style.top = `${event.clientY}px`;
  media_context_menu_privateMethod(this, _updateVisibility, updateVisibility_fn).call(this);
  document.addEventListener("mousedown", media_context_menu_privateGet(this, _onDocumentClick), {
    once: true
  });
  document.addEventListener("keydown", media_context_menu_privateGet(this, _onKeyDown), { once: true });
};
_onDocumentClick = new WeakMap();
_onKeyDown = new WeakMap();
_onMenuClick = new WeakMap();
MediaContextMenu.getTemplateHTML = media_context_menu_getTemplateHTML;
if (!GlobalThis.customElements.get("media-context-menu")) {
  GlobalThis.customElements.define("media-context-menu", MediaContextMenu);
}
var media_context_menu_default = (/* unused pure expression or super */ null && (MediaContextMenu));


;// ../node_modules/media-chrome/dist/menu/media-context-menu-item.js


function media_context_menu_item_getTemplateHTML(_attrs) {
  return (
    /*html*/
    `
    ${MediaChromeMenuItem.getTemplateHTML.call(this, _attrs)}
    <style>
        ::slotted(*) {
            color: var(--media-text-color, white);
            text-decoration: none;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            min-height: var(--media-control-height, 24px);
        }
    </style>
  `
  );
}
class MediaContextMenuItem extends MediaChromeMenuItem {
}
MediaContextMenuItem.shadowRootOptions = { mode: "open" };
MediaContextMenuItem.getTemplateHTML = media_context_menu_item_getTemplateHTML;
if (!GlobalThis.customElements.get("media-context-menu-item")) {
  GlobalThis.customElements.define(
    "media-context-menu-item",
    MediaContextMenuItem
  );
}
var media_context_menu_item_default = (/* unused pure expression or super */ null && (MediaContextMenuItem));


;// ../node_modules/media-chrome/dist/menu/index.js


















;// ../node_modules/@mux/mux-player/dist/base.mjs
var base_Je=t=>{throw TypeError(t)};var base_he=(t,a,e)=>a.has(t)||base_Je("Cannot "+e);var base_u=(t,a,e)=>(base_he(t,a,"read from private field"),e?e.call(t):a.get(t)),E=(t,a,e)=>a.has(t)?base_Je("Cannot add the same private member more than once"):a instanceof WeakSet?a.add(t):a.set(t,e),dist_base_C=(t,a,e,i)=>(base_he(t,a,"write to private field"),i?i.call(t,e):a.set(t,e),e),base_p=(t,a,e)=>(base_he(t,a,"access private method"),e);var base_F=class{addEventListener(){}removeEventListener(){}dispatchEvent(a){return!0}};if(typeof DocumentFragment=="undefined"){class t extends base_F{}globalThis.DocumentFragment=t}var base_G=class extends base_F{},base_ge=class extends base_F{},base_Ut={get(t){},define(t,a,e){},getName(t){return null},upgrade(t){},whenDefined(t){return Promise.resolve(base_G)}},base_j,base_fe=class{constructor(a,e={}){E(this,base_j);dist_base_C(this,base_j,e==null?void 0:e.detail)}get detail(){return base_u(this,base_j)}initCustomEvent(){}};base_j=new WeakMap;function base_Vt(t,a){return new base_G}var base_et={document:{createElement:base_Vt},DocumentFragment,customElements:base_Ut,CustomEvent:base_fe,EventTarget:base_F,HTMLElement:base_G,HTMLVideoElement:base_ge},base_tt=typeof window=="undefined"||typeof globalThis.customElements=="undefined",base_k=base_tt?base_et:globalThis,dist_base_P=base_tt?base_et.document:globalThis.document;function dist_base_at(t){let a="";return Object.entries(t).forEach(([e,i])=>{i!=null&&(a+=`${base_re(e)}: ${i}; `)}),a?a.trim():void 0}function base_re(t){return t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function base_oe(t){return t.replace(/[-_]([a-z])/g,(a,e)=>e.toUpperCase())}function base_y(t){if(t==null)return;let a=+t;return Number.isNaN(a)?void 0:a}function base_ye(t){let a=base_Bt(t).toString();return a?"?"+a:""}function base_Bt(t){let a={};for(let e in t)t[e]!=null&&(a[e]=t[e]);return new URLSearchParams(a)}var base_ve=(t,a)=>!t||!a?!1:t.contains(a)?!0:base_ve(t,a.getRootNode().host);var base_rt="mux.com",base_Ht=()=>{try{return"3.8.0"}catch{}return"UNKNOWN"},base_Kt=base_Ht(),base_se=()=>base_Kt,base_ot=(t,{token:a,customDomain:e=base_rt,thumbnailTime:i,programTime:r}={})=>{var l;let n=a==null?i:void 0,{aud:d}=(l=dist_ee(a))!=null?l:{};if(!(a&&d!=="t"))return`https://image.${e}/${t}/thumbnail.webp${base_ye({token:a,time:n,program_time:r})}`},base_nt=(t,{token:a,customDomain:e=base_rt,programStartTime:i,programEndTime:r}={})=>{var d;let{aud:n}=(d=dist_ee(a))!=null?d:{};if(!(a&&n!=="s"))return`https://image.${e}/${t}/storyboard.vtt${base_ye({token:a,format:"webp",program_start_time:i,program_end_time:r})}`},base_z=t=>{if(t){if([dist_.LIVE,dist_.ON_DEMAND].includes(t))return t;if(t!=null&&t.includes("live"))return dist_.LIVE}};var base_$t={crossorigin:"crossOrigin",playsinline:"playsInline"};function base_st(t){var a;return(a=base_$t[t])!=null?a:base_oe(t)}var dist_base_D,base_U,dist_base_v,base_ne=class{constructor(a,e){E(this,dist_base_D);E(this,base_U);E(this,dist_base_v,[]);dist_base_C(this,dist_base_D,a),dist_base_C(this,base_U,e)}[Symbol.iterator](){return base_u(this,dist_base_v).values()}get length(){return base_u(this,dist_base_v).length}get value(){var a;return(a=base_u(this,dist_base_v).join(" "))!=null?a:""}set value(a){var e;a!==this.value&&(dist_base_C(this,dist_base_v,[]),this.add(...(e=a==null?void 0:a.split(" "))!=null?e:[]))}toString(){return this.value}item(a){return base_u(this,dist_base_v)[a]}values(){return base_u(this,dist_base_v).values()}keys(){return base_u(this,dist_base_v).keys()}forEach(a){base_u(this,dist_base_v).forEach(a)}add(...a){var e,i;a.forEach(r=>{this.contains(r)||base_u(this,dist_base_v).push(r)}),!(this.value===""&&!((e=base_u(this,dist_base_D))!=null&&e.hasAttribute(`${base_u(this,base_U)}`)))&&((i=base_u(this,dist_base_D))==null||i.setAttribute(`${base_u(this,base_U)}`,`${this.value}`))}remove(...a){var e;a.forEach(i=>{base_u(this,dist_base_v).splice(base_u(this,dist_base_v).indexOf(i),1)}),(e=base_u(this,dist_base_D))==null||e.setAttribute(`${base_u(this,base_U)}`,`${this.value}`)}contains(a){return base_u(this,dist_base_v).includes(a)}toggle(a,e){return typeof e!="undefined"?e?(this.add(a),!0):(this.remove(a),!1):this.contains(a)?(this.remove(a),!1):(this.add(a),!0)}replace(a,e){this.remove(a),this.add(e)}};dist_base_D=new WeakMap,base_U=new WeakMap,dist_base_v=new WeakMap;var base_dt=`[mux-player ${base_se()}]`;function dist_base_x(...t){console.warn(base_dt,...t)}function base_T(...t){console.error(base_dt,...t)}function base_Te(t){var e;let a=(e=t.message)!=null?e:"";t.context&&(a+=` ${t.context}`),t.file&&(a+=` ${x("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${t.file}`),dist_base_x(a)}var dist_base_g={AUTOPLAY:"autoplay",CROSSORIGIN:"crossorigin",LOOP:"loop",MUTED:"muted",PLAYSINLINE:"playsinline",PRELOAD:"preload"},dist_base_N={VOLUME:"volume",PLAYBACKRATE:"playbackrate",MUTED:"muted"},Ha={...dist_base_g,...dist_base_N},base_ut=Object.freeze({length:0,start(t){let a=t>>>0;if(a>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${a}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(t){let a=t>>>0;if(a>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${a}) is greater than or equal to the maximum bound (${this.length}).`);return 0}}),base_Yt=Object.values(dist_base_g).filter(t=>dist_base_g.PLAYSINLINE!==t),base_Wt=Object.values(dist_base_N),base_Zt=[...base_Yt,...base_Wt],base_Ae=class extends base_k.HTMLElement{static get observedAttributes(){return base_Zt}constructor(){super()}attributeChangedCallback(a,e,i){var r,n;switch(a){case dist_base_N.MUTED:{this.media&&(this.media.muted=i!=null,this.media.defaultMuted=i!=null);return}case dist_base_N.VOLUME:{let d=(r=base_y(i))!=null?r:1;this.media&&(this.media.volume=d);return}case dist_base_N.PLAYBACKRATE:{let d=(n=base_y(i))!=null?n:1;this.media&&(this.media.playbackRate=d,this.media.defaultPlaybackRate=d);return}}}play(){var a,e;return(e=(a=this.media)==null?void 0:a.play())!=null?e:Promise.reject()}pause(){var a;(a=this.media)==null||a.pause()}load(){var a;(a=this.media)==null||a.load()}get media(){var a;return(a=this.shadowRoot)==null?void 0:a.querySelector("mux-video")}get audioTracks(){return this.media.audioTracks}get videoTracks(){return this.media.videoTracks}get audioRenditions(){return this.media.audioRenditions}get videoRenditions(){return this.media.videoRenditions}get paused(){var a,e;return(e=(a=this.media)==null?void 0:a.paused)!=null?e:!0}get duration(){var a,e;return(e=(a=this.media)==null?void 0:a.duration)!=null?e:NaN}get ended(){var a,e;return(e=(a=this.media)==null?void 0:a.ended)!=null?e:!1}get buffered(){var a,e;return(e=(a=this.media)==null?void 0:a.buffered)!=null?e:base_ut}get seekable(){var a,e;return(e=(a=this.media)==null?void 0:a.seekable)!=null?e:base_ut}get readyState(){var a,e;return(e=(a=this.media)==null?void 0:a.readyState)!=null?e:0}get videoWidth(){var a,e;return(e=(a=this.media)==null?void 0:a.videoWidth)!=null?e:0}get videoHeight(){var a,e;return(e=(a=this.media)==null?void 0:a.videoHeight)!=null?e:0}get currentSrc(){var a,e;return(e=(a=this.media)==null?void 0:a.currentSrc)!=null?e:""}get currentTime(){var a,e;return(e=(a=this.media)==null?void 0:a.currentTime)!=null?e:0}set currentTime(a){this.media&&(this.media.currentTime=Number(a))}get volume(){var a,e;return(e=(a=this.media)==null?void 0:a.volume)!=null?e:1}set volume(a){this.media&&(this.media.volume=Number(a))}get playbackRate(){var a,e;return(e=(a=this.media)==null?void 0:a.playbackRate)!=null?e:1}set playbackRate(a){this.media&&(this.media.playbackRate=Number(a))}get defaultPlaybackRate(){var a;return(a=base_y(this.getAttribute(dist_base_N.PLAYBACKRATE)))!=null?a:1}set defaultPlaybackRate(a){a!=null?this.setAttribute(dist_base_N.PLAYBACKRATE,`${a}`):this.removeAttribute(dist_base_N.PLAYBACKRATE)}get crossOrigin(){return base_X(this,dist_base_g.CROSSORIGIN)}set crossOrigin(a){this.setAttribute(dist_base_g.CROSSORIGIN,`${a}`)}get autoplay(){return base_X(this,dist_base_g.AUTOPLAY)!=null}set autoplay(a){a?this.setAttribute(dist_base_g.AUTOPLAY,typeof a=="string"?a:""):this.removeAttribute(dist_base_g.AUTOPLAY)}get loop(){return base_X(this,dist_base_g.LOOP)!=null}set loop(a){a?this.setAttribute(dist_base_g.LOOP,""):this.removeAttribute(dist_base_g.LOOP)}get muted(){var a,e;return(e=(a=this.media)==null?void 0:a.muted)!=null?e:!1}set muted(a){this.media&&(this.media.muted=!!a)}get defaultMuted(){return base_X(this,dist_base_g.MUTED)!=null}set defaultMuted(a){a?this.setAttribute(dist_base_g.MUTED,""):this.removeAttribute(dist_base_g.MUTED)}get playsInline(){return base_X(this,dist_base_g.PLAYSINLINE)!=null}set playsInline(a){base_T("playsInline is set to true by default and is not currently supported as a setter.")}get preload(){return this.media?this.media.preload:this.getAttribute("preload")}set preload(a){["","none","metadata","auto"].includes(a)?this.setAttribute(dist_base_g.PRELOAD,a):this.removeAttribute(dist_base_g.PRELOAD)}};function base_X(t,a){return t.media?t.media.getAttribute(a):t.getAttribute(a)}var base_Ce=base_Ae;var base_mt=`:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`;var base_q=new WeakMap,dist_base_e=class t{constructor(a,e){this.element=a;this.type=e;this.element.addEventListener(this.type,this);let i=base_q.get(this.element);i&&i.set(this.type,this)}set(a){if(typeof a=="function")this.handleEvent=a.bind(this.element);else if(typeof a=="object"&&typeof a.handleEvent=="function")this.handleEvent=a.handleEvent.bind(a);else{this.element.removeEventListener(this.type,this);let e=base_q.get(this.element);e&&e.delete(this.type)}}static for(a){base_q.has(a.element)||base_q.set(a.element,new Map);let e=a.attributeName.slice(2),i=base_q.get(a.element);return i&&i.has(e)?i.get(e):new t(a.element,e)}};function base_zt(t,a){return t instanceof AttrPart&&t.attributeName.startsWith("on")?(dist_base_e.for(t).set(a),t.element.removeAttributeNS(t.attributeNamespace,t.attributeName),!0):!1}function base_Xt(t,a){return a instanceof base_de&&t instanceof ChildNodePart?(a.renderInto(t),!0):!1}function base_qt(t,a){return a instanceof DocumentFragment&&t instanceof ChildNodePart?(a.childNodes.length&&t.replace(...a.childNodes),!0):!1}function base_Qt(t,a){if(t instanceof AttrPart){let e=t.attributeNamespace,i=t.element.getAttributeNS(e,t.attributeName);return String(a)!==i&&(t.value=String(a)),!0}return t.value=String(a),!0}function base_Jt(t,a){if(t instanceof AttrPart&&a instanceof Element){let e=t.element;return e[t.attributeName]!==a&&(t.element.removeAttributeNS(t.attributeNamespace,t.attributeName),e[t.attributeName]=a),!0}return!1}function base_ea(t,a){if(typeof a=="boolean"&&t instanceof AttrPart){let e=t.attributeNamespace,i=t.element.hasAttributeNS(e,t.attributeName);return a!==i&&(t.booleanValue=a),!0}return!1}function base_ta(t,a){return a===!1&&t instanceof ChildNodePart?(t.replace(""),!0):!1}function base_aa(t,a){base_Jt(t,a)||base_ea(t,a)||base_zt(t,a)||base_ta(t,a)||base_Xt(t,a)||base_qt(t,a)||base_Qt(t,a)}var base_ke=new Map,base_ct=new WeakMap,base_pt=new WeakMap,base_de=class{constructor(a,e,i){this.strings=a;this.values=e;this.processor=i;this.stringsKey=this.strings.join("")}get template(){if(base_ke.has(this.stringsKey))return base_ke.get(this.stringsKey);{let a=dist_base_P.createElement("template"),e=this.strings.length-1;return a.innerHTML=this.strings.reduce((i,r,n)=>i+r+(n<e?`{{ ${n} }}`:""),""),base_ke.set(this.stringsKey,a),a}}renderInto(a){var r;let e=this.template;if(base_ct.get(a)!==e){base_ct.set(a,e);let n=new TemplateInstance(e,this.values,this.processor);base_pt.set(a,n),a instanceof ChildNodePart?a.replace(...n.children):a.appendChild(n);return}let i=base_pt.get(a);(r=i==null?void 0:i.update)==null||r.call(i,this.values)}},base_ia={processCallback(t,a,e){var i;if(e){for(let[r,n]of a)if(r in e){let d=(i=e[r])!=null?i:"";base_aa(n,d)}}}};function base_Q(t,...a){return new base_de(t,a,base_ia)}function base_bt(t,a){t.renderInto(a)}var base_oa=t=>{let{tokens:a}=t;return a.drm?":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }":""},base_gt=t=>base_Q`
  <style>
    ${base_oa(t)}
    ${base_mt}
  </style>
  ${base_la(t)}
`,base_na=t=>{let a=t.hotKeys?`${t.hotKeys}`:"";return base_z(t.streamType)==="live"&&(a+=" noarrowleft noarrowright"),a},base_sa={TOP:"top",CENTER:"center",BOTTOM:"bottom",LAYER:"layer",MEDIA_LAYER:"media-layer",POSTER_LAYER:"poster-layer",VERTICAL_LAYER:"vertical-layer",CENTERED_LAYER:"centered-layer",GESTURE_LAYER:"gesture-layer",CONTROLLER_LAYER:"controller",BUTTON:"button",RANGE:"range",DISPLAY:"display",CONTROL_BAR:"control-bar",MENU_BUTTON:"menu-button",MENU:"menu",OPTION:"option",POSTER:"poster",LIVE:"live",PLAY:"play",PRE_PLAY:"pre-play",SEEK_BACKWARD:"seek-backward",SEEK_FORWARD:"seek-forward",MUTE:"mute",CAPTIONS:"captions",AIRPLAY:"airplay",PIP:"pip",FULLSCREEN:"fullscreen",CAST:"cast",PLAYBACK_RATE:"playback-rate",VOLUME:"volume",TIME:"time",TITLE:"title",AUDIO_TRACK:"audio-track",RENDITION:"rendition"},base_da=Object.values(base_sa).join(", "),base_la=t=>{var a,e,i,r,n,d,l,b,S,Y,_,A,R,$,h,ie,W,Z,Ie,Pe,De,Ue,Ve,Be,He,Ke,$e,Fe,Ye,We,Ze,Ge,je,ze,Xe,qe,Qe;return base_Q`
  <media-theme
    template="${t.themeTemplate||!1}"
    defaultstreamtype="${(a=t.defaultStreamType)!=null?a:!1}"
    hotkeys="${base_na(t)||!1}"
    nohotkeys="${t.noHotKeys||!t.hasSrc||!1}"
    noautoseektolive="${!!((e=t.streamType)!=null&&e.includes(dist_.LIVE))&&t.targetLiveWindow!==0}"
    novolumepref="${t.novolumepref||!1}"
    nomutedpref="${t.nomutedpref||!1}"
    disabled="${!t.hasSrc||t.isDialogOpen}"
    audio="${(i=t.audio)!=null?i:!1}"
    style="${(r=dist_base_at({"--media-primary-color":t.primaryColor,"--media-secondary-color":t.secondaryColor,"--media-accent-color":t.accentColor}))!=null?r:!1}"
    defaultsubtitles="${!t.defaultHiddenCaptions}"
    forwardseekoffset="${(n=t.forwardSeekOffset)!=null?n:!1}"
    backwardseekoffset="${(d=t.backwardSeekOffset)!=null?d:!1}"
    playbackrates="${(l=t.playbackRates)!=null?l:!1}"
    defaultshowremainingtime="${(b=t.defaultShowRemainingTime)!=null?b:!1}"
    defaultduration="${(S=t.defaultDuration)!=null?S:!1}"
    hideduration="${(Y=t.hideDuration)!=null?Y:!1}"
    title="${(_=t.title)!=null?_:!1}"
    videotitle="${(A=t.videoTitle)!=null?A:!1}"
    proudlydisplaymuxbadge="${(R=t.proudlyDisplayMuxBadge)!=null?R:!1}"
    exportparts="${base_da}"
    onclose="${t.onCloseErrorDialog}"
    onfocusin="${t.onFocusInErrorDialog}"
  >
    <mux-video
      slot="media"
      inert="${($=t.noHotKeys)!=null?$:!1}"
      target-live-window="${(h=t.targetLiveWindow)!=null?h:!1}"
      stream-type="${(ie=base_z(t.streamType))!=null?ie:!1}"
      crossorigin="${(W=t.crossOrigin)!=null?W:""}"
      playsinline
      autoplay="${(Z=t.autoplay)!=null?Z:!1}"
      muted="${(Ie=t.muted)!=null?Ie:!1}"
      loop="${(Pe=t.loop)!=null?Pe:!1}"
      preload="${(De=t.preload)!=null?De:!1}"
      debug="${(Ue=t.debug)!=null?Ue:!1}"
      prefer-cmcd="${(Ve=t.preferCmcd)!=null?Ve:!1}"
      disable-tracking="${(Be=t.disableTracking)!=null?Be:!1}"
      disable-cookies="${(He=t.disableCookies)!=null?He:!1}"
      prefer-playback="${(Ke=t.preferPlayback)!=null?Ke:!1}"
      start-time="${t.startTime!=null?t.startTime:!1}"
      beacon-collection-domain="${($e=t.beaconCollectionDomain)!=null?$e:!1}"
      player-init-time="${(Fe=t.playerInitTime)!=null?Fe:!1}"
      player-software-name="${(Ye=t.playerSoftwareName)!=null?Ye:!1}"
      player-software-version="${(We=t.playerSoftwareVersion)!=null?We:!1}"
      env-key="${(Ze=t.envKey)!=null?Ze:!1}"
      custom-domain="${(Ge=t.customDomain)!=null?Ge:!1}"
      src="${t.src?t.src:t.playbackId?dist_qr(t):!1}"
      cast-src="${t.src?t.src:t.playbackId?dist_qr(t):!1}"
      cast-receiver="${(je=t.castReceiver)!=null?je:!1}"
      drm-token="${(Xe=(ze=t.tokens)==null?void 0:ze.drm)!=null?Xe:!1}"
      exportparts="video"
      disable-pseudo-ended="${(qe=t.disablePseudoEnded)!=null?qe:!1}"
    >
      ${t.storyboard?base_Q`<track label="thumbnails" default kind="metadata" src="${t.storyboard}" />`:base_Q``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${t.poster?t.poster:!1}"
        placeholdersrc="${(Qe=t.placeholder)!=null?Qe:!1}"
      ></media-poster-image>
    </slot>
  </media-theme>
`};var base_vt=t=>t.charAt(0).toUpperCase()+t.slice(1),base_ua=(t,a=!1)=>{var e,i;if(t.muxCode){let r=base_vt((e=t.errorCategory)!=null?e:"video"),n=dist_V((i=t.errorCategory)!=null?i:dist_C.VIDEO);if(t.muxCode===dist_D.NETWORK_OFFLINE)return x("Your device appears to be offline",a);if(t.muxCode===dist_D.NETWORK_TOKEN_EXPIRED)return x("{category} URL has expired",a).format({category:r});if([dist_D.NETWORK_TOKEN_SUB_MISMATCH,dist_D.NETWORK_TOKEN_AUD_MISMATCH,dist_D.NETWORK_TOKEN_AUD_MISSING,dist_D.NETWORK_TOKEN_MALFORMED].includes(t.muxCode))return x("{category} URL is formatted incorrectly",a).format({category:r});if(t.muxCode===dist_D.NETWORK_TOKEN_MISSING)return x("Invalid {categoryName} URL",a).format({categoryName:n});if(t.muxCode===dist_D.NETWORK_NOT_FOUND)return x("{category} does not exist",a).format({category:r});if(t.muxCode===dist_D.NETWORK_NOT_READY){let d=t.streamType==="live"?"Live stream":"Video";return x("{mediaType} is not currently available",a).format({mediaType:d})}}if(t.code){if(t.code===f.MEDIA_ERR_NETWORK)return x("Network Error",a);if(t.code===f.MEDIA_ERR_DECODE)return x("Media Error",a);if(t.code===f.MEDIA_ERR_SRC_NOT_SUPPORTED)return x("Source Not Supported",a)}return x("Error",a)},base_ma=(t,a=!1)=>{var e,i;if(t.muxCode){let r=base_vt((e=t.errorCategory)!=null?e:"video"),n=dist_V((i=t.errorCategory)!=null?i:dist_C.VIDEO);return t.muxCode===dist_D.NETWORK_OFFLINE?x("Check your internet connection and try reloading this video.",a):t.muxCode===dist_D.NETWORK_TOKEN_EXPIRED?x("The video\u2019s secured {tokenNamePrefix}-token has expired.",a).format({tokenNamePrefix:n}):t.muxCode===dist_D.NETWORK_TOKEN_SUB_MISMATCH?x("The video\u2019s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",a).format({tokenNamePrefix:n}):t.muxCode===dist_D.NETWORK_TOKEN_MALFORMED?x("{category} URL is formatted incorrectly",a).format({category:r}):[dist_D.NETWORK_TOKEN_AUD_MISMATCH,dist_D.NETWORK_TOKEN_AUD_MISSING].includes(t.muxCode)?x("The {tokenNamePrefix}-token is formatted with incorrect information.",a).format({tokenNamePrefix:n}):[dist_D.NETWORK_TOKEN_MISSING,dist_D.NETWORK_INVALID_URL].includes(t.muxCode)?x("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.",a).format({tokenNamePrefix:n}):t.muxCode===dist_D.NETWORK_NOT_FOUND?"":t.message}return t.code&&(t.code===f.MEDIA_ERR_NETWORK||t.code===f.MEDIA_ERR_DECODE||t.code===f.MEDIA_ERR_SRC_NOT_SUPPORTED),t.message},base_Et=(t,a=!1)=>{let e=base_ua(t,a).toString(),i=base_ma(t,a).toString();return{title:e,message:i}},base_ca=t=>{if(t.muxCode){if(t.muxCode===dist_D.NETWORK_TOKEN_EXPIRED)return"403-expired-token.md";if(t.muxCode===dist_D.NETWORK_TOKEN_MALFORMED)return"403-malformatted-token.md";if([dist_D.NETWORK_TOKEN_AUD_MISMATCH,dist_D.NETWORK_TOKEN_AUD_MISSING].includes(t.muxCode))return"403-incorrect-aud-value.md";if(t.muxCode===dist_D.NETWORK_TOKEN_SUB_MISMATCH)return"403-playback-id-mismatch.md";if(t.muxCode===dist_D.NETWORK_TOKEN_MISSING)return"missing-signed-tokens.md";if(t.muxCode===dist_D.NETWORK_NOT_FOUND)return"404-not-found.md";if(t.muxCode===dist_D.NETWORK_NOT_READY)return"412-not-playable.md"}if(t.code){if(t.code===f.MEDIA_ERR_NETWORK)return"";if(t.code===f.MEDIA_ERR_DECODE)return"media-decode-error.md";if(t.code===f.MEDIA_ERR_SRC_NOT_SUPPORTED)return"media-src-not-supported.md"}return""},base_Re=(t,a)=>{let e=base_ca(t);return{message:t.message,context:t.context,file:e}};var base_Tt=`<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before,
    :host([videotitle]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>

    <template if="!audio">
      <media-error-dialog slot="dialog" noautohide></media-error-dialog>
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`;var base_xe=dist_base_P.createElement("template");"innerHTML"in base_xe&&(base_xe.innerHTML=base_Tt);var base_At,base_Ct,base_me=class extends MediaThemeElement{};base_me.template=(base_Ct=(base_At=base_xe.content)==null?void 0:base_At.children)==null?void 0:base_Ct[0];base_k.customElements.get("media-theme-gerwig")||base_k.customElements.define("media-theme-gerwig",base_me);var base_va="gerwig",M={SRC:"src",POSTER:"poster"},base_o={STYLE:"style",DEFAULT_HIDDEN_CAPTIONS:"default-hidden-captions",PRIMARY_COLOR:"primary-color",SECONDARY_COLOR:"secondary-color",ACCENT_COLOR:"accent-color",FORWARD_SEEK_OFFSET:"forward-seek-offset",BACKWARD_SEEK_OFFSET:"backward-seek-offset",PLAYBACK_TOKEN:"playback-token",THUMBNAIL_TOKEN:"thumbnail-token",STORYBOARD_TOKEN:"storyboard-token",FULLSCREEN_ELEMENT:"fullscreen-element",DRM_TOKEN:"drm-token",STORYBOARD_SRC:"storyboard-src",THUMBNAIL_TIME:"thumbnail-time",AUDIO:"audio",NOHOTKEYS:"nohotkeys",HOTKEYS:"hotkeys",PLAYBACK_RATES:"playbackrates",DEFAULT_SHOW_REMAINING_TIME:"default-show-remaining-time",DEFAULT_DURATION:"default-duration",TITLE:"title",VIDEO_TITLE:"video-title",PLACEHOLDER:"placeholder",THEME:"theme",DEFAULT_STREAM_TYPE:"default-stream-type",TARGET_LIVE_WINDOW:"target-live-window",EXTRA_SOURCE_PARAMS:"extra-source-params",NO_VOLUME_PREF:"no-volume-pref",NO_MUTED_PREF:"no-muted-pref",CAST_RECEIVER:"cast-receiver",NO_TOOLTIPS:"no-tooltips",PROUDLY_DISPLAY_MUX_BADGE:"proudly-display-mux-badge",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended"},base_Se=["audio","backwardseekoffset","defaultduration","defaultshowremainingtime","defaultsubtitles","noautoseektolive","disabled","exportparts","forwardseekoffset","hideduration","hotkeys","nohotkeys","playbackrates","defaultstreamtype","streamtype","style","targetlivewindow","template","title","videotitle","novolumepref","nomutedpref","proudlydisplaymuxbadge"];function base_Ea(t,a){var i,r;return{src:!t.playbackId&&t.src,playbackId:t.playbackId,hasSrc:!!t.playbackId||!!t.src||!!t.currentSrc,poster:t.poster,storyboard:t.storyboard,storyboardSrc:t.getAttribute(base_o.STORYBOARD_SRC),fullscreenElement:t.getAttribute(base_o.FULLSCREEN_ELEMENT),placeholder:t.getAttribute("placeholder"),themeTemplate:base_Aa(t),thumbnailTime:!t.tokens.thumbnail&&t.thumbnailTime,autoplay:t.autoplay,crossOrigin:t.crossOrigin,loop:t.loop,noHotKeys:t.hasAttribute(base_o.NOHOTKEYS),hotKeys:t.getAttribute(base_o.HOTKEYS),muted:t.muted,paused:t.paused,preload:t.preload,envKey:t.envKey,preferCmcd:t.preferCmcd,debug:t.debug,disableTracking:t.disableTracking,disableCookies:t.disableCookies,tokens:t.tokens,beaconCollectionDomain:t.beaconCollectionDomain,maxResolution:t.maxResolution,minResolution:t.minResolution,programStartTime:t.programStartTime,programEndTime:t.programEndTime,assetStartTime:t.assetStartTime,assetEndTime:t.assetEndTime,renditionOrder:t.renditionOrder,metadata:t.metadata,playerInitTime:t.playerInitTime,playerSoftwareName:t.playerSoftwareName,playerSoftwareVersion:t.playerSoftwareVersion,startTime:t.startTime,preferPlayback:t.preferPlayback,audio:t.audio,defaultStreamType:t.defaultStreamType,targetLiveWindow:t.getAttribute(base_e.TARGET_LIVE_WINDOW),streamType:base_z(t.getAttribute(base_e.STREAM_TYPE)),primaryColor:t.getAttribute(base_o.PRIMARY_COLOR),secondaryColor:t.getAttribute(base_o.SECONDARY_COLOR),accentColor:t.getAttribute(base_o.ACCENT_COLOR),forwardSeekOffset:t.forwardSeekOffset,backwardSeekOffset:t.backwardSeekOffset,defaultHiddenCaptions:t.defaultHiddenCaptions,defaultDuration:t.defaultDuration,defaultShowRemainingTime:t.defaultShowRemainingTime,hideDuration:Ca(t),playbackRates:t.getAttribute(base_o.PLAYBACK_RATES),customDomain:(i=t.getAttribute(base_e.CUSTOM_DOMAIN))!=null?i:void 0,title:t.getAttribute(base_o.TITLE),videoTitle:(r=t.getAttribute(base_o.VIDEO_TITLE))!=null?r:t.getAttribute(base_o.TITLE),novolumepref:t.hasAttribute(base_o.NO_VOLUME_PREF),nomutedpref:t.hasAttribute(base_o.NO_MUTED_PREF),proudlyDisplayMuxBadge:t.hasAttribute(base_o.PROUDLY_DISPLAY_MUX_BADGE),castReceiver:t.castReceiver,disablePseudoEnded:t.hasAttribute(base_o.DISABLE_PSEUDO_ENDED),...a,extraSourceParams:t.extraSourceParams}}var base_Ta=media_error_dialog_default.formatErrorMessage;media_error_dialog_default.formatErrorMessage=t=>{var a,e;if(t instanceof f){let i=base_Et(t,!1);return`
      ${i!=null&&i.title?`<h3>${i.title}</h3>`:""}
      ${i!=null&&i.message||i!=null&&i.linkUrl?`<p>
        ${i==null?void 0:i.message}
        ${i!=null&&i.linkUrl?`<a
              href="${i.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(a=i.linkText)!=null?a:""} ${x("(opens in a new window)")}"
              >${(e=i.linkText)!=null?e:i.linkUrl}</a
            >`:""}
      </p>`:""}
    `}return base_Ta(t)};function base_Aa(t){var e,i;let a=t.theme;if(a){let r=(i=(e=t.getRootNode())==null?void 0:e.getElementById)==null?void 0:i.call(e,a);if(r&&r instanceof HTMLTemplateElement)return r;a.startsWith("media-theme-")||(a=`media-theme-${a}`);let n=base_k.customElements.get(a);if(n!=null&&n.template)return n.template}}function Ca(t){var e;let a=(e=t.mediaController)==null?void 0:e.querySelector("media-time-display");return a&&getComputedStyle(a).getPropertyValue("--media-duration-display-display").trim()==="none"}function base_xt(t){let a=t.videoTitle?{video_title:t.videoTitle}:{};return t.getAttributeNames().filter(e=>e.startsWith("metadata-")).reduce((e,i)=>{let r=t.getAttribute(i);return r!==null&&(e[i.replace(/^metadata-/,"").replace(/-/g,"_")]=r),e},a)}var base_ka=Object.values(base_e),base_a=Object.values(M),base_Ra=Object.values(base_o),base_Ot=base_se(),base_Lt="mux-player",base_Mt={isDialogOpen:!1},base_xa={redundant_streams:!0},base_J,base_ee,base_te,dist_base_I,base_ae,dist_base_K,base_m,base_w,base_Nt,base_we,base_H,base_wt,base_It,base_Pt,base_Dt,base_Ne=class extends base_Ce{constructor(){super();E(this,base_m);E(this,base_J);E(this,base_ee,!1);E(this,base_te,{});E(this,dist_base_I,!0);E(this,base_ae,new base_ne(this,"hotkeys"));E(this,dist_base_K,{...base_Mt,onCloseErrorDialog:e=>{var r;((r=e.composedPath()[0])==null?void 0:r.localName)==="media-error-dialog"&&base_p(this,base_m,base_we).call(this,{isDialogOpen:!1})},onFocusInErrorDialog:e=>{var n;if(((n=e.composedPath()[0])==null?void 0:n.localName)!=="media-error-dialog")return;base_ve(this,dist_base_P.activeElement)||e.preventDefault()}});dist_base_C(this,base_J,dist_Gr()),this.attachShadow({mode:"open"}),base_p(this,base_m,base_Nt).call(this),this.isConnected&&base_p(this,base_m,base_w).call(this)}static get NAME(){return base_Lt}static get VERSION(){return base_Ot}static get observedAttributes(){var e;return[...(e=base_Ce.observedAttributes)!=null?e:[],...base_a,...base_ka,...base_Ra]}get mediaTheme(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("media-theme")}get mediaController(){var e,i;return(i=(e=this.mediaTheme)==null?void 0:e.shadowRoot)==null?void 0:i.querySelector("media-controller")}connectedCallback(){let e=this.media;e&&(e.metadata=base_xt(this))}attributeChangedCallback(e,i,r){switch(base_p(this,base_m,base_w).call(this),super.attributeChangedCallback(e,i,r),e){case base_o.HOTKEYS:base_u(this,base_ae).value=r;break;case base_o.THUMBNAIL_TIME:{r!=null&&this.tokens.thumbnail&&dist_base_x(x("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());break}case base_o.THUMBNAIL_TOKEN:{if(r){let d=dist_ee(r);if(d){let{aud:l}=d,b=dist_se.THUMBNAIL;l!==b&&dist_base_x(x("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:l,expectedAud:b,tokenNamePrefix:"thumbnail"}))}}break}case base_o.STORYBOARD_TOKEN:{if(r){let d=dist_ee(r);if(d){let{aud:l}=d,b=dist_se.STORYBOARD;l!==b&&dist_base_x(x("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:l,expectedAud:b,tokenNamePrefix:"storyboard"}))}}break}case base_o.DRM_TOKEN:{if(r){let d=dist_ee(r);if(d){let{aud:l}=d,b=dist_se.DRM;l!==b&&dist_base_x(x("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:l,expectedAud:b,tokenNamePrefix:"drm"}))}}break}case base_e.PLAYBACK_ID:{r!=null&&r.includes("?token")&&base_T(x("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({playbackId:r}));break}case base_e.STREAM_TYPE:{r&&![dist_.LIVE,dist_.ON_DEMAND,dist_.UNKNOWN].includes(r)?["ll-live","live:dvr","ll-live:dvr"].includes(this.streamType)?this.targetLiveWindow=r.includes("dvr")?Number.POSITIVE_INFINITY:0:base_Te({file:"invalid-stream-type.md",message:x("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({streamType:this.streamType})}):r===dist_.LIVE?this.getAttribute(base_o.TARGET_LIVE_WINDOW)==null&&(this.targetLiveWindow=0):this.targetLiveWindow=Number.NaN;break}case base_o.FULLSCREEN_ELEMENT:{if(r!=null||r!==i){let d=dist_base_P.getElementById(r),l=d==null?void 0:d.querySelector("mux-player");this.mediaController&&d&&l&&(this.mediaController.fullscreenElement=d)}break}}[base_e.PLAYBACK_ID,M.SRC,base_o.PLAYBACK_TOKEN].includes(e)&&i!==r&&dist_base_C(this,dist_base_K,{...base_u(this,dist_base_K),...base_Mt}),base_p(this,base_m,base_H).call(this,{[base_st(e)]:r})}async requestFullscreen(e){var i;if(!(!this.mediaController||this.mediaController.hasAttribute(MediaUIAttributes.MEDIA_IS_FULLSCREEN)))return(i=this.mediaController)==null||i.dispatchEvent(new base_k.CustomEvent(MediaUIEvents.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((r,n)=>{var d;(d=this.mediaController)==null||d.addEventListener(MediaStateChangeEvents.MEDIA_IS_FULLSCREEN,()=>r(),{once:!0})})}async exitFullscreen(){var e;if(!(!this.mediaController||!this.mediaController.hasAttribute(MediaUIAttributes.MEDIA_IS_FULLSCREEN)))return(e=this.mediaController)==null||e.dispatchEvent(new base_k.CustomEvent(MediaUIEvents.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((i,r)=>{var n;(n=this.mediaController)==null||n.addEventListener(MediaStateChangeEvents.MEDIA_IS_FULLSCREEN,()=>i(),{once:!0})})}get preferCmcd(){var e;return(e=this.getAttribute(base_e.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?dist_Zt.includes(e)?this.setAttribute(base_e.PREFER_CMCD,e):dist_base_x(`Invalid value for preferCmcd. Must be one of ${dist_Zt.join()}`):this.removeAttribute(base_e.PREFER_CMCD))}get hasPlayed(){var e,i;return(i=(e=this.mediaController)==null?void 0:e.hasAttribute(MediaUIAttributes.MEDIA_HAS_PLAYED))!=null?i:!1}get inLiveWindow(){var e;return(e=this.mediaController)==null?void 0:e.hasAttribute(MediaUIAttributes.MEDIA_TIME_IS_LIVE)}get _hls(){var e;return(e=this.media)==null?void 0:e._hls}get mux(){var e;return(e=this.media)==null?void 0:e.mux}get theme(){var e;return(e=this.getAttribute(base_o.THEME))!=null?e:base_va}set theme(e){this.setAttribute(base_o.THEME,`${e}`)}get themeProps(){let e=this.mediaTheme;if(!e)return;let i={};for(let r of e.getAttributeNames()){if(base_Se.includes(r))continue;let n=e.getAttribute(r);i[base_oe(r)]=n===""?!0:n}return i}set themeProps(e){var r,n;base_p(this,base_m,base_w).call(this);let i={...this.themeProps,...e};for(let d in i){if(base_Se.includes(d))continue;let l=e==null?void 0:e[d];typeof l=="boolean"||l==null?(r=this.mediaTheme)==null||r.toggleAttribute(base_re(d),!!l):(n=this.mediaTheme)==null||n.setAttribute(base_re(d),l)}}get playbackId(){var e;return(e=this.getAttribute(base_e.PLAYBACK_ID))!=null?e:void 0}set playbackId(e){e?this.setAttribute(base_e.PLAYBACK_ID,e):this.removeAttribute(base_e.PLAYBACK_ID)}get src(){var e,i;return this.playbackId?(e=base_V(this,M.SRC))!=null?e:void 0:(i=this.getAttribute(M.SRC))!=null?i:void 0}set src(e){e?this.setAttribute(M.SRC,e):this.removeAttribute(M.SRC)}get poster(){var r;let e=this.getAttribute(M.POSTER);if(e!=null)return e;let{tokens:i}=this;if(i.playback&&!i.thumbnail){dist_base_x("Missing expected thumbnail token. No poster image will be shown");return}if(this.playbackId&&!this.audio)return base_ot(this.playbackId,{customDomain:this.customDomain,thumbnailTime:(r=this.thumbnailTime)!=null?r:this.startTime,programTime:this.programStartTime,token:i.thumbnail})}set poster(e){e||e===""?this.setAttribute(M.POSTER,e):this.removeAttribute(M.POSTER)}get storyboardSrc(){var e;return(e=this.getAttribute(base_o.STORYBOARD_SRC))!=null?e:void 0}set storyboardSrc(e){e?this.setAttribute(base_o.STORYBOARD_SRC,e):this.removeAttribute(base_o.STORYBOARD_SRC)}get storyboard(){let{tokens:e}=this;if(this.storyboardSrc&&!e.storyboard)return this.storyboardSrc;if(!(this.audio||!this.playbackId||!this.streamType||[dist_.LIVE,dist_.UNKNOWN].includes(this.streamType)||e.playback&&!e.storyboard))return base_nt(this.playbackId,{customDomain:this.customDomain,token:e.storyboard,programStartTime:this.programStartTime,programEndTime:this.programEndTime})}get audio(){return this.hasAttribute(base_o.AUDIO)}set audio(e){if(!e){this.removeAttribute(base_o.AUDIO);return}this.setAttribute(base_o.AUDIO,"")}get hotkeys(){return base_u(this,base_ae)}get nohotkeys(){return this.hasAttribute(base_o.NOHOTKEYS)}set nohotkeys(e){if(!e){this.removeAttribute(base_o.NOHOTKEYS);return}this.setAttribute(base_o.NOHOTKEYS,"")}get thumbnailTime(){return base_y(this.getAttribute(base_o.THUMBNAIL_TIME))}set thumbnailTime(e){this.setAttribute(base_o.THUMBNAIL_TIME,`${e}`)}get videoTitle(){var e,i;return(i=(e=this.getAttribute(base_o.VIDEO_TITLE))!=null?e:this.getAttribute(base_o.TITLE))!=null?i:""}set videoTitle(e){e!==this.videoTitle&&(e?this.setAttribute(base_o.VIDEO_TITLE,e):this.removeAttribute(base_o.VIDEO_TITLE))}get placeholder(){var e;return(e=base_V(this,base_o.PLACEHOLDER))!=null?e:""}set placeholder(e){this.setAttribute(base_o.PLACEHOLDER,`${e}`)}get primaryColor(){var i,r;let e=this.getAttribute(base_o.PRIMARY_COLOR);if(e!=null||this.mediaTheme&&(e=(r=(i=base_k.getComputedStyle(this.mediaTheme))==null?void 0:i.getPropertyValue("--_primary-color"))==null?void 0:r.trim(),e))return e}set primaryColor(e){this.setAttribute(base_o.PRIMARY_COLOR,`${e}`)}get secondaryColor(){var i,r;let e=this.getAttribute(base_o.SECONDARY_COLOR);if(e!=null||this.mediaTheme&&(e=(r=(i=base_k.getComputedStyle(this.mediaTheme))==null?void 0:i.getPropertyValue("--_secondary-color"))==null?void 0:r.trim(),e))return e}set secondaryColor(e){this.setAttribute(base_o.SECONDARY_COLOR,`${e}`)}get accentColor(){var i,r;let e=this.getAttribute(base_o.ACCENT_COLOR);if(e!=null||this.mediaTheme&&(e=(r=(i=base_k.getComputedStyle(this.mediaTheme))==null?void 0:i.getPropertyValue("--_accent-color"))==null?void 0:r.trim(),e))return e}set accentColor(e){this.setAttribute(base_o.ACCENT_COLOR,`${e}`)}get defaultShowRemainingTime(){return this.hasAttribute(base_o.DEFAULT_SHOW_REMAINING_TIME)}set defaultShowRemainingTime(e){e?this.setAttribute(base_o.DEFAULT_SHOW_REMAINING_TIME,""):this.removeAttribute(base_o.DEFAULT_SHOW_REMAINING_TIME)}get playbackRates(){if(this.hasAttribute(base_o.PLAYBACK_RATES))return this.getAttribute(base_o.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map(e=>Number(e)).filter(e=>!Number.isNaN(e)).sort((e,i)=>e-i)}set playbackRates(e){if(!e){this.removeAttribute(base_o.PLAYBACK_RATES);return}this.setAttribute(base_o.PLAYBACK_RATES,e.join(" "))}get forwardSeekOffset(){var e;return(e=base_y(this.getAttribute(base_o.FORWARD_SEEK_OFFSET)))!=null?e:10}set forwardSeekOffset(e){this.setAttribute(base_o.FORWARD_SEEK_OFFSET,`${e}`)}get backwardSeekOffset(){var e;return(e=base_y(this.getAttribute(base_o.BACKWARD_SEEK_OFFSET)))!=null?e:10}set backwardSeekOffset(e){this.setAttribute(base_o.BACKWARD_SEEK_OFFSET,`${e}`)}get defaultHiddenCaptions(){return this.hasAttribute(base_o.DEFAULT_HIDDEN_CAPTIONS)}set defaultHiddenCaptions(e){e?this.setAttribute(base_o.DEFAULT_HIDDEN_CAPTIONS,""):this.removeAttribute(base_o.DEFAULT_HIDDEN_CAPTIONS)}get defaultDuration(){return base_y(this.getAttribute(base_o.DEFAULT_DURATION))}set defaultDuration(e){e==null?this.removeAttribute(base_o.DEFAULT_DURATION):this.setAttribute(base_o.DEFAULT_DURATION,`${e}`)}get playerInitTime(){return this.hasAttribute(base_e.PLAYER_INIT_TIME)?base_y(this.getAttribute(base_e.PLAYER_INIT_TIME)):base_u(this,base_J)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(base_e.PLAYER_INIT_TIME):this.setAttribute(base_e.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=this.getAttribute(base_e.PLAYER_SOFTWARE_NAME))!=null?e:base_Lt}get playerSoftwareVersion(){var e;return(e=this.getAttribute(base_e.PLAYER_SOFTWARE_VERSION))!=null?e:base_Ot}get beaconCollectionDomain(){var e;return(e=this.getAttribute(base_e.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(base_e.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(base_e.BEACON_COLLECTION_DOMAIN))}get maxResolution(){var e;return(e=this.getAttribute(base_e.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(base_e.MAX_RESOLUTION,e):this.removeAttribute(base_e.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(base_e.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(base_e.MIN_RESOLUTION,e):this.removeAttribute(base_e.MIN_RESOLUTION))}get renditionOrder(){var e;return(e=this.getAttribute(base_e.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(base_e.RENDITION_ORDER,e):this.removeAttribute(base_e.RENDITION_ORDER))}get programStartTime(){return base_y(this.getAttribute(base_e.PROGRAM_START_TIME))}set programStartTime(e){e==null?this.removeAttribute(base_e.PROGRAM_START_TIME):this.setAttribute(base_e.PROGRAM_START_TIME,`${e}`)}get programEndTime(){return base_y(this.getAttribute(base_e.PROGRAM_END_TIME))}set programEndTime(e){e==null?this.removeAttribute(base_e.PROGRAM_END_TIME):this.setAttribute(base_e.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){return base_y(this.getAttribute(base_e.ASSET_START_TIME))}set assetStartTime(e){e==null?this.removeAttribute(base_e.ASSET_START_TIME):this.setAttribute(base_e.ASSET_START_TIME,`${e}`)}get assetEndTime(){return base_y(this.getAttribute(base_e.ASSET_END_TIME))}set assetEndTime(e){e==null?this.removeAttribute(base_e.ASSET_END_TIME):this.setAttribute(base_e.ASSET_END_TIME,`${e}`)}get extraSourceParams(){return this.hasAttribute(base_o.EXTRA_SOURCE_PARAMS)?[...new URLSearchParams(this.getAttribute(base_o.EXTRA_SOURCE_PARAMS)).entries()].reduce((e,[i,r])=>(e[i]=r,e),{}):base_xa}set extraSourceParams(e){e==null?this.removeAttribute(base_o.EXTRA_SOURCE_PARAMS):this.setAttribute(base_o.EXTRA_SOURCE_PARAMS,new URLSearchParams(e).toString())}get customDomain(){var e;return(e=this.getAttribute(base_e.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(base_e.CUSTOM_DOMAIN,e):this.removeAttribute(base_e.CUSTOM_DOMAIN))}get envKey(){var e;return(e=base_V(this,base_e.ENV_KEY))!=null?e:void 0}set envKey(e){this.setAttribute(base_e.ENV_KEY,`${e}`)}get noVolumePref(){return this.hasAttribute(base_o.NO_VOLUME_PREF)}set noVolumePref(e){e?this.setAttribute(base_o.NO_VOLUME_PREF,""):this.removeAttribute(base_o.NO_VOLUME_PREF)}get noMutedPref(){return this.hasAttribute(base_o.NO_MUTED_PREF)}set noMutedPref(e){e?this.setAttribute(base_o.NO_MUTED_PREF,""):this.removeAttribute(base_o.NO_MUTED_PREF)}get debug(){return base_V(this,base_e.DEBUG)!=null}set debug(e){e?this.setAttribute(base_e.DEBUG,""):this.removeAttribute(base_e.DEBUG)}get disableTracking(){return base_V(this,base_e.DISABLE_TRACKING)!=null}set disableTracking(e){this.toggleAttribute(base_e.DISABLE_TRACKING,!!e)}get disableCookies(){return base_V(this,base_e.DISABLE_COOKIES)!=null}set disableCookies(e){e?this.setAttribute(base_e.DISABLE_COOKIES,""):this.removeAttribute(base_e.DISABLE_COOKIES)}get streamType(){var e,i,r;return(r=(i=this.getAttribute(base_e.STREAM_TYPE))!=null?i:(e=this.media)==null?void 0:e.streamType)!=null?r:dist_.UNKNOWN}set streamType(e){this.setAttribute(base_e.STREAM_TYPE,`${e}`)}get defaultStreamType(){var e,i,r;return(r=(i=this.getAttribute(base_o.DEFAULT_STREAM_TYPE))!=null?i:(e=this.mediaController)==null?void 0:e.getAttribute(base_o.DEFAULT_STREAM_TYPE))!=null?r:dist_.ON_DEMAND}set defaultStreamType(e){e?this.setAttribute(base_o.DEFAULT_STREAM_TYPE,e):this.removeAttribute(base_o.DEFAULT_STREAM_TYPE)}get targetLiveWindow(){var e,i;return this.hasAttribute(base_o.TARGET_LIVE_WINDOW)?+this.getAttribute(base_o.TARGET_LIVE_WINDOW):(i=(e=this.media)==null?void 0:e.targetLiveWindow)!=null?i:Number.NaN}set targetLiveWindow(e){e==this.targetLiveWindow||Number.isNaN(e)&&Number.isNaN(this.targetLiveWindow)||(e==null?this.removeAttribute(base_o.TARGET_LIVE_WINDOW):this.setAttribute(base_o.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e;return(e=this.media)==null?void 0:e.liveEdgeStart}get startTime(){return base_y(base_V(this,base_e.START_TIME))}set startTime(e){this.setAttribute(base_e.START_TIME,`${e}`)}get preferPlayback(){let e=this.getAttribute(base_e.PREFER_PLAYBACK);if(e===dist_X.MSE||e===dist_X.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===dist_X.MSE||e===dist_X.NATIVE?this.setAttribute(base_e.PREFER_PLAYBACK,e):this.removeAttribute(base_e.PREFER_PLAYBACK))}get metadata(){var e;return(e=this.media)==null?void 0:e.metadata}set metadata(e){if(base_p(this,base_m,base_w).call(this),!this.media){base_T("underlying media element missing when trying to set metadata. metadata will not be set.");return}this.media.metadata={...base_xt(this),...e}}get _hlsConfig(){var e;return(e=this.media)==null?void 0:e._hlsConfig}set _hlsConfig(e){if(base_p(this,base_m,base_w).call(this),!this.media){base_T("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.");return}this.media._hlsConfig=e}async addCuePoints(e){var i;if(base_p(this,base_m,base_w).call(this),!this.media){base_T("underlying media element missing when trying to addCuePoints. cuePoints will not be added.");return}return(i=this.media)==null?void 0:i.addCuePoints(e)}get activeCuePoint(){var e;return(e=this.media)==null?void 0:e.activeCuePoint}get cuePoints(){var e,i;return(i=(e=this.media)==null?void 0:e.cuePoints)!=null?i:[]}addChapters(e){var i;if(base_p(this,base_m,base_w).call(this),!this.media){base_T("underlying media element missing when trying to addChapters. chapters will not be added.");return}return(i=this.media)==null?void 0:i.addChapters(e)}get activeChapter(){var e;return(e=this.media)==null?void 0:e.activeChapter}get chapters(){var e,i;return(i=(e=this.media)==null?void 0:e.chapters)!=null?i:[]}getStartDate(){var e;return(e=this.media)==null?void 0:e.getStartDate()}get currentPdt(){var e;return(e=this.media)==null?void 0:e.currentPdt}get tokens(){let e=this.getAttribute(base_o.PLAYBACK_TOKEN),i=this.getAttribute(base_o.DRM_TOKEN),r=this.getAttribute(base_o.THUMBNAIL_TOKEN),n=this.getAttribute(base_o.STORYBOARD_TOKEN);return{...base_u(this,base_te),...e!=null?{playback:e}:{},...i!=null?{drm:i}:{},...r!=null?{thumbnail:r}:{},...n!=null?{storyboard:n}:{}}}set tokens(e){dist_base_C(this,base_te,e!=null?e:{})}get playbackToken(){var e;return(e=this.getAttribute(base_o.PLAYBACK_TOKEN))!=null?e:void 0}set playbackToken(e){this.setAttribute(base_o.PLAYBACK_TOKEN,`${e}`)}get drmToken(){var e;return(e=this.getAttribute(base_o.DRM_TOKEN))!=null?e:void 0}set drmToken(e){this.setAttribute(base_o.DRM_TOKEN,`${e}`)}get thumbnailToken(){var e;return(e=this.getAttribute(base_o.THUMBNAIL_TOKEN))!=null?e:void 0}set thumbnailToken(e){this.setAttribute(base_o.THUMBNAIL_TOKEN,`${e}`)}get storyboardToken(){var e;return(e=this.getAttribute(base_o.STORYBOARD_TOKEN))!=null?e:void 0}set storyboardToken(e){this.setAttribute(base_o.STORYBOARD_TOKEN,`${e}`)}addTextTrack(e,i,r,n){var l;let d=(l=this.media)==null?void 0:l.nativeEl;if(d)return dist_ne(d,e,i,r,n)}removeTextTrack(e){var r;let i=(r=this.media)==null?void 0:r.nativeEl;if(i)return dist_lt(i,e)}get textTracks(){var e;return(e=this.media)==null?void 0:e.textTracks}get castReceiver(){var e;return(e=this.getAttribute(base_o.CAST_RECEIVER))!=null?e:void 0}set castReceiver(e){e!==this.castReceiver&&(e?this.setAttribute(base_o.CAST_RECEIVER,e):this.removeAttribute(base_o.CAST_RECEIVER))}get castCustomData(){var e;return(e=this.media)==null?void 0:e.castCustomData}set castCustomData(e){if(!this.media){base_T("underlying media element missing when trying to set castCustomData. castCustomData will not be set.");return}this.media.castCustomData=e}get noTooltips(){return this.hasAttribute(base_o.NO_TOOLTIPS)}set noTooltips(e){if(!e){this.removeAttribute(base_o.NO_TOOLTIPS);return}this.setAttribute(base_o.NO_TOOLTIPS,"")}get proudlyDisplayMuxBadge(){return this.hasAttribute(base_o.PROUDLY_DISPLAY_MUX_BADGE)}set proudlyDisplayMuxBadge(e){e?this.setAttribute(base_o.PROUDLY_DISPLAY_MUX_BADGE,""):this.removeAttribute(base_o.PROUDLY_DISPLAY_MUX_BADGE)}};base_J=new WeakMap,base_ee=new WeakMap,base_te=new WeakMap,dist_base_I=new WeakMap,base_ae=new WeakMap,dist_base_K=new WeakMap,base_m=new WeakSet,base_w=function(){var e,i,r,n;if(!base_u(this,base_ee)){dist_base_C(this,base_ee,!0),base_p(this,base_m,base_H).call(this);try{if(customElements.upgrade(this.mediaTheme),!(this.mediaTheme instanceof base_k.HTMLElement))throw""}catch{base_T("<media-theme> failed to upgrade!")}try{customElements.upgrade(this.media)}catch{base_T("underlying media element failed to upgrade!")}try{if(customElements.upgrade(this.mediaController),!(this.mediaController instanceof media_controller_default))throw""}catch{base_T("<media-controller> failed to upgrade!")}base_p(this,base_m,base_wt).call(this),base_p(this,base_m,base_It).call(this),base_p(this,base_m,base_Pt).call(this),dist_base_C(this,dist_base_I,(i=(e=this.mediaController)==null?void 0:e.hasAttribute(Attributes.USER_INACTIVE))!=null?i:!0),base_p(this,base_m,base_Dt).call(this),(r=this.media)==null||r.addEventListener("streamtypechange",()=>base_p(this,base_m,base_H).call(this)),(n=this.media)==null||n.addEventListener("loadstart",()=>base_p(this,base_m,base_H).call(this))}},base_Nt=function(){var e,i;try{(e=window==null?void 0:window.CSS)==null||e.registerProperty({name:"--media-primary-color",syntax:"<color>",inherits:!0}),(i=window==null?void 0:window.CSS)==null||i.registerProperty({name:"--media-secondary-color",syntax:"<color>",inherits:!0})}catch{}},base_we=function(e){Object.assign(base_u(this,dist_base_K),e),base_p(this,base_m,base_H).call(this)},base_H=function(e={}){base_bt(base_gt(base_Ea(this,{...base_u(this,dist_base_K),...e})),this.shadowRoot)},base_wt=function(){let e=r=>{var l,b;if(!(r!=null&&r.startsWith("theme-")))return;let n=r.replace(/^theme-/,"");if(base_Se.includes(n))return;let d=this.getAttribute(r);d!=null?(l=this.mediaTheme)==null||l.setAttribute(n,d):(b=this.mediaTheme)==null||b.removeAttribute(n)};new MutationObserver(r=>{for(let{attributeName:n}of r)e(n)}).observe(this,{attributes:!0}),this.getAttributeNames().forEach(e)},base_It=function(){let e=i=>{var d;let r=(d=this.media)==null?void 0:d.error;if(!(r instanceof f)){let{message:l,code:b}=r!=null?r:{};r=new f(l,b)}if(!(r!=null&&r.fatal)){dist_base_x(r),r.data&&dist_base_x(`${r.name} data:`,r.data);return}let n=base_Re(r,!1);n.message&&base_Te(n),base_T(r),r.data&&base_T(`${r.name} data:`,r.data),base_p(this,base_m,base_we).call(this,{isDialogOpen:!0})};this.addEventListener("error",e),this.media&&(this.media.errorTranslator=(i={})=>{var n,d,l;if(!(((n=this.media)==null?void 0:n.error)instanceof f))return i;let r=base_Re((d=this.media)==null?void 0:d.error,!1);return{player_error_code:(l=this.media)==null?void 0:l.error.code,player_error_message:r.message?String(r.message):i.player_error_message,player_error_context:r.context?String(r.context):i.player_error_context}})},base_Pt=function(){var i,r,n,d;let e=()=>base_p(this,base_m,base_H).call(this);(r=(i=this.media)==null?void 0:i.textTracks)==null||r.addEventListener("addtrack",e),(d=(n=this.media)==null?void 0:n.textTracks)==null||d.addEventListener("removetrack",e)},base_Dt=function(){var S,Y;if(!/Firefox/i.test(navigator.userAgent))return;let i,r=new WeakMap,n=()=>this.streamType===dist_.LIVE&&!this.secondaryColor&&this.offsetWidth>=800,d=(_,A,R=!1)=>{if(n())return;Array.from(_&&_.activeCues||[]).forEach(h=>{if(!(!h.snapToLines||h.line<-5||h.line>=0&&h.line<10))if(!A||this.paused){let ie=h.text.split(`
`).length,W=-3;this.streamType===dist_.LIVE&&(W=-2);let Z=W-ie;if(h.line===Z&&!R)return;r.has(h)||r.set(h,h.line),h.line=Z}else setTimeout(()=>{h.line=r.get(h)||"auto"},500)})},l=()=>{var _,A;d(i,(A=(_=this.mediaController)==null?void 0:_.hasAttribute(Attributes.USER_INACTIVE))!=null?A:!1)},b=()=>{var R,$;let A=Array.from((($=(R=this.mediaController)==null?void 0:R.media)==null?void 0:$.textTracks)||[]).filter(h=>["subtitles","captions"].includes(h.kind)&&h.mode==="showing")[0];A!==i&&(i==null||i.removeEventListener("cuechange",l)),i=A,i==null||i.addEventListener("cuechange",l),d(i,base_u(this,dist_base_I))};b(),(S=this.textTracks)==null||S.addEventListener("change",b),(Y=this.textTracks)==null||Y.addEventListener("addtrack",b),this.addEventListener("userinactivechange",()=>{var A,R;let _=(R=(A=this.mediaController)==null?void 0:A.hasAttribute(Attributes.USER_INACTIVE))!=null?R:!0;base_u(this,dist_base_I)!==_&&(dist_base_C(this,dist_base_I,_),d(i,base_u(this,dist_base_I)))})};function base_V(t,a){return t.media?t.media.getAttribute(a):t.getAttribute(a)}var base_Ci=base_Ne;

;// ../node_modules/@mux/mux-player/dist/index.mjs
/* unused harmony import specifier */ var mux_player_dist_u;
var mux_player_dist_c=e=>{throw TypeError(e)};var dist_d=(e,t,n)=>t.has(e)||mux_player_dist_c("Cannot "+n);var mux_player_dist_g=(e,t,n)=>(dist_d(e,t,"read from private field"),n?n.call(e):t.get(e)),mux_player_dist_p=(e,t,n)=>t.has(e)?mux_player_dist_c("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),mux_player_dist_f=(e,t,n,i)=>(dist_d(e,t,"write to private field"),i?i.call(e,n):t.set(e,n),n);var dist_o=class{addEventListener(){}removeEventListener(){}dispatchEvent(t){return!0}};if(typeof DocumentFragment=="undefined"){class e extends dist_o{}globalThis.DocumentFragment=e}var dist_s=class extends dist_o{},dist_a=class extends dist_o{},mux_player_dist_b={get(e){},define(e,t,n){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(dist_s)}},dist_r,mux_player_dist_m=class{constructor(t,n={}){mux_player_dist_p(this,dist_r);mux_player_dist_f(this,dist_r,n==null?void 0:n.detail)}get detail(){return mux_player_dist_g(this,dist_r)}initCustomEvent(){}};dist_r=new WeakMap;function mux_player_dist_y(e,t){return new dist_s}var dist_h={document:{createElement:mux_player_dist_y},DocumentFragment,customElements:mux_player_dist_b,CustomEvent:mux_player_dist_m,EventTarget:dist_o,HTMLElement:dist_s,HTMLVideoElement:dist_a},dist_E=typeof window=="undefined"||typeof globalThis.customElements=="undefined",dist_l=dist_E?dist_h:globalThis,mux_player_dist_x=dist_E?dist_h.document:globalThis.document;dist_l.customElements.get("mux-player")||(dist_l.customElements.define("mux-player",base_Ci),dist_l.MuxPlayerElement=base_Ci);var mux_player_dist_F=(/* unused pure expression or super */ null && (mux_player_dist_u));

;// ../node_modules/@mux/mux-player-react/dist/index.mjs
"use client";var dist_M=parseInt(react.version)>=19,mux_player_react_dist_E={className:"class",classname:"class",htmlFor:"for",crossOrigin:"crossorigin",viewBox:"viewBox",playsInline:"playsinline",autoPlay:"autoplay",playbackRate:"playbackrate"},mux_player_react_dist_B=e=>e==null,mux_player_react_dist_ee=(e,t)=>mux_player_react_dist_B(t)?!1:e in t,mux_player_react_dist_te=e=>e.replace(/[A-Z]/g,t=>`-${t.toLowerCase()}`),mux_player_react_dist_ne=(e,t)=>{if(!(!dist_M&&typeof t=="boolean"&&!t)){if(mux_player_react_dist_ee(e,mux_player_react_dist_E))return mux_player_react_dist_E[e];if(typeof t!="undefined")return/[A-Z]/.test(e)?mux_player_react_dist_te(e):e}};var dist_ae=(e,t)=>!dist_M&&typeof e=="boolean"?"":e,mux_player_react_dist_P=(e={})=>{let{ref:t,...n}=e;return Object.entries(n).reduce((o,[a,l])=>{let i=mux_player_react_dist_ne(a,l);if(!i)return o;let c=dist_ae(l,a);return o[i]=c,o},{})};function mux_player_react_dist_x(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function mux_player_react_dist_re(...e){return t=>{let n=!1,o=e.map(a=>{let l=mux_player_react_dist_x(a,t);return!n&&typeof l=="function"&&(n=!0),l});if(n)return()=>{for(let a=0;a<o.length;a++){let l=o[a];typeof l=="function"?l():mux_player_react_dist_x(e[a],null)}}}}function mux_player_react_dist_f(...e){return react.useCallback(mux_player_react_dist_re(...e),e)}var dist_oe=Object.prototype.hasOwnProperty,dist_ue=(e,t)=>{if(Object.is(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;if(Array.isArray(e))return!Array.isArray(t)||e.length!==t.length?!1:e.some((a,l)=>t[l]===a);let n=Object.keys(e),o=Object.keys(t);if(n.length!==o.length)return!1;for(let a=0;a<n.length;a++)if(!dist_oe.call(t,n[a])||!Object.is(e[n[a]],t[n[a]]))return!1;return!0},mux_player_react_dist_p=(e,t,n)=>!dist_ue(t,e[n]),mux_player_react_dist_se=(e,t,n)=>{e[n]=t},mux_player_react_dist_ie=(e,t,n,o=mux_player_react_dist_se,a=mux_player_react_dist_p)=>(0,react.useEffect)(()=>{let l=n==null?void 0:n.current;l&&a(l,t,e)&&o(l,t,e)},[n==null?void 0:n.current,t]),mux_player_react_dist_u=mux_player_react_dist_ie;var mux_player_react_dist_ye=()=>{try{return"3.8.0"}catch{}return"UNKNOWN"},mux_player_react_dist_me=mux_player_react_dist_ye(),mux_player_react_dist_g=()=>mux_player_react_dist_me;var mux_player_react_dist_r=(e,t,n)=>(0,react.useEffect)(()=>{let o=t==null?void 0:t.current;if(!o||!n)return;let a=e,l=n;return o.addEventListener(a,l),()=>{o.removeEventListener(a,l)}},[t==null?void 0:t.current,n,e]);var mux_player_react_dist_Pe=react.forwardRef(({children:e,...t},n)=>react.createElement("mux-player",{suppressHydrationWarning:!0,...mux_player_react_dist_P(t),ref:n},e)),dist_xe=(e,t)=>{let{onAbort:n,onCanPlay:o,onCanPlayThrough:a,onEmptied:l,onLoadStart:i,onLoadedData:c,onLoadedMetadata:v,onProgress:R,onDurationChange:T,onVolumeChange:h,onRateChange:b,onResize:C,onWaiting:k,onPlay:O,onPlaying:S,onTimeUpdate:w,onPause:N,onSeeking:L,onSeeked:A,onStalled:I,onSuspend:_,onEnded:K,onError:H,onCuePointChange:D,onChapterChange:V,metadata:W,tokens:U,paused:z,playbackId:F,playbackRates:G,currentTime:Z,themeProps:j,extraSourceParams:q,castCustomData:J,_hlsConfig:Y,...$}=t;return mux_player_react_dist_u("tokens",U,e),mux_player_react_dist_u("playbackId",F,e),mux_player_react_dist_u("playbackRates",G,e),mux_player_react_dist_u("metadata",W,e),mux_player_react_dist_u("extraSourceParams",q,e),mux_player_react_dist_u("_hlsConfig",Y,e),mux_player_react_dist_u("themeProps",j,e),mux_player_react_dist_u("castCustomData",J,e),mux_player_react_dist_u("paused",z,e,(s,y)=>{y!=null&&(y?s.pause():s.play())},(s,y,Q)=>s.hasAttribute("autoplay")&&!s.hasPlayed?!1:mux_player_react_dist_p(s,y,Q)),mux_player_react_dist_u("currentTime",Z,e,(s,y)=>{y!=null&&(s.currentTime=y)}),mux_player_react_dist_r("abort",e,n),mux_player_react_dist_r("canplay",e,o),mux_player_react_dist_r("canplaythrough",e,a),mux_player_react_dist_r("emptied",e,l),mux_player_react_dist_r("loadstart",e,i),mux_player_react_dist_r("loadeddata",e,c),mux_player_react_dist_r("loadedmetadata",e,v),mux_player_react_dist_r("progress",e,R),mux_player_react_dist_r("durationchange",e,T),mux_player_react_dist_r("volumechange",e,h),mux_player_react_dist_r("ratechange",e,b),mux_player_react_dist_r("resize",e,C),mux_player_react_dist_r("waiting",e,k),mux_player_react_dist_r("play",e,O),mux_player_react_dist_r("playing",e,S),mux_player_react_dist_r("timeupdate",e,w),mux_player_react_dist_r("pause",e,N),mux_player_react_dist_r("seeking",e,L),mux_player_react_dist_r("seeked",e,A),mux_player_react_dist_r("stalled",e,I),mux_player_react_dist_r("suspend",e,_),mux_player_react_dist_r("ended",e,K),mux_player_react_dist_r("error",e,H),mux_player_react_dist_r("cuepointchange",e,D),mux_player_react_dist_r("chapterchange",e,V),[$]},mux_player_react_dist_de=mux_player_react_dist_g(),dist_fe="mux-player-react",mux_player_react_dist_ge=react.forwardRef((e,t)=>{var i;let n=(0,react.useRef)(null),o=mux_player_react_dist_f(n,t),[a]=dist_xe(n,e),[l]=(0,react.useState)((i=e.playerInitTime)!=null?i:dist_Gr());return react.createElement(mux_player_react_dist_Pe,{ref:o,defaultHiddenCaptions:e.defaultHiddenCaptions,playerSoftwareName:dist_fe,playerSoftwareVersion:mux_player_react_dist_de,playerInitTime:l,...a})}),mux_player_react_dist_ze=mux_player_react_dist_ge;
//# sourceMappingURL=index.mjs.map


/***/ }

}]);