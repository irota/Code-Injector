// generated on 2019-03-19 using generator-webapp 4.0.0-3
const { src, dest, watch, series, parallel } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const zip = require('gulp-zip');
const rename = require('gulp-rename');

//const uncss = require('uncss');
//const named = require('vinyl-named');
//const frontMatter = require('gulp-front-matter');
//const gdata = require('gulp-data');
//const twig = require('gulp-twig');
//const yaml = require('js-yaml');
//const fs = require('fs');
//const uncss = require('uncss');


const $ = gulpLoadPlugins();


/*const isProd = argv.production || false;
const isTest = argv.test  || false;
const isDev = !isProd && !isTest; */

const PATHS = {
	"dist" : "dist",
	"sass" : ["src/style/*.scss", "!src/style/init.scss"],
	"scripts" : "src/script/*.js",
	"images" : "src/style/images/**/*",
	"monaco" : "node_modules/monaco-editor/min/vs/**/*",
	"manifest" : "src/manifest.json",
	"html" : "src/html/*.html"
};

const COMPATIBILITY = ["last 2 versions", "ie >= 9", "ios >= 7" ];

function styles() {

  const postCssPlugins = [
    autoprefixer({browsers: COMPATIBILITY}),
    
      cssnano({safe: true, autoprefixer: false})
    ].filter(Boolean);

  return src(PATHS.sass)
    .pipe($.plumber())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10
      //includePaths:  PATHS.sass
    }).on('error', $.sass.logError))
    .pipe($.postcss(postCssPlugins))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest(PATHS.dist + '/style'));
};

function scripts() {
  return src(PATHS.scripts)
    //.pipe(named())
    //.pipe($.plumber())
    .pipe(dest(PATHS.dist + '/script'))
};


function html(){
	return src(PATHS.html)
		.pipe(dest(PATHS.dist + '/html'));
};


function images() {
  return src(PATHS.images)
    .pipe(dest(PATHS.dist + '/style/images'));
};

function fonts() {
  return src('src/style/fonts/**')
    .pipe(dest(PATHS.dist + '/style/fonts'));
};

function extras(){
	return src('src/style/*.css')
		.pipe(dest(PATHS.dist + '/style'));
};

function monaco(){
	return src(PATHS.monaco)
		.pipe(dest(PATHS.dist + '/script/vs'));
};

function manifest(){
	return src(PATHS.manifest)
		.pipe(dest(PATHS.dist));
	
};

function compress(){
	return src(PATHS.dist + '/**/*')
		.pipe(zip("code-injector.zip"))
		.pipe(dest(PATHS.dist));
};

function clean() {
  return del(PATHS.dist)
}


const build = series(
  clean,
  parallel(
    series(parallel(html, styles, scripts)),
    images,
    fonts,
    extras,
	monaco,
	manifest
  ),
  compress
);


function gulp_watch(done){
  
  
  watch([PATHS.html]).on('all', series(html));
  watch(PATHS.sass).on('all', series(styles));
  watch('src/style/*.css').on('change', series(extras));
  watch('src/manifest.json').on('change', series(manifest));
  watch(PATHS.scripts).on('cange', series(scripts));
  console.log('---');
  done();
}



let serve = series(build, gulp_watch);
 
exports.serve = serve;
exports.build = build;
exports.default = serve;


