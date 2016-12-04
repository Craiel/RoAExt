var AVBUChart = (function ($) {
    'use strict';

    var module = {};

    const Chart = function (toggleDiv, targetDiv, title) {
        this.id = targetDiv;
        this.initialize(toggleDiv, targetDiv, title);
    };

    Chart.prototype = {
        id: "ERR",
        visible: false,
        onBecameVisible: null,
        toggle: null,
        target: null,
        isGameStatChart: false,
        isElementChart: false,
        gameStatDataPoint: null,
        elementDataPoint: null,
        initialize: function (toggleDiv, targetDiv, title) {
            this.toggleDiv = $('#' + toggleDiv);
            this.toggleDiv.click({self: this}, function(evt) { evt.data.self.show(); });

            this.targetDiv = $('#' + targetDiv);

            this.control = new CanvasJS.Chart(targetDiv, {
                title:{
                    text: title
                },
                data: [
                    {
                        type: "line",
                        dataPoints: [
                            /*{ label: "apple",  y: 10  },
                            { label: "orange", y: 15  },
                            { label: "banana", y: 25  },
                            { label: "mango",  y: 30  },
                            { label: "grape",  y: 28  }*/
                        ]
                    }
                ]
            });

            this.updateControlState();
        },
        load: function (data) {

        },
        save: function () {
            return null;
        },
        show: function () {
            if(this.visible === true) {
                return;
            }

            console.log("Showing Chart " + this.id);
            this.visible = true;
            this.updateControlState();

            if(this.onBecameVisible) {
                this.onBecameVisible(this.id);
            }
        },
        hide: function () {
            if(this.visible === false) {
                return;
            }

            console.log("Hiding Chart " + this.id);
            this.visible = false;
            this.updateControlState();
        },
        updateData: function (dataPoint) {
            if(dataPoint == null || dataPoint == NaN) {
                return
            }

            console.log("CHART_UPDATE: " + dataPoint + " (" + this.id + ")");
        },
        updateDataFromGameStats: function (stats) {
            if(!this.isGameStatChart) {
                return;
            }

            this.updateData(stats[this.gameStatDataPoint]);
        },
        updateDataFromElement: function() {
            var value = utils.getElementIntValue(this.elementDataPoint);
            this.updateData(value);
        },
        asGameStatChart: function (dataPoint) {
            this.isGameStatChart = true;
            this.gameStatDataPoint = dataPoint;

            return this;
        },
        asElementChart: function (dataPoint) {
            this.isElementChart = true;
            this.elementDataPoint = dataPoint;
        },
        updateControlState: function() {
            if(this.visible === false) {
                this.targetDiv.hide();
                return;
            }

            this.targetDiv.show();
        },
        render: function () {
            this.control.render();
        }
    };

    module.create = function (toggleDiv, targetDiv, title) {
        return new Chart(toggleDiv, targetDiv, title);
    };

    return module;

});