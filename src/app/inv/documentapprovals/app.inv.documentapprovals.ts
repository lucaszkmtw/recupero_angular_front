angular.module('app.inv.documentapprovals', ['app.inv'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.inv.documentapprovals', {
                url: '/documentapprovals',
                controller: 'InventoryDocumentApprovalsController',
                templateUrl: 'app/inv/documentapprovals/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'inv.documentapprovals'
                }
            })
            .state('app.inv.documentapproval', {
                url: '/documentapprovals/{documentId}',
                controller: 'InventoryDocumentApprovalController',
                templateUrl: 'app/inv/documentapprovals/edit.html',
                resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.inv.documentapprovals',
                    label: 'inv.documentapproval'
                }
            });
    }
    ])
    .controller('InventoryDocumentApprovalsController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.inv.document', { documentId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    }
    ])
    .controller('InventoryDocumentApprovalController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope: IProcurementBusinessDocumentApprovalScope, $translate, $stateParams, $state, Restangular, toastr) => {
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
