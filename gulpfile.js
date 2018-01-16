var gulp = require('gulp'),
	gutil = require('gulp-util'),
	coffee = require('gulp-coffee'),
	browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	concat = require('gulp-concat'),
	cleanDest = require('gulp-clean-dest'),
	gulpIf = require('gulp-if'),
	minifyHTML = require('gulp-minify-html'),
	minifyJSON = require('gulp-jsonminify'),
	uglify = require('gulp-uglifyes'),
	sass = require('gulp-ruby-sass'),
	connect = require('gulp-connect')
	imagemin = require('gulp-imagemin'),
	pngcrush = require('imagemin-pngcrush')
	;

var env,
	coffeeSources,
	jsSources,
	sassSources,
	sassStyle,
	htmlSources,
	jsonSources,
	outputDir
	;
env = process.env.NODE_ENV || 'production';

if (env === 'development') {
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
} else {
	outputDir = 'builds/production/';
	sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/*.coffee'];
jsSources = [
	'components/scripts/rclick.js',
	'components/scripts/pixgrid.js',
	'components/scripts/tagline.js',
	'components/scripts/template.js'
	];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];

gulp.task('coffee', function() {
	gulp.src(coffeeSources)
		.pipe(coffee({bare: true}).on('error', gutil.log))
		.pipe(gulp.dest('components/scripts')
		)
});

gulp.task('js', function() {
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
		.pipe(gulpIf(env === 'production', uglify({
			mangle: false,
			ecma: 6
		})))
		.pipe(gulp.dest(outputDir + 'js'))
		.pipe(connect.reload())
});

gulp.task('compass', function() {
	gulp.src(sassSources)
		.pipe(compass({
			sass: 'components/sass',
			images: outputDir + 'images',
			style: sassStyle,
			line_comments: true
		}).on('error', gutil.log))
		.pipe(gulp.dest(outputDir + 'css'))
		.pipe(cleanDest("css"))
		.pipe(connect.reload())
});

gulp.task('html', function() {
	gulp.src('builds/development/*.html')
		.pipe(gulpIf(env === 'production', minifyHTML()))
		.pipe(gulpIf(env === 'production', gulp.dest(outputDir)))
		.pipe(connect.reload())
});

gulp.task('images', function() {
	gulp.src('builds/development/images/**/*.*')
		.pipe(gulpIf(env === 'production', imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false}],
			use: [pngcrush()]
		})))
		.pipe(gulpIf(env === 'production', gulp.dest(outputDir + 'images')))
		.pipe(connect.reload())
});

gulp.task('json', function() {
	gulp.src('builds/development/js/*.json')
		.pipe(gulpIf(env === 'production', minifyJSON()))
		.pipe(gulpIf(env === 'production', gulp.dest(outputDir + 'js/')))
		.pipe(connect.reload())
});

gulp.task('connect', function() {
	connect.server({
		root: outputDir,
		livereload: true
	});
});

gulp.task('watch', function() {
	gulp.watch(coffeeSources, ['coffee']),
	gulp.watch(jsSources, ['js']),
	gulp.watch('components/sass/*.scss', ['compass']),
	gulp.watch('builds/development/*.html', ['html']),
	gulp.watch('builds/development/images/**/*.*', ['images']),
	gulp.watch('builds/development/js/*.json', ['json'])
});

gulp.task('default', ['connect', 'coffee', 'js', 'compass', 'html', 'images', 'json', 'watch']);