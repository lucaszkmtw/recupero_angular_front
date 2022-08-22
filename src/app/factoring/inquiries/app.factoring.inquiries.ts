angular.module('app.factoring.inquiries', ['app.factoring.inquiries.portfolio', 'app.factoring.inquiries.clients', 'app.factoring.inquiries.obtopay'])
   .config(['$stateProvider', $stateProvider => {
        $stateProvider
        .state('app.factoring.inquiries', {
            abstract: true,
            template: '<ui-view/>',
            url: '/inquiries',
            ncyBreadcrumb: {
                skip: false,
                parent: 'app.factoring',
                label: 'inquiries'
            }
        });
    }]);