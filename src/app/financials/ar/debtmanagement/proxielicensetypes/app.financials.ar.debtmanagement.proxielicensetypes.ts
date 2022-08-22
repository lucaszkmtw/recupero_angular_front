angular.module('app.financials.ar.debtmanagement.proxielicensetypes', [])
    .config(($stateProvider) =>{
        $stateProvider
            .state('app.financials.ar.debtmanagement.proxielicensetypes',
            {
                url: '/proxielicensetypes',
                controller: 'FinancialsDebtManagementProxieLicenseTypesController',
                templateUrl: 'app/financials/ar/debtmanagement/proxielicensetypes/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'findm.proxielicensetypes'
                }
            })
            .state('app.financials.ar.debtmanagement.proxielicensetype',
            {
                url: '/proxielicensetypes/{Id}',
                controller: 'FinancialsDebtManagementProxieLicenseTypeController',
                templateUrl: 'app/financials/ar/debtmanagement/proxielicensetypes/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.debtmanagement.proxielicensetypes',
                    label: 'findm.proxielicensetype'
                }
            });
    })
    .controller('FinancialsDebtManagementProxieLicenseTypesController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.proxielicensetype');
        }
    })
    .controller('FinancialsDebtManagementProxieLicenseTypeController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: any, $translate, $stateParams, $state, Restangular, toastr) => {
        
        var id = $stateParams.Id;
        // $scope.lookupOrganismType = 'ORG';
       // $scope.businessPartnerTypeName = 'bp.types.organism';
        //$scope.lookupCreditTypeType = '0' ; 
        $scope.proxielicensetypes = {
            licensetypes: []
        }

        function load() {

            if (id) {

                Restangular.one('financials').one('debtmanagement').one('proxielicensetypes', id).get().then(result => {
                    $scope.proxielicensetypes = result;
                    $scope.proxielicensetypes.licensetypes = result.licenseTypes;
                });
            }
        }

            $scope.loadlicensetypes= () => {

                if(id){
                    Restangular.one('financials').one('debtmanagement').one('proxielicensetypes', id).get().then(result => {
                    $scope.proxielicensetypes = result;
                    $scope.proxielicensetypes.licensetypes = result.licenseTypes;
                        
                    });
                }
            }


            $scope.save = () => {
                if (id) {
                    $scope.proxielicensetypes.put().then(() => { $state.go('app.financials.ar.debtmanagement.proxielicensetypes'); });
                    toastr.success('Se ha modificado las licencias por apoderado con éxito.', 'Editor de organismo');
                } else {
                    Restangular.service('financials/debtmanagement/proxielicensetypes').post($scope.proxielicensetypes).then(() => { $state.go('app.financials.ar.debtmanagement.proxielicensetypes'); });
                    toastr.success('Se han dado de alta las licencias por apoderado con éxito.', 'Alta de organismo');
                }
            }

           
            //#region Tipo Licencia
            $scope.addLicenseType = () => {
               
                Restangular.one('financials').one('debtmanagement').one('licensetypes', $scope.params.licenseTypeId).get().then((licensetype) => {
                    $scope.proxielicensetypes.licensetypes.push(licensetype);                
                    $scope.params.licenseTypeId = null;
                });
            };

            $scope.removeLicenseType = (item) => {
                var index = $scope.proxielicensetypes.licensetypes.indexOf(item);
                $scope.proxielicensetypes.licensetypes.splice(index, 1);
            }

            load();
        }])

    .directive('financialsArDebtManagementProxieLicenseTypesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementProxieLicenseTypeGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                scope.height = scope.height || 450;
                var colNames = ['', 'Apoderado', 'Tipo de Licencia','ProxieId'];
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
                    { name: 'licenseTypeName', index: 'licenseTypeName', search: true },
                    { name: 'proxieId', index: 'proxieId', search: false, hidden: true }

                ];

                gridElement.jqGrid(
                    {
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/debtmanagement/proxielicensetypes.json?ProxieStatus=0&&ProxieLicenseTypeStatus=0',
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
                            var stateName = 'app.financials.ar.debtmanagement.proxielicensetype';
                            var rowData = gridElement.jqGrid('getRowData', rowId);
                            $state.go(stateName, { Id: rowData.proxieId });
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

