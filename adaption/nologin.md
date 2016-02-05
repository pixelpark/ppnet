I already have a usermanagement
===============================

If you already have a user management and want to use it in PPnet, there are 
basically two ways to do so.

## Server-side rendering
If you are using server-sided rendering like PHP, handlebars, jade or so on 
to deliver PPnet to browsers, it is easy to adapt.

```
cd app/scripts/services
```

Edit the file _ppnetUser.js_ and change the code like seen below. 
Change __<YOUR USER ID>__ and __<YOUR USER NAME>__ to the desired Variables.

```js
// NOT USED ANYMORE
//var currentUser;
//
//var tmpUser = localStorage.getItem('ppnetUser');
//if (!tmpUser) {
//    currentUser = userAttributes;
//} else {
//    currentUser = JSON.parse(tmpUser);
//}

var currentUser = {
    id : '<YOUR USER ID>',
    name : '<YOUR USER NAME>',
    provider : 'simple',
    admin : false,
    online : false,
    role : userRoles.user
};

function changeUser(user) {
    angular.extend(currentUser, user);
    //NOT USED ANYMORE
    //localStorage.setItem('ppnetUser', JSON.stringify(user));
}
```

Storing the user in localstorage is now disabled (may be enabled due to your 
specific case). Therefore the user will not be stored in PPnet anymore 
(offline capability).

There are some more changes that you can perform at your own risk 
(removing routes, views, controllers etc.).
But the above lines of code will basically do the trick.


## Session Token
If you do not use server sided rendering but have a valid session token in 
PPnet-client you may use AJAX to retrieve the necessary information.
Just implement an API endpoint in your system that enables to retrieve the 
current user information.
This could be something like a REST-API that takes the current session token 
and returns the user's information.

In general you can change the code like seen above. But you should now use 
an AJAX request to get the user's information.

```js
// SEE ABOVE

// assuming the token resides in a cookie
$http.get('/route/to/users/information').then(function (result) {
    var currentUser = {
        id : result.id,
        name : result.name,
        provider : 'simple',
        admin : false,
        online : false,
        role : userRoles.user
    };
}).catch(function () {
    // THERE MAY BE NO VALID TOKEN
});


function changeUser(user) {
    angular.extend(currentUser, user);
    // SEE ABOVE
}
```

Because AJAX requests are asynchronously you also have to change the method 
_isLoogedIn_ in the same service.
Therefore you have to change the _isLoggedIn_ call in the app to achieve the 
desired result too.
Just switch to _app.js_:

```
cd ../
```

Near to the end of the file _app.js_ there is a call like 
" _$rootScope.$on('$stateChangeStart', ..._ ". The _isLoggedIn_ check has now 
to be done asynchronously.
After that you reached the same as above in server sided rendering.

### Any method

In both cases described above it is recommended to change the logout mechanism 
in _ppnetUser.js_ too and adapt other routes, controllers and services to the
new needs.
You will most likely want to secure your CouchDB-Instance. You may use a proxy to 
make calls to your CouchDB secure. The following links provide some information 
about security.

[https://github.com/nolanlawson/pouchdb-authentication#couchdb-authentication-recipes](https://github.com/nolanlawson/pouchdb-authentication#couchdb-authentication-recipes)

[http://guide.couchdb.org/draft/security.html](http://guide.couchdb.org/draft/security.html)

[http://docs.couchdb.org/en/1.6.1/api/server/authn.html](http://docs.couchdb.org/en/1.6.1/api/server/authn.html)




