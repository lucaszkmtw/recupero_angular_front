/// <reference path="./lib.d.ts"/>

//FIXME
//var API_HOST = 'http://gestionrecuperoapi.azurewebsites.net';
//var API_HOST = 'http://dpgrcfapi.azurewebsites.net';
var API_HOST = 'http://localhost:50735';
//var API_HOST = 'http://10.50.90.12:50735';

class Events {
    public static readonly sessionChange = 'sessionChange';
};

angular.element(document).ready(() => {
    angular.module('app').value('sessionData', null);
    angular.bootstrap(document.getElementsByTagName('body')[0], ['app']);
});

var app = angular.module('app', [
    'ui.router',                    // Routing
    'oc.lazyLoad',                  // ocLazyLoad
    'ui.bootstrap',                 // Ui Bootstrap
    'ui.bootstrap.datetimepicker',
    'pascalprecht.translate',       // Angular Translate
    'ngIdle',                        // Angular Idle
    'angular-jwt',
    'perfect_scrollbar',
    'angular-loading-bar',
    'easypiechart',
    'ngAnimate',
    'ngTouch',
    //'app.mailing',
    'ngSanitize',                    // ngSanitize
    'angularMoment',
    'ncy-angular-breadcrumb',       // Angular Breadcrumb
    'dialogs.main',
    'restangular',                   // Restangular
    'ui.gravatar',
    'ui.select',
    'ngStorage',
    // 'dx',
    'angular.img',
    'angular-rating',
    'infinite-scroll',
    'thatisuday.ng-image-gallery',
    'app.core',
    'app.catalog',
    'app.cms',
    //'app.cart',
    'app.contacts',
    'app.crm',
    'app.dashboard',
    //'app.custom',
    //'app.financesmodule',
    'app.directives',
    'app.system',
    'app.businesspartners',
    'app.businessdocuments',
    'app.hr',
    'app.lms',
    'app.polls',
    'app.procurement',
    'app.projects',
    'app.sales',
    'app.health',
    'app.management',
    'app.financials',
    'app.loans',
    'app.crm.campaigns',
    'app.inv',
    'app.investments',
    'app.ipactos',
    'app.factoring',
    'app.mailbox',
    'app.wallet'
])
    .config(function Config($httpProvider, jwtOptionsProvider, $localStorageProvider, $sessionStorageProvider) {
        $localStorageProvider.setKeyPrefix('co');
        $sessionStorageProvider.setKeyPrefix('co');
        jwtOptionsProvider.config({
            unauthenticatedRedirectPath: '/login',
            whiteListedDomains: ['localhost', 'gestionrecuperoapi.azurewebsites.net', 'dpgrcfapi.azurewebsites.net', 'devapi.centraloperativa.com', 'api.centraloperativa.com'],
            tokenGetter: ['options', '$localStorage', '$sessionStorage', function (options, $localStorage, $sessionStorage) {
                // Skip authentication for any requests ending in .html
                if (options && options.url != null && (options.url.substr(options.url.length - 5) == '.html' || options.url.substr(options.url.length - 5) == '.htm')) {
                    return null;
                }

                var token = $sessionStorage.id_token;
                if (token == null) {
                    token = $localStorage.id_token;
                }
                return token;
            }]
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    })
    .factory('session', ($log, $http, $rootScope, $state, $window, Restangular, sessionData, $localStorage, $sessionStorage) => {
        var session: ISession;

        function buildSession() {
            if (!session) {
                session = <ISession>{};
                angular.extend(session, sessionData);
            }

            angular.extend(session, {
                logOut: (success, error) => {
                    Restangular.all('auth').one('logout').get().then(data => {
                        $sessionStorage.$reset();
                        session = data.plain();
                        buildSession();
                        $rootScope.session = session;
                        if (success) {
                            success(null);
                        } else {
                            $state.go('login.signin');
                        }
                    });
                },
                setTenant: (tenantId, success, error) => {
                    $http.post(API_HOST + '/api/sessions/settenant', { 'tenantId': tenantId}).then((response) => {
                        if (angular.isDefined(response.data.bearerToken)) {
                            $localStorage.id_token = response.data.bearerToken;
                            $localStorage.refresh_token = response.data.refreshToken;
                            $sessionStorage.id_token = response.data.bearerToken;
                            $sessionStorage.refresh_token = response.data.refreshToken;
                        }

                        session = response.data.session;
                        buildSession();
                        $rootScope.session = session;

                        $rootScope.$broadcast(Events.sessionChange);
                        $rootScope.$broadcast('menu:reload');
                        $state.go('app.dashboard');

                        if (angular.isDefined(success)) {
                            success();
                        }
                    });
                },
                impersonate: (id, name, rol, success, error) => {
                    Restangular.all('sessions').one('impersonate').post(id).then(data => {
                        session = data.plain();
                        buildSession();
                        $rootScope.session = session;
                        $rootScope.$broadcast('session:impersonated');
                        success();
                    });
                },
                isAdmin: () => session && session.isInRole('admin'),
                reload: (success, error) => {
                    Restangular.all('sessions').one('mysession').get().then(data => {
                        session = data.plain();
                        buildSession();
                        $rootScope.session = session;
                        if (success) {
                            success();
                        }
                    });
                },
                bind: (sessionData) => {
                    session = sessionData;
                    buildSession();
                    $rootScope.session = session;
                    $rootScope.$broadcast(Events.sessionChange);
                    $rootScope.$broadcast('menu:reload');
                },
                isInRole(roleName) {
                    return _.includes(session.roles, roleName);
                }
            });

//            if (session.tenants && session.tenants.length > 0 && session.tenantId) {
//                session.tenant = _.find(session.tenants, { id: session.tenantId });
//            }
        }

        buildSession();
        $rootScope.session = session;
        return $rootScope.session;
    })
    .service('screen', ['$rootScope', $rootScope => {

    }])
    .factory('settings', ['$rootScope', $rootScope => {
        // supported languages
        var settings = {
            layout: {
                pageSidebarClosed: false, // sidebar menu state
                pageBodySolid: false, // solid body color state
                pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
            },
            layoutImgPath: 'Content/img/',
            layoutCssPath: 'Content/css/'
        };

        $rootScope.settings = settings;
        return settings;
    }])
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }])
    /*
    .config((uiGmapGoogleMapApiProvider) => {
        uiGmapGoogleMapApiProvider.configure({
            transport: 'http',
            language: 'es',
            key: 'AIzaSyC-aYmVKMaOUPbnviHi16W19Dyh57ornHY',
            libraries: 'places,drawing,weather,geometry,visualization'
        });
    })
    */
    .config(($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, $locationProvider) => {
        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.filter = $filterProvider.register;
        app.factory = $provide.factory;
        app.service = $provide.service;
        app.constant = $provide.constant;
        app.value = $provide.value;

        // LAZY MODULES
        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: jsRequires.modules
        });

        $urlRouterProvider.otherwise('/app/dashboard');
        $locationProvider.html5Mode(true).hashPrefix('!');

        //
        // Set up the states
        $stateProvider.state('app', {
            url: '/app',
            controller: 'AppController',
            templateUrl: 'app/common/content.html',
            // resolve: 
            resolve: {
                onload: function ($q, $http, $state, $ocLazyLoad, session) {
                    loadSequence('tableDnD', 'kendotreeview', 'toastr', 'icheck', 'jqueryui', 'jqGrid', 'ngStorage');
                    var deffered = $q.defer();
                    var promise = $http.get(API_HOST + '/api/sessions/mysession.json').then((response) => {
                        session.bind(response.data);
                        deffered.resolve();
                    }, (response) => {
                        if (response.status == 401) {
                            $state.go('login.signin');
                        }
                        // Handle error
                        var data = response.data;
                        var status = response.status;
                        var statusText = response.statusText;
                        var headers = response.headers;
                        var config = response.config;
                    });

                    return deffered.promise;
                }
            },
            abstract: true,
            ncyBreadcrumb: {
                skip: true
            }
        })
            // Login routes
            .state('login', {
                url: '/login',
                template: '<div ui-view class="fade-in-right-big smooth"></div>',
                abstract: true
            }).state('login.signin', {
                url: '/signin/{token}',
                controller: 'SignInController',
                resolve: loadSequence('ng-backstretch', 'login-soft'),
                templateUrl: 'app/login/signin.html'
            }).state('login.forgot', {
                url: '/forgot',
                templateUrl: 'app/login/forgot.html'
            }).state('login.registration', {
                url: '/registration',
                templateUrl: 'app/login/registration.html'
            }).state('login.lockscreen', {
                url: '/lock',
                templateUrl: 'app/login/lock_screen.html'
            });
    })
    .config(['gravatarServiceProvider', gravatarServiceProvider => {
        gravatarServiceProvider.defaults = {
            size: 100,
            "default": 'mm'  // Mystery man as default for missing avatars
        };

        // Use https endpoint
        gravatarServiceProvider.secure = true;
    }
    ])
    .run(($log, $rootScope, $state, $stateParams, $location, $templateCache, $http, session, authManager, amMoment) => {
        // Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
        //FastClick.attach(document.body);

        $rootScope.$on("$stateChangeError", console.log.bind(console));
        amMoment.changeLocale('es-ar');
        //authManager.checkAuthOnRefresh();
        //authManager.redirectWhenUnauthenticated();
        angular.module('app').value('sessionData', null);

        // Set some reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.session = session;
        $rootScope.showHelp = false;

        $rootScope.commands = [];

        // GLOBAL APP SCOPE
        $rootScope.app = {
            name: 'Central Operativa', // name of your project
            author: 'ArventGroup', // author's name or company name
            description: 'Central Operativa', // brief description
            version: '1.0', // current version
            year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
            isMobile: (() => {// true if the browser is a mobile device
                var check = false;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    check = true;
                };
                return check;
            })(),
            layout: {
                isNavbarFixed: true, //true if you want to initialize the template with fixed header
                isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
                isFooterFixed: false, // true if you want to initialize the template with fixed footer
                theme: 'theme-3', // indicate the theme chosen for your project
                logo: 'assets/images/logo.png', // relative path of the project logo
            },
            feedbackOptions: {
                ajaxURL: API_HOST + '/api/system/feedbackticket',
                postBrowserInfo: true,
                postHTML: true,
                postURL: true,
                tpl: {
                    initButton: '<div id="feedback-button"></div><button class="feedback-btn feedback-btn-gray"><i class="fa fa-comment-o"></i>&nbsp;Feedback</button></div>',
                    description: '<div id="feedback-welcome"><div class="feedback-logo">Feedback</div><p>Feedback le deja a usted enviar una sugerencia, reportar problemas, ideas o comentarios generales sobre la aplicación.</p><p>Comience escribiendo una descripción breve:</p><textarea id="feedback-note-tmp"></textarea><p>Despúes podrá identificar áreas de la página relacionadas con su descripción.</p><button id="feedback-welcome-next" class="feedback-next-btn feedback-btn-gray">Siguiente</button><div id="feedback-welcome-error">Por favor ingrese una descripción.</div><div class="feedback-wizard-close"></div></div>',
                    highlighter: '<div id="feedback-highlighter"><div class="feedback-logo">Feedback</div><p>Haga click y arrastre marcando una zona en la página que ayude a comprender mejor su feedback. Usted puede mover este diálogo si se interpone en el camino.</p><button class="feedback-sethighlight feedback-active"><div class="ico"></div><span>Resaltar</span></button><label>Resaltar areas relevantes con su feedback.</label><button class="feedback-setblackout"><div class="ico"></div><span>Ocultar</span></button><label class="lower">Ocultar cualquier información personal.</label><div class="feedback-buttons"><button id="feedback-highlighter-next" class="feedback-next-btn feedback-btn-gray">Siguiente</button><button id="feedback-highlighter-back" class="feedback-back-btn feedback-btn-gray">Atrás</button></div><div class="feedback-wizard-close"></div></div>',
                    overview: '<div id="feedback-overview"><div class="feedback-logo">Feedback</div><div id="feedback-overview-description"><div id="feedback-overview-description-text"><h3>Descripción</h3><h3 class="feedback-additional">Información adicional</h3><div id="feedback-additional-none"><span>None</span></div><div id="feedback-browser-info"><span>Información del navegador</span></div><div id="feedback-page-info"><span>Información de la página</span></div><div id="feedback-timestamp"><span>Marca de tiempo</span></div><div id="feedback-page-structure"><span>Estructura</span></div></div></div><div id="feedback-overview-screenshot"><h3>Captura de pantalla</h3></div><div class="feedback-buttons"><button id="feedback-submit" class="feedback-submit-btn feedback-btn-blue">Enviar</button><button id="feedback-overview-back" class="feedback-back-btn feedback-btn-gray">Atrás</button></div><div id="feedback-overview-error">Por favor ingrese una descripción.</div><div class="feedback-wizard-close"></div></div>',
                    submitSuccess: '<div id="feedback-submit-success"><div class="feedback-logo">Feedback</div><p>Gracias por su feedback. Valoramos cada pieza de feedback recibida.</p><button class="feedback-close-btn feedback-btn-blue">Aceptar</button><div class="feedback-wizard-close"></div></div>',
                    submitError: '<div id="feedback-submit-error"><div class="feedback-logo">Feedback</div><p>Lamentablemente ha ocurrido un error al enviar su feedback. Por favor intente nuevamente.</p><button class="feedback-close-btn feedback-btn-blue">Aceptar</button><div class="feedback-wizard-close"></div></div>'
                },
                initialBox: true,
                html2canvasURL: '/node_modules/html2canvas/dist/html2canvas.min.js'
            }
        };

        // Help window system
        $rootScope.windows = [];
        $rootScope.toggleHelp = () => {
            $rootScope.showHelp = !$rootScope.showHelp;
            if ($rootScope.showHelp) {
                if ($rootScope.windows.length >= 0) {
                    $rootScope.windows = [];
                }

                $rootScope.windows[0] = {
                    options: {
                        title: '',
                        width: 1000,
                        height: 600,
                        x: 0,
                        y: 0,
                        minWidth: 600,
                        maxWidth: Infinity,
                        minHeight: 400,
                        maxHeight: Infinity,
                        resizable: true,

                        onClose: function () {
                            var windows = $rootScope.windows;
                            var index = windows.indexOf(this);
                            windows.splice(index, 1);
                            $rootScope.showHelp = false;
                        }
                    }
                };
            }
        }

        $rootScope.$on('$stateChangeStart', (ev, to, toParams, from, fromParams) => {
            /*
            if (!$rootScope.session.isAuthenticated && !(to.name === 'section' || to.name === 'content' || to.name === 'formpopup')) {
                $location.url('/login/signin');
            }
        
            /*
            var demandsUser = _.contains(to.data.auth, Roles.User);
            var demandsAdmin = _.contains(to.data.auth, Roles.Admin);
            if ((demandsUser || demandsAdmin) && !session.isAuthenticated) {
                $location.url('/login/signin');
            }
            */
        });

        $templateCache.put('lookup-base.html', '<ui-select id="{{id}}" ng-model="ngModel" theme="bootstrap"><ui-select-match placeholder="{{placeholder}}">{{$select.selected.text}}</ui-select-match><ui-select-choices repeat="item in items | filter: $select.search"><span ng-bind-html="item.text | highlight: $select.search"></span></ui-select-choices></ui-select>');
    })
    .config(($breadcrumbProvider) => {
        $breadcrumbProvider.setOptions({
            includeAbstract: true,
            template: '<ol class="breadcrumb"><li ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}" ng-bind-html="step.ncyBreadcrumbLabel | translate"></a><span ng-switch-when="true" ng-bind-html="step.ncyBreadcrumbLabel | translate"></span></li></ol>'
        });
    })
    .config(['RestangularProvider', RestangularProvider => {
        RestangularProvider.setBaseUrl(API_HOST + '/api');
        RestangularProvider.setRequestSuffix('.json');

        RestangularProvider.setResponseExtractor(function (response, operation) {
            if (operation === 'getList') {
                var newResponse = response.results;
                return newResponse;
            }
            return response;
        });

    }])
    .config([
        '$translateProvider',
        ($translateProvider) => {
            $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
            $translateProvider.useUrlLoader(API_HOST + '/api/localization/resources/load.json');
            $translateProvider.preferredLanguage('es');
        }
    ])
    .config(['cfpLoadingBarProvider', (cfpLoadingBarProvider) => {
        cfpLoadingBarProvider.includeBar = true;
        cfpLoadingBarProvider.includeSpinner = false;
    }])
    .controller('AppController', ($rootScope, $scope, $state, $translate, $log, $window, $document, $timeout, cfpLoadingBar) => {
        // Loading bar transition
        // -----------------------------------
        var $win = $($window);

        $scope.session = $rootScope.session;
        $rootScope.$on(Events.sessionChange, (evt, args) => {
            $scope.session = $rootScope.session;
        });
        $scope.$on('OnOrderProduct',function (event, data) {
            $scope.$broadcast("OnOrderProductAdd",{product:data.product} );
                 
        });

        $scope.goToUserProfile = () => {
            $state.go("app.system.person", { personId: $rootScope.session.identity.personId });
        };

        $rootScope.editorOptions = {
            language: 'en',
            uiColor: '#000000',
            extraPlugins: 'embedsemantic,autoembed'
        };

        $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            //start loading bar on stateChangeStart
            cfpLoadingBar.start();

        });

        $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            //stop loading bar on stateChangeSuccess
            event.targetScope.$watch("$viewContentLoaded", () => {

                cfpLoadingBar.complete();
            });

            // scroll top the page on change state
            $window.scrollTo(0, 0);

            if (angular.element('.email-reader').length) {
                angular.element('.email-reader').animate({
                    scrollTop: 0
                }, 0);
            }

            // Save the route title
            $rootScope.currTitle = $state.current.title;
        });

        // State not found
        $rootScope.$on('$stateNotFound', (event, unfoundState, fromState, fromParams) => {
            //$rootScope.loading = false;
            $log.error(unfoundState.to);
            // "lazy.state"
            $log.error(unfoundState.toParams);
            // {a:1, b:2}
            $log.error(unfoundState.options);
            // {inherit:false} + default options
        });

        $rootScope.pageTitle = () => {
            return $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
        };

        //global function to scroll page up
        $scope.toTheTop = () => {

            $document.scrollTopAnimated(0, 600);

        };

        // angular translate
        // ----------------------
        $scope.language = {
            // Handles language dropdown
            listIsOpen: false,
            // list of available languages
            available: {
                'en': 'English',
                'es_ar': 'Spanish'
            },
            // display always the current ui language
            init: () => {
                var proposedLanguage = $translate.proposedLanguage() || $translate.use();
                var preferredLanguage = $translate.preferredLanguage();
                // we know we have set a preferred one in app.config
                $scope.language.selected = $scope.language.available[(proposedLanguage || preferredLanguage)];
            },
            set: (localeId, ev) => {
                $translate.use(localeId);
                $scope.language.selected = $scope.language.available[localeId];
                $scope.language.listIsOpen = !$scope.language.listIsOpen;
            }
        };

        $scope.language.init();

        // Function that find the exact height and width of the viewport in a cross-browser way
        var viewport = () => {
            var e: any = window, a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }
            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        };

        // function that adds information in a scope of the height and width of the page
        $scope.getWindowDimensions = () => {
            return {
                'h': viewport().height,
                'w': viewport().width
            };
        };

        // Detect when window is resized and set some variables
        $scope.$watch($scope.getWindowDimensions, (newValue, oldValue) => {
            $scope.windowHeight = newValue.h;
            $scope.windowWidth = newValue.w;
            if (newValue.w >= 992) {
                $scope.isLargeDevice = true;
            } else {
                $scope.isLargeDevice = false;
            }
            if (newValue.w < 992) {
                $scope.isSmallDevice = true;
            } else {
                $scope.isSmallDevice = false;
            }
            if (newValue.w <= 768) {
                $scope.isMobileDevice = true;
            } else {
                $scope.isMobileDevice = false;
            }
        }, true);
        // Apply on resize
        $win.on('resize', () => {
            $scope.$apply();
        });
    })
    .controller('ModalController', ($log, $scope, $uibModalInstance, data) => {
        $scope.data = data;
        if (!angular.isDefined($scope.data.height)) {
            $scope.data.height = '500px';
        }

        $scope._ = _;

        $scope.ok = () => {
            $uibModalInstance.close(data.item);
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.getTemplateUrl = () => {
            var templateUrl = data.templateUrl;
        };
    })
    .controller('NavController', () => { })
    .controller('SignInController', ($rootScope, $stateParams, $scope, $state, $log, Restangular, $localStorage, $sessionStorage) => {
        $scope.images = ['content/img/bg/4.jpg','content/img/bg/1.jpg', 'content/img/bg/2.jpg', 'content/img/bg/3.jpg'];
        var token = $stateParams.token;

            load();
         function convertFromHex(hex) {
                var hex = hex.toString();//force conversion
                var str = '';
                for (var i = 0; i < hex.length; i += 2)
                    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                return str;
            }
        function load(){
            console.log(token);
              if(token){
                var hexaToken = convertFromHex(token);
                $localStorage.id_token =hexaToken;
                $localStorage.refresh_token = hexaToken;
                $sessionStorage.id_token =hexaToken;
                $sessionStorage.refresh_token = hexaToken;
                $rootScope.session.reload(() => {
                    $state.go('app.system.notificationalerts');
                });
               
              }  
        }
        $scope.login = () => {
            Restangular.all('auth').all('credentials').post({ userName: $scope.email, password: $scope.password }).then(data => {
                if (angular.isDefined(data.bearerToken)) {
                    $localStorage.id_token = data.bearerToken;
                    $localStorage.refresh_token = data.refreshToken;
                    $sessionStorage.id_token = data.bearerToken;
                    $sessionStorage.refresh_token = data.refreshToken;
                }
                $rootScope.session.reload(() => {
                    $state.go('app.dashboard');
                });
            }, () => {
                $log.info('Error de autenticación');
            });
        }
    })
    .controller('ChangeTenantController', ($scope, session, $uibModalInstance) => {
        $scope.session = session;
        $scope.selectedItem = null;
        $scope.onSubmit = () => {
            if ($scope.selectedItem != null) {
                $uibModalInstance.close($scope.selectedItem);
            }
            else {
                return false;
            }
        }

        $scope.cancel = () => {
            $uibModalInstance.dismiss('cancel');
        }
    })
    .controller('TopNavBarController', ($log, $scope, $rootScope, $state, session, dialogs, Restangular) => {
        $scope.navalerts = [];
        $scope.cartproducts = [];
        $scope.isMock = false;
        $scope.$on('OnOrderProductAdd',function (event, data) {
            //$scope.$on('child', function (event, data) {
                 console.log('push prod');
                $scope.cartproducts.push(data.product);
                 
        });
        load();
        $scope.getTotal = function(){
            var total = 0;
            for(var i = 0; i < $scope.cartproducts.length; i++){
                var product = $scope.cartproducts[i];
                total += (product.price * product.quantity);
            }
            return total;
        }

       
        function load() {
            var currentPersonId = $rootScope.session.identity.personId;
           
            if (currentPersonId) {
                if (!$scope.isMock) {
                    /*
                    Restangular.one('system').one('notificationalerts', currentPersonId).get().then(result => {
                        $scope.alerts = result;
                    });
                    */
                   $scope.alerts = null;
                } else {
                    //Mock Model
                    $scope.cartproducts = [{
                        "id": 1,
                        "name": "Product 01",
                        "code": "001",
                        "imageAvatar":null,
                        "quantity": 2,
                        "price" :20.99,
                        "total":42.00
                      },
                      {
                        "id": 2,
                        "name": "Product 02",
                        "code": "002",
                        "quantity": 1,
                        "imageAvatar":null,
                        "price" :10.99,
                        "total":10.99
                      },
                      {
                        "id": 3,
                        "name": "Product 03",
                        "code": "003",
                        "imageAvatar":null,
                        "quantity": 1,
                        "price" :10.99,
                        "total":10.99
                      }
                    ];


                    $scope.navalerts = [
                        {
                            id: 1,
                            type: 1,
                            status: 1,
                            isFallowTriggerPerson: false,
                            isContactInviteFallowPerson: false,
                            isCurrentMemberProject: false,
                            triggerPerson: { "documents": [], "tags": ['negocios', 'energia', 'salud', 'inversor'], "fields": [], "emails": [{ "id": 3022, "personId": 1, "typeId": 2, "typeName": null, "address": "sv@nespencapital.com" }], "phones": [{ "id": 12616, "personId": 1, "typeId": 2, "typeName": null, "isDefault": false, "number": "1568375268" }], "addresses": [{ "address": { "place": { "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]", "childCount": 0, "id": 5, "parentId": 3, "typeId": 3, "name": "Ciudad Autónoma de Buenos Aires", "geo": null }, "id": 34128, "placeId": 5, "street": "Cordoba", "streetNumber": "1261", "floor": "2", "appartment": "a", "zipCode": null, "name": "Cordoba 1261 2 a" }, "id": 13410, "personId": 1, "addressId": 34128, "typeId": 2, "typeName": null, "isDefault": false }], "references": { "personId": 1, "doctorId": null, "healthServiceId": null, "patientId": 1002 }, "employerId": 1, "id": 1, "isOrganization": true, "code": "00000000010", "name": "Sebastian C. Vigliola", "gender": 1, "firstName": "Sebastian", "lastName": "Vigliola", "birthDate": null, "deathDate": null, "data1": null, "isValid": true, "webUrl": null, "profilePictureUrl": null },
                            inviteProject: { id: 56, name: 'Banco de Proyectos' },
                            inviteFallowPerson: { "documents": [], "tags": ['negocios', 'energia', 'salud', 'inversor'], "fields": [], "emails": [{ "id": 3022, "personId": 1, "typeId": 2, "typeName": null, "address": "sv@nespencapital.com" }], "phones": [{ "id": 12616, "personId": 1, "typeId": 2, "typeName": null, "isDefault": false, "number": "1568375268" }], "addresses": [{ "address": { "place": { "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]", "childCount": 0, "id": 5, "parentId": 3, "typeId": 3, "name": "Ciudad Autónoma de Buenos Aires", "geo": null }, "id": 34128, "placeId": 5, "street": "Cordoba", "streetNumber": "1261", "floor": "2", "appartment": "a", "zipCode": null, "name": "Cordoba 1261 2 a" }, "id": 13410, "personId": 1, "addressId": 34128, "typeId": 2, "typeName": null, "isDefault": false }], "references": { "personId": 1, "doctorId": null, "healthServiceId": null, "patientId": 1002 }, "employerId": 1, "id": 1, "isOrganization": true, "code": "00000000010", "name": "Sebastian C. Vigliola", "gender": 1, "firstName": "Sebastian", "lastName": "Vigliola", "birthDate": null, "deathDate": null, "data1": null, "isValid": true, "webUrl": null, "profilePictureUrl": null }

                        },
                        {
                            id: 2,
                            type: 2,
                            status: 0,
                            isFallowTriggerPerson: false,
                            isContactInviteFallowPerson: false,
                            isCurrentMemberProject: false,
                            triggerPerson: { "documents": [], "tags": ['negocios', 'energia', 'salud', 'inversor'], "fields": [], "emails": [{ "id": 3022, "personId": 1, "typeId": 2, "typeName": null, "address": "sv@nespencapital.com" }], "phones": [{ "id": 12616, "personId": 1, "typeId": 2, "typeName": null, "isDefault": false, "number": "1568375268" }], "addresses": [{ "address": { "place": { "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]", "childCount": 0, "id": 5, "parentId": 3, "typeId": 3, "name": "Ciudad Autónoma de Buenos Aires", "geo": null }, "id": 34128, "placeId": 5, "street": "Cordoba", "streetNumber": "1261", "floor": "2", "appartment": "a", "zipCode": null, "name": "Cordoba 1261 2 a" }, "id": 13410, "personId": 1, "addressId": 34128, "typeId": 2, "typeName": null, "isDefault": false }], "references": { "personId": 1, "doctorId": null, "healthServiceId": null, "patientId": 1002 }, "employerId": 1, "id": 1, "isOrganization": true, "code": "00000000010", "name": "Sebastian C. Vigliola", "gender": 1, "firstName": "Sebastian", "lastName": "Vigliola", "birthDate": null, "deathDate": null, "data1": null, "isValid": true, "webUrl": null, "profilePictureUrl": null },
                            inviteProject: { id: 56, name: 'Banco de Proyectos' },
                            inviteFallowPerson: { "documents": [], "tags": ['negocios', 'energia', 'salud', 'inversor'], "fields": [], "emails": [{ "id": 3022, "personId": 1, "typeId": 2, "typeName": null, "address": "sv@nespencapital.com" }], "phones": [{ "id": 12616, "personId": 1, "typeId": 2, "typeName": null, "isDefault": false, "number": "1568375268" }], "addresses": [{ "address": { "place": { "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]", "childCount": 0, "id": 5, "parentId": 3, "typeId": 3, "name": "Ciudad Autónoma de Buenos Aires", "geo": null }, "id": 34128, "placeId": 5, "street": "Cordoba", "streetNumber": "1261", "floor": "2", "appartment": "a", "zipCode": null, "name": "Cordoba 1261 2 a" }, "id": 13410, "personId": 1, "addressId": 34128, "typeId": 2, "typeName": null, "isDefault": false }], "references": { "personId": 1, "doctorId": null, "healthServiceId": null, "patientId": 1002 }, "employerId": 1, "id": 1, "isOrganization": true, "code": "00000000010", "name": "Sebastian C. Vigliola", "gender": 1, "firstName": "Sebastian", "lastName": "Vigliola", "birthDate": null, "deathDate": null, "data1": null, "isValid": true, "webUrl": null, "profilePictureUrl": null }


                        },

                        {
                            id: 4,
                            type: 4,
                            status: 0,
                            isFallowTriggerPerson: false,
                            isCurrentMemberProject: false,
                            triggerPerson: { "documents": [], "tags": ['negocios', 'energia', 'salud', 'inversor'], "fields": [], "emails": [{ "id": 3022, "personId": 1, "typeId": 2, "typeName": null, "address": "sv@nespencapital.com" }], "phones": [{ "id": 12616, "personId": 1, "typeId": 2, "typeName": null, "isDefault": false, "number": "1568375268" }], "addresses": [{ "address": { "place": { "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]", "childCount": 0, "id": 5, "parentId": 3, "typeId": 3, "name": "Ciudad Autónoma de Buenos Aires", "geo": null }, "id": 34128, "placeId": 5, "street": "Cordoba", "streetNumber": "1261", "floor": "2", "appartment": "a", "zipCode": null, "name": "Cordoba 1261 2 a" }, "id": 13410, "personId": 1, "addressId": 34128, "typeId": 2, "typeName": null, "isDefault": false }], "references": { "personId": 1, "doctorId": null, "healthServiceId": null, "patientId": 1002 }, "employerId": 1, "id": 1, "isOrganization": true, "code": "00000000010", "name": "Sebastian C. Vigliola", "gender": 1, "firstName": "Sebastian", "lastName": "Vigliola", "birthDate": null, "deathDate": null, "data1": null, "isValid": true, "webUrl": null, "profilePictureUrl": null },
                            inviteProject: { id: 56, name: 'Proyecto Sebas 1 ' },
                            inviteFallowPerson: { "documents": [], "tags": ['negocios', 'energia', 'salud', 'inversor'], "fields": [], "emails": [{ "id": 3022, "personId": 1, "typeId": 2, "typeName": null, "address": "sv@nespencapital.com" }], "phones": [{ "id": 12616, "personId": 1, "typeId": 2, "typeName": null, "isDefault": false, "number": "1568375268" }], "addresses": [{ "address": { "place": { "path": "[{\"Id\":2,\"Name\":\"Argentina\"},{\"Id\":3,\"Name\":\"Buenos Aires\"},{\"Id\":5,\"Name\":\"Ciudad Autónoma de Buenos Aires\"}]", "childCount": 0, "id": 5, "parentId": 3, "typeId": 3, "name": "Ciudad Autónoma de Buenos Aires", "geo": null }, "id": 34128, "placeId": 5, "street": "Cordoba", "streetNumber": "1261", "floor": "2", "appartment": "a", "zipCode": null, "name": "Cordoba 1261 2 a" }, "id": 13410, "personId": 1, "addressId": 34128, "typeId": 2, "typeName": null, "isDefault": false }], "references": { "personId": 1, "doctorId": null, "healthServiceId": null, "patientId": 1002 }, "employerId": 1, "id": 1, "isOrganization": true, "code": "00000000010", "name": "Sebastian C. Vigliola", "gender": 1, "firstName": "Sebastian", "lastName": "Vigliola", "birthDate": null, "deathDate": null, "data1": null, "isValid": true, "webUrl": null, "profilePictureUrl": null }


                        }

                    ];
                }
            }
        }
        $scope.isFallowAlertFilter = function (alert): boolean {
            return alert.type === 1;
        };

        $scope.isShareAlertFilter = function (alert): boolean {
            return alert.type === 2;
        };

        $scope.isContactAlertFilter = function (alert): boolean {
            return alert.type === 3;
        };

        $scope.isInviteProjectAlertFilter = function (alert): boolean {
            return alert.type === 4;
        };
        $scope.logOut = () => {
            $rootScope.session.logOut(() => { $state.go('login.signin'); });
        };

        $scope.profile = () => {
        };

        $scope.changeTenant = () => {
            try {

                var modalInstance = dialogs.create('/app/system/tenants/changetenantmodal.html', 'ChangeTenantController', {}, 'lg');
                modalInstance.result.then(
                    (obj) => {
                        session.setTenant(obj, null, null);
                    },
                    () => {
                    }
                );

            } catch (e) { }
        };
    })
    .controller('SidebarController', ($scope, $state) => {
        $scope.$state = $state;
    })
    .controller('QuickSidebarController', () => { })
    .controller('ThemePanelController', () => { })
    .controller('FooterController', () => { });