/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.ScrollSmoothing', ['utils', 'DOMUtils', 'modules.Ticker'], function( utils, DOMUtils, ticker ){
	var App = this;

	var inited = false;
	var needStart = false;
	var sleeping = false;
	var activeState = false;		

	var currentScrolledBy = 0;
	var elasticY = 0;
	var prevElasticY = 0;

	var body;
	var contentWrapper;
	var scrollCreator;
	var contentWrapperStyle;
	var scrollCreatorStyle;

	var smoothPower = 5;

	var transformPrefix = getSupportedTransform();
	var canUseTransforms = transformPrefix != false;
	var force3D_transform = 'translate3d(0px,0px,0px)';
	var useTransform = false;

	var usePEDisabling = true;
	var peDisablingTimeout;
	var peDisablingDelay = 250;
	var peEnabled = true;

	// Fix to prevent scroll position restoring after refresh
	window.onunload = function(){
		window.scrollTo(0,0);
	}

	function getSupportedTransform() {
		var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
		for(var i = 0; i < prefixes.length; i++) {
			if(document.createElement('div').style[prefixes[i]] !== undefined) {
				return prefixes[i];
			}
		}
		return false;
	}
	function createContainer( styles ){
		var element = document.createElement('div');
		var elementsStyle = element.style;
		for( var i in styles ){
			elementsStyle[i] = styles[i];
		}
		return element;
	}
	function wrapContentsTo( owner, wrapTo ){
		while(owner.childNodes.length){
			wrapTo.appendChild( owner.childNodes[0] );
		}
	}
	function setPE( value ){
		contentWrapperStyle.pointerEvents = contentWrapperStyle['-webkit-pointer-events'] = value;
	}
	function disablePE(){
		if(!peEnabled){ return; }
		peEnabled = false;
		setPE('none');
	}
	function enablePE(){
		if(peEnabled){ return; }
		peEnabled = true;
		setPE('');
	}
	function init(){
		inited = true;

		body = document.body;

		function updateScrollParams(){
			if(!activeState){ return; }

			var scrolledBy = Math.max(document.documentElement.scrollTop || 0, body.scrollTop || 0);

			if(scrolledBy != currentScrolledBy){
				currentScrolledBy = scrolledBy;
			}

			if(usePEDisabling){
				disablePE();
				clearTimeout(peDisablingTimeout);
				peDisablingTimeout = setTimeout( enablePE, peDisablingDelay )
			}
		}

		// Add events
		var triggerActions = 'scroll resize wheel mousewheel dommousewheel touchmove';
		DOMUtils.addEventListener(body, triggerActions, updateScrollParams);
		DOMUtils.addEventListener(window, triggerActions, updateScrollParams);

		// Create helper containers
		scrollCreator = createContainer({ position: 'absolute', top: 0, left: 0, width: '1px', height: 0, zIndex: -999 });

		var contentWrapperStyles = { position: 'fixed', top: 0, left: 0, width: '100%' }
		if(canUseTransforms){
			contentWrapperStyles[transformPrefix] = force3D_transform;
		}
		contentWrapper = createContainer(contentWrapperStyles);

		// Cache container styles
		scrollCreatorStyle = scrollCreator.style;
		contentWrapperStyle = contentWrapper.style;

		// Run ticker
		ticker.addListener(function( delta ){
			if(!activeState){ return; }

			elasticY += ( currentScrolledBy - elasticY ) / smoothPower;

			if(Math.abs(elasticY - currentScrolledBy) < 1){
				elasticY = currentScrolledBy;
			}

			scrollCreatorStyle.height = Math.max(contentWrapper.scrollHeight, contentWrapper.offsetHeight) + 'px';
			
			updatePosition();
		});

		updatePosition( true );

		if(needStart){
			start();
		}					
	}

	function updatePosition( forced ){
		if(forced){
			if(useTransform){
				contentWrapperStyle.overflow = '';
				contentWrapperStyle.height = '';
				contentWrapper.scrollTop = 0;
			} else {
				contentWrapperStyle.overflow = 'hidden';
				contentWrapperStyle.height = '100%';
				contentWrapperStyle[transformPrefix] = force3D_transform;
			}
		}
		if(!sleeping){
			if(prevElasticY != elasticY || forced){
				prevElasticY = elasticY;
				if(useTransform){
					contentWrapperStyle[transformPrefix] = force3D_transform + ' translate(0,'+(-elasticY)+'px)';
				} else {
					contentWrapper.scrollTop = elasticY << 0;
				}
			}
		}
	}

	function start(){
		if(!inited){needStart = true; return;}
		if(activeState){ return; }
		activeState = true;

		prevElasticY = elasticY = currentScrolledBy = body.scrollTop;
		
		wrapContentsTo(body, contentWrapper);

		body.appendChild(scrollCreator);
		body.appendChild(contentWrapper);

		updatePosition( true );		
	}
	function stop(){
		if(!inited){needStart = false; return;}
		if(!activeState){ return; }
		activeState = false;

		wrapContentsTo(contentWrapper, body);

		body.removeChild(contentWrapper);
		body.removeChild(scrollCreator);

		enablePE()
	}

	if(utils.isSet(document.body)){
		init();
	} else {
		App.on(App.events.DOM_READY, init);
	}

	function ScrollSmoothing(){};

	ScrollSmoothing.prototype.start = function(){
		start();
		return this;
	}
	ScrollSmoothing.prototype.stop = function(){
		stop();
		return this;
	}
	ScrollSmoothing.prototype.pause = ScrollSmoothing.prototype.sleep = function(){
		sleeping = true;
		return this;
	}
	ScrollSmoothing.prototype.resume = ScrollSmoothing.prototype.wake = function(){
		sleeping = false;
		return this;
	}		
	ScrollSmoothing.prototype.isActive = function(){
		return activeState;
	}
	ScrollSmoothing.prototype.smoothPower = function( value ){
		if(utils.isSet( value )){
			smoothPower = value < 1 ? 1 : value;
		}
		return smoothPower;
	}
	ScrollSmoothing.prototype.useTransform = function( value ){
		if(utils.isSet( value )){
			useTransform = value && canUseTransforms;
			updatePosition( true )
		}
		return useTransform;
	}
	return new ScrollSmoothing();
});