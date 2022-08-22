angular.module('app.health.doctors', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.doctors', {
                url: '/doctors',
                controller: 'HealthDoctorsListController',
                templateUrl: 'app/health/doctor/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.doctors'
                }
            })
            .state('app.health.doctornew', {
                url: '/doctors/new',
                controller: 'HealthDoctorEditController',
                resolve: loadSequence('icheck'),
                templateUrl: 'app/health/doctor/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.doctors',
                    label: 'health.doctor.new'
                }
            })
            .state('app.health.doctoredit', {
                url: '/doctors/{doctorId}',
                controller: 'HealthDoctorEditController',
                resolve: loadSequence('icheck'),
                templateUrl: 'app/health/doctor/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.doctors',
                    label: 'health.doctor'
                }
            });
    }
    ])
    .controller('HealthDoctorsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.doctornew');
        }
        $scope.app.title = $translate.instant('health.doctors');
    }
    ])
    .controller('HealthDoctorEditModalController', ['$scope', '$uibModalInstance', 'Restangular', ($scope, $uibModalInstance, Restangular) => {
        $scope.params = {
            step: 1 // 1:Person, 2:Doctor
        };

        $scope.doctor = {
            skillIds: []
        }

        $scope.save = () => {
            Restangular.service('health/doctors').post($scope.doctor).then((result) => {
                $uibModalInstance.close(result);
            });
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    }
    ])
    .controller('HealthDoctorEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.doctorId;

        function load() {
            if (id) {
                Restangular.one('health').one('doctors', id).get().then(result => {
                    var doctor = result;
                    $scope.doctor = doctor;
                });
            } else {
                $scope.doctor = {
                    skillIds: []
                }
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.doctor.put().then(() => { $state.go('app.health.doctors'); });
            } else {
                Restangular.service('health/doctors').post($scope.doctor).then(() => { $state.go('app.health.doctors'); });
            }
        }
        load();
    }
    ])
    .directive('healthDoctorsGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthDoctorsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre', 'Matrícula', 'Especialidad'];
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
                    { name: 'personName', index: 'personNameContains', width: 100, search: false },
                    { name: 'registrationNumber', index: 'registrationNumberContains', width: 130, fixed: true, search: false },
                    { name: 'specialityCode', index: 'specialityCode', width: 130, fixed: true, search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/doctors.json',
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
                            var stateName = 'app.health.doctoredit';
                            $state.go(stateName, { doctorId: rowId });
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