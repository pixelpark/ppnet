'use strict';

describe('Controller: HelloworldCtrl', function () {

  // load the controller's module
  beforeEach(module('ppnetApp'));

  var HelloworldCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HelloworldCtrl = $controller('HelloworldCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
