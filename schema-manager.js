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
            flattenItemRoute: true
          }, schema);
        }
      },

      remove: function(resourceName) {
        delete schemas[resourceName];
      }
    };
  }
]);