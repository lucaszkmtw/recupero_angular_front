angular.module('app.crm.leads', ['app.core', 'app.crm', 'app.system', 'app.system.persons'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.crm.leads', {
                url: '/leads',
                controller: 'CRMLeadsController',
                templateUrl: 'app/crm/leads/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'crm.leads',
                    parent: 'app.crm'
                }
            })
            .state('app.crm.lead', {
                url: '/leads/{leadId}',
                controller: 'CRMLeadController',
                templateUrl: 'app/crm/leads/edit.html',
                resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.crm.leads',
                    label: 'crm.lead'
                }
            })
            .state('app.crm.leadview', {
                url: '/lead/{formResponseId}',
                controller: 'LeadViewController',
                templateUrl: 'app/polls/view.html',
                resolve: loadSequence('toastr', 'icheck'),
                ncyBreadcrumb: {
                    parent: 'app.crm.leads',
                    label: 'crm.lead'
                }
            })
            .state('app.crm.personsvalidate', {
                url: '/personsvalidate',
                controller: 'PersonsValidateListController',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                templateUrl: 'app/crm/leads/listvalidate.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.leads',
                    label: 'crm.validatepersons'
                }
            })
            .state('app.crm.person', {
                url: '/person/{personId}',
                controller: 'CRMpersonViewController',
                resolve: loadSequence('ui.router.tabs', 'jqueryui', 'jqGrid', 'toastr'),
                templateUrl: 'app/crm/persons/view.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.lead'
                }
            })
            //Tabs
            .state('app.crm.person.info', {
                url: '/info',
                templateUrl: 'app/crm/persons/view.info.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.emptytab', {
                url: '/emptytab',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.health', {
                url: '/health',
                controller: 'CRMpersonHealthController',
                resolve: loadSequence('ui.router.tabs'),
                templateUrl: 'app/crm/persons/view.health.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.crm', {
                url: '/crm',
                templateUrl: 'app/crm/persons/view.crm.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.Préstamos', {
                url: '/Prestamos',
                templateUrl: 'app/crm/persons/view.loans.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.Cobranzas', {
                url: '/Cobranzas',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.sales', {
                url: '/sales',
                templateUrl: 'app/crm/persons/view.sales.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.procurement', {
                url: '/procurement',
                templateUrl: 'app/crm/persons/view.procurement.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.financials', {
                url: '/financials',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.polls', {
                url: '/polls',
                controller: 'CRMpersonPollsController',
                templateUrl: 'app/crm/persons/view.polls.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.projects', {
                url: '/projects',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.lms', {
                url: '/lms',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.catalog', {
                url: '/catalog',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.Contenidos', {
                url: '/Contenidos',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.system', {
                url: '/system',
                templateUrl: 'app/crm/persons/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            .state('app.crm.person.health.clinicalhistory', {
                url: '/clinicalhistory',
                controller: 'CrmContactHealthPatientClinicalhistoryController',
                templateUrl: 'app/health/patient/view.clinicalhistory.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.crm.person.health',
                    label: 'health.patient.clinicalhistory'
                }
            })
            .state('app.crm.person.health.claims', {
                url: '/claims',
                controller: 'CrmContactHealthPatientClaimsController',
                templateUrl: 'app/health/patient/view.claims.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.crm.person.health',
                    label: 'health.patient.claims'
                }
            })
            .state('app.crm.person.health.documents', {
                url: '/documents',
                controller: 'CrmContactHealthPatientDocumentsController',
                templateUrl: 'app/health/patient/view.documents.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.person.health',
                    label: 'health.patient.claims'
                }
            })
            .state('app.crm.person.forms', {
                url: '/forms',
                controller: 'CRMpersonFormsController',
                templateUrl: 'app/crm/persons/view.forms.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.crm.personsvalidate',
                    label: 'crm.persons'
                }
            })
            //End tabs
            .state('app.crm.qualifications', {
                url: '/qualifications',
                controller: 'CRMQualificationsController',
                templateUrl: 'app/crm/leads/qualifications.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'toastr'),
                ncyBreadcrumb: {
                    label: 'crm.qualifications',
                    parent: 'app.crm'
                }
            })
            .state('app.crm.leadauthorization', {
                url: '/leadauthorization/{leadId}',
                controller: 'LeadAuthorizationController',
                templateUrl: 'app/crm/leads/authorization.html',
                resolve: loadSequence('toastr', 'icheck', 'angularFileUpload', 'jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.crm.qualifications',
                    label: 'crm.lead'
                }
            })
            .state('app.crm.leadedit', {
                url: '/leadedit/{leadId}',
                controller: 'LeadEditController',
                templateUrl: 'app/crm/leads/edit.html',
                resolve: loadSequence('toastr', 'icheck', 'angularFileUpload'),
                ncyBreadcrumb: {
                    parent: 'app.crm.qualifications',
                    label: 'crm.lead'
                }
            });
    }
    ])
    .controller('CRMLeadsController', ($scope, $translate, $state) => {
        $scope.new = () => {
            $state.go('app.crm.newlead');
        }
    })
    .controller('LeadViewController', ['$scope', '$state', '$stateParams', '$log', '$http', 'Restangular', 'toastr', ($scope, $state, $stateParams, $log, $http, Restangular, toastr) => {
        $scope.formResponseId = $stateParams.formResponseId;
        $scope.form = {};
        $scope.form.person = {};
        $scope.formResponse = {};
        $scope.lead = {};

        $scope.validate = () => {
            Restangular.service('system/persons/' + $scope.form.person.id + '/validate').post({}).then(() => {
                toastr.success('Personas', 'La operación se realizó con éxito.');
                $scope.form.person.isValid = true;
            }, () => {
                toastr.error('Personas', 'Se produjo un error en la operación.');
            });
        };

        $scope.edit = () => {
            $state.go('app.system.personedit', { personId: $scope.form.person.id });
        }

        $scope.submitForAuthorization = () => {
            var id = $scope.form.formResponse.id;

            Restangular.service('crm/leads/' + id + '/submitforauthorization').post({}).then((result) => {
                toastr.success('Se ha iniciado el worflow.', 'Prospectos');
                //$state.reload();
                load();
            },
                () => { toastr.error('Se ha producido un error al iniciar workflow.', 'Prospectos'); }
            );
        }

        function load() {

            $http.get('/api/crm/lead/' + $scope.formResponseId).then((data) => {
                $scope.form = data.data.form;
                $scope.form.person = data.data.person;
                $scope.form.formResponse = data.data.formResponse;
                _.forEach($scope.form.fields, (formField: any) => {
                    var responseField: any = _.find($scope.form.formResponse.fields, { 'id': formField.id });
                    if (responseField) {
                        formField.value = responseField.value;
                    }
                });
                $scope.lead = data.data.lead;
            });
        }

        load();
    }])
    .controller('LeadAuthorizationController', ['$scope', '$state', '$stateParams', '$log', '$http', 'Restangular', 'toastr', '$window', 'FileUploader', 'dialogs', ($scope, $state, $stateParams, $log, $http, Restangular, toastr, $window, FileUploader, dialogs) => {
        var id = $stateParams.leadId;
        $scope.params = {
            showForms: false
        };

        $scope.lead = {};
        $scope.scores = [];

        $scope.edit = () => {
            $state.go("app.crm.leadedit", { leadId: id });
        };

        $scope.serviceUrl = 'crm/leads/' + $stateParams.leadId + '/messages';

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/crm/leads/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false
        });

        $scope.requestScore = (score) => {
            var dlg = dialogs.create('app/loans/scoringmodal.html', 'LoanScoringModalController', { person: $scope.lead.person, employee: $scope.lead.employee }, { size: 'lg' });
            
            dlg.result.then((model) => {
                Restangular.service('loans/scoring').post(model).then(() => {
                    toastr.success('Solicitud de Scoring', 'La operación se realizó con éxito.');
                    load();
                }, () => {
                    toastr.error('Solicitud de Scoring', 'Se produjo un error en la operación.');
                });
            },
                () => { });
        };

        $scope.uploader.onCompleteAll = () => {
            Restangular.one('crm').one('leads', id).one('files').get().then(result => {
                $scope.lead.files = result.results;
            });
        };

        $scope.openFile = (file) => {
            $window.open('api/crm/leads/' + $scope.lead.id + '/files/' + file.guid);
        };

        $scope.$on('reload', (event) => {
            load();
        });

        $scope.$on('reloadMessages', (event, messages) => {
            $scope.lead.messages = messages;
        });

        function load() {
            Restangular.one('crm').one('leadauthorization', id).get().then(lead => {
                $scope.lead = lead;

                Restangular.one('crm').one('leadauthorization', id).get().then(lead => {
                    $scope.lead = lead;
                    loadScores($scope.lead.personId);
                });
            });
        }

        load();

        function loadScores(personId) {
            Restangular.one('system').one('persons', personId).customGET('scoring').then((response) => {
                $scope.scores = response.results;
                var scoringLoaded = true;
            });
        }

        $scope.abrirModalForm = (formId, formResponseId) => {
            var modalInstance = dialogs.create('app/cms/forms/formpopup.html', 'LeadFormPopUpController', { formId: formId, lead: $scope.lead, formResponseId: formResponseId }, { size: 'lg', animation: false });
            modalInstance.result.then((result) => {
                if (result) {
                }
            }, () => { });
        }

        $scope.showForms = () => {
            $log.info('Show forms');
            $scope.params.showForms = true
        }

    }])
    .controller('LeadFormPopUpController', [
        '$scope', '$state', '$stateParams', '$window', '$filter', 'formService', '$log', '$http', 'data',
        ($scope, $state, $stateParams, $window, $filter, formService, $log, $http, data) => {

            $scope.lead = data.lead;
            $scope.formResponseId = data.formResponseId;

            if (angular.isDefined($scope.formResponseId) && $scope.formResponseId > 0) {

                $scope.form = {};
                $scope.form.person = {};
                $scope.formResponse = {};

                $http.get('/api/cms/formresponse/' + $scope.formResponseId).then((data) => {
                    $scope.form = data.data.form;
                    $scope.form.person = data.data.person;
                    $scope.form.formResponse = data.data.formResponse;
                    for (var i = 0; i < $scope.form.fields.length; i++) {
                        if ($scope.form.formResponse.fields[i]) {
                            $scope.form.fields[i].value = $scope.form.formResponse.fields[i].value;
                        }
                    }

                    $scope.previewOptions = {
                        disableDrag: true,
                        disableResize: true
                    };

                    if (!angular.isDefined($scope.form.person)) {
                        $scope.form.person = { id: $scope.lead.personId };
                    }
                });
            } else {

                $http.get('/api/cms/forms/' + data.formId).then((data) => {
                    $scope.form = data.data;
                    $scope.id = $scope.form.id;
                    $scope.form.showTitle = false;
                    $scope.form.remarks = false;
                    $scope.form.leadId = $scope.lead.id;
                    $scope.form.person.id = $scope.lead.personId;
                });
            }

        }
    ])
    .controller('LeadEditController', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'toastr', '$window', 'FileUploader', ($scope, $state, $stateParams, $log, Restangular, toastr, $window, FileUploader) => {
        var id = $stateParams.leadId;
        $scope.lead = {};

        $scope.view = () => {
            $state.go("app.crm.leadauthorization", { leadId: id });
        };

        $scope.save = () => {
            $scope.lead.put().then(() => {
                toastr.success('Leads', 'Lead actualizado');
                $scope.view();
            });
        };

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/crm/leads/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false
        });

        $scope.uploader.onCompleteAll = () => {
            Restangular.one('crm').one('leads', id).one('files').get().then(result => {
                $scope.lead.files = result.results;
            });
        };

        $scope.openFile = (file) => {
            $window.open('api/crm/leads/' + $scope.lead.id + '/files/' + file.guid);
        };

        //#region Products
        $scope.addLeadProduct = () => {
            Restangular.one('catalog').one('products', $scope.params.productId).get().then((product) => {
                var leadProduct = {
                    productId: product.id,
                    productName: product.name
                };

                $scope.lead.products.push(leadProduct);
                $scope.params.productId = null;
            });
        };

        $scope.removeLeadProduct = (item) => {
            var index = $scope.lead.products.indexOf(item);
            $scope.lead.products.splice(index, 1);
        }
        //#endregion


        //#region
        $scope.addLeadForm = () => {
            Restangular.one('cms').one('forms', $scope.params.formId).get().then((form) => {
                var leadForm = {
                    formId: form.id,
                    formName: form.name
                };

                $scope.lead.forms.push(leadForm);
                $scope.params.formId = null;
            });
        };

        $scope.removeLeadForm = (item) => {
            var index = $scope.lead.forms.indexOf(item);
            $scope.lead.forms.splice(index, 1);
        }
        //#endregion

        function load() {
            Restangular.one('crm').one('leadauthorization', id).get().then(lead => {
                $scope.lead = lead;
                //$scope.lead.products = [];
            });
        }

        load();
    }])
    .controller('PersonsValidateListController', ($scope, $translate, $state, Restangular, $log) => {
        $scope.params = {
            selectedItems: []
        };
    })
    .controller('CRMpersonViewController', ($scope, Restangular, $log, $translate, PersonService, $stateParams, $templateCache, $state, $rootScope) => {
        var personId = $stateParams.personId;
        $scope.personId = personId;
        $scope.personService = PersonService;
        $scope.menu = $rootScope.session.menu;

        function load() {
            $scope.tabData = [];
            Restangular.all('crm').one('person/' + personId).get().then((result) => {
                $scope.person = result;

                $scope.tabData = [
                    {
                        heading: 'Datos adicionales',
                        route: 'app.crm.person.info'
                    }
                ];

                var notImplementedTabs = ['financials', 'lms', 'catalog', 'system'];

                for (var i = 0; i < $scope.menu.length; i++) {
                    var item = $scope.menu[i];
                    var validTab = true;

                    if (item.text === 'sales' && $scope.person.salesCount == 0) {
                        validTab = false;
                    } else if (item.text === 'procurement' && $scope.person.procurementsCount == 0) {
                        validTab = false;
                    } else if (item.text === 'polls' && $scope.person.pollsCount == 0) {
                        validTab = false;
                    } else if (item.text === 'Préstamos' && $scope.person.loansCount == 0) {
                        validTab = false;
                    } else if (_.findIndex(notImplementedTabs, function (t) { return t == item.text }) != -1) {
                        validTab = false;
                    }

                    if (validTab) {
                        var state = item.text;
                        if (state === 'health') {
                            state += '.clinicalhistory';
                        }

                        $scope.tabData.push({
                            heading: $translate.instant(item.text),
                            route: 'app.crm.person.' + state
                        });
                    }
                }

                $scope.tabData.push({
                    heading: 'Formularios',
                    route: 'app.crm.person.forms'
                });

                for (var tab in $scope.tabData) {
                    if ($scope.tabData[tab].route == $state.current.name
                        || (
                            $scope.tabData[tab].route == 'app.crm.person.health.clinicalhistory' &&
                            (
                                $state.current.name == 'app.crm.person.health.clinicalhistory'
                                || $state.current.name == 'app.crm.person.health.claims'
                                || $state.current.name == 'app.crm.person.health.documents'
                            )
                        )
                    ) {
                        $scope.tabData[tab].active = true;
                        $scope.tabData[tab].class = 'active';
                        $scope.tabData.active = parseInt(tab);
                    } else {
                        $scope.tabData[tab].active = false;
                        $scope.tabData[tab].class = '';
                    }
                }

                $scope.$broadcast('$viewContentLoaded');
            });

        }

        load();

        $scope.edit = () => {
            $state.go('app.system.personedit', { personId: $scope.person.id });
        }

    })

    .controller('CRMpersonHealthController', ($log, $scope, $stateParams, Restangular) => {
        var personId = $stateParams.personId;

        $scope.tabDataHealth = [
            {
                heading: 'Historia Clínica',
                route: 'app.crm.contact.health.clinicalhistory'
            },
            {
                heading: 'Reclamos',
                route: 'app.crm.contact.health.claims'
            },
            {
                heading: 'Documentos',
                route: 'app.crm.contact.health.documents'
            }
        ];

        function load() {
            Restangular.one('crm').one('person/' + personId + '/patient').get().then(result => {
                $scope.patient = result;
                if ($scope.patient != undefined) {
                    //$scope.$broadcast('loadData', $scope.patient.id);
                    $scope.personId = $scope.patient.personId;
                    $scope.$broadcast('loaded');
                }
            });
        }

        load();

    })

    .controller('CRMpersonFormsController', ($log, $scope, $stateParams, Restangular) => {
        var personId = $stateParams.personId;


        function load() {
        }

        load();

    })

    .controller('CRMpersonHealthPatientClinicalhistoryController', ($log, $scope) => {

        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.patient) {
                    $scope.$broadcast('loadData', $scope.patient.id);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.patient.id);
        });

    })
    .controller('CRMpersonHealthPatientClaimsController', ($log, $scope) => {

        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.patient) {
                    $scope.$broadcast('loadData', $scope.patient.personId);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.patient.personId);
        });

    })
    .controller('CRMpersonHealthPatientDocumentsController', ($log, $scope, $window, Restangular) => {
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
    })
    .controller('CRMpersonPollsController', ($log, $scope, $window, Restangular) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.person) {
                    $scope.$broadcast('loadData', $scope.person.id);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.person.id);
        });

    })
    .controller('CRMQualificationsController', ($scope, $translate, $state) => {

        $scope.refresh = () => {
            $scope.$broadcast('loadData');
        };

    })
    .directive('crmLeadsGrid', ($state, $log, $compile, $filter, Restangular, toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', personId: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'crmLeadsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;
                scope.submitForAuthorization = (id) => {
                    Restangular.service('crm/leads/' + id + '/submitforauthorization').post({}).then((result) => {
                        toastr.success('Se ha iniciado el worflow.', 'Prospectos');
                        //$state.go('app.crm.leads');
                        loadData();
                    },
                        () => { toastr.error('Se ha producido un error al iniciar workflow.', 'Prospectos'); }
                    );
                }

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-eye fa-fw hand" ></i>';
                }

                function boolFormatter(cellvalue, options, rowObject) {
                    //return (cellvalue != null && cellvalue === 'True')?'SI':'NO';
                    return (cellvalue != null && cellvalue === true) ? 'SI' : 'NO';
                }

                function singleQuote(value) {
                    return `'${value}'`;
                }

                function actionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = '';
                    //if (rowObject.personIsValid === 'True' && rowObject.leadId == 0) {
                    if (rowObject.personIsValid === true && rowObject.leadId == 0) {
                        template += '<a href="#" data-ng-click="submitForAuthorization(' + singleQuote(rowObject.id) + ')" class="btn btn-primary btn-xs m-l-xs">Iniciar Workflow </a>';
                    }

                    /*if (rowObject.personIsValid === 'True' && rowObject.leadId != 0) {
                        template += '<a href="#" data-ng-click="approve(' + singleQuote(rowObject.leadId) + ')" class="btn btn-primary btn-xs m-l-xs">Aprobar</a>';
                    }*/
                    return template;
                }

                var colNames = ['', 'Nombre', 'Usuario', 'Fecha Inicio', 'Fecha Fin', 'Campaña', 'Persona Validada', '', ''];
                var colModel: Array<any> = [
                    { name: 'viewCommand', index: 'viewCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                    { name: 'name', index: 'name', width: 100, searchoptions: { size: 30 } },
                    { name: 'userName', index: 'userName', width: 100, searchoptions: { size: 30 } },
                    {
                        name: 'startDate', index: 'startDate_', formatter: 'date', align: 'right', width: 50, searchoptions: {
                            sopt: ['eq'],
                            dataInit: function (elem) {
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    {
                        name: 'endDate', index: 'endDate_', formatter: 'date', align: 'right', width: 50,
                        searchoptions: {
                            sopt: ['eq'],
                            dataInit: function (elem) {
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    { name: 'campaignName', index: 'campaignName', width: 100, sortable: false, searchoptions: { size: 30 } },
                    { name: 'personIsValid', index: 'personIsValid', width: 60, sortable: false, formatter: boolFormatter, search: false },
                    { name: 'actions', index: 'actions', width: 250, align: 'left', fixed: true, search: false, formatter: actionsFormatter },
                    { name: 'formId', index: 'formId', hidden: true }
                ];

                var url = API_HOST + '/api/crm/leads';

                if (scope.personId) {
                    url += '?personId=' + scope.personId;
                }
                gridElement.jqGrid({
                    regional: 'es-ar',
                    //url: '/api/crm/leads.json',
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
                            $state.go('app.crm.leadview', { formResponseId: rowId });
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


                function loadData() {
                    var url = '/api/crm/leads';

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
    .controller('CRMLeadController', ($scope, $translate, $state, $stateParams, Restangular, toastr) => {

        var id = $stateParams.vendorId;

        function load() {
            if (id) {
                Restangular.one('crm').one('leads', id).get().then(result => {
                    $scope.vendor = result;
                });
            }
            else {
                $scope.vendor = {};
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.vendor.put().then(() => {
                    toastr.success('Se ha dado de alta el proveedor con éxito.', 'Editor de proveedores');
                    $state.go('app.procurement.vendors');
                }, () => {
                    toastr.error('Se produjo un error al dar de alta el proveedor.', 'Editor de proveedores');
                });
            } else {
                Restangular.service('procurement/vendors').post($scope.vendor).then(() => {
                    toastr.success('Se ha actualizado el proveedor con éxito.', 'Editor de proveedores');
                    $state.go('app.procurement.vendors');
                }, () => {
                    toastr.error('Se produjo un error al actualizar el proveedor.', 'Editor de proveedores');
                });
            }
        }

        load();
    })
    .directive('crmQualificationsGrid', ['$state', '$log', '$compile', '$filter', 'Restangular', 'toastr', 'authManager', ($state, $log, $compile, $filter, Restangular, toastr, authManager) => {
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
                var gridElementName = 'crmQualificationsGrid';
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

                scope.reject = (workflowInstanceGuid) => {
                    Restangular.service('system/workflows/workflowinstances/' + workflowInstanceGuid + '/reject').post({}).then(() => {
                        toastr.success('Autorizaciones', 'La operación se realizó con éxito.');
                        loadData();
                    }, () => {
                        toastr.error('Autorizaciones', 'Se produjo un error en la operación.');
                    });
                };

                function workflowInstanceFormatter(cellvalue: any, options: any, rowObject: any) {
                    var campaignName = rowObject.campaignName || '';
                    //return '<div class="largefontcell m-l-sm"># ' + campaignName + '</div>';
                    return '<div>' + campaignName + '</div>';
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

                function leadDataFormatter(cellvalue: any, options: any, rowObject: any) {
                    var createDate = $filter('amDateTime')(rowObject.workflowInstanceCreateDate);
                    var amount = $filter('currency')(rowObject.amount);
                    var valid = (rowObject.personIsValid != null && rowObject.personIsValid === true) ? 'SI' : 'NO';
                    return '<small>Nombre Interesado</small> <a data-ui-sref="app.crm.person.info({ personId: ' + rowObject.personId +
                        ' })" title="Ver ficha">' + rowObject.name +
                        '</a><br><small>Creada el ' + createDate +
                        '</small><br><small>Persona validada ' + valid + '</small></td>';
                }

                function singleQuote(value) {
                    return `'${value}'`;
                }

                function documentActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var template = '<a href="#" data-ui-sref="app.crm.leadauthorization({ leadId: ' + rowObject.id + '})" class="btn btn-white btn-xs m-l-md"><i class="fa fa-folder"></i> Ver </a>';

                    if (scope.view <= 1) {
                        //if (!rowObject.workflowActivityIsFinal){
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
                    { name: 'leadData', index: 'leadData', search: false, formatter: leadDataFormatter },
                    { name: 'workflowProgress', index: 'workflowProgress', width: 150, fixed: true, search: false, formatter: workflowProgressFormatter },
                    { name: 'actions', index: 'actions', width: 250, align: 'left', fixed: true, search: false, formatter: documentActionsFormatter }
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

                    var url = API_HOST + '/api/crm/qualifications';

                    if (scope.personId) {
                        url += '?personId=' + scope.personId;
                    }
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
    .directive('crmLeadsResponsesGrid', ($state, $log, $compile, $filter, Restangular, toastr, PollService, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', personId: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'crmLeadsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                function statusFormatter(cellvalue: any, options: any, rowObject: any) {
                    return PollService.getStatusTypeName(rowObject.statusId);
                }

                var colNames = ['Usuario', 'Fecha Inicio', 'Fecha Fin', 'Campaña', 'Estado', ''];
                var colModel: Array<any> = [
                    { name: 'userName', index: 'userName', width: 100, searchoptions: { size: 30 } },
                    {
                        name: 'startDate', index: 'startDate_', formatter: 'date', align: 'right', width: 50, searchoptions: {
                            sopt: ['eq'],
                            dataInit: function (elem) {
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    {
                        name: 'endDate', index: 'endDate_', formatter: 'date', align: 'right', width: 50,
                        searchoptions: {
                            sopt: ['eq'],
                            dataInit: function (elem) {
                                $(elem).attr("type", "date");
                            }
                        }
                    },
                    { name: 'campaignName', index: 'campaignName', width: 100, sortable: false, searchoptions: { size: 30 } },
                    { name: 'statusId', index: 'statusId', width: 50, formatter: statusFormatter, search: false },
                    { name: 'formId', index: 'formId', hidden: true }
                ];

                var url = '/api/crm/leadformresponses';

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
                            //$state.go('app.crm.leadview', { formResponseId: rowId });
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


                function loadData() {
                    var url = '/api/crm/leadformresponses';

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
