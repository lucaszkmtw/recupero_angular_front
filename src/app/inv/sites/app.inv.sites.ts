angular
    .module('app.inv.sites', ['app.inv'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.inv.sites', {
                url: '/sites',
                controller: 'InventorySitesListController',
                templateUrl: 'app/inv/sites/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'inv.sites'
                },
                parent: 'app.inv'
            })
            .state('app.inv.sitenew', {
                url: '/sites/new',
                controller: 'InventorySiteEditController',
                templateUrl: 'app/inv/sites/edit.html',
                resolve: loadSequence('toastr'),
                ncyBreadcrumb: {
                    parent: 'app.inv.sites',
                    label: '{{ "command.new" | translate }} {{site.siteType.name}}'
                },
                data: { edit: true }
            })
            .state('app.inv.siteedit', {
                url: '/sites/{siteId}/edit',
                controller: 'InventorySiteEditController',
                templateUrl: 'app/inv/sites/edit.html',
                resolve: loadSequence('toastr'),
                ncyBreadcrumb: {
                    parent: 'app.inv.sites',
                    label: '{{site.siteType.name}}'
                }
            })

    }])

    .controller('InventorySitesListController', ['$scope', '$translate', '$state', 'Restangular', ($scope, $translate, $state, Restangular) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.inv.sitenew');
        }
        $scope.app.title = $translate.instant('app.inv.sites');
        
    }
    ])
    .controller('InventorySiteEditController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr', ($scope, $translate, $stateParams, $state, Restangular, toastr) => {
        var id = $stateParams.siteId;

        $scope.edit = () => {
            $state.go('app.inv.siteedit', { siteId: id });
        }

        $scope.view = () => {
            $state.go('app.inv.sitenew', { siteId: id });
        }

        $scope.save = () => {
            if (id) {
                $scope.site.put().then(() => {
                    toastr.success('Editor de depósito', 'El depósito se actualizó con éxito');
                    $state.go('app.inv.sites', { siteId: id });
                });
            } else {
                Restangular.service('inv/site').post($scope.site).then((result) => {
                    toastr.success('Editor de depósito', 'El depósito se creó con éxito');
                    $state.go('app.inv.sites', { siteId: result.id });
                });
            }
        }
        
        function load() {
            if (id) {
                Restangular.one('inv').one('site', id).get().then(result => {
                    $scope.site = result;
                });
            } else {
                $scope.site = {};
            }
        }

        load();
    }
    ])
    .directive('invSitesGrid', ($state, $window, authManager) => {
        return {
            restrict: 'A',
            scope: { filter: '=', showOnlyActive: '=' },
            link: (scope: any, element) => {
                var gridElementName = 'sitesGrid';
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
                    gridModel.colNames = ['', 'Id', 'Nombre'];
                    gridModel.colModel = [

                        { name: 'editCommand', index: 'editCommand', formatter: viewFormatter, width: 25, fixed: true, align: 'center', sortable: false, search: false },
                        { name: 'id', index: 'id', width: 100, fixed: true, align: 'right', search: false },
                        { name: 'name', index: 'name', search: false }
                    ];

                    return gridModel;
                }

                function loadGrid(filter?: string) {
                    $.jgrid.gridUnload(`#${gridElementName}`);

                    scope.height = scope.height || 450;
                    var gridModel = buildGridModel();
                    var url = '/api/inv/sites.json';

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
                        loadBeforeSend: function(jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        gridview: true,
                        pager: pagerElementName,
                        footerrow: true,
                        userDataOnFooter: true,
                        viewrecords: true,
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
                                    $state.go('app.inv.siteedit', { siteId: rowId });
                                    break;
                            }

                            return false;
                        }
                    });
                    
                }
                

                loadGrid();
            }
        };
    })