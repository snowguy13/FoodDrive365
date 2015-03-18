System.config({
  "baseURL": "js",
  "paths": {
    "*": "*.js",
    "github:*": "jspm-packages/github/*.js"
  }
});

System.config({
  "map": {
    "jquery": "github:components/jquery@2.1.3"
  }
});