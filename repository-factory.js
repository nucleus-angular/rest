angular.module('nag.rest')
.factory('nagRestRepositoryFactory', [
  '$http',
  '$q',
  'nagRestSchemaManager',
  'nagRestConfig',
  'nagRestModelFactory',
  function($http, $q, nagRestSchemaManager, nagRestConfig, nagRestModelFactory) {
    /**
     * All the internal properties are exposed through the mngr property.  This is done so not to pollute the top level properties and makes a clean distinction between built-in functionality and custom functionality.
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
         * The schema configured for this repository
         *
         * @property mngr.schema
         * @readonly
         * @type object
         */
        schema: {
          value: schema
        },

        /**
         * Resource name for the repository
         *
         * @property mngr.resourceName
         * @readonly
         * @type string
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         *
         * //Returns
         * // /users
         * userRepository.route();
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         *
         * //Returns
         * // /base/url/users
         * userRepository.fullRoute();
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
         *
         * @example:javascript
         * //using the repository is the recommended way to generate a new models, the first parameter is the
         * //initial data
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create({
         *   firstName: 'John',
         *   lastName: 'Doe'
         * });
         *
         * //now by default it will create a model that has mngr.state set to 'new' so syncing it will make
         * //it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
         * //second parameter a value of true.  just note that you also have to make sure that the idProperty of
         * //initial data is also set otherwise is will still assume the model's mngr.state is 'new' even if
         * //the second parameter has a value of true
         * var remoteUser = userRepository.mngr.create({
         *   id: 123,
         *   firstName: 'John',
         *   lastName: 'Doe'
         * }, true);
         *
         * //the third parameter will allow you to create an instance of a model with a customized schema.  by
         * //default the model generated will use the schema associated to the repository but the third
         * //parameter is a list of overrides for the schema for the instance of that model
         * var customUser = userRepository.mngr.create({}, false, {
         *   route: '/custom/users'
         * });
         */
        create: {
          value: function(initialData, remoteFlag, overrideSchemaOptions) {
            return nagRestModelFactory.create(resourceName, initialData, remoteFlag, overrideSchemaOptions);
          }
        },

        /**
         * Will assume the next request for retrieving data result will or will not be an array (based on passed value), will override schema.isArray
         *
         * @chainable
         *
         * @method mngr.forceIsArray
         *
         * @param {boolean} value Whether or not to for array mode
         *
         * @return {mngr}
         *
         * @example:javascript
         * //now when retrieving data, the library is smarter enough to guess whether the results will be returned
         * //as an array or a single object however sometimes the guess will be wrong.  any time you are retrieving
         * //data without an id, it assumes an array will be returned and when you have an id, it assume an object
         * //will be returned.  now lets say we have a rest api call with the route /session but it returns a
         * //single user object.  one way is to use the forceIsArray() method:

         * // get /session
         * var sessionRepository = nagRestRepositoryFactory.create('user', {
         *   '/session'
         * });
         * sessionRepository.mngr.forceIsArray(false).find();
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
         * @param {int|string|object} [searchData] Data to use to request data
         * @param {object} [overrideHttpConfig] Object to override any $http configurations
         * @param {object} [params] Data that should be sent in the URL as a query string variable
         *
         * @return {object|array} Either a model or an array or model, the object also has the promises .then method attach to access data that way
         *
         * @example:javascript
         * //one method that exists in order to retrieve data from a repository is the find() method.  The first
         * //parameter of find can take an object with key/value pairs that will be inserted into the query string
         * //part of the url.
         *
         * // GET /users?firstName=John
         * var users = userRepository.mngr.find({
         *   firstName: 'John'
         * }).models;
         *
         * //you can also pass a number/string as the first argument and it will assume that is the value of the
         * //idProperty for the data the repository represents.  in this case the result is initially a new empty
         * //model and the data gets filled in once the data is received and processed
         *
         * // GET /users/123
         * var user = userRepository.mngr.find(123).models;
         *
         * //The second parameter allows you to override the htto configuration values.  For example, if you wanted to send custom headers
         * //you could do this:
         *
         * // GET /users with request header x-user:test
         * var users = userRepository.mngr.find({}, {
         *   'x-user': 'test'
         * }).models;
         *
         * //now some rest apis offer the ability to do very complex queries however because of the complexity,
         * //they require you to pass the data in as a post request instead of get and that is what the third
         * //parameter is for.  If the third parameters is an object, it will send the request as a POST with
         * //the data of the third parameters as the content body
         *
         * // POST /users?query=data with content of
         * // {
         * //   "filters": [{
         * //     "field": "email",
         * //     "condition": "like",
         * //     "value": "%@gmail.com"
         * //   }]
         * // }
         * var gmailUsers = userRepository.mngr.find({
         *   query: 'data',
         * }, {
         *   method: 'POST',
         *   data: {
         *     filters: [{
         *       field: 'email',
         *       condition: 'like',
         *       value: '%@gmail.com'
         *     }]
         *   }
         * }).models;
         *
         * //The third parameter allows you to pass in any data you wish to be sent in the url as a query string variable
         * // GET /users/1?foo=bar
         * userRepository.mngr.find(1, {}, {
         *   foo: 'bar'
         * }).models;
         */
        find: {
          value: function(searchData, overrideHttpConfig, params) {
            var getIsArray = function(value) {
              if(_.isBoolean(forceIsArray) || _.isBoolean(schema.isArray)) {
                if(_.isBoolean(forceIsArray)) {
                  value = forceIsArray;
                  forceIsArray = null;
                } else {
                  value = schema.isArray;
                }
              }

              return value;
            };

            params = params || null;
            overrideHttpConfig = overrideHttpConfig || {};

            var idPropertyValue;
            var isArray = true;
            var url = self.mngr.fullRoute;

            var httpConfig = _.extend({
              url: url,
              method: 'GET'
            }, overrideHttpConfig);

            if(_.isPlainObject(searchData) && Object.keys(searchData).length > 0) {
              params = params || {};
              _.extend(params, searchData);
            }

            if(params) {
              httpConfig.params = params;
            }

            if(_.isNumber(searchData) || _.isString(searchData)) {
              isArray = false;

              if(schema.flattenItemRoute === true) {
                url = url.substr(url.lastIndexOf('/'));
              }

              httpConfig.url = url + '/' + searchData;
            }

            isArray = getIsArray(isArray);

            var models = (isArray === true ? [] : self.mngr.create({}, false, schema));
            var deferred = $q.defer();
            value = deferred.promise;
            value.models = models

            if(httpConfig.method === 'JSONP') {
              httpConfig.url += '?callback=JSON_CALLBACK';
            }

            $http(httpConfig)
            .success(function(response) {
              var data = {
                rawResponse: response
              }

              //this generic parsing should handle most cases for data parse but can be disabled if manually parsing is preferred/needed
              if(schema.autoParse === true) {
                data.parsedData = (isArray === true ? [] : null);
                var dataLocation = (isArray === true ? schema.dataListLocation : schema.dataItemLocation);
                var responseData = utilities.stringJsonParser(dataLocation, response);

                //determine to parse as array or object
                if(_(responseData).isArray()) {
                  for(var x = 0; x < responseData.length; x += 1) {
                    newObject = self.mngr.create(responseData[x], true, schema);

                    //push data for the deferred
                    data.parsedData.push(newObject);

                    //push data for the return value
                    value.models.push(newObject);
                  }
                } else if(_(responseData).isObject()) {
                  var newObject = self.mngr.create(responseData, true, schema);

                  //set data for the deferred
                  data.parsedData = newObject;

                  //set data for the return value
                  value.models.mngr.extendData(responseData, true);
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
     * The Repository is the main way to interact with models that map to REST APIs.  You can create an instance of a Repository by using the nagRestRepositoryFactory service.
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
     * var arrayResults = repository.mngr.find().models;
     *
     * //in this instance an empty model will be returned and it will have the data populated once the rest
     * //api returns the data and it is processed
     * var project = user.mngr.getRelation('project', 234.models);
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
     * @module nag.rest
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
       *
       * @example:javascript
       * //all you need to do in order to create a repository is pass in the resourceName that matches the
       * //schema you want
       * var userRepository = nagRestRepositoryFactory.create('user');
       *
       * //there is also a second parameter allowing you to customize the schema for the instance of the
       * //repository that is going to be created.  this is useful if there is a specialized rest api, lets
       * //say /session, that returns a standard resource
       * var sessionRepository = nagRestRepositoryFactory.create('user', {
       *   route: '/session',
       *   dataItemLocation: 'response.data',
       *   isArray: false
       * });
       */
      create: function(resourceName, overrideSchemaOptions) {
        return new BaseRepository(resourceName, overrideSchemaOptions);
      }
    }
  }
]);
