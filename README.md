# Nucleus Angular REST

This component of Nucleus Angular is designed to allow you to easily use a REST API within your AngularJS applications.  There are other libraries that serve a similar purpose to this one and the two I most commonly see referenced are:

* Restangular - https://github.com/mgonto/restangular
* BreezeJS - http://www.breezejs.com

An I invite you to have a look at those solutions if this library does not seem to feel like a right fit for you.

## Installation

Installation is a relatively easy process.  You can install with bower:

```bower instal nucleus-angular-rest```

Then you need to include the following files:

```
module.js
config.js
schema-manager.js
repository-manager.js
model-manager.js
```

It is quite a few files however you should be mining and combining your javascript files (even libraries that you are including).  That being said, at some point before 1.0, I will have a build process that will min and combine those files into one for easier inclusion.

## Coding Standards

Thois code should follow the guidelines mentioned here : https://github.com/ryanzec/coding-standards

## Documentation

There is a <a href="#quick-guide-work-in-progress">Quick Guide</a> available at the bottom of this README.  There is also documentation that is generated from the docblocks comments in the code that is available at http://nadocs.ryanzeclabs.com/rest

## LICENSE

MIT

## Why Another Library Then

This library differs from the libraries I mentioned above in a few ways.

In contrast to <a href="https://github.com/mgonto/restangular">Restangular</a>, this library provides more structure.  You are able to define models and their attributes.  This opens the library to provide functionality like automatic data validation, dirty field tracking, and so on.

In contrast to <a href="http://www.breezejs.com">BreezeJS</a>, this library is designed specifically for AngularJS and is designed in such a way that it makes no assumptions to the backend used (I know BreezeJS can be used with any backend however it's roots seem to be .NET/EF). Being designed specifically for AngularJS, this library will be able to do certain things that BreezeJS might not be able to do or at least be able to do in as a cleaner way.  It will also not have functionality that is designed for a specific system (like having Int16, Int32, Int64 data types is probably mainly useful for .NET/EF, diffidently not languages like PHP or Python).  Everything will be at the most generic level in javascript.  Validation based on Int16, Int32, Int64 data types can be done on the REST API where I believe it belongs (since it is not valid for all server side implementations).

As long your are implementing a RESTish API, this solution should work for you.

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

# Quick Guide (WORK IN PROGRESS)

This is only provided as a quick start guide and will not cover every single possible feature.  All features should have inline documentation with a YUI DOCS sytle documentation and they is a documentation generator in the works.

In order to get started we need to create and object to interact with the REST end-point.  In order to create that object, you need to define the schema for the model.  You use the nagRestSchemaManager in order to add a schema:

```javascript
var userSchmea = {
  //route the the REST end-point
  route: '/users',

  //list of properties for the model
  properties: {
    id: {
      //whether or not to send the property to the REST end-point when syncing data
      sync: false,

      //if the name of the property returned from the REST end-point does not match the name of the
      //property for the model, you can define it here
      remoteProperty: 'USER_ID',

      //if you need to do something every time you need to access the property, you can provide a
      //getter function
      getter: funtion(value) {
        return '#' + value;
      },

      //if you need to do something every time you need to set the property, you can provide a
      //setter function
      seter: function(value) {
        return '#' + value;
      }
    },
    firstName: {},
    lastName: {},
    username: {},
    managerId: {}
  },

  //you can define relations for models
  relations: {
    manager: {
      //the linking resources schema name
      resource: 'user',

      //the property the links to the relationship
      property: 'managerId'
    }
  },

  //where in the REST end-point response the data is located for calls that return multiple objects
  dataListLocation: 'response.data.users',

  //where in the REST end-point response the data is located for calls that return a single object
  dataItemLocation: 'response.data.user'
};

nagRestSchemaManager.add('user', userSchema);
```

***All internal methods on repository and models are attached to a mngr property to help make sure you can add whatever property/methods (expect mngr) to be base objects without conflicting with this system.***

With the schema defined, you can now create a repository which will access as the main access point to the REST end-point:

```javascript
var userRepository = nagRestRepositoryFactory.create('user');
```

There are a number of things that can be done the respository:

```javascript
//create a new object, optional passing default data
var user = userRepository.mngr.create({
  firstName: 'John',
  lastName: 'Doe'
});

//find a single object
var user = userRepository.mngr.find(1).models;

//find multiple objects
var users = userRepository.mngr.find({
  firstName: 'John'
}).models;
```

In order to save an object, you can call the sync method:

```javascript
user.mngr.sync();
```

# QUICK GUIDE WORK IN PROGRESS
