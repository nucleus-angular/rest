angular.module('nag.rest.repository', [
  'nag.rest.config',
  'nag.rest.schemaManager',
  'nag.rest.model'
])
.factory('nagRestRepositoryFactory', [
  '$http',
  '$q',
  'nagRestSchemaManager',
  'nagRestConfig',
  'nagRestModelFactory',
  function($http, $q, nagRestSchemaManager, nagRestConfig, nagRestModelFactory) {
    /**
     * Base repository
     *
     * @class BaseRepository
     * @constructor
     *
     * @param resourceName
     * @param overrideSchemaOptions
     */
    var BaseRepository = function(resourceName, overrideSchemaOptions) {
      var self, schema, forceIsArray;
      self = this;
      forceIsArray = null;
      schema = nagRestSchemaManager.get(resourceName, overrideSchemaOptions);

      this.mngr = {};
      Object.defineProperties(this.mngr, {
        /**
         * Schema for the repository
         *
         * @property mngr.schema
         * @type {object}
         */
        schema: {
          value: schema
        },

        /**
         * Resource name for the repository
         *
         * @property mngr.resourceName
         * @type {string}
         */
        resourceName: {
          value: resourceName
        },

        /**
         * Returns the relative route for the repository excluding the configured base url
         *
         * @method mngr.route
         *
         * @return {string} Repository's relative route
         */
        route: {
          get: function() {
            return schema.route;
          }
        },

        /**
         * Returns the full route for the repository including the configured base url
         *
         * @method mngr.fullRoute
         *
         * @return {string} Repository's full route
         */
        fullRoute: {
          get: function() {
            return nagRestConfig.getBaseUrl() + self.mngr.route
          }
        },

        /**
         * Create a new model based on this repository
         *
         * @method mngr.create
         *
         * @param {object} [initialData] Initial data to use to populate the model
         * @param {boolean} [remoteFlag=false] Whether to mark the model as synced to the remote service
         * @param {object} [overrideSchemaOptions] Override options for the schema for this instance of the model
         *
         * @return {object} New model instance
         */
        create: {
          value: function(initialData, remoteFlag, overrideSchemaOptions) {
            return nagRestModelFactory.create(resourceName, initialData, remoteFlag, overrideSchemaOptions);
          }
        },

        /**
         * Force the repository to consideration the data as an array even if it think it isn't
         *
         * @chainable
         *
         * @method mngr.forceIsArray
         *
         * @param {boolean} value Whether or not to for array mode
         *
         * @return {mngr}
         */
        forceIsArray: {
          value: function(value) {
            forceIsArray = value;
            return self.mngr;
          }
        },

        /**
         * Retrieve data through the REST service
         *
         * @method mngr.find
         *
         * @param {object} [params] Key/Value pairing of parameters to pass in the URL
         * @param {object} [headers] Key/Vlaue pairing of headers to pass along with the request
         * @param {object} [postData] Key/Value paring of data to pass in teh content of a POST
         *
         * @return {object|array} Either a model or an array or model, the object also has the promises .then method attach to access data that way
         */
        find: {
          value: function(params, headers, postData) {
            var getIsArray = function(value) {
              if(_.isBoolean(forceIsArray) || _.isBoolean(schema.isArray)) {
                if(_.isBoolean(forceIsArray)) {
                  value = forceIsArray;
                  forceIsArray = null
                } else {
                  value = schema.isArray;;
                }
              }

              return value;
            };

            params = params || {};
            headers = headers || {};
            postData = postData || {};

            var idPropertyValue;
            var isArray = true;
            var url = self.mngr.fullRoute;

            var httpConfig = {
              url: url,
              method: 'GET'
            };

            if(_.isPlainObject(params) && Object.keys(params).length > 0) {
              httpConfig.params = params;
            }

            if(Object.keys(headers).length > 0) {
              httpConfig.headers = headers;
            }

            if(Object.keys(postData).length > 0) {
              httpConfig.data = postData;
              httpConfig.method = 'POST';
            }

            if(_.isNumber(params) || _.isString(params)) {
              isArray = false;

              if(schema.flattenItemRoute === true) {
                url = url.substr(url.lastIndexOf('/'));
              }

              httpConfig.url = url + '/' + params;
            }

            isArray = getIsArray(isArray);

            var value = (isArray === true ? [] : self.mngr.create({}, false, schema));
            var deferred = $q.defer();
            value.then = deferred.promise.then;

            $http(httpConfig)
            .success(function(response) {

              var data = {
                rawResponse: response
              }
              var internalThen = value.then;

              //this generic parsing should handle most cases for data parse but can be disabled if manually parsing is preferred/needed
              if(schema.autoParse === true) {
                data.parsedData = (isArray === true ? [] : null);
                var dataLocation = (isArray === true ? schema.dataListLocation : schema.dataItemLocation);
                var responseData = stringJsonParser(dataLocation, response);

                //determine to parse as array or object
                if(_(responseData).isArray()) {
                  for(var x = 0; x < responseData.length; x += 1) {
                    newObject = self.mngr.create(responseData[x], true, schema);

                    //push data for the deferred
                    data.parsedData.push(newObject);

                    //push data for the return value
                    value.push(newObject);
                  }
                } else if(_(responseData).isObject()) {
                  var newObject = self.mngr.create(responseData, true, schema);

                  //set data for the deferred
                  data.parsedData = newObject;

                  //set data for the return value
                  value.mngr.extendData(responseData, true);
                  value.then = internalThen;
                }
              }

              deferred.resolve(data);
            })
            .error(function(response) {
              deferred.reject(response);
            });

            return value;
          }
        }
      });
    };

    /**
     * # Repository Factory
     *
     * ## Querying REST API results
     *
     * Unless otherwise specifically stated, any method that makes a request to the api for data, whether returning one or multiple records, can be processed in 2 different ways
     *
     * One way is by value, as shown by the following:
     *
     * ```javascript
     * //in this instance an array will be returned and it will have the data populated once the rest api
     * //returns the data and it is processed
     * var arrayResults = repository.mngr.find();
     *
     * //in this instance an empty model will be returned and it will have the data populated once the rest
     * //api returns the data and it is processed
     * var project = user.mngr.getRelation('project', 234);
     * ```
     *
     * The second way is by way of the promise's then() method, as shown by the following:
     *
     * ```javascript
     * repository.mngr.find().then(function(data) {
     *   //the data parameter has a few properties associated to it.  if the schema configuration has autoParse
     *   //to true (which by default it is) one of them will be parsedData.  in the result of doing a find()
     *   //with a string/number, parsedData is a model and when doing .find() with an object, parsedData is an
     *   //array
     *   users = data.parsedData;
     *
     *   //another element that is always available is the raw unprocessed JSON of the response as the
     *   //rawResponse property.  if you have autoParse set to false then you will have to use the promise
     *   //way of getting the data and process the rawResponse manually in the success of the then() method
     *   var customResponseProcessor = function(response) {
     *     //code...
     *   };
     *   users = customResponseProcessor(data.rawResponse);
     *
     *   //another use for the rawResponse is maybe there is some meta data you need, like for instance the
     *   //rest api supports paging of data and you need that data for the controller
     *   totalRecord; = data.rawResponse.meta.totalRecords;
     * });
     *
     * user.mngr.getRelation('project', 234).then(function(data) {
     *   //the parsedData property will have the model
     *   user = data.parsedData;
     *
     *   //and of course you can do custom processing here too
     *   var customResponseProcessor = function(response) {
     *     //code...
     *   };
     *   user = customResponseProcessor(data.rawResponse);
     * });
     * ```
     *
     * The rest of the code examples might use either of the options for getting the data depending on the situation.
     *
     * @module nag.rest.repository
     * @ngservice nagRestRepositoryFactory
     */
    return {
      /**
       * Create an instance of the repository factory
       *
       * @method create
       *
       * @param {string} resourceName Schema you want to use as th default for the repository factory
       * @param {object} overrideSchemaOptions Override option for the schema for use for this instance of the repository factory
       *
       * @returns {object} Instance of the repository factory
       */
      create: function(resourceName, overrideSchemaOptions) {
        return new BaseRepository(resourceName, overrideSchemaOptions);
      }
    }
  }
]);
