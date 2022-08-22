angular.module('app.hr', [])
    .config(['$stateProvider', $stateProvider => {
    $stateProvider
        .state('app.hr', {
        url: '/hr',
        abstract: true,
        template: '<ui-view/>',
        ncyBreadcrumb: {
            skip: false,
            parent: 'app.dashboard',
            label: 'hr'
        }
    })
        .state('app.hr.employees', {
        url: '/employees',
        controller: 'HumanResourcesEmployeesListController',
        templateUrl: 'app/hr/employees/list.html',
        resolve: loadSequence('jqueryui', 'jqGrid'),
        ncyBreadcrumb: {
            label: 'hr.employees'
        }
    })

        .state('app.hr.employeenew', {
        url: '/employees/new',
        controller: 'HumanResourcesEmployeeEditController',
        templateUrl: 'app/hr/employees/edit.html',
        ncyBreadcrumb: {
            parent: 'app.hr.employees',
            label: 'hr.employee.new'
        }
    })
        .state('app.hr.resourceedit', {
        url: '/employees/{employeeId}',
        controller: 'HumanResourcesEmployeeEditController',
        templateUrl: 'app/hr/employees/edit.html'
    })
        .state('app.hr.concepts', {
        url: '/concepts',
        controller: 'HumanResourcesConceptsListController',
        templateUrl: 'app/hr/concepts/list.html',
        resolve: loadSequence('jqueryui', 'jqGrid')
    })
        .state('app.hr.conceptnew', {
        url: '/concepts/new',
        controller: 'HumanResourcesConceptEditController',
        templateUrl: 'app/hr/concepts/edit.html'
    })
        .state('app.hr.conceptedit', {
        url: '/concepts/{conceptId}',
        controller: 'HumanResourcesConceptEditController',
        templateUrl: 'app/hr/concepts/edit.html'
    });
}
])
    .controller('HumanResourcesConceptsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
    $scope.params = {
        selectedItems: []
    };
    $scope.new = () => {
        $state.go('app.hr.conceptnew');
    }
}
])
    .controller('HumanResourcesConceptEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {

    var id = $stateParams.conceptId;

    function load() {
        if (id) {
            Restangular.one('hr').one('concepts', id).get().then(result => {
                $scope.sector = result;
            });
        }
    }

    $scope.save = () => {
        if (id) {
            $scope.sector.put().then(() => { $state.go('app.hr.concepts'); });
        } else {
            Restangular.service('hr/concepts').post($scope.sector).then(() => { $state.go('app.hr.concepts'); });
        }
    }
    load();
}
])

    .directive('hrConceptsGrid',($state, Restangular, authManager) => {
    return {
        restrict: 'A',
        scope: { height: '@', selectedItems: '=' },
        link(scope: any, element, attrs, ctrl) {
            var gridElementName = 'hrConceptsGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement = angular.element('<table></table>');
            gridElement.attr('id', gridElementName);
            var pagerElement = angular.element('<div></div>');
            pagerElement.attr('id', pagerElementName);
            element.append(gridElement);
            element.append(pagerElement);

            scope.height = scope.height || 450;

            var colNames = ['', 'Número', 'Descripción', 'CI', 'CA', 'CCS', 'CCSS', 'CPV', 'CSP', 'CD', 'CAl', 'CR', 'CAd'];
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
                { name: 'number', index: 'number', width: 100, fixed: true, search: true },
                { name: 'description', index: 'description', search: true },
                { name: 'calculaImporte', index: 'calculaImporte', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaArt', index: 'calculaArt', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaCargaSindical', index: 'calculaCargaSindical', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaContribucionSeguridadSocial', index: 'calculaContribucionSeguridadSocial', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaPlusVacacional', index: 'calculaPlusVacacional', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaSacProporcional', index: 'calculaSacProporcional', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaDesayuno', index: 'calculaDesayuno', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaAlmuerzo', index: 'calculaAlmuerzo', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaRefrigerio', index: 'calculaRefrigerio', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } },
                { name: 'calculaAdicional', index: 'calculaAdicional', width: 50, fixed: true, search: false, formatter: function (value) { return value ? 'Sí' : 'No' } }
            ];

            gridElement.jqGrid({
                regional: 'es-ar',
                url: '/api/hr/concepts.json',
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
                        var stateName = 'app.hr.conceptedit';
                        $state.go(stateName, { conceptId: rowId });
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

    .controller('HumanResourcesEmployeesListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
    $scope.params = {
        selectedItems: []
    };

    $scope.new = () => {
        $state.go('app.hr.employeenew');
    }
}
])
    .controller('HumanResourcesEmployeeEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {

    var id = $stateParams.resourceId;

    function load() {
        if (id) {
            Restangular.one('hr').one('employees', id).get().then(result => {
                $scope.resource = result;
            });
        }
    }
    $scope.save = () => {
        if (id) {
            $scope.resource.put().then(() => { $state.go('app.hr.employees'); });
        } else {
            Restangular.service('hr/employees').post($scope.resource).then(() => { $state.go('app.hr.employees'); });
        }
    }

    load();
}])
    .directive('hrEmployeesGrid',($state, Restangular, authManager) => {
    return {
        restrict: 'A',
        scope: { height: '@', selectedItems: '=' },
        link(scope: any, element, attrs, ctrl) {
            var gridElementName = 'hrResourcesGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement = angular.element('<table></table>');
            gridElement.attr('id', gridElementName);
            var pagerElement = angular.element('<div></div>');
            pagerElement.attr('id', pagerElementName);
            element.append(gridElement);
            element.append(pagerElement);
            scope.height = scope.height || 450;

            var colNames = ['', 'Nombre', 'CUIL'];
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
                { name: 'fullName', index: 'fullName', search: true },
                { name: 'vatNumber', index: 'vatNumber', width: 100, fixed: true, search: true }
            ];

            gridElement.jqGrid({
                regional: 'es-ar',
                url: '/api/hr/employees.json',
                datatype: 'json',
                height: scope.height,
                autowidth: true,
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
                        var stateName = 'app.hr.resourceedit';
                        $state.go(stateName, { resourceId: rowId });
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
