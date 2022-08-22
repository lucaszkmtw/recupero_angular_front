angular.module('app.financials.ar.debtmanagement.licensetypes', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.licensetypes',
       {
           url: '/licensetypes',
           controller: 'FinancialsDebtManagementLicenseTypesController',
           templateUrl: 'app/financials/ar/debtmanagement/licensetypes/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.licensetypes'
           }
       })
       .state('app.financials.ar.debtmanagement.licensetype',
           {
               url: '/licensetypes/{licenseTypeId}',
               controller: 'FinancialsDebtManagementLicenseTypeController',
               templateUrl: 'app/financials/ar/debtmanagement/licensetypes/edit.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),      
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.licensetypes',
                   label: 'findm.licensetype'
               }
           });
   })
   .controller('FinancialsDebtManagementLicenseTypesController', ($scope, $translate, $state) => {
       $scope.params = {
           selectedItems: []
       };
       $scope.new = () => {
           $state.go('app.financials.ar.debtmanagement.licensetype');
       }
   })
   .controller('FinancialsDebtManagementLicenseTypeController', ['$scope', '$translate', '$stateParams', '$state', 'Restangular','toastr',($scope: any, $translate, $stateParams, $state, Restangular,toastr) => {

       var id = $stateParams.licenseTypeId;

       function load() {
           if (id) {
               Restangular.one('financials').one('debtmanagement').one('licensetypes', id).get().then(result => {
                   $scope.licenseType = result;
               });
           }
       }
       /*
       $scope.delete = () => {
        $scope.licenseType.remove().then(() => { $state.go('app.financials.ar.debtmanagement.licensetypes')});
        }
        */

        $scope.delete = () => {
            toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
            {
                closeButton: false,
                allowHtml: true,
                onShown: function (toast) {
                    $("#confirmationRevertYes").click(function(){
                        $scope.licenseType.remove().then(() => {
                            toastr.success('Se ha dado de baja el tipo de Matrícula con éxito.', 'Editor de tipo de Matrícula');
                            $state.go('app.financials.ar.debtmanagement.licensetypes');
                        }, () => {
                            toastr.error('Se produjo un error al dar de baja el tipo de organismo.', 'Editor de tipo de Matrícula');
                        });
                    });
                    }
            });
        }

       $scope.save = () => {
           if (id) {
               $scope.licenseType.put().then(() => { $state.go('app.financials.ar.debtmanagement.licensetypes'); });
               toastr.success('Se ha modificado el tipo de matrícula con éxito.', 'Editor de tipo de matrícula');
           } else {
               Restangular.service('financials/debtmanagement/licensetypes').post($scope.licenseType).then(() => { $state.go('app.financials.ar.debtmanagement.licensetypes'); });
               toastr.success('Se ha dado de alta el tipos de matrícula con éxito.', 'Alta de tipos de matrícula');
           }
       }

       load();
   }])
   .directive('financialsArDebtManagementLicenseTypesGrid', ($state, authManager) => {
          return {
           restrict: 'A',
           scope: { height: '@', selectedItems: '=' },
           link(scope: any, element, attrs, ctrl) {
               var gridElementName = 'financialsArDebtManagementLicenseTypesGrid';
               var pagerElementName = gridElementName + 'Pager';
               var gridElement = angular.element('<table></table>');
               gridElement.attr('id', gridElementName);
               var pagerElement = angular.element('<div></div>');
               pagerElement.attr('id', pagerElementName);
               element.append(gridElement);
               element.append(pagerElement);

               scope.height = scope.height || 450;

             // var colNames = ['', 'Código', 'Nombre'];
            var colNames = ['',  'Nombre'];
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
                 
                   { name: 'name', index: 'name', search: false }
               ];

               gridElement.jqGrid({
                   regional: 'es-ar',
                   url: API_HOST + '/api/financials/debtmanagement/licensetypes.json?LicenseTypeStatus=0',
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
                           var stateName = 'app.financials.ar.debtmanagement.licensetype';
                           $state.go(stateName, { licenseTypeId: rowId });
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

