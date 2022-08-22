angular.module('app.health.treatmentrequests', ['app.health'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.health.treatmentrequests', {
                url: '/treatmentrequests',
                controller: 'HealthTreatmentRequestsListController',
                templateUrl: 'app/health/treatmentrequest/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.treatmentrequests'
                }
            })
            .state('app.health.treatmentrequestnew', {
                url: '/treatmentrequests/new',
                controller: 'HealthTreatmentRequestEditController',
                resolve: loadSequence('ui.tree', 'icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                templateUrl: 'app/health/treatmentrequest/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.treatmentrequests',
                    label: 'health.treatmentrequest.new'
                }
            })
            .state('app.health.treatmentrequestedit', {
                url: '/treatmentrequests/{treatmentRequestId}/edit',
                controller: 'HealthTreatmentRequestEditController',
                resolve: loadSequence('ui.tree', 'icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
                templateUrl: 'app/health/treatmentrequest/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.treatmentrequests',
                    label: 'health.treatmentrequest'
                }
            })
            .state('app.health.treatmentrequest', {
                url: '/treatmentrequests/{treatmentRequestId}',
                controller: 'HealthTreatmentRequestViewController',
                resolve: loadSequence('angularFileUpload'),
                templateUrl: 'app/health/treatmentrequest/view.html',
                ncyBreadcrumb: {
                    parent: 'app.health.treatmentrequests',
                    label: 'health.treatmentrequest'
                }
            })
            .state('app.health.treatmentrequeststatus', {
                url: '/treatmentrequeststatus',
                controller: 'HealthTreatmentRequestStatusListController',
                templateUrl: 'app/health/treatmentrequeststatus/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'health.treatmentrequeststatus'
                }
            })
            .state('app.health.treatmentrequeststatusnew', {
                url: '/treatmentrequeststatus/new',
                controller: 'HealthTreatmentRequestStatusEditController',
                templateUrl: 'app/health/treatmentrequeststatus/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.treatmentrequeststatus',
                    label: 'health.treatmentrequeststatus.new'
                }
            })
            .state('app.health.treatmentrequeststatusesit', {
                url: '/treatmentrequeststatus/{pharmacyId}',
                controller: 'HealthTreatmentRequestStatusEditController',
                templateUrl: 'app/health/treatmentrequeststatus/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.health.treatmentrequeststatus',
                    label: 'health.treatmentrequeststatus.item'
                }
            });
    }
    ])
    .controller('HealthTreatmentRequestsListController', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            filter: null,
            view: 0,
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.health.treatmentrequestnew');
        }

        $scope.refresh = () => {
            load();
        };

        $scope.view = (id) => {
            $state.go('app.health.treatmentrequest', { treatmentRequestId: id });
        };

        $scope.canEdit = () => {
            return $scope.params.view === 0 || $scope.session.isAdmin();
        }

        $scope.edit = (id) => {
            $state.go('app.health.treatmentrequestedit', { treatmentRequestId: id });
        };

        function load() {
            $scope.$broadcast('loadData');
        }

        load();
    })
    .controller('HealthTreatmentRequestViewController', ($log, $scope: any, $translate, $stateParams, $state, $filter, $window, Restangular, dialogs, FileUploader) => {
        var id = $stateParams.treatmentRequestId;
        var workflowInstance;

        $scope.serviceUrl = 'health/treatmentrequests/' + $stateParams.treatmentRequestId + '/messages';

        $scope.uploader = new FileUploader({
            scope: $scope,
            url: '/api/health/treatmentrequests/' + id + '/files',
            autoUpload: true,
            queueLimit: 100,
            removeAfterUpload: false,
        });

        $scope.uploader.onCompleteAll = () => {
            Restangular.one('health').one('treatmentrequests', id).one('files').get().then(result => {
                $scope.treatmentRequest.files = result.results;
            });
        };

        $scope.params = {
            canApprove: false,
            canGoBack: true
        };

        $scope.assign = (roleId) => {
            workflowInstance.customPOST({ roleId: roleId }, 'assign').then(() => { load(); });
        };

        $scope.approve = () => {
            workflowInstance.customPOST(null, 'approve').then(() => { load(); });
        };

        $scope.terminate = (reasonId) => {
            workflowInstance.customPOST({ reasonId: reasonId }, 'terminate').then(() => { load(); });
        };

        $scope.setPreviousState = () => {
            workflowInstance.customPOST(null, 'previousstate').then(() => { load(); });
        };

        $scope.edit = () => {
            $state.go('app.health.treatmentrequestedit', { treatmentRequestId: id });
        };

        $scope.openFile = (file) => {
            $window.open('api/health/treatmentrequests/' + $scope.treatmentRequest.id + '/files/' + file.guid);
        };

        function load() {
            if (id) {
                Restangular.one('health').one('treatmentrequests', id).get().then(treatmentRequest => {
                    $scope.treatmentRequest = treatmentRequest;

                    _.forEach(treatmentRequest.workflowInstance.tags, (item:any) => {
                        item.workflowTagPathPath = angular.fromJson(item.workflowTagPathPath);
                    });

                    workflowInstance = Restangular.one('system').one('workflows').one('workflowinstances', $scope.treatmentRequest.workflowInstance.guid);

                    Restangular.one('system').one('workflows').one('workflowactivities', treatmentRequest.workflowInstance.currentWorkflowActivityId).get().then(workflowActivity => {
                        $scope.currentWorkflowActivity = workflowActivity.plain();

                        var roles: Array<any> = treatmentRequest.workflowInstance.assignedRoles;
                        var allowedRoles: Array<any> = _.map(roles, 'roleName');
                        var isAssigned = allowedRoles.length === 0 || _.intersection($scope.session.roles, allowedRoles).length > 0;
                        var isSupervisor = _.filter(treatmentRequest.workflowInstance.userPermissions, (item: any) => { return _.includes($scope.session.roles, item.roleName) && item.permission === 2 }).length > 0;
                        var isAdmin = $scope.session.isAdmin();
                        $scope.params.canApprove = (isAdmin || isAssigned || isSupervisor) && !workflowInstance.isTerminated && !workflowActivity.isFinal;
                        $scope.params.progress = $filter('number')($scope.treatmentRequest.workflowInstance.progress, 0) + '%';

                    });

                    Restangular.one('health').one('patients', $scope.treatmentRequest.patientId).get().then(patient => {
                        $scope.patient = patient.plain();
                    });
                });
            } else {
                $scope.treatmentRequest = {}
            }
        }

        $scope.$on('reloadMessages', (event, messages) => {
            $scope.treatmentRequest.messages = messages;
        });

        $scope.save = () => {
            if (id) {
                $scope.request.put().then(() => { $state.go('app.health.treatmentrequest'); });
            } else {
                Restangular.service('health/treatmentrequests').post($scope.treatmentRequest).then(() => { $state.go('app.health.treatmentrequest'); });
            }
        }

        $scope.newCommercialDrug = () => {
            var modalInstance = dialogs.create('app/health/commercialdrug/editmodal.html', 'HealthCommercialDrugEditModalController', {}, { size: 'md', animation: false });
            modalInstance.result.then((result) => {
                $scope.treatmentRequest.commercialDrugId = result.id;
                $scope.$broadcast('refresh');
            }, () => { });
        };

        load();
    })
    .controller('HealthTreatmentRequestEditController', ($scope: any, $translate, $stateParams, $state, $log, Restangular, dialogs, toastr) => {
        var id = $stateParams.treatmentRequestId;

        function load() {
            if (id) {
                Restangular.one('health').one('treatmentrequests', id).get().then(result => {
                    $scope.treatmentRequest = result;
                    if (result.diagnostics.length > 0) {
                        $scope.treatmentRequest.doctorId = result.diagnostics[0].doctorId;
                    }
                });
            } else {
                var items = [];
                var workflowId = 2;
                $scope.treatmentRequest = {
                    diagnostics: [],
                    drugs: [],
                    products: [],
                    practices: [],
                    workflowInstance: { tags: items, workflowId: workflowId }
                }
            }
        }

        $scope.view = () => {
            $state.go('app.health.treatmentrequest', { treatmentRequestId: $scope.treatmentRequest.id });
        };

        $scope.save = () => {
            if (id) {
                $scope.treatmentRequest.put().then(() => {
                    toastr.success('Solicitud de prestación', 'Solicitud actualizada');
                    $state.go('app.health.treatmentrequests');
                });
            } else {
                Restangular.service('health/treatmentrequest').post($scope.treatmentRequest).then(() => {
                    toastr.success('Solicitud de prestación', 'Nueva solicitud creada');
                    $state.go('app.health.treatmentrequests');

                });
            }
        }

        //#region Diagnostics
        $scope.addPatientDiagnostic = () => {
            
            Restangular.one('health').one('diseases', $scope.params.diseaseId).get().then((disease) => {
                
                var patientDiagnostic = {
                    diseaseId: disease.id,
                    disease: disease,
                    comments: null
                };

                $scope.treatmentRequest.diagnostics.push(patientDiagnostic);
                $scope.params.diseaseId = null;
            });
        };

        $scope.removePatientDiagnostic = (item) => {
            var index = $scope.treatmentRequest.diagnostics.indexOf(item);
            $scope.treatmentRequest.diagnostics.splice(index, 1);
        }
        //#endregion

        //#region Drugs
        $scope.addTreatmentRequestDrug = () => {
            Restangular.one('health').one('commercialdrugs', $scope.params.commercialDrugId).get().then((commercialDrug) => {
                var drug = {
                    drugId: commercialDrug.drugId,
                    commercialDrugId: commercialDrug.id,
                    commercialDrug: commercialDrug.plain(),
                    quantity: 1,
                    frequency: null,
                    comments: null
                };

                $scope.treatmentRequest.drugs.push(drug);
                $scope.params.commercialDrugId = null;
            });
        };

        $scope.removeTreatmentRequestDrug = (item) => {
            var index = $scope.treatmentRequest.drugs.indexOf(item);
            $scope.treatmentRequest.drugs.splice(index, 1);
        }
        //#endregion

        //#region Products
        $scope.addTreatmentRequestProduct = () => {
            Restangular.one('catalog').one('products', $scope.params.productId).get().then((product) => {
                var treatmentRequestProduct = {
                    productId: product.id,
                    product: product.plain(),
                    quantity: 1,
                    comments: null
                };

                $scope.treatmentRequest.products.push(treatmentRequestProduct);
                $scope.params.productId = null;
            });
        };

        $scope.removeTreatmentRequestProduct = (item) => {
            var index = $scope.treatmentRequest.products.indexOf(item);
            $scope.treatmentRequest.products.splice(index, 1);
        }

        $scope.showProductInfo = (product) => {
            var modalInstance = dialogs.create('app/health/treatmentrequest/productmodal.html', 'HealthTreatmentRequestProductModalController', product, { size: 'md', animation: false });
            modalInstance.result.then((result) => {
                angular.merge(product, result);
            }, () => { });
        }
        //#endregion

        //#region Practices
        $scope.addTreatmentRequestPractice = () => {
            Restangular.one('health').one('medicalpractices', $scope.params.medicalPracticeId).get().then((medicalPractice) => {
                var treatmentRequestPractice = {
                    medicalPracticeId: medicalPractice.id,
                    medicalPractice: medicalPractice.plain(),
                    quantity: 1,
                    frequency: null,
                    comments: null
                };

                $scope.treatmentRequest.practices.push(treatmentRequestPractice);
                $scope.params.medicalPracticeId = null;
            });
        };

        $scope.removeTreatmentRequestPractice = (item) => {
            var index = $scope.treatmentRequest.practices.indexOf(item);
            $scope.treatmentRequest.practices.splice(index, 1);
        }

        $scope.showPracticeInfo = (practice) => {
            var modalInstance = dialogs.create('app/health/treatmentrequest/practicemodal.html', 'HealthPracticeModalController', practice, { size: 'md', animation: false });
            modalInstance.result.then((result) => {
                angular.merge(practice, result);
            }, () => { });
        }
        //#endregion

        load();
    })
    .controller('HealthTreatmentRequestProductModalController', ($scope, $uibModalInstance, data) => {
        $scope.product = data;

        $scope.save = () => {
            $uibModalInstance.close($scope.product);
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    })
    .controller('HealthPracticeModalController', ($scope, $uibModalInstance, data) => {
        $scope.practice = data;

        $scope.save = () => {
            $uibModalInstance.close($scope.practice);
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    })
    .directive('healthTreatmentRequestsGrid', ($state, $log, $compile, $filter, authManager) => {
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
                var gridElementName = 'healthTreatmentRequestsGrid';
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

                scope.canEdit = () => {
                    return scope.view === 0;
                };

                scope.edit = (id) => {
                    $state.go('app.health.treatmentrequestedit', { treatmentRequestId: id });
                }

                function claimIdFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<span class="largefontcell">' + rowObject.workflowCode + '-' + rowObject.id + '</span>';
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

                function claimDataFormatter(cellvalue: any, options: any, rowObject: any) {
                    var createDate = $filter('amDateTime')(rowObject.workflowInstanceCreateDate);
                    var date = $filter('amDateTime')(rowObject.date);
                    return 'Solicitud de prestación | <small>Paciente</small> <a data-ui-sref="app.system.person({ personId: ' + rowObject.personId + ' })" title="Ver ficha">' + rowObject.personName + '</a><br><small>Creada el ' + createDate + '</small><br><small>Fecha ' + date + '</small></td>';
                }

                function claimActionsFormatter(cellvalue: any, options: any, rowObject: any) {
                    var result = '<a href="#" data-ui-sref="app.health.treatmentrequest({ treatmentRequestId: ' + rowObject.id + ' })" class="btn btn-white btn-sm"><i class="fa fa-folder"></i> Ver </a>';
                    if (scope.canEdit()) {
                        result += '<button type="button" data-ng-click="edit(' + rowObject.id + ')" class="btn btn-white btn-sm"><i class="fa fa-pencil"></i> Editar</button>';
                    }

                    return result;
                }

                function workflowProgressFormatter(cellvalue: any, options: any, rowObject: any) {
                    return '<small> Completa al: ' + rowObject.workflowInstanceProgress + ' % </small><div class="progress progress-mini"><div style="width:' + rowObject.workflowInstanceProgress + '%;" class="progress-bar"></div></div>';
                }

                var colNames = ['', '', '', '', ''];
                var colModel: Array<any> = [
                    { name: 'code', index: 'code', width: 90, fixed: true, search: true, formatter: claimIdFormatter },
                    { name: 'workflowStatus', index: 'workflowStatus', width: 150, fixed: true, search: true, formatter: workflowStatusFormatter },
                    { name: 'claimData', index: 'claimData', search: false, formatter: claimDataFormatter },
                    { name: 'workflowProgress', index: 'workflowProgress', width: 150, fixed: true, search: false, formatter: workflowProgressFormatter },
                    { name: 'actions', index: 'actions', width: 150, fixed: true, search: false, formatter: claimActionsFormatter }
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
                    var url = '/api/health/treatmentrequests.json';
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
    });