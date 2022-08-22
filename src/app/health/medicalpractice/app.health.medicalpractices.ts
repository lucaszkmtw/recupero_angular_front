angular.module('app.health.medicalpractices', ['app.health'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.medicalpractices', {
                url: '/medicalpractices',
                controller: 'HealthMedicalPracticesListController',
                templateUrl: 'app/health/medicalpractice/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.medicalpractices'
                }
            })
            .state('app.health.medicalpracticenew', {
                url: '/medicalpractices/new',
                controller: 'HealthMedicalPracticeEditController',
                templateUrl: 'app/health/medicalpractice/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.medicalpractices',
                    label: 'health.medicalpractice.new'
                }
            })
            .state('app.health.medicalpracticeedit', {
                url: '/medicalpractices/{medicalPracticeId}',
                controller: 'HealthMedicalPracticeEditController',
                templateUrl: 'app/health/medicalpractice/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.medicalpractices',
                    label: 'health.medicalpractice'
                }
            });
    }
    ])
    .controller('HealthMedicalPracticesListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.medicalpracticenew');
        }
    }
    ])
    .controller('HealthMedicalPracticeEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.medicalPracticeId;

        function load() {
            if (id) {
                Restangular.one('health').one('medicalpractices', id).get().then(result => {
                    $scope.medicalPractice = result;
                });
            } else {
                $scope.medicalPractice = {
                    skillIds: []
                };
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.medicalPractice.put().then(() => { $state.go('app.health.medicalpractices'); });
            } else {
                Restangular.service('health/medicalpractices').post($scope.medicalPractice).then(() => { $state.go('app.health.medicalpractices'); });
            }
        }
        load();
    }
    ])
    .directive('healthMedicalPracticesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'healthMedicalPracticesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Código', 'Especialidad', 'Nombre'];
                var colModel: any[] = [
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
                    { name: 'skillName', index: 'skillNameContains', width: 150, fixed: true, search: true },
                    { name: 'name', index: 'nameContains', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/medicalpractices.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
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
                            var stateName = 'app.health.medicalpracticeedit';
                            $state.go(stateName, { medicalPracticeId: rowId });
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