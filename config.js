/**
 * Handles configuration for the rest system
 *
 * @module nag.rest.config
 * @ngservice nagRestConfig
 */
angular.module('nag.rest.config', [
  'nag.dataValidation'
])
.provider('nagRestConfig', function() {
  var strictMode = false;
  var baseUrl = '';
  var responseDataLocation = '';
  var modelIdProperty = 'id';
  var updateMethod = 'PUT';
  var requestFormatter = function(){};
  var flattenItemRoute = false;
  var validateOnSync = true;

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
  };

  var setUpdateMethod = function(value) {
    updateMethod = value;
  };

  var setFlattenItemRoute = function(value) {
    flattenItemRoute = value;
  };

  var setRequestFormatter = function(value) {
    if(_.isFunction(value)) {
      requestFormatter = value;
    }
  };

  var setValidateOnSync = function(value) {
    validateOnSync = value;
  };

  return {
    $get: function() {
      return {
        /**
         * Retrieve strict mode
         *
         * @method getStrictMode
         *
         * @returns {boolean} Whether or not strict mode is enabled
         */
        getStrictMode: function() {
          return strictMode;
        },

        /**
         * Retrieve the base url for all REST remote calls
         *
         * @method getBaseUrl
         *
         * @returns {string} Base url for all REST remote calls
         */
        getBaseUrl: function() {
          return baseUrl;
        },

        /**
         * Retrieve the default location in the response for where the data will be located
         *
         * @method getResponseDataLocation
         *
         * @returns {string} Default location in the response for where the data will be located
         */
        getResponseDataLocation: function() {
          return responseDataLocation;
        },

        /**
         * Retrieve the default property to use as the model id
         *
         * @method getModelIdProperty
         *
         * @returns {string}
         */
        getModelIdProperty: function() {
          return modelIdProperty;
        },

        /**
         * Retrieve the default HTTP method to use when send data through the REST call
         *
         * @method getUpdateMethod
         *
         * @returns {string}
         */
        getUpdateMethod: function() {
          return updateMethod;
        },

        /**
         * Retrieve the default callback function to use to format the data before sending it through the REST call
         *
         * @method getRequestFormatter
         *
         * @returns {function}
         */
        getRequestFormatter: function() {
          return requestFormatter;
        },

        /**
         * Retrieve the default value to use for setting flattenItemRoute for REST models
         *
         * @method getFlattenItemRoute
         *
         * @returns {boolean}
         */
        getFlattenItemRoute: function() {
          return flattenItemRoute;
        },

        /**
         * Retreives whether or not models should be validated when syncing
         *
         * @method getValidateOnSync
         *
         * @returns {boolean}
         */
        getValidateOnSync: function() {
          return validateOnSync;
        },

        /**
         * Set strict mode
         *
         * @method setStrictMode
         *
         * @param {boolean} Whether or not to enable strict mode
         */
        setStrictMode: setStrictMode,

        /**
         * Set default base url for REST remote calls
         *
         * @method setBaseUrl
         *
         * @param {string} Base url for REST remote calls
         */
        setBaseUrl: setBaseUrl,

        /**
         * Set the default location for where the data will be located in the REST response
         *
         * @method setResponseDataLocation
         *
         * @param {string} Default location with data is in the REST response
         */
        setResponseDataLocation: setResponseDataLocation,

        /**
         * Set the default property to use as the model id
         *
         * @method setModelIdProperty
         *
         * @param {string} Default property to use as model id
         */
        setModelIdProperty: setModelIdProperty,

        /**
         * Set the default tHTTP method to use when sending data with the REST call
         *
         * @method setUpdateMethod
         *
         * @param {function}
         */
        setUpdateMethod: setUpdateMethod,

        /**
         * Set the default callback to use to format the data before sending it through the REST call
         *
         * @method setRequestFormatter
         *
         * @param {function} Default callback to use to format data before sending it through the REST call
         */
        setRequestFormatter: setRequestFormatter,

        /**
         * Set the default value for model's flattenItemRoute option
         *
         * @method setFlattenItemRoute
         *
         * @param {boolean} Whether or not to flatten item routes for models by default
         */
        setFlattenItemRoute: setFlattenItemRoute,

        /**
         * Set whether or not models should be validated when syncing
         *
         * @method setValidateOnSync
         *
         * @param {boolean} Whether or not to flatten item routes for models by default
         */
        setValidateOnSync: setValidateOnSync
      }
    },
    setStrictMode: setStrictMode,
    setBaseUrl: setBaseUrl,
    setResponseDataLocation: setResponseDataLocation,
    setModelIdProperty: setModelIdProperty,
    setUpdateMethod: setUpdateMethod,
    setRequestFormatter: setRequestFormatter,
    setFlattenItemRoute: setFlattenItemRoute,
    setValidateOnSync: setValidateOnSync
  }
});
