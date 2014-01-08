var App = (function (app, $) {

    'use strict';

    app.Compass = (function () {

        var directions = [
            { degMin: 315, degMax: 22.5, name: 'north' },
            { degMin: 22.5, degMax: 67.5, name: 'north east' },
            { degMin: 67.5, degMax: 112.5, name: 'east' },
            { degMin: 112.5, degMax: 157.5, name: 'south east' },
            { degMin: 157.5, degMax: 202.5, name: 'south' },
            { degMin: 202.5, degMax: 247.5, name: 'south west' },
            { degMin: 247.5, degMax: 292.5, name: 'west' },
            { degMin: 292.5, degMax: 337.5, name: 'north west' }
        ];

        function formatDate(d) {
            return d.toLocaleTimeString();
        }

        function getDirection(degree) {
            var direction = '';

            $.each(directions, function (i, dir) {
                if (degree >= dir.degMin && degree < dir.degMax) {
                    direction = dir.name;
                    return false;
                }
            });

            // fallback to north
            if (direction === '') {
                direction = directions[0].name;
            }

            return direction;
        }

        function onRequestSuccess(heading) {
            var container = $('.compass'),
                date = new Date(heading.timestamp);

            $('.compass .request').hide();

            $('.direction', container).text(getDirection(heading.magneticHeading));
            $('.magneticHeading', container).text(heading.magneticHeading);
            $('.trueHeading', container).text(heading.trueHeading);
            $('.headingAccuracy', container).text(heading.headingAccuracy);
            $('.time', container).text(formatDate(date));
        }

        function onRequestError(error) {
        	console.log('compass');
        	console.log(error);
            $('.compass .request').hide();

            alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
        }

        function startRequesting() {
            $('.compass .request').show();
            navigator.compass.watchHeading(onRequestSuccess, onRequestError, {
                frequency: 500
            });
        }

        return {
            startRequesting: startRequesting
        };
    }());

    return app;
}(App || {}, jQuery));

