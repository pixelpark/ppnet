ImgCache.options.debug = true;
ImgCache.options.chromeQuota = 50 * 1024 * 1024;



function initCache() {
  ImgCache.options.debug = true;
  ImgCache.options.chromeQuota = 50 * 1024 * 1024;

  ImgCache.init(function() {
    console.log('cache created successfully!');
  }, function() {
    console.log('check the log for errors');
  });
}

document.addEventListener("deviceready", initCache, false);