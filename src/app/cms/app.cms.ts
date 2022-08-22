angular.module('app.cms', ['app.core'])
    .config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('app.cms', {
                url: '/cms',
                template: '<div data-ui-view=""></div>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'cms'
                }
            })
            .state('app.cms.contents', {
                controller: 'contentListController',
                url: '/contents',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                templateUrl: 'app/cms/contents/list.html',
                ncyBreadcrumb: {
                    parent: 'app.cms',
                    label: 'cms.contents'
                }
            })
            .state('app.cms.newcontent', {
                controller: 'contentEditController',
                url: '/contents/new',
                resolve: loadSequence('ngCkeditor', 'icheck', 'toastr'),
                templateUrl: 'app/cms/contents/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.cms',
                    label: 'cms.content.new'
                }
            })
            .state('app.cms.content', {
                controller: 'contentEditController',
                url: '/contents/{contentId}',
                resolve: loadSequence('ngCkeditor', 'icheck', 'toastr'),
                templateUrl: 'app/cms/contents/edit.html',
                ncyBreadcrumb: {
                    parent: 'app.cms',
                    label: 'cms.content'
                }
            });
    }])
    .controller('contentListController', ['$scope', '$state', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.cms.newcontent');
        };
    }
    ])
    .directive('cmsContentsGrid', ($state, $filter, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'cmsContentsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;
                var colNames = ['', 'Título', 'Fecha creación', ''];
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
                    { name: 'title', index: 'titleContains', search: true },
                    { name: 'createDate', index: 'createDate', search: false, width: 120, fixed: true, formatter: (value) => { return $filter('amDateFormat')(value, 'L LTS'); } },
                    {
                        name: 'deleteCommand',
                        index: 'deleteCommand',
                        width: 25,
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => { return '<i class="fa fa-remove fa-fw hand"></i>'; }
                    }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/cms/contents.json',
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
                            var stateName = 'app.cms.content';
                            $state.go(stateName, { contentId: rowId });
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
    .controller('contentEditController', ['$scope', '$window', '$state', '$stateParams', 'Restangular', ($scope, $window, $state, $stateParams, Restangular) => {
        var id = $stateParams.contentId;

        $scope.editorOptions = {
            language: 'en'//,
            //extraPlugins: 'notification,notificationaggregator,embedbase,autolink,embedsemantic,autoembed,image2'
        };

        $scope.eventCategories = [
            { 'id': 1, 'name': 'Eventos' },
            { 'id': 2, 'name': 'Concursos y Becas' },
            { 'id': 3, 'name': 'Actualización profesional' }
        ];

        $scope.linkTargets = [
            { 'id': 0, 'text': '_self' },
            { 'id': 1, 'text': '_blank' },
            { 'id': 2, 'text': '_parent' },
            { 'id': 3, 'text': '_top' },
            { 'id': 4, 'text': '_search' }
        ];

        function load() {
            if (id == undefined) {
                $scope.item = Restangular.restangularizeElement(null, { allowAnonymous: true }, 'cms/contents');
            } else {
                Restangular.one('cms').one('contents', id).get().then(content => {
                    $scope.item = content;
                    $scope.$broadcast('refresh');
                });
            }
        }

        $scope.previewLink = () => {
            if ($scope.item.link) {
                $window.open($scope.item.link);
            }
        };

        $scope.save = () => {
            if (id == undefined) {
                Restangular.one('cms').all('contents').post($scope.item).then(() => {
                    $state.go('app.cms.contents');
                });
            } else {
                $scope.item.put().then(() => {
                    $state.go('app.cms.contents');
                });
            }

        };

        $scope.saveAndContinue = () => {
            $scope.item.put().then((result) => {
                $state.go('app.cms.content', { id: result.id });
            });
        };

        $scope.list = () => {
            $state.go('app.cms.contents');
        };

        load();
    }
    ]);