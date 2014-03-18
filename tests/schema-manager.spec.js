describe('Rest Schema Manager', function(){
  var $httpBackend, unitTestMocker, schema, schema2, schema3, nagRestSchemaManager, nagRestConfig;

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

  schema3 = {
    route: '/users',
    properties: {
      id: {
        remoteProperty: 'IdenTiFIer'
      },
      firstName: {
        remoteProperty: 'firstname'
      },
      lastName: {
        remoteProperty: 'LAST_NAME'
      }
    }
  };

  beforeEach(module('nag.rest'));
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(_.isFunction(retrievedSchema.requestFormatter)).to.be.true;

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).to.deep.equal(expected);
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    var userSchema = nagRestSchemaManager.get('user');
    var projectSchema = nagRestSchemaManager.get('project');

    expect(_.isFunction(userSchema.requestFormatter)).to.be.true;
    expect(_.isFunction(projectSchema.requestFormatter)).to.be.true;

    delete userSchema.requestFormatter;
    delete projectSchema.requestFormatter;

    expect(userSchema).to.deep.equal(expected);
    expect(projectSchema).to.deep.equal(expected2);
  });

  it('should only be able to add objects as schemas', function() {
    nagRestSchemaManager.add('user1', [1, 2, 3, 4]);
    nagRestSchemaManager.add('user2', 'asdfdgdsfgdfg');
    nagRestSchemaManager.add('user3', true);
    nagRestSchemaManager.add('user4', function() {});

    expect(nagRestSchemaManager.get('user1')).to.be.undefined;
    expect(nagRestSchemaManager.get('user2')).to.be.undefined;
    expect(nagRestSchemaManager.get('user3')).to.be.undefined;
    expect(nagRestSchemaManager.get('user4')).to.be.undefined;
  });

  it('should be able to remove schemas', function() {
    nagRestSchemaManager.add('user', schema);
    nagRestSchemaManager.remove('user');

    expect(nagRestSchemaManager.get('user')).to.be.undefined;
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    var retrievedSchema = nagRestSchemaManager.get('user', {
      route: '/users/custom'
    });

    expect(_.isFunction(retrievedSchema.requestFormatter)).to.be.true;

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).to.deep.equal(expected);
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    var retrievedSchema = nagRestSchemaManager.get('user', {
      properties: {
        test: {}
      }
    });

    expect(_.isFunction(retrievedSchema.requestFormatter)).to.be.true;

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).to.deep.equal(expected);
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(_.isFunction(retrievedSchema.requestFormatter)).to.be.true;

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).to.deep.equal(expected);
  });

  it('should be able to override deep objects', function() {
    nagRestSchemaManager.add('user', schema);

    var retrievedSchema = nagRestSchemaManager.get('user', {
      properties: {
        id: {
          sync: true
        }
      }
    });

    var expected = {
      route: '/users',
      idProperty: nagRestConfig.getModelIdProperty(),
      properties: {
        id: {
          sync: true
        }
      },
      relations: {},
      dataListLocation: nagRestConfig.getResponseDataLocation(),
      dataItemLocation: nagRestConfig.getResponseDataLocation(),
      autoParse: true,
      isArray: null,
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    expect(_.isFunction(retrievedSchema.requestFormatter)).to.be.true;

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).to.deep.equal(expected);
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
      flattenItemRoute: nagRestConfig.getFlattenItemRoute(),
      inherit: null
    };

    var modifiedSchema = nagRestSchemaManager.get('user');
    modifiedSchema.route = '/should/not/reflect/in/stored/schema';
    var retrievedSchema = nagRestSchemaManager.get('user');

    expect(_.isFunction(retrievedSchema.requestFormatter)).to.be.true;

    delete retrievedSchema.requestFormatter;

    expect(retrievedSchema).to.deep.equal(expected);
  });

  describe("Data Normalization", function() {
    it("should be able to normalize data incoming", function() {
      expect(nagRestSchemaManager.normalizeData(schema3, {
        IdenTiFIer: 1,
        firstname: 'John',
        LAST_NAME: 'Doe'
      })).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it("should be able to set data with properties already normalized even if the configuration has remoteProperty configured", function() {
      expect(nagRestSchemaManager.normalizeData(schema3, {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      })).to.deep.equal({
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    it("should be able to normalize the data outgoing to be formatted like the API expects", function() {
      expect(nagRestSchemaManager.normalizeData(schema3, {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      }, 'outgoing')).to.deep.equal({
        IdenTiFIer: 1,
        firstname: 'John',
        LAST_NAME: 'Doe'
      });
    });
  });
});
