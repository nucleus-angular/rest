# Nucleus Angular REST

This component of Nucleus Angular is designed to allow you to easily use a REST API within your AngularJS.  There are other libraries that serve a similar a similar purpose to this one and the two I most commonly see reference are:

* Restangular - https://github.com/mgonto/restangular
* BreezeJS - http://www.breezejs.com

An I invite you to have a look at those solutions, they might be a better fit for you.

## Why Another Library Then

This library differs from those libraries in a few ways.

In contrast to Restangular, this library provides more structure.  You are able to define models and their attributes.  This opens the library to provide functionality like automatic data validation and such.

In constrast to BreezeJS, this library is designed specifically for AngularJS and is designed in such a way that it makes no assumptions to the backend used (I know BreezeJS can be used with any backend however it's roots seem to be .NET/EF). Being designed specifically for AngularJS, this library will be able to do certain things that BreezeJS might not be able to od or at least be able to do in as a clean way.  It will also not have functionality that is designed for a specific system (like having Int16, Int32, Int64 data types is probably mainly useful for .NET/EF).  Everything will be at the most generic level in javascript.  Validation based on Int16, Int32, Int64 data types can be done on the REST API where I believe it belongs (since it is not valid for all server side implementations).

As long your are implementing a RESTish API, this solution should work for you.

# Change Log

Each change log are assumed to be accompanied by associated unit test and documentation updates.

## 0.2.3

* Config values are now using a provider that can be configured in a module.config() instead of using .values()
* Added logic for flattenItemRoute property in schema definition for better support when using model.getRelation()
* Added logic for flatten for property are part of relation config in schema definition for better support when using model.getRelation()
* Added Karma configuration files for PhantomJS

## 0.2.2

* Added logic for isArray property in schema definition
* Added forceIsArray to model/repository instances

## 0.2.1

* Fixed typo where parseData was being used instead parsedData
* Move lodash into dev dependencies

## 0.2.0

* Initial Commit

# Testing

There are a suite of unit tests for each thought of use case.  The unit test are execute against both the latest stable (1.0.6) and unstable (1.1.4) angular branches.  Currently these are the following browsers/oses that the unit tests have been executed on (more to follow as I get all the local environments setup or connect with Travis CI):

* Chrome (Mac OS X 10.8.x)
* FireFox (Mac OS X 10.8.x)
* Safari (Mac OS X 10.8.x)
* Opera (Mac OS X 10.8.x)
* IE 8 Native (Windows 7)
* IE 10 Native (Windows 7)

# To Be Implemented

Keep an eye on this <a href="https://github.com/nucleus-angular/rest/issues?milestone=1&state=open">Milestone</a> as it will hold any big ticket items that I hope to get by version 1.0.  Things will be periodically move into early milestones once work has started on them or move out if I don't place to get them done by 1.0. 

# Usage

This is just basic documentation.  You can probably find out even more by looking at the unit tests and the source code itself.

## NOTE

This is still in early development.  While I am happy with the current API of these components, I can't guarantee that backwards breaking compatibility changes won't be made.  There may still be bugs or use cases that don't yet have unit tests but if you find any of those, please submit them to the github issue tracker (plus I am more than happy to receive pull requests).

### Pull Request

If you do submit a pull request, and I would be grateful to anyone who does, all I ask is that your pull request include unit tests and that the indention of the code is using 2 spaces (try to follow other pattern of coding standards that you see).  I will have a coding standard documentation for this project up as some point.

## Installation

Installation of Nucleus Angular REST is simply done with bower:

```bower install nucleus-angular-rest```

## File Inclusion

Then include the files:

```
<script type="text/javascript" src="/components/string-json-parser/string-json-parser.js"></script>
<script type="text/javascript" src="/components/nucleus-angular-rest/module.js"></script>
<script type="text/javascript" src="/components/nucleus-angular-rest/config.js"></script>
<script type="text/javascript" src="/components/nucleus-angular-rest/schema-manager.js"></script>
<script type="text/javascript" src="/components/nucleus-angular-rest/base-model.js"></script>
<script type="text/javascript" src="/components/nucleus-angular-rest/base-repository.js"></script>
```

You also need to include es5-shim if you want to support older browsers like IE 8.

### Dev Dependencies

You will notice 2 different versions of angular and lodash as dev dependencies.  The reason they are set as dev dependencies and not regular dependencies is because I want the user to have the choice of which versions of those libraries to use in production (they are still in the dev dependencies as they are needed to run the unit tests).  I am still a little iffy on the best way to handle situations where a library will work with multiple version of another library with bower and if there is a better way then this, then I am all ears.

Just remember that you will need to include a version of lodash and angular in order for this library to work.

## Including the module

Then finally, include the nag.rest module in your application

```javascript
angular.module('app', ['nag-rest'])
//your application code
```

# Basic Guide

## Querying REST API results

There are a number of methods with repositories and models that return data that is queried from the REST API (like repository.find() or model.getRelation()).  Those functions return a value that allow you to just wait and the data will eventually be populated in the value or you can use the promise's .then() method on it.  Here are the examples:

```javascript
//in this instance an array will be returned and it will have the data populated once the rest api
//the data and it is processed
var arrayResults = repository.find();

//in this instance, we are using the .then() method to retrieve the data
repository.find().then(function(data) {
  //the data parameter has a few properties associated to it.  if the schema configuration has autoParse
  //to true (which by default it is) one of them will be parsedData.  in the result of doing a find()
  //with a string/number, parsedData is a model and when doing .find() with an object, parsedData is an
  //array
  users = data.parsedData;

  //another element that is always available is the raw unprocessed JSON of the response as the
  //rawResponse property.  if you have autoParse set to false then you will have to use the promise
  //way of getting the data and process the rawResponse manually in the success of the then() method
  var customResponseProcessor = function(response) {
    //code...
  };
  users = customResponseProcessor(data.rawResponse);

  //another use for the rawResponse is maybe there is some meta data you need, like for instance the
  //rest api supports pagination and you need that data for the controller
  totalRecord; = data.rawResponse.meta.totalRecords;
});

//in this instance an empty model will be returned and it will have the data populates once the rest api
returns when the data and it is processed
var project = user.getRelation('project', 234);

//in this instance, we are using the .then() method to retrieve the data
user.getRelation('project', 234).then(function(data) {
  //the parsedData property will have the model
  user = data.parsedData;

  //and of course you can do custom processing here too
  var customResponseProcessor = function(response) {
    //code...
  };
  user = customResponseProcessor(data.rawResponse);
});
```

The rest of the code examples might use either of the options for getting the data depending on the situation.

#### Structuring The Code

This code example documentation is not structured in any angular code like .service, .factory, .run, etc... however one tip I would give on this subject is that I think it make sense to wrap common use repositories in a config/factory like this:

```javascript
angular.module('app.models', ['nag.rest'])
//adding the schema in the .config() will allow it to be available without having to get an instance of
//the factory
.config([
  'nagRestSchemaManager',
  function(nagRestSchemaManager) {
    nagRestSchemaManager.add('user', {
      route: '/users',
      properties: {
        id: {
          sync: false
        },
        firstName: {},
        lastName: {},
        username: {},
        email: {}
      },
      relations: {
        project: {
          route: '/projects'
        }
      },
      dataListLocation: 'response.data.users',
      dataItemLocation: 'response.data.user'
    });
  }
])
.factory('userRepository', [
  'nagRestBaseRepository',
  function(nagRestBaseRepository) {
    var userRepository = nagRestBaseRepository('user');

    //add custom methods to userRepository as needed

    return userRepository;
  }
]);
```

## Config

The configuration provider allows you to retrieve/configure certain options of this library.  To retrieve the properties, you can the nagRestConfig service which has the following API:

* getBaseUrl() - Returns the base url (default: '')
* getResponseDataLocation() - Returns the string representing where the data lives in the reponse from the rest api (default: '')
* getModelIdProperty() - Returns the default idProperty for schemas (default: 'id')
* getUpdateMethod() - Returns the default method used when updating model with the.sync() method (default: 'PUT')
* getRequestFormatter() - Returns a function used to format the data before it is sent to the rest api with the model's .sync() method (default: function(){})

You can set these values using the nagRestConfigProvider service within a .config() like this:

```javascript
angular.module('app', ['nag.rest'])
.config([
  'nagRestConfigProvider',
  function(nagRestConfigProvider) {
    nagRestConfigProvider.setBaseUrl('/api');
    nagRestConfigProvider.setResponseDataLocation('response.data');
    nagRestConfigProvider.setModelIdProperty('uid');
    nagRestConfigProvider.setUpdateMethod('PATCH');
    nagRestConfigProvider.setRequestFormatter(function(data) {
      return {
        request: {
          data: data
        }    
      };
    });
  }
});
```

## APIs

A list of the APIs for the components included in this package.  This contains a basic list of methods and parameters with a simple description and a code example for each.

### Note

Only the API's designed for public use are documented here.  There is some functionality that is exposed publicly however it is not intended for general use.  These methods start with an underscore _.  It is **highly recommended** that you don' use those unless you know exactly what you are doing as using those incorrectly could result in a broken system or even mess up data that is retrieved or sent to the REST API.

**YOU HAVE BEEN WARNED**

### Schema Manager

The Schema Manager can be accessed through the nagRestSchemaManager service.  It has the following API:

* add(resourceName, schema) - adds a schema (look at <a href="#schema">schema</a> to see the schema structure)

```javascript
//------------------------------------------------------------------------------------------------------
//---- NOTE: the rest of the documentation is going to assume these resources/schemas are available ----
//------------------------------------------------------------------------------------------------------
var userSchema = {
  route: '/users',
  properties: {
    id: {
      sync: false
    },
    firstName: {},
    lastName: {},
    username: {},
    email: {}
  },
  relations: {
    project: {
      resource: 'team'
    }
  },
  dataListLocation: 'response.data.users',
  dataItemLocation: 'response.data.user'
};

projectSchema = {
  route: '/projects',
  properties: {
    projectId: {
      sync: false
    },
    name: {},
    creatorId: {}
  },
  relations: {
    team: {
      resource: 'team'
    }
  }
  idProperty: 'projectId',
  dataListLocation: 'response.data.projects',
  dataItemLocation: 'response.data.project',
  flattenItemRoute: false
};

teamSchema = {
  route: '/teams',
  properties: {
    id: {
      sync: false
    },
    name: {}
  },
  dataListLocation: 'response.data.teams',
  dataItemLocation: 'response.data.team'
};

//after this you will be able to pass the string 'user' with anything asking for a resourceName
nagRestSchemaManager.add('user', userSchema);
nagRestSchemaManager.add('project', projectSchema);
nagRestSchemaManager.add('team', teamSchema);
```

* get(resourceName, overrideSchemaOptions) - retrieves a schema

```javascript
nagRestSchemaManager.add('user', userSchema);

//this will return a copy of the schema that is tied to the 'user' resource.  this copy can be modified
//without the stored version being modified

// resulting object:
// {
//   route: '/users',
//   properties: {
//     id: {
//       sync: false
//     },
//     firstName: {},
//     lastName: {},
//     username: {},
//     email: {}
//   },
//   relations: {
//     project: {
//       resource: 'project'
//     }
//   },
//   dataListLocation: 'response.data.users',
//   dataItemLocation: 'response.data.user'
// }
var pulledUserSchema = nagRestSchemaManager.get('user');

//you can also pass in a second parameter that will override values in the resulting schema, it will not
//effect anything stored in the schema manager itself.  it will also override recursively meaning the if
//you want to override one of the properties, you can do that without effecting the other properties.

// returns:
// {
//   route: '/custom/users',
//   properties: {
//     id: {
//       sync: false
//     },
//     firstName: {},
//     lastName: {},
//     username: {},
//     email: {
//       sync: 'create'
//     }
//   },
//   relations: {
//     project: {
//       resource: 'project'
//     },
//     manager: {
//       resource: 'user'
//     }
//   },
//   dataListLocation: 'response.data.users',
//   dataItemLocation: 'response.data.user'
// }
var customUserSchema = nagRestSchemaManager.get('user', {
  route: '/custom/users',
  properties: {
    email: {
      sync: 'create'
    }
  },
  relations: {
    manager: {
      resource: 'user'
    }
  }
});
```

* remove(resourceName) - removes a schema

```javascript
nagRestSchemaManager.add('user', userSchema);

//this will remove the schema from the manager
nagRestSchemaManager.remove('user');

// returns:
// undefined
var pulledUserSchema = nagRestSchemaManager.get('user');
```

### Repository

The Repository is the main way to create models and get data from the REST API.  You can create an instance of a Repository by using the nagRestBaseRepository service.  That has the following API:

* create(resourceName, overrideSchemaOptions) - returns an instance of a Repository

```javascript
//all you need to do in order to create a repository is pass in the resourceName that matches the
//schema you want
var userRepository = nagRestBaseRepository.create('user');

//there is also a second parameter allowing you to customize the schema for the instance of the
//repository that is going to be created.  this is useful if there is a specialized rest api, lets
//say /session, that returns a standard resource
var sessionRepository = nagRestBaseRepository.create('user', {
  route: '/session',
  dataItemLocation: 'response.data',
  isArray: false
});
```

The instance of the repository itself has the following API:

* create(data, isRemote, overrideSchemaOptions) - returns a new empty instance of the model for the repository

```javascript
//using the repository is the recommended way to generate a new model, the first parameter is the
//initial data
var userRepository = nagRestBaseRepository.create('user');
var user userRepository.create({
  firstName: 'John',
  lastName: 'Doe'
});

//now by default it will create a model that is not identified as being remote so syncing it will make
//it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
//second parameter a value of true.  just note that you also have to make sure that the idProperty of
//initial data is also set otherwise is will still assume the model is not remote even if the second
//parameter has a value of true
var remoteUser = userRepository.create({
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);

//the third parameter will allow you to create an instance of a model with a customized schema.  by
//default the model generated will use the schema associated to the repository being used to create it
//but the third parameter is a list of overrides for the schema
var customUser = userRepository.create({}, false, {
  route: '/custom/users'
});
```

* find(params, headers, isPost, postData) - makes a request to the REST API to retrieve data

```javascript
//one method that exists in order to retrieve data from a repository is the find() method.  The first
//parameter of find can take an object with key/value pairs that will be inserted into the query string
//part of the url.

// GET /users?firstName=John
var users = userRepository.find({
  firstName: 'John'
});

//you can also pass a number/string as the first argument and it will assume that is the value of the
//idProperty for the data the repository represents.  in this case the result is initially a new empty
//model and the data for get filled in once the data is received and processed

// GET /users/123
var user = userRepository.find(123);

//The second parameter of find() is a object of header/value pairs

// GET /users with request header x-user:test
var users = userRepository({}, {
  'x-user': 'test'
});

//now some rest apis offer the ability to do very complex queries however because of the complexity,
//they require you to pass the data in as a post request instead of get and that is what the third and
//fourth parameters are for.  the third parameter is a boolean on whether or not you want to make the
//request as a post.  the fourth parameter is object representing the content of the post request (you
//will never need the fourth parameter unless the third one is set to true)

// POST /users?query=data with content of
// {
//   "filters": [{
//     "field": "email",
//     "condition": "like",
//     "value": "%@gmail.com"
//   }]
// }
var gmailUsers = userRepository({
  query: 'data',
}, {}, true, {
  filters: [{
    field: 'email',
    condition: 'like',
    value: '%@gmail.com'
  }]
});
```

* forceIsArray(value) - will assume the next request for retrieving data result will or wil not be an array (based on passed value), will override schema.isArray

```javascript
//now when retrieving data, the library is smarter enough to guess whether the results will be returned
//as an array or a single object however sometimes the guess will be wrong.  any time you are retrieving
//data without an id, it assumes an array will be returned and when you have an id, it assume an object
//will be returned.  now lets say we have a rest api call with the route /session but it returns a
//single user object.  one way is to use the forceIsArray() method:

// get /session
var sessionRepository = nagRestBaseRepository.create('user', {
  '/session'
});
sessionRepository.forceIsArray(false).find();
```

### Model

The model is the main way to interact with individual records from the REST API and sync data to the REST API.  It is recommended that you use the repository instance to create instances of a model however you can also create an instance of the model using the nagRestBaseModel service.  It has the following API:

* create(resourceName, data, synced, overrideSchemaOptions) - returns an instance of a Model

```javascript
//it is not recommend you create models from the nagRestBaseModel (always try to use the
//repository.create() method) but if the case does arrive that you need to, the option does exist.  the
//first parameter is the resourceName that has the schema you want to based this model off of.
var user = nagRestBaseModel.create('user');

//the second parameter is the initial data
var user nagRestBaseModel.create('user', {
  firstName: 'John',
  lastName: 'Doe'
});

//now by default it will create a model that is not identified as being remote so syncing it will make
//it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
//third parameter a value of true.  just note that you also have to make sure that the idProperty of
//initial data is also set otherwise is will still assume the model is not remote even if the second
//parameter has a value of true
var remoteUser = nagRestBaseModel.create('user', {
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);

//the fourth parameter will allow you to create an instance of a model with a customized schema from the
//resource passed as the first parameter
var customUser = nagRestBaseModel.create('user', {}, false, {
  route: '/custom/users'
});
```

The instance of the model itself has the following API:

* get(property) - retrieves a property value

```javascript
var remoteUser = nagRestBaseModel.create('user', {
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);

//if you want to get the value of a property of a model, use the .get() method

// returns:
// 123
remoteUser.get('id');
```

* set(property, value, notDirty) - sets a property value, to set multiple values at the same time, passin a object with the property -> value and leave the second parameter emapty.

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.create();

//to set data just use the set() method
user.set('username', 'john.doe');

//we can also set multiple values with one set call
user.set({
  'firstName': 'John',
  'lastName': 'Doe',
  'email': 'john.doe@example.com',
});
```

* isRemote() - tells you whether or not the model in local only or a version of it is synced to the REST API.  isRemote() will return true even if the local version of the model is different from the remote version (isDirty() is used to check if the record is different).

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.create();

//since the model has not been synced to the rest api isRemote() method will return false

// returns:
// false
user.isRemote();

var remoteUser = userRepository.create({
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);

//since the model is created with the isRemote flag and the idProperty is set, isRemote() will return
//true

// returns:
// true
remoteUser.isRemote();
```

* isDirty() - tells you if there an any un-synced changes to the local model

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.create();

//since we have not set any data, isDirty() wil return false

// returns:
// false
user.isDirty();

user.set('username', 'john.doe');

//now that we have set data that is not synced, we can check that by the isDirty() method

// returns:
// true
user.isDirty();

user.sync();

//after the data has been synced, isDirty() will result in false again

// returns:
// false
user.isDirty();
```

* getDirtyProperties() - returns an array of the property names that are dirty

```javascript

var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.create();

//since we have not set any data, getDirtyProperties() method will return an empty array

// returns:
// []
user.getDirtyProperties();

user.set('username', 'john.doe');

//now that we have set data that is not synced, we can check that by the getDirtyProperties() method
//which will return an with the properties that are dirty

// returns:
// [
//   'username'
// ]
user.getDirtyProperties();

user.sync();

//after the data has been synced, getDirtyProperties() method will return an empty array again

// returns:
// []
user.getDirtyProperties();
```

* sync(method, syncLocal) - send the local model data to the REST API to be synced

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.create();

user.set({
  'firstName': 'John'
  'lastName': 'Doe',
  'username': 'john.doe',
  'email': 'john.doe@example.com'
});

//the .sync() method with send the data through the rest api to be processed (generally saved to a data
//store of some sort).  the .sync() method is smart enough to know what method to use.  since this is a
//new non-remote user model, .sync() will automatically use POST

// POST /users with content of
// {
//   "firstName": "John"
//   "lastName": "Doe",
//   "username": "john.doe",
//   "email": "john.doe@example.com"
// }
user.sync();

//now that the data is synced the record is marked as isRemote and if you try to .sync() again, it is
//going to PUT the data (or whatever is set and the update method for the nagRestConfig service)

// PUT /users/123 with content of
// {
//   "id": 123
//   "firstName": "John"
//   "lastName": "Doe",
//   "username": "john.doe",
//   "email": "john.doe@example.com"
// }
user.sync();

//the sync method also allows you to specify the method to used to sync.  lets say I wanted to
//update the email address however it would be a waste of bandwidth to have to send all the other data
//since it is not changing.  luckily our rest api support the PATCH method and the sync() method is
//smart enough to only send the dirty property when using the PATCH method
user.set('email', 'john.doe@example2.com');

// PATCH /users/789 with content of
// {
//   "email": "john.doe@example2.com"
// }
user.sync('PATCH');
```

* destroy() - sends a request to the REST API to delete the model

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.find(789);

//to delete the user we can just call the destroy() method.  you should note the calling destroy() only
//sends the delete call to the rest api, the model itself still has the data so if you wanted (though
//you should never call destroy() unless you are sure), you could sync the data back

// DELETE /users/789
user.destroy();
```

* isProperty(property) - tells you if the passed property name is a configured property of the model

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.find(789);

//since the property is configured, this will return true

// returns:
// true
user.isProperty('id');

//a property that is not configured wi;; return false

// returns:
// false
user.isProperty('propertyNotConfigured');
```

* toJson() - convert the model's data to a simple JSON structure

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.create();

user.set({
  'firstName': 'John'
  'lastName': 'Doe',
  'username': 'john.doe',
  'email': 'john.doe@example.com'
});

//the .toJson() method returns a json object that represents the data the model is holding

// results:
// {
//   "firstName": "John"
//   "lastName": "Doe",
//   "username": "john.doe",
//   "email": "john.doe@example.com"
// }
user.toJson();
```

* getRelation(relationName, relationId) - gets relational data for the model

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.find(123);

//we can pull any model thats configured in the relations part of the schema with the getRelation()
//method.  the first parameter this method takes is the name of the relation as it is defined in the
//schema.  so lets get all projects for a user.

// GET /users/123/projects
user.getRelation('project').then(function(data) {
  var projects = data.parsedData
});

//you can also pass in a second parameter that is the relation id value

// GET /users/123/projects/234
var project = user.getRelation('project', 234);
```

* forceIsArray(value) - will assume the next request for retrieving data result will or wil not be an
//array (based on passed value), will override schema.isArray

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.find(123);

//ets says a user has a relation of manager that routes to /user/:id/manager.  since there is no id
//after manager the library will assume it is going to return an array but since it won't, lets force
//it to
user.forceIsArray(false).getRelation('manager');
```

## Object Definitions

### Schema

* **route (default: null)**
  * The relatively route from the configured nagRestBaseUrl to this resource
* **idProperty (default: restModelDefaultIdProperty)**
  * The property that represents the id (generally a primary key in a database)
* **properties: (default: {})**
  * An object with the definition of all the valid properties for the resource where the key is the property name and the value is the property configuration.  Property configuration can be:
    * sync: Tells when this property should be saved (NOTE: when doing a PUT sync, these values are ignored).  The value are:
      * false - don't sync ever (can not set data)
      * 'create' - only save on create (can only set data when model is not synced)
      * 'update' - only save on update (con only set data when model is synced)
* **relations**: This is an object where the key is the name of the resource and the value its configuration
  * resource: The resourceName this relation links to
  * flatten: Used to set the flattenItemRoute when retrieving models using getRelation().  if not set, flattenItemRoute will be set to the value of theflattenItemRoute of the resource schema the relation belongs to
* **dataListLocation: (default: restModelDefaultDataLocation)**
  * A string representing the JSON hierarchy where the data in location in the REST API response when returning a list of resources
* **dataItemLocation: (default: restModelDefaultDataLocation)**
  * A string representing the JSON hierarchy where the data in location in the REST API response when returning a single resource
* **autoParse: (default: true)**
  * Whether or not to automatically parse the REST API response
* **requestFormatter: (default: empty function)**
  * A function that can wrap the model data in a specific format before sending it to the REST API.  This function take one parameter and that in the model data that is being sent.
* **isArray**: (default: null)
  * Determines whether all requests are or are not arrays when retrieving data.  This can be override on a call by call level with the forceIsArray() method on models/repositories
* **flattenItemRoute**: (default: true)
  * if set to true, _getSelfRoute() will remove all but the last resource path. (```/users/123/projects/234/teams/345``` would be converted to ```/teams/345```).  This only applies to when there is a trailing id, if the trailing element in the url is a resource name, nothing will get removed (```/users/123/projects/234/teams``` would remain the same)
