/**
 * Google Locations in Dashboard
 *
 * @version 1.0
 * @author Tan Nguyen <tan@binaty.org>
 */
(function ($) {

    'use strict';

    var Instant_Locations = {

        /**
         * Store instances of google.maps.places.Autocomplete
         *
         * @var Array
         */
        autoComplete: [],

        /**
         * Store selected place
         */
        place: {},

        config: [],

        /**
         * Constructor method. Set the config for auto complete and run Auto complete
         *
         * @return void
         */
        init: function () {
            this.initAutoComplete();
        },

        /**
         * Setup the auto complete and run
         *
         * @return void
         */
        initAutoComplete: function () {

            var autoComplete = '#address',
                // Create alias of `this` keyword to use inside other functions
                _this = this;

            // For each auto complete field. Create and instance of google.maps.places.Autocomplete
            var autoComplete = new google.maps.places.Autocomplete(
                ($('#address')[0]), // = document.getElementById
                _this.config
            );

            // When user select a place in drop down, bind data to related fields
            autoComplete.addListener('place_changed', function()
            {
                var place = this.getPlace();

                if (typeof place != 'undefined') {

                    $('.form-control').each(function () {
                        // What data is prepared to bind to that field
                        var dataBinding = $(this).attr('id'),
                            // What is that data's value
                            fieldValue = Instant_Locations.getFieldData(dataBinding, place);

                        $(this).val(fieldValue);
                    });
                }
            });
        },

        /**
         * Get value of a binding field
         *
         * @param String type
         * @param Object place
         * @returns String
         */
        getFieldData: function (type, place) {

            // If field is not in address_component then try to find them in another place
            if (['formatted_address', 'id', 'name', 'place_id', 'reference', 'url', 'vicinity'].indexOf(type) > -1
            && typeof place != 'undefined' && typeof place[type] != 'undefined') {
                return place[type];
            }

            if (type === 'lat')
                return place.geometry.location.lat();

            if (type === 'lng')
                return place.geometry.location.lng();

            if (type === 'geometry')
                return place.geometry.location.lat() + ',' + place.geometry.location.lng();

            var val = '';

            // We also allows users merge data. For example: `shortname:country + ' ' + postal_code`
            // The code in two `if` statements below to do that
            if (type.indexOf('+') > -1)
                type = type.split('+');

            if ($.isArray(type)) {

                $.each(type, function (i, field) {
                    field = field.trim();

                    if (field.indexOf("'") > -1 || field.indexOf('"') > -1) {
                        field = field.replace(/['"]+/g, '');
                        val += field;
                    }
                    else {
                        val += Location.getFieldData(field, place);
                    }
                });

                return val;
            }
            else {
                // Find value in `address_components`
                $.each(place.address_components, function (index, component) {
                    var longName = true,
                        fieldType = type;

                    if (type.indexOf('short:') > -1) {
                        longName = false;
                        fieldType = type.replace('short:', '');
                    }

                    if (component.types.indexOf(fieldType) > -1) {
                        val = ( longName ) ? component.long_name : component.short_name;
                        // Stop the function right after val has found
                        return false;
                    }
                });
                return val;
            }
        }
    };

    Instant_Locations.init();

    //window.onload = function() {
    //    var startPos;
    //    var geoOptions = {
    //        timeout: 10 * 1000
    //    };
    //
    //    var geoSuccess = function(position) {
    //        var lat = position.coords.latitude,
    //            lng = position.coords.longitude;
    //
    //        $.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng, function (data) {
    //            var formatted_address = data.results[0].formatted_address;
    //        });
    //    };
    //    var geoError = function(error) {
    //        console.log('Error occurred. Error code: ' + error.code);
    //        // error.code can be:
    //        //   0: unknown error
    //        //   1: permission denied
    //        //   2: position unavailable (error response from location provider)
    //        //   3: timed out
    //    };
    //
    //    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
    //};

})(jQuery);