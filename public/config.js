System.config({
  "transpiler": "traceur",
  "paths": {
    "*":        "js/*.js",
    "github:*": "jspm_packages/github/*.js",
    "react:*":  "js/react-components/build/*.js"
  },
  "map": {
    "jquery": "lib/jquery-2.1.4.min",
    "react":  "lib/react-0.13.3.min"
  }
});

System.config({
  "map": {
    "traceur": "github:jmcriffey/bower-traceur@0.0.88",
    "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.88"
  }
});