var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    terser = require('gulp-terser'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    gulpIf = require('gulp-if'),
    rimraf = require('rimraf'),
    fileinclude = require('gulp-file-include'),
    browserSync = require("browser-sync"),
    plumber = require('gulp-plumber'),
    reload = browserSync.reload,
    responsive = require('gulp-responsive'),
    replace = require('gulp-replace');

// Config
var path = {
    build: {
        html: './',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/images/',
        fonts: 'dist/fonts/'
    },
    src: {
        main: './src',
        html: 'src/*.html',
        htmltemplate: 'src/template/*.html',
        htmltemplatelayout: 'src/template/layout/*.html',
        js: 'src/js/**/*.js',
        // scripts: 'src/js/*.js',
        css: 'src/css/',
        cssfile: 'src/css/**/*.css',
        style: 'src/scss/**/*.scss',
        img: 'src/images/**/*.*',
        imgToOptimize: 'src/images/**/*.{jpg,jpeg,png}',
        imgNoOptimize: 'src/images/**/*.{svg,ico}',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        scripts: 'src/js/*.js',
        style: 'src/scss/**/*.scss',
        htmltemplate: 'src/template/*.html',
        htmltemplatelayout: 'src/template/layout/*.html',
    },
    clean: './dist'
};

var config = {
    server: {
        baseDir: "./src"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "ut-test"
};

// Development Tasks

// Запуск webserver (browserSync)
gulp.task('webserver', function (done) {
    browserSync(config);
    done();
});

// Очистка
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// sass
function sassBuild() {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sass({
            // outputStyle: 'compressed',
            indentWidth: 4
        }))
        .pipe(plumber())
        .pipe(prefixer({
            browsers: ['last 10 versions'],
            cascade: false,
            remove: false
        }))
        //.on('error', console.log)
        .pipe(gulp.dest(path.src.css))
        .pipe(reload({stream: true}));
}

//fileinclude
gulp.task('fileinclude', function() {
    gulp.src([path.src.htmltemplate])
        .pipe(fileinclude())
        .pipe(gulp.dest('./src/'))
        .pipe(reload({stream: true}));
});

function fileincludeBuild() {
    return gulp.src([path.src.htmltemplate])
        .pipe(fileinclude())
        .pipe(gulp.dest('./src/'))
        .pipe(reload({stream: true}));
}

// html
gulp.task('html:build', gulp.series('fileinclude', function() {
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(gulp.dest(path.src.main))
        .pipe(reload({stream: true}));
}));

// js & style
gulp.task('useref', function() {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(replace('images/', 'dist/images/'))
        .pipe(useref())
        .pipe(gulpIf(path.src.cssfile, prefixer({
            browsers: ['last 10 versions'],
            cascade: false,
            remove: false
        })))
        .pipe(gulpIf('*.css', cssmin({processImport: false})))
        .pipe(gulpIf('*.js', terser()))
        .pipe(gulp.dest(path.build.html));      
});

// images
gulp.task('image:build', function(done) {
    gulp.src(path.src.imgToOptimize)
      .pipe(
        responsive({
            '**/*.{png,jpg}': [
                {
                    quality: 80,
                    progressive: true,
                    skipOnEnlargement: true,
                    errorOnUnusedConfig: false,
                    errorOnUnusedImage: false,
                    errorOnEnlargement: false,
                },
            ],
        })
      )
      .pipe(gulp.dest(path.build.img));

    gulp.src(path.src.imgNoOptimize)
      .pipe(gulp.dest(path.build.img));
    done();
});

// fonts
gulp.task('fonts:build', function(done) {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
    done();
});

// scripts
// gulp.task('scripts:build', function(done) {
//     gulp.src(path.src.scripts)
//         .pipe(gulp.dest(path.build.js));
//     done();
// });

// Watchers
gulp.task('watch', function() {
    gulp.watch(path.watch.style, sassBuild);
    gulp.watch(path.watch.htmltemplatelayout, fileincludeBuild);
    gulp.watch(path.watch.htmltemplate, fileincludeBuild);
    gulp.watch(path.watch.scripts, reload);
});


gulp.task('default', gulp.parallel('watch', 'webserver', function(done) {
    done();
}));

//Build
gulp.task('build', gulp.series('useref', 'image:build', 'fonts:build', function(done) {
    done();
}));
