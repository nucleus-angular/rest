angular.module('nag.rest.baseRepository', [
  'nag.rest.config',
  'nag.rest.schemaManager',
  'nag.rest.baseModel'
])
.factory('nagRestBaseRepository', [
  '$http',
  '$q',
  'nagRestSchemaManager',
  'nagRestBaseUrl',
  'nagRestModelIdProperty',
  'nagRestBaseModel',
  'nagRestResponseDataLocation',
  function($http, $q, nagRestSchemaManager, nagRestBaseUrl, nagRestModelIdProperty, nagRestBaseModel, nagRestResponseDataLocation) {
    var baseObject = function() {
      var resourceName = null;
      var schema = {};

      this._setSchema = function(options) {
        if(Object.keys(schema).length === 0) {
          schema = options;
        } else {
          throw new Error("Can't redefine schema once they have been set");
        }
      };

      this._setModelSchemaName = function(name) {
        if(!resourceName) {
          resourceName = name;
        } else {
          throw new Error("Can't redefine resourceName once it has been set");
        }
      };

      this._getSelfRoute = function(withBaseRoute) {
        var selfRoute;

        selfRoute = '';
        withBaseRoute = (withBaseRoute === false ? false : true);

        if(withBaseRoute) {
          selfRoute += nagRestBaseUrl;
        }

        selfRoute += schema.route;

        return selfRoute;
      };

      this.find = function(params, headers, isPost, postData) {
        params = params || {};
        headers = headers || {};
        isPost = (isPost === true ? true : false);
        postData = postData || {};
        var idPropertyValue;
        var self = this;
        var isArray = true;
        var url = this._getSelfRoute()

        var httpConfig = {
          url: url,
          method: (isPost === true ? 'POST' : 'GET')
        };

        if(_.isPlainObject(params) && Object.keys(params).length > 0) {
          httpConfig.params = params;
        }

        if(Object.keys(headers).length > 0) {
          httpConfig.headers = headers;
        }

        if(Object.keys(postData).length > 0) {
          httpConfig.data = postData;
        }

        if(_.isNumber(params) || _.isString(params)) {
          isArray = false;

          httpConfig.url += '/' + params;
        }

        var value = (isArray === true ? [] : self.create());
        var deferred = $q.defer();
        value.then = deferred.promise.then;

        /*httpConfig = _.extend({
            method: 'GET'
        }, httpConfig);*/

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
                 newObject = self.create(responseData[x], true);

                //push data for the deferred
                data.parsedData.push(newObject);

                //push data for the return value
                value.push(newObject);
              }
            } else if(_(responseData).isObject()) {
              var newObject = self.create(responseData, true);

              //set data for the deferred
              data.parsedData = newObject;

              //set data for the return value
              value.set(responseData, null, true);
              value._setSynced(true);
              value.then = internalThen;
            }
          }

          deferred.resolve(data);
        })
        .error(function(response) {
          deferred.reject(response);
        });

        return value;
      };

      this.create = function(data, isRemote, overrideSchemaOptions) {
        overrideSchemaOptions = overrideSchemaOptions || {};
        data = data || {};
        isRemote = isRemote || false;
        return nagRestBaseModel.create(resourceName, data, isRemote, overrideSchemaOptions);
      };
    };

    baseObject.create = function(resourceName, overrideSchemaOptions) {
      var newObject = {};
      this.call(newObject);
      newObject._setSchema(nagRestSchemaManager.get(resourceName, overrideSchemaOptions));
      newObject._setModelSchemaName(resourceName);
      return newObject;
    };

    return baseObject;
  }
]);
