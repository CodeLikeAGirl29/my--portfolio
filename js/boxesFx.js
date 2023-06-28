/**
 * boxesFx.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	// based on http://responsejs.com/labs/dimensions/
	function getViewport(axis) {
		var client, inner;
		if( axis === 'x' ) {
			client = docElem['clientWidth'];
			inner = window['innerWidth'];
		}
		else if( axis === 'y' ) {
			client = docElem['clientHeight'];
			inner = window['innerHeight'];
		}
		
		return client < inner ? inner : client;
	}

	var docElem = window.document.documentElement,
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions },
		win = { width : getViewport('x'), height : getViewport('y') };
	
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function BoxesFx( el, options ) {	
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
	}

	BoxesFx.prototype.options = {}

	BoxesFx.prototype._init = function() {
		// set transforms configuration
		this._setTransforms();
		// which effect
		this.effect = this.el.getAttribute( 'data-effect' ) || 'effect-1';
		// check if animating
		this.isAnimating = false;
		// the panels
		this.panels = [].slice.call( this.el.querySelectorAll( '.panel' ) );
		this.texts = [].slice.call( this.el.querySelectorAll( '.boxgallery-text-panel' ) );
		// total number of panels (4 for this demo)
		//this.panelsCount = this.panels.length;
		this.panelsCount = 4;
		this.slidesCount = this.panels.length;
		// current panel´s index
		this.current = 0;
		classie.add( this.panels[0], 'current' );
		classie.add( this.texts[0], 'current' );
		// replace image with 4 divs, each including the image
		var self = this;
		this.panels.forEach( function( panel ) {
			var img = panel.querySelector( 'img' ), imgReplacement = '';
			for( var i = 0; i < self.panelsCount; ++i ) {
				imgReplacement += '<div class="bg-tile"><div class="bg-img"><img src="' + img.src + '" /></div></div>'
			}
			panel.removeChild( img );
			panel.innerHTML = imgReplacement + panel.innerHTML;
		} );
		// add navigation element
		// this.nav = document.createElement( 'nav' );
		// this.nav.innerHTML = '<span class="prev"><i></i></span><span class="next"><i></i></span>';
		// this.el.appendChild( this.nav );

		this.nav = document.createElement( 'div' );
		this.nav.setAttribute("class", "navigation");
		var leftArrow = '<span class="slider-click light left"><span class="arrow"></span><span class="number"><span class="left">'+this.slidesCount+'</span><span class="middle"></span><span class="right">'+this.slidesCount+'</span></span></span>',
			rightArrow = '<span class="slider-click light right"><span class="arrow"></span><span class="number"><span class="left">2</span><span class="middle"></span><span class="right">'+this.slidesCount+'</span></span></span>';
		this.nav.innerHTML = leftArrow+rightArrow;
		this.el.appendChild( this.nav );



		// initialize events
		this._initEvents();
	}

	// set the transforms per effect
	// we have defined both the next and previous action transforms for each panel
	BoxesFx.prototype._setTransforms = function() {
		this.transforms = {
			'effect-1' : {
				'next' : [
					'translate3d(0, ' + (win.height/2+10) + 'px, 0)', // transforms for 1 panel
					'translate3d(-' + (win.width/2+10) + 'px, 0, 0)', // transforms for 2 panel
					'translate3d(' + (win.width/2+10) + 'px, 0, 0)', // transforms for 3 panel
					'translate3d(0, -' + (win.height/2+10) + 'px, 0)' // transforms for 4 panel
				],
				'prev' : [
					'translate3d(' + (win.width/2+10) + 'px, 0, 0)',
					'translate3d(0, ' + (win.height/2+10) + 'px, 0)',
					'translate3d(0, -' + (win.height/2+10) + 'px, 0)',
					'translate3d(-' + (win.width/2+10) + 'px, 0, 0)'
				]
			},
			'effect-2' : {
				'next' : [
					'translate3d(-' + (win.width/2+10) + 'px, 0, 0)',
					'translate3d(' + (win.width/2+10) + 'px, 0, 0)',
					'translate3d(-' + (win.width/2+10) + 'px, 0, 0)',
					'translate3d(' + (win.width/2+10) + 'px, 0, 0)'
				],
				'prev' : [
					'translate3d(0,-' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,-' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,' + (win.height/2+10) + 'px, 0)'
				]
			},
			'effect-3' : {
				'next' : [
					'translate3d(0,' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,' + (win.height/2+10) + 'px, 0)'
				],
				'prev' : [
					'translate3d(0,-' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,-' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,-' + (win.height/2+10) + 'px, 0)',
					'translate3d(0,-' + (win.height/2+10) + 'px, 0)'
				]
			}
		};	
	}

	BoxesFx.prototype._initEvents = function() {
		var self = this, navctrls = this.nav.children;
		// previous action
		navctrls[0].addEventListener( 'click', function() { self._navigate('prev') } );
		// next action
		navctrls[1].addEventListener( 'click', function() { self._navigate('next') } );
		// window resize
		window.addEventListener( 'resize', function() { self._resizeHandler(); } );
	}

	// goto next or previous slide
	BoxesFx.prototype._navigate = function( dir ) {
		if( this.isAnimating ) return false;
		this.isAnimating = true;

		var self = this, currentPanel = this.panels[ this.current ], currentText = this.texts[ this.current ], navctrls = this.nav.children;

		if( dir === 'next' ) {
			//this.current = this.current < this.panelsCount - 1 ? this.current + 1 : 0;			
			this.current = this.current < this.slidesCount - 1 ? this.current + 1 : 0;
		}
		else {
			//this.current = this.current > 0 ? this.current - 1 : this.panelsCount - 1;
			this.current = this.current > 0 ? this.current - 1 : this.slidesCount - 1;
		}

		navctrls[0].getElementsByClassName("left")[0].innerHTML = ((this.current==0) ? this.slidesCount : this.current);
		navctrls[1].getElementsByClassName("left")[0].innerHTML = ((this.current==this.slidesCount-1) ? 1 : this.current+2);

		// next panel to be shown
		var nextPanel = this.panels[ this.current ];
		// add class active to the next panel to trigger its animation
		classie.add( nextPanel, 'active' );
		// apply the transforms to the current panel
		this._applyTransforms( currentPanel, dir );

		// next text to be shown
		var nextText = this.texts[ this.current ];
		//remove current class from current text
		classie.remove( currentText, 'current' );

		// let´s track the number of transitions ended per panel
		var cntTransTotal = 0,
			
			// transition end event function
			onEndTransitionFn = function( ev ) {
				if( ev && !classie.has( ev.target, 'bg-img' ) ) return false;

				// return if not all panel transitions ended
				++cntTransTotal;
				if( cntTransTotal < self.panelsCount ) return false;

				if( support.transitions ) {
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}

				// remove current class from current panel and add it to the next one
				classie.remove( currentPanel, 'current' );
				classie.add( nextPanel, 'current' );
				// reset transforms for the currentPanel
				self._resetTransforms( currentPanel );
				// remove class active
				classie.remove( nextPanel, 'active' );
				self.isAnimating = false;

				//add current class to next text
				classie.add( nextText, 'current' );
			};

		if( support.transitions ) {
			currentPanel.addEventListener( transEndEventName, onEndTransitionFn );
		}
		else {
			onEndTransitionFn();
		}
	}

	BoxesFx.prototype._applyTransforms = function( panel, dir ) {
		var self = this;
		[].slice.call( panel.querySelectorAll( 'div.bg-img' ) ).forEach( function( tile, pos ) {
			tile.style.WebkitTransform = self.transforms[self.effect][dir][pos];
			tile.style.transform = self.transforms[self.effect][dir][pos];
		} );
	}

	BoxesFx.prototype._resetTransforms = function( panel ) {
		[].slice.call( panel.querySelectorAll( 'div.bg-img' ) ).forEach( function( tile ) {
			tile.style.WebkitTransform = 'none';
			tile.style.transform = 'none';
		} );
	}

	BoxesFx.prototype._resizeHandler = function() {
		var self = this;
		function delayed() {
			self._resize();
			self._resizeTimeout = null;
		}
		if ( this._resizeTimeout ) {
			clearTimeout( this._resizeTimeout );
		}
		this._resizeTimeout = setTimeout( delayed, 50 );
	}

	BoxesFx.prototype._resize = function() {
		win.width = getViewport('x');
		win.height = getViewport('y');
		this._setTransforms();
	}

	// add to global namespace
	window.BoxesFx = BoxesFx;

} )( window );

/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );
