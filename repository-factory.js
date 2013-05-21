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
    var BaseRepository = function(resourceName, overrideSchemaOptions) {
      var self, schema, forceIsArray;
      self = this;
      forceIsArray = null;
      schema = nagRestSchemaManager.get(resourceName, overrideSchemaOptions);

      this.mngr = {};
      Object.defineProperties(this.mngr, {
        schema: {
          value: schema
        },
        resourceName: {
          value: resourceName
        },
        route: {
          get: function() {
            return schema.route;
          }
        },
        fullRoute: {
          get: function() {
            return nagRestConfig.getBaseUrl() + self.mngr.route
          }
        },
        create: {
          value: function(initialData, remoteFlag, overrideSchemaOptions) {
            return nagRestModelFactory.create(resourceName, initialData, remoteFlag, overrideSchemaOptions);
          }
        },
        forceIsArray: {
          value: function(value) {
            forceIsArray = value;
            return self.mngr;
          }
        },
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

    return {
      create: function(resourceName, overrideSchemaOptions) {
        return new BaseRepository(resourceName, overrideSchemaOptions);
      }
    }
  }
]);
