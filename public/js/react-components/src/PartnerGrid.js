/** @jsx React.DOM */
var React = require("react");

var PartnerGrid = React.createClass({
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
      return (<li key={ i } className="partner" onClick={ this.onClick( partner.url ) }>
        <div className="image" style={ this.makeStyleObject( partner.image ) } />
        <h4 className="name">{ partner.name }</h4>
        <p className="description">{ partner.description }</p>
      </li>);
    }, this);

    return (<ul className="partner-grid grid grid-three">
      { items }
    </ul>);
  }
});

module.exports = PartnerGrid;