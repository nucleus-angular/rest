describe('Rest Config', function(){
  var provider;

  beforeEach(module('unitTestMocker'));

  beforeEach(module('nag.rest.config', function(nagRestConfigProvider) {
    provider = nagRestConfigProvider;
  }));

  it('should have default values', inject(function(nagRestConfig) {
    expect(nagRestConfig.getStrictMode()).toBe(false);
    expect(nagRestConfig.getBaseUrl()).toBe('');
    expect(nagRestConfig.getResponseDataLocation()).toBe('');
    expect(nagRestConfig.getModelIdProperty()).toBe('id');
    expect(nagRestConfig.getUpdateMethod()).toBe('PUT');
    expect(nagRestConfig.getFlattenItemRoute()).toBe(false);
    expect(nagRestConfig.getValidateOnSync()).toBe(true);
    expect(nagRestConfig.getIsArray()).toBe(null);
    expect(_.isFunction(nagRestConfig.getRequestFormatter())).toBe(true);
  }));

  it('should be able get/set base url', inject(function(nagRestConfig) {
    var value = '/api';
    provider.setBaseUrl(value);

    expect(nagRestConfig.getBaseUrl()).toBe(value);
  }));

  it('should be able get/set response data location', inject(function(nagRestConfig) {
    var value = 'data.data';
    provider.setResponseDataLocation(value);

    expect(nagRestConfig.getResponseDataLocation()).toBe(value);
  }));

  it('should be able get/set model id property', inject(function(nagRestConfig) {
    var value = 'uid';
    provider.setModelIdProperty(value);

    expect(nagRestConfig.getModelIdProperty()).toBe(value);
  }));

  it('should be able get/set update method', inject(function(nagRestConfig) {
    var value = 'PATCH';
    provider.setUpdateMethod(value);

    expect(nagRestConfig.getUpdateMethod()).toBe(value);
  }));

  it('should be able get/set request formatter', inject(function(nagRestConfig) {
    var value = function(){return 'test'};
    provider.setRequestFormatter(value);

    expect((nagRestConfig.getRequestFormatter())()).toBe('test');
  }));

  it('should be able get/set static mode', inject(function(nagRestConfig) {
    provider.setStrictMode(true);

    expect(nagRestConfig.getStrictMode()).toBe(true);
  }));

  it("should be able get/set flatten item route", inject(function(nagRestConfig) {
    provider.setFlattenItemRoute(true);

    expect(nagRestConfig.getFlattenItemRoute()).toBe(true);
  }));

  it('should not be able to set request formatter to anything except a function', inject(function(nagRestConfig) {
    provider.setRequestFormatter(null);
    provider.setRequestFormatter(123);
    provider.setRequestFormatter('string');

    expect(_.isFunction(nagRestConfig.getRequestFormatter())).toBe(true);
  }));

  it("should be able get/set validate on sync", inject(function(nagRestConfig) {
    provider.setValidateOnSync(false);

    expect(nagRestConfig.getValidateOnSync()).toBe(false);
  }));

  it("should be able get/set isArray", inject(function(nagRestConfig) {
    provider.setIsArray(true);

    expect(nagRestConfig.getIsArray()).toBe(true);
  }));
});
