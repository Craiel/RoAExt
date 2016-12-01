var AVBURequest = (function ($) {
    'use strict';

    /**
     * Represents an AJAX request to be used with cache
     * @param {String} url The URL we're calling
     * @param {Boolean|Number} cacheTime Cache time in hours or false if the request should not be cached
     * @param {Function} [errorCallback]  A custom error callback
     * @constructor
     */
    const Request = function (url, cacheTime, errorCallback) {
        /** The URL we're calling */
        this.url = url;
        /** OnError callback */
        this.errorCallback = errorCallback || Request.prototype.callbacks.error.generic;

        /**
         * How long the request should be cached for
         * @type {Boolean|Number}
         */
        this.cacheTime = cacheTime || false;
    };

    Request.prototype = {
        /** Ajax callbacks container */
        callbacks: {
            /** Successful AJAX callbacks */
            success: {
                /** Successful callback for the currency tooltip market info lookup */
                currency_tooltip: function (r) {
                    const analysis = utils.analysePrice(r.l);

                    utils.toggleVisibility(constants.$AJAX_SPINNERS.currency_tooltip, false);
                    constants.$DOM.currency_tooltip.market_low.text(fn.numberWithCommas(analysis.low));
                    constants.$DOM.currency_tooltip.market_avg.text(fn.numberWithCommas(analysis.avg));
                    constants.$DOM.currency_tooltip.market_high.text(fn.numberWithCommas(analysis.high));
                },
                house_requery: function (evt, r, opts) {
                    if (opts.url.indexOf("house") !== -1 &&
                        typeof(r.responseJSON) !== "undefined" &&
                        typeof(r.responseJSON.m) !== "undefined") {
                        utils.handle_house_status_update(r.responseJSON.m);
                    }
                },
                house_state_refresh: function (r) {
                    utils.handle_house_status_update(r.m);
                }
            },
            /** Error callbacks */
            error: {
                /** Generic error callback */
                generic: function (xhr, textStatus, errorThrown) {
                    toast.error("[" + textStatus + "] " + xhr.responseText);
                    console.error({
                        xhr: xhr,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });
                }
            }
        },

        /**
         * Make a GET request
         * @returns {*|jqXHR|XMLHTTPRequest|jQuery|$}
         */
        get: function () {
            return this._generic({
                method: "GET"
            });
        },

        /**
         * To be called internally to start the request
         * @param {Object} generated params generated by the get/post methods
         * @returns {jqXHR|XMLHTTPRequest|jQuery|$}
         * @private
         */
        _generic: function (generated) {
            const methodArgs = $.extend({
                url: this.url,
                error: this.errorCallback
            }, generated || {});

            if (this.cacheTime !== false && !isNaN(this.cacheTime)) {
                methodArgs.cacheTTL = this.cacheTime;
                methodArgs.localCache = CACHE_STORAGE;
            }

            return $.ajax(this.url, methodArgs);
        },

        /**
         * Make a POST request
         * @param {Object} data Post params
         * @returns {*|jqXHR|XMLHTTPRequest|jQuery|$}
         */
        post: function (data) {
            return this._generic({
                method: "POST",
                data: data
            });
        }
    };

    return Request;

});