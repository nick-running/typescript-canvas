const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    // main: './src/Main.ts',
    // 'timeline-packet': './src/packageTimeline.ts',
    // 'svgMain': './src/d3Zoom/d3Zoom.ts',
    // 'svgMain': './src/svgTimeline/Main.ts',
    // 'Timeline': './src/svgTimeline/Timeline.ts',
    'svgMain': './src/svgTimeline2/Main.ts',
    // 'Timeline': './src/svgTimeline2/Timeline2.ts',
    // 'timeline-packet': './src/packageTimeline.ts',
    // 'timeline-packet': './src/timeline/index.ts',
    // 'timeline-packet': './src/timeline/TimelinePacket',
    // 'play-bar': './src/playBar/PlayBar.ts',
    // print: './src/print.ts'
  },
  // devtool: 'inline-source-map',
  devServer: {
    // host: '192.168.0.109',
    port: 8383,
    contentBase: './dist'
  },
  output: {
    // filename: '[name].bundle.js',
    // filename: '[name].[chunkhash].js',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json"  })]
  },
  module: {
    rules: [
      {test: /\.ts/, use: 'ts-loader'},
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          // options: {
          //   attrs: [':data-src']
          // }
        }
      },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        }
    ]
  },
  plugins: [
    // new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Output Management',
      // template: './src/index.html'
      // template: './src/timelineIndex.html'
      template: './src/svgTimeline.html'
      // template: './src/d3Zoom.html'
    })
  ]
}
