angular
  .module("app.catalog.categories", [
    "app.core",
    "ui.bootstrap",
    "ngAnimate",
    "ngSanitize"
  ])
  .config([
    "$stateProvider",
    $stateProvider => {
      $stateProvider
        .state("app.catalog.categories", {
          url: "/catalog/categories",
          abstract: true,
          template: "<ui-view/>",
          ncyBreadcrumb: {
            skip: false,
            parent: "app.dashboard",
            label: "catalog.categories"
          }
        })
        .state("app.catalog.categorieslist", {
          url: "/categories",
          controller: "CatalogCategoriesListController",
          templateUrl: "app/catalog/categories/list.html",
          resolve: loadSequence("ui.tree", "icheck", "toastr")
        })
        .state("app.catalog.categoryedit", {
          url: "/categories/{categoryId}",
          controller: "CatalogCategoriesEditController",
          resolve: loadSequence("icheck", "ui-mask", "toastr"),
          templateUrl: "app/catalog/categories/edit.html"
        })
        .state("app.catalog.categorynew", {
          url: "/categories/new",
          controller: "CatalogCategoriesNewController",
          resolve: loadSequence("icheck", "ui-mask", "toastr"),
          templateUrl: "app/catalog/categories/edit.html"
        });
    }
  ])
  .controller("CatalogCategoriesListController", [
    "$scope",
    "$http",
    "$log",
    "$translate",
    "$state",
    "Restangular",
    ($scope,$http, $log, $translate, $state, Restangular) => {
      $scope.app.title = $translate.instant("app.catalog.categorieslist");

      var previousValue;
      $scope.editMode  = null;

   
  
  
      // TO API CONNECT
      $scope.isdragdrop = false;
      $scope.treeOptions = {
        beforeDrag: sourceNodeScope => {
            console.log($scope.editMode);
          if (!$scope.editMode) {
            console.log("modo edicion");
            $scope.isdragdrop = true;
            return true;
          } else {
            console.log("modo  NO edicion");
            $scope.isdragdrop = false;
            return false;
          }
        },
        accept: (sourceNodeScope, destNodesScope, destIndex) => {
          var srcId = sourceNodeScope.$modelValue.Id;
          var destId = destNodesScope.$modelValue[0].Id;
          $scope.acceptable = true;
          return $scope.acceptable;
        },
        dropped: event => {
          if (!$scope.editMode) {
            console.log("modo  edicion");
          
           // console.log(itemCategory);
            console.log(event.source.nodeScope);
            if (event.dest.nodesScope.$parent.$modelValue == undefined) {
              var itemCategory = {
                id: event.source.nodeScope.$modelValue.id,
                name: event.source.nodeScope.$modelValue.name,
                parentId: null
              };
              console.log(itemCategory);
              // var res = $http.post('inv/categories/', itemCategory);
              // res.success(function(data, status, headers, config) {
              //  console.log(data);
              // });
              // res.error(function(data, status, headers, config) {
              //   console.log( "failure message: " + JSON.stringify({data: data}));
              // });		
              Restangular.one("catalog")
                .all("categories")
                .post(itemCategory )
                .then(result => {
                  $log.info(
                    "el nuevo padre es null lo estoy llevando a la raiz como padre"
                  );
                });
            } else {
              if (
                event.source.nodeScope.$parentNodeScope == null ||
                event.source.nodeScope.$parentNodeScope.$modelValue.id !=
                  event.dest.nodesScope.$parent.$modelValue.id
              ) {
                var itemCategory = {
                  id: event.source.nodeScope.$modelValue.id,
                  name: event.source.nodeScope.$modelValue.name,
                  parentId: event.dest.nodesScope.$parent.$modelValue.id
                };
                // var res = $http.post('inv/categories/', itemCategory);
                // res.success(function(data, status, headers, config) {
                //  console.log(data);
                // });
                // res.error(function(data, status, headers, config) {
                //   console.log( "failure message: " + JSON.stringify({data: data}));
                // });		
                //  cuando quiero subir un nodo raiz
                Restangular.one("catalog")
                  .all("categories")
                //  .one("parent", event.dest.nodesScope.$parent.$modelValue.id)
                  .post( itemCategory)
                  .then(result => {});
              }
            }

            if ($scope.acceptable) {
              var srcNode = event.source.nodeScope;
              var destNodes = event.dest.nodesScope;
              var srcId = srcNode.$modelValue.Id;
              var success = false;
            }
            //  reset de las banderas de ciclo
            $scope.acceptable = false;
            $scope.isdragdrop = false;
          } else {
            console.log("modo  NO edicion");
          }
        },
        itemRemoved: (scope, modelData, sourceIndex) => {},
        removed: node => {
          if ($scope.isdragdrop) {
          } else {
            Restangular.one("catalog")
              .one("categories", node.$modelValue.id)
              .remove()
              .then(result => {});
          }
        }
      };

      $scope.app.title = $translate.instant("app.catalog.categorieslist");
      $scope.updateItem = function(scope) {
        console.log("llego");
        var itemCategory = {
          id: scope.selectedCategory.id,
          name: scope.selectedCategory.name,
          parentId: scope.selectedCategory.parentId
        };
        $scope.selectedCategory = scope.$modelValue;
        console.log(itemCategory);
        if ($scope.selectedCategory.parentId == undefined)
          $scope.selectedCategory.parentId = 0;
        Restangular.one("catalog")
          .all("categories")
          .post(itemCategory)
          .then(result => {
            if ($scope.selectedCategory.id === 0) {
              // nodo sin padre
              var length = $scope.items.push({
                id: result.id,
                name: $scope.selectedCategory.name,
                parentId: 0,
                items: []
              });
            }
            $scope.cancelCategory();
          });
      };
      $scope.editNode = scope => {
        $log.info(scope.$modelValue.id);
        $log.info(scope.$modelValue.name);
        $log.info(scope.$modelValue.parentId);
        $scope.selectedCategory = scope.$modelValue;

        console.log("editNode");
        console.log($scope.selectedCategory);
        $scope.saveCategory(scope);
      };
      $scope.editNewNode = scope => {
        $log.info(scope.id);
        $log.info(scope.name);
        $log.info(scope.parentId);
        $scope.selectedCategory = scope;
        $scope.editMode =true;
      };
      $scope.saveCategory = scope => {
        var itemCategory = {
          id: $scope.selectedCategory.id,
          name: $scope.selectedCategory.name,
          parentId: $scope.selectedCategory.parentId
        };
        console.log("saveCategory");
        console.log($scope.selectedCategory);
        if ($scope.selectedCategory.parentId == undefined)
          $scope.selectedCategory.parentId = 0;
        Restangular.one("catalog")
          .all("categories")
          .post(itemCategory)
          .then(result => {
            if ($scope.selectedCategory.id === 0) {
              // nodo sin padre
              var length = $scope.items.push({
                id: result.id,
                name: $scope.selectedCategory.name,
                parentId: 0,
                items: []
              });
            }
            $scope.cancelCategory();
          });
      };
      $scope.new  = () => {
        var itemCategory = {
          id: 0,
          name: "Nueva categoria",
          parentId: null
        };
        Restangular.one("catalog")
        .all("categories")
        .post(itemCategory)
        .then(
          result => {
            Restangular.one("catalog")
            .one("categories")
            .get()
            .then(result => {
              $scope.items = result.plain() || [];
              $scope.selectedCategory = {
                id: 0,
                name: "",
                parentId: 0,
                items: []
              };
            });
          
      });
    };

      $scope.newNode = scope => {
        var nodeData = scope.$modelValue;
        var itemCategory = {
          id: 0,
          name: "Nueva categoria",
          parentId: scope.$modelValue.id
        };

        Restangular.one("catalog")
          .all("categories")
          .post(itemCategory)
          .then(
            result => {
              var length = nodeData.items.push({
                id: result.id,
                name: "Nuevo Nodo",
                parentId: scope.$modelValue.id,
                items: []
              });

              var item = nodeData.items[length - 1];
              $log.info(item);
              scope.$modelValue = item;
              $scope.editNode(scope);
            },
            res => {
              $log.info("There was an error saving" + res.status);
            }
          );
      };

      $scope.cancelCategory = () => {
        $scope.selectedCategory = {
          id: 0,
          name: "",
          workflowId: $scope.workflow.id,
          parentId: 0,
          items: []
        };
      };

      $scope.remove = scope => {
        scope.remove();
      };

      $scope.toggle = scope => {
        scope.toggle();
      };

      $scope.collapseAll = () => {
        $scope.$broadcast("angular-ui-tree:collapse-all");
      };

      $scope.expandAll = () => {
        $scope.$broadcast("angular-ui-tree:expand-all");
      };

      Restangular.one("catalog")
        .one("categories")
        .get()
        .then(result => {
          $scope.items = result.plain() || [];
          $scope.selectedCategory = {
            id: 0,
            name: "",
            parentId: 0,
            items: []
          };
        });
    }
  ])
  .controller("CatalogCategoriesEditController", [
    "$scope",
    "$translate",
    "$stateParams",
    "$state",
    "$filter",
    "Restangular",
    "toastr",
    (
      $scope: any,
      $translate,
      $stateParams,
      $state,
      $filter,
      Restangular,
      toastr
    ) => {
      var mockCategories = [
        {
          id: 1,
          name: "Agua",
          parentId: null
        },
        {
          id: 2,
          name: "Energia",
          parentId: null
        },
        {
          id: 3,
          name: "Medio Ambiente",
          parentId: null
        },
        {
          id: 4,
          name: "Desarrollo empresario",
          parentId: null
        },
        {
          id: 4,
          name: "Desarrollo Ciudadano",
          parentId: null
        },
        {
          id: 5,
          name: "Empleo",
          parentId: null
        },
        {
          id: 6,
          name: "Salud",
          parentId: null,
          parentDescription: null
        },
        {
          id: 7,
          name: "Solar",
          parentId: 2
        },
        {
          id: 8,
          text: "Eolica",
          parentId: 2
        },
        {
          id: 8,
          name: "Sustentable",
          parentId: 3
        },
        {
          id: 9,
          name: "Recursos Humanos",
          parentId: 5
        }
      ];

      var id = $stateParams.categoryId;
      $scope.parentId = null;

      function load() {
        if (id) {
          //   Restangular.one('catalog').one('categories', id).get().then(result => {
          //   $scope.category = result;
          // });

          var res = $filter("filter")(mockCategories, { id: id });
          if (res.length > 0) {
            console.log(res);
            $scope.category = res[0];
          }
        }
      }

      $scope.save = () => {
        if (id) {
          $scope.category.put().then(() => {
            $state.go("app.catalog.categories");
          });
        } else {
          Restangular.service("catalog/categories")
            .post($scope.category)
            .then(() => {
              $state.go("app.catalog.categories");
            });
        }
      };
      load();
    }
  ])
  .directive("catalogCategoriesGrid", ($state, Restangular, authManager) => {
    return {
      restrict: "A",
      scope: { height: "@", selectedItems: "=", typeId: "@" },
      link(scope: any, element, attrs, ctrl) {
        var gridElementName = "catalogCategoriesGrid";
        var pagerElementName = gridElementName + "Pager";
        var gridElement = angular.element("<table></table>");
        gridElement.attr("id", gridElementName);
        var pagerElement = angular.element("<div></div>");
        pagerElement.attr("id", pagerElementName);
        element.append(gridElement);
        element.append(pagerElement);

        scope.height = scope.height || 450;
        scope.typeId = scope.typeId || null;

        var colNames = ["", "Id", "Nombre", "Id Padre", "Nombre Padre"];
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
          { name: "id", index: "id", search: false },
          { name: "name", index: "name", search: true },
          { name: "parentId", index: "parentId", search: false },
          {
            name: "parentDescription",
            index: "parentDescription",
            search: false
          }
        ];

        gridElement.jqGrid({
          regional: "es-ar",
          url: "/app/catalog/api/categories.json",
          datatype: "json",
          height: scope.height,
          autowidth: true,
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
          loadBeforeSend: function(jqXHR) {
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
            root: "data"
          },
          beforeRequest: () => {
            var currentPage = gridElement.jqGrid("getGridParam", "page");
            gridElement.jqGrid("setGridParam", {
              postData: { skip: (currentPage - 1) * 100, take: 100 }
            });
            if (scope.typeId != null) {
              gridElement.jqGrid("setGridParam", {
                postData: { typeId: scope.typeId }
              });
            }
          },
          beforeSelectRow() {
            return false;
          },
          onCellSelect(rowId, iCol) {
            if (iCol === 0) {
              var stateName = "app.catalog.categoryedit";
              $state.go(stateName, { categoryId: rowId });
            }

            return false;
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
      }
    };
  })
  .directive(
    "catalogProductLookup",
    ($compile, $parse, $document, $log, dialogs, authManager) => {
      return {
        restrict: "A",
        require: "ngModel",
        transclude: true,
        scope: {
          ngModel: "=",
          isShown: "@ngShow",
          width: "@",
          showAddNew: "@",
          onSelect: "&?"
        },
        link: (scope: any, element, attr: any, ctrl: any, transclude) => {
          scope.placeholder = "Seleccione un elemento";
          scope.url = "/app/catalog/api/categories.lookup.json";
          scope.multiple = false;
          scope.showAddNew = false;
          scope.attributes = [{ name: "parentId", required: false }];

          //  scope.id = angular.isDefined(attr.id) ? attr.id : attr.lookup;
          scope.id = "catalogCategoriesLookup";
          scope.width = angular.isDefined(attr.width) ? attr.width : "100%";
          scope.filter = angular.isDefined(attr.filter) ? attr.filter : "";
          if (angular.isDefined(attr.showAddNew)) {
            scope.showAddNew = attr.showAddNew.match(/true/i);
          }

          var inputGroupElement = angular.element(
            '<div class="input-group select2-bootstrap-append"></div>'
          );

          var page;
          var selectElement = angular.element(
            `<select name="${scope.id}" style="width: ${scope.width};" ng-required="true"></select>`
          );
          selectElement.attr("id", scope.id);

          function checkAttributes() {
            if (scope.attributes && scope.attributes.length > 0) {
              _.forEach(scope.attributes, (attribute: any) => {
                if (attribute.required && attr[attribute.name] == null) {
                  $log.error(
                    `Lookup: ${scope.id} - Attribute: ${attribute.name} is missing.`
                  );
                  return false;
                }
              });
            }

            return true;
          }

          function buildData() {
            var data = {};
            if (scope.attributes && scope.attributes.length > 0) {
              _.forEach(scope.attributes, (attribute: any) => {
                data[attribute.name] = attr[attribute.name];
              });
            }

            return data;
          }

          var select2Options = {
            theme: "bootstrap",
            placeholder: scope.placeholder,
            allowClear: scope.allowClear || false,
            multiple: scope.multiple,

            ajax: {
              url: scope.url,
              headers: { Authorization: "Bearer " + authManager.getToken() },
              dataType: "json",
              quietMillis: 100,
              delay: 250,
              data: params => {
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
              processResults: data => {
                var more = page * 100 < data.total;
                if (scope.id == "catalogCategoriesLookup") {
                  for (var i = 0; i < data.data.length; i++) {
                    console.log(data.data);
                    console.log(data.data[i].text);
                    //var vecItem = angular.fromJson(data.data[i].text);
                    // console.log(angular.fromJson(data.data[i].text));
                    var vecItem = data.data[i];
                    console.log(vecItem);
                    if (
                      angular.isDefined(attr.showLastMemberOnly) &&
                      attr.showLastMemberOnly
                    ) {
                      var category: any = _.last(vecItem);
                      data.data[i].text = category.text;
                    } else {
                      console.log("llego aca");
                      var strItem = "";
                      for (var j = 0; j < vecItem.length; j++) {
                        strItem += vecItem[j].text;
                        if (j != vecItem.length - 1) {
                          strItem += " - ";
                        }
                      }
                      data.data[i].text = vecItem.text;
                    }
                  }
                }
                return {
                  results: data.data,
                  pagination: { more: more }
                };
              }
            }
          };

          inputGroupElement.append(selectElement);

          if (scope.showAddNew) {
            var newButtonElement = angular.element(
              '<span class="input-group-btn"><button class="btn btn-default" type="button" data-ng-click="addNew()"><i class="fa fa-file-o"></i></button></span>'
            );
            inputGroupElement.append(newButtonElement);
            $compile(newButtonElement)(scope);
          }
          try {
            inputGroupElement.append(transclude());
          } catch (e) {}

          element.replaceWith(inputGroupElement);

          attr.$observe("disabled", value => {
            selectElement.prop("disabled", value);
          });

          checkAttributes();

          $compile(selectElement)(scope);
          var select2Element = selectElement.select2(select2Options);

          element.bind("$destroy", () => {
            select2Element.select2("destroy");
          });

          attr.$observe("readonly", value => {
            selectElement.prop("readonly", !!value);
          });

          scope.$watch("isShown", value => {
            if (angular.isUndefined(value)) {
              value = true;
            }

            if (value === true || value === "true") {
              inputGroupElement.show();
            } else {
              inputGroupElement.hide();
            }
          });

          select2Element.on("select2:select", e => {
            scope.$apply(() => {
              var value = null;

              if (angular.isDefined(attr.modelProperty)) {
                if (attr.modelProperty === "text") {
                  value = e.params.data.text;
                } else {
                  value = e.params.data[attr.modelProperty];
                }
              } else {
                value = e.params.data.id;
              }

              if (angular.isDefined(scope.onSelect)) {
                scope.onSelect({ value: value, text: e.params.data.text });
              } else {
                if (scope.multiple) {
                  ctrl.$modelValue.push(value);
                } else {
                  if (
                    angular.isDefined(attr.modelProperty) &&
                    attr.modelProperty === "text"
                  ) {
                    ctrl.$setViewValue({
                      value: e.params.data.text,
                      valueId: e.params.data.id
                    });
                  } else {
                    ctrl.$setViewValue(value);
                  }
                }
              }
            });
          });

          select2Element.on("select2:unselect", e => {
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

          scope.addNew = () => {
            var modalInstance = dialogs.create(
              scope.addNewDialogTemplate,
              scope.addNewDialogController,
              {},
              { size: "lg", animation: false }
            );
            modalInstance.result.then(
              result => {
                if (scope.multiple) {
                  ctrl.$modelValue.push(result.id);
                } else {
                  ctrl.$setViewValue(result.id);
                }
              },
              () => {}
            );
          };

          scope.$watch("ngModel", value => {
            if (value) {
              if (angular.isArray(ctrl.$modelValue)) {
                if (ctrl.$modelValue.length > 0) {
                  var ids = ctrl.$modelValue.join();

                  $.getJSON(scope.url, { ids: ids, format: "json" }, result => {
                    _.forEach(result.data, (item: any) => {
                      var option = new Option(item.text, item.id, true, true);
                      selectElement.append(option);
                    });
                    selectElement.trigger("change");
                  });
                }
              } else {
                var id = ctrl.$modelValue;
                if (typeof id === "object") {
                  id = id.valueId;
                }
                $.getJSON(scope.url, { id: id, format: "json" }, result => {
                  _.forEach(result.data, (item: any) => {
                    var vecItem = angular.fromJson(item.text);
                    var strItem = "";
                    for (var j = 0; j < vecItem.length; j++) {
                      strItem += vecItem[j].Name;
                      if (j != vecItem.length - 1) {
                        strItem += " - ";
                      }
                    }
                    item.text = strItem;

                    var option = new Option(item.text, item.id, true, true);
                    selectElement.append(option);
                  });
                  selectElement.trigger("change");
                });
              }
            } else {
              selectElement.val(null);
              selectElement.trigger("change");
            }
          });
        }
      };
    }
  );
