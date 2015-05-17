var $     = require("jquery"),
    React = require("react"),
    loadFragment;

// About Fragments:
//   Place fragments in the 'frag/' folder, and USE THE EXTENSION .htm!
//   Fragments should contain whatever content would regularly go inside the <main> element.
//   Optionally, include a script that defines a function named 'onShow' to perform some
//     action based on data that is passed in (the nature of the data is determined by the caller).
//     For example, the fragment 'location.htm' defines 'onShow' to react to zip-code input.

// Loads a fragment
//   String path      : The path to the fragment to load, WITHOUT the prefix 'frag/' and suffix '.htm'
//   Function success : Some action to perform once the fragment has been successfully loaded
//   Function error   : Some action to perform if the fragment loading fails
loadFragment = function( path, success, error ) {
  return $.ajax({
    type:     "GET",
    url:      "/frag/" + path + ".htm",
    success:  success,
    error:    error
  });
};

var Fragment = function( path, onSuccess, onFail ) {
  // save the path to the fragment
  this.path = path;
  //this.html       is used to store jQuery representation of the fragment
  //this._userData  is used to store fragment specific loading operations
  
  // begin loading
  this.load( onSuccess, onFail );
};

Fragment.prototype = {
  load: function( onSuccess, onFail ) {
    this.html = undefined;

    return this.xhr = loadFragment( 
      this.path, 
      this._onSuccess( onSuccess ),
      onFail 
    );
  },

  isLoaded: function() {
    return this.html !== undefined;
  },

  _onSuccess: function( callback ) {
    var _this = this;

    return function( data ) {
      var html = _this.html = $( data ),
          cb;

      // find event callbacks and data
      _this._findData();

      // invoke the fragment's onLoad callback, if it was given
      _this.invokeCallback("onLoad");

      // finally, invoke the given callback (this *will* be a function)
      callback( _this );
    };
  },

  _findData: function() {
    var dataScript = this.html.filter(function() { return $(this).is("[data-fragment-user-data]"); }),
        evalString,
        dependencies,
        userData = {};
    
    // no <script> found, just return empty object
    if( !dataScript.length ) return {};
    
    // otherwise, create the eval string
    //dependencies = 
    evalString = 
      "(function( $, React, fragment ) {"
    +   (dataScript.text() || "")
    + "})( $, React, userData )";

    // evaluate the string
    eval( evalString );
    console.log(userData);
    
    // reference for callbacks and data the fragment creator may have assigned
    // copy it, so that it can't be changed after execution of the statement
    userData = this._userData = $.extend( {}, userData );
    userData.data = userData.data || {};

    console.log("Just found data for '" + this.path + "':", this._userData.data );

    // remove the callbacks script
    dataScript.remove();
  },
  
  invokeCallback: function( which, data ) {
    var cb = this._userData[ which ];
    //console.log("About to invoke ", which, " with data ", data);
    (typeof cb === "function") && cb( this.html, data || {} );
  }
};

// Valid options: (* next to value means default)
//   noCache    *false    Every loaded fragment will be cached. This is default.
//              true      No loaded fragments will be cached. In other words, every call to
//                        'loadFragment' will result in an XHR. Not recommended.
//              <Array>   A list of fragments paths that should not be cached.
//   retryLoad  *false    Same as 0. Failed fragment loads are not retried automatically.
//              <Number>  An integer representing how many times the loader should attempt
//                        to request a fragment if the original request fails.
//   
var FragmentContainer = function( container, options ) {
  var opt;
  
  this.element  = $( container ); // jQuery reference to the containing element
  this._options = options = $.extend({}, options); // a reference to options for this container
  this._loaded  = {};             // a private cache of already loaded fragments
  this._current = null;           // a reference to the currently loaded fragment

  // make sure the options are valid
  /*opt = options.noCache;
  options.noCache = ( opt === true || isArray( opt ) ) ? opt : [];

  opt = options.fadeDuration;
  options.fadeDuration = ( isNaN( opt ) ? 300 : Math.floor( opt ) );*/

  options.notFoundPath = options.notFoundPath || "not-found";
};

FragmentContainer.prototype = {
  _loadSuccess: function( path, onSuccess ) {
    var _this = this;

    return function( fragment ) {
      // cache the fragment
      _this._loaded[ path ] = fragment;

      // then call the given handler
      onSuccess && onSuccess( fragment );
    };
  },

  _load: function( path, onSuccess, onFail ) {
    var loaded = this._loaded;
    
    if( path in this._loaded ) {
      // if it's already loaded, just return it
      onSuccess( this._loaded[ path ] );
    } else {
      // otherwise, we have to load it -- try to do so now
      fragment = new Fragment( 
        path, 
        this._loadSuccess( path, onSuccess ), 
        onFail
      );
    }
  },

  _showFragment: function( toFragment, data ) {
    // remove the current fragment
    if( this._current ) {
      this._current.html.detach();
    }

    // add the next one
    this.element.append( (this._current = toFragment).html );

    // and call its onShow function with relevant info
    toFragment.invokeCallback("onShow", data );
  },
  
  // creates a function to be passed as the onSuccess argument of a _load() call
  _showSuccess: function( data, onSuccess ) {
    var _this = this;

    return function( fragment ) {
      // show the fragment
      _this._showFragment( fragment, data );

      // call the given handler
      onSuccess && onSuccess( fragment._userData.data ); // TO DO! Fix _userData.data to be just _userData
    };
  },

  // creates a function to be passed as the onFail argument of a _load() call
  _showFail: function( path, onFail ) {
    var _this = this;

    return function() {
      // show the not found page
      _this.show( _this._options.notFoundPath, { path: path } );

      // call the given error handler
      onFail && onFail();
    };
  },

  show: function( path, data, onSuccess, onFail ) {
    // data is optional, account for that
    if( typeof data === "function" ) {
      onFail    = onSuccess;
      onSuccess = data;
      data      = {};
    }

    if( this._current && (this._current.path === path) ) {
      // do nothing if the requested fragment is already loaded
      this._current.invokeCallback("onShow", data );
      onSuccess && onSuccess( this._current._userData.data );
    } else {
      // load the given path
      this._load( 
        path, 
        this._showSuccess( data, onSuccess ),
        this._showFail( path, onFail )
      );
    }
  }
};

module.exports = FragmentContainer;