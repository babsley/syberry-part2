;(function ($) {
    'use strict';

    /**
     * Model
     */
    var AppModel = (function () {
        function AppModel(element, options) {
            this.element = element;
            this.active = false;
            this.options = options;
            this.map = undefined;
            this.mapBox = undefined;
            this.activePolygon = undefined;
            this.addPoints = false;
            this.points = [];
            this.polygonsList = {};
        }

        return AppModel;
    })();

    /**
     * View
     */
    var AppView = (function () {
        function AppView(model) {
            this.model = model;
            this.map = this.model.map;
            this.mapBox = this.model.mapBox;
            this.mapsBox = $(this.model.options.mapsBox)[0];
            this.mapOptions = this.model.options.mapOptions;
            this.activePolygon = false;
            this.exportData = [];

            this.initMap()
        }

        /**
         * initialization map
         */
        AppView.prototype.initMap = function () {
            var div = document.createElement('div');

            if (!this.mapOptions.center) {
                this.model.options.mapOptions.center = {
                    lat: 53.904539799999995,
                    lng: 27.5615244
                };
            }

            this.model.map = new google.maps.Map(div, this.mapOptions);
            this.model.mapBox = div;


            $(this.mapsBox).append(div);
        };

        /**
         * set coordinates geo api maps center
         */
        AppView.prototype.setGeoCoords = function () {
            function success(pos) {
                this.model.options.mapOptions.center = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                this.setMapCoords(this.mapOptions.center);
            }

            function error() {
                console.warn('Geo API unavailable');

                return false;
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success.bind(this), error);
            }
        };

        /**
         * set coordinates maps center
         */
        AppView.prototype.setMapCoords = function (coords) {
            this.model.map.panTo({lat: coords.lat, lng: coords.lng});
        };

        AppView.prototype.createPolygon = function (coords, options) {
            if (!options) {
                options = {};
            }

            var polygon = new google.maps.Polygon({
                paths: [coords],
                draggable: options.draggable || false,
                editable: options.editable || false
            });

            polygon.setOptions(this.model.options.polygonDecor);

            return polygon;
        };

        AppView.prototype.drawPoint = function (coords) {
            var point = this.createPolygon(coords, {editable: true, draggable: true});

            this.model.points.push(point);

            point.setMap(this.model.map);
        };

        AppView.prototype.removePoints = function (arr) {
            for (var i = 0; i < arr.length; i++) {
                arr[i].setMap(null);
            }

            this.model.points = [];
            this.model.addPoints = false;
        };

        /**
         * get coordinates points for polygon
         */
        AppView.prototype.getPolygonPoints = function (arr) {
            var points = [];

            for (var i = 0; i < arr.length; i++) {
                points.push(this.getPolygonCoords(arr[i]));
            }

            return points;
        };

        /**
         *  return goole polygon coords
         *  {lat, lng}
         */
        AppView.prototype.getPolygonCoords = function (polygon) {
            var vertices = polygon.getPath(),
                result,
                xy;

            if (vertices.getLength() > 1) {

                result = [];

                for (var i = 0; i < vertices.getLength(); i++) {
                    xy = vertices.getAt(i);

                    result.push({lat: xy.lat(), lng: xy.lng()});
                }
            } else {
                xy = vertices.getAt(0);
                result = {lat: xy.lat(), lng: xy.lng()};
            }

            return result;
        };

        /**
         * draw polygon for maps
         */
        AppView.prototype.drawPolygon = function (points) {
            var polygon = this.createPolygon(this.graham(this.getPolygonPoints(points)), {draggable: true});

            polygon.dnId = (Math.random() * 100000) | 0;

            this.removePoints(points);

            this.model.polygonsList[polygon.dnId] = polygon;

            polygon.setMap(this.model.map);

            return polygon;
        };

        /**
         *  add active styles polygon
         */
        AppView.prototype.onActive = function (element) {
            element.setOptions(this.model.options.activePolygonDecor);
        };

        /**
         *  remove active styles polygon
         */
        AppView.prototype.unActive = function (element) {
            element.setOptions(this.model.options.polygonDecor);
        };

        AppView.prototype.removeSingle = function (element) {
            element.setMap(null);
        };

        AppView.prototype.removeAll = function (obj) {
            for (var key in obj) {
                obj[key].setMap(null);
            }
        };

        AppView.prototype.hidePopup = function (className) {
            $(this.model.options.popup).removeClass(className);
        };

        AppView.prototype.showPopup = function (className) {
            $(this.model.options.popup).addClass(className);
        };

        AppView.prototype.appendDataPopup = function (el, data) {
            $(el).val(data);
        };

        AppView.prototype.graham = function (points) {

            function classify(vector, x1, y1) {
                return (vector.x2 - vector.x1) * (y1 - vector.y1) - (vector.y2 - vector.y1) * (x1 - vector.x1);

            }

            var ch = [],
                minI = 0,
                min = points[0].lat,
                temp,
                h = [],
                result = [];

            for (var i = 0; i < points.length; i++) {

                ch.push(i);

                if (points[i].lat < min) {
                    min = points[i].lat;
                    minI = i;
                }
            }

            ch[0] = minI;
            ch[minI] = 0;

            for (var i = 1; i < ch.length - 1; i++) {
                for (var j = i + 1; j < ch.length; j++) {
                    var cl = classify({
                        'x1': points[ch[0]].lat,
                        'y1': points[ch[0]].lng,
                        'x2': points[ch[i]].lat,
                        'y2': points[ch[i]].lng
                    }, points[ch[j]].lat, points[ch[j]].lng);

                    if (cl < 0) {
                        temp = ch[i];
                        ch[i] = ch[j];
                        ch[j] = temp;
                    }
                }
            }

            h = [];
            h[0] = ch[0];
            h[1] = ch[1];

            for (var i = 2; i < ch.length; i++) {
                while (classify({
                    'x1': points[h[h.length - 2]].lat,
                    'y1': points[h[h.length - 2]].lng,
                    'x2': points[h[h.length - 1]].lat,
                    'y2': points[h[h.length - 1]].lng
                }, points[ch[i]].lat, points[ch[i]].lng) < 0) {
                    h.pop();
                }
                h.push(ch[i]);
            }

            for (var i = 0; i < h.length; i++) {
                result.push(points[h[i]]);
            }

            return result;
        };

        return AppView;
    })();

    /**
     * Controller
     */
    var AppController = (function () {
        function AppController(model, view) {
            this.model = model;
            this.view = view;
            this.container = model.options.container;
            this.controls = model.options.controls;
            this.state = false;

            this.init();
        }

        AppController.prototype.bindEvents = function () {
            $(document).on('dnOpen', function () {
                this.model.state = false;
            }.bind(this));

            $(this.model.element).on('click', this.dnOpen.bind(this));

            $(this.container).on('click', function (e) {
                var target = e.target,
                    className = $(target).attr('class');

                if (target.tagName != 'A') {
                    return;
                }

                e.preventDefault();

                for (var key in this.controls) {
                    if (className === this.controls[key]) {
                        this[key]();
                    }
                }

            }.bind(this));

            this.model.map.addListener('click', function (e) {
                this.removeActivePolygon();

                if (this.model.addPoints) {

                    var coords = {lat: e.latLng.lat(), lng: e.latLng.lng()};

                    this.view.drawPoint(coords);
                }
            }.bind(this));
        };

        AppController.prototype.dnAdd = function () {
            if (this.model.state) {
                this.model.addPoints = true;

                if (this.model.points.length >= 3) {
                    var polygon = this.view.drawPolygon(this.model.points);

                    google.maps.event.addListener(polygon, "click", function (callback) {
                        return function () {
                            callback(this);
                        }
                    }(this.addActivePolygon.bind(this)));
                }
            }
        };

        AppController.prototype.dnRemove = function () {
            if (this.model.state) {
                if (this.model.activePolygon) {
                    this.view.removeSingle(this.model.activePolygon);

                    delete this.model.polygonsList[this.model.activePolygon.dnId];

                    this.model.activePolygon = undefined;
                }
            }
        };

        AppController.prototype.dnRemoveAll = function () {
            if (this.model.state) {
                this.view.removeAll(this.model.polygonsList);
                this.model.polygonsList = [];
            }
        };

        AppController.prototype.dnExport = function () {
            if (this.model.state) {
                var arr = [],
                    data;

                if (Object.keys(this.model.polygonsList).length <= 0) {
                    data = 'Добавьте многоугольник на карту :\\';
                } else {
                    for (var key in this.model.polygonsList) {
                        arr.push(this.view.getPolygonCoords(this.model.polygonsList[key]));
                    }

                    data = JSON.stringify(arr);
                }

                this.view.appendDataPopup(this.model.options.popupExport, data);
                this.view.showPopup('dn-popup--export');
            }
        };

        AppController.prototype.dnImport = function (arr) {
            this.view.showPopup('dn-popup--import');
        };

        AppController.prototype.dnImportData = function () {
            if (this.model.state) {
                var data;

                data = $(this.model.options.popupImport).val();

                try {
                    data = JSON.parse(data);
                } catch (err) {
                    this.view.appendDataPopup(this.model.options.popupImport, 'Некоректные данные');
                }

                if (Array.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        for (var d = 0; d < data[i].length; d++) {
                            this.view.drawPoint(data[i][d]);
                        }
                        this.dnAdd();
                    }
                    this.popupClose();
                }
            }
        };

        AppController.prototype.addActivePolygon = function (element) {
            if (this.model.activePolygon === element) {
                return
            }

            if (this.model.activePolygon) {
                this.view.unActive(this.model.activePolygon);
            }

            this.model.activePolygon = element;

            this.view.onActive(element);
        };

        AppController.prototype.removeActivePolygon = function () {
            if (this.model.activePolygon) {
                this.view.unActive(this.model.activePolygon);
            }

            this.model.activePolygon = undefined;
        };

        AppController.prototype.dnOpen = function (e) {
            e.preventDefault();

            $(document).trigger('dnOpen');

            this.model.state = true;

            $(this.container).addClass('open');
            $(this.model.mapBox).addClass('visible');

            google.maps.event.trigger(this.model.map, 'resize');

            if (!this.view.setGeoCoords()) {
                this.view.setMapCoords(this.model.options.mapOptions.center);
            }
        };

        AppController.prototype.dnClose = function (e) {
            this.model.state = false;
            $(this.container).removeClass('open');
            $(this.model.mapBox).removeClass('visible');
        };

        AppController.prototype.popupClose = function (e) {
            if (this.model.state) {
                $(this.model.options.popup).removeClass('dn-popup--import dn-popup--export');

                $(this.model.options.popupExport).val('', '');
                $(this.model.options.popupImport).val('', '');
            }
        };

        AppController.prototype.init = function () {
            this.bindEvents();
        };

        return AppController;
    })();

    /**
     * Initialization Widget.
     */
    var Dn = (function () {
        function Dn(element, options) {
            this.model = new AppModel(element, $.extend(Dn.Defaults, options));
            this.view = new AppView(this.model);
            this.controller = new AppController(this.model, this.view);
        }

        /**
         * Default options for the Widget.
         */
        Dn.Defaults = {
            container: '.dn-widget',
            controls: {
                dnAdd: 'dn-add',
                dnRemove: 'dn-remove',
                dnRemoveAll: 'dn-remove-all',
                dnExport: 'dn-export',
                dnImport: 'dn-import',
                dnClose: 'dn-close',
                popupClose: 'dn-popup__close',
                dnImportData: 'dn-import__data'
            },
            mapsBox: '.dn-map',
            popup: '.dn-popup',

            popupExport: '.data-export',
            popupImport: '.data-import',
            mapOptions: {
                zoom: 11
            },
            polygonDecor: {
                strokeColor: '#38595E',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#2CC0B3',
                fillOpacity: 0.35
            },
            hoverPolygonDecor: {
                strokeColor: '#c13f08',
                fillColor: '#F4733D'
            },
            activePolygonDecor: {
                strokeColor: '#c13f08',
                fillColor: '#F4733D'
            }
        };

        return Dn;
    })();

    $.fn.dnWidget = function (options) {
        return this.each(function () {
            var data = $(this).data('dn.widget');

            if (!data) {
                data = new Dn(this, typeof options === 'object' && options);
                $(this).data('dn.widget', data);
            }
        });
    };

})(jQuery);