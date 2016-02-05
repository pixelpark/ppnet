angular.module('ppnetApp').filter('parseUrlFilter', function () {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    return function (text, target) {
        return text.replace(urlPattern, '<a target="' + target + '" href="$&">$&</a>');
    };
});