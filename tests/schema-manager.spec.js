describe('Rest Schema Manager', function(){
  var $httpBackend, unitTestMocker, schema, schema2, nagRestSchemaManager, nagRestConfig;

  schema = {
    route: '/users',
    properties: {
      id: {
        sync: false
      }
    }
  };

  schema2 = {
    route: '/projects',
    properties: {
      projectId: {
        sync: false
      }
    }
  };

  beforeEach(module('nag.rest.schemaManager'));
  beforeEach(module('unitTestMocker'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    unitTestMocker = $injector.get('unitTestMocker');
    nagRestSchemaManager = $injector.get('nagRestSchemaManager');
    nagRestConfig = $injector.get('nagRestConfig');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be able to add and get schemas', function() {
    nagRestSchemaManager.add('user', schema);

    var expected = {
      route: '/users',
      properties: {
        id: {
          sync: false
        }
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(_.isFunction(retrievedSchema.requestFormatter)).toBe(true);

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).toEqual(expected);
  });

  it('should be able to add multiple schemas and get schemas', function() {
    nagRestSchemaManager.add('user', schema);
    nagRestSchemaManager.add('project', schema2);

    var expected = {
      route: '/users',
      properties: {
        id: {
          sync: false
        }
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var expected2 = {
      route: '/projects',
      properties: {
        projectId: {
          sync: false
        }
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var userSchema = nagRestSchemaManager.get('user');
    var projectSchema = nagRestSchemaManager.get('project');

    expect(_.isFunction(userSchema.requestFormatter)).toBe(true);
    expect(_.isFunction(projectSchema.requestFormatter)).toBe(true);

    delete userSchema.requestFormatter;
    delete projectSchema.requestFormatter;

    expect(userSchema).toEqual(expected);
    expect(projectSchema).toEqual(expected2);
  });

  it('should only be able to add objects as schemas', function() {
    nagRestSchemaManager.add('user1', [1, 2, 3, 4]);
    nagRestSchemaManager.add('user2', 'asdfdgdsfgdfg');
    nagRestSchemaManager.add('user3', true);
    nagRestSchemaManager.add('user4', function() {});

    expect(nagRestSchemaManager.get('user1')).toBeUndefined();
    expect(nagRestSchemaManager.get('user2')).toBeUndefined();
    expect(nagRestSchemaManager.get('user3')).toBeUndefined();
    expect(nagRestSchemaManager.get('user4')).toBeUndefined();
  });

  it('should be able to remove schemas', function() {
    nagRestSchemaManager.add('user', schema);
    nagRestSchemaManager.remove('user');

    expect(nagRestSchemaManager.get('user')).toBeUndefined();
  });

  it('should be able to override some data in the store schema when pulling it', function() {
    nagRestSchemaManager.add('user', schema);

    var expected = {
      route: '/users/custom',
      properties: {
        id: {
          sync: false
        }
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var retrievedSchema = nagRestSchemaManager.get('user', {
      route: '/users/custom'
    });

    expect(_.isFunction(retrievedSchema.requestFormatter)).toBe(true);

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).toEqual(expected);
  });

  it('should be able to override elements of the schema that are objects themsolves without erasing existing data in the stored schema', function() {
    nagRestSchemaManager.add('user', schema);

    var expected = {
      route: '/users',
      properties: {
        id: {
          sync: false
        },
        test: {}
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var retrievedSchema = nagRestSchemaManager.get('user', {
      properties: {
        test: {}
      }
    });

    expect(_.isFunction(retrievedSchema.requestFormatter)).toBe(true);

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).toEqual(expected);
  });

  it('should be able to override some data in the store schema when pulling it without effecting the stored schema', function() {
    nagRestSchemaManager.add('user', schema);

    var test = nagRestSchemaManager.get('user', {
      properties: {
        test: {}
      }
    });

    var expected = {
      route: '/users',
      properties: {
        id: {
          sync: false
        }
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(_.isFunction(retrievedSchema.requestFormatter)).toBe(true);

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).toEqual(expected);
  });

  it('should not modified the stored schema when a pulled schema is modified', function() {
    nagRestSchemaManager.add('user', schema);

    var expected = {
      route: '/users',
      properties: {
        id: {
          sync: false
        }
      },
      idProperty: nagRestConfig.getModelIdProperty(),
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute()
    };

    var modifiedSchema = nagRestSchemaManager.get('user');
    modifiedSchema.route = '/should/not/reflect/in/stored/schema';
    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(_.isFunction(retrievedSchema.requestFormatter)).toBe(true);

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).toEqual(expected);
  });
});
