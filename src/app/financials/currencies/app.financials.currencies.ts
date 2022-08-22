angular.module('app.financials.currencies', ['app.financials'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.currencies',
            {
                url: '/currencies',
                controller: 'FinancialsCurrenciesListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/currencies/list.html',
                ncyBreadcrumb: {
                    label: 'financials.currencies'
                }
            })
            .state('app.financials.currencynew',
            {
                url: '/currencies/new',
                controller: 'FinancialsCurrencyEditController',
                templateUrl: 'app/financials/currencies/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.currencies',
                    label: 'financials.currency.new'
                }
            })
            .state('app.financials.currencyedit',
            {
                url: '/currencies/{currencyId}',
                controller: 'FinancialsCurrencyEditController',
                templateUrl: 'app/financials/currencies/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.currencies',
                    label: 'financials.currency.edit'
                }
            });
    })
    .controller('FinancialsCurrenciesListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.currencynew');
        }
    })
    .controller('FinancialsCurrencyEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.currencyId;

        function load() {
            if (id) {
                Restangular.one('financials').one('currencies', id).get().then(result => {
                    var currency = result;
                    $scope.currency = currency;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.currency.put().then(() => { $state.go('app.financials.currencies'); });
            } else {
                Restangular.service('financials/currencies').post($scope.currency).then(() => { $state.go('app.financials.currencies'); });
            }
        }

        load();
    })
.directive('financialsCurrenciesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsCurrenciesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Símbolo', 'Nombre'];
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
                    { name: 'symbol', index: 'symbol', search: false },
                    { name: 'name', index: 'name', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/financials/currencies.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    formatter: {
                        bool: (j) => { return j ? 'Sí' : 'No' }
                    },
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
                            var stateName = 'app.financials.currencyedit';
                            $state.go(stateName, { currencyId: rowId });
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
