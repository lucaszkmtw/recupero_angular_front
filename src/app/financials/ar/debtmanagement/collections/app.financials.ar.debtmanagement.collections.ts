angular.module('app.financials.ar.debtmanagement.collections', [])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.ar.debtmanagement.collection', {
                url: '/collection/list',
                controller: 'FinancialsDebtListManagementCollectionController',
                templateUrl: 'app/financials/ar/debtmanagement/collections/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'Expedientes'
                }
            })
            .state('app.financials.ar.debtmanagement.edit',
                {
                    url: '/collection/{documentId}',
                    controller: 'FinancialsDebtManagementCollectionController',
                    templateUrl: 'app/financials/ar/debtmanagement/collections/form.html',
                    resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                    ncyBreadcrumb: {
                        parent: 'app.financials.ar.debtmanagement.collection',
                        label: ' {{document.documentType.name}}'
                    },
                    data: {
                        requiresLogin: true,
                        edit: true
                    }

                })
            .state('app.financials.ar.debtmanagement.view',
                {
                    url: '/collection/{documentId}/view',
                    controller: 'FinancialsDebtManagementCollectionController',
                    templateUrl: 'app/financials/ar/debtmanagement/collections/form.html',
                    resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                    ncyBreadcrumb: {
                        parent: 'app.financials.ar.debtmanagement.collection',
                        label: ' {{document.documentType.name}}'
                    },
                    data: {
                        requiresLogin: true,
                        edit: true
                    }

                })
            .state('app.financials.ar.debtmanagement.new',
                {
                    url: '/collection/new',
                    controller: 'FinancialsDebtManagementCollectionController',
                    templateUrl: 'app/financials/ar/debtmanagement/collections/form.html',
                    resolve: loadSequence('ngCkeditor', 'ui-mask', 'icheck', 'angularFileUpload', 'toastr'),
                    ncyBreadcrumb: {
                        parent: 'app.financials.ar.debtmanagement.collection',
                        label: '{{ "command.new.f" | translate }} {{document.documentType.name}}'
                    },
                    data: {
                        requiresLogin: true,
                        edit: true
                    }

                });
    })
    .controller('FinancialsDebtListManagementCollectionController', ($scope, $translate, $state, Restangular, dialogs, $window) => {
        $scope.params = {
            filter: null,
            tabs: [],
            view: 0,
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.financials.ar.debtmanagement.new');
        }

        $scope.newNad = () => {
            //TODO
        }

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            //  $state.go('app.health.treatmentrequest', { treatmentRequestId: id });
        };

        $scope.canEdit = () => {
            return $scope.params.view === 0 || $scope.session.isAdmin();
        }

        $scope.edit = (id) => {
            //  $state.go('app.health.treatmentrequestedit', { treatmentRequestId: id });
        };

        function load() {

            ///api/businessdocuments/documents?module=7
            Restangular.one('businessdocuments').one('documents').get({ module: 7 }).then(result => {
            });
            Restangular.one('system/roles/lookup.json').get().then(result => {
                result.data.splice(5, 2);
                $scope.params.tabs = result.data;
            });

            $scope.$broadcast('loadData');
        }

        $scope.showImportDialog = () => {
                var modalInstance = dialogs.create('app/financials/ar/debtmanagement/collections/importmodal.html', 'importDialogCtrl', {}, 'lg');
                modalInstance.result.then(result => {
                        $window.location.reload();
                })
                .finally(function() {
                    modalInstance.$destroy();
                    $window.location.reload();
                });
                
                
            };
        load();
    })

    .controller('importDialogCtrl', ($scope,dialogs, $uibModalInstance,authManager, Restangular, toastr, $log, FileUploader) => {
        $scope.document = {};
        $scope.PaymentMethodId = null;
        $scope.PayExistingDebt =false;
        $scope.CreditorId = null;
        $scope.DebtorId = null;
        $scope.BusinessDocumentNumber = '';
        $scope.mapColumns = [
            { value: 'cuit', name: 'CUIT' },
            { value: 'firstName', name: 'Nombre' },
            { value: 'lastName', name: 'Apellido' },            
            { value: 'personStreet', name: 'Calle' },
            { value: 'personStreetNumber', name: 'Número' },
            { value: 'personZipCode', name: 'CP' },
            { value: 'personFloor', name: 'Piso' },
            { value: 'personAppartment', name: 'Departamento' },
            { value: 'personLocation', name: 'Localidad' },
            { value: 'personProvince', name: 'Provincia' },
            { value: 'personPhone', name: 'Teléfono' },
            { value: 'personEmail', name: 'E-mail' },
            { value: 'personWebUrl', name: 'Página Web' },
            { value: 'personEmployerFirstName', name: 'Empleador Nombre' },
            { value: 'personEmployerLastName', name: 'Empleador Apellido' },
            { value: 'personEmployerCode', name: 'Empleador CUIT' },
            { value: 'personEmployerPhone', name: 'Empleador Teléfono' },
            { value: 'personSalary', name: 'Ingresos Empleado' },
            { value: 'personEmployeeStartDate', name: 'Fecha de Inicio Relación Laboral' },
            { value: 'bank', name: 'Banco' },
            { value: 'bankBranch', name: 'Sucursal Bancaria' },
            { value: 'cbu', name: 'CBU' },
            { value: 'currency', name: 'Moneda' },
            { value: 'groups', name: 'Grupos' }
        ]

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: API_HOST + '/api/businessdocuments/files?format=json',
            autoUpload: true,
            headers: { "Authorization": "Bearer " + authManager.getToken() },
            queueLimit: 100,
            removeAfterUpload: false,
        });
        
        $scope.uploader.onCompleteItem = (item, response, status, headers) => {
            $scope.response = response;
            $scope.columns = _.map($scope.response.columns, (item) => { return {name: item, map: null} });
        }
        $scope.no = () => {
            $uibModalInstance.close();
        }

        $scope.save = () => {
            var postObject = {
                creditorId: $scope.CreditorId,
                debtorId: $scope.DebtorId,
                businessDocumentNumber: $scope.BusinessDocumentNumber,
                paymentMethodId: $scope.PaymentMethodId,
                payExistingDebt: $scope.PayExistingDebt ,
                fileName: $scope.response.fileName,
                columns: _.map($scope.columns, (item) => { return item["map"] })
            };
            Restangular.service('businessdocuments/import').post(postObject).then((result) => {
                $uibModalInstance.close(result.insertedItemsCount);
            });
        }
    
    })

    .controller('FinancialsDebtManagementCollectionController', ['$scope', '$location', "$timeout", '$translate', '$stateParams', '$state', 'Restangular', 'FileUploader', 'toastr', '$log', 'session', "dialogs"
        , ($scope: ICreditBusinessDocumentScope, $location, $timeout, $translate, $stateParams, $state, Restangular, FileUploader, toastr, $log, session, dialogs) => {
            
            var id = $stateParams.documentId;
            var edit = $state.current.data && $state.current.data.edit || false;
            var mode = $location.path().split(/[\s/]+/).pop();
            $scope.selectedAll = false;
            $scope.serviceUrl = 'businessdocuments/document/' + id + '/messages';
            $scope.limit = 0;

            $scope.uploader = new FileUploader({
                scope: $scope,
                autoUpload: true,
                removeAfterUpload: false
            });
            $scope.settlementItems = [];
            
            $scope.creditorsIds = 0;
            $scope.debtorsIds = [];

            $scope.addAllSettlementItem = () => {
                if ($scope.selectedExpired){
                    $scope.selectedExpired = !$scope.selectedExpired;
                }
                if ($scope.selectedCurrent){
                    $scope.selectedCurrent = !$scope.selectedCurrent;
                }

                $scope.selectedAll = !$scope.selectedAll;
                $scope.settlementItems = [];
                $scope.document.selectedAmount = 0;
                
                $scope.document.items.forEach(item => {
                    if ($scope.selectedAll) {
                        if ((!item.appliedAmount || (item.appliedAmount < item.unitPrice)) || item.pendingInterest > 0){
                            item.selected = true;
                            $scope.settlementItems.push(item);
                            $scope.document.selectedAmount += item.unitPrice;
                        }
                    }else{
                        item.selected = false;
                    }
                });
            }

            $scope.addCurrentSettlementItem =() => {
               
                $scope.selectedAll = false;
                $scope.selectedExpired = false;
                $scope.selectedCurrent = !$scope.selectedCurrent;
                $scope.settlementItems = [];
                $scope.document.selectedAmount = 0;
                $scope.document.items.forEach(item => {
                    if ($scope.selectedCurrent && (item.status === 0 || item.status === 1)) {
                        if (!(item.appliedAmount >= item.unitPrice) && (!item.pendingInterest || item.pendingInterest > 0)){
                            item.selected = true;
                            $scope.settlementItems.push(item);
                            $scope.document.selectedAmount += item.unitPrice;
                        }

                    }else{
                        item.selected = false;
                    }
                });
            }

            $scope.addExpiredSettlementItem = () => {
                $scope.selectedAll = false;
                $scope.selectedCurrent = false;
                $scope.selectedExpired = !$scope.selectedExpired;
                $scope.settlementItems = [];
                $scope.document.selectedAmount = 0;
                $scope.document.items.forEach(item => {
                    if ($scope.selectedExpired && item.status === 2) {
                        if (!(item.appliedAmount >= item.unitPrice) && (!item.pendingInterest || item.pendingInterest > 0))
                        {
                            item.selected = true;
                            $scope.settlementItems.push(item);
                            $scope.document.selectedAmount += item.unitPrice;
                        }

                    }else{
                        item.selected = false;
                    }
                });
            }

            $scope.addSettlementItem = (item) => {
                if (item.selected){
                    $scope.settlementItems.push(item);
                    $scope.document.selectedAmount += item.unitPrice;
                }else{
                    var index = $scope.settlementItems.indexOf(item);
                    $scope.settlementItems.splice(index,1);
                    $scope.document.selectedAmount += (-1)*item.unitPrice;
                }
            }
            //  $scope.options.uploadProgress = 0;
            $scope.$on('reloadMessages', (event, messages) => {
                $scope.document.messages = messages;
            });
            $scope.documentTypes = [];
            $scope.documentOptions = { edit: edit };
            $scope.options = $scope.documentOptions;

            $scope.options.canEdit = () => {
                return !angular.isDefined($scope.document.approvalWorkflowId);
            };
            $scope.options.canSave = () => {
                if (!$scope.document) {
                    return false;
                }
                if ($scope.document.items.length === 0) {
                    return false;
                }

                return true;
                // return !angular.isDefined($scope.document.approvalWorkflowId);
            };

            $scope.canApprove = () => {
                // if ($scope.loan && $scope.loan.authorizationWorkflowInstance) {
                //     if (($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 149) || ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 3004)) {
                //         return true;
                //     }

                //     if (($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 150) || ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 3005)) {
                //         return false;
                //     }

                //     return true;
                // }

                return true;
            };

            $scope.canGoBack = () => {

                // if ($scope.loan && $scope.loan.authorizationWorkflowInstance) {
                //     if (($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 150) || ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 3005)) {
                //         return false;
                //     }

                //     if (($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 151) || ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 3006)) {
                //         return false;
                //     }

                //     return true;
                // }

                return true;
            };

            $scope.loadMore = function () {
                if ($scope.limit + 10 >= $scope.document.items.length){
                    $scope.limit = $scope.document.items.length;
                }else{
                    $scope.limit += 10;
                }
                    
            }

            $scope.openSettlementDialog = () => {

                var canMakeSettlement = true;
                var total = 0;
                $scope.document.items.forEach(item => {
                    if (!item.id){
                        canMakeSettlement = false;
                    }

                });


                if (canMakeSettlement){
                    //if ($scope.document.voidDate === null){
                        var modal = dialogs.create(
                            "app/financials/ar/debtmanagement/collections/modal.settlement.html",
                            "settlementsController",
                            $scope.settlementItems,
                            { size: "lg", animation: true }
                        );
        
                        modal.result.then(
                            result => {
                                var item = result;
                                Restangular.service('businessdocuments/documents/reckoning').post(item).then((result) => {
                                    toastr.success('Editor de documento', 'El documento se creó con éxito');
                                    $state.reload();
                                });
                            },
                            () => { }
                        );
                    //}else{
                    //    toastr.error('Debe configurar al menos una ley por crédito');
                    //}
                }else{
                    
                }

            };

            $scope.openCreditSelector = () => {

                var item = { categoryId: $scope.document.categoryId, productId: null, productName: '', unitPrice: 0, voidDate: null, notificationDate: null, quantity: 1, creditors: [], debtors: [], fieldsJSON: {} };

                var modal = dialogs.create(
                    "app/financials/ar/debtmanagement/collections/modal.credits.html",
                    "selectCreditController",
                    {item: item, debtorsIds: $scope.debtorsIds, creditorsIds: $scope.creditorsIds},
                    { size: "lg", animation: true }
                );

                modal.result.then(
                    result => {
                        var item = result;
                        $scope.creditorsIds = item.creditors;
                        $scope.debtorsIds = item.debtors;
                        // $scope.document.netAmount = $scope.document.netAmount + item.unitPrice;
                        // $scope.document.totalAmount = $scope.document.netAmount;
                        $timeout(() => {
                            if (!$scope.document.items) {
                                $scope.document.items = new Array<any>();
                            }
                            $scope.document.items.push(item);
                            calcTotals();
                        });
                    },
                    () => { }
                );
            };

            $scope.addLaws = (item, index) => {
                if (item) {
                    item.issuerId = $scope.document.issuerId;
                    var modal = dialogs.create(
                        "app/financials/ar/debtmanagement/collections/modal.laws.html",
                        "selectLawController",
                        item,
                        { size: "lg", animation: true }
                    );

                    modal.result.then(
                        result => {
                            if (result) {
                                $scope.document.items.splice(index, 1);
                                $timeout(() => {
                                    $scope.document.items.push(result);
                                    // $scope.document.items.splice(index, 1);
                                    calcTotals();
                                });
                            }
                        },
                        () => { }
                    );
                }
                calcTotals();
            }

            $scope.editSelectedItem = (item, index) => {
                if (item) {
                    item.categoryId = $scope.document.categoryId;
                    var itemEdit = angular.copy(item);

                    var modal = dialogs.create(
                        "app/financials/ar/debtmanagement/collections/modal.credits.html",
                        "selectCreditController",
                        {item: itemEdit},
                        { size: "lg", animation: true }
                    );

                    modal.result.then(
                        result => {
                            var newItem = angular.copy(result);

                            var item = result;
                            $scope.creditorsIds = item.creditors;
                            $scope.debtorsIds = item.debtors;

                            if (result) {
                                $timeout(() => {
                                    $scope.document.items.splice(index, 1);
                                }, 500);

                                $timeout(() => {
                                    $scope.document.items.push(newItem);
                                    calcTotals();
                                }, 600);
                            }
                        },
                        () => { }
                    );
                }
            }

            $scope.removeSelectedItem = (item) => {

                var dlg = dialogs.confirm('Editor de Conceptos', 'Está seguro que desea eliminar este concepto?');
                dlg.result.then((btn) => {
                    $scope.document.items.splice(item, 1);
                    calcTotals();
                });

            }

            function calcTotals() {
                try {
                    var total = 0;
                    $scope.document.items.forEach(item => {
                        total = total + item.unitPrice;

                    });
                    $scope.document.netAmount = total;
                    $scope.document.totalAmount = total;

                    var minNotificationDateItem: Date = null;
                    $scope.document.items.forEach(element => {
                        if (element.notificationDate) {
                            if (!minNotificationDateItem) {
                                minNotificationDateItem = new Date(element.notificationDate);
                            } else {
                                if (minNotificationDateItem > new Date(element.notificationDate)) {
                                    minNotificationDateItem = new Date(element.notificationDate);
                                }
                            }
                        }
                    });
                    if (minNotificationDateItem) {
                        $scope.document.notificationDate = minNotificationDateItem;
                    }



                    var minPrescriptionDateItemLaw: Date = null;
                    var minPrescriptionDayItemLaw = 0;
                    var pendingLaws = false;
                    $scope.document.items.forEach(element => {
                        if (element.lawTexts.length === 0){
                            pendingLaws = true;
                        }
                        if (!pendingLaws){
                            element.lawTexts.forEach(lawPrescription =>{
                                if (lawPrescription.prescription){
    
                                    if ((minPrescriptionDayItemLaw === 0) && lawPrescription.prescription > 0){
                                        minPrescriptionDayItemLaw = lawPrescription.prescription;
                                    }else{
                                        if ((minPrescriptionDayItemLaw != 0) && (minPrescriptionDayItemLaw >= lawPrescription.prescription)){
                                            minPrescriptionDayItemLaw = lawPrescription.prescription;
                                        }
                                    }
                                }
                            });
                        }

                    });
                    if (!pendingLaws){
                        $scope.document.voidDate = new Date($scope.document.notificationDate);
                        var prescriptionDate = new Date($scope.document.notificationDate);
                        $scope.document.voidDate = prescriptionDate.setDate(prescriptionDate.getDate() + minPrescriptionDayItemLaw);
                    }else{
                        $scope.document.voidDate = null;
                    }


                }
                catch{ console.log('Error totales'); }
            }

            $scope.edit = () => {
                $scope.documentOptions.edit = true;
            }

            $scope.save = () => {
                if ($scope.document.id) {
                    $scope.document.total = $scope.document.totalAmount;
                    var countItems = 0;
                    $scope.document.items.forEach(element => {
                        countItems = countItems + 1;
                        element.fieldsJSON = JSON.stringify(element.fieldsJSON, null, "    ");
                    });
                    if (countItems === 0) {
                        toastr.error('Editor de documento', 'El documento debe contener al menos un concepto');
                        return;
                    }
                    $scope.document.put().then(() => {
                        toastr.success('El documento se actualizó con éxito');
                        $state.reload();
                    });

                } else {
                    $scope.document.total = $scope.document.totalAmount;
                    var countItems = 0;
                    $scope.document.items.forEach(element => {
                        countItems = countItems + 1;
                        element.fieldsJSON = JSON.stringify(element.fieldsJSON, null, "    ");
                    });
                    if (countItems === 0) {
                        toastr.error('Editor de documento', 'El documento debe contener al menos un concepto');
                        return;
                    }
                    ///businessdocuments/documents/collection
                    Restangular.service('businessdocuments/documents/collection').post($scope.document).then((result) => {
                        toastr.success('Editor de documento', 'El documento se creó con éxito');
                        $state.go('app.financials.ar.debtmanagement.collection');
                    });
                }
            }

            $scope.edit = () => {
                $state.go('app.financials.ar.debtmanagement.edit', { documentId: id });
            }
            $scope.submitForApproval = () => {
                Restangular.service('businessdocuments/documents/' + $scope.document.guid + '/submitforapproval').post({}).then((result) => {
                    toastr.success('Editor de documento', 'Se ha iniciado el proceso de aprobación del documento con éxito.');
                    $state.go('app.financials.ar.debtmanagement.collection');
                });
            }
            $scope.showSettlement = (item) => {
                if (item) {
                    Restangular.one('businessdocuments').one('documents').one('collection', item.id).get().then(result => {
                        var modal = dialogs.create(
                            "app/financials/ar/debtmanagement/collections/modal.settlementdetail.html",
                            "settlementDetailController",
                            result,
                            { size: "lg", animation: true }
                        );

                        modal.result.then(
                            result => {
                                var item = result;

                            },
                            () => { }
                        );
                    });
                }
            }

            $scope.addNad = (item) => {
                if (item) {
                    if (item.linkedNumber != null){
                        toastr.error('Esta liquidación ya posee NAD asociada');

                    }else{
                        Restangular.service('businessdocuments/documents/collection/' + item.id + '/paymentcoupon').post({Id: item.id}).then((result) => {
                            if (result === false){
                                toastr.error('Editor de documento', 'El documento Nad no se pudo generar');
                            }else{
                                toastr.success('Editor de documento', 'El documento Nad se genero con exito');
                                $state.reload();
                                
                            }

                        }, () => {
                            toastr.success('Editor de documento', 'El documento Nad no se pude generar');
                        });
                    }


                }
            }
            $scope.addLiqIGB = (item) => {
                if (item) {
                    if (item.linkedNumber != null){
                        toastr.error('Esta liquidación ya posee LIQ IGB asociada');

                    }else{
                        Restangular.service('businessdocuments/documents/collection/' + item.id + '/paymentcoupon').post({Id: item.id}).then((result) => {
                            if (result === false){
                                toastr.error('Editor de documento', 'El documento LIQ IGB no se pudo generar');
                            }else{
                                toastr.success('Editor de documento', 'El documento LIQ IGB se genero con exito');
                                $state.reload();
                                
                            }

                        }, () => {
                            toastr.success('Editor de documento', 'El documento LIQ IGB no se pude generar');
                        });
                    }


                }
            }

            $scope.addLiqDGJ = (item) => {
                if (item) {
                    if (item.linkedNumber != null){
                        toastr.error('Esta liquidación ya posee LIQ DGJ asociada');

                    }else{
                        Restangular.service('businessdocuments/documents/collection/' + item.id + '/paymentcoupon').post({Id: item.id}).then((result) => {
                            if (result === false){
                                toastr.error('Editor de documento', 'El documento LIQ DGJ no se pudo generar');
                            }else{
                                toastr.success('Editor de documento', 'El documento LIQ DGJ se genero con exito');
                                $state.reload();
                                
                            }

                        }, () => {
                            toastr.success('Editor de documento', 'El documento LIQ DGJ no se pude generar');
                        });
                    }


                }
            }

            $scope.addTe= (item) => {
                if (item) {
                    Restangular.service('businessdocuments/documents/collection/' + item.id + '/execution').post({Id: item.id}).then((result) => {
                        toastr.success('Editor de documento', 'El el documento T.E se genero con exito');
                        $state.reload();
                    });

                }
            }

            $scope.addApremio = (item) =>{
                var modal = dialogs.create(
                    "app/financials/ar/debtmanagement/collections/modal.settlement.apremio.html",
                    "apremioController",
                    item,
                    { size: "lg", animation: true }
                );

                modal.result.then(
                    result => {
                        var item = result;

                        Restangular.service('businessdocuments/documents/reckoning').post(item).then((result) => {
                            toastr.success('Editor de documento', 'El documento se creó con éxito');
                            $state.reload();
                        });
                    },
                    () => { }
                );
            }
            function loadDocuments() {
                ///businessdocuments/types.json?CollectionDocument=1
                Restangular.one('businessdocuments').one('types').get({ CollectionDocument: 1 }).then(result => {

                    $scope.documentTypes = result.results;

                    if (angular.isDefined($scope.document) && $scope.document.id !== null) {
                        $scope.document.documentType = _.find($scope.documentTypes, { id: $scope.document.typeId });
                    }
                });
            }


            function load() {
                if (mode === 'view') {
                    $scope.mode = 1;
                } else {
                    $scope.mode = 0;
                }
                loadDocuments();
                $scope.document = { id: null, items: [], netAmount: 0, totalAmount: 0, selectedAmount: 0, issuerId: null };
                if (id) {
                    Restangular.one('businessdocuments').one('documents').one('collection', id).get().then(result => {
                        $scope.document = result;
                        $scope.document.selectedAmount = 0;
                        if ($scope.document.items.length < 10){
                            $scope.limit = $scope.document.items.length;
                        }else{
                            $scope.limit = 10;
                        }
                        $scope.document.notAppliedAmount = $scope.document.total;
                        $scope.document.applieadAmount = 0;
                        $scope.document.items.forEach(item => {
                            try {
                                $scope.creditorsIds = item.creditors;
                                $scope.debtorsIds = item.debtors;
                                item.fieldsJSON = angular.fromJson(item.fieldsJSON);
                                item.productName = item.product.name;
                                item.productDescription = item.fieldsJSON.find(item => item.name === 'Numero de factura').value;
                                console.log(item.productDescription);
                                if (item.appliedAmount != null){
                                    $scope.document.applieadAmount+= item.appliedAmount;
                                    $scope.document.notAppliedAmount-= item.appliedAmount;
                                    //verver
                                }
                                //item.status = 1;
                            }
                            catch{
                                console.log('Error Parse String to JSON object');
                            }
                        });
                        calcTotals();
                    });
                    $scope.$broadcast('reloadMessages', $scope.document.messages);
                } else {
                    $scope.document = { items: [], netAmount: 0, totalAmount: 0, issuerId: null };
                }
            }

            load();
        }])
        .controller(
            "apremioController",
            ($scope, $rootScope, $uibModalInstance, Restangular, data, toastr) => {
                $scope.totalCredits = 0;
                $scope.interesAmount = 0;
                $scope.item = data;
                $scope.settlements = data;
                $scope.currentProduct = null;
                $scope.currentProductId = null;
                $scope.totalNet = 0;
                $scope.typeId= 27;
                $scope.typeIdCategory =22;
                $scope.productsList = [];
                $scope.voidDate = null;
                $scope.displaySettlement = false;
    
                $scope.unitPriceChanged = (unitPrice) => {
                    calcTotals();
                }
                $scope.onProductSelect = (value, text) => {
                    $scope.currentProduct = {
                        productId: value,
                        productText: text
                    };
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


               
                $scope.onSettlementTypeSelect = (typeId) =>{
                    $scope.totalCredits = 0;
                    $scope.interestRate = 0;
                    $scope.interesAmount = 0;
                    $scope.settlements = data;
                    $scope.currentProduct = null;
                    $scope.currentProductId = null;
                    $scope.totalNet = 0;
                    $scope.typeId= 27;
                    $scope.voidDate = null;
                    $scope.typeIdCategory =null;
                    $scope.productsList = [];
                    $scope.todate = new Date();
                    $scope.startDate = null;
                    $scope.endDate = null;
                    calcTotals();

                    if( typeId){
                        $scope.typeId =typeId;
                        if(+typeId === 24 ){
                            $scope.typeIdCategory =21;
                        }
                        if(+typeId === 26 ){
                            $scope.typeIdCategory =22;
                        }
                        if(+typeId === 27 ){
                            $scope.typeIdCategory =23;
                        }
                        if(+typeId === 29 ){
                            $scope.typeIdCategory =31;
                        }
                    }
                    
                    if (+$scope.typeId === 29){ //IGB
                        $scope.startDate = new Date($scope.item.fromServiceDate);
                        Restangular.one('/businessdocuments/types/params','LIQ').get().then(result => {
                            $scope.interestRate = result.interestRate;

                            $scope.settlementDocument.parentItems.forEach(item => {
                                $scope.totalCredits += item.originalAmount;
                            });

                            $scope.interesAmount = 0;
                            $scope.totalNet = $scope.totalCredits + $scope.interesAmount;
                        });
                        
                    }
                    if (+$scope.typeId === 27){ //DGJ
                        $scope.startDate = new Date($scope.item.toServiceDate);
                        Restangular.one('/businessdocuments/types/params','LIQCOBJUD').get().then(result => {
                            $scope.interestRate = result.interestRate; 
                            
                            $scope.settlementDocument.parentItems.forEach(item => {
                                $scope.totalCredits += item.originalAmount + item.originalAmountInterest;
                            });
                            $scope.interesAmount = 0;
                            $scope.totalNet = $scope.totalCredits + $scope.interesAmount;
                        });
                    }

                    $scope.getTotalUnitPrice = () => {
                
                        var sum = 0;
                        $scope.settlementDocument.parentItems.forEach(settlement => {
                            sum += settlement.amount - settlement.appliedAmount;
                        });
                        return sum;
                    }
                    $scope.getTotalInterest = () => {
        
                        var sum = 0;
                        $scope.settlementDocument.parentItems.forEach(settlement => {
                            sum += settlement.amountInterest;
                        });
                        return sum;
                    }
                    
                    Restangular.one('catalog/products/defaultbycategory').get({ categoryid:  $scope.typeIdCategory}).then(result => {
                        result.forEach(element => {
                            if (element.id === 34){
                                if (($scope.totalCredits + $scope.interesAmount) * 0.1 > 1716){
                                    element.productValue = ($scope.totalCredits + $scope.interesAmount) * 0.1;
                                }else{
                                    element.productValue = 1716;
                                }
                            }
                            $scope.productsList.push({
                                productId: element.id,
                                productText: element.productName,
                                unitPrice: element.productValue
                            });
                        });
                    });
                    
                }
    
                $scope.removeSelectedItem = (item) => {
    
                    //  var dlg = dialogs.confirm('Editor de Conceptos', 'Está seguro que desea eliminar este concepto?');
                    // dlg.result.then((btn) => {
                    $scope.productsList.splice(item, 1);
                    calcTotalsApremio();
                    // });
                }
                $scope.addProd = () => {
    
                    var exist = false;
    
                    if ($scope.currentProduct) {
                        $scope.productsList.forEach(element => {
                            if (element.productId === $scope.currentProduct.productId) {
                                exist = true;
                            }
                        });
                        if (!exist) {
                            $scope.productsList.push({
                                productId: $scope.currentProduct.productId,
                                productText: $scope.currentProduct.productText,
                                unitPrice: 0
                            });
                            //  $scope.currentProduct = null;
                            $scope.currentProductId = null;
                            calcTotals();
                        } else {
                            alert('El producto ' + $scope.currentProduct.productText + ' ya fue agregado');
                        }
                    }
                }
                function calcTotalsApremio2() {
                    try {
                    
                        var totalItem = $scope.item.total;
                        var baseItem  = $scope.item.base;
                        var total = 0;

                        if (+$scope.typeId === 29){
                            $scope.totalCredits = baseItem;
                        }else{
                            $scope.totalCredits = totalItem;
                        }

                        total = +$scope.totalCredits;    
                            
                        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds    
                        if ($scope.startDate && $scope.endDate){
                            var dayDiff = Math.round(Math.abs(($scope.startDate.getTime() - $scope.endDate.getTime())/(oneDay)));
                        }else{
                            dayDiff = 0;
                        }
                        
                        var totalProd = 0;
                        $scope.productsList.forEach(element => {
                            
                            if (element.productId === 34){
                                if (($scope.totalCredits + $scope.interesAmount) * 0.1 > 1716){
                                    element.unitPrice = ($scope.totalCredits + $scope.interesAmount) * 0.1;
                                }else{
                                    element.unitPrice = 1716;
                                }
                            }
                            totalProd = totalProd + element.unitPrice;
                        });

                        $scope.interesAmount = total * (dayDiff * ($scope.interestRate / 365));
    
                        $scope.totalNet = total + totalProd + $scope.interesAmount;
    
                    }
                    catch{ console.log('Error totales'); }
                }

    
                function calcTotals() {
                    if ($scope.endDate){
                        $scope.voidDate = $scope.endDate;
                    }
                    try {
                        var oneDay = 24*60*60*1000; 
                        var total = 0;
                        var totalProd = 0;
                        var totalInterest = 0;

                        if (+$scope.typeId === 29){ //IGB
                            $scope.settlementDocument.parentItems.forEach(item => {
                                item.amountInterest = 0;
                                item.toDate = $scope.endDate;
                                total = total + item.amount;
                                if ( $scope.endDate){
        
                                    $scope.itemDate =new Date(item.fromDate);
        
                                    var debtTermDays = Math.round(Math.abs(($scope.itemDate.getTime() - $scope.endDate.getTime())/(oneDay)));
                                    item.amountInterest = round((item.amount * (debtTermDays * ($scope.interestRate / 365))),2);
                                    item.debtTermDays = debtTermDays;
                                    totalInterest = totalInterest +  item.amountInterest;
        
                                }

                            });
                            $scope.totalNet = $scope.totalCredits + $scope.interesAmount;
                            $scope.interesAmount = totalInterest;

                            totalProd = 0;
                            $scope.productsList.forEach(element => {
                                
                                if (element.productId === 34){
                                    if (($scope.totalCredits + $scope.interesAmount) * 0.1 > 1716){
                                        element.unitPrice = ($scope.totalCredits + $scope.interesAmount) * 0.1;
                                    }else{
                                        element.unitPrice = 1716;
                                    }
                                }
                                totalProd = totalProd + element.unitPrice;
                            });


                            $scope.totalNet = round($scope.totalCredits ,2) + round($scope.interesAmount,2) + round(totalProd,2);
                        }

                        if (+$scope.typeId === 27){ //DGJ
                            //Fecha inicio es el vencimiento del TE el cual estoy reliquidando.
                            //Fecha de fin es la seteado en endDate
                            //intereses de parentItems no deben ser alterados
                            
                            $scope.productsList.forEach(element => {
                                totalProd = totalProd + element.unitPrice;
                            });

                            
                            $scope.settlementDocument.parentItems.forEach(item => {
                                item.amountInterest = item.originalAmountInterest;
                                item.toDate = item.originalToDate;
                                var itemFromDate =new Date(item.fromDate);
                                var itemToDate =new Date(item.toDate);
                                item.debtTermDays = Math.round(Math.abs((itemToDate.getTime() - itemFromDate.getTime())/(oneDay)));
                            });
                            
                            var documentToServiceDate = new Date($scope.settlementDocument.toServiceDate);
                            var debtTermDays = Math.round(Math.abs(($scope.endDate.getTime() - documentToServiceDate.getTime())/(oneDay)));                           
                            $scope.interesAmount = round((+$scope.totalCredits * (debtTermDays * ($scope.interestRate / 365))),2);

                            

                            $scope.totalNet = round($scope.totalCredits ,2) + round($scope.interesAmount,2) + round(totalProd,2);
                        }

    
                    }
                    catch{ console.log('Error totales'); }
                }

                function round(value, exp) {
                    if (typeof exp === 'undefined' || +exp === 0)
                      return Math.round(value);
                  
                    value = +value;
                    exp = +exp;
                  
                    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
                      return NaN;
                  
                    // Shift
                    value = value.toString().split('e');
                    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
                  
                    // Shift back
                    value = value.toString().split('e');
                    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
                  }
                load();
    
                function load() {
                    
                    calcTotals();
                    Restangular.one('businessdocuments').one('documents').one('collection', $scope.item.id).get().then(result => {
                        $scope.settlementDocument = result;
                        $scope.settlementDocument.parentItems.forEach(element => {
                            element.originalAmount = element.amount;
                            element.originalAmountInterest = element.amountInterest;
                            element.originalToDate = element.toDate;
                            element.toDate=null;
                            element.amountInterest = null;
                            
                            
                        });
                    });


                }
    
                $scope.$watch('startDate', function(newValue, oldValue) {
                    calcTotals();           
                });
                $scope.$watch('endDate', function(newValue, oldValue) {
                    if ($scope.settlementDocument.toServiceDate != null && $scope.endDate != null){
                        var checkDate =new Date($scope.endDate);
                        var documentToServiceDate = new Date($scope.settlementDocument.toServiceDate);
                        if (checkDate < documentToServiceDate){
                            if ($scope.endDate != null){
                                $scope.endDate = null;
                                toastr.error('Liquidaciones', 'La fecha hasta no puede ser menor que la fecha de vencimiento del documento original');
                            }
                            
                        }else{
                            calcTotals();
                        }
                    }

                           
                });
                $scope.cancel = function () {
                    $uibModalInstance.dismiss("Canceled");
                }; // end cancel
    
                $scope.save = function () {
                    $scope.settlementItem = {
                        "businessDocumentParentId": $rootScope.$stateParams.documentId,
                        "total": $scope.totalNet,
                        "interestTotal": $scope.interesAmount,
                        "voidDate" :    $scope.voidDate,
                        "fromServiceDate": $scope.startDate, 
                        "toServiceDate": $scope.endDate,
                        "typeId":  $scope.typeId,
                        "parentItemIds": [],
                        "items": [
                        ]
                    };

                    var creditors = [];
                    var debtors = [];

                    //$scope.settlementDocument.items[0].creditors.forEach(creditor => {
                    //    creditors.push(creditor);
                    //})
                    //$scope.settlementDocument.items[0].debtors.forEach(debtor => {
                    //    debtors.push(debtor);
                    //})

                    $scope.settlementDocument.items.forEach(item => {
                         creditors.push(item.creditors);
                         debtors.push(item.debtors);
                         $scope.settlementItem.parentItemIds.push(item.id);
                    });
    

                    // $scope.settlements.forEach(item => {
                    //     creditors.push(item.creditors);
                    //     debtors.push(item.debtors);
                    //     $scope.settlementItem.parentItemIds.push(item.id);
                    // });
    
                    $scope.productsList.forEach(element => {
                        if (element.productId != 0) {
                            $scope.settlementItem.items.push({
                                creditors: creditors,
                                debtors: debtors,
                                productId: element.productId,
                                unitTypeId: 0,
                                quantity: 0,
                                unitPrice: element.unitPrice
                            }
                            );
                        }
    
                    });
    
                    $uibModalInstance.close($scope.settlementItem);
                };
    
    
                function parseJsonObject(objectJson) {
                    if (objectJson) {
                        try {
                            $scope.item.fieldsJSON = angular.fromJson(objectJson);
                        }
                        catch{
    
                            //   $scope.item.fieldsJSON = templateFields;
                            console.log('error parse json object' + objectJson);
                        }
                    }
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
            }
        )
    .controller(
        "settlementDetailController",
        ($scope,$http, $rootScope, $uibModalInstance, Restangular, data) => {
            
            load();
            $scope.cancel = function () {
                $uibModalInstance.dismiss("Canceled");
            }; // end cancel
            function load() {
                
                $scope.document = data;

                //var oneDay = 24*60*60*1000; 
                
                //$scope.document.parentItems.forEach(item => {
                //    var debtTermDays = Math.round(Math.abs((item.fromDate.getTime() - item.toDate.getTime())/(oneDay)));
                //    item.debtTermDays = debtTermDays;
                //});
                calcTotals();
            }

            function startBlobDownload(dataBlob, suggestedFileName) {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                   // for IE
                   window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFileName);
                } else {
                   // for Non-IE (chrome, firefox etc.)
                   var urlObject = URL.createObjectURL(dataBlob);
             
                   var downloadLink = angular.element('<a>Download</a>');
                   downloadLink.css('display','none');
                   downloadLink.attr('href', urlObject);
                   downloadLink.attr('download', suggestedFileName);
                   angular.element(document.body).append(downloadLink);
                   downloadLink[0].click();
             
               }
             }

            $scope.getTotalUnitPrice = () => {

                var sum = 0;
                $scope.document.parentItems.forEach(settlement => {
                    sum += settlement.amount - settlement.appliedAmount;
                });
            return sum;
            }
            $scope.getTotalInterest = () => {

                var sum = 0;
                $scope.document.parentItems.forEach(settlement => {
                    sum += settlement.amountInterest;
                });
            return sum;
            }

            $scope.pdf = function () {
                
                var documentNumber = $scope.document.number;
                documentNumber = documentNumber.replace("/","-");
                documentNumber = documentNumber.replace("\\","-");
                documentNumber = documentNumber.replace("?","-");
                documentNumber = documentNumber.replace("*","-");
                documentNumber = documentNumber.replace(">","-");
                documentNumber = documentNumber.replace("<","-");
                documentNumber = documentNumber.replace("|","-");

                if ($scope.document.typeName === 'NAD'){
                    $http({
                        method: 'GET',
                        url: API_HOST  + '/api/businessdocuments/documents/getpdf/' + $scope.document.id,
                        responseType: 'blob'
                      }).then(function(response) {
                        var blob = response.data;
                        startBlobDownload(blob, documentNumber + '.pdf')
                      });

                      $http({
                        method: 'GET',
                        url: API_HOST  + '/api/businessdocuments/documents/getteattachpdf/' + $scope.document.id,
                        responseType: 'blob'
                      }).then(function(response) {
                        var blob = response.data;
                        startBlobDownload(blob, documentNumber + '_Anexo.pdf')
                      });
                }
                if ($scope.document.typeName === 'TE'){
                    $http({
                        method: 'GET',
                        url: API_HOST  + '/api/businessdocuments/documents/gettepdf/' + $scope.document.id,
                        responseType: 'blob'
                      }).then(function(response) {
                        var blob = response.data;
                        startBlobDownload(blob, documentNumber + '.pdf')
                      });

                      $http({
                        method: 'GET',
                        url: API_HOST  + '/api/businessdocuments/documents/getteattachpdf/' + $scope.document.id,
                        responseType: 'blob'
                      }).then(function(response) {
                        var blob = response.data;
                        startBlobDownload(blob, documentNumber + '_Anexo.pdf')
                      });
                }
                if ($scope.document.typeName === 'LIQDGJ'){
                    $http({
                        method: 'GET',
                        url: API_HOST  + '/api/businessdocuments/documents/gettepdf/' + $scope.document.id,
                        responseType: 'blob'
                      }).then(function(response) {
                        var blob = response.data;
                        startBlobDownload(blob, documentNumber + '.pdf')
                      });
                }
                if ($scope.document.typeName === 'LIQIGB'){
                    $http({
                        method: 'GET',
                        url: API_HOST  + '/api/businessdocuments/documents/gettepdf/' + $scope.document.id,
                        responseType: 'blob'
                      }).then(function(response) {
                        var blob = response.data;
                        startBlobDownload(blob, documentNumber + '.pdf')
                      });
                }
            };
            function calcTotals() {
                try {
                    var total = 0;
                    $scope.document.items.forEach(item => {
                        total = total + item.unitPrice;

                    });
                    $scope.totalItems = total;


                }
                catch{ console.log('Error totales'); }
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
        }
    )
    .controller(
        "settlementsController",
        ($scope, $rootScope, $uibModalInstance, Restangular, data) => {
            $scope.totalCredits = 0;
            $scope.interesAmount = 0;
            $scope.settlements = data;
            $scope.settlementsPrescribed = [];
            $scope.currentProduct = null;
            $scope.currentProductId = null;
            $scope.totalNet = 0;
            $scope.typeId= null;
            $scope.typeIdCategory =null;
            $scope.productsList = [];
            $scope.voidDate = null;
            $scope.displaySettlement = false;
            $scope.displaySettlementPrescribed = false;
            
            $scope.unitPriceChanged = (unitPrice) => {
                calcTotals();
            }
            $scope.onProductSelect = (value, text) => {
                $scope.currentProduct = {
                    productId: value,
                    productText: text
                };
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

            $scope.changedisplayprescribed = () => {
                if ($scope.displaySettlementPrescribed == false){
                    document.getElementById("settlmentdetailprescribed").style.display = "block";
                    $scope.displaySettlementPrescribed = true;
                }else{
                    document.getElementById("settlmentdetailprescribed").style.display = "none";
                    $scope.displaySettlementPrescribed = false;
                }
            }


            $scope.onSettlementTypeSelect = (typeId) =>{
                
                $scope.totalCredits = 0;
                $scope.interestRate = 0;
                $scope.interesAmount = 0;
                $scope.settlements = data;
                $scope.currentProduct = null;
                $scope.currentProductId = null;
                $scope.totalNet = 0;
                $scope.typeId= null;
                $scope.voidDate = null;
                $scope.typeIdCategory =null;
                $scope.productsList = [];
                $scope.todate = new Date();
                calcTotals();
                if( typeId){
                    $scope.typeId =typeId;
                    if(+typeId === 24 ){ //Liquidacion Administrativa
                        $scope.typeIdCategory =21;
                    }
                    if(+typeId === 26 ){ //Liquidacion Judicial
                        $scope.typeIdCategory =22;
                    }
                    if(+typeId === 27 ){ //Cobranza Judicial
                        $scope.typeIdCategory =23;
                    }
                    if(+typeId === 29 ){ //Cobranza IGB
                        $scope.typeIdCategory =31;
                    }
                }


                Restangular.one('/businessdocuments/types/params','LIQ').get().then(result => {
                    
                    $scope.interestRate = result.interestRate;
                    
                    calcTotals();
                });

                Restangular.one('catalog/products/defaultbycategory').get({ categoryid:  $scope.typeIdCategory}).then(result => {
                    result.forEach(element => {
                        $scope.productsList.push({
                            productId: element.id,
                            productText: element.productName,
                            unitPrice: element.productValue
                        });
                    });
                    calcTotals();
                });                
            }

            $scope.getTotalUnitPrice = () => {
                
                var sum = 0;
                $scope.settlements.forEach(settlement => {
                    sum += settlement.unitPrice - settlement.appliedAmount;
                });
                return sum;
            }

            $scope.getTotalPendingInterest = () => {
                
                var sum = 0;
                $scope.settlements.forEach(settlement => {
                    sum += settlement.pendingInterest;
                });
                return sum;
            }

            $scope.getPrescribedTotalUnitPrice = () => {
                
                var sum = 0;
                $scope.settlementsPrescribed.forEach(settlement => {
                    sum += settlement.unitPrice - settlement.appliedAmount;
                });
                return sum;
            }

            $scope.getTotalInterest = () => {

                var sum = 0;
                $scope.settlements.forEach(settlement => {
                    sum += settlement.interesAmount;
                });
                return sum;
            }

            $scope.getPrescribedTotalInterest = () => {

                var sum = 0;
                $scope.settlementsPrescribed.forEach(settlement => {
                    sum += settlement.interesAmount;
                });
                return sum;
            }

            $scope.getPrescribedTotalPendingInterest = () => {

                var sum = 0;
                $scope.settlementsPrescribed.forEach(settlement => {
                    sum += settlement.pendingInterest;
                });
                return sum;
            }

            $scope.addPrescribed = (item) => {
                $scope.settlementsPrescribed.splice($scope.settlementsPrescribed.indexOf(item), 1);
                $scope.settlements.push(item);
                $scope.totalCredits += item.unitPrice;
                $scope.interesAmount += item.interesAmount;
                $scope.totalNet +=  item.unitPrice + item.interesAmount;              
            }

            $scope.removeSelectedItem = (item) => {

                //  var dlg = dialogs.confirm('Editor de Conceptos', 'Está seguro que desea eliminar este concepto?');
                // dlg.result.then((btn) => {
                $scope.productsList.splice(item, 1);
                calcTotals();
                // });
            }
            $scope.addProd = () => {

                var exist = false;

                if ($scope.currentProduct) {
                    $scope.productsList.forEach(element => {
                        if (element.productId === $scope.currentProduct.productId) {
                            exist = true;
                        }
                    });
                    if (!exist) {
                        $scope.productsList.push({
                            productId: $scope.currentProduct.productId,
                            productText: $scope.currentProduct.productText,
                            unitPrice: 0
                        });

                        //  $scope.currentProduct = null;
                        $scope.currentProductId = null;
                        calcTotals();
                    } else {
                        alert('El producto ' + $scope.currentProduct.productText + ' ya fue agregado');
                    }
                }
            }

            $scope.$watch('startDate', function(newValue, oldValue) {
                calcTotals();           
            });
            $scope.$watch('endDate', function(newValue, oldValue) {
                calcTotals();           
            });

            function round(value, exp) {
                if (typeof exp === 'undefined' || +exp === 0)
                  return Math.round(value);
              
                value = +value;
                exp = +exp;
              
                if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
                  return NaN;
              
                // Shift
                value = value.toString().split('e');
                value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
              
                // Shift back
                value = value.toString().split('e');
                return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
              }

            function calcTotals() {
                
                try {
                    if ($scope.endDate){
                        $scope.voidDate = $scope.endDate;
                    }
                    $scope.settlementsPrescribed.forEach(item => {
                        $scope.settlements.push(item);
                    });
                    
                    $scope.settlementsPrescribed = [];

                    var oneDay = 24*60*60*1000; 
                    var total = 0;
                    var totalProd = 0;
                    var totalInterest = 0;
                    var totalPendingInterest = 0;
                    $scope.productsList.forEach(element => {
                        totalProd = totalProd + element.unitPrice;
                    });


                    $scope.settlements.forEach(item => {
                
                        item.interesAmount = 0;
                        if ( $scope.endDate){
                            $scope.itemDate =new Date(item.voidDate);
                            var debtTermDays = Math.round(Math.abs(($scope.itemDate.getTime() - $scope.endDate.getTime())/(oneDay)));
                            if (item.appliedAmount >= item.unitPrice){
                                item.interesAmount = round((item.pendingInterest * (debtTermDays * ($scope.interestRate / 365))),2);
                                item.debtTermDays = debtTermDays;
                            }else{
                                if (item.appliedAmount > 0){
                                    item.interesAmount = round(( (item.unitPrice - item.appliedAmount)* (debtTermDays * ($scope.interestRate / 365))),2);
                                    item.debtTermDays = debtTermDays;
                                }else{
                                    item.interesAmount = round((item.unitPrice * (debtTermDays * ($scope.interestRate / 365))),2);
                                    item.debtTermDays = debtTermDays;
                                }

                            }

                        }

                        $scope.itemPrescriptionDate = new Date(item.prescriptionDate);
                        if ($scope.itemPrescriptionDate <  $scope.endDate.getTime()){
                            item.prescribed = true;
                            $scope.settlementsPrescribed.push(item);
                            //$scope.settlements.splice($scope.settlements.indexOf(item), 1);
                        }else{
                            totalPendingInterest = totalPendingInterest +  item.pendingInterest;
                            totalInterest = totalInterest +  item.interesAmount;
                            total = total + item.unitPrice - item.appliedAmount;
                        }
                    });

                    $scope.settlementsPrescribed.forEach(item => {
                        $scope.settlements.splice($scope.settlements.indexOf(item), 1);
                    });


                    $scope.totalNet = total + totalProd + totalInterest + totalPendingInterest;
                    $scope.interesAmount = totalInterest + totalPendingInterest;
                    $scope.totalCredits = total;
                }
                catch{ console.log('Error totales'); }
            }

            load();

            function load() {
                $scope.startDate = $scope.todate;
                calcTotals();
            }


            $scope.cancel = function () {
                
                $uibModalInstance.dismiss("Canceled");
            }; // end cancel
 
            
            $scope.save = function () {
                $scope.settlementItem = {
                    "businessDocumentParentId": $rootScope.$stateParams.documentId,
                    "total": $scope.totalNet,
                    "interestTotal": $scope.interesAmount,
                    "voidDate" :    $scope.voidDate,
                    "fromServiceDate": $scope.startDate, 
                    "toServiceDate": $scope.endDate,
                    "typeId":  $scope.typeId,
                    "parentItems": [],
                    "items": [
                    ]
                };

                var creditors = [];
                var debtors = [];

                $scope.settlements.forEach(item => {
                    creditors.push(item.creditors);
                    debtors.push(item.debtors);
                    $scope.settlementItem.parentItems.push({
                        parentId: item.id,
                        amount: item.unitPrice,
                        amountInterest: item.interesAmount,
                        pendingInterest: item.pendingInterest,
                        fromDate: item.voidDate,
                        toDate: $scope.endDate
                    });
                });

                //Revisar que debe esta rduplicando si API no controla
                $scope.productsList.forEach(element => {
                    if (element.productId != 0) {
                        $scope.settlementItem.items.push({
                            creditors: creditors,
                            debtors: debtors,
                            productId: element.productId,
                            unitTypeId: 0,
                            quantity: 0,
                            unitPrice: element.unitPrice
                        }
                        );
                    }

                });

                $uibModalInstance.close($scope.settlementItem);
            };


            function parseJsonObject(objectJson) {
                if (objectJson) {
                    try {
                        $scope.item.fieldsJSON = angular.fromJson(objectJson);
                    }
                    catch{

                        //   $scope.item.fieldsJSON = templateFields;
                        console.log('error parse json object' + objectJson);
                    }
                }
            }

        })



    //selectLawController
    .controller(
        "selectLawController",
        ($scope, $uibModalInstance, Restangular, data) => {
            $scope.item = null;
            $scope.itemEdit = data;
            $scope.newLaw = { LawId: null, Text: '' };
            $scope.selectedType = {};

            load();

            function load() {
                if ($scope.itemEdit) {

                    $scope.item = $scope.itemEdit;
                    $scope.issuerId = $scope.item.issuerId;
                    $scope.item.fieldsJSON = angular.fromJson($scope.item.fieldsJSON);
                }

            }

            $scope.removeSelectedItem = (item) => {

                //  var dlg = dialogs.confirm('Editor de Conceptos', 'Está seguro que desea eliminar este concepto?');
                // dlg.result.then((btn) => {
                $scope.item.lawTexts.splice(item, 1);

                // });
            }

            $scope.addLaw = function () {
                if (!$scope.item.lawTexts) {
                    $scope.item.lawTexts = new Array<any>();
                }
                var law = $scope.newLaw;

                Restangular.one('financials/debtmanagement/laws', law.LawId).get().then(result => {

                    $scope.item.lawTexts.push({ lawId: law.LawId, text: law.Text, name: result.name });
                    $scope.newLaw.LawId = null;
                    $scope.newLaw.Text = '';
                });
                
            }

            $scope.cancel = function () {
                $uibModalInstance.dismiss("Canceled");
            }; // end cancel

            $scope.save = function () {
                $uibModalInstance.close($scope.item);
            };


            function parseJsonObject(objectJson) {
                if (objectJson) {
                    try {
                        $scope.item.fieldsJSON = angular.fromJson(objectJson);
                    }
                    catch{

                        //   $scope.item.fieldsJSON = templateFields;
                        console.log('error parse json object' + objectJson);
                    }
                }
            }
        }
    )
    .controller(
        "selectCreditController",
        ($scope, $uibModalInstance, Restangular, data) => {

            $scope.itemEdit = data.item;
            $scope.item = { productId: null, productName: '', unitPrice: null, itemDate: null, voidDate: null, notificationDate: null, quantity: 1, creditors: [], debtors: [], fieldsJSON: {} };
            $scope.newLaw = { LawId: null, Text: '' };
            $scope.selectedType = {};


            load();

            function load() {             
                console.log('itemEdit = ');   
                console.log($scope.itemEdit);
                if ($scope.itemEdit) {
                    if (!$scope.itemEdit.id){
                        $scope.itemEdit.unitPrice = null;
                    }
                    
                    $scope.item = $scope.itemEdit;
                    $scope.categoryId = $scope.item.categoryId;                    
                    if (!$scope.item.creditors) {
                        $scope.item.creditors = [];
                    }
                    if (!$scope.item.debtors) {
                        $scope.item.debtors = [];                      
                    }
                    $scope.item.fieldsJSON = angular.fromJson($scope.item.fieldsJSON);
                    if ($scope.item.debtors.length === 0){
                        $scope.item.debtors = data.debtorsIds;
                    }
                    if ($scope.item.creditors.length === 0){
                        $scope.item.creditors = data.creditorsIds;
                    }                    
                }
            }

            $scope.$watch('item.itemDate', function (newValue, oldValue) {
                var sdate = new Date(newValue);
                sdate.setDate($scope.item.itemDate.getDate() + 60);
                $scope.item.voidDate = sdate;
            });

            $scope.cancel = function () {
                $uibModalInstance.dismiss("Canceled");
            }; // end cancel

            $scope.save = function () {
                $scope.item.notificationDate = $scope.item.itemDate;
                $uibModalInstance.close($scope.item);
            };

            $scope.removeSelectedItem = (item) => {
                $scope.item.lawTexts.splice(item, 1);
            }

            $scope.addLaw = function () {
                if (!$scope.item.lawTexts) {
                    $scope.item.lawTexts = new Array<any>();
                }
                var law = $scope.newLaw;

                Restangular.one('financials/debtmanagement/laws', law.LawId).get().then(result => {

                    $scope.item.lawTexts.push({ lawId: law.LawId, text: law.Text, name: result.name , prescription: result.prescription});

                    //calcular prescripcion
                    $scope.item.prescriptionDate = new Date($scope.item.voidDate);
                    
                    $scope.item.prescriptionDate.setDate($scope.item.prescriptionDate.getDate() + result.prescription);
                    if (result.maxPrescriptionDate != null){
                        var maxPrescriptionDate = new Date(result.maxPrescriptionDate);
                        
                        if ($scope.item.prescriptionDate > maxPrescriptionDate){
                            $scope.item.prescriptionDate = maxPrescriptionDate;
                        }
                    }
                    $scope.newLaw.LawId = null;
                    $scope.newLaw.Text = '';
                });
                
            }


            $scope.$watch('item.productId', function (newValue, oldValue) {
                if ($scope.itemEdit) {
                    if ($scope.itemEdit.productId === newValue) {
                        $scope.itemEdit = null;
                        return;
                    }
                }
                $scope.itemEdit = null;
                $scope.item.fieldsJSON = null;
                if (newValue) {

                    Restangular.one('catalog').one('productsconfig', newValue).get().then(result => {
                        if (result) {
                            $scope.item.productName = result.name;
                            $scope.selectedType = result;
                            parseJsonObject($scope.selectedType.fieldsJSON);
                        }
                    });
                }


            });

            function parseJsonObject(objectJson) {
                if (objectJson) {
                    try {
                        $scope.item.fieldsJSON = angular.fromJson(objectJson);
                    }
                    catch{

                        //   $scope.item.fieldsJSON = templateFields;
                        console.log('error parse json object' + objectJson);
                    }
                }
            }
        }
    )
    .directive('expedientsGrid', ($state, $log, $compile, $filter, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@', view: '=', filter: '=', tabs: '=' },
            link(scope: any, element) {
                var gridElement = angular.element('<table></table>');
                var gridElementName = 'expedientsGrid';
                var pagerElementName = gridElementName + 'Pager';

                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                loadTabs();

                function loadTabs() {
                    var tabsElement = '<div><uib-tabset>'
                    //+ '<uib-tab heading="Secretaría" select="changeView(0)"></uib-tab>'
                    // + '<uib-tab heading="DDDR" select="changeView(1)"></uib-tab>'
                    // + '<uib-tab heading="DCEO" select="changeView(2)"></uib-tab>'
                    // + '<uib-tab heading="DGJ" select="changeView(3)"></uib-tab>'
                    // + '<uib-tab heading="Fiscalía" select="changeView(4)"></uib-tab>'
                    //  + '</uib-tabset></div>';
                    
                    
                    scope.tabs.forEach(tab => {
                        tabsElement = tabsElement
                            + '<uib-tab heading="' + tab.text + ' " select="changeView(' + tab.id + ')"></uib-tab>';
                    });
                    tabsElement = tabsElement + '</uib-tabset></div>';


                    element.append($compile(tabsElement)(scope));
                    element.append($compile(gridElement)(scope));
                    element.append($compile(pagerElement)(scope));
                }


                scope.height = scope.height || 600;
                scope.personId = null;
                scope.showHeader = scope.showHeader || false;
                scope.view = scope.view || 0;
                scope.filter = scope.filter || null;

                scope.changeView = (view) => {
                    scope.view = view;
                    var status = 0;
                    /*
                    20 -Secretaria
                    30 -DDR
                    40 -DCEO
                    50 -DGJ
                    60 -FISCALIA
                    */
                    /*
                     switch(view){
                         case 0:
                         {
                             status =20;
                             break;
                         }
                         case 1:
                         {
                             status =30;
                             break;
                         }
                         case 2:
                         {
                             status =40;
                             break;
                         }
                         case 3:
                         {
                             status =50;
                             break;
                         }
                         case 4:
                         {
                             status =60;
                             break;
                         }
                     }*/
                    loadData(view);
                }

                scope.canEdit = () => {
                    return scope.view === 0;
                };

                scope.edit = (id) => {
                    $state.go('app.financials.ar.debtmanagement.edit', { documentId: id });
                }

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
                    var createDate = $filter('amDateTime')(rowObject.workflowInstanceCreateDate);
                    var date = $filter('amDateTime')(rowObject.date);
                    return 'Solicitud de prestación | <small>Paciente</small> <a data-ui-sref="app.system.person({ personId: ' + rowObject.personId + ' })" title="Ver ficha">' + rowObject.personName + '</a><br><small>Creada el ' + createDate + '</small><br><small>Fecha ' + date + '</small></td>';
                }

                function claimActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var result = '<a href="#" data-ui-sref="app.financials.ar.debtmanagement.view({ documentId: ' + rowObject.id + ' })" class="btn btn-white btn-sm"><i class="fa fa-folder"></i> Ver </a>';
                    if (scope.canEdit()) {
                        result += '<button type="button" data-ng-click="edit(' + rowObject.id + ')" class="btn btn-white btn-sm"><i class="fa fa-pencil"></i> Editar</button>';
                    }

                    return result;
                }



                function workflowProgressFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<small> Completa al: ' + rowObject.workflowInstanceProgress + ' % </small><div class="progress progress-mini"><div style="width:' + rowObject.workflowInstanceProgress + '%;" class="progress-bar"></div></div>';
                }

                var colNames = ['Tipo de doc.', 'Fecha', 'Numero de Exp.', 'Organismo', 'Tipo Crédito','Actividad' ,'Total', ''];
                var colModel: Array<any> = [
                    { name: 'typeName', index: 'typeName', width: 90, fixed: true, search: false, align: 'center' },
                    { name: 'documentDate', index: 'documentDate', width: 100, fixed: true, search: false, formatter: 'date', align: 'center' },
                    { name: 'number', index: 'number', width: 150, fixed: true, search: false, align: 'center' },
                    { name: 'issuerName', index: 'issuerName', width: 190, fixed: true, search: false, align: 'center' },
                    { name: 'categoryName', index: 'categoryName', width: 190, fixed: true, search: false, align: 'center' },
                    { name: 'workflowActivityName', index: 'workflowActivityName', width: 120, fixed: true, search: false, align: 'right' },
                    { name: 'total', index: 'total', width: 120, fixed: true, search: false, align: 'right' },
                   
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
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    loadBeforeSend: function (jqXHR) {
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

                // if (!scope.showHeader) {
                //     var header = $('#gview_' + gridElementName + ' .ui-jqgrid-hdiv').hide();
                // }

                gridElement.addClass('ui-jqgrid-noborders');

                function loadData(rolId) {
                    // Restangular.one('businessdocuments').one('documents').get({ module:7 })
                    var url = '/api/businessdocuments/documents.json?module=7&roleId=' + rolId;
                    gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: API_HOST + url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event, personId) => {
                    if (personId) {
                        scope.personId = personId;
                    }
                    loadData(status);
                });
            }
        };
    });
