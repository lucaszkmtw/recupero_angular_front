angular.module('app.factoring.inquiries.clients', [])
   .config(['$stateProvider', $stateProvider => {
        $stateProvider
        .state('app.factoring.inquiries.clients', {
            url: '/clients',
            controller: 'inquiriesClientsController',
            templateUrl: 'app/factoring/inquiries/clients/list.html',
            resolve: loadSequence('jqueryui', 'ui.footable', 'jqGrid'),
            ncyBreadcrumb: {
                label: 'factoring.inquiries.clients',
                parent: 'app.factoring.inquiries'
            }
        })
        .state('app.factoring.inquiries.client', {
            url: '/clients/{clientId}',
            controller: 'inquiriesClientController',
            templateUrl: 'app/factoring/inquiries/clients/view.html',
            resolve: loadSequence('jqueryui', 'ui.footable'),
            ncyBreadcrumb: {
                label: 'factoring.inquiries.client',
                parent: 'app.factoring.inquiries.clients'
            }
        });
    }])
    .controller('inquiriesClientsController', ['$scope', '$stateParams', '$translate', '$state', 'Restangular', ($scope ,$stateParams, $translate, $state, toastr, Restangular) => {
    }])
    .controller('inquiriesClientController', ['$scope', '$stateParams', '$translate', '$state', 'Restangular', ($scope ,$stateParams, $translate, $state, toastr, Restangular) => {
        var id = $stateParams.clientId;

        function loadClient(clientId) {
            if (clientId) {
                $scope.client = { 
                    personId: 35706,
                    personCode: "30707735976",
                    personName: "Big Bloom S.A.",
                    porfolio:[],
                    actualposition:[],
                    limits:[], 
                    profitability: [],
                    expobpay:[]
                };
            } else {
                $scope.client = {}
            }
        }

        $scope.viewlistclients = () => {
              $state.go("app.factoring.inquiries.clients");
        }

        loadClient(id);
    }])
    .directive('actualPosition', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  actualpositionInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/clients/actual-position.html',
            link(scope: any, element) {
              
            }
        };
    }])
    .directive('checkLimits', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  limitsInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/clients/check-limits.html',
            link(scope: any, element) {
            }
        };
    }])
    .directive('checkProfitability', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  clientInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/clients/check-profitability.html',
            link(scope: any, element) {
            }
        };
    }])
    .directive('inquiriesClientsGrid', ($state, $filter, Restangular, authManager) => {
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

                   function currencyFormatter(cellvalue, options, rowObject) {
                    var value = parseFloat(cellvalue);
                    var content = $filter('currency')(value)
                    if (value < 0) {
                        content = '<span style="color:red">' + content + '</span>'
                    }
                    return content;
                }
              var colNames = ['', 'Número', 'Nombre', 'CUIT','Telefono','Email','Límite Crédito', 'Total Cartera','Margen Disponible'];
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
                    { name: 'personName', index: 'personNameContains', search: true , fixed: true },
                    { name: 'personCode', index: 'personCodeContains', fixed: true, search: true } ,
                     { name: 'personPhone', index: 'personPhone',fixed: true, search: true },
                     { name: 'personEmail', index: 'personEmail',fixed: true, search: true },
                      { name: 'totalPortfolio', index: 'totalPortfolio', fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: true  },
                    { name: 'totalPortfolio', index: 'totalPortfolio', fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: true  },
                  { name: 'marginAvailable', index: 'marginAvailable',fixed: true, search: true, formatter: currencyFormatter, align: 'right', sortable: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/app/factoring/data/inquiries/businesspartners.json',
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
                            $state.go('app.factoring.inquiries.client', { clientId: rowId });
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
    .directive('expObPay', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  obtopayInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/clients/exp-ob-pay.html',
            link(scope: any, element) {
            }
        };
    }])
    .directive('historicalExposition', ['$log', '$rootScope', '$state', 'Restangular', ($log, $rootScope, $state, Restangular) => {
        return {
            restrict: 'A',
            scope: { height: '@',  obtopayInstance: '=ngModel', serviceUrl: '=' },
            templateUrl: 'app/factoring/inquiries/clients/historical.html',
            link(scope: any, element) {
            }
        };
    }]);