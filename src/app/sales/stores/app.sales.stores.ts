angular.module('app.sales.stores', [])
    .config(['$stateProvider', $stateProvider => {
        $stateProvider
            .state('app.sales.stores', {
                url: '/stores',
                controller: 'StoresConfigTiendaController',
                templateUrl: 'app/sales/stores/configuracion.html',
                resolve: loadSequence('jqueryui', 'jqGrid', 'ngCkeditor'),
                ncyBreadcrumb: {
                    label: 'Configuracion de la tienda'
                },
                data: {
                    requiresLogin: true
                }
            })

        }
    ])
    .controller('StoresConfigTiendaController', ['$http', '$scope', '$translate', '$state', 'Restangular', '$window', 'dialogs', 'session', ($http, $scope, $translate, $state, Restangular, $window, dialogs, session) => {
         
            $http.get("http://jsonplaceholder.typicode.com/posts").then(successCallback, errorCallback);

            function successCallback(response){
                //success code
               // console.log(response.data)
               console.log('313213213')
            }
            function errorCallback(error){
                //error code
                console.log('noooo')
            }

            $scope.data = {
            model: null,
            availableOptions: [
              {id: 'es', name: 'Español'},
              {id: 'en', name: 'Inglés'},
            ]
            };



            
            $scope.data1 = {
                model: null,
                availableOptions: [
                  {id: '1', name: 'Minutos'},
                  {id: '2', name: 'Páginas Vistas'},
                ]
                };

                $scope.acciones=[{name:'Al agregar un producto al carrito'},
                     {name:'Al solicitar un cupon'},
                     {name:'Al realizar una busqueda'}];
                $scope.selection=[];
                $scope.toggleSelection = function toggleSelection(accionName) {
                   var idx = $scope.selection.indexOf(accionName);
              
                   // is currently selected
                   if (idx > -1) {
                     $scope.selection.splice(idx, 1);
                   }
              
                   // is newly selected
                   else {
                     $scope.selection.push(accionName);
                   }
                 };

                 $scope.pantallas=[{name:'Página Principal'},
                 {name:'Interior del Producto'},
                 {name:'interior de Categoria'},
                 {name:'Resultado de la Búsqueda'}];
            $scope.selection=[];
            $scope.toggleSelection = function toggleSelection(pantallaName) {
               var idx = $scope.selection.indexOf(pantallaName);
          
               // is currently selected
               if (idx > -1) {
                 $scope.selection.splice(idx, 1);
               }
          
               // is newly selected
               else {
                 $scope.selection.push(pantallaName);
               }
             };
            
               
           $scope.estado = {
                model: null,
                availableOptions: [
                  {id: '1', name: 'Habilitado'},
                  {id: '2', name: 'Deshabilitado'},
                ]
                };

          
                app.config(function($routeProvider) {
                    $routeProvider
                      .when("/", {
                        templateUrl : "configuracion.html"
                      })
                      .when("/default", {
                        templateUrl : "app/sales/stores/default.html"
                      })
                      .when("/muydecasa", {
                        templateUrl : "app/sales/stores/muydecasa.html"
                      })
                      .when("/ipactos", {
                        templateUrl : "ipactos.html"
                      })
                      .when("/deYapa", {
                        templateUrl : "deYapa.html"
                      })
                      .when("/tiempodedescuento", {
                        templateUrl : "tiempodedescuento.html"
                      })
                      .when("/handsoff", {
                        templateUrl : "handsoff.html"
                      });
                    });
            

                    /*
                (function(angular) {
                  'use strict';
                angular.module('docsTemplateUrlDirective', [])
                  .controller('Controller', ['$scope', '$compile', function($scope, $compile) {
                    
                    $scope.showdiv = function(){
                      var compiledeHTML = $compile("<div my-Customer></div>")($scope);
                      $("#d").append(compiledeHTML);
                    };
                  }])
                  .directive('myCustomer', function() {
                    return {
                      templateUrl: 'default.html'
                    };
                  });
                })(window.angular);
                */
        }
    ])