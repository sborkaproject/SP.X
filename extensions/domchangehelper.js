/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.DOMChangeHelper',['utils', 'DOMUtils', 'modules.Ticker'], function( utils, DOMUtils, ticker ){
	var USE_TICKER = false;
	var wasChanged = false;

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	if(MutationObserver){
		var observer = new MutationObserver(function(mutations, observer){
			if(activeState){
				if( mutations[0].addedNodes.length || mutations[0].removedNodes.length ){
					wasChanged = true;
					changeHandler();
				}
			}
		});
		observer.observe( document, { childList:true, subtree:true });
	} else {
		DOMUtils.addEventListener(document, 'DOMNodeInserted', function(){
			wasChanged = true;
			if(activeState){
				changeHandler();
			}
		});		
	}
	var cachedHTML = '';
	var needUpdate = false;
	ticker.addListener(function(){
		if(needUpdate){
			needUpdate = false;
			callListeners()
		}
		if(USE_TICKER){
			var html = document.documentElement.innerHTML;
			if(html!=cachedHTML){
				wasChanged = true;
				cachedHTML = html;
				if(activeState){
					changeHandler();
				}
			}
		}
	})		
	function callListeners(){
		var totalListeners = listeners.length;
		for(var k=0;k<totalListeners;k++){
			var listener = listeners[k];
			utils.testCallback(listener.handler, [], listener.context );
		}	
	}
	function changeHandler(){
		wasChanged = false;
		needUpdate = true;
	}
	var listeners = [];
	var activeState = true;

	function DOMChangeHelper(){}
	DOMChangeHelper.prototype.addListener = function( handler, context ){
		listeners.push({handler: handler, context:context})
	}
	DOMChangeHelper.prototype.removeListener = function( handler ){
		var totalListeners = listeners.length;
		for(var k=0;k<totalListeners;k++){
			if(handler === listeners[k].handler){
				listeners.splice(k,1);
				return true;
			}
		}
		return false;
	}
	DOMChangeHelper.prototype.stop = DOMChangeHelper.prototype.pause = DOMChangeHelper.prototype.sleep = function(){
		activeState = false;
		return this;
	}
	DOMChangeHelper.prototype.start = DOMChangeHelper.prototype.wake = function(){
		activeState = true;
		if(wasChanged){
			changeHandler();
		}
		return this;
	}
	DOMChangeHelper.prototype.isActive = function(){
		return activeState;
	}
	DOMChangeHelper.prototype.update = function(){
		changeHandler();
		return this;
	}		
	return new DOMChangeHelper();
})