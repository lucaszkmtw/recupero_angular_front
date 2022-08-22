angular.module('app.investments.myaccounts', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.myaccounts', {
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'myinvestmentsaccounts'
                }
            })
            .state('app.investments.myaccounts.list', {
                url: '/myaccounts',
                controller: 'InvestmentMyAccountsListController',
                templateUrl: 'app/investments/myaccounts/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    label: 'investmentmyaccounts.list'
                }
            })
            .state('app.investments.myaccounts.monetary', {
                url: '/myaccounts/monetary/{accountId}',
                controller: 'InvestmentsMyAccountsMonetaryAccountController',
                templateUrl: 'app/investments/myaccounts/monetaryaccount.html',
                resolve: loadSequence('icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.myaccounts.list',
                    label: 'investmentaccounts.viewDetail'
                }
            })
            .state('app.investments.myaccounts.custody', {
                url: '/myaccounts/custody/{accountId}',
                controller: 'InvestmentsMyAccountsCustodyAccountController',
                templateUrl: 'app/investments/myaccounts/custodyaccount.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.myaccounts.list',
                    label: 'investmentaccounts.viewDetail'
                }
            })
            .state('app.investments.myaccounts.custodyasset', {
                url: '/myaccounts/custody/{accountId}/assets/{assetId}',
                controller: 'InvestmentsMyAccountsCustodyAccountAssetController',
                templateUrl: 'app/investments/myaccounts/custodyaccountasset.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.myaccounts.custody',
                    label: 'investmentaccounts.viewDetail'
                }
            });
    }])
    .controller('InvestmentMyAccountsListController', ['$scope', '$translate', '$state', '$stateParams', 'toastr', 'InvestmentaccountService', ($scope, $translate, $state, $stateParams, toastr, InvestmentaccountService) => {
        $scope.investmentaccountService = InvestmentaccountService;

        $scope.view = (id, typeId) => {
            var selectedAccountType = _.find(InvestmentaccountService.investmentAccountTypes, { id: typeId });

            switch (selectedAccountType) {
                case InvestmentaccountService.investmentAccountTypes[0]:
                    {
                        $state.go('app.investments.myaccounts.monetary', { "accountId": id });
                        break;
                    }
                case InvestmentaccountService.investmentAccountTypes[1]:
                    {
                        $state.go('app.investments.myaccounts.custody', { "accountId": id });
                        break;
                    }
                default: {
                    toastr.error('Se produjo un error al buscar la cuenta.', 'Mis cuentas');
                    break;
                }
            }
        }

        function load() {
            $scope.myaccounts = {
                accounts: {
                    items:
                    [{
                        balance: 511895.9579,
                        id: 149,
                        typeId: 1,
                        businessPartnerId: 152,
                        currencyId: 1,
                        tags: "30715455/1",
                        code: "1",
                        name: "Cuenta Inversion",
                        createdById: 1,
                        createDate: "2017-03-15T22:00:57.9600000Z",
                        guid: "81e26bc4d5474106b0e113aff98b1cf9"
                    },
                    {
                        balance: 571594.9579,
                        id: 150,
                        typeId: 2,
                        tags: "30715455/1",
                        businessPartnerId: 152,
                        currencyId: 2,
                        code: "1",
                        name: "Cuenta Custodia",
                        createdById: 1,
                        createDate: "2017-03-15T22:00:57.9600000Z",
                        guid: "81e26bc4d5474106b0e113aff98b1cf9"
                    }],
                    currencies: [
                        { id: 1, name: "Pesos Argentinos", symbol: "AR$" },
                        { id: 2, name: "Dolares", symbol: "U$D" }]
                },
            };
        }

        load();
    }
    ])
    .controller('InvestmentsMyAccountsMonetaryAccountController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', 'dialogs', ($scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {
        var id = $stateParams.accountId;
        $scope.accountId = id;
        function load() {
            if (id) {
                $scope.myaccounts = {
                    investmentaccount: {
                        id: 1,
                        personId: 123,
                        personName: 'Sebastian Vigliola',
                        typeId: 1,
                        accountName: 'Cuenta Inversion #01',
                        currencyIdcurrencies: [{ id: 1, name: "Pesos Argentinos", symbol: "AR$" }],
                        custodianId: 123,
                        managerId: 123

                    }
                };

                //TO DO
                //Restangular.one('investmentaccount').one('myaccount', id).get().then(result => {
                //    $scope.myaccounts = result;
                //});
            }
        }

        load();

    }
    ])
    .controller('InvestmentsMyAccountsCustodyAccountController', ['$log', '$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', 'dialogs', ($log, $scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {
        var id = $stateParams.accountId;
        $scope.accountId = id;

        $log.info('Cuenta: ' + $scope.accountId);

        function load() {
            if (id) {
                $scope.accountDetails = {
                    account: {
                        balance: 571594.9579,
                        id: 150,
                        typeId: 2,
                        tags: "30715455/1",
                        businessPartnerId: 152,
                        currencyId: 2,
                        code: "1",
                        name: "Cuenta Custodia",
                        createdById: 1,
                        createDate: "2017-03-15T22:00:57.9600000Z",
                        guid: "81e26bc4d5474106b0e113aff98b1cf9"
                    },
                    currencies: [
                        { id: 1, name: "Pesos Argentinos", symbol: "AR$" },
                        { id: 2, name: "Dolares", symbol: "U$D" }]
                };
            }
        }

        load();
    }
    ])
    .controller('InvestmentsMyAccountsCustodyAccountAssetController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', 'dialogs', ($scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {
        var accountId = $stateParams.accountId;
        var id = $stateParams.assetId;
    }])
    .directive('investmentsMyAccountsCustodyAccountAssetsGrid', ($state, Restangular, $log, $filter) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                $log.info(scope.accountId);
                var gridElementName = 'investmentsMyAccountsCustodyAccountAssetsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 340;

                //TODO
                scope.detailId = scope.detailId || 153;


                function currencyFormatter(cellvalue, options, rowObject) {
                    var value = parseFloat(cellvalue);
                    var content = $filter('currency')(value)
                    if (value < 0) {
                        content = '<span style="color:red">' + content + '</span>'
                    }
                    return content;
                }

                var colNames = ['Cedente', 'Nro Ch', 'Firmante', 'Fe. Operacion', 'Fe. Acreditacion', 'Capitales colocados', 'Ints', 'A Cobrar', 'Dias a deposito'];
                var colModel: Array<any> = [

                    { name: 'cedente', index: 'cedente', search: true, fixed: true, sortable: true },
                    { name: 'nroCh', index: 'nroCh', fixed: true, search: true, sortable: true },
                    { name: 'firmante', index: 'firmante', fixed: true, search: true, sortable: true },
                    { name: 'fechaOperacion', index: 'fechaOperacion', fixed: true, search: true, formatter: 'date', sortable: true },
                    { name: 'fechaAcreditacion', index: 'fechaAcreditacion', fixed: true, search: true, formatter: 'date', sortable: true },
                    { name: 'capitalesColocados', index: 'capitalesColocados', fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: true },
                    { name: 'ints', index: 'ints', fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: true },
                    { name: 'acobrar', index: 'acobrar', fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: true },
                    { name: 'diasDeposito', index: 'diasDeposito', fixed: true, search: true, align: 'right', sortable: true }

                ];


                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/app/investments/api/investments/custodiandetails/' + scope.detailId + '/entries.json',
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
                    //rowNum: 100,
                    loadonce: true,

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
                        //gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },

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
    })
    .directive('investmentsMyAccountsCustodyAccountsGrid', ($state, $filter, Restangular, dialogs) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', accountId: '@' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'investmentsMyAccountsCustodyAccountsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                function currencyFormatter(cellvalue, options, rowObject) {
                    var value = parseFloat(cellvalue);
                    return $filter('currency')(value);
                }

                var colNames = ['', 'Especie', 'Cantidad', 'Precio', 'Valuacion', 'Costo', 'Rentabilidad', 'Duration'];
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
                    { name: 'specie', index: 'specieContains', width: 60, search: true },
                    { name: 'count', index: 'countContains', width: 100, search: true },
                    { name: 'price', index: 'priceContains', formatter: currencyFormatter, width: 100, search: true },
                    { name: 'valuation', index: 'valuationContains', formatter: currencyFormatter, width: 100, search: true },
                    { name: 'cost', index: 'costContains', formatter: currencyFormatter, width: 100, search: true },
                    { name: 'profitability', index: 'profitabilityContains', width: 100, search: true },
                    { name: 'duration', index: 'durationContains', width: 100, fixed: true, search: true }
                ];


                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/app/investments/api/investments/investmentcustodianaccount.json',
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
                            $state.go('app.investments.myaccounts.custodyasset', { accountId: scope.accountId, assetId: rowId });
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
