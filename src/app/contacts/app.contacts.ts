angular.module('app.contacts', ['app.core', 'app.crm', 'app.system', 'app.system.persons'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.contacts', {
                abstract: true,
                template: '<ui-view/>',
                url: '/contacts',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'contacts'
                }
            })
            .state('app.contacts.mycontacts', {
                url: '/mycontacts',
                controller: 'ContactsController',
                resolve: loadSequence('jqueryui', 'angularFileUpload','jqGrid', 'toastr'),
                templateUrl: 'app/contacts/index.html',
                ncyBreadcrumb: {
                    skip: true,
                    parent: 'app.contacts',
                    label: 'my.contacts'
                }
            })
            .state('app.contacts.group', {
                url: '/group/{groupId}',
                controller: 'ContactsListController',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/contacts/list.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts',
                    label: 'crm.contacts'
                }
            })
            .state('app.contacts.newcontact', {
                url: '/contacts/new',
                controller: 'ContactEditController',
                resolve: loadSequence('jqueryui'),
                templateUrl: 'app/crm/contacts/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts',
                    label: 'crm.contacts'
                }
            })
            .state('app.contacts.editcontact', {
                url: '/contactedit/{contactId}',
                controller: 'ContactEditController',
                resolve: loadSequence('jqueryui'),
                templateUrl: 'app/crm/contacts/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact', {
                url: '/contact/{contactId}',
                controller: 'contactViewController',
                resolve: loadSequence('ui.router.tabs', 'jqueryui', 'jqGrid', 'toastr'),
                templateUrl: 'app/crm/contacts/view.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.info', {
                url: '/info',
                templateUrl: 'app/crm/contacts/view.info.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.emptytab', {
                url: '/emptytab',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.health', {
                url: '/health',
                controller: 'ContactHealthController',
                resolve: loadSequence('ui.router.tabs'),
                templateUrl: 'app/crm/contacts/view.health.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.crm', {
                url: '/crm',
                controller: 'ContactCrmController',
                templateUrl: 'app/crm/contacts/view.crm.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.Préstamos', {
                url: '/Prestamos',
                controller: 'ContactLoanController',
                templateUrl: 'app/crm/contacts/view.loans.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.Cobranzas', {
                url: '/Cobranzas',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.sales', {
                url: '/sales',
                templateUrl: 'app/crm/contacts/view.sales.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.procurement', {
                url: '/procurement',
                templateUrl: 'app/crm/contacts/view.procurement.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.financials', {
                url: '/financials',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.polls', {
                url: '/polls',
                controller: 'ContactPollsController',
                templateUrl: 'app/crm/contacts/view.polls.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.projects', {
                url: '/projects',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.lms', {
                url: '/lms',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.catalog', {
                url: '/catalog',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.Contenidos', {
                url: '/Contenidos',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.system', {
                url: '/system',
                templateUrl: 'app/crm/contacts/view.emptytab.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            })
            .state('app.contact.health.clinicalhistory', {
                url: '/clinicalhistory',
                controller: 'ContactHealthPatientClinicalhistoryController',
                templateUrl: 'app/health/patient/view.clinicalhistory.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.contact.health',
                    label: 'health.patient.clinicalhistory'
                }
            })
            .state('app.contact.health.claims', {
                url: '/claims',
                controller: 'ContactHealthPatientClaimsController',
                templateUrl: 'app/health/patient/view.claims.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.contact.health',
                    label: 'health.patient.claims'
                }
            })
            .state('app.contact.health.documents', {
                url: '/documents',
                controller: 'ContactHealthPatientDocumentsController',
                templateUrl: 'app/health/patient/view.documents.html',
                ncyBreadcrumb: {
                    parent: 'app.contact.health',
                    label: 'health.patient.claims'
                }
            })
            .state('app.contact.businesspartner', {
                url: '/businesspartner',
                controller: 'ContactBusinessPartnerController',
                templateUrl: 'app/crm/contacts/view.businesspartner.html',
                ncyBreadcrumb: {
                    parent: 'app.contacts.group',
                    label: 'crm.contacts'
                }
            });
    }
    ])
    .controller('ContactsController', ($scope, $translate, $state, Restangular, $log, dialogs, toastr, $timeout) => {
        $scope.defaultGroupName = 'Todos los contactos';
        $scope.checkedItems = [];

        function load() {

            Restangular.all('crm').one('contactgroupsbysession').get().then((groups) => {
                $scope.groups = groups.results;
            });

            $scope.showContacts();

        }

        $scope.new = () => {
            $state.go('app.contacts.newcontact', {});
        }

        $scope.showContacts = (group) => {

            var params = { groupId: 'all' };
            $scope.selectedGroup = { name: $scope.defaultGroupName };

            if (group != undefined) {
                params = { groupId: group.contactGroupId };
                $scope.selectedGroup = group;
            }
            //Reseteo lista de elementos tildados
            $scope.checkedItems = [];

        //  $state.go('app.contacts.group', params);
        }

        $scope.editGroup = (group) => {
            if (group == undefined) {
                group = $scope.selectedGroup;
            }

            var modalInstance = dialogs.create('/app/crm/contacts/groupmodal.html', 'editGroupDialogCtrl', group, 'lg');
            modalInstance.result.then(
                (obj) => {
                    $scope.selectedGroup.name = obj.name;
                    for (var i = 0; i < $scope.groups.length; i++) {
                        if ($scope.groups[i].contactGroupId == obj.id) {
                            $scope.groups[i].name = obj.name;
                            break;
                        }
                    }
                },
                () => {
                }
            );

        }

        $scope.deleteGroup = (group) => {
            /*if(!confirm("Desea eliminar el grupo seleccionado?")){
                return;
            }*/

            if (group == undefined) {
                group = $scope.selectedGroup;
            }

            Restangular
                .one('crm/contactgroup', group.contactGroupId)
                .remove({
                    Id: group.contactGroupId,
                })
                .then((result) => {

                    for (var i = 0; i < $scope.groups.length; i++) {
                        if ($scope.groups[i].contactGroupId == group.contactGroupId) {
                            $scope.groups.splice(i, 1);
                            break;
                        }
                    }

                    $scope.showContacts();
                });
        }

        $scope.showNewGroupDialog = () => {
            try {

                var modalInstance = dialogs.create('/app/crm/contacts/groupmodal.html', 'groupDialogCtrl', {}, 'lg');
                modalInstance.result.then(
                    (obj) => {
                        obj.contactGroupId = obj.id;
                        $scope.groups.push(obj);
                    },
                    () => {
                    }
                );

            } catch (e) { }
        };

        $scope.showImportDialog = () => {

            var modalInstance = dialogs.create('/app/crm/contacts/importmodal.html', 'importDialogCtrl', {}, 'lg');
            modalInstance.result.then(
                (result) => {
                    toastr.success(result + ' personas insertadas con éxito.', 'Contactos');
                    $state.reload();
                },
                () => {
                    toastr.success('Hubo un error al procesar lo solicitado', 'Contactos');
                }
            );
        };

        $scope.params = {
            filter: ''
        };

        $scope.search = () => {
            $scope.$broadcast('refresh');
        };

        $scope.runAction = (actionId) => {
            $scope.$broadcast('action', { actionId: actionId, ids: $scope.checkedItems });
        }

        $scope.$on('selectionChanged',
            (event, args) => {
                $timeout(() => {
                    $scope.checkedItems = args.ids;
                });
            });

        $scope.selectAll = () => {
            $scope.$broadcast('selectAll')
        }

        $scope.unSelectAll = () => {
            $scope.$broadcast('unSelectAll')
        }

        load();

    })
    .controller('groupDialogCtrl', ($scope, $uibModalInstance, Restangular) => {
        $scope.hitEnter = (evt) => {
            if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.selectedItem.name, null) || angular.equals($scope.selectedItem.name, '')))
                $scope.save();
        };

        $scope.save = () => {
            Restangular.service('crm/contactgroup').post($scope.selectedItem).then((result) => {
                $scope.selectedItem.id = result.id;
                $uibModalInstance.close($scope.selectedItem);
            });
        }

    })
    .controller('editGroupDialogCtrl', ($scope, $uibModalInstance, Restangular) => {

        $scope.hitEnter = (evt) => {
            if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.selectedItem.name, null) || angular.equals($scope.selectedItem.name, '')))
                $scope.save();
        };

        $scope.save = () => {

            $scope._group.put($scope.selectedItem).then(() => {
                $uibModalInstance.close($scope.selectedItem);
            });
        }

        function load() {

            $scope.selectedItem = {
                id: $scope.$resolve.data.contactGroupId,
                name: $scope.$resolve.data.name
            };

            Restangular.all('crm').one('contactgroup', $scope.selectedItem.id).get().then(result => {
                $scope._group = result;
                $scope.selectedItem.description = $scope._group.description;
            });
        };

        load();
    })
    .controller('categorizationDialogCtrl', ($scope, $uibModalInstance, Restangular, $log) => {

        $scope.contactId = $scope.$resolve.data.contactId;

        Restangular.all('crm').one('contactgroupsbycontact/' + $scope.contactId).get().then((groups) => {
            $scope.groups = groups.results;
        });

        $scope.save = (group, $event) => {

            if ($event.currentTarget.checked) {
                Restangular.service('crm/contactgroupmember').post({
                    ContactId: $scope.contactId,
                    ContactGroupId: group.contactGroupId
                }).then((result) => {
                });
            } else {
                Restangular.one('crm/contactgroupmember', group.Id).remove({
                    ContactId: $scope.contactId,
                    ContactGroupId: group.contactGroupId
                }).then((result) => {});
            }
        }

    })
    .controller('multipleCategorizationDialogCtrl', ($scope, $uibModalInstance, Restangular, $log) => {

        $scope.contactIds = $scope.$resolve.data.contactIds;

        //Traer todos porque al ser multiple no sabemos si por defecto viene tildada o no
        Restangular.all('crm').one('contactgroupsbysession/').get().then((groups) => {
            $scope.groups = groups.results;
        });

        $scope.save = (group, $event) => {

            if ($event.currentTarget.checked) {
                Restangular.service('crm/contactgroupmembers').post({
                    ContactIds: $scope.contactIds,
                    ContactGroupId: group.contactGroupId
                }).then((result) => {
                });
            } else {
                Restangular.one('crm/contactgroupmembers', group.Id).remove({
                    ContactIds: $scope.contactIds,
                    ContactGroupId: group.contactGroupId
                }).then((result) => { });
            }
        }

    })
    .controller('importDialogCtrl', ($scope, $uibModalInstance, Restangular, $log, FileUploader) => {
        
        $scope.document = {};

        $scope.mapColumns = [
            { value: 'cuit', name: 'CUIT' },
            { value: 'firstName', name: 'Nombre' },
            { value: 'lastName', name: 'Apellido' },            
            { value: 'personStreet', name: 'Calle' },
            { value: 'personStreetNumber', name: 'Número' },
            { value: 'personZipCode', name: 'CP' },
            { value: 'personFloor', name: 'Piso' },
            { value: 'personAppartment', name: 'Departamento' },
            { value: 'personLocation', name: 'Localidad' },
            { value: 'personProvince', name: 'Provincia' },
            { value: 'personPhone', name: 'Teléfono' },
            { value: 'personEmail', name: 'E-mail' },
            { value: 'personWebUrl', name: 'Página Web' },
            { value: 'personEmployerFirstName', name: 'Empleador Nombre' },
            { value: 'personEmployerLastName', name: 'Empleador Apellido' },
            { value: 'personEmployerCode', name: 'Empleador CUIT' },
            { value: 'personEmployerPhone', name: 'Empleador Teléfono' },
            { value: 'personSalary', name: 'Ingresos Empleado' },
            { value: 'personEmployeeStartDate', name: 'Fecha de Inicio Relación Laboral' },
            { value: 'bank', name: 'Banco' },
            { value: 'bankBranch', name: 'Sucursal Bancaria' },
            { value: 'cbu', name: 'CBU' },
            { value: 'currency', name: 'Moneda' },
            { value: 'groups', name: 'Grupos' }
        ]

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/crm/contacts/files?format=json',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false,
        });
        
        $scope.uploader.onCompleteItem = (item, response, status, headers) => {
            $scope.response = response;
            $scope.columns = _.map($scope.response.columns, (item) => { return {name: item, map: null} });
        }

        $scope.save = () => {
            var postObject = {
                fileName: $scope.response.fileName,
                columns: _.map($scope.columns, (item) => { return item["map"] })
            };
            Restangular.service('crm/contacts/import').post(postObject).then((result) => {
                $uibModalInstance.close(result.insertedItemsCount);
            });
        }

    })
    .controller('contactViewController', ($scope, Restangular, $log, $translate, PersonService, $stateParams, $templateCache, $state, $rootScope) => {
        var contactId = $stateParams.contactId;
        $scope.personService = PersonService;
        $scope.menu = $rootScope.session.menu;

        function load() {
            $scope.tabData = [];
            Restangular.all('crm').one('contact/' + contactId).get().then((result) => {
                $scope.contact = result;
                $scope.personId = $scope.contact.person.id;
                $scope.tabData = [
                    {
                        heading: 'Datos adicionales',
                        route: 'app.contact.info'
                    }
                ];

                var notImplementedTabs = ['financials', 'lms', 'catalog', 'system'];

                for (var i = 0; i < $scope.menu.length; i++) {
                    var item = $scope.menu[i];
                    var validTab = true;
                    if (item.text === 'sales' && $scope.contact.salesCount == 0) {
                        validTab = false;
                    } else if (item.text === 'procurement' && $scope.contact.procurementsCount == 0) {
                        validTab = false;
                    } else if (item.text === 'polls' && $scope.contact.pollsCount == 0) {
                        validTab = false;
                    } else if (item.text === 'Préstamos' && $scope.contact.loansCount == 0) {
                        validTab = false;
                    } else if (_.findIndex(notImplementedTabs, function (t) { return t == item.text }) != -1) {
                        validTab = false;
                    }

                    if (validTab) {
                        var state = item.text;
                        if (state === 'health') {
                            state += '.clinicalhistory'; //forzamos a abrir solapa de historia clinica
                        }

                        $scope.tabData.push({
                            heading: $translate.instant(item.text),
                            route: 'app.contact.' + state
                        });
                    }
                }

                if ($scope.contact.accountsCount != 0) {
                    $scope.tabData.push({
                        heading: 'Cuentas',
                        route: 'app.contact.businesspartner'
                    });
                }

                for (var tab in $scope.tabData) {
                    if ($scope.tabData[tab].route == $state.current.name
                        || (
                            $scope.tabData[tab].route == 'app.contact.health.clinicalhistory' &&
                            (
                                $state.current.name == 'app.contact.health.clinicalhistory'
                                || $state.current.name == 'app.contact.health.claims'
                                || $state.current.name == 'app.contact.health.documents'
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
            $state.go('app.crm.editcontact', { contactId: contactId });
        }

    })
    .controller('ContactsListController', ($scope, $translate, $stateParams, $state, Restangular, $log) => {
        $scope.groupId = $stateParams.groupId;
    })
    .controller('ContactEditController', ($scope, $translate, $stateParams, $state, Restangular, $log, dialogs) => {

        var id = $stateParams.contactId;

        function load() {
            if (id) {
                Restangular.one('crm').one('contact', id).get().then(result => {
                    $scope.contact = result;
                    $scope.contact.id = id;
                    $scope.contact.personId = $scope.contact.person.id;
                    $scope.contact.webUrl = $scope.contact.person.webUrl;

                    if (angular.isDefined($scope.contact.employer) && $scope.contact.employer.id > 0) {
                        $scope.contact.employerId = $scope.contact.employer.id;
                    }

                    if (angular.isDefined($scope.contact.bankAccount) && $scope.contact.bankAccount != null) {
                        $scope.contact.bankAccountId = $scope.contact.bankAccount.id;
                    }

                    if (angular.isDefined($scope.contact.employee) && $scope.contact.employee != null) {
                        $scope.contact.salary = $scope.contact.employee.salary;
                    }

                    if (angular.isDefined($scope.contact.bankAccounts)) {
                        $scope.contact.bankAccounts = _.map($scope.contact.bankAccounts, (item: any) => {
                            item.bankaccount = new Object();
                            item.bankaccount["bankBranchId"] = item.bankBranchId;
                            item.bankaccount["currencyId"] = item.currencyId;
                            item.bankaccount["code"] = item.bankAccountCode;
                            item.bankaccount["number"] = item.bankAccountNumber;
                            item.bankaccount["description"] = item.bankAccountDescription;
                            return item;
                        })
                    }
                });
            } else {
                $scope.contact = {
                    personId: null,
                    bankAccounts: []
                }
            }
        }

        $scope.editPerson = () => {
            $state.go('app.system.personedit', { personId: $scope.contact.personId });
        };

        $scope.save = () => {
            if (id) {
                $scope.contact.put().then(() => { $state.go('app.contacts'); });
            } else {
                Restangular.service('crm/contact').post($scope.contact).then(() => { $state.go('app.contacts'); });
            }
        }

        $scope.addContactBankAccounts = () => {
            var modalInstance = dialogs.create('app/crm/contacts/bank-account-modal.html', 'BankAccountModalController', {}, { size: 'lg', animation: false });
            modalInstance.result.then((result) => {
                Restangular.one('crm').one('employeebankbranch', result.bankaccount.bankBranchId).get().then((eba) => {
                    result["bankBranchName"] = eba.name;
                    result["bankName"] = eba.bankName;
                    result["bankAccountNumber"] = result.bankaccount.number;
                    $scope.contact.bankAccounts.push(result);
                });
            }, () => { });
        }

        $scope.removeContactBankAccounts = (bankAccount) => {
            if (angular.isDefined(bankAccount)) {
                var index = $scope.contact.bankAccounts.indexOf(bankAccount);
                $scope.contact.bankAccounts.splice(index, 1);
            }
        }

        load();
    })
    .controller('BankAccountModalController', ($log, $scope, data, $uibModalInstance) => {
        $scope.save = () => {
            $uibModalInstance.close($scope.bankaccount);
        }
    })
    .controller('ContactHealthController', ($log, $scope, $stateParams, Restangular) => {
        var contactId = $stateParams.contactId;

        $scope.tabDataHealth = [
            {
                heading: 'Historia Clínica',
                route: 'app.contact.health.clinicalhistory'
            },
            {
                heading: 'Reclamos',
                route: 'app.contact.health.claims'
            },
            {
                heading: 'Documentos',
                route: 'app.contact.health.documents'
            }
        ];

        function load() {
            Restangular.one('crm').one('contact/' + contactId + '/patient').get().then(result => {
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
    .controller('ContactHealthPatientClinicalhistoryController', ($log, $scope) => {

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
    .controller('ContactHealthPatientClaimsController', ($log, $scope) => {

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
    .controller('ContactHealthPatientDocumentsController', ($log, $scope, $window, Restangular) => {
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
    .controller('ContactCrmController', ($log, $scope, $window) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.contact) {
                    $scope.$broadcast('loadData', $scope.contact.person.id);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.contact.person.id);
        });

    })
    .controller('ContactLoanController', ($log, $scope, $window, Restangular) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.contact) {
                    $scope.$broadcast('loadData', $scope.contact.person.id);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.contact.person.id);
        });

    })
    .controller('ContactPollsController', ($log, $scope, $window, Restangular) => {
        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.contact) {
                    $scope.$broadcast('loadData', $scope.contact.person.id);
                }
            });
        $scope.$on('loaded', () => {
            $scope.$broadcast('loadData', $scope.contact.person.id);
        });

    })
    .controller('ContactBusinessPartnerController', ($log, $scope, $window) => {

        $scope.$on('$viewContentLoaded',
            (event) => {
                if ($scope.contact) {
                    $scope.$broadcast('loadData', $scope.contact.person.id);
                }
            });
        $scope.$on('loaded', () => {
            if (angular.isDefined($scope.contact)) {
                $scope.$broadcast('loadData', $scope.contact.person.id);
            }
        });

    })
    .controller('StartCampaignDialogCtrl', ($log, $scope, Restangular, data, $uibModalInstance) => {
        
        $scope.save = () => {

            Restangular
                .service('crm/contacts/startcampaign')
                .post({
                    contactIds: data.ids,
                    campaignId: $scope.campaign.id
                })
                .then((result) => {
                    $uibModalInstance.close($scope.selectedItem);
                });
        }
    })
    .directive('contactsGrid', ($log, $compile, $state, $document, dialogs, Restangular, $http, $timeout, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', groupId: '=', filter: '=' },
            link(scope: any, element) {
                const gridElementName = 'contactsGrid';
                const pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                const pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                scope.groupId = scope.groupId || 'all';
                scope.height = scope.height || 400;

                function nameFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _strcontent = '<div class="boldfontcell" style="margin-left: 20px;" >';
                    _strcontent += '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/someone_small.jpg);"></div>';
                    _strcontent += '<a ui-sref="app.system.person({ personId: ' + rowObject.personId + '})"><span>' + rowObject.name + '</span></a></div>';
                    return _strcontent;
                }

                function addressFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _address = rowObject.address || '';
                    return '<div class="largefontcell"><div class="contact-cell" >' + _address + '</div></div>';
                }

                function numberFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _number = rowObject.number || '';
                    return '<div class="largefontcell"><div class="contact-cell" >' + _number + '</div></div>';
                }

                function employerFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _employer = rowObject.employerName || '';
                    return '<div class="largefontcell"><div class="contact-cell" >' + _employer + '</div></div>';
                }
                
                scope.abrirModalGrupos = (rowId) => {
                    var modalInstance = dialogs.create('app/crm/contacts/categorizationmodal.html', 'categorizationDialogCtrl', { contactId: rowId }, { size: 'md', animation: false });
                    modalInstance.result.then((result) => { }, () => {
                        gridElement.trigger('reloadGrid');
                    });
                }

                scope.eliminarContacto = (rowId) => {
                    if (!confirm("Desea eliminar el contacto seleccionado?")) {
                        return;
                    }

                    Restangular
                        .one('crm/contact', rowId)
                        .remove({
                            Id: rowId
                        })
                        .then((result) => {
                            gridElement.trigger('reloadGrid');
                        });   
                }
                
                function menuFormatter(cellvalue: any, options: any, rowObject: any) {
                     
                    //'<div class="btn-group" uib-dropdown style="position: absolute">' +
                       // '<a href uib-dropdown-toggle id="menu_' + rowObject.contactId + '"><i class="fa fa-ellipsis-v" ></i></a>' +
                       return   '<div class="btn-group" uib-dropdown style="position: absolute;margin-top: -15px;"> ' +
                      ' <button data-toggle="dropdown" class="btn btn-white dropdown-toggle" type="button"> <span class="caret"></span></button> ' +

                       '<ul class="dropdown-menu pull-right" uib-dropdown-menu role="menu" aria-labelledby="menu_' + rowObject.contactId + '" style="z-index: 99999!important;margin-right:10px">' +
                        '<li style="z-index: 99999!important" ><a href="#" ui-sref="app.contact.info({ contactId: ' + rowObject.contactId + '})">Ver </a></li>' +
                        '<li  ><a href="#" ui-sref="app.crm.editcontact({ contactId: ' + rowObject.contactId + '})">Editar </a></li>' +
                        '<li  ><a href ng-click="$event.preventDefault(); abrirModalGrupos(' + rowObject.contactId + ')">Etiquetar </a></li>' +
                        '<li  ><a href ng-click="$event.preventDefault(); abrirModalGrupos(' + rowObject.contactId + ')">Enviar correo </a></li>' +
                        //'<li class="divider" ></li>' +
                        '<li ><a href ng-click="$event.preventDefault(); eliminarContacto(' + rowObject.contactId + ')">Remover </a></li> ' +
                        '</ul></div> ';
                };

                const colNames = ['', 'Apellido y Nombre', 'Email', 'Teléfono', 'Empleador', ''];
                const colModel: Array<any> = [
                    {
                        name: 'contactId',
                        index: 'contactId',
                        hidden: true,
                        key: true
                    },
                    {
                        name: 'name',
                        index: 'nameContains',
                        sortable: true,
                        search: true,
                        formatter: nameFormatter,
                        width: 300
                    },
                    {
                        name: 'address',
                        index: 'addressContains',
                        sortable: true,
                        search: true,
                        formatter: addressFormatter
                    },
                    {
                        name: 'number',
                        index: 'numberContains',
                        sortable: true,
                        search: true,
                        formatter: numberFormatter
                    },
                    {
                        name: 'employer',
                        index: 'employerContains',
                        sortable: true,
                        search: true,
                        formatter: employerFormatter
                    },
                    {
                        name: 'menu',
                        formatter: menuFormatter,
                        fixed: true,
                        width: 35
                    }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/crm/contactsbygroup/' + scope.groupId + '.json',
                    datatype: 'json',
                    height: scope.height,
                    rowHeight: 100,
                    autowidth: true,
                    shrinkToFit: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    hoverrows: false,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    recreateForm: true,
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    jsonReader: {
                        page: obj => ((obj.offset / 100) + 1),
                        total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                        records: 'total',
                        repeatitems: false,
                        root: 'results'
                    },
                    loadComplete: () => {
                        //No usar esta línea porque trae problemas con angular. Se resetea lista de tildados desde scope padre.
                        //scope.$emit('selectionChanged', { ids: gridElement.getGridParam('selarrrow') });
                        $compile(angular.element('#' + gridElementName))(scope);
                    },
                    beforeRequest: () => {
                        var currentPage = gridElement.jqGrid('getGridParam', 'page');
                        gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                    },
                    beforeSelectRow: () => {
                        return true;
                    },
                    multiselect: true,
                    multiboxonly: true,
                    onCellSelect: (rowId, iCol) => {
                    },
                    onSelectRow: (rowId, status, e) => {
                        if (angular.isDefined(e)) {
                            scope.$emit('selectionChanged', { ids: gridElement.getGridParam('selarrrow') });
                        }
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                //gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');
                
                $('.ui-jqgrid-hdiv').hide();

                scope.$on('refresh', () => {
                    gridElement.setGridParam({ url: API_HOST + '/api/crm/contactsbygroup/' + scope.groupId + '.json?q=' + scope.filter });
                    gridElement.trigger('reloadGrid');
                });

                //@params: { actionId: ..., ids: [] }
                scope.$on('action', (event, params) => {

                    var ids = _.map(params.ids, (id) => {
                        return (_.isString(id)) ? _.toInteger(id) : id;
                    });

                    switch (params.actionId) {
                        case 1:
                            var modalInstance = dialogs.create('/app/crm/contacts/start-campaign-modal.html',
                                'StartCampaignDialogCtrl',
                                { ids: ids },
                                'lg');
                            modalInstance.result.then((obj) => { }, () => { });
                            break;
                        case 2:
                            var modalInstance = dialogs.create('app/crm/contacts/categorizationmodal.html', 'multipleCategorizationDialogCtrl', { contactIds: ids }, { size: 'md', animation: false });
                            modalInstance.result.then((result) => { }, () => {
                                //gridElement.trigger('reloadGrid');
                            });

                    }
                    
                });
                
                scope.$on('selectAll', () => {
                    
                    gridElement.jqGrid('resetSelection');
                    var ids = gridElement.jqGrid('getDataIDs');

                    for (var i = 0, il = ids.length; i < il; i++) {
                        gridElement.jqGrid('setSelection', ids[i], true);
                    }
                    
                    //scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));

                    var url = gridElement.getGridParam('url').replace("contactsbygroup", "contactsbygroupids");
                    
                    $http.get(url).then((data) => {
                        var ids = _.map(data.data.results, (obj) => {
                            return obj["id"];
                        });
                        
                        $timeout(() => {
                            scope.$emit('selectionChanged', { ids: ids });
                        });
                    });
                    
                });

                scope.$on('unSelectAll', () => {
                    gridElement.jqGrid('resetSelection');
                    scope.$emit('selectionChanged', { ids: gridElement.getGridParam('selarrrow') });
                });
            }
        };
    });