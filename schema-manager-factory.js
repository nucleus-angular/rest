/**
 * # Schema Manager
 *
 * The Schema Manager allow you to define and retrieve the structure that define the data the is being used in the REST API.
 *
 * The structure of the schema is as follows:
 *
 * - **route (default: null)**
 * - The relatively route from the configured base url to this resource
 * - **idProperty (default: nagRestConfig.getModelIdProperty())**
 * - The property that represents the id (generally a primary key in a database)
 * - **properties: (default: {})**
 * - An object with the definition of all the valid properties for the resource where the key is the property name and the value is the property configuration.  Property configuration can be:
 *   - sync: Tells when this property should be saved (NOTE: when doing a PUT sync, these values are ignored).  The value are:
 *     - false - don't sync ever (can not set data)
 *     - 'create' - only save on create (can only set data when model is not synced)
 *     - 'update' - only save on update (con only set data when model is synced)
 *   - remoteProperty: If you want the name of the property of the model to be different from the property that the remote api gives, give the remote property name here and it will normalize the property name both incoming and outgoing.
 * - **relations**: This is an object where the key is the name of the resource and the value its configuration
 *   - resource: The resourceName this relation links to
 *   - flatten: Used to set the flattenItemRoute when retrieving models using getRelation().  if not set, flattenItemRoute will be set to the value of the flattenItemRoute of the resource schema the relation belongs to
 * - **dataListLocation: (default: nagRestConfig.getResponseDataLocation())**
 * - A string representing the JSON hierarchy where the data in location in the REST API response when returning a list of resources
 * - **dataItemLocation: (default: getResponseDataLocation())**
 * - A string representing the JSON hierarchy where the data in location in the REST API response when returning a single resource
 * - **autoParse: (default: true)**
 * - Whether or not to automatically parse the REST API response
 * - **requestFormatter: (default: nagRestConfig.getRequestFormatter())**
 * - A function that can wrap the model data in a specific format before sending it to the REST API.  This function take one parameter and that in the model data that is being sent.  The data passed into this callback has already been normalized to the proper format the REST API is expecting for the names of the property of the model.
 * - **isArray**: (default: null)
 * - Determines whether all requests are or are not arrays when retrieving data.  This can be override on a call by call level with the forceIsArray() method on models/repositories
 * - **flattenItemRoute**: (default: nagRestConfig.getFlattenItemRoute())
 * - if set to true, mngr.route/mngr.fullRoute will remove all but the last resource path. (```/users/123/projects/234/teams/345``` would be converted to ```/teams/345```).  This only applies to when there is a trailing id, if the trailing element in the url is a resource name, nothing will get removed (```/users/123/projects/234/teams``` would remain the same)
 *
 * @module nag.rest
 * @ngservice nagRestSchemaManager
 */
angular.module('nag.rest')
.factory('nagRestSchemaManager', [
  'nagRestConfig',
  function(nagRestConfig) {
    var schemas;

    schemas = {};

    return {
      /**
       * Retrieve a stored schema
       *
       * @method get
       *
       * @param {string} resourceName The name of the schema you want, referred to as a resource name
       * @param {object} [overrideSchemaOptions] Overriding options to be applied to the resulting schema
       *
       * @returns {object} Schema based on the requested resource
       *
       * @example:javascript
       * nagRestSchemaManager.add('user', userSchema);
       *
       * //this will return a copy of the schema that is tied to the 'user' resource.  this copy can be modified
       * //without the stored version being effected
       *
       * // resulting object:
       * // {
       * //   route: '/users',
       * //   properties: {
       * //     id: {
       * //       sync: false
       * //     },
       * //     firstName: {},
       * //     lastName: {},
       * //     username: {},
       * //     email: {}
       * //   },
       * //   relations: {
       * //     project: {
       * //       resource: 'project'
       * //     }
       * //   },
       * //   dataListLocation: 'response.data.users',
       * //   dataItemLocation: 'response.data.user'
       * // }
       *
       * var pulledUserSchema = nagRestSchemaManager.get('user');
       *
       * //you can also pass in a second parameter that will override values in the resulting schema, it will not
       * //effect anything stored in the schema manager itself.  it will also override recursively meaning that
       * //if you want to override one of the properties, you can do that without effecting the other properties.
       *
       * // returns:
       * // {
       * //   route: '/custom/users',
       * //   properties: {
       * //     id: {
       * //       sync: false
       * //     },
       * //     firstName: {},
       * //     lastName: {},
       * //     username: {},
       * //     email: {
       * //       sync: 'create'
       * //     }
       * //   },
       * //   relations: {
       * //     project: {
       * //       resource: 'project'
       * //     },
       * //     manager: {
       * //       resource: 'user'
       * //     }
       * //   },
       * //   dataListLocation: 'response.data.users',
       * //   dataItemLocation: 'response.data.user'
       * // }
       *
       * var customUserSchema = nagRestSchemaManager.get('user', {
       *   route: '/custom/users',
       *   properties: {
       *     email: {
       *       sync: 'create'
       *     }
       *   },
       *   relations: {
       *     manager: {
       *       resource: 'user'
       *     }
       *   }
       * });
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
       * Adds a schema (look at <a href="#schema">schema</a> to see the schema structure)
       *
       * @method add
       *
       * @param {string} resourceName Unique string to identify this schema, referred to as a resource name
       * @param {object} schema Schema options
       *
       * @example:javascript
       * //lets define a schema object
       * var userSchema = {
       *   route: '/users',
       *   properties: {
       *     id: {
       *       sync: false
       *     },
       *     firstName: {},
       *     lastName: {},
       *     username: {},
       *     email: {}
       *   },
       *   relations: {
       *     project: {
       *       resource: 'team'
       *     }
       *   },
       *   dataListLocation: 'response.data.users',
       *   dataItemLocation: 'response.data.user'
       * };
       *
       * //after this you will be able to pass the string 'user' with anything asking for a resourceName
       * nagRestSchemaManager.add('user', userSchema);
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
            isArray: nagRestConfig.getIsArray(),
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
       *
       * @example:javascript
       * nagRestSchemaManager.add('user', userSchema);
       *
       * //this will remove the schema from the manager
       * nagRestSchemaManager.remove('user');
       *
       * // returns:
       * // undefined
       * var pulledUserSchema = nagRestSchemaManager.get('user');
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
       *
       * @example:javascript
       * var schema = {
       *   route: '/users',
       *   properties: {
       *     id: {
       *       remoteProperty: 'IdenTiFIer'
       *     },
       *     firstName: {
       *       remoteProperty: 'firstname'
       *     },
       *     lastName: {
       *       remoteProperty: 'LAST_NAME'
       *     }
       *   }
       * };
       *
       * // returns:
       * // {
       * //   id: 1,
       * //   firstName: 'John',
       * //   lastName: 'Doe'
       * // }
       * var incomingDataNormalized = nagRestSchemaManager.normalizeData(schema, {
       *   IdenTiFIer: 1,
       *   firstname: 'John',
       *   LAST_NAME: 'Doe'
       * });
       *
       * // returns:
       * // {
       * //   IdenTiFIer: 1,
       * //   firstname: 'John',
       * //   LAST_NAME: 'Doe'
       * // }
       * var outgoingDataNormalized = nagRestSchemaManager.normalizeData(schema, {
       *   id: 1,
       *   firstName: 'John',
       *   lastName: 'Doe'
       * }, 'outgoing');
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
