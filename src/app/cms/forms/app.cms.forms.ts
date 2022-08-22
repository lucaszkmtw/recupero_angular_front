angular.module('app.cms.forms', ['app.core', 'gridstack-angular'])
.config([
    '$stateProvider', 'RestangularProvider', ($stateProvider) => {
        $stateProvider
            .state('app.cms.forms',
            {
                controller: 'formsController',
                url: '/forms',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: '/app/cms/forms/list.html',
                ncyBreadcrumb: {
                    parent: 'app.cms',
                    label: 'cms.forms'
                }
            })
            .state('app.cms.formcopy',
            {
                controller: 'formCopyController',
                url: '/forms/{formId}/copy',
                templateUrl: '/Content/partials/admin/cms/forms/copy.htm'
            })
            .state('app.cms.formnew',
            {
                controller: 'formEditController',
                url: '/forms/new',
                resolve: loadSequence('toastr',
                    'icheck',
                    'jqueryui',
                    'jqGrid',
                    'select2',
                    'dialogs.main',
                    'ngCkeditor',
                    'angularFileUpload',
                    'toastr'),
                templateUrl: '/app/cms/forms/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.cms.forms',
                    label: 'cms.form.new'
                }
            })
            .state('app.cms.form',
            {
                controller: 'formEditController',
                url: '/forms/{formId}/edit',
                resolve: loadSequence('toastr',
                    'icheck',
                    'jqueryui',
                    'jqGrid',
                    'select2',
                    'dialogs.main',
                    'ngCkeditor',
                    'angularFileUpload'),
                templateUrl: '/app/cms/forms/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.cms.forms',
                    label: 'cms.form'
                }
            })
            .state('app.cms.form.createquota',
            {
                controller: 'formCreateQuotaController',
                url: '/forms/{formId}/quotas/{id}',
                view: {
                    "quotas": {
                        templateUrl: '/app/cms/forms/editquota.html'
                    }
                },
                templateUrl: '/Content/partials/admin/cms/forms/edit.htm'
            })
            .state('app.cms.form.editquota',
            {
                controller: 'formEditQuotaController',
                url: '/forms/{formId}/quotas/{id}',
                view: {
                    "quotas": {
                        templateUrl: '/app/cms/forms/editquota.html'
                    }
                },
                templateUrl: '/admin/partials/form/edit.htm'
            })
            .state('app.cms.form.responses.edit',
            {
                controller: 'formResponseEditController',
                url: '/forms/{formId}/responses/{id}',
                templateUrl: '/app/cms/forms/response.html'
            })
            .state('formpopup',
            {
                url: '/forms/{guid}?v,color,bgColor,labelColor,buttonColor,buttonBgColor',
                controller: 'formPopUpController',
                templateUrl: '/app/cms/forms/formpopup.html',
                resolve: loadSequence('select2', 'dialogs.main', 'toastr', 'icheck')
            });
    }
])
.controller('formsController', [
    '$scope', '$state', '$window', ($scope, $state, $window) => {
        $scope.params = {
            filter: '',
            showOnlyActive: true,
            size: 'lg'
        };

        $scope.search = () => {
            $scope.$broadcast('refresh');
        };

        $scope.new = () => {
            $state.go('app.cms.formnew');
        };

        $scope.responses = (id) => {
            $window.open('form/responses/' + id);
        };

        $scope.copy = () => {
            $state.go('app.cms.formcopy');
        }
    }
])
.controller('formPopUpController', [
    '$scope', '$state', '$stateParams', '$window', '$filter', 'formService', '$log', '$http',
    ($scope, $state, $stateParams, $window, $filter, formService, $log, $http) => {
        $scope.guid = $stateParams.guid;
        $scope.configuration = {
            buttonBgColor: 'inherit',
            buttonColor: 'inherit',
            labelColor: 'inherit',
            bgColor: 'transparent'
        };

        // si no tiene versión tomo la configuración anterior
        if (!angular.isDefined($stateParams.v)) {
            if (!angular.isDefined($stateParams.color)) {
                $scope.bgColor = '#ffffff';
            } else {
                if ($stateParams.color !== 'transparent') {
                    $scope.bgColor = '#' + $stateParams.color;
                }
            }
        }
        else {
            if ($stateParams.v == '1') {
                if (angular.isDefined($stateParams.bgColor)) {
                    $scope.bgColor = $stateParams.bgColor;
                }
                else {
                    $scope.bgColor = 'transparent';
                }

                if (angular.isDefined($stateParams.labelColor)) {
                    $scope.configuration.labelColor = $stateParams.labelColor;
                }

                if (angular.isDefined($stateParams.buttonBgColor)) {
                    $scope.configuration.buttonBgColor = $stateParams.buttonBgColor;
                }

                if (angular.isDefined($stateParams.buttonColor)) {
                    $scope.configuration.buttonColor = $stateParams.buttonColor;
                }
            }
        }

        $http.get(API_HOST + '/api/cms/forms/guid/' + $stateParams.guid).then((response) => {
            if (!response.data.fields) {
                response.data.fields = [];
            } else {
                response.data.fields = angular.fromJson(response.data.fields);
                _.forEach(response.data.fields, (field: any) => {
                    if (field.value === '<p></p>') {
                        field.value = null;
                    }
                });
            }

            $scope.form = response.data;
            $scope.id = $scope.form.id;
            $scope.form.showTitle = false;
            $scope.form.remarks = false;
            $scope.form.runTime = true;
        });
    }
])
.controller('formEditController', [
    '$scope', '$state', '$stateParams', '$window', '$filter', 'formService', 'Restangular', '$log', '$location', 'toastr', ($scope, $state, $stateParams, $window, $filter, formService, Restangular, $log, $location, toastr) => {
        $scope.formService = formService;
        $scope.colors = {};
        $scope.editorOptions = {
            toolbar: [
                { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'DocProps', 'Preview', 'Print', '-', 'Templates'] },
                { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
                { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'SpellChecker', 'Scayt'] },
                {
                    name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
                        'HiddenField']
                },
                '/',
                { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
                {
                    name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv',
                        '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl']
                },
                { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
                '/',
                { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'tools', items: ['Maximize', 'ShowBlocks', '-', 'About'] }
            ]
        };

        function load() {
            var id = $stateParams.formId;

            function hasQuota() {
                return $scope.item.quota === 0 || $scope.item.quota - $scope.item.responses > 0;
            }

            if (id == undefined) {
                $scope.item = {};
                $scope.item.runTime = false;
                $scope.item.quota = 0;
                $scope.item.name = 'Nuevo formulario';
                $scope.item.fields = [];
                $scope.item.hasQuota = hasQuota();
                $scope.item.validateUser = true;
                $scope.item.showTitle = true;
                $scope.params = {
                    showJson: true
                };
            } else {
                Restangular.one('cms').one('forms', id).get().then((data) => {
                    $scope.item = data;
                    $scope.item.runTime = false;
                    $scope.item.hasQuota = hasQuota();
                    if (!$scope.item.fields) {
                        $scope.item.fields = [];
                    }

                    _.forEach($scope.item.fields, (field: any) => {
                        if (angular.isDefined(field.required)) {
                            field.required = field.required == 'true';
                        };
                    });

                    $scope.setUrl();
                    $scope.setEmbedCode();

                    $scope.$broadcast('refresh');
                });
            }
        }

        $scope.setUrl = (colors) => {
            $scope.url = $scope.getUrl($scope.item.guid);
            $scope.colors = colors;
            if ($scope.colors && $scope.colors.url) {
                $scope.url += '?color=' + $scope.colors.url.substring(1);
            }
        }

        $scope.setEmbedCode = (colors) => {
            var url = $scope.getUrl($scope.item.guid);
            $scope.colors = colors;
            if ($scope.colors && $scope.colors.embedCode) {
                url += '?color=' + $scope.colors.embedCode.substring(1);
            }

            $scope.embedCode = '<iframe src="' + url + '" frameborder="0"></iframe>';
        }

        $scope.getUrl = (guid) => {
            var url = 'https://centraloperativaprod.azurewebsites.net';
            var port = $location.port();
            if (port && port !== 80) {
                url += ':' + port;
            }
            url += '/forms/' + guid;
            return url;
        };

        $scope.updateFields = () => {
            $scope.item.fields = JSON.parse($scope.params.fieldsJson);
        }

        $scope.params = {
            loadResponses: false,
            loadRoles: false
        };

        $scope.selectResponses = () => {
            $scope.params.loadResponses = true;
        }

        $scope.selectRoles = () => {
            $scope.params.loadRoles = true;
        }

        $scope.selectedTab = 0;
        $scope.selectTab = (tab) => {
            $scope.selectedTab = tab;
        };

        // preview form mode
        $scope.previewMode = false;
        $scope.previewForm = {};

        $scope.list = () => {
            $state.go('app.cms.forms');
        };

        $scope.onDragStop = function (event, ui) {
            $scope.form.$setDirty();
        };

        $scope.onResizeStop = function (event, ui) {
            $scope.form.$setDirty();
        };

        $scope.previewOptions = {
            disableDrag: true,
            disableResize: true
        };

        // add new field drop-down:
        $scope.addField = {};
        $scope.addField.types = formService.fields;
        $scope.addField.new = $scope.addField.types[0].name;

        $scope.addNewField = () => {
            var id = stringGen(5);

            var newField = {
                "id": id,
                "name": 'Nuevo campo',
                "type": $scope.addField.new,
                "required": false,
                "value": '',
                "height": 2
            };

            $scope.item.fields.push(newField);
        };

        $scope.deleteField = (id, $event) => {
            for (var i = 0; i < $scope.item.fields.length; i++) {
                if ($scope.item.fields[i].id === id) {
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    $scope.item.fields.splice(i, 1);

                    break;
                }
            }
        };

        $scope.addOption = (field) => {
            if (!field.options)
                field.options = new Array();

            var id = stringGen(5);
            var newOption = {
                "id": id,
                "text": '',
                "value": id
            };

            field.options.push(newOption);
        };

        $scope.moveOptionUp = (id, field) => {
            for (var i = 0; i < field.options.length; i++) {
                if (field.options[i].id === id) {
                    var element = field.options[i];
                    field.options.splice(i, 1);
                    field.options.splice(i - 1, 0, element);
                    break;
                }
            }
        };

        $scope.moveOptionDown = (id, field) => {
            for (var i = 0; i < field.options.length; i++) {
                if (field.options[i].id === id) {
                    var element = field.options[i];
                    field.options.splice(i, 1);
                    field.options.splice(i + 1, 0, element);
                    break;
                }
            }
        };

        $scope.deleteOption = (field, option) => {
            for (var i = 0; i < field.options.length; i++) {
                if (field.options[i].id === option.id) {
                    field.options.splice(i, 1);
                    break;
                }
            }
        };

        $scope.preview = () => {
            $scope.item.submitted = false;
            angular.copy($scope.item.plain(), $scope.previewForm);
            $scope.previewMode = !$scope.previewMode;
        };

        $scope.edit = () => {
            $scope.item.submitted = false;
            $scope.previewMode = !$scope.previewMode;
        };

        $scope.showRequired = (field) => {
            if (field.type === 'label')
                return false;
            else
                return true;
        };

        $scope.showCondition = (field) => {
            if (field.type === 'text')
                return true;
            else
                return false;
        };

        $scope.showDefaultValue = (field) => {
            if (field.type === 'label' || field.type === 'hidden')
                return true;
            else
                return false;
        };

        $scope.showAddOptions = (field) => {
            if (field.type === 'radio' || field.type === 'dropdown' || field.type === 'checkbox')
                return true;
            else
                return false;
        };

        $scope.reset = () => {
            $scope.item.fields.splice(0, $scope.item.fields.length);
        };

        $scope.publish = (value) => {
            $scope.item.isPublished = value;
            $scope.save();
        };

        $scope.save = () => {
            if ($scope.item.id) {
                $scope.item.post().then(() => {
                    toastr.success('El formulario se actualizó correctamente.', 'Editor de formularios');
                    load();
                });
            } else {
                Restangular.one('cms').all('forms').post($scope.item).then((data) => {
                    toastr.success('Nuevo formulario creado.', 'Editor de formularios');
                    $state.go('app.cms.form', { formId: data.id });
                });
            }
        };

        $scope.exportResponses = () => {
            $window.open(API_HOST + '/api/cms/forms/' + $scope.item.id + '/results.json');
        };

        load();
    }
])
.directive('cmsFormsGrid', ($state, $window, authManager) => {
    return {
        restrict: 'A',
        scope: { filter: '=', showOnlyActive: '=' },
        link: (scope: any, element) => {
            var gridElementName = 'formsGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement: any = angular.element('<table></table>');
            gridElement.attr('id', gridElementName);
            var pagerElement = angular.element('<div></div>');
            pagerElement.attr('id', pagerElementName);
            element.append(gridElement);
            element.append(pagerElement);

            function responsesFormatter(cellvalue, options, rowObject) {
                return (rowObject.minQuota + ' / ' + rowObject.responses + ' / ' + rowObject.quota);
            }

            function buildGridModel() {
                var gridModel: IGridModel = <IGridModel>{};
                gridModel.colNames = ['', 'Id', 'Nombre', 'Desde', 'Hasta', 'Inscriptos', ''];
                gridModel.colModel = [
                    { name: 'editCommand', index: 'editCommand', width: 25, fixed: true, align: 'center', sortable: false, search: false },
                    { name: 'id', index: 'id', width: 60, fixed: true, align: 'right' },
                    { name: 'name', index: 'name' },
                    { name: 'fromDate', index: 'fromDate', width: 80, fixed: true, search: false, formatter: 'date', align: 'right' },
                    { name: 'toDate', index: 'toDate', search: false, formatter: 'date', align: 'right', width: 80, fixed: true },
                    { name: 'responses', index: 'responses', formatter: responsesFormatter, search: false, align: 'right', width: 130, fixed: true },
                    { name: 'exportCommand', index: 'exportCommand', width: 25, fixed: true, align: 'center', sortable: false, search: false }
                ];

                return gridModel;
            }

            function loadGrid(filter?: string) {
                $.jgrid.gridUnload(`#${gridElementName}`);

                scope.height = scope.height || 450;
                var gridModel = buildGridModel();
                var url = `${API_HOST}/api/cms/forms?showOnlyActive=${scope.showOnlyActive}`;

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
                            case 0:
                                $state.go('app.cms.form', { formId: rowId });
                                scope.$apply();
                                break;
                            case 6:
                                $window.open(API_HOST + '/api/cms/forms/' + rowId + '/results');
                                scope.$apply();
                                break;
                        }

                        return false;
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                gridElement.jqGrid('filterToolbar', { autosearch: true });
            }

            scope.$on('refresh', () => {
                gridElement.setGridParam({ url: API_HOST + '/api/forms?q=' + scope.filter + '&showOnlyActive=' + scope.showOnlyActive });
                gridElement.trigger('reloadGrid');
            });

            loadGrid();
        }
    };
})
.directive('formResponsesGrid', ($state, $window, $http, toastr) => {
    return {
        restrict: 'A',
        scope: { form: '=' },
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
                var gridModel: any = {};
                gridModel.colNames = ['Id', 'Fecha', 'Estado', ''];
                gridModel.colModel = [
                    { name: 'id', index: 'id', width: 30, align: 'right' },
                    { name: 'date', index: 'date', width: 60, formatter: 'date', formatoptions: { srcformat: 'Y/m/d', newformat: 'd/m/Y' } },
                    { name: 'status', index: 'status', width: 400 },
                    { name: 'deleteCommand', index: 'deleteCommand', width: 25, fixed: true, align: 'center', sortable: false, search: false }
                ];

                return gridModel;
            }

            function buildGrid(filter?: string) {
                $.jgrid.gridUnload(`#${gridElementName}`);

                var gridModel = buildGridModel();
                gridElement = $('#' + gridElementName);
                gridElement.jqGrid({
                    regional: 'es-ar',
                    height: 450,
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
                    datatype: 'local',
                    jsonReader: {
                        cell: '',
                        root: (obj) => { return obj.data.rows; },
                        page: (obj) => { return obj.data.page; },
                        total: (obj) => { return obj.data.total; },
                        records: (obj) => { return obj.data.records; }
                    }
                });
                gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                gridElement.jqGrid('filterToolbar', { autosearch: true });

                loadData();
            }

            function loadData() {
                var url = API_HOST + '/api/forms/' + scope.form.id + '/responses.json?q=';
                gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                gridElement.trigger('reloadGrid');
            }

            scope.$on('loadResponses', (event) => {
                loadData();
            });

            buildGrid();
        }
    };
})
.directive('cmsFormRolesGrid', (authManager) => {
    return {
        restrict: 'A',
        scope: { form: '=' },
        link: (scope: any, element) => {
            var gridElementName = 'formRolesGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement: any = angular.element('<table></table>');
            gridElement.attr('id', gridElementName);
            var pagerElement: any = angular.element('<div></div>');
            pagerElement.attr('id', pagerElementName);
            element.append(gridElement);
            element.append(pagerElement);

            function buildGridModel() {
                var gridModel: any;
                gridModel.colNames = ['', 'Roles', 'E', ''];
                gridModel.colModel = [
                    { name: 'editCommand', index: 'editCommand', width: 25, align: 'center', sortable: false, search: false },
                    { name: 'roles', index: 'roles', width: 600 },
                    { name: 'quota', index: 'quota', width: 90 },
                    { name: 'deleteCommand', index: 'deleteCommand', width: 25, align: 'center', sortable: false, search: false }
                ];

                return gridModel;
            }

            function loadGrid(filter?: string) {
                $.jgrid.gridUnload(`#${gridElementName}`);

                var gridModel = buildGridModel();
                var url = API_HOST + '/api/forms/' + scope.form.id + '/roles.json?q=';

                gridElement = $('#' + gridElementName);
                gridElement.jqGrid({
                    regional: 'es-ar',
                    height: 450,
                    autowidth: true,
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
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    jsonReader: {
                        cell: '',
                        root: (obj) => { return obj.data.rows; },
                        page: (obj) => { return obj.data.page; },
                        total: (obj) => { return obj.data.total; },
                        records: (obj) => { return obj.data.records; }
                    },
                    gridComplete: () => {
                        var ids = gridElement.jqGrid('getDataIDs');
                        for (var i = 0; i < ids.length; i++) {
                            var editCommand = '<span class="command-cell glyphicon glyphicon-pencil"></span>';
                            var deleteCommand = '<span class="command-cell glyphicon glyphicon-remove"></span>';
                            gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand, deleteCommand: deleteCommand });
                        }
                    }
                });

                gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                gridElement.jqGrid('filterToolbar', { autosearch: true });
            }

            loadGrid();
        }
    };
})
.controller('formCopyController', [
    '$scope', '$state', 'Restangular', ($scope, $state, Restangular) => {
        $scope.close = () => {
            $state.go('forms.list');
        };

        $scope.save = () => {
            Restangular.one('forms', $scope.copyform.id).post('copy', $scope.copyform).then((response) => {
                $state.go('forms.edit', { id: response.id });
            });
        };
    }
])
.controller('formEnrolledController', [
    '$scope', '$stateParams', '$info', 'formService', ($scope, $stateParams, $log, formService) => {
        function load() {
            var id = $stateParams.id;
            if (id == undefined) {
            } else {
                $scope.item = formService.get({ id: id }, () => {
                    $scope.$broadcast('refresh');
                });
            }
        }

        load();
    }
])
.controller('checkBoxListController', ['$scope', $scope => {
    $scope.updateValues = (field) => {
        var checkedOptions = _.filter(field.options, 'checked');
        field.value = _.map(checkedOptions, 'value');
    };
}])
.filter('html', ['$sce', ($sce) => {
    return text => {
        return $sce.trustAsHtml(text);
    };
}])
.filter('trusted', ['$sce', ($sce) => {
    return url => {
        return $sce.trustAsResourceUrl(url);
    };
}])
.directive('formViewer', ($http, $location, $log, $state, $parse, Restangular, toastr) => {
    return {
        restrict: 'A',
        scope: {},
        controller: function ($scope) {
            {
                var vm = this;
                vm.hasPersonFields = false;
                vm.form = {};

                vm.previewOptions = {
                    staticGrid: true,
                    disableDrag: true,
                    disableResize: true
                };

                vm.submit = (saveDraft?: boolean) => {
                    var formResponse: any = {
                        formId: vm.item.id,
                        statusId: (vm.form.$valid && !saveDraft) ? 1 : 0,
                        id: null,
                        person: null,
                        personId: null,
                        leadId: vm.item.leadId
                    };

                    if (vm.item.formResponse) {
                        formResponse.id = vm.item.formResponse.id;
                    }

                    formResponse.fields = [];
                    _.forEach(vm.item.fields, (field: any) => {
                        var responseField: any = {
                            id: field.id,
                            value: field.value
                        };

                        if (field.options) {
                            responseField.options = [];

                            _.forEach(field.options, (option: any) => {
                                if (option.allowComments) {
                                    responseField.options.push({ id: option.id, comments: option.comments });
                                }
                            });
                        }
                        formResponse.fields.push(responseField);

                        var isPerson = new RegExp('^' + "person").test(field.type);
                        if (isPerson) {
                            vm.hasPersonFields = true;
                        }
                    });

                    if (vm.item.person) {
                        formResponse.person = vm.item.person;
                    }
                    if (vm.hasPersonFields) {
                        var personData = getPersonData();
                        formResponse.person = personData.person;
                        formResponse.employer = personData.employer;
                        formResponse.employee = personData.employee;
                    }

                    if (vm.item.validateUser && vm.item.allowUpdates) {
                        if (vm.name) {
                            formResponse.firstName = vm.name.data2;
                            formResponse.lastName = vm.name.data3;
                        }
                        if (vm.email) {
                            formResponse.email = vm.email.data1;
                        }
                        if (vm.phone) {
                            formResponse.phone = vm.phone.data1;
                        }
                        if (vm.postalAddress) {
                            formResponse.postalAddress = vm.postalAddress.data1;
                        }
                    }

                    $log.info(formResponse);
                    if (formResponse.id != null) {
                        $http
                            .put(API_HOST + "/api/cms/forms/" + vm.item.id + "/responses/" + formResponse.id, formResponse)
                            .then((data) => {
                                vm.response = data.data;
                                vm.item.submitted = true;
                                toastr.success('Encuestas', 'La operación se realizó con éxito.');

                                if ('parentIFrame' in window) {
                                    parentIFrame.scrollTo(0, 0);
                                }
                            });
                    } else {
                        Restangular.one('cms').one('forms', vm.item.id).all('responses').post(formResponse).then((result) => {
                            vm.response = result;
                            /*
                            if ($scope.item.showReceipt && result.response.statusId === 0) {
                                window.location.href = '/formularios/constancia/' + result.response.guid;
                            }
                            else {
                            */
                            vm.item.submitted = true;
                            toastr.success('Encuestas', 'La operación se realizó con éxito.');
                        });

                    }
                };

                vm.hasQuota = () => {
                    var hasQuota = angular.isDefined(vm.item) && (vm.item.quota === 0 || vm.item.quota - vm.item.responses > 0);
                    return hasQuota;
                };

                vm.isOpen = () => {
                    if (angular.isDefined(vm.item) && vm.item.fromDate) {
                        var now = moment();
                        var from = moment(vm.item.fromDate);
                        var to = moment(vm.item.toDate);
                        var momentInstance: any = moment();
                        var range = momentInstance.range(from, to);

                        return range.contains(now);
                    } else {
                        return true;
                    }
                };

                vm.waigintList = false;

                vm.isFieldVisible = (field) => {
                    var runTime = true;
                    if (angular.isDefined(vm.item.runtime)) {
                        runTime = vm.item.runtime;
                    }

                    if (runTime && angular.isDefined(field.visibility) && field.visibility != '') {
                        return $parse('vm.' + field.visibility)($scope)
                    }

                    return true;
                };

                vm.getFieldValue = (fieldId) => {
                    var field: any = _.find(vm.item.fields, ['id', fieldId]);
                    if (angular.isDefined(field.value)) {
                        return field.value;
                    }

                    return null;
                };

                function getPersonData() {
                    var hasAddress = false;
                    var employee: any = {};
                    var hasEmployee = false;
                    var employer: any = {};
                    var hasEmployer = false;
                    var address: any = {};
                    var hasLocation = false;
                    var locationTypeId;

                    var person: any = {
                        isOrganization: false,
                        emails: [],
                        phones: [],
                        addresses: []
                    };

                    _.forEach(vm.item.fields, (field: any) => {
                        var personFieldName = field.type.replace("person", "");
                        switch (field.type) {
                            case 'personName':
                                if (angular.isDefined(field.value) && field.value != null && field.value != '') {
                                    vm.item.person[personFieldName] = field.value;
                                    vm.item.person.isOrganization = true;
                                }
                                break;
                            case 'personFirstName':
                                person.firstName = field.value;
                                break;
                            case 'personLastName':
                                person.lastName = field.value;
                                break;
                            case 'personCode':
                                person.code = field.value;
                                break;
                            case 'personEmail':
                                person.emails.push({
                                    typeId: (angular.isDefined(field.typeId) && field.typeId != null) ? field.typeId : 2,
                                    address: field.value
                                });
                                break;
                            case 'personPhone':
                                person.phones.push({
                                    typeId: field.typeId,
                                    number: field.value
                                });
                                break;
                            case 'personStreet':
                                hasAddress = true;
                                address.street = field.value;
                                break;
                            case 'personStreetNumber':
                                hasAddress = true;
                                address.streetNumber = field.value;
                                break;
                            case 'personZipCode':
                                hasAddress = true;
                                address.zipCode = field.value;
                                break;
                            case 'personFloor':
                                hasAddress = true;
                                address.floor = field.value;
                                break;
                            case 'personAppartment':
                                hasAddress = true;
                                address.appartment = field.value;
                                break;
                            case 'personLocation':
                                if (field.value) {
                                    hasAddress = true;
                                    hasLocation = true;
                                    locationTypeId = field.value.valueId;
                                }
                                break;
                            case 'personEmployerName':
                                employer.name = field.value;
                                employer.isOrganization = true;
                                break;
                            case 'personEmployerFirstName':
                                employer.firstName = field.value;
                                employer.isOrganization = false;
                                break;
                            case 'personEmployerLastName':
                                employer.lastName = field.value;
                                employer.isOrganization = false;
                                break;
                            case 'personEmployerCode':
                                employer.code = field.value;
                                break;
                            case 'personEmployerLookup':
                                break;
                            case 'personSalary':
                                employee.salary = field.value;
                                break;
                            case 'personBirthDate':
                                person.birthDate = field.value;
                                break;
                        }
                    });

                    if (hasAddress) {
                        if (hasLocation) {
                            address.placeId = locationTypeId;
                        }

                        person.addresses.push({
                            typeId: 2,
                            address: address
                        });
                    }

                    var model = {
                        person: person,
                        employer: employer,
                        employee: employee
                    };

                    return model;
                }
            }
        },
        controllerAs: 'vm',
        bindToController: { item: '=?item', configuration: '=?configuration' },
        templateUrl: '/app/cms/forms/form.html',
        link: (scope: any, elm, attr: any, ctrl: any) => {
            if (attr.id) {
                $http.get(API_HOST + '/api/cms/forms/' + attr.id + '.json').success((data) => {
                    if (!data.fields) {
                        data.fields = [];
                    } else {
                        data.fields = angular.fromJson(data.fields);
                        _.forEach(data.fields, (field: any) => {
                            if (field.value === '<p></p>') {
                                field.value = null;
                            }
                        });
                    }
                    ctrl.item = data;
                });
            }
            ctrl.waitingList = false;

            //$log.info(ctrl.configuration);
        }
    };
})
.directive('formField', ($http, $compile, $parse, $templateCache) => {
    var getTemplateUrl = (field) => {
        var type = field.type;
        var templateUrl = '';

        switch (type) {
            case 'text':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'label':
                templateUrl = '/app/cms/forms/label.html';
                break;
            case 'email':
                templateUrl = '/app/cms/forms/email.html';
                break;
            case 'textarea':
                templateUrl = '/app/cms/forms/textarea.html';
                break;
            case 'checkbox':
                templateUrl = '/app/cms/forms/checkbox.html';
                break;
            case 'date':
                templateUrl = '/app/cms/forms/date.html';
                break;
            case 'dropdown':
                templateUrl = '/app/cms/forms/dropdown.html';
                break;
            case 'hidden':
                templateUrl = '/app/cms/forms/hidden.html';
                break;
            case 'password':
                templateUrl = '/app/cms/forms/password.html';
                break;
            case 'radio':
                templateUrl = '/app/cms/forms/radio.html';
                break;
            case 'lookup':
                templateUrl = '/app/cms/forms/lookup.html';
                break;
            case 'html':
                templateUrl = 'app/cms/forms/html.html';
                break;
            case 'iframe':
                templateUrl = 'app/cms/forms/iframe.html';
                break;
            case 'submitbutton':
                templateUrl = 'app/cms/forms/submitbutton.html';
                break;
            case 'personName':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personFirstName':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personLastName':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personCode':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personStreet':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personStreetNumber':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personZipCode':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personFloor':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personAppartment':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personPhone':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personEmail':
                templateUrl = '/app/cms/forms/email.html';
                break;
            case 'personLocation':
                templateUrl = '/app/cms/forms/location.html';
                break;
            case 'personEmployerFirstName':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personEmployerLastName':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personEmployerCode':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            /*case 'personEmployerLookup':
                templateUrl = '/app/cms/forms/employer.html';
                break;*/
            case 'personSalary':
                templateUrl = '/app/cms/forms/textfield.html';
                break;
            case 'personBirthDate':
                templateUrl = '/app/cms/forms/date.html';
                break;
        }
        return templateUrl;
    };

    return {
        template: '{{field}}',
        restrict: 'A',
        require: ['?^^formViewer', '?^form'],
        scope: {
            field: '=',
            runtime: '=?'
        },
        link: (scope: any, element, attrs, controllers) => {
            scope.viewer = controllers[0];
            scope.form = controllers[1];

            scope.isVisible = () => {
                var runTime = true;
                if (angular.isDefined(scope.runtime)) {
                    runTime = scope.runtime;
                }

                if (runTime && angular.isDefined(scope.field.visibility)) {
                    return $parse(scope.field.visibility)(scope)
                }

                return true;
            };

            scope.showError = () => {
                var formField = scope.form[scope.field.id];
                return scope.field.required && !scope.field.value && formField.$touched;
            }

            // GET template content from path
            var templateUrl = getTemplateUrl(scope.field);
            $http.get(templateUrl, { cache: $templateCache }).then((data) => {
                element.html(data.data);
                $compile(element.contents())(scope);
            });
        }
    };
})
.service('formService', () => {
    return {
        phoneFieldTypes: [
            {
                id: '2',
                name: 'Particular',
            },
            {
                id: '3',
                name: 'Laboral',
            },
            {
                id: '4',
                name: 'Celular',
            }
        ],
        fields: [

            {
                name: 'text',
                value: 'Texto',
                optgroup: 'Comunes'
            },
            {
                name: 'label',
                value: 'Etiqueta',
                optgroup: 'Comunes'
            },
            {
                name: 'email',
                value: 'E-mail',
                optgroup: 'Comunes'
            },
            {
                name: 'password',
                value: 'Password',
                optgroup: 'Comunes'
            },
            {
                name: 'radio',
                value: 'Radio Buttons',
                optgroup: 'Comunes'
            },
            {
                name: 'dropdown',
                value: 'Desplegable',
                optgroup: 'Comunes'
            },
            {
                name: 'lookup',
                value: 'Lookup',
                optgroup: 'Comunes'
            },
            {
                name: 'date',
                value: 'Fecha',
                optgroup: 'Comunes'
            },
            {
                name: 'textarea',
                value: 'Text Area',
                optgroup: 'Comunes'
            },
            {
                name: 'checkbox',
                value: 'Checkbox',
                optgroup: 'Comunes'
            },
            {
                name: 'hidden',
                value: 'Oculto',
                optgroup: 'Comunes'
            },
            {
                name: 'html',
                value: 'Html',
                optgroup: 'Comunes'
            },
            {
                name: 'iframe',
                value: 'Iframe',
                optgroup: 'Comunes'
            }
            ,
            {
                name: 'submitbutton',
                value: 'Submit Button',
                optgroup: 'Comunes'
            },

            //Persons
            {
                name: 'personName',
                value: 'Razón Social',
                optgroup: 'Persona'
            },
            {
                name: 'personFirstName',
                value: 'Nombre',
                optgroup: 'Persona'
            },
            {
                name: 'personLastName',
                value: 'Apellido',
                optgroup: 'Persona'
            },
            {
                name: 'personCode',
                value: 'Cuit',
                optgroup: 'Persona'
            },
            {
                name: 'personStreet',
                value: 'Calle',
                optgroup: 'Persona'
            },
            {
                name: 'personStreetNumber',
                value: 'Número',
                optgroup: 'Persona'
            },
            {
                name: 'personZipCode',
                value: 'CP',
                optgroup: 'Persona'
            },
            {
                name: 'personFloor',
                value: 'Piso',
                optgroup: 'Persona'
            },
            {
                name: 'personAppartment',
                value: 'Departamento',
                optgroup: 'Persona'
            },
            {
                name: 'personPhone',
                value: 'Teléfono',
                optgroup: 'Persona'
            },
            {
                name: 'personEmail',
                value: 'E-mail',
                optgroup: 'Persona'
            },
            {
                name: 'personLocation',
                value: 'Localidad',
                optgroup: 'Persona'
            },
            {
                name: 'personEmployerFirstName',
                value: 'Empleador Nombre',
                optgroup: 'Persona'
            },
            {
                name: 'personEmployerLastName',
                value: 'Empleador Apellido',
                optgroup: 'Persona'
            },
            {
                name: 'personEmployerCode',
                value: 'Empleador CUIT',
                optgroup: 'Persona'
            },
            /*{
                name: 'personEmployerLookup',
                value: 'Empleador (lookup)',
                optgroup: 'Persona'                     
            },*/
            {
                name: 'personSalary',
                value: 'Ingresos Empleado',
                optgroup: 'Persona'
            },
            {
                name: 'personBirthDate',
                value: 'Fecha de nacimiento',
                optgroup: 'Persona'
            }
        ],
        types: [
            {
                name: 'Formulario',
                value: 0
            },
            {
                name: 'Encuesta',
                value: 1
            },
            {
                name: 'Landing',
                value: 2
            }
        ]
    };
});