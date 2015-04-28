/** @jsx React.DOM */
var React = require("react");

var PartnerGrid = React.createClass({displayName: 'PartnerGrid',
  makeStyleObject: function( imageURL ) {
    return {
      "background-image": "url(" + imageURL + ")"
    };
  },

  onClick: function( pageURL ) {
    return function() {
      window.open( pageURL );
    };
  },

  render: function() {
    var items = this.props.partners.map(function( partner ) {
      return (React.DOM.li({className: "partner", onClick:  this.onClick( partner.url) }, 
        React.DOM.div({className: "image", style:  this.makeStyleObject( partner.image) }), 
        React.DOM.h4({className: "name"},  partner.name), 
        React.DOM.p({className: "description"},  parent.description)
      ));
    });

    return (React.DOM.ul({className: "partner-grid grid grid-three"}, 
      items 
    ));
  }
});

module.exports = PartnerGrid;