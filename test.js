var express = require("express")
    app     = express();

app.get("/", function( req, res ) {
  res.sendFile( __dirname + "/public/index.htm" );
});

app.get("/hey", function( req, res ) {
  res.send("<strong>Hey</strong>there.");
});

app.use( express.static( __dirname + "/public" ) );

app.listen( 5000 );