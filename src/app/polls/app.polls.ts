angular.module('app.polls', ['app.core', 'gridstack-angular'])
    .config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('app.polls', {
                template: '<div data-ui-view=""></div>',
                ncyBreadcrumb: {
                    skip: true,
                    parent: 'app.dashboard'
                }
            })
            .state('app.polls.query', {
                url: '/polls',
                controller: 'PollsController',
                templateUrl: 'app/polls/index.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.polls',
                    label: 'polls'
                }
            })
            .state('app.polls.new', {
                url: '/polls/new',
                controller: 'PollNewController',
                templateUrl: 'app/polls/new.html',
                resolve: loadSequence('toastr', 'icheck', 'jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.polls',
                    label: 'polls.newpoll'
                }
            })
            .state('app.polls.newinstance', {
                url: '/polls/{formId}/new?personId',
                controller: 'PollController',
                templateUrl: 'app/polls/edit.html',
                resolve: loadSequence('toastr', 'icheck'),
                ncyBreadcrumb: {
                    parent: 'app.polls.query',
                    label: 'polls.newpoll'
                }
            })
            .state('app.polls.forms', {
                url: '/polls/{formId}/forms',
                controller: 'PollFormController',
                templateUrl: 'app/polls/list.html',
                resolve: loadSequence(/*'toastr', */'jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.polls.query',
                    label: 'polls'
                }
            })
            .state('app.polls.editinstance', {
                url: '/polls/{formId}/forms/formresponse/{formResponseId}',
                controller: 'PollEditController',
                templateUrl: 'app/polls/edit.html',
                resolve: loadSequence('toastr', 'icheck'),
                ncyBreadcrumb: {
                    parent: 'app.polls.forms',
                    label: 'polls.newpoll'
                }
            })
            .state('app.polls.viewinstance', {
                url: '/polls/{formId}/forms/formresponse/{formResponseId}/view',
                controller: 'PollViewController',
                templateUrl: 'app/polls/view.html',
                resolve: loadSequence('toastr', 'icheck'),
                ncyBreadcrumb: {
                    parent: 'app.polls.forms',
                    label: 'polls.querypolls'
                }
            });
        
    }
    ])
    .controller('PollsController', ['$scope', '$translate', '$state', '$log', ($scope, $translate, $state, $log) => {

    }])
    .controller('PollNewController', ['$scope', '$translate', '$state', '$log', '$http', 'dialogs', ($scope, $translate, $state, $log, $http, dialogs) => {
        $http.get(API_HOST + '/api/cms/forms.json?take=1000&typeId=1').then((data) => {
            $scope.forms = data.data.results;
        });

        $scope.startPoll = () => {
            $http.get(API_HOST + '/api/cms/person/' + $scope.params.personId + '/polls/').then((data) => {
                var params = { formId: $scope.params.selectedForm, personId: $scope.params.personId };
                if (data.data.total > 0) {

                    var modalInstance = dialogs.create('app/polls/polls-list-modal.html', 'PollsListModalController', { personId: $scope.params.personId }, { size: 'lg', animation: false });
                    modalInstance.result.then((result) => {
                        if (angular.isDefined(result)) {
                            $state.go('app.polls.editinstance', result);
                        } else {
                            $state.go('app.polls.newinstance', params);
                        }
                        
                    }, () => { });

                } else {
                    $state.go('app.polls.newinstance', params);
                }
            });
            
        };
        
    }])
    .controller('PollsListModalController', ['$scope', 'data', '$http', '$log', '$uibModalInstance', ($scope, data, $http, $log, $uibModalInstance) => {
        $scope.personId = data.personId;

        $http.get(API_HOST + '/api/system/persons/' + $scope.personId).then((data) => {
            $scope.person = data.data;
        });

        $scope.continue = () => {
            $uibModalInstance.close();
        }
        
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        }

        $scope.$on('edit', (event, params) => {
            $uibModalInstance.close(params);
        });
    }])
    .controller('PollController', ['$scope', '$translate', '$state', '$stateParams', '$log', '$http', ($scope, $translate, $state, $stateParams, $log, $http) => {
        $scope.id = $stateParams.formId;
        $http.get(API_HOST + '/api/cms/forms/' + $stateParams.formId).then((data) => {
            _.forEach(data.data.fields, function (field:any) {
                if (field.value === '<p></p>') {
                    field.value = null;
                }
            });
            $scope.form = data.data;

            $http.get(API_HOST + '/api/system/persons/' + $stateParams.personId).then((data) => {
                $scope.form.person = data.data;
            });
        });
        
    }])
    .controller('PollFormController', ['$scope', '$state', '$stateParams', '$log', '$http', ($scope, $state, $stateParams, $log, $http) => {
        $scope.formId = $stateParams.formId;
        $scope.form = { allowUpdates: 1 };

        $http.get(API_HOST + '/api/cms/forms/' + $stateParams.formId).then((data) => {
            _.forEach(data.data.fields, function (field:any) {
                if (field.value === '<p></p>') {
                    field.value = null;
                }
            });
            $scope.form = data.data;

        });

    }])
    .controller('PollEditController', ['$scope', '$state', '$stateParams', '$log', '$http', ($scope, $state, $stateParams, $log, $http) => {
        $scope.formResponseId = $stateParams.formResponseId;
        $scope.form = {};
        $scope.form.person = {};
        $scope.formResponse = {};

        $http.get(API_HOST + '/api/cms/formresponse/' + $scope.formResponseId).then((data) => {
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
            
        });

    }])
    .controller('PollViewController', ['$scope', '$state', '$stateParams', '$log', '$http', ($scope, $state, $stateParams, $log, $http) => {
        $scope.formResponseId = $stateParams.formResponseId;
        $scope.form = {};
        $scope.form.person = {};
        $scope.formResponse = {};

        $http.get(API_HOST + '/api/cms/formresponse/' + $scope.formResponseId).then((data) => {
            $scope.form = data.data.form;
            $scope.form.person = data.data.person;
            $scope.form.formResponse = data.data.formResponse;
            for (var i = 0; i < $scope.form.fields.length; i++) {
                if ($scope.form.formResponse.fields[i]) {
                    $scope.form.fields[i].value = $scope.form.formResponse.fields[i].value;
                }
            }

        });

    }])
    .directive('pollsGrid', ($state, $window, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'pollsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function responsesFormatter(cellvalue, options, rowObject) {
                    return (rowObject.responses);
                }

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-eye fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    gridModel.colNames = ['Id', 'Nombre', 'Inscriptos', '', ''];
                    gridModel.colModel = [
                        { name: 'id', index: 'id', width: 60, fixed: true, align: 'right' },
                        { name: 'name', index: 'name' },
                        { name: 'responses', index: 'responses', formatter: responsesFormatter, search: false, align: 'center', width: 130, fixed: true },
                        { name: 'exportCommand', index: 'exportCommand', width: 25, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'viewCommand', index: 'viewCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false }
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    scope.height = scope.height || 450;
                    var gridModel = buildGridModel();
                    var url = `${API_HOST}/api/cms/forms.json?typeId=1`;

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
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
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                            var ids = gridElement.jqGrid('getDataIDs');
                            for (var i = 0; i < ids.length; i++) {
                                var editCommand = '<span class="command-cell glyphicon glyphicon-pencil" title="Editar"></span>';
                                var exportCommand = '<span class="command-cell glyphicon glyphicon-export" title="Exportar inscriptos"></span>';
                                gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand, exportCommand: exportCommand });
                            }
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 3:
                                    $window.open(API_HOST + '/api/cms/forms/' + rowId + '/results');
                                    scope.$apply();
                                    break;
                                case 4:
                                    $state.go('app.polls.forms', { formId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                    gridElement.jqGrid('setGroupHeaders', {
                        useColSpanStyle: true,
                        groupHeaders: [
                            { startColumnName: 'issued', numberOfColumns: 2, titleText: 'Instrumentos' }
                        ]
                    });
                    gridElement.jqGrid('filterToolbar', { autosearch: true });
                }

                scope.$on('refresh', () => {
                    gridElement.setGridParam({ url: '/api/forms?q=' + scope.filter + '&showOnlyActive=' + scope.showOnlyActive });
                    gridElement.trigger('reloadGrid');
                });

                loadGrid();
            }
        };
    })
    .factory('PollService', [() => {
        var statusTypes: Array<IHasIdAndName> = [
            { id: 0, name: 'ABIERTA' },
            { id: 1, name: 'CERRADA' }
        ];
        
        return {
            statusTypes: statusTypes,
            getStatusTypeName: (id: number) => {
                var statusType: IHasIdAndName = _.find(statusTypes, { id: id });
                return statusType.name;
            }
        }
    }])
    .directive('pollsFormsResponsesGrid', (PollService, $state, $window, $http, dialogs, $log) => {
        return {
            restrict: 'A',
            scope: { formId: '=', form: '=' },
            link: (scope: any, element) => {

                var gridElementName = 'formResponsesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function buildGridModel() {

                    function statusFormatter(cellvalue: any, options: any, rowObject: any) {
                        return PollService.getStatusTypeName(rowObject.statusId);
                    }
                    
                    function EditButtonFormatter(cellvalue: any, options: any, rowObject: any) {
                        return '<i class="fa fa-pencil fa-fw hand"></i>';
                    }
                    
                    function viewFormatter(cellvalue, options, rowObject) {
                        return '<i class="fa fa-eye fa-fw hand" ></i>';
                    }

                    var gridModel: any = {};

                    gridModel.colNames = ['Id', 'Nombre','Usuario','Fecha Inicio','Fecha Fin','Estado', '', '', ''];
                    gridModel.colModel = [
                        { name: 'id', index: 'id', width: 30, align: 'right' },
                        { name: 'name', index: 'name', width: 200 }, //, index: 'nameContains'
                        { name: 'userName', index: 'userName', width: 150 }, //, index: 'userNameContains'
                        { name: 'startDate', index: 'startDate', formatter: 'date', align: 'right', search: false },
                        { name: 'endDate', index: 'endDate', formatter: 'date', align: 'right', search: false },
                        { name: 'statusId', index: 'statusId', width: 50, formatter: statusFormatter, search: false },
                        { name: 'editCommand', index: 'editCommand', width: 25, formatter: EditButtonFormatter, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'deleteCommand', index: 'deleteCommand', hidden: true, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'viewCommand', index: 'viewCommand', width: 25, formatter: viewFormatter, fixed: true, align: 'center', sortable: false, search: false }
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    //$.jgrid.gridUnload('#${gridElementName}');

                    var gridModel = buildGridModel();
                    var url = '/api/cms/polls/' + scope.formId + '/responses.json?q=';

                    gridElement = $('#' + gridElementName);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        height: 400,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        datatype: 'json',
                        url: url,
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        rowNum: 100,
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                            /*var ids = gridElement.jqGrid('getDataIDs');
                            for (var i = 0; i < ids.length; i++) {
                                var deleteCommand = '<span class="command-cell glyphicon glyphicon-remove"></span>';
                                gridElement.jqGrid('setRowData', ids[i], { deleteCommand: deleteCommand });
                            }*/
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 6:
                                    
                                    function editar() {
                                        $state.go('app.polls.editinstance', { formResponseId: rowId, formId: scope.formId });
                                    }

                                    var rowData = gridElement.getRowData(rowId);
                                    var estado = rowData.statusId;
                                    if (estado == 'ABIERTA') {
                                        editar();
                                    } else {
                                        var allowUpdates = scope.form.allowUpdates;
                                        if (allowUpdates) {
                                            if (confirm("Desea reabrir la encuesta?")) {
                                                editar();
                                            }
                                        } else {
                                            alert("No está permitido reabrir esta encuesta");
                                        }
                                    }
                                    break;
                                case 7:                                    
                                    break;
                                case 8:
                                    $state.go('app.polls.viewinstance', { formResponseId: rowId, formId: scope.formId });
                                    break;
                            }

                            return false;
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                    
                    gridElement.jqGrid('filterToolbar', { autosearch: true });
                }

                loadGrid();
            }
        };
    })
    .directive('pollsPersonResponsesGrid', (PollService, $state, $window, $log) => {
        return {
            restrict: 'A',
            scope: { height: '@', personId: '='},
            link: (scope: any, element) => {

                var gridElementName = 'personResponsesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);
                scope.height = scope.height || 100;

                function buildGridModel() {

                    function statusFormatter(cellvalue: any, options: any, rowObject: any) {
                        return PollService.getStatusTypeName(rowObject.statusId);
                    }

                    function EditButtonFormatter(cellvalue: any, options: any, rowObject: any) {
                        return '<i class="fa fa-pencil fa-fw hand"></i>';
                    }
                    
                    var gridModel: any = {};

                    gridModel.colNames = ['Id', 'Nombre', 'Usuario', 'Fecha Inicio', 'Fecha Fin', 'Estado', '', '', ''];
                    gridModel.colModel = [
                        { name: 'id', index: 'id', width: 30, align: 'right', search: false  },
                        { name: 'name', index: 'name', width: 200, search: false  }, //, index: 'nameContains'
                        { name: 'userName', index: 'userName', width: 150, search: false  }, //, index: 'userNameContains'
                        { name: 'startDate', index: 'startDate', width: 80, formatter: 'date', align: 'right', search: false },
                        { name: 'endDate', index: 'endDate', width: 80, formatter: 'date', align: 'right', search: false },
                        { name: 'statusId', index: 'statusId', width: 80, formatter: statusFormatter, search: false },
                        { name: 'editCommand', index: 'editCommand', width: 25, formatter: EditButtonFormatter, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'formId', index: 'formId', hidden: true },
                        { name: 'allowUpdates', index: 'allowUpdates', hidden: true }
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    //$.jgrid.gridUnload('#${gridElementName}');

                    var gridModel = buildGridModel();
                    var url = '/api/cms/person/' + scope.personId + '/polls.json?q=';

                    gridElement = $('#' + gridElementName);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        height: scope.height,
                        autowidth: true,
                        responsive: true,
                        styleUI: 'Bootstrap',
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
                        datatype: 'json',
                        url: url,
                        jsonReader: {
                            page: obj => ((obj.offset / 100) + 1),
                            total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                            records: 'total',
                            repeatitems: false,
                            root: 'results'
                        },
                        rowNum: 100,
                        beforeRequest: () => {
                            var currentPage = gridElement.jqGrid('getGridParam', 'page');
                            gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                        },
                        gridComplete: () => {
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 6:

                                    var rowData = gridElement.getRowData(rowId);
                                    var estado = rowData.statusId;

                                    function editar() {
                                        scope.$emit('edit', { formResponseId: rowId, formId: rowData.formId });
                                    }

                                    if (estado == 'ABIERTA') {
                                        editar();
                                    } else {

                                        var allowUpdates = rowData.allowUpdates;
                                        
                                        if (!_.isBoolean(allowUpdates)) {
                                            if (allowUpdates == 'true') {
                                                allowUpdates = true;
                                            } else {
                                                allowUpdates = false;
                                            }
                                        }


                                        if (allowUpdates) {
                                            if (confirm("Desea reabrir la encuesta?")) {
                                                editar();
                                            }
                                        } else {
                                            alert("No está permitido reabrir esta encuesta");
                                        }

                                    }

                                    break;
                            }

                            return false;
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });

                    gridElement.jqGrid('filterToolbar', { autosearch: true });
                }

                loadGrid();
            }
        };
    })
    ;