angular.module('app.directives', [])
    .directive('ngSpinnerBar', ['$rootScope',
        $rootScope => {
            return {
                link: (scope, element, attrs) => {
                    // by defult hide the spinner bar
                    element.addClass('hide'); // hide spinner bar by default

                    // display the spinner bar whenever the route changes(the content part started loading)
                    $rootScope.$on('$stateChangeStart', () => {
                        element.removeClass('hide'); // show spinner bar
                    });

                    // hide the spinner bar on rounte change success(after the content loaded)
                    $rootScope.$on('$stateChangeSuccess', () => {
                        element.addClass('hide'); // hide spinner bar
                        $('body').removeClass('page-on-load'); // remove page loading indicator
                        //Layout.setSidebarMenuActiveLink('match'); // activate selected link in the main menu

                        // auto scorll to page top
                        /// TODO: Habilitar esto
                        /*
                        setTimeout(() => {
                            Metronic.scrollTop(); // scroll to the top on content load
                        }, $rootScope.settings.layout.pageAutoScrollOnLoad);
                        */
                    });

                    // handle errors
                    $rootScope.$on('$stateNotFound', () => {
                        element.addClass('hide'); // hide spinner bar
                    });

                    // handle errors
                    $rootScope.$on('$stateChangeError', () => {
                        element.addClass('hide'); // hide spinner bar
                    });
                }
            };
        }
    ])
// Handle global LINK click
    .directive('a', () => {
        return {
            restrict: 'E',
            link: (scope, elem, attrs: any) => {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', e => {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    })
    .directive('checklistModel', ['$parse', '$compile', ($parse, $compile) => {
        // contains
        function contains(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // add
        function add(arr, item, comparator) {
            arr = angular.isArray(arr) ? arr : [];
            if (!contains(arr, item, comparator)) {
                arr.push(item);
            }
            return arr;
        }  

        // remove
        function remove(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        // http://stackoverflow.com/a/19228302/1458162
        function postLinkFn(scope, elem, attrs) {
            // compile with `ng-model` pointing to `checked`
            $compile(elem)(scope);

            // getter / setter for original model
            var getter = $parse(attrs.checklistModel);
            var setter = getter.assign;
            var checklistChange = $parse(attrs.checklistChange);

            // value added to list
            var value = $parse(attrs.checklistValue)(scope.$parent);


            var comparator = angular.equals;

            if (attrs.hasOwnProperty('checklistComparator')) {
                comparator = $parse(attrs.checklistComparator)(scope.$parent);
            }

            // watch UI checked change
            scope.$watch('checked', (newValue, oldValue) => {
                if (newValue === oldValue) {
                    return;
                }
                var current = getter(scope.$parent);
                if (newValue === true) {
                    setter(scope.$parent, add(current, value, comparator));
                } else {
                    setter(scope.$parent, remove(current, value, comparator));
                }

                if (checklistChange) {
                    checklistChange(scope);
                }
            });
    
            // declare one function to be used for both $watch functions
            function setChecked(newArr, oldArr) {
                scope.checked = contains(newArr, value, comparator);
            }

            // watch original model change
            // use the faster $watchCollection method if it's available
            if (angular.isFunction(scope.$parent.$watchCollection)) {
                scope.$parent.$watchCollection(attrs.checklistModel, setChecked);
            } else {
                scope.$parent.$watch(attrs.checklistModel, setChecked, true);
            }
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: (tElement, tAttrs:any) => {
                if (tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') {
                    throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                }

                if (!tAttrs.checklistValue) {
                    throw 'You should provide `checklist-value`.';
                }

                // exclude recursion
                tElement.removeAttr('checklist-model');
      
                // local scope var storing individual checkbox model
                tElement.attr('ng-model', 'checked');

                return postLinkFn;
            }
        };
    }])
    .directive('money', ['$filter', '$locale', ($filter, $locale) => {
        return {
            require: 'ngModel',
            scope: {
                min: '=?min',
                max: '=?max',
                currencySymbol: '@',
                ngRequired: '=?ngRequired',
                fraction: '=?fraction'
            },
            link: (scope:any, element, attrs: any, ngModel:any) => {
                element.addClass('text-align-right');

                if (attrs.money === 'false') return;

                scope.fraction = (typeof scope.fraction !== 'undefined') ? scope.fraction : 2;

                function decimalRex(dChar) {
                    return RegExp("\\d|\\-|\\" + dChar, 'g');
                }

                function clearRex(dChar) {
                    return RegExp("\\-{0,1}((\\" + dChar + ")|([0-9]{1,}\\" + dChar + "?))&?[0-9]{0," + scope.fraction + "}", 'g');
                }

                function clearValue(value) {
                    value = String(value);
                    var dSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
                    var cleared = null;

                    if (value.indexOf($locale.NUMBER_FORMATS.DECIMAL_SEP) == -1 &&
                        value.indexOf('.') != -1 &&
                        scope.fraction) {
                        dSeparator = '.';
                    }

                    // Replace negative pattern to minus sign (-)
                    var neg_dummy = $filter('currency')("-1", getCurrencySymbol(), scope.fraction);
                    var neg_regexp = RegExp("[0-9." + $locale.NUMBER_FORMATS.DECIMAL_SEP + $locale.NUMBER_FORMATS.GROUP_SEP + "]+");
                    var neg_dummy_txt = neg_dummy.replace(neg_regexp.exec(neg_dummy), "");
                    var value_dummy_txt = value.replace(neg_regexp.exec(value), "");

                    // If is negative
                    if (neg_dummy_txt == value_dummy_txt) {
                        value = '-' + neg_regexp.exec(value);
                    }

                    if (RegExp("^-[\\s]*$", 'g').test(value)) {
                        value = "-0";
                    }

                    if (decimalRex(dSeparator).test(value)) {
                        cleared = value.match(decimalRex(dSeparator))
                            .join("").match(clearRex(dSeparator));
                        cleared = cleared ? cleared[0].replace(dSeparator, ".") : null;
                    }

                    return cleared;
                }

                function getCurrencySymbol() {
                    if (angular.isDefined(scope.currencySymbol)) {
                        return scope.currencySymbol;
                    } else {
                        //return $locale.NUMBER_FORMATS.CURRENCY_SYM;
                        return '';
                    }
                }

                function reformatViewValue() {
                    var formatters = ngModel.$formatters,
                        idx = formatters.length;

                    var viewValue = ngModel.$$rawModelValue;
                    while (idx--) {
                        viewValue = formatters[idx](viewValue);
                    }

                    ngModel.$setViewValue(viewValue);
                    ngModel.$render();
                }

                ngModel.$parsers.push(function (viewValue) {
                    var cVal = clearValue(viewValue);
                    //return parseFloat(cVal);
                    // Check for fast digitation (-. or .)
                    if (cVal == "." || cVal == "-.") {
                        cVal = ".0";
                    }
                    return parseFloat(cVal);
                });

                element.on("blur", function () {
                    ngModel.$commitViewValue();
                    reformatViewValue();
                });

                ngModel.$formatters.unshift(function (value) {
                    return $filter('currency')(value, getCurrencySymbol(), scope.fraction);
                });

                ngModel.$validators.min = function (cVal) {
                    if (!scope.ngRequired && isNaN(cVal)) {
                        return true;
                    }
                    if (typeof scope.min !== 'undefined') {
                        return cVal >= parseFloat(scope.min);
                    }
                    return true;
                };

                scope.$watch('min', function (val) {
                    ngModel.$validate();
                });

                ngModel.$validators.max = function (cVal) {
                    if (!scope.ngRequired && isNaN(cVal)) {
                        return true;
                    }
                    if (typeof scope.max !== 'undefined') {
                        return cVal <= parseFloat(scope.max);
                    }
                    return true;
                };

                scope.$watch('max', function (val) {
                    ngModel.$validate();
                });


                ngModel.$validators.fraction = function (cVal) {
                    if (!!cVal && isNaN(cVal)) {
                        return false;
                    }

                    return true;
                };

                scope.$on('currencyRedraw', function () {
                    ngModel.$commitViewValue();
                    reformatViewValue();
                });

                element.on('focus', function () {
                    var viewValue = ngModel.$$rawModelValue;

                    if (isNaN(viewValue) || viewValue === '' || viewValue == null) {
                        viewValue = '';
                    }
                    else {
                        viewValue = parseFloat(viewValue).toFixed(scope.fraction);
                    }
                    ngModel.$setViewValue(viewValue);
                    ngModel.$render();
                });
            }
        }
    }])
    .directive('datePicker', () => {
        return {
            require: 'ngModel',
            scope: { model: '=ngModel', id: '=' },
            template: '<div class="dropdown"><a class="dropdown-toggle" style="color:#555;" role="button" data-toggle="dropdown" data-target="" href=""><div class="input-group"><input type="text" class="form-control" data-to-date="" ng-model="model"><span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span></div></a><ul class="dropdown-menu" role="menu" aria-labelledby="dLabel"><datetimepicker data-ng-model="model" data-datetimepicker-config="{ dropdownSelector: \'#date\', minView: \'day\' }" /></ul></div>'
        }
    })

    .directive('datePickerFilter', () => {
        return {
            require: 'ngModel',
            scope: { model: '=ngModel', id: '=' },
            template: '<div class="dropdown" style="overflow: visible"><a class="dropdown-toggle" style="color:#555;" role="button" data-toggle="dropdown" data-target="#" href="#"><div class="input-group" style="overflow: visible;"><input type="text" class="form-control" style="display: block; height:20px; font-weight: normal; box-sizing: border-box;" data-to-date="" ng-model="model"></div></a><ul class="dropdown-menu" role="menu" aria-labelledby="dLabel"><datetimepicker data-ng-model="model" data-datetimepicker-config="{ dropdownSelector: \'#date\', minView: \'day\' }" /></ul></div>'
        }
    })
    .directive('isolateForm', function () {
        return {
            restrict: 'A',
            require: '?form',
            link: function (scope, element, attrs, formController:any) {
                if (!formController) {
                    return;
                }

                var parentForm = formController.$$parentForm; // Note this uses private API
                if (!parentForm) {
                    return;
                }

                // Remove this form from parent controller
                parentForm.$removeControl(formController);
            }
        };
    })
    .directive('jsonText', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel:any) {
                function into(input) {
                    return JSON.parse(input);
                }
                function out(data) {
                    return JSON.stringify(data, undefined, 2);
                }
                ngModel.$parsers.push(into);
                ngModel.$formatters.push(out);

            }
        };
    })
    .directive('accessibleForm', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {

                // set up event handler on the form element
                elem.on('submit', function () {

                    // find the first invalid element
                    var firstInvalid:any = elem[0].querySelector('.ng-invalid');

                    // if we find one, set focus
                    if (firstInvalid) {
                        firstInvalid.focus();
                    }
                });
            }
        };
    });