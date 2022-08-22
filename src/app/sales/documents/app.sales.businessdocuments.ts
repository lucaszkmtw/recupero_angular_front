angular.module('app.sales.businessdocuments', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.sales.documents', {
                url: '/documents',
                controller: 'SalesDocumentsListController',
                templateUrl: 'app/sales/documents/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'sales.documents'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.export', {
                url: '/documents/export',
                controller: 'SalesDocumentsExportController',
                templateUrl: 'app/sales/documents/export.html',
                resolve: loadSequence('jqueryui'),
                ncyBreadcrumb: {
                    label: 'sales.documents'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.documentnew', {
                url: '/documents/new?edit=true',
                controller: 'SalesDocumentEditController',
                templateUrl: 'app/sales/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.sales.documents',
                    label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                },
                data: {
                    requiresLogin: true,
                    edit: true
                }
            })
            .state('app.sales.documentedit', {
                url: '/documents/{documentId}',
                controller: 'SalesDocumentEditController',
                templateUrl: 'app/sales/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.sales.documents',
                    label: '{{document.documentType.name}}'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.documentapprovals', {
                url: '/documentapprovals',
                controller: 'SalesDocumentApprovalsController',
                templateUrl: 'app/sales/documentapprovals/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'sales.documentapprovals'
                },
                data: {
                    requiresLogin: true
                }
            })
            .state('app.sales.documentapproval', {
                url: '/documentapproval/{documentId}',
                controller: 'SalesDocumentApprovalController',
                templateUrl: 'app/sales/documentapprovals/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.sales.documentapprovals',
                    label: 'sales.documentapproval'
                },
                data: {
                    requiresLogin: true
                }
            });
    }
    ])
    .controller('SalesDocumentsListController', ['$scope', '$translate', '$state', 'Restangular', '$window', 'dialogs', ($scope, $translate, $state, Restangular, $window, dialogs) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.sales.documentnew');
        }
        $scope.app.title = $translate.instant('app.sales.documents');

        $scope.export = (typeId) => {
            $state.go('app.sales.export', { typeId: typeId });
        }
    }
    ])
    .controller('SalesDocumentsExportController', ['$scope', '$translate', '$state', '$window', '$log', '$httpParamSerializer', ($scope, $translate, $state, $window, $log, $httpParamSerializer) => {
        $scope.item = {};

        $scope.export = (typeId) => {
            var qs = $httpParamSerializer($scope.item);            
            $window.open('/api/businessdocuments/documents/' + typeId + '/results?' + qs);
            //$scope.$apply();
        }

    }
    ])
    .controller('SalesDocumentEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', '$log', 'session', ($scope: ISalesBusinessDocumentScope, $translate, $stateParams, $state, Restangular, toastr, $log, session) => {
        var id = $stateParams.documentId;
        var edit = $state.current.data && $state.current.data.edit || false;

        $scope.documentOptions = { edit: edit };

        $scope.edit = () => {
            $scope.documentOptions.edit = true;
        }

        $scope.save = () => {
            if (id) {                
                $scope.document.put().then(() => {
                    toastr.success('El documento se actualizó con éxito');
                    $state.reload();
                });
            } else {
                Restangular.service('businessdocuments/documents').post($scope.document).then((result) => {
                    toastr.success('Editor de documento', 'El documento se creó con éxito');
                    $state.go('app.sales.documentedit', { documentId: result.id });
                });
            }
        }

        $scope.submitForApproval = () => {
            Restangular.service('businessdocuments/documents/' + $scope.document.guid + '/submitforapproval').post({}).then((result) => {
                toastr.success('Editor de documento', 'Se ha iniciado el proceso de aprobación del documento con éxito.');
                $state.go('app.sales.documents');
            });
        }

        function load() {
            if (id) {
                Restangular.one('businessdocuments').one('documents', id).get().then(result => {
                    $scope.document = result;
                    if ($scope.document.issuerId != session.tenant.personId) {
                        $scope.document.byOrderOf = true;
                        $scope.document.options.receiverId = $scope.document.issuerId;
                    }
                });
            } else {
                $scope.document = {};
            }
        }

        load();
    }
    ])
    .controller('SalesDocumentApprovalsController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.sales.documentEdit', { documentId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    }
    ])
    .controller('SalesClientEditModalController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', '$uibModalInstance', 'PersonService', ($scope, $translate, $stateParams, $state, Restangular, toastr, $uibModalInstance, PersonService) => {
        $scope.params = { step: 1 };
        $scope.personService = PersonService;

        $scope.person = {
            isOrganization: false,
            code: null,
            emails: [{ address: null, typeId: PersonService.emailTypes[1].id }],
            phones: [{ number: null, typeId: PersonService.phoneTypes[1].id }],
            addresses: [{ address: { name: null, street: null, streetNumber: null, floor: null, appartment: null }, typeId: PersonService.addressTypes[1].id }]
        };

        $scope.emailAddressChanged = (email) => {
            if (email.address != null && _.last<any>($scope.person.emails).address != null) {
                $scope.person.emails.push({ address: null, typeId: PersonService.emailTypes[1].id });
            }
        };

        $scope.removeEmail = (email) => {
            var index = $scope.person.emails.indexOf(email);
            $scope.person.emails.splice(index, 1);
        }

        $scope.phoneNumberChanged = (phone) => {
            if (phone.number != null && _.last<any>($scope.person.phones).number != null) {
                $scope.person.phones.push({ number: null, typeId: PersonService.phoneTypes[1].id });
            }
        };

        $scope.removePhone = (phone) => {
            var index = $scope.person.phones.indexOf(phone);
            $scope.person.phones.splice(index, 1);
        }

        $scope.save = () => {
            if ($scope.person.emails.length > 0 && _.last<any>($scope.person.emails).address == null) {
                $scope.person.emails.splice(-1, 1);
            }

            if ($scope.person.phones.length > 0 && _.last<any>($scope.person.phones).number == null) {
                $scope.person.phones.splice(-1, 1);
            }

            if ($scope.person.addresses.length > 0 && _.last<any>($scope.person.addresses).address.street == null) {
                $scope.person.addresses.splice(-1, 1);
            }
            
            Restangular.service('sales/client').post({ person: $scope.person }).then((result) => {
                $uibModalInstance.close(result);
            });
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    }
    ])
    .controller('SalesDocumentApprovalController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: ISalesBusinessDocumentApprovalScope, $translate, $stateParams, $state, Restangular, toastr) => {
        var id = $stateParams.documentId;
        $scope.documentOptions = { edit: false };

        $scope.assign = (roleId) => {
            Restangular.service('system/workflows/workflowinstances/' + $scope.document.approvalWorkflowInstance.guid + '/assign').post({ roleId: roleId }).then(() => { load(); });
        };

        $scope.approve = () => {
            Restangular.service('system/workflows/workflowinstances/' + $scope.document.approvalWorkflowInstance.guid + '/approve').post({}).then(() => {
                toastr.success('Autorizaciones', 'La operación se realizó con éxito.');
                load();
            }, () => {
                toastr.error('Autorizaciones', 'Se produjo un error en la operación.');
            });
        }

        $scope.reject = () => {
            Restangular.service('system/workflows/workflowinstances/' + $scope.document.approvalWorkflowInstance.guid + '/reject').post({}).then(() => {
                toastr.success('Autorizaciones', 'La operación se realizó con éxito.');
                load();
            }, () => {
                toastr.error('Autorizaciones', 'Se produjo un error en la operación.');
            });
        }

        function load() {
            if (id) {
                Restangular.one('businessdocuments').one('documents', id).get().then(result => {
                    $scope.document = result;
                });
            } else {
                $scope.document = {};
            }
        }

        load();
    }
    ])
    .directive('salesDocumentApprovalsGrid', ['$state', '$log', '$compile', '$filter', 'Restangular', 'toastr', ($state, $log, $compile, $filter, Restangular, toastr) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@', view: '=', filter: '=' },
            link(scope: any, element) {
                var tabsElement = '<div><uib-tabset>'
                    + '<uib-tab heading="Propias" select="changeView(0)"></uib-tab>'
                    + '<uib-tab heading="Supervisados" select="changeView(1)"></uib-tab>'
                    + '<uib-tab heading="De terceros" select="changeView(2)"></uib-tab>'
                    + '<uib-tab heading="Baja" select="changeView(3)"></uib-tab>'
                    + '<uib-tab heading="Finalizadas" select="changeView(4)"></uib-tab>'
                    + '</uib-tabset></div>';
                var gridElementName = 'healthTreatmentRequestsGrid';
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
                }

                scope.approve = (workflowInstanceGuid) => {
                    Restangular.service('system/workflows/workflowinstances/' + workflowInstanceGuid + '/approve').post({}).then(() => {
                        toastr.success('Autorizaciones', 'La operación se realizó con éxito.');
                        loadData();
                    }, () => {
                        toastr.error('Autorizaciones', 'Se produjo un error en la operación.');
                    });
                };

                scope.reject = (workflowInstanceGuid) => {
                    Restangular.service('system/workflows/workflowinstances/' + workflowInstanceGuid + '/reject').post({}).then(() => {
                        toastr.success('Autorizaciones', 'La operación se realizó con éxito.');
                        loadData();
                    }, () => {
                        toastr.error('Autorizaciones', 'Se produjo un error en la operación.');
                    });
                };

                function workflowInstanceFormatter(cellvalue: any, options: any, rowObject: any) {
                    var businessDocumentNumber = $filter('documentNumber')(rowObject.number);
                    return '<div class="largefontcell m-l-sm">' + rowObject.businessDocumentTypeShortName + ' ' + businessDocumentNumber + '</div>';
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

                function documentDataFormatter(cellvalue: any, options: any, rowObject: any) {
                    var createDate = $filter('amDateTime')(rowObject.createDate);
                    var documentDate = $filter('amDateTime')(rowObject.documentDate);
                    return rowObject.businessDocumentTypeName + ' | <small>Proveedor</small> <a data-ui-sref="app.system.person({ personId: ' + rowObject.personId + ' })" title="Ver ficha">' + rowObject.personName + '</a><br><small>Creada el ' + createDate + '</small><br><small>Fecha ' + documentDate + '</small></td>';
                }

                function singleQuote(value) {
                    return `'${value}'`;
                }

                function documentActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = '<a href="#" data-ui-sref="app.Sales.documentapproval({ documentId: ' + rowObject.id + '})" class="btn btn-white btn-xs m-l-md"><i class="fa fa-folder"></i> Ver </a>';

                    if (scope.view <= 1) {
                        template += '<a href="#" data-ng-click="approve(' + singleQuote(rowObject.workflowInstanceGuid) + ')" class="btn btn-primary btn-xs m-l-xs"><i class="fa fa-pencil"></i> Aprobar </a>'
                            + '<a href="#" data-ng-click="reject(' + singleQuote(rowObject.workflowInstanceGuid) + ')" class="btn btn-danger btn-xs m-l-xs"><i class="fa fa-pencil"></i> Rechazar </a>';
                    }
                    return template;
                }

                function workflowProgressFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<small> Completa al: ' + rowObject.workflowInstanceProgress + ' % </small><div class="progress progress-mini"><div style="width:' + rowObject.workflowInstanceProgress + '%;" class="progress-bar"></div></div>';
                }

                var colNames = ['', '', '', '', ''];
                var colModel: Array<any> = [
                    { name: 'code', index: 'code', width: 150, fixed: true, search: true, formatter: workflowInstanceFormatter },
                    { name: 'workflowStatus', index: 'workflowStatus', width: 150, fixed: true, search: true, formatter: workflowStatusFormatter },
                    { name: 'documentData', index: 'documentData', search: false, formatter: documentDataFormatter },
                    { name: 'workflowProgress', index: 'workflowProgress', width: 150, fixed: true, search: false, formatter: workflowProgressFormatter },
                    { name: 'actions', index: 'actions', width: 250, align: 'left', fixed: true, search: false, formatter: documentActionsFormatter }
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

                        if (scope.personId) {
                            gridElement.jqGrid('setGridParam', { postData: { personId: scope.personId } });
                        }
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            /*
                            var stateName = 'app.health.requestedit';
                            $state.go(stateName, { requestId: rowId });
                            */
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
                    var url = '/api/businessdocuments/documents/approvals.json';
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
