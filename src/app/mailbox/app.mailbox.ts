angular.module('app.mailbox', [
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'ui.router',
    'restangular',
    'pascalprecht.translate',
    'app.core'
]).config(['$stateProvider', ($stateProvider) => {
        $stateProvider
            .state('app.mailbox', {
                url: '/mailbox',
                abstract: true,
                template: '<ui-view/>',
                ncyBreadcrumb: {
                    skip: false,
                    label: 'mailbox'
                }
            })
            .state('app.mailbox.folder', {
                url: '/{folderName}',
                controller: 'MailBoxFolderController',
                templateUrl: 'app/mailbox/folder.html',
                resolve: loadSequence('icheck', 'toastr'),
                     //{
                    // loadPlugin: function ($ocLazyLoad) {
                    //     return $ocLazyLoad.load([
                    //         {
                    //             files: ['../Content/plugins/iCheck/custom.css', '../Content/plugins/iCheck/js/icheck.min.js']
                    //         }
                    //     ]);
                    // },
                //},
                ncyBreadcrumb: {
                    label: 'mailclients.mailbox'
                }
            })
            .state('app.mailbox.compose',
            {
                url: '/compose/{idaddress}',
                controller: 'MailBoxComposeController',
                templateUrl: "app/mailbox/compose.html",
                resolve: loadSequence('ngCkeditor', 'toastr', 'angularFileUpload'), 
                ncyBreadcrumb: {
                    label: 'mailbox.newmail'
                }
            })
            .state('app.mailbox.viewcompose',
            {
                url: '/viewcompose/{idaddress}/{id}',
                controller: 'MailBoxViewComposeController',
                templateUrl: "app/mailbox/mail.html",
                resolve: loadSequence('ngCkeditor', 'toastr'), 
                ncyBreadcrumb: {
                    label: 'mailbox.viewmail'
                }
            })
            .state('app.mailbox.configuration',
            {
                url: '/configuration/{idaddress}',
                controller: 'MailBoxConfigurationController',
                templateUrl: "app/mailbox/configuration.html",
                resolve: loadSequence('toastr'),
                         loadPlugin: function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                {
                                    files: ['../Content/plugins/iCheck/custom.css', '../Content/plugins/iCheck/js/icheck.min.js']
                                }
                            ]);
                },
                ncyBreadcrumb: {
                    label: 'mailbox.configuration'
                }
            });
    }])
    .controller('MailBoxFolderController', ['$log', '$scope', '$translate', '$location', '$stateParams', 'Restangular', '$state', '$http', 'toastr', ($log, $scope, $translate, $location, $stateParams, Restangular, $state, $http, toastr) => {
        $log.info('MailBoxFolderController:' + $stateParams.folderName);
    }])
    .controller('MailBoxComposeController', ['$scope', '$translate', '$location', '$stateParams', 'Restangular', '$log', '$state', 'toastr', ($scope, $translate, $location, $stateParams, Restangular, $log, $state, $toastr) => {
        $log.info('MailBoxComposeController:' + $stateParams.idaddress);
    }])
    .controller('MailBoxViewComposeController', ['$scope', '$translate', '$location', '$stateParams', 'Restangular', '$log', '$state', 'toastr', ($scope, $translate, $location, $stateParams, Restangular, $log, $state, $toastr) => {
        $log.info('MailBoxViewComposeController:' + $stateParams.idaddress);
    }])
    .controller('MailBoxConfigurationController', ['$scope', '$translate', '$location', '$stateParams', 'Restangular', '$log', '$state', 'toastr', ($scope, $translate, $location, $stateParams, Restangular, $log, $state, $toastr) => {
        $log.info('MailBoxConfigurationController:' + $stateParams.folderName);
    }])
    .directive('mailboxFolders', ($log, $parse, $http, Restangular, formService, dialogs) => {
        return {
            restrict: 'A',
            scope: {},
            controller: ['$scope', '$rootScope', '$stateParams', 'toastr', function MyController($scope, $rootScope, $stateParams, toastr) {
                {
                    $log.info("Controller de directiva mailboxFolders");

                    var vm = this;

                    vm.FillMailAccounts = function(){
                        // Llama la API de Cuentas de Correo 
                        //$scope.MailAccounts = Restangular.all('api/mailbox/mailaccounts.json');
                        $http.get("app/mailbox/api/mailaccounts.json").then(function(response){
                            vm.mailAccounts = response.data;
                            angular.forEach(vm.mailAccounts, function (account) {
                                if (account.default == "true") {
                                    vm.MailAccount = account;
                                    vm.idaddress = account.idaddress;
                                    vm.listFoldersByAccount(account);
                                    vm.listCategoriesByAccount();
                                }
                            });
                        }, function errorCallback(response){
                            toastr.success(response.statusText, 'Error');
                        });
                        $log.info("FillMailAccounts");
                    }

                    vm.FillMailAccounts();
                    
                    // Permite tener la cuenta seleccionada cuando se cambie la pantalla
                    // a compose o viewmail
                    vm.setMailAccount = function(idaddress){
                        angular.forEach(vm.mailAccounts, function (account) {
                            if (account.idaddress == idaddress) {
                                vm.MailAccount = account;
                            }
                        });
                    }

                    // Si stateParams
                    if($stateParams.idaddress>0){
                        vm.setMailAccount($stateParams.idaddress);
                    }

                    // Lista los Folders de la Cuenta de Correo seleccionada.
                    vm.listFoldersByAccount = function (account) {
                        $http.get("app/mailbox/api/mailfolders.json").then(function(response){
                            vm.folders = response.data;
                            vm.listMails({idaddress: account.idaddress, foldername: "Recibidos"});
                        });
                        //vm.email_form.mail_from = MailModel.displayname;
                    }

                    // Lista las Categorias de los correos.
                    vm.listCategoriesByAccount = function(){
                        $http.get("app/mailbox/api/mailcategories.json").then(function(response){
                            vm.categories = response.data;
                            //vm.listMails($stateParams.idaddress, "Inbox");
                        });
                    }

                    // Lista los Correos según la carpeta seleccionada.
                    vm.listMails = function (parametros) {
                        //var idaddress = $stateParams.idaddress;
                        $rootScope.$emit("ListaMails", {idaddress:parametros.idaddress, foldername:parametros.foldername});
                    }

                    // Lista las Categorias de los correos.
                    vm.listMailsByCategory = function(parametros){
                        $rootScope.$emit("ListaMailsCategory", {idaddress:parametros.idaddress, categoryname:parametros.categoryname});
                    }

                    // Descarta Correp.
                    vm.discard = function () {
                        $rootScope.$emit("discard");
                    }

                }
            }],
            controllerAs: 'vm',
            bindToController: { item: '=?item' },
            templateUrl: '/app/mailbox/folders.html',
            link: (scope, elm, attr, ctrl) => {
                //scope.form = ctrl[0];
                $log.info("Link de directiva mailboxFolders");
            }
        };
    })
    .directive('mailboxMails', ($log, $parse, $http, Restangular, formService, dialogs) => {
        return {
            restrict: 'A',
            scope: true,
            controller: ['$log', '$scope', '$rootScope', 'toastr', function MailBoxMailController ($log, $scope, $rootScope, toastr) {
                {
                    $log.info("Controller de directiva mailboxMails");

                    var vm = this;

                    $rootScope.$on("ListaMails", function(objeto, parametros){
                        vm.idaddress = parametros.idaddress;
                        vm.listaCorreos(parametros.foldername);
                    });

                    $rootScope.$on("ListaMailsCategory", function(objeto, parametros){
                        vm.idaddress = parametros.idaddress;
                        vm.listaCorreosCategoria(parametros.categoryname);
                    });

                    vm.listaCorreos = function(foldername){
                        var json_result;
                        $http.get("app/mailbox/api/mailbox.json").then(function(response){
                             json_result = response.data[0];
                             if(json_result!=undefined){
                                if(json_result.foldername==foldername){
                                    vm.EmailsByFolder = angular.fromJson(json_result.emails);
                                    // valores que se colocan en la lista de correos para identificar cuantos emails están pendientes por
                                    // leer, nombre de carpeta seleccionada
                                    vm.categoryfilter = "";
                                    vm.UnreadMessages = json_result.mailsunread;
                                    vm.FolderName = json_result.foldername;
                                    vm.Email = json_result.emails;
                                }else{
                                    vm.EmailsByFolder = [];
                                    vm.categoryfilter = "";
                                    vm.UnreadMessages = 0;
                                    vm.FolderName = foldername;
                                    vm.Email = [];
                                }
                            }
                        }, function error(response, status, statusText){
                            toastr.error("Error: " + status + " TextError: " + statusText, "Error");
                            //$log.info("Error: " + status + " TextError: " + statusText);
                        });
                        // 
                    };

                    vm.listaCorreosCategoria = function(categoryName){
                        var json_result;
                        $http.get("app/mailbox/api/mailbox.json").then(function(response){
                             json_result = response.data[0];
                             if(json_result!=undefined){
                                if(json_result.foldername=="Recibidos"){
                                    vm.EmailsByFolder = angular.fromJson(json_result.emails);
                                    // valores que se colocan en la lista de correos para identificar cuantos emails están pendientes por
                                    // leer, nombre de carpeta seleccionada
                                    vm.categoryfilter = categoryName;
                                    vm.UnreadMessages = json_result.mailsunread;
                                    vm.FolderName = json_result.foldername;
                                    vm.Email = json_result.emails;
                                }
                             }
                        }, function error(response, status, statusText){
                            toastr.error("Error: " + status + " TextError: " + statusText, "Error");
                            //$log.info("Error: " + status + " TextError: " + statusText);
                        });
                        // 
                    };

                    // método para validar si un email está seleccionado
                    // permite setear la variable para habilitar o deshabilitar los botones de unread, important y move to trash
                    vm.hasSelection = function () {
                        return _.filter(vm.Email, { 'checked': true}).length > 0;
                    };

                    vm.toggleSelection = function (mail) {
                        vm.hasSelection();
                    }

                    // Métodos para Refrescar, Marcar como leído correos, Marcar como importantes y Mover a Papelera
                    vm.refresh = function () {
                        vm.listaCorreos();
                    }

                    // Método para desmarcar correo seleccionado por el usuario
                    vm.markUnread = function () {
                        // Verifica si existen emails seleccionados.
                        //if (jQuery('input[name="mail.checked"]:checked').length > 0) {
                    if (_.filter(vm.Email, { 'checked': true}).length > 0) {
                            angular.forEach(vm.Email, function (email) {
                                if (email.checked == true) {
                                    email.isunread = false;
                                    email.checked = false;
                                }
                            });
                        }
                    }

                    // Método para masrcar como importante correo del usuario.
                    vm.markImportant = function () {
                        // Verifica si existen emails seleccionados.
                        //if (jQuery('input[name="mail.checked"]:checked').length > 0) {
                        if (_.filter(vm.Email, { 'checked': true}).length > 0) {
                            angular.forEach(vm.Email, function (email) {
                                if (email.checked == true) {
                                    email.isimportant = true;
                                } else {
                                    email.isimportant = false;
                                }
                            });
                        }
                    }

                    // Método para mover los emails seleccionados a la Papelera de Correo.
                    vm.moveTrash = function () {
                        // Verifica si existen emails seleccionados.
                        //if (jQuery('input[name="mail.checked"]:checked').length > 0) {
                        if (_.filter(vm.Email, { 'checked': true}).length > 0) {
                            angular.forEach(vm.Email, function (email) {
                                if (email.checked == true) {
                                    vm.Email.splice(email, 1);
                                }
                            });
                        }
                    }

                    // Método para seleccionar los emails o todos
                    //vm.toggleAll = function (item) {
                    //    var toogleStatus = !item.name_selected;
                    //    console.log(toogleStatus);
                    //    angular.forEach(item, function () {
                    //        angular.forEach(item.subs, function (sub) {
                    //            sub.selected = toogleStatus;
                    //        });
                    //    });
                    //}

                    // Métodos de ViewMail

                }
            }],
            controllerAs: 'vm',
            //bindToController: { item: '=?item' },
            templateUrl: '/app/mailbox/mails.html',
            link: (scope, elm, attr, ctrl) => {
                //scope.form = ctrl[0];
                $log.info("Link mailboxMails");
            }
        };
    })
    .directive('mailboxCompose', ($log, $parse, $http, Restangular, formService, dialogs, servicePrueba, ) => {
        return {
            restrict: 'A',
            scope: true,
            controller: ['$log', '$scope', '$rootScope', '$state', '$stateParams', 'toastr', 
                         function MailBoxComposeController ($log, $scope, $rootScope, $state, $stateParams, toastr ) {
                {
                    $log.info("Controller de directiva mailboxCompose");

                    var vm = this;

                    $rootScope.$on("discard", function(){
                        vm.discard();
                    });

                    // Lista los Correos según la carpeta seleccionada.
                    vm.listMails = function (parametros) {
                        //var idaddress = $stateParams.idaddress;
                        $rootScope.$emit("ListaMails", {idaddress:parametros.idaddress, foldername:parametros.foldername});
                    }

                    // Lista las Categorias de los correos.
                    vm.listMailsByCategory = function(parametros){
                        $rootScope.$emit("ListaMailsCategory", {idaddress:parametros.idaddress, categoryname:parametros.categoryname});
                    }

                    // Métodos de Compose Mail
                    vm.discard = function () {
                        $state.go("app.mailbox.folder",{idaddress: "1"});
                        toastr.warning('El correo ha sido descartado', 'Correo descartado');
                    }
                    vm.draft = function () {
                        $state.go("app.mailbox.folder",{idaddress: "1"});
                        toastr.info('El correo ha sido guardado como borrador.', 'Borrador');
                    }
                    // Permite validar si los campos obligatorios de la forma están completos, en caso contrario no habilita el botón de enviar correo.
                    vm.canSend = function () {
                        return vm.email_form.$dirty &&
                               vm.email_form.$valid;
                    }
                    // Permite enviar el correo cuando están validados los datos.
                    vm.send = function () {
                        toastr.success("El correo ha sido enviado satisfactoriamente", "Nuevo Correo");
                    }
                    vm.emailPattern = function () {
                        return /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
                    }

                    // Permite tener la cuenta seleccionada cuando se cambie la pantalla
                    // a compose o viewmail
                    vm.setMailAccount = function(idaddress){

                        $http.get("app/mailbox/api/mailaccounts.json").then(function(response){
                            vm.mailAccounts = response.data;
                            angular.forEach(response.data, function (account) {
                                if (account.idaddress == idaddress) {
                                    vm.mail_from = account.displayname;
                                }
                            });
                        }, function errorCallback(response){
                            toastr.error(response.statusText, "Error");
                        });
                        
                    }

                    vm.setMailAccount($scope.$stateParams.idaddress);

                }
            }],
            controllerAs: 'vm',
            //bindToController: { item: '=?item' },
            templateUrl: '/app/mailbox/composer.html',
            link: (scope, elm, attr, ctrl) => {
                //scope.form = ctrl[0];
                $log.info("Link mailboxCompose");
                servicePrueba.pruebita();
            }
        };
    })
    .directive('mailboxViewcompose', ($log, $parse, $http, Restangular, formService, dialogs) => {
        return {
            restrict: 'A',
            scope: true,
            controller: ['$log', '$scope', '$rootScope', '$state', '$stateParams', 'toastr', 
                         function ($log, $scope, $rootScope, $state, $stateParams, toastr ) {
                {
                    $log.info("Controller de directiva mailboxViewCompose");

                    var vm = this;

                    vm.replyflag = false;
                    vm.forwardflag = false;

                    $rootScope.$on("discard", function(){
                        vm.discard();
                     });

                    // Métodos de Compose Mail
                    vm.discard = function () {
                        var idaddress = vm.mail_from;
                        $state.go("app.mailbox.folder",{idaddress: idaddress});
                        toastr.warning('El correo ha sido descartado', 'Correo descartado');
                    }
                    // Permite validar si los campos obligatorios de la forma están completos, en caso contrario no habilita el botón de enviar correo.
                    vm.canSend = function () {
                        return vm.email_form.$dirty &&
                            vm.email_form.$valid;
                    }
                    vm.send = function () {
                        toastr.success("Email enviado satisfactoriamente", "Correo Enviado");
                        var idaddress = vm.mail_from;
                        $state.go("app.mailbox.folder", { idaddress: idaddress });
                    }
                    // Permite enviar el correo cuando están validados los datos.
                    vm.reply = function () {
                        vm.callMethod = "reply";
                        vm.replyflag = true;
                        vm.forwardflag = false;
                        vm.mail.mail_to_reply = vm.mail.senderid;
                        vm.mail.mail_subject_reply = "Re: " + vm.mail.subject;
                    }
                    // Permite enviar el correo cuando están validados los datos.
                    vm.forward = function () {
                        vm.callMethod = "forward";
                        vm.replyflag = false;
                        vm.forwardflag = true;
                        vm.mail.mail_subject_forward = "Re: " + vm.mail.subject;
                    }
                    vm.print = function () {
                        
                    }
                    vm.emailPattern = function () {
                        return /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
                    }

                    // Permite tener la cuenta seleccionada cuando se cambie la pantalla
                    // a compose o viewmail
                    vm.setMailAccount = function(idaddress){
                        $http.get("app/mailbox/api/mailaccounts.json").then(function(response){
                            vm.mailAccounts = response.data;
                            angular.forEach(response.data, function (account) {
                                if (account.idaddress == idaddress) {
                                    vm.mail_from = account.displayname;
                                }
                            });
                        }, function errorCallback(response){
                            toastr.error(response.statusText, "Error");
                        });
                    }

                    vm.setMailAccount($scope.$stateParams.idaddress);

                    // Permite tener la cuenta seleccionada cuando se cambie la pantalla
                    // a compose o viewmail
                    vm.viewCompose = function(id){
                        var json_result;
                        $http.get("app/mailbox/api/mailbox.json").then(function(response){
                            json_result = response.data[0];
                            if(json_result!=undefined){
                               var mails = angular.fromJson(json_result.emails);
                               angular.forEach(mails, function(mail, value){
                                 if(mail.id==id){
                                    vm.mail = mail
                                 }
                               })
                               
                            }
                       }, function error(response, status, statusText){
                           toastr.error("Error: " + status + " TextError: " + statusText, 'Error');
                       });
                    }

                    vm.viewCompose($scope.$stateParams.id);
                }
            }],
            controllerAs: 'vm',
            //bindToController: { item: '=?item' },
            templateUrl: '/app/mailbox/viewcompose.html',
            link: (scope, elm, attr, ctrl) => {
                //scope.form = ctrl[0];
                $log.info("Link mailboxViewCompose");
            }
        };
    })
    .directive('mailboxConfiguration', ($log, $parse, $http, Restangular, formService, dialogs) => {
        return {
            restrict: 'A',
            scope: true,
            controller: ['$log', '$scope', '$rootScope', 'toastr', function MailBoxConfigurationController ($log, $scope, $rootScope, toastr) {
                {
                    var vm = this;

                    vm.FillMailAccounts = function(){
                        // Llama la API de Cuentas de Correo 
                        //$scope.MailAccounts = Restangular.all('api/mailbox/mailaccounts.json');
                        $http.get("app/mailbox/api/mailaccounts.json").then(function(response){
                            vm.mailAccounts = response.data;
                        });
                    }

                    vm.FillMailAccounts();

                    vm.FillAccountForm = function(MailAccount){
                        vm.userName = MailAccount.friendlyname;
                        vm.email = MailAccount.displayname;
                        vm.incomingserver = MailAccount.configuration[0].incomingserver[0].servername;
                        vm.incomingserver_type = MailAccount.configuration[0].incomingserver[0].servertype;
                        vm.incomingserver_port = MailAccount.configuration[0].incomingserver[0].port;
                        vm.incomingserver_securityconnection = MailAccount.configuration[0].incomingserver[0].securityconnection;
                        vm.outgoingserver_authenticationmethod = MailAccount.configuration[0].incomingserver[0].authenticationmethod;
                        vm.outgoingserver = MailAccount.configuration[0].outgoingserver[0].servername;
                        vm.outgoingserver_type = MailAccount.configuration[0].outgoingserver[0].servertype;
                        vm.outgoingserver_port = MailAccount.configuration[0].outgoingserver[0].port;
                        vm.outgoingserver_securityconnection = MailAccount.configuration[0].outgoingserver[0].securityconnection;
                        vm.outgoingserver_authenticationmethod = MailAccount.configuration[0].outgoingserver[0].authenticationmethod;
                        vm.useremail = MailAccount.displayname;
                        vm.password = MailAccount.password;
                    }
                    vm.NewMailAccount = function(){
                        //toastr.success('Nueva Cuenta', 'La cuenta ha sido creada satisfactoriamente');
                    }
                    vm.DeleteMailAccount = function(MailAccount){
                        //toastr.success('Eliminar Cuenta', 'La cuenta ha sido eliminada satisfactoriamente');
                    }

                }
            }],
            controllerAs: 'vm',
            //bindToController: { item: '=?item' },
            templateUrl: '/app/mailbox/configmailaccount.html',
            link: (scope, elm, attr, ctrl) => {

            }
        };
    })
    .service('servicePrueba', function(){
        var pruebita = function(){
            alert("Prueba");
        }
    });