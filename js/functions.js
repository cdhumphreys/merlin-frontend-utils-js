"use strict";

/**
 * Modifies Element.prototype.matches
 * Vendor prefixes
 */
Element.prototype.matches = Element.prototype.matchesSelector ||
                            Element.prototype.matches ||
                            Element.prototype.msMatchesSelector ||
                            Element.prototype.webkitMatchesSelector ||
                            Element.prototype.mozMatchesSelector ||
                            Element.prototype.oMatchesSelector;

/**
 * @module functions
 */

import { supportBoxModel } from "./detect";

/**
 * Adds a class to an element
 * @param {HTMLNode} el
 * @param {String} cls
 */
export function addClass( el, cls ){
    if( el.classList ) return el.classList.add( cls );
    el.className += " " + cls;
}

/**
 * Adds an event to an element
 * @param {HTMLNode}   el
 * @param {String}   type
 * @param {Function} fn
 */
export function addEvent( el, type, fn ){
    if( document.addEventListener ) return el.addEventListener( type, fn, false );
    return el.attachEvent( "on" + type, fn );
}

/**
 * Adds an event that will fire once and then remove itself
 * @param {HTMLNode}   el
 * @param {String}   type
 * @param {Function} fn
 */
export function addEventOnce( el, type, fn ){
    function _addEventOnce(){
        fn.apply( this, arguments );
        removeEvent( el, type, _addEventOnce );
    }
    return addEvent( el, type, _addEventOnce );
}

/**
 * Adds html to a node
 * @param {HTMLElement} node
 */
export function addHtml( node ){
    var tmp = document.createElement("div");
    return function addHtml_inner( html ){
        tmp.innerHTML = html;
        while(tmp.children.length > 0){
            node.appendChild( tmp.children[0] );
        }
        tmp.innerHTML = "";
    };
}

/**
 * Basic ajax function
 * @param  {Object} options
 * @return {Promise}
 */
export function ajax( options ){
    return new Promise(function( resolve, reject ){

        var request = new XMLHttpRequest();
        request.onreadystatechange = function( e ){
            if( request.readyState === 4 ){
                request.onreadystatechange = null;
                if( request.status === 200 ){
                    resolve({
                        "event": e,
                        "request": request
                    });
                } else {
                    reject({
                        "event": e,
                        "request": request
                    });
                }
            }
        };

        request.open( "GET", options.url );
        request.send( null );

    });
}

/**
 * Clamps a value to the min and max. Also set up to allow currying.
 * @param  {Number} min
 * @param  {Number} max
 * @param  {Number} value1
 * @return {Number/Function}
 */
export function clamp( min, max, value1 ){
    if( arguments.length === 3 ){
        if( value1 < min ) return min;
        if( value1 > max ) return max;
        return value1;
    }
    return function clamp_inner( value2 ){
        if( value2 < min ) return min;
        if( value2 > max ) return max;
        return value2;
    };
}

/**
 * Creates an object for events
 * @param  {String} type      The type of event
 * @param  {Object} target    The thing that emitted the event
 * @param  {Object} eventData Some data
 * @return {Object}
 */
export function createEventTemplate(type, target, eventData){
    var base = {
        'bubbles': false,
        'target': target,
        'timeStamp': Date.now(),
        'type': type
    };
    if(eventData){
        for(var key in eventData){
            if(hasOwnProperty(eventData, key)){
                base[key] = eventData[key];
            }
        }
    }
    return base;
}

/**
 * Debounce function, allows one function to be ran `wait` milliseconds after.
 * @param  {Function} fn
 * @param  {Number}   wait      Number of milliseconds
 * @param  {Object}   scope
 * @param  {Boolean}   immediate
 * @return {Function}
 */
export function debounce( fn, wait, scope, immediate ){
    var timeout;

    return function debounce_inner() {
        var context = scope || this;
        var args = arguments;
        var callNow = immediate && !timeout;

        var later = function() {
            timeout = null;
            if (!immediate) fn.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) fn.apply(context, args);
    };
}

/**
 * Creates a function that will delegate events to a selector
 * @param  {String}   selector
 * @param  {Function} fn
 * @param  {*}   ctx
 * @return {Function}
 */
export function delegate( selector, fn, ctx ){
    return function delegateHandler( e ){
        var target = getEventTarget( e );
        var context = null;
        if( !target ) return;
        if( !target.matches( selector ) ){
            target = getParent( target, selector );
        }
        if( target ){
            if( ctx ){
                context = ctx;
            } else {
                context = target;
            }
            e.delegateTarget = target;
            fn.apply( context, arguments );
        }
    };
}

/**
 * Exits fullscreen mode for the element
 * @param  {HTMLNode} el
 */
export function exitFullscreen( el ) {
    if (el.exitFullscreen) {
        el.exitFullscreen();
    } else if (el.msExitFullscreen) {
        el.msExitFullscreen();
    } else if (el.mozCancelFullScreen) {
        el.mozCancelFullScreen();
    } else if (el.webkitExitFullscreen) {
        el.webkitExitFullscreen();
    }
}

/**
 * Fires an event on an element
 * @param  {HTMLElement} el
 * @param  {String} type       The type of event
 * @param  {Boolean} bubble     Should the event bubble?
 * @param  {Boolean} cancelable Should the event be cancelable?
 * @return {Boolean}            Was the event cancelled?
 */
export function fireEvent(el, type, bubble, cancelable){
    var e = null;
    if(document.createEventObject){
        e = document.createEventObject();
        return el.fireEvent('on' + type, e);
    }
    var _bubble = isDefined(bubble) ? bubble : false;
    var _cancelable = isDefined(cancelable) ? cancelable : true;
    e = document.createEvent("HTMLEvents");
    e.initEvent(type, _bubble, _cancelable);
    return !el.dispatchEvent(e);
}

/**
 * Loop over a collection and shift the item from the collection
 * @param  {Array}   collection
 * @param  {Function} fn
 */
export function forEachShift( collection, fn ){
    if( collection.length === 0 ) return;
    var item = null;
    while( ( item = collection.shift() ) ){
        fn( item );
    }
    item = null;
}

export function getBoundingClientRect( el ){
    if( el.getBoundingClientRect ){
        return el.getBoundingClientRect();
    }
    var height = el.innerHeight;
    var width = el.innerWidth;
    return {
        "bottom": height,
        "height": height,
        "left": 0,
        "right": width,
        "top": 0,
        "width": width
    };
}

/**
 * Gets the elements offset. Based off of jquerys implementation
 * @param  {HTMLNode} el
 * @return {Object}
 */
export function getElementOffset( el ){

    var elementBox = getBoundingClientRect( el );
    var doc = el.ownerDocument || el.document;
    var body = doc.body;
    var docElement = doc.documentElement;

    var clientTop = docElement.clientTop || body.clientTop || 0;
    var clientLeft = docElement.clientLeft || body.clientLeft || 0;

    var extraY = ( window.pageYOffset || supportBoxModel && docElement.scrollTop || body.scrollTop ) -
                  clientTop;
    var extraX = ( window.pageXOffset || supportBoxModel && docElement.scrollLeft || body.scrollLeft ) -
                  clientLeft;

    var top = elementBox.top + extraY;
    var left = elementBox.left + extraX;
    var bottom = elementBox.bottom + extraY;
    var right = elementBox.right + extraX;

    return {
        "bottom": bottom,
        "height": elementBox.height,
        "left": left,
        "right": right,
        "top": top,
        "width": elementBox.width
    };
}

/**
 * Gets the event target
 * @param  {Object} e The event information
 * @return {*}   The target of the event
 */
export function getEventTarget( e ) {
  var eve = e || window.event;
  return eve.target || eve.srcElement;
}

/**
 * Gets the iframe element based on the window
 * @param  {Window} window
 * @return {HTMLNode/Boolean}
 */
export function getIframeFromWindow( window ){
    var frame;
    try {
        frame = ( window.frameElement || window.ownerDocument.defaultView.frameElement );
    } catch( e ){
        return false;
    }
    return frame;
}

/**
 * Gets the parent element matching the selector. If it doesn't match, returns
 * nothing
 * @param  {HTMLNode} el
 * @param  {String} selector
 * @return {HTMLNode/Boolean}
 */
export function getParent( el, selector ){
    if( el !== document && el.matches( selector ) ) return el;
    var parent = getParentUntil( el, selector );
    if( parent !== document && parent.matches( selector ) ) return parent;
    return false;
}

/**
 * Gets the previous element matching the selector. If it doesn't match,
 * returns false
 * @param  {HTMLElement} el
 * @param  {String} selector
 * @return {HTMLElement/Boolean}
 */
export function getPrevious( el, selector ){
    if( el !== document && el.matches( selector ) ) return el;
    var previous = getPreviousElementUntil( el, selector );
    if( previous !== document && previous.matches( selector ) ) return previous;
    return false;
}

/**
 * Gets the parent till the selector or the root.
 * @param  {HTMLNode} el
 * @param  {String} selector
 * @return {Object}
 */
export function getParentUntil( el, selector ){
    var parent = el.parentNode;
    do {
        if( parent.matches( selector ) ) return parent;
    } while( (parent = parent.parentNode) && parent.nodeType === 1 );
    return parent;
}

/**
 * Gets the previous element till the selector or the root
 * @param  {HTMLNode} el
 * @param  {String} selector
 * @return {Object}
 */
export function getPreviousElementUntil( el, selector ){
    var previous = el.previousElementSibling;
    do {
        if( previous.matches( selector ) ) return previous;
    } while( (previous = previous.previousElementSibling) && previous.nodeType === 1 );
    return previous;
}

/**
 * Gets the scroll left of the element
 * @param  {HTMLNode/Window} el
 * @return {Number}
 */
export function getScrollLeft( el ){
    if( el && el !== window ){
        return el.scrollLeft;
    }
    return getWindowScrollLeft();
}

/**
 * Gets the scroll top of the element
 * @param  {HTMLNode/Window} el
 * @return {Number}
 */
export function getScrollTop( el ){
    if( el && el !== window ){
        return el.scrollTop;
    }
    return getWindowScrollTop();
}

/**
 * Creates a key based on the brand abbreviation
 * @param  {String} abbr
 * @return {String}
 */
export function getNamespaceKey(abbr){
    return 'cnd_' + abbr;
}

/**
 * Gets the scrollleft of the window
 * @return {Number}
 */
export function getWindowScrollLeft(){
    return ( window.pageXOffset || document.documentElement.scrollLeft ) -
           ( document.documentElement.clientLeft || 0 );
}

/**
 * Gets the scrolltop of the window
 * @return {Number}
 */
export function getWindowScrollTop(){
    return ( window.pageYOffset || document.documentElement.scrollTop ) -
           ( document.documentElement.clientTop || 0 );
}

/**
 * Checks if the element has a class
 * @param  {HTMLNode}  el
 * @param  {String}  cls
 * @return {Boolean}
 */
export function hasClass( el, cls ) {
    if( el.classList ) return el.classList.contains( cls );
    return !!el.className.match( new RegExp( "(\\s|^)" + cls + "(\\s|$)" ) );
}

/**
 * hasOwnProperty that prevents contamination from the object being tested
 * @param  {Object}  obj
 * @param  {String}  key
 * @return {Boolean}
 */
export function hasOwnProperty( obj, key ){
    return Object.prototype.hasOwnProperty.call( obj, key );
}

/**
 * Inserts the child element before the reference
 * @param  {HTMLElement} child
 * @param  {HTMLElement} ref
 * @return {HTMLElement}       The child
 */
export function insertBefore(child, ref){
    return ref.parentNode.insertBefore(child, ref);
}

/**
 * Checks if the placement is in an article slot
 * @param  {String}  placement
 * @return {Boolean}
 */
export function isArticleAdSlot( placement ){
    return placement === "article-side" || placement === "article-infinite";
}

/**
 * Checks if a value is defined
 * @param  {*}  value
 * @return {Boolean}
 */
export function isDefined( value ){
    return value !== null && value !== undefined;
}

/**
 * Checks if the value is an empty string
 * @param  {*}  value
 * @return {Boolean}
 */
export function isEmptyString( value ){
    return typeof value === "string" && value === "";
}

/**
 * Checks if the placement is a header slot
 * @param  {String}  placement
 * @return {Boolean}
 */
export function isHeaderAdSlot( placement ){
    return placement === "nav-above";
}

/**
 * Checks if the placement is a splash slot
 * @param  {String}  placement
 * @return {Boolean}
 */
export function isSplashAdSlot( placement ){
    return placement === "tag-inside" || placement === "tag-infinite";
}

/**
 * Checks if win is a window element
 * @param  {*} win
 * @return {Boolean}
 */
export function isWindow( win ){
    return win.self === win;
}

/**
 * Loads a script file into the page
 * @param  {String} url
 * @param  {Object} options
 * @return {Promise}
 */
export function loadScript( url, options ){
    return new Promise(function loadScript_promise( resolve, reject ){
        var node = null;
        if( options && options.node ){
            node = options.node;
        } else {
            node = document.head || document.getElementsByTagName("head")[0];
        }
        var script = document.createElement("script");
        script.async = true;
        script.type = "text/javascript";
        script.src = url;
        script.onload = function(){
            this.onload = this.onerror = null;
            resolve( script );
        };
        script.onerror = function(){
            this.onload = this.onerror = null;
            reject( new Error( "Error loading script: " + url ) );
        };
        node.appendChild( script );
    });
}

/**
 * Loads any social scripts. Includes twitter, facebook, vine and instagram
 * @return {Promise}
 */
export function loadSocialScripts(){

    var twitterPromise = null;
    var vinePromise = null;
    var facebookPromise = null;
    var instagramPromise = null;

    // Twitter
    if( !("twttr" in window) ){
        twitterPromise = loadScript( "//platform.twitter.com/widgets.js" );
    } else {
        twitterPromise = Promise.resolve();
    }

    // Vine
    if( !("VINE_EMBEDS" in window) ){
        vinePromise = loadScript( "https://platform.vine.co/static/scripts/embed.js" );
    } else {
        vinePromise = Promise.resolve();
    }

    // Facebook
    if( !("FB" in window) ){
        facebookPromise = loadScript( "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.3" );
    } else {
        facebookPromise = Promise.resolve();
    }

    // Instagram
    if( !("instgrm" in window) ){
        instagramPromise = loadScript( "//platform.instagram.com/en_US/embeds.js" );
    } else {
        instagramPromise = Promise.resolve();
    }

    return Promise.all([ twitterPromise, vinePromise, facebookPromise,
        instagramPromise ]);
}

/**
 * Inverts the value
 * @param  {*} value
 * @return {Boolean}
 */
export function not( value ){
    if( typeof value === "function" ){
        return function not_inner(){
            var len = arguments.length;
            var args = new Array(len);
            while( len-- ){ args[len] = arguments[len]; }
            return !(value.apply(null, args));
        };
    }
    return !value;
}

/**
 * Runs loadFn once the page has loaded
 * @param  {Function} loadFn
 */
export function onPageLoad( loadFn ){

    // If the page has already loaded, just run the function
    if( document.readyState === "complete" ){
        loadFn();

    // Page hasn't loaded so store the loadFn and apply a listener if we
    // haven't already
    } else {
        onPageLoad._fns.push( loadFn );
        if( onPageLoad._fns.length === 1 ){
            addEventOnce( window, "load", onPageLoadListener );
        }
    }

    function onPageLoadListener(){
        var fn = null;
        while( ( fn = onPageLoad._fns.shift() ) ){
            fn();
        }
    }

}
onPageLoad._fns = [];

/**
 * Runs readyFn once the page is ready
 * @param  {Function} readyFn
 */
export function onPageReady( readyFn ){

    // If the page has already loaded, just run the function
    if( document.readyState === "complete" ||
        document.readyState === "interactive" ){
        readyFn();

    // Page hasn't loaded so store the readyFn and apply a listener if we
    // haven't already
    } else {
        onPageReady._fns.push( readyFn );
        if( onPageReady._fns.length === 1 ){
            addEventOnce( window, "DOMContentLoaded", onPageReadyListener );
        }
    }

    function onPageReadyListener(){
        var fn = null;
        while( ( fn = onPageReady._fns.shift() ) ){
            fn();
        }
    }

}
onPageReady._fns = [];

/**
 * Pads a number
 * @param  {Number} value
 * @param  {Number} width
 * @param  {String} chr
 * @return {String}
 */
export function padValue( value, width, chr ) {
    var character = chr || '0';
    var str = value + '';
    if( str.length >= width ){
        return str;
    }
    return ( new Array( width - str.length + 1 ) ).join( character ) + str;
}

/**
 * Generates a random id
 * @return {String}
 */
export function randomUUID(){
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === "x" ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * Removes a class from an element
 * @param  {HTMLNode} el
 * @param  {String} cls
 */
export function removeClass( el, cls ){
    if( el.classList ) return el.classList.remove( cls );
    if( !hasClass( el, cls ) ) return;
    var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    el.className = el.className.replace( reg, " " );
}

/**
 * Removes the element from the tree
 * @param  {HTMLElement} el
 */
export function removeElement( el ){
    if( !el.parentNode ) return;
    el.parentNode.removeChild( el );
}

/**
 * Removes an event from an element
 * @param  {HTMLNode}   el
 * @param  {String}   type
 * @param  {Function} fn
 */
export function removeEvent( el, type, fn ){
    if( document.removeEventListener ) return el.removeEventListener( type, fn );
    return el.detachEvent( "on" + type, fn );
}

/**
 * Throttles an event being fired by the threshold
 * @param  {Function} fn
 * @param  {Number}   threshhold Milliseconds to throttle by
 * @param  {Object}   scope
 * @return {Function}
 */
export function throttle( fn, threshhold, scope ) {
    if( threshhold === undefined ) threshhold = 250;
    var last;
    var deferTimer;
    return function throttle_inner() {
        var context = scope || this;

        var now = (new Date()).getTime(),
            args = arguments;
        if (last && now < last + threshhold) {
            clearTimeout( deferTimer );
            deferTimer = setTimeout( function throttle() {
                last = now;
                fn.apply( context, args );
            }, threshhold );
        } else {
            last = now;
            fn.apply( context, args );
        }
    };
}

/**
 * Converts a value to a boolean
 * @param  {*} value
 * @return {Boolean}
 */
export function toBoolean( value ){
    if( !isDefined( value ) || value === "" ) return false;
    if( value === "true" ) return true;
    return !!value;
}

/**
 * Toggles a class on an element
 * @param  {HTMLNode} el
 * @param  {String} cls
 */
export function toggleClass( el, cls ){
    if( hasClass( el, cls ) ) return removeClass( el, cls );
    addClass( el, cls );
}

/**
 * Unescapes a value from jinja
 * @param  {*} value
 * @return {*}
 */
export function unescapeJinjaValue(value){
    var tmp = document.createElement("div");
    tmp.innerHTML = value;
    var unescaped = tmp.textContent;
    tmp = null;
    return unescaped;
}
