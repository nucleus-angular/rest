describe('Rest Config', function(){
  var provider;

  beforeEach(module('unitTestMocker'));

  beforeEach(module('nag.rest.config', function(nagRestConfigProvider) {
    provider = nagRestConfigProvider;
  }));

  it('should have default values', inject(function(nagRestConfig) {
    expect(nagRestConfig.getBaseUrl()).toEqual('');
    expect(nagRestConfig.getResponseDataLocation()).toEqual('');
    expect(nagRestConfig.getModelIdProperty()).toEqual('id');
    expect(nagRestConfig.getUpdateMethod()).toEqual('PUT');
    expect(_.isFunction(nagRestConfig.getRequestFormatter())).toBe(true);
  }));

  it('should be able set base url', inject(function(nagRestConfig) {
    var value = '/api';
    provider.setBaseUrl(value);

    expect(nagRestConfig.getBaseUrl()).toEqual(value);
  }));

  it('should be able set response data location', inject(function(nagRestConfig) {
    var value = 'data.data';
    provider.setResponseDataLocation(value);

    expect(nagRestConfig.getResponseDataLocation()).toEqual(value);
  }));

  it('should be able set model id property', inject(function(nagRestConfig) {
    var value = 'uid';
    provider.setModelIdProperty(value);

    expect(nagRestConfig.getModelIdProperty()).toEqual(value);
  }));

  it('should be able set update method', inject(function(nagRestConfig) {
    var value = 'PATCH';
    provider.setUpdateMethod(value);

    expect(nagRestConfig.getUpdateMethod()).toEqual(value);
  }));

  it('should be able set request formatter', inject(function(nagRestConfig) {
    var value = function(){return 'test'};
    provider.setRequestFormatter(value);

    expect((nagRestConfig.getRequestFormatter())()).toEqual('test');
  }));

  it('should not be able to set request formatter to anything except a function', inject(function(nagRestConfig) {
    provider.setRequestFormatter(null);
    provider.setRequestFormatter(123);
    provider.setRequestFormatter('string');

    expect(_.isFunction(nagRestConfig.getRequestFormatter())).toBe(true);
  }));
});
