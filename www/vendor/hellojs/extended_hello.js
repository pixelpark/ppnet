//
// fiware
//
(function(hello) {

  function formatError(o, headers) {
    var code = headers ? headers.statusCode : (o && "meta" in o && "status" in o.meta && o.meta.status);
    if ((code === 401 || code === 403)) {
      o.error = {
        code: "access_denied",
        message: o.message || (o.data ? o.data.message : "Could not get response")
      };
      delete o.message;
    }
  }

  function formatUser(o) {
    if (o.id) {
      o.thumbnail = o.picture = o.avatar_url;
      o.name = o.displayName;
    }
  }

  function paging(res, headers, req) {
    if (res.data && res.data.length && headers && headers.Link) {
      var next = headers.Link.match(/&page=([0-9]+)/);
      if (next) {
        res.paging = {
          next: "?page=" + next[1]
        };
      }
    }
  }

  hello.init({
    fiware: {
      name: 'FIWare',
      oauth: {
        version: 2,
        auth: 'https://account.lab.fi-ware.org/authorize',
        grant: 'https://account.lab.fi-ware.org/access_token'
      },
      base: 'https://account.lab.fi-ware.org/',
      get: {
        'me': 'user'
      },
      wrap: {
        me: function(o, headers) {
          formatError(o, headers);
          formatUser(o);
          return o;
        },
        "default": function(o, headers, req) {

          formatError(o, headers);

          if (Object.prototype.toString.call(o) === '[object Array]') {
            o = {
              data: o
            };
            paging(o, headers, req);
            for (var i = 0; i < o.data.length; i++) {
              formatUser(o.data[i]);
            }
          }
          return o;
        }
      }
    }
  });

})(hello);