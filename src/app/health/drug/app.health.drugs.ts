angular.module('app.health.drugs', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.commercialdrugs', {
                url: '/commercialdrugs',
                controller: 'HealthCommercialDrugsListController',
                templateUrl: 'app/health/commercialdrug/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.commercialdrugs'
                }
            })
            .state('app.health.commercialdrugnew', {
                url: '/commercialdrugs/new',
                controller: 'HealthCommercialDrugEditController',
                templateUrl: 'app/health/commercialdrug/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.commercialdrugs',
                    label: 'health.commercialdrug.new'
                }
            })
            .state('app.health.commercialdrug', {
                url: '/commercialdrugs/{commercialDrugId}',
                controller: 'HealthCommercialDrugViewController',
                templateUrl: 'app/health/commercialdrug/view.html',
                ncyBreadcrumb: {
                    parent: 'app.health.commercialdrugs',
                    label: 'health.commercialdrug'
                }
            })
            .state('app.health.commercialdrugedit', {
                url: '/commercialdrugs/{commercialDrugId}/edit',
                controller: 'HealthCommercialDrugEditController',
                templateUrl: 'app/health/commercialdrug/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.commercialdrugs',
                    label: 'health.commercialdrug'
                }
            })
            .state('app.health.drugs', {
                url: '/drugs',
                controller: 'HealthDrugsListController',
                templateUrl: 'app/health/drug/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.drugs'
                }
            })
            .state('app.health.drugnew', {
                url: '/drugs/new',
                controller: 'HealthDrugEditController',
                templateUrl: 'app/health/drug/edit.html',
                //resolve: loadSequence('ngCkeditor'),
                ncyBreadcrumb: {
                    parent: 'app.health.drugs',
                    label: 'health.drug.new'
                }
            })
            .state('app.health.drugedit', {
                url: '/drugs/{drugId}',
                controller: 'HealthDrugEditController',
                templateUrl: 'app/health/drug/edit.html',
                //resolve: loadSequence('ngCkeditor'),
                ncyBreadcrumb: {
                    parent: 'app.health.drugs',
                    label: 'health.drug'
                }
            })
            .state('app.health.drugpresentations', {
                url: '/drugpresentations',
                controller: 'HealthDrugPresentationsListController',
                templateUrl: 'app/health/drugpresentation/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.drugpresentations'
                }
            })
            .state('app.health.drugpresentationnew', {
                url: '/drugpresentationss/new',
                controller: 'HealthDrugPresentationEditController',
                templateUrl: 'app/health/drugpresentation/edit.html',
                //resolve: loadSequence('ngCkeditor'),
                ncyBreadcrumb: {
                    parent: 'app.health.drugpresentations',
                    label: 'health.drugpresentation.new'
                }
            })
            .state('app.health.drugpresentationedit', {
                url: '/drugpresentations/{drugPresentationId}',
                controller: 'HealthDrugPresentationEditController',
                templateUrl: 'app/health/drugpresentation/edit.html',
                //resolve: loadSequence('ngCkeditor'),
                ncyBreadcrumb: {
                    parent: 'app.health.drugpresentations',
                    label: 'health.drugpresentation'
                }
            });
    }
    ])
    .controller('HealthCommercialDrugsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.commercialdrugnew');
        }
    }
    ])
    .controller('HealthCommercialDrugEditModalController', ['$scope', '$modalInstance', 'Restangular', ($scope, $modalInstance, Restangular) => {
        $scope.save = () => {
            Restangular.service('health/commercialdrugs').post($scope.commercialdrug).then((result) => { $modalInstance.close(result); });
        }

        $scope.cancel = () => {
            $modalInstance.dismiss('cancel');
        }
    }
    ])
    .controller('HealthCommercialDrugViewController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'dialogs', ($scope: any, $translate, $stateParams, $state, Restangular, dialogs) => {
        var id = $stateParams.commercialDrugId;

        Restangular.one('health').one('commercialdrugs', id).get().then(result => {
            $scope.commercialDrug = result;
        });

        $scope.edit = () => {
            $state.go('app.health.commercialdrugedit', { commercialDrugId: $scope.commercialDrug.id });
        };
    }
    ])
    .controller('HealthCommercialDrugEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'dialogs', ($scope: any, $translate, $stateParams, $state, Restangular, dialogs) => {
        var id = $stateParams.commercialDrugId;

        function load() {
            if (id) {
                Restangular.one('health').one('commercialdrugs', id).get().then(result => {
                    $scope.commercialDrug = result;
                });
            } else {
                $scope.commercialDrug = {};
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.commercialDrug.put().then(() => { $state.go('app.health.commercialdrugs'); });
            } else {
                Restangular.service('health/commercialdrugs').post($scope.commercialDrug).then(() => { $state.go('app.health.commercialdrugs'); });
            }
        };

        load();
    }
    ])
    .controller('HealthDrugsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.drugnew');
        }
    }
    ])
    .controller('HealthDrugEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.drugId;

        function load() {
            if (id) {
                Restangular.one('health').one('drugs', id).get().then(result => {
                    $scope.drug = result;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.drug.put().then(() => { $state.go('app.health.drugs'); });
            } else {
                Restangular.service('health/drugs').post($scope.drug).then(() => { $state.go('app.health.drugs'); });
            }
        }
        load();
    }
    ])
    .controller('HealthDrugEditModalController', ['$scope', '$modalInstance', 'Restangular', ($scope, $modalInstance, Restangular) => {
        $scope.save = () => {
            Restangular.service('health/drugs').post($scope.drug).then((result) => { $modalInstance.close(result); });
        }

        $scope.cancel = () => {
            $modalInstance.dismiss('cancel');
        }
    }
    ])
    .controller('HealthDrugPresentationsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.drugpresentationnew');
        }
    }
    ])
    .controller('HealthDrugPresentationEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.drugPresentationId;

        function load() {
            if (id) {
                Restangular.one('health').one('drugpresentations', id).get().then(result => {
                    $scope.drugpresentation = result;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.drugpresentation.put().then(() => { $state.go('app.health.drugpresentations'); });
            } else {
                Restangular.service('health/drugpresentations').post($scope.drugpresentation).then(() => { $state.go('app.health.drugpresentations'); });
            }
        }
        load();
    }
    ])
    .directive('healthCommercialDrugsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'healthCommercialDrugsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Medicamento', 'Principio activo', 'Presentación', 'Laboratorio'];
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
                    { name: 'name', index: 'nameContains', search: true },
                    { name: 'drugName', index: 'drugNameContains', search: true },
                    { name: 'drugPresentationName', index: 'drugPresentationNameContains', search: true },
                    { name: 'personName', index: 'personNameContains', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/health/commercialdrugs.json',
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
                            var stateName = 'app.health.commercialdrug';
                            $state.go(stateName, { commercialDrugId: rowId });
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
    .directive('healthDrugsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'healthDrugsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Código', 'Nombre'];
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
                    { name: 'code', index: 'code', width: 100, fixed: true, search: true },
                    { name: 'name', index: 'name', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/drugs.json',
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
                            var stateName = 'app.health.drugedit';
                            $state.go(stateName, { drugId: rowId });
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
    .directive('healthDrugPresentationsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthDrugPresentationsGrid';
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
                    url: '/api/health/drugpresentations.json',
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
                            var stateName = 'app.health.drugpresentationedit';
                            $state.go(stateName, { drugPresentationId: rowId });
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