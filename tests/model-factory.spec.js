describe('Rest Model Factory', function(){
  var $httpBackend, $injector, unitTestMocker, userSchema, projectSchema, teamSchema, emailSchema, nagRestSchemaManager, nagRestModelFactory, nagRestConfig;

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
      //returns many
      project: {
        resource: 'project'
      },
      //returns one
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

  emailSchema = {
    route: '/emails',
    properties: {
      id: {
        sync: false
      },
      userId: {},
      email: {}
    },
    dataListLocation: 'response.data.teams',
    dataItemLocation: 'response.data.team'
  }

  beforeEach(module('nag.rest'));
  beforeEach(module('unitTestMocker'));

  beforeEach(inject(function(_$injector_) {
    $injector = _$injector_;
    $httpBackend = $injector.get('$httpBackend');
    unitTestMocker = $injector.get('unitTestMocker');
    nagRestSchemaManager = $injector.get('nagRestSchemaManager');
    nagRestModelFactory = $injector.get('nagRestModelFactory');
    nagRestConfig = $injector.get('nagRestConfig');

    nagRestSchemaManager.add('user', userSchema);
    nagRestSchemaManager.add('project', projectSchema);
    nagRestSchemaManager.add('team', teamSchema);
    nagRestSchemaManager.add('email', emailSchema);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  /*******************************************************************************************************************/
  /***** MODEL CREATION **********************************************************************************************/
  /*******************************************************************************************************************/

  it('should be able to create an empty instance of a model', function() {
    var model = nagRestModelFactory.create('user');

    expect(_.isObject(model.mngr)).to.be.true
    expect(model.id).to.be.null;
    expect(model.firstName).to.be.null;
    expect(model.lastName).to.be.null;
    expect(model.username).to.be.null;
    expect(model.managerId).to.be.null;
    expect(model.mngr.state).to.equal('new');
  });

  it('should be able to specific the initial data when creating a new model', function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    expect(model.firstName).to.equal('John');
    expect(model.lastName).to.equal('Doe');
    expect(model.username).to.equal('john.doe');
  });

  it('should ignore any data that is part of the initial data object that is not configured as a properties int he schema', function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      test: 'test'
    });

    expect(model.test).to.be.undefined;
  });

  it('should be able to override the default schema settings', function() {
    var model = nagRestModelFactory.create('user', null, false, {
      route: '/session',
      properties: {
        isSimulatedLogin: {},
        managerId: {
          sync: 'create'
        }
      }
    });

    expect(model.mngr.schema.route).to.equal('/session');
    expect(model.mngr.schema.properties).to.deep.equal({
      id: {
        sync: false
      },
      firstName: {},
      lastName: {},
      username: {},
      managerId: {
        sync: 'create'
      },
      isSimulatedLogin: {}
    });
  });

  /*******************************************************************************************************************/
  /***** MISC ********************************************************************************************************/
  /*******************************************************************************************************************/

  it('should be able to set and get data as normal properties', function() {
    var model = nagRestModelFactory.create('user');

    model.firstName = 'Bob';
    model.lastName = 'Smith';

    expect(model.firstName).to.equal('Bob');
    expect(model.lastName).to.equal('Smith');
  });

  it('should not be able to redefine the schema once the model has been created', function() {
    var model = nagRestModelFactory.create('user');

    model.mngr.schema = {};

    expect(model.mngr.schema).to.deep.equal({
      route: '/users',
      idProperty: 'id',
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
        project: {
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    });
  });

  it("should be able to reset a dirty object with the original data", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';
    model.lastName = 'Doe2';

    model.mngr.reset();

    expect(model.firstName).to.equal('John');
    expect(model.lastName).to.equal('Doe');
  });

  /*******************************************************************************************************************/
  /***** IS REMOTE ***************************************************************************************************/
  /*******************************************************************************************************************/

  it("should evaluate is remote as false for model in a state of 'new'", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    expect(model.mngr.isRemote()).to.be.false;
  });

  it("should evaluate is remote as true for model in a state of 'loaded'", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    expect(model.mngr.isRemote()).to.be.true;
  });

  it("should evaluate is remote as true for model in a state of 'dirty'", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';

    expect(model.mngr.isRemote()).to.be.true;
  });

  it("should evaluate is remote as false for model in a state of 'deleted'", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('DELETE', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: null
        }
      }, {}];
    });
    model.mngr.destroy();
    $httpBackend.flush();

    expect(model.mngr.isRemote()).to.be.false;
  });

  /*******************************************************************************************************************/
  /***** DIRTY PROPERTIES ********************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to get the dirty properties on a model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';
    model.lastName = 'Doe2';

    expect(model.mngr.dirtyProperties).to.deep.equal([
      'firstName',
      'lastName'
    ]);
  });

  it("should clear dirty properties when syncing a loaded model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';
    model.lastName = 'Doe2';

    $httpBackend.expect('PUT', '/users/1', '{"id":1,"firstName":"John2","lastName":"Doe2","username":"john.doe","managerId":null}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John2',
              lastName: 'Doe2',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    model.mngr.sync();
    $httpBackend.flush();

    expect(model.mngr.dirtyProperties).to.be.empty;
  });

  /*******************************************************************************************************************/
  /***** LOAD BY ARRAY ***********************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to load by from another object", function() {
    var model = nagRestModelFactory.create('user');
    model.mngr.extendData({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(model.mngr.toJson()).to.deep.equal({
      id: null,
      firstName: 'John',
      lastName: 'Doe',
      username: null,
      managerId: null
    });
  });

  it("should be able to load by from another object and set the object to loaded", function() {
    var model = nagRestModelFactory.create('user');
    model.mngr.extendData({
      id: 1,
      firstName: 'John',
      lastName: 'Doe'
    }, true);

    expect(model.mngr.state).to.equal('loaded')
  });

  /*******************************************************************************************************************/
  /***** STATE *******************************************************************************************************/
  /*******************************************************************************************************************/

  it("should keep the model's state as new even when the model has data", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    expect(model.mngr.state).to.equal('new');
  });

  it('should be able to crete a model which is already in a loaded state', function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    expect(model.mngr.state).to.equal('loaded');
  });

  it('should not set the state to loaded even if the remote flag is set to true if the id property is not present in initial data', function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    expect(model.mngr.state).to.equal('new');
  });

  it("should set the state to dirty when the a changing a loaded model's property", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';

    expect(model.mngr.state).to.equal('dirty');
  });

  it("should set the state to deleted when deleting a loaded model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('DELETE', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: null
        }
      }, {}];
    });
    model.mngr.destroy();
    $httpBackend.flush();

    expect(model.mngr.state).to.equal('deleted');
  });

  it("should set the state to deleted when deleting a dirty model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';

    $httpBackend.expect('DELETE', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: null
        }
      }, {}];
    });
    model.mngr.destroy();
    $httpBackend.flush();

    expect(model.mngr.state).to.equal('deleted');
  });

  it("should not set the state to deleted when deleting a new model", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    model.mngr.destroy();

    expect(model.mngr.state).to.equal('new');
  });

  it("should set the model's state to loaded when syncing a dirty model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';

    $httpBackend.expect('PATCH', '/users/1', '{"firstName":"John2"}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John2',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    model.mngr.sync('PATCH');
    $httpBackend.flush();

    expect(model.mngr.state).to.equal('loaded');
  });

  /*******************************************************************************************************************/
  /***** JSON ********************************************************************************************************/
  /*******************************************************************************************************************/

  it('should be able to convert the model to JSON', function() {
    var model = nagRestModelFactory.create('user');

    model.firstName = 'Bob';
    model.lastName = 'Smith';

    expect(model.mngr.toJson()).to.deep.equal({
      id: null,
      firstName: 'Bob',
      lastName: 'Smith',
      username: null,
      managerId: null
    });
  });

  it('should not add properties that are not part of the schema when converting to JSON', function() {
    var model = nagRestModelFactory.create('user');

    model.firstName = 'Bob';
    model.lastName = 'Smith';
    model.noneSchemaProperty = 'test';
    var modelJson = model.mngr.toJson();

    expect(modelJson.noneSchemaProperty).to.be.undefined;
  });

  /*******************************************************************************************************************/
  /***** ROUTES ******************************************************************************************************/
  /*******************************************************************************************************************/

  it("should evaluate the route or the model without the id property in the url if the the model's state is new", function() {
    var model = nagRestModelFactory.create('user');

    expect(model.mngr.route).to.equal('/users');
  });

  it("should evaluate the route or the model without the id property in the url if the the model's state is deleted", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('DELETE', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: null
        }
      }, {}];
    });
    model.mngr.destroy();
    $httpBackend.flush();

    expect(model.mngr.route).to.equal('/users');
  });

  it("should evaluate the route or the model with the id property in the url if the the model's state is loaded", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    expect(model.mngr.route).to.equal('/users/1');
  });

  it("should evaluate the route or the model with the id property in the url if the the model's state is dirty", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    expect(model.mngr.route).to.equal('/users/1');
  });

  it("should not include the base url in the route property", function() {
    nagRestConfig.setBaseUrl('/api');
    var model = nagRestModelFactory.create('user');

    expect(model.mngr.route).to.equal('/users');
  });

  it("should include the base url in the full route property", function() {
    nagRestConfig.setBaseUrl('/api');
    var model = nagRestModelFactory.create('user');

    expect(model.mngr.fullRoute).to.equal('/api/users');
  });

  it("should have a nested route for model that are generated from getRelation()", function() {
    var user = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('GET', '/users/1/projects/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            project: {
              projectId: 1,
              firstName: 'Project 1'
            }
          }
        }
      }, {}];
    });
    var project = user.mngr.getRelation('project', 1).models;
    $httpBackend.flush();

    expect(project.mngr.route).to.equal('/users/1/projects/1');
  })

  it("should not have a nested route for model that are generated from getRelation() is flatten is configured to true for the relation", function() {
    var user = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true, {
      relations: {
        project: {
          flatten: true
        }
      }
    });

    $httpBackend.expect('GET', '/projects/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            project: {
              projectId: 1,
              firstName: 'Project 1'
            }
          }
        }
      }, {}];
    });
    var project = user.mngr.getRelation('project', 1).models;
    $httpBackend.flush();

    expect(project.mngr.route).to.equal('/projects/1');
  });

  /*******************************************************************************************************************/
  /***** SYNCING DATA ************************************************************************************************/
  /*******************************************************************************************************************/

  it("should automatically POST data when syncing a new model", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    $httpBackend.expect('POST', '/users', '{"firstName":"John","lastName":"Doe","username":"john.doe","managerId":null}').respond(function(method, url, data) {
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
    model.mngr.sync();
    $httpBackend.flush();
  });

  it("should automatically PUT data when syncing a new model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';

    $httpBackend.expect('PUT', '/users/1', '{"id":1,"firstName":"John2","lastName":"Doe","username":"john.doe","managerId":null}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John2',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    model.mngr.sync();
    $httpBackend.flush();
  });

  it("should to specify the http method when performing a sync", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    model.firstName = 'John2';

    $httpBackend.expect('PATCH', '/users/1', '{"firstName":"John2"}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John2',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    model.mngr.sync('PATCH');
    $httpBackend.flush();
  });

  it("should use request formatter when sending data", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true, {
      requestFormatter: function(modelData) {
        return {
          request: {
            data: modelData
          }
        }
      }
    });

    model.firstName = 'John2';

    $httpBackend.expect('PATCH', '/users/1', '{"request":{"data":{"firstName":"John2"}}}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John2',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    model.mngr.sync('PATCH');
    $httpBackend.flush();
  });

  it("should not send properties that have a value of false or 'update' for sync when syncing with POST http method", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      managerId: 100
    }, false, {
      properties: {
        managerId: {
          sync: 'update'
        }
      }
    });

    $httpBackend.expect('POST', '/users', '{"firstName":"John","lastName":"Doe","username":"john.doe"}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: 100
            }
          }
        }
      }, {}];
    });
    model.mngr.sync('POST');
    $httpBackend.flush();
  });

  it("should not send properties that have a value of false or 'create' for sync when syncing with PATCH http method", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true, {
      properties: {
        managerId: {
          sync: 'create'
        }
      }
    });

    model.firstName = 'John2';
    model.managerId = 100;

    $httpBackend.expect('PATCH', '/users/1', '{"firstName":"John2"}').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            user: {
              id: 1,
              firstName: 'John2',
              lastName: 'Doe',
              username: 'john.doe',
              managerId: null
            }
          }
        }
      }, {}];
    });
    model.mngr.sync('PATCH');
    $httpBackend.flush();

    expect(model.managerId).to.be.null;
  });

  it("should update the model's data with the data returned from the syncing process", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    $httpBackend.expect('POST', '/users', '{"firstName":"John","lastName":"Doe","username":"john.doe","managerId":null}').respond(function(method, url, data) {
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
    model.mngr.sync('POST');
    $httpBackend.flush();

    expect(model.id).to.equal(1);
  });

  it("should be able to stop the automatic local data sync with syncing the data remotely", function() {
    var model = nagRestModelFactory.create('user', {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    });

    $httpBackend.expect('POST', '/users', '{"firstName":"John","lastName":"Doe","username":"john.doe","managerId":null}').respond(function(method, url, data) {
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
    model.mngr.sync('POST', false);
    $httpBackend.flush();

    expect(model.id).to.be.null;
  });

  it("should be able to delete models", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('DELETE', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: null
        }
      }, {}];
    });
    model.mngr.destroy();
    $httpBackend.flush();
  });

  it("should null id property when deleting a model", function() {
    var model = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('DELETE', '/users/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: null
        }
      }, {}];
    });
    model.mngr.destroy();
    $httpBackend.flush();

    expect(model.id).to.be.null;
  });

  /*******************************************************************************************************************/
  /***** RELATIONS ***************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to get a relation that has many relational records", function() {
    var user = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('GET', '/users/1/projects').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            projects: [{
              projectId: 1,
              name: 'Project 1'
            }, {
              projectId: 2,
              name: 'Project 2'
            }]
          }
        }
      }, {}];
    });
    var projects = user.mngr.getRelation('project').models;
    $httpBackend.flush();

    expect(projects.length).to.equal(2);
    expect(projects[0].mngr.toJson()).to.deep.equal({
      projectId: 1,
      name: 'Project 1'
    });
    expect(projects[1].mngr.toJson()).to.deep.equal({
      projectId: 2,
      name: 'Project 2'
    });
  });

  it("should be able to get a specific record for a relation that has many relational records", function() {
    var user = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true);

    $httpBackend.expect('GET', '/users/1/projects/2').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            project: {
              projectId: 2,
              name: 'Project 2'
            }
          }
        }
      }, {}];
    });
    var project = user.mngr.getRelation('project', 2).models;
    $httpBackend.flush();

    expect(_.isObject(project.mngr)).to.be.true;
    expect(project.mngr.toJson()).to.deep.equal({
      projectId: 2,
      name: 'Project 2'
    });
  });

  it("should be able to get a relation that is tied to a specific field", function() {
    var user = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      teamId: 1
    }, true, {
      properties: {
        teamId: {}
      },
      relations: {
        team: {
          resource: 'team',
          property: 'teamId'
        }
      }
    });

    $httpBackend.expect('GET', '/users/1/teams/1').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            team: {
              id: 1,
              name: 'Team 1'
            }
          }
        }
      }, {}];
    });
    var team = user.mngr.getRelation('team').models;
    $httpBackend.flush();

    expect(_.isObject(team.mngr)).to.be.true;
  });

  /*******************************************************************************************************************/
  /***** IS ARRAY ****************************************************************************************************/
  /*******************************************************************************************************************/

  it("should be able to get a single relational record even though is shows that is should be multiple records", function() {
    var user = nagRestModelFactory.create('user', {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe'
    }, true, {
      relations: {
        project: {
          isArray: null
        }
      }
    });

    $httpBackend.expect('GET', '/users/1/projects').respond(function(method, url, data) {
      return [200, {
        response: {
          status: 'success',
          data: {
            projects: [{
              projectId: 1,
              name: 'Project 1'
            }]
          }
        }
      }, {}];
    });
    var project = user.mngr.getRelation('project').models;
    $httpBackend.flush();

    expect(_.isObject(project[0].mngr)).to.be.true;
  });

  /*******************************************************************************************************************/
  /***** NG-MODEL BINDING ********************************************************************************************/
  /*******************************************************************************************************************/

  describe("Data Binding", function() {
    var $scope, $compile, element, user;

    beforeEach(function() {
      user = nagRestModelFactory.create('user', {
        firstName: 'John',
        lastName: 'Doe',
        username: 'john.doe'
      });
      $scope = $injector.get('$rootScope');
      $scope.user = user;
      $compile = $injector.get('$compile');
      element = $compile('<form name="form">' +
        '<input id="first-name" type="text" ng-model="user.firstName" />' +
        '<input id="last-name" type="text" ng-model="user.lastName" />' +
        '<input id="username" type="text" ng-model="user.username" />' +
        '</form>'
      )($scope);
      $scope.$digest();
    });

    it("should be able to bing to form element directly with ng-model", function() {
      expect(element.find('#first-name').val()).to.equal('John');
      expect(element.find('#last-name').val()).to.equal('Doe');
      expect(element.find('#username').val()).to.equal('john.doe');
    });

    it("should have the model's data be updated when a binding form element is updated", function() {
      element.find('#first-name').controller('ngModel').$setViewValue('John2');

      expect($scope.user.firstName).to.equal('John2');
    });

    it("should have the form's data be updated when a binding form element's scope value is updated", function() {
      $scope.user.lastName = 'Doe2';
      $scope.$digest();

      expect(element.find('#last-name').val()).to.equal('Doe2');
    });
  });

  describe("Data Normalization", function() {
    it("should be able to normalize the data from the model to the format the API is expecting", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            remoteProperty: 'first_name'
          },
          lastName: {
            remoteProperty: 'lastname'
          },
          username: {
            remoteProperty: 'USERNAME'
          },
          managerId: {
            remoteProperty: 'MANAGER_IDENTIFIER'
          }
        }
      });

      user.mngr.extendData({
        firstName: 'John',
        lastName: 'Doe',
        username: 'john.doe',
        managerId: 100
      });

      $httpBackend.expect('POST', '/users', '{"first_name":"John","lastname":"Doe","USERNAME":"john.doe","MANAGER_IDENTIFIER":100}').respond(function(method, url, data) {
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
      user.mngr.sync();
      $httpBackend.flush();
    });
  });

  describe("Property getter/setter functionality", function() {
    it("should be able to set custom getter function for properties", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            getter: function(value) {
              return '#' + value + '!';
            }
          }
        }
      });

      user.firstName = 'Test';

      expect(user.firstName).to.equal('#Test!');
    });

    it("should be able to set custom setter function for properties", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            setter: function(value) {
              return '!' + value + '#';
            }
          }
        }
      });

      user.firstName = 'Test';

      expect(user.firstName).to.equal('!Test#');
    });
  });

  describe("Data Validation", function() {
    it("should return true when attempting to validate a property that has no validation", function() {
      var user = nagRestModelFactory.create('user');

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on a stored validation rule 'required' to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        required: "is required"
      });
    });

    it("should be able to validate based on a stored validation rule 'required' to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          }
        }
      });

      user.firstName = 'John';

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on a stored validation rule 'email' to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              email: {}
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        email: "must be an email"
      });
    });

    it("should be able to validate based on a stored validation rule 'email' to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              email: {}
            }
          }
        }
      });

      user.firstName = 'test@example.com';

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on a stored validation rule 'min' to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              minValue: {
                context: {
                  min: 10
                }
              }
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        minValue: "must be 10 or higher"
      });
    });

    it("should be able to validate based on a stored validation rule 'min' to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              minValue: {
                context: {
                  min: 10
                }
              }
            }
          }
        }
      });

      user.firstName = 20;

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on a stored validation rule 'max' to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              maxValue: {
                context: {
                  max: 10
                }
              }
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        maxValue: "must be 10 or lower"
      });
    });

    it("should be able to validate based on a stored validation rule 'max' to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              maxValue: {
                context: {
                  max: 10
                }
              }
            }
          }
        }
      });

      user.firstName = 1;

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on a stored validation rule 'range' to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              rangeValue: {
                context: {
                  min: 10,
                  max: 20
                }
              }
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        rangeValue: "must be between 10 and 20"
      });
    });

    it("should be able to validate based on a stored validation rule 'range' to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              rangeValue: {
                context: {
                  min: 10,
                  max: 20
                }
              }
            }
          }
        }
      });

      user.firstName = 15;

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on a custom validation rule to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        ruleName: 'must be "John"'
      });
    });

    it("should be able to validate based on a custom validation rule to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      user.firstName = 'John';

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate based on an array of validators that can allow both stored and custom validation rules to false for both", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {},
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      expect(user.mngr.validate('firstName')).to.deep.equal({
        required: "is required",
        ruleName: 'must be "John"'
      });
    });

    it("should be able to validate based on an array of validators that can allow both stored and custom validation rules to false for one", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {},
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      user.firstName = 'Joh';

      expect(user.mngr.validate('firstName')).to.deep.equal({
        ruleName: 'must be "John"'
      });
    });

    it("should be able to validate based on an array of validators that can allow both stored and custom validation rules to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {},
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      user.firstName = 'John';

      expect(user.mngr.validate('firstName')).to.be.true;
    });

    it("should be able to validate all field to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          },
          lastName: {
            validation: {
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      expect(user.mngr.validate()).to.deep.equal({
        firstName: {
          required: "is required"
        },
        lastName: {
          ruleName: 'must be "John"'
        }
      });
    });

    it("should be able to validate some fields to false", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          },
          lastName: {
            validation: {
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      user.firstName = 'John';

      expect(user.mngr.validate()).to.deep.equal({
        lastName: {
          ruleName: 'must be "John"'
        }
      });
    });

    it("should be able to validate all fields to true", function() {
      var user = nagRestModelFactory.create('user', {}, null, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          },
          lastName: {
            validation: {
              ruleName: {
                validator: function(value, context) {
                  return value === 'John' ? true : context.errorTemplate;
                },
                context: {
                  errorTemplate: 'must be "John"'
                }
              }
            }
          }
        }
      });

      user.firstName = 'John';
      user.lastName = 'John';

      expect(user.mngr.validate()).to.be.true;
    });

    it("should validate the model automatic when syncing is configured too", function() {
      var model = nagRestModelFactory.create('user', {
        id: 1,
        firstName: 'John',
        username: 'john.doe'
      }, true, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          },
          lastName: {
            validation: {
              required: {}
            }
          }
        }
      });

      model.firstName = 'John2';

      expect(model.mngr.sync()).to.deep.equal({
        lastName: {
          required: 'is required'
        }
      });
    });

    it("should not perform validation of the model automatic when syncing is not configured to", function() {
      nagRestConfig.setValidateOnSync(false);
      var model = nagRestModelFactory.create('user', {
        id: 1,
        firstName: 'John',
        username: 'john.doe'
      }, true, {
        properties: {
          firstName: {
            validation: {
              required: {}
            }
          },
          lastName: {
            validation: {
              required: {}
            }
          }
        }
      });

      model.firstName = 'John2';

      $httpBackend.expect('PUT', '/users/1', '{"id":1,"firstName":"John2","lastName":null,"username":"john.doe","managerId":null}').respond(function(method, url, data) {
        return [200, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 1,
                firstName: 'John2',
                lastName: null,
                username: 'john.doe',
                managerId: null
              }
            }
          }
        }, {}];
      });
      model.mngr.sync();
      $httpBackend.flush();
    });
  });

  describe('inherited properties', function() {
    it('should be able to define a inherited properties that will be used to extend the functionality of the generate model', function() {
      var model = nagRestModelFactory.create('user', {
        id: 1,
        firstName: 'John',
        username: 'john.doe'
      }, true, {
        inherit: {
          shouldHaveMethod: function() {
            return 'should have method';
          }
        }
      });

      expect(_.isFunction(model.shouldHaveMethod)).to.be.true;
      expect(model.shouldHaveMethod()).to.equal('should have method');
    });

    it('should be able to access regular model properties', function() {
      var model = nagRestModelFactory.create('user', {
        id: 1,
        firstName: 'John',
        username: 'john.doe'
      }, true, {
        inherit: {
          getId: function() {
            return this.id;
          },
          getModelRoute: function() {
            return this.mngr.route;
          }
        }
      });

      expect(model.getId()).to.equal(1);
      expect(model.getModelRoute()).to.equal('/users/1');
    });

    it('should be able to define a inherited properties that have private date that will be used to extend the functionality of the generate model', function() {
      var inheritedProperties = (function() {
        var privateData = 'this data is private';

        return {
          getPrivateData: function() {
            return privateData;
          }
        };
      }());

      var model = nagRestModelFactory.create('user', {
        id: 1,
        firstName: 'John',
        username: 'john.doe'
      }, true, {
        inherit: inheritedProperties
      });

      expect(model.getPrivateData()).to.equal('this data is private');
    });
  });

  it("should call setters on initial data load", function() {
    var model = nagRestModelFactory.create('user', {
      id: '1',
      firstName: 'John',
      username: 'john.doe'
    }, true, {
      properties: {
        id: {
          setter: function(value) {
            return parseInt(value);
          }
        }
      }
    });

    expect(model.mngr.toJson()).to.deep.equal({
      id: 1,
      firstName: 'John',
      lastName: null,
      username: 'john.doe',
      managerId: null
    });
  });

  it("should call setters when extending data", function() {
    var model = nagRestModelFactory.create('user', {}, true, {
      properties: {
        id: {
          setter: function(value) {
            return parseInt(value);
          }
        }
      }
    });
    model.mngr.extendData({
      id: '1',
      firstName: 'John',
      username: 'john.doe'
    });

    expect(model.mngr.toJson()).to.deep.equal({
      id: 1,
      firstName: 'John',
      lastName: null,
      username: 'john.doe',
      managerId: null
    });
  });
});
