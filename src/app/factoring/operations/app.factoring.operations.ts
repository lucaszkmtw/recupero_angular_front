angular.module('app.factoring.operations', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.factoring.operations',
            {
                url: '/operations',
                controller: 'OperationsController',
                templateUrl: 'app/factoring/operations/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'factoring.operations',
                    parent: 'app.factoring'
                }
            })
            .state('app.factoring.operation', {
                url: '/operations/{operationId}',
                controller: 'OperationController',
                templateUrl: 'app/factoring/operations/view.html',
                resolve: loadSequence('angularFileUpload', 'toastr'),
                ncyBreadcrumb: {
                    label: 'factoring.operation',
                    parent: 'app.factoring.operations'
                }
            });
    }])
    .controller('OperationsController', ['$scope', '$stateParams', '$translate', '$state', 'Restangular', ($scope ,$stateParams, $translate, $state, toastr, Restangular) => {
        $scope.params = {
            selectedItems: []
        };
     
    }])
    .controller('OperationController', ($scope: any, $translate, $stateParams, $state, $filter, $window, Restangular, dialogs, FileUploader, toastr, $http) => {

        var id = $stateParams.operationId;
        var messagesServiceUrl = '/data/factoring/operation/' + id + '/messages';
        var filesUrl = '/data/factoring/operation/' + id + '/files';

        $scope.save = () => {
            console.log('@todo: save operation');
        };

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/loans/loans/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false,
        });

        function loadOperation(operationId) {
            if (operationId) {
                $scope.operation = {
                    id: operationId,
                    product: "some product",
                    client: "Some client name",
                    operationAmount: 35706,
                    instruments: "3",
                    creationDate: "2017-10-10",
                    liquidationDate: "2017-10-10",
                    originator: "Originator name",
                    operator: "Operator name",
                    manager: "Manager name",
                    custodian: "Custodian name",
                    status: "some status",
                    responsible: "Some responsible name"
                };
            } else {
                $scope.operation = {};
            }

            $scope.operation.messages = [];

            console.log($scope.operation);
        }

        loadOperation(id);

    })
    .directive('factoringOperationsGrid', ($log, $state, $filter, $compile, $http) => {
        return {
            restrict: 'A',
            scope: { height: '@', operationId: '=' },
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

                var gridElementName = 'factoringOperationsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');

                var colNames = ['', 'Producto', 'Cliente', 'Monto operación', 'Instrumentos', 'Fecha Alta', 'Fecha Liquidación', 'Originador', 'Operador', 'Gestor', 'Custodio', 'Estado', 'Responsable'];
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
                    { name: 'product', index: 'product', search: true },
                    { name: 'client', index: 'client', search: true, width: 100, align: 'right', fixed: true },
                    { name: 'operationTotal', index: 'operationTotal', formatter: currencyFormatter, search: true, width: 100, align: 'right', fixed: true },
                    { name: 'instruments', index: 'instruments', search: true, width: 100, align: 'right', fixed: true },
                    {
                        name: 'creationDate', index: 'creationDate', search: true, formatter: 'date', fixed: true, width: 90,
                        searchoptions: {
                            dataInit: (elem) => {
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    {
                        name: 'liquidationDate', index: 'liquidationDate', search: true, formatter: 'date', fixed: true, width: 90,
                        searchoptions: {
                            dataInit: (elem) => {
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    { name: 'originator', index: 'originator', search: true, width: 110 },
                    { name: 'operator', index: 'operator', search: true, width: 140 },
                    { name: 'manager', index: 'manager', search: true, fixed: true, width: 90 },
                    { name: 'custodian', index: 'custodian', search: true, fixed: true, width: 70 },
                    { name: 'status', index: 'status', search: true, width: 80, align: 'right' },
                    { name: 'responsible', index: 'responsible', search: true, width: 95, fixed: true }
                ];

                function loadGrid() {

                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);
                    var url = '/app/factoring/data/operations.json';

                    if (scope.operationId) {
                        url += '?operationId=' + scope.operationId;
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
                            console.log('rowId', rowId);
                            console.log('iCol', iCol);
                            if (iCol === 0) {
                                $state.go('app.factoring.operation', { operationId: rowId });
                                return false;
                            }
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
                $http.get('/app/factoring/api/operations.json')
                    .then((status) => {
                        loadGrid();
                    });

                function loadData() {
                    var url = '/app/factoring/api/operations.json';

                    if (scope.personId) {
                        url += '?operationId=' + scope.operationId;
                    }
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event, operationId) => {
                    if (operationId) {
                        scope.operationId = operationId;
                        loadData();
                    }
                });
            }
        };
    });
