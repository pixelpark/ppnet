(function (exports) {
  var config = {
    /* List all the roles you wish to use in the app
     * You have a max of 31 before the bit shift pushes the accompanying integer out of
     * the memory footprint for an integer
     */
    roles: [
      'public',
      'user',
      'admin'
    ],
    /*
     Build out all the access levels you want referencing the roles listed above
     You can use the '*' symbol to represent access to all roles.
     
     The left-hand side specifies the name of the access level, and the right-hand side
     specifies what user roles have access to that access level. E.g. users with user role
     'user' and 'admin' have access to the access level 'user'.
     */
    accessLevels: {
      'public': '*',
      'anon': ['public'],
      'user': ['user', 'admin'],
      'admin': ['admin']
    }

  };
    
  /**
   * Method to build a distinct bit mask for each role
   * It starts off with '1' and shifts the bit to the left for each element in the
   * roles array parameter
   * @param {Array} roles
   * @returns {Object} userRoles
   */
  function buildRoles(roles) {
    var bitMask = 1;
    var userRoles = {};

    var i = 0;
    for (; i < roles.length; i++) {
      userRoles[roles[i]] = {
        bitMask: bitMask,
        title: roles[i]
      };
      bitMask = bitMask << 1;
    }
    return userRoles;
  }

/*
   This method builds access level bit masks based on the accessLevelDeclaration parameter which must
   contain an array for each access level containing the allowed user roles.
   */
function buildAccessLevels(accessLevelDeclarations, userRoles) {
    var accessLevels = {};
    for (var level in accessLevelDeclarations) {

      var currentLevel = accessLevelDeclarations[level], result = 0;
      if (currentLevel === '*') {
        for (var role in userRoles) {
          result = (result << 1) + 1;
        }
        
      } else if (Array.isArray(currentLevel)) {
        for (var role in accessLevelDeclarations[level]) {
          if (userRoles.hasOwnProperty(accessLevelDeclarations[level][role])) {
            result = result | userRoles[accessLevelDeclarations[level][role]].bitMask;
          }
        }
      }
      
      accessLevels[level] = {
        bitMask: result
      };
    }
    return accessLevels;
  }

  exports.userRoles = buildRoles(config.roles);
  exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);