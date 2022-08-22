angular.module('app.financials.ar.debtmanagement.credittypes', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.credittypes',
       {
           url: '/credittypes',
           controller: 'FinancialsDebtManagementCreditTypesController',
           templateUrl: 'app/financials/ar/debtmanagement/credittypes/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.credittypes'
           }
       })
       .state('app.financials.ar.debtmanagement.credittype',
           {
               url: '/credittypes/{creditTypeId}',
               controller: 'FinancialsDebtManagementCreditTypeController',
               templateUrl: 'app/financials/ar/debtmanagement/credittypes/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),      
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.credittypes',
                   label: 'findm.credittype'
               }
           });
   })
   .controller('FinancialsDebtManagementCreditTypesController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.credittype');
       }
   })
   .controller('FinancialsDebtManagementCreditTypeController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr',($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.creditTypeId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('credittypes', id).get().then(result => {
                   $scope.creditType = result;
               });
           }
       }
/*
       $scope.delete = () => {
        $scope.creditType.remove().then(() => { $state.go('app.financials.ar.debtmanagement.credittypes')});
        }*/

        $scope.delete = () => {
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.creditType.remove().then(() => {
                            toastr.success('Se ha dado de baja el tipo de crédito con éxito.', 'Editor de tipo de crédito');
                            $state.go('app.financials.ar.debtmanagement.credittypes');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el tipo de crédito.', 'Editor de tipo de crédito');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.creditType.put().then(() => { $state.go('app.financials.ar.debtmanagement.credittypes'); });
               toastr.success('Se ha modificado el tipos de crédito con éxito.', 'Editor de tipos de crédito');
           } else {
               Restangular.service('financials/debtmanagement/credittypes').post($scope.creditType).then(() => { $state.go('app.financials.ar.debtmanagement.credittypes'); });
               toastr.success('Se ha dado de alta el tipos de crédito con éxito.', 'Alta de tipos de crédito');
           }          
       }

       load();
   }])

   .directive('financialsArDebtManagementCreditTypesGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementCreditTypesGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['', 'Código', 'Nombre'];
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
                   { name: 'code', index: 'code', search: true },
                   { name: 'name', index: 'name', search: true }
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/credittypes.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.credittype';
                           $state.go(stateName, { creditTypeId: rowId });
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
   });

