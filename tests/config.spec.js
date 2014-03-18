describe('Rest Config', function(){
  var provider;

  beforeEach(module('unitTestMocker'));

  beforeEach(module('nag.rest', function(nagRestConfigProvider) {
    provider = nagRestConfigProvider;
  }));

  it('should have default values', inject(function(nagRestConfig) {
    expect(nagRestConfig.getStrictMode()).to.be.false;
    expect(nagRestConfig.getBaseUrl()).to.be.empty;
    expect(nagRestConfig.getResponseDataLocation()).to.be.empty;
    expect(nagRestConfig.getModelIdProperty()).to.equal('id');
    expect(nagRestConfig.getUpdateMethod()).to.equal('PUT');
    expect(nagRestConfig.getFlattenItemRoute()).to.be.false;
    expect(nagRestConfig.getValidateOnSync()).to.be.true;
    expect(nagRestConfig.getIsArray()).to.be.null;
    expect(_.isFunction(nagRestConfig.getRequestFormatter())).to.be.true;
  }));

  it('should be able get/set base url', inject(function(nagRestConfig) {
    var value = '/api';
    provider.setBaseUrl(value);

    expect(nagRestConfig.getBaseUrl()).to.equal(value);
  }));

  it('should be able get/set response data location', inject(function(nagRestConfig) {
    var value = 'data.data';
    provider.setResponseDataLocation(value);

    expect(nagRestConfig.getResponseDataLocation()).to.equal(value);
  }));

  it('should be able get/set model id property', inject(function(nagRestConfig) {
    var value = 'uid';
    provider.setModelIdProperty(value);

    expect(nagRestConfig.getModelIdProperty()).to.equal(value);
  }));

  it('should be able get/set update method', inject(function(nagRestConfig) {
    var value = 'PATCH';
    provider.setUpdateMethod(value);

    expect(nagRestConfig.getUpdateMethod()).to.equal(value);
  }));

  it('should be able get/set request formatter', inject(function(nagRestConfig) {
    var value = function(){return 'test'};
    provider.setRequestFormatter(value);

    expect((nagRestConfig.getRequestFormatter())()).to.equal('test');
  }));

  it('should be able get/set static mode', inject(function(nagRestConfig) {
    provider.setStrictMode(true);

    expect(nagRestConfig.getStrictMode()).to.be.true;
  }));

  it("should be able get/set flatten item route", inject(function(nagRestConfig) {
    provider.setFlattenItemRoute(true);

    expect(nagRestConfig.getFlattenItemRoute()).to.be.true;
  }));

  it('should not be able to set request formatter to anything except a function', inject(function(nagRestConfig) {
    provider.setRequestFormatter(null);
    provider.setRequestFormatter(123);
    provider.setRequestFormatter('string');

    expect(_.isFunction(nagRestConfig.getRequestFormatter())).to.be.true;
  }));

  it("should be able get/set validate on sync", inject(function(nagRestConfig) {
    provider.setValidateOnSync(false);

    expect(nagRestConfig.getValidateOnSync()).to.be.false;
  }));

  it("should be able get/set isArray", inject(function(nagRestConfig) {
    provider.setIsArray(true);

    expect(nagRestConfig.getIsArray()).to.be.true;
  }));
});
