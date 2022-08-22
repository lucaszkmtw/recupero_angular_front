angular.module('app.investments.assets', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.assets', {
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: true
                }
              
            })
            .state('app.investments.assets.new', {
                url: '/assets/{accountId}/new',
                controller: 'InvestmentAssetsNewController',
                templateUrl: 'app/investments/assets/new.html',
                resolve: loadSequence('icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.accounts.edit',
                    label: 'investmentassets.new'
                }
            })
            ;
    }])
    .controller('InvestmentAssetsNewController', ['$log', '$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', 'dialogs', ($log, $scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {
        var id = $stateParams.accountId;
        if (id) {

            Restangular.one('investments').one('accounts', id).get().then(result => {
                $scope.account = result;
                $scope.account.assetAmount = $scope.account.balance;
            });
            
        }

        $scope.calculateAssetExpiration = () => {
            if ($scope.account.assetAmount > $scope.account.balance) {
                toastr.error('El monto de inversion no puede ser mayor al saldo de la cuenta', 'Nueva inversión');
                $scope.account.assetAmount = $scope.account.balance;
            }
            if ($scope.account.assetAmount < 0) {
                toastr.error('El monto de inversion no puede menor a cero', 'Nueva inversión');
                $scope.account.assetAmount = 0;
            }

            var testExpiration = moment().add( $scope.account.assetTerm,'days');
            $scope.account.assetExpiration = moment(testExpiration).format('DD/MM/YYYY');

            $scope.account.investorAssignment = +$scope.account.investorAssignment.toFixed(2);
            var amountExpiration = $scope.account.assetAmount * ( $scope.account.assetTerm / 30) * ($scope.account.investorAssignment / 100 ) /12;
            $scope.account.assetExpirationAmount = +amountExpiration.toFixed(2) + $scope.account.assetAmount;
            $scope.account.investorAssignmentValue = +amountExpiration.toFixed(2);

            $scope.account.managerAssignment = +$scope.account.managerAssignment.toFixed(2);
            var managerComissionValue = amountExpiration * +($scope.account.managerAssignment/100);
            $scope.account.managerAssignmentValue = +managerComissionValue.toFixed(2);

            $scope.account.traderAssignment = +$scope.account.traderAssignment.toFixed(2);
            var traderComissionValue = amountExpiration * +($scope.account.traderAssignment/100);
            $scope.account.traderAssignmentValue = +traderComissionValue.toFixed(2);

            $scope.account.custodianAssignment = +$scope.account.custodianAssignment.toFixed(2);
            var custodianComissionValue = amountExpiration * +($scope.account.custodianAssignment/100);
            $scope.account.custodianAssignmentValue = +custodianComissionValue.toFixed(2);
           
        }

        $scope.save = () => {
            $scope.account.currencyId = $scope.account.currency.id;
            if (id) {
                $scope.account.amount = $scope.account.assetAmount;
                $scope.account.expirationAmount = $scope.account.assetExpirationAmount;
                $scope.account.expirationDate = $scope.account.assetExpiration;
                $scope.account.term = $scope.account.assetTerm;
                $scope.account.accountId = $scope.account.parentAccountId;
                Restangular.service('investments/assets').post($scope.account).then(() => {
                     $state.go('app.investments.accounts.edit',  {accountId: id}); 
                });
            }
        }

    }])
