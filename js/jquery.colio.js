/**
 * Colio - jQuery Portfolio Content Expander Plugin
 * http://plugins.gravitysign.com/colio
 * Copyright (c) 2013 Roman Yurchuk
 * Version 1.5
 */
 
 
(function($, undefined) {

	"use strict";

	// Constructor
	// ---------------------------------------------------------------------------
	
	function Colio(list, settings){
		
		// properties
		this.list = $(list);
		this.items = this.list.children();
		this.settings = settings;
		this.position = 0;
		this.active_id = undefined;
		this.lock = false;
		
		// variables
		var self =  this;
		
		// add class to portfolio items
		this.items.addClass('colio-item');
		
		// markup
		this.markup = $('<div class="colio"></div>');
		this.markup.append('<div class="colio-container"></div>');
		if(this.settings.navigation) {
			this.markup.addClass('colio-has-navigation');
			$('<div class="colio-navigation"></div>').
				append('<a class="colio-prev" href="#">' + this.settings.prevText + '</a>').
				append('<a class="colio-next" href="#">' + this.settings.nextText + '</a>').
				appendTo(this.markup);
		}
		this.markup.append('<a class="colio-close" href="#">' + this.settings.closeText + '</a>');
		
		// insert markup into the document
		if(this.settings.placement === 'after' ) {
			this.list.after(this.markup);
		} else if(this.settings.placement === 'inside') {
			this.markup.css({position:'absolute', top:0, left:0});
			$('body').append(this.markup);
		} else if(/^#\w/.test(this.settings.placement)) {
			$(this.settings.placement).append(this.markup);
			this.settings.placement = 'element';
		} else {
			this.list.before(this.markup);
			this.settings.placement = 'before';
		}
		
		// set id if provided
		if(this.settings.id) {
			this.markup.attr('id', this.settings.id);
		}
		
		// add class that defines colio placement
		this.markup.addClass('colio-placement-' + this.settings.placement);
		
		// add theme class if provided
		if(this.settings.theme) {
			this.markup.addClass('colio-theme-' + this.settings.theme);
		}
								
		// assign click handlers to expand colio viewport
		this.items.find(this.settings.expandLink).click(function(){
		
			// save page scroll when expand link was clicked
			self.page_scroll = $(window).scrollTop();
			
			// expand colio viewport for item
			var item = $(this).closest('.colio-item');
			self.expand(item);
									
			return false;
		});
		
		// assign click handler to colio viewport close button
		this.markup.find('.colio-close').click(function(){
			self.collapse(); 
			return false;
		});
		
		// assign click handlers to previous/next buttons
		this.markup.find('.colio-prev').click(function(){
		
			// check if position is in range
			if(!self.lock && self.position > 0) {				
				self.position--;
				self.expand(self.items.eq(self.position));
			}	
			return false;
		
		}).end().find('.colio-next').click(function(){
		
			// check if position is in range
			if(!self.lock && self.position < self.items.length - 1) {
				self.position++;
				self.expand(self.items.eq(self.position));
			}
			return false;
		
		});
		
		// adjust colio viewport height on window resize
		$(window).bind('resize orientationchange', function(e){
		
			// stop propagation if colio is event target
			if(e.target === self.markup.get(0)) {
				e.stopImmediatePropagation();
			}
					
			// for 'inside' placement hide viewport immediately on resize
			if(self.settings.placement === 'inside' && /^(smart)?resize$/.test(e.type)) {
				self.insideHideViewport();
			}
			
			// disable page scroll during window resize
			if(!self.temp) {
				self.temp = [self.settings.syncScroll, self.settings.scrollPage];
			}
			self.settings.syncScroll = true;
			self.settings.scrollPage = false;
			
			// adjust viewport height
			clearTimeout(self.resize_timer);
			self.resize_timer = setTimeout(function(){
				self.expandViewport(self.active_id, true);
				self.settings.syncScroll = self.temp[0];
				self.settings.scrollPage = self.temp[1];
				delete self.temp;
			}, 200);
			
		});
		
		// define API methods
		this.api = {
			expand: function(n){
				self.expand(self.items.eq(n));
			},
			collapse: function(){
				self.collapse();
			},
			excludeHidden: function(){
				self.items = self.list.children(':not(' + self.settings.hiddenItems + ')');
				self.position = self.items.index(self.list.find('.colio-active-item'));
				if(self.settings.placement === 'inside') {
					self.insideHideViewport();
				}
			}
		};
		
		// make API methods available via custom event or data of portfolio list
		this.list.data('colio', this.api);
		this.list.bind('colio', function(e, method, param){
			if(self.api.hasOwnProperty(method)) {
				self.api[method](param);
			}
		});
		
	}
	
	
	// Methods
	// ---------------------------------------------------------------------------
	
	
	/**
	* Method to load content and expand viewport for portfolio item
	*/
	
	Colio.prototype.expand = function(item) {
		
		// load content from "data-content" attribute
		var content_data = item.data('content');
			
		// return if locked or "data-content" is not set
		if(this.lock || !content_data) { 
			return; 
		}
		
		// ok, now set lock!
		this.lock = true;
		
		// save item position
		this.position = this.items.index(item);
		
		// for "inside" placement position colio viewport
		if(this.settings.placement === 'inside') {
			this.insidePositionViewport(item);
		}
		
		// check if content is already loaded
		var	content_id = item.data('colio-content-id');
				
		// ok, content is loaded
		if(content_id) {
			
			// expand colio viewport and show content
			this.expandViewport(content_id);
		
		} else {
		
			// if content_id isn't set, load content first
			this.loadContent(content_data, function(content_id){
			
				// save content_id for loaded content
				item.data('colio-content-id', content_id);
				
				// expand colio viewport and show content
				this.expandViewport(content_id);
				
			});
		
		}
		
		// add class to navigatin controls when first/last item has been reached
		this.markup.find('.colio-navigation a').removeClass('colio-no-prev colio-no-next');
		
		if(this.position === 0 ) {
			this.markup.find('.colio-prev').addClass('colio-no-prev');
		}
		
		if(this.position === this.items.length - 1 ) {
			this.markup.find('.colio-next').addClass('colio-no-next');
		}
		
		// add class for active item
		this.items.removeClass('colio-active-item'); 
		item.addClass('colio-active-item');
		
	};
	
	
	/* 
	* Method to load content and execute callback when ready
	*/
	
	Colio.prototype.loadContent = function(data, callback){
		
		// ref to Colio object
		var self = this;
				
		// function to add new "colio-content" div
		var _addContentDiv = function(content){
			
			// filter content
			if(self.settings.contentFilter) {
				var content_wrap = $('<div>').html(content);	
				content = content_wrap.find(self.settings.contentFilter);
			}
			
			// generate uniq id for new content
			var content_id = 'colio_' + Math.floor(Math.random() * 100000);
			
			// create and insert "colio-content" div
			$('<div id="' + content_id + '" class="colio-content"></div>').append(content).
			appendTo(self.markup.find('.colio-container'));
						
			// content callback
			if(typeof self.settings.onContent === 'function') {
				self.settings.onContent.call(self.markup.get(0), self.markup.find('#' + content_id).get(0));
			}
						
			// return content id	
			return content_id;
		};
		
		
		// get content from another element in document
		if(/^#\w/.test(data)) {
			var html = $(data).html();
			var content_id = _addContentDiv(html);
			// slighly delay running callback to give onContent() time to complete 
			setTimeout(function(){ 
				callback.call(self, content_id);
			}, 20);
			
		// load content by AJAX
		} else if (/(^\.{0,2}\/+\w)|(^https?:\/\/\w)/.test(data)) {
		
			// save contentFilter
			var cf = this.settings.contentFilter;
			
			// if there is # in URL it means we should find element by that ID first
			if(/#\w/.test(data)) {
				this.settings.contentFilter = data.substr(data.indexOf('#')) + ' ' + cf;
			}
			
			// add ajax progress class to item while loading
			this.items.eq(this.position).addClass('colio-item-loading');
		
			// load content from URL and restore contentFilter to initial value
			$.get(data, function(html) {
				callback.call(self, _addContentDiv(html));
				self.settings.contentFilter = cf;
				self.items.eq(self.position).removeClass('colio-item-loading');
			});
			
		
		// inline content that we insert as is
		} else {
			var content_id = _addContentDiv(data);
			// slighly delay running callback to give onContent() time to complete
			setTimeout(function(){ 
				callback.call(self, content_id); 
			}, 20);
			
		}
		
	};

	
	/*
	* Method to expand viewport and display requested content
	*/
	
	Colio.prototype.expandViewport = function(content_id, adjust){
	
		// variables
		var duration = this.settings.expandDuration, 
			easing = this.settings.expandEasing,
			sync = this.settings.syncScroll,
			viewport_top = this.markup.offset().top - parseInt(this.settings.scrollOffset, 10),
			viewport_height = this.getViewportHeight(content_id);
			
		// unlock and return if received content height is 0 or if we try
		// to expand same item, but only when adjust argument isn't true
				
		if(viewport_height === 0 || (!adjust && content_id === this.active_id)) {
			this.lock = false; // unlock
			return;
		}
		
		// for "inside" placement, make a gap for viewport inside portfolio grid
		if(this.settings.placement === 'inside') {
			this.insideMakeGap( this.items.eq(this.position) );
		}
		
		// switch content in colio viewport
		this.switchContent(content_id);
								
		// run animation to expand colio viewport
		this.markup.stop().animate({height: viewport_height}, duration, easing, $.proxy(function(){
			
			// add expanded class
			this.markup.addClass('colio-expanded');
			
			// scroll page to colio viewport
			this.scroll(viewport_top, !sync);
			
			// unlock
			this.lock = false;
			
			// expand callback
			if(typeof this.settings.onExpand === 'function') {
				this.settings.onExpand.call(this.markup.get(0), content_id);
			}
			
		}, this));
		
		// scroll page to colio viewport (sync)
		this.scroll(viewport_top, sync);
	};
		
	
	/*
	* Method to switch content inside viewport using fade animation
	*/
	
	Colio.prototype.switchContent = function(content_id) {
		
		// variables
		var active_content = this.markup.find('#' + this.active_id),
			new_content = this.markup.find('#' + content_id);

		// don't run animation if active and new content match
		if(this.active_id === content_id) {
			return;
		}
						
		// start animation to replace active content with new one		
		if(active_content.length) {
			active_content.stop().fadeOut(this.settings.contentFadeOut, $.proxy(function(){
				new_content.fadeIn(this.settings.contentFadeIn);
			}, this));
		} else {
			new_content.delay(this.settings.contentDelay).fadeIn(this.settings.contentFadeIn);
		}
		
		// save id of new visible content
		this.active_id = content_id;
		
	};
	
	
	/*
	* Method to get viewport height for specific content 
	*/
	
	Colio.prototype.getViewportHeight = function(content_id){
		
		// variables
		var container = this.markup.find('.colio-container'),
			container_width = container.width(),
			container_padding = container.outerHeight() - container.height(),
			content = this.markup.find('#' + content_id),
			content_height = 0;
								
		// if content is visible, get height right away
		if(content.is(':visible')) {
			content_height = content.height();
			
		} else {
			// otherwise make content temporaly visible to get its height
			content.css({display: 'block', position: 'absolute', visibility: 'hidden', width: container_width});
			content_height = content.height();
			content.css({display: '', position: '', visibility: '', width: ''});
		}
						
		// return 0 if content height is 0, otherwise return total viewport height 
		return content_height > 0 ? content_height + container_padding : 0;
	
	};
	
	
	/*
	* Method to scroll page to specific position
	*/
	
	Colio.prototype.scroll = function(top, allow){
		
		// variables
		var duration = this.settings.scrollDuration, 
			easing = this.settings.scrollEasing;
						
		// check if page scroll is allowed in settings
		if( !this.settings.scrollPage ) {
			return;
		}
			
		// animate page scroll
		if( allow ) {
			$('body, html').stop().animate({scrollTop: top}, duration, easing);
		}
		
	};
	
	
	/*
	* Method to collapse colio viewport
	*/
	
	Colio.prototype.collapse = function(){
		
		// variables
		var duration = this.settings.collapseDuration, 
			easing = this.settings.collapseEasing,
			sync = this.settings.syncScroll;
						
		// unset position
		this.position = undefined;
		
		// start collapse animation
		this.markup.stop().animate({height:0}, duration, easing, $.proxy(function(){
		
			// hide any visible content
			this.markup.find('.colio-content:visible').hide();
			
			// remove active class from portfolio items
			this.items.removeClass('colio-active-item');
			
			// scroll page back to original scroll position
			this.scroll(this.page_scroll, !sync);
			
			// collapse callback
			if(typeof this.settings.onCollapse === 'function') {
				this.settings.onCollapse.call(this.markup.get(0), this.active_id);
			}
			
			// unset active content
			this.active_id = undefined;
			
		}, this));
		
		// remove expanded class
		this.markup.removeClass('colio-expanded');
		
		// for "inside" placement close gap in item grid
		if(this.settings.placement === 'inside') {
			this.insideJoinGap();
		}
		
		// scroll page back to original scroll position (sync)
		this.scroll(this.page_scroll, sync);
		
	};
	
	
	/*
	* For "inside" placement. Method to get all items that follow the row of current item
	*/
	
	Colio.prototype.insideBottomItems = function(item){
	
		// variables
		var in_row = Math.round( this.list.width() / item.outerWidth(true) );
		
		// in_row cannot not be less then 1
		in_row = Math.max(1, in_row);
		
		var	total_rows = Math.ceil( this.items.length / in_row),
			row = Math.floor( this.items.index(item) / in_row );
		
		// calculate next row 
		if(this.settings.beforeLastRow) {
			row = row < total_rows - 1 ? row + 1 : row;
		} else {
			row = row + 1;
		}	
						
		return this.items.slice( row * in_row);
		
	};
	
	
	/*
	* For "inside" placement. Method to make a gap for colio viewport inside item grid
	*/
	
	Colio.prototype.insideMakeGap = function(item){
	
		// variables			
		var duration = this.settings.expandDuration, 
			easing = this.settings.expandEasing;
	
		// get content_id for item to get viewport height to make a gap in item grid
		var content_id = item.data('colio-content-id');
		var viewport_height = this.getViewportHeight(content_id);
	
		// add any bottom margins to colio viewport height
		viewport_height += parseFloat(this.markup.css('margin-bottom'));
		
		// push items that are below colio viewport down by the amount of viewport height
		$.each(this.insideBottomItems(item), function(){
			
			// save initial top position
			var item_top = $(this).data('colio-item-top');
			if(item_top === undefined) {
				item_top = parseFloat($(this).css('top')) || 0;
				$(this).data('colio-item-top', item_top);
			}
			
			// add class to items that we have pushed down
			$(this).addClass('colio-bottom-item');
						
			// push items using animation
			$(this).stop().animate({top: item_top + viewport_height}, duration, easing);
		
		});
		
		// save initial portfolio list height
		var list_height = this.list.data('colio-list-height');
		if(list_height === undefined) {
			list_height = this.list.height();
			this.list.data('colio-list-height', list_height);
		}
										
		// increase list height by the amount of viewport height
		this.list.height(list_height + viewport_height);
		
	};
	
	
	/*
	* For "inside" placement. Method to close the gap in item grid
	*/
	
	Colio.prototype.insideJoinGap = function(no_animation){
	
		// variables			
		var duration = this.settings.collapseDuration, 
			easing = this.settings.collapseEasing;
		
		// restore initial top position of items with class "colio-bottom-item"
		this.items.filter('.colio-bottom-item').each(function(){
			var item_top = $(this).data('colio-item-top') || 0;
			if(no_animation) {
				$(this).css('top', item_top);
			} else {
				$(this).stop().animate({top: item_top}, duration, easing);
			}
			$(this).removeData('colio-item-top').removeClass('colio-bottom-item');
		});
		
		// restore initial list height (use .no-transition class to disable css3 transitions)
		var list_height = this.list.data('colio-list-height');
		this.list.addClass('no-transition').height(list_height);
		this.list.get(0).offsetHeight;  //force relayout
		this.list.removeClass('no-transition').removeData('colio-list-height');		
	};
	
	
	/*
	* For "inside" placement. Method to position colio viewport inside the gap created in item grid
	*/
	
	Colio.prototype.insidePositionViewport = function(item){
			
		// items that go below viewport
		var bottom_items = this.insideBottomItems(item);
				
		// check if colio viewport is expanded
		if(this.active_id) {
		
			// current items below viewport
			var active_bottom_items = this.items.filter('.colio-bottom-item');
			
			// check if colio viewport should be moved to next row of items
			if( active_bottom_items.length !== bottom_items.length ) {
				
				// hide colio viewport and restore item grid to initial state
				this.insideHideViewport(); 
				
				// reposition colio viewport (active_id is unset)
				this.insidePositionViewport(item);
			}
		
		} else {
		
			// make sure portfolio items have relative or absolute position
			if(/absolute|relative/.test(this.items.eq(0).css('position')) === false ) {
				this.items.css({position: 'relative', top: 0, left: 0});
			}
		
			// calculate viewport position and size
			var viewport_marginLeft = parseFloat(this.markup.css('margin-left')),
				viewport_marginRight = parseFloat(this.markup.css('margin-right')),
				viewport_top = 0,
				viewport_left = this.list.offset().left + viewport_marginLeft,
				viewport_width = this.list.width() - (viewport_marginLeft + viewport_marginRight);
				
			// position viewport underneath a list itself
			if(bottom_items.length > 0) {
				viewport_top = bottom_items.offset().top;
			} else {
				viewport_top = this.list.offset().top + this.list.height();
			}
			
			// set position
			this.markup.css({top: viewport_top, left: viewport_left, width: viewport_width});
		
		}
		
	};
	
	
	/*
	* For "inside" placement. Method to hide viewport immediately
	*/
	
	Colio.prototype.insideHideViewport = function() {
	
		// return if viewport is already collapsed
		if(this.active_id === undefined) { return; }
		
		// close gap in item grid without animation
		this.insideJoinGap(true);
		
		// set viewport height to 0 and hide any visible content
		this.markup.height(0).find('.colio-content:visible').hide();
			
		// remove active item class 
		this.items.removeClass('colio-active-item');
		
		// remove expanded class
		this.markup.removeClass('colio-expanded');
		
		// collapse callback
		if(typeof this.settings.onCollapse === 'function') {
			this.settings.onCollapse.call(this.markup.get(0), this.active_id);
		}
		
		// unset active content
		this.active_id = undefined;

	};


	
	// jQuery plugin
	// ---------------------------------------------------------------------------
	
	$.fn.colio = function(c) {
		// default settings
		var s = $.extend({
			id: 'colio',						// "id" attribute to be assigned to colio viewport
			theme: '',							// colio theme - "black" or "white"
			placement: 'before',				// viewport placement - "before", "after", "inside" or "#id"
			beforeLastRow: false,				// if true, place viewport before last row of items ("inside" only)
			expandLink: '.colio-link',			// selector for elements that will expand colio viewport
			expandDuration: 500,				// duration of expand animation, ms
			expandEasing: 'swing',				// easing for expand animation
			collapseDuration: 300,				// duration of collapse animation, ms
			collapseEasing: 'swing',			// easing for collapse animation
			scrollPage: true,					// whether to scroll page to colio viewport
			syncScroll: false,					// sync page scroll with expand/collapse animation
			scrollDuration: 300,				// page scroll duration, ms
			scrollEasing: 'swing',				// page scroll easing
			scrollOffset: 10,					// viewport offset from top of the page, px
			contentFadeIn: 500,					// content fade-in duration, ms
			contentFadeOut: 200,				// content fade-out duration, ms
			contentDelay: 200,					// content fade-in delay, ms
			navigation: true,					// whether to show next/previous controls
			closeText: '<span>Close</span>',	// text/html for close button
			nextText: '<span>Next</span>',		// text/html for next button
			prevText: '<span>Prev</span>',		// text/html for previous button
			contentFilter: '',					// selector to filter content that is to be loaded
			hiddenItems: '.hidden',				// selector to exclude hidden portfolio items
			onExpand: function(){},				// viewport expand callback
			onCollapse: function(){},			// viewport collapse callback
			onContent: function(){}				// content load callback
		}, c);
		
		// create Colio instance
		return this.each(function(){
			var colio = new Colio(this, s);
		});
	};


})(jQuery);