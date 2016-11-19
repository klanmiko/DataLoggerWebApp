import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './overview.routes';

export class OverviewController {
  /*@ngInject*/
  constructor() {
  }
  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.overview', [uiRouter])
  .config(routing)
  .component('overview', {
    template: require('./overview.html'),
    controller: OverviewController
  })
  .name;
