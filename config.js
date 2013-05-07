angular.module('nag.rest.config', [])
.provider('nagRestConfig', function() {
  var strictMode = false;
  var baseUrl = '';
  var responseDataLocation = '';
  var modelIdProperty = 'id';
  var updateMethod = 'PUT';
  var requestFormatter = function(){};
  var flattenItemRoute = false;

  var setStrictMode = function(value) {
    strictMode = value;
  };

  var setBaseUrl = function(value) {
    baseUrl = value;
  };

  var setResponseDataLocation = function(value) {
    responseDataLocation = value;
  };

  var setModelIdProperty = function(value) {
    modelIdProperty = value;
  }

  var setUpdateMethod = function(value) {
    updateMethod = value;
  }

  var setFlattenItemRoute = function(value) {
    flattenItemRoute = value;
  }

  var setRequestFormatter = function(value) {
    if(_.isFunction(value)) {
      requestFormatter = value;
    }
  };

  return {
    $get: function() {
      return {
        getStrictMode: function() {
          return strictMode;
        },
        getBaseUrl: function() {
          return baseUrl;
        },
        getResponseDataLocation: function() {
          return responseDataLocation;
        },
        getModelIdProperty: function() {
          return modelIdProperty;
        },
        getUpdateMethod: function() {
          return updateMethod;
        },
        getRequestFormatter: function() {
          return requestFormatter;
        },
        getFlattenItemRoute: function() {
          return flattenItemRoute;
        },
        setStrictMode: setStrictMode,
        setBaseUrl: setBaseUrl,
        setResponseDataLocation: setResponseDataLocation,
        setModelIdProperty: setModelIdProperty,
        setUpdateMethod: setUpdateMethod,
        setRequestFormatter: setRequestFormatter,
        setFlattenItemRoute: setFlattenItemRoute
      }
    },
    setStrictMode: setStrictMode,
    setBaseUrl: setBaseUrl,
    setResponseDataLocation: setResponseDataLocation,
    setModelIdProperty: setModelIdProperty,
    setUpdateMethod: setUpdateMethod,
    setRequestFormatter: setRequestFormatter,
    setFlattenItemRoute: setFlattenItemRoute
  }
});
