var gulp = require("gulp"),
    merge = require("merge-stream"),
    vars = require("./variables.js"),
    nodeModules = vars.nodeModules,
    dist = vars.dist;

var bootstrapSrc = nodeModules + "/bootstrap-sass/assets/fonts/bootstrap/*.*";
var bootstrapDest = dist + "/css/libs/fonts/bootstrap";

var fontAwesomeSrc = nodeModules + "/font-awesome/fonts/*.*";
var fontAwesomeDest = dist + "/css/libs/fonts";

gulp.task("fonts", function () {
    var bootstrap = copyTo(bootstrapSrc, bootstrapDest);
    var fontAwesome = copyTo(fontAwesomeSrc, fontAwesomeDest);
    return merge(bootstrap, fontAwesome);
});

function copyTo(src, dest) {
    return gulp.src(src)
        .pipe(gulp.dest(dest));
}