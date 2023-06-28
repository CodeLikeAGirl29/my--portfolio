/*
 * parallax.jquery.js v1.0.0
 * http://themeforest.net/user/unionagency
 *
 * Copyright 2016, UnionAgency
 * http://themeforest.net/user/unionagency
 */

(function($) {
 
    $.fn.parallax = function(options) { 

    	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) return;

        var settings = {  
            shine : true,
            shadow : true
        };

        if(options) {
            $.extend(settings, options);
        }

        return this.each(function() {   


			var $poster = $(this),
				$settings = settings,
				$shine,
				$layer = $poster.find('[class*="layer-"]'),
				w,
				h,
				$posterLeft,
				$posterTop,
				isWebkit = 'WebkitAppearance' in document.documentElement.style;

			if($settings.shine) {
				$poster.append('<span class="shine" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 60%);"></span>');
				$shine = $poster.find('.shine');
			}
			if($settings.shadow) $poster.addClass('shadow');
			if(!isWebkit) $poster.addClass('animation-disabled');
			//$poster.parent().css({'transform-style' : 'preserve-3d', 'transform' : 'perspective(800px)'});

			function init(){
				w = $poster.outerWidth();
				h = $poster.outerHeight();
				$posterLeft = $poster.offset().left;
				$posterTop = $poster.offset().top;
			}

			init();

			window.addEventListener("resize", function() {
				init();
			}, false);


			$poster.on('mousemove', function(e) {
				var offsetX = 0.5 - (e.pageX - $posterLeft) / w, //cursor position X
					offsetY = 0.5 - (e.pageY - $posterTop) / h, //cursor position Y
					dy = (e.pageY - $posterTop) - h / 2, //@h/2 = center of poster
					dx = (e.pageX - $posterLeft) - w / 2, //@w/2 = center of poster
					theta = Math.atan2(dy, dx), //angle between cursor and center of poster in RAD
					angle = theta * 180 / Math.PI - 90, //convert rad in degrees
					offsetPoster = $poster.data('offset'),
					transformPoster = 'perspective(800px) translateY(' + -offsetX * offsetPoster + 'px) rotateX(' + (-offsetY * offsetPoster) + 'deg) rotateY(' + (offsetX * (offsetPoster * 2)) + 'deg)'; //poster transform


				//get angle between 0-360
				if (angle < 0) {
					angle = angle + 360;
				}

				//gradient angle and opacity
				if($settings.shine) $shine.css('background', 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + (e.pageY - $posterTop) / h*0.5 + ') 0%,rgba(255,255,255,0) 80%)');

				//poster transform
				$poster.css({'transform': transformPoster, '-webkit-transform': transformPoster});

				//parallax foreach layer
				$layer.each(function() {
					var $this = $(this),
					offsetLayer = $this.data('offset') || 0,
					transformLayer = 'translateX(' + offsetX * offsetLayer + 'px) translateY(' + offsetY * offsetLayer + 'px)';
					$this.css({'transform': transformLayer, '-webkit-transform': transformLayer});
				});
			});

			$poster.on('mouseenter', function(e) {
				init();
			});

			$poster.on('mouseleave', function(e) {
				transformPoster = 'translateY(0px) rotateX(0deg) rotateY(0deg)';
				$poster.css({'transform': transformPoster, '-webkit-transform': transformPoster});
				transformLayer = 'translateX(0px) translateY(0px)';
			    $layer.css({'transform': transformLayer, '-webkit-transform': transformLayer});
			});

        });
     
    };
     
})(jQuery);