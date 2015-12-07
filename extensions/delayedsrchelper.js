/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.DelayedSRCHelper', ['utils', 'DOMUtils'], function( utils, DOMUtils ){
	var App = this;

	var PROCESSORS = [
		{ attributeName: 'data-src',			method: manageImageElement },
		{ attributeName: 'data-background-src',	method: manageBackgroundElement }
	]
	var delayStep = 25;

	var allowWork = false;

	function manageImageElement( element, src, delay ){
		element.onload = element.onerror = function(){
			TweenMax.fromTo(element, 0.5, {alpha: 0}, {alpha:1, delay: Math.random() / 5});
		}
		if(delay){
			setTimeout(function(){
				element.src = src;
			}, delay)
		} else {
			element.src = src;
		}
		TweenMax.set( element, {alpha: 0});
	}
	function manageBackgroundElement( element, src, delay ){
		var testImage = new Image();
		testImage.onload = testImage.onerror = function(){
			element.style.backgroundImage = 'url("' + src + '")';
			TweenMax.fromTo(element, 0.5, {alpha: 0.5}, {alpha:1, delay: Math.random() / 5});
		}
		if(delay){
			setTimeout(function(){
				testImage.src = src;
			}, delay)
		} else {
			testImage.src = src;
		}
		TweenMax.set( element, {alpha: 0});
	}
	function process(){
		if(!allowWork){
			return;
		}
		var totalProcessors = PROCESSORS.length;
		var delay = 0;
		for(var k=0;k<totalProcessors; k++){
			var processor = PROCESSORS[k];
			var attributeName = processor.attributeName;
			var elements = DOMUtils.getElementsByAttributeName(attributeName);
			var totalElements = elements.length;
			for(var j=0;j<totalElements;j++){
				var element = elements[j];
				var attributeValue = element.getAttribute(attributeName);
				if( utils.isSet(attributeValue) && attributeValue != ''){
					element.removeAttribute(attributeName);
					processor.method(element, attributeValue, delay);
					delay += delayStep;
				}
			}
		}			
	}

	function DelayedSRCHelper(){}
	DelayedSRCHelper.prototype.update = function(){
		process();
	}

	App.on(App.events.DOM_READY, function(){
		allowWork = true;
		process();
	})		
	return new DelayedSRCHelper();
});