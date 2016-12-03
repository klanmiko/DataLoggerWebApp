import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './overview.routes';
import c3 from 'c3';

var throttleBrakeChart;

function updateThrottleBrake(throttle,brake) {
  if(throttle)
    throttleBrakeChart.load({
      columns: [
        ['Throttle', throttle]
      ]
    });
  if(brake)
    throttleBrakeChart.load({
      columns: [
        ['Brake', brake]
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
          ['Throttle', 100],
          ['Brake', 20]
        ],
        type: 'bar'
      },
      bar: {
        width: 100 // this makes bar width 100px
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
        else if(data.CAN_Id==513) updateThrottleBrake(null,data);
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
