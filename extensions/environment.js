/*!
* SP.X tiny framework extension
*
* Copyright 2015 Sborka Project
* Code by Hauts: http://hauts.ru/
*
* https://github.com/SborkaProject/SP.X 
*/
SP.X.extend('modules.Environment', ['utils'], function( utils ){
	var App = this;

	function collectData(){
		var unknown = '-';

		//browser
		var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
		var browser = navigator.appName;
		var version = '' + parseFloat(navigator.appVersion);
		var majorVersion = parseInt(navigator.appVersion, 10);
		var nameOffset, verOffset, ix;

		if ((verOffset = nAgt.indexOf('Opera')) != -1) {
			// Opera
			browser = 'Opera', version = nAgt.substring(verOffset + 6);
			if ((verOffset = nAgt.indexOf('Version')) != -1) {
				version = nAgt.substring(verOffset + 8);
			}
		} else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
			// MSIE
			browser = 'Microsoft Internet Explorer', version = nAgt.substring(verOffset + 5);
		} else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
			// Chrome
			browser = 'Chrome', version = nAgt.substring(verOffset + 7);
		} else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
			// Safari
			browser = 'Safari', version = nAgt.substring(verOffset + 7);
			if ((verOffset = nAgt.indexOf('Version')) != -1) {
				version = nAgt.substring(verOffset + 8);
			}
		} else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
			// Firefox
			browser = 'Firefox', version = nAgt.substring(verOffset + 8);
		} else if (nAgt.indexOf('Trident/') != -1) {
			// MSIE 11+
			browser = 'Microsoft Internet Explorer', version = nAgt.substring(nAgt.indexOf('rv:') + 3);
		} else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
			// Other browsers
			browser = nAgt.substring(nameOffset, verOffset), version = nAgt.substring(verOffset + 1);
			if (browser.toLowerCase() == browser.toUpperCase()) {
				browser = navigator.appName;
			}
		}
		// trim the version string
		if ((ix = version.indexOf(';')) != -1){ version = version.substring(0, ix); }
		if ((ix = version.indexOf(' ')) != -1){ version = version.substring(0, ix); }
		if ((ix = version.indexOf(')')) != -1){ version = version.substring(0, ix); }

		majorVersion = parseInt('' + version, 10);
		if (isNaN(majorVersion)) {
			version = '' + parseFloat(navigator.appVersion), majorVersion = parseInt(navigator.appVersion, 10);
		}

		// mobile version
		var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		// system
		var os = unknown;
		var clientStrings = [
			{s:'Windows 10',			r:/(Windows 10.0|Windows NT 10.0)/},
			{s:'Windows 8.1',			r:/(Windows 8.1|Windows NT 6.3)/},
			{s:'Windows 8',				r:/(Windows 8|Windows NT 6.2)/},
			{s:'Windows 7',				r:/(Windows 7|Windows NT 6.1)/},
			{s:'Windows Vista',			r:/Windows NT 6.0/},
			{s:'Windows Server 2003',	r:/Windows NT 5.2/},
			{s:'Windows XP',			r:/(Windows NT 5.1|Windows XP)/},
			{s:'Windows 2000',			r:/(Windows NT 5.0|Windows 2000)/},
			{s:'Windows ME',			r:/(Win 9x 4.90|Windows ME)/},
			{s:'Windows 98',			r:/(Windows 98|Win98)/},
			{s:'Windows 95',			r:/(Windows 95|Win95|Windows_95)/},
			{s:'Windows NT 4.0',		r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
			{s:'Windows CE',			r:/Windows CE/},
			{s:'Windows 3.11',			r:/Win16/},
			{s:'Android',				r:/Android/},
			{s:'Open BSD',				r:/OpenBSD/},
			{s:'Sun OS',				r:/SunOS/},
			{s:'Linux',					r:/(Linux|X11)/},
			{s:'iOS',					r:/(iPhone|iPad|iPod)/},
			{s:'Mac OS X',				r:/Mac OS X/},
			{s:'Mac OS',				r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
			{s:'QNX',					r:/QNX/},
			{s:'UNIX',					r:/UNIX/},
			{s:'BeOS',					r:/BeOS/},
			{s:'OS/2',					r:/OS\/2/},
			{s:'Search Bot',			r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
		];
		for (var i in clientStrings) {
			var cs = clientStrings[i];
			if (cs.r.test(nAgt)) {
				os = cs.s;
				break;
			}
		}
		if (/Windows/.test(os)) { os = 'Windows'; }

		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		var isFirefox = typeof InstallTrigger !== 'undefined';
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		var isChrome = !!window.chrome && !isOpera;
		var isIE = /*@cc_on!@*/false || !!document.documentMode;

		return {
			browser: browser,
			browserVersion: version,
			mobile: mobile,
			os: os,
			isOpera:isOpera,
			isFirefox:isFirefox,
			isSafari:isSafari,
			isChrome:isChrome,
			isIE:isIE
		}
	}

	return new App.utils.copy( collectData(), function Environment(){} )
})