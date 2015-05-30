var $              = require("jquery"),
    FragmentLoader = require("FragmentLoader"),
    loader, 
    history = window.history;

// when the document is ready...
$(function() {
  // add necessary classes to nav items and menu items
  $(".top-nav ul").each(function() {
    var list = $(this);
    
    // <a> tags are 'nav-link'
    list.find("a").addClass("nav-link");

    // mark those .nav-item without .nav-link
    list.find(".nav-item:not(:has(> .nav-link))").addClass("no-link");

    // also, mark those .menu-item without link
    list.find(".menu-item:not(:has(.nav-link))").addClass("no-link");
  });

  // save a reference to the fragment container
  loader = new FragmentLoader( $("#fragment-container") );

  // initially, show the requested fragment (indicated by #) or the 'index' fragment
  loader.show( window.location.hash.substring( 1 ) || "index", function() {
    history.replaceState(
      { fragment: window.location.hash.substring( 1 ) || "index" },
      "",
      (window.location.hash.substring( 1 ) || "index") === "index" ? "/#" : "/#" + window.location.hash.substring( 1 )
    );
  });

  // on popstate events, load the relevant fragment (but don't push the state)
  window.addEventListener('popstate', function( ev ) {
    var state = ev.state;

    loader.show( state.fragment || "index", state.data, function( data ) {
      // add / remove body classes
      $("body").attr("class", data.bodyClass || "");
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
      loader.show( href, data, function( fragData ) {
        // on success, push the fragment path into state (if we're not already at that state)
        if( history.state.fragment !== href ) {
          history.pushState( { fragment: href }, "", "/#" + href );
        }

        // add / remove "full" class as necessary
        $("body").attr("class", fragData.bodyClass || "");
        console.log( fragData );
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
  $(".top-nav")
  .find("input").each(function() {
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
  })
  .end().find(".nav-item").each(function() {
    var t = $(this),
        m = t.find(".drop-menu");
    
    // quit now if no menu
    if( !m.length ) return;

    // otherwise, position the menu properly
    m.css("left", (-1 * (200 - t.outerWidth()) / 2) + "px");
  })

  $(".nav-button").click(function() {
    $( document.body ).toggleClass("show-nav");
  });

  // assign designated function for #nav-location-input
  $("#nav-location-input").data("enterCallback", function( val ) {
    if( !val ) return;

    loader.show("locations", { location: val }, function() {
      $("body").addClass("full");
    });
    this.val("");
  });
});