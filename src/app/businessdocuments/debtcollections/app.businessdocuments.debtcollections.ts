angular.module('app.businessdocuments.debtcollections',[])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.businessdocuments.debtcollections', {
                url: '/debtcollections',
                controller: 'BusinessDocumentsDebtCollectionsController',
                templateUrl: 'app/businessdocuments/debtcollections/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'bd.collections'
                }
            })
            .state('app.businessdocuments.debtcollectionslist', {
                url: '/list',
                controller: 'BusinessDocumentsDebtCollectionsListController',
                templateUrl: 'app/businessdocuments/debtcollections/basiclist.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'bd.collections'
                }
            });
        }
    ])

    .controller('BusinessDocumentsDebtCollectionsController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.financials.ar.debtmanagement.collection.view({ documentId: ', { documentId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    }
    ])

    .controller('BusinessDocumentsDebtCollectionsListController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.financials.ar.debtmanagement.collection.view({ documentId: ', { documentId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    }
    ])
    .directive('businessDocumentDebtCollectionsGrid', ['$http','$state', '$log', '$compile', '$filter', 'Restangular', 'toastr', 'authManager', ($http, $state, $log, $compile, $filter, Restangular, toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@', view: '=', filter: '=' },
            link(scope: any, element) {
                var tabsElement = '<div><uib-tabset>'
                    + '<uib-tab heading="Propias" select="changeView(0)"></uib-tab>'
                    + '<uib-tab heading="Supervisados" select="changeView(1)"></uib-tab>'
                    + '<uib-tab heading="De terceros" select="changeView(2)"></uib-tab>'
                    + '<uib-tab heading="Baja" select="changeView(3)"></uib-tab>'
                    + '<uib-tab heading="Finalizadas" select="changeView(4)"></uib-tab>'
                    + '</uib-tabset></div>';
                var gridElementName = 'loansLoansAuthorizationsGrid';
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
                 
                       // cleanup
                       //downloadLink.remove();
                       //window.open(urlObject,'_blank');
                       //URL.revokeObjectURL(urlObject);
                   }
                 }

                scope.pdf = (id, code) => {
                    console.log('CODE = ' + code);
                    if (code == 'NAD'){
                        $http({
                            method: 'GET',
                            url: API_HOST  + '/api/businessdocuments/documents/getpdf/' + id,
                            responseType: 'blob'
                          }).then(function(response) {
                            var blob = response.data;
                            startBlobDownload(blob, id + '.pdf')
                          });
                    }
                    if (code == 'TE'){
                        $http({
                            method: 'GET',
                            url: API_HOST  + '/api/businessdocuments/documents/gettepdf/' + id,
                            responseType: 'blob'
                          }).then(function(response) {
                            var blob = response.data;
                            startBlobDownload(blob, id + '.pdf')
                          });
                    }
                    if (code == 'LIQDGJ'){
                        $http({
                            method: 'GET',
                            url: API_HOST  + '/api/businessdocuments/documents/gettepdf/' + id,
                            responseType: 'blob'
                          }).then(function(response) {
                            var blob = response.data;
                            startBlobDownload(blob, id + '.pdf')
                          });
                    }
                    if (code == 'LIQIGB'){
                        $http({
                            method: 'GET',
                            url: API_HOST  + '/api/businessdocuments/documents/gettepdf/' + id,
                            responseType: 'blob'
                          }).then(function(response) {
                            var blob = response.data;
                            startBlobDownload(blob, id + '.pdf')
                          });
                    }


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
                    return '<div class="largefontcell m-l-sm"># ' + rowObject.number + '</div>';
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

                function loanDataFormatter(cellvalue: any, options: any, rowObject: any) {
                    var createDate = $filter('amDateTime')(rowObject.createDate);
                    var amount = $filter('currency')(rowObject.total);
                    return '<small>Solicitante</small> <a data-ui-sref="app.system.person({ personId: ' + rowObject.issuerId + ' })" title="Ver ficha">' + rowObject.issuerName + '</a><br><small>Creada el ' + createDate + '</small><br><small>Monto solicitado ' + amount + '</small></td>';
                }

                function singleQuote(value) {
                    return `'${value}'`;
                }

                function documentActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = '<a href="#" data-ui-sref="app.financials.ar.debtmanagement.view({ documentId: ' + rowObject.id + '})" class="btn btn-white btn-xs m-l-md"><i class="fa fa-folder"></i> Ver </a>';
                    template += '<a href="#" data-ng-click="pdf(' + rowObject.id + ',' + singleQuote(rowObject.businessDocumentTypeShortName) + ')" class="btn btn-white btn-xs m-l-md"><i class="fa fa-folder"></i> Pdf </a>'
                    //template += '<a href="#" data-ng-click="te(' + rowObject.id + ')" class="btn btn-white btn-xs m-l-md"><i class="fa fa-folder"></i> TE </a>'
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
                    { name: 'loanData', index: 'loanData', search: false, formatter: loanDataFormatter },
                    { name: 'workflowProgress', index: 'workflowProgress', width: 150, fixed: true, search: false, formatter: workflowProgressFormatter },
                    { name: 'actions', index: 'actions', width: 300, align: 'left', fixed: true, search: false, formatter: documentActionsFormatter }
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
                    var url = API_HOST + '/api/businessdocuments/documents/debtcollects.json?module=8';
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
    }])
    

    .directive('businessDocumentDebtCollectionsListGrid', ($log, $compile, $state, $document, dialogs, Restangular, $http, $timeout,toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsArDebtManagementDebtorGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
 
                scope.height = scope.height || 450;
 
                function DocumentFormatter(cellvalue: any){
                    if (cellvalue === 'Título Ejecutivo'){
                        return 'T.E';
                    }else{
                        return cellvalue;
                    }
                  }

                var colNames = ['', 'Tipo','Número','Acreedor','Deudor','Emision','Vencimiento','Estado','Asignado','Importe'];


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
 
                    { name: 'businessDocumentTypeShortName', index: 'businessDocumentTypeShortName', width: 50, fixed: true, search: false, align: 'center' },
                    { name: 'number', index: 'number', width: 150, fixed: true, search: false, align: 'center' },
                    { name: 'receiverName', index: 'receiverName', width: 150, fixed: true, search: false,align: 'left'  },
                    { name: 'debtorName', index: 'debtorName', width: 150,  fixed: true, search: false,align: 'left'  },
                    { name: 'documentDate', index: 'documentDate',formatter:'date', formatoptions: { srcformat: "ISO8601Long", newformat: "d/m/Y" }, align: 'center', fixed: true, search: false },
                    { name: 'voidDate', index: 'voidDate',formatter:'date', formatoptions: { srcformat: "ISO8601Long", newformat: "d/m/Y" }, align: 'center', fixed: true, search: false },
                    { name: 'workflowActivityName', index: 'workflowActivityName', align: 'center', fixed: true, search: false },
                    { name: 'roles', index: 'roles', width: 80, align: 'center', fixed: true, search: false },
                    { name: 'total', index: 'total', width: 100, formatter: 'currency', align: 'right', fixed: true, search: false }
                ];
 
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/businessdocuments/documents/debtcollects.json?module=8',
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
                            var stateName = 'app.financials.ar.debtmanagement.view';
                            var rowData = $(this).jqGrid("getRowData", rowId);
                            $state.go(stateName, { documentId: rowId });
 
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
 
