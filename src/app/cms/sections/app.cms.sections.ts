angular.module('app.cms.sections', ['app.core', 'app.cms'])
    .config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('section', {
                url: '/section/{sectionId}',
                templateUrl: '/app/cms/section.htm',
                controller: 'sectionViewController'
            })
            .state('content', {
                url: '/content/{contentId}',
                templateUrl: '/app/cms/content.htm',
                controller: 'contentViewController'
            })
            .state('app.cms.sections', {
                url: '/sections',
                resolve: loadSequence('tableDnD', 'kendotreeview', 'toastr', 'icheck', 'jqueryui', 'jqGrid', 'ngStorage'),
                templateUrl: '/app/cms/sections/index.htm',
                controller: 'sectionIndexController',
                ncyBreadcrumb: {
                    parent: 'app.cms',
                    label: 'cms.sections'
                }
            })
            .state('app.cms.section', {
                url: '/sections/{sectionId}',
                resolve: loadSequence('tableDnD', 'kendotreeview', 'toastr', 'icheck', 'jqueryui', 'jqGrid', 'ngStorage'),
                templateUrl: '/app/cms/sections/index.htm',
                controller: 'sectionIndexController',
                ncyBreadcrumb: {
                    parent: 'app.cms.sections',
                    label: 'cms.section'
                }
            })
            .state('app.cms.section.topics', {
                url: '/topics',
                templateUrl: '/app/cms/sections/sectiontopics.htm',
                controller: 'sectionTopicsController'
            })
            .state('app.cms.section.topic', {
                url: '/topics/{sectionTopicId}',
                templateUrl: '/app/cms/sections/sectiontopic.htm',
                controller: 'sectionTopicEditController'
            })
            .state('app.cms.section.newtopic', {
                url: '/new',
                templateUrl: '/app/cms/sections/sectiontopic.htm',
                controller: 'sectionTopicEditController'
            });
    }])
    .controller('sectionIndexController', ($scope, $window, $location, $state, $stateParams, $sessionStorage) => {
        var id = $stateParams.sectionId;
        $scope.$storage = $sessionStorage;
    })
    .controller('sectionViewController', ($log, $scope, $stateParams, Restangular) => {
        debugger;
        var sectionId = $stateParams.sectionId;
        Restangular.one('cms').one('sections', sectionId).get({ includeSubSections: true }).then((data) => {
            if (data != null) {
                $scope.section = data.plain();
            }
        });
    })
    .controller('contentViewController', ($log, $scope, $stateParams, Restangular) => {
        var contentId = $stateParams.contentId;
        Restangular.one('cms').one('contents', contentId).get().then((data) => {
            $scope.content = data;
        });

        $scope.goBack = () => {
            window.history.back();
        };
    })
    .controller('sectionInfoController', ($scope) => { })
    .controller('sectionContentsController', ($scope) => { })
    .controller('sectionTopicsController', ($scope, $state) => {
        $scope.create = () => {
            $state.go('sections.topics.create');
        };
    })
    .controller('sectionTopicEditController', ($scope, $state, $stateParams, Restangular) => {
        var sectionId = $stateParams.id;;

        $scope.sectionTopicTypes = [
            { 'id': 0, 'text': 'Sitio Relacionado' },
            { 'id': 1, 'text': 'Nota Relacionada' }
        ];

        $scope.openModes = [
            { 'id': 0, 'text': '_self' },
            { 'id': 1, 'text': '_blank' },
            { 'id': 2, 'text': '_parent' },
            { 'id': 3, 'text': '_top' },
            { 'id': 4, 'text': '_search' }
        ];

        var id = $stateParams.sectionTopicId;

        if (id) {
            Restangular.one('sections', sectionId).one('topics', id).get().then((data) => {
                $scope.sectionTopic = data;
            });
        } else {
            $scope.sectionTopic = {};
        }

        $scope.browseUrl = () => {
            /*
            var finder = new CKFinder();
            finder.basePath = '/lib/ckfinder/';
            if ($scope.sectionTopic && $scope.sectionTopic.link && $scope.sectionTopic.link != null) {
                finder.startupPath = $scope.sectionTopic.link.replace('/media', 'media:');
            }

            finder.selectActionFunction = (url) => {
                $scope.$apply(() => {
                    $scope.sectionTopic.link = 'http://www.cpau.org' + url;
                });
            };
            finder.popup();
            */
        };

        $scope.list = () => {
            $state.go('sections.topics.list');
        };

        $scope.save = () => {
            if (!$scope.sectionTopic.sectionId) {
                $scope.sectionTopic.sectionId = sectionId;
            }

            if ($scope.sectionTopic.id) {
                $scope.sectionTopic.put().then(() => {
                    $state.go('sections.topics.list');
                });
            } else {
                Restangular.one('sections', sectionId).all('topics').post($scope.sectionTopic).then(() => {
                    $state.go('sections.topics.list');
                });
            }
        };

        $scope.close = () => {

        };
    })
    .directive('cmsSections', ($log, $sessionStorage, Restangular, dialogs, toastr) => {
        return {
            restrict: 'EA',
            scope: { sectionId: '=?', showSectionsTree: '@?' },
            templateUrl: '/app/cms/sections/sections.htm',
            link: (scope: any, element) => {
                scope.params = {
                    mode: 1
                };

                scope.$storage = $sessionStorage;

                scope.views = [
                    { index: 0, heading: 'Info', route: 'app.cms.section.info', active: false, show: true, template: '/app/cms/sections/info.htm' },
                    { index: 1, heading: 'Contenidos', route: 'app.cms.section.contents', active: false, show: true, template: '/app/cms/sections/contents.htm' }//,
                    //{ index: 2, heading: 'Relaciones', route: 'app.cms.section.topics.list', active: false, show: false }
                ];

                scope.go = (route) => {
                    if (scope.sectionId) {
                        //$state.go(route);
                    }
                };

                scope.active = (route) => {
                    return true;  //$state.is(route);
                };

                scope.$on('$stateChangeSuccess', () => {
                    /*
                    scope.state = $state.current.name;
                    scope.views.forEach((view) => {
                        view.active = scope.active(view.route);
                    });
                    */
                });

                scope.canShowSectionsTree = () => {
                    if (angular.isDefined(scope.showSectionsTree)) {
                        return scope.showSectionsTree;
                    }
                    return scope.$storage.showSectionsTree;
                }

                scope.addSectionContent = () => {
                    var item = {
                        sectionId: scope.section.id,
                        contentId: scope.params.contentId
                    };

                    Restangular.one('cms').all('sectioncontents').post(item).then(() => {
                        scope.params.contentId = null;
                        scope.$broadcast('refresh');
                        toastr.success('Administrador de secciones', 'Se asoció el contenido a la sección con éxito.');
                    });
                };

                scope.createSection = () => {
                    scope.params.mode = 0;
                    scope.newSection = {
                        parentId: scope.sectionId
                    };
                };

                scope.save = () => {
                    Restangular.one('cms').all('sections').put(scope.section).then((data) => {
                        scope.newSetion = null;
                        scope.sectionId = data.id;
                        scope.params.mode = 1;
                    });
                }

                scope.saveNewSection = () => {
                    Restangular.one('cms').all('sections').post(scope.newSection).then((data) => {
                        scope.newSetion = null;
                        scope.sectionId = data.id;
                        scope.params.mode = 1;
                    });
                };

                scope.removeSection = () => {
                    var dlg = dialogs.confirm('Administrador de secciones', 'Está seguro que desea eliminar esta sección?');
                    dlg.result.then((btn) => {
                        Restangular.one('cms').one('sections', scope.sectionId).remove().then(() => {
                            toastr.success('La sección se eliminó con éxito.', 'Administrador de secciones');
                            scope.sectionId = scope.section.parentId;
                            scope.$broadcast('reload', { sectionId: scope.sectionId });
                        });
                    });
                };

                scope.$watch('sectionId', (value) => {
                    if (value) {
                        load(value);
                    } else {
                        load();
                    }
                }, true);

                function load(sectionId?: number) {
                    if (sectionId) {
                        Restangular.one('cms').one('sections', scope.sectionId).get({ includeSubSections: true }).then((data) => {
                            scope.section = data;
                        });
                    } /*else {
                        Restangular.one('cms').one('sections').get({ includeSubSections: true }).then((data) => {
                            scope.section = data;
                        });
                    }*/
                }
            }
        }
    })
    .directive('sectionstree', ($log, Restangular, toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { sectionId: '=?' },
            link: (scope: any, element) => {
                var position = 0;

                function onDrop(e) {
                    switch (e.dropPosition) {
                        case 'over':
                            position = 0;
                            break;
                        case 'before':
                            position = 1;
                            break;
                        case 'after':
                            position = 2;
                            break;
                    }

                    var sourceDataItem = this.dataItem(e.sourceNode);
                    var targetDataItem = this.dataItem(e.destinationNode);

                    Restangular.service('cms/sections/' + sourceDataItem.id + '/move').post({ targetId: targetDataItem.id, position: position }).then(() => {
                        toastr.success('Editor de secciones', 'La sección se reubicó correctamente.');
                    }, () => {
                        toastr.error('Editor de secciones', 'Hubo un error al intentar reubicar la sección.');
                    });
                }

                var data = new kendo.data.HierarchicalDataSource({
                    transport: {
                        read: {
                            url: API_HOST + '/api/cms/sections/nodes',
                            dataType: 'jsonp',
                            beforeSend: function(req) {
                                var header = 'Bearer ' + authManager.getToken();
                                req.setRequestHeader("Authorization", header);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: 'id',
                            hasChildren: (item) => {
                                return item.childCount > 0;
                            }
                        }
                    },
                    requestEnd: () => {
                        var treeView: any = $(element).data('kendoTreeView');
                        if (treeView) {
                            treeView.expand('.k-item');
                        }
                    }
                });

                var treeView = $(element).kendoTreeView({
                    dataSource: data,
                    autoBind: false,
                    dragAndDrop: true,
                    dataBound: onDataBound,
                    dataTextField: ['name'],
                    select: (e) => {
                        var id = treeView.dataItem(e.node).id;
                        scope.sectionId = id;
                        scope.$apply();
                    },
                    drop: onDrop
                }).data('kendoTreeView');

                function onDataBound() {
                    if (treeView.select().length === 0) {
                        var model = data.get(+scope.sectionId);
                        if (model) {
                            var node = treeView.findByUid(model.uid);
                            treeView.expand(treeView.parent(node));
                            treeView.select(node);
                        }
                    }
                }

                scope.$watch('sectionId', (value) => {
                    var model = data.get(+value);
                    if (!model) {
                        data.read();
                        model = data.get(+value);
                    }
                    if (model) {
                        var node = treeView.findByUid(model.uid);
                        treeView.expand(treeView.parent(node));
                        treeView.select(node);
                    }
                }, true);

                scope.$on('reload', (event, args) => {
                    var sectionId: number = null;
                    if (angular.isDefined(args.sectionId)) {
                        sectionId = args.sectionId;
                    } else {
                        sectionId = scope.sectionId;
                    }
                    data.read().then(() => {
                        var data1 = data.data();
                        var model = data.get(+sectionId);
                        var node = treeView.findByUid(model.uid);
                        treeView.expand(node);
                    });
                });
            }
        };
    })
    .directive('cmsSectionContentsGrid', ($window, $timeout, $compile, dialogs, Restangular, toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { sectionId: '@', orderItemsBy: '@', sectionContentsView: '@', filter: '=' },
            link: (scope: any, element) => {
                $timeout(() => {
                    var gridElementName = 'cmsSectionContentsGrid';
                    var pagerElementName = gridElementName + 'Pager';
                    var gridElement = angular.element('<table></table>');
                    gridElement.attr('id', gridElementName);
                    var pagerElement = angular.element('<div></div>');
                    pagerElement.attr('id', pagerElementName);
                    element.append(gridElement);
                    element.append(pagerElement);

                    scope.selectedItems = [];

                    function loadGrid() {
                        scope.height = scope.height || 250;
                        scope.selectedRow = null;
                        var colNames = ['', 'Título', ''];
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
                            {
                                name: 'content.title',
                                index: 'content.title',
                                sortable: true
                            }, {
                                name: 'removeCommand',
                                index: 'removeCommand',
                                width: 25,
                                align: 'center',
                                fixed: true,
                                sortable: false,
                                search: false,
                                formatter: (cellValue, options, rowObject) => { return '<i data-ng-click="removeSectionContent(' + rowObject.id + ')" class="fa fa-trash-o fa-fw hand"></i>'; }
                            }
                        ];

                        gridElement.tableDnD({
                            onDrop: (table, row) => {
                                var id = +row.id;
                                var targetId;
                                var position;
                                var newIndex = row.rowIndex;
                                if (newIndex < table.rows.length - 1) {
                                    targetId = +table.rows[newIndex + 1].id;
                                    position = 1;
                                } else {
                                    targetId = +table.rows[newIndex - 1].id;
                                    position = 2;
                                }

                                Restangular.service('/cms/sectioncontents/move').post({ sourceId: id, targetId: targetId, position: position }).then(() => {
                                    loadData();
                                });
                            }
                        });

                        gridElement.jqGrid({
                            regional: 'es-ar',
                            datatype: 'local',
                            height: scope.height,
                            autowidth: true,
                            responsive: true,
                            styleUI: 'Bootstrap',
                            colNames: colNames,
                            colModel: colModel,
                            scroll: 1,
                            mtype: 'GET',
                            gridview: true,
                            rowNum: 100,
                            pager: pagerElementName,
                            viewrecords: true,
                            loadBeforeSend: function(jqXHR) {
                                jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                            },
                            jsonReader: {
                                page: obj => ((obj.offset / 100) + 1),
                                total: obj => ((obj.total / 100) + (obj.total % 100 > 0 ? 1 : 0)),
                                records: 'total',
                                repeatitems: false,
                                root: 'data'
                            },
                            beforeRequest: () => {
                                var currentPage = gridElement.jqGrid('getGridParam', 'page');
                                gridElement.jqGrid('setGridParam', { postData: { skip: (currentPage - 1) * 100, take: 100 } });
                            },
                            beforeSelectRow() {
                                return false;
                            },
                            loadComplete: () => {
                                $compile(angular.element('#' + gridElementName))(scope);
                            },
                            gridComplete: () => {
                                $('#_empty', '#' + gridElementName).addClass('nodrag nodrop');
                                jQuery('#' + gridElementName).tableDnDUpdate();
                                resizeGrid();
                            }
                        });

                        gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                            del: false,
                            add: false,
                            edit: false
                        }, {}, {}, {}, { multipleSearch: false });
                        gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                        gridElement.jqGrid('bindKeys');

                        scope.removeSectionContent = (id) => {
                            var dlg = dialogs.confirm('Editor de secciones', 'Está seguro que desea eliminar esta asignación?');
                            dlg.result.then((btn) => {
                                Restangular.one('cms').one('sectioncontents', id).remove().then(result => {
                                    toastr.success('Editor de secciones', 'La operación se realizó con éxito.');
                                    gridElement.trigger('reloadGrid');
                                });
                            });
                        };

                        loadData();
                    }

                    function resizeGrid() {
                        var tabElement = $('#' + gridElementName).closest('.tab-pane');
                        var width = tabElement.width() - 68;
                        gridElement.jqGrid('setGridWidth', width, true);
                    }

                    function loadData() {
                        var url = API_HOST + '/api/cms/sections/' + scope.sectionId + '/contents.json';
                        gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                        gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                        gridElement.trigger('reloadGrid');
                        resizeGrid();
                    }

                    var gridLoaded = false;

                    scope.$watch('sectionId', () => {
                        if (scope.sectionId) {
                            if (!gridLoaded) {
                                loadGrid();
                            } else {
                                loadData();
                            }
                        }
                    });

                    scope.$watch('orderItemsBy', () => {
                        if (scope.sectionId) {
                            loadData();
                        }
                    });

                    scope.$watch('sectionContentsView', () => {
                        if (scope.sectionId) {
                            loadData();
                        }
                    });

                    scope.$on('refresh', () => {
                        if (scope.sectionId) {
                            loadData();
                        }
                    });
                }, 0);
            }
        };
    })
    .directive('sectiontopicsgrid', ($state) => {
        return {
            restrict: 'A',
            scope: { sectionId: '@', orderItemsBy: '@' },
            link: (scope: any, element) => {
                var columns: any = [
                    {
                        command: { name: 'edit', text: '', className: 'k-grid-edit' },
                        title: '&nbsp;',
                        width: 50
                    },
                    {
                        field: 'title',
                        title: 'T&iacute;tulo'
                    },
                    {
                        field: 'type',
                        title: 'Tipo',
                        width: 110,
                        filterable: true,
                        template: '<input type="checkbox" #= type ? checked="checked" : "" # />'
                    },
                    {
                        command: { name: 'destroy', text: '' },
                        title: '&nbsp;',
                        width: 50
                    }
                ];

                var grid = $(element).kendoGrid({
                    filterable: false,
                    scrollable: true,
                    sortable: true,
                    editable: {
                        update: false,
                        destroy: true,
                        confirmation: 'Está seguro que desea eliminar este tema relacionado de la sección?'
                    },
                    autoBind: false,
                    columns: columns,
                    dataSource: {
                        type: 'json',
                        autoSync: true,
                        transport: {
                            read: {
                                url: () => {
                                    return API_HOST + '/api/cms/sections/' + scope.sectionId + '/topics';
                                },
                                data: {
                                    format: 'json'
                                }
                            },
                            destroy: {
                                url: (options) => {
                                    return API_HOST + '/api/cms/sections/' + scope.sectionId + '/topics/' + options.id;
                                },
                                type: 'DELETE'
                            },
                            parameterMap: (options, operation) => {
                                if (operation === 'destroy') {
                                    return null;
                                }

                                return options;
                            }
                        },
                        schema: {
                            data: (result) => {
                                return result.data || result;
                            },
                            total: (result) => {
                                return result.total || result.length || 0;
                            },
                            model: {
                                id: 'id',
                                fields: {
                                    title: { type: 'string' }
                                }
                            }
                        }
                    },
                    dataBound: () => {
                        $(element).tableDnD(
                            {
                                onDrop: (table, row) => {
                                    var targetId;
                                    var id = grid.dataSource.getByUid($(row).data('uid')).id;
                                    var position = 2;
                                    var target = grid.dataSource.getByUid($(row).prev().data('uid'));
                                    if (!target) {
                                        targetId = grid.dataSource.getByUid($(row).next().data('uid')).id;
                                        position = 1;
                                    } else {
                                        targetId = target.id;
                                    }

                                    $.post(API_HOST + '/api/cms/sectiontopics/move', { sourceId: id, targetId: targetId, position: position }, () => {
                                        var data: any = $(element).data('kendoGrid');
                                        data.dataSource.read();
                                    });
                                }
                            });
                    }
                }).data('kendoGrid');

                $(element).delegate('.k-grid-edit', 'click', function (e) {
                    e.preventDefault();
                    var dataItem: any = grid.dataItem($(this).closest('tr'));
                    $state.go('app.cms.sections.topics.edit', { sectionTopicId: dataItem.id });
                });

                scope.$watch('sectionId', () => {
                    if (scope.sectionId) {
                        var data: any = $(element).data('kendoGrid');
                        data.dataSource.read();
                    }
                });

                scope.$on('refresh', () => {
                    if (scope.sectionId) {
                        var data: any = $(element).data('kendoGrid');
                        data.dataSource.read();
                    }
                });
            }
        };
    });