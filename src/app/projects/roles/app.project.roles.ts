angular.module('app.projects.roles', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.projects.roles', {
                url: '/proyects/roles',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'projects.roles'
                }
            })
            .state('app.projects.roles.list', {
                url: '/proyects/roles',
                controller: 'ProjectsRolesController',
                templateUrl: 'app/projects/roles/list.html', 
                resolve: loadSequence('jqueryui', 'jqGrid'),
                ncyBreadcrumb: {
                    label: 'projects.roles'
                }
            })
            .state('app.projects.roles.new', {
                url: '/proyects/rol/new',
                controller: 'ProjectsRolController',
                templateUrl: 'app/projects/roles/form.html',
                resolve: loadSequence(
                    'ui.tree',
                    'jqGrid',
                    'icheck',
                    'ui-mask',
                    'toastr',
                    'ngCkeditor'
                ),
                ncyBreadcrumb: {
                    parent: 'app.projects.roles',
                    label: 'project.rol.new'
                }
            })
            .state('app.projects.roles.edit', {
                url: '/projects/rol/{rolId}/edit',
                controller: 'ProjectsRolController',
                templateUrl: 'app/projects/roles/form.html',
                resolve: loadSequence(
                    'ui.tree',
                    'icheck',
                    'ui-mask',
                    'toastr',
                    'ngCkeditor'
                ),
                ncyBreadcrumb: {
                    parent: 'app.projects.roles',
                    label: 'project.rol.new'
                }
            });
            
    }])
    .constant('projectStatus', [
        { id: 0, name: 'Propuesto' },
        { id: 1, name: 'En ejecución' },
        { id: 2, name: 'Finalizado' },
        { id: 3, name: 'Abandonado' }
    ])
     .constant('projectRoles', [
        { id: 1, name: 'Promotor' }
    ])
    .controller('ProjectsRolesController', ['$scope', '$translate', '$state',  ($scope, $translate, $state) => {
      
        $scope.new = () => {
            $state.go('app.projects.roles.new');
        }

    }])
    .controller('ProjectsRolController', ['$scope', '$translate', '$state', 'toastr','$stateParams','Restangular',($scope, $translate, $state,toastr,$stateParams,Restangular) => {
         var id = $stateParams.rolId;
         $scope.rol = null;

        function load() {
            if (id) {
                // TODO[Back]

               var  rolSelected =  { id: 3,name:"CEO"  };
                                    
                $scope.rol = rolSelected;
                //Restangular.one('project').one('rols', id).get().then(result => {
                //    $scope.rol = result;
                //});
                
            }
        }

        $scope.delete = () => {
            $scope.rol.remove().then(() => {
                toastr.success('Se ha dado de baja el Rol con éxito.', 'Editor de Roles de Proyectos');
                $state.go('app.projects.roles.list');
            }, () => {
                toastr.error('Se produjo un error al dar de baja el Rol.', 'Editor de Roles de Proyectos');
            });
        }

        $scope.save = () => {
            if (id) {
                $scope.rol.put().then(() => {   $state.go('app.projects.roles.list'); });
            } else {
                Restangular.service('proyects/rols').post($scope.rol).then(() => { $state.go('app.projects.roles.list'); });
            }
        }


    }])
      .directive('proyectsRolsGrid', ($state, Restangular, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'proyectsRolsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;

                var colNames = ['', 'Nombre'];
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
                    { name: 'name', index: 'nameContains', search: true },
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/app/proyects/api/roles/roles.json',
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
                            var stateName = 'app.projects.roles.edit';
                            $state.go(stateName, { rolId: rowId });
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