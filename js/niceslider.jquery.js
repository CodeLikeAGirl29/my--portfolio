/*
 * niceslider.jquery.js v1.0.0
 * http://themeforest.net/user/unionagency
 *
 * Copyright 2016, UnionAgency
 * http://themeforest.net/user/unionagency
 */

(function($) {
 
    $.fn.niceSlider = function(options) { 

        var settings = {  
            speed : '500',
            easing : 'cubic-bezier(0.8, 0, 0.2, 1)',
            arrows: true
        };

        if(options) {
            $.extend(settings, options);
        }

        return this.each(function() {   


			var $this = $(this),
				$settings = settings,
				$arrowTop = $('<div class="swiper-button-prev swiper-button hidden-xs style-3 light"></div>'),
				$arrowBottom = $('<div class="swiper-button-next swiper-button hidden-xs style-3 light"></div>'),
				$nicefinish = 0,
				$visibilityAnchor = $('<div class="visibility-anchor hidden-xs"></div>');

			if($settings.arrows){
				$this.append($arrowTop, $arrowBottom);
			}

			$this.append($visibilityAnchor);

			$this.find('.nice-slider-item').css({'transition':'all '+$settings.speed+'ms '+$settings.easing, '-webkit-transition':'all '+$settings.speed+'ms '+$settings.easing});

			$arrowTop.on('click', function(){
				niceSliderPrev();
			});

			$arrowBottom.on('click', function(){
				niceSliderNext();
			});

			function niceSliderNext(){
				if($nicefinish || !$visibilityAnchor.is(':visible')) return false;
				$nicefinish = 1;
				var currentSlide = $this.find('.nice-slider-slide').filter('.active'),
					firstSlide = $this.find('.nice-slider-slide').filter(':last');

				$this.find('.nice-slider-slide.first').removeClass('first');

				currentSlide.next().addClass('active');

				setTimeout(function(){
					currentSlide.removeClass('active').clone(true).insertAfter(firstSlide);
					currentSlide.remove();
					$this.find('.nice-slider-slide:first-child').addClass('first');
					$nicefinish = 0;
				}, $settings.speed);
			}

			function niceSliderPrev(){
				if($nicefinish || !$visibilityAnchor.is(':visible')) return false;
				$nicefinish = 1;
				var currentSlide = $this.find('.nice-slider-slide').filter('.active'),
					lastSlide = $this.find('.nice-slider-slide').filter(':last');

				$this.find('.nice-slider-slide.first').removeClass('first');

				lastSlide.clone(true).addClass('active').insertBefore($this.find('.nice-slider-slide').filter(':first'));
				lastSlide.remove();
				currentSlide.removeClass('active');

				setTimeout(function(){
					$this.find('.nice-slider-slide:first-child').addClass('first');
					$nicefinish = 0;
				}, $settings.speed);
			}

			$this.on('mousewheel', function(event) {		
				if(event.deltaY>0) {
					niceSliderPrev();
				}
				else{
					niceSliderNext();
				}
			});

        });
     
    };
     
})(jQuery);