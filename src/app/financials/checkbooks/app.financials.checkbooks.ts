angular.module('app.financials.checkbooks', ['app.financials'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.checkbooks',
            {
                url: '/checkbooks',
                controller: 'FinancialsCheckBooksListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/checkbooks/list.html',
                ncyBreadcrumb: {
                    label: 'financials.checkbooks'
                }
            })
            .state('app.financials.checkbooknew',
            {
                url: '/checkbooks/new',
                controller: 'FinancialsCheckBookEditController',
                templateUrl: 'app/financials/checkbooks/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.checkbooks',
                    label: 'financials.checkbook.new'
                }
            })
            .state('app.financials.checkbookedit',
            {
                url: '/checkbooks/{checkBookId}',
                controller: 'FinancialsCheckBookEditController',
                templateUrl: 'app/financials/checkbooks/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.checkbooks',
                    label: 'financials.checkbook'
                }
            });
    })
    .controller('FinancialsCheckBooksListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.checkbooknew');
        }
    })
    .controller('FinancialsCheckBookEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.id;

        function load() {
            if (id) {
                Restangular.one('financials').one('checkbooks', id).get().then(result => {
                    var checkbook = result;
                    $scope.checkbook = checkbook;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.checkbook.put().then(() => { $state.go('app.financials.checkbooks'); });
            } else {
                Restangular.service('financials/checkbooks').post($scope.checkbook).then(() => { $state.go('app.financials.checkbooks'); });
            }
        }

        load();
    })
    .directive('financialsCheckBooksGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsCheckBooksGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre', 'Cuenta Bancaria', 'Nro Desde', 'Nro Hasta', 'Próximo'];
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
                    { name: 'name', index: 'name', search: false },
                    { name: 'bankAccountCode', index: 'bankAccountCode', search: false },
                    { name: 'fromNumber', index: 'fromNumber', search: false },
                    { name: 'toNumber', index: 'toNumber', search: false },
                    { name: 'nextNumber', index: 'nextNumber', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/financials/checkbooks.json',
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
                            var stateName = 'app.financials.checkbookedit';
                            $state.go(stateName, { checkBookId: rowId });
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
