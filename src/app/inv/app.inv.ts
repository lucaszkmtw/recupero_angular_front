angular.module('app.inv', ['app.core'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.inv', {
                url: '/inventory',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'inv'
                }
            });
    }]);