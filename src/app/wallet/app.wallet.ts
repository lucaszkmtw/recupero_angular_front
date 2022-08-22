angular.module('app.wallet', [
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'restangular',
    'pascalprecht.translate',
    'app.core'
]).config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('app.wallet', {
                url: '/wallet',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    label: 'wallet'
                }
            })
            .state('app.wallet.summary', {
                url: '/summary',
                controller: 'WalletSummaryController',
                templateUrl: 'app/wallet/summary/index.html',
                resolve: loadSequence('jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'wallet.summary'
                }
            })
            .state('app.wallet.balance', {
                url: '/balance',
                controller: 'WalletBalanceController',
                templateUrl: 'app/wallet/balance/index.html',
                resolve: loadSequence('icheck', 'toastr'),
                ncyBreadcrumb: {
                    label: 'wallet.balance'
                }
            })
            // .state('app.wallet.balance.transferfunds', {
            //     url: '/transferfunds',
            //     parent: 'app.wallet.balance',
            //     views:{
            //         "transferfunds":{
            //             controller: 'WalletBalanceController',
            //             templateUrl: 'app/wallet/balance/transferfunds.html'
            //         }
            //     },
            //     resolve: loadSequence('icheck', 'toastr'),
            //     ncyBreadcrumb: {
            //         label: 'wallet.balance'
            //     }
            // })
            // .state('app.wallet.balance.sendpayments', {
            //     url: '/sendpayments',
            //     parent: 'app.wallet.balance',
            //     views:{
            //         "sendpayments":{
            //             controller: 'WalletBalanceController',
            //             templateUrl: 'app/wallet/balance/sendpayments.html'
            //         }
            //     },
            //     resolve: loadSequence('icheck', 'toastr'),
            //     ncyBreadcrumb: {
            //         label: 'wallet.balance'
            //     }
            // })
            // .state('app.wallet.balance.requestpayments', {
            //     url: '/requestpayments',
            //     parent: 'app.wallet.balance',
            //     views:{
            //         "requestpayments":{
            //             controller: 'WalletBalanceController',
            //             templateUrl: 'app/wallet/balance/requestpayments.html'
            //         }
            //     },
            //     resolve: loadSequence('icheck', 'toastr'),
            //     ncyBreadcrumb: {
            //         label: 'wallet.balance'
            //     }
            // })
            // .state('app.wallet.balance.bankaccountinfo', {
            //     url: '/bankaccountinfo',
            //     parent: 'app.wallet.balance',
            //     views:{
            //         "bankaccountinfo":{
            //             controller: 'WalletBankAccountController',
            //             templateUrl: 'app/wallet/balance/bankaccount.html'
            //         }
            //     },                
            //     resolve: loadSequence('toastr')
            // })
            // .state('app.wallet.balance.bankaccount', {
            //     url: '/bankaccount',
            //     parent: 'app.wallet.balance',
            //     views:{
            //         "bankaccount":{
            //                     controller: 'WalletBankAccountController',
            //                     templateUrl: 'app/wallet/balance/bankaccount.html'
            //                   }
            //     },                
            //     resolve: loadSequence('toastr')
            // })
            // .state('app.wallet.balance.creditcard', {
            //     url: '/creditcard',
            //     parent: 'app.wallet.balance',
            //     views:{
            //         "creditcard":{
            //                     controller: 'WalletCreditCardController',
            //                     templateUrl: 'app/wallet/balance/creditcard.html'
            //                   }
            //     },                
            //     resolve: loadSequence('toastr')
            // })
            .state('app.wallet.activity', {
                url: '/activity',
                controller: 'WalletActivityController',
                templateUrl: 'app/wallet/activity/index.html',
                resolve: loadSequence('icheck', 'toastr'),
                ncyBreadcrumb: {
                    label: 'wallet.activity'
                }
            });
}])
.controller('WalletSummaryController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletSummaryController:' );
    }])
.controller('WalletBalanceController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletBalanceController:' );
    //var vm = this;
    $scope.operationType = 1;
    $scope.accountType = 1;
    $scope.showConfigBA = 0;
    $scope.showConfigCC = 0;

    $scope.loadBalance = function(){
        $http.get("app/wallet/api/balancesummary.json").then(function(response){
            var data = response.data;
            $scope.totalBalance = data[0].totalBalance;
            $scope.sentPaymentsBalance = data[0].sentPaymentBalance;
            $scope.receivedPaymentsBalance = data[0].receivedPaymentBalance;
            $scope.transferFundsBalance = data[0].transferFundsBalance;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    };

    $scope.showOperation = function(p){
        if($scope.operationType==p) return true;
        return false;
    };

    $scope.showConfiguration = function(p){
        if($scope.accountType==p) {
            if(p=='1'){
                $scope.showConfigBA=0;
                $scope.showConfigCC=0;
            }else{
                $scope.showConfigBA=0;
                $scope.showConfigCC=0;
            }
            return true;
        }
        return false;
    }

    $scope.showDetail = function(){
        return $scope.showConfig;
    }

    $scope.showEditConfig = function(p, edit){
        if($scope.accountType==p && edit==true) return true;
        return false;
    };

    // Metodos para pantalla de Operaciones
    $scope.loadAccountWallet = function(){
        $http.get("app/wallet/api/accountwalletuser.json").then(function(response){
            $scope.walletAccount = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    }

    $scope.loadBankAccountUser = function(){
        $http.get("app/wallet/api/bankaccountuser.json").then(function(response){
            $scope.bankAccountUsers = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    }

    $scope.loadCreditCardUser = function(){
        $http.get("app/wallet/api/creditcarduser.json").then(function(response){
            $scope.creditCardUsers = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    }

    $scope.newConfiguration = function(){
        if ($scope.accountType=="1"){
            $scope.showConfigBA = 1;
            $scope.configurationTitle = "Nueva Cuenta Bancaria";
        }else{
            $scope.showConfigCC = 1;
            $scope.configurationTitle = "Nueva Tarjeta Crédito";
        }
    }

    $scope.editConfiguration = function(item){
        if ($scope.accountType=="1"){
            $scope.showConfigBA = 1;            
            $scope.configurationTitle = "Editar Cuenta Bancaria";
            $scope.countryId = item.accountCountryId;
            $scope.bankName = item.accountBankName;
        }else{
            $scope.showConfigCC = 1;
            $scope.configurationTitle = "Editar Tarjeta Crédito";
        }
    }

    $scope.newBankAccountUser = function(item){
        $scope.bankAccounts.push(item);
    }

    $scope.deleteBankAccountUser = function(item){
        var result = confirm("¿Desea eliminar la Cuenta Bancaria?");
        if (result== true){
            var index = $scope.bankAccounts.indexOf(item)
            $scope.bankAccounts.splice(index,1);
            toastr.success("Se ha eliminado la Cuenta Bancaria", "Eliminar Cuenta");
        }
    }

    $scope.newCreditCardUser = function(item){
        $scope.creditCards.push(item);
    }

    $scope.deleteCreditCardUser = function(item){
        var result = confirm("¿Desea eliminar la Tarjeta de Credito?");
        if (result== true){
            var index = $scope.creditCards.indexOf(item)
            $scope.creditCards.splice(index,1);
            toastr.success("Se ha eliminado la Tarjeta de Credito", "Eliminar Tarjeta");
        }
    }

    // Metodos para Guardar Datos.
    $scope.sendPayment = function(){
        toastr.success("Se ha enviado el Pago exitosamente", "Envío de Pago");
    }

    $scope.requestPayment = function(){
        toastr.success("Se ha enviado la Solicitud de Pago exitosamente", "Solicitud de Pago");
    }

    $scope.transferFunds = function(){
        toastr.success("Se ha Retirado el Dinero exitosamente", "Retiro de Dinero");
    }

    $scope.depositMoney = function(){
        toastr.success("Se ha Depositado el Dinero exitosamente", "Deposito de Dinero");
    }

    $scope.loadCountries = function(){
        $http.get("app/wallet/api/countries.json").then(function(response){
            $scope.countries = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    };

    $scope.loadAccountTypes = function(){
        $http.get("app/wallet/api/accounttypes.json").then(function(response){
            $scope.accounttypes = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    }; 

    $scope.loadCardTypes = function(){
        $http.get("app/wallet/api/cardtypes.json").then(function(response){
            $scope.cardtypes = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    };

    $scope.loadTransactionTypes = function(){
        $http.get("app/wallet/api/transactiontypes.json").then(function(response){
            $scope.transactiontypes = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    };

    $scope.loadMonths = function(){
        $http.get("app/wallet/api/months.json").then(function(response){
            $scope.months = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    };

    $scope.loadYears = function(){
        $http.get("app/wallet/api/years.json").then(function(response){
            $scope.years = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
    };

    $scope.loadCountries();
    $scope.loadAccountTypes();
    $scope.loadCardTypes();
    $scope.loadTransactionTypes();
    $scope.loadMonths();
    $scope.loadYears();

    $scope.loadAccountWallet();
    $scope.loadBankAccountUser();
    $scope.loadCreditCardUser();
    $scope.loadBalance();
}])
.controller('WalletBankAccountController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletBankAccountController:' );
}])
.controller('WalletCreditCardController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletCreditCardController:' );
}])
.controller('WalletTransferFundsController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletTransferFundsController:' );

    var vm = this;
}])
.controller('WalletSendPaymentsController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletSendPaymentsController:' );

    var vm = this;
}])
.controller('WalletReceivePaymentsController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletReceivePaymentsController:' );

    var vm = this;
}])
.controller('WalletActivityController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
    $log.info('WalletActivityController:');
}])
.directive('wallet', ($log, $parse, $http, Restangular, formService, dialogs) => {
    return {
        restrict: 'A',
        scope: {},
        controller: ['$scope', '$rootScope', '$stateParams', 'toastr', function MyController($scope, $rootScope, $stateParams, toastr) {
            {
            }
        }],
        controllerAs: 'vm',
        bindToController: { item: '=?item' },
        templateUrl: '/app/wallet/index.html',
        link: (scope, elm, attr, ctrl) => {
            //scope.form = ctrl[0];
            $log.info("Link de directiva wallet");
        }
    };
})
.directive('walletTransferfunds', ($log, $parse, $http, Restangular, formService, dialogs) => {
    return {
        restrict: 'A',
        scope: {},
        controller: ['$scope', '$rootScope', '$stateParams', 'toastr', 'icheck', function MyController($scope, $rootScope, $stateParams, toastr, icheck) {
            {
                var vm = this;

                vm.loadAccountWallet = function(){
                    $http.get("app/wallet/api/accountwalletuser.json").then(function(response){
                        vm.walletAccount = response.data;
                    }, function errorCallback(response){
                        toastr.success(response.statusText, 'Error');
                    });
                }

                vm.loadBankAccountUser = function(){
                    $http.get("app/wallet/api/bankaccount.json").then(function(response){
                        vm.bankAccounts = response.data;
                    }, function errorCallback(response){
                        toastr.success(response.statusText, 'Error');
                    });
                }

                vm.loadAccountWallet();
                vm.loadBankAccountUser();

            }
        }],
        controllerAs: 'vm',
        bindToController: { item: '=?item' },
        templateUrl: '/app/wallet/transferfunds.html',
        link: (scope, elm, attr, ctrl) => {
            //scope.form = ctrl[0];
            $log.info("Link de directiva walletTransferfunds");
        }
    };
})
.directive('walletSummaryGrid', ($state, $window, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'summaryGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {   
                    var gridModel: IGridModel = <IGridModel>{};
                    /*, 'Formulario'*/
                    gridModel.colNames = ['Fecha', 'Tipo Actividad', 'Cantidad'];
                    gridModel.colModel = [
                        { name: 'sentDate', index: 'sentDate', width: 80, fixed: true, align: 'center', search: false },
                        { name: 'activityName', index: 'activityName', search: false },
                        { name: 'amount', index: 'amount', width: 80, fixed: true, align: 'right', search: false },
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    //scope.height = scope.height || 450;
                    scope.height = 300;
                    scope.width = 800;
                    var gridModel = buildGridModel();
                    //var url = '/api/crm/campaigns.json';
                    var url = 'app/wallet/api/summary.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        width: scope.width,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        loadBeforeSend: function (jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                            var ids = gridElement.jqGrid('getDataIDs');
                            for (var i = 0; i < ids.length; i++) {
                                var editCommand = '<span class="command-cell glyphicon glyphicon-pencil" title="Editar"></span>';
                                gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand });
                            }
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    $state.go('app.wallet.summary', { campaignId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });


                }

                loadGrid();
            }
        };
    })
.directive('walletActivityGrid', ($state, $window, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'activityGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    /*, 'Formulario'*/
                    gridModel.colNames = ['Fecha', 'Tipo', 'Nombre', 'Pago', 'Bruto', 'Comisión', 'Neto', 'Saldo'];
                    gridModel.colModel = [
                        { name: 'transactionDate', index: 'transactionDate', width: 80, fixed: true, align: 'center', search: false },
                        { name: 'transactionType', index: 'transactionType', search: false },
                        { name: 'transactionName', index: 'transactionName', search: false },
                        { name: 'paymentStatus', index: 'paymentStatus', search: false },
                        { name: 'amountGross', index: 'amountGross', width: 80, fixed: true, align: 'right', search: false },
                        { name: 'amountFee', index: 'amountFee', width: 60, fixed: true, align: 'right', search: false },
                        { name: 'amountNet', index: 'amountNet', width: 60, fixed: true, align: 'right', search: false },
                        { name: 'amountBalance', index: 'amountBalance', width: 80, fixed: true, align: 'right', search: false },
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    //scope.height = scope.height || 450;
                    scope.height = 300;
                    scope.width = 800;
                    var gridModel = buildGridModel();
                    //var url = '/api/crm/campaigns.json';
                    var url = 'app/wallet/api/activity.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        width: scope.width,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        loadBeforeSend: function (jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                            var ids = gridElement.jqGrid('getDataIDs');
                            for (var i = 0; i < ids.length; i++) {
                                var editCommand = '<span class="command-cell glyphicon glyphicon-pencil" title="Editar"></span>';
                                gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand });
                            }
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    $state.go('app.wallet.summary', { campaignId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });


                }

                loadGrid();
            }
        };
    })
.directive('walletActivityShortGrid', ($state, $window, authManager ) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'activityshortGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    /*, 'Formulario'*/
                    gridModel.colNames = ['Fecha', 'Tipo Transacción', 'Bruto', 'Comisión', 'Neto', 'Saldo'];
                    gridModel.colModel = [
                        { name: 'transactionDate', index: 'transactionDate', width: 80, fixed: true, align: 'center', search: false },
                        { name: 'transactionType', index: 'transactionType', search: false },
                        { name: 'amountGross', index: 'amountGross', width: 80, fixed: true, align: 'right', search: false },
                        { name: 'amountFee', index: 'amountFee', width: 60, fixed: true, align: 'right', search: false },
                        { name: 'amountNet', index: 'amountNet', width: 60, fixed: true, align: 'right', search: false },
                        { name: 'amountBalance', index: 'amountBalance', width: 80, fixed: true, align: 'right', search: false },
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    //scope.height = scope.height || 450;
                    scope.height = 300;
                    scope.width = 800;
                    var gridModel = buildGridModel();
                    //var url = '/api/crm/campaigns.json';
                    var url = 'app/wallet/api/activity.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        width: scope.width,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        loadBeforeSend: function (jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                            var ids = gridElement.jqGrid('getDataIDs');
                            for (var i = 0; i < ids.length; i++) {
                                var editCommand = '<span class="command-cell glyphicon glyphicon-pencil" title="Editar"></span>';
                                gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand });
                            }
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    $state.go('app.wallet.summary', { campaignId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });


                }

                loadGrid();
            }
        };
    });