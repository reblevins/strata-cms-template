import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import cssnext from "postcss-cssnext";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";
import sass from "gulp-sass";
// import autoprefixer from "gulp-autoprefixer";

const browserSync = BrowserSync.create();
const hugoBin = "hugo";
const defaultArgs = ["-d", "../dist", "-s", "site", "-v"];

gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("build", ["css", "js", "hugo"]);
gulp.task("build-preview", ["css", "js", "hugo-preview"]);

gulp.task("css", () => (
  gulp.src("./src/css/*.css")
    .pipe(postcss([cssnext(), cssImport({from: "./site/themes/hugo-strata-theme/static/css/styles.css"})]))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

 // Compile SCSS files to CSS
gulp.task("scss", function () {
    gulp.src("site/themes/hugo-strata-theme/static/css/*.scss")
        .pipe(sass({
            outputStyle : "compressed"
        }))
        // .pipe(autoprefixer({
        //     browsers : ["last 20 versions"]
        // }))
        .pipe(gulp.dest("site/themes/hugo-strata-theme/static/css"))
})

gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});

gulp.task("server", ["hugo", "scss" , "css", "js"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch("./src/js/**/*.js", ["js"]);
  gulp.watch("./src/css/**/*.css", ["css"]);
  gulp.watch("./site/themes/hugo-strata-theme/static/css/**/*", ["scss"])
  gulp.watch("./site/**/*", ["hugo"]);
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", () => {
    browserSync.reload();
    cb();
  });
}
