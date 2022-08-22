angular.module('app.system.workflows', ['app.core', 'ngSanitize'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.system.workflows', {
                url: '/workflows',
                controller: 'SystemWorkflowsListController',
                templateUrl: 'app/system/workflows/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.system',
                    label: 'system.workflows'
                }
            })
            .state('app.system.workflownew', {
                url: '/workflows/new',
                controller: 'SystemWorkflowEditController',
                resolve: loadSequence('bpmn-viewer', 'jqueryui', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                templateUrl: 'app/system/workflows/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.workflows',
                    label: 'system.workflow.new'
                }
            })
            .state('app.system.workflow', {
                url: '/workflows/{workflowId}',
                controller: 'SystemWorkflowEditController',
                resolve: loadSequence('bpmn-viewer', 'ui.router.tabs', 'jqueryui', 'ui.tree', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                templateUrl: 'app/system/workflows/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.workflows',
                    label: '{{workflow.code}}'
                }
            })
            .state('app.system.workflow.designer', {
                url: '/designer',
                templateUrl: 'app/system/workflows/edit.designer.html',
                ncyBreadcrumb: {
                    parent: 'app.system.workflow',
                    label: 'Diseño'
                }
            })
            .state('app.system.workflow.activities', {
                url: '/activities',
                templateUrl: 'app/system/workflows/edit.activities.html',
                ncyBreadcrumb: {
                    parent: 'app.system.workflow',
                    label: 'Actividades'
                }
            })
            .state('app.system.workflow.tags', {
                url: '/tags',
                controller: 'SystemWorkflowTagsController',
                templateUrl: 'app/system/workflows/edit.tags.html',
                resolve: loadSequence('ui.tree', 'icheck', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.system.workflow',
                    label: 'Tags'
                }
            });
    }
    ])
    .controller('SystemWorkflowsListController', ['$scope', '$state', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.system.workflownew');
        }

        $scope.params = {
            selectedItems: []
        };
    }
    ])
    .controller('SystemWorkflowEditController', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'toastr', ($scope, $state, $stateParams, $log, Restangular, toastr) => {
        var id = $stateParams.workflowId;

        $scope.params = { workflowId: id };

        $scope.tabData = [
            {
                heading: 'Diseño',
                route: 'app.system.workflow.designer'
            },
            {
                heading: 'Actividades',
                route: 'app.system.workflow.activities',
                disable: false
            },
            {
                heading: 'Tags',
                route: 'app.system.workflow.tags',
                disable: false
            }
        ];

        $scope.manageActivity = (activityId) => {
            $scope.selectedActivity = _.find($scope.workflow.activities, { id: activityId });
        }

        $scope.manageActivityRole = (activityRoleId) => {
            Restangular.one('system').one('workflows', $scope.workflow.id).one('activities', $scope.selectedActivity.id).one('roles', activityRoleId).get().then(result => {
                $scope.selectedActivityRole = result;
            });
        }

        $scope.addWorkflowActivityRole = () => {
            var activityRole = {
                workflowActivityId: $scope.selectedActivity.id,
                roleId: $scope.params.roleId,
                isDefault: false
            };
            Restangular.one('system').one('workflows', $scope.workflow.id).one('activities', $scope.selectedActivity.id).post('roles', activityRole).then(result => {
                $scope.params.roleId = null;
                toastr.success('Asignación de rol', 'La operación se realizó con éxito.');
                $scope.$broadcast('reloadRoles');
            });
        };

        function load() {
            if (id) {
                Restangular.one('system').one('workflows').one('workflows', id).get().then(result => {
                    $scope.workflow = result;
                });
            }
        }

        load();
    }
    ])
    .controller('SystemWorkflowTagsController', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'toastr', ($scope, $state, $stateParams, $log, Restangular, toastr) => {
        $scope.$watch('workflow', (workflow) => {
            if (workflow) {
                $scope.isdragdrop = false;
                $scope.treeOptions = {
                    beforeDrag: (sourceNodeScope) => {
                        $scope.isdragdrop = true;
                        return true;

                    },
                    accept: (sourceNodeScope, destNodesScope, destIndex) => {
                        var srcId = sourceNodeScope.$modelValue.Id;
                        var destId = destNodesScope.$modelValue[0].Id;
                        $scope.acceptable = true;
                        return $scope.acceptable;
                    },
                    dropped: (event) => {
                        if (event.dest.nodesScope.$parent.$modelValue == undefined) {
                            //el nuevo padre es null lo estoy llevando a la raiz como padre
                            Restangular.one('system').one('workflows')
                                .one('workflows', event.source.nodeScope.$modelValue.id)
                                .one('tags', event.source.nodeScope.$modelValue.id)
                                .one('parent', 0).post().then(result => {
                                    $log.info("el nuevo padre es null lo estoy llevando a la raiz como padre");
                                });
                        } else {
                            if ((event.source.nodeScope.$parentNodeScope == null) || (event.source.nodeScope.$parentNodeScope.$modelValue.id != event.dest.nodesScope.$parent.$modelValue.id)) {
                                //cuando quiero subir un nodo raiz
                                Restangular.one('system').one('workflows')
                                    .one('workflows', event.source.nodeScope.$modelValue.id)
                                    .one('tags', event.source.nodeScope.$modelValue.id)
                                    .one('parent', event.dest.nodesScope.$parent.$modelValue.id).post().then(result => { });
                            }
                        }

                        if ($scope.acceptable) {
                            var srcNode = event.source.nodeScope;
                            var destNodes = event.dest.nodesScope;
                            var srcId = srcNode.$modelValue.Id;
                            var success = false;
                        }
                        // reset de las banderas de ciclo
                        $scope.acceptable = false;
                        $scope.isdragdrop = false;
                    },
                    itemRemoved: (scope, modelData, sourceIndex) => { },
                    removed: (node) => {
                        if ($scope.isdragdrop) { }
                        else {
                            Restangular.one('system').one('workflows')
                                .one('workflows', node.$modelValue.id)
                                .one('tags', node.$modelValue.id)
                                .remove().then(result => { });
                        }
                    }
                };
                $scope.editNode = (scope) => {
                    $log.info(scope.$modelValue.id);
                    $log.info(scope.$modelValue.name);
                    $log.info(scope.$modelValue.parentId);
                    $scope.selectedTag = scope.$modelValue;
                }
                $scope.editNewNode = (scope) => {
                    $log.info(scope.id);
                    $log.info(scope.name);
                    $log.info(scope.parentId);
                    $scope.selectedTag = scope;
                }
                $scope.saveTag = (scope) => {
                    var workflowTag = {
                        id: $scope.selectedTag.id,
                        name: $scope.selectedTag.name,
                        workflowId: $stateParams.workflowId,
                        parentId: $scope.selectedTag.parentId
                    };

                    if ($scope.selectedTag.parentId == undefined) $scope.selectedTag.parentId = 0;
                    Restangular.one('system').one('workflows')
                        .one('workflows', $stateParams.workflowId)
                        .all('tags')
                        .post(workflowTag).then(result => {
                            if ($scope.selectedTag.id === 0) // nodo sin padre
                            {
                                var length = $scope.items.push({
                                    id: result.id,
                                    name: $scope.selectedTag.name,
                                    workflowId: $stateParams.workflowId,
                                    parentId: 0,
                                    items: []
                                });
                            }
                            $scope.cancelTag();
                        });
                }

                $scope.newNode = (scope) => {
                    var nodeData = scope.$modelValue;
                    var workflowTag = {
                        id: 0,
                        name: 'Nuevo Nodo',
                        workflowId: $stateParams.workflowId,
                        parentId: scope.$modelValue.id
                    };

                    Restangular.one('system').one('workflows')
                        .one('workflows', $stateParams.workflowId)
                        .all('tags')
                        .post(workflowTag).then(result => {
                            var length = nodeData.items.push({
                                id: result.id,
                                name: 'Nuevo Nodo',
                                workflowId: $stateParams.workflowId,
                                parentId: scope.$modelValue.id,
                                items: []
                            });

                            var item = nodeData.items[length - 1];
                            $log.info(item);
                            scope.$modelValue = item;
                            $scope.editNode(scope);


                        }, (res) => {
                            $log.info('There was an error saving' + res.status);
                        });
                };

                $scope.cancelTag = () => {
                    $scope.selectedTag = {
                        id: 0,
                        name: '',
                        workflowId: $scope.workflow.id,
                        parentId: 0,
                        items: []
                    };
                };

                $scope.remove = (scope) => {
                    scope.remove();
                };

                $scope.toggle = (scope) => {
                    scope.toggle();
                };

                $scope.collapseAll = () => {
                    $scope.$broadcast('angular-ui-tree:collapse-all');
                };

                $scope.expandAll = () => {
                    $scope.$broadcast('angular-ui-tree:expand-all');
                };

                Restangular.one('system').one('workflows').one('workflows', $scope.workflow.id).one('tags').get().then(result => {
                    $scope.items = result.plain() || [];
                    $scope.selectedTag = {
                        id: 0,
                        name: '',
                        workflowId: $scope.workflow.id,
                        parentId: 0,
                        items: []
                    };
                });
            }
        });
    }])
    .directive('systemWorkflowInstanceHistory', ['$log', ($log) => {
        return {
            restrict: 'AE',
            replace: true,
            require: 'ngModel',
            scope: { workflowInstance: '=ngModel' },
            templateUrl: 'app/system/workflows/workflowinstancehistory.html',
            link(scope: any, element) {
            }
        };
    }])
    .directive('bpmnViewer', ['$log', '$window', '$http', ($log, $window, $http) => {
        return {
            restrict: 'AE',
            replace: true,
            //require: 'ngModel',
            //scope: { workflowInstance: '=ngModel' },
            link(scope: any, element: any) {
                element.height = '400px';
                // we use $.ajax to load the diagram.
                // make sure you run the application via web-server (ie. connect (node) or asdf (ruby))

                // require the viewer, make sure you added the bpmn-js bower distribution
                // along with all its dependencies to the web site
                var BpmnViewer = $window.BpmnJS;
                var viewer = new BpmnViewer({ container: element });

                $http.get("/content/pizza-collaboration.xml")
                    .then((response) => {
                        viewer.importXML(response.data, (err) => {
                            if (!err) {
                                viewer.get('canvas').zoom('fit-viewport');
                            } else {
                                $log.info('something went wrong:', err);
                            }
                        });
                    });
            }
        };
    }])
    .controller('SystemWorkflowtagsController', ['$scope', '$state', '$translate', '$stateParams', 'Restangular', ($scope, $state, $translate, $stateParams, Restangular) => {
        Restangular.one('system').one('navigation').get().then(result => {
            $scope.items = result;
        });

        $scope.selectedItem = {};
        $scope.options = {
            dropped: (event) => {
            }
        };
        $scope.params = { editorVisible: true };

        $scope.remove = (scope) => {
            scope.remove();
        };

        $scope.toggle = (scope) => {
            scope.toggle();
        };

        $scope.saveNavigation = () => {
            if ($scope.navigation !== 0)
                Restangular.service('system/navigation').post($scope.navigation).then(() => { $scope.editorVisible = false; });
            else
                Restangular.service('system/navigation').post($scope.navigation).then(() => { $scope.editorVisible = false; });
        }

        $scope.editNode = (scope) => {
            $scope.selectedItem = scope.$modelValue;
        }

        $scope.newNavigation = () => {
            $scope.selectedItem = $scope.selectedItem;
        };
    }])
    .directive('systemWorkflowsWorkflowsGrid', ['$state','authManager', ($state,authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemWorkflowsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;
                var colNames = ['', 'Nombre', 'Código', 'Descripción'];
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
                    { name: 'name', index: 'name' },
                    { name: 'code', index: 'code' },
                    { name: 'description', index: 'description' }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/system/workflows/workflows.json',
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
                    jsonReader: {
                        page: obj => ((obj.offset / 100) + 1),
                        total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
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
                            var stateName = 'app.system.workflow.activities';
                            $state.go(stateName, { workflowId: rowId });
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
    }])
    .directive('systemWorkflowsWorkflowActivityRolesGrid', ['$state', '$log', '$compile', 'Restangular', 'dialogs', 'toastr','authManager', ($state, $log, $compile, Restangular, dialogs, toastr,authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', activity: '=', onSelected: '&' },
            link(scope: any, element) {
                var gridElementName = 'systemWorkflowsWorkflowActivityRolesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;

                var colNames = ['', 'Nombre', 'Predeterminado', ''];
                var colModel: Array<any> = [
                    {
                        name: 'selectCommand',
                        index: 'selectCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: (cellValue, options, rowObject) => { return '<i data-ng-click="onSelected({activityRoleId:' + rowObject.id + '})" class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'roleName', index: 'roleName' },
                    { name: 'isDefault', index: 'isDefault', fixed: true, width: 130, formatter: 'checkbox' },
                    {
                        name: 'removeCommand',
                        index: 'removeCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: (cellValue, options, rowObject) => { return '<i data-ng-click="removeWorkflowActivityRole(' + rowObject.id + ')" class="fa fa-trash-o fa-fw hand"></i>'; }
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
                    loadComplete: () => {
                        $compile(angular.element('#' + gridElementName))(scope);
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                scope.removeWorkflowActivityRole = (id) => {
                    var dlg = dialogs.confirm('Eliminar asignación de rol', 'Está seguro que desea eliminar esta asignación?');
                    dlg.result.then((btn) => {
                        Restangular.one('system').one('workflows', scope.activity.workflowId).one('activities', scope.activity.id).one('roles', id).remove().then(result => {
                            toastr.success('Asignación de permisos a rol', 'La operación se realizó con éxito.');
                            gridElement.trigger('reloadGrid');
                        });
                    });
                };

                scope.$watch('activity', (value) => {
                    if (value) {
                        var url = API_HOST + '/api/system/workflows/' + value.workflowId + '/activities/' + value.id + '/roles.json';
                        gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                        gridElement.trigger('reloadGrid');
                    }
                });

                scope.$on('reloadRoles', () => {
                    gridElement.trigger('reloadGrid');
                });
            }
        };
    }])
    .directive('systemWorkflowsWorkflowActivityRolePermissionsGrid', ['$state', '$log', '$compile', 'Restangular', 'dialogs', 'toastr','authManager', ($state, $log, $compile, Restangular, dialogs, toastr,authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', data: '=' },
            link(scope: any, element) {
                var gridElementName = 'systemWorkflowsWorkflowActivityRolePermissionsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;

                var colNames = ['', 'Rol', 'Permiso', ''];
                var colModel: Array<any> = [
                    {
                        name: 'selectCommand',
                        index: 'selectCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => { return '<i class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'roleName', index: 'roleName' },
                    { name: 'permission', index: 'permission', fixed: true, width: 130 },
                    {
                        name: 'removeCommand',
                        index: 'removeCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: (cellValue, options, rowObject) => { return '<i data-ng-click="removeWorkflowActivityRolePermission(' + rowObject.id + ')" class="fa fa-trash-o fa-fw hand"></i>'; }
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
                    rowNum: 100,
                    gridview: true,
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    pager: pagerElementName,
                    viewrecords: true,
                    jsonReader: {
                        cell: '',
                        root: (obj) => { return obj.rows; },
                        page: () => { return 1; },
                        total: () => { return 1; },
                        records: (obj) => { return obj.rows.length; }
                    },

                    beforeSelectRow() {
                        return false;
                    },
                    loadComplete: () => {
                        $compile(angular.element('#' + gridElementName))(scope);
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                scope.removeWorkflowActivityRole = (id) => {
                    var dlg = dialogs.confirm('Eliminar asignación de rol', 'Está seguro que desea eliminar esta asignación?');
                    dlg.result.then((btn) => {
                        Restangular.one('system').one('workflows', scope.activity.workflowId).one('activities', scope.activity.id).one('roles', id).remove().then(result => {
                            toastr.success('Asignación de permisos a rol', 'La operación se realizó con éxito.');
                            gridElement.trigger('reloadGrid');
                        });
                    });
                };

                scope.$watch('data', (value) => {
                    if (value) {
                        gridElement.clearGridData(true);
                        gridElement.setGridParam({ data: value, rowNum: value.length }).trigger('reloadGrid');
                    }
                });
            }
        };
    }])
    .directive('systemWorkflowInstanceTags', ['$timeout', ($timeout) => {
        return {
            restrict: 'E',
            scope: {
                tags: '@tags'
            },
            template: '<span data-ng-repeat="tag in tags track by $index" style="display: inline-block; margin-top: 5px;"><span class="label label-info" style="font-size: 12px; margin-right: 3px;">{{ getPath(tag)}}</span></span>',
            link: (scope:any, el) => {
                $timeout(() => {
                    scope.$watch('tags', (value) => {
                        if (value) {
                            scope.tags = angular.fromJson(scope.tags);

                            scope.getPath = (tag) => {
                                return _.map(angular.fromJson(tag.workflowTagPathPath), 'Name').join(' / ');
                            }
                        }
                    });
                }, 0);
            }
        };
    }
    ])
    .directive('systemWorkflowsTagsLookup', ['$log', '$timeout', ($log, $timeout) => {
        return {
            restrict: 'E',
            scope: {
                items: '=',
                workflowId: '=',
                click: '&'
            },
            templateUrl: 'app/system/workflows/tags-lookup.html',
            link: (scope:any) => {
                $timeout(() => {
                    scope.model = {};

                    scope.getPath = (dataItem) => {
                        return _.map(angular.fromJson(dataItem.workflowTagPathPath), 'Name').join(' / ');
                    }

                    scope.removeTag = (item) => {
                        var index = scope.items.indexOf(item);
                        scope.items.splice(index, 1);
                    };

                    scope.addTag = () => {
                        var tag = {
                            workflowTagPathPath: scope.model.$selected.text,
                            workflowTagId: scope.model.$selected.id
                        };
                        scope.items.push(tag);
                        scope.model = {};
                    };
                }, 0);
            }
        };
    }])
    .directive('systemWorkflowsTagsTree', ['groupFactory', '$timeout', 'Restangular', (groupFactory, $timeout, Restangular) => {
        return {
            restrict: 'E',
            scope: {
                model: '=',
                workflowId: '='
            },
            templateUrl: 'app/system/workflows/tags-tree.html',
            link: (scope:any, el) => {
                scope.breadcrumbs = [{ 'id': 0, 'text': [{ 'Name': '<i class="fa fa-home"></i>' }] }];

                $timeout(() => {
                    scope.getPath = (dataItem) => {
                        if (dataItem) {
                            return _.map(dataItem.text, 'Name').join(' / ');
                        }
                    };

                    scope.load = () => {
                        Restangular.one('system').one('workflows').one('workflows', scope.workflowId).one('tags').one('lookup').get().then(result => {
                            scope.data = _.forEach(result.plain(), (item:any) => { item.text = angular.fromJson(item.text) });
                        });
                    };

                    scope.navigate = (dataItem, $select) => {
                        Restangular.one('system').one('workflows').one('workflows', scope.workflowId).one('tags').one('lookup').get({ parentId: dataItem.id }).then(result => {
                            scope.data = _.forEach(result.plain(), (item:any) => { item.text = angular.fromJson(item.text) });
                            $select.search = '';
                            scope.breadcrumbs.push(dataItem);
                            scope.$broadcast('uiSelectFocus');
                        });
                    };

                    scope.navigateBackTo = (dataItem, $select) => {
                        var id = dataItem.id === 0 ? null : { parentId: dataItem.id };
                        Restangular.one('system').one('workflows').one('workflows', scope.workflowId).one('tags').one('lookup').get(id).then(result => {
                            scope.data = _.forEach(result.plain(), (item:any) => { item.text = angular.fromJson(item.text) });
                            $select.search = '';
                            var index = _.findIndex(scope.breadcrumbs, { id: dataItem.id });
                            scope.breadcrumbs.splice(index + 1, scope.breadcrumbs.length);
                        });
                    };

                    scope.$watch('workflowId', (value) => {
                        if (angular.isDefined(value)) {
                            scope.load();

                            scope.$watch('model', (value, oldValue) => {
                                if ((!angular.isObject(value) || value === {}) && angular.isDefined(oldValue)) {
                                    scope.breadcrumbs = [{ "id": 0, "title": "All" }];
                                }
                            });
                        }
                    });
                }, 0);
            }
        };
    }
    ])
    .directive('systemWorkflowInstanceCommands', ($log, $timeout, session: ISession, Restangular) => {
        return {
            restrict: 'E',
            scope: {
                workflowInstance: '=',
                canApprove: '=?',
                canGoBack: '=?',
                onChange: '&?'
            },
            templateUrl: 'app/system/workflows/workflowinstancecommands.html',
            link: (scope: any, el) => {
                scope.canApprove = scope.canApprove || false;
                scope.canGoBack = scope.canGoBack || true;

                $log.info('canApprove' + scope.canApprove);
                $log.info('canGoBack' + scope.canGoBack);

                scope.assign = (roleId) => {
                    Restangular.service('system/workflows/workflowinstances/' + scope.workflowInstance.guid + '/assign').post({ roleId: roleId }).then(() => {
                        scope.$emit('reload');

                        if (angular.isDefined(scope.onChange)) {
                            scope.onChange();
                        };
                    });
                };
                scope.assignActivity = (activityId) => {      
                    Restangular.service('system/workflows/workflowinstances/' + scope.workflowInstance.guid + '/setstate').post({ workflowActivityId: activityId }).then(() => {
                        scope.$emit('reload');

                        if (angular.isDefined(scope.onChange)) {
                            scope.onChange();
                        };
                    });
                };
                scope.approve = () => {
                    Restangular.service('system/workflows/workflowinstances/' + scope.workflowInstance.guid + '/approve').post({}).then(() => {
                        scope.$emit('reload');

                        if (angular.isDefined(scope.onChange)) {
                            scope.onChange();
                        };
                    });
                };

                scope.terminate = (reasonId) => {
                    Restangular.service('system/workflows/workflowinstances/' + scope.workflowInstance.guid + '/terminate').post({ reasonId: reasonId }).then(() => {
                        scope.$emit('reload');

                        if (angular.isDefined(scope.onChange)) {
                            scope.onChange();
                        };
                    });
                };

                scope.setPreviousState = () => {
                    Restangular.service('system/workflows/workflowinstances/' + scope.workflowInstance.guid + '/previousstate').post({}).then(() => {
                        scope.$emit('reload');

                        if (angular.isDefined(scope.onChange)) {
                            scope.onChange();
                        };
                    });
                };

                scope.$watch('workflowInstance', (value) => {
                    console.log(value);
                    if (angular.isDefined(value) && value != null) {     
                        console.log(scope.workflowInstance.assignedRoles)  ;                 
                        var allowedRoles = _.map(scope.workflowInstance.assignedRoles, 'roleName');
                        var allowedActivities = _.map(scope.workflowInstance.canSetActivities, 'name');
                        var isActivities = _.intersection(session.activities, allowedActivities).length > 0;
                        var isAssigned = _.intersection(session.roles, allowedRoles).length > 0;
                        var isSupervisor = _.filter(scope.workflowInstance.userPermissions, (item: any) => { return _.includes(session.roles, item.roleName) && item.permission === 2 }).length > 0;
                        var isAdmin = session.isAdmin();

                        scope.hasPermission =true;// (isAdmin || isAssigned || isSupervisor) && !scope.workflowInstance.isTerminated && !scope.workflowInstance.currentWorkflowActivity.isFinal;
                        $log.info('value' + value.currentWorkflowActivity.id);
                        $log.info('hasPermission' + scope.hasPermission);
                    }
                }, true);
            }
        };
    })
    .directive('uiSelectFocuser', ($timeout) => {
        return {
            restrict: 'A',
            require: '^uiSelect',
            link: (scope, elem, attrs, uiSelect: any) => {
                scope.$on('uiSelectFocus', () => {
                    $timeout(uiSelect.activate);
                });
            }
        };
    })
    .factory('groupFactory', [
        () => {
            var data = {};
            return {
                paramfac: '',
                load: (id) => {
                    return data[id];
                }
            }
        }
    ])
    .run(['$templateCache', ($templateCache) => {
        $templateCache.put('selectize/choices.tpl.html', '<div ng-show="$select.open" class="ui-select-choices group-tree selectize-dropdown single">'
            + '  <div ng-show="breadcrumbs.length > 1" class="ui-select-breadcrumbs">'
            + '    <span class="ui-breadcrumb" ng-repeat="item in breadcrumbs" ng-click="navigateBackTo(item, $select)" ng-bind-html="item.text[item.text.length-1].Name"></span>'
            + '  </div>'
            + '  <div class="ui-select-choices-content selectize-dropdown-content">'
            + '    <div class="ui-select-choices-group optgroup">'
            + '      <div ng-show="$select.isGrouped" class="ui-select-choices-group-label optgroup-header">{{$group}}</div>'
            + '      <div class="ui-select-choices-row">'
            + '        <div class="option ui-select-choices-row-inner" data-selectable=""></div>'
            + '      </div>'
            + '    </div>'
            + '  </div>'
            + '</div>');

        //var template = $templateCache.get('selectize/choices.tpl.html');
        //var original = "<div ng-show=\"$select.open\" class=\"ui-select-choices ui-select-dropdown selectize-dropdown single\"><div class=\"ui-select-choices-content selectize-dropdown-content\"><div class=\"ui-select-choices-group optgroup\" role=\"listbox\"><div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label optgroup-header\" ng-bind=\"$group.name\"></div><div role=\"option\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\"><div class=\"option ui-select-choices-row-inner\" data-selectable=\"\"></div></div></div></div></div>";
    }]);
