angular.module('app.financials.ar.debtmanagement.organismlaws', [])
    .config(($stateProvider) =>{
        $stateProvider
            .state('app.financials.ar.debtmanagement.organismlaws',
            {
                url: '/organismlaws',
                controller: 'FinancialsDebtManagementOrganismLawsController',
                templateUrl: 'app/financials/ar/debtmanagement/organismlaws/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'findm.organismlaws'
                }
            })
            .state('app.financials.ar.debtmanagement.organismlaw',
            {
                url: '/organismlaws/{Id}',
                controller: 'FinancialsDebtManagementOrganismLawController',
                templateUrl: 'app/financials/ar/debtmanagement/organismlaws/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.debtmanagement.organismlaws',
                    label: 'findm.organismlaw'
                }
            });
    })
    .controller('FinancialsDebtManagementOrganismLawsController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.organismlaw');
        }
    })
    .controller('FinancialsDebtManagementOrganismLawController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: any, $translate, $stateParams, $state, Restangular, toastr) => {
        
        var id = $stateParams.Id;
        // $scope.lookupOrganismType = 'ORG';
        $scope.businessPartnerTypeName = 'bp.types.organism';
        $scope.lookupLawType = '0' ; 
        $scope.organismlaws = {
            laws: []
        }

        function load() {

            if (id) {

                Restangular.one('financials').one('debtmanagement').one('organismlaws', id).get().then(result => {
                    $scope.organismlaws = result;
                    $scope.organismlaws.laws = result.laws;
                });
            }
        }

            $scope.loadLaws= () => {
                alert(id);
                if(id){
                    Restangular.one('financials').one('debtmanagement').one('organismlaws', id).get().then(result => {
                    $scope.organismlaws = result;
                    $scope.organismlaws.laws = result.laws;
                        
                    });
                }
            }


            $scope.save = () => {
                if (id) {
                    $scope.organismlaws.put().then(() => { $state.go('app.financials.ar.debtmanagement.organismlaws'); });
                    toastr.success('Se ha modificado el organismo con éxito.', 'Editor de organismo');
                } else {
                    Restangular.service('financials/debtmanagement/organismlaws').post($scope.organismlaws).then(() => { $state.go('app.financials.ar.debtmanagement.organismlaws'); });
                    toastr.success('Se ha dado de alta el organismo con éxito.', 'Alta de organismo');
                }
            }

           
            //#region Tipo Credito/Laws
            $scope.addLaw = () => {
                //alert('pasa');
                //alert($scope.params.lawId);
                Restangular.one('financials').one('debtmanagement').one('laws', $scope.params.lawId).get().then((law) => {
                    //alert('pasa1');
                    $scope.organismlaws.laws.push(law);                
                    $scope.params.lawId = null;
                });
            };

            $scope.removeLaw = (item) => {
                var index = $scope.organismlaws.laws.indexOf(item);
                $scope.organismlaws.laws.splice(index, 1);
            }

            load();
        }])

    .directive('financialsArDebtManagementOrganismLawsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementOrganismLawGrid';
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
                    { name: 'lawName', index: 'lawName', search: true },
                    { name: 'organismId', index: 'organismId', search: false, hidden: true }

                ];

                gridElement.jqGrid(
                    {
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/debtmanagement/organismlaws.json?OrganismStatus=0&&OrganismLawStatus=0',
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
                            var stateName = 'app.financials.ar.debtmanagement.organismlaw';
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

