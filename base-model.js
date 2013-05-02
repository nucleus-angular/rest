angular.module('nag.rest.baseModel', [
  'nag.rest.config',
  'nag.rest.schemaManager',
  'nag.rest.baseRepository'
])
.factory('nagRestBaseModel', [
  '$injector',
  '$q',
  '$http',
  'nagRestSchemaManager',
  'nagRestBaseUrl',
  'nagRestModelIdProperty',
  'nagRestResponseDataLocation',
  'nagRestUpdateMethod',
  function($injector, $q, $http, nagRestSchemaManager, nagRestBaseUrl, nagRestModelIdProperty, nagRestResponseDataLocation, nagRestUpdateMethod) {
    var baseObject = function(isRemote) {
      var self = this;
      var nagRestBaseRepository = $injector.get('nagRestBaseRepository');
      var forceIsArray = null;
      isRemote = isRemote || false;

      var schema = {};

      /**
       * Stored the data for the model
       *
       * @type {{}}
       */
      var data = {};

      /**
       * Stores a list of properties that have been changed since the last sync
       *
       * @type {Array}
       */
      var dirtyProperties = [];

      /**
       * Returns a list an object with the required data need to sync the model.  This can be useful for APIs that support PATCH.
       *
       * @param type Can be either create, update, or full
       * @returns {{}}
       */
      var getDataForSync = function(type) {
        //just return the json of the model if doing a full sync
        if(type === 'full') {
          return self.toJson();
        }

        //return an empty object if there are no dirty properties
        if(!self.isDirty()) {
          return {};
        }

        var keys, dataKey, syncData;

        type = type || (isRemote === true ? 'update' : 'create');
        syncData = {};
        keys = Object.keys(dirtyProperties);

        //build the object up of the dirty properties
        for(dataKey in keys) {
          if(schema.properties.hasOwnProperty(dirtyProperties[dataKey])) {
            if(schema.properties[dirtyProperties[dataKey]].sync === undefined || type === schema.properties[dirtyProperties[dataKey]].sync) {
              syncData[dirtyProperties[dataKey]] = data[dirtyProperties[dataKey]];
            }
          }
        }

        return syncData;
      };

      /**
       * Set the value for a properties and marks it as dirty
       *
       * @param property
       * @param value
       */
      var setValue = function(property, value, notDirty) {
        notDirty = notDirty || false;

        if(schema.properties[property] && data[property] !== value) {
          data[property] = value;

          if(notDirty === false && dirtyProperties.indexOf(property) === -1) {
            dirtyProperties.push(property);
          }
        }
      };

      this._setSchema = function(options) {
        if(Object.keys(schema).length === 0) {
          schema = options;
        } else {
          throw new Error("Can't redefine schema once they have been set");
        }
      };

      this._setSynced = function(value) {
        isRemote = value;
      };

      this._getSelfRoute = function(withBaseRoute) {
        var selfRoute;

        selfRoute = '';
        withBaseRoute = (withBaseRoute !== false);

        if(withBaseRoute) {
          selfRoute += nagRestBaseUrl;
        }

        selfRoute += schema.route;

        if(this.isRemote()) {
          selfRoute += '/' + data[schema.idProperty];
        }

        return selfRoute;
      };

      this._getIsArray = function(value) {
        if(_.isBoolean(forceIsArray) || _.isBoolean(schema.isArray)) {
          if(_.isBoolean(forceIsArray)) {
            value = forceIsArray;
            forceIsArray = null;
          } else {
            value = schema.isArray;
          }
        };

        return value;
      }

      this.get = function(property) {
        return data[property];
      };

      this.set = function(property, value, notDirty) {
        notDirty = notDirty || false;

        if(_.isObject(property)) {
          //set multiple values
          var keys = Object.keys(property);

          for(var x = 0; x < keys.length; x += 1) {
            setValue(keys[x], property[keys[x]], notDirty);
          }
        } else {
          //set single value
          setValue(property, value, notDirty);
        }
      };

      this.isRemote = function() {
        if(isRemote) {
          if(data[schema.idProperty]) {
            return true;
          }
        }

        return false;
      };

      this.isDirty = function() {
        return dirtyProperties.length > 0;
      };

      this.getDirtyProperties = function() {
        return dirtyProperties;
      };

      this.sync = function(method, syncLocal) {
        syncLocal = (syncLocal !== false);
        var requestData;
        requestData = {};
        var deferred = $q.defer();

        if(!method) {
          method = (this.isRemote() ? nagRestUpdateMethod : 'POST');
        }

        if(method === 'POST') {
          requestData = getDataForSync('create');
        } else if(method === 'PUT') {
          requestData = getDataForSync('full');
        } else if(method !== 'DELETE') {
          requestData = getDataForSync('update');
        }

        var finalDataFormat = schema.requestFormatter(requestData) || requestData;

        $http({
          url: this._getSelfRoute(),
          method: method,
          data: finalDataFormat
        })
        .success(function(response) {
          if(syncLocal) {
            var modelData = stringJsonParser(schema.dataItemLocation, response);
            self.set(modelData, null, true);
            dirtyProperties = [];
          }
          deferred.resolve(response);
        }).error(function() {
          deferred.reject('Unable to sync data');
        });

        //if we posted this object, then isRemote should be true
        if(method === 'POST') {
          this._setSynced(true);
        }

        return deferred.promise;
      };

      this.destroy = function() {
        if(this.isRemote()) {
          this.sync('DELETE', false);

          //clear of the idProperty
          delete data[schema.idProperty];

          this._setSynced(false);
        }
      };

      this.isProperty = function(property) {
        return (Object.keys(schema.properties)).indexOf(property) !== -1
      };

      this.toJson = function() {
        return data;
      };

      this.forceIsArray = function(value) {
        forceIsArray = value;
        return this;
      }

      this.getRelation = function(relationName, relationId) {
        if(!schema.relations[relationName]) {
          throw new Error('There is no relationship defined for ' + relationName);
        }

        var value;
        var relationshipSchema = nagRestSchemaManager.get(schema.relations[relationName].resource);
        if(!schema.relations[relationName].property) {
          relationshipSchema.route = this._getSelfRoute(false) + relationshipSchema.route;
        }

        var modelService = nagRestBaseRepository.create(schema.relations[relationName].resource, relationshipSchema);

        //determine if we are getting all one or a single relationship model
        if(relationId || schema.relations[relationName].property) {
          relationId = relationId || data[schema.relations[relationName].property];
          value = modelService.forceIsArray(this._getIsArray(null)).find(relationId);
        } else {
          value = modelService.forceIsArray(this._getIsArray(null)).find();
        }

        return value;
      };
    };

    baseObject.create = function(resourceName, data, isRemote, overrideSchemaOptions) {
      overrideSchemaOptions = overrideSchemaOptions || {};
      data = data || {};
      isRemote = isRemote || false;

      var newObject = {};
      var schema = nagRestSchemaManager.get(resourceName, overrideSchemaOptions);
      this.call(newObject, isRemote);
      newObject._setSchema(schema);

      //Determine if the data should be set as dirty or not
      var dataIsDirty = (isRemote && data[schema.idProperty] ? true : false);

      newObject.set(data, undefined, dataIsDirty);
      return newObject;
    };

    return baseObject;
  }
]);
