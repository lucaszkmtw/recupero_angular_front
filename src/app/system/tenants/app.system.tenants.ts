angular.module('app.system.tenants', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.system.tenants', {
                url: '/tenants',
                controller: 'SystemTenantsController',
                templateUrl: 'app/system/tenants/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.tenants'
                }
            })
            .state('app.system.tenantnew', {
                url: '/tenants/new',
                controller: 'SystemTenantController',
                templateUrl: 'app/system/tenants/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system.tenants',
                    label: 'system.tenant.new'
                }
            })
            .state('app.system.tenant', {
                url: '/tenants/{tenantId}',
                controller: 'SystemTenantController',
                templateUrl: 'app/system/tenants/edit.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system.tenants',
                    label: 'system.tenant'
                }
            });
    }
    ])
    .controller('SystemTenantsController', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.system.tenantnew');
        }
    })
    .directive('systemTenantsGrid', ($state, $timeout) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var loadData = null;
                var isCreated = false;

                $timeout(() => {
                    function createGrid() {
                        var gridElementName = 'systemTenantsGrid';
                        var pagerElementName = gridElementName + 'Pager';
                        var gridElement = angular.element('<table></table>');
                        gridElement.attr('id', gridElementName);
                        var pagerElement = angular.element('<div></div>');
                        pagerElement.attr('id', pagerElementName);
                        element.append(gridElement);
                        element.append(pagerElement);

                        scope.height = scope.height || 450;

                        var colNames = ['', 'Nombre', 'Persona', 'CUIT'];
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
                            { name: 'personName', index: 'personNameContains', search: true },
                            { name: 'personCode', index: 'personCodeContains', width: 120, fixed: true, search: true }
                        ];

                        gridElement.jqGrid({
                            regional: 'es-ar',
                            datatype: 'local',
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
                                    var stateName = 'app.system.tenant';
                                    $state.go(stateName, { tenantId: rowId });
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

                        loadData = () => {
                            var url = '/api/system/tenants.json';
                            gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                            gridElement.trigger('reloadGrid');
                        }
                    }

                    if (!isCreated) {
                        createGrid();
                        isCreated = true;
                    }
                    loadData();

                    scope.$on('loadTenants', () => {
                        loadData();
                    });
                }, 0);
            }
        };
    })
    .controller('SystemTenantController', ($scope, $translate, $state, $stateParams, Restangular, toastr, dialogs) => {

        var id = $stateParams.tenantId;
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
            dlg.result.then(() => {
                Restangular.one('system').one('tenants', $scope.tenant.id).remove().then(result => {
                    toastr.success('Propietarios', 'El propietario se elmininó con éxito.');
                    $state.go('app.system.tenants');
                });
            });
        }

        load();
    })
    .directive('systemTenantUsersGrid', ($state, $timeout) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', tenantId: '=' },
            link(scope: any, element) {
                var loadData = null;
                var isCreated = false;

                $timeout(() => {
                    function createGrid() {
                        var gridElementName = 'systemTenantUsersGrid';
                        var pagerElementName = gridElementName + 'Pager';
                        var gridElement: any = angular.element('<table></table>');
                        gridElement.attr('id', gridElementName);
                        var pagerElement: any = angular.element('<div></div>');
                        pagerElement.attr('id', pagerElementName);
                        element.append(gridElement);
                        element.append(pagerElement);

                        scope.height = scope.height || 300;
                        var colNames = ['', 'Usuario', 'Nombre', 'CUIT'];
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
                            { name: 'userName', index: 'userNameContains' },
                            { name: 'personName', index: 'personNameContains' },
                            {
                                name: 'personCode', index: 'personCodeContains', width: 100, fixed: true
                            }
                        ];
                        gridElement.jqGrid({
                            regional: 'es-ar',
                            datatype: 'local',
                            height: scope.height,
                            autowidth: true,
                            responsive: true,
                            styleUI: 'Bootstrap',
                            colNames: colNames,
                            colModel: colModel,
                            scroll: 1,
                            mtype: 'GET',
                            rowNum: 100,
                            gridview: true,
                            pager: pagerElementName,
                            viewrecords: true,
                            jsonReader: {
                                page: obj => ((obj.offset / 100) + 1),
                                total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
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
                                    var stateName = 'app.system.useredit';
                                    $state.go(stateName, { userId: rowId });
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
                        loadData = () => {
                            var url = '/api/system/tenants/' + scope.tenantId + '/users.json';
                            gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                            gridElement.trigger('reloadGrid');
                        }
                    }

                    if (!isCreated) {
                        createGrid();
                        isCreated = true;
                    }
                    loadData();

                    scope.$on('loadTenantUsers', () => {
                        loadData();
                    });
                }, 0);
            }
        };
    });
