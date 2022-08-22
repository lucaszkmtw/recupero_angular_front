angular.module('app.financials.bankaccounts', ['app.financials'])
    .config(($stateProvider) => {
        $stateProvider
            .state('app.financials.bankaccounts',
            {
                url: '/bankaccounts',
                controller: 'FinancialsBankAccountsListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/financials/bankaccounts/list.html',
                ncyBreadcrumb: {
                    label: 'financials.bankaccounts'
                }
            })
            .state('app.financials.bankaccountnew',
            {
                url: '/bankaccounts/new',
                controller: 'FinancialsBankAccountEditController',
                templateUrl: 'app/financials/bankaccounts/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.bankaccounts',
                    label: 'financials.bankaccount.new'
                }
            })
            .state('app.financials.bankaccountedit',
            {
                url: '/bankaccounts/{bankAccountId}',
                controller: 'FinancialsBankAccountEditController',
                templateUrl: 'app/financials/bankaccounts/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.financials.bankaccounts',
                    label: 'financials.bankaccount.edit'
                }
            });
    })
    .controller('FinancialsBankAccountsListController', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.financials.bankaccountnew');
        }
    })
    .controller('FinancialsBankAccountEditController', ($scope: any, $rootScope, $translate, $stateParams, $state, Restangular, session) => {
        $scope.bankaccount = {
            id: 0,
            personId: 0,
            code: '',
            number: '',
            description: '',
            bankBranchId: '',
            currencyId: ''
        };


        var id = $stateParams.bankAccountId;

        function load() {
            if (id) {
                Restangular.one('financials').one('bankaccounts', id).get().then(result => {
                    var bankaccount = result;
                    $scope.bankaccount = bankaccount;
                });
            }
            else {
                //$scope.bankaccount = {
                //    personId: $rootScope.session.tenant.personId
                //};
            }
        }

        $scope.save = () => {
            console.log( $scope.bankaccount );
            if (id) {
                $scope.bankaccount.put().then(() => { $state.go('app.financials.bankaccounts'); });
            } else {
                Restangular.service('financials/bankaccounts').post($scope.bankaccount).then(() => { $state.go('app.financials.bankaccounts'); });
            }
        }

        load();
    })
    .directive('financialsBankAccountsGrid', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', personId: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'financialsBankAccountsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['','Titular', 'Sucursal Bancaria', 'Moneda', 'CBU', 'Número'];
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
                    { name: 'personName', index: 'personName', search: false },
                    { name: 'bankBranchName', index: 'bankBranchName', search: false },
                    { name: 'currencyName', index: 'currencyName', search: false },
                    { name: 'code', index: 'codeContains', search: true },
                    { name: 'number', index: 'numberContains', search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/financials/bankaccounts.json',
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
                            var stateName = 'app.financials.bankaccountedit';
                            $state.go(stateName, { bankAccountId: rowId });
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
