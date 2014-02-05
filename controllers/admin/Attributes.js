'use strict';

var AdminController = require('../Admin'),
  attributeModel = require('../../models/Attribute');

module.exports = function () {

};
module.exports.prototype = AdminController.prototype.extend({
  name: 'attributes',

  indexAction: function() {
    var attributes = [],
      _this = this;
    this.mongodb
      .collection(attributeModel.collection)
      .find({})
      .toArray(function(err, attributes){
        _this.view.render({
          title: 'Attribute Verwaltung',
          attributes: attributes,
          attributeTypes: attributeModel.getTypes()
        });
      });
  },

  createAction: function() {
    var _this = this,
      attribute = this.getAttributeFromRequest();
    if (attribute) {
      this.mongodb
        .collection(attributeModel.collection)
        .insert(
          attribute,
          {w:1},
          function(err, objects) {
            if (err) console.warn(err.message);
            if (err && err.message.indexOf('E11000 ') !== -1) {
              // this _id was already inserted in the database
            }
            // TODO: error handler
            _this.response.redirect('..');
          });
    }
    else {
      throw new Error('fuck');
      // TODO: error handler
      this.response.redirect('..');
    }
  },

  showEnumsAction: function() {
    var _this = this;
    _this.mongodb
      .collection(attributeModel.collection)
      .find({name: _this.request.param('attribute')})
      .nextObject(function(err, attribute) {
        _this.view.render({attribute: attribute});
      });
  },

  saveEnumsAction: function() {
    var _this = this;
    _this.mongodb
      .collection(attributeModel.collection)
      .update(
        {name: _this.request.param('attribute')},
        {$set: {values: _this.request.param('enums')}},
        {},
        function(err) {
          _this.response.json({result:'success'});
        });
  },

  getAttributeFromRequest: function() {
    var req = this.request,
      attribute = {};
    // check for unallowed chars in attribute name
    if (!req.param('name') || !req.param('name').match(/^[a-z][a-z0-9_]*$/))
      return false;
    attribute.name = req.param('name');

    if (!req.param('title').trim()) // check for empty title
      return false;
    attribute.title = req.param('title');

    attribute.is_enum = !!req.param('is_enum');

    // last check. iterate over all types
    var paramType = req.param('type'),
      types = attributeModel.getTypes();
    for (var typeIndex in types) {
      if (types[typeIndex].name === paramType) {
        // TODO: check for enum
        attribute.type = paramType;
        return attribute;
      }
    }
    return false;
  },
});
