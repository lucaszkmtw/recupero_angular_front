angular.module('app.investments.traders',[])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.traders', {
                url: '/traders',
                controller: 'InvestmentsTradersListController',
                templateUrl: 'app/investments/traders/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'investments.traders'
                }
            })
            .state('app.investments.trader', {
                url: '/traders/new',
                controller: 'InvestmentstraderEditController',
                templateUrl: 'app/investments/traders/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.traders',
                    label: 'investments.trader.new'
                }
            })
            .state('app.investments.traderedit', {
                url: '/traders/{traderId}',
                controller: 'InvestmentstraderEditController',
                templateUrl: 'app/investments/traders/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.traders',
                    label: 'investments.trader'
                }
            })
            .state('app.investments.tradercheckingaccount', {
                url: '/checkingaccount/{businessPartnerAccountId}',
                controller: 'InvestmentsTraderCheckingAccountController',
                templateUrl: 'app/investments/traders/checkingaccount.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.investments.traders',
                    label: 'investments.traders.checkingaccount'
                }
            })
            ;

    }
    ])
    .controller('InvestmentsTradersListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.investments.trader');
        }
    }
    ])
    .controller('InvestmentstraderEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {
        var id = $stateParams.traderId;

        function load() {
            if (id) {
                Restangular.one('investments').one('traders', id).get().then(result => {
                    $scope.trader = result;
                });
            }
        }

        $scope.delete = () => {


            toastr.success("<button type='button' id='confirmationRevertYes'>Yes</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.trader.remove().then(() => {
                            toastr.success('Se ha dado de baja el operador con éxito.', 'Editor de Operadores');
                            $state.go('app.investments.traders');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el operador.', 'Editor de Operadores');
                        });
                    });
                    }
            });
        }



        $scope.save = () => {
            if (id) {
                $scope.trader.put().then(() => { $state.go('app.investments.traders'); });
                toastr.success('Se ha dado de alta el operador con éxito.', 'Editor de Operadores');
            } else {
                Restangular.service('investments/traders').post($scope.trader).then(() => { $state.go('app.investments.traders'); });
                toastr.success('Se ha dado de alta el operador con éxito.', 'Editor de Operadores');
            }
        }
        $scope.viewCheckingAccount = function (id) {
            $state.go("app.investments.tradercheckingaccount", { businessPartnerAccountId: id });
        }

        load();
    }
    ])

    .controller('InvestmentsTraderCheckingAccountController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', '$log', ($scope, $translate, $state, $stateParams, Restangular, $log) => {
        var id = $stateParams.businessPartnerAccountId;
        $scope.accountId = id;

        function load() {
            if (id) {



                //TO DO
                Restangular.one('businesspartners').one('account', id).get().then(result => {
                    $scope.account = result;
                });
            }
        }

        load();
    }
    ])
    .directive('investmentsTradersGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'investmentsTradersGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre y Apellido', 'Cuentas', 'Saldo', 'Tenencias Valorizadas'];
                var colModel: Array<any> = [
                    {
                        name: 'editCommand',
                        index: 'editCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => { return '<i class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'personName', index: 'personNameContains', search: true },
                    { name: 'accounts', index: 'accountsContains', width: 190, fixed: true, search: true },
                    { name: 'Balance', index: 'balanceContains', width: 100, fixed: true, search: true },
                    { name: 'BalanceofPayments', index: 'balanceofPaymentsContains', width: 100, fixed: true, search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/investments/traders.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    jsonReader: {
                        page: obj => {
                            var page = (obj.offset / 100) + 1;
                            return page;
                        },
                        total: obj => {
                            var total = (obj.total <= 100) ? 1 : (((obj.total / 100) >> 0) + (obj.total % 100 > 0 ? 1 : 0));
                            return total;
                        },
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.investments.traderedit';
                            $state.go(stateName, {traderId: rowId });
                        }

                        return false;
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');
            }
        };
    });