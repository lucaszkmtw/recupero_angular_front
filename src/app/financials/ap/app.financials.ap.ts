angular.module('app.financials.ap', ['app.financials'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.ap',
            {
                url: '/ap',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.financials',
                    label: 'financials.ap'
                }
            })
            .state('app.financials.ap.documents',
            {
                url: '/documents',
                controller: 'FinancialsApDocumentsController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/ap/documents.html',
                ncyBreadcrumb: {
                    label: 'financials.ap.documents'
                }
            })
            .state('app.financials.ap.paymentorders',
            {
                url: '/paymentorders',
                controller: 'FinancialsApPaymentOrdersController',
                templateUrl: 'app/financials/ap/paymentorders/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'financials.ap.paymentorders'
                }
            })
            .state('app.financials.ap.paymentordernew',
            {
                url: '/paymentorders/new',
                controller: 'FinancialsApPaymentOrderController',
                templateUrl: 'app/financials/ap/paymentorders/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ap.paymentorders',
                    label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                },
                data: { edit: true }
            })
            .state('app.financials.ap.paymentorderedit',
            {
                url: '/paymentorders/{documentId}/edit',
                controller: 'FinancialsApPaymentOrderController',
                templateUrl: 'app/financials/ap/paymentorders/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ap.paymentorders',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.financials.ap.paymentorder',
            {
                url: '/paymentorders/{documentId}',
                controller: 'FinancialsApPaymentOrderController',
                templateUrl: 'app/financials/ap/paymentorders/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ap.paymentorders',
                    label: '{{document.documentType.name}}'
                }
            });
    })
    .controller('FinancialsApDocumentsController', ($scope, $translate, $state, Restangular) => { })
    .controller('FinancialsApPaymentOrdersController', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.financials.ap.paymentordernew');
        }
    })
    .controller('FinancialsApPaymentOrderController', ($scope: IProcurementBusinessDocumentScope, $translate, $stateParams, $state, Restangular, toastr, $log) => {
        var id = $stateParams.documentId;
        var edit = $state.is('app.financials.ap.paymentorderedit') || $state.is('app.financials.ap.paymentordernew');

        $scope.documentOptions = { edit: edit };

        $scope.confirm = () => {
            Restangular.service('financials/paymentdocuments/' + $scope.document.guid + '/confirm').post({}).then((result) => {
                toastr.success('Editor de órden de pago', 'Se ha confirmado la órden de pago con éxito.');
                $state.go('app.financials.ap.paymentorders');
            });
        }

        $scope.edit = () => {
            $state.go('app.financials.ap.paymentorderedit', { documentId: id });
        }

        $scope.view = () => {
            $state.go('app.financials.ap.paymentorder', { documentId: id });
        }

        $scope.save = () => {
            if (id) {
                $scope.document.put().then((result) => {
                    toastr.success('La órden de pago se actualizó con éxito');
                    $scope.document = result;
                });
            } else {
                Restangular.service('financials/paymentdocuments').post($scope.document).then((result) => {
                    toastr.success('Editor de órden de pago', 'La órden de pago se creó con éxito');
                    $state.go('app.financials.ap.paymentorderedit', { documentId: result.id });
                });
            }
        }

        $scope.submitForApproval = () => {
            Restangular.service('financials/paymentdocuments/' + $scope.document.guid + '/submitforapproval').post({}).then((result) => {
                toastr.success('Editor de órden de pago', 'Se ha iniciado el proceso de aprobación de la órden de pago con éxito.');
                $state.go('app.financials.ap.paymentorders');
            });
        }

        function load() {
            if (id) {
                Restangular.one('financials').one('paymentdocuments', id).get().then(result => {
                    $scope.document = result;
                });
            } else {
                $scope.document = {};
                $scope.document.typeId = 1;
            }
        }

        load();
    });
