angular.module('app.financials.ar.debtmanagement.debtortypes', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.debtortypes',
       {
           url: '/debtortypes',
           controller: 'FinancialsDebtManagementDebtorTypesController',
           templateUrl: 'app/financials/ar/debtmanagement/debtortypes/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.debtortypes'
           }
       })
       .state('app.financials.ar.debtmanagement.debtortype',
           {
               url: '/debtortypes/{debtorTypeId}',
               controller: 'FinancialsDebtManagementDebtorTypeController',
               templateUrl: 'app/financials/ar/debtmanagement/debtortypes/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),      
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.debtortypes',
                   label: 'findm.debtortype'
               }
           });
   })
   .controller('FinancialsDebtManagementDebtorTypesController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.debtortype');
       }
   })
   .controller('FinancialsDebtManagementDebtorTypeController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr', ($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.debtorTypeId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('debtortypes', id).get().then(result => {
                   $scope.debtorType = result;
               });
           }
       }
    
       /*
       $scope.delete = () => {
        $scope.debtorType.remove().then(() => { $state.go('app.financials.ar.debtmanagement.debtortypes')});
        }
       */
        
        $scope.delete = () => {
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.debtorType.remove().then(() => {
                            toastr.success('Se ha dado de baja el tipo de deudor con éxito.', 'Editor de tipo de deudor');
                            $state.go('app.financials.ar.debtmanagement.debtortypes');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el tipo de deudor.', 'Editor de tipo de deudor');
                        });
                    });
                    }
            });
        }
        
       $scope.save = () => {
           if (id) {
               $scope.debtorType.put().then(() => { $state.go('app.financials.ar.debtmanagement.debtortypes'); });
               toastr.success('Se ha modificado el tipo de deudor con éxito.', 'Editor de tipo de deudor');
           } else {
               Restangular.service('financials/debtmanagement/debtortypes').post($scope.debtorType).then(() => { $state.go('app.financials.ar.debtmanagement.debtortypes'); });
               toastr.success('Se ha dado de alta el tipo de deudor con éxito.', 'Alta de tipo de deudor');
           }
        
       }

       load();
   }])
   .directive('financialsArDebtManagementDebtorTypesGrid', ($state, authManager) => {
       return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementDebtorTypesGrid';
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
                   { name: 'businessPartnerTypeName', index: 'businessPartnerTypeName', search: true },
                   { name: 'name', index: 'name', search: true }
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/debtortypes.json',
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
                           var stateName = 'app.financials.ar.debtmanagement.debtortype';
                           $state.go(stateName, { debtorTypeId: rowId });
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

