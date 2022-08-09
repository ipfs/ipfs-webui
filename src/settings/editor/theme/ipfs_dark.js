/* global ace */
// modified from https://github.com/thlorenz/brace/blob/master/theme/solarized_dark.js
ace.define('ace/theme/ipfs_dark', ['require', 'exports', 'module', 'ace/lib/dom'], function (acequire, exports, module) {
  exports.isDark = true
  exports.cssClass = 'ace-ipfs-dark'
  exports.cssText = `
  .ace-ipfs-dark .ace_gutter {
  background: #0b3a53;
  color: #9ad4db;
  }
  .ace-ipfs-dark .ace_print-margin {
  width: 1px;
  background: #69c4cd;
  }
  .ace-ipfs-dark {
  background-color: #0b3a53;
  color: #9ad4db;
  }
  .ace-ipfs-dark .ace_entity.ace_other.ace_attribute-name,
  .ace-ipfs-dark .ace_storage {
  color: #f7f8fa;
  }
  .ace-ipfs-dark .ace_rparen,
  .ace-ipfs-dark .ace_lparen {
    color: #9ad4db;
  }
  .ace-ipfs-dark .ace_cursor,
  .ace-ipfs-dark .ace_string.ace_regexp {
  color: #ea5037
  }
  .ace-ipfs-dark .ace_marker-layer .ace_active-line,
  .ace-ipfs-dark .ace_marker-layer .ace_selection {
  background: rgba(255, 255, 255, 0.1)
  }
  .ace-ipfs-dark.ace_multiselect .ace_selection.ace_start {
  box-shadow: 0 0 3px 0px #244e66;
  }
  .ace-ipfs-dark .ace_marker-layer .ace_step {
  background: rgb(102, 82, 0)
  }
  .ace-ipfs-dark .ace_marker-layer .ace_bracket {
  margin: -1px 0 0 -1px;
  border: 1px solid rgba(147, 161, 161, 0.50)
  }
  .ace-ipfs-dark .ace_gutter-active-line {
  background-color: #244e66
  }
  .ace-ipfs-dark .ace_marker-layer .ace_selected-word {
  border: 1px solid #244e66
  }
  .ace-ipfs-dark .ace_invisible {
  color: rgba(147, 161, 161, 0.50)
  }
  .ace-ipfs-dark .ace_keyword,
  .ace-ipfs-dark .ace_meta,
  .ace-ipfs-dark .ace_support.ace_class,
  .ace-ipfs-dark .ace_support.ace_type {
  color: #0aca9f
  }
  .ace-ipfs-dark .ace_constant.ace_character,
  .ace-ipfs-dark .ace_constant.ace_other {
  color: #f36149
  }
  .ace-ipfs-dark .ace_constant.ace_language {
  color: #f9a13e
  }
  .ace-ipfs-dark .ace_constant.ace_numeric {
  color: #f39021
  }
  .ace-ipfs-dark .ace_fold {
  background-color: #69c4cd;
  border-color: #93A1A1
  }
  .ace-ipfs-dark .ace_entity.ace_name.ace_function,
  .ace-ipfs-dark .ace_entity.ace_name.ace_tag,
  .ace-ipfs-dark .ace_support.ace_function,
  .ace-ipfs-dark .ace_variable,
  .ace-ipfs-dark .ace_variable.ace_language {
  color: #edf0f4
  }
  .ace-ipfs-dark .ace_string {
  color: #0aca9f
  }
  .ace-ipfs-dark .ace_comment {
  font-style: italic;
  color: #657B83
  }
  .ace-ipfs-dark .ace_indent-guide {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNg0Db1ZVCxc/sPAAd4AlUHlLenAAAAAElFTkSuQmCC) right repeat-y
  }`

  const dom = acequire('../lib/dom')
  dom.importCssString(exports.cssText, exports.cssClass)
})
