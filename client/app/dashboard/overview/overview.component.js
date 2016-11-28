import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './overview.routes';
import c3 from 'c3';

var throttleBrakeChart;

function updateThrottleBrake(throttle,brake) {
  if(throttle)
    throttleBrakeChart.load({
      columns: [
        ['data1', throttle]
      ]
    });
  if(brake)
    throttleBrakeChart.load({
      columns: [
        ['data2', brake]
      ]
    });
}

export class OverviewController {
  /*@ngInject*/
  constructor() {
    throttleBrakeChart = c3.generate({
      bindto: '#throttle-brake',
      data: {
        columns: [
          ['data1', 100],
          ['data2', 20]
        ],
        type: 'bar'
      },
      bar: {
        width: {
          ratio: 0.5 // this makes bar width 50% of length between ticks
        }
        // or
        //width: 100 // this makes bar width 100px
      }
    });
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('car');
    });
  }

  $onInit() {
    this.socket.syncUpdates('car', function(data){
      if(data){
        if(data.CAN_Id==512) updateThrottleBrake(data,null);
        else if(data.CAN_Id==513) this.brakeBuffer.push(null,data);
      }
    }.bind(this));
  }
}

export default angular.module('dataLoggerWebApp.overview', [uiRouter])
  .config(routing)
  .component('overview', {
    template: require('./overview.html'),
    controller: OverviewController
  })
  .name;
