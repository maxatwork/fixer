/**
 * @author Maxim Vasiliev
 * Date: 30.08.11
 * Time: 17:28
 */

/**
 * Fixes table headers etc on top of browser window if scrolled out.
 * 
 * @param container Container selector (i.e. 'table')
 * @param fixed Fixed element selector (i.e. 'thead tr')
 * @param options Options (now className is only option)
 */
fixer = (function(global){

	"use strict";

	var defaults = {
		className: 'fixed'
	};

	function Fixer(container, fixed, options)
	{
		this.container = container;
		this.fixed = fixed;

		this.settings = {};

		for(var key in defaults)
		{
			this.settings[key] = options && typeof options[key] != 'undefined' ? options[key] : defaults[key];
		}

		this.fixedClone = createFixedClone(this.fixed, this.settings.className);

		this.checkSize = checkSize.bind(this);
		this.checkPosition = checkPosition.bind(this);

		addEventListener(global, 'scroll', this.checkPosition, false);
		addEventListener(global, 'resize', this.checkSize, false);

		this.checkSize();
		this.checkPosition();
	}

	Fixer.prototype.remove = function()
	{
		removeEventListener(global, 'scroll', this.checkPosition, false);
		removeEventListener(global, 'resize', this.checkSize, false);
	};

	function createFixedClone(fixed, className)
	{
		var fixedClone = fixed.cloneNode(true);
		fixedClone.style.position = 'fixed';
		fixedClone.style.top = '0';
		fixedClone.style.display = 'none';

		fixedClone.className += ' ' + className;

		fixed.parentNode.insertBefore(fixedClone, fixed);

		return fixedClone;
	}

	function checkSize()
	{
		this.fixedClone.style.width = this.fixed.offsetWidth + 'px';
		this.offsetTop = getOffsetTop(this.container);
		this.maxScrollTop = this.offsetTop + this.container.offsetHeight - this.fixed.offsetHeight;
		this.checkPosition();
	}

	function checkPosition()
	{
		var scrollTop = global.document.documentElement.scrollTop ? global.document.documentElement.scrollTop : global.document.body.scrollTop;
		
		if(scrollTop > this.offsetTop && scrollTop <= this.maxScrollTop && !this.visible)
		{
			this.fixedClone.style.display = this.fixed.style.display;
			if (this.fixedClone.style.zIndex) this.fixedClone.style.zIndex = this.fixed.zIndex + 1;
			this.visible = true;
		}
		else if (scrollTop <= this.offsetTop && this.visible)
		{
			this.fixedClone.style.display = 'none';
			this.visible = false;
		}
		else if (scrollTop > this.maxScrollTop && this.visible)
		{
			this.fixedClone.style.display = 'none';
			this.visible = false;
		}
	}

	function getOffsetTop(elem)
	{
		return elem.offsetTop;
	}

	function addEventListener(el, evt, handler)
	{
		if (el.addEventListener)
		{
			el.addEventListener(evt, handler, false);
		}
		else if (el.attachEvent)
		{
			el.attachEvent('on' + evt, handler);
		}
	}

	function removeEventListener(el, evt, handler)
	{
		if (el.removeEventListener)
		{
			el.removeEventListener(evt, handler, false);
		}
		else if (el.detachEvent)
		{
			el.detachEvent('on' + evt, handler);
		}
	}

	return function(container, fixed, options) {
		var containers = global.document.querySelectorAll(container),
			result = [];

		for(var i = 0, length = containers.length; i < length; i++)
		{
			var fixedElement = containers[i].querySelector(fixed);
			result.push(new Fixer(containers[i], fixedElement, options));
		}

		result.remove = function() {
			for(var i = 0; i < result.length; i++)
			{
				result[i].remove();
			}
		};

		return result;
	};
})(this);

/* Compatibility part, IE8 support */

if (!Function.prototype.bind) {

  Function.prototype.bind = function (oThis) {

    if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;

  };

}