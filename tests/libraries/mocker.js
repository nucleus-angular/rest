angular.module('unitTestMocker', [])
.service('unitTestMocker', [
  '$httpBackend',
  function($httpBackend) {
    this.setValidGetUserResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/124').respond(function(method, url, data) {
        return [httpResponseCode, {
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
        }, {}];
      });
    };

    this.setValidPostUserResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('POST', '/users', '{"firstName":"Test","lastName":"User","username":"test.user"}').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 234,
                firstName: 'Test',
                lastName: 'User',
                username: 'test.user'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidPostUserCustomRequestFormatResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('POST', '/users', '{"request":{"data":{"firstName":"Test","lastName":"User","username":"test.user"}}}').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 234,
                firstName: 'Test',
                lastName: 'User',
                username: 'test.user'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidPostUserCustomResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('POST', '/users', '{"firstName":"Test","username":"test.user"}').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 234,
                firstName: 'Test',
                lastName: null,
                username: 'test.user'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidPutUserResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('PUT', '/users/123', '{"id":123,"firstName":"Test2","lastName":"User","username":"test.user"}').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 123,
                firstName: 'Test2',
                lastName: 'User',
                username: 'test.user'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidPatchUserResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('PATCH', '/users/123').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 123,
                firstName: 'Test2',
                lastName: 'User',
                username: 'test.user'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidDeleteUserResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('DELETE', '/users/123').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: null
          }
        }, {}];
      });
    };

    this.setValidFindUsersMultipleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users?firstName=Test').respond(function(method, url, data) {
        return [httpResponseCode, {
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
        }, {}];
      });
    };

    this.setValidPostFindUsersMultipleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('POST', '/users', '{"filters":{"firstName":"Test"}}').respond(function(method, url, data) {
        return [httpResponseCode, {
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
        }, {}];
      });
    };

    this.setValidUserProjectsRelationshipSingleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/projects/234').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              project: {
                projectId: 234,
                name: 'Project B'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidUserProjectsRelationshipSingleNestedResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/123/projects/234').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              project: {
                projectId: 234,
                name: 'Project B'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidUserProjectsRelationshipMultipleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/123/projects').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              projects: [{
                projectId: 123,
                name: 'Project A'
              }, {
                projectId: 124,
                name: 'Project B'
              }]
            }
          }
        }, {}];
      });
    };

    this.setValidUserProjectsRelationshipMultipleUrlSingleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/123/projects').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              project: {
                projectId: 123,
                name: 'Project A'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidUserProjectsRelationshipSingleUrlMultipleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/projects/234').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              projects: [{
                projectId: 123,
                name: 'Project A'
              }, {
                projectId: 124,
                name: 'Project B'
              }]
            }
          }
        }, {}];
      });
    };

    this.setValidUserManagerRelationshipResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/124').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              user: {
                id: 124,
                firstName: 'Test',
                lastName: 'Manager',
                username: 'test.manager'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidUserProjectTeamsMultipleNestedResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/123/projects/234/teams').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              teams: [{
                id: 123,
                name: 'Team A'
              }, {
                id: 124,
                name: 'Team B'
              }]
            }
          }
        }, {}];
      });
    };

    /*this.setValidUserProjectTeamsSingleNestedResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/users/123/projects/234/teams/123').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              team: {
                id: 123,
                name: 'Team A'
              }
            }
          }
        }, {}];
      });
    };

    this.setValidTeamsSingleResponse = function() {
      var httpResponseCode = 200;
      $httpBackend.expect('GET', '/teams/123').respond(function(method, url, data) {
        return [httpResponseCode, {
          response: {
            status: 'success',
            data: {
              team: {
                id: 123,
                name: 'Team A'
              }
            }
          }
        }, {}];
      });
    };*/

    this.flush = function() {
      $httpBackend.flush();
    };
  }
]);

