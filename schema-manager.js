/**
 * Manages all the schemas for the rest system
 *
 * @module nag.rest.schemaManager
 * @ngservice nagRestSchemaManager
 */
angular.module('nag.rest.schemaManager', [
  'nag.rest.config'
])
.factory('nagRestSchemaManager', [
  'nagRestConfig',
  function(nagRestConfig) {
    var schemas;

    schemas = {};

    return {
      /**
       * Retrieve a schema
       *
       * @method get
       *
       * @param {string} resourceName The name of the schema you want, referred to as a resource name
       * @param {object} [overrideSchemaOptions] Overriding options to be applied to the resulting schema
       *
       * @returns {object} Schema based on the requested resource
       */
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

      /**
       * Add a schema
       *
       * @method add
       *
       * @param {string} resourceName Unique string to identify this schema, referred to as a resource name
       * @param {object} schema Schema options
       */
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
            flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
            inherit: null
          }, schema);
        }
      },

      /**
       * Removing a schema
       *
       * @method remove
       *
       * @param {string} resourceName Name of the schema to remove, referred to as a resource name
       */
      remove: function(resourceName) {
        delete schemas[resourceName];
      },

      /**
       * Normalize a data object using the configuration of a schema
       *
       * @method normalizeData
       *
       * @param {string} schema Schema name to use for normalization, referred to as a resource name
       * @param {object} data Data to normalize
       * @param {string} way Which way to normalize or how the data is traveling (either 'outgoing' or 'incoming')
       * @returns {object} Normalized data based on the schema
       */
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
