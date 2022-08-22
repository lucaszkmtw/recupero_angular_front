angular.module('app.financials.ar.debtmanagement.organismcategories', [])
    .config(($stateProvider) =>{
        $stateProvider
            .state('app.financials.ar.debtmanagement.organismcategories',
            {
                url: '/organismcategories',
                controller: 'FinancialsDebtManagementOrganismCategoriesController',
                templateUrl: 'app/financials/ar/debtmanagement/organismcategories/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'findm.organismcategories'
                }
            })
            .state('app.financials.ar.debtmanagement.organismcategory',
            {
                url: '/organismcategories/{Id}',
                controller: 'FinancialsDebtManagementOrganismCategoryController',
                templateUrl: 'app/financials/ar/debtmanagement/organismcategories/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.debtmanagement.organismcategories',
                    label: 'findm.organismcategory'
                }
            });
    })
    .controller('FinancialsDebtManagementOrganismCategoriesController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.organismcategory');
        }
    })
    .controller('FinancialsDebtManagementOrganismCategoryController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: any, $translate, $stateParams, $state, Restangular, toastr) => {
        
        var id = $stateParams.Id;
        // $scope.lookupOrganismType = 'ORG';
        $scope.businessPartnerTypeName = 'bp.types.organism';
        $scope.lookupCategoryType = '0' ; 
        $scope.organismcategories = {
            categories: []
        }

        function load() {

            if (id) {

                Restangular.one('financials').one('debtmanagement').one('organismcategories', id).get().then(result => {
                    $scope.organismcategories = result;
                    $scope.organismcategories.categories = result.categories;
                });
            }
        }

            $scope.loadCategories= () => {
                alert(id);
                if(id){
                    Restangular.one('financials').one('debtmanagement').one('organismcategories', id).get().then(result => {
                    $scope.organismcategories = result;
                    $scope.organismcategories.categories = result.categories;
                        
                    });
                }
            }


            $scope.save = () => {
                if (id) {
                    $scope.organismcategories.put().then(() => { $state.go('app.financials.ar.debtmanagement.organismcategories'); });
                    toastr.success('Se ha modificado el Tipo de Crédito para el organismo con éxito.', 'Editor de Tipo de Crédito por Organismo');
                } else {
                    Restangular.service('financials/debtmanagement/organismcategories').post($scope.organismcategories).then(() => { $state.go('app.financials.ar.debtmanagement.organismcategories'); });
                    toastr.success('Se ha dado de alta el Tipo de Crédito para el organismo con éxito.', 'Alta de ipo de Crédito por Organismo');
                }
            }

           
            //#region Tipo Credito/Category
            $scope.addCategory = () => {

                Restangular.one('catalog').one('categories', $scope.params.categoryId).get().then((category) => {
                    //alert('pasa1');
                    $scope.organismcategories.categories.push(category);                
                    $scope.params.categoryId = null;
                });
            };

            $scope.removeCategory = (item) => {
                var index = $scope.organismcategories.categories.indexOf(item);
                $scope.organismcategories.categories.splice(index, 1);
            }

            load();
        }])

    .directive('financialsArDebtManagementOrganismCategoriesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementOrganismCategoryGrid';
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
                    { name: 'categoryName', index: 'categoryName', search: true },
                    { name: 'organismId', index: 'organismId', search: false, hidden: true }

                ];

                gridElement.jqGrid(
                    {
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/debtmanagement/organismcategories.json?OrganismStatus=0&&OrganismCategoryStatus=0',
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
                            var stateName = 'app.financials.ar.debtmanagement.organismcategory';
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

