'use strict';

describe('Controller: WallCtrl', function () {

  // load the controller's module
  beforeEach(module('ppnetApp'));

  var WallCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WallCtrl = $controller('WallCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
