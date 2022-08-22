angular.module('app.loans', ['app.core'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.loans',
            {
                url: '/loans',
                template: '<div data-ui-view=""></div>',
                ncyBreadcrumb: {
                    skip: true,
                    parent: 'app.dashboard',
                    label: 'lns.loans'
                }
            });
    }
    ]);