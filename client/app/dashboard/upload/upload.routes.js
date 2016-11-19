'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('dashboard.upload', {
    url: '/upload',
    parent: 'dashboard',
    template: '<upload></upload>'
  });
}
