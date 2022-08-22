angular.module('app.health.claims', ['app.health'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.claims', {
                url: '/claims',
                controller: 'HealthClaimsListController',
                templateUrl: 'app/health/claim/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.claims'
                }
            })
            .state('app.health.claimnew', {
                url: '/claims/new',
                controller: 'HealthClaimEditController',
                resolve: loadSequence('ui.tree', 'icheck', 'angularFileUpload', 'ngCkeditor'),
                templateUrl: 'app/health/claim/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.claims',
                    label: 'health.claim.new'
                }
            })
            .state('app.health.claimedit', {
                url: '/claims/{claimId}/edit',
                controller: 'HealthClaimEditController',
                resolve: loadSequence('ui.tree', 'icheck', 'angularFileUpload', 'ngCkeditor'),
                templateUrl: 'app/health/claim/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.claims',
                    label: 'health.claim'
                }
            })
            .state('app.health.claim', {
                url: '/claims/{claimId}',
                controller: 'HealthClaimViewController',
                resolve: loadSequence('angularFileUpload'),
                templateUrl: 'app/health/claim/view.html',
                ncyBreadcrumb: {
                    parent: 'app.health.claims',
                    label: 'health.claim'
                }
            });
    }
    ])
    .controller('HealthClaimsListController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.health.claimnew');
        }

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.health.claim', { claimId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    }])
    .controller('HealthClaimViewController', ['$log', '$scope', '$translate', '$stateParams', '$state', '$filter', '$window', 'Restangular', 'dialogs', 'FileUploader', ($log, $scope: any, $translate, $stateParams, $state, $filter, $window, Restangular, dialogs, FileUploader) => {
        var id = $stateParams.claimId;
        
        $scope.serviceUrl = 'health/claims/' + $stateParams.claimId + '/messages';

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/health/claims/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false
        });

        $scope.uploader.onCompleteAll = () => {
            Restangular.one('health').one('claims', id).one('files').get().then(result => {
                $scope.claim.files = result.results;
            });
        };

        $scope.canEdit = () => {
            return true;
        };

        $scope.edit = () => {
            $state.go('app.health.claimedit', { claimId: id });
        };

        $scope.canSave = () => {
            return true;
        };

        $scope.save = () => {
            if (id) {
                $scope.request.put().then(() => { $state.go('app.health.claim'); });
            } else {
                Restangular.service('health/claims').post($scope.claim).then(() => { $state.go('app.health.claim'); });
            }
        }

        $scope.openFile = (file) => {
            $window.open('api/health/claims/' + $scope.claim.id + '/files/' + file.guid);
        };

        $scope.showProcess = ($event, process) => {
            var route = null, parameters = null;
            switch (process.workflowCode) {
                case 'SP':
                    route = 'app.health.treatmentrequest';
                    parameters = { treatmentRequestId: process.id };
                    break;
                case 'R':
                    route = 'app.health.claim';
                    parameters = { claimId: process.id };
                    break;
            }

            switch ($event.which) {
                case 1:
                    $state.go(route, parameters);
                    break;
                case 2:
                    $window.open($state.href(route, parameters));
                    break;
            }
        }

        function load() {
            if (id) {
                Restangular.one('health').one('claims', id).get().then(claim => {
                    $scope.claim = claim;
                    Restangular.one('system').one('persons', $scope.claim.personId).get().then(result => {
                        $scope.person = result.plain();
                    });
                });
            } else {
                $scope.claim = {}
            }
        }

        $scope.$on('reload', (event) => {
            load();
        });

        $scope.$on('reloadMessages', (event, messages) => {
            $scope.claim.messages = messages;
        });

        load();
    }
    ])
    .controller('HealthClaimEditController', ['$scope', '$translate', '$stateParams', '$state', '$log', 'Restangular', 'dialogs', 'FileUploader', ($scope: any, $translate, $stateParams, $state, $log, Restangular, dialogs, FileUploader) => {

        var id = $stateParams.claimId;

        $scope.params = {
            linkedTarget: 0
        };

        $scope.linkTargets =
            [
                { id: 0, name: 'linkto.person' },
                { id: 1, name: 'linkto.workflowinstance' }
            ];

        $scope.getLinkTargetName = (id) => {
            var linkTarget: any = _.find($scope.linkTargets, { id: id });
            return linkTarget.name;
        };

        //#region Links
        $scope.addLinkedPerson = () => {
            Restangular.one('system').one('persons', $scope.params.linkedPersonId).get().then((person) => {
                var linkedPerson = {
                    personId: person.id,
                    person: person
                };

                $scope.claim.linkedPersons.push(linkedPerson);
                $scope.params.linkedPersonId = null;
            });
        };

        $scope.removeLinkedPerson = (item) => {
            var index = $scope.claim.linkedPersons.indexOf(item);
            $scope.claim.linkedPersons.splice(index, 1);
        }

        $scope.addLinkedWorkflowInstance = () => {
            Restangular.one('system').all('workflows').one('workflowinstances', $scope.params.linkedWorkflowInstanceId).get().then((workflowInstance) => {
                var linkedWorkflowInstance = {
                    workflowInstanceId: workflowInstance.id,
                    workflowInstance: workflowInstance
                };

                $scope.claim.linkedWorkflowInstances.push(linkedWorkflowInstance);
                $scope.params.linkedWorkflowInstanceId = null;
            });
        };

        $scope.removeLinkedWorkflowInstance = (item) => {
            var index = $scope.claim.linkedWorkflowInstances.indexOf(item);
            $scope.claim.linkedWorkflowInstances.splice(index, 1);
        }
        //#endregion

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/health/claims/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false
        });

        $scope.uploader.onCompleteAll = () => {
            Restangular.one('health').one('claims', id).one('files').get().then(result => {
                $scope.claim.files = result.results;
            });
        };

        function load() {
            if (id) {
                Restangular.one('health').one('claims', id).get().then(result => {
                    $scope.claim = result;
                });
            } else {
                var items = [];
                var workflowId = 1;
                $scope.claim = {
                    linkedPersons: [],
                    linkedWorkflowInstances: [],
                    workflowInstance: { tags: items, workflowId: workflowId }
                }
            }
        }

        $scope.view = () => {
            $state.go('app.health.claim', { claimId: $scope.claim.id });
        };

        $scope.save = () => {
            if (id) {
                $scope.claim.put().then(() => { $state.go('app.health.claims'); });
            } else {
                Restangular.service('health/claims').post($scope.claim).then(() => { $state.go('app.health.claims'); });
            }
        }

        load();
    }
    ])
    .directive('healthClaimsGrid', ['$state', '$log', '$compile', '$filter', 'session', 'authManager', ($state, $log, $compile, $filter, session, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@', view: '=?', filter: '=?' },
            link(scope: any, element) {
                //var tabsElement = '<uib-tabset class="tabbable"><uib-tab heading="Propias" select="changeView(0)"></uib-tab><uib-tab heading="De terceros" select="changeView(1)"></uib-tab><uib-tab heading="Baja" select="changeView(2)"></uib-tab><uib-tab heading="Finalizadas" select="changeView(3)"></uib-tab></uib-tabset>';
                var tabsElement = '<div><uib-tabset>'
                    + '<uib-tab heading="Propias" select="changeView(0)"></uib-tab>'
                    + '<uib-tab heading="Supervisados" select="changeView(1)"></uib-tab>'
                    + '<uib-tab heading="De terceros" select="changeView(2)"></uib-tab>'
                    + '<uib-tab heading="Baja" select="changeView(3)"></uib-tab>'
                    + '<uib-tab heading="Finalizadas" select="changeView(4)"></uib-tab>'
                    + '</uib-tabset></div>';
                var gridElementName = 'healthClaimsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);

                element.append($compile(tabsElement)(scope));
                element.append($compile(gridElement)(scope));
                element.append($compile(pagerElement)(scope));

                scope.height = scope.height || 400;
                scope.personId = null;
                scope.showHeader = scope.showHeader || false;
                scope.view = scope.view || 0;
                scope.filter = scope.filter || null;

                scope.changeView = (view) => {
                    scope.view = view;
                    loadData();
                };

                scope.canEdit = () => {
                    return scope.view === 0;
                };

                scope.edit = (id) => {
                    $state.go('app.health.claimedit', { claimId: id });
                };

                function claimIdFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<span class="largefontcell">' + rowObject.workflowCode + '-' + rowObject.id + '</span>';
                }

                function workflowStatusFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = null;

                    if (rowObject.workflowInstanceIsTerminated) {
                        template = '<div class="label label-danger" style="display: block;">'
                            + 'Cancelado'
                            + '</div>';
                    } else {
                        template = '<div class="label label-primary" style="display: block;">'
                            + rowObject.workflowActivityName
                            + '</div>';
                    }

                    if (!rowObject.workflowActivityIsFinal) {
                        template += '<div class="label label-info" style= "display: block; margin-top: 2px;">'
                            + rowObject.roles
                            + '</div>';
                    }

                    return template;
                }

                function claimDataFormatter(cellvalue: any, options: any, rowObject: any) {
                    var createDate = $filter('amDateTime')(rowObject.createDate);
                    return 'Reclamo | <small>Reclamante</small> <a data-ui-sref="app.system.person({ personId: ' + rowObject.personId + ' })" title="Ver ficha">' + rowObject.personName + '</a><br><small>Creada el ' + createDate + '</small></td>';
                }

                function claimActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var result = '<a href="#" data-ui-sref="app.health.claim({ claimId: ' + rowObject.id + ' })" class="btn btn-white btn-sm"><i class="fa fa-folder"></i> Ver </a>';
                    if(scope.canEdit()) {
                        result += '<button type="button" data-ng-click="edit(' + rowObject.id + ')" class="btn btn-white btn-sm"><i class="fa fa-pencil"></i> Editar</button>'; 
                    }

                    return result;
                }

                function workflowProgressFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<small> Completa al: ' + rowObject.workflowInstanceProgress + ' % </small><div class="progress progress-mini"><div style="width:' + rowObject.workflowInstanceProgress + '%;" class="progress-bar"></div></div>';
                }

                var colNames = ['', '', '', '', ''];
                var colModel: Array<any> = [
                    { name: 'code', index: 'code', width: 90, fixed: true, search: true, formatter: claimIdFormatter },
                    { name: 'workflowStatus', index: 'workflowStatus', width: 150, fixed: true, search: true, formatter: workflowStatusFormatter },
                    { name: 'claimData', index: 'claimData', search: false, formatter: claimDataFormatter },
                    { name: 'workflowProgress', index: 'workflowProgress', width: 150, fixed: true, search: false, formatter: workflowProgressFormatter },
                    { name: 'actions', index: 'actions', width: 150, fixed: true, search: false, formatter: claimActionsFormatter }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    datatype: 'local',
                    height: scope.height,
                    autowidth: true,
                    shrinkToFit: true,
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

                        if (scope.personId) {
                            gridElement.jqGrid('setGridParam', { postData: { personId: scope.personId } });
                        }
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.health.requestedit';
                            $state.go(stateName, { requestId: rowId });
                        }

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

                if (!scope.showHeader) {
                    var header = $('#gview_' + gridElementName + ' .ui-jqgrid-hdiv').hide();
                }

                gridElement.addClass('ui-jqgrid-noborders');

                function loadData() {
                    var url = API_HOST +'/api/health/claims.json';
                    gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event, personId) => {
                    if (personId) {
                        scope.personId = personId;
                    }

                    loadData();
                });
            }
        };
    }]);