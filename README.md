Medium style editor for AngularJs
===========

## Features:

- Header1-6/Bold/Itatic/underline/(un)order list/hr/justfy.

- Code input supported. Just input ``` at line start, or format it.

- Tab key supported.

- Append whitespace to URL to insert link.

- Drop or select image to insert it, or just paste from clipboard (ff not supported, trying to figure it out), image are saved to QiniuCloud.

Demo: [http://icattlecoder.github.io/ngmeditor](http://icattlecoder.github.io/ngmeditor). Not support insertting image online yet, working on it, you can test it local by implement token api.

## TODO

- IE Support.

## Usage

```
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<script type="text/javascript" src="bower_components/ng-file-upload/angular-file-upload-shim.js"></script>
<script type="text/javascript" src="bower_components/ng-file-upload/angular-file-upload.js"></script>
<script type="text/javascript" src="src/editor.js"></script>
<link rel="stylesheet" href="src/editor.css">
<link rel="stylesheet" href="bower_components/font-awesome/css/font-awesome.css">

<ng-meditor ng-model="content" placeholder="placeholder"></ng-meditor>

```

> `ng-file-upload` needed for support uploading image.

JS:

```
//inject ngMeditor directives and services.
angular.module("ieditor", ['angularFileUpload','ngMeditor']);

// config
angular.module("ieditor").run(function ($http, meditorProvider) {
    meditorProvider.config({
    		supportCommands:['justfy', 'bold', 'italic', 'underline', 'H1', 'hr', 'code', 'insertOrderedList', 'eraser', 'image', 'fullscreen'],
            qnConfig: {
                endPoint: 'http://upload.qiniu.com',
                tokenFunc: function () {
                    return $http.post('/token');
                }
            }
        }
    );
})
```

## Support Insert Image

You need implement token API, for example:

```
package main

import (
	"encoding/json"
	qauth "github.com/qiniu/api/auth/digest"
	qrs "github.com/qiniu/api/rs"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func generateQiniuUpToken(scope, accessKey, secretKey string, sizeLimit int64) string {

	mac := qauth.Mac{AccessKey: accessKey, SecretKey: []byte(secretKey)}
	policy := qrs.PutPolicy{}
	policy.Scope = scope
	policy.ReturnBody = `{"key": $(key), "mimeType": $(mimeType), "fsize": $(fsize)}`
	policy.FsizeLimit = sizeLimit

	return policy.Token(&mac)
}

func main() {

	accessKey := os.Getenv("accessKey")
	secretKey := os.Getenv("secretKey")

	CDNDomain := "7xip0c.com1.z0.glb.clouddn.com"
	bucket := "ngmeditor"
	fsizeLimit := 1024 * 1024

	mux := http.NewServeMux()
	mux.HandleFunc("/token", func(rw http.ResponseWriter, req *http.Request) {
		encoder := json.NewEncoder(rw)
		key := strconv.FormatInt(time.Now().UnixNano(), 10)
		m := map[string]interface{}{
			"key":   key,
			"token": generateQiniuUpToken(bucket+":"+key, accessKey, secretKey, int64(fsizeLimit)),
			"url":   CDNDomain + "/" + key,
		}
		encoder.Encode(m)
	})
	log.Fatalln(http.ListenAndServe(":8088", mux))
}
```
