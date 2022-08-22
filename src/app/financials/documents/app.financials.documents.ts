angular.module('app.financials.documents', ['app.financials'])
    .constant('paymentDocumentItemStatus',
    [{ id: 0, name: 'Emitido' }, { id: 1, name: 'Entregado' }, { id: 2, name: 'Depositado' }, { id: 3, name: 'Acreditado' }, { id: 4, name: 'Cancelado' }, { id: 5, name: 'Rechazado' }]
    )
    .directive('financialsDocumentsViewer', ($state, $window, session) => {
        return {
            templateUrl: 'app/financials/documents/viewer.html',
            restrict: 'A',
            scope: {
                view: '=',
                onViewChanged: '&',
                selectedItems: '=',
                isbusiness: '=',
                module: '=',
            },
            link: (scope: any, element: any, attrs, ctrl) => {
                scope.session = session;

                var mediosPagoCobroItems =
                    [
                        { id: 1, state: 'app.financials.paymentdocument', text: '{{ "Cheques" | translate }}', name: 'checks', iconClass: 'fa fa-book', isbusiness: false },
                        { id: 2, state: 'app.financials.paymentdocument', text: '{{ "Efectivo" | translate }}', name: 'cashtransactions', iconClass: 'fa fa-book', isbusiness: false },
                        { id: 3, state: 'app.financials.paymentdocument', text: '{{ "Transferencia" | translate }}', name: 'banktransfers', iconClass: 'fa fa-book', isbusiness: false }

                    ];

                var impuestosItems =
                [
                    { id: 1, state: 'app.financials.paymentdocument', text: '{{ "Retenciones" | translate }}', name: 'retentions', iconClass: 'fa fa-book', isbusiness: false }
                ];

                //y el de medios de cobro
                //es todos los medios de cobro (osea en cada filtro el medio que va) pero con la condicion de que el receiverid = id del tenant
                var _paymentMethodTypes3 =
                    [
                        { id: 1, text: '{{ "Facturas" | translate }}', name: 'bills', iconClass: 'fa fa-book', isbusiness: true, items: [], state: 'app.procurement.documentedit' },
                        //{ id: 2, text: '{{ "Ordenes de Pago" | translate }}', name: 'payorders', iconClass: 'fa fa-book', isbusiness: true, items: [], state: 'app.procurement.documentedit' },
                        { id: 2, text: '{{ "Recibos" | translate }}', name: 'invoices', iconClass: 'fa fa-book', isbusiness: true, items: [] },
                        { id: 3, text: '{{ "Medios de Cobro" | translate }}', name: 'charges', iconClass: 'fa fa-book', isbusiness: true, items: mediosPagoCobroItems }
                    ];

                var _paymentMethodTypes4 =
                    [
                        { id: 1, text: '{{ "Facturas" | translate }}', name: 'bills', iconClass: 'fa fa-book', isbusiness: false, items: [], state: 'app.procurement.documentedit' },
                        //{ id: 2, text: '{{ "Recibos" | translate }}', name: 'invoices', iconClass: 'fa fa-book', isbusiness: false, items: [] },
                        { id: 2, text: '{{ "Ordenes de Pago" | translate }}', name: 'payorders', iconClass: 'fa fa-book', isbusiness: true, items: [], state: 'app.procurement.documentedit' },
                        { id: 3, text: '{{ "Medios de Pago" | translate }}', name: 'pay', iconClass: 'fa fa-book', isbusiness: false, items: mediosPagoCobroItems },
                        { id: 4, text: '{{ "Impuestos" | translate }}', name: 'taxes', iconClass: 'fa fa-book', isbusiness: false, items: impuestosItems }
                    ];

                var _paymentMethodTypes = ($state.params.module === "1" ? _paymentMethodTypes3 : _paymentMethodTypes4);

                if ($state.params.documentTypeName === undefined || $state.params.documentTypeName === null) {
                    $state.params.documentTypeName = 'bills';
                }

                var seltype = finddocumenttype($state.params.documentTypeName);

                scope.params = {
                    selectedItems: [],
                    paymentMethodTypes: _paymentMethodTypes,
                    selectedDocumentType: seltype,
                    items: _paymentMethodTypes,
                    selectedDocument: '',
                    isbusiness: seltype.isbusiness,
                    module: $state.params.module
                };

                function finddocumenttype(documentType) {
                    var valor = null;
                    _.forEach(_paymentMethodTypes, (value) => {
                        if (value.items.length > 0)
                            valor = _.find(value.items, (value2: any) => { return value2.name === documentType; })
                        else
                            if (documentType === value.name)
                                valor = value;
                        if (valor) {
                            return false;
                        }
                    });
                    return valor;
                }
            }
        }
    })
    .directive('financialsDocumentsGrid', ($state, $window, session, authManager) => {
        return {
            restrict: 'A',
            scope: {
                view: '=',
                onViewChanged: '&',
                selectedItems: '=',
                isbusiness: '=',
                module: '=',
            },
            link: (scope: any, element: any, attrs, ctrl) => {
                var gridElementName = 'financialsDocumentsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;
                scope.selectedItems = [];
                var paymentDocumentItemStatus = [{ id: 0, name: 'Emitido' }, { id: 1, name: 'Entregado' }, { id: 2, name: 'Depositado' }, { id: 3, name: 'Acreditado' }, { id: 4, name: 'Cancelado' }, { id: 5, name: 'Rechazado' }];
                var billDocumentItemStatus = [{id:0, name:'Ingresada'}, {id:1, name:'Pendiente de Aprobación'}, {id:2, name:'Pendiente de Nota de Crédito'},{id:3,name:'Aprobada'},{id:4,name:'Cancelada'},{id:5,name:'Anulada'}];


                function statusFormatter(cellvalue, options, rowObject) {
                    return (options.colModel.formatoptions.items[cellvalue][1]);
                }

                function toSearchOptions(statusEnum) {
                    var options = [];
                    options.push(":Todos");
                    for (var index = 0; index < statusEnum.length; ++index) {
                        options.push(statusEnum[index][0] + ':' + statusEnum[index][1]);
                    }

                    return options.join(";");
                }
                function paymentDocumentStatusFormatter(cellvalue, options, rowObject) {
                    var id = parseInt(cellvalue);
                    var item: any = _.find(paymentDocumentItemStatus, { id: id });
                    return item.name;
                }
                function billDocumentStatusFormatter(cellvalue, options, rowObject) {
                    var id = parseInt(cellvalue);
                    var item: any = _.find(billDocumentItemStatus, { id: id });
                    return item.name;
                }

                var isPaymentDocument = true;
                var stateViewDocument = '';
                function buildGridModel(): IGridModel {
                    var gridModel: IGridModel = <IGridModel>{};

                    switch (scope.view.name) {

                        case 'banktransfers':
                            gridModel.colNames = ['', 'N&uacute;mero', 'Fecha', 'Razón social', 'Monto', 'Estado', 'Financiamiento',''];
                            gridModel.colModel = [
                                {
                                    name: 'actions',
                                    index: 'actions',
                                    width: 25,
                                    align: 'center',
                                    fixed: true,
                                    sortable: false,
                                    search: false,
                                    formatter: () => { return '<i class="fa fa-search fa-fw hand" title="Ver documento"></i>'; }
                                },
                                { name: 'paymentDocumentNumber', index: 'paymentDocumentNumber', width: 80 },
                                {
                                    name: 'issueDate',
                                    index: 'issueDate',
                                    width: 60,
                                    formatter: 'date',
                                    formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' }
                                },
                               
                                { name: 'personName', index: 'personName', width: 180 },
                                {
                                    name: 'amount',
                                    index: 'amount',
                                    width: 80,
                                    formatter: 'currency',
                                    align: 'right'
                                },
                                {
                                    name: 'status', index: 'status', search: true, fixed: true, width: 100, formatter: paymentDocumentStatusFormatter,
                                    formatoptions: { items: paymentDocumentItemStatus },
                                    stype: 'select',
                                },
                                {
                                    name: 'financingStatus',
                                    index: 'financingStatus',
                                    width: 80,
                                    stype: 'select'
                                },
                                { name: 'paymentDocumentId', index: 'paymentDocumentId', hidden: true }
                            ];
                            stateViewDocument = scope.view.state;
                            break;
                        case 'checks':
                            gridModel.colNames = ['', 'N&uacute;mero', 'Emisi&oacute;n', 'Dep&oacute;sito', 'Razón Social', 'Monto', 'Estado', 'Financiamiento',''];
                            gridModel.colModel = [
                                {
                                    name: 'actions',
                                    index: 'actions',
                                    width: 25,
                                    align: 'center',
                                    fixed: true,
                                    sortable: false,
                                    search: false,
                                    formatter: () => { return '<i class="fa fa-search fa-fw hand" title="Ver documento"></i>'; }
                                },
                                { name: 'number', index: 'number', width: 80 },
                                {
                                    name: 'issueDate',
                                    index: 'issueDate',
                                    width: 60,
                                    formatter: 'date',
                                    formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' }
                                },
                                {
                                    name: 'checkBookVoidDate',
                                    index: 'checkBookVoidDate',
                                    width: 60,
                                    formatter: 'date',
                                    formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' }
                                },
                                //{ name: 'paymentDocumentReciverName', index: 'paymentDocumentReciverName', width: 180 },
                                { name: 'personName', index: 'personName', width: 180 },
                                {
                                    name: 'amount',
                                    index: 'amount',
                                    width: 80,
                                    formatter: 'currency',
                                    align: 'right'
                                },
                                {
                                    name: 'status', index: 'status', search: true, fixed: true, width: 100, formatter: paymentDocumentStatusFormatter,
                                    formatoptions: { items: paymentDocumentItemStatus },
                                    stype: 'select',
                                },
                                {
                                    name: 'checkBookStatus',
                                    index: 'checkBookStatus',
                                    width: 80,
                                    stype: 'select'
                                },
                                { name: 'paymentDocumentId', index: 'paymentDocumentId', hidden: true }
                            ];
                            stateViewDocument = scope.view.state;
                            break;
                        case 'cashtransactions':
                            gridModel.colNames = ['', 'Emisi&oacute;n', 'Razón Social', 'Monto', 'Estado',''];
                            gridModel.colModel = [
                                {
                                    name: 'actions',
                                    index: 'actions',
                                    width: 25,
                                    align: 'center',
                                    fixed: true,
                                    sortable: false,
                                    search: false,
                                    formatter: () => { return '<i class="fa fa-search fa-fw hand" title="Ver documento"></i>'; }
                                },
                                {
                                    name: 'issueDate',
                                    index: 'issueDate',
                                    width: 60,
                                    formatter: 'date',
                                    formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' }
                                },
                                { name: 'personName', index: 'personName', width: 180 },
                                {
                                    name: 'amount',
                                    index: 'amount',
                                    width: 80,
                                    formatter: 'currency',
                                    align: 'right'
                                },
                                {
                                    name: 'status', index: 'status', search: true, fixed: true, width: 100, formatter: paymentDocumentStatusFormatter,
                                    formatoptions: { items: paymentDocumentItemStatus },
                                    stype: 'select',
                                },
                                { name: 'paymentDocumentId', index: 'paymentDocumentId', hidden: true }
                            ];
                            stateViewDocument = scope.view.state;
                            break;

                        //bussinesdocuments
                        case 'invoices':
                        case 'bills':
                            gridModel.colNames = ['', 'N&uacute;mero', 'Fecha', 'Razón Social', 'Monto', 'Estado', 'Data 1', 'Data 2'];
                            gridModel.colModel = [
                                {
                                    name: 'actions',
                                    index: 'actions',
                                    width: 20,
                                    align: 'center',
                                    fixed: true,
                                    sortable: false,
                                    search: false,
                                    formatter: () => { return '<i class="fa fa-search fa-fw hand" title="Ver documento"></i>'; }
                                },
                                {
                                    name: 'documentNumber',
                                    index: 'documentNumber',
                                    searchoptions: { sopt: ['cn'] },
                                    width: 130,
                                    fixed: true
                                },
                                {
                                    name: 'issueDate',
                                    index: 'issueDate',
                                    width: 80,
                                    fixed: true,
                                    formatter: 'date',
                                    formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' }
                                },
                                { name: 'receiverName', index: 'receiverName' },
                                {
                                    name: 'amount',
                                    index: 'amount',
                                    width: 100,
                                    fixed: true,
                                    /*formatter: 'currency',*/
                                    align: 'right'
                                },
                                {
                                    name: 'status',
                                    index: 'status',
                                    width: 80,
                                    fixed: true,
                                    formatter: billDocumentStatusFormatter,
                                    stype: 'select'
                                },
                                {
                                    name: 'data1',
                                    index: 'data1',
                                    width: 80,
                                    fixed: true
                                },
                                {
                                    name: 'data2',
                                    index: 'data2',
                                    width: 80,
                                    fixed: true
                                }
                            ];
                            isPaymentDocument = false;
                            stateViewDocument = scope.view.state;
                            break;
                        case 'payorders':
                        case 'creditnote':
                        case 'notedebit':
                            gridModel.colNames = ['', 'N&uacute;mero', 'Tipo', 'Fecha', 'Razón Social', 'Monto', 'Estado', 'Financiamiento'];
                            gridModel.colModel = [
                                {
                                    name: 'actions',
                                    index: 'actions',
                                    width: 20,
                                    align: 'center',
                                    fixed: true,
                                    sortable: false,
                                    search: false,
                                    formatter: () => { return '<i class="fa fa-search fa-fw hand" title="Ver documento"></i>'; }
                                },
                                {
                                    name: 'number',
                                    index: 'number',
                                    searchoptions: { sopt: ['cn'] },
                                    width: 130,
                                    fixed: true
                                },
                                {
                                    name: 'typeName',
                                    index: 'typeName',
                                    width: 60,
                                    fixed: true
                                },
                                {
                                    name: 'documentDate',
                                    index: 'documentDate',
                                    width: 80,
                                    fixed: true,
                                    formatter: 'date',
                                    formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' }
                                },
                                { name: 'issuerName', index: 'issuerName' },
                                {
                                    name: 'total',
                                    index: 'total',
                                    width: 100,
                                    fixed: true,
                                    formatter: 'currency',
                                    align: 'right'
                                },
                                {
                                    name: 'status',
                                    index: 'status',
                                    width: 80,
                                    fixed: true,
                                    formatter: paymentDocumentStatusFormatter,
                                    stype: 'select'
                                },
                                {
                                    name: 'financingStatus',
                                    index: 'financingStatus',
                                    width: 80,
                                    fixed: true,
                                    formatter: paymentDocumentStatusFormatter,
                                    stype: 'select'
                                }
                            ];
                            isPaymentDocument = false;
                            stateViewDocument = scope.view.state;
                            break;
                    }
                    return gridModel;
                }

                function loadGrid() {
                    $.jgrid.gridUnload('#' + gridElementName);
                    //var url = '/api/businessdocuments/documents1/' + scope.view.name + '/' + scope.module;
                    var url = 'app/financials/api/invoices.json';
                    switch (scope.view.name) {
                        case 'banktransfers':
                            //url = '/api/financials/paymentdocumentitems2/' + 1 + '/' + scope.module;
                            url = '/app/financials/banktransfers.json';
                            break;
                        case 'cashtransactions':
                            //url = '/api/financials/paymentdocumentitems2/' + 2 + '/' + scope.module;
                            url = 'app/financials/cashtransactions.json';
                            break;
                        case 'checks':
                            url = 'app/financials/checks.json';
                            break;
                    }

                    var gridModel: IGridModel = buildGridModel();
                    
                    scope.height = scope.height || 450;
                    scope.isbusiness = scope.isbusiness || 0;

                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        gridview: true,
                        pager: pagerElementName,
                        viewrecords: true,
                        multiselect: true,
                        loadBeforeSend: function(jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
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
                        onCellSelect: function (rowId, iCol, cellcontent, e) {
                            if (iCol == 0) {
                                //var stateName = 'documents.' + scope.view.documentType.path.substring(0, scope.view.documentType.path.length - 1) + 'edit';
                                var rowData = gridElement.jqGrid('getRowData', rowId);
                                var documentId = rowId;
                                switch (scope.view.name) {
                                    case 'banktransfers':
                                    case 'cashtransactions':
                                    case 'checks':
                                        documentId = rowData.paymentDocumentId;
                                        break;
                                }
                                $state.go(stateViewDocument, { documentId: documentId });
                                return false;
                            }
                        },
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                        del: false,
                        add: false,
                        edit: false
                    }, {}, {}, {}, { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');
                }
                var currentView = null;
                scope.$watch('documentTypeName', function () {
                    if (scope.view != null) {
                        if (currentView != scope.view) {
                            currentView = scope.view;
                            loadGrid();
                        }
                    }
                }, true);

                $('.glyphicon.glyphicon-file').click(function (e) {
                    var documentType = $(this).attr('data-typeId');
                    var stateName = 'documents.' + documentType.substring(0, documentType.length - 1) + 'create';
                    $state.go(stateName);
                });
            }
        };
    });
