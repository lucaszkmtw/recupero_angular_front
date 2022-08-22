angular.module('app.lms', ['app.core', 'app.cms.sections', 'ngSanitize'])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.lms', {
                url: '/lms',
                abstract: true,
                template: '<ui-view></ui-view>',
                ncyBreadcrumb: {
                    parent: 'app.dashboard',
                    label: 'lms'
                }
            })
            .state('app.lms.courses', {
                url: '/courses',
                controller: 'LMSCoursesController',
                templateUrl: 'app/lms/courses/list.html',
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    parent: 'app.lms',
                    label: 'courses'
                }
            })
            .state('app.lms.newcourse', {
                url: '/courses/new',
                controller: 'LMSNewCourseController',
                templateUrl: 'app/lms/courses/new.html',
                resolve: loadSequence('ui.router.tabs', 'jqueryui', 'ui.tree', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.lms.courses',
                    label: 'course.new'
                }
            })
            .state('app.lms.course', {
                url: '/courses/{courseId}',
                controller: 'LMSCourseController',
                templateUrl: 'app/lms/courses/edit.html',
                resolve: loadSequence('tableDnD', 'ui.router.tabs', 'toastr'),
                ncyBreadcrumb: {
                    parent: 'app.lms.courses',
                    label: 'course'
                }
            })
            .state('app.lms.course.general', {
                url: '/general',
                templateUrl: 'app/lms/courses/edit.general.html',
                resolve: loadSequence('jqueryui', 'ui.tree', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr'),
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('app.lms.course.pages', {
                url: '/lessons',
                templateUrl: 'app/lms/courses/edit.pages.html',
                resolve: loadSequence('jqueryui', 'kendotreeview', 'jqGrid', 'icheck', 'angularFileUpload', 'ngCkeditor', 'toastr', 'ngStorage'),
                ncyBreadcrumb: {
                    skip: true
                }
            });
    }
    ])
    .controller('LMSCoursesController', ['$scope', '$state', ($scope, $state) => {
        $scope.new = () => {
            $state.go('app.lms.newcourse');
        }

        $scope.params = {
            selectedItems: []
        };
    }
    ])
    .controller('LMSNewCourseController', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'toastr', ($scope, $state, $stateParams, $log, Restangular, toastr) => {
        $scope.editorOptions = {
            height: 150
        };

        $scope.save = () => {
            Restangular.one('lms').post('courses', $scope.course).then(result => {
                toastr.success('El curso se creó con éxito.', 'Editor de cursos');
                $state.go('app.lms.course.general', { courseId: result.id });
            });
        }
    }])
    .controller('LMSCourseController', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'toastr', ($scope, $state, $stateParams, $log, Restangular, toastr) => {
        var id = $stateParams.courseId;

        $scope.editorOptions = {
            height: 150
        };

        $scope.tabData = [
            {
                heading: 'General',
                route: 'app.lms.course.general'
            },
            {
                heading: 'Páginas',
                route: 'app.lms.course.pages'
            }
        ];

        $scope.save = () => {
            $scope.course.put().then(result => {
                toastr.success('El curso se actualizó con éxito.', 'Editor de cursos');
                $state.go('app.lms.course.general', { courseId: result.id });
            });
        }

        function load() {
            if (id) {
                Restangular.one('lms').one('courses', id).get().then(result => {
                    $scope.course = result;
                });
            } else {
                $scope.course = {};
            }
        }

        load();
    }
    ])
    .directive('lmsCoursesGrid', ['$state', 'authManager', ($state, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element) {
                var gridElementName = 'lmsCoursesGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 300;
                var colNames = ['', 'Nombre', 'Código'];
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
                    { name: 'name', index: 'name' },
                    { name: 'code', index: 'code' }
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: API_HOST + '/api/lms/courses.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    rowNum: 100,
                    loadBeforeSend: function(jqXHR) {
                        jqXHR.setRequestHeader("Authorization", 'Bearer ' + authManager.getToken());
                    },
                    gridview: true,
                    pager: pagerElementName,
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
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.lms.course.general';
                            $state.go(stateName, { courseId: rowId });
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
    }]);
