/*!
 * SP.X tiny framework
 *
 * Copyright 2015 Sborka Project
 * Code by Hauts: http://hauts.ru/
 *
 * https://github.com/SborkaProject/SP.X 
 */
SP.X.extend('DOMUtils', ['utils'], function( utils ){
	function addSingleEventListener(element, eventName, handler){
		if (element.addEventListener) {
			element.addEventListener(eventName, handler);
		} else {
			element.attachEvent('on' + eventName, function(e){
				handler.apply(element,[e]);
			});
		}
	}

	var tempDiv = document.createElement('div');

	function DOMUtils(){};
	DOMUtils.prototype = {
		addEventListener : function(element, eventName, handler){
			if(utils.isArray(eventName) || eventName.split(' ').length > 1 || eventName.split(',').length > 1){
				var eventNames = eventName.split(' ').join('|').split(',').join('|').split('|');
				var totalEvents = eventNames.length;
				for(var k=0; k<totalEvents; k++){
					addSingleEventListener(element, eventNames[k], handler );
				}
			} else {
				addSingleEventListener(element, eventName, handler);
			}
		},
		addClass : function(element, className){
			if (element.classList){
				element.classList.add(className);
			} else {
				element.className += SPACE + className;
			}
		},
		removeClass : function(element, className){
			if (element.classList){
				element.classList.remove(className);
			} else{
				element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(SPACE).join('|') + '(\\b|$)', 'gi'), SPACE);
			}
		},
		injectCSS: function( cssText ){
			try{
				var styleElement = document.createElement('style');
					styleElement.type = 'text/css';

				if (styleElement.styleSheet) {
					styleElement.styleSheet.cssText = cssText;
				} else {
					styleElement.appendChild(document.createTextNode(cssText));
				}
				document.getElementsByTagName('head')[0].appendChild(styleElement);

				return true;
			} catch( e ){
				return false;
			}
		},
		getElementsByAttributeName: function(attributeName){
			var matchingElements = [];
			var allElements = document.getElementsByTagName('*');
			var totalElements = allElements.length;
			for (var k = 0; k<totalElements; k++){
				var element = allElements[k];
				if (element.getAttribute(attributeName) !== null){
					matchingElements.push(element)
				}
			}
			return matchingElements;
		},
		createFromHTML: function( html ){
			tempDiv.innerHTML = html;
			var result = tempDiv.childNodes;
			if(result.length > 0){
				tempDiv.innerHTML = '<div>' + html + '<div/>'
				result = tempDiv.childNodes[0];
			}
			tempDiv.innerHTML = '';
			return result;
		}
	}

	return new DOMUtils();
});