var basePaths = {
    src: {
        nodeModules: "node_modules",
        srcRoot: "src"
    },
    dest: {
        root: "dist",
    },
    server: {
        path: "server/server.js"
    }
};

var libPaths = {
    src: {
        allCssInSrc: "dist/css/**/*.css",
        allSassInSrc: "src/**/*.scss",
        systemJs: `${basePaths.src.nodeModules}/systemjs/dist/system.src.js`,
        customFontAwesome: `${basePaths.src.srcRoot}/styles/custom-font-awesome.scss`,
        bootstrap: `${basePaths.src.srcRoot}/styles/bootstrap.scss`,
        bootstrapSass: `${basePaths.src.nodeModules}/bootstrap-sass/assets/stylesheets`,
        fontAwesome: `${basePaths.src.nodeModules}/font-awesome/scss/font-awesome.scss`,
        bootstrapFonts: `${basePaths.src.nodeModules}/bootstrap-sass/assets/fonts/bootstrap/*.*`,
        fontAwesomeFonts: `${basePaths.src.nodeModules}/font-awesome/fonts/*.*`
    },
    dest: {
        js: `${basePaths.dest.root}/js/libs`,
        css: `${basePaths.dest.root}/css/libs`,
        fonts: `${basePaths.dest.root}/css/fonts`,
        fontsBootstrap: `${basePaths.dest.root}/css/fonts/bootstrap`
    }
};

var misc = {
    browserSync: {
        proxy: "http://localhost:54879"
    }
}

exports.basePaths = basePaths;
exports.libPaths =libPaths;
exports.misc = misc;
