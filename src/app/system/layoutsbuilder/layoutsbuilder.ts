angular
  .module("app.system.layoutsbuilder", ["app.system"])
  .filter("htmlToPlaintext", function() {
    return function(text) {
      return text ? String(text).replace(/<[^>]+>/gm, "") : "";
    };
  })
  .config($stateProvider => {
    $stateProvider.state("app.layoutsbuilder", {
      url: "/layoutsbuilder",
      controller: "SystemLayoutsBuilderController",
      templateUrl: "app/system/layoutsbuilder/layoutsbuilder.html",
      resolve: loadSequence(
        "angularFileUpload",
        "toastr",
        "imageviewer",
        "jqueryui",
        "angularFileUpload",
        "ui-mask",
        "ngMap",
        "infinite-scroll"
      ),
      ncyBreadcrumb: {
        skip: false,
        parent: "app.dashboard",
        label: "system.layoutsbuilder"
      }
    });
  })
  .controller(
    "SystemLayoutsBuilderController",
    (
      $log,
      $filter,
      $scope,
      $uibModalInstance,
      $rootScope,
      $translate,
      $state,
      $stateParams,
      $timeout,
      dialogs,
      $compile,
      $templateCache,
      NgMap,
      toastr
    ) => {}
  )
  .controller(
    "SystemLayoutsBuilderModalController",
    (
      $log,
      $filter,
      $scope,
      $uibModalInstance,
      $rootScope,
      $translate,
      $state,
      $stateParams,
      $timeout,
      dialogs,
      $compile,
      $templateCache,
      $templateRequest,
      $sce,
      $parse,
      toastr,
      NgMap,
      data
    ) => {
      $scope.places = [];
      $scope.googleMapsUrl =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY";
      $scope.map = { center: [-34.61512668346219, -58.414306640625], zoom: 4 };
      $scope.googleMapsUrl =
        "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";
      $scope.isViewMode = false;
      var html = '<div id="loadhtml"></div>',
        compiledElement = $compile(html)($scope);

      $scope.isHtmlTab = function(tab): boolean {
        return tab.type === "html";
      };

      $scope.isTagTab = function(tab): boolean {
        return tab.type === "tags";
      };

      $scope.isMapTab = function(tab): boolean {
        return tab.type === "map";
      };

      $scope.isImageTab = function(tab): boolean {
        return tab.type === "images";
      };

      $scope.removeTab = function(tab) {
        _.remove($scope.vm.template.tabs, { id: tab.id });
      };
      $scope.isFirstSlide = function(index) {
        return index === 0 ? true : false;
      };
      $scope.removeSlide = function(slide) {
       
        _.remove($scope.vm.template.headerSlide, { id: slide.id });
      };

      $scope.addTagByType = function(type) {
        var i = Math.max.apply(
          Math,
          $scope.vm.template.tabs.map(function(o) {
            return o.id;
          })
        );
        switch (type) {
          case "html":
            $scope.vm.template.tabs.push({
              id: i + 1,
              type: "html",
              name: "Nueva Seccion",
              cssIcon: "fa fa-paper-plane",
              innerHtml: ""
            });
            break;
          case "tags":
            $scope.vm.template.tabs.push({
              id: i + 1,
              type: "tags",
              name: "Nueva Seccion",
              cssIcon: "fa fa-tags",
              tags: []
            });
            break;
          case "map":
            $scope.vm.template.tabs.push({
              id: i + 1,
              cssIcon: "fa fa-map-marker",
              name: "Nueva Seccion",
              type: "map",
              places: []
            });
            break;
          case "images":
            $scope.vm.template.tabs.push({
              id: i + 1,
              cssIcon: "fa fa-camera",
              name: "Nueva Seccion",
              type: "images",
              images: []
            });
            break;
        }
      };

      $scope.reRednerMap = function() {
        $scope.showMap = true;
        google.maps.event.trigger($scope.map, "resize");
      };

      NgMap.getMap({ id: "placesMap" }).then(map => {
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });

      $scope.currentPosition = [-34.61512668346219, -58.414306640625];

      $scope.openPlacesSelector = tab => {
        var placesModal = dialogs.create(
          "app/projects/projects/modal-places-selector.html",
          "selectPlacesController",
          null,
          { size: "lg", animation: true, windowClass: "zindex" }
        );

        placesModal.result.then(
          result => {
            var place = result.place;
            tab.places.push(result.place);

          },
          () => {}
        );
      };

      $scope.$watch("options.address", value => {
        if (value) {
          var geocoder = new google.maps.Geocoder();
          $log.info("geocoding....");
          geocoder.geocode({ address: $scope.address }, (results, status) => {
            if (
              status === google.maps.GeocoderStatus.OK &&
              results.length > 0
            ) {
              var location = results[0].geometry.location;
              $scope.myMap.panTo(location);
            } else {
              alert("status.not.ok");
            }
          });
        }
      });
      $scope.addSlide = function() {
        var i = Math.max.apply(
          Math,
          $scope.vm.template.headerSlide.map(function(o) {
            return o.id;
          })
        );
        var editorModal = dialogs.create(
          "app/system/layoutsbuilder/modal-image-editor.html",
          "SystemLayoutBuilderImageEditorController",
          { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
          { size: "lg", animation: true, windowClass: "zindex" }
        );

        editorModal.result
          .then(result => {
            var imageValue = result.imageValue;
            $scope.vm.template.headerSlide.push({
              id: i,
              image: imageValue,
              innerHtml: "Texto Slide"
            });
          })
          .finally(function() {
            editorModal.$destroy();
          });
      };
      $scope.getMapPosition = event => {
        $scope.currentPosition = [event.latLng.lat(), event.latLng.lng()];
      };

      $scope.onMapOverlayCompleted = function(e) {
        var type = e.type;
        var overlay = e.overlay;
        var data = {
          type: type,
          geo: null
        };

        switch (type) {
          case "polygon":
            data.geo = e.overlay.getPath().getArray();
            break;
          case "rectangle":
            console.info("@todo: get information from 'overlay' to data.geo");
            break;
          case "circle":
            console.info("@todo: get information from 'overlay' to data.geo");
            break;
        }
      };
      $scope.fieldByName = function(fieldName) {
        var field = _.find($scope.vm.template.fields, {
          name: fieldName
        });

        return field;
      };
      $scope.tabdByName = function(fieldName) {
        var tab = _.find($scope.vm.template.tabs, {
          name: fieldName
        });

        return tab;
      };
      $scope.tabdById = function(id) {
        var tab = _.find($scope.vm.template.tabs, {
          id: id
        });

        return tab;
      };
      function loadData() {
        $timeout(() => {
          $scope.vm = data;
          var modelName = $scope.vm.entityModelName;
          var model = $parse(modelName);
          model.assign($scope, $scope.vm);

          var pageElement = angular.element(document.getElementById("page"));
          pageElement.empty();
          pageElement.append(compiledElement);

          var templateUrl = $sce.getTrustedResourceUrl(
            $scope.vm.template.templateHtml
          );

          if ($scope.vm.entityTypeId === 8) {
            $scope.vm.teamPersons = [];
            $scope.projectTeam = [] = new Array<any>();

            for (var i = 0; i < $scope.vm.members.length; i++) {
              var teamItem = $scope.vm.members[i];

              if (teamItem.role.id === 1) {
               
                $scope.projectSponsor = $scope.vm.members[i];
              } else {
                $scope.projectTeam.push($scope.vm.members[i]);
              }
            }
          }
          $templateRequest(templateUrl).then(
            function(template) {
              $compile(
                $("#page")
                  .html(template)
                  .contents()
              )($scope);
            },
            function() {}
          );
        });
      }
      loadData();

      $scope.isPromotorFilter = function(person): boolean {
        return person.role.id === 1;
      };

      $scope.isTeamFilter = function(person): boolean {
        return person.role.id > 1;
      };

      $scope.editSlideHtml = function(contentHtml, slide) {
        var editorModal = dialogs.create(
          "app/system/layoutsbuilder/modal-html-editor.html",
          "SystemLayoutBuilderEditorHtmlController",
          contentHtml,
          { size: "lg", animation: true, windowClass: "zindex" }
        );

        editorModal.result
          .then(result => {
            var text = result.htmlDescription;

            slide.innerHtml = text;
            var el = angular.element(".item active");
          
          })
          .finally(function() {
            editorModal.$destroy();
          });
      };
      $scope.addTab = function() {
        var i = Math.max.apply(
          Math,
          $scope.vm.template.tabs.map(function(o) {
            return o.id;
          })
        );

        var newTab = {
          id: i + 1,
          name: "Tab nuevo",
          innerHtml: ""
        };
        $scope.vm.template.tabs.push(newTab);
        $timeout(function() {
          
        });

      };

      $scope.cancel = function() {
        $uibModalInstance.dismiss("Canceled");
      }; // end cancel

      $scope.save = function() {
        $uibModalInstance.close($scope.vm);
      }; // end save

      $scope.editImage = function(prortyEdit) {
        //if ($scope.vm.folderGuid) {
          var editorModal = dialogs.create(
            "app/system/layoutsbuilder/modal-image-editor.html",
            "SystemLayoutBuilderImageEditorController",
            { imageValue: prortyEdit.value, folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
            { size: "lg", animation: true, windowClass: "zindex" }
          );

          editorModal.result
            .then(result => {
              var imageValue = result.imageValue;

              _.find(
                $scope.vm.template.fields,
                { name: prortyEdit.name }
              ).value = imageValue;
            })
            .finally(function() {
              editorModal.$destroy();
            });
      //  }
      };
      $scope.getRandomId = function() {
        return Math.floor(Math.random() * 6 + 1);
      };
      $scope.openImageSelector = function(tab) {
      //  if ($scope.vm.folderGuid) {
          var editorModal = dialogs.create(
            "app/system/layoutsbuilder/modal-image-editor.html",
            "SystemLayoutBuilderImageEditorController",
            { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
            { size: "lg", animation: true, windowClass: "zindex" }
          );

          editorModal.result
            .then(result => {
              var imageValue = result.imageValue;
              tab.images.push({
                id: $scope.getRandomId(),
                desc: '',
                url: imageValue,
                thumbUrl: imageValue,
                bubbleUrl: imageValue,
                deletable : true
              });
              //  _.find($scope.vm.template.templateJSON.fields, {
              //   name: prortyEdit.name
              // }).value = imageValue;
            })
            .finally(function() {
              editorModal.$destroy();
            });
      //  }
      };
      $scope.delete = function(img, cb){
        cb();
      }
      $scope.editHtmlTab = function(tab, properyName) {
        var currentTab = $scope.tabdById(tab.id);
        if (currentTab) {
          var editorModal = dialogs.create(
            "app/system/layoutsbuilder/modal-html-editor.html",
            "SystemLayoutBuilderEditorHtmlController",
            currentTab[properyName],
            { size: "lg", animation: true, windowClass: "zindex" }
          );

          editorModal.result
            .then(result => {
              var text = result.htmlDescription;
             
              _.find(
                $scope.vm.template.tabs,
                { id: currentTab.id }
              )[properyName] = text;
            })
            .finally(function() {
              editorModal.$destroy();
            });
        }
      };

      $scope.editHtml = function(contentHtml, properyJSON) {
        var editorModal = dialogs.create(
          "app/system/layoutsbuilder/modal-html-editor.html",
          "SystemLayoutBuilderEditorHtmlController",
          contentHtml,
          { size: "lg", animation: true, windowClass: "zindex" }
        );

        editorModal.result
          .then(result => {
            var text = result.htmlDescription;
       
          var field =  _.find(
              $scope.vm.template.fields,
              { name: properyJSON }
            );
            if(field){
              _.find(
                $scope.vm.template.fields,
                { name: properyJSON }
              ).value = text;
            }else{
              $scope.vm.template.fields.push( {
                name:properyJSON,
                type:"html",
                value: text,
                require: false
              });
            }
          })
          .finally(function() {
            editorModal.$destroy();
          });
      };

      $scope.htmlToPlaintext = function(text) {
        return text ? String(text).replace(/<[^>]+>/gm, "") : "";
      };
    }
  )
  .controller(
    "SystemLayoutBuilderImageEditorController",
    ($scope,$timeout, $uibModalInstance, Restangular, data) => {
      $scope.folderGuid =  'c3a7f46ea97349a780720129150f19d4';//data.folderGuid;
      $scope.imageValue = data.imageValue;
      $scope.selectedFile = null;
      $scope.externUrl = null;

      $scope.saveExternal = imageValue => {
        $uibModalInstance.close({ imageValue: imageValue });
      };
      $scope.$on("selectFile", file => {});
      $scope.save = () => {
        $uibModalInstance.close({ imageValue: $scope.selectedFile });
      };
      $scope.cancel = function() {
        $uibModalInstance.dismiss();
      }; // end cancel
    }
  )
  .controller(
    "SystemLayoutBuilderEditorHtmlController",
    ($scope,$timeout, $uibModalInstance, Restangular, data) => {
      $scope.textToEdit = data;

      $scope.save = textToEdit => {
        $scope.textToEdit = textToEdit;
        $uibModalInstance.close({ htmlDescription: $scope.textToEdit });
      };
      $scope.cancel = function() {
        $uibModalInstance.dismiss();
      }; // end cancel
    }
  )
  .directive("systemLayoutsBuilder", [
    "$log",
    "$filter",
    "$rootScope",
    "$state",
    "$sce",
    "$templateCache",
    "$timeout",
    "Restangular",
    "toastr",
    "dialogs",
    "NgMap",
    (
      $log,
      $filter,
      $rootScope,
      $state,
      $sce,
      $templateCache,
      $timeout,
      Restangular,
      toastr,
      dialogs,
      NgMap
    ) => {
      return {
        restrict: "AE",
        require: "?ngModel",
        scope: { ngModel: "=ngModel", templateHtml:"=" },
        templateUrl: "app/system/layoutsbuilder/layoutsbuilder.html",
        link(scope: any, element) {
          scope.selectedTemplateId = null;
          scope.templates = [];
          scope.layoutFieldsJSON = [];
          scope.layoutTemplateHTML = null;

          var isMockup = true;

          scope.trustAsHtml = function(html) {
            return $sce.trustAsHtml(html);
          };
          function loadTemplates() {
          $timeout(() => {
              if (scope.ngModel) {
                if (!isMockup) {
                  //from API
                  Restangular.one("system")
                    .one("layout", scope.ngModel.entityTypeId)
                    .get()
                    .then(result => {
                      scope.templates = result;
                    });
                } else {
                  switch (scope.ngModel.entityTypeId) {
                    case 8: {
                      //Project;
                      scope.templates = [
                        {
                          id: 1,
                          name: "Banco de Proyectos Template",
                          templateHTML:
                            "app/projects/templates/bancoproyectos.template.html",
                          templateJSON: {
                            headerSlide: [{
                              id: 1,
                              image: "Content/img/landing/header_one.jpg",
                              innerHtml:
                                "Integramos la ciencia, la tecnología y la<br/>    innovación con los sectores productivos<br/> potenciando las capacidades<br/>  emprendedoras"
                            }],
                            fields: [
                              {
                                name: "projectDescription",
                                type: "innerHtml",
                                value: "",
                                required: true
                              },
                              {
                                name: "projectGoalsImage",
                                type: "image",
                                value: "",
                                required: true
                              },
                              {
                                name: "projectGoalsReview",
                                type: "innerHtml",
                                value: "Test Review",
                                required: true
                              }
                            ],
                            tabs: [
                              {
                                id: 1,
                                name: "Sobre el Proyecto",
                                cssIcon: "fa fa-gears",
                                type:"html",
                                innerHtml: ""
                                // additionalPanel: {
                                //   image: null,
                                //   title: null,
                                //   subtitle: null,
                                //   description: null
                                // }
                              }
                            ]
                          }
                        }
                      ];

                      break;
                    }
                    case 9: {
                      //person;
                      
                      scope.templates = [
                        {
                          id: 1,
                          name: "Person Card",
                          templateHTML:
                            "app/system/persons/templates/personprofile.template.html",
                          templateJSON: {
                            headerSlide: [],
                            fields: [
                              {
                                name: "review",
                                type: "innerHtml",
                                value: "",
                                required: false
                              },
                              {
                                name: "places",
                                type: "place",
                                value: [],
                                required: false
                              },
                              {
                                name: "avatarUrl",
                                type: "image",
                                value: "",
                                required: false
                              }
                            ],
                            tabs: [
                              {
                                id: 1,
                                name: "SOBRE ",
                                innerHtml: "",
                                type: "html",
                                cssIcon: "fa fa-user-o"
                              },
                              {
                                id: 2,
                                name: "EXPERIENCIA / ANTECDENTES ",
                                innerHtml: "",
                                type: "html",
                                cssIcon: "fa fa-gears"
                              },
                              {
                                id: 3,
                                name: "SECTORES - INDUSTRIA ",
                                cssIcon: "fa fa-tags",
                                type: "tags",
                                tags: []
                              },
                              {
                                id: 4,
                                name: "UBICACIONES",
                                cssIcon: "fa fa-map-marker",
                                type: "map",
                                places: []
                              },
                              {
                                id: 5,
                                name: "IMÁGENES",
                                cssIcon: "fa fa-camera",
                                type: "images",
                                images: []
                              }
                            ]
                          }
                        }
                      ];
                      break;
                    }
                    case 10: {
                      //Product;
                      scope.templates = 
                      [{
                        id: 1,
                        name: "Banco de Proyectos Template",
                        templateHTML:
                          "app/catalog/products/templates/productview.template.html",
                        templateJSON: {
                         
                          fields: [
                            {
                              name: "productDescription",
                              type: "innerHtml",
                              value: "",
                              required: true
                            },
                            {
                              name: "productAvatar",
                              type: "image",
                              value: "",
                               required: false
                            },
                            {
                              name: "productReview",
                              type: "innerHtml",
                              value: "",
                              required: true
                            },
                            {
                              name:'ratingScoreDetail',
                              type:'Score',
                              value:{
                                oneCount:0,
                                twoCount:0,
                                threeCount:0,
                                fourCount:0,
                                fiveCount:0
                              },
                              require:false
                            },
                            {
                              name:'members',
                              type:'members',
                              value:[],
                              require:false
                            },
                            {
                              name:'Comments',
                              type:'Comments',
                              value:[],
                              require:false
                            }
                          ],
                          tabs: [
                           
                            {
                              id: 1,
                              name: "IMÁGENES",
                              cssIcon: "fa fa-camera",
                              type: "images",
                              images: [
                                // {
                                //   id: 1,
                                //   deletable : true,
                                //   desc: "descripcion",
                                //   url:
                                //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                                //   thumbUrl:
                                //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                                //   bubbleUrl:
                                //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                                // },
                                // {
                                //   id: 2,
                                //   desc: "descripcion",
                                //   deletable : true,
                                //   url: "http://alma.org.ar/images/logo-index.png",
                                //   thumbUrl:
                                //     "http://alma.org.ar/images/logo-index.png",
                                //   bubbleUrl:
                                //     "http://alma.org.ar/images/logo-index.png"
                                // }
                              ]
                            },
                            {
                              id: 2,
                              name: "Sobre el Producto",
                              innerHtml: "",
                              type: "html",
                              cssIcon: "fa fa-send"
                            },
                          ]
                        }
                      }
                    ];
                      
                      
                      break;
                    }
                    case 11: {
                      //Course;
                      scope.templates = [
                        {
                          id: 10,
                          name: "Curso Template",
                          templateHTML:
                            "app/lms/templates/course.template.html",
                          templateJSON: {
                            headerSlide: [{
                              id: 1,
                              image: "http://www.truwayacademy.com/servicepages/web-designing-banner-1.jpg",
                              innerHtml:
                                ""
                            }],
                            fields: [
                              {
                                name: "courseAvatar",
                                type: "image",
                                value: "",
                                required: false
                              },
                              {
                                name:"requisites",
                                type:"html",
                                value: "",
                                require: false
                              },
                              {
                                name: "members",
                                type: "members",
                                value: [],
                                required: true
                              },
                            ]
                            
                          }
                        }
                      ];

                      break;
                    }
                    default: {
                      toastr.error(
                        "Layout Builder",
                        "No se ha encontrado el modelo de datos."
                      );
                      break;
                    }
                  }

                  //Mock Template for Project in Banco de Proyecto
                }
              } else {
                toastr.error(
                  "Layout Builder",
                  "No se ha encontrado el modelo de datos."
                );
              }
           });
          }
          function loadDataTemplate() {
            //if entity have data created, load html source and JSON fields.
            if (scope.ngModel && scope.ngModel.template) {
                scope.vm = scope.ngModel;
              // scope.templateJSON = scope.ngModel.template.templateJSON;
              // scope.templateHTML = scope.ngModel.template.templateHTML;
            }
          }
       
          loadTemplates();
          loadDataTemplate();

          scope.openEditTemplateModal = templateId => {
            $timeout(() => {
              var templateToEdit = _.find(scope.templates, {
                id: templateId
              });
              if (!templateToEdit) {
                toastr.error(
                  "Layout Builder",
                  "No se ha encontrado el template para edicion."
                );
                return;
              }
              if (!scope.ngModel.template) {
                scope.ngModel.template = templateToEdit;
              } else {
              }

              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/dialogeditmodal.html",
                "SystemLayoutsBuilderModalController",
                scope.ngModel,
                { size: "lg", animation: true }
              );

              editorModal.result
                .then(result => {
                  var model = result;
                  scope.ngModel = model;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
            });
          };
        }
      };
    }
  ])

  ///////////////////////////////////////////////
  ///////////////////////////////////////////////
  .directive("systemCallLayoutsBuilderView", [
    "$log",
    "$filter",
    "$rootScope",
    "$state",
    "Restangular",
    "toastr",
    "$compile",
    "$templateCache",
    "$templateRequest",
    "$sce",
    "$parse",
    "$timeout",
    "dialogs",
    "NgMap",
    (
      $log,
      $filter,
      $rootScope,
      $state,
      Restangular,
      toastr,
      $compile,
      $templateCache,
      $templateRequest,
      $sce,
      $parse,
      $timeout,
      dialogs,
      NgMap
    ) => {
      return {
        restrict: "AE",
        require: "?ngModel",

        scope: { ngModel: "=ngModel", enableEdit: "=", templateHtml: "@" },
        templateUrl: "app/system/layoutsbuilder/layoutview.html",
        link(scope: any, element) {
          scope.selectedTemplateId = null;
          scope.templates = [];
          scope.layoutFieldsJSON = [];
          scope.layoutTemplateHTML = null;
          scope.isViewMode = scope.enableEdit! || true;
          var isMockup = false;

          scope.places = [];
          scope.googleMapsUrl =
            "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY";
          scope.map = {
            center: [-34.61512668346219, -58.414306640625],
            zoom: 4
          };
          scope.googleMapsUrl =
            "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";

          var html = '<div id="loadhtml"></div>',
            compiledElement = $compile(html)(scope);

          scope.$on("changeTemplateViewMode", () => {
            scope.isViewMode = !scope.isViewMode;
          });
         
          scope.fieldByNameTemplate = (fieldName, template)=> {
         
            if(!template){
              return null;
            }
            var field = _.find(template.fields, {
              name: fieldName
            });
    
            return field;
          };
      //     scope.removeTeam = function(personTeam){
      //       console.log('remove person');
      //       console.log(personTeam);
      //       var fieldIndex = _.findIndex(scope.vm.template.fields, {
      //         name: 'members'
      //       });
      //       if(fieldIndex === -1){
      //         scope.vm.template.fields[fieldIndex].value
              
      //     }
      // }

           scope.openTeemSelector = () => {
            var sponsorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-team-selector.html",
              "selectMemberTemplateController",
              null,
              { size: "lg", animation: true }
            );

            sponsorModal.result.then(
              result => {
                var person = result.person;
                var fieldIndex = _.findIndex(scope.vm.template.fields, {
                  name: 'members'
                });
                if(fieldIndex === -1){
                  scope.vm.template.fields.push(
                    {
                      name:'members',
                      type:'members',
                      value:[],
                      require:false
                    },
                  );
                   fieldIndex = _.findIndex(scope.vm.template.fields, {
                    name: 'members'
                  });

                }
                scope.vm.template.fields[fieldIndex].value.push(result.person);
    
              },
              () => { }
            );
          };

          scope.removeSelectedPerson = selectedPerson => {
            console.log(selectedPerson);
            var fieldIndex = _.findIndex(scope.vm.template.fields, {
                  name: 'members'
                });
            // if (selectedPerson.id && selectedPerson.id > 0) {
            //   var fieldIndex = _.findIndex(scope.vm.template.fields, {
            //     name: 'members'
            //   });
            //   _.remove(scope.vm.fields[fieldIndex].value, { id: selectedPerson.id });
            // } else {
              for (var i = 0; i < scope.vm.template.fields[fieldIndex].value.length; i++) {
                if (
                  scope.vm.template.fields[fieldIndex].value[i].person.id === selectedPerson.id
                ) {
                  scope.vm.template.fields[fieldIndex].value.splice(i, 1);
                }
              }
           // }
          };

          scope.reRednerMap = function () {
            scope.showMap = true;
            google.maps.event.trigger(scope.map, "resize");
          };
    
          NgMap.getMap({ id: "placesMap" }).then(map => {
            google.maps.event.trigger(map, "resize");
            map.setZoom(8);
          });

          scope.openPlacesSelector = tab => {
            var placesModal = dialogs.create(
              "app/projects/projects/modal-places-selector.html",
              "selectPlacesController",
              null,
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            placesModal.result.then(
              result => {
                var place = result.place;
                tab.places.push(result.place);
     
              },
              () => {}
            );
          };

          scope.reRednerMap = function() {
            scope.showMap = true;
            google.maps.event.trigger(scope.map, "resize");
          };

          NgMap.getMap({ id: "placesMap" }).then(map => {
            google.maps.event.trigger(map, "resize");
            map.setZoom(4);
          });

          scope.currentPosition = [-34.61512668346219, -58.414306640625];

          scope.isHtmlTab = function(tab): boolean {
            return tab.type === "html";
          };

          scope.isTagTab = function(tab): boolean {
            return tab.type === "tags";
          };

          scope.isMapTab = function(tab): boolean {
            return tab.type === "map";
          };

          scope.isImageTab = function(tab): boolean {
            return tab.type === "images";
          };

   

          scope.removeTab = function(tab) {
            _.remove(scope.vm.template.tabs, { id: tab.id });
         //   _.remove(scope.vm.template.templateJSON.tabs, { id: tab.id });
          };

          scope.addTagByType = function(type) {
            var i = Math.max.apply(
              Math,
              scope.vm.template.tabs.map(function(o) {
                return o.id;
              })
              // scope.vm.template.templateJSON.tabs.map(function(o) {
              //   return o.id;
              // })
            );
            switch (type) {
              case "html":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  type: "html",
                  name: "Nueva Seccion",
                  cssIcon: "fa fa-paper-plane",
                  innerHtml: ""
                });
                break;
              case "tags":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  type: "tags",
                  name: "Nueva Seccion",
                  cssIcon: "fa fa-tags",
                  tags: []
                });
                break;
              case "map":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  cssIcon: "fa fa-map-marker",
                  name: "Nueva Seccion",
                  type: "map",
                  places: []
                });
                break;
              case "images":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  cssIcon: "fa fa-camera",
                  name: "Nueva Seccion",
                  type: "images",
                  images: []
                });
                break;
            }
          };

          scope.getMapPosition = event => {
            scope.currentPosition = [event.latLng.lat(), event.latLng.lng()];
          };

          scope.htmlToPlaintext = function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, "") : "";
          };

          scope.onMapOverlayCompleted = function(e) {
            var type = e.type;
            var overlay = e.overlay;
            var data = {
              type: type,
              geo: null
            };

            switch (type) {
              case "polygon":
                data.geo = e.overlay.getPath().getArray();
                break;
              case "rectangle":
                console.info(
                  "@todo: get information from 'overlay' to data.geo"
                );
                break;
              case "circle":
                console.info(
                  "@todo: get information from 'overlay' to data.geo"
                );
                break;
            }
          };
          scope.fieldByName = function(fieldName) {
            var field = _.find(scope.vm.template.fields, {
              name: fieldName
            });

            return field;
          };
          scope.tabdByName = function(fieldName) {
            var tab = _.find(scope.vm.template.tabs, {
              name: fieldName
            });

            return tab;
          };

          scope.tabdById = function(id) {
            var tab = _.find(scope.vm.template.tabs, {
              id: id
            });

            return tab;
          };

          scope.editTemplate = function() {
            $timeout(() => {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/dialogeditmodal.html",
                "SystemLayoutsBuilderModalController",
                scope.vm,
                { size: "lg", animation: true }
              );

              editorModal.result
                .then(result => {
                  var model = result;
                  scope.ngModel = model;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
            });
          };

          scope.addTab = function() {
            var i = Math.max.apply(
              Math,
              scope.vm.template.tabs.map(function(o) {
                return o.id;
              })
            );

            var newTab = {
              id: i + 1,
              name: "Tab nuevo",
              innerHtml: ""
            };
            scope.vm.template.tabs.push(newTab);
            $timeout(function() {
            });
         
          };


          scope.editImage = function(prortyEdit) {
            //if (scope.vm.folderGuid) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-image-editor.html",
                "SystemLayoutBuilderImageEditorController",
                {
                  imageValue: prortyEdit.value,
                  folderGuid:'c3a7f46ea97349a780720129150f19d4' //scope.vm.folderGuid
                },
                { size: "lg", animation: true, windowClass: "zindex" }
              );
              
              editorModal.result
                .then(result => {
                  var imageValue = result.imageValue;
                    console.log(imageValue);
                    console.log( prortyEdit.name);
                  _.find(
                    scope.vm.template.fields,
                    { name: prortyEdit.name }
                  ).value = imageValue;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
          //  }
          };
          scope.isFirstSlide = function(index) {
            return index === 0 ? true : false;
          };
          scope.getRandomId = function() {
            return Math.floor(Math.random() * 6 + 1);
          };
          scope.openImageSelector = function(tab) {
           // if (scope.vm.folderGuid) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-image-editor.html",
                "SystemLayoutBuilderImageEditorController",
                { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4'},
                { size: "lg", animation: true, windowClass: "zindex" }
              );

              editorModal.result
                .then(result => {
                  var imageValue = result.imageValue;
                  var i =1;
                  if(tab.images.length > 0){
                   i = Math.max.apply(
                    Math,
                    tab.images.map(function(o) {
                      return o.id;
                    })
                  );
                }
                  tab.images.push({
                    id: i +1,
                    desc: '',
                    url: imageValue,
                    thumbUrl: imageValue,
                    bubbleUrl: imageValue,
                    deletable : true
                  });
                  //  _.find($scope.vm.template.templateJSON.fields, {
                  //   name: prortyEdit.name
                  // }).value = imageValue;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
          //  }
          };
          scope.delete = function(img, cb){
            cb();
          }
          scope.editHtmlTab = function(tab, properyName) {
            var currentTab = scope.tabdById(tab.id);
            if (currentTab) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-html-editor.html",
                "SystemLayoutBuilderEditorHtmlController",
                currentTab[properyName],
                { size: "lg", animation: true, windowClass: "zindex" }
              );

              editorModal.result
                .then(result => {
                  var text = result.htmlDescription;
           

                  _.find(
                    scope.vm.template.tabs,
                    { id: currentTab.id }
                  )[properyName] = text;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
            }
          };

          scope.editHtml = function(contentHtml, properyJSON) {
            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-html-editor.html",
              "SystemLayoutBuilderEditorHtmlController",
              contentHtml,
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;

                var field =  _.find(
                  scope.vm.template.fields,
                  { name: properyJSON }
                );
                if(field){
                  _.find(
                    scope.vm.template.fields,
                    { name: properyJSON }
                  ).value = text;
                }else{
                  scope.vm.template.fields.push( {
                    name:properyJSON,
                    type:"html",
                    value: text,
                    require: false
                  });
                }
              })
              .finally(function() {
                editorModal.$destroy();
              });
          };

          scope.htmlToPlaintext = function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, "") : "";
          };

          function loadData() {
            console.log(scope.templateHtml);
            $timeout(() => {
              var modelName = scope.vm.entityModelName;
              var model = $parse(modelName);
              model.assign(scope, scope.vm);
              var pageElement = angular.element(
                document.getElementById("page")
              );
              pageElement.empty();
              pageElement.append(compiledElement);

              var templateUrl = $sce.getTrustedResourceUrl(
               scope.templateHtml
              );

              $templateRequest(templateUrl).then(
                function(template) {
                  $compile(
                    $("#page")
                      .html(template)
                      .contents()
                  )(scope);
                },
                function() {}
              );
            });
          }


          scope.addSlide = function() {
            var i = Math.max.apply(
              Math,
              scope.vm.template.headerSlide.map(function(o) {
                return o.id;
              })
            );

            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-image-editor.html",
              "SystemLayoutBuilderImageEditorController",
              { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            editorModal.result
              .then(result => {
                i = i + 1;
                var imageValue = result.imageValue;
                scope.vm.template.headerSlide.push({
                  id: i,
                  image: imageValue,
                  innerHtml: "Texto Slide",
                  isActive: true
                });

                jQuery(".item.active").removeClass("active");
                $timeout(() => {
                  jQuery("#slide-" + i).addClass("active");
                });
              })
              .finally(function() {
                editorModal.$destroy();
              });
          };

          scope.openImageSelector = function(tab) {
            //if (scope.vm.folderGuid) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-image-editor.html",
                "SystemLayoutBuilderImageEditorController",
                { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
                { size: "lg", animation: true, windowClass: "zindex" }
              );

              editorModal.result
                .then(result => {
                  var i = 1;
                  if(tab.images.length > 0){
                   i = Math.max.apply(
                    Math,
                    tab.images.map(function(o) {
                      return o.id;
                    })
                  );
                }
                  var imageValue = result.imageValue;
                  tab.images.push({
                    id: i +1 ,
                    desc: '',
                    url: imageValue,
                    thumbUrl: imageValue,
                    bubbleUrl: imageValue,
                    deletable : true
                  });
                })
                .finally(function() {
                  editorModal.$destroy();
                });
          //  }
          };
          scope.delete = function(img, cb){
            cb();
          }
          scope.editSlideHtml = function(contentHtml, slide) {
            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-html-editor.html",
              "SystemLayoutBuilderEditorHtmlController",
              contentHtml,
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;

                slide.innerHtml = text;
              })
              .finally(function() {
                editorModal.$destroy();
              });
          };
          scope.isPromotorFilter = function(person): boolean {
            return person.role.id === 1;
          };

          scope.isTeamFilter = function(person): boolean {
            return person.role.id > 1;
          };

          scope.removeSlide = function(slide) {
           
            _.remove(scope.vm.template.headerSlide, {
              id: slide.id
            });
            scope.inSlider =null;
            scope.index =0;
           
          };

          scope.trustAsHtml = function(html) {
            return $sce.trustAsHtml(html);
          };

          function loadTemplateMock() {
            $timeout(() => {
              if (scope.ngModel) {
                scope.vm = scope.ngModel;

                switch (scope.ngModel.entityTypeId) {
                  case 8: {
                    //Project;
                    scope.vm.template = {
                      // id: 1,
                      // name: "Banco de Proyectos Template",
                      // templateHTML:
                      //   "app/projects/templates/bancoproyectos.template.html",
                      // templateJSON: {
                        headerSlide: [
                          {
                            id: 1,
                            image: "http://bancodeproyectos.azurewebsites.net/assets/images/drone.jpg",
                            innerHtml:
                              "Integramos la ciencia, la tecnología y la<br/>    innovación con los sectores productivos<br/> potenciando las capacidades<br/>  emprendedoras"
                          },
                        ],
                        fields: [
                          {
                            name: "projectDescription",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsImage",
                            type: "image",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsReview",
                            type: "innerHtml",
                            value: "",
                            required: true
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "Sobre la Convocatoria",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-2x fa-paper-plane"
                            // additionalPanel: {
                            //   image: null,
                            //   title: null,
                            //   subtitle: null,
                            //   description: null
                            // }
                          }
                        ]
                      
                    };

                    scope.vm.teamPersons = [];
                    scope.projectTeam = [] = new Array<any>();

                    for (var i = 0; i < scope.vm.members.length; i++) {
                      var teamItem = scope.vm.members[i];

                      if (teamItem.role.id === 1) {
                        scope.projectSponsor = scope.vm.members[i];
                        //scope.projectSponsor = scope.project.members[i];
                        scope.projectSponsor.person.template  =angular.fromJson(teamItem.person.template); 
                        scope.projectSponsor.person.profilePictureUrl = scope.fieldByNameTemplate('avatarUrl',teamItem.person.template).value;
                      } else {
                        scope.projectTeam.push(scope.vm.members[i]);
                      }
                    }
                    break;
                  }
                  case 9: {
                    //person;
                    scope.vm.projects = [
                      {
                        "id": 56,
                        "createdBy": 2080,
                        "folderGuid": "c3a7f46ea97349a780720129150f19d4",
                        "messageThreadGuid": null,
                        "fundingTypeId": null,
                        "workflowInstance": {
                          "currentWorkflowActivity": {
                            "approvalRules": [],
                            "id": 506,
                            "workflowId": 96,
                            "name": "Idea proyecto",
                            "isStart": false,
                            "isFinal": false,
                            "listIndex": 1
                          },
                          "workflow": {
                            "id": 96,
                            "typeId": 5,
                            "tenantId": 11,
                            "code": "P",
                            "name": "Project",
                            "description": "Project"
                          },
                          "createdBy": {
                            "id": 47248,
                            "isOrganization": false,
                            "code": null,
                            "name": "Titarenko, Stanislav",
                            "gender": null,
                            "firstName": "Stanislav",
                            "lastName": "Titarenko",
                            "birthDate": null,
                            "deathDate": null,
                            "data1": null,
                            "isValid": null,
                            "webUrl": null,
                            "profilePictureUrl": null
                          },
                          "assignedRoles": [],
                          "canAssignToRoles": [],
                          "userPermissions": [],
                          "approvals": [],
                          "history": [
                            {
                              "type": 0,
                              "createDate": "2017-11-28T20:24:15.5530000",
                              "description": null,
                              "isTerminated": false,
                              "fromWorkflowActivityName": "Solicitud creada",
                              "toWorkflowActivityName": "Start",
                              "personName": "Titarenko, Stanislav",
                              "rol": null,
                              "user": null,
                              "isActive": false
                            }
                          ],
                          "historyGeneric": null,
                          "tags": [],
                          "id": 28591,
                          "guid": "f2621289c16d433da7a6c9032b89f244",
                          "workflowId": 96,
                          "currentWorkflowActivityId": 506,
                          "createdByUserId": 2080,
                          "createDate": "2017-11-28T20:24:15.5530000",
                          "progress": 0,
                          "isTerminated": false
                        },
                        "currency": null,
                        "number": "213123123331123",
                        "name": "Proyecto Sebas 1",
                        "description": "<p>Proyecto largo 123123123</p>\n",
                        "review": "<p>Proyecto sebas 123123123</p>\n",
                        "guid": "3994ea69f2d44090963b9db48ac03841",
                        "status": 0,
                        "createDate": "2017-11-28T23:24:15.5200000",
                        "startDate": "2017-11-28T06:00:00.0000000",
                        "endDate": null,
                        "approvalDate": null,
                        "investment": 1000000,
                        "contractAmount": 2000000,
                        "aditionalAmount": null,
                        "adjustedAmount": null,
                        "total": 0,
                        "tasks": [],
                        "places": [
                          {
                            "id": 1,
                            "place": {
                              "id": 3,
                              "parentId": 2,
                              "typeId": 2,
                              "name": "Buenos Aires",
                              "geo": null
                            }
                          }
                        ],
                        "categories": [
                          {
                            "id": 1,
                            "category": {
                              "id": 3,
                              "name": "Desarrollo y vivienda"
                            }
                          },
                          {
                            "id": 2,
                            "category": {
                              "id": 5,
                              "name": "Energía"
                            }
                          },
                          {
                            "id": 3,
                            "category": {
                              "id": 7,
                              "name": "Industria"
                            }
                          },
                          {
                            "id": 4,
                            "category": {
                              "id": 8,
                              "name": "Inversiones Sociales"
                            }
                          },
                          {
                            "id": 5,
                            "category": {
                              "id": 11,
                              "name": "Integración regional"
                            }
                          }
                        ],
                        "members": [
                          {
                            "id": 20,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 3022,
                                  "personId": 1,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "sv@nespencapital.com"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 12616,
                                  "personId": 1,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "1568375268"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]",
                                      "childCount": 0,
                                      "id": 5,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Ciudad Autónoma de Buenos Aires",
                                      "geo": null
                                    },
                                    "id": 34128,
                                    "placeId": 5,
                                    "street": "Cordoba",
                                    "streetNumber": "1261",
                                    "floor": "2",
                                    "appartment": "a",
                                    "zipCode": null,
                                    "name": "Cordoba 1261 2 a"
                                  },
                                  "id": 13410,
                                  "personId": 1,
                                  "addressId": 34128,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 1,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": 1002
                              },
                              "employerId": 1,
                              "id": 1,
                              "isOrganization": true,
                              "code": "00000000010",
                              "name": "Sebastian C. Vigliola",
                              "gender": 1,
                              "firstName": "Sebastian",
                              "lastName": "Vigliola",
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 1,
                              "tenantId": 11,
                              "name": "sponsor"
                            },
                            "tags": [],
                            "description": "<p>TEST</p>\n"
                          },
                          {
                            "id": 21,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 3565,
                                  "personId": 47248,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "stitarenko@rt-solutions.com.ar"
                                }
                              ],
                              "phones": [],
                              "addresses": [],
                              "references": {
                                "personId": 47248,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 47248,
                              "isOrganization": false,
                              "code": null,
                              "name": "Titarenko, Stanislav",
                              "gender": null,
                              "firstName": "Stanislav",
                              "lastName": "Titarenko",
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": null,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "Dev",
                              "Manager"
                            ],
                            "description": "<p>ST DESC</p>\n"
                          },
                          {
                            "id": 22,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 19,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "pcejas@gmail.com"
                                },
                                {
                                  "id": 10031,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "p@g.com"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 12681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "+5491158022424"
                                },
                                {
                                  "id": 19681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "234232"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 34188,
                                    "placeId": 6548,
                                    "street": "Bayo",
                                    "streetNumber": "255",
                                    "floor": "-",
                                    "appartment": "-",
                                    "zipCode": null,
                                    "name": "Bayo 255 - -"
                                  },
                                  "id": 13470,
                                  "personId": 35237,
                                  "addressId": 34188,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                },
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 41052,
                                    "placeId": 6548,
                                    "street": "Jazmines",
                                    "streetNumber": "1222",
                                    "floor": "1",
                                    "appartment": "a",
                                    "zipCode": "1669",
                                    "name": "Jazmines 1222 1 a"
                                  },
                                  "id": 20309,
                                  "personId": 35237,
                                  "addressId": 41052,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 35237,
                                "doctorId": 2003,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 35237,
                              "isOrganization": true,
                              "code": "20255680189",
                              "name": "Cejas, Pablo",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": "1976-11-24T03:00:00.0000000",
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "Dev",
                              "Manager"
                            ],
                            "description": "<p>PABLO DESC</p>\n"
                          },
                          {
                            "id": 23,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 9693,
                                  "personId": 53528,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "ventas@siicomputacion.com.ar"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 19317,
                                  "personId": 53528,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "02234916323"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":22950,\"Name\":\"General Pueyrredón\"}]",
                                      "childCount": 0,
                                      "id": 22950,
                                      "parentId": 3,
                                      "typeId": 4,
                                      "name": "General Pueyrredón",
                                      "geo": null
                                    },
                                    "id": 40705,
                                    "placeId": 22950,
                                    "street": "Avellaneda",
                                    "streetNumber": "2801",
                                    "floor": null,
                                    "appartment": null,
                                    "zipCode": null,
                                    "name": "Avellaneda 2801 "
                                  },
                                  "id": 19962,
                                  "personId": 53528,
                                  "addressId": 40705,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 53528,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 53528,
                              "isOrganization": false,
                              "code": null,
                              "name": "Romero, Juan Gabriel",
                              "gender": null,
                              "firstName": "Juan Gabriel",
                              "lastName": "Romero",
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "Prueba"
                            ],
                            "description": "<p>ROMEO DESC</p>\n"
                          },
                          {
                            "id": 24,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [],
                              "phones": [],
                              "addresses": [],
                              "references": {
                                "personId": 13,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 13,
                              "isOrganization": true,
                              "code": null,
                              "name": "Ostel Central",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": null,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "tteg"
                            ],
                            "description": "<p>TEST TEST</p>\n"
                          }
                        ],
                        "roles": null
                      },
                      {
                        "id": 50,
                        "createdBy": 2080,
                        "folderGuid": "3a342c5a8f8d4dcc89df642c90182e98",
                        "messageThreadGuid": null,
                        "fundingTypeId": null,
                        "workflowInstance": {
                          "currentWorkflowActivity": {
                            "approvalRules": [],
                            "id": 506,
                            "workflowId": 96,
                            "name": "Idea proyecto",
                            "isStart": false,
                            "isFinal": false,
                            "listIndex": 1
                          },
                          "workflow": {
                            "id": 96,
                            "typeId": 5,
                            "tenantId": 11,
                            "code": "P",
                            "name": "Project",
                            "description": "Project"
                          },
                          "createdBy": {
                            "id": 47248,
                            "isOrganization": false,
                            "code": null,
                            "name": "Titarenko, Stanislav",
                            "gender": null,
                            "firstName": "Stanislav",
                            "lastName": "Titarenko",
                            "birthDate": null,
                            "deathDate": null,
                            "data1": null,
                            "isValid": null,
                            "webUrl": null,
                            "profilePictureUrl": null
                          },
                          "assignedRoles": [],
                          "canAssignToRoles": [],
                          "userPermissions": [],
                          "approvals": [],
                          "history": [
                            {
                              "type": 0,
                              "createDate": "2017-11-24T00:47:34.4570000",
                              "description": null,
                              "isTerminated": false,
                              "fromWorkflowActivityName": "Solicitud creada",
                              "toWorkflowActivityName": "Start",
                              "personName": "Titarenko, Stanislav",
                              "rol": null,
                              "user": null,
                              "isActive": false
                            }
                          ],
                          "historyGeneric": null,
                          "tags": [],
                          "id": 27649,
                          "guid": "259af9321cf34b6986faadb898b781d9",
                          "workflowId": 96,
                          "currentWorkflowActivityId": 506,
                          "createdByUserId": 2080,
                          "createDate": "2017-11-24T00:47:34.4570000",
                          "progress": 0,
                          "isTerminated": false
                        },
                        "currency": null,
                        "number": "T03",
                        "name": "Laboratorio Quimico Ambiental",
                        "description": "<p>Test Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description</p>\n",
                        "review": "<p>El laboratorio quimico ambiental de la Provincia de Buenos Aires pretende constituirse en el soporte analitico para las determinaciones de calidad en las diversas muestras sobre la tematica del agua y el medioambiente dando apoyo a los diversos organismos de la provincia como la Autoridad del Agua, el Organismo Provincial para el Desarrollo Sostenible, entre otros.</p>\n",
                        "guid": "e902423ce273487a85cab186488fd602",
                        "status": 0,
                        "createDate": "2017-11-24T00:47:34.4030000",
                        "startDate": "2017-12-12T03:00:00.0000000",
                        "endDate": null,
                        "approvalDate": null,
                        "investment": null,
                        "contractAmount": 20000000,
                        "aditionalAmount": null,
                        "adjustedAmount": null,
                        "total": null,
                        "tasks": [],
                        "places": [],
                        "categories": [
                          {
                            "id": 6,
                            "category": {
                              "id": 3,
                              "name": "Desarrollo y vivienda"
                            }
                          },
                          {
                            "id": 7,
                            "category": {
                              "id": 11,
                              "name": "Integración regional"
                            }
                          },
                          {
                            "id": 8,
                            "category": {
                              "id": 15,
                              "name": "Comercio"
                            }
                          }
                        ],
                        "members": [],
                        "roles": null
                      },
                      {
                        "id": 63,
                        "createdBy": 1,
                        "folderGuid": "486eb963af37450eaac9f66d2f693689",
                        "messageThreadGuid": null,
                        "fundingTypeId": null,
                        "workflowInstance": {
                          "currentWorkflowActivity": {
                            "approvalRules": [],
                            "id": 2341,
                            "workflowId": 1245,
                            "name": "Idea proyecto",
                            "isStart": false,
                            "isFinal": false,
                            "listIndex": 1
                          },
                          "workflow": {
                            "id": 1245,
                            "typeId": 5,
                            "tenantId": 1030,
                            "code": "P",
                            "name": "Project",
                            "description": "Project"
                          },
                          "createdBy": {
                            "id": 1,
                            "isOrganization": true,
                            "code": "00000000010",
                            "name": "Sebastian C. Vigliola",
                            "gender": 1,
                            "firstName": "Sebastian",
                            "lastName": "Vigliola",
                            "birthDate": null,
                            "deathDate": null,
                            "data1": null,
                            "isValid": true,
                            "webUrl": null,
                            "profilePictureUrl": null
                          },
                          "assignedRoles": [],
                          "canAssignToRoles": [],
                          "userPermissions": [],
                          "approvals": [],
                          "history": [
                            {
                              "type": 0,
                              "createDate": "2018-01-23T18:04:03.3970000",
                              "description": null,
                              "isTerminated": false,
                              "fromWorkflowActivityName": "Solicitud creada",
                              "toWorkflowActivityName": "Start",
                              "personName": "Sebastian C. Vigliola",
                              "rol": null,
                              "user": null,
                              "isActive": false
                            }
                          ],
                          "historyGeneric": null,
                          "tags": [],
                          "id": 28598,
                          "guid": "a6e7a076b67f4fa4bda7cdcb8a80fa6a",
                          "workflowId": 1245,
                          "currentWorkflowActivityId": 2341,
                          "createdByUserId": 1,
                          "createDate": "2018-01-23T18:04:03.3970000",
                          "progress": 0,
                          "isTerminated": false
                        },
                        "currency": null,
                        "number": "01",
                        "name": "Reingenieria Canales de Distribucion",
                        "description": "<p>El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.</p>\n",
                        "review": "<p>El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.</p>\n",
                        "guid": "218cc0e40da749af82207a5144184a09",
                        "status": 0,
                        "createDate": "2018-01-23T18:04:03.3600000",
                        "startDate": null,
                        "endDate": null,
                        "approvalDate": null,
                        "investment": null,
                        "contractAmount": null,
                        "aditionalAmount": null,
                        "adjustedAmount": null,
                        "total": null,
                        "tasks": [],
                        "places": [],
                        "categories": [],
                        "members": [
                          {
                            "id": 41,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [],
                              "phones": [],
                              "addresses": [],
                              "references": {
                                "personId": 55306,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 55306,
                              "isOrganization": true,
                              "code": null,
                              "name": "Coca Cola SA",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 1,
                              "tenantId": 11,
                              "name": "sponsor"
                            },
                            "tags": [],
                            "description": "<p>Coca Cola SA es una compa&ntilde;ia que bla bla bla&nbsp; bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla</p>\n"
                          },
                          {
                            "id": 42,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 19,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "pcejas@gmail.com"
                                },
                                {
                                  "id": 10031,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "p@g.com"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 12681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "+5491158022424"
                                },
                                {
                                  "id": 19681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "234232"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 34188,
                                    "placeId": 6548,
                                    "street": "Bayo",
                                    "streetNumber": "255",
                                    "floor": "-",
                                    "appartment": "-",
                                    "zipCode": null,
                                    "name": "Bayo 255 - -"
                                  },
                                  "id": 13470,
                                  "personId": 35237,
                                  "addressId": 34188,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                },
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 41052,
                                    "placeId": 6548,
                                    "street": "Jazmines",
                                    "streetNumber": "1222",
                                    "floor": "1",
                                    "appartment": "a",
                                    "zipCode": "1669",
                                    "name": "Jazmines 1222 1 a"
                                  },
                                  "id": 20309,
                                  "personId": 35237,
                                  "addressId": 41052,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 35237,
                                "doctorId": 2003,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 35237,
                              "isOrganization": true,
                              "code": "20255680189",
                              "name": "Cejas, Pablo",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": "1976-11-24T03:00:00.0000000",
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [],
                            "description": "<p>aaaasddf</p>\n"
                          }
                        ],
                        "roles": null
                      }
                    ];
                    scope.vm.template = {
                      // id: 1,
                      // name: "Person Card",
                      // templateHTML:
                      //   "app/system/persons/templates/personprofile.template.html",
                      // templateJSON: {
                        headerSlide: [],
                        fields: [
                          {
                            name: "review",
                            type: "innerHtml",
                            value:
                              "Asociación integrada por la Municipalidad de Bahía Blanca, la Universidad Nacional del Sur, el Ente Zona Franca Bahía Blanca y 20 empresas de tecnología",
                            required: false
                          },
                          {
                            name: "avatarUrl",
                            type: "image",
                            value:
                              "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB.png",
                            required: false
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "SOBRE ",
                            innerHtml:
                              "El Polo Tecnológico del Sur es una asociación civil sin fines de lucro integrada por la Municipalidad de Bahía Blanca, la Universidad Nacional del Sur, el Ente Zona Franca Bahía Blanca Coronel Rosales, la Asociación de Empresas del Polo Tecnológico del Sur y 20 empresas de tecnología. Tiene como objetivo impulsar el desarrollo y estimular el crecimiento regional, dinamizando y articulando la oferta y demanda tecnológica a través de la coordinación de acciones públicas, privadas, académicas y científicas para lograr la inserción de empresas locales y regionales en la economía nacional e internacional. " +
                              ' <p style="margin-left:0px; margin-right:0px"> <iframe frameborder="0" height="281" src="https://www.youtube.com/embed/n0zC6rK5i3s?feature=oembed" style="box-sizing: border-box;" width="500"></iframe>  </p>',
                            type: "html",
                            cssIcon: "fa fa-user-o"
                          },
                          {
                            id: 2,
                            name: "EXPERIENCIA / ANTECDENTES ",
                            innerHtml:
                              ' <div class="col-sm-6 col-xs-12" style="-webkit-text-stroke-width:0px; background:#005d85; box-sizing:border-box; color:#333333; float:left; font-family:&quot;Roboto Slab&quot;,serif; font-size:14px; font-style:normal; font-variant-caps:normal; font-variant-ligatures:normal; font-weight:normal; letter-spacing:normal; max-height:220px; min-height:150px; orphans:2; padding:7.2em 1.35em; position:relative; text-align:start; text-decoration-color:initial; text-decoration-style:initial; text-indent:0px; text-transform:none; white-space:normal; widows:2; width:570px; word-spacing:0px"><img alt="Institución" class="img-responsive" src="http://sintinta.com.ar/wp-content/uploads/2013/07/zona-franca-bahia-rosales-logo.jpg" style="border:0px; box-sizing:border-box; display:block; height:auto; left:285px; max-width:100%; position:absolute; top:100.8px; transform:translate(-50%, -50%); vertical-align:middle" /></div>   <div class="col-sm-6 col-xs-12" style="-webkit-text-stroke-width:0px; background:#005d85; box-sizing:border-box; color:#333333; float:left; font-family:&quot;Roboto Slab&quot;,serif; font-size:14px; font-style:normal; font-variant-caps:normal; font-variant-ligatures:normal; font-weight:normal; letter-spacing:normal; max-height:220px; min-height:150px; orphans:2; padding:7.2em 1.35em; position:relative; text-align:start; text-decoration-color:initial; text-decoration-style:initial; text-indent:0px; text-transform:none; white-space:normal; widows:2; width:570px; word-spacing:0px"><img alt="Institución" class="img-responsive" src="http://ptbb.org.ar/wp-content/uploads/2015/02/zona-franca-bahia-rosales-logo.png"  style="border:0px; box-sizing:border-box; display:block; height:auto; left:285px; max-width:100%; position:absolute; top:100.8px; transform:translate(-50%, -50%); vertical-align:middle"  /></div>',
                            type: "html",
                            cssIcon: "fa fa-gears"
                          },
                          {
                            id: 3,
                            name: "SECTORES - INDUSTRIA ",
                            cssIcon: "fa fa-tags",
                            type: "tags",
                            tags: ["Capacitación", "Tecnología", "Industria"]
                          },
                          {
                            id: 4,
                            name: "UBICACIONES",
                            cssIcon: "fa fa-map-marker",
                            type: "map",
                            places: []
                          },
                          {
                            id: 5,
                            name: "IMÁGENES",
                            cssIcon: "fa fa-camera",
                            type: "images",
                            images: [
                              // {
                              //   id: 1,
                              //   deletable : true,
                              //   desc: "descripcion",
                              //   url:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   thumbUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   bubbleUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                              // },
                              // {
                              //   id: 2,
                              //   desc: "descripcion",
                              //   deletable : true,
                              //   url: "http://alma.org.ar/images/logo-index.png",
                              //   thumbUrl:
                              //     "http://alma.org.ar/images/logo-index.png",
                              //   bubbleUrl:
                              //     "http://alma.org.ar/images/logo-index.png"
                              // }
                            ]
                          }
                        ]
                     // }
                    };

                    break;
                  }
                  case 10: {
                    //Product;
                    scope.vm.template = {
                      // id: 1,
                      // name: "Banco de Proyectos Template",
                      // templateHTML:
                      //   "app/catalog/products/templates/productview.template.html",
                      // templateJSON: {
                       
                        fields: [
                          {
                            name: "productDescription",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name: "productAvatar",
                            type: "image",
                            value: "",
                             required: false
                          },
                          {
                            name: "productReview",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name:'ratingScoreDetail',
                            type:'Score',
                            value:{
                              oneCount:0,
                              twoCount:0,
                              threeCount:0,
                              fourCount:0,
                              fiveCount:0
                            },
                            require:false
                          },
                          {
                            name: "Comments",
                            type: "Comments",
                            value: "",
                            required: true
                          },
                          {
                            name: "members",
                            type: "members",
                            value: [],
                            required: true
                          },
                        ],
                        tabs: [
                         
                          {
                            id: 1,
                            name: "IMÁGENES",
                            cssIcon: "fa fa-camera",
                            type: "images",
                            images: [
                              // {
                              //   id: 1,
                              //   desc: "descripcion",
                              //   deletable : true,
                              //   url:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   thumbUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   bubbleUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                              // },
                              // {
                              //   id: 2,
                              //   desc: "descripcion",
                              //   deletable : true,
                              //   url: "http://alma.org.ar/images/logo-index.png",
                              //   thumbUrl:
                              //     "http://alma.org.ar/images/logo-index.png",
                              //   bubbleUrl:
                              //     "http://alma.org.ar/images/logo-index.png"
                              // }
                            ]
                          },
                          {
                            id: 2,
                            name: "Sobre el Producto",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-send"
                          },
                        ]
                    //  }
                    };

                    
                    break;
                  }
                  case 11: {
                  //Course;
                  scope.vm.template = {
                    // id: 11,
                    // name: "Curso Template",
                    // templateHTML:
                    //   "app/lms/templates/course.template.html",
                    // templateJSON: {
                      headerSlide: [
                        {
                          id: 1,
                          image: "http://www.truwayacademy.com/servicepages/web-designing-banner-1.jpg",
                          innerHtml:
                          ""
                        },
                        // {
                        //   id: 2,
                        //   image: "Content/img/landing/header_two.jpg",
                        //   innerHtml:
                        //     "Metodologias,<br> herramientas <br>>apoyo al servicio del aprendizaje <br>  ."
                        // },
                        // {
                        //   id: 3,
                        //   image: "Content/img/landing/header_three.jpg",
                        //   innerHtml: "Texto Test"
                        // }
                      ],
                      fields: [
                        {
                          name: "courseAvatar",
                          type: "image",
                          value: "",
                          required: true
                        },
                        {
                          name:"requisites",
                          type:"html",
                          value: "",
                          require: false
                        },
                        {
                          name: "members",
                          type: "members",
                          value: [],
                          required: true
                        },
                       
                      ]
                   // }
                  };

                  break;
                }
                  default: {
                    toastr.error(
                      "Layout Builder",
                      "No se ha encontrado el modelo de datos."
                    );
                    break;
                  }
                }

                loadData();
              } else {
                toastr.error(
                  "Layout Builder",
                  "No se ha encontrado el modelo de datos."
                );
              }
            });
          }
          function loadDataTemplate() {
            //if entity have data created, load html source and JSON fields.
            scope.vm = scope.ngModel;

            // if (scope.ngModel && scope.ngModel.template) {
            //   scope.vm = scope.ngModel;
            //   // scope.templateJSON = scope.ngModel.template.templateJSON;
            //   // scope.templateHTML = scope.ngModel.template.templateHTML;
            // }
          }

          function loadTemplate(){
          
            if(!scope.vm.template){
              switch (scope.vm.entityTypeId) {
                case 8: {
                  //Project;
                  scope.vm.template=
                    {
                      
                        headerSlide: [{
                          id: 1,
                          image: "Content/img/landing/header_one.jpg",
                          innerHtml:
                            "Integramos la ciencia, la tecnología y la<br/>    innovación con los sectores productivos<br/> potenciando las capacidades<br/>  emprendedoras"
                        }],
                        fields: [
                          {
                            name: "projectDescription",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsImage",
                            type: "image",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsReview",
                            type: "innerHtml",
                            value: "Test Review",
                            required: true
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "Sobre la Convocatoria",
                            type:"html",
                            innerHtml: "",
                            cssIcon: "fa fa-gears"
                            // additionalPanel: {
                            //   image: null,
                            //   title: null,
                            //   subtitle: null,
                            //   description: null
                            // }
                          }
                        ]
                      }
                    ;

                  break;
                }
                case 9: {
                  //person;
                  
                  scope.vm.template =
                    {
                    
                        headerSlide: [],
                        fields: [
                          {
                            name: "review",
                            type: "innerHtml",
                            value: "",
                            required: false
                          },
                          {
                            name: "places",
                            type: "place",
                            value: [],
                            required: false
                          },
                          {
                            name: "avatarUrl",
                            type: "image",
                            value: "",
                            required: false
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "SOBRE",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-user-o"
                          },
                          {
                            id: 2,
                            name: "EXPERIENCIA / ANTECDENTES ",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-gears"
                          },
                          {
                            id: 3,
                            name: "SECTORES - INDUSTRIA ",
                            cssIcon: "fa fa-tags",
                            type: "tags",
                            tags: []
                          },
                          {
                            id: 4,
                            name: "UBICACIONES",
                            cssIcon: "fa fa-map-marker",
                            type: "map",
                            places: []
                          },
                          {
                            id: 5,
                            name: "IMÁGENES",
                            cssIcon: "fa fa-camera",
                            type: "images",
                            images: []
                          }
                        ]
                      };
                  break;
                }
                case 10: {
                  //Product;
                  scope.vm.template =
                 {
                  
                     
                      fields: [
                        {
                          name: "productDescription",
                          type: "innerHtml",
                          value: "",
                          required: true
                        },
                        {
                          name: "productAvatar",
                          type: "image",
                          value: "",
                           required: false
                        },
                        {
                          name: "productReview",
                          type: "innerHtml",
                          value: "",
                          required: true
                        },
                        {
                          name:'ratingScoreDetail',
                          type:'score',
                          value:{
                            oneCount:0,
                            twoCount:0,
                            threeCount:0,
                            fourCount:0,
                            fiveCount:0
                          },
                          require:false
                        },
                        {
                          name:'Comments',
                          type:'comment',
                          value:[],
                          require:false
                        },
                        {
                          name:'members',
                          type:'members',
                          value:[],
                          require:false
                        }
                      ],
                      tabs: [
                       
                        {
                          id: 1,
                          name: "IMÁGENES",
                          cssIcon: "fa fa-camera",
                          type: "images",
                          images: [
                            // {
                            //   id: 1,
                            //   deletable : true,
                            //   desc: "descripcion",
                            //   url:
                            //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                            //   thumbUrl:
                            //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                            //   bubbleUrl:
                            //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                            // },
                            // {
                            //   id: 2,
                            //   desc: "descripcion",
                            //   deletable : true,
                            //   url: "http://alma.org.ar/images/logo-index.png",
                            //   thumbUrl:
                            //     "http://alma.org.ar/images/logo-index.png",
                            //   bubbleUrl:
                            //     "http://alma.org.ar/images/logo-index.png"
                            // }
                          ]
                        },
                        {
                          id: 2,
                          name: "Sobre el Producto",
                          innerHtml: "",
                          type: "html",
                          cssIcon: "fa fa-send"
                        },
                      ]
                    }
                  ;
                  
                  
                  break;
                }
                case 11: {
                  //Course;
                scope.vm.template =
                    {
                     
                        headerSlide: [{
                          id: 1,
                          image: "http://www.truwayacademy.com/servicepages/web-designing-banner-1.jpg",
                          innerHtml:
                            ""
                        }],
                        fields: [
                          {
                            name: "courseAvatar",
                            type: "image",
                            value: "",
                            required: false
                          },
                          {
                            name:"requisites",
                            type:"html",
                            value: "",
                            require: false
                          },
                          {
                            name: "members",
                            type: "members",
                            value: [],
                            required: true
                          },
                        ]
                        
                      }
                    ;

                  break;
                }
                default: {
                  toastr.error(
                    "Layout Builder",
                    "No se ha encontrado el modelo de datos."
                  );
                  break;
                }
              

              //Mock Template for Project in Banco de Proyecto
            }
          } else {
            try{
            scope.vm.template = angular.fromJson(scope.vm.template);
            }
            catch{
              scope.vm.template = null;
              loadTemplate();
            }
          }
   
         
          loadData();
            
          }

          loadDataTemplate();
          loadTemplate();
          console.log( scope.vm.template );
         // loadTemplateMock();
        }
      };
    }
  ])



  //////////////////////
  //////////////////////

  .controller(
    "selectMemberTemplateController",
    ($scope, $uibModalInstance, projectRoles, Restangular, $timeout) => {
      $scope.persons = [];
  
      $scope.personSelected = null;
      $scope.personSelected = { tags: [] };
      $scope.selectedRol = null;
   
      var selectedRol = { id: 2, name: "member" };
  
      $scope.search = () => {
        $scope.$broadcast("refresh");
      };
  
      $scope.fieldByName = function(fieldName) {
         
        if(!$scope.personSelected.person.template){
          return null;
        }
        $scope.personSelected.person.template = angular.fromJson($scope.personSelected.person.template);
        var field = _.find($scope.personSelected.person.template.fields, {
          name: fieldName
        });
      
        return field;
      };
      $scope.arrayToString = function (string) {
        return string.join(", ");
      };
  
      $scope.$on("selectionPersonModalChanged", (event, args) => {
        $scope.personSelected = {
          person: args.person,
          tags: [] //personImageUri:args.personImageUri
        };
      });
  
      $scope.selectRol = function (rol) {
        selectedRol = selectedRol;
      };
  
      $scope.save = (person, description, rol, tags) => {
        $scope.personSelected = {
          person: person,
          //personImageUri: personUri,
          role: selectedRol,
          description: description,
          tags: tags
        };
  
        $uibModalInstance.close({ person: $scope.personSelected });
      };
      $scope.fieldByNameTemplate = (fieldName, template)=> {
        if(!template){
          return null;
        }
        console.log('llego 1');
        console.log(template);
        var field = _.find(template.fields, {
          name: fieldName
        });

        return field;
      };
    }
    )
  .directive("systemLayoutsBuilderView", [
    "$log",
    "$filter",
    "$rootScope",
    "$state",
    "Restangular",
    "toastr",
    "$compile",
    "$templateCache",
    "$templateRequest",
    "$sce",
    "$parse",
    "$timeout",
    "dialogs",
    "NgMap",
    (
      $log,
      $filter,
      $rootScope,
      $state,
      Restangular,
      toastr,
      $compile,
      $templateCache,
      $templateRequest,
      $sce,
      $parse,
      $timeout,
      dialogs,
      NgMap
    ) => {
      return {
        restrict: "AE",
        require: "?ngModel",

        scope: { ngModel: "=ngModel", enableEdit: "=", templateHtml: "@" },
        templateUrl: "app/system/layoutsbuilder/layoutview.html",
        link(scope: any, element) {
          scope.selectedTemplateId = null;
          scope.templates = [];
          scope.layoutFieldsJSON = [];
          scope.layoutTemplateHTML = null;
          scope.isViewMode = scope.enableEdit! || true;
          var isMockup = false;

          scope.places = [];
          scope.googleMapsUrl =
            "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY";
          scope.map = {
            center: [-34.61512668346219, -58.414306640625],
            zoom: 4
          };
          scope.googleMapsUrl =
            "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";

          var html = '<div id="loadhtml"></div>',
            compiledElement = $compile(html)(scope);

          scope.$on("changeTemplateViewMode", () => {
            scope.isViewMode = !scope.isViewMode;
          });
         
          scope.fieldByNameTemplate = (fieldName, template)=> {
         
            if(!template){
              return null;
            }
            var field = _.find(template.fields, {
              name: fieldName
            });
    
            return field;
          };
      //     scope.removeTeam = function(personTeam){
      //       console.log('remove person');
      //       console.log(personTeam);
      //       var fieldIndex = _.findIndex(scope.vm.template.fields, {
      //         name: 'members'
      //       });
      //       if(fieldIndex === -1){
      //         scope.vm.template.fields[fieldIndex].value
              
      //     }
      // }

           scope.openTeemSelector = () => {
            var sponsorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-team-selector.html",
              "selectMemberTemplateController",
              null,
              { size: "lg", animation: true }
            );

            sponsorModal.result.then(
              result => {
                var person = result.person;
                var fieldIndex = _.findIndex(scope.vm.template.fields, {
                  name: 'members'
                });
                if(fieldIndex === -1){
                  scope.vm.template.fields.push(
                    {
                      name:'members',
                      type:'members',
                      value:[],
                      require:false
                    },
                  );
                   fieldIndex = _.findIndex(scope.vm.template.fields, {
                    name: 'members'
                  });

                }
                scope.vm.template.fields[fieldIndex].value.push(result.person);
    
              },
              () => { }
            );
          };

          scope.removeSelectedPerson = selectedPerson => {
            console.log(selectedPerson);
            var fieldIndex = _.findIndex(scope.vm.template.fields, {
                  name: 'members'
                });
            // if (selectedPerson.id && selectedPerson.id > 0) {
            //   var fieldIndex = _.findIndex(scope.vm.template.fields, {
            //     name: 'members'
            //   });
            //   _.remove(scope.vm.fields[fieldIndex].value, { id: selectedPerson.id });
            // } else {
              for (var i = 0; i < scope.vm.template.fields[fieldIndex].value.length; i++) {
                if (
                  scope.vm.template.fields[fieldIndex].value[i].person.id === selectedPerson.id
                ) {
                  scope.vm.template.fields[fieldIndex].value.splice(i, 1);
                }
              }
           // }
          };

          scope.reRednerMap = function () {
            scope.showMap = true;
            google.maps.event.trigger(scope.map, "resize");
          };
    
          NgMap.getMap({ id: "placesMap" }).then(map => {
            google.maps.event.trigger(map, "resize");
            map.setZoom(8);
          });

          scope.openPlacesSelector = tab => {
            var placesModal = dialogs.create(
              "app/projects/projects/modal-places-selector.html",
              "selectPlacesController",
              null,
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            placesModal.result.then(
              result => {
                var place = result.place;
                tab.places.push(result.place);
     
              },
              () => {}
            );
          };

          scope.reRednerMap = function() {
            scope.showMap = true;
            google.maps.event.trigger(scope.map, "resize");
          };

          NgMap.getMap({ id: "placesMap" }).then(map => {
            google.maps.event.trigger(map, "resize");
            map.setZoom(4);
          });

          scope.currentPosition = [-34.61512668346219, -58.414306640625];

          scope.isHtmlTab = function(tab): boolean {
            return tab.type === "html";
          };

          scope.isTagTab = function(tab): boolean {
            return tab.type === "tags";
          };

          scope.isMapTab = function(tab): boolean {
            return tab.type === "map";
          };

          scope.isImageTab = function(tab): boolean {
            return tab.type === "images";
          };

   

          scope.removeTab = function(tab) {
            _.remove(scope.vm.template.tabs, { id: tab.id });
         //   _.remove(scope.vm.template.templateJSON.tabs, { id: tab.id });
          };

          scope.addTagByType = function(type) {
            var i = Math.max.apply(
              Math,
              scope.vm.template.tabs.map(function(o) {
                return o.id;
              })
              // scope.vm.template.templateJSON.tabs.map(function(o) {
              //   return o.id;
              // })
            );
            switch (type) {
              case "html":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  type: "html",
                  name: "Nueva Seccion",
                  cssIcon: "fa fa-paper-plane",
                  innerHtml: ""
                });
                break;
              case "tags":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  type: "tags",
                  name: "Nueva Seccion",
                  cssIcon: "fa fa-tags",
                  tags: []
                });
                break;
              case "map":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  cssIcon: "fa fa-map-marker",
                  name: "Nueva Seccion",
                  type: "map",
                  places: []
                });
                break;
              case "images":
                scope.vm.template.tabs.push({
                  id: i + 1,
                  cssIcon: "fa fa-camera",
                  name: "Nueva Seccion",
                  type: "images",
                  images: []
                });
                break;
            }
          };

          scope.getMapPosition = event => {
            scope.currentPosition = [event.latLng.lat(), event.latLng.lng()];
          };

          scope.htmlToPlaintext = function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, "") : "";
          };

          scope.onMapOverlayCompleted = function(e) {
            var type = e.type;
            var overlay = e.overlay;
            var data = {
              type: type,
              geo: null
            };

            switch (type) {
              case "polygon":
                data.geo = e.overlay.getPath().getArray();
                break;
              case "rectangle":
                console.info(
                  "@todo: get information from 'overlay' to data.geo"
                );
                break;
              case "circle":
                console.info(
                  "@todo: get information from 'overlay' to data.geo"
                );
                break;
            }
          };
          scope.fieldByName = function(fieldName) {
            var field = _.find(scope.vm.template.fields, {
              name: fieldName
            });

            return field;
          };
          scope.tabdByName = function(fieldName) {
            var tab = _.find(scope.vm.template.tabs, {
              name: fieldName
            });

            return tab;
          };

          scope.tabdById = function(id) {
            var tab = _.find(scope.vm.template.tabs, {
              id: id
            });

            return tab;
          };

          scope.editTemplate = function() {
            $timeout(() => {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/dialogeditmodal.html",
                "SystemLayoutsBuilderModalController",
                scope.vm,
                { size: "lg", animation: true }
              );

              editorModal.result
                .then(result => {
                  var model = result;
                  scope.ngModel = model;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
            });
          };

          scope.addTab = function() {
            var i = Math.max.apply(
              Math,
              scope.vm.template.tabs.map(function(o) {
                return o.id;
              })
            );

            var newTab = {
              id: i + 1,
              name: "Tab nuevo",
              innerHtml: ""
            };
            scope.vm.template.tabs.push(newTab);
            $timeout(function() {
            });
         
          };


          scope.editImage = function(prortyEdit) {
           // if (scope.vm.folderGuid) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-image-editor.html",
                "SystemLayoutBuilderImageEditorController",
                {
                  imageValue: prortyEdit.value,
                  folderGuid: 'c3a7f46ea97349a780720129150f19d4'//scope.vm.folderGuid
                },
                { size: "lg", animation: true, windowClass: "zindex" }
              );
              
              editorModal.result
                .then(result => {
                  var imageValue = result.imageValue;
                    console.log(imageValue);
                    console.log( prortyEdit.name);
                  _.find(
                    scope.vm.template.fields,
                    { name: prortyEdit.name }
                  ).value = imageValue;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
         //   }
          };
          scope.isFirstSlide = function(index) {
            return index === 0 ? true : false;
          };
          scope.getRandomId = function() {
            return Math.floor(Math.random() * 6 + 1);
          };
          scope.openImageSelector = function(tab) {
           // if (scope.vm.folderGuid) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-image-editor.html",
                "SystemLayoutBuilderImageEditorController",
                { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
                { size: "lg", animation: true, windowClass: "zindex" }
              );

              editorModal.result
                .then(result => {
                  var imageValue = result.imageValue;
                  var i =1;
                  if(tab.images.length > 0){
                   i = Math.max.apply(
                    Math,
                    tab.images.map(function(o) {
                      return o.id;
                    })
                  );
                }
                  tab.images.push({
                    id: i +1,
                    desc: '',
                    url: imageValue,
                    thumbUrl: imageValue,
                    bubbleUrl: imageValue,
                    deletable : true
                  });
                  //  _.find($scope.vm.template.templateJSON.fields, {
                  //   name: prortyEdit.name
                  // }).value = imageValue;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
           // }
          };
          scope.delete = function(img, cb){
            cb();
          }
          scope.editHtmlTab = function(tab, properyName) {
            var currentTab = scope.tabdById(tab.id);
            if (currentTab) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-html-editor.html",
                "SystemLayoutBuilderEditorHtmlController",
                currentTab[properyName],
                { size: "lg", animation: true, windowClass: "zindex" }
              );

              editorModal.result
                .then(result => {
                  var text = result.htmlDescription;
           

                  _.find(
                    scope.vm.template.tabs,
                    { id: currentTab.id }
                  )[properyName] = text;
                })
                .finally(function() {
                  editorModal.$destroy();
                });
            }
          };

          scope.editHtml = function(contentHtml, properyJSON) {
            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-html-editor.html",
              "SystemLayoutBuilderEditorHtmlController",
              contentHtml,
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;

                var field =  _.find(
                  scope.vm.template.fields,
                  { name: properyJSON }
                );
                if(field){
                  _.find(
                    scope.vm.template.fields,
                    { name: properyJSON }
                  ).value = text;
                }else{
                  scope.vm.template.fields.push( {
                    name:properyJSON,
                    type:"html",
                    value: text,
                    require: false
                  });
                }
              })
              .finally(function() {
                editorModal.$destroy();
              });
          };

          scope.htmlToPlaintext = function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, "") : "";
          };

          function loadData() {
            console.log(scope.templateHtml);
            $timeout(() => {
              var modelName = scope.vm.entityModelName;
              var model = $parse(modelName);
              model.assign(scope, scope.vm);
              var pageElement = angular.element(
                document.getElementById("page")
              );
              pageElement.empty();
              pageElement.append(compiledElement);

              var templateUrl = $sce.getTrustedResourceUrl(
               scope.templateHtml
              );

              $templateRequest(templateUrl).then(
                function(template) {
                  $compile(
                    $("#page")
                      .html(template)
                      .contents()
                  )(scope);
                },
                function() {}
              );
            });
          }


          scope.addSlide = function() {
            var i = Math.max.apply(
              Math,
              scope.vm.template.headerSlide.map(function(o) {
                return o.id;
              })
            );

            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-image-editor.html",
              "SystemLayoutBuilderImageEditorController",
              { imageValue: "", folderGuid: scope.vm.folderGuid },
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            editorModal.result
              .then(result => {
                i = i + 1;
                var imageValue = result.imageValue;
                scope.vm.template.headerSlide.push({
                  id: i,
                  image: imageValue,
                  innerHtml: "Texto Slide",
                  isActive: true
                });

                jQuery(".item.active").removeClass("active");
                $timeout(() => {
                  jQuery("#slide-" + i).addClass("active");
                });
              })
              .finally(function() {
                editorModal.$destroy();
              });
          };

          scope.openImageSelector = function(tab) {
           // if (scope.vm.folderGuid) {
              var editorModal = dialogs.create(
                "app/system/layoutsbuilder/modal-image-editor.html",
                "SystemLayoutBuilderImageEditorController",
                { imageValue: "", folderGuid: 'c3a7f46ea97349a780720129150f19d4' },
                { size: "lg", animation: true, windowClass: "zindex" }
              );

              editorModal.result
                .then(result => {
                  var i = 1;
                  if(tab.images.length > 0){
                   i = Math.max.apply(
                    Math,
                    tab.images.map(function(o) {
                      return o.id;
                    })
                  );
                }
                  var imageValue = result.imageValue;
                  tab.images.push({
                    id: i +1 ,
                    desc: '',
                    url: imageValue,
                    thumbUrl: imageValue,
                    bubbleUrl: imageValue,
                    deletable : true
                  });
                })
                .finally(function() {
                  editorModal.$destroy();
                });
          //  }
          };
          scope.delete = function(img, cb){
            cb();
          }
          scope.editSlideHtml = function(contentHtml, slide) {
            var editorModal = dialogs.create(
              "app/system/layoutsbuilder/modal-html-editor.html",
              "SystemLayoutBuilderEditorHtmlController",
              contentHtml,
              { size: "lg", animation: true, windowClass: "zindex" }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;

                slide.innerHtml = text;
              })
              .finally(function() {
                editorModal.$destroy();
              });
          };
          scope.isPromotorFilter = function(person): boolean {
            return person.role.id === 1;
          };

          scope.isTeamFilter = function(person): boolean {
            return person.role.id > 1;
          };

          scope.removeSlide = function(slide) {
           
            _.remove(scope.vm.template.headerSlide, {
              id: slide.id
            });
            scope.inSlider =null;
            scope.index =0;
           
          };

          scope.trustAsHtml = function(html) {
            return $sce.trustAsHtml(html);
          };

          function loadTemplateMock() {
            $timeout(() => {
              if (scope.ngModel) {
                scope.vm = scope.ngModel;

                switch (scope.ngModel.entityTypeId) {
                  case 8: {
                    //Project;
                    scope.vm.template = {
                      // id: 1,
                      // name: "Banco de Proyectos Template",
                      // templateHTML:
                      //   "app/projects/templates/bancoproyectos.template.html",
                      // templateJSON: {
                        headerSlide: [
                          {
                            id: 1,
                            image: "http://bancodeproyectos.azurewebsites.net/assets/images/drone.jpg",
                            innerHtml:
                              "Integramos la ciencia, la tecnología y la<br/>    innovación con los sectores productivos<br/> potenciando las capacidades<br/>  emprendedoras"
                          },
                        ],
                        fields: [
                          {
                            name: "projectDescription",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsImage",
                            type: "image",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsReview",
                            type: "innerHtml",
                            value: "",
                            required: true
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "Sobre el Proyecto",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-2x fa-paper-plane"
                            // additionalPanel: {
                            //   image: null,
                            //   title: null,
                            //   subtitle: null,
                            //   description: null
                            // }
                          }
                        ]
                      
                    };

                    scope.vm.teamPersons = [];
                    scope.projectTeam = [] = new Array<any>();

                    for (var i = 0; i < scope.vm.members.length; i++) {
                      var teamItem = scope.vm.members[i];

                      if (teamItem.role.id === 1) {
                        scope.projectSponsor = scope.vm.members[i];
                        //scope.projectSponsor = scope.project.members[i];
                        scope.projectSponsor.person.template  =angular.fromJson(teamItem.person.template); 
                        scope.projectSponsor.person.profilePictureUrl = scope.fieldByNameTemplate('avatarUrl',teamItem.person.template).value;
                      } else {
                        scope.projectTeam.push(scope.vm.members[i]);
                      }
                    }
                    break;
                  }
                  case 9: {
                    //person;
                    scope.vm.projects = [
                      {
                        "id": 56,
                        "createdBy": 2080,
                        "folderGuid": "c3a7f46ea97349a780720129150f19d4",
                        "messageThreadGuid": null,
                        "fundingTypeId": null,
                        "workflowInstance": {
                          "currentWorkflowActivity": {
                            "approvalRules": [],
                            "id": 506,
                            "workflowId": 96,
                            "name": "Idea proyecto",
                            "isStart": false,
                            "isFinal": false,
                            "listIndex": 1
                          },
                          "workflow": {
                            "id": 96,
                            "typeId": 5,
                            "tenantId": 11,
                            "code": "P",
                            "name": "Project",
                            "description": "Project"
                          },
                          "createdBy": {
                            "id": 47248,
                            "isOrganization": false,
                            "code": null,
                            "name": "Titarenko, Stanislav",
                            "gender": null,
                            "firstName": "Stanislav",
                            "lastName": "Titarenko",
                            "birthDate": null,
                            "deathDate": null,
                            "data1": null,
                            "isValid": null,
                            "webUrl": null,
                            "profilePictureUrl": null
                          },
                          "assignedRoles": [],
                          "canAssignToRoles": [],
                          "userPermissions": [],
                          "approvals": [],
                          "history": [
                            {
                              "type": 0,
                              "createDate": "2017-11-28T20:24:15.5530000",
                              "description": null,
                              "isTerminated": false,
                              "fromWorkflowActivityName": "Solicitud creada",
                              "toWorkflowActivityName": "Start",
                              "personName": "Titarenko, Stanislav",
                              "rol": null,
                              "user": null,
                              "isActive": false
                            }
                          ],
                          "historyGeneric": null,
                          "tags": [],
                          "id": 28591,
                          "guid": "f2621289c16d433da7a6c9032b89f244",
                          "workflowId": 96,
                          "currentWorkflowActivityId": 506,
                          "createdByUserId": 2080,
                          "createDate": "2017-11-28T20:24:15.5530000",
                          "progress": 0,
                          "isTerminated": false
                        },
                        "currency": null,
                        "number": "213123123331123",
                        "name": "Proyecto Sebas 1",
                        "description": "<p>Proyecto largo 123123123</p>\n",
                        "review": "<p>Proyecto sebas 123123123</p>\n",
                        "guid": "3994ea69f2d44090963b9db48ac03841",
                        "status": 0,
                        "createDate": "2017-11-28T23:24:15.5200000",
                        "startDate": "2017-11-28T06:00:00.0000000",
                        "endDate": null,
                        "approvalDate": null,
                        "investment": 1000000,
                        "contractAmount": 2000000,
                        "aditionalAmount": null,
                        "adjustedAmount": null,
                        "total": 0,
                        "tasks": [],
                        "places": [
                          {
                            "id": 1,
                            "place": {
                              "id": 3,
                              "parentId": 2,
                              "typeId": 2,
                              "name": "Buenos Aires",
                              "geo": null
                            }
                          }
                        ],
                        "categories": [
                          {
                            "id": 1,
                            "category": {
                              "id": 3,
                              "name": "Desarrollo y vivienda"
                            }
                          },
                          {
                            "id": 2,
                            "category": {
                              "id": 5,
                              "name": "Energía"
                            }
                          },
                          {
                            "id": 3,
                            "category": {
                              "id": 7,
                              "name": "Industria"
                            }
                          },
                          {
                            "id": 4,
                            "category": {
                              "id": 8,
                              "name": "Inversiones Sociales"
                            }
                          },
                          {
                            "id": 5,
                            "category": {
                              "id": 11,
                              "name": "Integración regional"
                            }
                          }
                        ],
                        "members": [
                          {
                            "id": 20,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 3022,
                                  "personId": 1,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "sv@nespencapital.com"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 12616,
                                  "personId": 1,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "1568375268"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]",
                                      "childCount": 0,
                                      "id": 5,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Ciudad Autónoma de Buenos Aires",
                                      "geo": null
                                    },
                                    "id": 34128,
                                    "placeId": 5,
                                    "street": "Cordoba",
                                    "streetNumber": "1261",
                                    "floor": "2",
                                    "appartment": "a",
                                    "zipCode": null,
                                    "name": "Cordoba 1261 2 a"
                                  },
                                  "id": 13410,
                                  "personId": 1,
                                  "addressId": 34128,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 1,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": 1002
                              },
                              "employerId": 1,
                              "id": 1,
                              "isOrganization": true,
                              "code": "00000000010",
                              "name": "Sebastian C. Vigliola",
                              "gender": 1,
                              "firstName": "Sebastian",
                              "lastName": "Vigliola",
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 1,
                              "tenantId": 11,
                              "name": "sponsor"
                            },
                            "tags": [],
                            "description": "<p>TEST</p>\n"
                          },
                          {
                            "id": 21,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 3565,
                                  "personId": 47248,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "stitarenko@rt-solutions.com.ar"
                                }
                              ],
                              "phones": [],
                              "addresses": [],
                              "references": {
                                "personId": 47248,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 47248,
                              "isOrganization": false,
                              "code": null,
                              "name": "Titarenko, Stanislav",
                              "gender": null,
                              "firstName": "Stanislav",
                              "lastName": "Titarenko",
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": null,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "Dev",
                              "Manager"
                            ],
                            "description": "<p>ST DESC</p>\n"
                          },
                          {
                            "id": 22,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 19,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "pcejas@gmail.com"
                                },
                                {
                                  "id": 10031,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "p@g.com"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 12681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "+5491158022424"
                                },
                                {
                                  "id": 19681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "234232"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 34188,
                                    "placeId": 6548,
                                    "street": "Bayo",
                                    "streetNumber": "255",
                                    "floor": "-",
                                    "appartment": "-",
                                    "zipCode": null,
                                    "name": "Bayo 255 - -"
                                  },
                                  "id": 13470,
                                  "personId": 35237,
                                  "addressId": 34188,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                },
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 41052,
                                    "placeId": 6548,
                                    "street": "Jazmines",
                                    "streetNumber": "1222",
                                    "floor": "1",
                                    "appartment": "a",
                                    "zipCode": "1669",
                                    "name": "Jazmines 1222 1 a"
                                  },
                                  "id": 20309,
                                  "personId": 35237,
                                  "addressId": 41052,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 35237,
                                "doctorId": 2003,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 35237,
                              "isOrganization": true,
                              "code": "20255680189",
                              "name": "Cejas, Pablo",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": "1976-11-24T03:00:00.0000000",
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "Dev",
                              "Manager"
                            ],
                            "description": "<p>PABLO DESC</p>\n"
                          },
                          {
                            "id": 23,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 9693,
                                  "personId": 53528,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "ventas@siicomputacion.com.ar"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 19317,
                                  "personId": 53528,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "02234916323"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":22950,\"Name\":\"General Pueyrredón\"}]",
                                      "childCount": 0,
                                      "id": 22950,
                                      "parentId": 3,
                                      "typeId": 4,
                                      "name": "General Pueyrredón",
                                      "geo": null
                                    },
                                    "id": 40705,
                                    "placeId": 22950,
                                    "street": "Avellaneda",
                                    "streetNumber": "2801",
                                    "floor": null,
                                    "appartment": null,
                                    "zipCode": null,
                                    "name": "Avellaneda 2801 "
                                  },
                                  "id": 19962,
                                  "personId": 53528,
                                  "addressId": 40705,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 53528,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 53528,
                              "isOrganization": false,
                              "code": null,
                              "name": "Romero, Juan Gabriel",
                              "gender": null,
                              "firstName": "Juan Gabriel",
                              "lastName": "Romero",
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "Prueba"
                            ],
                            "description": "<p>ROMEO DESC</p>\n"
                          },
                          {
                            "id": 24,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [],
                              "phones": [],
                              "addresses": [],
                              "references": {
                                "personId": 13,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 13,
                              "isOrganization": true,
                              "code": null,
                              "name": "Ostel Central",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": null,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [
                              "tteg"
                            ],
                            "description": "<p>TEST TEST</p>\n"
                          }
                        ],
                        "roles": null
                      },
                      {
                        "id": 50,
                        "createdBy": 2080,
                        "folderGuid": "3a342c5a8f8d4dcc89df642c90182e98",
                        "messageThreadGuid": null,
                        "fundingTypeId": null,
                        "workflowInstance": {
                          "currentWorkflowActivity": {
                            "approvalRules": [],
                            "id": 506,
                            "workflowId": 96,
                            "name": "Idea proyecto",
                            "isStart": false,
                            "isFinal": false,
                            "listIndex": 1
                          },
                          "workflow": {
                            "id": 96,
                            "typeId": 5,
                            "tenantId": 11,
                            "code": "P",
                            "name": "Project",
                            "description": "Project"
                          },
                          "createdBy": {
                            "id": 47248,
                            "isOrganization": false,
                            "code": null,
                            "name": "Titarenko, Stanislav",
                            "gender": null,
                            "firstName": "Stanislav",
                            "lastName": "Titarenko",
                            "birthDate": null,
                            "deathDate": null,
                            "data1": null,
                            "isValid": null,
                            "webUrl": null,
                            "profilePictureUrl": null
                          },
                          "assignedRoles": [],
                          "canAssignToRoles": [],
                          "userPermissions": [],
                          "approvals": [],
                          "history": [
                            {
                              "type": 0,
                              "createDate": "2017-11-24T00:47:34.4570000",
                              "description": null,
                              "isTerminated": false,
                              "fromWorkflowActivityName": "Solicitud creada",
                              "toWorkflowActivityName": "Start",
                              "personName": "Titarenko, Stanislav",
                              "rol": null,
                              "user": null,
                              "isActive": false
                            }
                          ],
                          "historyGeneric": null,
                          "tags": [],
                          "id": 27649,
                          "guid": "259af9321cf34b6986faadb898b781d9",
                          "workflowId": 96,
                          "currentWorkflowActivityId": 506,
                          "createdByUserId": 2080,
                          "createDate": "2017-11-24T00:47:34.4570000",
                          "progress": 0,
                          "isTerminated": false
                        },
                        "currency": null,
                        "number": "T03",
                        "name": "Laboratorio Quimico Ambiental",
                        "description": "<p>Test Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description&nbsp;Test DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest DescriptionTest Description</p>\n",
                        "review": "<p>El laboratorio quimico ambiental de la Provincia de Buenos Aires pretende constituirse en el soporte analitico para las determinaciones de calidad en las diversas muestras sobre la tematica del agua y el medioambiente dando apoyo a los diversos organismos de la provincia como la Autoridad del Agua, el Organismo Provincial para el Desarrollo Sostenible, entre otros.</p>\n",
                        "guid": "e902423ce273487a85cab186488fd602",
                        "status": 0,
                        "createDate": "2017-11-24T00:47:34.4030000",
                        "startDate": "2017-12-12T03:00:00.0000000",
                        "endDate": null,
                        "approvalDate": null,
                        "investment": null,
                        "contractAmount": 20000000,
                        "aditionalAmount": null,
                        "adjustedAmount": null,
                        "total": null,
                        "tasks": [],
                        "places": [],
                        "categories": [
                          {
                            "id": 6,
                            "category": {
                              "id": 3,
                              "name": "Desarrollo y vivienda"
                            }
                          },
                          {
                            "id": 7,
                            "category": {
                              "id": 11,
                              "name": "Integración regional"
                            }
                          },
                          {
                            "id": 8,
                            "category": {
                              "id": 15,
                              "name": "Comercio"
                            }
                          }
                        ],
                        "members": [],
                        "roles": null
                      },
                      {
                        "id": 63,
                        "createdBy": 1,
                        "folderGuid": "486eb963af37450eaac9f66d2f693689",
                        "messageThreadGuid": null,
                        "fundingTypeId": null,
                        "workflowInstance": {
                          "currentWorkflowActivity": {
                            "approvalRules": [],
                            "id": 2341,
                            "workflowId": 1245,
                            "name": "Idea proyecto",
                            "isStart": false,
                            "isFinal": false,
                            "listIndex": 1
                          },
                          "workflow": {
                            "id": 1245,
                            "typeId": 5,
                            "tenantId": 1030,
                            "code": "P",
                            "name": "Project",
                            "description": "Project"
                          },
                          "createdBy": {
                            "id": 1,
                            "isOrganization": true,
                            "code": "00000000010",
                            "name": "Sebastian C. Vigliola",
                            "gender": 1,
                            "firstName": "Sebastian",
                            "lastName": "Vigliola",
                            "birthDate": null,
                            "deathDate": null,
                            "data1": null,
                            "isValid": true,
                            "webUrl": null,
                            "profilePictureUrl": null
                          },
                          "assignedRoles": [],
                          "canAssignToRoles": [],
                          "userPermissions": [],
                          "approvals": [],
                          "history": [
                            {
                              "type": 0,
                              "createDate": "2018-01-23T18:04:03.3970000",
                              "description": null,
                              "isTerminated": false,
                              "fromWorkflowActivityName": "Solicitud creada",
                              "toWorkflowActivityName": "Start",
                              "personName": "Sebastian C. Vigliola",
                              "rol": null,
                              "user": null,
                              "isActive": false
                            }
                          ],
                          "historyGeneric": null,
                          "tags": [],
                          "id": 28598,
                          "guid": "a6e7a076b67f4fa4bda7cdcb8a80fa6a",
                          "workflowId": 1245,
                          "currentWorkflowActivityId": 2341,
                          "createdByUserId": 1,
                          "createDate": "2018-01-23T18:04:03.3970000",
                          "progress": 0,
                          "isTerminated": false
                        },
                        "currency": null,
                        "number": "01",
                        "name": "Reingenieria Canales de Distribucion",
                        "description": "<p>El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.</p>\n",
                        "review": "<p>El proyecto busca redefinir los canales de distribucion de la empresa incorporando disrupcion al proceso.</p>\n",
                        "guid": "218cc0e40da749af82207a5144184a09",
                        "status": 0,
                        "createDate": "2018-01-23T18:04:03.3600000",
                        "startDate": null,
                        "endDate": null,
                        "approvalDate": null,
                        "investment": null,
                        "contractAmount": null,
                        "aditionalAmount": null,
                        "adjustedAmount": null,
                        "total": null,
                        "tasks": [],
                        "places": [],
                        "categories": [],
                        "members": [
                          {
                            "id": 41,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [],
                              "phones": [],
                              "addresses": [],
                              "references": {
                                "personId": 55306,
                                "doctorId": null,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 55306,
                              "isOrganization": true,
                              "code": null,
                              "name": "Coca Cola SA",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": null,
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 1,
                              "tenantId": 11,
                              "name": "sponsor"
                            },
                            "tags": [],
                            "description": "<p>Coca Cola SA es una compa&ntilde;ia que bla bla bla&nbsp; bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla</p>\n"
                          },
                          {
                            "id": 42,
                            "person": {
                              "documents": [],
                              "fields": [],
                              "emails": [
                                {
                                  "id": 19,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "pcejas@gmail.com"
                                },
                                {
                                  "id": 10031,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "address": "p@g.com"
                                }
                              ],
                              "phones": [
                                {
                                  "id": 12681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "+5491158022424"
                                },
                                {
                                  "id": 19681,
                                  "personId": 35237,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false,
                                  "number": "234232"
                                }
                              ],
                              "addresses": [
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 34188,
                                    "placeId": 6548,
                                    "street": "Bayo",
                                    "streetNumber": "255",
                                    "floor": "-",
                                    "appartment": "-",
                                    "zipCode": null,
                                    "name": "Bayo 255 - -"
                                  },
                                  "id": 13470,
                                  "personId": 35237,
                                  "addressId": 34188,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                },
                                {
                                  "address": {
                                    "place": {
                                      "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":6548,\"Name\":\"Del Viso\"}]",
                                      "childCount": 0,
                                      "id": 6548,
                                      "parentId": 3,
                                      "typeId": 3,
                                      "name": "Del Viso",
                                      "geo": null
                                    },
                                    "id": 41052,
                                    "placeId": 6548,
                                    "street": "Jazmines",
                                    "streetNumber": "1222",
                                    "floor": "1",
                                    "appartment": "a",
                                    "zipCode": "1669",
                                    "name": "Jazmines 1222 1 a"
                                  },
                                  "id": 20309,
                                  "personId": 35237,
                                  "addressId": 41052,
                                  "typeId": 2,
                                  "typeName": null,
                                  "isDefault": false
                                }
                              ],
                              "references": {
                                "personId": 35237,
                                "doctorId": 2003,
                                "healthServiceId": null,
                                "patientId": null
                              },
                              "employerId": 0,
                              "id": 35237,
                              "isOrganization": true,
                              "code": "20255680189",
                              "name": "Cejas, Pablo",
                              "gender": null,
                              "firstName": null,
                              "lastName": null,
                              "birthDate": "1976-11-24T03:00:00.0000000",
                              "deathDate": null,
                              "data1": null,
                              "isValid": true,
                              "webUrl": null,
                              "profilePictureUrl": null
                            },
                            "role": {
                              "id": 2,
                              "tenantId": 11,
                              "name": "teammember"
                            },
                            "tags": [],
                            "description": "<p>aaaasddf</p>\n"
                          }
                        ],
                        "roles": null
                      }
                    ];
                    scope.vm.template = {
                      // id: 1,
                      // name: "Person Card",
                      // templateHTML:
                      //   "app/system/persons/templates/personprofile.template.html",
                      // templateJSON: {
                        headerSlide: [],
                        fields: [
                          {
                            name: "review",
                            type: "innerHtml",
                            value:
                              "Asociación integrada por la Municipalidad de Bahía Blanca, la Universidad Nacional del Sur, el Ente Zona Franca Bahía Blanca y 20 empresas de tecnología",
                            required: false
                          },
                          {
                            name: "avatarUrl",
                            type: "image",
                            value:
                              "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB.png",
                            required: false
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "SOBRE ",
                            innerHtml:
                              "El Polo Tecnológico del Sur es una asociación civil sin fines de lucro integrada por la Municipalidad de Bahía Blanca, la Universidad Nacional del Sur, el Ente Zona Franca Bahía Blanca Coronel Rosales, la Asociación de Empresas del Polo Tecnológico del Sur y 20 empresas de tecnología. Tiene como objetivo impulsar el desarrollo y estimular el crecimiento regional, dinamizando y articulando la oferta y demanda tecnológica a través de la coordinación de acciones públicas, privadas, académicas y científicas para lograr la inserción de empresas locales y regionales en la economía nacional e internacional. " +
                              ' <p style="margin-left:0px; margin-right:0px"> <iframe frameborder="0" height="281" src="https://www.youtube.com/embed/n0zC6rK5i3s?feature=oembed" style="box-sizing: border-box;" width="500"></iframe>  </p>',
                            type: "html",
                            cssIcon: "fa fa-user-o"
                          },
                          {
                            id: 2,
                            name: "EXPERIENCIA / ANTECDENTES ",
                            innerHtml:
                              ' <div class="col-sm-6 col-xs-12" style="-webkit-text-stroke-width:0px; background:#005d85; box-sizing:border-box; color:#333333; float:left; font-family:&quot;Roboto Slab&quot;,serif; font-size:14px; font-style:normal; font-variant-caps:normal; font-variant-ligatures:normal; font-weight:normal; letter-spacing:normal; max-height:220px; min-height:150px; orphans:2; padding:7.2em 1.35em; position:relative; text-align:start; text-decoration-color:initial; text-decoration-style:initial; text-indent:0px; text-transform:none; white-space:normal; widows:2; width:570px; word-spacing:0px"><img alt="Institución" class="img-responsive" src="http://sintinta.com.ar/wp-content/uploads/2013/07/zona-franca-bahia-rosales-logo.jpg" style="border:0px; box-sizing:border-box; display:block; height:auto; left:285px; max-width:100%; position:absolute; top:100.8px; transform:translate(-50%, -50%); vertical-align:middle" /></div>   <div class="col-sm-6 col-xs-12" style="-webkit-text-stroke-width:0px; background:#005d85; box-sizing:border-box; color:#333333; float:left; font-family:&quot;Roboto Slab&quot;,serif; font-size:14px; font-style:normal; font-variant-caps:normal; font-variant-ligatures:normal; font-weight:normal; letter-spacing:normal; max-height:220px; min-height:150px; orphans:2; padding:7.2em 1.35em; position:relative; text-align:start; text-decoration-color:initial; text-decoration-style:initial; text-indent:0px; text-transform:none; white-space:normal; widows:2; width:570px; word-spacing:0px"><img alt="Institución" class="img-responsive" src="http://ptbb.org.ar/wp-content/uploads/2015/02/zona-franca-bahia-rosales-logo.png"  style="border:0px; box-sizing:border-box; display:block; height:auto; left:285px; max-width:100%; position:absolute; top:100.8px; transform:translate(-50%, -50%); vertical-align:middle"  /></div>',
                            type: "html",
                            cssIcon: "fa fa-gears"
                          },
                          {
                            id: 3,
                            name: "SECTORES - INDUSTRIA ",
                            cssIcon: "fa fa-tags",
                            type: "tags",
                            tags: ["Capacitación", "Tecnología", "Industria"]
                          },
                          {
                            id: 4,
                            name: "UBICACIONES",
                            cssIcon: "fa fa-map-marker",
                            type: "map",
                            places: []
                          },
                          {
                            id: 5,
                            name: "IMÁGENES",
                            cssIcon: "fa fa-camera",
                            type: "images",
                            images: [
                              // {
                              //   id: 1,
                              //   deletable : true,
                              //   desc: "descripcion",
                              //   url:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   thumbUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   bubbleUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                              // },
                              // {
                              //   id: 2,
                              //   desc: "descripcion",
                              //   deletable : true,
                              //   url: "http://alma.org.ar/images/logo-index.png",
                              //   thumbUrl:
                              //     "http://alma.org.ar/images/logo-index.png",
                              //   bubbleUrl:
                              //     "http://alma.org.ar/images/logo-index.png"
                              // }
                            ]
                          }
                        ]
                     // }
                    };

                    break;
                  }
                  case 10: {
                    //Product;
                    scope.vm.template = {
                      // id: 1,
                      // name: "Banco de Proyectos Template",
                      // templateHTML:
                      //   "app/catalog/products/templates/productview.template.html",
                      // templateJSON: {
                       
                        fields: [
                          {
                            name: "productDescription",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name: "productAvatar",
                            type: "image",
                            value: "",
                             required: false
                          },
                          {
                            name: "productReview",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name:'ratingScoreDetail',
                            type:'Score',
                            value:{
                              oneCount:0,
                              twoCount:0,
                              threeCount:0,
                              fourCount:0,
                              fiveCount:0
                            },
                            require:false
                          },
                          {
                            name: "Comments",
                            type: "Comments",
                            value: "",
                            required: true
                          },
                          {
                            name: "members",
                            type: "members",
                            value: [],
                            required: true
                          },
                        ],
                        tabs: [
                         
                          {
                            id: 1,
                            name: "IMÁGENES",
                            cssIcon: "fa fa-camera",
                            type: "images",
                            images: [
                              // {
                              //   id: 1,
                              //   desc: "descripcion",
                              //   deletable : true,
                              //   url:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   thumbUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                              //   bubbleUrl:
                              //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                              // },
                              // {
                              //   id: 2,
                              //   desc: "descripcion",
                              //   deletable : true,
                              //   url: "http://alma.org.ar/images/logo-index.png",
                              //   thumbUrl:
                              //     "http://alma.org.ar/images/logo-index.png",
                              //   bubbleUrl:
                              //     "http://alma.org.ar/images/logo-index.png"
                              // }
                            ]
                          },
                          {
                            id: 2,
                            name: "Sobre el Producto",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-send"
                          },
                        ]
                    //  }
                    };

                    
                    break;
                  }
                  case 11: {
                  //Course;
                  scope.vm.template = {
                    // id: 11,
                    // name: "Curso Template",
                    // templateHTML:
                    //   "app/lms/templates/course.template.html",
                    // templateJSON: {
                      headerSlide: [
                        {
                          id: 1,
                          image: "http://www.truwayacademy.com/servicepages/web-designing-banner-1.jpg",
                          innerHtml:
                          ""
                        },
                        // {
                        //   id: 2,
                        //   image: "Content/img/landing/header_two.jpg",
                        //   innerHtml:
                        //     "Metodologias,<br> herramientas <br>>apoyo al servicio del aprendizaje <br>  ."
                        // },
                        // {
                        //   id: 3,
                        //   image: "Content/img/landing/header_three.jpg",
                        //   innerHtml: "Texto Test"
                        // }
                      ],
                      fields: [
                        {
                          name: "courseAvatar",
                          type: "image",
                          value: "",
                          required: true
                        },
                        {
                          name:"requisites",
                          type:"html",
                          value: "",
                          require: false
                        },
                        {
                          name: "members",
                          type: "members",
                          value: [],
                          required: true
                        },
                       
                      ]
                   // }
                  };

                  break;
                }
                  default: {
                    toastr.error(
                      "Layout Builder",
                      "No se ha encontrado el modelo de datos."
                    );
                    break;
                  }
                }

                loadData();
              } else {
                toastr.error(
                  "Layout Builder",
                  "No se ha encontrado el modelo de datos."
                );
              }
            });
          }
          function loadDataTemplate() {
            //if entity have data created, load html source and JSON fields.
            scope.vm = scope.ngModel;

            // if (scope.ngModel && scope.ngModel.template) {
            //   scope.vm = scope.ngModel;
            //   // scope.templateJSON = scope.ngModel.template.templateJSON;
            //   // scope.templateHTML = scope.ngModel.template.templateHTML;
            // }
          }

          function loadTemplate(){
          
            if(!scope.vm.template){
              switch (scope.vm.entityTypeId) {
                case 8: {
                  //Project;
                  scope.vm.template=
                    {
                      
                        headerSlide: [{
                          id: 1,
                          image: "Content/img/landing/header_one.jpg",
                          innerHtml:
                            "Integramos la ciencia, la tecnología y la<br/>    innovación con los sectores productivos<br/> potenciando las capacidades<br/>  emprendedoras"
                        }],
                        fields: [
                          {
                            name: "projectDescription",
                            type: "innerHtml",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsImage",
                            type: "image",
                            value: "",
                            required: true
                          },
                          {
                            name: "projectGoalsReview",
                            type: "innerHtml",
                            value: "Test Review",
                            required: true
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "Sobre la Convocatoria",
                            type:"html",
                            innerHtml: "",
                            cssIcon: "fa fa-gears"
                            // additionalPanel: {
                            //   image: null,
                            //   title: null,
                            //   subtitle: null,
                            //   description: null
                            // }
                          }
                        ]
                      }
                    ;

                  break;
                }
                case 9: {
                  //person;
                  
                  scope.vm.template =
                    {
                    
                        headerSlide: [],
                        fields: [
                          {
                            name: "review",
                            type: "innerHtml",
                            value: "",
                            required: false
                          },
                          {
                            name: "places",
                            type: "place",
                            value: [],
                            required: false
                          },
                          {
                            name: "avatarUrl",
                            type: "image",
                            value: "",
                            required: false
                          }
                        ],
                        tabs: [
                          {
                            id: 1,
                            name: "SOBRE",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-user-o"
                          },
                          {
                            id: 2,
                            name: "EXPERIENCIA / ANTECDENTES ",
                            innerHtml: "",
                            type: "html",
                            cssIcon: "fa fa-gears"
                          },
                          {
                            id: 3,
                            name: "SECTORES - INDUSTRIA ",
                            cssIcon: "fa fa-tags",
                            type: "tags",
                            tags: []
                          },
                          {
                            id: 4,
                            name: "UBICACIONES",
                            cssIcon: "fa fa-map-marker",
                            type: "map",
                            places: []
                          },
                          {
                            id: 5,
                            name: "IMÁGENES",
                            cssIcon: "fa fa-camera",
                            type: "images",
                            images: []
                          }
                        ]
                      };
                  break;
                }
                case 10: {
                  //Product;
                  scope.vm.template =
                 {
                  
                     
                      fields: [
                        {
                          name: "productDescription",
                          type: "innerHtml",
                          value: "",
                          required: true
                        },
                        {
                          name: "productAvatar",
                          type: "image",
                          value: "",
                           required: false
                        },
                        {
                          name: "productReview",
                          type: "innerHtml",
                          value: "",
                          required: true
                        },
                        {
                          name:'ratingScoreDetail',
                          type:'score',
                          value:{
                            oneCount:0,
                            twoCount:0,
                            threeCount:0,
                            fourCount:0,
                            fiveCount:0
                          },
                          require:false
                        },
                        {
                          name:'Comments',
                          type:'comment',
                          value:[],
                          require:false
                        },
                        {
                          name:'members',
                          type:'members',
                          value:[],
                          require:false
                        }
                      ],
                      tabs: [
                       
                        {
                          id: 1,
                          name: "IMÁGENES",
                          cssIcon: "fa fa-camera",
                          type: "images",
                          images: [
                            // {
                            //   id: 1,
                            //   deletable : true,
                            //   desc: "descripcion",
                            //   url:
                            //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                            //   thumbUrl:
                            //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png",
                            //   bubbleUrl:
                            //     "http://bancodeproyectos.azurewebsites.net/assets/images/logoPTBB2.png"
                            // },
                            // {
                            //   id: 2,
                            //   desc: "descripcion",
                            //   deletable : true,
                            //   url: "http://alma.org.ar/images/logo-index.png",
                            //   thumbUrl:
                            //     "http://alma.org.ar/images/logo-index.png",
                            //   bubbleUrl:
                            //     "http://alma.org.ar/images/logo-index.png"
                            // }
                          ]
                        },
                        {
                          id: 2,
                          name: "Sobre el Producto",
                          innerHtml: "",
                          type: "html",
                          cssIcon: "fa fa-send"
                        },
                      ]
                    }
                  ;
                  
                  
                  break;
                }
                case 11: {
                  //Course;
                scope.vm.template =
                    {
                     
                        headerSlide: [{
                          id: 1,
                          image: "http://www.truwayacademy.com/servicepages/web-designing-banner-1.jpg",
                          innerHtml:
                            ""
                        }],
                        fields: [
                          {
                            name: "courseAvatar",
                            type: "image",
                            value: "",
                            required: false
                          },
                          {
                            name:"requisites",
                            type:"html",
                            value: "",
                            require: false
                          },
                          {
                            name: "members",
                            type: "members",
                            value: [],
                            required: true
                          },
                        ]
                        
                      }
                    ;

                  break;
                }
                default: {
                  toastr.error(
                    "Layout Builder",
                    "No se ha encontrado el modelo de datos."
                  );
                  break;
                }
              

              //Mock Template for Project in Banco de Proyecto
            }
          } else {
            try{
            scope.vm.template = angular.fromJson(scope.vm.template);
            }
            catch{
              scope.vm.template = null;
              loadTemplate();
            }
          }
   
         
          loadData();
            
          }

          loadDataTemplate();
          loadTemplate();
          console.log( scope.vm.template );
         // loadTemplateMock();
        }
      };
    }
  ])




  
  .directive("uibTabButton", function() {
    return {
      restrict: "EA",
      scope: {
        handler: "&",
        text: "@"
      },
      template:
        '<li class="uib-tab nav-item">' +
        '<a href="javascript:;" ng-click="handler()" class="nav-link" ng-bind="text"></a>' +
        "</li>",
      replace: true
    };
  });
