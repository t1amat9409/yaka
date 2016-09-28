// File:src/web-droid.js

/**
 * @author itxCodex
 */

var YAKA = { REVISION: 'wd.0.0.beta' };

/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * Angular. It can be called as follows:
 *
 * var exampleMinErr = minErr('example');
 * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
 *
 * The above creates an instance of minErr in the example namespace. The
 * resulting error will have a namespaced error code of example.one.  The
 * resulting error will replace {0} with the value of foo, and {1} with the
 * value of bar. The object is not restricted in the number of arguments it can
 * take.
 *
 * If fewer arguments are specified than necessary for interpolation, the extra
 * interpolation markers will be preserved in the final string.
 *
 * Since data will be parsed statically during a build step, some restrictions
 * are applied with respect to how minErr instances are created and called.
 * Instances should have names of the form namespaceMinErr for a minErr created
 * using minErr('namespace') . Error codes, namespaces and template strings
 * should all be static strings, not variables or general expressions.
 *
 * @param {string} module The namespace to use for the new minErr instance.
 * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
 *   error from returned function, for cases when a particular type of error is useful.
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */

if ( typeof define === 'function' && define.amd ) {

		define( 'yaka', YAKA );

} else if ( 'undefined' !== typeof exports && 'undefined' !== typeof module ) {

		module.exports = YAKA;

}


// polyfills

if ( self.requestAnimationFrame === undefined || self.cancelAnimationFrame === undefined ) {

	// Missing in Android stock browser.

	( function () {

		var lastTime = 0;
		var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

		for ( var x = 0; x < vendors.length && ! self.requestAnimationFrame; ++ x ) {

			self.requestAnimationFrame = self[ vendors[ x ] + 'RequestAnimationFrame' ];
			self.cancelAnimationFrame = self[ vendors[ x ] + 'CancelAnimationFrame' ] || self[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

		}

		if ( self.requestAnimationFrame === undefined && self.setTimeout !== undefined ) {

			self.requestAnimationFrame = function ( callback ) {

				var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
				var id = self.setTimeout( function () {

					callback( currTime + timeToCall );

				}, timeToCall );
				lastTime = currTime + timeToCall;
				return id;

			};

		}

		if ( self.cancelAnimationFrame === undefined && self.clearTimeout !== undefined ) {

			self.cancelAnimationFrame = function ( id ) {

				self.clearTimeout( id );

			};

		}

	}() );

}

if ( Math.sign === undefined ) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

	Math.sign = function ( x ) {

		return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;

	};

}

if ( Function.prototype.name === undefined && Object.defineProperty !== undefined ) {

	// Missing in IE9-11.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

	Object.defineProperty( Function.prototype, 'name', {

		get: function () {

			return this.toString().match( /^\s*function\s*(\S*)\s*\(/ )[ 1 ];

		}

	} );

}

// Document.querySelectorAll method
// http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed
// Needed for: IE7-
if (!document.querySelectorAll) {
  document.querySelectorAll = function(selectors) {
    var style = document.createElement('style'), elements = [], element;
    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];

    style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);

    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute('x-qsa');
      elements.push(element);
    }
    document._qsa = null;
    return elements;
  };
}

// Document.querySelector method
// Needed for: IE7-
if (!document.querySelector) {
  document.querySelector = function(selectors) {
    var elements = document.querySelectorAll(selectors);
    return (elements.length) ? elements[0] : null;
  };
}

// Document.getElementsByClassName method
// Needed for: IE8-
if (!document.getElementsByClassName) {
  document.getElementsByClassName = function(classNames) {
    classNames = String(classNames).replace(/^|\s+/g, '.');
    return document.querySelectorAll(classNames);
  };
}
/**
 *	@description
 *	@link : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *		Request method uses Promises together with the old XMLHttpRequest to communicate with the backend.
 *		It is also bundled with all header methods like "get","post","put","delete".
 *
 *	**************************************************************************************************************************
 *	****																																																									****
 *	****																											USAGE																												****
 *	****																																																									****
 *	**************************************************************************************************************************
 *
 *	var url = 'https://developer.mozilla.org/en-US/search.json';
 *
 *	@param : declare params, an object to parse to the server.
 *
 *	**************************************************************************************************************************
 *	****																																																									****
 *	****																											USAGE																												****
 *	****																																																									****
 *	**************************************************************************************************************************
 *	var params = {
 *	  'param1' : 'value1',
 *	  'param2'     : 'value2'
 *	};
 *
 *	**Putting all together**
 *	var callbackObj = {
 *	  success: function(data) {
 *	    console.log(1, 'success', JSON.parse(data));
 *	  },
 *	  error: function(data) {
 *	    console.log(2, 'error', JSON.parse(data));
 *	  }
 *	};
 *	End instantiation
 *	Run request
 *	YAKA.Request(url)
 *	.get(params)
 *	.then(callbackObj.success)
 *	.catch(callbackObj.error);
 *
 *	Executes the method call but an alternative way (1) to handle Promise Reject case
 *	YAKA.Request(url)
 *	.get(params)
 *	.then(callbackObj.success, callbackObj.error);
 **/

YAKA.Request = function(){
	// A small example of object
  var core = {

    // Method that performs the ajax request
    ajax: function (method, url, args) {

      // Creating a promise
      var promise = new Promise( function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var request = new XMLHttpRequest();
        var uri = url;

        if (args && (method === 'POST' || method === 'PUT')) {
          uri += '?';
          var argcount = 0;
          for (var key in args) {
            if (args.hasOwnProperty(key)) {
              if (argcount++) {
                uri += '&';
              }
              uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
            }
          }
        }

        request.open(method, uri);
        request.send();

        request.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            resolve(this.response);
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(this.statusText);
          }
        };
        request.onerror = function () {
          reject(this.statusText);
        };
      });

      // Return the promise
      return promise;
    }
  };

  // Adapter pattern
  return {
    'get': function(args) {
      return core.ajax('GET', url, args);
    },
    'post': function(args) {
      return core.ajax('POST', url, args);
    },
    'put': function(args) {
      return core.ajax('PUT', url, args);
    },
    'delete': function(args) {
      return core.ajax('DELETE', url, args);
    }
  };
}

YAKA.ImageLoader = function(url){
	//https://github.com/mdn/promises-test/blob/gh-pages/index.html
	// Create new promise with the Promise() constructor;
  // This has as its argument a function
  // with two parameters, resolve and reject
  return new Promise(function(resolve, reject) {
    // Standard XHR to load an image
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'blob';
    // When the request loads, check whether it was successful
    request.onload = function() {
      if (request.status === 200) {
      // If successful, resolve the promise by passing back the request response
        resolve(request.response);
      } else {
      // If it fails, reject the promise with a error message
        reject(Error('Image didn\'t load successfully; error code:' + request.statusText));
      }
    };
    request.onerror = function() {
    // Also deal with the case when the entire request fails to begin with
    // This is probably a network error, so reject the promise with an appropriate message
        reject(Error('There was a network error.'));
    };
    // Send the request
    request.send();
  });
}

YAKA.Dom = function(selector){
	//
}
