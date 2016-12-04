var AVBUChart = (function ($) {
    'use strict';

    var module = {};

    const Chart = function (targetDiv, title) {
        this.id = targetDiv;
        this.initialize(targetDiv, title);
    };

    Chart.prototype = {
        id: "ERR",
        initialize: function (target, title) {
            this.control = new CanvasJS.Chart(target, {
                title:{
                    text: title
                },
                /*data: [
                    {
                        // Change type to "doughnut", "line", "splineArea", etc.
                        type: "line",
                        dataPoints: [
                            { label: "apple",  y: 10  },
                            { label: "orange", y: 15  },
                            { label: "banana", y: 25  },
                            { label: "mango",  y: 30  },
                            { label: "grape",  y: 28  }
                        ]
                    }
                ]*/
            });
        },
        load: function () {

        },
        save: function () {

        },
        update: function (dataPoint) {

        },
        render: function () {
            this.control.render();
        }
    };

    module.create = function (targetDiv, title) {
        return new Chart(targetDiv, title);
    };

    return module;

});