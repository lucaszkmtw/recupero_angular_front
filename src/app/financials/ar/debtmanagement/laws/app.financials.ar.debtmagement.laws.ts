angular.module('app.financials.ar.debtmanagement.laws', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.laws',
       {
           url: '/laws',
           controller: 'FinancialsDebtManagementLawsController',
           templateUrl: 'app/financials/ar/debtmanagement/laws/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.laws'
           }
       })
       .state('app.financials.ar.debtmanagement.law',
           {
               url: '/laws/{lawId}',
               controller: 'FinancialsDebtManagementLawController',
               templateUrl: 'app/financials/ar/debtmanagement/laws/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),    
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.laws',
                   label: 'findm.law'
               }
           });
   })
   .controller('FinancialsDebtManagementLawsController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.law');
       }
   })
   .controller('FinancialsDebtManagementLawController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr',($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.lawId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('laws', id).get().then(result => {
                   $scope.law = result;
               });
           }
       }
/*
       $scope.delete = () => {
        $scope.law.remove().then(() => { $state.go('app.financials.ar.debtmanagement.laws')});
        }*/

        $scope.delete = () => {
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.law.remove().then(() => {
                            toastr.success('Se ha dado de baja la ley con éxito.', 'Editor de ley');
                            $state.go('app.financials.ar.debtmanagement.laws');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja la ley.', 'Editor de ley');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.law.put().then(() => { $state.go('app.financials.ar.debtmanagement.laws'); });
               toastr.success('Se ha modificado la ley con éxito.', 'Editor de ley');
           } else {
               Restangular.service('financials/debtmanagement/laws').post($scope.law).then(() => { $state.go('app.financials.ar.debtmanagement.laws'); });
               toastr.success('Se ha dado de alta la ley con éxito.', 'Alta de ley');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementLawsGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementLawsGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['', 'Código', 'Nombre','Prescripción'];
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
                   { name: 'name', index: 'name', search: true },
                   { name: 'prescription', index: 'prescription', search: false }
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/laws.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.law';
                           $state.go(stateName, { lawId: rowId });
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

