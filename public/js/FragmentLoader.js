var $ = require("jquery");

// a cache of the fragments that have been loaded already
var loaded = {};

// creates a callback to pass as the success parameter to a $.ajax call
var successCallback = function( name, done ) {
  return function _FragmentLoader_successCallback( htmlText, status, xhr ) {
    var html = $( htmlText );

    // remember this result (if not already loaded)
    if( !( name in loaded ) ) {
      loaded[ name ] = html;
    }

    // call the given done function with the parsed response xml and no error
    done( html, undefined );
  };
};

// creates a callback to pass as the erro parameter to a $.ajax call
var errorCallback = function( done ) {
  return function _FragmentLoader_errorCallback( xhr, status, error ) {
    // call the given done function with no data and the given error
    done( undefined, status + ": " + error );
  }
};

// export the loading function
module.exports = function loadFragment( name, done ) {
  if( name in loaded ) {
    // already cached, just return the cached version
    done( loaded[ name ], undefined );
  } else {
    // otherwise, load it
    $.ajax({
      type:     "GET",
      url:      "/frag/" + name + ".htm",
      success:  successCallback( name, done ),
      error:    errorCallback( done )
    });
  }
};