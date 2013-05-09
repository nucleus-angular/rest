# Nucleus Angular REST

This component of Nucleus Angular is designed to allow you to easily use a REST API within your AngularJS applications.  There are other libraries that serve a similar purpose to this one and the two I most commonly see referenced are:

* Restangular - https://github.com/mgonto/restangular
* BreezeJS - http://www.breezejs.com

An I invite you to have a look at those solutions if this library does not seem to feel like a right fit for you.

If you want to get into the meet of the documentation, skip to <a href="#installation">Installation</a> or <a href="#basic-guide">Basic Guide</a>.

## LICENSE

MIT

## Why Another Library Then

This library differs from the libraries I mentioned above in a few ways.

In contrast to <a href="https://github.com/mgonto/restangular">Restangular</a>, this library provides more structure.  You are able to define models and their attributes.  This opens the library to provide functionality like automatic data validation, dirty field tracking, and so on.

In contrast to <a href="http://www.breezejs.com">BreezeJS</a>, this library is designed specifically for AngularJS and is designed in such a way that it makes no assumptions to the backend used (I know BreezeJS can be used with any backend however it's roots seem to be .NET/EF). Being designed specifically for AngularJS, this library will be able to do certain things that BreezeJS might not be able to do or at least be able to do in as a cleaner way.  It will also not have functionality that is designed for a specific system (like having Int16, Int32, Int64 data types is probably mainly useful for .NET/EF, diffidently not languages like PHP or Python).  Everything will be at the most generic level in javascript.  Validation based on Int16, Int32, Int64 data types can be done on the REST API where I believe it belongs (since it is not valid for all server side implementations).

As long your are implementing a RESTish API, this solution should work for you.

## IE 8 Support

Originally this library was designed to support IE 8 (the 0.2.x series) however a concern relating to the implementation specifically there to support IE 8 was brought up and was a valid concern.  After playing around with a few other implementations that supported IE 8, it was decided to just drop IE 8 support.

The specific issue was the fact that IE 8 does not support Object.defineProperty()/Object.defineProperties().  Not having these available forces the library to use an methodology that has been somewhat common of doing set(field, value)/get(field) methods to interact with data (as far as I know, even libraries like ExtJS/Sencha do this: http://docs.sencha.com/extjs/4.0.7/#!/api/Ext.data.Model).  While this has worked in the passed and will continue to work in the future for other libraries, doing it like this for an AngularJS library is not the greatest.

With set()/get() methods, binding a model to say a form is not that straight forward.  The process go something like this:

* Convert the model to a JSON variable
* Binding the JSON variable to the form
* $scope.$watch() the JSON variable and syncing the data back to the model when it detects a change

Then you have the issue of making sure any changes to the model that happen through the code are reflect in the form data.

Now that this library is using defineProperties() to expose the model's data as simple properties of the model, we should be able to bind the model directly to the form and let AngularJS do it 2-way binding magic for us.

Not supporting IE 8 also gives us access to other ES5 functionality the IE 9+ does support which will probably make certain things easier in the long run.

# Change Log

Each change log are assumed to be accompanied by associated unit test and documentation updates.

## 0.3.0

* IE 8 support dropped
* Completely rewrote the foundation for models/repositories (backward compatible broken)
* Karma configuration file update (phantom configurations now include code coverage)
* Flatten url logic now accounts for the base url
* Added strict mode configuration though not being used anywhere yet

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

There are a suite of unit tests for each thought of use case.  The unit test are execute against both the stable (1.0.6) and unstable (1.1.4) angular branches.  Travis CI use PhantomJS to run it's test but tests are also executed on the following browsers/OSes:

* Chrome (Mac OS X 10.8.x, Windows 7)
* FireFox (Mac OS X 10.8.x, Window 7)
* Safari (Mac OS X 10.8.x)
* Opera (Mac OS X 10.8.x, Windows 7)
* IE 9 (Windows 7)
* IE 10 (Windows 7)

# Usage

This is just basic documentation.  You can probably find out even more by looking at the unit tests and the source code itself.

## NOTE

This is still in early development and as such, I can't guarantee that backwards breaking compatibility changes won't be made.  There may still be bugs or use cases that don't yet have unit tests but if you find any of those, please submit them to the github issue tracker.

### Pull Requests

TBD

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
<script type="text/javascript" src="/components/nucleus-angular-rest/model-factory.js"></script>
<script type="text/javascript" src="/components/nucleus-angular-rest/repository-factory.js"></script>
```

### Dev Dependencies

You will notice 2 different versions of angular and lodash as dev dependencies.  The reason they are set as dev dependencies and not regular dependencies is because I want the user to have the choice of which versions of those libraries to use in production (they are still in the dev dependencies as they are needed to run the unit tests).

Just remember that you will need to include a version of lodash and angular in order for this library to work.

## Including the module

Then finally, include the nag.rest module in your application

```javascript
angular.module('app', ['nag-rest'])
//your application code
```

# Basic Guide

This is just some basic documentation, hopefully enough to get you starting and running with this library.  If you are confused about anything or want to dig deeper, I encourage you to either dig through the unit tests or even the source code.  I can't tell you how much I have learned about angular or unit testing with angular by digging through their source code and unit tests.

If you find anything incorrect in the documentation or find something in the code that you think needs to be documented, please submit and issue in the github tracker.

## Querying REST API results

Unless otherwise specifically stated, any method that makes a request to the api for data, whether returning one or multiple records, can be processed in 2 different ways

One way is by value, as shown by the following:

```javascript
//in this instance an array will be returned and it will have the data populated once the rest api
//returns the data and it is processed
var arrayResults = repository.mngr.find();

//in this instance an empty model will be returned and it will have the data populated once the rest
//api returns the data and it is processed
var project = user.mngr.getRelation('project', 234);
```

The second way is by way of the promise's then() method, as shown by the following:

```javascript
repository.mngr.find().then(function(data) {
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
  //rest api supports paging of data and you need that data for the controller
  totalRecord; = data.rawResponse.meta.totalRecords;
});

user.mngr.getRelation('project', 234).then(function(data) {
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
//the repository
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
  'nagRestRepositoryFactory',
  function(nagRestRepositoryFactory) {
    var userRepository = nagRestRepositoryFactory.create('user');

    //add custom methods to userRepository as needed

    return userRepository;
  }
]);
```

## Config

The configuration service allows you to retrieve/configure certain options of this library.  To retrieve the properties, you can the nagRestConfig service which has the following API (they all also have corresponding set methods as shown in the nagRestConfigProvider example):

* getBaseUrl() - Returns the base url (default: '')
* getResponseDataLocation() - Returns the string representing where the data lives in the response from the rest api (default: '')
* getModelIdProperty() - Returns the default idProperty for schemas (default: 'id')
* getUpdateMethod() - Returns the default method used when updating model with the.sync() method (default: 'PUT')
* getFlattenItemRoute() - Return the value used as the default value for the schema's flattenItemRoute configuration (default: false);
* getStrictMode() - Used to determine if certain code paths should be executed like throwing certain exceptions, doing extra checking, etc... (default: false);
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
    nagRestConfigProvider.setFlattenItemRoute(true);
    nagRestConfigProvider.setStrictMode(true);
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

//after this you will be able to pass the string 'project' with anything asking for a resourceName
nagRestSchemaManager.add('project', projectSchema);

//after this you will be able to pass the string 'team' with anything asking for a resourceName
nagRestSchemaManager.add('team', teamSchema);
```

* get(resourceName, overrideSchemaOptions) - retrieves a schema

```javascript
nagRestSchemaManager.add('user', userSchema);

//this will return a copy of the schema that is tied to the 'user' resource.  this copy can be modified
//without the stored version being effected

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
//effect anything stored in the schema manager itself.  it will also override recursively meaning that
//if you want to override one of the properties, you can do that without effecting the other properties.

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

### Repository Factory

The Repository is the main way to create models and get data from the REST API.  You can create an instance of a Repository by using the nagRestRepositoryFactory service.  That has the following API:

* create(resourceName, overrideSchemaOptions) - returns an instance of a Repository

```javascript
//all you need to do in order to create a repository is pass in the resourceName that matches the
//schema you want
var userRepository = nagRestRepositoryFactory.create('user');

//there is also a second parameter allowing you to customize the schema for the instance of the
//repository that is going to be created.  this is useful if there is a specialized rest api, lets
//say /session, that returns a standard resource
var sessionRepository = nagRestRepositoryFactory.create('user', {
  route: '/session',
  dataItemLocation: 'response.data',
  isArray: false
});
```

### Repositories

All the internal properties are exposed through the .mngr property.  This is done so not to pollute the top level properties and makes a clean distinction between built-in properties and custom properties.  The instance of the repository (the result of the nagRestRepositoryFactory.create()) itself has the following API:

* mngr.schema - returns the schema configured for this repository (READ ONLY)

* mngr.resourceName - returns the resource name configured for this repository (READ ONLY)

* mngr.route - return the base route for this repository (READ ONLY)

* mngr.create(initialData, remoteFlag, overrideSchemaOptions) - returns a new empty instance of the model for the repository

```javascript
//using the repository is the recommended way to generate a new models, the first parameter is the
//initial data
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create({
  firstName: 'John',
  lastName: 'Doe'
});

//now by default it will create a model that has mngr.state set to 'new' so syncing it will make
//it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
//second parameter a value of true.  just note that you also have to make sure that the idProperty of
//initial data is also set otherwise is will still assume the model's mngr.state is 'new' even if
//the second parameter has a value of true
var remoteUser = userRepository.mngr.create({
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);

//the third parameter will allow you to create an instance of a model with a customized schema.  by
//default the model generated will use the schema associated to the repository but the third
//parameter is a list of overrides for the schema for the instance of that model
var customUser = userRepository.mngr.create({}, false, {
  route: '/custom/users'
});
```

* mngr.find(params, headers, postData) - makes a request to the REST API to retrieve data

```javascript
//one method that exists in order to retrieve data from a repository is the find() method.  The first
//parameter of find can take an object with key/value pairs that will be inserted into the query string
//part of the url.

// GET /users?firstName=John
var users = userRepository.mngr.find({
  firstName: 'John'
});

//you can also pass a number/string as the first argument and it will assume that is the value of the
//idProperty for the data the repository represents.  in this case the result is initially a new empty
//model and the data gets filled in once the data is received and processed

// GET /users/123
var user = userRepository.mngr.find(123);

//The second parameter of find() is an object of header/value pairs

// GET /users with request header x-user:test
var users = userRepository.mngr.find({}, {
  'x-user': 'test'
});

//now some rest apis offer the ability to do very complex queries however because of the complexity,
//they require you to pass the data in as a post request instead of get and that is what the third
//parameter is for.  If the third parameters is an object, it will send the request as a POST with
//the data of the third parameters as the content body

// POST /users?query=data with content of
// {
//   "filters": [{
//     "field": "email",
//     "condition": "like",
//     "value": "%@gmail.com"
//   }]
// }
var gmailUsers = userRepository.mngr.find({
  query: 'data',
}, {}, true, {
  filters: [{
    field: 'email',
    condition: 'like',
    value: '%@gmail.com'
  }]
});
```

* forceIsArray(value) - will assume the next request for retrieving data result will or will not be an array (based on passed value), will override schema.isArray

```javascript
//now when retrieving data, the library is smarter enough to guess whether the results will be returned
//as an array or a single object however sometimes the guess will be wrong.  any time you are retrieving
//data without an id, it assumes an array will be returned and when you have an id, it assume an object
//will be returned.  now lets say we have a rest api call with the route /session but it returns a
//single user object.  one way is to use the forceIsArray() method:

// get /session
var sessionRepository = nagRestRepositoryFactory.create('user', {
  '/session'
});
sessionRepository.mngr.forceIsArray(false).find();
```

### Model Factory

The model is the main way to interact with individual records from the REST API and sync data to the REST API.  It is recommended that you use the repository instance to create instances of a model however you can also create an instance of the model using the nagRestModelFactory service.  It has the following API:

* create(resourceName, data, synced, overrideSchemaOptions) - returns an instance of a Model

```javascript
//it is not recommend you create models from the nagRestModelFactory (always try to use the
//repository.mngr.create() method) but if the case does arrive that you need to, the option
//does exist.  the first parameter is the resourceName that has the schema you want to based
//this model off of.
var user = nagRestModelFactory.create('user');

//the second parameter is the initial data
var user nagRestModelFactory.create('user', {
  firstName: 'John',
  lastName: 'Doe'
});

//now by default it will create a model that has mngr.state set to 'new' so syncing it will make
//it attempt a POST.  maybe you are getting data the you know is remote and if so you can give the
//third parameter a value of true.  just note that you also have to make sure that the idProperty of
//initial data is also set otherwise is will still assume the model's mngr.state is 'new' even if
//the second parameter has a value of true
var remoteUser = nagRestModelFactory.create('user', {
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);


//the fourth parameter will allow you to create an instance of a model with a customized schema.  by
//default the model generated will use the schema associated to the repository but the third
//parameter is a list of overrides for the schema for the instance of that model
var customUser = nagRestModelFactory.create('user', {}, false, {
  route: '/custom/users'
});
```

### Models

All the internal properties are exposed through the .mngr property.  This is done so not to pollute the top level properties and makes a clean distinction between built-in properties and custom properties.

#### Properties

Properties configured in the schema for the model are exposed as simple properties of the model object itself:

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.create({
  id: 1,
  firstName: 'John';
  lastName: 'Doe'
});

// returns:
// 1
user.id;

// returns:
// 'John'
user.firstName;

// returns:
// 'Doe'
user.lastName;
```

The instance of the model itself (the results of a repository.mngr.create()) has the following API:

* mngr.state - returns the current state of the model (READ ONLY). Can be the following:
  * new - The model is not yet sent through the api to be process (generally persistent to some backend)
  * loaded - The model's data is the latest data that is is aware of
  * dirty - A very of the model is processed through the API however it has unprocessed changes
  * deleted - The model has been processed for deletion through the API

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create();

// returns:
// 'new'
user.mngr.state;

user.firstName = 'John';
user.lastName = 'Doe';
user.mngr.sync();

// returns:
// 'loaded'
user.mngr.state;

user.firstName = 'John2';

// returns:
// 'dirty'
user.mngr.state;

user.delete();

// returns:
// 'deleted'
user.mngr.state;
```

* mngr.dirtyProperties - returns an array of the property names that are dirty (READ ONLY)

```javascript

var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create();

//since we have not set any data, mngr.dirtyProperties will return an empty array

// returns:
// []
user.mngr.dirtyProperties;

user.username = 'john.doe';

//now that we have set data that is not synced, we can check that by the mngr.dirtyProperties
//which will return an with the properties that are dirty

// returns:
// [
//   'username'
// ]
user.mngr.dirtyProperties;

user.mngr.sync();

//after the data has been synced, mngr.dirtyProperties will return an empty array again

// returns:
// []
user.mngr.dirtyProperties;
```

* mngr.sync(method, syncLocal) - send the local model data to the REST API to be synced

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create();

user.mngr.extendData({
  firstName: 'John',
  lastName = 'Doe',
  username = 'john.doe',
  email = 'john.doe@example.com'
});

//the mngr.sync() method will send the data through the rest api to be processed (generally saved to a data
//store of some sort).  the mngr.sync() method is smart enough to know what method to use.  since the
//model's mngr.state is 'new', mngr.sync() will automatically use POST

// POST /users with content of
// {
//   "firstName": "John"
//   "lastName": "Doe",
//   "username": "john.doe",
//   "email": "john.doe@example.com"
// }
user.mngr.sync();

//now that the data is synced the model's mngr.state is marked as 'loaded' and if you try to
//mngr.sync() again, it is going to PUT the data (or whatever is set and the update method for
//the nagRestConfig service)

// PUT /users/123 with content of
// {
//   "id": 123
//   "firstName": "John"
//   "lastName": "Doe",
//   "username": "john.doe",
//   "email": "john.doe@example.com"
// }
user.mngr.sync();

//the mngr.sync() method also allows you to specify the method to used to sync.  lets say I wanted to
//update the email address however it would be a waste of bandwidth to have to send all the other data
//since it is not changing.  luckily our rest api support the PATCH method and the mngr.sync() method is
//smart enough to only send the dirty property when using the PATCH method
user.email = 'john.doe@example2.com';

// PATCH /users/789 with content of
// {
//   "email": "john.doe@example2.com"
// }
user.mngr.sync('PATCH');
```

* mngr.destroy() - sends a request to the REST API to delete the model

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.find(789);

//to delete the user we can just call the mngr.destroy() method.  you should note the calling
//mngr.destroy() only sends the delete call to the rest api, the model itself still has the data
//so if you wanted (though you should never call mngr.destroy() unless you are sure), you could
//sync the data back

// DELETE /users/789
user.mngr.destroy();
```

* mngr.toJson() - convert the model's data to a simple JSON structure

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mgnr.create();

user.set({
  'firstName': 'John'
  'lastName': 'Doe',
  'username': 'john.doe',
  'email': 'john.doe@example.com'
});

//the mngr.toJson() method returns a json object that represents the data the model is holding

// results:
// {
//   "firstName": "John"
//   "lastName": "Doe",
//   "username": "john.doe",
//   "email": "john.doe@example.com"
// }
var jsonData = user.mngr.toJson();

//also note that modifying the resulting JSON will not effect the models data
jsonData.firstName = 'John2';

// returns:
// 'John'
user.firstName;
```

* mngr.isRemote() - tells you whether or not the model in local only or a version of it is synced to the API.  mngr.isRemote() will return true even if the local version of the model is different from the remote version (mngr.state can tell you the specific state of the model if needed).

```javascript
var userRepository = nagRestBaseRepository.create('user');
var user = userRepository.mngr.create();

//since the model has not been synced to the rest api mngr.isRemote() method will return false

// returns:
// false
user.mngr.isRemote();

var remoteUser = userRepository.mngr.create({
  id: 123,
  firstName: 'John',
  lastName: 'Doe'
}, true);

//since the model is created with the remoteFlag and the idProperty is set, mngrisRemote() will return
//true

// returns:
// true
remoteUser.mngr.isRemote();
```

* mngr.getRelation(relationName, relationId) - gets relational data for the model

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.find(123);

//we can pull any relation thats configured in the relations part of the schema with the
//mngr.getRelation() method.  the first parameter this method takes is the name of the relation
//as it is defined in the schema.  so lets get all projects for a user.

// GET /users/123/projects
user.mngr.getRelation('project').then(function(data) {
  var projects = data.parsedData
});

//you can also pass in a second parameter that is the relation id value

// GET /users/123/projects/234
var project = user.mngr.getRelation('project', 234);
```

* mngr.extendData(newData, setRemoteFlag) - This will allow you to set multiple properties at once by sending them as an object

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create();

//now instead of set each property individually, you can pass an object of property values to the
//extendData method to set multiple values at once
user.mngr.extendData({
  firstName: 'John',
  lastName: 'Doe
});

// returns:
// 'John';
user.firstName;

// returns:
// 'Doe'
user.lastName;
```

* mngr.route - returns the route of the model without the base url prepended (READ ONLY)
* mngr.fullRoute - returns the same things as route but will the base url prepended (READ ONLY)

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create();

//by default it will result in the route for the schema of the model

// returns:
// '/users';
user.mngr.route

//now if the mngr.isRemote() results in true (which just means the mngr.state is either 'loaded' or
//'dirty'), it will include the idProperty of the model in the route

var remoteUser - userRepository.mngr.find(1);

// returns:
// '/users/1'
remoteUser.mngr.route;

//it also take into account the flattenItemRoute property of the schema configuration

var nestedUserRepository = nagRestRepositoryFactory.create('user', {
  route: '/projects/1/users'
  flattenItemRoute: true
});
var nestedUser = nestedUserRepository.mngr.create();

// returns:
// '/projects/1/users'
nestedUser.mngr.route;

var nestedRemoteUser = nestedUserRepository.mngr.find(1);

// returns:
// '/users/1';
nestedRemoteUser.mngr.route;

//fullRoute will just prepend the base url to the route.  lets assume the base url is
//http://api.example.com

// returns:
// 'http://api.example.com/users/1'
nestedRemoteUser.mngr.fullRoute;
```

* mngr.reset() - This will reset all dirty properties of the model to the original state before they were changed (will not work on models where the mngr.state is 'new' or 'deleted')

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
var user = userRepository.mngr.create({
  id: 1,
  firstName: 'John',
  lastName: 'Doe'
}, true);

// returns:
// 'John'
user.firstName;

user.firstName = 'John2';

// returns:
// 'John2'
user.firstName;

user.mngr.reset();

// returns:
// 'John';
user.firstName;
```

* mngr.schema - returns the schema related to this model (READ ONLY)

## Object Definitions

### Schema

* **route (default: null)**
  * The relatively route from the configured base url to this resource
* **idProperty (default: nagRestConfig.getModelIdProperty())**
  * The property that represents the id (generally a primary key in a database)
* **properties: (default: {})**
  * An object with the definition of all the valid properties for the resource where the key is the property name and the value is the property configuration.  Property configuration can be:
    * sync: Tells when this property should be saved (NOTE: when doing a PUT sync, these values are ignored).  The value are:
      * false - don't sync ever (can not set data)
      * 'create' - only save on create (can only set data when model is not synced)
      * 'update' - only save on update (con only set data when model is synced)
* **relations**: This is an object where the key is the name of the resource and the value its configuration
  * resource: The resourceName this relation links to
  * flatten: Used to set the flattenItemRoute when retrieving models using getRelation().  if not set, flattenItemRoute will be set to the value of the flattenItemRoute of the resource schema the relation belongs to
* **dataListLocation: (default: nagRestConfig.getResponseDataLocation())**
  * A string representing the JSON hierarchy where the data in location in the REST API response when returning a list of resources
* **dataItemLocation: (default: getResponseDataLocation())**
  * A string representing the JSON hierarchy where the data in location in the REST API response when returning a single resource
* **autoParse: (default: true)**
  * Whether or not to automatically parse the REST API response
* **requestFormatter: (default: nagRestConfig.getRequestFormatter())**
  * A function that can wrap the model data in a specific format before sending it to the REST API.  This function take one parameter and that in the model data that is being sent.
* **isArray**: (default: null)
  * Determines whether all requests are or are not arrays when retrieving data.  This can be override on a call by call level with the forceIsArray() method on models/repositories
* **flattenItemRoute**: (default: nagRestConfig.getFlattenItemRoute())
  * if set to true, mngr.route/mngr.fullRoute will remove all but the last resource path. (```/users/123/projects/234/teams/345``` would be converted to ```/teams/345```).  This only applies to when there is a trailing id, if the trailing element in the url is a resource name, nothing will get removed (```/users/123/projects/234/teams``` would remain the same)
