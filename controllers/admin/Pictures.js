var BaseController = require('../Admin');

module.exports = function () {
  
};
module.exports.prototype = BaseController.prototype.extend({
  name: 'pictures',

  indexAction: function() {
    var pictures = [],
      _this = this;
    this.mongodb
      .collection('pictures')
      .find({}, {data:0})
      .each(function(err, doc) {
        if (doc) {
          pictures.push(doc);
        }
        else {
          _this.view.render({
            title: 'Bilder verwaltung',
            pictures: pictures
          });
        }
      });
  }
});