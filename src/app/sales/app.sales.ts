angular.module('app.sales', ['app.sales.businessdocuments', 'app.sales.stores'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.sales', {
                url: '/sales',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'sales'
                }
            })
            .state('app.sales.clients', {
                url: '/clients',
                controller: 'SalesClientsListController',
                templateUrl: 'app/sales/clients/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'sales.clients'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.clientnew', {
                url: '/clients/new',
                controller: 'SalesClientEditController',
                templateUrl: 'app/sales/clients/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.sales.clients',
                    label: 'sales.client.new'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.clientedit', {
                url: '/clients/{clientId}',
                controller: 'SalesClientEditController',
                templateUrl: 'app/sales/clients/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.sales.clients',
                    label: 'sales.client'
                },
                data: {
                    requiresLogin: true
                }
            })

            .state('app.sales.paymentconditions', {
                url: '/paymentconditions',
                controller: 'SalesPaymentConditionsListController',
                templateUrl: 'app/sales/paymentconditions/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'sales.paymentconditions'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.paymentconditionnew', {
                url: '/paymentconditions/new',
                controller: 'SalesPaymentConditionEditController',
                templateUrl: 'app/sales/paymentconditions/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask'),
                ncyBreadcrumb: {
                    parent: 'app.sales.paymentconditions',
                    label: 'sales.paymentcondition.new'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.paymentconditionedit', {
                url: '/paymentconditions/{paymentConditionId}',
                controller: 'SalesPaymentConditionEditController',
                templateUrl: 'app/sales/paymentconditions/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask'),
                ncyBreadcrumb: {
                    parent: 'app.sales.paymentconditions',
                    label: 'sales.paymentcondition'
                },
                data: {
                    requiresLogin: true
                }
            })

            .state('app.sales.productcatalogs', {
                url: '/productcatalogs',
                controller: 'SalesProductCatalogsListController',
                templateUrl: 'app/sales/productcatalogs/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'sales.productcatalogs'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.productcatalognew', {
                url: '/productcatalogs/new',
                controller: 'SalesProductCatalogEditController',
                templateUrl: 'app/sales/productcatalogs/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask'),
                ncyBreadcrumb: {
                    parent: 'app.sales.productcatalogs',
                    label: 'sales.productcatalog.new'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.productcatalogedit', {
                url: '/productcatalogs/{productcatalogId}',
                controller: 'SalesProductCatalogEditController',
                templateUrl: 'app/sales/productcatalogs/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask'),
                ncyBreadcrumb: {
                    parent: 'app.sales.productcatalogs',
                    label: 'sales.productcatalog'
                },
                data: {
                    requiresLogin: true
                }
            })

            .state('app.sales.productcomponents', {
                url: '/productcomponents',
                controller: 'SalesProductComponentsListController',
                templateUrl: 'app/sales/productcomponents/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'sales.productcomponents'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.productcomponentnew', {
                url: '/productcomponents/new',
                controller: 'SalesProductComponentEditController',
                templateUrl: 'app/sales/productcomponents/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask'),
                ncyBreadcrumb: {
                    parent: 'app.sales.productcomponents',
                    label: 'sales.productcomponent.new'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.productcomponentedit', {
                url: '/productcomponents/{productComponentId}',
                controller: 'SalesProductComponentEditController',
                templateUrl: 'app/sales/productcomponents/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask'),
                ncyBreadcrumb: {
                    parent: 'app.sales.productcomponents',
                    label: 'sales.productcomponent'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.checkingaccount', {
                url: '/checkingaccount/{businessPartnerAccountId}',
                controller: 'SalesCheckingAccountController',
                templateUrl: 'app/sales/clients/checkingaccount.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.sales.clients',
                    label: 'sales.checkingaccount'
                },
                data: {
                    requiresLogin: true
                }
            })
            ;
    }
    ])
    .controller('SalesClientsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.sales.clientnew');
        }
    }
    ])

    .controller('SalesClientEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {
        var id = $stateParams.clientId;

        function load() {
            if (id) {
                Restangular.one('sales').one('clients', id).get().then(result => {
                    $scope.client = result;
                });
            }
            else {
                $scope.client = {
                    businessPartner: {
                        typeId: 1
                    }
                };
            }
        }

        $scope.delete = () => {
            $scope.client.remove().then(() => {
                toastr.success('Se ha dado de baja el cliente con éxito.', 'Editor de clientes');
                $state.go('app.sales.clients');
            }, () => {
                toastr.error('Se produjo un error al dar de baja el cliente.', 'Editor de clientes');
            });
        }

        $scope.save = () => {
            if (id) {
                $scope.client.put().then(() => { $state.go('app.sales.clients'); });
            } else {
                Restangular.service('sales/clients').post($scope.client).then(() => { $state.go('app.sales.clients'); });
            }
        }

        $scope.$on("viewCheckingAccount", (event, id) => {
            $state.go("app.sales.checkingaccount", { businessPartnerAccountId: id });
        });

        load();
    }
    ])

    .controller('SalesPaymentConditionsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.sales.paymentconditionnew');
        }
    }
    ])
    .controller('SalesPaymentConditionEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', ($scope, $translate, $state, $stateParams, Restangular) => {
        var id = $stateParams.paymentConditionId;

        function load() {
            if (id) {
                Restangular.one('sales').one('paymentconditions', id).get().then(result => {
                    $scope.paymentcondition = result;
                });
            }
            else {
                $scope.paymentcondition = {};
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.paymentcondition.put().then(() => { $state.go('app.sales.paymentconditions'); });
            } else {
                Restangular.service('sales/paymentconditions').post($scope.paymentcondition).then(() => { $state.go('app.sales.paymentconditions'); });
            }
        }

        load();
    }
    ])

    .controller('SalesProductCatalogsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.sales.productcatalognew');
        }
    }
    ])
    .controller('SalesProductCatalogEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', ($scope, $translate, $state, $stateParams, Restangular) => {
        var id = $stateParams.productCatalogId;

        function load() {
            if (id) {
                Restangular.one('sales').one('productcatalogs', id).get().then(result => {
                    $scope.productcatalog = result;
                });
            }
            else {
                $scope.productcatalog = {};
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.productcatalog.put().then(() => { $state.go('app.sales.productcatalogs'); });
            } else {
                Restangular.service('sales/productcatalogs').post($scope.productcatalog).then(() => { $state.go('app.sales.productcatalogs'); });
            }
        }

        load();
    }
    ])

    .controller('SalesProductComponentsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.sales.productcomponentnew');
        }
    }
    ])
    .controller('SalesProductComponentEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', ($scope, $translate, $state, $stateParams, Restangular) => {
        var id = $stateParams.productComponentId;

        function load() {
            if (id) {
                Restangular.one('sales').one('productcomponents', id).get().then(result => {
                    $scope.productcomponent = result;
                });
            }
            else {
                $scope.productcomponent = {};
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.productcomponent.put().then(() => { $state.go('app.sales.productcomponents'); });
            } else {
                Restangular.service('sales/productcomponents').post($scope.productcomponent).then(() => { $state.go('app.sales.productcomponents'); });
            }
        }

        load();
    }
    ])
    .controller('SalesCheckingAccountController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular','$log', ($scope, $translate, $state, $stateParams, Restangular, $log) => {
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
    .directive('salesProductComponentsGrid', ($state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'salesProductComponentsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Cantidad', 'Ventas Catálogo Producto', 'Producto'];
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
                    { name: 'quantity', index: 'quantity', search: false },
                    { name: 'salesProductCatalogName', index: 'salesProductCatalogName', search: true },
                    { name: 'productCatalogId', index: 'productCatalogId', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/sales/productcomponents.json',
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
                            var stateName = 'app.sales.productcomponentedit';
                            $state.go(stateName, { productComponentId: rowId });
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

    .directive('salesProductCatalogsGrid', ($state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'salesProductCatalogsGrid';
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
                    { name: 'name', index: 'name', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/sales/productcatalogs.json',
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
                            var stateName = 'app.sales.productcatalogedit';
                            $state.go(stateName, { productCatalogId: rowId });
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

    .directive('salesPaymentConditionsGrid', ($state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'salesPaymentConditionsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre', 'Producto'];
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
                    { name: 'name', index: 'name', search: true },
                    { name: 'salesProductCatalogName', index: 'salesProductCatalogName', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/sales/paymentconditions.json',
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
                            var stateName = 'app.sales.paymentconditionedit';
                            $state.go(stateName, { paymentConditionId: rowId });
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
