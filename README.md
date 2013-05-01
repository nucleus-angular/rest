# Nucleus Angular REST

This component of Nucleus Angular is designed to allow you to easily use a REST API within your AngularJS.  There are other libraries that serve a similar a similar purpose to this one and the two I most commonly see reference are:

* Restangular - https://github.com/mgonto/restangular
* BreezeJS - http://www.breezejs.com

An I invite you to have a look at those solutions, they might be a better fit for you.

## Way Another Library Then

This library differs from those libraries in a few ways.

In contrast to Restangular, this library provides more structure.  You are able to define models and they attributes.  This opens the library to provide functionality like automatic data validation and such.

In constrast to BreezeJS, this library is designed specific for AngularJS and it designed in such a way that it make no assumptions to the backend used (I know BreezeJS can be used with any backend however it's roots seem to be .NET/EF). Being designed specifically for AngularJS, this library will be able to do certain thing that BreezeJS might not be able to or at least be able to do in as a clean way.  It will also not have functionality that is designed for a specific system (like having Int16, Int32, Int64 data types is probably on useful for .NET/EF).  Everything will be able the most generic level in javascript (that type of data checking can be done on the REST API where I believe it belongs).

As long your are implementing a RESTish API, this solution should work for you.

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

## Config

The configuration default values are stored in the config.js files and these are the items with there default values:

```javascript
angular.module('nag.rest.config', [])
.value('nagRestBaseUrl', '')
.value('nagRestResponseDataLocation', '')
.value('nagRestModelIdProperty', 'id')
.value('nagRestUpdateMethod', 'PUT')
.value('nagRestRequestFormatter', function() {});
```

It is recommended that you include this file so that you at least get the default value for each item and then if you need to overwrite any of them, just do it after you include the core config.js file like this:

```javascript
angular.module('nag.rest.config')
.value('nagRestBaseUrl', '/api')
//whatever you need to override...
.value('nagRestUpdateMethod', 'PATCH');
```

## APIs

A list of the APIs for the components included in this package.  Right now this only contains a basic list of methods and parameters with a simple description.  For more detailed documentation you can go to <a href="#code-example-documentation">Code Example Documentation</a>, read the unit tests, or read the source code.  This documentation will be improved over time.

### Note

Only the API's designed for public use are documented here.  There is some functionality that is exposed publicly however it is not intended for general use.  This methods start with an underscore _.  It is **highly recommended** that you don' use those unless you know exactly what you are doing as using those incorrectly could result in a broken system or even mess up data that is retrieved or sent to the REST API.

**YOU HAVE BEEN WARNED**

### Schema Manager

The Schema Manager can be access through the nagRestSchemaManager provider.  It has the following API:

* add(resourceName, schema) - adds a schema (look at <a href="#schema">schema</a> to see the schema structure)
* get(resourceName, overrideSchemaOptions) - retrieves a schema
* remove(resourceName) - removes a schema

### Repository

The Repository is the main way to create models and get data from the REST API.  You can create an instance of a Repository by using the nagRestBaseRepository provider.  That has the following API:

* create(resourceName, overrideSchemaOptions) - returns an instance of a Repository

The instance of the repository itself has the following API:

* create(data, synced, overrideSchemaOptions) - returns a new empty instance of the model for the repository
* find(params, headers, isPost, postData) - makes a request to the REST API to retrieve data

### Model

The model is the main way to interact with individual records from the REST API and sync data to the REST API.  It is recommended that you use the repository instance to create instances of a model however you can also create an instance of the model using the nagRestBaseModel provider.  It has the following API:

* create(resourceName, data, synced, overrideSchemaOptions) - returns an instance of a Model

The instance of the model itself has the following API:

* get(property) - retrieves a property value
* set(property, value, notDirty) - sets a property value, to set multiple values at the same time, pass in a object with the property -> value and leave the second parameter emapty.
* isRemote() - tells you whether or not the model in local only or a version of it is synced to the REST API.  isRemote() will return true even if the local version of the model is different from the remote version (isDirty() is used to check if the record is different).
* isDirty() - tells you if there an any un-synced changes to the local model
* getDirtyProperties() - returns an array of the property names that are dirty
* sync(method, syncLocal) - send the local model data to the REST API to be synced
* destroy() - sends a request tot he REST API to delete the model
* isProperty(property) - tells you if the passed property name is a configured property of the model
* toJson() - convert the model's data to a simple JSON structure
* getRelation(relationName, relationId) - gets relational data for the model

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
* **relations: {}**
  * This is an object where the key is the name of the resource and the value the relative route (set to null to use route configured in the schema for the resource)
* **dataListLocation: (default: restModelDefaultDataLocation)**
  * A string representing the JSON hierarchy where the data in location in the REST API response when returning a list of resources
* **dataItemLocation: (default: restModelDefaultDataLocation)**
  * A string representing the JSON hierarchy where the data in location in the REST API response when returning a single resource
* **autoParse: (default: true)**
  * Whether or not to automatically parse the REST API response
* **requestFormatter: (default: empty function)**
  * A function that can wrap the model data in a specific format before sending it to the REST API.  This function take one parameter and that in the model data that is being sent.

## Code Example Documentation

The easiest way to explain the code is to go through actual code, so here is a highly commented example piece of code:

#### Structuring The Code

This code example documentation is not structured in any angular code like .service, .factory, .run, etc... however one tip I would give on this subject is that I think it make sense to wrap common use repositories in a factory like this:

```javascript
angular.module('app.models', ['nag.rest'])
.factory('userRepository', [
  'nagRestSchemaManager',
  'nagRestBaseRepository',
  function(nagRestSchemaManager, nagRestBaseRepository) {
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

    var userRepository = nagRestBaseRepository('user');

    //add custom methods to userRepository as needed

    return userRepository;
  }
]);
```

Now you just need to inject the userRepository service wherever you need it.

```javascript
//nucleus angular rest does not work out of the box without any configuration.  The first thing you need
//to do is at least configure one schema in the manager, we are going to configure two in order to be
//able to fully explore all the available functionality.
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
      route: '/projects'
    }
  },
  dataListLocation: 'response.data.users',
  dataItemLocation: 'response.data.user'
};

projectModelOptions = {
  route: '/projects',
  properties: {
    projectId: {
      sync: false
    },
    name: {},
    creatorId: {}
  },
  idProperty: 'projectId',
  dataListLocation: 'response.data.projects',
  dataItemLocation: 'response.data.project'
};

nagRestSchemaManager.add('user', userSchema);

//repositories are designed to be the primary way to interact with the rest api and generate models.
//to create an instance of a repository, just use the create method of the nagRestBaseRepository component
//the first parameters is the name of resource which has been added to the schema manager
var userRepository = nagRestBaseRepository.create('user');

//there is a second parameter that is optional allowing you to override any schema parameter.  this
//repository will have a different route than the one define for the 'user' resource in the schema manager
var customUserRepository = nagRestBaseRepository.create('user', {
  route: '/custom/users';
});

//one method that exists in order to retrieve data for a repository is the find() method.  The first
//parameter of find can take an object with key/value pairs that will be inserted into the query string
//part of the url.  you will also notice that we are going to use the return value as the data result
//in this case.  when doing a find with an object, you will initially get in an empty string but it will
//be filled with the data once it have been received and processed

// GET /users?firstName=Joe
var users = userRepository.find({
  firstName: 'Joe'
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

//now some rest apis offer the ability to do very complex queries however because of the complexity, they
//require you to pass the data in as a post request instead of get and that is what the third and fourth
//parameters are for.  the third parameter is a boolean on whether or not you want to make the request as
//a post.  the fourth parameter is object representing the content of the post request (you will never
//need the fourth parameter unless the third one is set to true)

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

//in all the examples above we have returned arrays or model instances however that is not the only
//way to process the data from the find() method.  the returning value from find() also has a then()
//method that is a promise that is resolved after the resulting ajax request to the rest api is finished
//and everything is processed.  To access the data using the promise we could do
var users;

// GET /users
userRepository.find({}).then(function(data) {
  //the data parameter has a few properties associated to it.  if the schema configuration has autoParse
  //to true (which my default it is) one of them will be parsedData.  in the result of doing a find() with
  //a string/number, parsedData is a model and when doing .find() with an object, parsedData is an array
  users = data.parsedData;

  //another element that is always available is the raw unprocessed JSON of the response as the rawResponse
  //property.  if you have autoParse set to false then you would have to use the promise way of getting the
  //data and process the rawResponse manually in the success of the then() method
  var customResponseProcessor = function(response) {
    //code...
  };
  users = customResponseProcessor(data.rawResponse);

  //another use for the rawResponse is maybe there is some meta data you need, like for instance the rest
  //api supports pagination and you need that data for the controller
  totalRecord; = data.rawResponse.meta.totalRecords;
});

//if we want to create a new user, you can use the repository's create() method
var user = userRepository.create();

//to set data just use the set() method
user.set('username', 'joe.doe');

//we can also set multiple values with one set call
user.set({
  'firstName': 'Joe',
  'lastName': 'Doe',
  'email': 'joe.doe@example.com',
});

//now that we have set data that is not synced, we can check that by the isDirty() method
user.isDirty(); //returns true

//we can also see what properties are dirty with the getDirtyProperties() method
user.getDirtyProperties(); //returns ['firstName', 'lastName', 'email', 'username']

//since the model has not been synced to the rest api isRemote() method will return false
user.isRemote(); //return false

//now lets say we want to send that data to the rest api to be save, well that is as easy as calling the
//sync() method.  the sync() method it smart enough to know whether or not to use POST or the
//nagRestUpdateMethod (which is defaulted to PUT)

// POST /users with content of
// {
//   "firstName": "Joe"
//   "lastName": "Doe",
//   "username": "joe.doe",
//   "email": "joe.doe@example.com"
// }
user.sync();

//now isRemote() will return true
user.isRemote(); //returns true

//lets see what happen if we save again

// PUT /users/789 with content of
// {
//   "id": 789
//   "firstName": "Joe"
//   "lastName": "Doe",
//   "username": "joe.doe",
//   "email": "joe.doe@example.com"
// }
user.sync();

//the sync method also allows you to specific the method to use specifically.  lets say I wanted to
//update the email address however it would be a waste of bandwidth to have to send all the other data
//since it is not changing.  luckily our rest api support the patch method and the sync() method is smart
//enough to only send the dirty property when using the patch method
user.set('email', 'joe.doe@example2.com');

// PATCH /users/789 with content of
// {
//   "email": "joe.doe@example2.com"
// }
user.sync('PATCH');

//there is a second parameter to the sync() method and that tells it whether or not to sync the data retrieved from the rest api.  this is defaulted to true and it useful for server generated data (like auto incremented primary keys, created/updated timestamps, etc...).  Some times you might not want this functionality so all you have to do is set the second parameter to false

user.set('email', 'joe.doe@example.com');

// PATCH /users/789 with content of
// {
//   "email": "joe.doe@example.com"
// }
user.sync('PATCH', false);

//to delete the user we can just call the destroy() method.  you should note the calling destroy() only
//sends the delete call to the rest api, the model itself still has the data so if you wanted (though you
//should never call destroy() unless you are sure), you could sync the data back

// DELETE /users/789
user.destroy();

// POST /users with content of
// {
//   "id": 790
//   "firstName": "Joe"
//   "lastName": "Doe",
//   "username": "joe.doe",
//   "email": "joe.doe@example.com"
// }
user.sync();

userRepository.find(123).then(function(data) {
  var user = data.parsedData;

  //we can also pull any schema configured relations with the getRelation() method.  the first parameter
  //this method takes is the name of the relation as it is defined in the schema.  so lets get all
  //projects for a user.  we are going to use the promise way of getting this data but you could also
  //use the value way too just like with the repository's find() method

  // GET /users/123/projects
  user.getRelation('project').then(function(data) {
    var projects = data.parsedData
  });

  //the second parameter is the id of the relation if we are only looking for a specific on.  let use the
  //value way of getting the data here

  // GET /users/123/project/234
  var project = user.getRelation('project', 234);
});
```
