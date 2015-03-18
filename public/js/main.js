var $            = require("jquery"),
    loadFragment = require("FragmentLoader"),
    fragmentContainer;

var showFragment = function( name, pushState, noAnimate ) {
  // do some stuff to remove the old fragment
  if( !noAnimate ) {
    fragmentContainer.animate({
      opacity: 0
    }, 300 );
  }

  // load the new fragment, display it if possible
  loadFragment( name, function( html, error ) {
    if( html ) {
      // empty the fragment container, add the new fragment
      fragmentContainer
        .empty()
        .append( html );

      // if allowed, animate
      if( !noAnimate ) {
        fragmentContainer.animate({
          opacity: 1
        }, 300 );
      }

      // add this to the history (if requested)
      pushState && window.history.pushState( { fragment: name }, "", name );
    } else {
      console.log("Error retrieving fragment '" + name + "': " + error );
    }
  });
};

// when the document is ready...
$(function() {
  // add necessary classes to nav items and menu items
  $(".top-nav").each(function() {
    var nav = $(this);
    
    // <a> tags are 'nav-link'
    nav.find("a").addClass("nav-link");

    // mark those .nav-item without .nav-link
    nav.find(".nav-item:not(:has(.nav-link))").addClass("no-link");

    // also, mark those .menu-item without link
    nav.find(".menu-item:not(:has(.nav-link))").addClass("no-link");
  });

  // save a reference to the fragment container
  fragmentContainer = $("#fragment-container");

  // on popstate events, load the relevant fragment (but don't push the state)
  window.addEventListener('popstate', function( ev ) {
    showFragment( ev.state.fragment || "index", false );
  });

  // intercept any links to this domain, just load the proper fragment
  $( document.body ).click(function( ev ) {
    var href;
  
    // quit if it's not an <a>
    if( ev.target.tagName.toLowerCase() !== "a" ) return;
  
    // otherwise, prevent navigation and get the address
    href = ev.target.href;
  
    // naive: assume origin at beginning of href w/o checking
    href = href.substring( location.origin.length + 1 );
  
    // prevent the navigation
    ev.preventDefault();
  
    // show the fragment (and push state)
    showFragment( href, true );
  });

  // initially, show the 'index' fragment (last 'true' is to prevent animation)
  showFragment( "index", false, true );

  // don't push a state; replace it
  window.history.replaceState({ fragment: "index" }, "", "/");
});