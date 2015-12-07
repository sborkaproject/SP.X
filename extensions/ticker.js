/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
// Ticker
SP.X.extend('modules.Ticker', ['utils'], function( utils ){
	var raf;
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame){
		raf = function( callback ) {
			var currTime = utils.now();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));

			var id = window.setTimeout( function(){
				callback(currTime + timeToCall);
			}, timeToCall);

			lastTime = currTime + timeToCall;
			return id;
		};
 	} else {
 		raf = function( callback ){
 			return window.requestAnimationFrame( callback );
 		}
 	}

 	var activeState = true;
 	var applyArgs = [];
	var listeners = [];
	var prevTime = utils.now();

	function tickHandler( nowTime ){

		var delta = nowTime - prevTime;
		prevTime = nowTime;

		if(activeState){
			applyArgs[0] = delta;

			var totalListeners = listeners.length;
			for(var k=0;k<totalListeners;k++){
				var listener = listeners[k];
				utils.testCallback(listener.handler, applyArgs, listener.context );
			}
		}
		raf( tickHandler );
	}
	raf( tickHandler );

	function Ticker(){};

	Ticker.prototype.addListener = function( handler, context ){
		listeners.push({handler: handler, context:context})
	}
	Ticker.prototype.removeListener = function( handler ){
		var totalListeners = listeners.length;
		for(var k=0;k<totalListeners;k++){
			if(handler === listeners[k].handler){
				listeners.splice(k,1);
				return true;
			}
		}
		return false;
	}
	Ticker.prototype.stop = Ticker.prototype.pause = Ticker.prototype.sleep = function(){
		activeState = false;
		return this;
	}
	Ticker.prototype.start = Ticker.prototype.wake = function(){
		activeState = true;
		return this;
	}
	Ticker.prototype.isActive = function(){
		return activeState;
	}

	return new Ticker();
});