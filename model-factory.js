angular.module('nag.rest.model', [
  'nag.rest.config',
  'nag.rest.schemaManager',
  'nag.rest.repository'
])
.factory('nagRestModelFactory', [
  '$injector',
  '$q',
  '$http',
  'nagRestSchemaManager',
  'nagRestConfig',
  function($injector, $q, $http, nagRestSchemaManager, nagRestConfig) {
    var BaseModel = function(resourceName, initialData, remoteFlag, overrideSchemaOptions) {
      var self, data, originalData, schema, modelProperties, isArray, extendData, deletedFlag;
      self = this;
      data = {};
      originalData = {};
      modelProperties = {}
      deletedFlag = false;
      remoteFlag = remoteFlag || false;

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

      //setup properties for object
      var modelProperties = {};

      _.forEach(schema.properties, function(value, key) {
        var defaultGetMethod, defaultSetMethod;
        defaultGetMethod = function() {
          return !_.isUndefined(data[key]) ? data[key] : null;
        };
        defaultSetMethod = function(value) {
          if(data[key] != value) {
            if(!_.isUndefined(data[key]) && !_.isNull(data[key])) {
              originalData[key] = data[key];
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

      //setup initial data
      //initialData = nagRestSchemaManager.normalizeData(schema, initialData);
      if(_.isObject(initialData)) {
        _.forEach(initialData, function(value, key) {
          if(_.has(schema.properties, key)) {
            data[key] = value;
          }
        }, this);
      }

      //setup the manager (mngr) property
      this.mngr = {};

      Object.defineProperties(this.mngr, {
        schema: {
          value: schema
        },
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
        reset: {
          value: function() {
            _.merge(data, originalData);
            originalData = {};
          }
        },
        dirtyProperties: {
          get: function() {
            return Object.keys(originalData);
          }
        },
        toJson: {
          value: function() {
            var returnData = {};

            _.forEach(self.mngr.schema.properties, function(value, key) {
              returnData[key] = self[key];
            }, this);

            return returnData;
          }
        },
        isRemote: {
          value: function() {
            return (self.mngr.state === 'loaded' || self.mngr.state === 'dirty');
          }
        },
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
        fullRoute: {
          get: function() {
            return nagRestConfig.getBaseUrl() + self.mngr.route
          }
        },
        extendData: {
          value: extendData
        },
        sync: {
          value: function(method, syncLocal) {
            var requestData, getSyncData, deferred;

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
              url: self.mngr.route,
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
        getRelation: {
          value: function(relationName, relationId) {
            if(!schema.relations[relationName]) {
              throw new Error('There is no relationship defined for ' + relationName);
            }

            var value;
            var relationshipSchema = nagRestSchemaManager.get(schema.relations[relationName].resource);

            relationshipSchema.flattenItemRoute =
            (_.isBoolean(schema.relations[relationName].flatten)
            ? schema.relations[relationName].flatten
            : schema.flattenItemRoute);

            relationshipSchema.route = self.mngr.route + relationshipSchema.route;
            relationshipSchema.isArray = (_.isBoolean(schema.relations[relationName].isArray) ? schema.relations[relationName].isArray : null);

            //this is manually injected in order to 
            var nagRestRepositoryFactory = $injector.get('nagRestRepositoryFactory');
            var modelService = nagRestRepositoryFactory.create(schema.relations[relationName].resource, relationshipSchema);

            //determine if we are getting all one or a single relationship model
            if(relationId || schema.relations[relationName].property) {
              relationId = relationId || self[schema.relations[relationName].property];
              value = modelService.mngr.find(relationId);
            } else {
              value = modelService.mngr.find();
            }

            return value;
          }
        }
      });
    };

    return {
      create: function(resourceName, initialData, loadedFlag, overrideSchemaOptions) {
        return new BaseModel(resourceName, initialData, loadedFlag, overrideSchemaOptions);
      }
    };
  }
]);
