describe('Rest Base Repository', function(){
  var $httpBackend, unitTestMocker, userSchema, projectSchema, teamSchema, nagRestSchemaManager, nagRestRepositoryFactory, nagRestConfig;

  userSchema = {
    route: '/users',
    properties: {
      id: {
        sync: false
      },
      firstName: {},
      lastName: {},
      username: {},
      managerId: {}
    },
    relations: {
      job: {
        resource: 'project'
      },
      manager: {
        resource: 'user',
        property: 'managerId'
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
      name: {}
    },
    relations: {
      team: {
        resource: 'team',
        flatten: false
      }
    },
    idProperty: 'projectId',
    dataListLocation: 'response.data.projects',
    dataItemLocation: 'response.data.project'
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

  beforeEach(module('nag.rest.repository'));
  beforeEach(module('unitTestMocker'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    unitTestMocker = $injector.get('unitTestMocker');
    nagRestSchemaManager = $injector.get('nagRestSchemaManager');
    nagRestRepositoryFactory = $injector.get('nagRestRepositoryFactory');
    nagRestConfig = $injector.get('nagRestConfig');

    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);
    nagRestSchemaManager.add('team', teamSchema);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  /*******************************************************************************************************************/
  /***** REPOSITORY CREATION *****************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to create and instance of a repository", function() {
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.resourceName).toEqual('user');
  });

  it("should be able to override schema values", function() {
    var repository = nagRestRepositoryFactory.create('user', {
      route: '/session',
      properties: {
        test: {},
        id: {
          sync: 'create'
        }
      }
    });

    var expectedSchema = {
      route: '/session',
      idProperty: 'id',
      properties: {
        id: {
          sync: 'create'
        },
        firstName: {},
        lastName: {},
        username: {},
        managerId: {},
        test: {}
      },
      relations: {
        job: {
          resource: 'project'
        },
        manager: {
          resource: 'user',
          property: 'managerId'
        }
      },
      dataListLocation: 'response.data.users',
      dataItemLocation: 'response.data.user',
      autoParse: true,
      requestFormatter: nagRestConfig.getRequestFormatter(),
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    expect(repository.mngr.schema).toEqual(expectedSchema);
  });

  /*******************************************************************************************************************/
  /***** MODEL CREATION **********************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to create instance of model", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create();

    expect(model.mngr.state).toBe('new');
  });

  it("should be able to create instance of model with initial data", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(model.mngr.toJson()).toEqual({
      id: null,
      firstName: 'John',
      lastName: 'Doe',
      username: null,
      managerId: null
    });
  });

  it("should be able to create instance of model with initial data", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    }, true);

    expect(model.mngr.state).toBe('loaded');
  });

  it("should be able to create instance of model with a customized schema", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model = repository.mngr.create({
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    }, true, {
      route: '/session',
      properties: {
        test: {},
        id: {
          sync: 'create'
        }
      }
    });

    var expectedSchema = {
      route: '/session',
      idProperty: 'id',
      properties: {
        id: {
          sync: 'create'
        },
        firstName: {},
        lastName: {},
        username: {},
        managerId: {},
        test: {}
      },
      relations: {
        job: {
          resource: 'project'
        },
        manager: {
          resource: 'user',
          property: 'managerId'
        }
      },
      dataListLocation: 'response.data.users',
      dataItemLocation: 'response.data.user',
      autoParse: true,
      requestFormatter: nagRestConfig.getRequestFormatter(),
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    expect(model.mngr.schema).toEqual(expectedSchema);
  });

  /*******************************************************************************************************************/
  /***** ROUTE *******************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to generate route", function() {
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.route).toBe('/users');
  });

  it("should not include base url in route property", function() {
    nagRestConfig.setBaseUrl('/api');
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.route).toBe('/users');
  });

  it("should include base url in full route property", function() {
    nagRestConfig.setBaseUrl('/api');
    var repository = nagRestRepositoryFactory.create('user');

    expect(repository.mngr.fullRoute).toBe('/api/users');
  });

  /*******************************************************************************************************************/
  /***** FIND ********************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be and to find multiple models using promise method", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var models = [];

    $httpBackend.expect('GET', '/users?firstName=John').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    repository.mngr.find({
      firstName: 'John'
    }).then(function(data) {
      models = data.parsedData;

      expect(data.rawResponse).toEqual({
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      });
    }, function(rawResponse) {

    });
    $httpBackend.flush();

    expect(models.length).toBe(2);
    expect(models[0].mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).toEqual({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  it("should be and to find multiple models using return value", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users?firstName=John').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.find({
      firstName: 'John'
    });
    $httpBackend.flush();

    expect(models.length).toBe(2);
    expect(models[0].mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).toEqual({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  it("should be and to find a single model using promise method", function() {
    var repository = nagRestRepositoryFactory.create('user');
    var model;

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    repository.mngr.find(1).then(function(data) {
      model = data.parsedData;

      expect(data.rawResponse).toEqual({
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      });
    }, function(rawResponse) {

    });
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).toBe(true);
    expect(model.mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });

  it("should be and to find a single model using return value", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.find(1);
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).toBe(true);
    expect(model.mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });

  it("should be able to send custom header with the find request", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users?firstName=John').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.find({
      firstName: 'John'
    }, {
      'X-Custom-Header-UT': 'unit-test'
    });
    $httpBackend.flush();

    expect(models.length).toBe(2);
    expect(models[0].mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).toEqual({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  it("should be able to find data with the POST http method", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('POST', '/users?firstName=John', '{"filters":[{"field":"username","condition":"LIKE","value":"john.%"}]}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.find({
      firstName: 'John'
    }, null, {
      filters: [{
        field: 'username',
        condition: 'LIKE',
        value: 'john.%'
      }]
    });
    $httpBackend.flush();

    expect(models.length).toBe(2);
    expect(models[0].mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).toEqual({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  /*******************************************************************************************************************/
  /***** IS ARRAY ****************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to use the schema's isArray configuration to override the schema as a single record and not the default logic", function() {
    var repository = nagRestRepositoryFactory.create('user', {
      route: '/session',
      isArray: false
    });

    $httpBackend.expect('GET', '/session').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var session = repository.mngr.find();
    $httpBackend.flush();

    expect(_.isObject(session.mngr)).toBe(true);
    expect(session.mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });

  it("should be able to force the next request to get the data as an array even though the url says it should be a single record", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            users: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }, {
              id: 2,
              firstName: 'John',
              lastName: 'Doe2',
              username: 'john.doe2',
              managerId: null
            }]
          }
        }
      }, {}];
    });
    var models = repository.mngr.forceIsArray(true).find(1);
    $httpBackend.flush();

    expect(models.length).toBe(2);
    expect(models[0].mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
    expect(models[1].mngr.toJson()).toEqual({
      id: 2,
      firstName: 'John',
      lastName: 'Doe2',
      username: 'john.doe2',
      managerId: null
    });
  });

  it("should be able to get data as a single record even though the url show it as a multi-record result", function() {
    var repository = nagRestRepositoryFactory.create('user');

    $httpBackend.expect('POST', '/users?firstName=John', '{"filters":[{"field":"username","condition":"LIKE","value":"john.%"}]}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.forceIsArray(false).find({
      firstName: 'John'
    }, null, {
      filters: [{
        field: 'username',
        condition: 'LIKE',
        value: 'john.%'
      }]
    });
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).toBe(true);
    expect(model.mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });

  /*******************************************************************************************************************/
  /***** FLATTENED URL ***********************************************************************************************/
  /*******************************************************************************************************************/

  it("should flattern the url when retrieving single record and flattenItemRoute is set to true", function() {
    var repository = nagRestRepositoryFactory.create('user', {
      route: '/projects/1/users',
      flattenItemRoute: true
    });

    $httpBackend.expect('GET', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    var model = repository.mngr.find(1);
    $httpBackend.flush();

    expect(_.isObject(model.mngr)).toBe(true);
    expect(model.mngr.toJson()).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: null
    });
  });
});
