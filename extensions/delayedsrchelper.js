/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.DelayedSRCHelper', ['utils', 'DOMUtils', 'modules.DOMChangeHelper'], function( utils, DOMUtils, DOMChangeHelper ){
	var App = this;

	var PROCESSORS = [
		{ attributeName: 'data-src',			method: manageImageElement },
		{ attributeName: 'data-background-src',	method: manageBackgroundElement }
	];

	var delayStep = 25;

	var allowWork = false;

	var i_StartMethod;
	var i_EndMethod;
	var i_ErrorMethod;

	var b_StartMethod;
	var b_EndMethod;
	var b_ErrorMethod;	

	// Build-in effects
	var hasJQuery = !!(window.jQuery && window.jQuery.fn);
	var hasTweenLite = !!(window.TweenLite && window.TweenLite.to);

	if( hasJQuery || hasTweenLite ){
		i_StartMethod = b_StartMethod = function( element ){
			element.style.opacity = 0;
			element.style.visibility = 'hidden';
		}
		i_EndMethod = b_EndMethod = i_ErrorMethod = b_ErrorMethod = function( element ){
			element.style.visibility = '';
			if(hasJQuery){
				element.style.opacity = '';
				$(element).hide().fadeIn();
			} else {
				TweenLite.to(element, 0.5, {alpha: 1});
			}
		}
	}

	function applySRC(element, image, src, backgroundMode, loadingEndMethod, loadingErrorMethod){
		DOMUtils.addEventListener(image, 'load', function(){
			if(backgroundMode){
				element.style.backgroundImage = 'url(' + src + ')';
			}
			utils.testCallback(loadingEndMethod, [element]);
		})
		DOMUtils.addEventListener(image, 'error', function(){
			utils.testCallback(loadingErrorMethod, [element]);
		})
		image.src = src;		
	}

	function manageImageElement( image, src, delay ){
		setTimeout(function(){
			applySRC(image, image, src, false, i_EndMethod, i_ErrorMethod);
		}, delay);

		utils.testCallback(i_StartMethod, [image]);
	}
	function manageBackgroundElement( element, src, delay ){
		var testImage = new Image();

		setTimeout(function(){
			applySRC(element, testImage, src, true, b_EndMethod, b_ErrorMethod);
		}, delay);

		utils.testCallback(b_StartMethod, [element]);
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
	DelayedSRCHelper.prototype = {
		update : function(){
			process();
		},
		setImageLoadingEffects : function( loadingStartMethod, loadingEndMethod, loadingErrorMethod ){
			i_StartMethod  = loadingStartMethod;
			i_EndMethod    = loadingEndMethod;
			i_ErrorMethod  = loadingErrorMethod;
		},
		setBackgroundLoadingEffects : function( loadingStartMethod, loadingEndMethod, loadingErrorMethod ){
			b_StartMethod  = loadingStartMethod;
			b_EndMethod    = loadingEndMethod;
			b_ErrorMethod  = loadingErrorMethod;
		},
		clearImageLoadingEffects: function(){
			i_StartMethod  = i_EndMethod = i_ErrorMethod = null;
		},
		clearBackgroundLoadingEffects: function(){
			b_StartMethod  = b_EndMethod = b_ErrorMethod = null;
		},
		clearLoadingEffects: function(){
			i_StartMethod  = i_EndMethod = i_ErrorMethod = b_StartMethod  = b_EndMethod = b_ErrorMethod = null;
		}
	}
	App.on(App.events.DOM_READY, function(){
		allowWork = true;

		process();
		
		DOMChangeHelper.addListener(process);
	})		
	return new DelayedSRCHelper();
});