angular.module('app.investments.managers',[])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.investments.managers', {
                url: '/managers',
                controller: 'InvestmentsManagersListController',
                templateUrl: 'app/investments/managers/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'investments.managers'
                }
            })
            .state('app.investments.manager', {
                url: '/managers/new',
                controller: 'InvestmentsmanagerEditController',
                templateUrl: 'app/investments/managers/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.managers',
                    label: 'investments.manager.new'
                }
            })
            .state('app.investments.manageredit', {
                url: '/managers/{managerId}',
                controller: 'InvestmentsmanagerEditController',
                templateUrl: 'app/investments/managers/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.investments.managers',
                    label: 'investments.manager'
                }
            })
            .state('app.investments.managercheckingaccount', {
                url: '/checkingaccount/{businessPartnerAccountId}',
                controller: 'InvestmentsManagerCheckingAccountController',
                templateUrl: 'app/investments/managers/checkingaccount.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.investments.managers',
                    label: 'investments.managers.checkingaccount'
                }
            })
            ;

    }
    ])
    .controller('InvestmentsManagersListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.investments.manager');
        }
    }
    ])
    .controller('InvestmentsmanagerEditController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', 'toastr', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {
        var id = $stateParams.managerId;

        function load() {
            if (id) {
                Restangular.one('investments').one('managers', id).get().then(result => {
                    $scope.manager = result;
                });
            }
            else {
                $scope.manager = {
                    // Preguntar como debe ser con trader
                    businessPartner: {
                        typeId: 1  // Preguntar cual es
                    }
                };
            }
        }

        $scope.delete = () => {


            toastr.success("<button type='button' id='confirmationRevertYes'>Yes</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.manager.remove().then(() => {
                            toastr.success('Se ha dado de baja el gestor con éxito.', 'Editor de Gestores');
                            $state.go('app.investments.managers');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el gestor.', 'Editor de Gestores');
                        });
                    });
                    }
            });
        }

        $scope.save = () => {
            if (id) {
                $scope.manager.put().then(() => { $state.go('app.investments.managers'); });
            } else {
                Restangular.service('investments/managers').post($scope.manager).then(() => { $state.go('app.investments.managers'); });
                toastr.success('Se ha dado de alta el gestor con éxito.', 'Editor de Gestores');
            }
        }
        $scope.viewCheckingAccount = function (id) {
            $state.go("app.investments.managercheckingaccount", { businessPartnerAccountId: id });
        }

        load();
    }
    ])

    .controller('InvestmentsManagerCheckingAccountController', ['$scope', '$translate', '$state', '$stateParams', 'Restangular', '$log', ($scope, $translate, $state, $stateParams, Restangular, $log) => {
        var id = $stateParams.businessPartnerAccountId;
        $scope.accountId = id;

        function load() {
            if (id) {



                //TO DO
                Restangular.one('businesspartners').one('account', id).get().then(result => {
                    $scope.account = result;
                });
            }
        }

        load();
    }
    ])
    .directive('investmentsManagersGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'investmentsManagersGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre y Apellido', 'Cuentas', 'Saldo', 'Tenencias Valorizadas'];
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
                    { name: 'personName', index: 'personNameContains', search: true },
                    { name: 'accounts', index: 'accountsContains', width: 190, fixed: true, search: true },
                    { name: 'Balance', index: 'balanceContains', width: 100, fixed: true, search: true },
                    { name: 'BalanceofPayments', index: 'balanceofPaymentsContains', width: 100, fixed: true, search: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/investments/managers.json',
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
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.investments.manageredit';
                            $state.go(stateName, {managerId: rowId });
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