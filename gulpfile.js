// general
var browserSync = require('browser-sync');
var gulp = require('gulp');
var rimraf = require('rimraf');

var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var path = require('path');
var replace = require('gulp-replace');

// ejs
// var ejs = require('gulp-ejs');
// var htmlmin = require('gulp-htmlmin');
// var removeEmptyRegex = />\s+</g;
// var removeArrowEmptyBegin = />\s/g;
// var removeArrowEmptyEnd = /\s</g;

// svg
var svgSprite = require('gulp-svg-sprite');

// images
var imagemin = require('gulp-imagemin');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// postcss
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var precss = require('precss'); // like sass, have nested, mixin, extend
var lost = require('lost'); // grid system
var calc = require('postcss-calc'); // reduce calc() references
var assets = require('postcss-assets'); // image-size, inline file
var comments = require('postcss-discard-comments');
var stripInlineComments = require('postcss-strip-inline-comments');
var postscss = require('postcss-scss');

// reload
var reload = browserSync.reload;

// webpack
var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var build = require('./build.settings');
var domainConfig = build.getDomainConfig();
var webpackConfig = require(build.getWebpackConfig());
var defaultServerPort = domainConfig.__LOCAL_DEFAULT_PORT__;
var outputPath = webpackConfig.output.path;

// path
var rootPath = path.resolve(__dirname, 'design');
var destPath = path.resolve(__dirname, 'src/style');
var outputPath = path.resolve(__dirname, 'dist');

var filefolder = {
  img: {
    all: [rootPath + '/img/**/*'],
    compress: [
      rootPath + '/img/**/*.png',
      rootPath + '/img/**/*.jpg',
      rootPath + '/img/**/*.gif',
      rootPath + '/img/**/*.svg',
      '!' + rootPath + '/img/png-sprite/**/*',
      '!' + rootPath + '/img/png-sprite-2x/**/*',
      '!' + rootPath + '/img/svg-sprite/**/*',
    ],
    svg: {
      sprite: rootPath + '/img/svg-sprite/**/*.svg',
      temp: rootPath + '/svgSpriteTemp/',
    },
    move: [
      rootPath + '/img/**/*.svg',
      rootPath + '/img/**/*.ico',
      '!' + rootPath + '/img/svg-sprite',
    ],
  },
  ejs: {
    all: [rootPath + '/ejs/**/*.html'],
    removeHtmlEjs: rootPath + '/html/**/*.html',
  },
  html: {
    all: [rootPath + '/html/**/*.html'],
    dest: rootPath + '/html',
  },
  js: {
    all: [rootPath + '/js/**/*.js'],
  },
  css: {
    all: [rootPath + '/css/**/*.css'],
    move: [],
    bundle: [
      rootPath + '/css/global/normalize.css',
      rootPath + '/css/fonts.css',
      rootPath + '/css/main.css',
    ],
  },
  postcss: rootPath + '/postcss/**/*.css',
  sass: rootPath + '/sass/**/*.{sass, scss}',
  font: rootPath + '/font/**/*',
};

// file state
var watchStatus = {
  'isAdded': function(file) {
    return file.event === 'added';
  },
  'isChanged': function(file) {
    return file.event == 'changed';
  },
  'isDeleted': function(file) {
    return file.event == 'deleted';
  },
  'isNotDeleted': function(file) {
    return file.event != 'deleted';
  }
};


// gulp tasks
gulp.task('browser-sync', function() {

  var syncAry = filefolder.img.all.concat(filefolder.css.all)
    .concat(filefolder.html.all)
    .concat(filefolder.js.all);

  gulp.watch(syncAry, reload);

  return browserSync({
    server: {
      baseDir: './',
      directory: true,
    },
    port: 4000,
    debugInfo: false,
    open: false,
    browser: ['google chrome', 'firefox'],
    injectChanges: true,
    notify: true,
    ghostMode: false,
  });
});

// ejs
gulp.task('ejs', function() {
  gulp.src(filefolder.ejs.all)
    .pipe(plumber())
    .pipe(filter(function(file) {
      return !/_.*\.html/.test(file.path);
    }))
    .pipe(ejs({}, {}, {
      ext: '.html',
    }))
    .on('error', gutil.log)
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(replace(removeEmptyRegex, '><'))
    .pipe(replace(removeArrowEmptyBegin, '>'))
    .pipe(replace(removeArrowEmptyEnd, '<'))
    .pipe(gulp.dest(filefolder.html.dest))
    .pipe(reload({
      stream: true,
    }));

  return gulp.src(filefolder.ejs.removeHtmlEjs)
    .pipe(filter(function(file) {
      return /_.*\.html/.test(file.path);
    }))
    .pipe(clean());
});

gulp.task('ejs-watch', ['ejs'], function() {
  return watch(filefolder.ejs.all, function(e) {
    gulp.run(['ejs']);
  });
});

// postcss
gulp.task('postcss', function() {
  var plugins = [
    precss({
      nesting: {
        disable: true,
      },
    }),
    calc(),
    lost(),
    assets({
      basePath: 'design',
      relative: 'css',
      loadPaths: ['img/'],
    }),
    autoprefixer({
      browsers: [
        '> 2%',
        'last 2 versions',
        'ie >= 10',
      ],
    }),
    comments(),
    stripInlineComments(),
  ];

  return gulp.src(filefolder.postcss)
    .pipe(plumber())
    .pipe(filter(function(file) {
      return !/_.*\.css$/.test(file.path);
    }))
    .pipe(postcss(plugins, { syntax: postscss }))
    .pipe(gulp.dest(rootPath + '/css'));
});

gulp.task('postcss-watch', ['postcss'], function() {
  return watch(filefolder.postcss, function(e) {
    gulp.run(['postcss']);
  });
});

gulp.task('postcss-watch-move', function(cb) {
  watch(filefolder.postcss, function(e) {
    gulp.run(['move-css']);
  });

  cb();
});


// css
gulp.task('move-css', ['postcss'], function() {
  var bundleFiles = filefolder.css.bundle;

  return gulp.src(bundleFiles)
    .pipe(plumber())
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(destPath + '/css'));

});

// fonts
gulp.task('move-font', function() {

  return gulp.src(filefolder.font)
    .pipe(plumber())
    .pipe(gulp.dest(destPath + '/font'));
});

// svg sprite
// svg file please naming by Camel-Case  ex: ThisMySVGFile -> svgThisMySVGFile
gulp.task('svg-sprite-gen', function() {

  var config = {
    shape: {
      id: {
        separator: '',
      }
    },
    mode: {
      css: {
        dest: 'svgSpriteTemp',
        prefix: '.',
        sprite: 'svg-sprite.svg',
        dimensions: 'Dims',
        render: {
          scss: {
            dest: '_svgSprite.scss',
          },
        },
        bust: true,
        example: false
      }
    }
  };

  return gulp.src(filefolder.img.svg.sprite)
    .pipe(plumber())
    .pipe(svgSprite(config))
    .pipe(gulp.dest(rootPath))
    .on('error', gutil.log);

});


gulp.task('svg-sprite-move', ['svg-sprite-gen'], function() {

  // 將舊的svg sprite檔案刪掉
  gulp.src(rootPath + '/img/*.svg')
      .pipe(plumber())
      .pipe(clean({
        force: true
      }))
      .on('error', gutil.log);

  // move svg sprite to design/img
  gulp.src(filefolder.img.svg.temp + '*.svg')
      .pipe(plumber())
      .pipe(gulp.dest(rootPath + '/img'))
      .on('error', gutil.log);


  // move svg scss to design/sass, and modify url path
  gulp.src(filefolder.img.svg.temp + '*.scss')
      .pipe(plumber())
      .pipe(replace(/(svg-sprite-.*\.svg)/g, '../img/$1'))
      .pipe(gulp.dest(rootPath + '/sass'))
      .on('error', gutil.log);


  // remove /svgSpriteTemp
  return gulp.src(filefolder.img.svg.temp)
      .pipe(plumber())
      .pipe(clean({
        force: true
      }))
      .on('error', gutil.log);
});


// 不一定要使用，webpack可設定將svg -> base64 encode
gulp.task('svg-sprite-watch', function() {
  gulp.watch(filefolder.img.svg.sprite, ['svg-sprite-move']);
});


// compress images
gulp.task('minify-img', function () {
  return gulp.src(filefolder.img.compress)
    .pipe(imagemin([
      imagemin.gifsicle(),
      imageminJpegRecompress(),
      imagemin.optipng({
        optimizationLevel: 3,
      }),
    ], {
      verbose: true,
    }))
    .pipe(gulp.dest(destPath + '/img'))
    .on('error', gutil.log);
});

// clean style
gulp.task('clean-style', function() {
  return gulp.src([destPath + '/css', destPath + '/font'], {
    read: false,
  }).pipe(clean({
    force: true,
  }));
});

gulp.task('clean-style-img', function(cb) {
  return gulp.src([destPath + '/img'], {
    read: false,
  }).pipe(clean({
    force: true,
  }));
});

gulp.task('clean-style-all', ['clean-style', 'clean-style-img']);


gulp.task('serve:local', ['clean','moveStaticFile','postcss-watch-move'], function () {
  const open = require("open");
  const ProgressPlugin = require('webpack/lib/ProgressPlugin');
  const hostIP = build.getHostIP();

  startDevServer(defaultServerPort);

  function startDevServer(port) {
    var config = require(build.getWebpackConfig());

    webpackConfig.entry.bundle.splice(1, 0, `webpack-dev-server/client?http://localhost:${defaultServerPort}/`, 'webpack/hot/dev-server');

    var compiler = webpack(webpackConfig);
    compiler.apply(new ProgressPlugin(function (percentage, msg) {
      process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + "\r");
    }));

    var server = new webpackDevServer(compiler, {
      contentBase: "dist",
      hot: true,
      stats: {
        colors: true,
      },
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
      },
    });

    var openBrowser = function () {
      var port = this.address().port;
      console.log("Server is listening on port " + this.address().port);
      open(`http://${hostIP}:${port}`);
    };

    server.listeningApp.on('error', function (e) {
      if (e.code === 'EADDRINUSE') {
        startDevServer(e.port + 1);
      }
    });

    server.listeningApp.on('listening', openBrowser);

    server.listen(port);
  }
});


// gulp task scripts
gulp.task('design', ['browser-sync', 'ejs-watch', 'postcss-watch']);

// 將 design 檔案轉到 src/style 資料夾內
gulp.task('dist', function(cb) {
  runSequence('clean-style', 'move-css', 'move-font', cb);
});

// 將 design 檔案轉到 src/style 資料夾內, 加圖片, depoly 時應該都要跑過一遍, 確保 design 的檔案都有同步到 src/
gulp.task('dist-img', function(cb) {
  runSequence('clean-style-all', 'minify-img', 'move-css', 'move-font', cb);
});

// js gulp scripts
gulp.task('moveStaticFile', ['dist-img'], function () {
  return gulp.src([
    './static/*.*',
  ])
    .pipe(gulp.dest(outputPath));
});

gulp.task('webpack', ['moveStaticFile'], function (callback) {
  webpack(webpackConfig, function (err) {
    if (err) {
      console.log(err);
      throw new Error("Webpack build failed: " + err);
    }
    callback();
  });
});

gulp.task('clean', function (cb) {
  rimraf.sync(outputPath);
  cb();
});

gulp.task('build', ['clean', 'webpack']);
