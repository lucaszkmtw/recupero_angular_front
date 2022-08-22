angular.module('app.system.documentmanagement', ['app.system'
])
    .filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace !== -1) {
                    if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                        lastspace = lastspace - 1;
                    }
                    value = value.substr(0, lastspace);
                }
            }
            return value + (tail || ' …');
        };
    })
    .config(($stateProvider) => {
        $stateProvider
            .state('app.filemanager',
            {
                url: '/folders',
                params: { folderGuid: null },
                controller: 'SystemDocumentManagementFileManagerController',
                templateUrl: 'app/system/documentmanagement/index.html',
                resolve: loadSequence('angularFileUpload', 'toastr', 'imageviewer', 'infinite-scroll'),
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'system.documentmanagement.filemanager'
                }
            })
            .state('app.filemanager.folder',
            {
                url: '/{folderGuid}',
                controller: 'SystemDocumentManagementFileManagerFolderController',
                template: '<system-document-management-file-manager></system-document-management-file-manager>',
                resolve: loadSequence('angularFileUpload', 'toastr', 'imageviewer',  'infinite-scroll'),
                ncyBreadcrumb: {
                    skip: false,
                    parent: 'app.dashboard',
                    label: 'system.documentmanagement.filemanager'
                }
            });
    })
    .controller('SystemDocumentManagementFileManagerController', ($log, $scope, $rootScope, $translate, $state, $stateParams, $timeout, dialogs) => {
        // $timeout(() => {
        //     if ($stateParams.folderGuid === 'root') {
        //         var profileFolderGuid = $rootScope.session.profileFolderGuid;
        //         $state.go('app.filemanager.folder', { folderGuid: profileFolderGuid });
        //     }
        // });
    })
    .controller('SystemDocumentManagementFileManagerFolderController', () => { })
    .controller('SystemDocumentManagementNewFolderController', ($scope, $uibModalInstance) => {
        $scope.newFolder = {};

        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };

        $scope.ok = () => {
            $uibModalInstance.close($scope.newFolder.name);
        };
    })
    .controller('SystemDocumentManagementImageViewerController', ($log, $scope, $uibModalInstance, data) => {
        $scope.data = data;

        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };

        $scope.ok = () => {
            $uibModalInstance.close($scope.newFolder.name);
        };
    })
    .directive('systemDocumentManagementFileManager', ($log, $rootScope, $state, $stateParams, $timeout, dialogs, Restangular, toastr) => {
        return {
            restrict: 'AE',
            $scope: { height: '@' ,folderguid: '@',readonly:'@', resoureType: '@'},
            templateUrl: 'app/system/documentmanagement/filemanager.html',
            link($scope: any, element) {

                //console.log('controller');
                console.log($scope);
                $scope.params = {
                    filter: null,
                    resoureType: null,
                    showSearchResults: false,
                    fileViewerOptions: null,
                    isBusy: false
                };
                if($scope.resoureType){
                    $scope.params.resoureType = $scope.resoureType;
                }

                $scope.folders = [];
                $scope.session = $rootScope.session;
               
               // $scope.folderGuid =  scope.folderGuid || $stateParams.folderGuid;
               // console.log( $scope);
                // $scope.navigate = (guid) => {
                //     $state.go('app.filemanager.folder', { folderGuid: guid });
                // };

                $scope.navigate = (guid) => {
                    if(guid){
                        $scope.folderGuid = guid;
                    }else{
                        $scope.folderGuid =   $scope.folderGuid || guid;
                    }
                 
                   // console.log( $scope.folderGuid);
                   console.log('navigate');
                   console.log($scope.folderGuid); 
                   $scope.load($scope.folderGuid, false);
                  // $state.go('app.filemanager.folder', { folderGuid:  $scope.folderGuid });

                };

                $scope.search = () => {
                    $scope.params.isBusy = true;
                    
                    Restangular.one('system')
                        .one('documentmanagement')
                        .one('search')
                        .get({ q: $scope.params.filter, resoureType: $scope.params.resoureType })
                        .then((results) => {
                            $scope.searchResults = results;
                            $scope.params.showSearchResults = true;
                            $scope.params.isBusy = false;
                        }, () => {
                            $scope.searchResults = null;
                            $scope.params.showSearchResults = false;
                            $scope.params.isBusy = false;
                        });
                };

                $scope.load = (folderGuid, readonly) => {
           
               if(folderGuid)
               {
                $scope.folderGuid = folderGuid;
               }
                 //   $scope.folderGuid =   $scope.folderGuid || folderGuid;
                    $scope.readonly =readonly;
                   // console.log( $scope.folderGuid);
                    Restangular.one('system')
                        .one('documentmanagement')
                        .one('folders',  $scope.folderGuid)
                        //.get({ limit: 100 })
                        .get()
                        .then((result) => {
                            $scope.folder = result;
                            updateFolders();
                        });
                }

                function updateFolders() {
                    $scope.folders = [];
                    var n = $scope.folder.children.length > 100 ? 100 : $scope.folder.children.length;
                    var toAdd = _.take($scope.folder.children, n);
                    $scope.folders = _.concat($scope.folders, toAdd);
                    $scope.folder.children = _.slice($scope.folder.children, n);
                    console.log( $scope.folders);

                    $scope.folder.files.forEach(file => {
                        file.selected = false;
                    });
                }

                $scope.selectFile = ($event, file) =>{
                    var checkbox = $event.target;
                    if(checkbox.checked){
                       
                       
                        $scope.$broadcast("selectFile",file.url);
                        $scope.folder.files.forEach(item => {
                            
                            if(file.id != item.id ){
                                item.selected = false;
                            }
                        });
                    }
                }
                $scope.loadMore = () => {
                    // if ($scope.folder) {
                    //     updateFolders();
                    // }
                };

                $scope.newFolder = () => {
                    var modalInstance = dialogs.create('systemDocumentManagementNewFolder.html', 'SystemDocumentManagementNewFolderController',
                        null,
                        { size: 'md', animation: false , windowClass: "zindexpus"});
                    modalInstance.result.then((dialogResult) => {
                        $scope.folderGuid =  $scope.folderGuid || $stateParams.folderGuid;
                        Restangular.one('system')
                            .one('documentmanagement')
                            .one('folders',$scope.folderGuid) // $stateParams.folderGuid)
                            .customPOST({ name: dialogResult })
                            .then((result) => {
                                $scope.load($scope.folderGuid); //$stateParams.folderGuid);
                                toastr.success('Administrador de documentos', 'La carpeta se creó con éxito.');
                            });
                    },
                        () => {
                            toastr.error('Administrador de documentos', 'Se produjo un error al intentar crear la carpeta.');
                        });
                };

                $scope.viewFile = ($event, selectedFile) => {
                  //  console.log($scope.folder.files);
                 //    console.log(selectedFile);
                    $scope.params.fileViewerOptions = { files: $scope.folder.files, selectedFile: selectedFile };
                };

                $rootScope.$on('fileuploadcomplete', () => {
                    $scope.load( $scope.folderGuid);//$stateParams.folderGuid);
                });

                if(!$scope.readonly){
                    $scope.readonly = false;
                   }
                 
                    $timeout(() => {
                      
                        $scope.load($scope.folderguid,$scope.readonly);
                  
                    }, 0);
            },
            // link(scope: any, element) {
            //    console.log('link');
              
            //    console.log(scope.folderguid);
            //    console.log(scope.selectedFile);
            //    if(!scope.readonly){
            //     scope.readonly = false;
            //    }
             
            //     $timeout(() => {
                    
            //         scope.load(scope.folderguid,scope.readonly);
            //         // if ($stateParams.folderGuid) {
            //         //     scope.load($stateParams.folderGuid);
            //         // }
            //     }, 0);
            // }
        };
    })
    .directive('systemDocumentManagementFileUpload', ($log, $rootScope, FileUploader,authManager) => {
        return {
            restrict: 'AE',
            scope: { folderGuid: '@', isBusy: '=?' },
            templateUrl: 'app/system/documentmanagement/fileupload.html',
            controller($scope: any) {
                $scope.uploader = new FileUploader({
                    scope: $scope,
                    autoUpload: true,
                    queueLimit: 100,
                     
                    removeAfterUpload: true,
                    onCompleteAll: () => {
                        $scope.isBusy = false;
                        $rootScope.$broadcast('fileuploadcomplete');
                    }
                });
            },
            link(scope: any, element) {
                scope.uploader.onBeforeUploadItem = (item) => {
                    scope.isBusy = true;
                    item.headers = { "Authorization" : "Bearer "+ authManager.getToken()};
                    item.url =  API_HOST + '/api/system/documentmanagement/folders/' + scope.folderGuid + '/files';
                }
            }
        };
    })

    .directive('systemDocumentManagementImageViewer', ($log, $compile) => {
        return {
            restrict: 'AE',
            scope: { data: '=' },
            link(scope: any, element) {
                scope.$watch('data',
                    () => {
                        if (angular.isDefined(scope.data) && scope.data != null) {

                            var imageContainer = angular.element('<ul></ul>');
                            _.forEach(scope.data.files,
                                (file: any) => {
                                    var imageElement = $compile('<li style="display: none;"><img style="width:90px;height:90px;" http-src="' + API_HOST + '/api/system/documentmanagement/files/' + file.guid + '" alt="' + file.name + '"></li>')(scope);

                                    imageContainer.append(imageElement);
                                });
                            

                            element.append(imageContainer);

                            var options = {
                                inline: false,
                                zIndex: 4000
                            };
                            console.log(scope.data);
                            console.log(imageContainer);
                            imageContainer.on({
                                'build.viewer': (e) => {
                                    $log.info(e.type);
                                },
                                'built.viewer': (e) => {
                                    $log.info(e.type);
                                },
                                'show.viewer': (e) => {
                                    $log.info(e.type);
                                },
                                'shown.viewer': (e) => {
                                    var fileIndex = _.findIndex(scope.data.files, (file: any) => { return file.id === scope.data.selectedFile.id })
                                    imageContainer.viewer('view', fileIndex);
                                    $log.info(e.type);
                                },
                                'hide.viewer': (e) => {
                                    $log.info(e.type);
                                },
                                'hidden.viewer': (e) => {
                                    scope.data = null;
                                    imageContainer.viewer('destroy', [], []);
                                    $log.info(e.type);
                                },
                                'view.viewer': (e) => {
                                    $log.info(e.type);
                                },
                                'viewed.viewer': (e) => {
                                    $log.info(e.type);
                                }
                            })
                                .viewer(options);

                           
;                            imageContainer.viewer('show', [], []);
                        }
                    });
            }
        };
    });