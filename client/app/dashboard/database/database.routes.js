'use strict';

export default function routes($stateProvider) {
  'ngInject';

$stateProvider.state('dashboard.database', {
    url: '/database',
    parent: 'dashboard',
    template: '<database></database>'
  });
}
