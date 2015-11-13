/*!
 * SP.X tiny framework
 *
 * Copyright 2015 Sborka Project
 * Code by Hauts: http://hauts.com
 *
 * https://github.com/SborkaProject/SP.X 
 */
;(function( factory ){
	'use strict';

	var SP = factory.SP = factory.SP || new (function SP(){})();

	if( SP.X && SP.X.create ){ // SP.X already defined
		return;
	}

	var VERSION = '1.005 [13.11.2015]';
	var DUMMY = function(){}

	var DEFAULT_NAME_PREFIX = 'SiteController_';

	var USE_EVAL = true;

	var DEFINED = 'defined';
	var RESOLVED = 'resolved';
	var DOM_READY = 'domReady';
	var WINDOW_LOADED = 'windowLoaded';

	var ON = 'on';
	var OFF = 'off';

	var USE_LOG = true;
	var LOG_TESTED = false;
	var LOG_PREFIX = '\tSP.X: ';
	var LOG_STYLE_PREFIX = '%c';
	var LOG_TEXT_STYLE = 'font-size:11px;font-style:italic;'
	var LOG_STYLES = {
		LOG:	'color:#999999;' + LOG_TEXT_STYLE,
		ERROR:	'color:#FF0000;' + LOG_TEXT_STYLE,
		WARN:	'color:#FF7700;' + LOG_TEXT_STYLE,
		MARK:	'color:#009900;' + LOG_TEXT_STYLE
	}
	var LOG_CAN_USE_STYLING = !!(typeof window !== 'undefined' && window.chrome);

	var internals = {
		nameCounter: 0,
		getName: function(){
			return DEFAULT_NAME_PREFIX + (++internals.nameCounter);
		},
		instances: [],
		cachedExtensions: [],
		registerInstance: function(instance){
			internals.instances.push(instance);
			internals.updateInstances();
		},
		addExtension: function( method, applyArguments ){
			internals.cachedExtensions.push({
				instances: [],
				method: method,
				applyArguments: applyArguments
			});
			internals.updateInstances();
		},
		updateInstances: function(){
			var totalExtensions = internals.cachedExtensions.length;
			var totalInstances = internals.instances.length;
			for(var k=0;k<totalExtensions;k++){
				var extensionData = internals.cachedExtensions[k];
				for(var j=0;j<totalInstances;j++){
					var instance = internals.instances[j];
					internals.testAddInstanceExtenstion(instance, extensionData);
				}
			}
		},
		testAddInstanceExtenstion: function(instance, extensionData){
			var totalExtensionInstances = extensionData.instances.length;
			for(var k=0;k<totalExtensionInstances; k++){
				if(instance === extensionData.instances[k]){
					return;
				}
			}
			extensionData.instances.push(instance);
			var method = instance[extensionData.method];
			method.apply( instance, extensionData.applyArguments );
		},
		sayHello: function(){
			if(!USE_LOG){ return; };
			try{
				if(LOG_CAN_USE_STYLING){
					var symbols = ['☭', '★', '✪', '✫', '✌', '♚', '♛', '✍', '☢'];
					var symbol = symbols[Math.floor(Math.random() * symbols.length)];
					var styled = function(size, color){ return 'font-size:' + size + 'px;color:' + color + ';'; }				
					window.console.log('%c' + symbol, styled(48, '#DC143C'));
					window.console.log('%cSborka Project', styled(39, '#DC143C'));
					window.console.log('%cSP.X tiny framework v' + VERSION + '\n\n', styled(14, '#11161F'));
				} else {
					window.console.log('Sborka Project');
					window.console.log('SP.X tiny framework v' + VERSION + '\n\n');
				}
				LOG_TESTED = true;
			} catch( e ){
				USE_LOG = false;
			}
		},
		toUnderscore: function(string){
			return string.replace(/([A-Z])/g, function($1){return '_'+$1.toLowerCase();});
		},
		bindDOMReady: function (handler) {
			if (document.addEventListener) {
				document.addEventListener('DOMContentLoaded', handler, false);
			} else if (document.attachEvent) {
				document.attachEvent('onreadystatechange', function() {
					if (document.readyState === 'complete'){ handler(); }
				});
			} else {
				internals.bindWindowLoad(handler);
			}
			return internals;
		},
		bindWindowLoad: function(handler) {
			var oldOnLoadHandler = window.onload;
			if ( typeof window.onload == 'function' ) {
				window.onload = function() {
					if (oldOnLoadHandler) { oldOnLoadHandler(); }
					handler();
				}
			} else {
				window.onload = handler;
			}
			return internals;
		},
		createNamedObject: function( name, props ){
			var result = USE_EVAL ? eval('new function ' + name+'(){}') : {};
			for(var i in props){
				result[i] = props[i];
			}
			return result;
		}			
	}

	function X( name, debug, skipExportToGlobal ){ return X.create( name, debug, skipExportToGlobal ); }

	// Utils
	X.Utils = internals.createNamedObject('Utils', {
		trim: function( string ){
			return string.replace(/^\s+|\s+$/g, '');
		},
		isSet: function( object ){
			return typeof object != 'undefined' && object != null
		},
		isArray: function( object ){
			return Object.prototype.toString.call(object) === '[object Array]';
		},
		isArrayLike: function( object ){
			if(X.Utils.isArray(object)){ return true; }
			if(X.Utils.isObject(object) && X.Utils.isNumber(object.length) ){ return true; }
			return false;
		},
		isNumber: function( object ){
			return typeof object == 'number' && !isNaN(object);
		},
		isFunction: function( object ){
			return typeof object == 'function';
		},
		isObject: function( object ){
			return typeof object == 'object';
		},
		isString: function( object ){
			return typeof object == 'string';
		},
		createNamedObject: function( name, props ){
			return internals.createNamedObject( name, props );
		},
		testCallback: function( callback, applyArguments, context ){
			if(X.Utils.isFunction(callback)){
				return callback.apply(context, applyArguments);
			}
			return null;
		},
		copy: function( from, to ){
			for(var i in from){ to[i] = from[i]; }
			return to;
		},
		delegate: function( context, method ){
			return function delegated(){
				for(var argumentsLength = arguments.length, args = new Array(argumentsLength), k=0; k<argumentsLength; k++){
					args[k] = arguments[k];
				}
				return method.apply( context, args );
			}
		},
		now: function(){
			var P = 'performance';
			if (window[P] && window[P]['now']) {
				X.Utils.now = function(){ return window.performance.now() }
			} else {
				X.Utils.now = function(){ return +(new Date()) }
			}
			return X.Utils.now();
		},
		extractArrayValues: function( string ){
			if(X.Utils.isArrayLike(string)){
				return string;
			}
			var DELIMETER = '\\';

			string = string.replace('  ', ' ');
			var testArray = string.split(' ').join(DELIMETER);
				testArray = testArray.split(',').join(DELIMETER);
				testArray = testArray.split(DELIMETER);

			var resultArray = [];
			var testArrayLength = testArray.length;
			for(var k=0; k<testArrayLength; k++){
				var value = testArray[k];
				if(value && value != ''){
					resultArray.push( value );
				}
			}
			testArray = null;
			return resultArray;
		}
	});

	// Logging
	X.LogEngine = internals.createNamedObject('LogEngine');
	X.LogEngine.create = function( instance, name, debugPropOwner ){
		name = name || '';

		var utils = X.Utils;

		function nativeLog(message, styles){
			LOG_CAN_USE_STYLING	? window.console.log(LOG_STYLE_PREFIX + LOG_PREFIX + name + message, styles) : window.console.log(name + message);
		}
		function log( message, style ){
			if(debugPropOwner.debug && USE_LOG){
				style = utils.isSet( style ) ? style : LOG_STYLES.LOG;
				if(LOG_TESTED){
					nativeLog(message, style);
				} else {
					try{
						nativeLog(message, style);
						LOG_TESTED = true;
					} catch(e){
						USE_LOG = false;
					}
				}
			}
			return instance;
		}

		instance.log = function( message ){ return log(message, LOG_STYLES.LOG ); }
		instance.error = function( message ){ return log(message, LOG_STYLES.ERROR ); }
		instance.warn = function( message ){ return log(message, LOG_STYLES.WARN ); }
		instance.mark = function( message ){ return log(message, LOG_STYLES.MARK ); }

		return instance;
	}	

	// Events
	X.EventsEngine = internals.createNamedObject('EventsEngine');
	X.EventsEngine.create = function( instance, allowLogging ){

		var log		= allowLogging && instance.log		|| DUMMY;
		var error	= allowLogging && instance.error	|| DUMMY;
		var warn	= allowLogging && instance.warn		|| DUMMY;
		var mark	= allowLogging && instance.mark		|| DUMMY;

		var utils = X.Utils;

		var eventListeners = {};

		instance.events = utils.createNamedObject('events');

		function setEventsEnabledState(eventTypes, isEnabled){
			eventTypes = utils.extractArrayValues(eventTypes);
			for(var k=0, totalEventTypes = eventTypes.length;k<totalEventTypes;k++){
				var eventType = eventTypes[k];
				
				log('Disabling event listeners for event type \'' + eventType + '\'');
				
				var listeners = eventListeners[eventType];
				if(!utils.isSet(listeners)){
					listeners = eventListeners[eventType] = [];
				}
				listeners.disabled = isEnabled;
			}
		}
		instance.enableEvents = function(eventTypes){
			setEventsEnabledState(eventTypes, true);
			return instance;
		}
		instance.disableEvents = function(eventTypes){
			setEventsEnabledState(eventTypes, false);
			return instance;
		}
		instance.addEventListener = instance.on = instance.bind = function( eventTypes, handler, context ){
			eventTypes = utils.extractArrayValues(eventTypes);
			var eventData = { handler: handler, context : utils.isSet(context) ? context : instance };
			for(var k=0, totalEventTypes = eventTypes.length;k<totalEventTypes;k++){
				var eventType = eventTypes[k];
				
				log('Add event listener for event type \'' + eventType + '\'');

				var listeners = eventListeners[eventType];
				if(!utils.isSet(listeners)){
					listeners = eventListeners[eventType] = [];
				}
				listeners.push(eventData);
			}
			return instance;
		}
		instance.addOnceEventListener = instance.onOnce = instance.once = instance.bindOnce = function( eventTypes, handler, context ){
			return instance.on(eventTypes, function( e ){
				handler.apply(context, [e]);
				instance.off(eventTypes, handler);
			})
		}
		instance.removeEventListener = instance.off = instance.unbind = function( eventType, handler ){
			eventTypes = utils.extractArrayValues(eventTypes);
			for(var k=0, totalEventTypes = eventTypes.length;k<totalEventTypes;k++){
				var eventType = eventTypes[k];

				log('Remove event listener for event type \'' + eventType + '\'');

				var listeners = eventListeners[eventType];
				if(utils.isSet(listeners)){
					for(var j=0, totalListeners = listeners.length; j<totalListeners; j++){
						var listener = listeners[j];
						if(utils.isSet(listener)){
							if(listener.handler === handler){
								listeners.splice(j,1);
							}
						}
					}
				}				
			}
			return instance;
		}
		instance.dispatch = function( eventTypes, eventData ){
			eventTypes = utils.extractArrayValues(eventTypes);
			for(var k=0, totalEventTypes = eventTypes.length;k<totalEventTypes;k++){
				var eventType = eventTypes[k];

				var eventInstance = utils.copy(eventData, utils.createNamedObject('Event'));
					eventInstance.type = eventType;
				var applyArguments = [ eventInstance ];

				log('Dispatch event type \'' + eventType + '\'');
				
				var listeners = eventListeners[eventType];
				if(utils.isSet(listeners)){
					for(var j=0, totalListeners = listeners.length; j<totalListeners; j++){
						var listener = listeners[j];
						if(utils.isSet(listener)){
							utils.testCallback( listener.handler, applyArguments, listener.context );
						}
					}
				}				
			}
			return instance;
		}
		instance.events.register = function( eventNames, createEventMethods ){
			eventNames = utils.extractArrayValues(eventNames);
			var totalEventNames = eventNames.length;

			var s = totalEventNames > 1 ? 's' : '';
			
			log('Register event constant' + s + ' for type' + s + ' \'' + eventNames.join('\', \'') + '\'');

			for(var k=0;k<totalEventNames;k++){
				var eventValue = eventNames[k];
				var eventName = internals.toUnderscore( eventValue ).toUpperCase();
				instance.events[eventName] = eventValue;

				if(createEventMethods){
					var methodName = eventValue.substr(0,1).toUpperCase() + eventValue.substr(1);
					instance.events[ON + methodName] = function( handler, context ){
						return instance.on( eventValue, handler, context );
					};
					instance.events[OFF + methodName] = function( handler ){
						return instance.off( eventValue, handler );
					}
				}
			}
			return instance;
		}

		return instance;
	}

	// Define / Resolves
	X.DefineResolveEngine = internals.createNamedObject('DefineResolveEngine');
	X.DefineResolveEngine.create = function( instance, allowLogging ){

		var log		= allowLogging && instance.log		|| DUMMY;
		var error	= allowLogging && instance.error	|| DUMMY;
		var warn	= allowLogging && instance.warn		|| DUMMY;
		var mark	= allowLogging && instance.mark		|| DUMMY;

		var dispatch = instance.dispatch || DUMMY;
		var on = instance.on || DUMMY;

		var utils = X.Utils;

		var emptyDefines = [];
		var emptyResolves = [];
		var allResolves = []
		var allDefines = [];
		var lastDefinedObjectPath = '';

		function testResolveHandlers(){
			emptyResolves = [];

			var totalResolves = allResolves.length,
				totalDefines = allDefines.length;

			for(var k=0;k<totalResolves;k++){
				var testResolveData = allResolves[k];
				if(testResolveData && !testResolveData.resolved){
					var emptyDependencies = [];

					var dependencies = testResolveData.dependencies,
						totalDependencies = dependencies.length,
						totalResolved = 0,
						results = [];

					for(var j=0;j<totalDependencies;j++){
						var dependency = dependencies[j];
						var founded = false;
						for(var i=0; i<totalDefines; i++){
							var defineData = allDefines[i];
							if(defineData.defined){
								if(defineData.objectPath == dependency){
									totalResolved++;
									results.push(defineData.result);
									founded = true;
								}
							}
						}
						if(!founded){
							emptyDependencies.push(dependency);
						}
					}
					if(totalResolved == totalDependencies){
						testResolveData.resolved = true;

						mark('Launching resolve for \'' + dependencies.join('\', \'') + '\'');

						utils.testCallback( testResolveData.handler, results, testResolveData.context );
						
						dispatch(RESOLVED, { data: testResolveData.result } );

						allResolves.splice(k,1);
						k-=1;

					} else {
						emptyResolves.push({
							emptyDependencies: emptyDependencies
						})
					}
				}
			}
		}

		function testResolveDefines(){
			emptyDefines = [];
			var totalDefines = allDefines.length;
			for(var k=0; k<totalDefines; k++){
				var testDefineData = allDefines[k];

				if(!testDefineData.defined){
					var emptyDependencies = [];

					var definedDependenciesCount = 0,
						dependencies = testDefineData.dependencies,
						totalDependencies = dependencies.length,
						totalDefines = allDefines.length,
						results = [];

					for(var j=0; j<totalDependencies; j++){
						var dependencyObjectPath = dependencies[j];
						var founded = false;
						for(var i=0; i<totalDefines; i++){
							var defineData = allDefines[i],
								definedObjectPath = defineData.objectPath;
							if(defineData.defined){
								if(definedObjectPath == dependencyObjectPath){
									definedDependenciesCount++;
									results.push(defineData.result);
									founded = true;
								}
							}
						}
						if(!founded){
							emptyDependencies.push(dependencyObjectPath);
						}
					}

					if(definedDependenciesCount == totalDependencies){
						testDefineData.defined = true;
						
						mark('Resolved definition for \'' + testDefineData.objectPath + '\'');

						if(testDefineData.targetPath[testDefineData.objectName]){
							error(testDefineData.objectPath + ' already defined!');
						}

						var defineResult = utils.testCallback( testDefineData.handler, results, instance );
						
						if(!utils.isSet(defineResult)){
							warn('Define handler for ' + testDefineData.objectPath + ' does not return anything');
						}

						testDefineData.result = testDefineData.targetPath[testDefineData.objectName] = defineResult;
						
						dispatch(DEFINED, { data: testDefineData.result } );

						testResolveHandlers();
						testResolveDefines();
					} else {
						emptyDefines.push({
							objectPath : testDefineData.objectPath,
							emptyDependencies : emptyDependencies
						})
					}

				}
			}
		}

		instance.define = function( objectPath, dependencies, handler ){
			if( !utils.isString(objectPath) ){
				return error('No objectPath passed to define!')
			}

			lastDefinedObjectPath = objectPath;
			var objectPathArray = objectPath.split('.'),
				objectName = objectPathArray.pop();

			if( objectName == '' ){
				return error('define must have objectPath (objectName) argument!')
			}

			if( utils.isFunction(dependencies) ){
				handler = dependencies;
				dependencies = [];
			}

			if( !utils.isSet(handler) ){
				return error('No handler to define ' + objectPath + '!');
			}

			var pathArrayLength = objectPathArray.length,
				targetPath = instance;

			for (var k = 0; k<pathArrayLength; k++) {
				var name = objectPathArray[k];
				if(name != ''){
					targetPath[name] = targetPath = targetPath[name] || utils.createNamedObject( name );
				}
			}

			log('Added definition for \'' + objectPath + '\'');
			
			allDefines.push({
				defined: false,
				objectPath: objectPath,
				targetPath: targetPath,
				objectName: objectName,
				dependencies: dependencies,
				handler: handler
			});
			
			testResolveDefines();

			return instance;
		}
		instance.defineOn = function(eventType, objectPath, dependencies, handler){
			log('Added definition on event type \'' + eventType + '\' for \'' + objectPath + '\'');
			
			on(eventType, function( e ){
				instance.define(objectPath, dependencies, handler);
			})
			
			return instance;
		}
		instance.resolve = function(dependencies, handler, context){
			if(utils.isFunction(dependencies)){
				context = handler;
				handler = dependencies;
				if(lastDefinedObjectPath){
					dependencies = [lastDefinedObjectPath];
				} else {
					// Will not resolve null dependencies
					warn('No dependencies for resolve');
					return;
				}
			}
			
			if(!utils.isArray(dependencies)){ dependencies = [dependencies]; }
			
			allResolves.push({
				resolved: false,
				dependencies: dependencies,
				handler: handler,
				context: utils.isSet(context) ? context : instance
			});
			
			log('Added resolve handler to \'' + dependencies.join('\', \'') + '\'');

			testResolveHandlers();

			return instance;
		}
		instance.isDefined = function( dependencies ){
			if(!utils.isArray(dependencies)){ dependencies = [dependencies]; }
			
			var totalDependencies = dependencies.length;
			var totalDefines = allDefines.length;
			var totalDefined = 0;
			
			for(var k=0; k<totalDefines; k++){
				var defineData = allDefines[k];
				if(defineData.defined){
					for(var j=0;j<totalDependencies;j++){
						var dependency = dependencies[j];
						if(dependency == defineData.objectPath){
							totalDefined++;
							if(totalDefined == totalDependencies){
								return true;
							}
						}
					}
				}
			}
			return false;
		}

		instance.debugDefines = function(){
			var totalEmptyDefines = emptyDefines.length;
			if(totalEmptyDefines){
				warn('Empty definitions:');
				for(var k=0;k<totalEmptyDefines;k++){
					var emptyDefine = emptyDefines[k];
					log(emptyDefine.objectPath)
					log('#' + (k+1) + '\t' + emptyDefine.emptyDependencies.join(', '))
				}
			} else {
				mark('All definitions ok');
			}
			var totalEmptyResolves = emptyResolves.length;
			if(totalEmptyResolves){
				warn('Empty resolves:');
				for(var k=0;k<totalEmptyResolves;k++){
					var emptyResolve = emptyResolves[k];
					log('#' + (k+1) + '\t' + emptyResolve.emptyDependencies.join(', '))
				}
			} else {
				mark('All resolves ok');
			}
			return { emptyDefines: emptyDefines, emptyResolves: emptyResolves }
		}
		return instance;
	}

	// Core
	X.create = function( name, debug, skipExportToGlobal ){
		name = name || internals.getName();
		skipExportToGlobal = !!skipExportToGlobal;

		var utils = X.Utils;

		var debugState = { debug : !!debug }

		var instance = utils.createNamedObject( name, {
			debug : function( value ){
				if( utils.isSet(value) ){
					debugState.debug = !!value;
					this.mark('Set debug mode ' + (debugState.debug ? ON : OFF));
				}
				return debugState.debug;
			},
			toggleDebug : function(){
				return this.debug(!this.debug());
			}
		} );

		X.LogEngine.create(instance, '['+name+'] ', debugState);

		if(debugState.debug){
			internals.sayHello();

			var markOutput = 'Creating instance \'' + name + '\': debug mode ';
				markOutput += (debugState.debug ? ON : OFF) + ' & ';
				markOutput += (skipExportToGlobal ? 'skip export' : 'adding') + ' to global context';

			instance.mark(markOutput);
		}

		var allowEventsLogging = true;
		var allowDefineResolvesLogging = true;
		X.EventsEngine.create( instance, allowEventsLogging ).events.register([RESOLVED, DEFINED, DOM_READY, WINDOW_LOADED], true);
		X.DefineResolveEngine.create( instance, allowDefineResolvesLogging ).define('utils', function(){ return X.Utils });

		internals.bindDOMReady(function(){
			instance.log('New state: DOM_READY');
			instance.dispatch(DOM_READY);

		}).bindWindowLoad(function(){
			instance.log('New state: WINDOW_LOADED');
			instance.dispatch(WINDOW_LOADED);
		});

		if(!skipExportToGlobal){
			if( utils.isSet(factory[name]) ){
				instance.log( name + ' already defined: skipping export to global scope' );
			} else {
				instance.mark( name + ' added to global scope' )
				factory[name] = instance;
			}
		}

		internals.registerInstance( instance );
		return instance;
	}
	// Extend
	X.extend = function( objectPath, dependencies, factory ){
		internals.addExtension('define', [objectPath, dependencies, factory] );
	}

	// Exports
	SP.X = X;
	SP.X.Version = VERSION;
})(this);