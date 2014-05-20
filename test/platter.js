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

describe('Module configuration', function () {
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

		it('should return configuration object', function () {
			platter = new this.browser.window.platter();
			expect(platter.config()).to.be.a("object");
		});

		it('should allow you to overwrite default options',function(){
			platter = new this.browser.window.platter({idSelector:"pl1"});
			platter.config().idSelector.should.equal("pl1");
		});

		it('should emit initialization event',function(done){
			platter = new this.browser.window.platter();

			platter.on("intializedPlatter",function(status){
				status.should.equal(true);
				done();
			});

			platter.init();
		});

		it('should throw Error for duplicate ID selector',function(){
			var duplicateDomElement = this.browser.document.createElement('div');

			duplicateDomElement.setAttribute('id','document_pltr');
			this.browser.document.body.appendChild(duplicateDomElement);
			platter = new this.browser.window.platter({idSelector:'document'});
			try{
				expect(function(){
					platter.init();
				}).to.throw('idSelector must be unique');
					platter.init();

			}
			catch(e){
				expect(e.message).to.equal("idSelector must be unique");
			}
		});
	});
});