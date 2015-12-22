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
	var CONTROLLER_DATA_ATTRIBUTE_NAME = 'data-controller-data';

	var cachedElements = [];
	var aliases = [];
	var watchMode = true;

	function getAttributeData( element, attributeName ){
		var controllerDataString = element.getAttribute(attributeName);
		var controllerData;
		if(controllerDataString && controllerDataString != ''){
			try{
				if(controllerDataString.substr(0,1) != '({'){
					controllerDataString = '({' + controllerDataString +'})';
				}
				controllerData = eval(controllerDataString);
			} catch(e){
				App.warn('Could not extract controller data: ' + controllerDataString);
				controllerData = {};
			}
		}
		return controllerData;
	}

	function manageElement( element, controllerPath, controllerData ){
		var totalCachedElements = cachedElements.length;
		for(var k=0;k<totalCachedElements;k++){
			if(cachedElements[k] === element ){
				return;
			}
		}
		App.resolve(controllerPath, function( controller ){
			element.controller = new controller( element, controllerData );
		})
	}

	function process(){
		var elements = DOMUtils.getElementsByAttributeName(CONTROLLER_ATTRIBUTE_NAME);
		var totalElements = elements.length;
		for(var k=0;k<totalElements;k++){
			var element = elements[k];
			var controllerPath = element.getAttribute(CONTROLLER_ATTRIBUTE_NAME);
			element.removeAttribute(CONTROLLER_ATTRIBUTE_NAME);
			if(utils.isSet(controllerPath) && controllerPath != ''){
				manageElement( element, controllerPath, getAttributeData( element, CONTROLLER_DATA_ATTRIBUTE_NAME ) );
				element.removeAttribute(CONTROLLER_DATA_ATTRIBUTE_NAME);
			}
		};

		var totalAliases = aliases.length;
		for(var k=0; k<totalAliases; k++){
			var aliasData = aliases[k];
			var aliasName = aliasData[0];
			var aliasControllerPath = aliasData[1];
			var elements = DOMUtils.getElementsByAttributeName(aliasName);
			var totalElements = elements.length;
			for(var j=0; j<totalElements; j++){
				var element = elements[j];
				manageElement( element, aliasControllerPath, getAttributeData( element, aliasName ) );
				element.removeAttribute(aliasName);
			}
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

	DOMElementController.prototype.registerAlias = function( attrName, controllerPath ){
		aliases.push([attrName, controllerPath]);
		return this.update();
	}

	var instance = new DOMElementController();
	App.on(App.events.DOM_READY, function(){
		instance.update();
	})
	return instance;
});