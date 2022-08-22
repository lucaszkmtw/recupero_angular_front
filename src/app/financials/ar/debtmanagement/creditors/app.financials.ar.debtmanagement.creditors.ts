angular.module('app.financials.ar.debtmanagement.creditors', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.creditors',
          {
           url: '/creditors',
           controller: 'FinancialsDebtManagementCreditorsController',
           templateUrl: 'app/financials/ar/debtmanagement/creditors/list.html',

           //templateUrl es la direccion fisica
           
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.creditors'
           }
       })
       .state('app.financials.ar.debtmanagement.creditor',
           {
               url: '/creditors/{Id}&{AccountId}',
               controller: 'FinancialsDebtManagementCreditorController',
               templateUrl: 'app/financials/ar/debtmanagement/creditors/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),   
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.creditors',
                   label: 'findm.creditor'
               }
           });


   })
   .controller('FinancialsDebtManagementCreditorsController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
           
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.creditor');
           //state.go.. va al estado especificado  
       }
   })
   .controller('FinancialsDebtManagementCreditorController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr', ($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {
       var id = $stateParams.Id;
       $scope.accountId = $stateParams.AccountId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('creditors', id).get().then(result => {
                   $scope.creditor = result;
               });
           }
       }


        $scope.delete = () => {
            //alert('va a borrar');
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {

               closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.creditor.remove().then(() => {
                            toastr.success('Se ha dado de baja el acreedor con éxito.', 'Editor de acreedor');
                            $state.go('app.financials.ar.debtmanagement.creditors');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el acreedor.', 'Editor de acreedor');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.creditor.put().then(() => { $state.go('app.financials.ar.debtmanagement.creditors'); });
               toastr.success('Se ha modificado el acreedor con éxito.', 'Editor de acreedor');
           } else {
               Restangular.service('financials/debtmanagement/creditors').post($scope.creditor).then(() => { $state.go('app.financials.ar.debtmanagement.creditors'); });
               toastr.success('Se ha dado de alta el acreedor con éxito.', 'Alta de Acreedor');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementCreditorsGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementCreditorGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

              var colNames = ['',  'Acreedor','AccountId'];
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

                 { name: 'personName', index: 'personNameContains', search: true },
                 { name: 'accountId', index: 'accountId', hidden: true }
                   
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/creditors.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.creditor';
                           var rowData = $(this).jqGrid("getRowData", rowId);
                           $state.go(stateName, { Id: rowId, AccountId: rowData.accountId  });
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

