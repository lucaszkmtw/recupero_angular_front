angular.module('app.financials.ar.debtmanagement.prescriptions', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.prescriptions',
       {
           url: '/prescriptions',
           controller: 'FinancialsDebtManagementPrescriptionsController',
           templateUrl: 'app/financials/ar/debtmanagement/prescriptions/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.prescriptions'
           }
       })
       .state('app.financials.ar.debtmanagement.prescription',
           {
               url: '/prescriptions/{Id}',
               controller: 'FinancialsDebtManagementPrescriptionController',
               templateUrl: 'app/financials/ar/debtmanagement/prescriptions/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.prescriptions',
                   label: 'findm.prescription'
               }
           });
   })
   .controller('FinancialsDebtManagementPrescriptionsController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.prescription');
       }
   })
   .controller('FinancialsDebtManagementPrescriptionController',['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr', ($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.Id;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('prescriptions', id).get().then(result => {
                   $scope.prescription = result;
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
                        $scope.prescription.remove().then(() => {
                            toastr.success('Se ha dado de baja la normativa con éxito.', 'Editor de normativa');
                            $state.go('app.financials.ar.debtmanagement.prescriptions');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja la normativa.', 'Editor de normativa');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.prescription.put().then(() => { $state.go('app.financials.ar.debtmanagement.prescriptions'); });
               toastr.success('Se ha modificado la normativa con éxito.', 'Editor de normativa');
           } else {
               Restangular.service('financials/debtmanagement/prescriptions').post($scope.prescription).then(() => { $state.go('app.financials.ar.debtmanagement.prescriptions'); });
               toastr.success('Se ha dado de alta la normativa con éxito.', 'Alta de normativa');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementPrescriptionsGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementPrescriptionGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['', 'Normativa','Cant. Días', 'Observaciones','Suspende','Interrumpe', 'Desde', 'Hasta'];
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
                                         
                   { name: 'normativeName', index: 'normativeName', search: true },      
                   { name: 'numberOfDays', index: 'numberOfDays', search: true },                                     
                   { name: 'observations', index: 'observations', search: true },
                   { name: 'suspends', index: 'suspends', search: true },
                   { name: 'interrupt', index: 'interrupt', search: true },
                   { name: 'startDate', index: 'startDate', search: true, formatter: 'date' },
                   { name: 'endDate', index: 'endDate', search: true, formatter: 'date' }                   
                  
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/prescriptions.json?status=0',
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
                           var stateName = 'app.financials.ar.debtmanagement.prescription';
                           $state.go(stateName, { Id: rowId });
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
