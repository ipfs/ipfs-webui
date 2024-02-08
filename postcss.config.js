/**
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#deprecated-implicit-postcss-loader
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#deprecated-default-postcss-plugins
 */
// module.exports = {
//   plugins: [
//     require('postcss-flexbugs-fixes'),
//     require('autoprefixer')({
//       flexbox: 'no-2009',
//     }),
//   ],
// };
import postCssFlexbugsFixes from 'postcss-flexbugs-fixes';
import autoprefixer from 'autoprefixer';
export default {
  plugins: [
    // 'postcss-flexbugs-fixes': {},
    postCssFlexbugsFixes(),
    autoprefixer({
      flexbox: 'no-2009',
    }),
  ],
}
