/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.ImageProcessor', ['utils'], function( utils ){
	var App = this;

	function ImageProcessor(){};

	ImageProcessor.prototype.manage = function( container, collectHandler, progressHandler, completeHandler, deepMode ){
		var testProps = {
			deep: {
				props: ['backgroundImage', 'listStyleImage', 'borderImage', 'borderCornerImage', 'cursor'],
				attrs: ['srcset']
			},
			quick: {
				props: ['backgroundImage'],
				attrs: ['srcset']
			}
		}
		var matchUrl = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
		var imageDatas = [];
		var props = deepMode ? testProps.deep : testProps.quick;
		var hasImageProperties = props.props;
		var hasImageAttributes = props.attrs;
		var totalImageProperties = hasImageProperties.length;
		var totalImageAttributes = hasImageAttributes.length;
		var allElements = container.getElementsByTagName('*');
		var totalElements = allElements.length;

		for(var k=0;k<totalElements; k++){
			var element = allElements[k];
			if (element.tagName.toLowerCase() == 'img') {
				var src = element.getAttribute('src');
				if (src && src != '') {
					imageDatas.push({ src: src, element: element });
				}
			}
			for (var i=0; i<totalImageProperties; i++) {
				var property = hasImageProperties[i],
					propertyValue = element.style[property];
				if (propertyValue) {
					var match;
					while (match = matchUrl.exec(propertyValue)) {
						imageDatas.push({ src: match[2], element: element });
					}
				}
			}
			if (deepMode) {
				for (var i=0; i<totalImageAttributes; i++) {
					var attribute = hasImageAttributes[i],
						attributeValue = element.getAttribute(attribute);
					if (attributeValue && attributeValue != '') {
						var attributeValues = attributeValue.split(','),
							totalAttributeValues = attributeValues.length;
						for (var j=0; j<totalAttributeValues; j++) {
							imageDatas.push({ src: utils.trim(attributeValue[j]).split(' ')[0], element: element });
						}
					}
				}
			}
		}

		var imageDatasLength = imageDatas.length;
		var imagedElements = [];

		if (imageDatasLength == 0) {
			utils.testCallback( completeHandler, [{elements: []}] );
		} else {

			var imageDatasLoaded = 0;

			for (var k=0; k<imageDatasLength; k++) {
				var image = new Image();
					image.imageData = imageDatas[k];

				// TODO: Fix IE behavior with img.complete
				image.onload = function(e) {
					imageDatasLoaded++;
					utils.testCallback(progressHandler, [{
						success: true,
						progress: imageDatasLoaded / imageDatasLength,
						total: imageDatasLength,
						loaded: imageDatasLoaded,
						element: this.imageData.element
					}])
					if (imageDatasLoaded == imageDatasLength) {
						utils.testCallback( completeHandler, [{elements: imagedElements}] );
					}
					this.onload = this.onerror = null;
				}
				image.onerror = image.onabort = function(e) {
					imageDatasLoaded++;
					utils.testCallback(progressHandler, [{
						success: false,
						progress: imageDatasLoaded / imageDatasLength,
						total: imageDatasLength,
						loaded: imageDatasLoaded,
						element: this.imageData.element
					}])
					if (imageDatasLoaded == imageDatasLength) {
						utils.testCallback( completeHandler, [{elements: imagedElements}] );
					}
					this.onload = this.onerror = null;
				}						
				image.src = image.imageData.src;

				imagedElements.push(image.imageData.element);
			}
		}
		utils.testCallback( collectHandler, [imagedElements] );
	}
	return new ImageProcessor();
});