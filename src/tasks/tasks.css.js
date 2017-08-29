var gulp = require("gulp"),
    sass = require("gulp-sass"),
    uglify = require("gulp-cssnano"),
    concat = require("gulp-concat"),
    sourcemaps = require("gulp-sourcemaps"),
    merge = require("merge-stream"),
    sequence = require("run-sequence"),
    gutil = require("gulp-util"),
    browserSync = require("./browser.sync.js"),
    reload = browserSync.reload,
    noop = require("gulp-noop"),
    args = require("yargs").argv,
    variables = require("./variables"),
    dist = variables.dist,
    nodeModules = variables.nodeModules;

var prod = args.prod,
    dest = dist + "/css/libs",
    root = "src/app/client/";

gulp.task("css", function () {
    gutil.log(gutil.colors.green("CSS bundling on " + (prod ? "PROD" : "DEV")));

    var stylesDest = "./dist/css/libs/styles/";
    gulp.src("dist/css/libs/**/*.css")
        .pipe(concat("site.css"))
        .pipe(gulp.dest(stylesDest))
        .pipe(!prod ? sourcemaps.init() : noop())
        .pipe(prod ? uglify() : noop())
        .pipe(!prod ? sourcemaps.write(".") : noop())
        .pipe(gulp.dest(stylesDest));
});

gulp.task("sass", function () {
    gutil.log(gutil.colors.green("Sass compile on " + (prod ? "PROD" : "DEV")));

    var custom = gulp.src(root + "**/*.scss")
        .pipe(!prod ? sourcemaps.init() : noop())
        .pipe(sass())
        .pipe(!prod ? sourcemaps.write(".") : noop())
        .pipe(gulp.dest(dest))
        .pipe(!prod ? reload({ stream: true }) : noop());

    var customFontAwesome = copyToDestFrom(root + "styles/custom-font-awesome.scss")
        .pipe(!prod ? reload({ stream: true }) : noop());

    var bootstrap = copyToDestFrom(root + "styles/bootstrap.scss", {
        outputStyle: "nested",
        precison: 3,
        sourceComments: false,
        errLogToConsole: true,
        includePaths: [nodeModules + "/bootstrap-sass/assets/stylesheets"]
    });

    var fontAwesome = copyToDestFrom(nodeModules + "/font-awesome/scss/font-awesome.scss")
    var toastr = copyToDestFrom(nodeModules + "/toastr/toastr.scss");

    return merge(custom, customFontAwesome, bootstrap, fontAwesome, toastr);
});

function copyToDestFrom(src, sassOptions) {
    return gulp.src(src)
        .pipe(sassOptions ? sass(sassOptions) : sass())
        .pipe(gulp.dest(dest));
}