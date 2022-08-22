angular.module('app.financials.ar.debtmanagement.normatives', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.normatives',
       {
           url: '/normatives',
           controller: 'FinancialsDebtManagementNormativesController',
           templateUrl: 'app/financials/ar/debtmanagement/normatives/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.normatives'
           }
       })
       .state('app.financials.ar.debtmanagement.normative',
           {
               url: '/normatives/{Id}',
               controller: 'FinancialsDebtManagementNormativeController',
               templateUrl: 'app/financials/ar/debtmanagement/normatives/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.normatives',
                   label: 'findm.normative'
               }
           });
   })
   .controller('FinancialsDebtManagementNormativesController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.normative');
       }
   })
   .controller('FinancialsDebtManagementNormativeController',['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr', ($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.Id;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('normatives', id).get().then(result => {
                   $scope.normative = result;
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
                        $scope.normative.remove().then(() => {
                            toastr.success('Se ha dado de baja la normativa con éxito.', 'Editor de normativa');
                            $state.go('app.financials.ar.debtmanagement.normatives');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja la normativa.', 'Editor de normativa');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.normative.put().then(() => { $state.go('app.financials.ar.debtmanagement.normatives'); });
               toastr.success('Se ha modificado la normativa con éxito.', 'Editor de normativa');
           } else {
               Restangular.service('financials/debtmanagement/normatives').post($scope.normative).then(() => { $state.go('app.financials.ar.debtmanagement.normatives'); });
               toastr.success('Se ha dado de alta la normativa con éxito.', 'Alta de normativa');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementNormativesGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementNormativeGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['', 'Normativa', 'Observaciones'];
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
                                         
                   { name: 'name', index: 'name', search: true },                                     
                   { name: 'observations', index: 'observations', search: true }            
                  
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/normatives.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.normative';
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

  

   

