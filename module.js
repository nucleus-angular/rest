/**
 * # Rest Module
 *
 * The rest module is a collection of component that make interacting with a REST API back-end easier.
 *
 * ## IE 8 Support
 *
 * Originally this library was designed to support IE 8 (the 0.2.x series) however a concern relating to the implementation specifically there to support IE 8 was brought up and was a valid concern.  After playing around with a few other implementations that supported IE 8, it was decided to just drop IE 8 support.
 *
 * The specific issue was the fact that IE 8 does not support Object.defineProperty()/Object.defineProperties().  Not having these available forces the library to use an methodology that has been somewhat common of doing set(field, value)/get(field) methods to interact with data (as far as I know, even libraries like ExtJS/Sencha do this: http://docs.sencha.com/extjs/4.0.7/#!/api/Ext.data.Model).  While this has worked in the passed and will continue to work in the future for other libraries, doing it like this for an AngularJS library is not the greatest.
 *
 * With set()/get() methods, binding a model to say a form is not that straight forward.  The process go something like this:
 *
 * - Convert the model to a JSON variable
 * - Binding the JSON variable to the form
 * - $scope.$watch() the JSON variable and syncing the data back to the model when it detects a change
 *
 * Then you have the issue of making sure any changes to the model that happen through the code are reflect in the form data.
 *
 * Now that this library is using defineProperties() to expose the model's data as simple properties of the model, we should be able to bind the model directly to the form and let AngularJS do it 2-way binding magic for us.
 *
 * Not supporting IE 8 also gives us access to other ES5 functionality the IE 9+ does support which will probably make certain things easier in the long run.
 *
 * ## Installation
 *
 * Installation of Nucleus Angular REST is simply done with bower:
 *
 * ```
 * bower install nucleus-angular-rest
 * ```
 *
 * ## File Inclusion
 *
 * Then include the files:
 *
 * ```html
 * <script type="text/javascript" src="/components/string-json-parser/string-json-parser.js"></script>
 * <script type="text/javascript" src="/components/nucleus-angular-rest/module.js"></script>
 * <script type="text/javascript" src="/components/nucleus-angular-rest/config-provider.js"></script>
 * <script type="text/javascript" src="/components/nucleus-angular-rest/schema-manager-factroy.js"></script>
 * <script type="text/javascript" src="/components/nucleus-angular-rest/model-factory.js"></script>
 * <script type="text/javascript" src="/components/nucleus-angular-rest/repository-factory.js"></script>
 * ```
 *
 * ### Dev Dependencies
 *
 * You will notice 2 different versions of angular and lodash as dev dependencies.  The reason they are set as dev dependencies and not regular dependencies is because I want the user to have the choice of which versions of those libraries to use in production (they are still in the dev dependencies as they are needed to run the unit tests).
 *
 * Just remember that you will need to include a version of lodash and angular in order for this library to work.
 *
 * ## Including the module
 *
 * Then finally, include the nag.rest module in your application
 *
 * ```javascript
 * angular.module('app', ['nag-rest'])
 * //your application code
 * ```
 *
 * ## Structuring The Code
 *
 * This code example documentation is not structured in any angular code like .service, .factory, .run, etc... however one tip I would give on this subject is that I think it make sense to wrap common use repositories in a config/factory like this:
 *
 * ```javascript
 * angular.module('app.models', ['nag.rest'])
 * //adding the schema in the .config() will allow it to be available without having to get an instance of
 * //the repository
 * .config([
 *   'nagRestSchemaManager',
 *   function(nagRestSchemaManager) {
 *     nagRestSchemaManager.add('user', {
 *       route: '/users',
 *       properties: {
 *         id: {
 *           sync: false
 *         },
 *         firstName: {},
 *         lastName: {},
 *         username: {},
 *         email: {}
 *       },
 *       relations: {
 *         project: {
 *           route: '/projects'
 *         }
 *       },
 *       dataListLocation: 'response.data.users',
 *       dataItemLocation: 'response.data.user'
 *     });
 *   }
 * ])
 * .factory('userRepository', [
 *   'nagRestRepositoryFactory',
 *   function(nagRestRepositoryFactory) {
 *     var userRepository = nagRestRepositoryFactory.create('user');
 *
 *     //add custom methods to userRepository as needed
 *
 *     return userRepository;
 *   }
 * ]);
 * ```
 *
 * @module nag.rest
 */
angular.module('nag.rest', []);
