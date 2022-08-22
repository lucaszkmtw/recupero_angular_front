angular.module('app.financials.ar.debtmanagement.productcategories', [])
    .config(($stateProvider) =>{
        $stateProvider
            .state('app.financials.ar.debtmanagement.productcategories',
            {
                url: '/productcategories',
                controller: 'FinancialsDebtManagementOrganismProductsController',
                templateUrl: 'app/financials/ar/debtmanagement/productcategories/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'findm.productcategories'
                }
            })
            .state('app.financials.ar.debtmanagement.productcategory',
            {
                url: '/productcategories/{Id}',
                controller: 'FinancialsDebtManagementOrganismProductController',
                templateUrl: 'app/financials/ar/debtmanagement/productcategories/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.debtmanagement.productcategories',
                    label: 'findm.productcategory'
                }
            });
    })
    .controller('FinancialsDebtManagementOrganismProductsController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.productcategory');
        }
    })
    .controller('FinancialsDebtManagementOrganismProductController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: any, $translate, $stateParams, $state, Restangular, toastr) => {
        
        var id = $stateParams.Id;
        // $scope.lookupOrganismType = 'ORG';
        $scope.businessPartnerTypeName = 'bp.types.organism';
        $scope.lookupProductType = '0' ; 
        $scope.productcategories = {
            products: []
        }

        function load() {

            if (id) {

                Restangular.one('catalog').one('productcategories', id).get().then(result => {
                    $scope.productcategories = result;
                    $scope.productcategories.products = result.products;
                });
            }
        }

            $scope.loadProducts= () => {
                
                if(id){
                    Restangular.one('catalog').one('productcategories', id).get().then(result => {
                    $scope.productcategories = result;
                    $scope.productcategories.products = result.products;
                        
                    });
                }
            }


            $scope.save = () => {
                if (id) {
                    $scope.productcategories.put().then(() => { $state.go('catalog.productcategories'); });
                    toastr.success('Se han modificado los Créditos para el Tipo de Crédito con éxito.', 'Editor de Créditos por Tipo de Crédito');
                } else {
                    Restangular.service('catalog/productcategories').post($scope.productcategories).then(() => { $state.go('app.financials.ar.debtmanagement.productcategories'); });
                    toastr.success('Se han dado de alta los Créditos para el Tipo de Crédito con éxito.', 'Alta de Créditos por Tipo de Crédito');
                }
            }

           
            //#region Tipo Credito/Producto
            $scope.addProduct = () => {

                Restangular.one('catalog').one('products', $scope.params.productId).get().then((product) => {
                    $scope.productcategories.products.push(product);                
                    $scope.params.productId = null;
                });
            };

            $scope.removeProduct = (item) => {
                var index = $scope.productcategories.products.indexOf(item);
                $scope.productcategories.products.splice(index, 1);
            }

            load();
        }])

    .directive('financialsArDebtManagementProductCategoriesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementProductCategoriesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                scope.height = scope.height || 450;
                var colNames = ['', 'Categoria', 'Concepto','CategoryId'];
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

                    { name: 'categoryName', index: 'categoryName', search: true },
                    { name: 'productName', index: 'productName', search: true },
                    { name: 'categoryId', index: 'categoryId', search: false, hidden: true }

                ];

                gridElement.jqGrid(
                    {
                    regional: 'es-ar',
                    url: API_HOST + '/api/catalog/productcategories.json?CategoryStatus=0&&ProductCategoryStatus=0',
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
                    loadBeforeSend: function (jqXHR) {
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
                            var stateName = 'app.financials.ar.debtmanagement.productcategory';
                            var rowData = gridElement.jqGrid('getRowData', rowId);
                            $state.go(stateName, { Id: rowData.categoryId });
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

