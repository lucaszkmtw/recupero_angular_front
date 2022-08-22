angular.module('app.system.notifications', ['app.system'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.system.notifications', {
                url: '/notifications',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'notifications'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.system.notifications.emailtemplates', {
                url: '/emailtemplates',
                controller: 'SystemNotificationsEmailTemplatesController',
                templateUrl: 'app/system/notifications/emailtemplates/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.system.notifications',
                    label: 'notifications.emailtemplates'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.system.notifications.emailtemplatenew', {
                url: '/emailtemplates/new',
                controller: 'SystemNotificationsEmailTemplateController',
                resolve: loadSequence('bpmn-viewer', 'jqueryui', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                templateUrl: 'app/system/notifications/emailtemplates/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.notifications.emailtemplates',
                    label: 'notifications.emailtemplate.new'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.system.notifications.emailtemplate', {
                url: '/emailtemplates/{emailTemplateId}',
                controller: 'SystemNotificationsEmailTemplateController',
                resolve: loadSequence('bpmn-viewer', 'jqueryui', 'ui.tree', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                templateUrl: 'app/system/notifications/emailtemplates/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.system.notifications.emailtemplates',
                    label: 'notifications.emailtemplate'
                },
                data: {
                    requiresLogin: true
                }
            });
    }
    ])
    .controller('SystemNotificationsEmailTemplatesController', ['$scope', '$state', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.system.notifications.emailtemplatenew');
        }

        $scope.params = {
            selectedItems: []
        };
    }
    ])
    .controller('SystemNotificationsEmailTemplateController', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'toastr', ($scope, $state, $stateParams, $log, Restangular, toastr) => {
        var id = $stateParams.emailTemplateId;

        $scope.editorOptions = {
            extraPlugins: 'stylesheetparser',
            stylesSet: [],
            contentsCss: '/Content/email-templates/styles.css'
        };

        $scope.item = {
            body: '<table class="body-wrap"><tr><td></td><td class="container" width="600"><div class="content"><table cellpadding="0" cellspacing= "0" class="main" width="100%"><tr><td class="content-wrap"><table cellpadding="0" cellspacing="0"><tr><td class="content-block"><h3>Welcom in basic email template</h3></td></tr><tr><td class="content-block">Lorem Ipsum is simply dummy text of the printing andtypesetting industry. Lorem Ipsum has been the industry standard dummy textever since the 1500s, when an unknown printer took a galley of type andscrambled it to make a type specimen book.It has survived not only five centuries.</td></tr><tr><td class="content-block">We may need to send you critical information aboutour service and it is important that we have an accurate email address.</td></tr><tr><td class="content-block aligncenter"><a class="btn-primary" href="#"> Confirm email address</a></td></tr></table></td></tr></table><div class="footer"><table width="100%"><tr><td class="aligncenter content-block">Follow <a href="#">@Company</a> on Twitter.</td></tr></table></div></div></td><td></td></tr></table>'
        };

        $scope.save = () => {
            if (id) {
                $scope.item.put().then(() => {
                    toastr.success('Template de correo', 'El template se actualizó con éxito');
                    $state.go('app.system.notifications.emailtemplates');
                });
            } else {
                Restangular.service('system/notifications/emailtemplates').post($scope.item).then(() => {
                    toastr.success('Template de correo', 'El template se creó con éxito');
                    $state.go('app.system.notifications.emailtemplates');
                });
            }
        };

        if (id) {
            Restangular.one('system').one('notifications').one('emailtemplates', id).get().then(result => {
                $scope.item = result;
            });
        }
    }
    ])
    .directive("systemNotificationsEmailTemplatesGrid", ['$state','authManager', ($state,authManager) => {
        return {
            restrict: 'A',
            scope: { parentId: '@', height: '@' },
            link: (scope: any, element, attrs, ctrl) => {
                var gridElementName = 'emailTemplatesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                scope.height = scope.height || 350;
                var url = API_HOST + '/api/system/notifications/emailtemplates.json';
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: url,
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: ['', 'Tarea', 'Nombre', ''],
                    colModel: [
                        {
                            name: 'actions',
                            index: 'actions',
                            width: 25,
                            fixed: true,
                            align: 'center',
                            sortable: false,
                            search: false,
                            formatter: () => { return '<i class="fa fa-pencil-square-o fa-fw hand"></i>'; }
                        },
                        { name: 'taskName', index: 'taskName', width: 180, fixed: true },
                        { name: 'name', index: 'name' },
                        {
                            name: 'removeCommand',
                            index: 'removeCommand',
                            width: 25,
                            fixed: true,
                            align: 'center',
                            sortable: false,
                            search: false,
                            formatter: () => { return '<i class="fa fa-trash-o fa-fw hand"></i>'; }
                        }
                    ],
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
                    footerrow: false,
                    userDataOnFooter: false,
                    onCellSelect: (rowid, iCol, cellcontent) => {
                        if (iCol === 0) {
                            $state.go('app.system.notifications.emailtemplate', { emailTemplateId: rowid }, null);
                            scope.$apply();
                            return false;
                        }
                    }
                });
                gridElement.jqGrid('navGrid', `#${pagerElementName}`, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: true });
                gridElement.jqGrid('filterToolbar', { autosearch: true });
            }
        };
    }]);