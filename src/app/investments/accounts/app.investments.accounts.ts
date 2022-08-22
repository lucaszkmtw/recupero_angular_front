angular.module('app.investments.accounts', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.accounts', {
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: true
                }
              
            })


            .state('app.investments.accounts.list', {
                url: '/accounts',
                controller: 'InvestmentAccountsListController',
                templateUrl: 'app/investments/accounts/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.investments',
                    label: 'investmentaccounts'
                }
            })
            .state('app.investments.accounts.new', {
                url: '/accounts/new',
                controller: 'InvestmentAccountsNewController',
                templateUrl: 'app/investments/accounts/new.html',
                resolve: loadSequence('icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments',
                    label: 'investmentaccounts.new'
                }
            })
            .state('app.investments.accounts.edit', {
                url: '/accounts/{accountId}',
                controller: 'InvestmentAccountsEditController',
                templateUrl: 'app/investments/accounts/new.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.accounts.list',
                    label: 'investmentaccounts.viewDetail'
                }
            })
            .state('app.investments.accounts.view', {
                url: '/accounts/{accountId}',
                controller: 'InvestmentAccountsDetailController',
                templateUrl: 'app/investments/accounts/detailsaccount.html',
                resolve: loadSequence('icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.accounts.list',
                    label: 'investmentaccounts.viewDetail'
                }
            })
            ;

    }])
    .factory('InvestmentaccountService', [() => {
        var investmentAccountTypes: Array<IHasIdAndName> = [
            { id: 1, name: 'investmentAccountType.inversor' },
            { id: 2, name: 'investmentAccountType.custodia' }
        ];

        return {
            investmentAccountTypes: investmentAccountTypes,
            getInvestmentAccountTypeName: (id: number) => {
                var investmentAccountType: IHasIdAndName = _.find(investmentAccountTypes, { id: id });
                return investmentAccountType.name;
            },

        }
    }])
    .controller('InvestmentAccountsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.investments.accounts.new');
        }    
    }
    ])
    .controller('InvestmentAccountsNewController', ['$log', '$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', 'dialogs', ($log, $scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {
        var id = $stateParams.accountId;
        $scope.type = 0;
        
        $scope.account = {
            balance: 0,
        };
        
        $scope.loadInvestorCommission = () => {
            Restangular.one('investments').one('investors', $scope.account.investorId).get().then(result => {
                $scope.account.investorAssignment = result.commission;
            });
        }

        $scope.loadTraderCommission = () => {
            Restangular.one('investments').one('traders', $scope.account.traderId).get().then(result => {
                $scope.account.traderAssignment = result.commission;
            });
        }

        $scope.loadManagerCommission = () => {
            Restangular.one('investments').one('managers', $scope.account.managerId).get().then(result => {
                $scope.account.managerAssignment = result.commission;
            });
        }

        $scope.loadCustodianCommission = () => {
            Restangular.one('investments').one('custodians', $scope.account.custodianId).get().then(result => {
                $scope.account.custodianAssignment = result.commission;
            });
        }

        $scope.save = () => {
            $scope.account.type = $scope.type;
            $scope.account.currencyId = $scope.account.currency.id;
            $scope.account.prefix = $scope.account.partnerAccount.code;
            if (id) {
                $scope.account.put().then(() => { $state.go('app.investments.accounts.list'); });
                toastr.success('Se ha modificado la cuenta con éxito.', 'Editor de Cuentas');
            } else {
                Restangular.service('investments/accounts').post($scope.account).then(() => { $state.go('app.investments.accounts.list'); });
                toastr.success('Se ha dado de alta la cuenta con éxito.', 'Editor de Cuentas');
            }
        }
    }])
    .controller('InvestmentAccountsEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {
        var id = $stateParams.accountId;
        $scope.accountId = id;
        
        $scope.asset = () => {
            $state.go('app.investments.assets.new', { accountId: $scope.accountId  });
        }    
        function load() {
            if (id) {

                Restangular.one('investments').one('accounts', id).get().then(result => {
                    $scope.type = result.partnerAccount.type;
                    $scope.account = result;
                });
                
            } 
        }

        load();
        $scope.save = () => {
            $scope.account.type = $scope.type;
            $scope.account.currencyId = $scope.account.currency.id;
            $scope.account.prefix = $scope.account.partnerAccount.code;
            if (id) {
                $scope.account.put().then(() => { $state.go('app.investments.accounts.list'); });
                toastr.success('Se ha modificado la cuenta con éxito.', 'Editor de Cuentas');
            }
        }
    }
    ])

    .controller('InvestmentAccountsDetailController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {

        var id = $stateParams.accountId;
        $scope.accountId = id;

        function load() {
            if (id) {

                //TO DO
                //Restangular.one('investmentaccount').one('account', id).get().then(result => {
                //    $scope.account = result;
                //});
            }
        }

        load();
    }
    ])
    .directive('investmentsAccountsGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {

                function documentTypeFormatter(cellvalue, options, rowObject) {
                    var id = parseInt(cellvalue);
                    if (id == 0){
                        cellvalue = 'Inversión';
                    }else{
                        cellvalue = 'Custodia';
                    }
                    return cellvalue;
                }

                function documentPercentageFormatter(cellvalue, options, rowObject) {
                    cellvalue = cellvalue + ' %';
                    return cellvalue;
                }

                var gridElementName = 'investmentsAccountsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Titular','Tipo','Cuenta','Moneda','Interes', 'Trader','Comisión', 'Custodio','Comisión', 'Manager','Comisión'];
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
                    { name: 'investorPersonName', index: 'investorPersonNameContains', width: 125, fixed: true, search: true },
                    { name: 'businessPartnerAccountType', index: 'businessPartnerAccountTypeContains', formatter: documentTypeFormatter, width: 70, fixed: true, search: true },
                    { name: 'businessPartnerAccountCode', index: 'businessPartnerAccountCodeContains', width: 70, fixed: true, search: true },
                    { name: 'currencySymbol', index: 'currencySymbolContains', width: 50, fixed: true, search: true },
                    { name: 'investorAssignment', index: 'investorAssignmentContains',formatter: documentPercentageFormatter, width: 60, fixed: true, search: true },
                    { name: 'traderPersonName', index: 'traderPersonNameContains', width: 125, fixed: true, search: true },
                    { name: 'traderAssignment', index: 'traderAssignmentContains', formatter: documentPercentageFormatter, width: 60, fixed: true, search: true },
                    { name: 'custodianPersonName', index: 'custodianPersonNameContains', width: 125, fixed: true, search: true },
                    { name: 'custodianAssignment', index: 'custodianAssignmentContains', formatter: documentPercentageFormatter, width: 60, fixed: true, search: true },
                    { name: 'managerPersonName', index: 'managerPersonNameContains', width: 125, fixed: true, search: true },
                    { name: 'managerAssignment', index: 'managerAssignmentContains', formatter: documentPercentageFormatter, width: 60, search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/investments/accounts.json',
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
                            var stateName = 'app.investments.accounts.edit';
                            $state.go(stateName, {accountId: rowId });
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