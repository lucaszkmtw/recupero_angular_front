angular.module('app.crm', ['app.core'])
    .config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('app.crm', {
                url: '/crm',
                template: '<div data-ui-view=""></div>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'crm'
                }
            });
    }]);