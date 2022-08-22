angular.module('app.businessdocuments', ['app.businessdocuments.collections','app.businessdocuments.debtcollections'])
.config(($stateProvider) => {
    $stateProvider
        .state('app.businessdocuments',
        {
            url: '/businessdocuments',
            abstract: true,
            template: '<ui-view/>',
            ncyBreadcrumb: {
                skip: false,
                parent: 'app.dashboard',
                label: 'bd.businessdocuments'
            }
        })    
    })
    .constant('businessDocumentStatus',
    [
        { id: 0, name: 'Emitido' },
        { id: 1, name: 'Para aprobar' },
        { id: 2, name: 'Aprobado' },
        { id: 3, name: 'Rechazado' },
        { id: 4, name: 'Pagado' },
        { id: 5, name: 'Para entregar' },
        { id: 6, name: 'Entregado' },
        { id: 7, name: 'Cancelada' },
        { id: 8, name: 'Anulada' },
        { id: 9, name: 'Abrierto' },
        { id: 10, name: 'Control' },
        { id: 11, name: 'En proceso' },
        { id: 12, name: 'En tránsito' }

    ])
    .directive('businessDocument', ($log, $rootScope, $state, $window, session, Restangular, FileUploader, businessDocumentStatus) => {
        return {
            restrict: 'E',
            templateUrl: '/app/businessdocuments/edit.htm',
            scope: { document: '=?', options: '=', commands: '=', module: '=' },
            requires: '^Screen',
            link(scope: IBusinessDocumentScope, element, attrs, ctrl) {
                scope.editorOptions = { height: '100px;' };
                scope.module = scope.module || 1;
                scope.tenantInventorySites = [];

                angular.merge(scope.options, {
                    newItem: {}
                });

                Restangular.one('businessdocuments').one('types').get({ module: scope.module }).then(result => {
                    scope.documentTypes = result.results;

                    if (angular.isDefined(scope.document) && scope.document.id !== null) {
                        scope.document.documentType = _.find(scope.documentTypes, { id: scope.document.typeId });
                    }
                });

                Restangular.one('system').one('persons', $rootScope.session.tenant.personId).one('inventorysites').get().then(result => {
                    scope.tenantInventorySites = result.data;
                    scope.resetNewItem();
                });

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
                    Restangular.one('businessdocuments').one('documents', scope.document.id).one('files').get().then(result => {
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

                scope.$watch('document', (newValue: any, oldValue: any) => {
                    init();
                }, true);

                function init() {
                    scope.document.canApprove = () => { return false; }

                    if (angular.isDefined(scope.document.id)) {
                        scope.messageServiceUrl = 'businessdocuments/documents/' + scope.document.id + '/messages';
                        scope.uploader.url = '/api/businessdocuments/documents/' + scope.document.id + '/files.json';
                        selectDocumentType(scope.document.typeId);
                        scope.documentStatus = _.find(businessDocumentStatus, { id: scope.document.status });

                        if (scope.document.approvalWorkflowInstance) {
                            var allowedRoles = _.map(scope.document.approvalWorkflowInstance.assignedRoles, 'roleName');
                            var isAssigned = _.intersection(scope.session.roles, allowedRoles).length > 0;
                            var isSupervisor = _.filter(scope.document.approvalWorkflowInstance.userPermissions, (item: any) => { return _.includes(scope.session.roles, item.roleName) && item.permission === 2 }).length > 0;
                            var isAdmin = scope.session.isAdmin();

                            scope.document.canApprove = () => {
                                var canApprove = (isAdmin || isAssigned || isSupervisor) && !scope.document.approvalWorkflowInstance.isTerminated && !scope.document.approvalWorkflowInstance.currentWorkflowActivity.isFinal;
                                return canApprove;
                            }
                        };

                    } else {
                        scope.document.status = 0;
                        if (!angular.isDefined(scope.document.issuerId)) {
                            if (scope.module == 1) {
                                scope.document.receiverId = $rootScope.session.tenant.personId;
                            } else if (scope.module == 2) {
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                            }
                        }
                    };

                    if (!angular.isDefined(scope.document.items)) {
                        scope.document.items = [];
                    } else {
                        _.forEach(scope.document.items, (item) => {
                            scope.doCalculations(item);
                        });
                    }

                    scope.$watch('options.edit', (value: any) => { load() });

                    scope.$watch('document.options.receiverId', (value: any) => {
                        if (value && scope.document.byOrderOf) {
                            if (scope.module == 1) {
                                scope.document.receiverId = value;
                            } else if (scope.module == 2) {
                                scope.document.issuerId = value;
                            }
                        }
                    });

                    scope.$on('reloadMessages', (event, messages) => {
                        scope.document.messages = messages;
                    });

                    scope.byOrderOfChanged = () => {
                        if (scope.module == 1) {
                            if (scope.document.byOrderOf) {
                                scope.document.receiverId = scope.options.receiverId;
                            } else {
                                scope.document.receiverId = $rootScope.session.tenant.personId;
                                scope.options.receiverId = undefined;
                            }
                        } else if (scope.module == 2) {
                            if (scope.document.byOrderOf) {
                                scope.document.issuerId = scope.options.receiverId;
                            } else {
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                                scope.options.receiverId = undefined;
                            }
                        }
                    }

                    scope.options.canEdit = () => {
                        return !angular.isDefined(scope.document.approvalWorkflowId);
                    };
                    scope.options.canSave = () => {
                        return !angular.isDefined(scope.document.approvalWorkflowId);
                    };
                };

                function selectDocumentType(value) {
                    if (angular.isDefined(value)) {
                        scope.document.documentType = _.find(scope.documentTypes, { id: value });

                        if (scope.module == 3) {
                            if (scope.document.documentType.shortName === 'RME') {
                                scope.document.receiverId = $rootScope.session.tenant.personId;
                            } else if (scope.document.documentType.shortName === 'RMS') {
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                            }
                        }
                    }
                }

                function load() {

                }

                scope.itemTypesEnum = [{ id: 1, name: 'Productos' }, { id: 2, name: 'Servicios' }, { id: 3, name: 'Productos y Servicios' }];
                scope.paymentMethods = [[0, 'Contado'], [1, 'Cta.Cte'], [2, 'Tarjeta Débito'], [3, 'Tarjeta Crédito'], [4, 'Cheque'], [5, 'Ticket'], [6, 'Otra']];
                scope.unitTypes = [[1, 'Kilogramo'], [2, 'Metros'], [3, 'Metro cuadrado'], [4, 'Metro cúbico'], [5, 'Litros'], [6, '1000 Kilowatt hora'], [7, 'Unidad'], [8, 'Par'], [9, 'Docena'], [10, 'Quilate'], [30, 'Decametro cúbico'], [31, 'Hectómetro cúbico'], [32, 'Kilómetro cúbico'], [33, 'Microgramo'], [34, 'Nanogramo'], [35, 'Picogramo'], [36, 'Muiactant'], [37, 'Uiactig'], [41, 'Miligramo'], [47, 'Mililitro'], [11, 'Millar'], [48, 'Curie'], [12, 'Mega - U.Int.Act.Antib'], [49, 'Milicurie'], [13, 'Unidad Int.Act.Inmung'], [50, 'Microcurie'], [14, 'Gramo'], [51, 'U.Inter.Act.Hor.'], [15, 'Milímetro'], [52, 'Mega U.Inter.Act.Hor.'], [16, 'Milímetro Cúbico'], [53, 'Kilogramo base'], [17, 'Kilómetro'], [54, 'Gruesa'], [18, 'Hectolitro'], [55, 'Muiactig'], [19, 'Mega U.Int.Act.Inmung.'], [61, 'Kg. bruto'], [20, 'Centímetro'], [62, 'Pack'], [21, 'Kilogramo activo'], [63, 'Horma'], [22, 'Gramo activo'], [98, 'Otras unidades'], [23, 'Gramo base'], [99, 'Bonificación'], [24, 'Uiacthor'], [25, 'Juego o paquete mazo de naipes'], [26, 'Muiacthor'], [27, 'Centímetro cúbico'], [28, 'Uiactant'], [29, 'Tonelada']];
                scope.vatRates = [{ id: 21, name: '21 %' }, { id: 10.5, name: '10.5 %' }, { id: 0, name: '0 %' }, { id: 27, name: '27 %' }, { id: 5, name: '5 %' }, { id: 2.5, name: '2.5 %' }];

                scope.openFile = (file) => {
                    $window.open('api/businessdocuments/documents/' + scope.document.id + '/files/' + file.guid);
                };

                scope.addItem = () => {
                    var newIndex = scope.document.items.push(scope.options.newItem) - 1;
                    scope.doCalculations(scope.document.items[newIndex]);
                    scope.resetNewItem();
                };

                scope.isItemValid = (item) => {
                    var isValid = angular.isDefined(item.code) && item.code != null &&
                        angular.isDefined(item.productId) && item.productId != null &&
                        angular.isDefined(item.quantity) && item.quantity != null &&
                        angular.isDefined(item.unitTypeId) && item.unitTypeId != null &&

                        (
                            scope.module == 3 || (
                                angular.isDefined(item.unitPrice) && item.unitPrice != null &&
                                angular.isDefined(item.bonus) && item.bonus != null &&
                                angular.isDefined(item.vatRate) && item.vatRate != null
                            )
                        );
                    return isValid;
                };

                scope.resetNewItem = (item) => {
                    if (angular.isDefined(item)) {
                        var index = scope.document.items.indexOf(item);
                        scope.document.items.splice(index, 1);
                    }
                    else {
                        scope.options.newItem = {
                            bonus: 0,
                            inventorySiteId: _.head<any>(scope.tenantInventorySites).id
                        };
                    }
                };

                scope.quantityChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.unitPriceChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.vatRateChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.bonusChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.doCalculations = (item) => {
                    item.subTotal = (item.quantity * item.unitPrice) - item.bonus;
                    item.vat = item.subTotal * item.vatRate / 100;
                    item.total = item.subTotal + item.vat;

                    scope.document.netAmount = _.sumBy(scope.document.items, 'subTotal');
                    scope.document.vatAmount = _.sumBy(scope.document.items, 'vat');
                    scope.document.totalAmount = scope.document.netAmount + scope.document.vatAmount;
                };

                scope.documentChanged = () => {
                    selectDocumentType(scope.document.typeId);
                    if (scope.module == 3) {
                        if (angular.isDefined(scope.document.documentType)) {
                            if (scope.document.documentType.shortName === 'RME') {
                                if (angular.isDefined(scope.document.issuerId)) {
                                    scope.options.businessPartnerId = scope.document.issuerId;
                                    Restangular.one('businesspartners').one('businesspartnersbyperson', scope.document.issuerId).get({ typeId: 2 }).then(result => {
                                        if (result.inventorySites.length == 1) {
                                            scope.document.inventorySiteId = result.inventorySites[0].id;
                                            scope.options.newItem.inventorySiteId = _.head<any>(scope.tenantInventorySites).id;
                                        }
                                    });
                                }
                            } else if (scope.document.documentType.shortName === 'RMS') {
                                if (angular.isDefined(scope.document.receiverId)) {
                                    scope.options.businessPartnerId = scope.document.receiverId;
                                    Restangular.one('businesspartners').one('businesspartnersbyperson', scope.document.receiverId).get({ typeId: 1 }).then(result => {
                                        if (result.inventorySites.length == 1) {
                                            scope.document.inventorySiteId = result.inventorySites[0].id;
                                            scope.options.newItem.inventorySiteId = _.head<any>(scope.tenantInventorySites).id;
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        };
    })
    .directive('businessDocumentOne', ($log, $rootScope, $state, $window, session, Restangular, FileUploader, businessDocumentStatus) => {
        return {
            restrict: 'E',
            templateUrl: '/app/businessdocuments/edit1.html',
            scope: { document: '=?', options: '=', commands: '=', module: '=' },
            requires: '^Screen',
            link(scope: IBusinessDocumentScope, element, attrs, ctrl) {
                scope.editorOptions = { height: '100px;' };
                scope.module = scope.module || 1;
                scope.tenantInventorySites = [];

                angular.merge(scope.options, {
                    newItem: {}
                });

                Restangular.one('businessdocuments').one('types').get({ module: scope.module }).then(result => {
                    scope.documentTypes = result.results;

                    if (angular.isDefined(scope.document) && scope.document.id !== null) {
                        scope.document.documentType = _.find(scope.documentTypes, { id: scope.document.typeId });
                    }
                });

                Restangular.one('system').one('persons', $rootScope.session.tenant.personId).one('inventorysites').get().then(result => {
                    scope.tenantInventorySites = result.data;
                    scope.resetNewItem();
                });

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
                    Restangular.one('businessdocuments').one('documents', scope.document.id).one('files').get().then(result => {
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

                scope.$watch('document', (newValue: any, oldValue: any) => {
                    init();
                }, true);

                function init() {
                    scope.document.canApprove = () => { return false; }

                    if (angular.isDefined(scope.document.id)) {
                        scope.messageServiceUrl = 'businessdocuments/documents/' + scope.document.id + '/messages';
                        scope.uploader.url = '/api/businessdocuments/documents/' + scope.document.id + '/files.json';
                        selectDocumentType(scope.document.typeId);
                        scope.documentStatus = _.find(businessDocumentStatus, { id: scope.document.status });

                        if (scope.document.approvalWorkflowInstance) {
                            var allowedRoles = _.map(scope.document.approvalWorkflowInstance.assignedRoles, 'roleName');
                            var isAssigned = _.intersection(scope.session.roles, allowedRoles).length > 0;
                            var isSupervisor = _.filter(scope.document.approvalWorkflowInstance.userPermissions, (item: any) => { return _.includes(scope.session.roles, item.roleName) && item.permission === 2 }).length > 0;
                            var isAdmin = scope.session.isAdmin();

                            scope.document.canApprove = () => {
                                var canApprove = (isAdmin || isAssigned || isSupervisor) && !scope.document.approvalWorkflowInstance.isTerminated && !scope.document.approvalWorkflowInstance.currentWorkflowActivity.isFinal;
                                return canApprove;
                            }
                        };

                    } else {
                        scope.document.status = 0;
                        if (!angular.isDefined(scope.document.issuerId)) {
                            if (scope.module == 1) {
                                scope.document.receiverId = $rootScope.session.tenant.personId;
                            } else if (scope.module == 2) {
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                            }
                        }
                    };

                    if (!angular.isDefined(scope.document.items)) {
                        scope.document.items = [];
                    } else {
                        _.forEach(scope.document.items, (item) => {
                            scope.doCalculations(item);
                        });
                    }

                    scope.$watch('options.edit', (value: any) => { load() });

                    scope.$watch('document.options.receiverId', (value: any) => {
                        if (value && scope.document.byOrderOf) {
                            if (scope.module == 1) {
                                scope.document.receiverId = value;
                            } else if (scope.module == 2) {
                                scope.document.issuerId = value;
                            }
                        }
                    });

                    scope.$on('reloadMessages', (event, messages) => {
                        scope.document.messages = messages;
                    });

                    scope.byOrderOfChanged = () => {
                        if (scope.module == 1) {
                            if (scope.document.byOrderOf) {
                                scope.document.receiverId = scope.options.receiverId;
                            } else {
                                scope.document.receiverId = $rootScope.session.tenant.personId;
                                scope.options.receiverId = undefined;
                            }
                        } else if (scope.module == 2) {
                            if (scope.document.byOrderOf) {
                                scope.document.issuerId = scope.options.receiverId;
                            } else {
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                                scope.options.receiverId = undefined;
                            }
                        }
                    }

                    scope.options.canEdit = () => {
                        return !angular.isDefined(scope.document.approvalWorkflowId);
                    };
                    scope.options.canSave = () => {
                        return !angular.isDefined(scope.document.approvalWorkflowId);
                    };
                };

                function selectDocumentType(value) {
                    if (angular.isDefined(value)) {
                        scope.document.documentType = _.find(scope.documentTypes, { id: value });

                        if (scope.module == 3) {
                            if (scope.document.documentType.shortName === 'RME') {
                                scope.document.receiverId = $rootScope.session.tenant.personId;
                            } else if (scope.document.documentType.shortName === 'RMS') {
                                scope.document.issuerId = $rootScope.session.tenant.personId;
                            }
                        }
                    }
                }

                function load() {

                }

                //scope.itemTypesEnum = [{ id: 1, name: 'Productos' }, { id: 2, name: 'Servicios' }, { id: 3, name: 'Productos y Servicios' }];
                //scope.paymentMethods = [[0, 'Contado'], [1, 'Cta.Cte'], [2, 'Tarjeta Débito'], [3, 'Tarjeta Crédito'], [4, 'Cheque'], [5, 'Ticket'], [6, 'Otra']];
                scope.unitTypes = [[1, 'Kilogramo'], [2, 'Metros'], [3, 'Metro cuadrado'], [4, 'Metro cúbico'], [5, 'Litros'], [6, '1000 Kilowatt hora'], [7, 'Unidad'], [8, 'Par'], [9, 'Docena'], [10, 'Quilate'], [30, 'Decametro cúbico'], [31, 'Hectómetro cúbico'], [32, 'Kilómetro cúbico'], [33, 'Microgramo'], [34, 'Nanogramo'], [35, 'Picogramo'], [36, 'Muiactant'], [37, 'Uiactig'], [41, 'Miligramo'], [47, 'Mililitro'], [11, 'Millar'], [48, 'Curie'], [12, 'Mega - U.Int.Act.Antib'], [49, 'Milicurie'], [13, 'Unidad Int.Act.Inmung'], [50, 'Microcurie'], [14, 'Gramo'], [51, 'U.Inter.Act.Hor.'], [15, 'Milímetro'], [52, 'Mega U.Inter.Act.Hor.'], [16, 'Milímetro Cúbico'], [53, 'Kilogramo base'], [17, 'Kilómetro'], [54, 'Gruesa'], [18, 'Hectolitro'], [55, 'Muiactig'], [19, 'Mega U.Int.Act.Inmung.'], [61, 'Kg. bruto'], [20, 'Centímetro'], [62, 'Pack'], [21, 'Kilogramo activo'], [63, 'Horma'], [22, 'Gramo activo'], [98, 'Otras unidades'], [23, 'Gramo base'], [99, 'Bonificación'], [24, 'Uiacthor'], [25, 'Juego o paquete mazo de naipes'], [26, 'Muiacthor'], [27, 'Centímetro cúbico'], [28, 'Uiactant'], [29, 'Tonelada']];
                scope.vatRates = [{ id: 21, name: '21 %' }, { id: 10.5, name: '10.5 %' }, { id: 0, name: '0 %' }, { id: 27, name: '27 %' }, { id: 5, name: '5 %' }, { id: 2.5, name: '2.5 %' }];

                scope.openFile = (file) => {
                    $window.open('api/businessdocuments/documents/' + scope.document.id + '/files/' + file.guid);
                };

                scope.addItem = () => {
                    var newIndex = scope.document.items.push(scope.options.newItem) - 1;
                    scope.doCalculations(scope.document.items[newIndex]);
                    scope.resetNewItem();
                };

                scope.isItemValid = (item) => {
                    var isValid = angular.isDefined(item.code) && item.code != null &&
                        angular.isDefined(item.productId) && item.productId != null &&
                        angular.isDefined(item.quantity) && item.quantity != null &&
                        angular.isDefined(item.unitTypeId) && item.unitTypeId != null &&

                        (
                            scope.module == 3 || (
                                angular.isDefined(item.unitPrice) && item.unitPrice != null &&
                                angular.isDefined(item.bonus) && item.bonus != null &&
                                angular.isDefined(item.vatRate) && item.vatRate != null
                            )
                        );
                    return isValid;
                };

                scope.resetNewItem = (item) => {
                    if (angular.isDefined(item)) {
                        var index = scope.document.items.indexOf(item);
                        scope.document.items.splice(index, 1);
                    }
                    else {
                        scope.options.newItem = {
                            bonus: 0,
                            inventorySiteId: _.head<any>(scope.tenantInventorySites).id
                        };
                    }
                };

                scope.quantityChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.unitPriceChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.vatRateChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.bonusChanged = (item) => {
                    scope.doCalculations(item);
                };

                scope.doCalculations = (item) => {
                    item.subTotal = (item.quantity * item.unitPrice) - item.bonus;
                    item.vat = item.subTotal * item.vatRate / 100;
                    item.total = item.subTotal + item.vat;

                    scope.document.netAmount = _.sumBy(scope.document.items, 'subTotal');
                    scope.document.vatAmount = _.sumBy(scope.document.items, 'vat');
                    scope.document.totalAmount = scope.document.netAmount + scope.document.vatAmount;
                };

                scope.documentChanged = () => {
                    selectDocumentType(scope.document.typeId);
                    if (scope.module == 3) {
                        if (angular.isDefined(scope.document.documentType)) {
                            if (scope.document.documentType.shortName === 'RME') {
                                if (angular.isDefined(scope.document.issuerId)) {
                                    scope.options.businessPartnerId = scope.document.issuerId;
                                    Restangular.one('businesspartners').one('businesspartnersbyperson', scope.document.issuerId).get({ typeId: 2 }).then(result => {
                                        if (result.inventorySites.length == 1) {
                                            scope.document.inventorySiteId = result.inventorySites[0].id;
                                            scope.options.newItem.inventorySiteId = _.head<any>(scope.tenantInventorySites).id;
                                        }
                                    });
                                }
                            } else if (scope.document.documentType.shortName === 'RMS') {
                                if (angular.isDefined(scope.document.receiverId)) {
                                    scope.options.businessPartnerId = scope.document.receiverId;
                                    Restangular.one('businesspartners').one('businesspartnersbyperson', scope.document.receiverId).get({ typeId: 1 }).then(result => {
                                        if (result.inventorySites.length == 1) {
                                            scope.document.inventorySiteId = result.inventorySites[0].id;
                                            scope.options.newItem.inventorySiteId = _.head<any>(scope.tenantInventorySites).id;
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        };
    })
    .directive('businessDocumentsGrid', ($state, $filter, $compile, $log, businessDocumentStatus, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=?', issuerId: '=?', receiverId: '=?', documentTypeId: '=?', module: '=?', isbusiness: '=?' },
            link(scope: any, element, attrs, ctrl) {


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

                function documentNumberFormatter(cellvalue, options, rowObject) {
                    return $filter('documentNumber')(cellvalue);
                }

                function businessDocumentStatusFormatter(cellvalue, options, rowObject) {
                    var id = parseInt(cellvalue);

                
                    var item: any = _.find(businessDocumentStatus, { id: id });
                    return item.name;
                }

                var gridElementName = 'businessDocumentsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');

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
                    { name: 'typeName', index: 'typeNameContains', search: true, fixed: true, width: 55 },
                    { name: 'number', index: 'numberContains', formatter: documentNumberFormatter, search: true, fixed: true, width: 95 },
                    { name: 'issuerName', index: 'issuerNameContains', search: true },
                    { name: 'receiverName', index: 'receiverNameContains', search: true },
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
                        name: 'total', index: 'total', search: true, fixed: true, width: 110, formatter: currencyFormatter, align: 'right'
                    },
                    {
                        name: 'status', index: 'status', search: true, fixed: true, width: 100, formatter: businessDocumentStatusFormatter,
                        formatoptions: { items: businessDocumentStatus },
                        stype: 'select',
                        searchoptions: { value: toSearchOptions(businessDocumentStatus) }
                    },
                    { name: 'roles', index: 'roles', search: false, width: 95, fixed: true, sortable: false }
                ];

                function loadGrid() {

                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);

                    var _url = '/api/businessdocuments/documents?module=' + scope.module;

                    if (scope.issuerId != undefined) {
                        _url += '&issuerId=' + scope.issuerId
                    }
                    if (scope.receiverId != undefined) {
                        _url += '&receiverId=' + scope.receiverId
                    }

                    if (scope.documentTypeId != undefined) {
                        _url += '&typeCode=' + scope.documentTypeId
                    }
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        url: _url,
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
                        serializeGridData: (postData) => {
                            if (postData.hasOwnProperty('rows')) {
                                postData['take'] = postData['rows'];
                                delete (postData['rows']);
                            }

                            if (postData.hasOwnProperty('sidx') && postData['sidx'] !== null) {
                                if (postData['sord'] === 'asc') {
                                    postData['OrderBy'] = postData['sidx'];
                                    postData['OrderByDesc'] = '';
                                } else {
                                    postData['OrderByDesc'] = postData['sidx'];
                                    postData['OrderBy'] = '';
                                }
                                delete (postData['sidx']);
                                delete (postData['sord']);
                            }
                            return postData;
                        },
                        onCellSelect(rowId, iCol, cellcontent, e) {
                            if (iCol === 0) {
                                var stateName = 'app.procurement.document';
                                if (scope.module == 2) {
                                    stateName = 'app.sales.documentedit';
                                } else if (scope.module == 6) {
                                    stateName = 'app.inv.document';
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

                scope.height = scope.height || 450;
                scope.module = scope.module || 0;
                if (typeof scope.isbusiness == "undefined" || scope.isbusiness == null)
                    scope.isbusiness = true;

                if (scope.isbusiness === true) {
                    loadGrid();
                }
            }
        };
    })
    .directive('businessDocumentApprovalsGrid', ($state, $log, $compile, $filter, Restangular, toastr) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@', view: '=', filter: '=', module: '@' },
            link(scope: any, element) {
                var tabsElement = '<div><uib-tabset>'
                    + '<uib-tab heading="Propias" select="changeView(0)"></uib-tab>'
                    + '<uib-tab heading="Supervisados" select="changeView(1)"></uib-tab>'
                    + '<uib-tab heading="De terceros" select="changeView(2)"></uib-tab>'
                    + '<uib-tab heading="Baja" select="changeView(3)"></uib-tab>'
                    + '<uib-tab heading="Finalizadas" select="changeView(4)"></uib-tab>'
                    + '</uib-tabset></div>';
                var gridElementName = 'businessDocumentApprovalsGrid';
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
                    var value = `${rowObject.businessDocumentTypeName} | `;
                    if (rowObject.businessDocumentTypeShortName === 'RMS') {
                        value += `<small>Cliente</small>&nbsp;<a data-ui-sref="app.system.person({personId: ${rowObject.receiverId}})" title="Ver ficha">${rowObject.receiverName}</a>`;
                    }
                    else {
                        value += `<small>Proveedor</small>&nbsp;<a data-ui-sref="app.system.person({personId: ${rowObject.issuerId}})" title="Ver ficha">${rowObject.issuerName}</a>`;
                    }
                    value += `<br><small>Creada el ${createDate} </small><br><small>Fecha ${documentDate}</small>`;
                    return value;
                }

                function singleQuote(value) {
                    return `'${value}'`;
                }

                function documentActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var stateName = 'app.procurement.documentapproval'

                    //todo: implementar los demas módulos
                    switch (+scope.module) {
                        case 6:
                            stateName = 'app.inv.documentapproval';
                    }
                    var template = `<a href="#" data-ui-sref="${stateName}({ documentId: ${rowObject.id}})" class="btn btn-white btn-xs m-l-md"><i class="fa fa-folder"></i> Ver </a>`;

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
                        gridElement.jqGrid('setGridParam', { postData: { module: scope.module, skip: (currentPage - 1) * 100, take: 100 } });

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
    })
    .filter('documentNumber', () => {
        return (documentNumber: any) => {
            if (!documentNumber) { return ''; }
            documentNumber = documentNumber.slice(0, 4) + '-' + documentNumber.slice(4, 12);
            return documentNumber;
        };
    });
