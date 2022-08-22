angular.module('app.financials.ar.debtmanagement.normativelaws', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.normativelaws',
       {
           url: '/normativelaws',
           controller: 'FinancialsDebtManagementNormativLawsController',
           templateUrl: 'app/financials/ar/debtmanagement/normativelaws/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.normativelaws'
           }
       })
       .state('app.financials.ar.debtmanagement.normativelaw',
           {
               url: '/normativelaws/{Id}',
               controller: 'FinancialsDebtManagementNormativeLawController',
               templateUrl: 'app/financials/ar/debtmanagement/normativelaws/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.normativelaws',
                   label: 'findm.normativelaw'
               }
           });
   })
   .controller('FinancialsDebtManagementNormativLawsController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.normativelaw');
       }
   })
   .controller('FinancialsDebtManagementNormativeLawController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular', 'toastr',($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.Id; 
       
       $scope.normativelaw = {
        laws: []
    }

       function load() {       
           if (id) {           
               Restangular.one('financials').one('debtmanagement').one('normativelaws', id).get().then(result => {
                   $scope.normativelaw = result;                
                  $scope.normativelaw.laws = result.laws;
               });
           }
       }

       $scope.loadlaws= () => {       
        var nomativelawid = $scope.normativelaw.normativeId;      
        if(nomativelawid){            
            Restangular.one('financials').one('debtmanagement').one('normativelaws',nomativelawid).get().then(result => {
            $scope.normativelaw = result;
            $scope.normativelaw.laws = result.laws;                
            });
        }
    }

       $scope.save = () => {        
           if (id) {
               $scope.normativelaw.put().then(() => { $state.go('app.financials.ar.debtmanagement.normativelaws'); });
               toastr.success('Se ha modificado la normativa ley con éxito.', 'Editor de normativa ley');
           } else {
               Restangular.service('financials/debtmanagement/normativelaws').post($scope.normativelaw).then(() => { $state.go('app.financials.ar.debtmanagement.normativelaws'); });
               toastr.success('Se ha dado de alta la normativa ley con éxito.', 'Alta de normativa ley');
           }
       }

         //#region  add Ley
         $scope.addLaw = () => {           
             Restangular.one('financials').one('debtmanagement').one('laws', $scope.params.lawId).get().then((law) => {
                 $scope.normativelaw.laws.push(law);                
                 $scope.params.lawId = null;
             });
         };

         //remove Ley
         $scope.removeLaw = (item) => {            
             var index = $scope.normativelaw.laws.indexOf(item);
             $scope.normativelaw.laws.splice(index, 1);
         }

       load();
   }])

   .directive('financialsArDebtManagementNormativeLawsGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementNormativeLawGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

               var colNames = ['', 'Normativa','Ley','NormativeId'];
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
                   { name: 'lawName', index: 'lawName', search: true },    
                   { name: 'normativeId', index: 'normativeId', search: false, hidden: true }        
                  
               ];
               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/normativelaws.json?status=0',
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
                           var stateName = 'app.financials.ar.debtmanagement.normativelaw';
                           var rowData = gridElement.jqGrid('getRowData', rowId);
                           $state.go(stateName, { Id: rowData.normativeId });                           
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

