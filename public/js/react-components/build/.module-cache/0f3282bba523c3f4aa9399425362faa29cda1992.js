/** @jsx React.DOM */
var React = require("react");

var PartnerGrid = React.createClass({displayName: 'PartnerGrid',
  makeStyleObject: function( imageURL ) {
    return {
      "backgroundImage": "url(" + imageURL + ")"
    };
  },

  onClick: function( pageURL ) {
    return function() {
      window.open( pageURL );
    };
  },

  render: function() {
    var items;

    items = this.props.partners.map(function( partner, i ) {
      return (React.DOM.li({key: i, className: "partner", onClick:  this.onClick( partner.url) }, 
        React.DOM.div({className: "image", style:  this.makeStyleObject( partner.image) }), 
        React.DOM.div({className: "text"}, 
          React.DOM.h4({className: "name"},  partner.name), 
          React.DOM.p({className: "description"},  partner.description)
        )
      ));
    }, this);

    return (React.DOM.ul({className: "partner-grid grid grid-three"}, 
      items 
    ));
  }
});

module.exports = PartnerGrid;