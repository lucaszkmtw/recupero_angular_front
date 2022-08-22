angular.module('app.financials.banks', ['app.financials'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.banks',
            {
                url: '/banks',
                controller: 'FinancialsBanksListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/banks/list.html',
                ncyBreadcrumb: {
                    label: 'financials.banks'
                }
            })
            .state('app.financials.banknew',
            {
                url: '/banks/new',
                controller: 'FinancialsBankEditController',
                templateUrl: 'app/financials/banks/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.banks',
                    label: 'financials.bank.new'
                }
            })
            .state('app.financials.bankedit',
            {
                url: '/banks/{bankId}',
                controller: 'FinancialsBankEditController',
                templateUrl: 'app/financials/banks/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.banks',
                    label: 'financials.bank.edit'
                }
            });
    })
    .controller('FinancialsBanksListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.banknew');
        }
    })
    .controller('FinancialsBankEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.bankId;

        function load() {
            if (id) {
                Restangular.one('financials').one('banks', id).get().then(result => {
                    var bank = result;
                    $scope.bank = bank;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.bank.put().then(() => { $state.go('app.financials.banks'); });
            } else {
                Restangular.service('financials/banks').post($scope.bank).then(() => { $state.go('app.financials.banks'); });
            }
        }

        load();
    })
    .directive('financialsBanksGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsBanksGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Código', 'Nombre'];
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
                    { name: 'code', index: 'code', search: false },
                    { name: 'name', index: 'name', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/banks.json',
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
                            var stateName = 'app.financials.bankedit';
                            $state.go(stateName, { bankId: rowId });
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
