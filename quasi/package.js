var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpack2 = require('webpack');

/// TODO: build gulp task to run webpack on build/content to get the code and json bundled into jsonp files for the packaging of data
// gulp.task('packageData', function() {
/// TODO: build gulp task to run webpack on build/public to get the views and routes bundled into the packaging of state
// gulp.task('packageState', function() {

gulp.task('packageJavascript', function() {
  return gulp.src('build/public/index.js')
    .pipe(webpackStream({
        bail: false,
        debug: true,
        //entry: './' + config.guiCompiledPath + 'app.js',
        output: {
            filename: "gui.js",
            path: './' + config.pubPath + 'js'
        },
        devtool: "#inline-source-map",
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                output: {
                    comments: false,
                    semicolons: true
                },
                sourceMap: true
            })
        ],
        module: {
            loaders: [ {
                test: /\.css$/,
                loader: 'style-loader!css-loader?modules'
            }]
        }

    }, function (err, stats) {
        if (stats.compilation.errors.length > 0) {
            console.log(stats.compilation.errors[0].message);
        }
    }, webpack2))
    .pipe(gulp.dest('packaged/app.bundled.js'));
});

gulp.task('packageCss', function() {
  return gulp.src('build/public/index.js')
    .pipe(webpackStream({}, webpack2))
    .pipe(gulp.dest('packaged/app.bundled.js'));
});

gulp.task('packageImages', function() {
  return gulp.src('build/public/index.js')
    .pipe(webpackStream({}, webpack2))
    .pipe(gulp.dest('packaged/app.bundled.js'));
});