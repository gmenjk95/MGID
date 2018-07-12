var gulp           = require('gulp'),
	gutil          = require('gulp-util' ),
	sass           = require('gulp-sass'),
	browserSync    = require('browser-sync'),
	concat         = require('gulp-concat'),
	uglify         = require('gulp-uglify'),
	cleanCSS       = require('gulp-clean-css'),
	rename         = require('gulp-rename'),
	sourcemaps     = require('gulp-sourcemaps'),
	rigger         = require('gulp-rigger'),
	del            = require('del'),
	imagemin       = require('gulp-imagemin'),
	cache          = require('gulp-cache'),
	autoprefixer   = require('gulp-autoprefixer'),
	bourbon        = require('node-bourbon'),
	ftp            = require('vinyl-ftp'),
	notify         = require("gulp-notify"),
	spritesmith	   = require('gulp.spritesmith'),
	svgSprite      = require('gulp-svg-sprites');

// Скрипты проекта
gulp.task('html', function () {
        gulp.src(['!app/template/header.html', '!app/template/footer.html', 'app/template/*.html']) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest('app')) //Выплюнем их в папку build
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('scripts', function() {
	return gulp.src([
        'app/js/components/*.js',
        //'app/js/fancybox2/source/jquery.fancybox.pack.js', //2
        //'app/js/maskedinput/jquery.maskedinput-1.2.2.js',
        //'app/js/jquery-validation/dist/jquery.validate.min.js'
        // 'app/js/slimmenu-master/dist/js/jquery.slimmenu.min.js',
        // 'app/js/wow/wow.min.js',
        // 'app/js/magnific-popup/dist/jquery.magnific-popup.min.js',
        // 'app/js/owl.carousel/dist/owl.carousel.min.js',
        // 'app/js/fancybox-master/dist/jquery.fancybox.min.js', //3
        // 'app/js/datetimepicker-master/build/jquery.datetimepicker.full.min.js',
        // 'app/js/jQueryFormStyle/jquery.formstyler.min.js',
        // 'app/js/mixtup/mixitup.min.js'

	])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({stream: true}));
});
gulp.task('scriptsCustom', function() {
    return gulp.src([
        'app/js/custom.js'
    ])
    	.pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(concat('custom.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('spritepng', function () {
    var spriteData = gulp.src('app/img/for-sprite-png/*.png').pipe(spritesmith({
        imgName: 'sprite-png.png',
        cssName: '_sprite-png.scss',
        padding: 10
    }));
    return spriteData.pipe(gulp.dest('app/img'));
});

gulp.task('spritesvg', function () {
    return gulp.src('app/img/for-sprite-svg/*.svg')
        .pipe(svgSprite({
			mode: "symbols"
        }))
        .pipe(gulp.dest("app/img/"));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: true,
		tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

gulp.task('sass', function() {
	return gulp.src('app/sass/style.scss')
	    .pipe(sourcemaps.init())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on("error", notify.onError()))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['html', 'sass', 'scripts', 'scriptsCustom', 'browser-sync'], function() {
	gulp.watch('app/sass/*/*.scss', ['sass']);
	gulp.watch(['app/js/custom.js'], ['scripts', 'scriptsCustom']);
	gulp.watch('app/template/*.html', ['html'], browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src(['!app/img/for-sprite-svg/*', '!app/img/for-sprite-png/*', 'app/img/**/*+(.png|jpg|svg)'])
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('build/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'html', 'sass', 'scripts', 'scriptsCustom'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
	]).pipe(gulp.dest('build'));

	var buildCss = gulp.src([
		'app/css/style.min.css',
	]).pipe(gulp.dest('build/css'));

	var buildJs = gulp.src([
		'app/js/*.js',
	]).pipe(gulp.dest('build/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
	]).pipe(gulp.dest('build/fonts'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
		'dist/**',
		'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
		.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
