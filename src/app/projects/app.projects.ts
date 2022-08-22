angular
  .module("app.projects", ["app.projects.roles", "app.system"])
  .config([
    "$stateProvider",
    $stateProvider => {
      $stateProvider
        .state("app.projects", {
          url: "/projects",
          abstract: true,
          template: "<ui-view/>",
          ncyBreadcrumb: {
            skip: false,
            parent: "app.dashboard",
            label: "projects"
          }
        })
        .state("app.projects.projects", {
          url: "/projects",
          controller: "ProjectsController",
          templateUrl: "app/projects/projects/list.html",
          resolve: loadSequence("jqueryui", "jqGrid", "ngMap"),
          ncyBreadcrumb: {
            label: "projects"
          }
        })
        .state("app.projects.newproject", {
          url: "/projects/new",
          controller: "ProjectController",
          templateUrl: "app/projects/projects/form.html",
          resolve: loadSequence(
            "ui.tree",
            "jqGrid",
            "jqueryui",
            "icheck",
            "angularFileUpload",
            "ui-mask",
            "toastr",
            "ngCkeditor",
            "ngMap"
          ),
          ncyBreadcrumb: {
            parent: "app.projects.projects",
            label: "project.new"
          }
        })
        .state("app.projects.editproject", {
          url: "/projects/{projectId}/edit",
          controller: "ProjectController",
          templateUrl: "app/projects/projects/form.html",
          resolve: loadSequence(
            "imageviewer",
            "infinite-scroll",
            "ui.tree",
            "jqueryui",
            "icheck",
            "imageviewer",

            "jqGrid",
            "angularFileUpload",
            "ui-mask",
            "toastr",
            "ngCkeditor",
            "ngMap"
          ),
          ncyBreadcrumb: {
            parent: "app.projects.projects",
            label: "project"
          }
        })
        .state("app.projects.project", {
          url: "/projects/{projectId}",
          controller: "ProjectController",
          templateUrl: "app/projects/projects/form.html",
          resolve: loadSequence(
            "ui.tree",
            "icheck",
            "jqueryui",
            "angularFileUpload",
            "ui-mask",

            "imageviewer",
            "jqGrid",
            "toastr",
            "ngCkeditor",
            "ngMap"
          ),
          ncyBreadcrumb: {
            parent: "app.projects.projects",
            label: "project"
          }
        })
        .state("app.projects.projectview", {
          url: "/projects/{projectId}/view",
          controller: "ProjectViewController",
          templateUrl: "app/projects/projects/view.html",
          resolve: loadSequence(
            "ui.tree",
            "icheck",
            "jqueryui",
            "angularFileUpload",
            "ui-mask",
            "imageviewer",
            "jqGrid",
            "toastr",
            "ngCkeditor",
            "ngMap"
          ),
          ncyBreadcrumb: {
            parent: "app.projects.projects",
            label: "project"
          }
        })
        .state("app.projects.projectapprovals", {
          url: "/projectapprovals",
          controller: "ProjectApprovalsController",
          templateUrl: "app/projects/projectapprovals/list.html",
          resolve: loadSequence("jqueryui", "jqGrid", "toastr"),
          ncyBreadcrumb: {
            label: "projectapprovals"
          }
        })
        .state("app.projects.checkingaccount", {
          url: "/projects/{projectId}/checkingaccount/view/{costcenterId}",
          controller: "ProjectsCheckingaccountController",
          templateUrl: "app/projects/checkingaccounts/checkingaccount.html",
          resolve: loadSequence("jqueryui", "jqGrid"),
          ncyBreadcrumb: {
            parent: "app.projects.projects",
            label: "project.checkingaccount"
          }
        })
        .state("app.projects.projectapproval", {
          url: "/projectapprovals/{projectId}",
          controller: "ProjectApprovalController",
          templateUrl: "app/projects/projectapprovals/edit.html",
          resolve: loadSequence(
            "ngCkeditor",
            "ui-mask",
            "icheck",
            "angularFileUpload",
            "toastr"
          ),
          ncyBreadcrumb: {
            parent: "app.projects.projectapprovals",
            label: "projectapproval"
          }
        });
    }
  ])
  .constant("projectStatus", [
    { id: 0, name: "Propuesto" },
    { id: 1, name: "En ejecución" },
    { id: 2, name: "Finalizado" },
    { id: 3, name: "Abandonado" }
  ])
  .constant("projectRoles", [
    { id: 1, name: "Promotor" },
    { id: 2, name: "Member" }
  ])
  .constant("imagesTypes", [
    { id: 1, name: "Principal" },
    { id: 2, name: "Banner" }
  ])
  .controller("ProjectsCheckingaccountController", [
    "$scope",
    "$translate",
    "$state",
    "$stateParams",
    "Restangular",
    "$log",
    ($scope, $translate, $state, $stateParams, Restangular, $log) => {
      var projectId = $stateParams.projectId;
      var costcenterId = $stateParams.costcenterId;
      $scope.checkingaccount = null;

      $scope.accountId = 19; //hardcode

      function load() {
        if ($scope.accountId) {
          Restangular.one("businesspartners")
            .one("account", $scope.accountId)
            .get()
            .then(result => {
              $scope.account = result;
            });
        }
      }
      $scope.$on("$stateChangeSuccess", () => {
        $("html, body").animate({ scrollTop: 0 }, 200);
      });
      load();
    }
  ])
  .controller("ProjectViewController", [
    "$log",
    "$scope",
    "$filter",
    "$translate",
    "$state",
    "$stateParams",
    "Restangular",
    "FileUploader",
    "projectStatus",
    "projectRoles",
    "imagesTypes",
    "NgMap",
    "dialogs",
    "toastr",
    (
      $log,
      $scope,
      $filter,
      $translate,
      $state,
      $stateParams,
      Restangular,
      FileUploader,
      projectStatus,
      projectRoles,
      imagesTypes,
      NgMap,
      dialogs,
      toastr
    ) => {
      var projectId = $stateParams.projectId;
      //$scope.project = [];
      // $scope.project = $stateParams.project;
      $scope.projectId = projectId;
      // $scope.project = [];
      $scope.googleMapsUrl =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY";
      $scope.projectMessages = [];
      $scope.places = [];
      $scope.googleMapsUrl =
        "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";
      $scope.options = {};
      $scope.currencies = [
        { id: 0, name: "Pesos argentinos", symbol: "AR$" },
        { id: 1, name: "Dólar estadounidense", symbol: "USD" }
      ];
      $scope.map = { center: [-34.61512668346219, -58.414306640625], zoom: 4 };
      $scope.showMap = false;

      $scope.isEnableEditTemplate = false;

      $scope.editLayout = function () {
        $scope.isEnableEditTemplate = !$scope.isEnableEditTemplate;
        $scope.$broadcast("changeTemplateViewMode");
      };

      $scope.saveLayout = function () {
        //TODO SAVE JSON TEMPLATE
        $scope.isEnableEditTemplate = false;
        $scope.$broadcast("changeTemplateViewMode");
      };

      $scope.edit = () => {
        $state.go("app.projects.editproject", { projectId: $scope.project.id });
      };

      $scope.fieldByName = function (fieldName) {
        if ($scope.project.template === undefined) return null;

        var field = _.find($scope.project.template.templateJSON.fields, {
          name: fieldName
        });

        return field;
      };
      $scope.tabdByName = function (fieldName) {
        if ($scope.project.template === undefined) return null;
        var tab = _.find($scope.project.template.templateJSON.tabs, {
          name: fieldName
        });

        return tab;
      };
      $scope.tabdById = function (id) {
        if ($scope.project.template === undefined) return null;
        var tab = _.find($scope.project.template.templateJSON.tabs, {
          id: id
        });

        return tab;
      };

      $scope.isTeamFilter = function (person): boolean {
        return person.role.id > 1;
      };

      function loadProject() {
        if (projectId) {
          // if ( $scope.project === undefined) {
          // $scope.project = [];
          Restangular.one("projects", projectId)
            .get()
            .then(result => {
              $scope.project = result;
              $scope.entityTypeId = 8;
              $scope.project.entityTypeId = 8; //Hardcode
              $scope.project.entityModelName = "project";

              $scope.projectStatus = _.find(projectStatus, {
                id: $scope.project.status
              });
              $scope.project.currency = _.find($scope.currencies, {
                id: $scope.project.currencyId || 0
              });
              $scope.project.folderGuid = "29f559a8111f46b4a965868948384dbc"; // HARDCODE MIS COCUMENTOS

              $scope.project.categoriesIds = [];
              for (var i = 0; i < $scope.project.categories.length; i++) {
                var categoryItem = $scope.project.categories[i];

                $scope.project.categoriesIds.push(categoryItem.category.id);
              }

              $scope.project.teamPersons = [];
              $scope.projectTeam = [] = new Array<any>();

              for (var i = 0; i < $scope.project.members.length; i++) {
                var teamItem = $scope.project.members[i];

                if (teamItem.role.id === 1) {
                  $scope.projectSponsor = $scope.project.members[i];
                } else {
                  $scope.projectTeam.push($scope.project.members[i]);
                }
              }
            });
          // }
        } else {
          toastr.error("Proyectos", "No se ha encontrado el proyecto.");
        }
      }
      $scope.reRednerMap = function () {
        $scope.showMap = true;
        google.maps.event.trigger($scope.map, "resize");
      };

      NgMap.getMap({ id: "placesMap" }).then(map => {
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });

      $scope.currentProjectPosition = [-34.61512668346219, -58.414306640625];

      loadProject();
    }
  ])
  .controller("ProjectsController", [
    "$scope",
    "$translate",
    "$state",
    "Restangular",
    "NgMap",
    ($scope, $translate, $state, Restangular, NgMap) => {
      $scope.params = {
        view: 0,
        showGrid: false,
        showMap: false
      };

      $scope.new = () => {
        $state.go("app.projects.newproject");
      };
      $scope.reRednerMap = function () {
        $scope.showMap = true;
        google.maps.event.trigger($scope.map, "resize");
      };

      NgMap.getMap({ id: "placesMap" }).then(map => {
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });
      $scope.googleMapsUrl =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY";
      $scope.map = { center: [-36.4050005, -58.6972645], zoom: 8 };

      function load() {
        Restangular.one("projects")
          .get()
          .then(result => {
            $scope.projects = result.results;
            console.log($scope.projects);
          });
      }

      function loadPlacesGeoDecoder() {
        // $scope.projects.array.forEach(project => {
        //   project.places.forEach(place => {
        //     if (text) {
        //       var geocoder = new google.maps.Geocoder();

        //       geocoder.geocode({ address: text }, (results, status) => {
        //         if (
        //           status === google.maps.GeocoderStatus.OK &&
        //           results.length > 0
        //         ) {
        //           $scope.map.setCenter(results[0].geometry.location);
        //           var marker = new google.maps.Marker({
        //             map: $scope.map,
        //             position: results[0].geometry.location
        //           });
        //           $scope.selectedPlaceMarker.push(marker);
        //         }
        //       });
        //     }
        //   });
        // });
      }

      load();
    }
  ])
  .controller("ProjectController", [
    "$log",
    "$scope",
    "$translate",
    "$state",
    "$stateParams",
    "Restangular",
    "FileUploader",
    "projectStatus",
    "projectRoles",
    "imagesTypes",
    "NgMap",
    "dialogs",
    "toastr",
    (
      $log,
      $scope,
      $translate,
      $state,
      $stateParams,
      Restangular,
      FileUploader,
      projectStatus,
      projectRoles,
      imagesTypes,
      NgMap,
      dialogs,
      toastr
    ) => {
      var id = $stateParams.projectId;
      ///  $scope.project = [ {costCenters :{name = 'test S'} ];

      $scope.projectId = id;
      $scope.projectMessages = [];
      $scope.places = [];
      $scope.googleMapsUrl =
        "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";
      $scope.options = {};
      $scope.currencies = [
        { id: 0, name: "Pesos argentinos", symbol: "AR$" },
        { id: 1, name: "Dólar estadounidense", symbol: "USD" }
      ];
      $scope.map = { center: [-34.61512668346219, -58.414306640625], zoom: 4 };
      $scope.searchbox = {
        template: "searchbox.tpl.html",
        events: {
          places_changed: searchBox => { }
        }
      };
      $scope.params = {
        selectedItems: [],
        productCCId: null
      };
      $scope.showMap = false;

      $scope.addCCRel = () => {
        $scope.projectCostCenter = {
          id: 0,
          costCenter: { costCenterId: $scope.params.CCRelId }
        };
        Restangular.one("projects", $scope.projectId)
          .all("costcenters")
          .post({
            ProjectId: $scope.projectId,
            CostCenterId: $scope.params.CCRelId
          })
          .then(() => {
            $scope.params.CCRelId = null;
            $scope.$broadcast("refresh");
            toastr.success(
              "Administrador de Centros de Costo",
              "Se asoció el Centro de Costo con éxito."
            );
          });
      };
      $scope.reRednerMap = function () {
        $scope.showMap = true;
        google.maps.event.trigger($scope.map, "resize");
      };

      NgMap.getMap({ id: "placesMap" }).then(map => {
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });

      $scope.currentProjectPosition = [-34.61512668346219, -58.414306640625];

      $scope.openPlacesSelector = () => {
        var placesModal = dialogs.create(
          "app/projects/projects/modal-places-selector.html",
          "selectPlacesController",
          null,
          { size: "lg", animation: true }
        );

        placesModal.result.then(
          result => {
            var place = result.place;
            $scope.project.places.push(result.place);
          },
          () => { }
        );
      };

      function loadProject() {
        if (id) {
          Restangular.one("projects", id)
            .get()
            .then(result => {
              $scope.project = result;
              $scope.project.entityTypeId = 8; //Hardcode
              $scope.project.entityModelName = "project";
              $scope.projectStatus = _.find(projectStatus, {
                id: $scope.project.status
              });
              $scope.project.currency = _.find($scope.currencies, {
                id: $scope.project.currencyId || 0
              });
              // $scope.project.folderGuid =  '29f559a8111f46b4a965868948384dbc';// "30F522FC-94A9-40D2-9CA6-3F8EA3D247A0"; // HARDCODE MIS COCUMENTOS
              $scope.project.categoriesIds = [];
              for (var i = 0; i < $scope.project.categories.length; i++) {
                var categoryItem = $scope.project.categories[i];

                $scope.project.categoriesIds.push(categoryItem.category.id);
              }

              $scope.$broadcast("loadCC");
            });
        } else {
          $scope.project = {
            // folderGuid: "29f559a8111f46b4a965868948384dbc", // HARDCODE MIS COCUMENTOS
            categories: [],
            members: [],
            places: []
          };

          $scope.projectStatus = _.find(projectStatus, { id: 0 });
        }
      }

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

      $scope.$on("reload", event => {
        loadProject();
      });

      $scope.$on("reloadMessages", (event, messages) => {
        $scope.project.messages = messages;
      });

      $scope.canEdit = () => {
        return true;
      };

      $scope.edit = () => {
        $state.go("app.projects.editproject", { projectId: $scope.project.id });
      };

      $scope.canSave = () => {
        return true;
      };

      $scope.save = () => {
        if (id) {
          $scope.project.put().then(result => {
            $state.go("app.projects.projects");
          });
        } else {
          Restangular.service("projects")
            .post($scope.project)
            .then(result => {
              $state.go("app.projects.projects");
            });
        }
      };

      $scope.uploader = new FileUploader({
        scope: $scope,
        url: API_HOST + "/api/projects/" + id + "/files",
        autoUpload: true,
        queueLimit: 100,
        removeAfterUpload: false
      });

      $scope.options.uploadProgress = 0;

      $scope.uploader.onProgressItem = (item, progress) => {
        $scope.options.uploadProgress = progress;
      };

      $scope.uploader.onCompleteAll = () => {
        Restangular.one("projects", $scope.project.id)
          .one("files")
          .get()
          .then(result => {
            $scope.document.files = result.results;
            $scope.uploader.destroy();
            $scope.uploader = new FileUploader({
              scope: $scope,
              autoUpload: true,
              removeAfterUpload: false
            });
          });
      };

      $scope.getMapPosition = event => {
        $scope.currentProjectPosition = [
          event.latLng.lat(),
          event.latLng.lng()
        ];
      };

      $scope.onMapOverlayCompleted = function (e) {
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
            // console.info("@todo: get information from 'overlay' to data.geo");
            break;
          case "circle":
            //  console.info("@todo: get information from 'overlay' to data.geo");
            break;
        }
      };

      loadProject();
    }
  ])
  .controller(
  "selectPlacesController",
  ($scope, $uibModalInstance, Restangular, NgMap) => {
    $scope.selectedPlace = [];
    $scope.selectedPlaceMarker = [];
    $scope.placeType = null;
    $scope.googleMapsUrl =
      "https://maps.google.com/maps/api/js?key=AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY&libraries=drawing";

    $scope.map = { center: [-34.61512668346219, -58.414306640625], zoom: 4 };

    $scope.showMap = false;

    $scope.reRednerMap = function () {
      $scope.showMap = true;
      google.maps.event.trigger($scope.map, "resize");
    };

    NgMap.getMap({ id: "placeSelectMap" }).then(function (map) {
      $scope.showMap = true;
      google.maps.event.trigger(map, "resize");
      map.setZoom(4);
    });

    $scope.currentProjectPosition = [-34.61512668346219, -58.414306640625];
    $scope.onMapLoaded = function () {
      NgMap.getMap({ id: "placeSelectMap" }).then(function (map) {
        $scope.map = map;
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });
      $scope.showMap = true;
    };
    $scope.$on("$routeChangeSuccess", function () {
      NgMap.getMap({ id: "placeSelectMap" }).then(function (map) {
        google.maps.event.trigger(map, "resize");
        map.setZoom(4);
      });
      $scope.showMap = true;
    });
    $scope.onSelectPlace = (value, text) => {
      $scope.placeType = value;
      $scope.DeleteMarkers();
      if (text) {
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: text }, (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results.length > 0
          ) {
            $scope.map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: $scope.map,
              position: results[0].geometry.location
            });
            $scope.selectedPlaceMarker.push(marker);
            $scope.map.panTo(location);
          } else {
            alert("status.not.ok");
          }
        });
      }
      $scope.reRednerMap();
    };
    $scope.save = () => {
      //TO DO VALIDACIONES
      $scope.selectedPlace = {
        placeType: $scope.placeType,
        geo: {
          lat: $scope.selectedPlaceMarker[0].getPosition().lat(),
          lng: $scope.selectedPlaceMarker[0].getPosition().lng()
        }
      };
      $uibModalInstance.close({ place: $scope.selectedPlace });
    };

    $scope.DeleteMarkers = function () {
      //Loop through all the markers and remove
      for (var i = 0; i < $scope.selectedPlaceMarker.length; i++) {
        $scope.selectedPlaceMarker[i].setMap(null);
      }
      $scope.selectedPlaceMarker = [];
    };
  }
  )
  .controller("selectImagesController", [
    "$scope",
    "$uibModalInstance",
    "projectRoles",
    "Restangular",
    "imagesTypes",
    "data",
    (
      $scope,
      $uibModalInstance,
      projectRoles,
      Restangular,
      imagesTypes,
      data
    ) => {
      $scope.image = null;
      $scope.imagesTypes = imagesTypes;
      $scope.project = data;

      $scope.$on("fileuploadcomplete", function (fileuploadcomplete, filename) {
        $scope.imageUrl =
          API_HOST +
          "/api/system/documentmanagement/folders/" +
          $scope.project.folderGuid +
          "/files/" +
          filename;
      });

      $scope.save = typeId => {
        //TO DO

        $scope.image = { typeId: typeId };

        $uibModalInstance.close({ image: $scope.image });
      };

      $scope.load = () => { };

      $scope.load();
    }
  ])
  .controller(
  "selectSponsorController",
  ($scope, $uibModalInstance, projectRoles, Restangular, $timeout) => {
    $scope.checkedItems = [];

    $scope.params = {
      selectedItems: [],
      filter: ""
    };
    $scope.persons = [];
    $scope.personSelected = null;

    $scope.SponsorRol = { id: 1, name: "Promotor" }; //_.find(projectRoles, { id: 1 }); //Sponsor
    //HARDCODE IMAGE PERSON
    $scope.personImages = [
      { url: "Content/img/a1.jpg" },
      { url: "Content/img/a2.jpg" },
      { url: "Content/img/a3.jpg" },
      ,
      { url: "Content/img/a4.jpg" },
      { url: "Content/img/a5.jpg" },
      { url: "Content/img/a6.jpg" },
      { url: "Content/img/a7.jpg" },
      { url: "Content/img/a8.jpg" },
      { url: "Content/img/someone.jpg" }
    ];

    function getRandomImage() {
      return $scope.personImages[
        Math.floor(Math.random() * ($scope.personImages.length - 1))
      ];
    }
    //------------------------------------------------------------------

    $scope.search = () => {
      $scope.$broadcast("refresh");
    };

    $scope.$on("selectionPersonModalChanged", (event, args) => {
      $scope.personSelected = {
        person: args.person,
        // personImageUri:args.personImageUri,
        role: $scope.SponsorRol
      };
    });

    $scope.save = (person, description) => {
      $scope.personSelected = {
        person: person,
        //   personImageUri: personUri,
        role: $scope.SponsorRol,
        description: description
      };

      $uibModalInstance.close({ person: $scope.personSelected });
    };
  }
  )
  .controller(
  "selectTeamController",
  ($scope, $uibModalInstance, projectRoles, Restangular, $timeout) => {
    $scope.persons = [];

    $scope.personSelected = null;
    $scope.personSelected = { tags: [] };
    $scope.selectedRol = null;
//  $scope.roles = _.filter(projectRoles, function (rol: any) {
//     return (rol.id = 2);
//    });
    var selectedRol = { id: 2, name: "member" };

    $scope.search = () => {
      $scope.$broadcast("refresh");
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
  }
  )
  .controller("ProjectApprovalssController", [
    "$scope",
    "$translate",
    "$state",
    ($scope, $translate, $state) => {
      $scope.params = {
        view: 0
      };

      $scope.new = () => {
        $state.go("app.projects.newproject");
      };
    }
  ])
  .controller(
  "editorHtmlController",
  ($scope, $uibModalInstance, Restangular, data) => {
    $scope.textToEdit = data;

    $scope.save = textToEdit => {
      $scope.textToEdit = textToEdit;
      $uibModalInstance.close({ htmlDescription: $scope.textToEdit });
    };
  }
  )
  .controller("ProjectApprovalsController", [
    "$scope",
    "$translate",
    "$state",
    "$stateParams",
    "Restangular",
    ($scope, $translate, $state, $stateParams, Restangular) => {
      var id = $stateParams.projectId;

      function load() {
        if (id) {
          Restangular.one("projects", id)
            .get()
            .then(result => {
              $scope.project = result;
            });
        } else {
          $scope.project = {};
        }
      }

      $scope.save = () => {
        if (id) {
          $scope.project.put().then(() => {
            $state.go("app.projects.projects");
          });
        } else {
          Restangular.service("projects")
            .post($scope.project)
            .then(() => {
              $state.go("app.projects.projects");
            });
        }
      };
      load();
    }
  ])
  .directive(
  "projectsGrid",
  ($state, $filter, $compile, $log, projectStatus, $timeout, authManager) => {
    return {
      restrict: "A",
      scope: { height: "@", selectedItems: "=" },
      link(scope: any, element, attrs, ctrl) {
        $timeout(() => {
          var gridElementName = "projectsGrid";
          var pagerElementName = gridElementName + "Pager";
          var gridElement = angular.element("<table></table>");
          gridElement.attr("id", gridElementName);
          var pagerElement = angular.element("<div></div>");
          pagerElement.attr("id", pagerElementName);
          element.append(gridElement);
          element.append(pagerElement);

          scope.height = scope.height || 450;

          function toSearchOptions(statusEnum) {
            var options = [];
            options.push(":Todos");
            for (var index = 0; index < statusEnum.length; ++index) {
              options.push(
                statusEnum[index].id + ":" + statusEnum[index].name
              );
            }

            return options.join(";");
          }

          function currencyFormatter(cellvalue, options, rowObject) {
            var value = parseFloat(cellvalue);
            return $filter("currency")(value, "");
          }

          function projectStatusFormatter(cellvalue, options, rowObject) {
            var id = parseInt(cellvalue);

            var item: any = _.find(projectStatus, { id: id });
            return item.name;
          }

          var colNames = [
            "",
            "Número",
            "Nombre",
            "Fecha",
            "Inversión",
            "Contratado",
            "Ejecutado",
            "Estado",
            "Responsable"
          ];
          var colModel: Array<any> = [
            {
              name: "editCommand",
              index: "editCommand",
              width: 25,
              align: "center",
              fixed: true,
              sortable: false,
              search: false,
              formatter: () => {
                return '<i class="fa fa-search-plus fa-fw hand"></i>';
              }
            },
            {
              name: "number",
              index: "number",
              search: true,
              fixed: true,
              width: 75
            },
            { name: "name", index: "nameContains", search: true },
            {
              name: "workflowInstanceCreateDate",
              index: "workflowInstanceCreateDate",
              search: true,
              formatter: "date",
              align: "center",
              fixed: true,
              width: 85,
              searchoptions: {
                dataInit: elem => {
                  var datePicker = $compile(
                    '<div id="createDate" data-date-picker-filter="" style="overflow: visible; position: relative;"></div>'
                  )(scope);
                  angular.element(elem).replaceWith(datePicker);
                }
              }
            },
            {
              name: "investment",
              index: "investment",
              search: true,
              fixed: true,
              width: 110,
              formatter: currencyFormatter,
              align: "right"
            },
            {
              name: "contractAmount",
              index: "contractAmount",
              search: true,
              fixed: true,
              width: 110,
              formatter: currencyFormatter,
              align: "right"
            },
            {
              name: "total",
              index: "total",
              search: true,
              fixed: true,
              width: 110,
              formatter: currencyFormatter,
              align: "right"
            },
            {
              name: "status",
              index: "status",
              search: true,
              fixed: true,
              width: 90,
              formatter: projectStatusFormatter,
              formatoptions: { items: projectStatus },
              stype: "select",
              searchoptions: { value: toSearchOptions(projectStatus) }
            },
            { name: "roles", width: 125, fixed: true }
          ];

          gridElement.jqGrid({
            regional: "es-ar",
            url: API_HOST + "/api/projects.json",
            datatype: "json",
            height: scope.height,
            autowidth: true,
            shrinkToFit: true,
            responsive: true,
            styleUI: "Bootstrap",
            colNames: colNames,
            colModel: colModel,
            scroll: 1,
            mtype: "GET",
            gridview: true,
            pager: pagerElementName,
            viewrecords: true,
            footerrow: true,
            loadonce: true,
            serDataOnFooter: true,
            loadBeforeSend: function (jqXHR) {
              jqXHR.setRequestHeader(
                "Authorization",
                "Bearer " + authManager.getToken()
              );
            },
            jsonReader: {
              page: obj => {
                var page = obj.offset / 100 + 1;
                return page;
              },
              total: obj => {
                var total =
                  obj.total <= 100
                    ? 1
                    : ((obj.total / 100) >> 0) +
                    (obj.total % 100 > 0 ? 1 : 0);
                return total;
              },
              records: "total",
              repeatitems: false,
              root: "results"
            },
            beforeRequest: () => {
              var currentPage = gridElement.jqGrid("getGridParam", "page");
            },
            beforeSelectRow() {
              return false;
            },
            onCellSelect(rowId, iCol, cellcontent, e) {
              if (iCol === 0) {
                var stateName = "app.projects.projectview";
                $state.go(stateName, { projectId: rowId });
                return false;
              }

              return true;
            }
          });

          gridElement.jqGrid("filterToolbar", {
            autosearch: true,
            searchOperators: false
          });
          gridElement.jqGrid("bindKeys");
        }, 0);
      }
    };
  }
  )
  .directive("projectApprovalsGrid", [
    "$state",
    "$log",
    "$compile",
    "$filter",
    "Restangular",
    "toastr",
    ($state, $log, $compile, $filter, Restangular, toastr) => {
      return {
        restrict: "A",
        scope: {
          height: "@",
          selectedItems: "=",
          showHeader: "@",
          view: "=?",
          filter: "=?"
        },
        link(scope: any, element) {
          var tabsElement =
            "<div><uib-tabset>" +
            '<uib-tab heading="Propias" select="changeView(0)"></uib-tab>' +
            '<uib-tab heading="Supervisados" select="changeView(1)"></uib-tab>' +
            '<uib-tab heading="De terceros" select="changeView(2)"></uib-tab>' +
            '<uib-tab heading="Baja" select="changeView(3)"></uib-tab>' +
            '<uib-tab heading="Finalizadas" select="changeView(4)"></uib-tab>' +
            "</uib-tabset></div>";
          var gridElementName = "healthTreatmentRequestsGrid";
          var pagerElementName = gridElementName + "Pager";
          var gridElement = angular.element("<table></table>");
          gridElement.attr("id", gridElementName);
          var pagerElement = angular.element("<div></div>");
          pagerElement.attr("id", pagerElementName);

          element.append($compile(tabsElement)(scope));
          element.append($compile(gridElement)(scope));
          element.append($compile(pagerElement)(scope));

          scope.height = scope.height || 400;
          scope.personId = null;
          scope.showHeader = scope.showHeader || false;
          scope.view = scope.view || 0;
          scope.filter = scope.filter || null;

          scope.changeView = view => {
            scope.view = view;
            loadData();
          };

          scope.approve = workflowInstanceGuid => {
            Restangular.service(
              "system/workflows/workflowinstances/" +
              workflowInstanceGuid +
              "/approve"
            )
              .post({})
              .then(
              () => {
                toastr.success(
                  "Autorizaciones",
                  "La operación se realizó con éxito."
                );
                loadData();
              },
              () => {
                toastr.error(
                  "Autorizaciones",
                  "Se produjo un error en la operación."
                );
              }
              );
          };

          scope.reject = workflowInstanceGuid => {
            Restangular.service(
              "system/workflows/workflowinstances/" +
              workflowInstanceGuid +
              "/reject"
            )
              .post({})
              .then(
              () => {
                toastr.success(
                  "Autorizaciones",
                  "La operación se realizó con éxito."
                );
                loadData();
              },
              () => {
                toastr.error(
                  "Autorizaciones",
                  "Se produjo un error en la operación."
                );
              }
              );
          };

          function projectCodeFormatter(
            cellvalue: any,
            options: any,
            rowObject: any
          ) {
            return (
              '<span class="largefontcell m-l-sm">' +
              rowObject.workflowCode +
              " - " +
              rowObject.number +
              "</span>"
            );
          }

          function workflowStatusFormatter(
            cellvalue: any,
            options: any,
            rowObject: any
          ) {
            var template = null;

            if (rowObject.workflowInstanceIsTerminated) {
              template =
                '<div class="label label-danger" style="display: block;">' +
                "Cancelado" +
                "</div>";
            } else {
              template =
                '<div class="label label-primary" style="display: block;">' +
                rowObject.workflowActivityName +
                "</div>";
            }

            if (!rowObject.workflowActivityIsFinal) {
              template +=
                '<div class="label label-info" style="display: block; margin-top: 2px;">' +
                rowObject.roles +
                "</div>";
            }

            return template;
          }

          function singleQuote(value) {
            return `'${value}'`;
          }

          function projectDataFormatter(
            cellvalue: any,
            options: any,
            rowObject: any
          ) {
            var createDate = $filter("amDateTime")(
              rowObject.workflowInstanceCreateDate
            );
            return (
              '<a data-ui-sref="app.projects.project({ projectId: ' +
              rowObject.id +
              ' })" title="Ver proyecto">' +
              rowObject.name +
              "</a><br><small>Creado el " +
              createDate +
              "</small></td>"
            );
          }

          function actionsFormatter(
            cellvalue: any,
            options: any,
            rowObject: any
          ) {
            var template =
              '<a href="#" data-ui-sref="app.projects.projectview({ projectId: ' +
              rowObject.id +
              ' })" class="btn btn-white btn-sm"><i class="fa fa-folder"></i> Ver </a>';
            if (scope.view <= 1) {
              template +=
                '<a href="#" data-ng-click="approve(' +
                singleQuote(rowObject.workflowInstanceGuid) +
                ')" class="btn btn-primary btn-xs m-l-xs"><i class="fa fa-pencil"></i> Aprobar </a>' +
                '<a href="#" data-ng-click="reject(' +
                singleQuote(rowObject.workflowInstanceGuid) +
                ')" class="btn btn-danger btn-xs m-l-xs"><i class="fa fa-pencil"></i> Rechazar </a>';
            }

            return template;
          }

          function workflowProgressFormatter(
            cellvalue: any,
            options: any,
            rowObject: any
          ) {
            return (
              "<small> Completo al: " +
              rowObject.workflowInstanceProgress +
              ' % </small><div class="progress progress-mini"><div style="width:' +
              rowObject.workflowInstanceProgress +
              '%;" class="progress-bar"></div></div>'
            );
          }

          var colNames = ["", "", "", "", ""];
          var colModel: Array<any> = [
            {
              name: "code",
              index: "code",
              width: 80,
              fixed: true,
              search: true,
              align: "center",
              formatter: projectCodeFormatter
            },
            {
              name: "workflowStatus",
              index: "workflowStatus",
              width: 150,
              fixed: true,
              search: true,
              formatter: workflowStatusFormatter
            },
            {
              name: "projectData",
              index: "projectData",
              search: false,
              formatter: projectDataFormatter
            },
            {
              name: "workflowProgress",
              index: "workflowProgress",
              width: 150,
              fixed: true,
              search: false,
              formatter: workflowProgressFormatter
            },
            {
              name: "actions",
              index: "actions",
              width: 250,
              fixed: true,
              search: false,
              formatter: actionsFormatter
            }
          ];
          gridElement.jqGrid({
            regional: "es-ar",
            datatype: "local",
            height: scope.height,
            autowidth: true,
            shrinkToFit: true,
            responsive: true,
            styleUI: "Bootstrap",
            colNames: colNames,
            colModel: colModel,
            scroll: 1,
            mtype: "GET",
            gridview: true,
            pager: pagerElementName,
            viewrecords: true,
            rowNum: 100,
            jsonReader: {
              page: obj => {
                var page = obj.offset / 100 + 1;
                return page;
              },
              total: obj => {
                var total =
                  obj.total <= 100
                    ? 1
                    : ((obj.total / 100) >> 0) + (obj.total % 100 > 0 ? 1 : 0);
                return total;
              },
              records: "total",
              repeatitems: false,
              root: "results"
            },
            beforeRequest: () => {
              var currentPage = gridElement.jqGrid("getGridParam", "page");
              gridElement.jqGrid("setGridParam", {
                postData: { skip: (currentPage - 1) * 100, take: 100 }
              });

              if (scope.personId) {
                gridElement.jqGrid("setGridParam", {
                  postData: { personId: scope.personId }
                });
              }
            },
            beforeSelectRow() {
              return false;
            },
            loadComplete: () => {
              $compile(angular.element("#" + gridElementName))(scope);
            }
          });

          gridElement.jqGrid(
            "navGrid",
            "#" + pagerElementName,
            {
              del: false,
              add: false,
              edit: false
            },
            {},
            {},
            {},
            { multipleSearch: false }
          );
          gridElement.jqGrid("filterToolbar", {
            autosearch: true,
            searchOperators: false
          });
          gridElement.jqGrid("bindKeys");

          if (!scope.showHeader) {
            var header = $(
              "#gview_" + gridElementName + " .ui-jqgrid-hdiv"
            ).hide();
          }

          gridElement.addClass("ui-jqgrid-noborders");

          function loadData() {
            var url = API_HOST + "/api/projects.json";
            gridElement.jqGrid("setGridParam", {
              postData: { view: scope.view, q: scope.filter }
            });
            gridElement.jqGrid("setGridParam", {
              datatype: "json",
              url: url,
              page: 1
            });
            gridElement.trigger("reloadGrid");
          }

          scope.$on("loadData", (event, personId) => {
            if (personId) {
              scope.personId = personId;
            }

            loadData();
          });
        }
      };
    }
  ])
  .directive(
  "memberTags",
  ($compile, $parse, $document, $log, dialogs, authManager) => {
    return {
      restrict: "A",
      //  templateUrl: '/views/simple.html',
      scope: {
        directiveOptions: "=",
        selectedDirectiveOptions: "="
      },
      link: function ($scope, elem, attrs) {
        //  $scope.message2 = "Directive scope is working";
      }
    };
  }
  )
  .directive("projectProjectdata", [
    "$log",
    "$rootScope",
    "$state",
    "Restangular",
    "dialogs",
    ($log, $rootScope, $state, Restangula, dialogs) => {
      return {
        restrict: "A",
        scope: { height: "@", project: "=ngModel" },
        templateUrl: "app/projects/projects/project-projectdata.html",
        link(scope: any, element) {
          scope.editReview = () => {
            var editorModal = dialogs.create(
              "app/projects/projects/modal-html-editor.html",
              "editorHtmlController",
              scope.project.review,
              { size: "lg", animation: true }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;
                scope.project.review = text;
              })
              .finally(function () {
                editorModal.$destroy();
              });
          };

          scope.editDescription = () => {
            var editorModal = dialogs.create(
              "app/projects/projects/modal-html-editor.html",
              "editorHtmlController",
              scope.project.description,
              { size: "lg", animation: true }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;
                scope.project.description = text;
              })
              .finally(function () {
                editorModal.$destroy();
              });
          };
        }
      };
    }
  ])
  .directive(
  "imagesFileUpload",
  ($log, $rootScope, FileUploader, authManager) => {
    return {
      restrict: "AE",
      scope: { folderGuid: "@", isBusy: "=?" },
      templateUrl: "app/projects/projects/fileupload.html",
      controller($scope: any) {
        var uploader = ($scope.uploader = new FileUploader({
          scope: $scope,
          autoUpload: true,
          queueLimit: 100,
          removeAfterUpload: true,
          onCompleteAll: () => {
            $scope.isBusy = false;
          }
        }));
      },
      link(scope: any, element) {
        scope.uploader.filters.push({
          name: "imageFilter",
          fn: function (item /*{File|FileLikeObject}*/, options) {
            var type =
              "|" + item.type.slice(item.type.lastIndexOf("/") + 1) + "|";
            return "|jpg|png|jpeg|bmp|gif|".indexOf(type) !== -1;
          }
        });

        scope.uploader.onSuccessItem = function (
          fileItem,
          response,
          status,
          headers
        ) {
          scope.success = "File uploaded successfully";
          scope.error = null;
          $rootScope.$broadcast("fileuploadcomplete", fileItem.file.name);
        };
        scope.uploader.onBeforeUploadItem = item => {
          scope.isBusy = true;
          item.headers = {
            Authorization: "Bearer " + authManager.getToken()
          };
          item.url =
            API_HOST +
            "/api/system/documentmanagement/folders/" +
            scope.folderGuid +
            "/files";
        };
      }
    };
  }
  )
  .directive("projectImages", [
    "$log",
    "$rootScope",
    "$state",
    "Restangular",
    "dialogs",
    ($log, $rootScope, $state, Restangular, dialogs, imagesTypes) => {
      return {
        restrict: "A",
        scope: { height: "@", project: "=ngModel", serviceUrl: "=" },
        templateUrl: "app/projects/projects/project-images-selector.html",
        link(scope: any, element) {
          scope.selectedImage = null;

          scope.removeSelectedImage = imageId => {
            _.remove(scope.project, { id: imageId });
          };
          scope.openImagesSelector = () => {
            var imagesModal = dialogs.create(
              "app/projects/projects/modal-image-selector.html",
              "selectImagesController",
              scope.project,
              { size: "lg", animation: true }
            );

            imagesModal.result.then(
              result => {
                var image = result.image;
                scope.project.push(image);
              },
              () => { }
            );
          };
        }
      };
    }
  ])
  .directive("projectTeam", [
    "$log",
    "$rootScope",
    "$state",
    "Restangular",
    "dialogs",
    ($log, $rootScope, $state, Restangular, dialogs, projectRoles) => {
      return {
        restrict: "A",
        scope: { height: "@", teamPersons: "=ngModel", serviceUrl: "=" },
        templateUrl: "app/projects/projects/project-team.html",
        link(scope: any, element) {
          scope.selectedTeamPersons = [];
          scope.editDescription = selectPerson => {
            var person = selectPerson;

            var editorModal = dialogs.create(
              "app/projects/projects/modal-html-editor.html",
              "editorHtmlController",
              person.description,
              { size: "lg", animation: true }
            );

            editorModal.result
              .then(result => {
                var text = result.htmlDescription;

                for (var i = 0; i < scope.teamPersons.length; i++) {
                  if (
                    scope.teamPersons[i].person.id === selectPerson.person.id
                  ) {
                    scope.teamPersons[i].description = text;
                  }
                }
              })
              .finally(function () {
                editorModal.$destroy();
              });
          };

          scope.clearSponsor = function () {
            var sponsorRol = _.find(projectRoles, { id: 1 }); //Sponsor
            for (var i = scope.teamPersons.length - 1; i >= 0; i--) {
              if (scope.teamPersons[i].role.id == 1) {
                scope.teamPersons.splice(i, 1);
              }
            }
          };

          scope.isPromotorFilter = function (person): boolean {
            return person.role.id === 1;
          };

          scope.isTeamFilter = function (person): boolean {
            return person.role.id > 1;
          };
          scope.openSponsorSelector = () => {
            var sponsorModal = dialogs.create(
              "app/projects/projects/modal-sponsor-selector.html",
              "selectSponsorController",
              null,
              { size: "lg", animation: true }
            );

            sponsorModal.result
              .then(result => {
                var person = result.person;

                scope.clearSponsor();
                scope.teamPersons.push(result.person);
              })
              .finally(function () {
                sponsorModal.$destroy();
              });
          };

          scope.openTeemSelector = () => {
            var sponsorModal = dialogs.create(
              "app/projects/projects/modal-team-selector.html",
              "selectTeamController",
              null,
              { size: "lg", animation: true }
            );

            sponsorModal.result.then(
              result => {
                var person = result.person;
                scope.teamPersons.push(result.person);
              },
              () => { }
            );
          };

          scope.removeSelectedPerson = selectedPerson => {
            if (selectedPerson.id && selectedPerson.id > 0) {
              _.remove(scope.teamPersons, { id: selectedPerson.id });
            } else {
              for (var i = 0; i < scope.teamPersons.length; i++) {
                if (
                  scope.teamPersons[i].person.id === selectedPerson.person.id
                ) {
                  scope.teamPersons.splice(i, 1);
                }
              }
            }
            // scope.teamPersons.splice(index, 1);
            // _.remove(scope.teamPersons, { personId: personId });
          };
        }
      };
    }
  ])
  .directive("projectConcepts", [
    "$log",
    "$rootScope",
    "$state",
    "Restangular",
    ($log, $rootScope, $state, Restangular) => {
      return {
        restrict: "A",
        scope: { height: "@", obtopayInstance: "=ngModel", serviceUrl: "=" },
        templateUrl: "app/projects/projects/project-concepts.html",
        link(scope: any, element) { }
      };
    }
  ])
  .directive(
  "projectRelCcGrid",
  (
    $log,
    $compile,
    $filter,
    $state,
    $document,
    dialogs,
    Restangular,
    $http,
    $timeout,
    toastr,
    authManager
  ) => {
    return {
      restrict: "A",
      scope: {
        height: "@",
        selectedItems: "=",
        projectId: "=",
        items: "=?",
        view: "=?"
      },
      link(scope: any, element, attrs, ctrl) {
        const gridElementName = "projectRelCcGrid";
        const pagerElementName = gridElementName + "Pager";
        var gridElement: any = angular.element("<table></table>");
        gridElement.attr("id", gridElementName);
        const pagerElement: any = angular.element("<div></div>");
        pagerElement.attr("id", pagerElementName);
        element.append($compile(gridElement)(scope));
        element.append($compile(pagerElement)(scope));

        scope.height = scope.height || 450;
        scope.view = scope.view || 0;
        scope.projectId = scope.projectId || 0;

        scope.changeView = view => {
          scope.view = view;
          loadData();
        };
        scope.$on("loadCostCenters", project => {
          scope.project = project;

          loadData();
        });
        function currencyFormatter(cellvalue, options, rowObject) {
          var value = parseFloat(cellvalue);
          return $filter("currency")(value, "");
        }
        function removeFormatter(cellvalue, options, rowObject) {
          if (scope.view == 1) {
            return "";
          }
          return (
            '<i data-ng-click="removeCCRel(' +
            rowObject.id +
            ')" class="fa fa-trash-o fa-fw hand"></i>'
          );
        }
        function actionsFormatter(
          cellvalue: any,
          options: any,
          rowObject: any
        ) {
          var template =
            '<a  data-ui-sref="app.projects.checkingaccount({ projectId:' +
            scope.projectId +
            " , costcenterId:" +
            rowObject.id +
            ' })" class="btn btn-white btn-sm"><i class="fa fa-search-plus fa-fw hand"></i>  </a>';
          return template;
        }
        var colNames = ["", "Nombre", "Moneda", "Acciones"];
        var colModel: Array<any> = [
          {
            name: "viewCommand",
            index: "viewCommand",
            align: "center",
            fixed: true,
            sortable: false,
            width: 45,
            search: false,
            formatter: actionsFormatter
          },
          // { name: 'type', index: 'type', align: 'center', fixed: false,sortable: false,search: false },
          {
            name: "costCenter.name",
            index: "costCenter.name",
            align: "center",
            search: false,
            sortable: false
          },
          {
            name: "costCenter.currenctyId",
            index: "costCenter.currenctyId",
            align: "center",
            search: false,
            sortable: false,
            fixed: true
          },
          // { name: 'number', index: 'number', align: 'center', search: false, sortable: false },
          //  { name: 'currenctyId', index: 'currenctyId', align: 'center', search: false, sortable: false },
          // { name: 'balance', index: 'balance', align: 'center', search: false, sortable: false ,formatter:currencyFormatter},
          {
            name: "removeCommand",
            index: "removeCommand",

            align: "center",
            fixed: true,
            sortable: false,
            search: false,
            formatter: (cellValue, options, rowObject) => {
              return (
                '<i data-ng-click="removeCCRel(' +
                rowObject.id +
                ')" class="fa fa-trash-o fa-fw hand"></i>'
              );
            }
          }
        ];

        gridElement.jqGrid({
          regional: "es-ar",
          url:
            API_HOST +
            "/api/projects/" +
            scope.projectId +
            "/costcenters.json",
          datatype: "json",
          height: scope.height,
          // autowidth: true,
          width: 920,
          //shrinkToFit: false,
          responsive: true,
          styleUI: "Bootstrap",
          colNames: colNames,
          colModel: colModel,
          scroll: 1,
          mtype: "GET",
          gridview: true,
          pager: pagerElementName,
          viewrecords: true,
          footerrow: true,
          loadonce: true,
          serDataOnFooter: true,
          loadBeforeSend: function (jqXHR) {
            jqXHR.setRequestHeader(
              "Authorization",
              "Bearer " + authManager.getToken()
            );
          },
          jsonReader: {
            page: obj => {
              var page = obj.offset / 100 + 1;
              return page;
            },
            total: obj => {
              var total =
                obj.total <= 100
                  ? 1
                  : ((obj.total / 100) >> 0) + (obj.total % 100 > 0 ? 1 : 0);
              return total;
            },
            records: "total",
            repeatitems: false,
            root: "results"
          },
          beforeRequest: () => {
            var currentPage = gridElement.jqGrid("getGridParam", "page");
          },

          beforeSelectRow() {
            return true;
          },
          onCellSelect(rowId, iCol) { },
          multiselect: false,
          multiboxonly: false,

          gridComplete: () => {
            $("#_empty", "#" + gridElementName).addClass("nodrag nodrop");

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
        gridElement.jqGrid(
          "navGrid",
          "#" + pagerElementName,
          {
            del: false,
            add: false,
            edit: false
          },
          {},
          {},
          {},
          { multipleSearch: false }
        );
        gridElement.jqGrid("filterToolbar", {
          autosearch: true,
          searchOperators: false
        });
        gridElement.jqGrid("bindKeys");

        scope.removeCCRel = id => {
          var dlg = dialogs.confirm(
            "Editor de Centros de Costo ",
            "Está seguro que desea eliminar esta asignación?"
          );
          dlg.result.then(btn => {
            Restangular.one("projects/" + scope.projectId + "/costcenters")
              .remove()
              .then(result => {
                toastr.success(
                  "Editor de Centros de Costo ",
                  "La operación se realizó con éxito."
                );
                gridElement.trigger("reloadGrid");
              });
          });
        };

        gridElement.jqGrid(
          "navGrid",
          "#" + pagerElementName,
          {
            del: false,
            add: false,
            edit: false
          },
          {},
          {},
          {},
          { multipleSearch: false }
        );
        gridElement.jqGrid("filterToolbar", {
          autosearch: true,
          searchOperators: false
        });
        gridElement.jqGrid("bindKeys");

        scope.$on("refresh", () => {
          gridElement.trigger("reloadGrid");
        });
        function resizeGrid() {
          // var tabElement = $("#" + gridElementName).closest(".tab-pane");
          // var width = tabElement.width() - 68;
          // gridElement.jqGrid("setGridWidth", width, true);
        }

        function loadData() {
          // scope.projectId =project.id;
          var url =
            API_HOST +
            "/api/projects/" +
            scope.projectId +
            "/costcenters.json";
          // console.log(url);

          gridElement.jqGrid("setGridParam", {
            postData: { view: scope.view, q: scope.filter }
          });
          gridElement.jqGrid("setGridParam", {
            datatype: "json",
            url: url,
            page: 1
          });
          gridElement.trigger("reloadGrid");
        }
        scope.$on("refresh", () => {
          loadData();
        });
        scope.$watch("view", value => {
          scope.$emit("viewChanged", value);
        });
      }
    };
  }
  )
  .directive("projectDocumentation", [
    "$log",
    "$rootScope",
    "$state",
    "Restangular",
    ($log, $rootScope, $state, Restangular) => {
      return {
        restrict: "A",
        scope: { height: "@", obtopayInstance: "=ngModel", serviceUrl: "=" },
        templateUrl: "app/projects/projects/project-documentation.html",
        link(scope: any, element) { }
      };
    }
  ]);
