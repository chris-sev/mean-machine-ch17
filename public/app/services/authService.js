angular.module('authService', [])

.factory('Auth', function($http, $q, AuthToken) {

  // create auth factory object
  var authFactory = {};

  // log a user in
  authFactory.login = function(username, password) {

    // return the promise object and its data
    return $http.post('/api/authenticate', {
          username: username,
          password: password
        })
        .success(function(data) {
          AuthToken.setToken(data.token);
          return data;
        });
  };

  // log a user out by clearing the token
  authFactory.logout = function() {
    AuthToken.setToken();
  };

  authFactory.isLoggedIn = function() {
    if (AuthToken.getToken()) {
      return true;
    } else {
      return false;
    }
  };

  // get the logged in user'
  authFactory.getUser = function() {
    if (AuthToken.getToken()) {
      return $http.get('/api/me', { cache: true })
    } else {
      return $q.reject({ message: 'User has no token.' });
    }
  };

  return authFactory;

})

    // factory for handling tokens
// inject $window to store token client-side
.factory('AuthToken', function($window) {

  var authTokenFactory = {};

  // get the token out of local storage
  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  };

  // function to set or clear token
  // if a token is passed, set the token
  // if there is no token, clear it from local storage
  authTokenFactory.setToken = function(token) {
    if (token) {
      $window.localStorage.setItem('token', token);
    } else {
      $window.localStorage.removeItem('token');
    }
  };

  return authTokenFactory;
})

// auth factory to login and get information
// inject $http for communicating with the api
// inject $q to return promise objects
// inject AuthToken to manage tokens


// application configuration to integrate token into requests
.factory('AuthInterceptor', function($q, $location, AuthToken) {

  var interceptorFactory = {};

  // this will happen on all HTTP requests
  // attach token to every http request
  interceptorFactory.request = function(config) {

    var token = AuthToken.getToken();

    if (token) {
      config.headers['x-access-token'] = token;
    }

    return config;
  };

  // happens on response errors
  interceptorFactory.responseError = function(response) {

    // if our server returns a 403 forbidden request (ie no token or bad password)
    if (response == 403) {
      AuthToken.setToken();
      $location.path('/login');
    }
    // return errors from the server as a promise
    return $q.reject(response);
  };

  return interceptorFactory;

});