angular.module('app.financials', [
    'app.financials.banks',
    'app.financials.bankaccounts',
    'app.financials.checkbooks',
    'app.financials.currencies',
    'app.financials.documents',
    'app.financials.ar',
    'app.financials.ap',
    'app.financials.costcenters'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials',
            {
                url: '/financials',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'financials'
                }
            })     
            .state('app.financials.paymentdocuments',
            {
                url: '/documents',
                controller: 'FinancialsPaymentDocumentListController',
                templateUrl: 'app/financials/paymentdocuments/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'financials.paymentdocuments'
                }
            })
            .state('app.financials.paymentdocumentnew',
            {
                url: '/documents/new',
                controller: 'FinancialsPaymentDocumentController',
                templateUrl: 'app/financials/paymentdocuments/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.paymentdocuments',
                    label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                },
                data: { edit: true }
            })
            .state('app.financials.paymentdocumentedit',
            {
                url: '/documents/{documentId}/edit',
                controller: 'FinancialsPaymentDocumentController',
                templateUrl: 'app/financials/paymentdocuments/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.paymentdocuments',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.financials.paymentdocument',
            {
                url: '/documents/{documentId}',
                controller: 'FinancialsPaymentDocumentController',
                templateUrl: 'app/financials/paymentdocuments/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.paymentdocuments',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.financials.paymentmethods',
            {
                url: '/paymentmethods',
                controller: 'FinancialsPaymentMethodsListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/paymentmethods/list.html',
                ncyBreadcrumb: {
                    label: 'financials.paymentmethods'
                }
            })
            .state('app.financials.paymentmethodnew',
            {
                url: '/paymentmethods/new',
                controller: 'FinancialsPaymentMethodsEditController',
                resolve: loadSequence('icheck'),
                templateUrl: 'app/financials/paymentmethods/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.paymentmethods',
                    label: 'financials.paymentmethod.new'
                }
            })
            .state('app.financials.paymentmethodedit',
            {
                url: '/paymentmethods/{paymentMethodId}',
                controller: 'FinancialsPaymentMethodsEditController',
                resolve: loadSequence('icheck'),
                templateUrl: 'app/financials/paymentmethods/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.paymentmethods',
                    label: 'financials.paymentmethod.edit'
                }
            })
            // BankBranches
            .state('app.financials.bankbranches',
            {
                url: '/bankbranches',
                controller: 'FinancialsBankBranchesListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/bankbranches/list.html',
                ncyBreadcrumb: {
                    label: 'financials.bankbranches'
                }
            })
            .state('app.financials.bankbranchnew',
            {
                url: '/bankbranches/new',
                controller: 'FinancialsBankBranchEditController',
                templateUrl: 'app/financials/bankbranches/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.bankbranches',
                    label: 'financials.bankbranch.new'
                }
            })
            .state('app.financials.bankbranchedit',
            {
                url: '/bankbranches/{bankBranchId}',
                controller: 'FinancialsBankBranchEditController',
                templateUrl: 'app/financials/bankbranches/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.bankbranches',
                    label: 'financials.bankbranch.edit'
                }
            })
            .state('app.financials.checknew',
            {
                url: '/check/new',
                controller: 'FinancialsCheckEditController',
                templateUrl: 'app/financials/documents/checks/edit.html',
                ncyBreadcrumb: {
                    label: 'financials.check.new'
                }
            })
            .state('app.financials.checkedit',
            {
                url: '/check/{id}',
                controller: 'FinancialsCheckEditController',
                templateUrl: 'app/financials/documents/checks/edit.html',
                ncyBreadcrumb: {
                    label: 'financials.check.edit'
                }
            })
            .state('app.financials.cashtransactionnew',
            {
                url: '/cashtransaction/new',
                controller: 'FinancialsCashTransactionEditController',
                templateUrl: 'app/financials/documents/cashtransactions/edit.html',
                ncyBreadcrumb: {
                    label: 'financials.cashtransaction.new'
                }
            })
            .state('app.financials.cashtransactionedit',
            {
                url: '/cashtransaction/{id}',
                controller: 'FinancialsCashTransactionEditController',
                templateUrl: 'app/financials/documents/cashtransactions/edit.html',
                ncyBreadcrumb: {
                    label: 'financials.cashtransaction.edit'
                }
            })
            .state('app.financials.banktransfernew',
            {
                url: '/banktransfer/new',
                controller: 'FinancialsBankTransfersEditController',
                templateUrl: 'app/financials/documents/banktransfers/edit.html',
                ncyBreadcrumb: {
                    label: 'financials.banktransfer.new'
                }
            })
            .state('app.financials.banktransferedit',
            {
                url: '/banktransfer/{id}',
                controller: 'FinancialsBankTransfersEditController',
                templateUrl: 'app/financials/documents/banktransfers/edit.html',
                ncyBreadcrumb: {
                    label: 'financials.banktransfer.edit'
                }
            })
            ;
    })
    .controller('FinancialsBankBranchesListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.bankbranchnew');
        }
    })
    .controller('FinancialsBankBranchEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.bankBranchId;

        function load() {
            if (id) {
                Restangular.one('financials').one('bankbranches', id).get().then(result => {
                    var bankbranch = result;
                    $scope.bankbranch = bankbranch;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.bankbranch.put().then(() => { $state.go('app.financials.bankbranches'); });
            } else {
                Restangular.service('financials/bankbranches').post($scope.bankbranch).then(() => { $state.go('app.financials.bankbranches'); });
            }
        }

        load();
    })

    .controller('FinancialsCashTransactionEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        $scope.documentOptions = {
            edit: false,
            paymentmethod: 'cashtransactions'
        };

        var id = $stateParams.id;

        function load() {
            if (id) {
                Restangular.one('financials').one('paymentdocumentitems', id).get().then(result => {
                    var item = result;
                    $scope.item = item;
                });
            }
        }

        $scope.back = () => {
            $state.go('app.paymentdocuments.documentslist', { documentTypeName: $scope.documentOptions.paymentmethod });
        }

        $scope.edit = () => {
            $scope.documentOptions.edit = true;
        }

        $scope.save = () => {
            if (id) {
                $scope.item.put().then(() => { $state.go('app.paymentdocuments.documentslist', { documentTypeName: $scope.documentOptions.paymentmethod }); });
            } else {
                Restangular.service('financials/paymentdocumentitems').post($scope.bankbranch).then(() => { $state.go('app.financials.bankbranches'); });
            }
        }

        load();
    })

    .controller('FinancialsBankTransfersEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        $scope.documentOptions = {
            edit: false, 
            paymentmethod: 'banktransfers'
        };

        var id = $stateParams.id;

        function load() {
            if (id) {
                Restangular.one('financials').one('paymentdocumentitems', id).get().then(result => {
                    var item = result;
                    $scope.item = item;
                });
            }
        }

        $scope.edit = () => {
            $scope.documentOptions.edit = true;
        }

        $scope.back = () => {
            $state.go('app.paymentdocuments.documentslist', { documentTypeName: $scope.documentOptions.paymentmethod }); 
        }

        $scope.save = () => {
            if (id) {
                $scope.item.put().then(() => { $state.go('app.paymentdocuments.documentslist', { documentTypeName: $scope.documentOptions.paymentmethod }); });
            } else {
                Restangular.service('financials/paymentdocumentitems').post($scope.bankbranch).then(() => { $state.go('app.financials.bankbranches'); });
            }
        }

        load();
    })

    .controller('FinancialsCheckEditController', ($scope: any, $translate, $stateParams, $state, Restangular, $log) => {

        $scope.documentOptions = {
            edit: false,
            paymentmethod: 'checks'
        };

        var id = $stateParams.id;

        function load() {
            if (id) {
                Restangular.one('financials').one('paymentdocumentitems', id).get().then(result => {
                    var item = result;
                    $scope.item = item;
                });
            }
        }
        $scope.back = () => {
            $state.go('app.paymentdocuments.documentslist', { documentTypeName: $scope.documentOptions.paymentmethod });
        }
        $scope.edit = () => {
            $scope.documentOptions.edit = true;
        }

        $scope.save = () => {
            if (id) {
                $scope.item.put().then(() => { $state.go('app.paymentdocuments.documentslist', { documentTypeName: $scope.documentOptions.paymentmethod }); });
            } else {
                Restangular.service('financials/paymentdocumentitems').post($scope.bankbranch).then(() => { $state.go('app.financials.bankbranches'); });
            }
        }
        
        load();
    })

    .controller('FinancialsPaymentMethodsListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.paymentmethodnew');
        }
    })
    .controller('FinancialsPaymentMethodsEditController', ($scope: any, $translate, $stateParams, $state, Restangular) => {

        var id = $stateParams.id;

        function load() {
            if (id) {
                Restangular.one('financials').one('paymentmethods', id).get().then(result => {
                    $scope.paymentMethod = result;
                });
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.paymentMethod.put().then(() => { $state.go('app.financials.paymentmethods'); });
            } else {
                Restangular.service('financials/paymentmethods').post($scope.paymentMethod).then(() => { $state.go('app.financials.paymentmethods'); });
            }
        }

        load();
    })
    .controller('FinancialsDepositModalController', ($scope, Restangular, $log, data, $uibModalInstance, toastr) => {
        $scope.deposit = {
            paymentDocumentMethodIds: data.ids
        };
        
        $scope.save = () => {

            Restangular
                .service('financials/checksincustody/deposit')
                .post($scope.deposit)
                .then((result) => {
                    $uibModalInstance.close();
                }, () => { toastr.error('Finanzas', 'Se produjo un error en la operación.'); });
        }
    })
    .directive('paymentDocument', ($log, $rootScope, $state, $window, $timeout, session, dialogs, Restangular, FileUploader) => {
        return {
            restrict: 'E',
            templateUrl: '/app/financials/paymentdocuments/editform.htm',
            scope: { document: '=?', options: '=', commands: '=' },
            requires: '^Screen',
            link(scope: IFinancialDocumentScope) {
                scope._ = _;
                scope.paymentMethods = [];
                scope.document.items = [];
                scope.document.methods = [];

                scope.uploader = new FileUploader({
                    scope: scope,
                    autoUpload: true,
                    removeAfterUpload: false
                });

                scope.options.uploadProgress = 0;

                scope.uploader.onProgressItem = (item, progress) => {
                    scope.options.uploadProgress = progress;
                }

                scope.uploader.onCompleteAll = () => {
                    Restangular.one('paymentdocuments').one('documents', scope.document.id).one('files').get().then(result => {
                        scope.document.files = result.results;

                        scope.uploader.destroy();
                        scope.uploader = new FileUploader({
                            scope: scope,
                            autoUpload: true,
                            removeAfterUpload: false
                        });
                    });
                };

                scope.$on('reload', (id) => {
                    $log.info('reloading document ' + id);
                });

                scope.addItem = () => {
                    var title = 'Nuevo item a pagar';
                    if (scope.document.typeId == 2) {
                        title = 'Nuevo item a cobrar';
                    }
                    var data: any = {
                        title: title,
                        height: 'auto',
                        template: '/app/financials/paymentdocuments/item.html',
                        document: scope.document,
                        paymentAvailableAmount: _.sumBy(scope.document.methods, 'amount'),
                        item: {}
                    };
                    var modalInstance = dialogs.create('/app/common/modal.html', 'ModalController', data, { size: 'lg', animation: false });
                    modalInstance.result.then((result) => {
                        console.log(result);
                        scope.document.items.push(result);
                        
                    }, () => { });
                };

                scope.removeItem = (item) => {
                    if (angular.isDefined(item)) {
                        var index = scope.document.items.indexOf(item);
                        scope.document.items.splice(index, 1);
                    }
                };

                scope.addMethod = (paymentMethod) => {
                    var data: any = {
                        document: scope.document,
                        paymentMethod: paymentMethod
                    };

                    switch (paymentMethod.typeId) {
                        case 1:
                            data.template = 'cashtransaction';
                            break;
                        case 2:
                            data.template = 'banktransfer';
                            break;
                        case 3:
                            data.template = 'check';
                            break;
                        case 4:
                            data.template = 'banktransfer';
                            break;
                    }

                    data.template = '/app/financials/paymentdocuments/' + data.template + '.html';

                    var newMethod = { typeId: paymentMethod.id }; //, checkNumber: 123456 
                    data.item = newMethod;
                    var modalInstance = dialogs.create('/app/common/modal.html', 'ModalController', data, { size: 'lg', animation: false });
                    modalInstance.result.then((result) => {
                        var paymentMethod = _.find(scope.paymentMethods, { typeId: data.paymentMethod.typeId });
                        if (angular.isDefined(paymentMethod)) {
                            result.paymentMethodName = paymentMethod["name"];
                            result.paymentMethodId = paymentMethod["id"];
                        }

                        if (angular.isDefined(result.bankAccount)) {
                            result.bankAccountId = result.bankAccount.valueId;
                            result.bankAccountName = result.bankAccount.value;
                        }
                        
                        scope.document.methods.push(result);
                        scope.doCalculations();
                    }, () => { });
                };

                scope.removeMethod = (method) => {
                    if (angular.isDefined(method)) {
                        var index = scope.document.methods.indexOf(method);
                        scope.document.methods.splice(index, 1);
                        scope.doCalculations();
                    }
                    else {
                        scope.options.newMethod = {
                            bonus: 0
                        };
                    }
                };

                $timeout(() => {
                    scope.session = session;
                    scope.editorOptions = { height: '100px;' };
                    angular.merge(scope.options, {
                        newItem: {}
                    });

                    Restangular.one('financials').one('paymentdocuments').one('types').get().then(result => {
                        scope.documentTypes = result.results;
                        //scope.document.typeId = 1; //Ahora depende del state
                        if (angular.isDefined(scope.document) && scope.document.id !== null) {
                            scope.document.documentType = _.find(scope.documentTypes, { id: scope.document.typeId });
                        }
                    });

                    Restangular.one('financials').one('paymentmethods').get().then(result => {
                        scope.paymentMethods = result.results;
                        if (angular.isDefined(scope.document) && scope.document.id !== null) {
                            scope.document.paymentMethodId = _.find(scope.paymentMethods, { id: scope.document.paymentMethodId });
                        }
                    });

                    scope.$watch('options.newItem.paymentMethodId', (value: any) => {
                        if (angular.isDefined(scope.options.newItem.paymentMethodId)) {
                            scope.options.newItem.paymentMethod = _.find(scope.paymentMethods, { id: value });
                        }
                    }, true);

                    scope.isPaymentMethodCash = (paymentMethod) => {
                        if (angular.isDefined(paymentMethod)) {
                            return paymentMethod.typeId === 0;
                        }
                    };

                    scope.$watch('document', (value: any) => {
                        if (angular.isDefined(value)) {
                            if (angular.isDefined(value.id)) {
                                scope.messageServiceUrl = 'paymentdocuments/documents/' + scope.document.id + '/messages';
                                scope.uploader.url = '/api/paymentdocuments/documents/' + scope.document.id + '/files.json';
                                scope.document.documentType = _.find(scope.documentTypes, { id: value });
                                selectDocumentType(value.typeId);

                            } else {
                                scope.document.status = 0;
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                            };


                            if (!angular.isDefined(scope.document.items)) {
                                scope.document.items = [];
                            } else {
                                scope.doCalculations();
                            }

                            if (!angular.isDefined(scope.document.methods)) {
                                scope.document.methods = [];
                            } else {
                                scope.doCalculations();
                            }

                            scope.$watch('options.edit', (value: any) => { load() });

                            scope.$watch('document.options.receiverId', (value: any) => {
                                if (value && scope.document.byOrderOf) {
                                    scope.document.receiverId = value;
                                }
                            });

                            scope.$on('reloadMessages', (event, messages) => {
                                scope.document.messages = messages;
                            });

                            scope.options.canEdit = () => {
                                return !angular.isDefined(scope.document.approvalWorkflowId);
                            };
                        }
                    }, true);

                    function selectDocumentType(value) {
                        if (angular.isDefined(value)) {
                            scope.document.documentType = _.find(scope.documentTypes, { id: value });
                        }
                    }
                    function load() {

                    }

                    scope.openFile = (file) => {
                        $window.open('api/paymentdocuments/documents/' + scope.document.id + '/files/' + file.guid);
                    };

                    scope.isItemValid = (item) => {
                        var isValid = angular.isDefined(item.paymentMethodId) && item.paymentMethodId != null &&
                            angular.isDefined(item.amount) && item.amount != null;
                        return isValid;
                    };

                    scope.amountChanged = (item) => {
                        scope.doCalculations();
                    };
                    scope.doCalculations = () => {
                        scope.document.totalAmount = _.sumBy(scope.document.items, 'amount');
                    }
                    
                    scope.$watch('document.receiverId', (receiverId) => {
                        scope.accounts = [];
                        if (angular.isDefined(receiverId)) {
                            Restangular.one('businesspartners').one('businesspartners/persons', receiverId).get().then(result => {
                                scope.accounts = result.accounts.items;
                            });
                        }
                    });

                });
            }
        };
    })
    .controller('PaymentDocumentItemController', ($scope,Restangular) => {        
        $scope._ = _;
        $scope.businessDocumentTypesCollection = [22,25];
        $scope.businessDocumentTypesPayment = [23];
        
        $scope.init = function(receiverId, paymentAvailableAmount)
        {
            $scope.receiptAmount = paymentAvailableAmount;
            $scope.receiverId = receiverId;
            $scope.paymentAvailableAmount = paymentAvailableAmount;
        };
        var canChangeAmountToPay = true;
        $scope.originalAmountChanged = () => {
            if ($scope.item.originalAmount != null && $scope.item.originalAmount > 0 && canChangeAmountToPay) {
                $scope.item.amountToPay = $scope.item.originalAmount;
            }
        }

        $scope.updatePaymentAvailableAmount = () =>{
            $scope.paymentAvailableAmount = $scope.receiptAmount - _.sumBy($scope.item.parentItems, 'capitalApplication') - _.sumBy($scope.item.parentItems, 'interestApplication');
        }

        $scope.amountToPayChanged = () => {
            canChangeAmountToPay = false;
        }

        $scope.getPaymentDetails = () =>{
            Restangular.one('businessdocuments').one('documents').one('collection', $scope.item.businessDocumentId).get().then(result => {
                
                $scope.item.relatedDocumentId = result.id;
                var sumOriginalAmount = 0;
                var sumAmountToPay = result.total;
                result.parentItems.forEach(settlement => {
                    sumOriginalAmount += settlement.amount - settlement.appliedAmount;

                    if ($scope.paymentAvailableAmount > settlement.amountInterest){
                        settlement.interestApplication = settlement.amountInterest;
                        $scope.paymentAvailableAmount -= settlement.amountInterest;
                    }else{
                        settlement.interestApplication = $scope.paymentAvailableAmount;
                        $scope.paymentAvailableAmount = 0;
                    }

                    if ($scope.paymentAvailableAmount > (settlement.amount - settlement.appliedAmount)){
                        settlement.capitalApplication = settlement.amount - settlement.appliedAmount;
                        $scope.paymentAvailableAmount -= settlement.amount - settlement.appliedAmount;
                    }else{
                        settlement.capitalApplication = $scope.paymentAvailableAmount;
                        $scope.paymentAvailableAmount = 0;
                    }
                });

                $scope.item.originalAmount = sumOriginalAmount;
                $scope.item.amountToPay = sumAmountToPay;
                $scope.item.description = result.number;
                $scope.item.parentItems = result.parentItems;
                //$scope.paymentDetail = result;
                
            });
        }

        $scope.changedisplay = () => {
            if ($scope.displaySettlement == false){
                document.getElementById("settlmentdetail").style.display = "block";
                $scope.displaySettlement = true;
            }else{
                document.getElementById("settlmentdetail").style.display = "none";
                $scope.displaySettlement = false;
            }
        }
    })
    .controller('FinancialsCashTransactionController', ($scope, $uibModalInstance) => { })
    .controller('FinancialsCheckController', ($log, $scope) => {})
    .controller('FinancialsBankTransferController', ($scope, $uibModalInstance) => { })
    .directive('financialsPaymentMethodsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsPaymentMethodsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre', 'Descripción', 'Tipo'];
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
                    //{ name: 'tenantId', index: 'tenantId', search: false },
                    //{ name: 'paymentMethodTypeId', index: 'paymentMethodTypeId', search: false },
                    { name: 'name', index: 'name', search: false },
                    { name: 'description', index: 'description', search: false },
                    { name: 'paymentMethodTypeName', index: 'paymentMethodTypeName', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/financials/paymentmethods.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
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
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.financials.paymentmethodedit';
                            $state.go(stateName, { paymentMethodId: rowId });
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
    .directive('financialsBankBranchesGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsBankBranchesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Banco', 'Nombre'];
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
                    { name: 'bankName', index: 'bankName', search: false },
                    { name: 'name', index: 'name', search: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/bankbranches.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
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
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.financials.bankbranchedit';
                            $state.go(stateName, { bankBranchId: rowId });
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
    .directive('financialsPaymentDocumentsGrid', ($state, $filter, $compile, $log, businessDocumentStatus, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', typeId: '@' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsPaymentDocumentsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;
                scope.typeId = scope.typeId || 1;

                function toSearchOptions(statusEnum) {
                    var options = [];
                    options.push(":Todos");
                    for (var index = 0; index < statusEnum.length; ++index) {
                        options.push(statusEnum[index].id + ':' + statusEnum[index].name);
                    }

                    return options.join(";");
                }

                function currencyFormatter(cellvalue, options, rowObject) {
                    var value = parseFloat(cellvalue);
                    return $filter('currency')(value);
                }

                function businessDocumentStatusFormatter(cellvalue, options, rowObject) {
                    var id = parseInt(cellvalue);
                   
                    var item: any = _.find(businessDocumentStatus, { id: id });
                    return item.name;
                }

                var colNames = ['', 'Tipo', 'Numero', 'Emisor', 'Receptor', 'Fecha', 'Total', 'Estado', 'Responsable'];
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
                    { name: 'typeName', index: 'typeName', search: true, fixed: true, width: 55 },
                    { name: 'number', index: 'number', search: true, fixed: true, width: 95 },
                    { name: 'issuerName', index: 'issuerName', search: true },
                    { name: 'receiverName', index: 'receiverName', search: true },
                    {
                        name: 'documentDate', index: 'documentDate', search: true, formatter: 'date', fixed: true, width: 90,
                        searchoptions: {
                            dataInit: (elem) => {
                                var datePicker = $compile('<div id="documentDate" data-date-picker-filter="" style="overflow: visible; position: relative;"></div>')(scope);
                                angular.element(elem).replaceWith(datePicker);
                            }
                        }
                    },
                    {
                        name: 'amount', index: 'amount', search: true, fixed: true, width: 110, formatter: currencyFormatter, align: 'right'
                    },
                    {
                        name: 'status', index: 'status', search: true, fixed: true, width: 100, formatter: businessDocumentStatusFormatter,
                        formatoptions: { items: businessDocumentStatus },
                        stype: 'select',
                        searchoptions: { value: toSearchOptions(businessDocumentStatus) }
                    },
                    { name: 'roles', index: 'roles', search: false, width: 95, fixed: true, sortable: false }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/paymentdocuments.json?typeId=' + scope.typeId,
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
                    footerrow: true,
                    userDataOnFooter: true,
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
                        userdata: 'meta',
                        root: 'results'
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeProcessing: (data, status, xhr) => { },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol, cellcontent, e) {
                        if (iCol === 0) {
                            var stateName = 'app.financials.ap.paymentorder';
                            if (scope.typeId == 2) {
                                stateName = 'app.financials.ar.receipt';
                            }
                            $state.go(stateName, { documentId: rowId });
                            return false;
                        }
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
    });
