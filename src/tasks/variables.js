var basePaths = {
    src: {
        nodeModules: "node_modules",
        srcRoot: "src"
    },
    dest: {
        root: "dist",
    },
    server: {
        path: "app.js"
    },
    coverage: {
        path: "./coverage/PhantomJS 2.1.1 (Windows 8 0.0.0)/index.html"
    }
};

var libPaths = {
    src: {
        allCssInSrc: "dist/css/**/*.css",
        allSassInSrc: "src/client/**/*.scss",
        customFontAwesome: `${basePaths.src.srcRoot}/styles/custom-font-awesome.scss`,
        bootstrap: `${basePaths.src.srcRoot}/styles/bootstrap.scss`,
        bootstrapSass: `${basePaths.src.nodeModules}/bootstrap-sass/assets/stylesheets`,
        toastrSass: `${basePaths.src.nodeModules}/toastr/toastr.scss`,
        fontAwesome: `${basePaths.src.nodeModules}/font-awesome/scss/font-awesome.scss`,
        bootstrapFonts: `${basePaths.src.nodeModules}/bootstrap-sass/assets/fonts/bootstrap/*.*`,
        fontAwesomeFonts: `${basePaths.src.nodeModules}/font-awesome/fonts/*.*`
    },
    dest: {
        js: `${basePaths.dest.root}/src/client/main.js`,
        css: `${basePaths.dest.root}/css/libs`,
        allCss: `${basePaths.dest.root}/css/libs/**/*.css`,
        stylesCss: `${basePaths.dest.root}/css/libs/styles.css`,
        fonts: `${basePaths.dest.root}/css/libs/fonts`,
        fontsBootstrap: `${basePaths.dest.root}/css/libs/fonts/bootstrap`
    }
};

var misc = {
    browserSync: {
        proxy: "http://localhost:8000"
    }
}

exports.basePaths = basePaths;
exports.libPaths = libPaths;
exports.misc = misc;
