'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

const fileUpload = require('ng-file-upload');
import routes from './display.routes';

export class DisplayComponent {
  /*@ngInject*/
  constructor($scope, $http, Upload) {
    $http({url: '/api/db/collections', method: 'GET'}).then(function(collections) { //collections is a sorted array of strings
      $scope.collections = collections.data;
      $scope.selected = collections.data[0];
    });
    $scope.load = function() {
      $http({url: `/api/db/collections/${$scope.selected}`, method: 'GET'}).then(function(data) {
        console.log(data);
        //TODO take the response and generate graphs
      });
    };
    $scope.upload = function(theFile){
      console.log(theFile);
      Upload.upload({
            url: '/api/upload',
            data: {
              file: theFile
              }
        }).then(function (resp) {
            console.log(resp);
            //TODO take the response and generate a bunch of graphs on the page
        }, function (resp) {
            console.log(resp);
        });
    }
    
  }
}
DisplayComponent.$inject = ["$scope", "$http", "Upload"];
export default angular.module('dataLoggerWebApp.display', [uiRouter, fileUpload])
  .config(routes)
  .component('display', {
    template: require('./display.html'),
    controller: DisplayComponent
  })
  .name;
