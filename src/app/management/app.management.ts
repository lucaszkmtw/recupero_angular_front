angular.module('app.management', ['app.core'])
    .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
        .state('app.management', {
        url: '/management',
        template: '<data-ui-view />',
        ncyBreadcrumb: {
            label: 'Gestiones'
        },
        abstract: true
    })
        .state('app.management.inbox', {
        url: '/bandeja',
        controller: 'ManagementInboxController',
        templateUrl: 'app/management/inbox.html',
        resolve: loadSequence('ui.grid', 'ui.grid.autoResize'),
        ncyBreadcrumb: {
            label: 'Bandeja'
        }
        })
        .state('app.management.report', {
        url: '/reporte',
        controller: 'ManagementReportController',
        templateUrl: 'app/management/report.html',
        resolve: loadSequence('ui.grid', 'ui.grid.autoResize'),
        ncyBreadcrumb: {
            label: 'Reporte'
        }
        })
        .state('app.management.start', {
        url: '/iniciar',
        controller: 'ManagementStartController',
        templateUrl: 'app/management/start.html',
        resolve: loadSequence('flow'),
        ncyBreadcrumb: {
            label: 'Iniciar Gestión'
        }
    });
}
])
    .controller('ManagementStartController', ['$scope', '$translate', '$state', '$log', ($scope, $translate, $state, $log) => {

    }])
    .controller('ManagementReportController', ['$scope', '$translate', '$state', '$log', ($scope, $translate, $state, $log) => {

    }])
    .controller('ManagementInboxController', ['$scope', '$translate', '$state', '$log', ($scope, $translate, $state, $log) => {

    }]);