var $              = require("jquery"),
    FragmentLoader = require("FragmentLoader"),
    loader, 
    history = window.history,
    INITIAL_FRAGMENT; // (potentially) manipulated by server

var showFragment = function( name, pushState, noAnimate ) {
  // TODO: If noAnimate = false, wait to replace fragmentContainer's content
  //       until fade out animation has stopped

  // do some stuff to remove the old fragment
  if( !noAnimate ) {
    fragmentContainer.animate({
      opacity: 0
    }, 300 );
  } else {
    // no animation, empty now
    fragmentContainer.empty();
  }

  // load the new fragment, display it if possible
  loadFragment( name, function( html, error ) {
    if( html ) {
      // empty the fragment container, add the new fragment
      fragmentContainer
        .empty()
        .append( html )
        .attr("data-fragment", name );

      // if allowed, animate
      if( !noAnimate ) {
        fragmentContainer.animate({
          opacity: 1
        }, 300 );
      }

      // add this to the history (if requested)
      pushState && history.pushState( { fragment: name }, "", name );
    } else {
      console.log("Error retrieving fragment '" + name + "': " + error );
      if( fragmentContainer.attr("data-fragment") === "not-found" ) {
        // already loaded 404, just reshow it
        if( !noAnimate ) { 
          fragmentContainer.animate({
            opacity: 1
          }, 300 );
        }
      } else if( name !== "not-found" ) {
        // otherwise load 404 if this request wasn't for 404
        showFragment( "not-found", true );
      }
    }
  });
};

var hidePopups = function( element ) {
  // find the element to save
  element = $( element ).parents("[data-popup-container], .popup");

  // use the body if no element given
  $( document.body )
    .find(".show-popup, .popup.shown")
    .not( element )
    .removeClass("show-popup shown");
}

// when the document is ready...
$(function() {
  // add necessary classes to nav items and menu items
  $(".top-nav").each(function() {
    var nav = $(this);
    
    // <a> tags are 'nav-link'
    nav.find("a").addClass("nav-link");

    // mark those .nav-item without .nav-link
    nav.find(".nav-item:not(:has(> .nav-link))").addClass("no-link");

    // also, mark those .menu-item without link
    nav.find(".menu-item:not(:has(.nav-link))").addClass("no-link");
  });

  // save a reference to the fragment container
  loader = new FragmentLoader( $("#fragment-container") );

  // initially, show the 'index' fragment (last 'true' is to prevent animation)
  INITIAL_FRAGMENT = INITIAL_FRAGMENT || "index";
  //showFragment( INITIAL_FRAGMENT, false, true );
  loader.show( INITIAL_FRAGMENT || "index", function() {
    history.replaceState(
      { fragment: INITIAL_FRAGMENT },
      "",
      INITIAL_FRAGMENT === "index" ? "/#" : "/#" + INITIAL_FRAGMENT
    );
  });

  // on popstate events, load the relevant fragment (but don't push the state)
  window.addEventListener('popstate', function( ev ) {
    var state = ev.state;

    loader.show( state.fragment || "index", state.data, function( data ) {
      // add / remove "full" class as necessary
      $("body")[ data && data.full ? "addClass" : "removeClass" ]("full");
    });
  });

  // intercept any links to this domain, just load the proper fragment
  $( document.body ).click(function( ev ) {
    var target = ev.target,
        href, data,
        origin = location.origin;
  
    // quit if it's not an <a>
    if( target.tagName.toLowerCase() !== "a" && !( target = $( target ).parents("a")[ 0 ] ) ) return;
  
    // otherwise, prevent navigation and get the address
    href = target.href;

    // prevent navigation
    ev.preventDefault();
  
    if( href.indexOf( origin ) === 0 ) {
      // internal link, strip the origin off the url
      href = href.substring( location.origin.length + 1 );

      // get fragment data, if there is any
      try { data = JSON.parse( target.dataset.fragmentData ); } catch( e ) {}
    
      // show the fragment (and push state)
      loader.show( href, data, function( data ) {
        // on success, push the fragment path into state (if we're not already at that state)
        if( history.state.fragment !== href ) {
          history.pushState( { fragment: href }, "", "/#" + href );
        }

        // add / remove "full" class as necessary
        $("body")[ data && data.full ? "addClass" : "removeClass" ]("full");
      }, function() {
        // otherwise, push not-found if we're not there already
        if( history.state.fragment !== "not-found" ) {
          history.pushState( { fragment: "not-found" }, "", "/#not-found" );
        }
        
        history.state.data = { path: href };

        $("body").removeClass("full");
      });
    } else {
      // external link, open in new tab
      href && window.open( href );
    }
  });

  // prevent menus from closing if child inputs are active
  $(".top-nav input").each(function() {
    var input = $(this),
        parent = input.closest(".nav-item");

    // on focus, force the menu to stay visible
    input.focus(function() {
      parent.addClass("force-hover");
    });

    // on blur, remove that mandate
    input.blur(function() {
      parent.removeClass("force-hover");
    });

    // on keydown, do certain things...
    input.keydown(function( ev ) {
      var key = ev.key || ev.which,
          fn;

      if( key === 13 ) {
        // enter key, call the designated function if it exists
        (fn = input.data("enterCallback")) && fn.call( input, input.val() );
      } else if( key === 27 ) {
        // escape key, blur input
        input.blur();
      }
    });
  });

  // assign designated function for #nav-location-input
  $("#nav-location-input").data("enterCallback", function( val ) {
    if( !val ) return;

    loader.show("locations", { location: val }, function() {
      $("body").addClass("full");
    });
    this.val("");
  });

  // for #service-provider-login-link and #individual-login-link, do popup stuff
  $("#service-provider-login-link").add("#individual-login-link").click(function( ev ) {
    // TODO -- make popups disappear on click outside
    $( this ).parent().toggleClass("show-popup");
  });

  // on body click, hide popups
  $( document.body ).click(function( ev ) { 
    hidePopups( ev.target );
  });
});