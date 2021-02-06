const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const svgSprite = require('gulp-svg-sprite');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}


function vendorsCss() {
    return src([
            'node_modules/normalize.css/normalize.css',
            'node_modules/swiper/swiper-bundle.min.css',
        ])
        .pipe(concat('_libs.scss'))
        .pipe(dest('app/scss'))
        .pipe(browserSync.stream())
}


function vendorsJs() {
    return src([
            'node_modules/swiper/swiper-bundle.min.js'
        ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


function cleanDist() {
    return del('dist')
}




function svgSprites() {
    return src('app/img/svg/**.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(dest('app/img'))
}


function images() {
    return src('app/img/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.mozjpeg({
                    quality: 75,
                    progressive: true
                }),
                imagemin.optipng({
                    optimizationLevel: 5
                })
            ]
        ))
        .pipe(dest('dist/img'))
}

function scripts() {
    return src([
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}


function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/*.js',
            'app/*.html'
        ], {
            base: 'app'
        })
        .pipe(dest('dist'))
}


function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}


exports.scripts = scripts;
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;


exports.build = series(cleanDist, images, build)
exports.default = parallel(styles, scripts, vendorsCss, vendorsJs, browsersync, svgSprites, watching);
