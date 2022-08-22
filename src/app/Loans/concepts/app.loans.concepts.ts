angular.module('app.loans.concepts', ['app.core', 'app.loans'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.loans.concepts',
            {
                url: '/concepts',
                controller: 'LoanConceptsController',
                templateUrl: 'app/loans/concepts/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'lns.loanconcepts',
                    parent: 'app.loans'
                }
            })
            .state('app.loans.concept',
            {
                url: '/concepts/{loanConceptId}',
                controller: 'LoanConceptController',
                templateUrl: 'app/loans/concepts/edit.html',
                resolve: loadSequence('angularFileUpload', 'icheck', 'toastr', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'lns.loanconcept',
                    parent: 'app.loans.concepts'
                }
            })
            .state('app.loans.conceptapplications',
            {
                url: '/concepts/applications',
                controller: 'LoanConceptApplicationsController',
                templateUrl: 'app/loans/conceptapplications/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'lns.loanconceptapplications',
                    parent: 'app.loans.concepts'
                }
            })
            .state('app.loans.conceptapplication',
            {
                url: '/concepts/applications/{conceptApplicationId}',
                controller: 'LoanConceptApplicationController',
                templateUrl: 'app/loans/conceptapplications/edit.html',
                resolve: loadSequence('angularFileUpload', 'toastr', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'lns.loanconceptapplication',
                    parent: 'app.loans.conceptapplications'
                }
            });
    }
    ])
    .factory('loanConceptOperations', [() => {
        var data = [
            { id: 0, name: 'operation.none' },
            { id: 1, name: 'operation.addition' },
            { id: 2, name: 'operation.substraction' },
            { id: 3, name: 'operation.multiplication' },
            { id: 4, name: 'operation.division' }
        ];
        return data;
    }])
    .factory('loanConceptTypes', [() => {
        var data = [
            { id: 0, name: 'loanconcept.type.fixed' },
            { id: 1, name: 'loanconcept.type.percentage' }
        ];
        return data;
    }])
    .factory('loanConceptSources', [() => {
        var data = [
            { id: 0, name: 'loanconcept.source.capital' },
            { id: 1, name: 'loanconcept.source.installment' },
            { id: 2, name: 'loanconcept.source.concept' }
        ];
        return data;
    }])
    .factory('loanConceptApplyTo', [() => {
        var data = [
            { id: 0, name: 'loanconcept.applyto.capital' },
            { id: 1, name: 'loanconcept.applyto.installment' },
            { id: 2, name: 'loanconcept.applyto.other' }
        ];
        return data;
    }])
    .factory('operatingAccountTypes', [() => {
        var data = [
            { id: 1, name: 'sales.client' },
            { id: 2, name: 'procurement.vendor' }
        ];
        return data;
    }])
    .factory('operatingAccountOperations', [() => {
        var data = [
            { id: 0, name: 'operation.addition' },
            { id: 1, name: 'operation.substraction' }
        ];
        return data;
    }])
    .controller('LoanConceptsController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };
    }
    ])
    .controller('LoanConceptController', ($log, $scope: any, $translate, $stateParams, $state, $filter, $window, Restangular, dialogs, FileUploader, toastr, $http, loanPersonRoles, loanConceptApplyTo, loanConceptOperations, loanConceptTypes, loanConceptSources, operatingAccountTypes, operatingAccountOperations) => {
        var id = $stateParams.loanConceptId;
        $scope.loanConcept = {};
        $scope.loanPersonRoles = loanPersonRoles;
        $scope.loanConceptApplyTo = loanConceptApplyTo;
        $scope.loanConceptOperations = loanConceptOperations;
        $scope.loanConceptTypes = loanConceptTypes;
        $scope.loanConceptSources = loanConceptSources;
        $scope.operatingAccountTypes = operatingAccountTypes;
        $scope.operatingAccountOperations = operatingAccountOperations;

        $scope.loanPersonRoles.unshift({ id: null, name: '' });

        $scope.save = () => {
            if (id) {
                $scope.loanConcept.put().then(() => {
                    toastr.success('Se han guardado los cambios al concepto.', 'Editor de conceptos de préstamo');
                    $scope.$broadcast('loadData');
                });
            } else {

            }
        };

        function load() {
            if (id) {
                Restangular.one('loans').one('concepts', id).get().then(loanConcept => {
                    if (loanConcept.operationSign == null) {
                        loanConcept.operationSign = 0;
                    }
                    $scope.loanConcept = loanConcept;
                });
            } else {
                $scope.loanConcept = { operationSign: 0 };
            }
        }

        load();
    })
    .directive('loansLoanConceptsGrid', ($log, $state, $filter, $compile, $http, operatingAccountTypes, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@' },
            link(scope: any, element, attrs, ctrl) {
                var loanConceptOperations = ['none', 'addition', 'substraction', 'multiplication', 'division'];
                var loanConceptTypes = ['fixed', 'percentage'];
                var loanConceptSources = ['capital', 'installment', 'concept'];
                var loanConceptApplyTos = ['capital', 'installment', 'other'];

                function loanConceptOperationsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var key = 'lns.conceptoperations.' + loanConceptOperations[cellvalue].toLowerCase();
                    return $filter('translate')(key);
                }

                function loanConceptTypesFormatter(cellvalue: any, options: any, rowObject: any) {
                    var key = 'lns.concepttypes.' + loanConceptTypes[cellvalue].toLowerCase();
                    return $filter('translate')(key);
                }

                function loanConceptSourcesFormatter(cellvalue: any, options: any, rowObject: any) {
                    if (cellvalue) {
                        var key = 'lns.conceptsources.' + loanConceptSources[cellvalue].toLowerCase();
                        return $filter('translate')(key);
                    }

                    return null;
                }

                function loanConceptApplyTosFormatter(cellvalue: any, options: any, rowObject: any) {
                    var key = 'lns.conceptapplytos.' + loanConceptApplyTos[cellvalue].toLowerCase();
                    return $filter('translate')(key);
                }

                function operatingAccountPostingTypeFormatter(cellvalue: any, options: any, rowObject: any) {
                    var operatingAccountType: any = _.find(operatingAccountTypes, { id: cellvalue });
                    if (operatingAccountType) {
                        return $filter('translate')(operatingAccountType.name);
                    }

                    return null;
                }

                var gridElementName = 'loansLoanConceptsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');

                var colNames = ['', 'Nombre', 'Código', 'Operación', 'Tipo', 'Orígen', 'Destino', 'OP', 'Tipo de cuenta'];
                var colModel: any[] = [
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
                    { name: 'name', index: 'name', search: false },
                    { name: 'code', index: 'code', search: false },
                    { name: 'operation', index: 'operation', search: false, formatter: loanConceptOperationsFormatter },
                    { name: 'type', index: 'type', search: false, formatter: loanConceptTypesFormatter },
                    { name: 'source', index: 'source', search: false, formatter: loanConceptSourcesFormatter },
                    { name: 'applyTo', index: 'applyTo', search: false, formatter: loanConceptApplyTosFormatter },
                    { name: 'postDirectPaymentOrder', index: 'postDirectPaymentOrder', width: 40, fixed: true, search: false, formatter: 'checkbox' },
                    { name: 'operatingAccountPostingType', index: 'operatingAccountPostingType', search: false, formatter: operatingAccountPostingTypeFormatter }
                ];

                function loadGrid() {
                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);
                    var url = '/api/loans/concepts';

                    gridElement.jqGrid({
                        regional: 'es-ar',
                        url: url,
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
                        recreateForm: true,
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
                        onCellSelect(rowId, iCol) {
                            if (iCol === 0) {
                                var stateName = 'app.loans.concept';
                                $state.go(stateName, { loanConceptId: rowId });
                                return false;
                            }
                        },
                        loadComplete: () => {
                        }
                    });

                    gridElement.jqGrid('navGrid',
                        '#' + pagerElementName,
                        {
                            del: false,
                            add: false,
                            edit: false
                        },
                        {},
                        {},
                        {},
                        { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');
                }

                scope.height = scope.height || 450;
                function loadData() {
                    var url = '/api/loans/concepts';
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event) => {
                    loadData();
                });

                loadGrid();
            }
        };
    })
    .controller('LoanConceptApplicationsController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };
    }
    ])
    .controller('LoanConceptApplicationController', ($log, $scope: any, $translate, $stateParams, $state, $filter, $window, Restangular, dialogs, FileUploader, toastr, $http) => {
        var id = $stateParams.loanId;
        $scope.loan = {};
        $scope.loan.id = id;
        $scope.serviceUrl = 'loans/loans/' + id + '/messages';

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/loans/loans/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false,
        });

        $scope.uploader.onCompleteAll = () => {
            Restangular.one('loans').one('loans', id).one('files').get().then(result => {
                $scope.loan.files = result.results;
            });
        };

        $scope.openFile = (file) => {
            $window.open('api/loans/loans/' + id + '/files/' + file.guid);
        };

        $scope.$on('reloadMessages', (event, messages) => {
            $scope.loan.messages = messages;
        });

        $scope.submitForAuthorization = () => {
            Restangular.service('loans/loans/' + $scope.loan.guid + '/submitforauthorization').post({}).then((result) => {
                toastr.success('Se ha iniciado el proceso de autorización de la solicitud.', 'Editor de solicitudes de préstamo');
                $state.go('app.loans.loans');
            });
        };

        $scope.save = () => {
            $scope.loan
                .put({ LoanId: $scope.loan.id, VoidDate: $scope.loan.installmentFirstVoidDate })
                .then(() => {
                    $scope.$broadcast('loadData');
                });
        };

        function load() {
            if (id) {
                Restangular.one('loans').one('loans', id).get().then(loan => {
                    $scope.loan = loan;
                    $scope.loan.netAmount = $scope.loan.amount - $scope.loan.expenses;
                    $http.get('/api/loans/loanstatus.json')
                        .then((status) => {
                            var loanStatus = status.data;
                            $scope.loan.status = loanStatus[$scope.loan.status].toLowerCase();

                            var installments = angular.copy($scope.loan.installments);
                            var itemsCuota = _.filter($scope.loan.items, (item: any) => { return item.concept.applyTo === 1 && item.value !== 0; });

                            _.forEach(installments,
                                (installment: any) => {
                                    var totalInstallment = installment.amount;

                                    _.forEach(itemsCuota,
                                        (itemCuota: any) => {
                                            switch (itemCuota.concept.operation) {
                                                case 1:
                                                    totalInstallment = totalInstallment + itemCuota.value;
                                                    break;
                                                case 2:
                                                    totalInstallment = totalInstallment - itemCuota.value;
                                                    break;
                                                case 3:
                                                    totalInstallment = totalInstallment * itemCuota.value;
                                                    break;
                                                case 4:
                                                    totalInstallment = totalInstallment / itemCuota.value;
                                                    break;
                                            };
                                            installment['c' + itemCuota.id] = itemCuota.value;
                                        });

                                    installment.total = totalInstallment;
                                });

                            $scope.itemsCuota = itemsCuota;
                            $scope.installments = installments;
                        });

                });
            } else {
                $scope.loan = {};
            }
        }

        function getItemValue(loan, installment, item) {
            // fixed
            if (item.concept.type === 0) {
                return item.value;
            }

            // percentage
            if (item.concept.type === 1) {
                switch (item.concept.source) {
                    case 0: // capital
                        installment.amount
                        break;
                    case 1: // cuota
                        break;
                    case 2: // concept
                        break;
                }
            }
        }

        load();

    })
    .directive('loansLoanConceptApplicationsGrid', ($log, $state, $filter, $compile, $http) => {
        return {
            restrict: 'A',
            scope: { height: '@', module: '=?', personId: '=' },
            link(scope: any, element, attrs, ctrl) {

                function toSearchOptions(statusEnum) {
                    var options = [];
                    options.push(":Todos");
                    for (var index = 0; index < statusEnum.length; ++index) {
                        options.push(statusEnum[index].id + ':' + statusEnum[index].name);
                    }

                    return options.join(";");
                }

                function toSearchOptionsHtml(statusEnum, id) {
                    var options = '<option value="">Todos</option>';

                    for (status in statusEnum) {
                        var key = 'lns.' + statusEnum[status].toLowerCase();
                        var statusName = $filter('translate')(key);
                        var selected = '';
                        if (id == status) {
                            selected = 'selected';
                        }
                        options += '<option value="' + status + '" ' + selected + '>' + statusName + '</option>';
                    }

                    return options;
                }

                function currencyFormatter(cellvalue, options, rowObject) {
                    var value = parseFloat(cellvalue);
                    return $filter('currency')(value);
                }

                function documentNumberFormatter(cellvalue, options, rowObject) {
                    return $filter('documentNumber')(cellvalue);
                }

                function rolesFormatter(cellvalue, options, rowObject) {
                    if (rowObject.roles) {
                        return rowObject.roles.join();
                    }
                    return null;
                }

                function loanStatusFormatter(cellvalue: any, options: any, rowObject: any) {
                    var key = 'lns.' + loanStatus[cellvalue].toLowerCase();
                    return $filter('translate')(key);
                }

                var loanStatus = [];

                var gridElementName = 'loansLoansGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');

                var colNames = ['', 'Producto', 'Número', 'Fecha Solicitud', 'Vendedor', 'Cliente', 'Monto Solicitado', 'Q Cuotas', 'Cuota', 'Estado', 'Responsable'];
                var colModel: any[] = [
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
                    { name: 'productName', index: 'productName', search: true },
                    { name: 'number', index: 'number', search: true, width: 100, align: 'right', fixed: true },
                    {
                        name: 'date', index: 'date_', search: true, formatter: 'date', fixed: true, width: 90,
                        searchoptions: {
                            dataInit: (elem) => {
                                //var datePicker = $compile('<div id="documentDate" data-date-picker-filter="" style="overflow: visible; position: relative;"></div>')(scope);
                                //angular.element(elem).replaceWith(datePicker);
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    { name: 'sellerName', index: 'sellerName', search: true, width: 110 },
                    { name: 'applicantName', index: 'applicantName', search: true, width: 140 },
                    { name: 'amount', index: 'amount', search: true, fixed: true, width: 90, formatter: 'currency', formatoptions: { prefix: '$', decimalPlaces: 2 }, align: 'right' },
                    { name: 'term', index: 'term', search: true, fixed: true, width: 70 },
                    { name: 'installmentBaseAmount', index: 'installmentBaseAmount', search: true, width: 80, formatter: currencyFormatter, align: 'right' },
                    {
                        name: 'status', index: 'status', search: true, fixed: true, width: 100,
                        formatter: loanStatusFormatter,
                        stype: 'select',
                        searchoptions: { value: toSearchOptions(loanStatus) }
                    },
                    { name: 'roles', index: 'roles', search: true, width: 95, fixed: true, sortable: false }
                ];

                function loadGrid() {

                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);
                    var url = '/api/loans/loans';

                    if (scope.personId) {
                        url += '?personId=' + scope.personId;
                    }

                    gridElement.jqGrid({
                        regional: 'es-ar',
                        url: url,
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
                        recreateForm: true,
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
                        onCellSelect(rowId, iCol) {
                            if (iCol === 0) {
                                var stateName = 'app.loans.loan';
                                $state.go(stateName, { loanId: rowId });
                                return false;
                            }
                        },
                        loadComplete: () => {
                            $("#gs_status").html(toSearchOptionsHtml(loanStatus, $("#gs_status").val()));

                            var amountSum = gridElement.jqGrid('getCol', 'amount', false, 'sum');
                            gridElement.jqGrid('footerData', 'set', {
                                amount: amountSum
                            });
                        }
                    });

                    gridElement.jqGrid('navGrid',
                        '#' + pagerElementName,
                        {
                            del: false,
                            add: false,
                            edit: false
                        },
                        {},
                        {},
                        {},
                        { multipleSearch: false });
                    gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                    gridElement.jqGrid('bindKeys');
                }

                scope.height = scope.height || 450;
                $http.get('/api/loans/loanstatus.json')
                    .then((status) => {
                        loanStatus = status.data;
                        loadGrid();
                    });

                function loadData() {
                    var url = '/api/loans/loans';

                    if (scope.personId) {
                        url += '?personId=' + scope.personId;
                    }
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event, personId) => {
                    if (personId) {
                        scope.personId = personId;
                        loadData();
                    }
                });
            }
        };
    });