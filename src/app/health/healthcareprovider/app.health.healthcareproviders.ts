angular.module('app.health.healthcareproviders', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.healthcareproviders', {
                url: '/healthcareproviders',
                controller: 'HealthCareProvidersController',
                templateUrl: 'app/health/healthcareprovider/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.healthcareproviders'
                }
            })
            .state('app.health.newhealthcareprovider', {
                url: '/healthcareproviders/new',
                controller: 'HealthCareProviderController',
                resolve: loadSequence('icheck'),
                templateUrl: 'app/health/healthcareprovider/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.healthcareproviders',
                    label: 'health.healthcareprovider.new'
                }
            })
            .state('app.health.healthcareprovider', {
                url: '/healthcareproviders/{healthCareProviderId}',
                controller: 'HealthCareProviderController',
                resolve: loadSequence('icheck'),
                templateUrl: 'app/health/healthcareprovider/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.healthcareproviders',
                    label: 'health.healthcareprovider'
                }
            });
    }
    ])
    .controller('HealthCareProvidersController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.newhealthcareprovider');
        }
    }
    ])
    .controller('HealthCareProviderModalController', ['$scope', '$uibModalInstance', 'Restangular', ($scope, $uibModalInstance, Restangular) => {
        $scope.params = {
            step: 1 // 1:Person, 2:Doctor
        };

        $scope.doctor = {
            skillIds: []
        }

        $scope.save = () => {
            Restangular.service('health/healthcareproviders').post($scope.doctor).then((result) => {
                $uibModalInstance.close(result);
            });
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    }
    ])
    .controller('HealthCareProviderController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', ($scope: any, $translate, $stateParams, $state, Restangular) => {
        var id = $stateParams.healthCareProviderId;

        function load() {
            if (id) {
                Restangular.one('health').one('healthcareproviders', id).get().then(result => {
                    var healthcareprovider = result;
                    $scope.healthcareprovider = healthcareprovider;
                });
            } else {
                $scope.healthcareprovider = {}
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.healthcareprovider.put().then(() => { $state.go('app.health.healthcareproviders'); });
            } else {
                Restangular.service('health/healthcareproviders').post($scope.healthcareprovider).then(() => { $state.go('app.health.healthcareproviders'); });
            }
        }
        load();
    }
    ])
    .directive('healthHealthCareProvidersGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthCareProvidersGrid';
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
                    { name: 'personName', index: 'personNameContains', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/healthcareproviders.json',
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
                            var stateName = 'app.health.healthcareprovider';
                            $state.go(stateName, { healthCareProviderId: rowId });
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