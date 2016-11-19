import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './database.routes';

import c3 from 'c3';

export class DatabaseController {
  /*@ngInject*/
  constructor($scope,$http) {
    $scope.collections = [];
    $scope.selected = null;
    $scope.log = [];
    var self = this;
    $scope.query = function(){
      $http({url:`api/db/collections/${$scope.selected.name}`,method:"GET"}).then(function(response){
        $scope.log = response.data;
        console.log(response);
      });
    };
    $http({url:"api/db/collections",method:"GET"}).then(function(data){
      $scope.collections = data.data;
      $scope.selected = $scope.collections[0];
      console.log(data.data);
    });
  }
  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.database', [uiRouter])
  .config(routing)
  .component('database', {
    template: require('./database.html'),
    controller: DatabaseController
  })
  .name;
