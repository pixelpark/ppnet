function User(user) {
  this.id = window.localStorage.getItem("user.id");
  this.name = window.localStorage.getItem("user.name");
  this.provider = window.localStorage.getItem("user.provider");
  this.admin = window.localStorage.getItem("user.admin");
  console.log(this);
  return this;
}

User.prototype.setAdmin = function(doc) {
  //$scope.user.setAdmin = function(status) {
  if (status) {
    window.localStorage.setItem("user.admin", true);
    this.admin = true;
  } else {
    window.localStorage.removeItem("user.admin", false);
    this.admin = false;
  }
};

User.prototype.logout = function() {
  delete this.id;
  delete this.name;
  delete this.provider;
  delete this.admin;

  window.localStorage.removeItem("user.id");
  window.localStorage.removeItem("user.name");
  window.localStorage.removeItem("user.provider");
  window.localStorage.removeItem("user.admin");

  window.location = '#/login';
}



User.prototype.login = function(userdata) {
  this.id = userdata.id;
  this.name = userdata.name;
  this.provider = userdata.provider;

  window.localStorage.setItem("user.id", userdata.id);
  window.localStorage.setItem("user.name", userdata.name);
  window.localStorage.setItem("user.provider", userdata.provider);

  window.location = '#/posting';

  return this;
}



User.prototype.isLogedIn = function() {
  //$scope.user.isLogedIn = function() {
  return (this.id) ? true : false;
};

User.prototype.isAdmin = function() {
  //$scope.user.isAdmin = function() {
  return (window.localStorage.getItem("user.admin") && window.localStorage.getItem("user.admin") != 'null') ? true : false;
};

User.prototype.getName = function() {
  return this.name;
}

User.prototype.getId = function() {
  return this.id;
}