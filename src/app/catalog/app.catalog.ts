angular.module('app.catalog', ['app.catalog.categories', 'ngAnimate','thatisuday.ng-image-gallery'])
    .config([
        '$stateProvider', $stateProvider => {
            $stateProvider
                .state('app.catalog', {
                    url: '/catalog',
                    abstract: true,
                    template: '<ui-view/>',
                    ncyBreadcrumb: {
                        skip: false,
                        parent: 'app.dashboard',
                        label: 'catalog'
                    }
                })

                .state('app.catalog.products', {
                    url: '/products',
                    controller: 'CatalogProductsListController',
                    templateUrl: 'app/catalog/products/list.html',
                    resolve: loadSequence('jqueryui', 'jqGrid','toastr'),
                    ncyBreadcrumb: {
                        label: 'catalog.products'
                    }
                })
                .state('app.catalog.productnew', {
                    url: '/products/new',
                    controller: 'CatalogProductNewController',
                    templateUrl: 'app/catalog/products/new.html',
                    resolve: loadSequence('jqueryui', 'jqGrid','icheck','toastr'),
                    ncyBreadcrumb: {
                        parent: 'app.catalog.products',
                        label: 'catalog.product.new'
                    }
                })
                .state('app.catalog.productview', {
                    url: '/products/{productId}/view',
                    controller: 'CatalogProductViewController',
                    templateUrl: 'app/catalog/products/view.html',
                    resolve: loadSequence('jqueryui', 'jqGrid','icheck',  "angularFileUpload",
                    "toastr",
                    "imageviewer",'infinite-scroll', "ngCkeditor",
                    "ngMap"),
                    ncyBreadcrumb: {
                        parent: 'app.catalog.products',
                        label: 'catalog.product.view'
                    }
                })
               
                .state('app.catalog.productedit', {
                    url: '/products/{productId}',
                    controller: 'CatalogProductEditController',
                    templateUrl: 'app/catalog/products/edit.html',
                    resolve: loadSequence('jqueryui','jqGrid', 'icheck','toastr','slick-carousel', "imageviewer",'infinite-scroll', "ngCkeditor",
                    "ngMap"),
                    ncyBreadcrumb: {
                        parent: 'app.catalog.products',
                        label: 'catalog.product'
                    }
                });
        }
    ])

    // .config(['slickCarouselConfig', function (slickCarouselConfig) {
    //     slickCarouselConfig.dots = true;
    //     slickCarouselConfig.autoplay = false;
    //   }])
    .controller('CatalogProductsListController', ['$scope', '$translate', '$state','toastr', ($scope, $translate, $state,toastr) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.new = () => {
            $state.go('app.catalog.productnew');
        }
    }
    ])
    .controller('CatalogProductViewController', ['$scope', '$translate', '$state','$stateParams','toastr','NgMap', ($scope, $translate, $state,$stateParams,toastr,NgMap) => {
        var id = $stateParams.productId;
        $scope.serviceUrl = 'catalog/products/' + id + '/messages';
        $scope.productMessages = [];
        $scope.slickConfig1Loaded = true;
        $scope.productsItems = [];
        $scope.singleImage =[];
        $scope.status = {
            model: null,
            availableOptions: [
                { id: '1', name: 'Activo' },
                { id: '2', name: 'Inactivo' },
            ]
        };
        $scope.params = {
            selectedItems: [],
            productRelId : null,
        };
        $scope.isEnableEditTemplate = false;
        
              $scope.editLayout = function() {
                $scope.isEnableEditTemplate = !$scope.isEnableEditTemplate;
                $scope.$broadcast("changeTemplateViewMode");
              };
        
              $scope.saveLayout = function() {
                //TODO SAVE JSON TEMPLATE
                $scope.isEnableEditTemplate = false;
                $scope.$broadcast("changeTemplateViewMode");
              };
        
              $scope.edit = () => {
                $state.go("app.catalog.productedit", { productId: id });
              };
        function getMockProduct(): any {
            var product: any = {};
            product.id = 1;
            product.code = "001";
            product.createDate = new Date();
            product.images = [{id:1,name:'front',guid:'Content/img/Product_1470647972_3.jpg',createDate:new Date(),type:1 },
                             {id:2,name:'deccript',guid:'Content/img/cohenlogo.jpg',createDate:new Date(),type:1 },
                             {id:3,name:'deccript',guid:'Content/img/logofinapro.png',createDate:new Date(),type:1 },
                             {id:4,name:'deccript',guid:'Content/img/logonavarro.png',createDate:new Date(),type:1 },
                             {id:5,name:'deccript',guid:'Content/img/cuboproyecto.png',createDate:new Date(),type:1 },
                             {id:6,name:'deccript',guid:'Content/img/laptop.png',createDate:new Date(),type:1 },
                             {id:7,name:'front',guid:'Content/img/Product_1470647972_3.jpg',createDate:new Date(),type:1 },
                             {id:8,name:'deccript',guid:'Content/img/cohenlogo.jpg',createDate:new Date(),type:1 },
                             {id:9,name:'deccript',guid:'Content/img/logofinapro.png',createDate:new Date(),type:1 },
                             {id:10,name:'deccript',guid:'Content/img/logonavarro.png',createDate:new Date(),type:1 },
                             {id:11,name:'deccript',guid:'Content/img/cuboproyecto.png',createDate:new Date(),type:1 }];

            // product.images = new Array<Image>(new Image(1,'front','assets/images/Product_1470647972_3.jpg',new Date(),ImageType.Principal),
            //                                       new Image(2,'deccript','assets/images/headphones.jpg',new Date(),ImageType.Banner),
            //                                       new Image(3,'front','assets/images/teclado.jpg',new Date(),ImageType.Principal),
            //                                       new Image(4,'front','assets/images/p6.jpg',new Date(),ImageType.Principal),
            //                                       new Image(5,'front','assets/images/profile_big.jpg',new Date(),ImageType.Principal));
            product.name = "Sistema Inteligente de Parquímetros ";
            product.review = "Herramienta tecnológica de gestión del estacionamientno medido";
            product.description = 'Sistema Inteligente de Parquímetros de Bahía Blanca . El proyecto fue llevado a cabo por 7 empresas socias (Eycon, Unixono, MRK Industries, Paradigma, Optiment, Gen Tecnológico y Socio Anónimo) e incluyó el desarrollo de: Parquímetros solares compatibles con Bahía Urbana con conexión online y Módulo SMS (Eycon), Sitio web de consulta pública, Aplicación móvil de consulta pública y Aplicación móvil de fiscalización (Unixono), Sensores magnéticos de posición, lumínicos, solares con comunicación inalámbrica (MRK Industries), Modelo de recorrido óptimo de inspectores y armado automático de las zonas de fiscalización (Optiment), herramientas para Business Intelligence (Gen Tecnológico), Centro de Atención al usuario, Gestión de Incidentes, Problemas, Configuraciones y Versiones (Paradigma), Identidad Visual Corporativa del producto (Socio Anónimo)';

            product.price = 30.99;
            product.tags = ['Categoria 1', 'Sub Categoria 1'];
            product.rating = 4;
            product.ratingScore = 42424;
            var ratingScroreDetails: any = {};
            ratingScroreDetails.fiveCount = 33769;
            ratingScroreDetails.fourCount = 5014;
            ratingScroreDetails.threeCount = 2334;
            ratingScroreDetails.twoCount = 370;
            ratingScroreDetails.oneCount = 937;
            product.ratingScoreDetail = ratingScroreDetails;
            product.status = 1;
            product.stock = 99;
            product.weight = 10.5;
            product.acceptQuestions = true;
            product.Messages = [];
            product.relProducts = ['2','3'];

            var comment1: any = {};

            comment1.id = 1;
            comment1.person = { id: 1, name: 'Sebastian Vigliola', imageUrl: 'Content/img/a1.jpg' };
            comment1.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment1.rating = 4;
            comment1.show = true;
            comment1.date = new Date(2017, 10, 9, 10, 23, 14);

            var comment2: any = {};

            comment2.id = 2;
            comment2.person = { id: 2, name: 'Stanislav Titarenko', imageUrl: 'Content/img/a2.jpg' };
            comment2.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment2.rating = 5;
            comment2.show = false;
            comment2.date = new Date(2017, 10, 9, 10, 23, 14);

            var comment3: any = {};
            
            comment3.id = 3;
            comment3.person = { id: 2, name: 'Test User 01', imageUrl: 'Content/img/a2.jpg' };
            comment3.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment3.rating = 5;
            comment3.show = false;
            comment3.date = new Date(2017, 10, 9, 10, 23, 14);

            var comment4: any = {};
            
            comment4.id = 4;
            comment4.person = { id: 2, name: 'Test User 02', imageUrl: 'Content/img/a2.jpg' };
            comment4.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment4.rating = 3;
            comment4.show = false;
            comment4.date = new Date(2017, 10, 9, 10, 23, 14);

            var comment5: any = {};
            
            comment5.id = 5;
            comment5.person = { id: 2, name: 'Test User 03', imageUrl: 'Content/img/a2.jpg' };
            comment5.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment5.rating = 3;
            comment5.show = false;
            comment5.date = new Date(2017, 10, 9, 10, 23, 14);

            product.comments = [comment1, comment2,comment3,comment4,comment5];


            product.code = "001";
            product.entityTypeId = 10; //Hardcode
            product.entityModelName = "product";
            product.folderGuid =  '29f559a8111f46b4a965868948384dbc'; //harcode
            return product;
        }
        $scope.methods = {};
        $scope.openGallery = function(){
            $scope.methods.open();
        };
        $scope.nextImg = function(){
            $scope.methods.next();
        };
        
        $scope.prevImg = function(){
            $scope.methods.prev();
        };
        function load() {
        if (id) {
            $scope.product = getMockProduct();
     
            getSuggestProducts();
            getImagesProduct();
            $scope.scrollItems = $scope.productsItems.slice(0, 10);
            // Restangular.one('catalog').one('products', id).get().then(result => {
            //     $scope.product = result;
            // });
        } else {
            $scope.product = [];
        }
    }
    $scope.conf = {
        imgAnim : 'fadeup'
    };
    $scope.thumbnails = true;
    $scope.opened = function(){
        console.info('Gallery opened!');
    }
    $scope.closed = function(){
        console.warn('Gallery closed!');
    }
    function getImagesProduct(){
        $scope.product.images.forEach(item => {
            $scope.singleImage.push({
                id:item.id,
                desc:item.name,
                url : item.guid,
                thumbUrl : item.guid,
                bubbleUrl : item.guid
            });
    });
}
    function getSuggestProducts() {
        //MOCK Productos sugeridos/similares
        for (let _i = 0; _i < 10; _i++) {
          const productItem = [];
          $scope.productsItems.push(productItem);
        }
      }

    load();
//    jQuery(document).ready(function () {
//       jQuery('.ng-gallery').slick({
//         infinite: true,
//         slidesToShow: 3,
//         slidesToScroll: 2,
//         centerMode: true,
//         variableWidth: true,
//         responsive: [
//           {
//             breakpoint: 1024,
//             settings: {
//               slidesToShow: 3,
//               slidesToScroll: 3,
//               infinite: true,
//               dots: true
//             }
//           },
//           {
//             breakpoint: 600,
//             settings: {
//               slidesToShow: 2,
//               slidesToScroll: 2
//             }
//           },
//           {
//             breakpoint: 480,
//             settings: {
//               slidesToShow: 1,
//               slidesToScroll: 1
//             }
//           }
//         ]
//       });
//       jQuery('#slickComments').slick({
//         dot: true,
//         slidesToShow: 2,
//         slidesToScroll: 2,
 
//       });
//     });
$scope.slickConfig = {
    dots: true,
    slidesToShow: 2,
    slidesToScroll: 2,
    infinite: true,
  };

  $scope.onScroll = function(scrollTop, scrollHeight) {
    $scope.scrollTop = scrollTop
    $scope.scrollHeight = scrollHeight
}
}
    ])
    .controller('CatalogProductNewController', ['$scope','$timeout', '$translate', '$stateParams', '$state', 'Restangular', 'dialogs', ($scope: any,$timeout, $translate, $stateParams, $state, Restangular, dialogs) => {
        $scope.params = {
            selectedItems: []
        };
        $scope.product = [];
        $scope.status = {
            model: null,
            availableOptions: [
                { id: '1', name: 'Activo' },
                { id: '2', name: 'Inactivo' },
            ]
        };

        $scope.$on('selectionChanged',
        (event, args) => {
            $timeout(() => {
                $scope.checkedItems = args.ids;
            });
        });

        $scope.editDescription = () => {
            var editorModal = dialogs.create(
                'app/projects/projects/modal-html-editor.html',
                'editorHtmlController', $scope.product.description, { size: 'lg', animation: true }
            );

            editorModal.result.then((result) => {
                var text = result.htmlDescription;
                $scope.product.description = text;
            })
                .finally(function () {
                    editorModal.$destroy();
                });
        }

        $scope.save = () => {
            $scope.product.relProducts =$scope.selectedItems ;
            console.log($scope.product);

            // if (id) {
            //     $scope.product.put().then((result) => {
            //         $state.go('app.catalog.products');
            //     });
            // } else {
            //     Restangular.service('products').post($scope.product).then((result) => {
            //         $state.go('app.catalog.products');
            //     });
            // }
        }
    }])
    .controller('editorHtmlController', ($scope, $uibModalInstance, Restangular, data) => {
        $scope.textToEdit = data;

        $scope.save = (textToEdit) => {
            $scope.textToEdit = textToEdit;
            $uibModalInstance.close({ htmlDescription: $scope.textToEdit });
        }
    })
    .controller('CatalogProductEditController', ['$scope','$timeout', '$translate', '$stateParams', '$state', 'Restangular', 'dialogs', 'session','toastr','NgMap',
     ($scope: any,$timeout, $translate, $stateParams, $state, Restangular, dialogs,session,toastr,NgMap) => {
        var id = $stateParams.productId;
        $scope.serviceUrl = 'catalog/products/' + id + '/messages';
        $scope.productMessages = [];
        $scope.status = {
            model: null,
            availableOptions: [
                { id: '1', name: 'Activo' },
                { id: '2', name: 'Inactivo' },
            ]
        };
        $scope.params = {
            selectedItems: [],
            productRelId : null,
        };

        $scope.addProductRel = () => {
            console.log($scope.params.productRelId);
            var item = {
                productId : $scope.productId,
                productRelId: $scope.params.productRelId
            };

            Restangular.one('catalog').all('productsrel').post(item).then(() => {
                $scope.params.productRelId = null;
                $scope.$broadcast('refresh');
                toastr.success('Administrador de Productos Relacionados', 'Se asoció el producto con éxito.');
            });
        };

        $scope.$on('selectionChanged',
        (event, args) => {
            $timeout(() => {
                console.log( args.ids);
                $scope.checkedItems = args.ids;
            });
        });
        function getMockProduct(): any {
            var product: any = {};
            product.id = 1;
            product.code = "001";
            product.createDate = new Date();
            // product.images = new Array<Image>(new Image(1,'front','assets/images/Product_1470647972_3.jpg',new Date(),ImageType.Principal),
            //                                       new Image(2,'deccript','assets/images/headphones.jpg',new Date(),ImageType.Banner),
            //                                       new Image(3,'front','assets/images/teclado.jpg',new Date(),ImageType.Principal),
            //                                       new Image(4,'front','assets/images/p6.jpg',new Date(),ImageType.Principal),
            //                                       new Image(5,'front','assets/images/profile_big.jpg',new Date(),ImageType.Principal));
            product.name = "Sistema Inteligente de Parquímetros ";
            product.review = "Herramienta tecnológica de gestión del estacionamientno medido";
            product.description = 'Sistema Inteligente de Parquímetros de Bahía Blanca . El proyecto fue llevado a cabo por 7 empresas socias (Eycon, Unixono, MRK Industries, Paradigma, Optiment, Gen Tecnológico y Socio Anónimo) e incluyó el desarrollo de: Parquímetros solares compatibles con Bahía Urbana con conexión online y Módulo SMS (Eycon), Sitio web de consulta pública, Aplicación móvil de consulta pública y Aplicación móvil de fiscalización (Unixono), Sensores magnéticos de posición, lumínicos, solares con comunicación inalámbrica (MRK Industries), Modelo de recorrido óptimo de inspectores y armado automático de las zonas de fiscalización (Optiment), herramientas para Business Intelligence (Gen Tecnológico), Centro de Atención al usuario, Gestión de Incidentes, Problemas, Configuraciones y Versiones (Paradigma), Identidad Visual Corporativa del producto (Socio Anónimo)';

            product.price = 30.99;
            product.tags = ['Categoria 1', 'Sub Categoria 1'];
            product.rating = 4;
            product.ratingScore = 42424;
            var ratingScroreDetails: any = {};
            ratingScroreDetails.fiveCount = 33769;
            ratingScroreDetails.fourCount = 5014;
            ratingScroreDetails.threeCount = 2334;
            ratingScroreDetails.twoCount = 370;
            ratingScroreDetails.oneCount = 937;
            product.ratingScoreDetail = ratingScroreDetails;
            product.status = 1;
            product.stock = 99;
            product.weight = 10.5;
            product.acceptQuestions = true;
            product.Messages = [];
            product.relProducts = ['2','3'];

            var comment1: any = {};

            comment1.id = 1;
            comment1.person = { id: 1, name: 'Sebastian Vigliola', imageUrl: 'Content/img/a1.jpg' };
            comment1.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment1.rating = 4;
            comment1.show = true;
            comment1.date = new Date(2017, 10, 9, 10, 23, 14);

            var comment2: any = {};

            comment2.id = 2;
            comment2.person = { id: 2, name: 'Stanislav Titarenko', imageUrl: 'Content/img/a2.jpg' };
            comment2.text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident reiciendis voluptatem nesciunt, quisquam dolor sit incidunt   eaque possimus reprehenderit quia magni nobis! Blanditiis at reprehenderit,    fugit consequuntur eligendi  nostrum officiis quidem tempora sint sit aut eaque hic.';
            comment2.rating = 5;
            comment2.show = false;
            comment2.date = new Date(2017, 10, 9, 10, 23, 14);

            product.comments = [comment1, comment2];
            product.entityTypeId = 10; //Hardcode
            product.entityModelName = "product";
            product.folderGuid =  '29f559a8111f46b4a965868948384dbc'; //harcode
            return product;
        }
        $scope.removeSelectedComment = (commentId) => {
            _.remove($scope.product.comments, { id: commentId });
        }
        function load() {
           
            if (id) {
                $scope.product = getMockProduct();
                // Restangular.one('catalog').one('products', id).get().then(result => {
                //     $scope.product = result;
                // });
            } else {
               // $scope.product = [];
            }
        }

        $scope.newComment = () => {
            var commentModal = dialogs.create(
                'app/catalog/products/comment-modal.html',
                'commentModalController', null, { size: 'lg', animation: true }
            );

            commentModal.result.then((result) => {
                var comment =result.comment;
                console.log(comment);
                $scope.product.comments.push(comment);

                //API TODO
                // Restangular.one('catalog').one('product',$scope.product.id)
                // .one('comments').post().then(result => {
                //     $scope.product.comments.push(comment);
                // });
            })
                .finally(function () {
                    commentModal.$destroy();
                });
        }

        $scope.editDescription = () => {
            var editorModal = dialogs.create(
                'app/projects/projects/modal-html-editor.html',
                'editorHtmlController', $scope.product.description, { size: 'lg', animation: true }
            );

            editorModal.result.then((result) => {
                var text = result.htmlDescription;
                $scope.product.description = text;
            })
                .finally(function () {
                    editorModal.$destroy();
                });
        }

        $scope.showHide = (comment) => {
            if (comment.show) {
                comment.show = false;
            }
            else {
                comment.show = true;
            }
        }

        $scope.save = () => {
            if (id) {
                $scope.product.relProducts =$scope.selectedItems ;
                $scope.product.put().then(() => { $state.go('app.catalog.products'); });
            } else {
                Restangular.service('catalog/products').post($scope.product).then(() => { $state.go('app.catalog.products'); });
            }
        }


        load();
    }
    ])
    .controller('commentModalController', ($scope, $uibModalInstance, Restangular,data) => {

        $scope.rating = 0;

        $scope.save = (textToEdit) => {
            var comment1: any = {};
            comment1.id = 0;
            comment1.person = { id: 1, name: 'Sebastian Vigliola', imageUrl: 'Content/img/a1.jpg' };
            comment1.text = textToEdit;
            comment1.rating = $scope.rating;
            comment1.show = true;
            comment1.date = new Date();
            $scope.comment = comment1;
            $uibModalInstance.close({ comment: comment1 });
        }
    })
    .directive('catalogRelProductsGrid', ($log, $compile, $state, $document, dialogs, Restangular, $http, $timeout,toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', view: '=?' },
            link(scope: any, element, attrs, ctrl) {
           

                const gridElementName = 'catalogRelProductsGrid';
                const pagerElementName = gridElementName + 'Pager';
                var gridElement: any = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                const pagerElement: any = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append($compile(gridElement)(scope));
                element.append($compile(pagerElement)(scope));

                scope.height = scope.height || 450;
                scope.view = scope.view || 0;

                scope.changeView = (view) => {
                    scope.view = view;
                    loadData();
                };
                function imageFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _strcontent ;
                    // _strcontent = '<div class="boldfontcell" style="margin-left: 20px;" >';
                     _strcontent += '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/empty-img.png);"></div>';
                    // _strcontent += ' <spam style="visibility:hidden">Content/img/someone_small.jpg</spam></div>'
                      return _strcontent;
                }
                var colNames = ['Imagen','Nombre', 'Codigo', 'Des. corta', 'Precio', 'Acciones'];
                var colModel: Array<any> = [
                    // {
                    //     name: 'id',
                    //     index: 'id',
                    //     hidden: true,
                    //     key: true
                    // },
                    {
                        name: 'editCommand',
                        index: 'editCommand',
                       
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => {return '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/empty-img.png);"></div>'} // imageFormatter  // () => { return '<i class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'name', index: 'name', align: 'center', search: false, sortable: false, fixed: true, width: 100 },
                    { name: 'code', index: 'code', align: 'center', search: false, sortable: false , fixed: true},
                    { name: 'summary', index: 'summary', align: 'center', search: false, sortable: false },
                    { name: 'price', index: 'price', align: 'center', search: false, sortable: false },
                    {
                        name: 'removeCommand',
                        index: 'removeCommand',
                      
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: (cellValue, options, rowObject) => { return '<i data-ng-click="removeProductRel(' + rowObject.id + ')" class="fa fa-trash-o fa-fw hand"></i>'; }
                    }
                ];

                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/app/catalog/api/products.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    loadBeforeSend: function (jqXHR) {
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
                        return true;
                    },
                    onCellSelect(rowId, iCol) {
                    },
                    multiselect: false,
                    multiboxonly: false,
                    loadComplete: () => {
                        $compile(angular.element('#' + gridElementName))(scope);
                        //scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));
                    },
                    gridComplete: () => {
                        $('#_empty', '#' + gridElementName).addClass('nodrag nodrop');
                      

                        resizeGrid();
                    },
                    // gridComplete: function () {
                    //     // angular.element("#cb_" + gridElementName).click(() => {
                    //     //     scope.$emit('selectionChanged', gridElement.getGridParam('selarrrow'));
                    //     // });

                    //     // var amountSum = gridElement.jqGrid('getCol', 'amount', false, 'sum');
                    //     // gridElement.jqGrid('footerData', 'set', {
                    //     //     amount: amountSum
                    //     // });
                    // },
                    onSelectRow: (rowId, status, e) => {
                        // if (angular.isDefined(e)) {
                        //     scope.$emit('selectionChanged', {ids: gridElement.getGridParam('selarrrow')});
                        // }
                    }
                });
                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                scope.removeProductRel = (id) => {
                    var dlg = dialogs.confirm('Editor de Productos relacionados', 'Está seguro que desea eliminar esta asignación?');
                    dlg.result.then((btn) => {
                        Restangular.one('catalog').one('productsrel', id).remove().then(result => {
                            toastr.success('Editor de Productos relacionados', 'La operación se realizó con éxito.');
                            gridElement.trigger('reloadGrid');
                        });
                    });
                };

                gridElement.jqGrid('navGrid', '#' + pagerElementName, {
                    del: false,
                    add: false,
                    edit: false
                }, {}, {}, {}, { multipleSearch: false });
                gridElement.jqGrid('filterToolbar', { autosearch: true, searchOperators: false });
                gridElement.jqGrid('bindKeys');

                scope.$on('refresh', () => {
                    gridElement.trigger('reloadGrid');
                });
                function resizeGrid() {
                    var tabElement = $('#' + gridElementName).closest('.tab-pane');
                    var width = tabElement.width() - 68;
                    gridElement.jqGrid('setGridWidth', width, true);
                }

                function loadData() {

                    var url = '/app/catalog/api/products.json';
                    gridElement.jqGrid('setGridParam', { postData: { view: scope.view, q: scope.filter } });
                    gridElement.jqGrid('setGridParam', { datatype: 'json', url: url, page: 1 });
                    gridElement.trigger('reloadGrid');
                    resizeGrid();
                }
                scope.$on('refresh', () => {
                    if (scope.sectionId) {
                        loadData();
                    }
                });
                scope.$watch('view', (value) => {
                    scope.$emit('viewChanged', value);
                });
            }
        };
    })
    .directive('dropdownProductRel', ($compile, $parse, $document, $log, dialogs, authManager) => {
        return {
            restrict: 'A',
            require: 'ngModel',
            transclude: true,
            scope: { ngModel: '=', isShown: '@ngShow', width: '@', showAddNew: '@', onSelect: '&?' },
            link: (scope: any, element, attr: any, ctrl: any, transclude) => {
                        scope.placeholder = 'Seleccione un producto';
                        scope.url = '/api/catalog/products/lookup.json';
                        scope.multiple = false;
                        scope.showAddNew = false;
                  
                scope.id = 'dropdownProductRel';
                scope.width = angular.isDefined(attr.width) ? attr.width : '100%';
                scope.filter = angular.isDefined(attr.filter) ? attr.filter : '';
                if (angular.isDefined(attr.showAddNew)) {
                    scope.showAddNew = attr.showAddNew.match(/true/i);
                }

                var inputGroupElement = angular.element('<div class="input-group select2-bootstrap-append"></div>');

                var page;
                var selectElement = angular.element(`<select name="${scope.id}" style="width: ${scope.width};" ng-required="true"></select>`);
                selectElement.attr('id', scope.id);

                function checkAttributes() {
                    if (scope.attributes && scope.attributes.length > 0) {
                        _.forEach(scope.attributes, (attribute:any) => {
                            if (attribute.required && attr[attribute.name] == null) {
                                $log.error(`Lookup: ${scope.id} - Attribute: ${attribute.name} is missing.`);
                                return false;
                            }
                        });
                    }

                    return true;
                }

                function buildData() {
                    var data = {};
                    if (scope.attributes && scope.attributes.length > 0) {
                        _.forEach(scope.attributes, (attribute:any) => {
                            data[attribute.name] = attr[attribute.name];
                        });
                    }

                    return data;
                }

                var select2Options = {
                    theme: 'bootstrap',
                    placeholder: scope.placeholder,
                    allowClear: scope.allowClear || false,
                    multiple: scope.multiple,
                    
                    ajax: {
                        url:  API_HOST +  scope.url,
                        headers: { "Authorization" : "Bearer "+ authManager.getToken()},
                        dataType: 'json',
                        quietMillis: 100,
                        delay: 250,
                        data: (params) => {
                            page = params.page || 1;
                            var data = {
                                q: params.term,
                                pageSize: 100,
                                page: page,
                                filter: scope.filter
                            };
                            angular.extend(data, buildData());
                            return data;
                        },
                        processResults: (data) => {
                            var more = (page * 100) < data.total;
                     
                            return {
                                results: data.data,
                                pagination: { more: more }
                            };
                        }
                    }
                };

                inputGroupElement.append(selectElement);

                if (scope.showAddNew) {
                    var newButtonElement = angular.element('<span class="input-group-btn"><button class="btn btn-default" type="button" data-ng-click="addNew()"><i class="fa fa-file-o"></i></button></span>');
                    inputGroupElement.append(newButtonElement);
                    $compile(newButtonElement)(scope);
                }
                try {
                    inputGroupElement.append(transclude());
                } catch (e) {
                }
                
                element.replaceWith(inputGroupElement);

                attr.$observe('disabled', value => {
                    selectElement.prop('disabled', value);
                });

                checkAttributes();

                $compile(selectElement)(scope);
                var select2Element = selectElement.select2(select2Options);

                element.bind('$destroy', () => {
                    select2Element.select2('destroy');
                });

                attr.$observe('readonly', value => {
                    selectElement.prop('readonly', !!value);
                });

                scope.$watch('isShown', (value) => {
                    if (angular.isUndefined(value)) {
                        value = true;
                    }

                    if (value === true || value === 'true') {
                        inputGroupElement.show();
                    } else {
                        inputGroupElement.hide();
                    }
                });

                select2Element.on('select2:select', (e) => {
                    scope.$apply(() => {
                        var value = null;
                             
                        if (angular.isDefined(attr.modelProperty)) {
                            if (attr.modelProperty === 'text') {
                                value = e.params.data.text;
                            }
                            else {
                                value = e.params.data[attr.modelProperty];
                            }
                        }
                        else {
                            value = e.params.data.id;
                        }
                           
                        if (angular.isDefined(scope.onSelect)) {
                          
                            scope.onSelect({ value: value , text:  e.params.data.text});
                        } else {
                            if (scope.multiple) {
                               
                                ctrl.$modelValue.push(value);
                            } else {
                                if (angular.isDefined(attr.modelProperty) && attr.modelProperty === 'text') {
                                    ctrl.$setViewValue({ value: e.params.data.text, valueId: e.params.data.id });
                                } else {
                                    ctrl.$setViewValue(value);
                                }
                            }
                        }
                    });
                });

                select2Element.on('select2:unselect', (e) => {
                    if (scope.multiple) {
                        var index = ctrl.$modelValue.indexOf(parseInt(e.params.data.id));
                        if (index > -1) {
                            scope.$apply(() => {
                                ctrl.$modelValue.splice(index, 1);
                            });
                        }
                    } else {
                        ctrl.$setViewValue(null);
                    }
                });

                scope.$watch('ngModel', value => {
                    if (value) {
                        if (angular.isArray(ctrl.$modelValue)) {
                            if (ctrl.$modelValue.length > 0) {
                                var ids = ctrl.$modelValue.join();

                                $.getJSON(scope.url, { ids: ids, format: 'json' }, result => {
                                    _.forEach(result.data, (item: any) => {
                                        var option = new Option(item.text, item.id, true, true);
                                        selectElement.append(option);
                                    });
                                    selectElement.trigger('change');
                                });
                            }
                        } else {
                            var id = ctrl.$modelValue;
                            if (typeof id === 'object') {
                                id = id.valueId;
                            }
                            $.getJSON(scope.url, { id: id, format: 'json' }, result => {
                                _.forEach(result.data, (item: any) => {

                                    var option = new Option(item.text, item.id, true, true);
                                    selectElement.append(option);
                                });
                                selectElement.trigger('change');
                            });
                        }
                    } else {
                        selectElement.val(null);
                        selectElement.trigger('change');
                    }
                });
            }
        };
    })
    .directive('catalogProductsGrid', ($log, $compile, $state, $document, dialogs, Restangular, $http, $timeout,toastr, authManager) => {
        return {
            restrict: 'A',
            scope: { height: '@', selectedItems: '=', typeId: '@' },
            link(scope: any, element, attrs, ctrl) {
                var gridElementName = 'catalogProductsGrid';
                var pagerElementName = gridElementName + 'Pager';
                var gridElement = angular.element('<table></table>');
                gridElement.attr('id', gridElementName);
                var pagerElement = angular.element('<div></div>');
                pagerElement.attr('id', pagerElementName);
                element.append(gridElement);
                element.append(pagerElement);

                scope.height = scope.height || 450;
                scope.view = scope.view || 0;

                scope.changeView = (view) => {
                    scope.view = view;
                  //  loadData();
                };
                function imageFormatter(cellvalue: any, options: any, rowObject: any) {
                    var _strcontent ;
                    // _strcontent = '<div class="boldfontcell" style="margin-left: 20px;" >';
                     _strcontent += '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/empty-img.png);"></div>';
                    // _strcontent += ' <spam style="visibility:hidden">Content/img/someone_small.jpg</spam></div>'
                      return _strcontent;
                }
                var colNames = ['','Imagen','Nombre', 'Codigo', 'Des. corta', 'Precio'];
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
                    {
                        name: 'editCommand',
                        index: 'editCommand',
                       
                        align: 'center',
                        fixed: true,
                        sortable: false,
                        search: false,
                        formatter: () => {return '<div class="customer-photo" style="margin: 5px; margin-right: 20px; background-image: url(Content/img/empty-img.png);"></div>'} // imageFormatter  // () => { return '<i class="fa fa-search-plus fa-fw hand"></i>'; }
                    },
                    { name: 'name', index: 'name', align: 'center', search: true, sortable: false, fixed: true, width: 100 },
                    { name: 'code', index: 'code', align: 'center', search: true, sortable: false , fixed: true},
                    { name: 'summary', index: 'summary', align: 'center', search: true, sortable: false },
                    { name: 'price', index: 'price', align: 'center', search: true, sortable: false },
               
                ];
                gridElement.jqGrid({
                    regional: 'es-ar',
                    url: '/app/catalog/api/products.json',
                    datatype: 'json',
                    height: scope.height,
                    autowidth: true,
                    responsive: true,
                    styleUI: 'Bootstrap',
                    colNames: colNames,
                    colModel: colModel,
                    scroll: 1,
                    mtype: 'GET',
                    gridview: true,
                    pager: pagerElementName,
                    viewrecords: true,
                    rowNum: 100,
                    loadBeforeSend: function (jqXHR) {
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
                        if (scope.typeId != null) {
                            gridElement.jqGrid('setGridParam', { postData: { typeId: scope.typeId } });
                        }
                    },
                    beforeSelectRow() {
                        return false;
                    },
                    onCellSelect(rowId, iCol) {
                        if (iCol === 0) {
                            var stateName = 'app.catalog.productview';
                            $state.go(stateName, { productId: rowId });
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
        }
    })
    ;
