angular.module('app.businesspartners', [])
    .directive('businessPartnersEditor', ($log, $state, Restangular) => {
        return {
            restrict: 'E',
            scope: { typeId: '@', ngModel: '=' },
            templateUrl: '/app/businesspartners/edit.html',
            link(scope: any, element, attrs, ctrl) {
                scope._ = _;

                scope.viewCheckingAccount = (id) => {
                    scope.$emit("viewCheckingAccount", id);
                }
            }
        }
    })
    .directive('businessPartnersAccounts', ($log, $state, Restangular) => {
        return {
            restrict: 'E',
            scope: { ngModel: '=' },
            templateUrl: '/app/businesspartners/accounts.html',
            link(scope: any, element, attrs, ctrl) {
                scope._ = _;
                scope.ngModel = {};
                
                scope.$on("loadData", (event, personId) => {
                    Restangular.one('businesspartners').one('businesspartners/persons', personId).get().then(result => {
                        scope.ngModel = result;
                    });
                });

                scope.$emit("loaded");

            }
        }
    })
    .directive('businessPartnersGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', typeId: '@' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'businessPartnersGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;
                scope.typeId = scope.typeId || null;

                var colNames = ['', 'Número', 'Nombre', 'CUIT'];
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
                    { name: 'code', index: 'codeContains', search: true, width: 100, fixed: true },
                    { name: 'personName', index: 'personNameContains', search: true },
                    { name: 'personCode', index: 'personCodeContains', width: 120, fixed: true, search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/businesspartners/businesspartners.json',
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
                        if (scope.typeId != null) {
                            gridElement.jqGrid('setGridParam', { postData: { typeId: scope.typeId } });
                        }
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            switch (scope.typeId) {
                                case '1':
                                    $state.go('app.sales.clientedit', { clientId: rowId });
                                    break;
                                case '2':
                                    $state.go('app.procurement.vendoredit', { vendorId: rowId });
                                    break;
                            }
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
    .directive('businessPartnersAccountEntriesGrid', ($state, $rootScope, Restangular, $log, $filter, authManager) => {
        return {
            restrict: 'E',
            scope: { height: '@', selectedItems: '=', accountId:'=' },
            link(scope: any, element, attrs, ctrl) {
               
                console.log(scope.accountId);
                var gridElementName = 'businessPartnersAccountEntriesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                function typeFormatter(cellvalue: any, options: any, rowObject: any) {
                    //return (rowObject.amount >= 0) ? 'INGRESO DE DINERO' : 'PAGO';
                    var typeName = "";
                    if (rowObject.amount > 0) {
                        typeName = 'DEUDA';
                    } else if (rowObject.amount < 0){
                        if (rowObject.linkedDocumentTypeId == 1) {
                            typeName = 'PAGO';
                        } else {
                            typeName = 'PAGO';
                        }
                    }
                    return typeName;
                }

                function currencyFormatter(cellvalue, options, rowObject) {
                    var value = parseFloat(cellvalue);
                    var content = $filter('currency')(value)
                    if (value < 0) {
                        content = '<span style="color:red">' + content + '</span>'
                    }
                    return content;
                }

                var colNames = ['', 'Fecha Creación','Fecha Movimiento', 'Número', 'Concepto', 'Tipo Movimiento', 'Importe', 'Saldo','',''];
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
                    { name: 'createDate', index: 'createDate', search: true, width: 100, fixed: true, formatter:'date', sortable: false },
                    { name: 'postingDate', index: 'postingDate', search: true, width: 100, fixed: true, formatter:'date', sortable: false },
                    { name: 'code', index: 'code', width: 120, fixed: true, search: true, sortable: false },
                    { name: 'description', index: 'description', width: 220, fixed: true, search: true, sortable: false },
                    { name: 'type', index: 'type', width: 120, fixed: true, search: true, formatter: typeFormatter, sortable: false },
                    { name: 'amount', index: 'amount', width: 120, fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: false },
                    { name: 'balance', index: 'balance', width: 120, fixed: true, search: false, formatter: currencyFormatter, align: 'right', sortable: false },
                    { name: 'linkedDocumentTypeId', index: 'linkedDocumentTypeId', hidden: true },
                    { name: 'linkedDocumentId', index: 'linkedDocumentId', hidden: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/businesspartners/account/' + scope.accountId + '/entries.json',
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
                    //rowNum: 100,
                    loadonce: true,

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
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        //gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    
					onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var rowData = $(this).jqGrid("getRowData", rowId);
                            
                            
                            if (rowData.linkedDocumentTypeId == 2) {
                                $state.go('app.financials.ar.receipt', { documentId: rowData.linkedDocumentId }); 
                            } else {
                                if (rowData.linkedDocumentTypeId == 22 || rowData.linkedDocumentTypeId == 25) {
                                    $state.go('app.financials.ar.debtmanagement.edit', { documentId: rowData.linkedDocumentId });
                                }else{
                                    if (rowData.linkedDocumentTypeId == 1) {
                                        $state.go('app.financials.ap.paymentorder', { documentId: rowData.linkedDocumentId });
                                    }
                                }
                            }
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
    });