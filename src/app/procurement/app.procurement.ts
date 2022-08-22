angular.module('app.procurement', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.procurement', {
                url: '/procurement',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'procurement'
                }
            })
            .state('app.procurement.vendors', {
                url: '/vendors',
                controller: 'ProcurementVendorsListController',
                templateUrl: 'app/procurement/vendors/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'procurement.vendors'
                }
            })
            .state('app.procurement.vendornew', {
                url: '/vendors/new',
                controller: 'ProcurementVendorEditController',
                templateUrl: 'app/procurement/vendors/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.vendors',
                    label: 'procurement.vendor.new'
                }
            })
            .state('app.procurement.vendoredit', {
                url: '/vendors/{vendorId}',
                controller: 'ProcurementVendorEditController',
                templateUrl: 'app/procurement/vendors/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.vendors',
                    label: 'procurement.vendor'
                }
            })
            .state('app.procurement.checkingaccount', {
                url: '/checkingaccount/{businessPartnerAccountId}',
                controller: 'ProcurementCheckingAccountController',
                templateUrl: 'app/procurement/vendors/checkingaccount.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.vendors',
                    label: 'procurement.checkingaccount'
                }
            });
    }
    ])
    .controller('ProcurementVendorsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.app.title = $translate.instant('procurement.vendor');

        $scope.new = () => {
            $state.go('app.procurement.vendornew');
        }
    }
    ])
    .controller('ProcurementCheckingAccountController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', '$log', ($scope, $translate, $state, $stateParams, Restangular, $log) => {
        var id = $stateParams.businessPartnerAccountId;
        $scope.accountId = id;

        function load() {
            if (id) {
                Restangular.one('businesspartners').one('account', id).get().then(result => {
                    $scope.account = result;
                });
            }
        }

        load();
    }
    ])
    .directive('procurementVendorsGrid', ($state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'procurementVendorsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre', 'CUIT'];
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
                    { name: 'personCode', index: 'personCodeContains', width: 120, fixed: true, search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/procurement/vendors.json',
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
                            var stateName = 'app.procurement.vendoredit';
                            $state.go(stateName, { vendorId: rowId });
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
    })
    .controller('ProcurementVendorEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {

        var id = $stateParams.vendorId;

        function load() {
            if (id) {
                Restangular.one('procurement').one('vendors', id).get().then(result => {
                    $scope.vendor = result;
                });
            }
            else {
                $scope.vendor = {
                    businessPartner: {
                        typeId: 2
                    }
                };
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.vendor.put().then(() => {
                    toastr.success('Se ha dado de alta el proveedor con éxito.', 'Editor de proveedores');
                    $state.go('app.procurement.vendors');
                }, () => {
                    toastr.error('Se produjo un error al dar de alta el proveedor.', 'Editor de proveedores');
                });
            } else {
                Restangular.service('procurement/vendors').post($scope.vendor).then(() => {
                    toastr.success('Se ha actualizado el proveedor con éxito.', 'Editor de proveedores');
                    $state.go('app.procurement.vendors');
                }, () => {
                    toastr.error('Se produjo un error al actualizar el proveedor.', 'Editor de proveedores');
                });
            }
        }

        $scope.delete = () => {
            $scope.vendor.remove().then(() => {
                toastr.success('Se ha dado de baja el proveedor con éxito.', 'Editor de proveedores');
                $state.go('app.procurement.vendors');
            }, () => {
                toastr.error('Se produjo un error al dar de baja el proveedor.', 'Editor de proveedores');
            });
        }

        $scope.$on("viewCheckingAccount", (event, id) => {
            $state.go("app.procurement.checkingaccount", { businessPartnerAccountId: id });
        });

        load();
    }
    ]);
