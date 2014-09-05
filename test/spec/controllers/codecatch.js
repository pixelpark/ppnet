'use strict';

describe('Controller: CodecatchCtrl', function () {

  // load the controller's module
  beforeEach(module('ppnetApp'));

  var CodecatchCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CodecatchCtrl = $controller('CodecatchCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
