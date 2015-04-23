angular.module("ieditor", ['ngSanitize', 'angularFileUpload','ngMeditor']);

angular.module("ieditor").run(function ($http, meditorProvider) {
    meditorProvider.config({
            qnConfig: {
                endPoint: 'http://upload.qiniu.com',
                tokenFunc: function () {
                    return $http.post('/token');
                }
            }
        }
    );
})
angular.module("ieditor").controller('EditorCtrl', function ($scope) {

    var strVar = "";
    strVar += "<h1 style=\"text-align: center;\"><b style=\"line-height: 1.5;\">Medium style editor for AngularJS<\/b><\/h1>";
    strVar += "<div style=\"text-align: center;\">";
    strVar += "	<b style=\"line-height: 1.5;\">using contenteditable API<\/b>";
    strVar += "<\/div>";
    strVar += "<h1><span style=\"line-height: 1.5;\">Heading 1<\/span><br>";
    strVar += "<\/h1>";
    strVar += "<h2><span style=\"line-height: 1.5;\">heading 2<\/span><\/h2>";
    strVar += "<h3><span style=\"line-height: 1.5;\">heading 3<\/span><\/h3>";
    strVar += "<div>";
    strVar += "		Drop or select image  to insert it, or just paste from clipboard. Image are saved  to QiniuCloud by default.";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<img src=\"//7xip0c.com1.z0.glb.clouddn.com/1429602250833967304\"><br>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<br>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "		Order List";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<ol>";
    strVar += "		<li>item 1<\/li>";
    strVar += "		<li>item 2<\/li>";
    strVar += "		<li>item 3<\/li>";
    strVar += "	<\/ol>";
    strVar += "	<div>";
    strVar += "		Unorder List";
    strVar += "	<\/div>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<ul>";
    strVar += "		<li><span style=\"line-height: 1.5em;\">item1<\/span><br>";
    strVar += "		<\/li>";
    strVar += "		<li><span style=\"line-height: 1.5em;\">item2<\/span><br>";
    strVar += "		<\/li>";
    strVar += "		<li><span style=\"line-height: 1.5em;\">item3<\/span><br>";
    strVar += "		<\/li>";
    strVar += "	<\/ul>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<u><b><br>";
    strVar += "	<\/b><\/u>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<u><b>underLine<\/b><\/u>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<br>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<i>italic<\/i>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<br>";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "		Code input supported. Just input ``` at line start, or format it.";
    strVar += "<\/div>";
    strVar += "<div>";
    strVar += "	<br>";
    strVar += "<\/div>";
    strVar += "<pre>";
    strVar += "&lt;div class=\"editor-wrapper\"&gt;\n";
    strVar += "    &lt;ng-meditor ng-model=\"content\"&gt;&lt;/ng-meditor&gt;\n";
    strVar += "&lt;/div&gt;\n";
    strVar += "<\/pre>";
    strVar += "<br>";
    strVar += "<br>";
    strVar += "<span class=\"Apple-tab-span\" style=\"white-space:pre\"><\/span><b>Tab key supported<span class=\"Apple-tab-span\" style=\"white-space:pre\"><\/span>!<\/b><br>";
    strVar += "Append whitespace to URL to insert link. try the following,";
    strVar += "<pre>http://github.com/icattlecoder</pre>";
    strVar += "<br>";
    strVar += "<br>";


    $scope.content = strVar;
});