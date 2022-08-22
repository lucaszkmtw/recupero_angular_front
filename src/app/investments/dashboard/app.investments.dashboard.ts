angular.module('app.investments.dashboard', ['easypiechart', 'app.investments.accounts', 'app.investments.myaccounts'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.dashboard', {
                abstract: true,
                template: '<ui-view/>',
                resolve: loadSequence('easypiechart', 'angular-flot'),
                ncyBreadcrumb: {
                    skip: true
                }

            })
            .state('app.investments.dashboard.list', {
                url: '/dashboard',
                controller: 'InvestmentAccountsDashboardController',
                templateUrl: 'app/investments/dashboard/dashboard.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'investments.dashboard'
                }
            })
            .state('app.investments.dashboard.calendar', {
                url: '/calendar',
                controller: 'InvestmentAccountsCalendarController',
                templateUrl: 'app/investments/dashboard/accountcalendar.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'investments.calendar'
                }
            });
    }])
    .controller('InvestmentAccountsDashboardController', ['$scope', '$translate', '$state', '$stateParams', ($scope, $translate, $state, $stateParams) => {
        $scope.newAccount = () => {
            $state.go('app.investments.accounts.new');
        }
        $scope.viewDetails = () => {
            $state.go('app.investments.myaccounts.monetary');
        }

        $scope.viewAccounts = () => {
            $state.go('app.investments.myaccounts.list');
        }

        $scope.viewCalendar = () => {
            $state.go('app.investmentss.dashboard.calendar');
        }
    }])
    .controller('InvestmentAccountsCalendarController', ['$scope', '$translate', '$state', '$stateParams', ($scope, $translate, $state, $stateParams) => {
        $scope.newAccount = () => {
            $state.go('app.investments.accounts.new');
        }
    }]);