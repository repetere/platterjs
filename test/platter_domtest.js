/*
 * platter
 * http://github.com/typesettin/platter
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var should = require('chai').should(),
	expect = require('chai').expect,
	Platter = require('../lib/platter'),
	Browser = require("zombie"),
	path = require("path");

describe('DOM Manipulation', function () {
	describe('Initializing Page Settings', function () {
		var platter;
		before(function(){
			this.browser = new Browser();
			this.browser.on("error",function(error){
				console.error(error);
			});
		});

		before(function(done){
			this.browser.visit("file://"+path.resolve(__dirname,"../public/index.html"),done);
		});

		it('should create a container for platters if one doesnt exist',function(){
			//remove all containers
			var element = this.browser.document.getElementById("_pltrContainer");
			if(element){
				element.parentNode.removeChild(element);
			}
			expect(this.browser.document.querySelector('#_pltrContainer')).to.equal(null);
			platter = new this.browser.window.platter({resize:false});
			platter.init();
			expect(this.browser.document.querySelector('#_pltrContainer')).to.be.a('object');
		});

		it('should add a new platter inside the platter container',function(){
			platter = new this.browser.window.platter({idSelector:'testplatter'});
			platter.init();
			var platter2 = new this.browser.window.platter({idSelector:'testplatter2'});
			platter2.init();
			var platterContainer = this.browser.document.querySelector('#_pltrContainer'),
				allPlatters = platterContainer.querySelectorAll('._pltr-item');

			expect(allPlatters.length).to.deep.equal(3);
		});
	});
});