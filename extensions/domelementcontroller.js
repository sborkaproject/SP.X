/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.DOMElementController', ['utils', 'DOMUtils', 'modules.DOMChangeHelper'], function( utils, DOMUtils, DOMChangeHelper ){
	var App = this;

	var CONTROLLER_ATTRIBUTE_NAME = 'data-controller';

	var cachedElements = [];
	var watchMode = true;

	function manageElement( element ){
		var totalCachedElements = cachedElements.length;
		for(var k=0;k<totalCachedElements;k++){
			if(cachedElements[k] === element ){
				return;
			}
		}
		var controller = element.getAttribute(CONTROLLER_ATTRIBUTE_NAME);

		element.removeAttribute(CONTROLLER_ATTRIBUTE_NAME);
		if(controller == '' || !utils.isSet(controller)){ return; }

		if(utils.isSet(element.controller)){
			// How to remove current controller?
		}

		App.resolve(controller, function( controller ){
			var newController = new controller( element );
			element.controller = newController;
		})			
	}

	function process(){
		var elements = DOMUtils.getElementsByAttributeName(CONTROLLER_ATTRIBUTE_NAME);
		var totalElements = elements.length;
		for(var k=0;k<totalElements;k++){
			manageElement( elements[k] );
		}
	}

	DOMChangeHelper.addListener(function(){
		if(watchMode){
			process();
		}
	})

	function DOMElementController(){}
	DOMElementController.prototype.update = function(){
		process();
		return this;
	}
	DOMElementController.prototype.watch = DOMElementController.prototype.wake = function( element ){
		watchMode = true;
		process();
		return this;
	}
	DOMElementController.prototype.unwatch = DOMElementController.prototype.sleep = function( element ){
		watchMode = false;
		return this;
	}

	var instance = new DOMElementController();
	App.on(App.events.DOM_READY, function(){
		instance.update();
	})
	return instance;
});