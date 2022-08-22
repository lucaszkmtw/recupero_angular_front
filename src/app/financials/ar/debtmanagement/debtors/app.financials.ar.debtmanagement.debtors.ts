angular.module('app.financials.ar.debtmanagement.debtors', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.debtors',
          {
           url: '/debtors',
           controller: 'FinancialsDebtManagementDebtorsController',
           templateUrl: 'app/financials/ar/debtmanagement/debtors/list.html',

           //templateUrl es la direccion fisica
           
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.debtors'
           }
       })
       .state('app.financials.ar.debtmanagement.debtor',
           {
               url: '/debtors/{Id}&{AccountId}',
               controller: 'FinancialsDebtManagementDebtorController',
               templateUrl: 'app/financials/ar/debtmanagement/debtors/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),   
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.debtors',
                   label: 'findm.debtor'
               }
           });


   })
   .controller('FinancialsDebtManagementDebtorsController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.debtor');
           //state.go.. va al estado especificado
       }
   })
   .controller('FinancialsDebtManagementDebtorController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr','$rootScope', ($scope: any, $translate, $stateParams, $state, Restangular,toastr, $rootScope) => {

       var id = $stateParams.Id;
       $scope.accountId = $stateParams.AccountId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('debtors', id).get().then(result => {
                   $scope.debtor = result;
                   $scope.accountId = result.accountId;
               });

           }
       }
       /*
       $scope.delete = () => {
        if (id) {
            $scope.debtor.remove().then(() => { $state.go('app.financials.ar.debtmanagement.debtors'); });
            }
        }
        */
        $scope.delete = () => {
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.debtor.remove().then(() => {
                            toastr.success('Se ha dado de baja el deudor con éxito.', 'Editor de deudor');
                            $state.go('app.financials.ar.debtmanagement.debtors');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el deudor.', 'Editor de deudor');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.debtor.put().then(() => { $state.go('app.financials.ar.debtmanagement.debtors'); });
               toastr.success('Se ha modificado el deudor con éxito.', 'Editor de deudor');
           } else {
               Restangular.service('financials/debtmanagement/debtors').post($scope.debtor).then(() => { $state.go('app.financials.ar.debtmanagement.debtors'); });
               toastr.success('Se ha dado de alta el deudor con éxito.', 'Alta de deudor');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementDebtorsGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementDebtorGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['',  'Tipo Deudor','Deudor','AccountId'];
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

                   { name: 'debtorTypeName', index: 'debtorTypeName', search: true },                      
                   { name: 'personName', index: 'personNameContains', search: true },
                   { name: 'accountId', index: 'accountId', hidden: true }
                   
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/debtors.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.debtor';
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

