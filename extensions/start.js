/*!
 * SP.X tiny framework
 *
 * Copyright 2015 Sborka Project
 * Code by Hauts: http://hauts.ru/
 *
 * https://github.com/SborkaProject/SP.X 
 */
SP.X.extend('start', function(){
	var App = this;

	var controllerSetted = false;
	var controllerStarted = false;
	var currentControllerPath = null;

	App.currentController = null;

	var START = 'start';
	App.events.register(START);

	return function start( objectPath, argumentsArray ){
		if(controllerStarted){
			App.error('Start controller already started!');
			return;
		}
		if(controllerSetted){
			App.warn('Start controller already defined! Overwriting to \'' + objectPath + '\'');
		}
		controllerSetted = true;
		currentControllerPath = objectPath;

		App.on(App.events.DOM_READY, function( e ){
			App.resolve( currentControllerPath, function( controller ){
				if(!controllerStarted){
					App.currentController = new controller( argumentsArray );
					App.dispatch(START);
					controllerStarted = true;
				}
			})
		})
	}
});