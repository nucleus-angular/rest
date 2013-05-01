describe('Rest Schema Manager', function(){
  var $httpBackend, unitTestMocker, schema, schema2, nagRestSchemaManager, nagRestModelIdProperty, nagRestResponseDataLocation;

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
    nagRestModelIdProperty = $injector.get('nagRestModelIdProperty');
    nagRestResponseDataLocation = $injector.get('nagRestResponseDataLocation');
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
      idProperty: nagRestModelIdProperty,
      relations: {},
      dataListLocation: nagRestResponseDataLocation,
      dataItemLocation: nagRestResponseDataLocation,
      autoParse: true
    };

    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(retrievedSchema.requestFormatter.toString().replace(/\s/g, '')).toBe('function(){}');

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
      idProperty: nagRestModelIdProperty,
      relations: {},
      dataListLocation: nagRestResponseDataLocation,
      dataItemLocation: nagRestResponseDataLocation,
      autoParse: true
    };

    var expected2 = {
      route: '/projects',
      properties: {
        projectId: {
          sync: false
        }
      },
      idProperty: nagRestModelIdProperty,
      relations: {},
      dataListLocation: nagRestResponseDataLocation,
      dataItemLocation: nagRestResponseDataLocation,
      autoParse: true
    };

    var userSchema = nagRestSchemaManager.get('user');
    var projectSchema = nagRestSchemaManager.get('project');

    expect(userSchema.requestFormatter.toString().replace(/\s/g, '')).toBe('function(){}');
    expect(projectSchema.requestFormatter.toString().replace(/\s/g, '')).toBe('function(){}');

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
      idProperty: nagRestModelIdProperty,
      relations: {},
      dataListLocation: nagRestResponseDataLocation,
      dataItemLocation: nagRestResponseDataLocation,
      autoParse: true
    };

    var retrievedSchema = nagRestSchemaManager.get('user', {
      route: '/users/custom'
    });

    expect(retrievedSchema.requestFormatter.toString().replace(/\s/g, '')).toBe('function(){}');

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
      idProperty: nagRestModelIdProperty,
      relations: {},
      dataListLocation: nagRestResponseDataLocation,
      dataItemLocation: nagRestResponseDataLocation,
      autoParse: true
    };

    var retrievedSchema = nagRestSchemaManager.get('user', {
      properties: {
        test: {}
      }
    });

    expect(retrievedSchema.requestFormatter.toString().replace(/\s/g, '')).toBe('function(){}');

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
      idProperty: nagRestModelIdProperty,
      relations: {},
      dataListLocation: nagRestResponseDataLocation,
      dataItemLocation: nagRestResponseDataLocation,
      autoParse: true
    };

    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(retrievedSchema.requestFormatter.toString().replace(/\s/g, '')).toBe('function(){}');

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).toEqual(expected);
  });
});
