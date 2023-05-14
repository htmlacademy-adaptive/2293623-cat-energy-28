import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
 import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import { deleteAsync } from 'del';

// Styles

export const styles = (done) => {
  gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
    done();
}

//HTML

const html = (done) => {
   gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
    done();
}

//Scripts

const scripts = (done) => {
   gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    done()
}

//Images

const optimizeImages = (done) => {
  gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
    done()
}

const copyImages = (done) => {
   gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('build/img'))
    done()
}

//WebP

const createWebp = (done) => {
   gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'))
    done()
}

//SVG

const svg = (done) => {
   gulp.src(['source/img/*.svg', '!sourse/img/icons/*svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'))
    done()
}

const sprite = (done) => {
  gulp.src(['source/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(svgstore({
      inlineSVG: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
    done()
}

//Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/**/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

//Clean

const clean = async (done) => {
  await deleteAsync('build');
  done();
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Reloade

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = (done) => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/scripts.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
  done()
}

//Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

//Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
