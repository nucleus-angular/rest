angular.module('nag.rest.schemaManager', [
  'nag.rest.config'
])
.factory('nagRestSchemaManager', [
  'nagRestConfig',
  function(nagRestConfig) {
    var schemas;

    schemas = {};

    return {
      get: function(resourceName, overrideSchemaOptions) {
        if(_.isPlainObject(schemas[resourceName])) {
          if(overrideSchemaOptions) {
            //clone the schema so we don't overwrite any stored data
            var newSchema = _.clone(schemas[resourceName], true);

            return _.merge(newSchema, overrideSchemaOptions);
          }

          return _.clone(schemas[resourceName], true);
        }
      },

      add: function(resourceName, schema) {
        //make sure the schema is defined as an object
        if(_.isPlainObject(schema)) {
          schemas[resourceName] = _.extend({
            route: null,
            idProperty: nagRestConfig.getModelIdProperty(),
            properties: {},
            relations: {},
            dataListLocation: nagRestConfig.getResponseDataLocation(),
            dataItemLocation: nagRestConfig.getResponseDataLocation(),
            autoParse: true,
            requestFormatter: nagRestConfig.getRequestFormatter(),
            isArray: null,
            flattenItemRoute: nagRestConfig.getFlattenItemRoute()
          }, schema);
        }
      },

      remove: function(resourceName) {
        delete schemas[resourceName];
      },

      normalizeData: function(schema, data, way) {
        var normalizedData = {};
        way = (way === 'outgoing' ? 'outgoing' : 'incoming');

        _.forEach(schema.properties, function(value, key) {
          var remoteProperty = (!_.isUndefined(value.remoteProperty) && !_.isNull(value.remoteProperty) ? value.remoteProperty : key);
          var normalizedKey = (way === 'outgoing' ? remoteProperty : key);
          var noneNormalizedKey = (way === 'outgoing' ? key : remoteProperty);

          normalizedData[normalizedKey] = data[noneNormalizedKey] || data[key];
        });

        return normalizedData;
      }
    };
  }
]);