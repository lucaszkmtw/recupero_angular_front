angular.module('app.investments.investors',[])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.investors', {
                url: '/investors',
                controller: 'InvestmentsInvestorsListController',
                templateUrl: 'app/investments/investors/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'investments.investors'
                }
            })
            .state('app.investments.investor', {
                url: '/investors/new',
                controller: 'InvestmentsinvestorEditController',
                templateUrl: 'app/investments/investors/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.investors',
                    label: 'investments.investor.new'
                }
            })
            .state('app.investments.investoredit', {
                url: '/investors/{investorId}',
                controller: 'InvestmentsinvestorEditController',
                templateUrl: 'app/investments/investors/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.investors',
                    label: 'investments.investor'
                }
            })
            .state('app.investments.investorcheckingaccount', {
                url: '/checkingaccount/{businessPartnerAccountId}',
                controller: 'InvestmentsInvestorCheckingAccountController',
                templateUrl: 'app/investments/investors/checkingaccount.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.investments.investors',
                    label: 'investments.investors.checkingaccount'
                }
            })
            ;

    }
    ])
    .controller('InvestmentsInvestorsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.investments.investor');
        }
    }
    ])
    .controller('InvestmentsinvestorEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {
        var id = $stateParams.investorId;

        function load() {
            if (id) {
                Restangular.one('investments').one('investors', id).get().then(result => {
                    $scope.investor = result;
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
                        $scope.investor.remove().then(() => {
                            toastr.success('Se ha dado de baja el inversor con éxito.', 'Editor de Inversores');
                            $state.go('app.investments.investors');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el inversor.', 'Editor de Inversores');
                        });
                    });
                    }
            });
        }

        $scope.save = () => {
            if (id) {
                $scope.investor.put().then(() => { $state.go('app.investments.investors'); });
            } else {
                Restangular.service('investments/investors').post($scope.investor).then(() => { $state.go('app.investments.investors'); });
                toastr.success('Se ha dado de alta el inversor con éxito.', 'Editor de Inversores');
            }
        }
        $scope.viewCheckingAccount = function (id) {
            $state.go("app.investments.investorcheckingaccount", { businessPartnerAccountId: id });
        }

        load();
    }
    ])

    .controller('InvestmentsInvestorCheckingAccountController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', '$log', ($scope, $translate, $state, $stateParams, Restangular, $log) => {
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
    .directive('investmentsInvestorsGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'investmentsInvestorsGrid';
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
                    url: API_HOST + '/api/investments/investors.json',
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
                            var stateName = 'app.investments.investoredit';
                            $state.go(stateName, {investorId: rowId });
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