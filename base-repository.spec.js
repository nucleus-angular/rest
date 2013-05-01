describe('Rest Base Repository', function(){
  var $httpBackend, unitTestMocker, userSchema, projectSchema, nagRestSchemaManager, nagRestBaseRepository;

  userSchema = {
    route: '/users',
    properties: {
      id: {
        sync: false
      },
      firstName: {},
      lastName: {},
      username: {}
    },
    relations: {
      project: {
        route: '/projects'
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
    idProperty: 'projectId',
    dataListLocation: 'response.data.projects',
    dataItemLocation: 'response.data.project'
  };

  beforeEach(module('nag.rest.baseRepository'));
  beforeEach(module('unitTestMocker'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    unitTestMocker = $injector.get('unitTestMocker');
    nagRestSchemaManager = $injector.get('nagRestSchemaManager');
    nagRestBaseRepository = $injector.get('nagRestBaseRepository');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should set default values', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');

    expect(repository._getSelfRoute()).toBe('/users');
  });

  it('should should be able to override default values', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user', {
      route: '/my/users'
    });

    expect(repository._getSelfRoute()).toBe('/my/users');
  });

  it('should not be able to redefine model options once they have been set for a repository', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');

    expect(function() {
      repository._setSchema(projectSchema)
    }).toThrow(new Error("Can't redefine schema once they have been set"));

    expect(repository._getSelfRoute()).toBe('/users');
  });

  it('should not be able to redefine models schema name once is has been set for a repository', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');

    expect(function() {
      repository._setSchema(projectSchema)
    }).toThrow(new Error("Can't redefine schema once they have been set"));

    expect(repository._getSelfRoute()).toBe('/users');
  });

  it('should be able to get self route without base route', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');

    expect(repository._getSelfRoute(false)).toBe('/users');
  });

  it('should be able to get an instance of model', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var model = repository.create();

    expect(model.toJson()).toEqual({});
    expect(model.getDirtyProperties()).toEqual([]);
    expect(model.isDirty()).toBe(false);
    expect(model.isRemote()).toBe(false);
    expect(model._getSelfRoute()).toBe('/users');
  });

  it('should be able to get an instance of model using promises', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var models = [];

    unitTestMocker.setValidFindUsersMultipleResponse();
    repository.find({firstName: 'Test'}).then(function(data) {
      
      models = data.parseData;
      
      expect(data.rawResponse).toEqual({
        response: {
          status: 'success',
          data: {
            users: [{
              id: 123,
              firstName: 'Test',
              lastName: 'User',
              username: 'test.user'
            }, {
              id: 124,
              firstName: 'Test',
              lastName: 'User2',
              username: 'test.user2'
            }]
          }
        }
      });
    }, function(rawResponse) {

    });
    unitTestMocker.flush();

    expect(models.length).toBe(2);
    expect(models[0].toJson()).toEqual({
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
    expect(models[1].toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'User2',
      username: 'test.user2'
    });
  });

  it('should be able to get an instance of model using return value', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var models = [];

    unitTestMocker.setValidFindUsersMultipleResponse();
    var models = repository.find({firstName: 'Test'});

    expect(models.length).toBe(0);

    unitTestMocker.flush();

    expect(models.length).toBe(2);
    expect(models[0].toJson()).toEqual({
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
    expect(models[1].toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'User2',
      username: 'test.user2'
    });
  });

  it('should be able to send custom headers with .find()', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var models = [];

    unitTestMocker.setValidFindUsersMultipleResponse();
    var models = repository.find({firstName: 'Test'}, {'X-Custom-Header-UT': 'unit-test'});

    expect(models.length).toBe(0);

    unitTestMocker.flush();

    expect(models.length).toBe(2);
    expect(models[0].toJson()).toEqual({
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
    expect(models[1].toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'User2',
      username: 'test.user2'
    });
  });

  it('should be able to use POST method with find() instead of GET', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var models = [];

    unitTestMocker.setValidPostFindUsersMultipleResponse();
    var models = repository.find(null, null, true, {filters: {firstName: 'Test'}});

    expect(models.length).toBe(0);

    unitTestMocker.flush();

    expect(models.length).toBe(2);
    expect(models[0].toJson()).toEqual({
      id: 123,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
    expect(models[1].toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'User2',
      username: 'test.user2'
    });
  });

  it('should be able to get instance of model by idProperty using promise', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var model;

    unitTestMocker.setValidGetUserResponse();
    repository.find(124)
    .then(function(data) {
      model = data.parseData;

      expect(data.rawResponse).toEqual({
        response: {
          status: 'success',
          data: {
            user: {
              id: 124,
              firstName: 'Test',
              lastName: 'User',
              username: 'test.user'
            }
          }
        }
      });
    }, function(rawResponse) {

    });
    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
  });

  it('should be able to get instance of model by idProperty using return value', function() {
    nagRestSchemaManager.add('user', userSchema);
    var repository = nagRestBaseRepository.create('user');
    var model;

    unitTestMocker.setValidGetUserResponse();
    model = repository.find(124);

    expect(model.toJson()).toEqual({});

    unitTestMocker.flush();

    expect(model.toJson()).toEqual({
      id: 124,
      firstName: 'Test',
      lastName: 'User',
      username: 'test.user'
    });
  });
});
