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
			element: null,
			isPlatterContainerOpen: false,
			openWindowHTML:'<span class="_pltr-open-window">[~]</span>'
		};//,
		//container;

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
	this.init = function(callback){
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
			this.emit('intializedPlatter',true);
		}
		platterWindowResizeEventHandler();
		callback(options);
	}.bind(this);

	/**
	 * create platter html container
	 */
	this.createContainer = function(){
		var platterContainer = document.createElement('div');
		platterContainer.setAttribute('id','_pltrContainer');
		classie.addClass(platterContainer,'_pltr-bottom');
		document.body.appendChild(platterContainer);
		this.emit('platterContainerCreated',platterContainer);

		var platterElementsContainer = document.createElement('div');
		platterElementsContainer.setAttribute('id','_pltr-elementsContainer');
		classie.addClass(platterElementsContainer,'_pltr-right');
		platterElementsContainer.innerHTML='<div id="_pltr-ecmc"><span id="_pltr-ecmc-button">[+]</span></div>';
		platterContainer.appendChild(platterElementsContainer);
		this.emit('platterElementContainerCreated',platterContainer);

		document.getElementById('_pltr-ecmc').addEventListener('click',platterButtonPaneClickEventHandler,false);
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
		platterHTML.innerHTML =options.title+options.openWindowHTML;
		/** add platter tab to tab bar */
		document.querySelector('#_pltrContainer').appendChild(platterHTML);
		this.emit('platterCreated',platterHTML);

		/** create platter pane html */
		var panePanalWrapper = document.createElement('div');
		panePanalWrapper.setAttribute('id',id+'-pane-wrapper');

		function setUpPlatterAttributes(){
			options.platterContentElement.setAttribute('id',id+'-pane');
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

		this.emit('platterCreatedPaneElement',options.platterContentElement);
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
		//console.log('show platter pane')
		var paneSelector = document.getElementById('_pltr-elementsContainer'),
			paneButton = document.getElementById('_pltr-ecmc');
		//console.log('paneSelector.style.width',paneSelector.style.width)

		if(paneSelector.style.width!=='0' || paneSelector.style.width!=='0%'){
			paneSelector.style.width = '50%';
			if(paneButton){
				classie.addClass(paneButton,'_pltr-expanded');
				paneButton.querySelector('span').innerHTML='[ - ]';
			}
			this.emit('openedPlatterPane',true);
		}
		callCallBack(callback);
	};

	/** hide platter pane */
	this.hidePlatterPane = function(){
		var paneSelector = document.getElementById('_pltr-elementsContainer'),
			paneButton = document.getElementById('_pltr-ecmc');

		paneSelector.style.width = '0%';
		if(paneButton){
			classie.removeClass(document.getElementById('_pltr-ecmc'),'_pltr-expanded');
				paneButton.querySelector('span').innerHTML='[+]';
		}
		this.emit('closedPlatterPane',true);
	};

	/**
	 * opens platter in new window
	 * @throws {ERROR} If cannot open new window
	 * @fires eventEmitter event for opened window
	 */
	this.open = function(link,callback){
		var strWindowFeatures = 'menubar=no, location=no, resizable=yes,scrollbars=yes, status=yes, dependent=yes, alwaysRaised=yes ',
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
		var paneElementsContainer = document.getElementById('_pltr-elementsContainer');
		paneElementsContainer.style.height=window.innerHeight+'px';
	}

	/** listen for window resizes */
	window.addEventListener('resize',platterWindowResizeEventHandler, false);

	/** listen for orientation change */
	window.addEventListener('orientationchange', platterWindowResizeEventHandler, false);

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
				this.emit('openedPlatterWindow',true);
			}
			else{
				options.windowObjectReference.focus();
				this.emit('focusedPlatterWindow',true);
			}
		}
		else{
			this.showPlatterPane(function(){
				var elec = document.getElementById('_pltr-elementsContainer');
				// elec.scrollTop = 0;
				elec.scrollTop = elec.scrollTop + domhelper.getPosition(document.getElementById(options.fullIdSelector+'-pane-wrapper')).top;
			});
		}
	}.bind(this);

	var closePlatterWindowEventHandler = function(e){
		var wrapperToInsert = document.getElementById(options.fullIdSelector+'-pane-wrapper');
		wrapperToInsert.appendChild(options.platterContentElement);
		// console.log('closed window');
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
	console.log('teeestie');
};

module.exports = platter;

// If there is a window object, that at least has a document property,
// define linotype
if ( typeof window === 'object' && typeof window.document === 'object' ) {
	window.platter = platter;
}