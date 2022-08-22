angular.module('app.health.patients', ['app.core', 'app.health'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.patients', {
                url: '/patients',
                controller: 'HealthPatientsListController',
                templateUrl: 'app/health/patient/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.patients'
                }
            })
            .state('app.health.patientnew', {
                url: '/patients/new',
                controller: 'HealthPatientEditController',
                templateUrl: 'app/health/patient/edit.html',
                resolve: loadSequence('icheck'),
                ncyBreadcrumb: {
                    parent: 'app.health.patients',
                    label: 'health.patient.new'
                }
            })
            .state('app.health.patientedit', {
                url: '/patients/{patientId}/edit',
                controller: 'HealthPatientEditController',
                templateUrl: 'app/health/patient/edit.html',
                resolve: loadSequence('icheck'),
                ncyBreadcrumb: {
                    parent: 'app.health.patients',
                    label: 'health.patient'
                }
            })
            .state('app.health.patient', {
                url: '/patients/{patientId}',
                controller: 'HealthPatientViewController',
                templateUrl: 'app/health/patient/view.html',
                resolve: loadSequence('ui.router.tabs'),
                ncyBreadcrumb: {
                    parent: 'app.health.patients',
                    label: 'health.patient'
                }
            })
            .state('app.health.patient.info', {
                url: '/info',
                templateUrl: 'app/health/patient/view.info.html',
                ncyBreadcrumb: {
                    parent: 'app.health.patients',
                    label: 'health.patient'
                }
            })
            .state('app.health.patient.clinicalhistory', {
                url: '/clinicalhistory',
                controller: 'HealthPatientClinicalHistoryController',
                templateUrl: 'app/health/patient/view.clinicalhistory.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.health.patient',
                    label: 'health.patient.clinicalhistory'
                }
            })
            .state('app.health.patient.messages', {
                url: '/messages',
                templateUrl: 'app/health/patient/view.messages.html',
                ncyBreadcrumb: {
                    parent: 'app.health.patient',
                    label: 'health.patient.messages'
                }
            })
            .state('app.health.patient.claims', {
                url: '/claims',
                controller: 'HealthPatientClaimsController',
                templateUrl: 'app/health/patient/view.claims.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.health.patient',
                    label: 'health.patient.claims'
                }
            })
            .state('app.health.patient.documents', {
                url: '/documents',
                controller: 'HealthPatientDocumentsController',
                templateUrl: 'app/health/patient/view.documents.html',
                ncyBreadcrumb: {
                    parent: 'app.health.patient',
                    label: 'health.patient.claims'
                }
            })
            .state('app.health.patient.formresponses', {
                url: '/formresponses',
                controller: 'HealthPatientFormResponsesController',
                templateUrl: 'app/health/patient/view.formresponses.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.health.patient',
                    label: 'polls'
                }
            });
    }
    ])
    .controller('HealthPatientsListController', ['$scope', '$translate', '$state', ($scope, $translate, $state) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.health.patientnew');
        }
    }
    ])
    .controller('HealthPatientEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'dialogs', ($scope: any, $translate, $stateParams, $state, Restangular, dialogs) => {

        var id = $stateParams.patientId;

        function load() {
            if (id) {
                Restangular.one('health').one('patients', id).get().then(result => {
                    var patient = result;
                    $scope.patient = patient;
                });
            } else {
                $scope.patient = {
                    personId: null,
                    healthServicePatient: {}
                }
            }
        }

        $scope.patientStatus = [{ id: 0, name: 'Activo' }, { id: 1, name: 'Inactivo' }];

        $scope.editPerson = () => {
            $state.go('app.system.personedit', { personId: $scope.patient.personId });
        };

        $scope.view = () => {
            $state.go('app.health.patient', { patientId: id });
        };

        $scope.save = () => {
            if (id) {
                $scope.patient.put().then(() => { $state.go('app.health.patients'); });
            } else {
                Restangular.service('health/patients').post($scope.patient).then(() => { $state.go('app.health.patients'); });
            }
        }

        load();
    }
    ])
    .controller('HealthPatientViewController', ['$scope', '$translate', '$stateParams', '$state', '$templateCache', 'Restangular', 'dialogs', ($scope: any, $translate, $stateParams, $state, $templateCache, Restangular, dialogs) => {

        var id = $stateParams.patientId;

        $scope.tabData = [
            {
                heading: 'Datos personales',
                route: 'app.health.patient.info'
            },
            {
                heading: 'Historia clínica',
                route: 'app.health.patient.clinicalhistory'
            },/*
                {
                    heading: 'Conversaciones',
                    route: 'app.health.patient.messages'
                },*/
            {
                heading: 'Reclamos',
                route: 'app.health.patient.claims'
            },/*
                {
                    heading: 'Info. financiera',
                    route: 'app.health.patient.finances'
                },
                {
                    heading: 'Llamadas',
                    route: 'app.health.patient.calls'
                },
                {
                    heading: 'Línea de tiempo',
                    route: 'app.health.patient.timeline'
                }*/
            {
                heading: 'Documentos',
                route: 'app.health.patient.documents'
            },
            {
                heading: 'Encuestas',
                route: 'app.health.patient.formresponses'
            }
        ];

        $scope.edit = () => {
            $state.go('app.health.patientedit', { patientId: id });
        };

        function load() {
            if (id) {
                Restangular.one('health').one('patients', id).get().then(result => {
                    var patient = result;
                    $scope.patient = patient;
                    $scope.$broadcast('loaded');
                });
            }
        }

        load();
    }
    ])
    .controller('HealthPatientClinicalHistoryController', ['$log', '$scope', ($log, $scope) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.patient) {
                    $scope.$broadcast('loadData', $scope.patient.id);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.patient.id);
        });
    }])
    .controller('HealthPatientClaimsController', ['$log', '$scope', ($log, $scope) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.patient) {
                    $scope.$broadcast('loadData', $scope.patient.personId);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.patient.personId);
        });
    }])
    .controller('HealthPatientDocumentsController', ['$log', '$scope', '$window', 'Restangular', ($log, $scope, $window, Restangular) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.patient) {
                    getDocuments();
                }
            });
        $scope.$on('loaded', () => {
            getDocuments();
        });

        function getDocuments() {
            Restangular.one('health').one('patients', $scope.patient.id).one('documents').get().then(result => {
                $scope.documents = result;
            });
        }

        $scope.openFile = (file) => {
            $window.open('api/system/documentmanagement/files/' + file.guid);
        };
    }])
    .controller('HealthPatientFormResponsesController', ['$log', '$scope', ($log, $scope) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.patient) {
                    $scope.$broadcast('loadData', $scope.patient.personId);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.patient.personId);
        });
    }])
    .controller('HealthPatientEditModalController', ['$log', '$scope', '$uibModalInstance', '$uibModal', 'Restangular', ($log, $scope, $uibModalInstance, $uibModal, Restangular) => {
        $scope.params = {
            step: 1 // 1:Person, 2:Patient
        };

        $scope.patient = {
            personId: null
        };

        $scope.test = () => {

        }

        $scope.save = () => {
            Restangular.service('health/patients').post($scope.patient).then((result) => {
                $uibModalInstance.close(result);
            });
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    }
    ])
    .directive('healthPatientsGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'healthPatientsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'CUIT', 'Nombre', 'Teléfono', 'Ciudad', 'Provincia', 'Prestador', 'Credencial'];
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
                    { name: 'personCode', index: 'personCodeContains', search: true, width: 100, fixed: true },
                    { name: 'personName', index: 'personNameContains', search: true },
                    { name: 'phone', index: 'phoneContains', search: true, width: 125, fixed: true },
                    { name: 'city', index: 'cityContains', search: true },
                    { name: 'state', index: 'stateContains', search: true },
                    { name: 'healthService', index: 'healthServiceContains', search: true },
                    { name: 'cardNumber', index: 'cardNumberContains', search: true, width: 125, fixed: true }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/api/health/patients.json',
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
                            $state.go('app.health.patient.info', { patientId: rowId });
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
    .directive('healthClinicalHistoryGrid', ['$state', '$log', '$compile', '$filter', 'authManager', ($state, $log, $compile, $filter, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@' },
            link(scope: any, element) {
                //var tabsElement = '<uib-tabset class="tabbable"><uib-tab heading="Propias" select="changeView(0)"></uib-tab><uib-tab heading="De terceros" select="changeView(1)"></uib-tab><uib-tab heading="Baja" select="changeView(2)"></uib-tab><uib-tab heading="Finalizadas" select="changeView(3)"></uib-tab></uib-tabset>';
                var gridElementName = 'healthClinicalHistoryGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);

                //var patientId;

                //element.append($compile(tabsElement)(scope));
                element.append($compile(gridElement)(scope));
                element.append($compile(pagerElement)(scope));

                scope.height = scope.height || 400;
                scope.showHeader = scope.showHeader || false;

                scope.changeView = (view) => {
                    scope.view = view;
                    loadData();
                }

                function dateFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<div class="centeredtextcell" style="padding-top: 10px;">' + $filter('amDateFormat')(rowObject.date, 'L') + '</div>'
                        //+ '<div class="largefontcell">' + $filter('amDateFormat')(rowObject.date, 'LT') + '</div>'
                        + '<div class="centeredtextcell"><a ui-sref="app.health.treatmentrequest({treatmentRequestId: ' + rowObject.id + '})">' + rowObject.workflowInstance.workflow.code + '-' + rowObject.id + '</a><div>';
                }

                function detailsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = '<table class="m-t-sm"><tr><td>';
                    /*
                    + '<button class="btn btn-default btn-xs" data-ng-click="toggleCollapse()">'
                    + '<i class="fa fa-chevron-down" data-ng-show="isCollapsed" ></i>'
                    + '<i class="fa fa-chevron-up" data-ng-show="!isCollapsed"></i>'
                    + '</button>&nbsp;'
                */
                    var diseaseNames = ' - ';
                    var doctorName = '';
                    var doctorId = '';
                    if (rowObject.diagnostics.length > 0) {
                        diseaseNames = _.map(rowObject.diagnostics, 'disease.name').join();
                        doctorId = rowObject.diagnostics[0].doctorId;
                        doctorName = rowObject.diagnostics[0].doctorName;
                    }
                    template += '<strong>Diagnóstico:</strong>&nbsp;' + diseaseNames
                        + '</td><td>'
                        + '<strong>Médico:</strong>';
                    if (doctorId !== '') {
                        template += '&nbsp;<a ui-sref="app.health.doctoredit({doctorId: ' + doctorId + '})">' + doctorName + '</a>';
                    } else {
                        template += ' -';
                    }
                    template += '</td></tr></table></p>';
                    //+ '<div uib-collapse="isCollapsed"><div class="well">';

                    if (rowObject.messages.length > 0) {
                        template += '<p>Observaciones:&nbsp;' + rowObject.messages[0].body + '</p>';
                    }

                    if (rowObject.drugs.length > 0 || rowObject.products.length > 0 || rowObject.practices.length > 0) {
                        template += '<div class="graybackground" style="margin-bottom: 10px;">';
                        template += '<p><strong>Tratamiento</strong></p>';


                        if (rowObject.drugs.length > 0) {
                            template += '<p style="text-decoration: underline;">Medicamentos:</p>';
                            _.forEach(rowObject.drugs, (drug:any) => {
                                template += '<p>' + drug.drug.name + '</p>';
                            });
                        }
                        if (rowObject.products.length > 0) {
                            template += '<p style="text-decoration: underline;">Insumos:</p>';
                            _.forEach(rowObject.products, (product:any) => {
                                template += '<p>' + product.product.name + ' Cantidad:&nbsp;' + product.quantity;
                                if (product.vendor) {
                                    template += ' Proveedor:&nbsp;' + product.vendor.person.name;
                                }
                                if (product.price) {
                                    template += ' Precio:&nbsp;' + $filter('currency')(product.price);
                                }
                                template += '</p>';
                            });
                        }
                        if (rowObject.practices.length > 0) {
                            template += '<p style="text-decoration: underline;">Prácticas:</p>';
                            _.forEach(rowObject.practices, (practice:any) => {
                                template += '<p>' + practice.medicalPractice.name + ' Cantidad:&nbsp;' + practice.quantity + ' Frecuencia:&nbsp;' + practice.frequency;
                                if (practice.vendor) {
                                    template += ' Proveedor:&nbsp;' + practice.vendor.person.name;
                                }
                                template += ' Desde:&nbsp;' + $filter('amDateFormat')(practice.fromDate, 'L');
                                template += ' Hasta:&nbsp;' + $filter('amDateFormat')(practice.toDate, 'L');
                                template += '</p>';
                            });
                        }

                        template += '</div>';
                    }

                    return template;
                }

                var colNames = ['', ''];
                var colModel: Array<any> = [
                    { name: 'date', index: 'date', width: 120, fixed: true, search: false, formatter: dateFormatter, classes: 'rb' },
                    { name: 'details', index: 'details', search: false, formatter: detailsFormatter, classes: 'wrapcell bb p-l-sm p-r-sm' }
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
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.health.requestedit';
                            $state.go(stateName, { requestId: rowId });
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
                    var header = $('#gview_healthClinicalHistoryGrid .ui-jqgrid-hdiv').hide();
                }

                gridElement.addClass('ui-jqgrid-noborders');

                function loadData() {
                    var url = '/api/health/patients/' + scope.patientId + '/clinicalhistory.json';
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                }

                scope.$on('loadData', (event, patientId) => {
                    if (patientId) {
                        scope.patientId = patientId;
                        loadData();
                    }
                });
            }
        };
    }])
    .directive('healthFormsResponsesGrid', ['PollService', '$state', '$log', '$compile', '$filter', 'authManager', (PollService, $state, $log, $compile, $filter, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', showHeader: '@' },
            link(scope: any, element) {
                var gridElementName = 'formResponsesGrid';
                var pagerElementName = gridElementName + 'Pager';
                //var gridElement = angular.element('<table></table>');
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                
                element.append($compile(gridElement)(scope));
                element.append($compile(pagerElement)(scope));

                scope.height = scope.height || 400;
                scope.showHeader = scope.showHeader || false;

                scope.changeView = (view) => {
                    scope.view = view;
                    loadData();
                }
                                
                function statusFormatter(cellvalue: any, options: any, rowObject: any) {
                    return PollService.getStatusTypeName(rowObject.statusId);
                }

                function EditButtonFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<i class="fa fa-pencil fa-fw hand"></i>';
                }

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-eye fa-fw hand" ></i>';
                }

                var colNames = ['Id', 'Encuesta', 'Usuario', 'Fecha Inicio', 'Fecha Fin', 'Estado', '', '','','',''];
                var colModel: Array<any> = [
                    { name: 'id', index: 'id', width: 30, align: 'right' },
                    { name: 'formName', index: 'formName', width: 100 },
                    { name: 'userName', index: 'userName', width: 100 },
                    { name: 'startDate', index: 'startDate', formatter: 'date', align: 'right', width: 50 },
                    { name: 'endDate', index: 'endDate', formatter: 'date', align: 'right', width: 50 },
                    { name: 'statusId', index: 'statusId', width: 50, formatter: statusFormatter },
                    { name: 'editCommand', index: 'editCommand', hidden: false, width: 25, formatter: EditButtonFormatter, fixed: true, align: 'center', sortable: false, search: false },
                    { name: 'deleteCommand', index: 'deleteCommand', hidden: true, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                    { name: 'formId', index: 'formId', hidden: true},
                    { name: 'allowUpdates', index: 'allowUpdates', hidden: true },
                    { name: 'viewCommand', index: 'viewCommand', width: 25, formatter: viewFormatter, fixed: true, align: 'center', sortable: false, search: false }
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
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 6) {

                            function editar() {
                                $state.go('app.polls.editinstance', { formResponseId: rowId, formId: scope.formId });
                            }

                            var rowData = gridElement.getRowData(rowId);
                            var estado = rowData.statusId;
                            scope.formId = rowData.formId;
                            scope.form = {
                                allowUpdates: rowData.allowUpdates
                            };

                            if (estado == 'ABIERTA') {
                                editar();
                            } else {

                                var allowUpdates = scope.form.allowUpdates;
                                /*var dlg = dialogs.confirm();dlg.result.then(function (btn) { editar();}, function (btn) {});*/
                                if (allowUpdates === 'true') { //jqGrid stores the data as string instead of boolean
                                    if (confirm("Desea reabrir la encuesta?")) {
                                        editar();
                                    }
                                } else {
                                    alert("No está permitido reabrir esta encuesta");
                                }

                            }
                        }

                        if (iCol === 10) {
                            $state.go('app.polls.viewinstance', { formResponseId: rowId, formId: scope.formId });
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

                /*if (!scope.showHeader) {
                    var header = $('#gview_healthClinicalHistoryGrid .ui-jqgrid-hdiv').hide();
                }*/

                gridElement.addClass('ui-jqgrid-noborders');
                $('#gview_formResponsesGrid .ui-search-toolbar').hide();

                function loadData() {
                    var url = '/api/system/persons/' + scope.personId + '/formresponses.json';
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
    }]);