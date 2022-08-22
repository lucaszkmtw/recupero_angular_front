angular.module('app.afiliados', [
    'ngCookies',
    'ngStorage',
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'restangular',
    'pascalprecht.translate',
    'app.core'
])
    .config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('app.crm.afiliados', {
                url: '/afiliados',
                template: '<data-ui-view />',
                ncyBreadcrumb: {
                    label: 'Afiliados'
                },
                abstract: true
            })
            .state('app.crm.afiliados.list', {
                url: '',
                controller: 'AfiliadosListController',
                templateUrl: 'app/afiliados/list.html',
                resolve: loadSequence('ui.grid', 'ui.grid.autoResize'),
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.crm.afiliados.new', {
                url: '/new',
                controller: 'AfiliadoEditController',
                templateUrl: 'app/afiliados/edit.html',
                resolve: loadSequence('flow'),
                ncyBreadcrumb: {
                    label: 'Nuevo'
                }
            })
            .state('app.crm.afiliados.edit', {
                url: '/{afiliadoId}',
                controller: 'AfiliadoEditController',
                templateUrl: 'app/afiliados/edit.html',
                ncyBreadcrumb: {
                    label: 'Editando'
                }
            });
    }
    ])
    .controller('AfiliadosListController', ['$scope', '$translate', '$state', '$log', '$http', ($scope, $translate, $state, $log, $http) => {
        $scope.params = {
            selectedItems: []
        };

        $scope.new = () => {
            $state.go('app.crm.afiliados.new');
        }

        $scope.selectRow = (entity) => {
            $log.info(entity);
        };
    }])
    .controller('AfiliadoEditController', ['$scope', '$translate', '$location', '$stateParams', 'Restangular', '$log', ($scope, $translate, $location, $stateParams, Restangular, $log) => {
        var id = $stateParams.afiliadoId;

        function load() {
            Restangular.one('afiliados', id).get().then((data) => {
                $scope.afiliado = data;

                $scope.afiliado.getFullName = () => {
                    return $scope.afiliado.personLastName + ', ' + $scope.afiliado.personFirstName;
                };

                $log.info($scope.afiliado);
            });
        }

        if (id) {
            load();
        }
    }])
    .directive('afiliadosGrid', ($state, $window, $log, authManager) => {
        return {
            restrict: 'A',
            scope: {
                //selectedItems: '='
            },
            link: (scope: any, element, attrs, ctrl) => {
                var gridElementName = 'afiliadosGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = $(document.createElement('table')).attr('id', gridElementName);
                var pagerElement = $(document.createElement('div')).attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.selectedItems = [];

                function buildGridModel() {
                    var gridModel: IGridModel = {
                        colNames: ['', 'CUIT', 'Nombre', 'Apellido', 'Carnet'],
                        colModel: [
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
                            { name: 'vatNumber', index: 'vatNumber', width: 120, fixed: true },
                            { name: 'personFirstName', index: 'personFirstName' },
                            { name: 'personLastName', index: 'personLastName' },
                            { name: 'carnet', index: 'carnet' }
                        ]
                    };
                    return gridModel;
                }

                function loadGrid() {
                    gridElement.jqGrid('GridUnload');

                    var gridModel = buildGridModel();
                    var url = '/api/afiliados';

                    gridElement = $('#' + gridElementName);
                    gridElement.jqGrid({
                        datatype: 'json',
                        url: url,
                        height: 450,
                        autowidth: true,
                        colNames: gridModel.colNames,
                        colModel: gridModel.colModel,
                        scroll: 1,
                        mtype: 'GET',
                        rowNum: 100,
                        loadBeforeSend: function(jqXHR) {
                            jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                        },
                        multiselect: false,
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
                            root: 'results',
                        },
                        beforeSelectRow(rowid, e) {
                            return false;
                        },
                        serializeGridData: (postData) => {
                            _.forOwn(postData, (value, key) => {
                                if (key.indexOf('Contains') !== -1) {
                                    delete (postData[key]);
                                }
                            });

                            if (postData.hasOwnProperty('rows')) {
                                postData['take'] = postData['rows'];
                                delete (postData['rows']);
                            }

                            _.forEach(gridModel.colModel, (item) => {
                                if (postData.hasOwnProperty(item.index)) {
                                    postData[item.index + 'Contains'] = postData[item.index];
                                    delete (postData[item.index]);
                                }
                            });

                            if (postData.hasOwnProperty('sidx') && postData['sidx'] !== null) {
                                if (postData['sord'] === 'asc') {
                                    postData['OrderBy'] = postData['sidx'];
                                    postData['OrderByDesc'] = '';
                                } else {
                                    postData['OrderByDesc'] = postData['sidx'];
                                    postData['OrderBy'] = '';
                                }
                                delete (postData['sidx']);
                                delete (postData['sord']);
                            }
                            return postData;
                        },
                        onCellSelect: (rowId, iCol, cellcontent) => {
                            if (iCol === 0) {
                                $state.go('app.crm.afiliados.edit', { afiliadoId: rowId });
                            }

                            return false;
                        },
                        onSelectRow: (rowId, status) => {
                            var rowIndex;
                            if (status) {
                                var rowData = gridElement.jqGrid('getRowData', rowId);
                                rowIndex = _.findIndex(scope.selectedItems, (value: IHasId) => (value.id === rowId));
                                if (rowIndex === -1) {
                                    var item = {
                                        id: rowId,
                                        name: rowData.name,
                                        state: rowData.state
                                    }
                                    //scope.selectedItems.push(item);
                                }
                            } else {
                                rowIndex = _.findIndex(scope.selectedItems, { 'id': rowId });
                                //scope.selectedItems.splice(rowIndex, 1);
                            }

                            scope.$apply();
                        }
                    });

                    gridElement.jqGrid('navGrid', '#' + pagerElementName, { del: false, add: false, edit: false }, {}, {}, {}, { multipleSearch: true });
                    gridElement.jqGrid('filterToolbar', { autosearch: true });
                }

                loadGrid();
            }
        }
    });