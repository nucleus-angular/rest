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

# Basic Guide

TBD

## Config



















