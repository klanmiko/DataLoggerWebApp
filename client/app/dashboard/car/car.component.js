import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './car.routes';

import c3 from 'c3';

var carChart;
var count = 0;
class Buffer{
  constructor(ms,key,callback){
    this.ms = ms;
    this.buffer = [];
    this.callback = callback;
    this.key = key;
  }
  push(point){
    var self = this;
    if(point instanceof Object){
      if(!this.start) this.start = point.Timestamp;
      if(point.Timestamp - this.start < this.ms){
        this.buffer.push(point);
      }
      else{
        var out = new Object();
        out.Timestamp = this.start;
        out.CAN_Id = this.buffer[0].CAN_Id;
        var sum=0;
        this.buffer.forEach(function(value){
          sum+=value[self.key];
        });
        sum = sum/this.buffer.length;
        out[this.key] = sum;
        this.start = undefined;
        this.buffer = [];
        this.callback(out);
      }
    }
  }
}
var initialPointRemoved = false;
function plotNew(newData) {
    if(count<100)carChart.flow({
       columns: newData,
      length:0
    });
    else carChart.flow({
      columns:newData,
      length:1
    });
    count++;
}

export class CarController {
  /*@ngInject*/
  constructor($scope, $timeout, socket) {
    count = 0;
    initialPointRemoved = false;
    this.socket = socket;
    this.throttleBuffer = new Buffer(1000,'throttle',plotNew);
    this.brakeBuffer = new Buffer(1000,'brake',plotNew);
    carChart = c3.generate({
      bindto: '#car-chart',
      data: {
        xs: {
          'throttleY': 'throttleX',
          'brakeY': 'brakeX'
        },
        columns: [
          ['throttleX',0],
          ['brakeX',0],
          ['throttleY',0],
          ['brakeY',0]
        ],
        names: {
          'throttleY': 'Throttle',
          'brakeY': 'Brake'
        }
      },
      axis: {
        y: {
          tick: {
            format: d3.format("%")
          }
        }
      },
      tooltip: {
        format: {
        title: function (d) { return 'Time ' + d; },
        value: d3.format('%')
        }
      },
      subchart: {
        show: true
      }
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function(data){
      if(data){
        if(data.CAN_Id==512) this.throttleBuffer.push(data);
        else if(data.CAN_Id==513) this.brakeBuffer.push(data);
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.car', [uiRouter])
  .config(routing)
  .component('car', {
    template: require('./car.html'),
    controller: CarController
  })
  .name;
