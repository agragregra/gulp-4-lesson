let preprocessor = 'sass';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const sass         = require('gulp-sass');
const less         = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss     = require('gulp-clean-css');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const del          = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/' },
		notify: false,
		online: true
	})
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'app/js/app.js',
		])
	.pipe(concat('app.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream())
}

function styles() {
	return src('app/' + preprocessor + '/main.' + preprocessor + '')
	.pipe(eval(preprocessor)())
	.pipe(concat('app.min.css'))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
	.pipe(dest('app/css/'))
	.pipe(browserSync.stream())
}

function images() {
	return src('app/images/src/**/*')
	.pipe(newer('app/images/dest/'))
	.pipe(imagemin())
	.pipe(dest('app/images/dest/'))
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true })
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

function buildcopy() {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' })
	.pipe(dest('dist'))
}

function startwatch() {
	watch('app/**/' + preprocessor + '/**/*', styles);
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
	watch('app/**/*.html').on('change', browserSync.reload);
	watch('app/images/src/**/*', images);
}

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.styles      = styles;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.build       = series(cleandist, styles, scripts, images, buildcopy);

exports.default     = parallel(styles, scripts, browsersync, startwatch);
