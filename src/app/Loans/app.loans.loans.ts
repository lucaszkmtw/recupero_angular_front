angular.module('app.loans.loans', ['app.core', 'app.loans'])
.config(['$stateProvider', $stateProvider => {
    $stateProvider
        .state('app.loans.loans',
        {
            url: '/loans',
            controller: 'LoansController',
            templateUrl: 'app/loans/list.html',
            resolve: loadSequence('jqueryui', 'jqGrid'),
            ncyBreadcrumb: {
                label: 'lns.loans',
                parent: 'app.loans'
            }
        })
        .state('app.loans.loan',
        {
            url: '/loans/{loanId}',
            controller: 'LoanController',
            templateUrl: 'app/loans/view.html',
            resolve: loadSequence('select2', 'dialogs.main', 'angularFileUpload', 'icheck', 'toastr', 'jqGrid', 'dialogs.main'),
            ncyBreadcrumb: {
                label: 'lns.loan',
                parent: 'app.loans.loans'
            }
        });
}
])
.factory('loanPersonRoles', ['$rootScope', $rootScope => {
    var roles = [
        { id: 0, name: 'collector' },
        { id: 1, name: 'administrator' },
        { id: 2, name: 'investor' },
        { id: 3, name: 'liquidator' },
        { id: 4, name: 'portfolioholder' },
        { id: 5, name: 'applicant' },
        { id: 6, name: 'seller' }
    ];
    return roles;
}])
.controller('LoansController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
    $scope.params = {
        selectedItems: []
    };
}
])
.controller('LoanController', ($log, $scope: any, $translate, $stateParams, $state, $filter, $window, $sce, Restangular, dialogs, FileUploader, toastr, $http, loanPersonRoles) => {
    var id = $stateParams.loanId;
    $scope.loanId = id;
    $scope.loan = null;
    $scope.settlementValidation = {
        errors: [],
        result: true
    };
    $scope.serviceUrl = 'loans/loans/' + id + '/messages';

    $scope.canApprove = () => {
        if ($scope.loan && $scope.loan.authorizationWorkflowInstance) {
            if ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 149) {
                return $scope.loan.isSettled;
            }

            if ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 150) {
                return false;
            }

            return true;
        }

        return false;
    };

    $scope.canGoBack = () => {
        if ($scope.loan && $scope.loan.authorizationWorkflowInstance) {
            if ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 150) {
                return false;
            }

            if ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId === 151) {
                return false;
            }

            return true;
        }

        return true;
    };

    $scope.uploader = new FileUploader({
        scope: $scope,
        url: API_HOST + '/api/loans/loans/' + id + '/files',
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
        $window.open(API_HOST +'api/loans/loans/' + id + '/files/' + file.guid);
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

    $scope.reload = () => {
        load();
    };

    function roundNum(num, length) {
        var number = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
        return number;
    }

    function load() {
        if (id) {
            Restangular.one('loans').one('loans', id).get().then(loan => {
                $scope.loan = loan;
                $scope.loan.netAmount = $scope.loan.amount - $scope.loan.expenses;
                $http.get(API_HOST + '/api/loans/loanstatus.json')
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

                        $scope.itemsCapital = _.filter($scope.loan.items, (item: any) => { return item.concept.applyTo === 0 && item.value > 0 });

                        _.forEach($scope.itemsCapital,
                            (item: any) => {
                                if (item.distributions.length === 0) {
                                    var distribution: any = {
                                        type: 0,
                                        loanItemId: item.id,
                                        businessPartnerId: angular.isDefined(item.concept.defaultBusinessPartnerId) ? item.concept.defaultBusinessPartnerId : null,
                                        personRole: angular.isDefined(item.concept.defaultLoanPersonRole) ? item.concept.defaultLoanPersonRole : null,
                                        value: item.concept.type == 0 ? parseFloat(item.value) : parseFloat($scope.loan.netAmount) * parseFloat(item.value) / 100
                                    };

                                    if (distribution.businessPartnerId != null) {
                                        $http.get(`${API_HOST}/api/businesspartners/businesspartners/${distribution.businessPartnerId}`).then((result) => {
                                            distribution.businessPartnerName = result.data.person.name;
                                        });
                                    }

                                    item.distributions.push(distribution);
                                } else {
                                    _.forEach(item.distributions,
                                        (distribution: any) => {
                                            if (distribution.personRole != null) {
                                                distribution.type = 0;
                                            }

                                            if (distribution.businessPartnerId != null) {
                                                $http.get(`${API_HOST}/api/businesspartners/businesspartners/${distribution.businessPartnerId}`).then((result) => {
                                                    distribution.businessPartnerName = result.data.person.name;
                                                });
                                                distribution.type = 1;
                                            }
                                        });
                                }
                            });
                    });

            });
        } else {
            $scope.loan = {};
        }
    }

    $scope.getPersonsByRoleId = (roleId) => {
        if ($scope.loan != null) {
            var loanPersons: any = _.filter($scope.loan.persons, ['role', roleId]);
            return _.map(loanPersons, 'person');
        }
    };

    $scope.getSettlementLabel = () => {
        if ($scope.canSaveSettlement()) {
            if (!$scope.loan.isSettled) {
                return 'Liquidar';
            }
            else {
                return 'Actualizar liquidación';
            }
        }

        return null;
    };

    $scope.getSettlementSubtotal = () => {
        var result = 0.0;
        _.forEach($scope.itemsCapital,
            (itemCapital: any) => {
                _.forEach(itemCapital.distributions,
                    (distribution: any) => {
                        result = result + parseFloat(distribution.value);
                    });
            });
        return result;
    };

    $scope.saveSettlement = () => {
        Restangular.service('/loans/loans/' + $scope.loan.guid + '/settlement').post({ items: $scope.itemsCapital }).then((result) => {
            toastr.success('Liquidación', 'La liquidación se áctualizó correctamente.');
            load();
        }, (error) => {
            toastr.error('Liquidación', 'Hubo un error al actualizar la liquidación.' + error);
        });
    }

    $scope.canSaveSettlement = (): boolean => {
        var model: any = {
            errors: [],
            result: true,
            setError: (error) => {
                model.errors.push(error);
                model.result = false;
            }
        };

        if ($scope.loan && $scope.loan.authorizationWorkflowInstance) {
            if ($scope.loan.authorizationWorkflowInstance.currentWorkflowActivityId >= 150) {
                return false;
            }
        }

        if (!angular.isDefined($scope.loan)
            || $scope.loan == null
            || !angular.isDefined($scope.itemsCapital)
            || $scope.itemsCapital == null) {
            model.setError('InvalidState');
        }

        if (model.result) {
            var subTotal = $scope.getSettlementSubtotal();
            var roundedSubTotal = roundNum(subTotal, 0);
            var roundedNetAmount = roundNum($scope.loan.netAmount, 2);
            var expenses = $scope.loan.expenses;
            var roundedExpenses = roundNum(expenses, 0);

            model.amount = $scope.loan.amount;
            model.netAmount = $scope.loan.netAmount;
            model.roundedNetAmount = roundedNetAmount;
            model.expenses = expenses;
            model.roundedExpenses = roundedExpenses;
            model.subTotal = subTotal;
            model.roundedSubTotal = roundedSubTotal;

            if (Math.abs(roundedSubTotal - roundedExpenses) > 1) {
                model.setError('BadAmount');
            }

            _.forEach($scope.itemsCapital,
                (item: any) => {
                    if (item.distributions.length === 0) {
                        model.setError('item:' + item.id + ': MissingDistribution');
                    }

                    _.forEach(item.distributions,
                        (distribution: any, index) => {
                            if (distribution.businessPartnerId == null && distribution.personRole == null) {
                                model.setError('item:' + item.id + ': distribution:' + index + ': DistributionNotAssigned');
                            }
                        });
                });
        }

        $scope.settlementValidation = model;
        return model.result;
    }

    $scope.getSettlementItemDistributionBeneficiary = (distribution) => {
        if (distribution.businessPartnerId == null && distribution.personRole == null) {
            return $sce.trustAsHtml('<span class="has-error">Falta asignar</span>');
        }

        if (distribution.personRole != null) {
            var role: any = _.find(loanPersonRoles, { id: distribution.personRole });
            if (role != null) {
                var persons = $scope.getPersonsByRoleId(distribution.personRole);
                return persons[0].name + ' (' + $translate.instant('lns.role.' + role.name) + ')';
            }

            return null;
        }

        if (distribution.businessPartnerId != null) {
            return distribution.businessPartnerName;
        }
    };

    $scope.editItem = (item) => {
        var dlg = dialogs.create('app/loans/itemeditmodal.html', 'LoanItemController', { item: item, loan: $scope.loan }, { size: 'lg' });
        dlg.result.then((result) => {
            item.distributions = result.distributions;
        },
            () => { });
    }

    $scope.scores = [];
    var scoringLoaded = false;
    $scope.loadScoring = () => {
        if (!scoringLoaded) {
            loadScores();
        }
    }

    $scope.requestScore = (score) => {
        var clients = $scope.getPersonsByRoleId(5);
        var dlg = dialogs.create('app/loans/scoringmodal.html', 'LoanScoringModalController', { person: clients[0], loan: $scope.loan }, { size: 'lg' });
        dlg.result.then((model) => {
            model.loanLenderId = score.loanLenderId;
            model.personId = clients[0].id;
            model.loanId = $scope.loan.id;
            model.term = $scope.loan.term;

            Restangular.service('loans/scoring').post(model).then(() => {
                toastr.success('Solicitud de Scoring', 'La operación se realizó con éxito.');
                loadScores();
            }, () => {
                toastr.error('Solicitud de Scoring', 'Se produjo un error en la operación.');
            });
        },
            () => { });
    };

    function loadScores() {
        var url = `loans/loans/${$scope.loan.guid}/scoring`;
        Restangular.one('loans').one('loans', $scope.loan.guid).customGET('scoring').then((response) => {
            $scope.scores = response.results;
            var scoringLoaded = true;
        });
    }

    load();

})
.controller('LoanScoringModalController', ['$log', '$scope', '$translate', 'Restangular', 'toastr', '$uibModalInstance', 'loanPersonRoles', 'data',
    ($log,
        $scope: any,
        $translate,
        Restangular,
        toastr,
        $uibModalInstance,
        loanPersonRoles,
        data) => {

        $scope.person = data.person;
        $scope.employee = data.employee;

        $scope.item = {
            nombre: $scope.person ? $scope.person.name : null,
            fechaNacimiento: data.person && data.person.birthDate ? moment(data.person.birthDate).format('DD/MM/YYYY') : null,
            sexo: getSexo(),
            codigoPostal: getCodigoPostal(),
            localidad: getLocalidad(),
            importeIngresos: getImporteIngresos(),
            constanciaIngresos: 'S',
            nacionalidad: 'S',
            esCliente: 'N',
            producto: '4',
            subproducto: '10P',
            loanLenderId: 1, //Banco de comercio
            personId: data.person.id,
            loanId: null,
            term: 0,
        };

        function getCodigoPostal() {
            if ($scope.person && $scope.person.addresses.length > 0) {
                var address = $scope.person.addresses[0].address;
                return address.zipCode;
            }

            return null;
        }

        function getLocalidad() {
            if ($scope.person && $scope.person.addresses.length > 0) {
                var address = $scope.person.addresses[0].address;
                return address.place.name;
            }

            return null;
        }

        function getImporteIngresos() {
            if ($scope.employee) {
                return $scope.employee.salary;
            }

            return null;
        }

        function getSexo() {
            if ($scope.person && $scope.person.gender) {
                switch ($scope.person.gender) {
                    case 0:
                        return 'F';
                    case 1:
                        return 'M';
                }
            }

            return null;
        }

        $scope.calculateInstallment = () => {
            if ($scope.item.importeIngresos) {
                var importeIngresos = parseFloat($scope.item.importeIngresos);
                $scope.item.importeCuota = importeIngresos * .3;
            }
        }

        $scope.ok = () => {
            $uibModalInstance.close($scope.item);
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }

        if (data.person.code) {
            $scope.item.tipoDocumento = '9';
            $scope.item.nroDoc = data.person.code;
        }
        else {
            $scope.item.tipoDocumento = '3';
        }

        if ($scope.item.importeIngresos) {
            $scope.calculateInstallment();
        }
    }])
.controller('LoanItemController', ['$log', '$scope', '$translate', 'Restangular', 'toastr', '$uibModalInstance', 'loanPersonRoles', 'data',
    ($log,
        $scope: any,
        $translate,
        Restangular,
        toastr,
        $uibModalInstance,
        loanPersonRoles,
        data) => {
        var types = [{ id: 0, name: 'Rol' }, { id: 1, name: 'Persona' }];

        resetNewDistribution();
        $scope.item = angular.copy(data.item);

        function resetNewDistribution() {
            $scope.newDistribution = {
                type: 0,
                businessPartnerId: null,
                personRole: null
            };
        }

        $scope.getPersonsByRoleId = (roleId) => {
            if (data.loan != null) {
                var loanPersons: any = _.filter(data.loan.persons, ['role', roleId]);
                return _.map(loanPersons, 'person');
            }
        };

        $scope.loanPersonRoles = _.forEach(angular.copy(loanPersonRoles), (personRole: any) => {
            var persons = $scope.getPersonsByRoleId(personRole.id);
            personRole.name = persons[0].name + ' (' + $translate.instant('lns.role.' + personRole.name) + ')';
        });

        $scope.getDistributionTypeName = (typeId) => {
            var type = _.find(types, { id: typeId });
            if (type != null) {
//                return type.name;
            } else {
                $log.info('Type' + typeId + ' not found.');
            }
        };

        $scope.addDistribution = () => {
            $scope.item.distributions.push($scope.newDistribution);
            resetNewDistribution();
        };

        $scope.removeDistribution = (distribution) => {
            var index = $scope.item.distributions.indexOf(distribution);
            $scope.item.distributions.splice(index, 1);
        };

        $scope.isValidDistribution = (distribution) => {
            var isValid = angular.isDefined(distribution.value);
            switch (distribution.type) {
                case 0:
                    isValid = isValid &&
                        angular.isDefined(distribution.personRole) &&
                        distribution.personRole != null;
                    break;
                case 1:
                    isValid = isValid &&
                        angular.isDefined(distribution.businessPartnerId) &&
                        distribution.businessPartnerId != null;
                    break;
            }

            return isValid;
        };

        $scope.ok = () => {
            $uibModalInstance.close($scope.item);
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    }])
.directive('loansLoansGrid', ($log, $state, $filter, $compile, $http, authManager) => {
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
                    var key = 'lns.status.' + statusEnum[status].toLowerCase();
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
                var key = 'lns.status.' + loanStatus[cellvalue].toLowerCase();
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
                var url = API_HOST + '/api/loans/loans';

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
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
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
            $http.get(API_HOST + '/api/loans/loanstatus.json')
                .then((status) => {
                    loanStatus = status.data;
                    loadGrid();
                });

            function loadData() {
                var url = API_HOST + '/api/loans/loans';

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
})
.directive('loansLoanInstallmentsGrid', ($log, $state, $filter, $compile, $http, loanInstallmentService) => {
    return {
        restrict: 'A',
        scope: { height: '@', selectedItems: '=?', loanId: '=' },
        link(scope: any, element, attrs, ctrl) {

            function statusFormatter(cellvalue: any, options: any, rowObject: any) {
                return loanInstallmentService.getStatusTypeName(rowObject.stateId);
            }

            /*function currencyFormatter(cellvalue, options, rowObject) {
                var value = parseFloat(cellvalue);
                return $filter('currency')(value);
            }*/

            var loanStatus = [];

            var gridElementName = 'loansLoanInstallmentsGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement = angular.element('<table></table>');

            var colNames = ['Número', 'Capital', 'Intereses', 'IVA', 'Cuota Pura', 'Estado', 'Fecha Vencimiento', 'Saldo'];
            var colModel: any[] = [
                { name: 'number', index: 'number', sortable: false, search: false, fixed: true, width: 100, align: 'center' },
                { name: 'capital', index: 'capital', sortable: false, search: false, fixed: true, width: 100, formatter: 'currency', formatoptions: { prefix: '$', decimalPlaces: 4 }, align: 'right' },
                { name: 'interests', index: 'interests', sortable: false, search: false, fixed: true, width: 100, formatter: 'currency', formatoptions: { prefix: '$', decimalPlaces: 4 }, align: 'right' },
                { name: 'taxes', index: 'taxes', sortable: false, search: false, fixed: true, width: 100, formatter: 'currency', formatoptions: { prefix: '$', decimalPlaces: 4 }, align: 'right' },
                { name: 'amount', index: 'amount', sortable: false, search: false, fixed: true, width: 100, formatter: 'currency', formatoptions: { prefix: '$', decimalPlaces: 4 }, align: 'right' },
                { name: 'stateId', index: 'stateId', sortable: false, search: false, fixed: true, width: 100, formatter: statusFormatter },
                { name: 'voidDate', index: 'voidDate', sortable: false, search: false, fixed: true, formatter: 'date' },
                { name: 'balance', index: 'balance', sortable: false, search: false, fixed: false, width: 100, formatter: 'currency', formatoptions: { prefix: '$', decimalPlaces: 4 }, align: 'right' }
            ];

            function loadGrid() {

                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/loans/loans/' + scope.loanId + '/installments',
                    datatype: 'json',
                    height: scope.height,
                    shrinkToFit: true,
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
                    userDataOnFooter: false,
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
                    },
                    loadComplete: () => {

                        var capitalSum = gridElement.jqGrid('getCol', 'capital', false, 'sum');
                        var interestsSum = gridElement.jqGrid('getCol', 'interests', false, 'sum');
                        var taxesSum = gridElement.jqGrid('getCol', 'taxes', false, 'sum');
                        var amountSum = gridElement.jqGrid('getCol', 'amount', false, 'sum');
                        gridElement.jqGrid('footerData', 'set', {
                            capital: capitalSum,
                            interests: interestsSum,
                            taxes: taxesSum,
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
                //gridElement.jqGrid('filterToolbar', { autosearch: false, searchOperators: false });
                gridElement.jqGrid('bindKeys');
            }

            scope.height = scope.height || 450;
            /*$http.get('/api/loans/loanstatus.json')
                .then((status) => {
                    loanStatus = status.data;
                    loadGrid();
                });*/
            loadGrid();

            scope.$on('loadData', (event, personId) => {
                gridElement.trigger('reloadGrid');
            });
        }
    };
})
.service('loanInstallmentService', () => {
    var statusTypes: Array<IHasIdAndName> = [
        {
            id: 0,
            name: 'SIMULADA'
        },
        {
            id: 1,
            name: 'PENDIENTE'
        },
        {
            id: 2,
            name: 'CANCELADA PARCIALMENTE'
        },
        {
            id: 3,
            name: 'CANCELADA'
        },
        {
            id: 4,
            name: 'VENCIDA'
        },
    ];

    return {
        statusTypes: statusTypes,
        getStatusTypeName: (id: number) => {
            var statusType: IHasIdAndName = _.find(statusTypes, { id: id });
            return statusType.name;
        }
    }

});