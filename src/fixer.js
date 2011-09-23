/**
 * @author Maxim Vasiliev
 * Date: 30.08.11
 * Time: 17:28
 */

/**
 * Sticky table headers etc
 * Uses Element.querySelector (if found)
 * or Sizzle (if found)
 * or getElementsByClassName
 *
 * @param container Container selector
 * @param fixed Fixed element selector
 * @param options Options
 */
var fixer = (function(global, sizzle)
{

	"use strict";

	var defaults = {
		className: 'fixed'
	};

	function Fixer(container, fixed, options)
	{
		this.container = container;
		this.fixed = fixed;
		this.visible = false;
		this.offsetTop = 0;

		this.settings = {};

		for (var key in defaults)
		{
			this.settings[key] = options && typeof options[key] != 'undefined' ? options[key] : defaults[key];
		}

		this.fixedClone = createFixedClone(this.fixed, this.settings.className);

		this.onResize = bind(onResize, this);
		this.onScroll = bind(onScroll, this);

		addEventListener(global, 'scroll', this.onScroll);
		addEventListener(global, 'resize', this.onResize);

		this.onResize();
		this.onScroll();
	}

	Fixer.prototype.remove = function()
	{
		removeEventListener(global, 'scroll', this.onScroll);
		removeEventListener(global, 'resize', this.onResize);
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

	function onResize()
	{
		this.offsetTop = getOffsetTop(this.container);
		this.fixedClone.style.width = this.fixed.offsetWidth + 'px';
		this.maxScrollTop = this.offsetTop + this.container.offsetHeight - this.fixed.offsetHeight;

		this.onScroll();
	}

	function onScroll()
	{
		var scrollTop = global.document.documentElement.scrollTop ? global.document.documentElement.scrollTop : global.document.body.scrollTop,
				scrollLeft = global.document.documentElement.scrollLeft ? global.document.documentElement.scrollLeft : global.document.body.scrollLeft;

		if (scrollTop > this.offsetTop && scrollTop <= this.maxScrollTop)
		{
			this.fixedClone.style.top = '0px';
			this.fixedClone.style.display = this.fixed.style.display;
			if (this.fixedClone.style.zIndex) this.fixedClone.style.zIndex = this.fixed.zIndex + 1;
			this.visible = true;
		}
		else if (scrollTop <= this.offsetTop && this.visible)
		{
			this.fixedClone.style.display = 'none';
			this.visible = false;
		}
		else if (scrollTop > this.maxScrollTop)
		{
			this.fixedClone.style.top = (this.maxScrollTop - scrollTop) + 'px';
		}

		if (this.visible)
		{
			this.offsetLeft = getOffsetLeft(this.fixed);
			this.fixedClone.style.left = (this.offsetLeft - scrollLeft) + 'px';
		}
	}

	function getOffsetTop(elem)
	{
		var result = 0;

		do {
			result += elem.offsetTop;
		} while (elem = elem.offsetParent);

		return result;
	}

	function getOffsetLeft(elem)
	{
		var result = 0;

		do {
			result += elem.offsetLeft;
		} while (elem = elem.offsetParent);

		return result;
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

	function querySelectorAll(root, selector)
	{
		if (root.querySelectorAll) return root.querySelectorAll(selector);
		if (sizzle != null) return sizzle(selector, root);
		if (root.getElementsByClassName) return root.getElementsByClassName(selector);

		return [];
	}

	function querySelector(root, selector)
	{
		var results = querySelectorAll(root, selector);
		if (results.length > 0) return results[0];

		return null;
	}

	function bind(fToBind, oThis)
	{
		if (typeof fToBind.bind != 'undefined')
		{
			return fToBind.bind.apply(fToBind, Array.prototype.slice.call(arguments, 1));
		}

		if (typeof fToBind !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
		{
			throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 2),
				fNOP = function () {},
				fBound = function ()
				{
					return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
				};

		fNOP.prototype = fToBind.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	}

	return function(container, fixed, options)
	{
		var containers = querySelectorAll(global.document, container),
				result = [];

		for (var i = 0, length = containers.length; i < length; i++)
		{
			var fixedElement = querySelector(containers[i], fixed);
			if (fixedElement == null) continue;

			result.push(new Fixer(containers[i], fixedElement, options));
		}

		result.remove = function()
		{
			for (var i = 0; i < result.length; i++)
			{
				result[i].remove();
			}
		};

		return result;
	};
})(this, typeof Sizzle == 'undefined' ? null : Sizzle);