/**
 * Model factory for the rest system
 *
 * @module nag.rest.model
 */
angular.module('nag.rest.model', [
  'nag.rest.config',
  'nag.rest.schemaManager',
  'nag.rest.repository',
  'nag.dataValidation'
])
.factory('nagRestModelFactory', [
  '$injector',
  '$q',
  '$http',
  'nagRestSchemaManager',
  'nagRestConfig',
  'nagDataValidation',
  function($injector, $q, $http, nagRestSchemaManager, nagRestConfig, nagDataValidation) {
    var validationErrorTemplateCompiler = function(template, variables) {
      if(_.isObject(variables)) {
        _.forEach(variables, function(value, variableName) {
          template = template.replace('%%' + variableName + '%%', value);
        });
      }

      return template;
    };

    var modelValidationRules = {
      required: {
        name: 'required',
        validator: function(value, context) {
          return nagDataValidation.validate('notEmpty', value) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'is required'
        }
      },
      email: {
        name: 'email',
        validator: function(value, context) {
          return nagDataValidation.validate('email', value) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be an email'
        }
      },
      min: {
        name: 'min',
        validator: function(value, context) {
          return nagDataValidation.validate('min', value, context.min) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be %%min%% or higher'
        }
      },
      max: {
        name: 'max',
        validator: function(value, context) {
          return nagDataValidation.validate('max', value, context.max) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be %%max%% or lower'
        }
      },
      range: {
        name: 'range',
        validator: function(value, context) {
          return nagDataValidation.validate('range', value, context.min, context.max) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be between %%min%% and %%max%%'
        }
      }
    }

    /**
     * Base model
     *
     * @class BaseModel
     * @constructor
     *
     * @param resourceName
     * @param initialData
     * @param remoteFlag
     * @param overrideSchemaOptions
     */
    var BaseModel = function(resourceName, initialData, remoteFlag, overrideSchemaOptions) {
      var self, data, originalData, schema, modelProperties, isArray, extendData, deletedFlag;
      initialData = initialData || {};
      self = this;
      data = {};
      originalData = {};
      modelProperties = {}
      deletedFlag = false;

      extendData = function(newData, setRemoteFlag) {
        newData = nagRestSchemaManager.normalizeData(schema, newData);
        _.merge(data, newData);

        if(setRemoteFlag === true) {
          remoteFlag = true;
        }
      };

      //initialization code
      overrideSchemaOptions = overrideSchemaOptions || {};
      schema = nagRestSchemaManager.get(resourceName, overrideSchemaOptions);
      extendData(initialData, remoteFlag);

      //setup properties for object
      var modelProperties = {};

      _.forEach(schema.properties, function(value, key) {
        var defaultGetMethod, defaultSetMethod;
        defaultGetMethod = function() {
          var value = !_.isUndefined(data[key]) ? data[key] : null;

          //see if we need to apply any custom getter logic
          if(schema.properties[key].getter) {
            value = schema.properties[key].getter.apply(undefined, [value]);
          }

          return value;
        };
        defaultSetMethod = function(value) {
          if(data[key] != value) {
            if(!_.isUndefined(data[key]) && !_.isNull(data[key])) {
              originalData[key] = data[key];
            }

            //see if we need to apply any custom setter logic
            if(schema.properties[key].setter) {
              value = schema.properties[key].setter.apply(data, [value]);
            }

            data[key] = value;
          }
        }

        modelProperties[key] = {
          get: defaultGetMethod,
          set: defaultSetMethod
        };
      }, this);

      Object.defineProperties(this, modelProperties);

      //setup the manager (mngr) property
      this.mngr = {};

      Object.defineProperties(this.mngr, {
        /**
         * Schema for the model
         *
         * @property mngr.schema
         * @type {object}
         */
        schema: {
          value: schema
        },

        /**
         * The current state of the model, can be
         * - loaded
         * - dirty
         * - deleted
         * - new
         *
         * @property mngr.state
         * @type {string}
         */
        state: {
          get: function() {
            if(remoteFlag === true && data[self.mngr.schema.idProperty] && Object.keys(originalData).length === 0) {
              return 'loaded';
            } else if(remoteFlag === true && Object.keys(originalData).length > 0) {
              return 'dirty';
            } else if(deletedFlag === true) {
              return 'deleted';
            } else {
              return 'new';
            }
          }
        },

        /**
         * Reset the model
         *
         * @method mngr.reset
         *
         * @example
         * model.reset();
         *
         * @example
         * model.reset();
         */
        reset: {
          value: function() {
            _.merge(data, originalData);
            originalData = {};
          }
        },

        /**
         * Retrieve the properties the properties that are dirty
         *
         * @property mngr.dirtyProperties
         * @type {array}
         */
        dirtyProperties: {
          get: function() {
            return Object.keys(originalData);
          }
        },

        /**
         * Returns a plain JSON representation of the model
         *
         * @method mngr.toJson
         *
         * @return {object} JSON representation of the model
         */
        toJson: {
          value: function() {
            var returnData = {};

            _.forEach(self.mngr.schema.properties, function(value, key) {
              returnData[key] = self[key];
            }, this);

            return returnData;
          }
        },

        /**
         * Whether or the the model is sync with the REST service
         *
         * @property mngr.isRemote
         * @type {boolean}
         */
        isRemote: {
          value: function() {
            return (self.mngr.state === 'loaded' || self.mngr.state === 'dirty');
          }
        },

        /**
         * Returns the relative route for the model excluding the configured base url
         *
         * @method mngr.route
         *
         * @return {string} Model's relative route
         */
        route: {
          get: function() {
            var selfRoute;

            selfRoute = self.mngr.schema.route;

            if(self.mngr.isRemote()) {
              if(self.mngr.schema.flattenItemRoute === true) {
                selfRoute = selfRoute.substr(selfRoute.lastIndexOf('/'));
              }

              selfRoute += '/' + self[self.mngr.schema.idProperty];
            }

            return selfRoute;
          }
        },

        /**
         * Returns the full route for the model including the configured base url
         *
         * @method mngr.fullRoute
         *
         * @return {string} Model's full route
         */
        fullRoute: {
          get: function() {
            return nagRestConfig.getBaseUrl() + self.mngr.route
          }
        },

        /**
         * Set multiple values of the model at once
         *
         * @method mngr.extendData
         *
         * @param {object} Properties to set
         */
        extendData: {
          value: extendData
        },

        /**
         * Sync the model with the REST service
         *
         * @method mngr.sync
         *
         * @oaram {string} [method] HTTP method to use (override default logic that determines this)
         * @param {boolean} [syncLocal=true] Whether or not the local model instance should sync the data recieved from the sync call
         *
         * @return {promise} Promise that can be used to trigger additional functionality of success/failure of the sync process
         */
        sync: {
          value: function(method, syncLocal) {
            var requestData, getSyncData, deferred, validationResults;

            //see if we should validate the model first
            if(nagRestConfig.getValidateOnSync() === true) {
              validationResults = self.mngr.validate();

              if(validationResults !== true) {
                return validationResults;
              }
            }

            syncLocal = (syncLocal !== false);
            getSyncData = function(type) {
              //just return the json of the model if doing a full sync
              if(type === 'full') {
                return self.mngr.toJson();
              }

              //return an empty object if there are no dirty properties
              if(self.mngr.state === 'loaded') {
                return {};
              }

              var syncData;

              type = type || (self.mngr.isRemote() ? 'update' : 'create');
              var syncingObject = (type === 'update' ? originalData : self.mngr.schema.properties);
              syncData = {};

              //build the object of properties that need to be synced
              _.forEach(syncingObject, function(value, key) {
                if(
                  _.isUndefined(self.mngr.schema.properties[key].sync)
                  ||_.isNull(self.mngr.schema.properties[key].sync)
                  || type === self.mngr.schema.properties[key].sync
                ) {
                  syncData[key] = self[key];
                }
              });

              return syncData;
            };
            requestData = {};
            deferred = $q.defer();

            if(!method) {
              method = (self.mngr.state === 'new' ? 'POST' : nagRestConfig.getUpdateMethod());
            }

            if(method === 'POST') {
              requestData = getSyncData('create');
            } else if(method === 'PUT') {
              requestData = getSyncData('full');
            } else if(method !== 'DELETE') {
              requestData = getSyncData('update');
            }

            requestData = nagRestSchemaManager.normalizeData(schema, requestData, 'outgoing');
            var finalDataFormat = self.mngr.schema.requestFormatter(requestData) || requestData;

            $http({
              url: self.mngr.fullRoute,
              method: method,
              data: finalDataFormat
            })
            .success(function(response) {
              if(syncLocal) {
                var modelData = stringJsonParser(schema.dataItemLocation, response);
                self.mngr.extendData(modelData);
                originalData = {};
              }
              deferred.resolve(response);
            }).error(function() {
              deferred.reject('Unable to sync data');
            });

            //if we posted this object, then isRemote should be true
            if(method === 'POST') {
              remoteFlag = true;
            }

            return deferred.promise;
          }
        },

        /**
         * Deletes the model fromt he REST service
         *
         * @method mngr.delete
         */
        destroy: {
          value : function() {
            if(self.mngr.isRemote()) {
              self.mngr.sync('DELETE', false);

              //clear of the idProperty
              self[self.mngr.schema.idProperty] = null;

              remoteFlag = false;
              deletedFlag = true;
              originalData = {};
            }
          }
        },
        /**
         * Retrieve a model or groups of models related to this model
         *
         * @method mngr.getRelation
         *
         * @param {string} relationName The relationship name as defined in the schema
         * @param {mixed} relationId The id of the relational model you want to get
         *
         * @return {object|array} Either a model or an array or model, the object also has the promises .then method attach to access data that way
         */
        getRelation: {
          value: function(relationName, relationId) {
            if(!schema.relations[relationName]) {
              throw new Error('There is no relationship defined for ' + relationName);
            }

            var value;
            var resourceName = schema.relations[relationName].resource || relationName;
            var relationshipSchema = nagRestSchemaManager.get(resourceName);

            relationshipSchema.flattenItemRoute =
            (_.isBoolean(schema.relations[relationName].flatten)
            ? schema.relations[relationName].flatten
            : schema.flattenItemRoute);

            relationshipSchema.route = self.mngr.route + relationshipSchema.route;
            relationshipSchema.isArray = (_.isBoolean(schema.relations[relationName].isArray) ? schema.relations[relationName].isArray : null);

            //this is manually injected in order to
            var nagRestRepositoryFactory = $injector.get('nagRestRepositoryFactory');
            var modelService = nagRestRepositoryFactory.create(resourceName, relationshipSchema);

            //determine if we are getting all one or a single relationship model
            if(relationId || schema.relations[relationName].property) {
              relationId = relationId || self[schema.relations[relationName].property];
              value = modelService.mngr.find(relationId);
            } else {
              value = modelService.mngr.find();
            }

            return value;
          }
        },

        validate: {
          value: function(passedPropertyName) {
            var runValidation = function(currentValidation, propertyName) {
              var validationExecutionResults = {};

              if(_.isString(currentValidation)) {
                validationExecutionResults.name = modelValidationRules[currentValidation].name;
                validationExecutionResults.results = modelValidationRules[currentValidation].validator(self[propertyName], modelValidationRules[currentValidation].context);
              } else if(_.isObject(currentValidation)) {
                validationExecutionResults.name = currentValidation.name;
                validationExecutionResults.results = currentValidation.validator(self[propertyName], currentValidation.context);
              }

              return validationExecutionResults;
            };

            var validateProperty = function(propertyName) {
              var propertyValidationRules = schema.properties[propertyName].validation;
              var propertyValid = propertyValidationRules ? {} : true;
              var propertyValidationResults;

              if(propertyValid !== true) {
                _.forEach(Object.keys(propertyValidationRules), function(validationName) {
                  var validationRule;

                  //todo: we should cache this process so it is only done once per model
                  if(modelValidationRules[validationName]) {
                    validationRule = _.clone(modelValidationRules[validationName], true);

                    if(_.isObject(propertyValidationRules[validationName].context)) {
                      _.extend(validationRule.context, propertyValidationRules[validationName].context);
                    }
                  } else {
                    validationRule = propertyValidationRules[validationName];
                  }

                  validationRule.name = validationName;

                  propertyValidationResults = runValidation(validationRule, propertyName);

                  if(propertyValidationResults.results !== true) {
                    propertyValid[propertyValidationResults.name] = propertyValidationResults.results;
                  }
                });
                /*if(!_.isArray(propertyValidationRules)) {
                  propertyValidationResults = runValidation(propertyValidationRules, propertyName);

                  if(propertyValidationResults.results !== true) {
                    propertyValid[propertyValidationResults.name] = propertyValidationResults.results;
                  }
                } else {
                  _.forEach(propertyValidationRules, function(val) {
                    propertyValidationResults = runValidation(val, propertyName);

                    if(propertyValidationResults.results !== true) {
                      propertyValid[propertyValidationResults.name] = propertyValidationResults.results;
                    }
                  });
                }*/
              }

              return _.isObject(propertyValid) && Object.keys(propertyValid).length > 0 ? propertyValid : true;
            }

            var results;

            if(!_.isUndefined(passedPropertyName)) {
              results = validateProperty(passedPropertyName);
            } else {
              results = {};

              _.forEach(schema.properties, function(defination, name) {
                var outerValidationResults = validateProperty(name);

                if(outerValidationResults !== true) {
                  results[name] = outerValidationResults;
                }
              });
            }

            return _.isObject(results) && Object.keys(results).length > 0 ? results : true;
          }
        }
      });
    };

    /**
     * Model factory
     *
     * @ngservice nagRestModelFactory
     */
    return {
      /**
       * Create an instance of the model factory
       *
       * @method create
       *
       * @param {string} resourceName Schema to use for this model factory instance
       * @param {object} initialData Default data for this model factory instance
       * @param {boolean} remoteFlag  Default remoteFlag for this model factory instance
       * @param {object} overrideSchemaOptions Override options for this model factory instance
       *
       * @returns {object} Instance of the model factory
       */
      create: function(resourceName, initialData, remoteFlag, overrideSchemaOptions) {
        return new BaseModel(resourceName, initialData, remoteFlag, overrideSchemaOptions);
      }
    };
  }
]);
