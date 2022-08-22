angular.module('app.health', ['app.core'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health', {
                url: '/health',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'health'
                }
            })
            .state('app.health.healthservices', {
                url: '/healthservices',
                controller: 'HealthHealthServicesListController',
                templateUrl: 'app/health/healthservice/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.healthservices'
                }
            })
            .state('app.health.healthservicenew', {
                url: '/healthservices/new',
                controller: 'HealthHealthServiceEditController',
                templateUrl: 'app/health/healthservice/edit.html',
                resolve: loadSequence('icheck'),
                ncyBreadcrumb: {
                    parent: 'app.health.healthservices',
                    label: 'command.healthservicenew'
                }
            })
            .state('app.health.healthserviceedit', {
                url: '/healthservices/{healthServiceId}',
                controller: 'HealthHealthServiceEditController',
                templateUrl: 'app/health/healthservice/edit.html',
                resolve: loadSequence('icheck'),
                ncyBreadcrumb: {
                    parent: 'app.health.healthservices',
                    label: 'command.healthservice'
                }
            })
            .state('app.health.diseases', {
                url: '/diseases',
                controller: 'HealthDiseasesListController',
                templateUrl: 'app/health/diseases/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.diseases'
                }
            })
            .state('app.health.diseasenew', {
                url: '/diseases/new',
                controller: 'HealthDiseaseEditController',
                templateUrl: 'app/health/diseases/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.diseases',
                    label: 'command.new.f'
                }
            })
            .state('app.health.diseaseedit', {
                url: '/diseases/{diseaseId}',
                controller: 'HealthDiseaseEditController',
                templateUrl: 'app/health/diseases/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.diseases',
                    label: 'command.edit'
                }
            })
            .state('app.health.pharmacies', {
                url: '/pharmacies',
                controller: 'HealthPharmaciesListController',
                templateUrl: 'app/health/pharmacy/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.pharmacies'
                }
            })
            .state('app.health.pharmacynew', {
                url: '/pharmacies/new',
                controller: 'HealthPharmacyEditController',
                templateUrl: 'app/health/pharmacy/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.pharmacies',
                    label: 'health.pharmacy.new'
                }
            })
            .state('app.health.pharmacyedit', {
                url: '/pharmacies/{pharmacyId}',
                controller: 'HealthPharmacyEditController',
                templateUrl: 'app/health/pharmacy/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.pharmacies',
                    label: 'health.pharmacy'
                }
            });
    }
    ])
    .controller('HealthHealthServicesListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.healthservicenew');
        }
    })
    .controller('HealthHealthServiceEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.healthServiceId;

        function load() {
            if (id) {
                Restangular.one('health').one('healthservices', id).get().then(result => {
                    $scope.healthservice = result;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.healthservice.put().then(() => { $state.go('app.health.healthservices'); });
            } else {
                Restangular.service('health/healthservices').post($scope.healthservice).then(() => { $state.go('app.health.healthservices'); });
            }
        }
        load();
    })
    .controller('HealthDiseasesListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.diseasenew');
        }
    })
    .controller('HealthDiseaseEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {
        var id = $stateParams.diseaseId;

        function load() {
            if (id) {
                Restangular.one('health').one('diseases', id).get().then(result => {
                    $scope.disease = result;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.disease.put().then(() => { $state.go('app.health.diseases'); });
            } else {
                Restangular.service('health/diseases').post($scope.disease).then(() => { $state.go('app.health.diseases'); });
            }
        }
        load();
    })
    .controller('HealthPharmaciesListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.pharmacynew');
        }
    })
    .controller('HealthPharmacyEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.pharmacyId;

        function load() {
            if (id) {
                Restangular.one('health').one('pharmacies', id).get().then(result => {
                    var pharmacy = result;
                    $scope.pharmacy = pharmacy;
                });
            } else {
                $scope.pharmacy = {};
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.pharmacy.put().then(() => { $state.go('app.health.pharmacies'); });
            } else {
                Restangular.service('health/pharmacies').post($scope.pharmacy).then(() => { $state.go('app.health.pharmacies'); });
            }
        }
        load();
    })
    .directive('healthHealthServicesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthHealthServicesGrid';
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
                    { name: 'code', index: 'codeContains', width: 100, fixed: true, search: true },
                    { name: 'personName', index: 'personNameContains', search: true }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/healthservices.json',
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
                            var stateName = 'app.health.healthserviceedit';
                            $state.go(stateName, { healthServiceId: rowId });
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
    .directive('healthDiseasesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                const gridElementName = 'healthDiseasesGrid';
                const pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                const pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                const colNames = ['', 'Código', 'Familia', 'Grupo', 'Nombre'];
                const colModel: Array<any> = [
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
                    { name: 'name', index: 'name', search: false },
                    { name: 'diseaseFamilyName', index: 'diseaseFamilyName', width: 100, fixed: true, search: true },
                    { name: 'diseaseGroupName', index: 'diseaseGroupName', width: 100, fixed: true, search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/diseases.json',
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
                            var stateName = 'app.health.diseaseedit';
                            $state.go(stateName, { diseaseId: rowId });
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
    .directive('healthSpecialitiesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthSpecialitiesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Código', 'Descripción'];
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
                    { name: 'description', index: 'description', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/specialities.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    formatter: {
                        bool: function (j) { return j ? 'Sí' : 'No' }
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
                            var stateName = 'app.health.specialityedit';
                            $state.go(stateName, { specialityId: rowId });
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
    .directive('healthPharmaciesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthPharmaciesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Código', 'Descripción'];
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
                    { name: 'description', index: 'description', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/pharmacies.json',
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
                            var stateName = 'app.health.pharmacyedit';
                            $state.go(stateName, { pharmacyId: rowId });
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
