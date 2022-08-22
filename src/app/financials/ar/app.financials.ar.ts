angular.module('app.financials.ar', ['app.financials.ar.debtmanagement'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.ar',
            {
                url: '/ar',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.financials',
                    label: 'financials.ar'
                }
            })
            .state('app.financials.ar.documents',
            {
                url: '/documents',
                controller: 'FinancialsArDocumentsController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/ar/documents.html',
                ncyBreadcrumb: {
                    label: 'financials.ar.documents'
                }
            })
            .state('app.financials.ar.receipts',
            {
                url: '/receipts',
                controller: 'FinancialsArReceiptListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/ar/receipts/list.html',
                ncyBreadcrumb: {
                    label: 'financials.receipts'
                }
            })
            .state('app.financials.ar.receiptnew',
            {
                url: '/receipts/new',
                controller: 'FinancialsArReceiptController',
                templateUrl: 'app/financials/ar/receipts/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.receipts',
                    label: '{{ "command.new" | translate }} {{document.documentType.name}}'
                },
                data: { edit: true }
            })
            .state('app.financials.ar.receiptedit',
            {
                url: '/receipts/{documentId}/edit',
                controller: 'FinancialsArReceiptController',
                templateUrl: 'app/financials/ar/receipts/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.receipts',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.financials.ar.receipt',
            {
                url: '/receipt/{documentId}',
                controller: 'FinancialsArReceiptController',
                templateUrl: 'app/financials/ar/receipts/edit.html',
                resolve: loadSequence('ngCkeditor',
                    'ui-mask',
                    'icheck',
                    'angularFileUpload',
                    'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.financials.ar.receipts',
                    label: '{{document.documentType.name}}'
                }
            })
            .state('app.financials.ar.checksincustody',
            {
                url: '/checksincustody',
                controller: 'FinancialsArChecksInCustodyController',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                templateUrl: 'app/financials/ar/checksincustody.html',
                ncyBreadcrumb: {
                    label: 'financials.ar.checksincustody'
                }
            });
    })
    .controller('FinancialsArDocumentsController', ($scope, $translate, $state, Restangular) => {

    })
    .controller('FinancialsArReceiptListController', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.financials.ar.receiptnew');
        }
    })
    .controller('FinancialsArReceiptController', ($scope: IProcurementBusinessDocumentScope, $translate, $stateParams, $state, Restangular, toastr, $log) => {
        var id = $stateParams.documentId;
        var edit = $state.is('app.financials.ar.receiptedit') || $state.is('app.financials.ar.receiptnew');

        $scope.documentOptions = { edit: edit };

        $scope.confirm = () => {
            Restangular.service('financials/paymentdocuments/' + $scope.document.guid + '/confirm').post({}).then((result) => {
                toastr.success('Editor de recibos', 'Se ha confirmado el recibo con éxito.');
                $state.go('app.financials.ar.receipts');
            });
        }

        $scope.edit = () => {
            $state.go('app.financials.ar.receiptedit', { documentId: id });
        }

        $scope.view = () => {
            $state.go('app.financials.ar.receipt', { documentId: id });
        }

        $scope.save = () => {
            if (id) {
                $scope.document.put().then((result) => {
                    toastr.success('El recibo se actualizó con éxito');
                    $scope.document = result;
                });
            } else {
                Restangular.service('financials/paymentdocuments').post($scope.document).then((result) => {
                    toastr.success('Editor de recibo', 'El recibo se creó con éxito');
                    $state.go('app.financials.ar.receiptedit', { documentId: result.id });
                });
            }
        }

        $scope.submitForApproval = () => {
            Restangular.service('financials/paymentdocuments/' + $scope.document.guid + '/submitforapproval').post({}).then((result) => {
                toastr.success('Editor de recibo', 'Se ha iniciado el proceso de aprobación del recibo con éxito.');
                $state.go('app.financials.ar.receipts');
            });
        }

        function load() {
            if (id) {
                Restangular.one('financials').one('paymentdocuments', id).get().then(result => {
                    $scope.document = result;
                });
            } else {
                $scope.document = {};
                $scope.document.typeId = 2;
            }
        }

        load();
    })

    .controller('FinancialsArChecksInCustodyController', ($scope, toastr, $log, dialogs, session) => {
        $scope.checkedItems = [];
        $scope.session = session;

        $scope.deposit = () => {
            var modalInstance = dialogs.create('/app/financials/ar/depositmodal.html',
                'FinancialsDepositModalController',
                { ids: $scope.checkedItems },
                'lg');
            modalInstance.result.then((obj) => {
                toastr.success('Finanzas', 'La operación se realizó con éxito.');
                $scope.$broadcast('refresh', {});
            }, () => { });
        };

        $scope.canRequestFinancing = () => {
            return $scope.view == 1 && true;
        };

        $scope.requestFinancing = () => {
            toastr.success('Finanzas', 'Mostrar pantalla de solicitud de financiamiento.');
        };

        $scope.canCollect = () => {
            return $scope.view == 1 && true;
        };

        $scope.collect = () => {
            toastr.success('Finanzas', 'Mostrar pantalla de gestión de cobranzas.');
        };

        $scope.$on('selectionChanged',
            (event, args) => {
                $scope.checkedItems = _.map(args, (id) => {
                    return (_.isString(id)) ? _.toInteger(id) : id;
                });
                $scope.$apply();
            });

        $scope.$on('viewChanged',
            (event, args) => {
                $scope.view = args;
                $scope.checkedItems = [];
                //$scope.$apply();
                //$log.info($scope.view)
            });
    })
    .directive('financialsArChecksInCustodyGrid', ($state, Restangular, toastr, $compile, dialogs, $log, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', view: '=?' },
            link(scope: any, element, attrs, ctrl) {
                var tabsElement = '<div><uib-tabset>'
                    + '<uib-tab heading="Recibidos" select="changeView(1)"></uib-tab>'
                    + '<uib-tab heading="Depositados" select="changeView(2)"></uib-tab>'
                    + '<uib-tab heading="Acreditados" select="changeView(3)"></uib-tab>'
                    + '<uib-tab heading="Rechazados" select="changeView(5)"></uib-tab>'
                    + '<uib-tab heading="Vendidos" select="changeView(6)"></uib-tab>'
                    + '<uib-tab heading="En cobro terceros" select="changeView(7)"></uib-tab>'
                    + '</uib-tabset></div>';

                const gridElementName = 'financialsChecksInCustodyGrid';
                const pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                const pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append($compile(tabsElement)(scope));
                element.append($compile(gridElement)(scope));
                element.append($compile(pagerElement)(scope));

                scope.height = scope.height || 450;
                scope.view = scope.view || 0;

                scope.changeView = (view) => {
                    scope.view = view;
                    loadData();
                };

                var colNames = ['', 'Recibo', 'Nro Cheque', 'Banco', 'Titular', 'Librador', 'Monto', 'Emisión', 'Vencimiento', 'Depósito'];
                var colModel: Array<any> = [
                    {
                        name: 'id',
                        index: 'id',
                        hidden: true,
                        key: true
                    },
                    { name: 'paymentDocumentNumber', index: 'paymentDocumentNumber', align: 'center', search: true, sortable: false, fixed: true, width: 100 },
                    { name: 'checkNumber', index: 'checkNumber', align: 'center', search: true, sortable: false },
                    { name: 'bankAccountDescription', index: 'bankAccountDescription', align: 'center', search: true, sortable: false },
                    { name: 'owner', index: 'owner', align: 'center', search: true, sortable: false },
                    { name: 'personName', index: 'personName', align: 'center', search: true, sortable: false },
                    { name: 'amount', index: 'amount', search: true, formatter: 'currency', align: 'right', sortable: false, fixed: true, width: 100 },
                    { name: 'issueDate', index: 'issueDate', search: true, align: 'center', formatter: 'date', sortable: false, fixed: true, width: 90 },
                    { name: 'voidDate', index: 'voidDate', search: true, align: 'center', formatter: 'date', sortable: false, fixed: true, width: 90 },
                    { name: 'depositDate', index: 'depositDate', search: true, align: 'center', formatter: 'date', sortable: false, fixed: true, width: 90 }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    //url: '/api/financials/checksincustody.json',
                    //datatype: 'json',
                    datatype: 'local',
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
                        root: 'results'
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return true;
                    },
                    onCellSelect(rowId, iCol) {
                    },
                    multiselect: true,
                    multiboxonly: true,
                    loadComplete: () => {
                        $compile(angular.element('#' + gridElementName))(scope);
                        //scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));
                    },
                    gridComplete: function () {
                        angular.element("#cb_" + gridElementName).click(() => {
                            scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));
                        });

                        var amountSum = gridElement.jqGrid('getCol', 'amount', false, 'sum');
                        gridElement.jqGrid('footerData', 'set', {
                            amount: amountSum
                        });
                    },
                    onSelectRow: (rowId, status, e) => {
                        if (angular.isDefined(e)) {
                            scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));
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

                scope.$on('refresh', () => {
                    gridElement.trigger('reloadGrid');
                });

                function loadData() {

                    var url = '/api/financials/checksincustody.json';
                    gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$watch('view', (value) => {
                    scope.$emit('viewChanged', value);
                });
            }
        };
    });
