import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './upload.routes';

import c3 from 'c3';

export class UploadController {
  /*@ngInject*/
  constructor() {
  }

  $onInit() {
  }
}

export default angular.module('dataLoggerWebApp.upload', [uiRouter])
  .config(routing)
  .component('upload', {
    template: require('./upload.html'),
    controller: UploadController
  })
  .name;
