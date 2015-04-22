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
