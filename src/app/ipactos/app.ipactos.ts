angular.module('app.ipactos', [
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'restangular',
    'pascalprecht.translate',
    'app.core'
]).config(['$stateProvider', ($stateProvider) => {
    $stateProvider
        .state('app.ipactos', {
            abstract: true,
            url: '/ipactos',
            template: '<ui-view/>',
            ncyBreadcrumb: {
                skip: true
            }
        
        })
        .state('app.ipactos.dashboard', {
            url: '/dashboard',
            templateUrl: 'app/ipactos/index.html',
            controller: 'IpactosDashboardController',
            resolve: loadSequence('chart.js', 'angular-flot', 'toastr', 'icheck'),
            title: 'Dashboard',
            ncyBreadcrumb: {
                label: '<i class="fa fa-home" ></i><span> Ipactos - Dashboard</span>'
            }
        })
        .state('app.ipactos.finanzas', {
            url: '/finanzas',
            templateUrl: 'app/ipactos/finanzas.html',
            controller: 'IpactosFinanzasController',
            resolve: loadSequence('chart.js', 'angular-flot', 'toastr', 'icheck'),
            title: 'Dashboard',
            ncyBreadcrumb: {
                label: '<i class="fa fa-home" ></i><span> Ipactos - Finanzas</span>'
            }
        })
        .state('app.ipactos.gestioncobranzas', {
            url: '/gestioncobranzas',
            templateUrl: 'app/ipactos/gestioncobranzas.html',
            controller: 'IpactosGestionCobranzasController',
            resolve: loadSequence('chart.js', 'angular-flot', 'toastr', 'icheck'),
            title: 'Dashboard',
            ncyBreadcrumb: {
                label: '<i class="fa fa-home" ></i><span> Ipactos - Gestión de Cobranzas</span>'
            }
        });
}])
.controller('IpactosDashboardController', ['$log', '$scope', '$http', 'Restangular', '$translate', 'toastr', 'dialogs',
                                    ($log, $scope, $http, Restangular, $translate, toastr, dialogs) => {
    $scope.loadBalance = function(){
        $http.get("app/ipactos/api/dashboard.json").then(function(response){
            var data = response.data;
            $scope.accountsReceivable = data[0].accountsReceivable;
            $scope.accountsPayable = data[0].accountsPayable;
            $scope.financingAvailable = data[0].financingAvailable;
            $scope.liquidityAvailable = data[0].liquidityAvailable;
            $scope.investmentAvailable = data[0].investmentAvailable;
            
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error'); 
        });
    };

    $scope.generarComprobante = function(){
        var modalInstance = dialogs.create('app/ipactos/comprobante.html', 'IpactosComprobanteModalController', {}, { size: 'lg', animation: false });
        modalInstance.result.then((result) => {
            // Restangular.one('crm').one('employeebankbranch', result.bankaccount.bankBranchId).get().then((eba) => {
            //     result["bankBranchName"] = eba.name;
            //     result["bankName"] = eba.bankName;
            //     result["bankAccountNumber"] = result.bankaccount.number;
            //     $scope.contact.bankAccounts.push(result);
            // });
        }, () => { });
    };

    $scope.loadBalance();

}]).controller('IpactosComprobanteModalController', ($log, $scope, data, $uibModalInstance) => {

    $log.info('IpactosComprobanteModalController: aquica');

    $scope.options = { "edit": true};
    $scope.module = 2;

    $scope.save = () => {
        $uibModalInstance.close();
    };
})
.controller('IpactosFinanzasController', ['$log', '$scope', '$http', 'Restangular', '$translate', 'toastr',
                                        ($log, $scope, $http, Restangular, $translate, toastr) => {
    $log.info("IpactosFinanzasController: Activo");
    
}])
.controller('IpactosGestionCobranzasController', ['$log', '$scope', '$http', 'Restangular', '$translate', 'toastr',
                                        ($log, $scope, $http, Restangular, $translate, toastr) => {
    $log.info("IpactosGestionCobranzasFinanzasController: Activo");

}]);
    

    