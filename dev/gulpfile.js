/**
 * Created by csy on 2018/1/3.
 */
/**
 * 基于gulp
 * 1.资源合并 concat
 * 2.css压缩，js压缩混淆  minify-css  uglify
 * 3.sass编译 sass
 * 4.生成md5戳，替换html中的引用  rev rev-format rev-replace
 * 5.自由正则替换  replace
 * 6.plumber 捕获出错
 * 7.顺序执行任务  run-sequence
 * 8.监听文件变动 watch
 * 9.connect 启动一个node服务器来作测试
 * 10.babel  编译ES6 和 ES2017
 * 11.自动给css加兼容性前缀 autoprefixer
 * 12.图片压缩和输出
 */

//在这里配置要编译的项目
// var project = 'app-wap';
var gulp = require('gulp');

var concat = require('gulp-concat');
var miniCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var prefixer = require('gulp-autoprefixer');
var sourcemap = require('gulp-sourcemaps');

var rev = require('gulp-rev');
var revF = require('gulp-rev-format');
var replace = require('gulp-replace');
var revR = require('gulp-rev-replace');

var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var proxy = require('http-proxy-middleware');
var sequence = require('run-sequence');
var _if = require('gulp-if');
var base64 = require('gulp-base64');
var htmlmin = require('gulp-htmlmin');//压缩html代码
// var project = 'godsLantern';

var src = {
    sass: './scss/**/*.scss',
    js: './js/**/*.js',
    views: '*.html',
    images: './images/*.{jpg,png,jpeg}',
    lib: './lib/**/*.js'
};
var dist = './../release';//输出地址
var env = 'dev';

gulp.task('css', function() {
    gulp.src(src.sass)
        .pipe(plumber())
        .pipe(_if(env === 'dev', sourcemap.init()))
        .pipe(sass())
        .pipe(prefixer())
        .pipe(gulp.dest('./css/'))
        .pipe(base64({
            extensions: ['svg', 'jpg', 'png', /\.jpg#datauri$/i],
            maxImageSize: 12 * 1024, // bytes
            debug: true
        }))
        .pipe(miniCss())
        .pipe(_if(env === 'dev', sourcemap.write()))
        .pipe(gulp.dest(dist + '/css/'))
        .pipe(rev())
        .pipe(revF({
            prefix: '.',
            suffix: '.cache',
            lastExt: false
        }))
        .pipe(rev.manifest())
        .pipe(gulp.dest(dist + 'rev/css'))
        .pipe(connect.reload());
});
gulp.task('js', function() {
    gulp.src(src.js)
        .pipe(plumber())
        .pipe(_if(env === 'dev', sourcemap.init()))
        .pipe(babel({
            presets: ["env"]
        }))
        .pipe(uglify())
        .pipe(_if(env === 'dev', sourcemap.write()))
        .pipe(gulp.dest(dist + '/js/'))
        .pipe(rev())
        .pipe(revF({
            prefix: '.',
            suffix: '.cache',
            lastExt: false
        }))
        .pipe(rev.manifest())
        .pipe(gulp.dest(dist + 'rev/js'))
        .pipe(connect.reload())
});

gulp.task('server', function() {
  connect.server({
    root: dist,
    livereload: true,
    port: 2333,
    // middleware: function(connect, opt) {
    //     return [
    //         proxy('/y20', {
    //             target: 'http://localhost:4040',
    //             changeOrigin: true
    //         })
    //     ]
    // }
  });
});

gulp.task('dev', function() {
    env = 'dev';
    watch([src.views]).on('change', function() {
        gulp.start('css');
    })
    watch([src.sass]).on('change', function() {
        gulp.start('css');
    })
    watch([src.js]).on('change', function() {
        connect.reload()
    });
});
gulp.task('rev', function() {
    var manifest = gulp.src(dist + 'rev/**/*.json');

    function modifyUnreved(filename) {
        return filename;
    }
    function modifyReved(filename) {
        if (filename.indexOf('.cache') > -1) {
            const _version = filename.match(/\.[\w]*\.cache/)[0].replace(/(\.|cache)*/g, "");
            const _filename = filename.replace(/\.[\w]*\.cache/, "");
            filename = _filename + "?v=" + _version;
            return filename;
        }
        return filename;
    }
    gulp.src(src.views)
        .pipe(replace(/(\.[a-z]+)\?(v=)?[^\'\"\&]*/g, "$1"))
        .pipe(revR({
            manifest: manifest,
            modifyUnreved: modifyUnreved,
            modifyReved: modifyReved
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(dist))
        .pipe(connect.reload());  
});

//压缩图片
gulp.task('img', function() {
    return gulp.src(src.images)
        .pipe(gulp.dest(dist + '/images/'));
});
gulp.task('build', function() {
    env = 'prod';
    sequence('img','css', 'js', 'rev');
});

gulp.task('watch', function() {
    gulp.watch(src.sass, ['css']);//参数：监听的文件和文件变动时执行的任务
    gulp.watch(src.images, ['img']);
    gulp.watch(src.views, ['build']);
    gulp.watch(src.js, ['js']);
});

gulp.task('default', ['server', 'dev']);
