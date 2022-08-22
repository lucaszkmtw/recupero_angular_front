angular
    .module('app.inv.businessdocuments', ['app.inv'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.inv.documents', {
                url: '/documents',
                controller: 'InventoryDocumentsListController',
                templateUrl: 'app/inv/documents/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'inv.documents'
                },
                parent: 'app.inv'
            })
            .state('app.inv.documentnew', {
                url: '/documents/new',
                controller: 'InventoryDocumentEditController',
                controllerAs: 'vm',
                templateUrl: 'app/inv/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.inv.documents',
                    label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                },
                data: { edit: true }
            })
            .state('app.inv.documentedit', {
                url: '/documents/{documentId}/edit',
                controller: 'InventoryDocumentEditController',
                controllerAs: 'vm',
                templateUrl: 'app/inv/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.inv.documents',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.inv.document', {
                url: '/documents/{documentId}',
                controller: 'InventoryDocumentEditController',
                controllerAs: 'vm',
                templateUrl: 'app/inv/documents/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.inv.documents',
                    label: '{{document.documentType.name}}'
                }
            })
    }])

    .controller('InventoryDocumentsListController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.inv.documentnew');
        }
        $scope.app.title = $translate.instant('app.inv.documents');

        $scope.export = (typeId) => {
            $state.go('app.inv.export', { typeId: typeId });
        }
    }
    ])
    .controller('InventoryDocumentEditController', ['$log', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($log, $translate, $stateParams, $state, Restangular, toastr) => {
        var vm = this;
        var id = $stateParams.documentId;
        vm.businessDocument = {};
        vm.documentOptions = { edit: $state.is('app.inv.documentedit') || $state.is('app.inv.documentnew') };

        vm.edit = () => {
            $state.go('app.inv.documentedit', { documentId: id });
        }

        vm.view = () => {
            $state.go('app.inv.document', { documentId: id });
        };

        vm.save = () => {
            if (id) {
                vm.businessDocument.put().then(() => {
                    toastr.success('Editor de documento', 'El documento se actualizó con éxito');
                    $state.go('app.inv.document', { documentId: id });
                });
            } else {
                Restangular.service('businessdocuments/documents').post(vm.businessDocument).then((result) => {
                    toastr.success('Editor de documento', 'El documento se creó con éxito');
                    $state.go('app.inv.document', { documentId: result.id });
                });
            }
        }

        vm.checkValid = () => {
            vm.inventoryDocumentForm.$error.required.forEach(function (error) {
                $log.info(error.$name + ' is required');

                vm.inventoryDocumentForm.businessDocumentForm.$error.required.forEach(function (error) {
                    $log.info(error.$name + ' is required');
                });
            });
        };

        vm.submitForApproval = () => {
            Restangular.service('businessdocuments/documents/' + vm.businessDocument.guid + '/submitforapproval').post({}).then((result) => {
                toastr.success('Editor de documento', 'Se ha iniciado el proceso de aprobación del documento con éxito.');
                $state.go('app.inv.documents');
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
    ]);
