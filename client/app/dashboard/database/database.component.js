import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './database.routes';

import c3 from 'c3';
const scrollAmount = 100;
function transform(object) {
  if(object instanceof Array) {
    if(object.length > 0) {
      if(typeof (object[0]) === 'boolean') {
        var out = 0;
        out |= (object[object.length - 1] ? 1 : 0);
        for(var i = object.length - 2; i > 0; i--) {
          out = out << 1;
          out |= (object[i] ? 1 : 0);
        }
        return out;
      }
      else {
        return object;
      }
    }
  }
  if(object instanceof Object) {
    //generics object
    return transform(object.value);
  }
  return object;
}
function processArray(elements) {
  for(var i = 0; i < elements.length; i++) {
    elements[i].data = [];
    for(var key in elements[i]) {
      if(key != 'CAN_Id' && key != 'Timestamp' && key != '_id' && key != 'data' && key != 'generics' && key != 'raw') {
        elements[i].data.push(transform(elements[i][key]));
        delete elements[i][key];
      }
      else if(key == 'generics') {
        for(var element of elements[i][key]) {
          var transformed = transform(element);
          elements[i].data.push(transformed);
        }
      }
    }
  }
  return elements;
}
export class DatabaseController {
  /*@ngInject*/
  constructor($scope, $http) {
    var self = this;
    this.start = 0;
    this.end = scrollAmount;
    $scope.datas = [];
    $http({url: '/api/db/collections', method: 'GET'}).then(function(collections) { //collections is a sorted array of strings
      $scope.collections = collections.data;
      $scope.selected = collections.data[0];
    });
    $scope.search = function() {
      self.start = 0;
      self.end = scrollAmount;
      $http({url: `/api/db/collections/${$scope.selected}`, method: 'GET', params: {start: self.start, end: self.end}}).then(function(data) {
        $scope.datas = processArray(data.data);
        self.start += scrollAmount;
        self.end += data.data.length;
      });
    };
    $scope.load = function() {
      if(self.end - self.start == scrollAmount && $scope.datas.length > 0) {
        $http({url: `/api/db/collections/${$scope.selected}`, method: 'GET', params: {start: self.start, end: self.end}}).then(function(data) {
          var elements = processArray(data.data);
          for(var i = 0; i < elements.length; i++) {
            $scope.datas.push(elements[i]);
          }
          self.start += scrollAmount;
          self.end += data.data.length;
        });
      }
    };
    $scope.download = function(type) {
      $http({url: `/api/db/collections/${$scope.selected}/download/${type}`, method: 'GET'});
    };
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.database', [uiRouter])
  .config(routing)
  /*.directive('scroller',['$window',function($window){
    return {link:function(scope,element,attr){
        var container = angular.element($window);
        console.log("linked");
        console.log(container);
        container.onscroll = function(){
          console.log("scrolled");
          if(container.innerHeight + container.scrollY >= $document.body.offsetHeight) {
            console.log("bottom")
            scope.search();
          }
        };
      }
    };
  }])*/
  .component('database', {
    template: require('./database.html'),
    controller: DatabaseController
  })
.name;
