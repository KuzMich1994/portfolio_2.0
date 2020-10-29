const projectFolder = 'dist';
const sourceFolder = 'src';
const del = require('del');

let path = {
  build: {
    html: projectFolder + '/',
    css: projectFolder + '/css/',
    js: projectFolder + '/js/',
    img: projectFolder + '/img/',
    fonts: projectFolder + '/fonts/',
  },
  src: {
    html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
    css: sourceFolder + '/sass/style.sass', // Любой файл .sass
    js: sourceFolder + '/js/**/*.js',
    img: sourceFolder + '/img/**/*.{png, jpg, svg, gif, ico, webp}',
    fonts: sourceFolder + '/fonts/*.ttf',
  },
  watch: {
    html: sourceFolder + '/**/*.html',
    css: sourceFolder + '/sass/**/*.sass',
    js: sourceFolder + '/js/**/*.js',
    img: sourceFolder + '/img/**/*.{png, jpg, svg, gif, ico, webp}',
  },
  clean: './' + projectFolder + '/'
}

const {src, dest} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  gcmq = require('gulp-group-css-media-queries');
  cleanCSS = require('gulp-clean-css'),
  rename = require("gulp-rename"),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  imageMin = require('gulp-imagemin');

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + projectFolder + '/'
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
  .pipe(fileinclude())
  .pipe(dest(path.build.html))
  .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
  .pipe(sass({
    outputStyle: 'expanded'
  }))
  .pipe(gcmq())
  .pipe(autoprefixer([
    'last 15 version'
  ]))
  .pipe(dest(path.build.css))
  .pipe(cleanCSS({
    compatibility: 'ie8'
  }))
  .pipe(rename({
    extname: '.min.css'
  }))
  .pipe(dest(path.build.css))
  .pipe(browsersync.stream())
}

function imagesTask() {
  return src('src/img/**/*')
    .pipe(imageMin([
      imageMin.optipng({optimizationLevel: 3}),
      imageMin.mozjpeg({quality: 75, progressive: true}),
    ]))
    .pipe(dest('dist/img'))
}

function js() {
  return src(path.src.js)
  .pipe(fileinclude())
  .pipe(dest(path.build.js))
  .pipe(uglify())
  .pipe(concat('script.min.js'))
  .pipe(dest(path.build.js))
  .pipe(browsersync.stream())
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
}

function delTask() {
  return del(['dist'])
}

let build = gulp.series(delTask, gulp.parallel(imagesTask, js, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.img = imagesTask
exports.js = js;
exports.css = css;
exports.del = delTask;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
