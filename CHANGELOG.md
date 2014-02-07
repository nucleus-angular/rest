# Change Log

Each change log are assumed to be accompanied by associated unit test and documentation updates.

## 0.3.6
* added support for defining inherited methods in schema definitions (#28)

## 0.3.5
* fixed bug where model sync was not using full route

## 0.3.4
* added support for data validation (#3)

## 0.3.3
* added support for custom getters/setters for modal properties
* removed ES5 Shim since we are no longer support IE 8 (#20)
* added ability to mapping incoming data to different property names within the model (#22)
* fixed bug where base url was not being accounted for (#24)
* ModelFactory.create() now properly normalizes initail data( #25)
* Misc changes and clean up

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
