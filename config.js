angular.module('nag.rest.config', [])
.provider('nagRestConfig', function() {
  var baseUrl = '';
  var responseDataLocation = '';
  var modelIdProperty = 'id';
  var updateMethod = 'PUT';
  var requestFormatter = function(){};

  return {
    $get: function() {
      return {
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
        }
      }
    },

    setBaseUrl: function(value) {
      baseUrl = value;
    },

    setResponseDataLocation: function(value) {
      responseDataLocation = value;
    },

    setModelIdProperty: function(value) {
      modelIdProperty = value;
    },

    setUpdateMethod: function(value) {
      updateMethod = value;
    },

    setRequestFormatter: function(value) {
      if(_.isFunction(value)) {
        requestFormatter = value;
      }
    }

  }
});
