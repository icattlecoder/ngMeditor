angular.module('ngMeditor', []);
angular.module('ngMeditor')
    .provider('meditorProvider', function() {
        var commands = {
            'bold': {
                name: 'bold',
                faIcon: 'fa fa-bold',
                tag: 'b'
            },
            'italic': {
                name: 'italic',
                faIcon: 'fa fa-italic',
                tag: 'i'
            },
            'underline': {
                name: 'underline',
                faIcon: 'fa fa-underline',
                tag: 'u'
            },
            'hr': {
                name: 'insertHorizontalRule',
                faIcon: 'fa fa-minus',
                tag: 'hr'
            },
            'eraser': {
                name: 'removeFormat',
                faIcon: 'fa fa-eraser'
            },
            'insertOrderedList': {
                faIcon: 'fa fa-list-ul',
                children: [{
                    name: 'insertUnorderedList',
                    faIcon: 'fa fa-list-ul',
                    tag: 'ul'
                }, {
                    name: "insertOrderedList",
                    faIcon: 'fa fa-list-ol',
                    tag: 'ol'
                }]
            },
            'code': {
                name: 'formatBlock',
                param: 'pre',
                faIcon: 'fa fa-code',
                tag: 'pre'
            },
            'H1': {
                faIcon: 'fa fa-header',
                tag: 'h1',
                children: [{
                    name: "formatBlock",
                    param: 'H1',
                    text: 'H1',
                    tag: 'h1'
                }, {
                    name: "formatBlock",
                    param: 'H2',
                    text: 'H2',
                    tag: 'h2'
                }, {
                    name: "formatBlock",
                    param: 'H3',
                    text: 'H3',
                    tag: 'h3'
                }, {
                    name: "formatBlock",
                    param: 'H4',
                    text: 'H4',
                    tag: 'h4'
                }, {
                    name: "formatBlock",
                    param: 'H5',
                    text: 'H5',
                    tag: 'h5'
                }, {
                    name: "formatBlock",
                    param: 'H6',
                    text: 'H6',
                    tag: 'h6'
                }]
            },
            'justfy': {
                faIcon: 'fa fa-align-center',
                children: [{
                    name: 'justifyCenter',
                    faIcon: 'fa fa-align-center'
                }, {
                    name: 'justifyLeft',
                    faIcon: 'fa fa-align-left'
                }, {
                    name: 'justifyFull',
                    faIcon: 'fa fa-align-justify'
                }, {
                    name: 'justifyRight',
                    faIcon: 'fa fa-align-right'
                }]
            },
            'fullscreen': {
                name: "fullscreen",
                faIcon: 'fa fa-expand',
                tag: 'h1'
            },
            'image': {
                name: 'imgFile',
                faIcon: 'fa fa-image'
            }
        };

        var supportCommands = ['justfy', 'bold', 'italic', 'underline', 'H1', 'hr', 'code', 'insertOrderedList', 'eraser', 'image', 'fullscreen'];

        function getCommands(supportCommands) {
            var cmds = [];
            angular.forEach(supportCommands, function(cmd) {
                if (commands[cmd]) {
                    cmds.push(commands[cmd]);
                }
            });
            return cmds;
        }

        var config = {
            supportCommands: getCommands(supportCommands)
        };

        return {
            '$get': function() {
                return {
                    /*{
                     supportCommands:['bold','italic','underline']...
                     qnConfig:{
                     endPoint:'http://upload.qiniu.com',
                     tokenUrl:'<your server assign token url>'
                     }
                     }
                     */
                    config: function(conf) {
                        if (conf) {
                            if (conf.supportCommands) {
                                config.supportCommands = getCommands(conf.supportCommands);
                            }
                            if (conf.qnConfig) {
                                config.qnConfig = conf.qnConfig;
                            }
                        }
                        return config;
                    }
                };
            }
        };
    })
    .directive("ngMeditor", function($compile, $window, $timeout, $upload, meditorProvider) {
        return {
            restrict: "AE",
            scope: {
                ngModel: "="
            },
            require: "^ngModel",
            link: function(scope, el, attr) {
                var config = meditorProvider.config();

                scope.editId = new Date().getTime() + '';
                scope.showMenu = false;
                scope.menuX = 0;
                scope.menuY = 0;
                scope.commands = config.supportCommands;
                scope.editable = true;
                scope.placeholder = (attr['placeholder']!=undefined ? attr['placeholder'] : '');
                var selection, range;
                var menuWidth = (scope.commands.length) * 32;

                var html = $compile('<div ' +
                    'ng-file-drop ng-model="imageFile" ng-file-change="pasteImage(imageFile[0])" ng-multiple="false" accept="image/*" ' +
                    'ng-keydown="doKeydown($event)" ' +
                    'ng-keyup="doKeyup($event)" ' +
                    'ng-mousedown="doMousedown($event)" ' +
                    'ng-mouseup="doMouseup($event)" ' +
                    'id="{{editId}}" class="editor" ng-class="{\'fullscreen\':fullscreen}" contenteditable="{{editable}}" placeholder="{{placeholder}}" ></div>'
                )(scope);

                var menuHtml = $compile(
                    '<div ng-style=\"{\'top\':menuY,\'left\':menuX}\" ng-show=\"showMenu\" class=\"editor-menu\">' +
                    '<ul ng-class="{\'at-top\':menuAtTop,\'at-bottom\':!menuAtTop}">' +
                    '    <li ng-mouseenter="cmd.showChildren=true;"  ng-class="{\'actived\':cmd.actived}" ng-repeat="cmd in commands" ng-click="doCommand($event,cmd)">' +
                    '      <i class="{{cmd.faIcon}}"></i>' +
                    '      <input class="image-selector" ng-if=\'cmd.name==="imgFile"\' type="file"  accept="image/*" ng-file-select="" ng-model="imageFile" name="file"  ng-file-change="pasteImage(imageFile[0])">' +
                    '      <ul ng-show="cmd.showChildren" ng-mouseleave="cmd.showChildren=false;" class="sub-menu" ng-if="cmd.children">' +
                    '          <li ng-class="{\'actived\':c.actived}" ng-repeat="c in cmd.children" ng-click="doCommand($event,c)"><i class="{{c.faIcon}}"></i> <span ng-if="!c.faIcon">{{c.text}}</span></li>' +
                    '      </ul>' +
                    '    </li>' +
                    '</ul>' +
                    '<\/div>')(scope);

                el.append(html);
                el.append(menuHtml);
                if (scope.ngModel) {
                    html[0].innerHTML = scope.ngModel;
                }

                function getRange() {
                    selection = document.getSelection();
                    range = selection.rangeCount && selection.getRangeAt(0);
                }

                function setNgModel() {
                    //always append double br tags to the end of content
                    if (!html[0].innerHTML) {
                        return;
                    }

                    scope.ngModel = html[0].innerHTML;
                }

                function fixReturn() {
                    if (/<br><br>$/.test(html[0].innerHTML)) {

                    } else if (/<br>$/.test(html[0].innerHTML)) {
                        html[0].innerHTML += '<br>';
                    } else {
                        html[0].innerHTML += '<br><br>';
                    }
                }

                // highlight active menu
                function hlmenu(cmds) {
                    if (!cmds) {
                        cmds = scope.commands;
                    }
                    var ret = false;
                    angular.forEach(cmds, function(cmd) {
                        if (cmd.tag) {
                            cmd.actived = isInTag(cmd.tag);
                            if (cmd.actived) {
                                ret = true;
                            }
                        }
                        if (cmd.children) {
                            cmd.actived = hlmenu(cmd.children);
                        }
                    });
                    return ret;
                }

                // highlight code
                function hl() {
                    var p = findParentTag('pre');
                    if (p) {
                        hljs.highlightBlock(p);
                    }
                }

                function isInTag(tagName) {
                    return findParentTag(tagName) !== null;
                }

                function findParentTag(tagName) {
                    tagName = tagName.toLowerCase();
                    var p = selection.anchorNode.parentNode;
                    while (p && p.id !== scope.editId && p.tagName) {
                        if (p.tagName.toLowerCase() === tagName) {
                            return p;
                        }
                        p = p.parentNode;
                    }
                    return null;
                }

                function code() {
                    if (isInTag('pre')) {
                        return;
                    }
                    if (range.startOffset === 3 && /```/.test(range.startContainer.wholeText)) {
                        scope.doCommand(null, {
                            name: 'formatBlock',
                            param: 'pre'
                        });
                        var sub = selection.anchorNode.data.substring(3) + ' ';
                        selection.anchorNode.data = sub || ' ';
                    }
                }

                // auto create link when append whitespace to url text
                function link() {
                    var LINKY_URL_REGEXP =
                        /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"”’]$/;
                    var sub = '';
                    if (selection.anchorNode.data) {
                      sub = selection.anchorNode.data.substring(0, selection.anchorOffset - 1);
                    }
                    if (LINKY_URL_REGEXP.test(sub)) {
                        var matchs = sub.match(LINKY_URL_REGEXP);
                        if (matchs && matchs.length) {
                            var st = selection.anchorOffset - matchs[0].length - 1;
                            range.setStart(selection.anchorNode, st);
                            scope.doCommand(null, {
                                name: 'createLink',
                                param: matchs[0]
                            });
                        }
                    }
                }

                var handSelection = function() {
                    getRange();
                    if (range) {
                        scope.showMenu = !range.collapsed;
                        if (range.collapsed) {
                            return;
                        }
                        var rect = range.getBoundingClientRect();
                        //TODO 32
                        var top = rect.top - 32 - 10;
                        scope.menuAtTop = 0;
                        if (top <= 0) {
                            top = rect.top + rect.height + 10;
                            scope.menuAtTop = 1;
                            if (rect.height > window.innerHeight) {
                                top = window.innerHeight / 2;
                            }
                        }
                        var left = rect.left + rect.width / 2 - menuWidth / 2;
                        if (left <= 0) {
                            left = 8;
                        }
                        scope.menuY = top + 'px';
                        scope.menuX = left + 'px';
                        $timeout(function() {
                            hlmenu();
                        });
                    } else {}
                };

                scope.doKeydown = function(evt) {
                    setNgModel();
                    handSelection();

                    // Fix tab
                    if (evt.which === 9) {
                        scope.doCommand(null, {
                            name: "insertText",
                            param: '\t'
                        });
                        evt.preventDefault();
                        return;
                    }
                    if (evt.shiftKey && evt.which === 13) {
                        fixReturn();
                        evt.preventDefault();
                    }
                };

                scope.doKeyup = function(evt) {
                    setNgModel();
                    handSelection();
                    //code ```
                    if (evt.which === 192) code();
                    //link
                    if ((!evt.ctrlKey && !evt.shiftKey) && evt.which === 32) {
                      link();
                    }
                };

                scope.doMouseup = function() {
                    handSelection();
                };

                scope.doMousedown = function() {
                    handSelection();
                };

                function pasteImage(file) {
                    config.qnConfig.tokenFunc().then(function(resp) {
                        var tokenInfo = resp.data;
                        if (!tokenInfo.key || !tokenInfo.token || !tokenInfo.url) {
                            console.log('token url should return {"key":<key>,"token":<token>,"url":<url>}');
                            return;
                        }
                        scope.editable = false;
                        $upload.upload({
                            url: config.qnConfig.endPoint,
                            method: 'POST',
                            data: {
                                'key': tokenInfo.key,
                                'token': tokenInfo.token
                            },
                            file: file
                        }).progress(function(evt) {
                            //$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                        }).success(function(data, status, headers, config) {
                            scope.editable = true;
                            $timeout(function() {
                                scope.doCommand(null, {
                                    name: 'insertImage',
                                    param: '//' + tokenInfo.url
                                });
                            });
                        }).finally(function() {
                            scope.editable = true;
                        });
                    }, function(err) {
                        console.log('request qiniu upToken err:', err);
                    });
                }

                scope.pasteImage = pasteImage;

                $window.addEventListener("paste", function(e) {
                    var index = e.clipboardData.types.indexOf('Files');
                    if (index >= 0) {
                        if (config.qnConfig) {
                            angular.forEach(e.clipboardData.items, function(item) {
                                if (/image/.test(item.type)) {
                                    pasteImage(item.getAsFile());
                                }
                            });
                        }
                    } else {
                        var text = (e.originalEvent || e).clipboardData.getData('text/plain');
                        if (text) {
                            scope.doCommand(null, {
                                name: 'insertText',
                                param: text
                            });
                        }
                        e.preventDefault();
                    }
                });

                scope.doCommand = function(e, cmd) {
                    if (!cmd.name && cmd.name === 'imgFile') {
                        return;
                    }
                    if (cmd.name === 'fullscreen') {
                        scope.fullscreen = cmd.actived = !cmd.actived;
                        cmd.faIcon = !scope.fullscreen ? 'fa fa-expand' : 'fa fa-compress';
                        return;
                    }
                    if (range) {
                        range.collapsed = false;
                        try {
                            selection.removeAllRanges();
                            selection.addRange(range);
                        } catch (exp) { /* IE throws error sometimes*/ }
                    }
                    document.execCommand(cmd.name, false, cmd.param || '');
                    setNgModel();
                    hlmenu();
                };
                document.execCommand('styleWithCSS', false, false);
            }
        };
    });
