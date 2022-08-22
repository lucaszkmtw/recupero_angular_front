angular
    .module('app.inv.inventory', ['app.inv'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.inv.inventory', {
                url: '/inventory',
                controller: 'InventoryController',
                templateUrl: 'app/inv/inventory/index.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'inv.inventory'
                },
                parent: 'app.inv'
            })
            .state('app.inv.inventory.product', {
                url: '/inventoryproduct/{productId}',
                controller: 'InventoryProductController',
                templateUrl: 'app/inv/inventory/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'inv.inventory'
                },
                parent: 'app.inv'
            })
            .state('app.inv.inventory.product.site', {
                url: '/inventoryproductsite/{productId}/{siteId}',
                controller: 'InventoryProductSiteController',
                templateUrl: 'app/inv/inventory/productsite.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'inv.inventory'
                },
                parent: 'app.inv'
            })
    }])
    .controller('InventoryController', ['$log', '$scope', '$translate', '$state', ($log, $scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.app.title = $translate.instant('app.inv.inventory');
        
    }
    ])
    .controller('InventoryProductController', ['$log', '$scope', '$translate', '$state', '$stateParams', 'Restangular', ($log, $scope, $translate, $state, $stateParams, Restangular) => {
        
        $scope.productId = $stateParams.productId;
        $scope.product = {};
        
        function load() {
            
            Restangular.one('catalog').one('products', $stateParams.productId).get().then(result => {
                $scope.product = result;
            });
            
        }

        load()
    }
    ])
    .controller('InventoryProductSiteController', ['$log', '$scope', '$translate', '$state', '$stateParams', 'Restangular', ($log, $scope, $translate, $state, $stateParams, Restangular) => {
        $scope.productId = $stateParams.productId;
        $scope.siteId = $stateParams.siteId;
        $scope.product = {};
        $scope.site = {};

        function load() {

            Restangular.one('catalog').one('products', $stateParams.productId).get().then(result => {
                $scope.product = result;

                Restangular.one('inv').one('site', $scope.siteId).get().then(result => {
                    $scope.site = result;
                });
            });

        }

        load()
    }
    ])
    .directive('invInventoryGrid', ($state, $window, $compile, $log, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'inventoryGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    gridModel.colNames = ['', 'Producto', 'Q', 'Entradas', 'Salidas', 'Entradas', 'Salidas'],
                        gridModel.colModel = [
                            { name: 'editCommand', index: 'editCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                            { name: 'name', index: 'nameContains', search: true },
                            { name: 'q', index: 'q', search: false, format: 'number' },
                            { name: 'lastMonthReceipts', index: 'lastMonthReceipts', search: false, format: 'number' },
                            { name: 'lastMonthDeliveries', index: 'lastMonthDeliveries', search: false, format: 'number' },
                            { name: 'thisMonthReceipts', index: 'thisMonthReceipts', search: false, format: 'number' },
                            { name: 'thisMonthDeliveries', index: 'thisMonthDeliveries', search: false, format: 'number' }
                        ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    scope.height = scope.height || 450;
                    var gridModel = buildGridModel();
                    var url = '/api/inv/inventory.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        loadBeforeSend: function(jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    $state.go('app.inv.inventory.product', { productId: rowId });                                    
                                    break;
                            }

                            return false;
                        },
                        loadComplete: () => {
                            $compile(angular.element('#' + gridElementName))(scope);
                        },
                    });

                    gridElement.jqGrid('navGrid',
                        '#' + pagerElementName,
                        {
                            del: false,
                            add: false,
                            edit: false
                        },
                        {},
                        {},
                        {},
                        { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');

                    gridElement.jqGrid('setGroupHeaders', {
                        useColSpanStyle: false,
                        groupHeaders: [
                            { startColumnName: 'lastMonthReceipts', numberOfColumns: 2, titleText: 'Mes pasado' },
                            { startColumnName: 'thisMonthReceipts', numberOfColumns: 2, titleText: 'Este mes' }
                        ]
                    });
                }

                loadGrid();
                
            }
        };
    })
    .directive('invInventoryProductsGrid', ($state, $window, $compile, $log, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', productId: '='},
            link: (scope: any, element) => {
                var gridElementName = 'inventoryProductsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    gridModel.colNames = ['', 'Depósito', 'Cantidad'],
                        gridModel.colModel = [
                        { name: 'editCommand', index: 'editCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'name', index: 'name', search: false },
                        { name: 'quantity', index: 'quantity', search: false, format: 'number' }
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    scope.height = scope.height || 450;
                    var gridModel = buildGridModel();
                    var url = '/api/inv/inventoryproduct/' + scope.productId + '.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        loadBeforeSend: function(jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {                            
                        },
                        onCellSelect: (rowId, iCol) => {     
                            switch (iCol) {
                                case 0:
                                    //TODO: mostrar todos los movimientos con saldo incluido
                                    $state.go('app.inv.inventory.product.site', { siteId: rowId, productId: scope.productId });
                                    break;
                            }
                            return false;
                        },
                        loadComplete: () => {
                            $compile(angular.element('#' + gridElementName))(scope);
                        },
                    });

                }

                loadGrid();
                
            }
        };
    })
    .directive('invInventoryProductsSiteGrid', ($state, $window, $compile, $log, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', productId: '=', siteId: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'inventoryProductsSiteGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                /*function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }*/

                function personFormatter(cellvalue, options, rowObject) {
                    if(rowObject.shortName==='RME'){
                        return rowObject.issuerName;
                    }
                    else{
                        return rowObject.receiverName;
                    }
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    gridModel.colNames = ['Tipo', 'Remito Nro', 'Proveedor/Cliente', 'Cantidad', 'Fecha'],
                        gridModel.colModel = [
                            { name: 'shortName', index: 'shortName', search: false, width: 90, fixed: true, align: 'center' },
                            { name: 'number', index: 'number', search: false, width: 150, fixed: true, align: 'center' },
                            { name: 'person', index: 'person', search: false, formatter: personFormatter },
                            { name: 'quantity', index: 'quantity', search: false, format: 'number', width: 90, fixed: true, align: 'right' },
                            { name: 'documentDate', index: 'documentDate', search: false, width: 100, fixed: true, formatter: 'date' }
                        ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    scope.height = scope.height || 450;
                    var gridModel = buildGridModel();
                    var url = '/api/inv/inventoryproductsite/' + scope.productId + '/' + scope.siteId + '.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        loadBeforeSend: function(jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    break;
                            }
                            return false;
                        },
                        loadComplete: () => {
                            $compile(angular.element('#' + gridElementName))(scope);
                        },
                    });
                }

                loadGrid();

            }
        };
    })