var PartnerGrid = React.createClass({
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
      return (<li className="partner" onClick={ this.onClick( partner.url ) }>
        <div className="image" style={ this.makeStyleObject( partner.image ) } />
        <h4 className="name">{ partner.name }</h4>
        <p className="description">{ parent.description }</p>
      </li>);
    });

    return (<ul className="partner-grid grid grid-three">
      { items }
    </ul>);
  }
});