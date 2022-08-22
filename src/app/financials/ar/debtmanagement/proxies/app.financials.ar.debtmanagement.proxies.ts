angular.module('app.financials.ar.debtmanagement.proxies', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.proxies',
       {
           url: '/proxies',
           controller: 'FinancialsDebtManagementProxiesController',
           templateUrl: 'app/financials/ar/debtmanagement/proxies/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.proxies' 
           }
       })
       .state('app.financials.ar.debtmanagement.proxie',
           {
               url: '/proxies/{Id}',
               controller: 'FinancialsDebtManagementProxieController',
               templateUrl: 'app/financials/ar/debtmanagement/proxies/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),      
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.proxies',
                   label: 'findm.proxie'
               }
           });
   })
   .controller('FinancialsDebtManagementProxiesController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.proxie');
       }
   })
   .controller('FinancialsDebtManagementProxieController',['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr', ($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.Id;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('proxies', id).get().then(result => {
                   $scope.proxie = result;
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
                    $scope.proxie.remove().then(() => {
                        toastr.success('Se ha dado de baja el organismo con éxito.', 'Editor de organismo');
                        $state.go('app.financials.ar.debtmanagement.proxies');
                    }, () => {
                        toastr.error('Se produjo un error al dar de baja el organismo.', 'Editor de organismo');
                    });
                });
                }
        });
    }

       $scope.save = () => {
           if (id) {
               $scope.proxie.put().then(() => { $state.go('app.financials.ar.debtmanagement.proxies'); });
               toastr.success('Se ha modificado el organismo con éxito.', 'Editor de organismo');
           } else {
               Restangular.service('financials/debtmanagement/proxies').post($scope.proxie).then(() => { $state.go('app.financials.ar.debtmanagement.proxies'); });
               toastr.success('Se ha dado de alta el organismo con éxito.', 'Alta de organismo');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementProxiesGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementProxieGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['', 'Apoderado'];
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
                                         
                   { name: 'personName', index: 'personNameContains', search: true }
                  
                  
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/proxies.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.proxie';
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
   });

