
var jsredis = (function() {
var jsredis_module = {};
jsredis_module.exports = {};
    




/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.0.0
 */

(function(){function r(a,b){n[l]=a;n[l+1]=b;l+=2;2===l&&A()}function s(a){return"function"===typeof a}function F(){return function(){process.nextTick(t)}}function G(){var a=0,b=new B(t),c=document.createTextNode("");b.observe(c,{characterData:!0});return function(){c.data=a=++a%2}}function H(){var a=new MessageChannel;a.port1.onmessage=t;return function(){a.port2.postMessage(0)}}function I(){return function(){setTimeout(t,1)}}function t(){for(var a=0;a<l;a+=2)(0,n[a])(n[a+1]),n[a]=void 0,n[a+1]=void 0;
l=0}function p(){}function J(a,b,c,d){try{a.call(b,c,d)}catch(e){return e}}function K(a,b,c){r(function(a){var e=!1,f=J(c,b,function(c){e||(e=!0,b!==c?q(a,c):m(a,c))},function(b){e||(e=!0,g(a,b))});!e&&f&&(e=!0,g(a,f))},a)}function L(a,b){1===b.a?m(a,b.b):2===a.a?g(a,b.b):u(b,void 0,function(b){q(a,b)},function(b){g(a,b)})}function q(a,b){if(a===b)g(a,new TypeError("You cannot resolve a promise with itself"));else if("function"===typeof b||"object"===typeof b&&null!==b)if(b.constructor===a.constructor)L(a,
b);else{var c;try{c=b.then}catch(d){v.error=d,c=v}c===v?g(a,v.error):void 0===c?m(a,b):s(c)?K(a,b,c):m(a,b)}else m(a,b)}function M(a){a.d&&a.d(a.b);x(a)}function m(a,b){void 0===a.a&&(a.b=b,a.a=1,0!==a.f.length&&r(x,a))}function g(a,b){void 0===a.a&&(a.a=2,a.b=b,r(M,a))}function u(a,b,c,d){var e=a.f,f=e.length;a.d=null;e[f]=b;e[f+1]=c;e[f+2]=d;0===f&&a.a&&r(x,a)}function x(a){var b=a.f,c=a.a;if(0!==b.length){for(var d,e,f=a.b,g=0;g<b.length;g+=3)d=b[g],e=b[g+c],d?C(c,d,e,f):e(f);a.f.length=0}}function D(){this.error=
null}function C(a,b,c,d){var e=s(c),f,k,h,l;if(e){try{f=c(d)}catch(n){y.error=n,f=y}f===y?(l=!0,k=f.error,f=null):h=!0;if(b===f){g(b,new TypeError("A promises callback cannot return that same promise."));return}}else f=d,h=!0;void 0===b.a&&(e&&h?q(b,f):l?g(b,k):1===a?m(b,f):2===a&&g(b,f))}function N(a,b){try{b(function(b){q(a,b)},function(b){g(a,b)})}catch(c){g(a,c)}}function k(a,b,c,d){this.n=a;this.c=new a(p,d);this.i=c;this.o(b)?(this.m=b,this.e=this.length=b.length,this.l(),0===this.length?m(this.c,
this.b):(this.length=this.length||0,this.k(),0===this.e&&m(this.c,this.b))):g(this.c,this.p())}function h(a){O++;this.b=this.a=void 0;this.f=[];if(p!==a){if(!s(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof h))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");N(this,a)}}var E=Array.isArray?Array.isArray:function(a){return"[object Array]"===
Object.prototype.toString.call(a)},l=0,w="undefined"!==typeof window?window:{},B=w.MutationObserver||w.WebKitMutationObserver,w="undefined"!==typeof Uint8ClampedArray&&"undefined"!==typeof importScripts&&"undefined"!==typeof MessageChannel,n=Array(1E3),A;A="undefined"!==typeof process&&"[object process]"==={}.toString.call(process)?F():B?G():w?H():I();var v=new D,y=new D;k.prototype.o=function(a){return E(a)};k.prototype.p=function(){return Error("Array Methods must be provided an Array")};k.prototype.l=
function(){this.b=Array(this.length)};k.prototype.k=function(){for(var a=this.length,b=this.c,c=this.m,d=0;void 0===b.a&&d<a;d++)this.j(c[d],d)};k.prototype.j=function(a,b){var c=this.n;"object"===typeof a&&null!==a?a.constructor===c&&void 0!==a.a?(a.d=null,this.g(a.a,b,a.b)):this.q(c.resolve(a),b):(this.e--,this.b[b]=this.h(a))};k.prototype.g=function(a,b,c){var d=this.c;void 0===d.a&&(this.e--,this.i&&2===a?g(d,c):this.b[b]=this.h(c));0===this.e&&m(d,this.b)};k.prototype.h=function(a){return a};
k.prototype.q=function(a,b){var c=this;u(a,void 0,function(a){c.g(1,b,a)},function(a){c.g(2,b,a)})};var O=0;h.all=function(a,b){return(new k(this,a,!0,b)).c};h.race=function(a,b){function c(a){q(e,a)}function d(a){g(e,a)}var e=new this(p,b);if(!E(a))return (g(e,new TypeError("You must pass an array to race.")), e);for(var f=a.length,h=0;void 0===e.a&&h<f;h++)u(this.resolve(a[h]),void 0,c,d);return e};h.resolve=function(a,b){if(a&&"object"===typeof a&&a.constructor===this)return a;var c=new this(p,b);
q(c,a);return c};h.reject=function(a,b){var c=new this(p,b);g(c,a);return c};h.prototype={constructor:h,then:function(a,b,c){var d=this.a;if(1===d&&!a||2===d&&!b)return this;this.d=null;var e=new this.constructor(p,c),f=this.b;if(d){var g=arguments[d-1];r(function(){C(d,e,g,f)})}else u(this,e,a,b);return e},"catch":function(a,b){return this.then(null,a,b)}};var z={Promise:h,r:function(){var a;a="undefined"!==typeof global?global:"undefined"!==typeof window&&window.document?window:self;"Promise"in
a&&"resolve"in a.Promise&&"reject"in a.Promise&&"all"in a.Promise&&"race"in a.Promise&&function(){var b;new a.Promise(function(a){b=a});return s(b)}()||(a.Promise=h)}};"function"===typeof define&&define.amd?define(function(){return z}):"undefined"!==typeof module&&module.exports?module.exports=z:"undefined"!==typeof this&&(this.ES6Promise=z)}).call(this);


/*! IndexedDBShim - v0.1.2 - 2014-09-22 */
"use strict";var idbModules={},cleanInterface=!1;(function(){var e={test:!0};if(Object.defineProperty)try{Object.defineProperty(e,"test",{enumerable:!1}),e.test&&(cleanInterface=!0)}catch(t){}})(),function(e){function t(e,t,n,o){n.target=t,"function"==typeof t[e]&&t[e].apply(t,[n]),"function"==typeof o&&o()}function n(t,n,o){var r;try{r=new DOMException.prototype.constructor(0,n)}catch(i){r=Error(n)}throw r.name=t,r.message=n,e.DEBUG&&(console.log(t,n,o,r),console.trace&&console.trace()),r}var o=function(){this.length=0,this._items=[],cleanInterface&&Object.defineProperty(this,"_items",{enumerable:!1})};if(o.prototype={contains:function(e){return-1!==this._items.indexOf(e)},item:function(e){return this._items[e]},indexOf:function(e){return this._items.indexOf(e)},push:function(e){this._items.push(e),this.length+=1;for(var t=0;this._items.length>t;t++)this[t]=this._items[t]},splice:function(){this._items.splice.apply(this._items,arguments),this.length=this._items.length;for(var e in this)e===parseInt(e,10)+""&&delete this[e];for(e=0;this._items.length>e;e++)this[e]=this._items[e]}},cleanInterface)for(var r in{indexOf:!1,push:!1,splice:!1})Object.defineProperty(o.prototype,r,{enumerable:!1});e.util={throwDOMException:n,callback:t,quote:function(e){return"'"+e+"'"},StringList:o}}(idbModules),function(idbModules){var Sca=function(){return{decycle:function(object,callback){function checkForCompletion(){0===queuedObjects.length&&returnCallback(derezObj)}function readBlobAsDataURL(e,t){var n=new FileReader;n.onloadend=function(e){var n=e.target.result,o="blob";updateEncodedBlob(n,t,o)},n.readAsDataURL(e)}function updateEncodedBlob(dataURL,path,blobtype){var encoded=queuedObjects.indexOf(path);path=path.replace("$","derezObj"),eval(path+'.$enc="'+dataURL+'"'),eval(path+'.$type="'+blobtype+'"'),queuedObjects.splice(encoded,1),checkForCompletion()}function derez(e,t){var n,o,r;if(!("object"!=typeof e||null===e||e instanceof Boolean||e instanceof Date||e instanceof Number||e instanceof RegExp||e instanceof Blob||e instanceof String)){for(n=0;objects.length>n;n+=1)if(objects[n]===e)return{$ref:paths[n]};if(objects.push(e),paths.push(t),"[object Array]"===Object.prototype.toString.apply(e))for(r=[],n=0;e.length>n;n+=1)r[n]=derez(e[n],t+"["+n+"]");else{r={};for(o in e)Object.prototype.hasOwnProperty.call(e,o)&&(r[o]=derez(e[o],t+"["+JSON.stringify(o)+"]"))}return r}return e instanceof Blob?(queuedObjects.push(t),readBlobAsDataURL(e,t)):e instanceof Boolean?e={$type:"bool",$enc:""+e}:e instanceof Date?e={$type:"date",$enc:e.getTime()}:e instanceof Number?e={$type:"num",$enc:""+e}:e instanceof RegExp&&(e={$type:"regex",$enc:""+e}),e}var objects=[],paths=[],queuedObjects=[],returnCallback=callback,derezObj=derez(object,"$");checkForCompletion()},retrocycle:function retrocycle($){function dataURLToBlob(e){var t,n,o,r=";base64,";if(-1===e.indexOf(r))return n=e.split(","),t=n[0].split(":")[1],o=n[1],new Blob([o],{type:t});n=e.split(r),t=n[0].split(":")[1],o=window.atob(n[1]);for(var i=o.length,a=new Uint8Array(i),s=0;i>s;++s)a[s]=o.charCodeAt(s);return new Blob([a.buffer],{type:t})}function rez(value){var i,item,name,path;if(value&&"object"==typeof value)if("[object Array]"===Object.prototype.toString.apply(value))for(i=0;value.length>i;i+=1)item=value[i],item&&"object"==typeof item&&(path=item.$ref,value[i]="string"==typeof path&&px.test(path)?eval(path):rez(item));else if(void 0!==value.$type)switch(value.$type){case"blob":case"file":value=dataURLToBlob(value.$enc);break;case"bool":value=Boolean("true"===value.$enc);break;case"date":value=new Date(value.$enc);break;case"num":value=Number(value.$enc);break;case"regex":value=eval(value.$enc)}else for(name in value)"object"==typeof value[name]&&(item=value[name],item&&(path=item.$ref,value[name]="string"==typeof path&&px.test(path)?eval(path):rez(item)));return value}var px=/^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;return rez($),$},encode:function(e,t){function n(e){t(JSON.stringify(e))}this.decycle(e,n)},decode:function(e){return this.retrocycle(JSON.parse(e))}}}();idbModules.Sca=Sca}(idbModules),function(e){var t=["","number","string","boolean","object","undefined"],n=function(){return{encode:function(e){return t.indexOf(typeof e)+"-"+JSON.stringify(e)},decode:function(e){return e===void 0?void 0:JSON.parse(e.substring(2))}}},o={number:n("number"),"boolean":n(),object:n(),string:{encode:function(e){return t.indexOf("string")+"-"+e},decode:function(e){return""+e.substring(2)}},undefined:{encode:function(){return t.indexOf("undefined")+"-undefined"},decode:function(){return void 0}}},r=function(){return{encode:function(e){return o[typeof e].encode(e)},decode:function(e){return o[t[e.substring(0,1)]].decode(e)}}}();e.Key=r}(idbModules),function(e){var t=function(e,t){return{type:e,debug:t,bubbles:!1,cancelable:!1,eventPhase:0,timeStamp:new Date}};e.Event=t}(idbModules),function(e){var t=function(){this.onsuccess=this.onerror=this.result=this.error=this.source=this.transaction=null,this.readyState="pending"},n=function(){this.onblocked=this.onupgradeneeded=null};n.prototype=t,e.IDBRequest=t,e.IDBOpenRequest=n}(idbModules),function(e,t){var n=function(e,t,n,o){this.lower=e,this.upper=t,this.lowerOpen=n,this.upperOpen=o};n.only=function(e){return new n(e,e,!1,!1)},n.lowerBound=function(e,o){return new n(e,t,o,t)},n.upperBound=function(e){return new n(t,e,t,open)},n.bound=function(e,t,o,r){return new n(e,t,o,r)},e.IDBKeyRange=n}(idbModules),function(e,t){function n(n,o,r,i,a,s){!n||n instanceof e.IDBKeyRange||(n=new e.IDBKeyRange(n,n,!1,!1)),this.__range=n,this.source=this.__idbObjectStore=r,this.__req=i,this.key=t,this.direction=o,this.__keyColumnName=a,this.__valueColumnName=s,this.__valueDecoder="value"===s?e.Sca:e.Key,this.source.transaction.__active||e.util.throwDOMException("TransactionInactiveError - The transaction this IDBObjectStore belongs to is not active."),this.__offset=-1,this.__lastKeyContinued=t,this["continue"]()}n.prototype.__find=function(n,o,r,i,a){a=a||1;var s=this,c=["SELECT * FROM ",e.util.quote(s.__idbObjectStore.name)],u=[];c.push("WHERE ",s.__keyColumnName," NOT NULL"),!s.__range||s.__range.lower===t&&s.__range.upper===t||(c.push("AND"),s.__range.lower!==t&&(c.push(s.__keyColumnName+(s.__range.lowerOpen?" >":" >= ")+" ?"),u.push(e.Key.encode(s.__range.lower))),s.__range.lower!==t&&s.__range.upper!==t&&c.push("AND"),s.__range.upper!==t&&(c.push(s.__keyColumnName+(s.__range.upperOpen?" < ":" <= ")+" ?"),u.push(e.Key.encode(s.__range.upper)))),n!==t&&(s.__lastKeyContinued=n,s.__offset=0),s.__lastKeyContinued!==t&&(c.push("AND "+s.__keyColumnName+" >= ?"),u.push(e.Key.encode(s.__lastKeyContinued))),c.push("ORDER BY ",s.__keyColumnName),c.push("LIMIT "+a+" OFFSET "+s.__offset),e.DEBUG&&console.log(c.join(" "),u),s.__prefetchedData=null,o.executeSql(c.join(" "),u,function(n,o){o.rows.length>1?(s.__prefetchedData=o.rows,s.__prefetchedIndex=0,e.DEBUG&&console.log("Preloaded "+s.__prefetchedData.length+" records for cursor"),s.__decode(o.rows.item(0),r)):1===o.rows.length?s.__decode(o.rows.item(0),r):(e.DEBUG&&console.log("Reached end of cursors"),r(t,t))},function(t,n){e.DEBUG&&console.log("Could not execute Cursor.continue"),i(n)})},n.prototype.__decode=function(t,n){var o=e.Key.decode(t[this.__keyColumnName]),r=this.__valueDecoder.decode(t[this.__valueColumnName]),i=e.Key.decode(t.key);n(o,r,i)},n.prototype["continue"]=function(n){var o=e.cursorPreloadPackSize||100,r=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(e,i,a,s){r.__offset++;var c=function(e,n,o){r.key=e,r.value=n,r.primaryKey=o,a(r.key!==t?r:t,r.__req)};return r.__prefetchedData&&(r.__prefetchedIndex++,r.__prefetchedIndex<r.__prefetchedData.length)?(r.__decode(r.__prefetchedData.item(r.__prefetchedIndex),c),t):(r.__find(n,e,c,s,o),t)})},n.prototype.advance=function(n){0>=n&&e.util.throwDOMException("Type Error - Count is invalid - 0 or negative",n);var o=this;this.__idbObjectStore.transaction.__addToTransactionQueue(function(e,r,i,a){o.__offset+=n,o.__find(t,e,function(e,n){o.key=e,o.value=n,i(o.key!==t?o:t,o.__req)},a)})},n.prototype.update=function(n){var o=this,r=this.__idbObjectStore.transaction.__createRequest(function(){});return e.Sca.encode(n,function(i){o.__idbObjectStore.transaction.__pushToQueue(r,function(r,a,s,c){o.__find(t,r,function(t,a,u){var d=o.__idbObjectStore,l=o.__idbObjectStore.transaction.db.__storeProperties,_=[i],f="UPDATE "+e.util.quote(d.name)+" SET value = ?",h=l[d.name]&&l[d.name].indexList;if(h)for(var p in h){var b=h[p];f+=", "+p+" = ?",_.push(e.Key.encode(n[b.keyPath]))}f+=" WHERE key = ?",_.push(e.Key.encode(u)),e.DEBUG&&console.log(f,i,t,u),r.executeSql(f,_,function(e,n){o.__prefetchedData=null,1===n.rowsAffected?s(t):c("No rows with key found"+t)},function(e,t){c(t)})},c)})}),r},n.prototype["delete"]=function(){var n=this;return this.__idbObjectStore.transaction.__addToTransactionQueue(function(o,r,i,a){n.__find(t,o,function(r,s,c){var u="DELETE FROM  "+e.util.quote(n.__idbObjectStore.name)+" WHERE key = ?";e.DEBUG&&console.log(u,r,c),o.executeSql(u,[e.Key.encode(c)],function(e,o){n.__prefetchedData=null,1===o.rowsAffected?(n.__offset--,i(t)):a("No rows with key found"+r)},function(e,t){a(t)})},a)})},e.IDBCursor=n}(idbModules),function(idbModules,undefined){function IDBIndex(e,t){this.indexName=this.name=e,this.__idbObjectStore=this.objectStore=this.source=t;var n=t.transaction.db.__storeProperties[t.name],o=n&&n.indexList;this.keyPath=o&&o[e]&&o[e].keyPath||e,["multiEntry","unique"].forEach(function(t){this[t]=!!(o&&o[e]&&o[e].optionalParams&&o[e].optionalParams[t])},this)}IDBIndex.prototype.__createIndex=function(indexName,keyPath,optionalParameters){var me=this,transaction=me.__idbObjectStore.transaction;transaction.__addToTransactionQueue(function(tx,args,success,failure){me.__idbObjectStore.__getStoreProps(tx,function(){function error(){idbModules.util.throwDOMException(0,"Could not create new index",arguments)}2!==transaction.mode&&idbModules.util.throwDOMException(0,"Invalid State error, not a version transaction",me.transaction);var idxList=JSON.parse(me.__idbObjectStore.__storeProps.indexList);idxList[indexName]!==undefined&&idbModules.util.throwDOMException(0,"Index already exists on store",idxList);var columnName=indexName;idxList[indexName]={columnName:columnName,keyPath:keyPath,optionalParams:optionalParameters},me.__idbObjectStore.__storeProps.indexList=JSON.stringify(idxList);var sql=["ALTER TABLE",idbModules.util.quote(me.__idbObjectStore.name),"ADD",columnName,"BLOB"].join(" ");idbModules.DEBUG&&console.log(sql),tx.executeSql(sql,[],function(tx,data){tx.executeSql("SELECT * FROM "+idbModules.util.quote(me.__idbObjectStore.name),[],function(tx,data){(function initIndexForRow(i){if(data.rows.length>i)try{var value=idbModules.Sca.decode(data.rows.item(i).value),indexKey=eval("value['"+keyPath+"']");tx.executeSql("UPDATE "+idbModules.util.quote(me.__idbObjectStore.name)+" set "+columnName+" = ? where key = ?",[idbModules.Key.encode(indexKey),data.rows.item(i).key],function(){initIndexForRow(i+1)},error)}catch(e){initIndexForRow(i+1)}else idbModules.DEBUG&&console.log("Updating the indexes in table",me.__idbObjectStore.__storeProps),tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?",[me.__idbObjectStore.__storeProps.indexList,me.__idbObjectStore.name],function(){me.__idbObjectStore.__setReadyState("createIndex",!0),success(me)},error)})(0)},error)},error)},"createObjectStore")})},IDBIndex.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"value"),n},IDBIndex.prototype.openKeyCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this.source,n,this.indexName,"key"),n},IDBIndex.prototype.__fetchIndexData=function(e,t){var n=this;return n.__idbObjectStore.transaction.__addToTransactionQueue(function(o,r,i,a){var s=["SELECT * FROM ",idbModules.util.quote(n.__idbObjectStore.name)," WHERE",n.indexName,"NOT NULL"],c=[];e!==undefined&&(s.push("AND",n.indexName," = ?"),c.push(idbModules.Key.encode(e))),idbModules.DEBUG&&console.log("Trying to fetch data for Index",s.join(" "),c),o.executeSql(s.join(" "),c,function(e,n){var o;o="count"===t?n.rows.length:0===n.rows.length?undefined:"key"===t?idbModules.Key.decode(n.rows.item(0).key):idbModules.Sca.decode(n.rows.item(0).value),i(o)},a)})},IDBIndex.prototype.get=function(e){return this.__fetchIndexData(e,"value")},IDBIndex.prototype.getKey=function(e){return this.__fetchIndexData(e,"key")},IDBIndex.prototype.count=function(e){return this.__fetchIndexData(e,"count")},idbModules.IDBIndex=IDBIndex}(idbModules),function(idbModules){var IDBObjectStore=function(e,t,n){this.name=e,this.transaction=t,this.__ready={},this.__setReadyState("createObjectStore",n===void 0?!0:n),this.indexNames=new idbModules.util.StringList;var o=t.db.__storeProperties;if(o[e]&&o[e].indexList){var r=o[e].indexList;for(var i in r)r.hasOwnProperty(i)&&this.indexNames.push(i)}};IDBObjectStore.prototype.__setReadyState=function(e,t){this.__ready[e]=t},IDBObjectStore.prototype.__waitForReady=function(e,t){var n=!0;if(t!==void 0)n=this.__ready[t]===void 0?!0:this.__ready[t];else for(var o in this.__ready)this.__ready[o]||(n=!1);if(n)e();else{idbModules.DEBUG&&console.log("Waiting for to be ready",t);var r=this;window.setTimeout(function(){r.__waitForReady(e,t)},100)}},IDBObjectStore.prototype.__getStoreProps=function(e,t,n){var o=this;this.__waitForReady(function(){o.__storeProps?(idbModules.DEBUG&&console.log("Store properties - cached",o.__storeProps),t(o.__storeProps)):e.executeSql("SELECT * FROM __sys__ where name = ?",[o.name],function(e,n){1!==n.rows.length?t():(o.__storeProps={name:n.rows.item(0).name,indexList:n.rows.item(0).indexList,autoInc:n.rows.item(0).autoInc,keyPath:n.rows.item(0).keyPath},idbModules.DEBUG&&console.log("Store properties",o.__storeProps),t(o.__storeProps))},function(){t()})},n)},IDBObjectStore.prototype.__deriveKey=function(tx,value,key,callback){function getNextAutoIncKey(){tx.executeSql("SELECT * FROM sqlite_sequence where name like ?",[me.name],function(e,t){1!==t.rows.length?callback(0):callback(t.rows.item(0).seq)},function(e,t){idbModules.util.throwDOMException(0,"Data Error - Could not get the auto increment value for key",t)})}var me=this;me.__getStoreProps(tx,function(props){if(props||idbModules.util.throwDOMException(0,"Data Error - Could not locate defination for this table",props),props.keyPath)if(key!==void 0&&idbModules.util.throwDOMException(0,"Data Error - The object store uses in-line keys and the key parameter was provided",props),value)try{var primaryKey=eval("value['"+props.keyPath+"']");void 0===primaryKey?"true"===props.autoInc?getNextAutoIncKey():idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath"):callback(primaryKey)}catch(e){idbModules.util.throwDOMException(0,"Data Error - Could not eval key from keyPath",e)}else idbModules.util.throwDOMException(0,"Data Error - KeyPath was specified, but value was not");else key!==void 0?callback(key):"false"===props.autoInc?idbModules.util.throwDOMException(0,"Data Error - The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ",props):getNextAutoIncKey()})},IDBObjectStore.prototype.__insertData=function(tx,encoded,value,primaryKey,success,error){var paramMap={};primaryKey!==void 0&&(paramMap.key=idbModules.Key.encode(primaryKey));var indexes=JSON.parse(this.__storeProps.indexList);for(var key in indexes)try{paramMap[indexes[key].columnName]=idbModules.Key.encode(eval("value['"+indexes[key].keyPath+"']"))}catch(e){error(e)}var sqlStart=["INSERT INTO ",idbModules.util.quote(this.name),"("],sqlEnd=[" VALUES ("],sqlValues=[];for(key in paramMap)sqlStart.push(key+","),sqlEnd.push("?,"),sqlValues.push(paramMap[key]);sqlStart.push("value )"),sqlEnd.push("?)"),sqlValues.push(encoded);var sql=sqlStart.join(" ")+sqlEnd.join(" ");idbModules.DEBUG&&console.log("SQL for adding",sql,sqlValues),tx.executeSql(sql,sqlValues,function(){success(primaryKey)},function(e,t){error(t)})},IDBObjectStore.prototype.add=function(e,t){var n=this,o=n.transaction.__createRequest(function(){});return idbModules.Sca.encode(e,function(r){n.transaction.__pushToQueue(o,function(o,i,a,s){n.__deriveKey(o,e,t,function(t){n.__insertData(o,r,e,t,a,s)})})}),o},IDBObjectStore.prototype.put=function(e,t){var n=this,o=n.transaction.__createRequest(function(){});return idbModules.Sca.encode(e,function(r){n.transaction.__pushToQueue(o,function(o,i,a,s){n.__deriveKey(o,e,t,function(t){var i="DELETE FROM "+idbModules.util.quote(n.name)+" where key = ?";o.executeSql(i,[idbModules.Key.encode(t)],function(o,i){idbModules.DEBUG&&console.log("Did the row with the",t,"exist? ",i.rowsAffected),n.__insertData(o,r,e,t,a,s)},function(e,t){s(t)})})})}),o},IDBObjectStore.prototype.get=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,r,i){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("SELECT * FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Fetched data",t);try{if(0===t.rows.length)return r();r(idbModules.Sca.decode(t.rows.item(0).value))}catch(n){idbModules.DEBUG&&console.log(n),r(void 0)}},function(e,t){i(t)})})})},IDBObjectStore.prototype["delete"]=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,r,i){t.__waitForReady(function(){var o=idbModules.Key.encode(e);idbModules.DEBUG&&console.log("Fetching",t.name,o),n.executeSql("DELETE FROM "+idbModules.util.quote(t.name)+" where key = ?",[o],function(e,t){idbModules.DEBUG&&console.log("Deleted from database",t.rowsAffected),r()},function(e,t){i(t)})})})},IDBObjectStore.prototype.clear=function(){var e=this;return e.transaction.__addToTransactionQueue(function(t,n,o,r){e.__waitForReady(function(){t.executeSql("DELETE FROM "+idbModules.util.quote(e.name),[],function(e,t){idbModules.DEBUG&&console.log("Cleared all records from database",t.rowsAffected),o()},function(e,t){r(t)})})})},IDBObjectStore.prototype.count=function(e){var t=this;return t.transaction.__addToTransactionQueue(function(n,o,r,i){t.__waitForReady(function(){var o="SELECT * FROM "+idbModules.util.quote(t.name)+(e!==void 0?" WHERE key = ?":""),a=[];e!==void 0&&a.push(idbModules.Key.encode(e)),n.executeSql(o,a,function(e,t){r(t.rows.length)},function(e,t){i(t)})})})},IDBObjectStore.prototype.openCursor=function(e,t){var n=new idbModules.IDBRequest;return new idbModules.IDBCursor(e,t,this,n,"key","value"),n},IDBObjectStore.prototype.index=function(e){var t=new idbModules.IDBIndex(e,this);return t},IDBObjectStore.prototype.createIndex=function(e,t,n){var o=this;n=n||{},o.__setReadyState("createIndex",!1);var r=new idbModules.IDBIndex(e,o);o.__waitForReady(function(){r.__createIndex(e,t,n)},"createObjectStore"),o.indexNames.push(e);var i=o.transaction.db.__storeProperties[o.name];return i.indexList[e]={keyPath:t,optionalParams:n},r},IDBObjectStore.prototype.deleteIndex=function(e){var t=new idbModules.IDBIndex(e,this,!1);return t.__deleteIndex(e),t},idbModules.IDBObjectStore=IDBObjectStore}(idbModules),function(e){var t=0,n=1,o=2,r=function(o,r,i){if("number"==typeof r)this.mode=r,2!==r&&e.DEBUG&&console.log("Mode should be a string, but was specified as ",r);else if("string"==typeof r)switch(r){case"readwrite":this.mode=n;break;case"readonly":this.mode=t;break;default:this.mode=t}this.storeNames="string"==typeof o?[o]:o;for(var a=0;this.storeNames.length>a;a++)i.objectStoreNames.contains(this.storeNames[a])||e.util.throwDOMException(0,"The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.",this.storeNames[a]);this.__active=!0,this.__running=!1,this.__requests=[],this.__aborted=!1,this.db=i,this.error=null,this.onabort=this.onerror=this.oncomplete=null};r.prototype.__executeRequests=function(){if(this.__running&&this.mode!==o)return e.DEBUG&&console.log("Looks like the request set is already running",this.mode),void 0;this.__running=!0;var t=this;window.setTimeout(function(){2===t.mode||t.__active||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",t.__active),t.db.__db.transaction(function(n){function o(t,n){n&&(a.req=n),a.req.readyState="done",a.req.result=t,delete a.req.error;var o=e.Event("success");e.util.callback("onsuccess",a.req,o),s++,i()}function r(){a.req.readyState="done",a.req.error="DOMError";var t=e.Event("error",arguments);e.util.callback("onerror",a.req,t),s++,i()}function i(){return s>=t.__requests.length?(t.__active=!1,t.__requests=[],void 0):(a=t.__requests[s],a.op(n,a.args,o,r),void 0)}t.__tx=n;var a=null,s=0;try{i()}catch(c){e.DEBUG&&console.log("An exception occured in transaction",arguments),"function"==typeof t.onerror&&t.onerror()}},function(){e.DEBUG&&console.log("An error in transaction",arguments),"function"==typeof t.onerror&&t.onerror()},function(){e.DEBUG&&console.log("Transaction completed",arguments),"function"==typeof t.oncomplete&&t.oncomplete()})},1)},r.prototype.__addToTransactionQueue=function(t,n){this.__active||this.mode===o||e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished.",this.__mode);var r=this.__createRequest();return this.__pushToQueue(r,t,n),r},r.prototype.__createRequest=function(){var t=new e.IDBRequest;return t.source=this.db,t.transaction=this,t},r.prototype.__pushToQueue=function(e,t,n){this.__requests.push({op:t,args:n,req:e}),this.__executeRequests()},r.prototype.objectStore=function(t){return new e.IDBObjectStore(t,this)},r.prototype.abort=function(){!this.__active&&e.util.throwDOMException(0,"A request was placed against a transaction which is currently not active, or which is finished",this.__active)},r.prototype.READ_ONLY=0,r.prototype.READ_WRITE=1,r.prototype.VERSION_CHANGE=2,e.IDBTransaction=r}(idbModules),function(e){var t=function(t,n,o,r){this.__db=t,this.version=o,this.objectStoreNames=new e.util.StringList;for(var i=0;r.rows.length>i;i++)this.objectStoreNames.push(r.rows.item(i).name);for(this.__storeProperties={},i=0;r.rows.length>i;i++){var a=r.rows.item(i),s=this.__storeProperties[a.name]={};s.keyPath=a.keypath,s.autoInc="true"===a.autoInc,s.indexList=JSON.parse(a.indexList)}this.name=n,this.onabort=this.onerror=this.onversionchange=null};t.prototype.createObjectStore=function(t,n){var o=this;n=n||{},n.keyPath=n.keyPath||null;var r=new e.IDBObjectStore(t,o.__versionTransaction,!1),i=o.__versionTransaction;i.__addToTransactionQueue(function(i,a,s){function c(){e.util.throwDOMException(0,"Could not create new object store",arguments)}o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction);var u=["CREATE TABLE",e.util.quote(t),"(key BLOB",n.autoIncrement?", inc INTEGER PRIMARY KEY AUTOINCREMENT":"PRIMARY KEY",", value BLOB)"].join(" ");e.DEBUG&&console.log(u),i.executeSql(u,[],function(e){e.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)",[t,n.keyPath,n.autoIncrement?!0:!1,"{}"],function(){r.__setReadyState("createObjectStore",!0),s(r)},c)},c)}),o.objectStoreNames.push(t);var a=o.__storeProperties[t]={};return a.keyPath=n.keyPath,a.autoInc=!!n.autoIncrement,a.indexList={},r},t.prototype.deleteObjectStore=function(t){var n=function(){e.util.throwDOMException(0,"Could not delete ObjectStore",arguments)},o=this;!o.objectStoreNames.contains(t)&&n("Object Store does not exist"),o.objectStoreNames.splice(o.objectStoreNames.indexOf(t),1);var r=o.__versionTransaction;r.__addToTransactionQueue(function(){o.__versionTransaction||e.util.throwDOMException(0,"Invalid State error",o.transaction),o.__db.transaction(function(o){o.executeSql("SELECT * FROM __sys__ where name = ?",[t],function(o,r){r.rows.length>0&&o.executeSql("DROP TABLE "+e.util.quote(t),[],function(){o.executeSql("DELETE FROM __sys__ WHERE name = ?",[t],function(){},n)},n)})})})},t.prototype.close=function(){},t.prototype.transaction=function(t,n){var o=new e.IDBTransaction(t,n||1,this);return o},e.IDBDatabase=t}(idbModules),function(e){var t=4194304;if(window.openDatabase){var n=window.openDatabase("__sysdb__",1,"System Database",t);n.transaction(function(e){e.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);",[])},function(){e.DEBUG&&console.log("Error in sysdb transaction - when creating dbVersions",arguments)});var o={open:function(o,r){function i(){if(!c){var t=e.Event("error",arguments);s.readyState="done",s.error="DOMError",e.util.callback("onerror",s,t),c=!0}}function a(a){var c=window.openDatabase(o,1,o,t);s.readyState="done",r===void 0&&(r=a||1),(0>=r||a>r)&&e.util.throwDOMException(0,"An attempt was made to open a database using a lower version than the existing version.",r),c.transaction(function(t){t.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)",[],function(){t.executeSql("SELECT * FROM __sys__",[],function(t,u){var d=e.Event("success");s.source=s.result=new e.IDBDatabase(c,o,r,u),r>a?n.transaction(function(t){t.executeSql("UPDATE dbVersions set version = ? where name = ?",[r,o],function(){var t=e.Event("upgradeneeded");t.oldVersion=a,t.newVersion=r,s.transaction=s.result.__versionTransaction=new e.IDBTransaction([],2,s.source),e.util.callback("onupgradeneeded",s,t,function(){var t=e.Event("success");e.util.callback("onsuccess",s,t)})},i)},i):e.util.callback("onsuccess",s,d)},i)},i)},i)}var s=new e.IDBOpenRequest,c=!1;return n.transaction(function(e){e.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(e,t){0===t.rows.length?e.executeSql("INSERT INTO dbVersions VALUES (?,?)",[o,r||1],function(){a(0)},i):a(t.rows.item(0).version)},i)},i),s},deleteDatabase:function(o){function r(t){if(!s){a.readyState="done",a.error="DOMError";var n=e.Event("error");n.message=t,n.debug=arguments,e.util.callback("onerror",a,n),s=!0}}function i(){n.transaction(function(t){t.executeSql("DELETE FROM dbVersions where name = ? ",[o],function(){a.result=void 0;var t=e.Event("success");t.newVersion=null,t.oldVersion=c,e.util.callback("onsuccess",a,t)},r)},r)}var a=new e.IDBOpenRequest,s=!1,c=null;return n.transaction(function(n){n.executeSql("SELECT * FROM dbVersions where name = ?",[o],function(n,s){if(0===s.rows.length){a.result=void 0;var u=e.Event("success");return u.newVersion=null,u.oldVersion=c,e.util.callback("onsuccess",a,u),void 0}c=s.rows.item(0).version;var d=window.openDatabase(o,1,o,t);d.transaction(function(t){t.executeSql("SELECT * FROM __sys__",[],function(t,n){var o=n.rows;(function a(n){n>=o.length?t.executeSql("DROP TABLE __sys__",[],function(){i()},r):t.executeSql("DROP TABLE "+e.util.quote(o.item(n).name),[],function(){a(n+1)},function(){a(n+1)})})(0)},function(){i()})},r)})},r),a},cmp:function(t,n){return e.Key.encode(t)>e.Key.encode(n)?1:t===n?0:-1}};e.shimIndexedDB=o}}(idbModules),function(e,t){e.openDatabase!==void 0&&(e.shimIndexedDB=t.shimIndexedDB,e.shimIndexedDB&&(e.shimIndexedDB.__useShim=function(){e.indexedDB=t.shimIndexedDB,e.IDBDatabase=t.IDBDatabase,e.IDBTransaction=t.IDBTransaction,e.IDBCursor=t.IDBCursor,e.IDBKeyRange=t.IDBKeyRange,e.indexedDB!==t.shimIndexedDB&&Object.defineProperty&&Object.defineProperty(e,"indexedDB",{value:t.shimIndexedDB})},e.shimIndexedDB.__debug=function(e){t.DEBUG=e})),"indexedDB"in e||(e.indexedDB=e.indexedDB||e.webkitIndexedDB||e.mozIndexedDB||e.oIndexedDB||e.msIndexedDB);var n=!1;if((navigator.userAgent.match(/Android 2/)||navigator.userAgent.match(/Android 3/)||navigator.userAgent.match(/Android 4\.[0-3]/))&&(navigator.userAgent.match(/Chrome/)||(n=!0)),void 0!==e.indexedDB&&!n||void 0===e.openDatabase){e.IDBDatabase=e.IDBDatabase||e.webkitIDBDatabase,e.IDBTransaction=e.IDBTransaction||e.webkitIDBTransaction,e.IDBCursor=e.IDBCursor||e.webkitIDBCursor,e.IDBKeyRange=e.IDBKeyRange||e.webkitIDBKeyRange,e.IDBTransaction||(e.IDBTransaction={});try{e.IDBTransaction.READ_ONLY=e.IDBTransaction.READ_ONLY||"readonly",e.IDBTransaction.READ_WRITE=e.IDBTransaction.READ_WRITE||"readwrite"}catch(o){}}else e.shimIndexedDB.__useShim()}(window,idbModules);
//@ sourceMappingURL=http://nparashuram.com/IndexedDBShim/dist/IndexedDBShim.min.map

/*
Copyright [2014] [Graham Abbott <graham.abbott@gmail.com>]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var Beacon = (function() {
    var x_in_list = function(x, the_list) {
        var l = the_list.length;
        for(var i = 0; i < l; i += 1) {
            if (x == the_list[i]) {
                return true;
            }
        }
        return false;
    };
    
    var remove_x_from_list = function(x, the_list) {
        var new_list = [];
        for(var i = 0; i < the_list.length; i += 1) {
            if (x != the_list[i]) {
                new_list.push(the_list[i]);
            }
        }
        return new_list;
    };

    var Beacon = function() {
        this.obs = {};
        this.to_remove = [];
        this.obs_id = 1;
    };

    Beacon.prototype.next_id = function() {
        this.obs_id += 1;
        return this.obs_id;
    };

    Beacon.prototype.smart_add = function(name, o) {
        if (this.obs[name] == undefined) {
            this.obs[name] = [o];
        } else {
            this.obs[name].push(o);
        }
    };

    Beacon.prototype.on = function(name, cb) {
        var uid = this.next_id();
        this.smart_add(name, [cb, true, uid]);
        return uid;
    };

    Beacon.prototype.once = function(name, cb) {
        var uid = this.next_id();
        this.smart_add(name, [cb, false, uid]);
        return uid;
    };

    Beacon.prototype.fire = function(name) {
        if (this.obs[name] != undefined) {
            var ll = this.obs[name];
            var args = [name].concat(arguments); //slice.call(arguments, 1)
            this.obs[name] = this.publish_event_to_list(ll, args);
        }

        if (this.obs['*'] != undefined) {
            var ll = this.obs['*'];
            var args = [name].concat(arguments); //slice.call(arguments, 1)
            this.obs['*'] = this.publish_event_to_list(ll, args);
        }
    };

    Beacon.prototype.publish_event_to_list = function(ll, args) {
        var new_list = [];
        var now_final = false;
        
        for(var i = 0; i < ll.length; i += 1) {
            if (x_in_list(ll[i][2], this.to_remove)) {
                // pass, either it's not a continue, or it's in the remove list.
                this.to_remove = remove_x_from_list(ll[i][2], to_remove);
            } else {
                now_final = ll[i][0].apply(null, args);
                if (now_final != false) {
                    if (ll[i][1]) {
                        new_list.push(ll[i]);
                    }    
                }
            }
        }
        return new_list;
    };

    Beacon.prototype.reset = function() {
        this.obs = {};
    };

    var remove = function(uid) {
        this.to_remove.push(uid);
    };

    return Beacon;
})();

var InterruptTimer = function(callback, timeout) {
    this.callback = callback;
    this.timeout = timeout;
    this.timeout_id = null;
    this.has_called = false;
};

InterruptTimer.prototype.start = function() {
    var _this = this;
    if (this.timeout > 0) {
        this.timeout_id = setTimeout(function() { _this.cancel(); }, this.timeout);
    }        
};

InterruptTimer.prototype.cancel = function() {
    if (this.has_called) {
        return
    }
    this.has_called = true;
    clearTimeout(this.timeout_id);
    this.callback(undefined);
};

InterruptTimer.prototype.fire = function(value) {
    if (this.has_called) {
        return
    }
    this.has_called = true;
    clearTimeout(this.timeout_id);
    this.callback(value);
};

var PromiseValue = function() {
    var _this = this;
    var _the_value = null;
    this.internal_promise = new Promise(function(resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
    });
};

PromiseValue.prototype.then = function(good, bad) {
    return this.internal_promise.then(good, bad);
};

PromiseValue.prototype.resolve = function(value) {
    this._the_value = value;
    return this.resolve(value);
};

PromiseValue.prototype.reject = function(err) {
    this._the_value = 'error';
    return this.reject(err);
};

var Next = function() {
    return new PromiseValue();
};

var BufferedRead = function() {
    
};


var Connector = function() {};

Connector.prototype.run = function(args) {
    console.log("RUN: " + args);
    return new Promise(function(resolve, reject) { resolve(); });
};



var l = function() {
    console.log( arguments );
}

var Redis = (function() {
    function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    var x_in_list = function(x, the_list) {
        var l = the_list.length;
        for(var i = 0; i < l; i += 1) {
            if (x == the_list[i]) {
                return true;
            }
        }
        return false;
    };

    var any_in_list = function(first_list, second_list) {
        for(var i=0; i < first_list.length; i++) {
            var left = first_list[i];
            if (x_in_list(left, second_list)) {
                return true;
            }
        }
        return false;
    };
    
    var remove_x_from_list = function(x, the_list) {
        var new_list = [];
        for(var i = 0; i < the_list.length; i += 1) {
            if (x != the_list[i]) {
                new_list.push(the_list[i]);
            }
        }
        return new_list;
    };
    
    Promise.prototype.log = function() {
        this.then(function(args) {
            console.log("Resolve: " + args);
        }, function(args) {
            console.log("Reject: " + args);
            throw args;
        });
    };

    var StoragePlugin = function() {};
    StoragePlugin.prototype.init = function() {};
    StoragePlugin.prototype.get = function() {};
    StoragePlugin.prototype.set = function() {};
    StoragePlugin.prototype.update = function() {};
    StoragePlugin.prototype.remove = function() {};
    StoragePlugin.prototype.keys = function() {};

    var LocalStoragePlugin = function(is_session) {
        if (is_session == true) {
            this.conn = sessionStorage;
        } else {
            this.conn = localStorage;
        }

        this.update_beacon = new Beacon();
        this.init();
    };

    LocalStoragePlugin.prototype.init = function() {
        this.ready = new Promise(function(resolve, reject) {
            resolve();
        });
    };
    
    LocalStoragePlugin.prototype.get = function(key) {
        var plugin = this;
        return new Promise(function(resolve, reject) {
            var value = plugin.conn.getItem(key);
            if (value == null) {
                value = undefined;
            }
            resolve(value);            
        });
    };

    LocalStoragePlugin.prototype.set = function(key, value) {
        var plugin = this;        
        return new Promise(function(resolve, reject) {
            plugin.conn.setItem(key, value);
            resolve(value);
        });
    };

    LocalStoragePlugin.prototype.update = function(key, cb) {
        var plugin = this;        
        return new Promise(function(resolve, reject) {
            var value = plugin.conn.getItem(key);
            var result = null;

            try {
                result = cb(value);
            } catch (e) {
                reject(e);
            }

            var new_value = result[0];
            var return_value = result[1];

            if (new_value != undefined) {
                plugin.conn.setItem(key, new_value);
            }
            resolve(return_value);
            return return_value;
        });
    };

    LocalStoragePlugin.prototype.remove = function(key) {
        var plugin = this;        
        return new Promise(function(resolve, reject) {
            plugin.conn.removeItem(key);
            resolve();
        });
    };

    LocalStoragePlugin.prototype.keys = function() {
        var plugin = this;
        return new Promise(function(resolve, reject) {
            var keys = [];
            for (var key in plugin.conn){
                keys.push(key);
            }
            resolve(keys);
        });
    }

    var Cursor = function(plugin) {
        this.plugin = plugin;
        this.command_queue = [];
        this.looper = null;
        this.ready = null;
        this.init();
    };
    
    Cursor.prototype.all = function(good, bad) {
        return Promise.all(good, bad);
    };

    Cursor.prototype.init = function() {
        var _this = this;
        this.plugin.init();
        this.ready = new Promise(function(resolve, reject) {
            resolve();
        });
    };

    Cursor.prototype.get = function(key) {
        return this.plugin.get(key);
    };

    Cursor.prototype.set = function(key, value) {
        return this.plugin.set(key, value);
    };

    Cursor.prototype.incr = function(key) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling incr on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value + 1, prev_value];
            }
        });
    };

    Cursor.prototype.incrby = function(key, increment) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling incrby on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value + increment, prev_value];
            }
        });
    };

    Cursor.prototype.decr = function(key) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling decr on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value - 1, prev_value];
            }
        });
    };

    Cursor.prototype.decrby = function(key, increment) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling decrby on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value - increment, prev_value];
            }
        });
    };

    Cursor.prototype.flushdb = function() {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.conn.clear();
            setTimeout(function() {
                resolve();
            }, 100);
        });
    }

    Cursor.prototype.exists = function(key) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(result) {
                if (result == null || result == undefined) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    Cursor.prototype.keys = function() {
        return this.plugin.keys();
    };

    Cursor.prototype.del = function(key) {
        return this.plugin.remove(key);
    };

    Cursor.prototype.append = function(key, value) {
        return this.plugin.update(key, function(prev_value) {
            if (!prev_value) {
                prev_value = '';
            }
            var new_value = prev_value + value;
            return [new_value, new_value.length];
        });
    };

    Cursor.prototype.mset = function() {
        var all = [];

        for(var i=0; i < arguments.length; i += 2) {
            var key = arguments[i];
            var value = arguments[i+1];
            all.push(this.plugin.set(key, value));
        }
        return Promise.all(all);
    };

    Cursor.prototype.msetnx = function() {
        var _this = this;
        var plugin = this.plugin;
        var args = arguments;
        return new Promise(function(resolve, reject) {
            var all = [];
            
            for(var i=0; i < args.length; i += 2) {
                var key = args[i];
                var value = args[i+1];
                all.push(_this.exists(key));
            }
            
            Promise.all(all).then(function(results) {
                var hit = false;
                for(var i = 0; i < results.length; i++) {
                    if (results[i] == true) {
                        hit = true;
                    }
                }
                if (hit == false) {
                    var set_all = [];
                    for(var i=0; i < args.length; i += 2) {
                        var key = args[i];
                        var value = args[i+1];
                        set_all.push(plugin.set(key));
                    }
                    Promise.all(set_all).then(function() {
                        resolve(1);
                    });
                } else {
                    resolve(0);
                }
            });
        });
    };

    Cursor.prototype.mget = function() {
        var all = [];

        for(var i=0; i < arguments.length; i++) {
            var key = arguments[i];
            all.push(this.plugin.get(key));
        }
        return Promise.all(all);
    };

    Cursor.prototype.setnx = function(key, value) {
        return this.plugin.update(key, function(prev_value) {
            if (!prev_value) {
                return [value, 1];
            } else {
                return [undefined, 0];
            }
        });
    };

    Cursor.prototype.strlen = function(key) {
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(result) {
                if (result == null) {
                    resolve(0);
                } else {
                    resolve(result.length);
                }
            });
        });
    };

    Cursor.prototype.rename = function(key, newkey) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                plugin.set(newkey, value).then(function() {
                    resolve();
                });
            });
        });
    };

    Cursor.prototype.renamenx = function(key, newkey) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                if (!value) {
                    plugin.set(newkey, value).then(function() {
                        resolve(1);
                    });
                } else {
                    resolve(0);
                };
            });
        });
    };

    Cursor.prototype.getrange = function(key, start, end) {};
    Cursor.prototype.setrange = function(key, offset, value) {};
    Cursor.prototype.lrem = function() {};
    
    Cursor.prototype.lindex = function(key, index) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                value = JSON.parse(value);
                if (index < 0) {
                    index = value.length + index;
                }
                resolve(value[index]);
            });
        });
    };

    Cursor.prototype.lrange = function(key, start, stop) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                if (stop < 0) {
                    stop = prev_value.length + (stop+1);
                } else {
                    stop += 1;
                }
                resolve(prev_value.slice(start, stop));
            });
        });
    };

    Cursor.prototype.llen = function(key, index) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                value = JSON.parse(value);
                resolve(value.length);
            });
        });
    };

    Cursor.prototype.lset = function(key, index, value) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                if (index < 0) {
                    index = prev_value.length + index;
                }
                prev_value[index] = value
                return [JSON.stringify(prev_value), prev_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.ltrim = function(key, start, stop) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                if (stop < 0) {
                    stop = prev_value.length + (stop+1);
                }
                var new_value = prev_value.slice(start, stop);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpush = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = prev_value.concat(outer_args);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpushx = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    return [undefined, 0];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = prev_value.concat(outer_args);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.lpush = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = outer_args.concat(prev_value);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.lpushx = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    return [undefined, 0];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = outer_args.concat(prev_value);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpop = function(key) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var value = prev_value[prev_value.length-1];
                var new_value = prev_value.slice(0, prev_value.length-1);
                return [JSON.stringify(new_value), value];
            }).then(function(value) {
                resolve(value);
            });
        });
    };
    
    Cursor.prototype.lpop = function(key) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var value = prev_value[0];
                var new_value = prev_value.slice(1);
                return [JSON.stringify(new_value), value];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpoplpush = function(source, destination) {
        var _this = this;
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(source, function(prev_value) {
                if (!prev_value) {
                    return [undefined, undefined];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var value = prev_value[prev_value.length-1];
                var new_value = prev_value.slice(0, prev_value.length-1);
                return [JSON.stringify(new_value), value];
            }).then(function(value) {
                if (value == undefined) {
                    resolve(undefined);
                } else {
                    _this.lpush(destination, value).then(function() {
                        resolve(value);
                    });
                }
            });
        });
    };
    
    function easy_connect(options) {
        return new Cursor(new LocalStoragePlugin());
    }

    var Connection = function() {
        this.blocked_reads = [];
        this.command_queue = [];
    };

    Connection.prototype.on_change = function(keys, callback) {
        var uuid = generateUUID();
        var _this = this;
        this.blocked_reads.push([keys, callback]);
        return uuid;
    };

    Connection.prototype.handle_update = function(key) {
        var hit = false;
        var new_blocks = [];
        for(var i=0; i < this.blocked_reads.length; i++) {
            var block = this.blocked_reads[i];
            if (hit == false && x_in_list(key, block[0])) {
                block[1](key);
                hit = true;
            } else {
                new_blocks.push(block);
            }
        }
        this.blocked_reads = new_blocks;
    };
    
    return {
        'Cursor'             : Cursor,
        'LocalStoragePlugin' : LocalStoragePlugin,
        'connect'            : easy_connect,
        'InterruptTimer'     : InterruptTimer,
        'Beacon'             : Beacon,
        'Connection'         : Connection
    };
})();


var TIMEOUT = 1;
    
var PromiseValue = function() {
    var _this = this;
    var _the_value = null;
    this.internal_promise = new Promise(function(resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
    });
};

PromiseValue.prototype.then = function(good, bad) {
    return this.internal_promise.then(good, bad);
};

PromiseValue.prototype.resolve = function(value) {
    this._the_value = value;
    return this.resolve(value);
};

PromiseValue.prototype.reject = function(err) {
    this._the_value = 'error';
    return this.reject(err);
};

var Cursor = function(connector) {
    this.connector = connector;
    this.command_queue = [];
    this.blocking_calls = [];
    this.timeout_runner = null;
};

Cursor.prototype.cmd = function() {
    var args = Array.prototype.slice.call(arguments);
    var result = new PromiseValue();
    this.command_queue.push([args, result]);
    this.process();
    return result;
};

Cursor.prototype.process = function() {
    if (this.timeout_runner == null) {
        var _this = this;
        this.timeout_runner = setTimeout(function() {
            _this._process();
        }, TIMEOUT);
    }
};

Cursor.prototype._process = function() {
    this.timeout_runner = null;
    if (this.command_queue.length == 0) {
        return;
    }
    
    var next_command = this.command_queue[0];
    this.command_queue = this.command_queue.slice(1);
    
    var args = next_command[0];
    var result_promise = next_command[1];
    var _this = this;
    
    this.connector.run(args).then(function(return_data) {
        result_promise.resolve(return_data);
        _this.process();
    });
};






    return jsredis_module.exports;
})();



