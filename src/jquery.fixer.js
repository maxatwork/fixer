/**
 * @author Maxim Vasiliev
 * Date: 23.09.11
 * Time: 16:09
 */

(function ($)
{
	$.fn.fixer = function(headSelectorOrCmd, options)
	{
		var settings = {
			className : 'fixed'
		};

		if (headSelectorOrCmd == "remove")
		{
			return this.each(function()
			{
				$(this).data("fixer").remove();
			});
		}
		else
		{
			if (arguments.length > 1)
			{
				$.extend(settings, options);
			}

			return this.each(function()
			{
				$(this).data("fixer", new Fixer(this, $(headSelectorOrCmd, this).get(0), settings));
			});
		}
	};

})(jQuery);