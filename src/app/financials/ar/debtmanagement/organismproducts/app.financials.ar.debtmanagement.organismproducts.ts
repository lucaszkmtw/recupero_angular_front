angular.module('app.financials.ar.debtmanagement.organismproducts', [])
    .config(($stateProvider) =>{
        $stateProvider
            .state('app.financials.ar.debtmanagement.organismproducts',
            {
                url: '/organismproducts',
                controller: 'FinancialsDebtManagementOrganismProductsController',
                templateUrl: 'app/financials/ar/debtmanagement/organismproducts/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'findm.organismproducts'
                }
            })
            .state('app.financials.ar.debtmanagement.organismproduct',
            {
                url: '/organismproducts/{Id}',
                controller: 'FinancialsDebtManagementOrganismProductController',
                templateUrl: 'app/financials/ar/debtmanagement/organismproducts/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.debtmanagement.organismproducts',
                    label: 'findm.organismproduct'
                }
            });
    })
    .controller('FinancialsDebtManagementOrganismProductsController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.organismproduct');
        }
    })
    .controller('FinancialsDebtManagementOrganismProductController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: any, $translate, $stateParams, $state, Restangular, toastr) => {
        
        var id = $stateParams.Id;
        // $scope.lookupOrganismType = 'ORG';
        $scope.businessPartnerTypeName = 'bp.types.organism';
        $scope.lookupProductType = '0' ; 
        $scope.organismproducts = {
            products: []
        }

        function load() {

            if (id) {

                Restangular.one('financials').one('debtmanagement').one('organismproducts', id).get().then(result => {
                    $scope.organismproducts = result;
                    $scope.organismproducts.products = result.products;
                });
            }
        }

            $scope.loadProducts= () => {
                alert(id);
                if(id){
                    Restangular.one('financials').one('debtmanagement').one('organismproducts', id).get().then(result => {
                    $scope.organismproducts = result;
                    $scope.organismproducts.products = result.products;
                        
                    });
                }
            }


            $scope.save = () => {
                if (id) {
                    $scope.organismproducts.put().then(() => { $state.go('app.financials.ar.debtmanagement.organismproducts'); });
                    toastr.success('Se ha modificado el organismo con éxito.', 'Editor de organismo');
                } else {
                    Restangular.service('financials/debtmanagement/organismproducts').post($scope.organismproducts).then(() => { $state.go('app.financials.ar.debtmanagement.organismproducts'); });
                    toastr.success('Se ha dado de alta el organismo con éxito.', 'Alta de organismo');
                }
            }

           
            //#region Tipo Credito/Producto
            $scope.addProduct = () => {
                //alert('pasa');
                //alert($scope.params.productId);
                
                Restangular.one('catalog').one('categories', $scope.params.productId).get().then((product) => {
                    //alert('pasa1');
                    $scope.organismproducts.products.push(product);                
                    $scope.params.productId = null;
                });
            };

            $scope.removeProduct = (item) => {
                var index = $scope.organismproducts.products.indexOf(item);
                $scope.organismproducts.products.splice(index, 1);
            }

            load();
        }])

    .directive('financialsArDebtManagementOrganismProductsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementOrganismProductGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                scope.height = scope.height || 450;
                var colNames = ['', 'Organismo', 'Tipo Crédito','OrganismoId'];
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
                    { name: 'productName', index: 'productName', search: true },
                    { name: 'organismId', index: 'organismId', search: false, hidden: true }

                ];

                gridElement.jqGrid(
                    {
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/debtmanagement/organismproducts.json?OrganismStatus=0&&OrganismProductStatus=0',
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
                            var stateName = 'app.financials.ar.debtmanagement.organismproduct';
                            var rowData = gridElement.jqGrid('getRowData', rowId);
                            $state.go(stateName, { Id: rowData.organismId });
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

