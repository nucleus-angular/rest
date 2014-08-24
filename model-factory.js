angular.module('nag.rest')
.factory('nagRestModelFactory', [
  '$injector',
  '$q',
  '$http',
  'nagRestSchemaManager',
  'nagRestConfig',
  function($injector, $q, $http, nagRestSchemaManager, nagRestConfig) {
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
          return dataValidation.validate('notEmpty', value) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'is required'
        }
      },
      email: {
        name: 'email',
        validator: function(value, context) {
          return dataValidation.validate(this.name, value) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be an email'
        }
      },
      minValue: {
        name: 'minValue',
        validator: function(value, context) {
          return dataValidation.validate(this.name, value, context.min) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be %%min%% or higher'
        }
      },
      maxValue: {
        name: 'maxValue',
        validator: function(value, context) {
          return dataValidation.validate(this.name, value, context.max) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be %%max%% or lower'
        }
      },
      rangeValue: {
        name: 'rangeValue',
        validator: function(value, context) {
          return dataValidation.validate(this.name, value, context.min, context.max) || validationErrorTemplateCompiler(context.errorTemplate, context);
        },
        context: {
          errorTemplate: 'must be between %%min%% and %%max%%'
        }
      }
    }

    /**
     * # Base Model
     *
     * All the internal properties are exposed through the .mngr property.  This is done so not to pollute the top level properties and makes a clean distinction between built-in functionality and custom functionality.
     *
     * ## Properties
     *
     * Properties configured in the schema for the model are exposed as simple properties of the model object itself.
     *
     * ```javascript
     * var userRepository = nagRestRepositoryFactory.create('user');
     * var user = userRepository.create({
     *   id: 1,
     *   firstName: 'John';
     *   lastName: 'Doe'
     * });
     *
     * // returns:
     * // 1
     * user.id;
     *
     * // returns:
     * // 'John'
     * user.firstName;
     *
     * // returns:
     * // 'Doe'
     * user.lastName;
     * ```
     *
     * @module nag.rest
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

      //initialization code
      overrideSchemaOptions = overrideSchemaOptions || {};
      schema = nagRestSchemaManager.get(resourceName, overrideSchemaOptions);

      extendData = function(newData, setRemoteFlag) {
        var objectKeys = Object.keys(newData);

        if(objectKeys.length > 0) {
          newData = nagRestSchemaManager.normalizeData(schema, newData);

          //redefine to make sure we are using the correct property names
          objectKeys = Object.keys(newData);

          _.forEach(objectKeys, function(value) {
            self[value] = newData[value];
          });

          if(setRemoteFlag === true) {
            remoteFlag = true;
          }
        }
      };

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

      extendData(initialData, remoteFlag);

      //extend constructor is available
      if(schema.inherit) {
        _.extend(this, schema.inherit);
      }

      //setup the manager (mngr) property
      this.mngr = {};

      Object.defineProperties(this.mngr, {
        /**
         * Schema for the model
         *
         * @property mngr.schema
         * @readonly
         * @type {object}
         */
        schema: {
          value: schema
        },

        /**
         * The current state of the model. Can be the following:
         * - loaded: The model's data is the latest data that is is aware of
         * - dirty: The model has changes that have yet to be synced
         * - deleted: The model has been processed for deletion
         * - new: The model is not yet sent through the api to be process (generally persistent to some backend)
         *
         * @property mngr.state
         * @readonly
         * @type {string}
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create();
         *
         * // returns:
         * // 'new'
         * user.mngr.state;
         *
         * user.firstName = 'John';
         * user.lastName = 'Doe';
         * user.mngr.sync();
         *
         * // returns:
         * // 'loaded'
         * user.mngr.state;
         *
         * user.firstName = 'John2';
         *
         * // returns:
         * // 'dirty'
         * user.mngr.state;
         *
         * user.delete();
         *
         * // returns:
         * // 'deleted'
         * user.mngr.state;
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
         * Resets the model
         *
         * @method mngr.reset
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create({
         *   id: 1,
         *   firstName: 'John',
         *   lastName: 'Doe'
         * }, true);
         *
         * // returns:
         * // 'John'
         * user.firstName;
         *
         * user.firstName = 'John2';
         *
         * // returns:
         * // 'John2'
         * user.firstName;
         *
         * user.mngr.reset();
         *
         * // returns:
         * // 'John';
         * user.firstName;
         */
        reset: {
          value: function() {
            _.merge(data, originalData);
            originalData = {};
          }
        },

        /**
         * Retrieve an array of the property names that are dirty
         *
         * @property mngr.dirtyProperties
         * @type {array}
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create();
         *
         * //since we have not set any data, mngr.dirtyProperties will return an empty array
         *
         * // returns:
         * // []
         * user.mngr.dirtyProperties;
         *
         * user.username = 'john.doe';
         *
         * //now that we have set data that is not synced, we can check that by the mngr.dirtyProperties
         * //which will return an with the properties that are dirty
         *
         * // returns:
         * // [
         * //   'username'
         * // ]
         * user.mngr.dirtyProperties;
         *
         * user.mngr.sync();
         *
         * //after the data has been synced, mngr.dirtyProperties will return an empty array again
         *
         * // returns:
         * // []
         * user.mngr.dirtyProperties;
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mgnr.create();
         *
         * user.set({
         *   'firstName': 'John'
         *   'lastName': 'Doe',
         *   'username': 'john.doe',
         *   'email': 'john.doe@example.com'
         * });
         *
         * //the mngr.toJson() method returns a json object that represents the data the model is holding
         *
         * // results:
         * // {
         * //   "firstName": "John"
         * //   "lastName": "Doe",
         * //   "username": "john.doe",
         * //   "email": "john.doe@example.com"
         * // }
         * var jsonData = user.mngr.toJson();
         *
         * //also note that modifying the resulting JSON will not effect the models data
         * jsonData.firstName = 'John2';
         *
         * // returns:
         * // 'John'
         * user.firstName;
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
         * Tells you whether or not the model is local only or a version of it is synced to the API.
         *
         * @method mngr.isRemote
         *
         * @return {boolean}
         *
         * @example:javascript
         * var userRepository = nagRestBaseRepository.create('user');
         * var user = userRepository.mngr.create();
         *
         * //since the model has not been synced to the rest api mngr.isRemote() method will return false
         *
         * // returns:
         * // false
         * user.mngr.isRemote();
         *
         * var remoteUser = userRepository.mngr.create({
         *   id: 123,
         *   firstName: 'John',
         *   lastName: 'Doe'
         * }, true);
         *
         * //since the model is created with the remoteFlag and the idProperty is set, mngrisRemote() will return
         * //true
         *
         * // returns:
         * // true
         * remoteUser.mngr.isRemote();
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create();
         *
         * //by default it will result in the route for the schema of the model
         *
         * // returns:
         * // '/users';
         * user.mngr.route
         *
         * //now if the mngr.isRemote() results in true (which just means the mngr.state is either 'loaded' or
         * //'dirty'), it will include the idProperty of the model in the route
         *
         * var remoteUser - userRepository.mngr.find(1).models;
         *
         * // returns:
         * // '/users/1'
         * remoteUser.mngr.route;
         *
         * //it also take into account the flattenItemRoute property of the schema configuration
         *
         * var nestedUserRepository = nagRestRepositoryFactory.create('user', {
         *   route: '/projects/1/users'
         *   flattenItemRoute: true
         * });
         * var nestedUser = nestedUserRepository.mngr.create();
         *
         * // returns:
         * // '/projects/1/users'
         * nestedUser.mngr.route;
         *
         * var nestedRemoteUser = nestedUserRepository.mngr.find(1).models;
         *
         * // returns:
         * // '/users/1';
         * nestedRemoteUser.mngr.route;
         *
         * //fullRoute will just prepend the base url to the route.  lets assume the base url is
         * //http://api.example.com
         *
         * // returns:
         * // 'http://api.example.com/users/1'
         * nestedRemoteUser.mngr.fullRoute;
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
         *
         * @example:javascript
         * var nestedUserRepository = nagRestRepositoryFactory.create('user', {
         *   route: '/projects/1/users'
         *   flattenItemRoute: true
         * });
         * var nestedRemoteUser = nestedUserRepository.mngr.find(1).models;
         *
         * //fullRoute will just prepend the base url to the route.  lets assume the base url is
         * //http://api.example.com
         *
         * // returns:
         * // 'http://api.example.com/users/1'
         * nestedRemoteUser.mngr.fullRoute;
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create();
         *
         * //now instead of set each property individually, you can pass an object of property values to the
         * //extendData method to set multiple values at once
         * user.mngr.extendData({
         *   firstName: 'John',
         *   lastName: 'Doe
         * });
         *
         * // returns:
         * // 'John';
         * user.firstName;
         *
         * // returns:
         * // 'Doe'
         * user.lastName;
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.create();
         *
         * user.mngr.extendData({
         *   firstName: 'John',
         *   lastName = 'Doe',
         *   username = 'john.doe',
         *   email = 'john.doe@example.com'
         * });
         *
         * //the mngr.sync() method will send the data through the rest api to be processed (generally saved to a data
         * //store of some sort).  the mngr.sync() method is smart enough to know what method to use.  since the
         * //model's mngr.state is 'new', mngr.sync() will automatically use POST
         *
         * // POST /users with content of
         * // {
         * //   "firstName": "John"
         * //   "lastName": "Doe",
         * //   "username": "john.doe",
         * //   "email": "john.doe@example.com"
         * // }
         * user.mngr.sync();
         *
         * //now that the data is synced the model's mngr.state is marked as 'loaded' and if you try to
         * //mngr.sync() again, it is going to PUT the data (or whatever is set and the update method for
         * //the nagRestConfig service)
         *
         * // PUT /users/123 with content of
         * // {
         * //   "id": 123
         * //   "firstName": "John"
         * //   "lastName": "Doe",
         * //   "username": "john.doe",
         * //   "email": "john.doe@example.com"
         * // }
         * user.mngr.sync();
         *
         * //the mngr.sync() method also allows you to specify the method to used to sync.  lets say I wanted to
         * //update the email address however it would be a waste of bandwidth to have to send all the other data
         * //since it is not changing.  luckily our rest api support the PATCH method and the mngr.sync() method is
         * //smart enough to only send the dirty property when using the PATCH method
         * user.email = 'john.doe@example2.com';
         *
         * // PATCH /users/789 with content of
         * // {
         * //   "email": "john.doe@example2.com"
         * // }
         * user.mngr.sync('PATCH');
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
                var modelData = utilities.stringJsonParser(schema.dataItemLocation, response);
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
         * Deletes the model from the REST service.
         *
         * @method mngr.destroy
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.find(789).models;
         *
         * //to delete the user we can just call the mngr.destroy() method.  you should note the calling
         * //mngr.destroy() only sends the delete call to the rest api, the model itself still has the data
         * //so if you wanted (though you should never call mngr.destroy() unless you are sure), you could
         * //sync the data back
         *
         * // DELETE /users/789
         * user.mngr.destroy();
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
         *
         * @example:javascript
         * var userRepository = nagRestRepositoryFactory.create('user');
         * var user = userRepository.mngr.find(123).models;
         *
         * //we can pull any relation thats configured in the relations part of the schema with the
         * //mngr.getRelation() method.  the first parameter this method takes is the name of the relation
         * //as it is defined in the schema.  so lets get all projects for a user.
         *
         * // GET /users/123/projects
         * user.mngr.getRelation('project').then(function(data) {
         *   var projects = data.parsedData
         * });
         *
         * //you can also pass in a second parameter that is the relation id value
         *
         * // GET /users/123/projects/234
         * var project = user.mngr.getRelation('project', 234).models;
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

        /**
         *
         *
         * @todo: document
         */
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
     * The model is the main way to interact with individual records from the REST API and sync data to the REST API.  It is recommended that you use the repository instance to create instances of a model however you can also create an instance of the model using the nagRestModelFactory service.
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
       *
       * @example:javascript
       * //it is not recommend you create models from the nagRestModelFactory (always try to use the
       * //repository.mngr.create() method) but if the case does arrive that you need to, the option
       * //does exist.  the first parameter is the resourceName that has the schema you want to based
       * //this model off of.
       * var user = nagRestModelFactory.create('user');
       *
       * //the second parameter is the initial data
       * var user nagRestModelFactory.create('user', {
       *   firstName: 'John',
       *   lastName: 'Doe'
       * });
       *
       * //now by default it will create a model that has mngr.state set to 'new' so syncing it will make
       * //it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
       * //third parameter a value of true.  just note that you also have to make sure that the idProperty of
       * //initial data is also set otherwise is will still assume the model's mngr.state is 'new' even if
       * //the second parameter has a value of true
       * var remoteUser = nagRestModelFactory.create('user', {
       *   id: 123,
       *   firstName: 'John',
       *    lastName: 'Doe'
       * }, true);
       *
       * //the fourth parameter will allow you to create an instance of a model with a customized schema.  by
       * //default the model generated will use the schema associated to the repository but the third
       * //parameter is a list of overrides for the schema for the instance of that model
       * var customUser = nagRestModelFactory.create('user', {}, false, {
       *   route: '/custom/users'
       * });
       */
      create: function(resourceName, initialData, remoteFlag, overrideSchemaOptions) {
        return new BaseModel(resourceName, initialData, remoteFlag, overrideSchemaOptions);
      }
    };
  }
]);
