angular.module('app.financials.ar.debtmanagement.organismcredittypes', [])
    .config(($stateProvider) =>{
        $stateProvider
            .state('app.financials.ar.debtmanagement.organismcredittypes',
            {
                url: '/organismcredittypes',
                controller: 'FinancialsDebtManagementOrganismCreditTypesController',
                templateUrl: 'app/financials/ar/debtmanagement/organismcredittypes/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'findm.organismcredittypes'
                }
            })
            .state('app.financials.ar.debtmanagement.organismcredittype',
            {
                url: '/organismcredittypes/{Id}',
                controller: 'FinancialsDebtManagementOrganismCreditTypeController',
                templateUrl: 'app/financials/ar/debtmanagement/organismcredittypes/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.debtmanagement.organismcredittypes',
                    label: 'findm.organismcredittype'
                }
            });
    })
    .controller('FinancialsDebtManagementOrganismCreditTypesController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.organismcredittype');
        }
    })
    .controller('FinancialsDebtManagementOrganismCreditTypeController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: any, $translate, $stateParams, $state, Restangular, toastr) => {
        
        var id = $stateParams.Id;
        // $scope.lookupOrganismType = 'ORG';
        $scope.businessPartnerTypeName = 'bp.types.organism';
        $scope.lookupCreditTypeType = '0' ; 
        $scope.organismcredittypes = {
            credittypes: []
        }

        function load() {

            if (id) {

                Restangular.one('financials').one('debtmanagement').one('organismcredittypes', id).get().then(result => {
                    $scope.organismcredittypes = result;
                    $scope.organismcredittypes.credittypes = result.creditTypes;
                });
            }
        }

            $scope.loadcredittypes= () => {

                if(id){
                    Restangular.one('financials').one('debtmanagement').one('organismcredittypes', id).get().then(result => {
                    $scope.organismcredittypes = result;
                    $scope.organismcredittypes.credittypes = result.creditTypes;
                        
                    });
                }
            }


            $scope.save = () => {
                if (id) {
                    $scope.organismcredittypes.put().then(() => { $state.go('app.financials.ar.debtmanagement.organismcredittypes'); });
                    toastr.success('Se ha modificado el organismo con éxito.', 'Editor de organismo');
                } else {
                    Restangular.service('financials/debtmanagement/organismcredittypes').post($scope.organismcredittypes).then(() => { $state.go('app.financials.ar.debtmanagement.organismcredittypes'); });
                    toastr.success('Se ha dado de alta el organismo con éxito.', 'Alta de organismo');
                }
            }

           
            //#region Tipo Credito
            $scope.addCreditType = () => {
               
                Restangular.one('financials').one('debtmanagement').one('credittypes', $scope.params.typeId).get().then((credittype) => {
                    $scope.organismcredittypes.credittypes.push(credittype);                
                    $scope.params.typeId = null;
                });
            };

            $scope.removeCreditType = (item) => {
                var index = $scope.organismcredittypes.credittypes.indexOf(item);
                $scope.organismcredittypes.credittypes.splice(index, 1);
            }

            load();
        }])

    .directive('financialsArDebtManagementOrganismCreditTypesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementOrganismCreditTypeGrid';
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
                    { name: 'creditTypeName', index: 'creditTypeName', search: true },
                    { name: 'organismId', index: 'organismId', search: false, hidden: true }

                ];

                gridElement.jqGrid(
                    {
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/debtmanagement/organismcredittypes.json?OrganismStatus=0&&OrganismCreditTypeStatus=0',
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
                            var stateName = 'app.financials.ar.debtmanagement.organismcredittype';
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

