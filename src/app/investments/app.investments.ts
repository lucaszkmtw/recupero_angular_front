angular.module('app.investments', ['app.investments.assets','app.investments.investors', 'app.investments.custodians', 'app.investments.traders', 'app.investments.accounts', 'app.investments.managers', 'app.investments.myaccounts', 'app.investments.dashboard', 'app.businesspartners'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments', {
                url: '/investments',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'investments'
                }
            });

    }
    ])
