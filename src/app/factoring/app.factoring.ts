angular.module('app.factoring', ['app.factoring.operations', 'app.factoring.authorizations', 'app.factoring.inquiries'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.factoring', {
                abstract: true,
                template: '<ui-view/>',
                url: '/factoring',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'factoring'
                }
            });
    }]);
