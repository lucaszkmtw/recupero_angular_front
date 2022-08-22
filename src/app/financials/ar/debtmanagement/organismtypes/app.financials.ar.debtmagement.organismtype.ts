angular.module('app.financials.ar.debtmanagement.organismtypes', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.organismtypes',
       {
           url: '/organismtypes',
           controller: 'FinancialsDebtManagementOrganismTypesController',
           templateUrl: 'app/financials/ar/debtmanagement/organismtypes/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.organismtypes'
           }
       })
       .state('app.financials.ar.debtmanagement.organismtype',
           {
               url: '/organismtypes/{organismTypeId}',
               controller: 'FinancialsDebtManagementOrganismTypeController',
               templateUrl: 'app/financials/ar/debtmanagement/organismtypes/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),             
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.organismtypes',
                   label: 'findm.organismtype'
               }
           });
   })
   .controller('FinancialsDebtManagementOrganismTypesController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.organismtype');
       }
   })
   .controller('FinancialsDebtManagementOrganismTypeController',['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr',($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.organismTypeId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('organismtypes', id).get().then(result => {
                   $scope.organismType = result;
               });
           }
       }

        $scope.delete = () => {
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.organismType.remove().then(() => {
                            toastr.success('Se ha dado de baja el tipo de organismo con éxito.', 'Editor de tipo de organismo');
                            $state.go('app.financials.ar.debtmanagement.organismtypes');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el tipo de organismo.', 'Editor de tipo de organismo');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.organismType.put().then(() => { $state.go('app.financials.ar.debtmanagement.organismtypes'); });
               toastr.success('Se ha modificado el tipos de organismo con éxito.', 'Editor de tipos de organismo');
              
           } else {
               Restangular.service('financials/debtmanagement/organismtypes').post($scope.organismType).then(() => { $state.go('app.financials.ar.debtmanagement.organismtypes'); });
               toastr.success('Se ha dado de alta el tipos de organismo con éxito.', 'Alta de tipos de organismo');
              
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementOrganismTypesGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementOrganismTypesGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['','Tipo Código', 'Código', 'Nombre'];
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
                   { name: 'businessPartnerTypeName', index: 'businessPartnerTypeName', search: false },
                   { name: 'code', index: 'code', search: false },
                   { name: 'name', index: 'name', search: false }
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/organismtypes.json',
                   datatype: 'json',
                   height: scope.height,
                   autowidth: true,
                   responsive: true,
                   styleUI: 'Bootstrap',
                   formatter: {
                       bool: (j) => { return j ? 'Sí' : 'No' }
                   },
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
                           var stateName = 'app.financials.ar.debtmanagement.organismtype';
                           $state.go(stateName, { organismTypeId: rowId });
                       }

                       return false;
                   },

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
   });

