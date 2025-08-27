/**
 * The icons in this folder are generated from the lucide icon set.
 *
 * Steps:
 * 1. visit https://lucide.dev/icons/
 * 2. search for the icon you want to use
 * 3. click on the icon
 * 4. click on the "Copy SVG" button
 * 5. paste the SVG code into a file at src/icons/lucide/glyph_<IconName>.svg
 * 6. run `npx svgr --ext tsx --typescript src/icons/lucide -d src/icons/lucide` to generate the icons
 * 7. run `npx eslint --fix src/icons/lucide/**` to fix the linting errors
 * 8. delete the svg files.
 *
 *
 * Why not import `lucide` directly?
 *
 * We don't want to import the entire `lucide` library, as it's too large and contains icons we don't need. To prevent any
 * tree-shaking issues, we only import the icons we need.
 *
 */
export * from './index'
