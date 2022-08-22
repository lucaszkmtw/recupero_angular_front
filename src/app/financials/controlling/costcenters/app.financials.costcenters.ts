angular.module('app.financials.costcenters', [])
.config(($stateProvider) => {
    $stateProvider
        .state('app.financials.costcenters',
        {
            url: '/controlling/costcenters',
            controller: 'FinancialsControllingCostcenterListController',
            resolve: loadSequence('jqueryui', 'jqGrid'),
            templateUrl: 'app/financials/controlling/costcenters/list.html',
            ncyBreadcrumb: {
                label: 'financials.costcenters'
            }
        })
        .state('app.financials.costcenternew',
        {
            url: '/controlling/costcenters/new',
            controller: 'FinancialsControllingCostcenterEditController',
            templateUrl: 'app/financials/controlling/costcenters/edit.html',
            resolve: loadSequence( 'toastr'),
            ncyBreadcrumb: {
                parent: 'app.financials.costcenters',
                label: 'financials.costcenter.new'
            }
        })
        .state('app.financials.costcenteredit',
        {
            url: '/controlling/costcenters/{costcenterId}',
            controller: 'FinancialsControllingCostcenterEditController',
            templateUrl: 'app/financials/controlling/costcenters/edit.html',
            resolve: loadSequence( 'toastr'),
            ncyBreadcrumb: {
                parent: 'app.financials.costcenters',
                label: 'financials.costcenter'
            }
        });
})
.controller('FinancialsControllingCostcenterListController', ($scope, $translate, $state) => {
    $scope.params = {
        selectedItems: []
    };
    $scope.new = () => {
        $state.go('app.financials.costcenternew');
    }
})
.controller('FinancialsControllingCostcenterEditController', ($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

    var id = $stateParams.costcenterId;

    function load() {
        if (id) {
            ///api/financials/controlling/costcenters/1
            Restangular.one('financials').one('controlling').one('costcenters', id).get().then(result => {
                var costcenter = result;
                $scope.costcenter = costcenter;
            });
        }else{
            $scope.costcenter = {
            };
        }
    }

    $scope.save = () => {
        if (id) {
            $scope.costcenter.put().then(() => { $state.go('app.financials.costcenters'); });
        } else {
            Restangular.service('financials/controlling/costcenters').post($scope.costcenter).then(() => { $state.go('app.financials.costcenters'); });
        }
    }
    $scope.delete = () => {
        $scope.costcenter.remove().then(() => {
            toastr.success('Se ha dado de baja el Centro de COsto con éxito.', 'Editor de Centros de Costos');
            $state.go('app.financials.costcenters');
        }, () => {
            toastr.error('Se produjo un error al dar de baja el Centro de Costo', 'Editor de Centros de Costos');
        });
    }
    load();
})
.directive('financialsControllingCostcenterGrid', ($state, authManager) => {
    return {
        restrict: 'A',
        scope: { height: '@', selectedItems: '=' },
        link(scope: any, element, attrs, ctrl) {
            var gridElementName = 'financialsControllingCostcenterGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement = angular.element('<table></table>');
            gridElement.attr('id', gridElementName);
            var pagerElement = angular.element('<div></div>');
            pagerElement.attr('id', pagerElementName);
            element.append(gridElement);
            element.append(pagerElement);

            scope.height = scope.height || 450;

            var colNames = ['', 'Nombre'];
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
                { name: 'name', index: 'name', search: false }
               
            ];

            gridElement.jqGrid({
                regional: 'es-ar',
                url: API_HOST + '/api/financials/controlling/costcenters.json',
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
                        var stateName = 'app.financials.costcenteredit';
                        $state.go(stateName, { costcenterId: rowId });
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
