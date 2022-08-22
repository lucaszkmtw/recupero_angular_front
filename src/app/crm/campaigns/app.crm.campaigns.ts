angular.module('app.crm.campaigns', ['app.core', 'app.crm'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.crm.campaigns',
            {
                url: '/campaigns',
                controller: 'CampaignsController',
                resolve: loadSequence('jqGrid', 'toastr'),
                templateUrl: 'app/crm/campaigns/index.html',
                ncyBreadcrumb: {
                    parent: 'app.crm',
                    label: 'crm.campaigns'
                }
            })
            .state('app.crm.campaign',
            {
                url: '/campaign/{campaignId}',
                controller: 'CampaignController',
                resolve: loadSequence('jqueryui'),
                templateUrl: 'app/crm/campaigns/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.campaigns',
                    label: 'crm.campaign'
                }
            })
            .state('app.crm.campaignewsent',
            {
                url: '/campaignewsent/{campaignId}',
                controller: 'CampaignNewSentController',
                resolve: loadSequence('jqueryui'),
                templateUrl: 'app/crm/campaigns/newSent.html',
                ncyBreadcrumb: {
                    parent: 'app.crm.campaigns',
                    label: 'crm.campaign'
                }
            });
    }])
    .controller('CampaignsController', ($scope, $state, $translate, $http) => {
        $scope.new = () => {
            $state.go('app.crm.campaign', {});
        }
        // Script temporal para traer datos simulados de tipos de campaña 
        $http.get("app/crm/api/campaigntypes.json").then(function(response){
            $scope.campaignTypeList = response.data;
        }, function errorCallback(response){
            toastr.success(response.statusText, 'Error');
        });
        
    })
    .controller('CampaignController', ($scope, $state, $translate, $stateParams, $log, Restangular, $http) => {
        $scope.save = () => {
            if (id) {
                $scope.campaign.put().then(() => { $state.go('app.crm.campaigns'); });
            } else {
                Restangular.service('crm/campaign').post($scope.campaign).then(() => { $state.go('app.crm.campaigns'); });
            }
        }

        var id = $stateParams.campaignId;

        function load() {
            if (id) {
                Restangular.all('crm').one('campaign', id).get().then(result => {
                    $scope.campaign = result;
                });
            } else {
                $scope.campaign = { forms: [], products: [] };
            }
        }

        load();

        //#region
        $scope.addCampaignForm = () => {
            Restangular.one('cms').one('forms', $scope.params.formId).get().then((form) => {
                var campaignForm = {
                    formId: form.id,
                    formName: form.name
                };

                $scope.campaign.forms.push(campaignForm);
                $scope.params.formId = null;
            });
        };

        $scope.removeCampaignForm = (item) => {
            var index = $scope.campaign.forms.indexOf(item);
            $scope.campaign.forms.splice(index, 1);
        }
        //#endregion


        //#region
        $scope.addCampaignProduct = () => {
            Restangular.one('catalog').one('products', $scope.params.productId).get().then((product) => {
                var campaignProduct = {
                    productId: product.id,
                    productName: product.name
                };

                $scope.campaign.products.push(campaignProduct);
                $scope.params.productId = null;
            });
        };

        $scope.removeCampaignProduct = (item) => {
            var index = $scope.campaign.products.indexOf(item);
            $scope.campaign.products.splice(index, 1);
        }
        //#endregion
    })
    .controller('CampaignNewSentController', ($scope, $state, $translate, $stateParams, $log, Restangular, $http) => {
        $scope.save = () => {
            if (id) {
                $scope.campaign.put().then(() => { $state.go('app.crm.campaigns'); });
            } else {
                Restangular.service('crm/campaign').post($scope.campaign).then(() => { $state.go('app.crm.campaigns'); });
            }
        }

        var id = $stateParams.campaignId;

        function load() {
            if (id) {
                Restangular.all('crm').one('campaign', id).get().then(result => {
                    $scope.campaign = result;
                });
            } else {
                $scope.campaign = { forms: [], products: [] };
            }
        }

        load();

        //#region
        $scope.addCampaignForm = () => {
            Restangular.one('cms').one('forms', $scope.params.formId).get().then((form) => {
                var campaignForm = {
                    formId: form.id,
                    formName: form.name
                };

                $scope.campaign.forms.push(campaignForm);
                $scope.params.formId = null;
            });
        };

        $scope.removeCampaignForm = (item) => {
            var index = $scope.campaign.forms.indexOf(item);
            $scope.campaign.forms.splice(index, 1);
        }
        //#endregion


        //#region
        $scope.addCampaignProduct = () => {
            Restangular.one('catalog').one('products', $scope.params.productId).get().then((product) => {
                var campaignProduct = {
                    productId: product.id,
                    productName: product.name
                };

                $scope.campaign.products.push(campaignProduct);
                $scope.params.productId = null;
            });
        };

        $scope.removeCampaignProduct = (item) => {
            var index = $scope.campaign.products.indexOf(item);
            $scope.campaign.products.splice(index, 1);
        }
        //#endregion
    })
    .directive('crmCampaignsGrid', ($state, $window, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'campaignsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    /*, 'Formulario'*/
                    gridModel.colNames = ['', 'Id', 'Tipo', 'Nombre de Campaña', 'Asunto', 'Fecha Enviado'];
                    gridModel.colModel = [

                        { name: 'editCommand', index: 'editCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'id', index: 'id', width: 100, fixed: true, align: 'right', search: false },
                        { name: 'campaignType', index: 'campaignType', search: false },
                        { name: 'campaignName', index: 'campaignName', search: false },
                        { name: 'campaignSubject', index: 'campaignSubject', search: false },
                        { name: 'campaignSentdate', index: 'campaignSentdate', search: false },
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    //scope.height = scope.height || 450;
                    scope.height = 300;
                    var gridModel = buildGridModel();
                    //var url = '/api/crm/campaigns.json';
                    var url = 'app/crm/api/campaigns.json';

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
                                gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand });
                            }
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    $state.go('app.crm.campaign', { campaignId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });

                    /*gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                    gridElement.jqGrid('setGroupHeaders', {
                        useColSpanStyle: true,
                        groupHeaders: [
                            { startColumnName: 'issued', numberOfColumns: 2, titleText: 'Instrumentos' }
                        ]
                    });
                    gridElement.jqGrid('filterToolbar', { autosearch: true });*/
                }

                /*scope.$on('refresh', () => {
                    gridElement.setGridParam({ url: '/api/forms?q=' + scope.filter + '&showOnlyActive=' + scope.showOnlyActive });
                    gridElement.trigger('reloadGrid');
                });*/

                loadGrid();
            }
        };
    })
    .directive('crmFormLookup', () => {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: { ngModel: '=' },
            link: (scope, element, attr: any, ctrl: any) => {
                if (!ctrl) return;

                var required = attr.required ? attr.required : false;
                var model = scope.$eval(attr.ngModel);
                if (model) {
                    element.val(model);
                }

                element.select2({
                    theme: 'bootstrap',
                    width: 'element',
                    placeholder: 'Seleccione un formulario',
                    allowClear: !required,
                    ajax: {
                        url: API_HOST + '/api/cms/forms/lookup.json',
                        dataType: 'json',
                        quietMillis: 100,
                        data: (params, page) => {
                            return {
                                q: params.term,
                                pageSize: 100,
                                page: page
                            };
                        },
                        processResults: (data, page) => {
                            var more = (page * 10) < data.total;
                            return { results: data.data, more: more };
                        }
                    }
                });

                attr.$observe('disabled', value => {
                    element.select2(value && 'disable' || 'enable');
                });

                scope.$watch('ngModel', value => {
                    if (value) {
                        const url = API_HOST + '/api/cms/forms/lookup';
                        $.getJSON(url, { id: ctrl.$modelValue, format: 'json' }, result => {
                            if (result.data.length == 1) {
                                const option = new Option(result.data[0].text, result.data[0].id, true, true);
                                element.append(option);
                                element.trigger('change');
                            }
                        });
                    }
                });
            }
        };
    })
    .directive('crmEmailingGrid', ($state, $window, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'mailingGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                function viewFormatter(cellvalue, options, rowObject) {
                    return '<i class="fa fa-pencil fa-fw hand" ></i>';
                }

                function buildGridModel() {
                    var gridModel: IGridModel = <IGridModel>{};
                    /*, 'Formulario'*/
                    gridModel.colNames = ['', /*'Id',*/ 'Descripción Envío', 'Destinatarios', 'Plantilla Correo', 'Fecha Enviado', 'Estado'];
                    gridModel.colModel = [

                        { name: 'editCommand', index: 'editCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                        //{ name: 'id', index: 'id', width: 100, fixed: true, align: 'right', search: false },
                        { name: 'sentDescription', index: 'sentDescription', search: false },
                        { name: 'mailListName', index: 'mailListName', search: false },
                        { name: 'mailTemplateName', index: 'mailTemplateName', search: false },
                        { name: 'sentDate', index: 'sentDate', search: false },
                        { name: 'sentStatus', index: 'sentStatus', search: false },
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    //scope.height = scope.height || 450;
                    scope.height = 300;
                    scope.width = 800;
                    var gridModel = buildGridModel();
                    //var url = '/api/crm/campaigns.json';
                    var url = 'app/crm/api/campaignemailing.json';

                    gridElement = $(`#${gridElementName}`);
                    gridElement.jqGrid({
                        regional: 'es-ar',
                        datatype: 'json',
                        url: url,
                        height: scope.height,
                        width: scope.width,
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
                                gridElement.jqGrid('setRowData', ids[i], { editCommand: editCommand });
                            }
                        },
                        onCellSelect: (rowId, iCol) => {
                            switch (iCol) {
                                case 0:
                                    $state.go('app.crm.campaign', { campaignId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });

                    
                }

                loadGrid();
            }
        };
    });
