(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var platter = require('../../lib/platter'),
	platterTemplate,
	platterAssets,
	platterData,
	platterStyles,
	platterInfoPanel;

platterTemplate = new platter({
	idSelector : 'template'
});
platterData = new platter({
	idSelector : 'data'
});
platterAssets = new platter({
	idSelector : 'assets'
});
platterStyles = new platter({
	idSelector : 'styles'
});
platterInfoPanel = new platter({
	idSelector : 'info'
});

window.onload = function(){
	// console.log("window loaded");
	platterInfoPanel.init();
	platterTemplate.init();
	platterData.init();
	platterAssets.init();
	platterStyles.init();
};

window.platterAssets = platterAssets;

platterTemplate.on("intializedPlatter",function(data){
	// console.log("got event",data);
	var a = data;
});
},{"../../lib/platter":2}],2:[function(require,module,exports){
/*
 * manuscript
 * http://github.com/typesettin/platter
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	domhelper = require('domhelper'),
	util = require('util');

/**
 * A module that represents a platter.
 * @{@link https://github.com/typesettin/platter}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module platter
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:domhelper
 * @requires module:events
 * @todo to do later
 */
var platter = function(config_options){
	/** module default configuration */
	var options,
		defaults = {
			idSelector : 'platter',
			name : null,
			title : null,
			fullIdSelector: null,
			platterContentElement: null,
			notifications: 0,
			windowObjectReference: null,
			element: null
		},
		container;

	//extend default options
	options = extend( defaults,config_options );


	/** Returns the configuration object 
	 * @return {object} the module configuration
	 */
	this.config = function(){
		return options;
	};

	/** 
	 * The element to clone in child window
	 * @param {object} element - html element to clone
	 */
	this.setPlatterContentElement = function(element){
		options.platterContentElement = element;
	};

	/** makes sure create unique dom elements */
	this.isSelectorUnique = function(){
		if(document.querySelector('#'+options.idSelector+'_pltr') === null){
			options.fullIdSelector = options.idSelector+'_pltr';
			options.name = options.idSelector;
			options.title = (options.title) ? options.title : options.name;
			return true;
		}
		else{
			return false;
		}
	};

	/**
	 * intialize a new platter
	 */
	this.init = function(){
		if(this.isSelectorUnique() === false){
			throw new Error('idSelector must be unique');
		}
		else{
			if(document.querySelector('#_pltrContainer')){
				this.createPlatter(options.fullIdSelector);
			}
			else{
				this.createContainer();
				this.createPlatter(options.fullIdSelector);
			}
			options.element = document.getElementById(options.fullIdSelector);
			options.element.addEventListener('click',platterClickEventHandler,false);
			this.emit("intializedPlatter",true);
		}
		platterWindowResizeEventHandler();
	}.bind(this);

	/**
	 * create platter html container
	 */
	this.createContainer = function(){
		var platterContainer = document.createElement('div');
		platterContainer.setAttribute("id","_pltrContainer");
		classie.addClass(platterContainer,'_pltr-bottom');
		document.body.appendChild(platterContainer);
		this.emit("platterContainerCreated",platterContainer);

		var platterElementsContainer = document.createElement('div');
		platterElementsContainer.setAttribute("id","_pltr-elementsContainer");
		classie.addClass(platterElementsContainer,'_pltr-right');
		platterElementsContainer.innerHTML='<div id="_pltr-ecmc"><span id="_pltr-ecmc-button">[+]</span></div>';
		platterContainer.appendChild(platterElementsContainer);
		this.emit("platterElementContainerCreated",platterContainer);

		document.getElementById("_pltr-ecmc").addEventListener('click',platterButtonPaneClickEventHandler,false);
	};

	/**
	 * create platter html
	 * @param {string} id name for platter selector id
	 */
	this.createPlatter = function(id){
		/** create platter tab html */
		var platterHTML = document.createElement('div');
		platterHTML.setAttribute('id',id);
		classie.addClass(platterHTML,'_pltr-tab');
		classie.addClass(platterHTML,'_pltr-item');
		platterHTML.innerHTML =options.title+'<span class="_pltr-open-window">[~]</span>';
		/** add platter tab to tab bar */
		document.querySelector('#_pltrContainer').appendChild(platterHTML);
		this.emit("platterCreated",platterHTML);

		/** create platter pane html */
		var panePanalWrapper = document.createElement('div');
		panePanalWrapper.setAttribute('id',id+'-pane-wrapper');

		function setUpPlatterAttributes(){
			options.platterContentElement.setAttribute("id",id+"-pane");
			classie.addClass(options.platterContentElement,'_pltr-elementItem');
			classie.addClass(options.platterContentElement,id);
			panePanalWrapper.appendChild(options.platterContentElement);
			document.querySelector('#_pltr-elementsContainer').appendChild(panePanalWrapper);
		}

		/** add platter element to pane */
		if(options.platterContentElement){
			setUpPlatterAttributes();
		}
		else{
			options.platterContentElement = document.createElement('div');
			options.platterContentElement.innerHTML =options.title+' pane';
			setUpPlatterAttributes();
		}

		this.emit("platterCreatedPaneElement",options.platterContentElement);
	};

	/** hides platter in bar */
	this.hidePlatterTab = function(){
		classie.addClass(document.getElementById(options.fullIdSelector),'_pltr-hide');
	};

	/** show platter in bar */
	this.showPlatterTab = function(callback){
		classie.removeClass(document.getElementById(options.fullIdSelector),'_pltr-hide');
		callCallBack(callback);
	};

	/** show platter pane */
	this.showPlatterPane = function(callback){
		var paneSelector = document.getElementById('_pltr-elementsContainer'),
			paneButton = document.getElementById('_pltr-ecmc');

		if(paneSelector.style.width!=='0' || paneSelector.style.width!=='0%'){
			paneSelector.style.width = "50%";
			if(paneButton){
				classie.addClass(paneButton,'_pltr-expanded');
				paneButton.querySelector('span').innerHTML='[ - ]';
			}
			this.emit("openedPlatterPane",true);
		}
		callCallBack(callback);
	};

	/** hide platter pane */
	this.hidePlatterPane = function(){
		var paneSelector = document.getElementById('_pltr-elementsContainer'),
			paneButton = document.getElementById('_pltr-ecmc');

		paneSelector.style.width = "0%";
		if(paneButton){
			classie.removeClass(document.getElementById('_pltr-ecmc'),'_pltr-expanded');
				paneButton.querySelector('span').innerHTML='[+]';
		}
		this.emit("closedPlatterPane",true);
	};

	/**
	 * opens platter in new window
	 * @throws {ERROR} If cannot open new window
	 * @fires eventEmitter event for opened window
	 */
	this.open = function(link,callback){
		var strWindowFeatures = "menubar=no, location=no, resizable=yes,scrollbars=yes, status=yes, dependent=yes, alwaysRaised=yes ",
			linkurl = (link) ? link : 'assets/platter.html';

		options.windowObjectReference = window.open('', options.name, strWindowFeatures);
		// options.windowObjectReference.document.write('working: '+options.name);
		options.windowObjectReference.document.body.appendChild(options.platterContentElement);
		options.windowObjectReference.document.title = options.title;

		options.windowObjectReference.addEventListener('unload',closePlatterWindowEventHandler,false);
		options.windowObjectReference.addEventListener('click',this.childPlatterWindowClickEventHandler,false);
		callCallBack(callback);
	}.bind(this);

	/** resizes platter html elements */
	function platterWindowResizeEventHandler(e){
		var paneElementsContainer = document.getElementById("_pltr-elementsContainer");
		paneElementsContainer.style.height=window.innerHeight+"px";
	}

	/** listen for window resizes */
	window.addEventListener('resize',platterWindowResizeEventHandler, false);

	/** listen for orientation change */
	window.addEventListener("orientationchange", platterWindowResizeEventHandler, false);

	/** handles click events on the tab */
	var platterClickEventHandler = function(e){
		var etarget = e.target;
		if(classie.hasClass(etarget,'_pltr-open-window')){
			if(options.windowObjectReference === null || options.windowObjectReference.closed){
				this.open(
					null,
					function(){
						this.hidePlatterTab();
					}.bind(this)
				);
				this.emit("openedPlatterWindow",true);
			}
			else{
				options.windowObjectReference.focus();
				this.emit("focusedPlatterWindow",true);
			}
		}
		else{
			this.showPlatterPane(function(){
				var elec = document.getElementById("_pltr-elementsContainer");
				// elec.scrollTop = 0;
				elec.scrollTop = elec.scrollTop + domhelper.getPosition(document.getElementById(options.fullIdSelector+"-pane-wrapper")).top;
			});
		}
	}.bind(this);

	var closePlatterWindowEventHandler = function(e){
		var wrapperToInsert = document.getElementById(options.fullIdSelector+'-pane-wrapper');
		wrapperToInsert.appendChild(options.platterContentElement);
		// console.log("closed window");
		// console.log(options.windowObjectReference.document.body);
		this.showPlatterTab();
	}.bind(this);

	/** makes sure create unique dom elements */
	this.childPlatterWindowClickEventHandler = function(e){
		// console.log(e);
	};

	var platterButtonPaneClickEventHandler = function(e){
		var paneButton = document.getElementById('_pltr-ecmc');
		if(classie.hasClass(paneButton,'_pltr-expanded')){
			this.hidePlatterPane();
		}
		else{
			this.showPlatterPane();
		}
	}.bind(this);

	function callCallBack(callback){
		if(typeof callback ==='function'){
			callback();
		}
	}

	this.testWriteToChild = function(html){
		options.windowObjectReference.document.write('writing more:'+html);
	};
};

util.inherits(platter,events.EventEmitter);
platter.prototype.testfunc = function() {
	console.log("teeestie");
};

module.exports = platter;

// If there is a window object, that at least has a document property,
// define linotype
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.platter = platter;
}
},{"classie":8,"domhelper":10,"events":3,"util":7,"util-extend":12}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":6,"FWaASH":5,"inherits":4}],8:[function(require,module,exports){
/*
 * classie
 * http://github.amexpub.com/modules/classie
 *
 * Copyright (c) 2013 AmexPub. All rights reserved.
 */

module.exports = require('./lib/classie');

},{"./lib/classie":9}],9:[function(require,module,exports){
/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */
'use strict';

  // class helper functions from bonzo https://github.com/ded/bonzo

  function classReg( className ) {
    return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
  }

  // classList support for class management
  // altho to be fair, the api sucks because it won't accept multiple classes at once
  var hasClass, addClass, removeClass;

  if (typeof document === "object" && 'classList' in document.documentElement ) {
    hasClass = function( elem, c ) {
      return elem.classList.contains( c );
    };
    addClass = function( elem, c ) {
      elem.classList.add( c );
    };
    removeClass = function( elem, c ) {
      elem.classList.remove( c );
    };
  }
  else {
    hasClass = function( elem, c ) {
      return classReg( c ).test( elem.className );
    };
    addClass = function( elem, c ) {
      if ( !hasClass( elem, c ) ) {
        elem.className = elem.className + ' ' + c;
      }
    };
    removeClass = function( elem, c ) {
      elem.className = elem.className.replace( classReg( c ), ' ' );
    };
  }

  function toggleClass( elem, c ) {
    var fn = hasClass( elem, c ) ? removeClass : addClass;
    fn( elem, c );
  }

  var classie = {
    // full names
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    // short names
    has: hasClass,
    add: addClass,
    remove: removeClass,
    toggle: toggleClass
  };

  // transport

  if ( typeof module === "object" && module && typeof module.exports === "object" ) {
    // commonjs / browserify
    module.exports = classie;
  } else {
    // AMD
    define(classie);
  }

  // If there is a window object, that at least has a document property,
  // define classie
  if ( typeof window === "object" && typeof window.document === "object" ) {
    window.classie = classie;
  }
},{}],10:[function(require,module,exports){
/*
 * domhelper
 * http://github.com/yawetse/domhelper
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

module.exports = require('./lib/domhelper');

},{"./lib/domhelper":11}],11:[function(require,module,exports){
/*
 * linotype
 * https://github.com/typesettin/linotype
 * @author yaw joseph etse
 * Copyright (c) 2014 Typesettin. All rights reserved.
 */

'use strict';

var classie = require('classie');
// 	extend = require('util-extend'),
// 	events = require('events'),
// 	util = require('util');

/**
 * A module that adds simple dom utility functionality.
 * @author yaw joseph etse
 * @constructor
 */

var domhelper = {

	/**
	 * returns the highest zindex
	 * @param {string} selector - query selector
	 * @return {number} highest z-index
	 * @public
	 */
	getHighIndex: function(selector){
		if (!selector) {
			selector = "*";
		}

		var elements = document.querySelectorAll(selector),
			i = 0,
			e, s,
			max = elements.length,
			found = [];

		for (; i < max; i += 1) {
			e = elements[i].style.zIndex;
			s = elements[i].style.position;
			if (e && s !== "static") {
				found.push(parseInt(e, 10));
			}
		}

		return found.length ? Math.max.apply(null, found) : 0;
	},

	/**
	 * toggles class across nodelist/elementcollection
	 * @param {object} elementCollection - html dom element
	 * @param {object} element - html dom element
	 * @param {string} name of class!
	 * @public
	 */
	removeAllClassAndToggle: function(element,elementCollection,toggleClass){
		//updating the active class
		for(var h =0; h <elementCollection.length; h++){
			classie.removeClass(elementCollection[h],toggleClass);
		}
		classie.addClass(element,toggleClass);
	},
	/**
	 * removes element from dom
	 * @param {object} elementCollection - html dom element
	 * @public
	 */
	removeElement: function(element){
		//updating the active class
		element.parentNode.removeChild(element);
	},
	/**
	 * converts idnex of node in nodelist
	 * @param {object} nodelist - html dom element
	 * @param {object} element - html dom element
	 * @return {number} index of element in nodelist
	 * @method
	 */
	nodeIndexOfNodeList: function(nodelist,element){
		return domhelper.nodelistToArray(nodelist,true).indexOf(element.outerHTML);
    },

	/**
	 * converts nodelists to arrays
	 * @param {node} nl - html dom element
	 * @return { array} array of html nodes
	 * @method
	 */
	nodelistToArray: function(nl,useStrings){
		var arr = [];
		for (var i = 0, ref = arr.length = nl.length; i < ref; i++) {
			arr[i] = (useStrings) ? nl[i].outerHTML : nl[i];
		}
		return arr;
    },

	/**
	 * Returns cloaset DOM element.
	 * @param {node} element - html dom element
	 * @return {node} - closet node element
	 * @method
	 */
    closetElement: function(element){
		if(typeof element.length === 'number'){
			return undefined;
		}
		var matches = domhelper.nodelistToArray(document.querySelectorAll(element.nodeName+'.'+element.className.trim().split(" ").join("."))),
			cleanMatches = [];
		// console.log("matches",matches.length,matches);

		for (var x =0; x < matches.length; x++){
			// console.log('x',x,'element',element,'matches[x]',matches[x],'isEqualNode',matches[x].isEqualNode(element),'compareDocumentPosition',element.compareDocumentPosition(matches[x]));
			if(element.compareDocumentPosition(matches[x])<4 && !matches[x].isEqualNode(element)){
				cleanMatches.push(matches[x]);
			}
		}

		function compareNumbers(a, b) {
			return a.compareDocumentPosition( b ) - b.compareDocumentPosition( a );
		}
		// console.log("matches cleaned",cleanMatches.length,cleanMatches);
		// console.log("matches sorted",cleanMatches.sort(compareNumbers));
		return cleanMatches[0];
	},

	/**
	 * Hides DOM elements.
	 * @method
	 * @param {node} element - html dom element
	 */
	elementHideCss: function(element){
		element.style.display="none";
	},

	/**
	 * Shows DOM elements.
	 * @method
	 * @param {node} element - html dom element
	 */
	elementShowCss: function(element){
		element.setAttribute('style',element.getAttribute('style').replace("display: none;"));
	},

	/**
	 * Wraps inner elements
	 * @method
	 * @param {node} element - html dom element
	 * @param {node} innerElement - element to wrap html dom element
	 */
	elementContentWrapInner: function(element,innerElement){
		var wrapper = element,
			w = innerElement,
			len = element.childElementCount,
			wrapper_clone = wrapper.cloneNode(true);

		wrapper.innerHTML='';
		wrapper.appendChild(w);
		var newFirstChild = wrapper.firstChild;

		newFirstChild.innerHTML=wrapper_clone.innerHTML;
	},

	/**
	 * Wraps element with wrapper
	 * @method
	 * @param {node} element - html dom element
	 * @param {node} wrapperElement - element to wrap html dom element
	 */
	elementWrap: function(element,wrapperElement){
		var elementParent =element.parentNode,
			element_clone = element.cloneNode(true);

		elementParent.replaceChild(wrapperElement,element);
		wrapperElement.appendChild(element);
	},


	/**
	 * get scroll position of element
	 * @method
	 * @param {node} element - html dom element
	 * @return {number} position of scroll
	 */
	getScrollTop: function(element){
		// console.log(typeof element);
		if(element === window && typeof window.pageYOffset!== 'undefined'){
			//most browsers except IE before #9
			return window.pageYOffset;
		}
		else if(typeof element ==="object"){
			return element.scrollTop;
		}
		else {
			var B= document.body; //IE 'quirks'
			var D= document.documentElement; //IE with doctype
			D= (D.clientHeight)? D: B;
			return D.scrollTop;
		}
	},

	/**
	 * get scroll position of element
	 * @method
	 * @param {node} element - html dom element
	 * @return {object} position element
	 */
	getPosition: function(element) {
		var xPosition = 0;
		var yPosition = 0;

		while(element) {
			xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;
		}
		return { x: xPosition, y: yPosition, left: xPosition, top: yPosition };
	},

	/**
	 * get element selector
	 * @method
	 * @param {node} element - html dom element
	 * @return {string} query selector string
	 */
	getElementSelector: function(element){
		var tagSelector = (element.tagName) ? element.tagName:'',
			idSelector = (element.id) ? '#'+element.id+'':'',
			classSelector='';
		if(element.classList){
			for(var x=0; x < element.classList.length; x++){
				classSelector+='.'+element.classList[x]+"";
			}
		}
		return tagSelector+idSelector+classSelector;
	},

	/**
	 * get parent element
	 * @method
	 * @param {node} element - html dom element
	 * @param {string} selector - selector
	 * @param {string} selectorType - selector type (id or class)
	 */
	getParentElement: function(element,selector,selectorType){
		if(element.tagName==='BODY' || element.tagName==='HTML' || selector==='body' || selector==='html' || selector===undefined){
			// console.log('body selected');
			return undefined;
		}
		else if( (selectorType==='id' && element.parentNode.id === selector) || element.parentNode.className.match(new RegExp(selector,'g'))){
			// console.log("parent node");
			return element.parentNode;

			//new RegExp(pattern,modifiers)
		}
		else  {
			// console.log("look up higher");
			return domhelper.getParentElement(element.parentNode,selector,selectorType);
		}
	},

	getPreviousElements: function(element,returnArray){
		if(element.previousElementSibling){
			returnArray.push(element.previousElementSibling);
			return domhelper.getPreviousElements(element.previousElementSibling,returnArray);
		}
		else{
			return returnArray;
		}
	},


	getNextElements: function(element,returnArray){
		if(element.nextElementSibling){
			returnArray.push(element.nextElementSibling);
			return domhelper.getNextElements(element.nextElementSibling,returnArray);
		}
		else{
			return returnArray;
		}
	},

	insertAllBefore: function(element,elementsToInsert){
		var parentElement = element.parentNode;
		// console.log("parentElement",parentElement,"element",element,"elementsToInsert",elementsToInsert);
		if(elementsToInsert.length){
			for(var x =0; x<elementsToInsert.length; x++){
				// console.log(x,"elementsToInsert[x]",elementsToInsert[x])
				parentElement.insertBefore(elementsToInsert[x],element);
			}
		}
		else{
			parentElement.insertBefore(elementsToInsert,element);
		}
	},

	insertAllAfter: function(element,elementsToInsert){
		var parentElement = element.parentNode;
		var nextSibling = element.nextSibling;
		// console.log("parentElement",parentElement,"element",element,"elementsToInsert",elementsToInsert);
		if(elementsToInsert.length){
			for(var x =0; x<elementsToInsert.length; x++){
				// console.log(x,"elementsToInsert[x]",elementsToInsert[x])
				// elementsToInsert[x].style.background="green";
				parentElement.insertBefore(elementsToInsert[x],nextSibling);
			}
		}
		else{
			parentElement.insertBefore(elementsToInsert,nextSibling);
		}
	},

	unwrapElement: function(element){
		var parentNodeElem = element.parentNode;
		if(parentNodeElem.nodeName !== "BODY"){
			var parentParentNodeElem = parentNodeElem.parentNode;
			parentParentNodeElem.innerHTML='';
			parentParentNodeElem.appendChild(element);
		}
	},
	onWindowLoaded: function(callback){
		var readyStateCheckInterval = setInterval(function() {
		    if (document.readyState === "complete") {
		        callback();
		        clearInterval(readyStateCheckInterval);
		    }
		}, 10);
	}

};

module.exports = domhelper;

// If there is a window object, that at least has a document property,
// define linotype
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.domhelper = domhelper;
}
},{"classie":8}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = extend;
function extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

},{}]},{},[1])