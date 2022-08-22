angular.module('app.system', ['app.core', 'app.system.layoutsbuilder','app.system.messages','app.system.workflows','app.system.notifications'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.system', {
                url: '/system',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    parent: 'app.dashboard',
                    label: 'system'
                }
            })
            .state('app.system.users', {
                url: '/users',
                controller: 'SystemUsersListController',
                templateUrl: 'app/system/users/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.users'
                }
            })
            .state('app.system.usernew', {
                url: '/users/new',
                controller: 'SystemUserEditController',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                templateUrl: 'app/system/users/new.html',
                ncyBreadcrumb: {
                    parent: 'app.system.users',
                    label: 'system.user.new'
                }
            })
            .state('app.system.useredit', {
                url: '/users/{userId}',
                controller: 'SystemUserEditController',
                resolve: loadSequence('jqueryui', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                templateUrl: 'app/system/users/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.users',
                    label: 'system.user'
                }
            })

            .state('app.system.permissions', {
                url: '/permissions',
                controller: 'SystemPermissionsListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/system/permissions/list.html',
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.permissions'
                }
            })
            .state('app.system.permissionnew', {
                url: '/permissions/new',
                controller: 'SystemPermissionEditController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/system/permissions/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.permissions',
                    label: 'system.permission.new'
                }
            })
            .state('app.system.permissionedit', {
                url: '/permissions/{permissionId}',
                controller: 'SystemPermissionEditController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/system/permissions/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.permissions',
                    label: 'system.permission'
                }
            })
            .state('app.system.roles', {
                url: '/roles',
                controller: 'SystemRolesListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/system/roles/list.html',
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.roles'
                }
            })
            .state('app.system.rolenew', {
                url: '/roles/new',
                controller: 'SystemRoleEditController',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                templateUrl: 'app/system/roles/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.roles',
                    label: 'system.role.new'
                }
            })
            .state('app.system.roleedit', {
                url: '/roles/{roleId}',
                controller: 'SystemRoleEditController',
                templateUrl: 'app/system/roles/edit.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system.roles',
                    label: 'system.role'
                }
            })
            .state('app.system.localizationresources', {
                url: '/localizationresources',
                controller: 'SystemLocalizationResourcesListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/system/localizations/listAll.html'
            })
            .state('app.system.navigation', {
                url: '/navigation',
                controller: 'SystemNavigationController',
                templateUrl: 'app/system/navigation/index.html',
                resolve: loadSequence('kendotreeview',  'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.navigation'
                }
            });
    }
    ])
    
    .controller('SystemUsersListController', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.system.usernew');
        }

        $scope.params = {
            selectedItems: []
        };
    })
    .controller('ConfirmationController', ($log, $scope, $uibModalInstance) => {
        $scope.close = () => {
            $uibModalInstance.close(true);
        }

        $scope.cancel = () => {
            $uibModalInstance.close(false);
        }
    })
    .controller('SystemUserEditModalController', ($log, $scope, $uibModalInstance, $uibModal, Restangular, data, dialogs) => {
        $scope.user = data;
        $scope.save = () => {
            var modalInstance = dialogs.create('app/system/users/confirmationModal.html', 'ConfirmationController', {}, { size: 'md', animation: false });
            modalInstance.result.then((result) => {
                if (result) {
                    Restangular.service('system/users').post($scope.user).then((result) => {
                        $uibModalInstance.close(result);
                    });
                }
            }, () => { });
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    })
    .controller('SystemUserEditController', ($scope, $state, $stateParams, Restangular, dialogs) => {
        var id = $stateParams.userId;
        $scope.params = { userId: id };

        function load() {
            if (id) {
                Restangular.one('system').one('users', id).get().then(result => {
                    $scope.user = result;
                });
            }
        }

        $scope.openChangePass = () => {
            var modalInstance = dialogs.create('app/system/users/passmodal.html', 'SystemUserEditModalController', $scope.user, { size: 'md', animation: false });
            modalInstance.result.then(() => {}, () => { });
        };

        $scope.showPermissions = () => {};

        $scope.showRoles = () => {
            $scope.$broadcast('loadData');
        };

        $scope.save = () => {
            if ($scope.user.id) {
                $scope.user.put().then(() => {
                });
            } else {
                Restangular.all('system').all('users').post($scope.user).then(() => { });
            }
            $state.go('app.system.users');
        };

        load();
    })
    .directive('systemUsersGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemUsersGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;
                var colNames = ['', 'Nombre', 'Usuario'];
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
                    { name: 'personName', index: 'personNameContains' },
                    { name: 'name', index: 'nameContains' }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/system/users.json',
                    datatype: 'json',
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
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
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
            }
        };
    })
    .controller('SystemPermissionsListController', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.system.permissionnew');
        }
    })
    .controller('SystemPermissionEditController', ($scope, $state, $translate, Restangular, $stateParams) => {
        var id = $stateParams.permissionId;

        $scope.permission = {};
        $scope.params = { permissionId: id };

        function load() {
            if (id) {
                Restangular.one('system').one('permissions', id).get().then(result => {
                    $scope.permission = result;
                });
            }
        }
        load();

        $scope.save = () => {
            if ($scope.permission.id) {
                $scope.permission.put().then(() => { $state.go('app.system.permissions'); });
            } else if ($scope.permission.name) {
                Restangular.service('system/permissions').post($scope.permission).then(() => { $state.go('app.system.permissions'); });
            }
        }

        $scope.delete = () => {
            if ($scope.permission.id) {
                $scope.permission.remove().then(() => {
                    $state.go('app.system.permissions');
                });
            }
        }
    })
    .directive('systemPermissionsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemPermissionsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;
                var colNames = ['', 'Permiso'];
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
                    {
                        name: 'name', index: 'name', sortable: true, search: true
                    }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/system/permissions.json',
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
                    serializeGridData: (postData) => {
                        _.forOwn(postData, (value, key: any) => {
                            if (key.indexOf('Contains') !== -1) {
                                delete (postData[key]);
                            }
                        });

                        if (postData.hasOwnProperty('rows')) {
                            postData['take'] = postData['rows'];
                            delete (postData['rows']);
                        }

                        _.forEach(colModel, (item) => {
                            if (postData.hasOwnProperty(item.index)) {
                                postData[item.index + 'Contains'] = postData[item.index];
                                delete (postData[item.index]);
                            }
                        });

                        if (postData.hasOwnProperty('sidx') && postData['sidx'] !== null) {
                            if (postData['sord'] === 'asc') {
                                postData['OrderBy'] = postData['sidx'];
                                postData['OrderByDesc'] = '';
                            } else {
                                postData['OrderByDesc'] = postData['sidx'];
                                postData['OrderBy'] = '';
                            }
                            delete (postData['sidx']);
                            delete (postData['sord']);
                        }
                        return postData;
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.system.permissionedit';
                            $state.go(stateName, { permissionId: rowId });
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
    .controller('SystemRolesListController', ['$scope', '$state', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.system.rolenew');
        }

        $scope.edit = (id) => {
            $state.go('app.system.roleedit', { roleId: id });
        }
    }])
    .controller('SystemRoleEditController', ($scope, $state, $translate, Restangular, $stateParams, toastr) => {
        var id = $stateParams.roleId;

        $scope.role = {};
        $scope.params = {
            roleId: id,
            unassignedSelection: [],
            assignedSelection: [],
            unassignedPermissions: [],
            assignedPermissions: [],
            showPermissions: false
        };

        function load() {
            if (id) {
                Restangular.one('system').one('roles', id).get().then(result => {
                    $scope.role = result;
                });
            }
        }

        load();

        $scope.addUsers = () => {
            if ($scope.params.unassignedSelection.length > 0) {
                var ids = _.map($scope.params.unassignedSelection, 'id');
                Restangular.service('/system/roles/' + $scope.role.id + '/users').post({ userIds: ids }).then(() => {
                    $scope.$broadcast('loadUsers');
                });
            }
        }

        $scope.removeUsers = () => {
            if ($scope.params.assignedSelection.length > 0) {
                var ids = _.map($scope.params.assignedSelection, 'id');
                Restangular.service('/system/roles/' + $scope.role.id + '/users/delete').post({ userIds: ids }).then(() => {
                    $scope.$broadcast('loadUsers');
                });
            }
        }

        $scope.addPermissions = () => {
            if ($scope.params.unassignedPermissions.length > 0) {
                var ids = _.map($scope.params.unassignedPermissions, 'id');
                Restangular.service('/system/roles/' + $scope.role.id + '/permissions').post({ permissionIds: ids }).then(() => {
                    $scope.$broadcast('loadPermissions');
                    toastr.success('Asignación de permisos a rol', 'La operación se realizó con éxito.');
                }, () => {
                    toastr.error('Asignación de permisos a rol', 'Se produjo un error al realizar la operación.');
                });
            }
        }

        $scope.removePermissions = () => {
            if ($scope.params.assignedPermissions.length > 0) {
                var ids = _.map($scope.params.assignedPermissions, 'id');
                Restangular.service('/system/roles/' + $scope.role.id + '/permissions/delete').post({ permissionIds: ids }).then(() => {
                    $scope.$broadcast('loadPermissions');
                    toastr.success('Asignación de permisos a rol', 'La operación se realizó con éxito.');
                }, () => {
                    toastr.error('Asignación de permisos a rol', 'Se produjo un error al realizar la operación.');
                });
            }
        }

        $scope.save = () => {
            if ($scope.role.id) {
                $scope.role.put().then(() => { $state.go('app.system.roles'); });
            } else if ($scope.role.name) {
                Restangular.service('system/roles').post($scope.role).then(() => { $state.go('app.system.roles'); });
            }
        }

        $scope.delete = () => {
            if ($scope.role.id) {
                $scope.role.remove().then(() => {
                    $state.go('app.system.roles');
                });
            }
        }
    })
    .directive('systemRolesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemRolesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;
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
                    {
                        name: 'name', index: 'nameContains', sortable: true, search: true
                    }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/system/roles.json',
                    datatype: 'json',
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
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
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
                            var stateName = 'app.system.roleedit';
                            $state.go(stateName, { roleId: rowId });
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
    .directive('systemLocalizationGrid', ($state, $translate, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', Resources: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemLocalizationGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 250;
                scope.selectedRow = null;
                var translateOptions = '1: ' + $translate.instant('language.english') +
                    '; 2 : ' + $translate.instant('language.spanish');
                var colNames = ['', 'Name', 'Language', 'Value'];
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
                    {
                        name: 'name', index: 'name', sortable: true, search: true, editable: true
                    },
                    {
                        name: 'languageId', index: 'languageId', width: 23, sortable: false, search: false,
                        formatter: languageFormatter, editable: true, edittype: 'select', editoptions: { value: translateOptions }
                    },
                    {
                        name: 'value', index: 'value', sortable: true, search: true, editable: true
                    }
                ]; // TODO: Tranlsate

                function languageFormatter(cellvalue) {
                    switch (+cellvalue) {
                        case 1:
                            return 'Ingles';
                        case 2:
                            return 'Español';
                    }

                    return cellvalue;
                }

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/localization/resources.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    colNames: colNames,
                    colModel: colModel,
                    //scroll: 1,
                    sortname: 'id',
                    sortorder: 'asc',
                    mtype: 'GET',
                    gridview: false,
                    pgbuttons: true,
                    rowNum: 10,
                    rowList: [10, 20, 30],
                    pager: pagerElementName,
                    viewrecords: true,
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    jsonReader: {
                        page: obj => ((obj.offset / 100) + 1),
                        total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },

                    editurl: API_HOST + '/api/localization/resources',
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },

                    loadComplete: () => {
                        // Para cargar todo en modo edit 
                        /* var ids = gridElement.jqGrid('getDataIDs'), i, l = ids.length;
                        for (i = 0; i < l; i++) {
                            // para guardar debe presiona enter
                            gridElement.jqGrid('editRow', ids[i], { keys: true, url: '' })
                                });
                        }*/
                    },
                    afterInsertRow: (rowid, rowdata) => {
                        if (!rowdata['name']) {
                            if (scope.selectedRow != null && rowid !== scope.selectedRow) {
                                gridElement.jqGrid('restoreRow', scope.selectedRow);

                                // POST data no functiona
                                gridElement.jqGrid('editRow', rowid, {
                                    keys: true,
                                    url: API_HOST + "/api/localization/resources",
                                    mtype: "POST"
                                });

                            }
                        }
                        scope.selectedRow = rowid;


                    },
                    onCellSelect(rowid) {

                        gridElement.jqGrid('editRow', rowid, {
                            keys: true,
                            url: API_HOST + '/api/localization/resources/' + rowid,
                            mtype: 'PUT'
                        });

                        if (scope.selectedRow != null && rowid !== scope.selectedRow) {
                            gridElement.jqGrid('restoreRow', scope.selectedRow);

                        }
                        scope.selectedRow = rowid;
                    }

                });


                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false,
                    search: false
                });

                gridElement.jqGrid('inlineNav', '#' + pagerElementName);
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');
            }
        };
    })
    .directive('systemPermissionUsersGrid', ($state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@', permissionId: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemPermissionUsersGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                var colNames = ['Nombre', 'Persona'];
                var colModel: Array<any> = [
                    { name: 'name', index: 'name', search: true },
                    { name: 'personName', index: 'personName', search: true }
                ];
                
                gridElement.jqGrid({
                    regional: 'es-ar',
                    datatype: 'local',
                    height: scope.height || 100,
                    autowidth: true,
                    colNames: colNames,
                    colModel: colModel,
                    multiselect: true,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    cellEdit: true,
                    cellsubmit: 'clientArray',
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
                    loadComplete: (data) => {
                        var items = _.filter(data.results, 'active');
                        var checkedItemsIds = _.map(items, 'id');
                        for (var i = 0, count = checkedItemsIds.length; i < count; i += 1) {
                            gridElement.jqGrid('setSelection', checkedItemsIds[i], false);
                        }
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                scope.$watch('permissionId', (value) => {
                    if (value) {
                        scope.permissionId = +value;
                        var url = API_HOST + '/api/system/permissions/' + value + '/users.json';
                        gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                        gridElement.trigger('reloadGrid');
                    }
                });
            }
        };
    })
    .directive('systemPermissionRolesGrid', ($authManager, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', permissionId: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemPermissionRolesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                var colNames = ['Nombre'];
                var colModel: Array<any> = [
                    { name: 'name', index: 'nameContains', search: true }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    datatype: 'local',
                    height: scope.height || 100,
                    autowidth: true,
                    shrinkToFit: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    multiselect: true,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    cellEdit: true,
                    cellsubmit: 'clientArray',
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
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
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                scope.$watch('permissionId', (value) => {
                    if (value) {
                        scope.permissionId = +value;
                        var url = API_HOST + '/api/system/permissions/' + value + '/roles.json';
                        gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                        gridElement.trigger('reloadGrid');
                    }
                });
            }
        };
    })
    .directive('systemRoleUsersGrid', ($state, $timeout, authManager) => {
        return {
            restrict: 'A',
            scope: { id: '@', height: '@', roleId: '=', view: '=', selectedItems: '=' },
            link(scope: any, element) {
                $timeout(() => {
                    scope.id = scope.id || 'systemRoleUsersGrid';
                    scope.height = 250;
                    scope.view = scope.view || 0;

                    var gridElementName = scope.id;
                    var pagerElementName = gridElementName + 'Pager';
                    var gridElement = angular.element('<table></table>');
                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);

                    var colNames = ['Nombre', ''];
                    var colModel: Array<any> = [
                        { name: 'userName', index: 'userName', search: true, editable: false },
                        { name: 'userRoleId', index: 'userRoleId', hidden: true }
                    ];
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'local',
                        height: scope.height,
                        autowidth: true,
                        shrinkToFit: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: colNames,
                        colModel: colModel,
                        multiselect: true,
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
                            var postData = gridElement.jqGrid('getGridParam', 'postData');
                            //var colModel = gridElement.jqGrid('getGridParam', 'colModel');

                            gridElement.jqGrid('setGridParam', { postData: { view: scope.view } });
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                            delete postData.orderBy;
                            delete postData.orderByDesc;

                            if (postData.sidx) {
                                if (postData.sord === 'asc') {
                                    gridElement.jqGrid('setGridParam', { postData: { orderBy: postData.sidx } });
                                }
                                if (postData.sord === 'desc') {
                                    gridElement.jqGrid('setGridParam', { postData: { orderByDesc: postData.sidx } });
                                }
                            }

                            delete postData.sidx;
                            delete postData.sord;
                        },
                        loadComplete: () => {
                            gridElement.jqGrid('hideCol', 'Checked');
                        },
                        onSelectRow: (rowId, status) => {
                            if (status) {
                                var rowData = gridElement.jqGrid('getRowData', rowId);
                                var rowIndex = _.findIndex(scope.selectedItems, (value: any) => {
                                    return value.id === rowId;
                                });

                                if (rowIndex === -1) {
                                    var item = {
                                        id: rowId,
                                        name: rowData.userName
                                    }
                                    scope.selectedItems.push(item);
                                }
                            } else {
                                var rowIndex1 = _.findIndex(scope.selectedItems, { 'id': rowId });
                                scope.selectedItems.splice(rowIndex1, 1);
                            }

                            scope.$apply();
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                        del: false,
                        add: false,
                        edit: false
                    }, {}, {}, {}, { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');

                    function loadData() {
                        var url = API_HOST + '/api/system/roles/' + scope.roleId + '/users.json';
                        gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                        gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                        gridElement.trigger('reloadGrid');
                    }

                    scope.$on('loadUsers', () => {
                        loadData();
                    });

                    loadData();
                }, 0);
            }
        };
    })
    .directive('systemRolePermissionsGrid', ($state, $timeout, authManager) => {
        return {
            restrict: 'A',
            scope: { id: '@', height: '@', roleId: '=', view: '=', selectedItems: '=' },
            link(scope: any, element) {
                var isCreated = false;
                var loadData = null;

                $timeout(() => {
                    function createGrid() {
                        scope.id = scope.id || 'systemRolePermissionsGrid';
                        scope.height = 250;
                        scope.view = scope.view || 0;

                        var gridElementName = scope.id;
                        var pagerElementName = gridElementName + 'Pager';
                        var gridElement = angular.element('<table></table>');
                        gridElement.attr('id', gridElementName);
                        var pagerElement = angular.element('<div></div>');
                        pagerElement.attr('id', pagerElementName);
                        element.append(gridElement);
                        element.append(pagerElement);

                        var colNames = ['Nombre', ''];
                        var colModel: Array<any> = [
                            { name: 'permissionName', index: 'permissionName', search: true, editable: false },
                            { name: 'userPermissionId', index: 'userPermissionId', hidden: true }
                        ];
                        gridElement.jqGrid({
                            regional: 'es-ar',
                            datatype: 'local',
                            height: scope.height,
                            autowidth: true,
                            shrinkToFit: true,
                            responsive: true,
                            styleUI: 'Bootstrap',
                            colNames: colNames,
                            colModel: colModel,
                            multiselect: true,
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
                                var postData = gridElement.jqGrid('getGridParam', 'postData');
                                gridElement.jqGrid('setGridParam', { postData: { view: scope.view } });
                                gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                                delete postData.orderBy;
                                delete postData.orderByDesc;

                                if (postData.sidx) {
                                    if (postData.sord === 'asc') {
                                        gridElement.jqGrid('setGridParam', { postData: { orderBy: postData.sidx } });
                                    }
                                    if (postData.sord === 'desc') {
                                        gridElement.jqGrid('setGridParam', { postData: { orderByDesc: postData.sidx } });
                                    }
                                }

                                delete postData.sidx;
                                delete postData.sord;
                            },
                            loadComplete: (data) => {
                                gridElement.jqGrid('hideCol', 'Checked');
                            },
                            onSelectRow: (rowId, status) => {
                                if (status) {
                                    var rowData = gridElement.jqGrid('getRowData', rowId);
                                    var rowIndex = _.findIndex(scope.selectedItems, (value: any) => {
                                        return value.id === rowId;
                                    });

                                    if (rowIndex === -1) {
                                        var item = {
                                            id: rowId,
                                            name: rowData.permissionName
                                        }
                                        scope.selectedItems.push(item);
                                    }
                                } else {
                                    var rowIndex = _.findIndex(scope.selectedItems, { 'id': rowId });
                                    scope.selectedItems.splice(rowIndex, 1);
                                }

                                scope.$apply();
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
                            var url = API_HOST + '/api/system/roles/' + scope.roleId + '/permissions.json';
                            gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                            gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                            gridElement.trigger('reloadGrid');
                        }
                    }

                    if (!isCreated) {
                        createGrid();
                        isCreated = true;
                    }
                    loadData();

                    scope.$on('loadPermissions', () => {
                        loadData();
                    });
                }, 0);
            }
        };
    })
    .directive('systemUserPermissionsGrid', ($timeout, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', userId: '=' },
            link(scope: any, element) {
                $timeout(() => {
                    var gridElementName = 'systemUserPermissionsGrid';
                    var pagerElementName = gridElementName + 'Pager';
                    var gridElement = angular.element('<table></table>');
                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);

                    scope.height = 250;
                    var colNames = ['Permiso', ''];
                    var colModel: Array<any> = [
                        { name: 'permissionName', index: 'permissionName', search: true, editable: false },
                        { name: 'userPermissionId', index: 'userPermissionId', hidden: true }
                    ];
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        url: API_HOST + '/api/system/users/' + scope.userId + '/permissions.json',
                        datatype: 'json',
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: colNames,
                        colModel: colModel,
                        multiselect: true,
                        scroll: 1,
                        mtype: 'GET',
                        gridview: true,
                        pager: pagerElementName,
                        viewrecords: true,
                        cellEdit: true,
                        cellsubmit: 'clientArray',
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
                        }
                    });
                    gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                        del: false,
                        add: false,
                        edit: false
                    }, {}, {}, {}, { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');
                });
            }
        };
    })
    .directive('systemUserRolesGrid', ($timeout, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', userId: '=', selectedItems: '=' },
            link(scope: any, element) {
                $timeout(() => {
                    scope.id = scope.id || 'systemUserRolesGrid';
                    scope.height = 250;
                    scope.view = scope.view || 0;

                    var gridElementName = scope.id;
                    var pagerElementName = gridElementName + 'Pager';
                    var gridElement = angular.element('<table></table>');
                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);

                    var colNames = ['Nombre', ''];
                    var colModel: Array<any> = [
                        { name: 'roleName', index: 'userName', search: true, editable: false },
                        { name: 'roleUserId', index: 'roleUserId', hidden: true }
                    ];
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'local',
                        height: scope.height,
                        autowidth: true,
                        shrinkToFit: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: colNames,
                        colModel: colModel,
                        multiselect: true,
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
                            var postData = gridElement.jqGrid('getGridParam', 'postData');
                            //var colModel = gridElement.jqGrid('getGridParam', 'colModel');

                            gridElement.jqGrid('setGridParam', { postData: { view: scope.view } });
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                            delete postData.orderBy;
                            delete postData.orderByDesc;

                            if (postData.sidx) {
                                if (postData.sord === 'asc') {
                                    gridElement.jqGrid('setGridParam', { postData: { orderBy: postData.sidx } });
                                }
                                if (postData.sord === 'desc') {
                                    gridElement.jqGrid('setGridParam', { postData: { orderByDesc: postData.sidx } });
                                }
                            }

                            delete postData.sidx;
                            delete postData.sord;
                        },
                        loadComplete: () => {
                            gridElement.jqGrid('hideCol', 'Checked');
                        },
                        onSelectRow: (rowId, status) => {
                            if (status) {
                                var rowData = gridElement.jqGrid('getRowData', rowId);
                                var rowIndex = _.findIndex(scope.selectedItems, (value: any) => {
                                    return value.id === rowId;
                                });

                                if (rowIndex === -1) {
                                    var item = {
                                        id: rowId,
                                        name: rowData.userName
                                    }
                                    scope.selectedItems.push(item);
                                }
                            } else {
                                var rowIndex = _.findIndex(scope.selectedItems, { 'id': rowId });
                                scope.selectedItems.splice(rowIndex, 1);
                            }

                            scope.$apply();
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                        del: false,
                        add: false,
                        edit: false
                    }, {}, {}, {}, { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');

                    function loadData() {
                        var url = API_HOST + '/api/system/users/' + scope.userId + '/roles.json';
                        gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                        gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                        gridElement.trigger('reloadGrid');
                    }

                    scope.$on('loadRoles', (event, personId) => {
                        loadData();
                    });

                    loadData();
                }, 0);
            }
        };
    })
    .controller('SystemLocalizationResourcesListController', ($scope) => {
        $scope.params = {
            Resources: []
        };
    })
    .controller('SystemNavigationController', ($log, $scope, $state, $translate, $stateParams, Restangular, toastr, dialogs) => {
        $scope.selectedItem = {};
        $scope.options = {};
        $scope.params = { editorVisible: true };

        $scope.toggle = (scope) => {
            scope.toggle();
        };

        $scope.save = () => {
            var service = Restangular.service('system/navigation');
            if ($scope.selectedItem.id) {
                Restangular.all('system').one('navigation').customPUT($scope.selectedItem, $scope.selectedItem.id).then(
                    () => {
                        $scope.editorVisible = false;
                        toastr.success('La operación se realizó con éxito.', 'Administrador de navegación');
                    });
            } else {
                service.post($scope.selectedItem).then(() => {
                    $scope.editorVisible = false;
                    toastr.success('La operación se realizó con éxito.', 'Administrador de navegación');
                });
            }
        }

        $scope.editNode = () => {
            $scope.selectedItem =
                {
                    id: $scope.id,
                    name: $scope.$modelValue.text,
                    state: $scope.$modelValue.state
                }
        }

        $scope.canRemove = () => {
            return $scope.selectedItem.id && $scope.selectedItem.childCount === 0;
        }

        $scope.remove = () => {
            var dlg = dialogs.confirm('Administrador de navegación', 'Está seguro que desea eliminar este elemento?');
            dlg.result.then(() => {
                Restangular.one('system').one('navigation', $scope.selectedItem.id).remove().then(() => {
                    toastr.success('El elemento se eliminó con éxito.', 'Administrador de navegación');
                    $scope.selectedItem = null;
                    $scope.$broadcast('reload');
                });
            });
        };

        $scope.newNavigation = () => {
            var parentNode = $scope.selectedItem;
            var parentId = parentNode == null ? null : parentNode.id;
            $scope.selectedItem = {
                parentId: parentId
            };
        };
    })
    .directive('systemNavigationTree', ($log, $state, $http, $timeout, Restangular, toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItem: '=' },
            link(scope: any, element) {
                $timeout(() => {
                    $http.get(API_HOST + '/api/system/navigation')
                        .then((result) => {
                            var position = 0;

                            function onDrop(e) {
                                switch (e.dropPosition) {
                                    case 'over':
                                        position = 0;
                                        break;
                                    case 'before':
                                        position = 1;
                                        break;
                                    case 'after':
                                        position = 2;
                                        break;
                                }

                                var sourceDataItem = this.dataItem(e.sourceNode);
                                var targetDataItem = this.dataItem(e.destinationNode);


                                $log.info(sourceDataItem.id + ' dropped ' + e.dropPosition + ' ' + targetDataItem.id);
                                Restangular.service('system/navigation/' + sourceDataItem.id + '/move').post({ targetId: targetDataItem.id, position: position }).then(() => {
                                    toastr.success('El elemento se reubicó correctamente.', 'Editor de navegación');
                                }, () => {
                                    toastr.error('Hubo un error al intentar reubicar el elemento.', 'Editor de navegación');
                                });
                            }

                            var treeView = element.kendoTreeView({
                                dragAndDrop: true,
                                loadOnDemand: false,
                                template: kendo.template($('#navigationTreeViewTemplate').html()),
                                dataSource: new kendo.data.HierarchicalDataSource({ data: result.data }),
                                select: (e) => {
                                    var dataItem:any = angular.copy(treeView.dataItem(e.node));
                                    dataItem.childCount = dataItem.items.length;
                                    delete dataItem.items;
                                    scope.selectedItem = dataItem;
                                    scope.$apply();
                                },
                                expand: (e) => {
                                    $log.info('expanded: ' + e.node);
                                },
                                drop: onDrop
                            }).data('kendoTreeView');
                        });
                }, 0);
            }
        };
    })
    .directive('systemPermissionLookup', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: (scope, element, attr: any, ctrl:any) => {
                if (!ctrl) return;

                var required = attr.required ? attr.required : false;
                ctrl.$render = () => {
                    var model = scope.$eval(attr.ngModel);
                    if (model) {
                        element.val(model);
                    }

                    element.select2({
                        placeholder: 'Seleccione un permiso',
                        allowClear: !required,
                        initSelection: (element1, callback) => {
                            if (ctrl.$modelValue) {
                                var url = API_HOST + '/api/system/permissions/' + ctrl.$modelValue;
                                $.getJSON(url, { format: 'json' }, data => {
                                    callback({ id: data.id, text: data.name });
                                });
                            }
                        },
                        ajax: {
                            url: API_HOST + '/api/system/permissions/lookup?format=json',
                            dataType: 'json',
                            quietMillis: 100,
                            data: (term, page) => {
                                return {
                                    q: term,
                                    pageSize: 15,
                                    page: page
                                };
                            },
                            results: (data, page) => {
                                var more = (page * 10) < data.total;
                                return { results: data.data, more: more };
                            }
                        }
                    });
                };

                // Watch the model for programmatic changes
                scope.$watch(attr.ngModel, (current, old) => {
                    if (!current) {
                        return;
                    }
                    if (current === old) {
                        return;
                    }
                    ctrl.$render();
                }, true);

                element.bind('change', () => {
                    scope.$apply(() => {
                        var data = element.select2('data');
                        ctrl.$setViewValue(data ? data.id : null);
                    });
                });

                attr.$observe('disabled', value => {
                    element.select2(value && 'disable' || 'enable');
                });
            }
        };
    });
