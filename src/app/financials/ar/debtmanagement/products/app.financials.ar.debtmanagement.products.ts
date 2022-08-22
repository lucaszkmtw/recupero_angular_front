angular.module('app.financials.ar.debtmanagement.products', [])
   .config(($stateProvider) => {
       $stateProvider
       .state('app.financials.ar.debtmanagement.products',
       {
           url: '/products',
           controller: 'FinancialsProductsController',
           templateUrl: 'app/financials/ar/debtmanagement/products/list.html',
           resolve: loadSequence('jqueryui', 'jqGrid'),
           ncyBreadcrumb: {
               label: 'findm.products' 
           }
       })
       .state('app.financials.ar.debtmanagement.product',
           {
               url: '/product/{Id}',
               controller: 'FinancialsProductController',
               templateUrl: 'app/financials/ar/debtmanagement/products/form.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),      
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.products',
                   label: 'findm.products'
               }
           })
           
           .state('app.financials.ar.debtmanagement.productnew',
           {
               url: '/product',
               controller: 'FinancialsProductController',
               templateUrl: 'app/financials/ar/debtmanagement/products/form.html',
               resolve: loadSequence('icheck', 'angularFileUpload', 'ui-mask', 'toastr'),      
               ncyBreadcrumb: {
                   parent: 'app.financials.ar.debtmanagement.products',
                   label: 'findm.products'
               }
           });
   })
   .controller('FinancialsProductsController', ($scope, $translate, $state) => {
    $scope.params = {
        selectedItems: []
    };
    $scope.new = () => {
        $state.go('app.financials.ar.debtmanagement.productnew');
    }
})
.controller('FinancialsProductController',['$scope','$timeout', '$translate', '$stateParams', '$state', 'Restangular','toastr',"dialogs", ($scope: any, $timeout,$translate, $stateParams, $state, Restangular,toastr,dialogs) => {

    var id = $stateParams.Id;

    function load() {
        if (id) {
            Restangular.one('catalog').one('productsconfig', id).get().then(result => {
                $scope.product = result;
                if($scope.product.fieldsJSON){
                    $scope.product.fieldsJSON =  angular.fromJson($scope.product.fieldsJSON);
                }
            });
        }else{
            $scope.product = { name:'', fieldsJSON : [] };
        }
    }
    $scope.openFieldsSelector = () => {
        var modal = dialogs.create(
            "app/financials/ar/debtmanagement/products/modal.fields.html",
            "selectFieldController",
            null,
            { size: "lg", animation: true }
        );
       

        modal.result.then(
            result => {
                var item = result;
               
 
                $timeout(() => {
                    if( !$scope.product.fieldsJSON){
                        $scope.product.fieldsJSON = new Array<any>();
                    }

                    if($scope.product.fieldsJSON.length > 0 ){ 
                        var lastId = Math.max.apply(Math, $scope.product.fieldsJSON.map(function(item){return item.id;}));
                        console.log('last id ' + lastId);
                        item.id = lastId + 1;
                    }else{
                        item.id = 1;
                    }
                   console.log(item);
                    $scope.product.fieldsJSON.push(item);
               
                });
            },
            () => { }
        );
    };
    $scope.delete = () => {
     toastr.success("<button type='button' id='confirmationRevertYes'>Si</button>&nbsp;&nbsp;<button type='button' id='confirmationRevertNo'>No &nbsp;</button>",'¿Esta seguro de querer eliminar este registro?',
     {
         closeButton: false,
         allowHtml: true,
         onShown: function (toast) {
             $("#confirmationRevertYes").click(function(){
                 $scope.organism.remove().then(() => {
                     toastr.success('Se ha dado de baja el organismo con éxito.', 'Editor de organismo');
                     $state.go('app.financials.ar.debtmanagement.organisms');
                 }, () => {
                     toastr.error('Se produjo un error al dar de baja el organismo.', 'Editor de organismo');
                 });
             });
             }
     });
 }
 $scope.removeSelectedItem = (item) => {

    var dlg = dialogs.confirm('Editor de campos adicionales', 'Está seguro que desea eliminar este campo?');
    dlg.result.then((btn) => {
        $scope.product.fieldsJSON.splice(item, 1);
       
    });

}
    $scope.save = () => {
        console.log('Save');
        console.log(id);
        console.log($scope.product);
        $scope.product.fieldsJSON = JSON.stringify($scope.product.fieldsJSON, null, "    ");
        if (id) {
            $scope.product.put().then(() => { $state.go('app.financials.ar.debtmanagement.products'); });
            toastr.success('Se ha modificado el producto con éxito.', 'Editor de productos');
        } else {
            Restangular.service('catalog/products').post($scope.product).then(() => { $state.go('app.financials.ar.debtmanagement.products'); });
            toastr.success('Se ha dado de alta el producto con éxito.', 'Alta de Productos');
        }
    }

    load();
}])
.controller(
    "selectFieldController",
    ($scope, $uibModalInstance, Restangular, data) => {
        $scope.item = {id:0,  name:'',type:'' , list:[]};
        $scope.availableOptions = [
            { id: 'date', name: 'Campo Fecha' },
            { id: 'money', name: 'Campo importe (dinero)' },
            { id: 'text', name: 'Campo texto libre' },
            { id: 'array', name: 'Lista de datos' }
        ];
        $scope.cancel = function () {
            $uibModalInstance.dismiss("Canceled");
        }; // end cancel

        $scope.save = function () {
            console.log($scope.item);
            $uibModalInstance.close($scope.item);
        };

    })
.directive('financialsArDebtManagementProductsGrid', ($state, authManager) => {
    return {
        restrict: 'A',
        scope: { height: '@', selectedItems: '=' },
        link(scope: any, element, attrs, ctrl) {
            var gridElementName = 'financialsArDebtManagementProductsGrid';
            var pagerElementName = gridElementName + 'Pager';
            var gridElement = angular.element('<table></table>');
            gridElement.attr('id', gridElementName);
            var pagerElement = angular.element('<div></div>');
            pagerElement.attr('id', pagerElementName);
            element.append(gridElement);
            element.append(pagerElement);

            scope.height = scope.height || 450;

            var colNames = ['', 'Nombre', ];
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
                                      
                { name: 'text', index: 'text', search: true },
                // { name: 'code', index: 'code', search: true },                               
               
            ];

            gridElement.jqGrid({
                regional: 'es-ar',
                url: API_HOST + '/api/catalog/products/lookup.json',
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
                    root: 'data'
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
                        var stateName = 'app.financials.ar.debtmanagement.product';
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

