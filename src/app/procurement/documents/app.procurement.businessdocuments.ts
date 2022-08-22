angular.module('app.procurement.businessdocuments', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.procurement.documents', {
                url: '/documents',
                controller: 'ProcurementDocumentsListController',
                templateUrl: 'app/procurement/documents/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'procurement.documents'
                }
            })
            .state('app.procurement.export', {
                url: '/documents/export',
                controller: 'ProcurementDocumentsExportController',
                templateUrl: 'app/procurement/documents/export.html',
                resolve: loadSequence('jqueryui'),
                ncyBreadcrumb: {
                    label: 'procurement.documents'
                }
            })
            .state('app.procurement.documentnew', {
                url: '/documents/new',
                controller: 'ProcurementDocumentEditController',
                controllerAs: 'vm',
                templateUrl: 'app/procurement/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.documents',
                    label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                },
                data: { edit: true }
            })
            .state('app.procurement.documentedit', {
                url: '/documents/{documentId}/edit',
                controller: 'ProcurementDocumentEditController',
                controllerAs: 'vm',
                templateUrl: 'app/procurement/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.documents',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.procurement.document', {
                url: '/documents/{documentId}',
                controller: 'ProcurementDocumentEditController',
                controllerAs: 'vm',
                templateUrl: 'app/procurement/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.documents',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.procurement.documentapprovals', {
                url: '/documentapprovals',
                controller: 'ProcurementDocumentApprovalsController',
                templateUrl: 'app/procurement/documentapprovals/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'procurement.documentapprovals'
                }
            })
            .state('app.procurement.documentapproval', {
                url: '/documentapproval/{documentId}',
                controller: 'ProcurementDocumentApprovalController',
                templateUrl: 'app/procurement/documentapprovals/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.procurement.documentapprovals',
                    label: 'procurement.documentapproval'
                }
            });
    }
    ])
    .controller('ProcurementDocumentsListController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.procurement.documentnew');
        }
        $scope.app.title = $translate.instant('app.procurement.documents');

        $scope.export = (typeId) => {
            $state.go('app.procurement.export', { typeId: typeId });
        }
    }
    ])
    .controller('ProcurementDocumentsExportController', ['$scope', '$translate', '$state', '$window', '$log', '$httpParamSerializer', ($scope, $translate, $state, $window, $log, $httpParamSerializer) => {
        $scope.item = {};

        $scope.export = (typeId) => {
            var qs = $httpParamSerializer($scope.item);
            $window.open('/api/businessdocuments/documents/' + typeId + '/results?' + qs);
            //$scope.$apply();
        }

    }
    ])
    .controller('ProcurementDocumentEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: IProcurementBusinessDocumentScope, $translate, $stateParams, $state, Restangular, toastr) => {
        var vm = this;
        var id = $stateParams.documentId;
        vm.businessDocument = {};
        vm.documentOptions = { edit: $state.is('app.procurement.documentedit') || $state.is('app.procurement.documentnew') };

        vm.edit = () => {
            $state.go('app.procurement.documentedit', { documentId: id });
        }

        vm.view = () => {
            $state.go('app.procurement.document', { documentId: id });
        }

        vm.save = () => {
            if (id) {
                vm.businessDocument.put().then(() => {
                    toastr.success('Editor de documento', 'El documento se actualizó con éxito');
                    $state.go('app.procurement.document', { documentId: id });
                });
            } else {
                Restangular.service('businessdocuments/documents').post(vm.businessDocument).then((result) => {
                    toastr.success('Editor de documento', 'El documento se creó con éxito');
                    $state.go('app.procurement.documentedit', { documentId: result.id });
                });
            }
        }

        vm.submitForApproval = () => {
            Restangular.service('businessdocuments/documents/' + vm.businessDocument.guid + '/submitforapproval').post({}).then((result) => {
                toastr.success('Editor de documento', 'Se ha iniciado el proceso de aprobación del documento con éxito.');
                $state.go('app.procurement.documents');
            });
        }

        function load() {
            if (id) {
                Restangular.one('businessdocuments').one('documents', id).get().then(result => {
                    vm.businessDocument = result;
                });
            } else {
                vm.businessDocument = {};
            }
        }

        load();

        return vm;
    }
    ])
    .controller('ProcurementDocumentApprovalsController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.procurement.documentEdit', { documentId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    }
    ])
    .controller('ProcurementDocumentApprovalController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: IProcurementBusinessDocumentApprovalScope, $translate, $stateParams, $state, Restangular, toastr) => {
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
    ]);
