angular.module('app.system.places', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.system.places', {
                url: '/places',
                controller: 'SystemPlacesController',
                templateUrl: 'app/system/places/list.html',
                resolve: loadSequence('kendotreeview'),
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.places'
                }
            })
            .state('app.system.newplace', {
                url: '/places/new',
                controller: 'SystemPlaceController',
                templateUrl: 'app/system/places/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system.places',
                    label: 'system.places.new'
                }
            })
            .state('app.system.place', {
                url: '/places/{tenantId}',
                controller: 'SystemPlaceController',
                templateUrl: 'app/system/places/edit.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system.places',
                    label: 'system.places'
                }
            });
    }
    ])
    .controller('SystemPlacesController', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.system.newplace');
        }
    })
    .directive('systemPlacesTree', ($log, $state, $http, $timeout) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                $timeout(() => {
                    var treeView = element.kendoTreeView({
                        dragAndDrop: true,
                        dataSource: {
                            transport: {
                                read: {
                                    url: '/api/system/placenodes',
                                    dataType: "jsonp"
                                }
                            },
                            schema: {
                                model: {
                                    id: 'id',
                                    hasChildren: (item) => {
                                        return item.childCount > 0;
                                    }
                                }
                            }
                        },
                        dataTextField: ['name'],
                        select: (e) => {
                            var id = treeView.dataItem(e.node).id;
                            $log.info('selected: ' + id);
                            scope.$apply();
                        },
                        expand: (e) => {
                            $log.info('expanded: ' + e.node);
                        }
                    }).data('kendoTreeView');
                }, 0);
            }
        };
    })
    .controller('SystemPlaceController', ($scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {

        var id = $stateParams.placeId;
        $scope.params = {};

        function load() {
            if (id) {
                Restangular.one('system').one('tenants', id).get().then(result => {
                    $scope.tenant = result;
                });
            }
            else {
                $scope.tenant = {};
            }
        }

        $scope.addTenantUser = () => {
            var tenantUser = { tenantId: $scope.tenant.id, userId: $scope.params.userId };
            Restangular.service('system/tenants/' + $scope.tenant.id + '/users').post(tenantUser).then(
                () => {
                    toastr.success('Propietarios', 'Se asignó el usuario al propietario con éxito');
                    $scope.params.userId = null;
                    $scope.$broadcast('loadTenantUsers');
                }, (response) => {
                    $scope.params.userId = null;
                    toastr.error(response.data.responseStatus.message, 'Propietarios');
                });
        };

        $scope.save = () => {
            if (id) {
                $scope.tenant.put().then(() => {
                    toastr.success('Propietarios', 'El propietario se actualizó con éxito');
                    $state.go('app.system.tenants');
                });
            } else {
                Restangular.service('system/tenants').post($scope.tenant).then(() => {
                    toastr.success('Propietarios', 'El propietario se creó con éxito');
                    $state.go('app.system.tenants');
                });
            }

            $scope.params.userId = null;
        };

        $scope.delete = () => {
            var dlg = dialogs.confirm('Eliminar propietario', 'Está seguro que desea eliminar el propietario ' + $scope.tenant.name + '?');
            dlg.result.then((btn) => {
                Restangular.one('system').one('tenants', $scope.tenant.id).remove().then(result => {
                    toastr.success('Propietarios', 'El propietario se elmininó con éxito.');
                    $state.go('app.system.tenants');
                });
            });
        }

        load();
    });
