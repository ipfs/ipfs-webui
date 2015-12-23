var React = require('react')
var $ = require('jquery')
var i18n = require('../utils/i18n.js')
var {Table, Tooltip, OverlayTrigger} = require('react-bootstrap')

var FileList = React.createClass({
  displayName: 'FileList',
  propTypes: {
    ipfs: React.PropTypes.object,
    files: React.PropTypes.array,
    namesHidden: React.PropTypes.bool
  },

  unpin: function (e) {
    e.preventDefault()
    e.stopPropagation()

    var el = $(e.target)
    var hash = el.attr('data-hash')
    if (!hash) hash = el.parent().attr('data-hash')

    this.props.ipfs.pin.remove(hash, {r: true}, function (err, res) {
      console.log(err, res)
    })
  },

  render: function () {
    var t = this
    var files = this.props.files
    var className = 'table-hover filelist'
    if (this.props.namesHidden) className += ' filelist-names-hidden'

    return (
      <Table responsive className={className}>
        <thead>
          <tr>
            <th>{i18n.t('Type')}</th>
            <th className='filelist-name'>{i18n.t('Name')}</th>
            <th className='id-cell'>{i18n.t('ID')}</th>
            <th className='action-cell'>{i18n.t('Actions')}</th>
          </tr>
        </thead>
        <tbody>
        {files ? files.map(function (file) {
          if (typeof file === 'string') file = { id: file }

          var type = '?'
          if (file.name) {
            var lastDot = file.name.lastIndexOf('.')
            if (lastDot !== -1) type = file.name.substr(lastDot + 1, 4).toUpperCase()
          }

          var gatewayPath = t.props.gateway + '/ipfs/' + file.id
          var dagPath = '#/objects/object/' + file.id

          var tooltip = (
            <Tooltip>{i18n.t('Remove')}</Tooltip>
          )

          return (
            <tr className='webui-file' data-type={file.type} key={file.id}>
              <td><span className='type'>{type}</span></td>
              <td className='filelist-name'><a target='_blank' href={gatewayPath}>{file.name}</a></td>
              <td className='id-cell'><code>{file.id}</code></td>
              <td className='action-cell'>
                <a target='_blank' href={gatewayPath}>{i18n.t('RAW')}</a>
                <span className='separator'>|</span>
                <a href={dagPath}>{i18n.t('DAG')}</a>
                <span className='separator'>|</span>
                <a href='#' onClick={t.unpin} data-hash={file.id}>
                  <OverlayTrigger placement='right' overlay={tooltip}>
                    <i className='fa fa-remove'></i>
                  </OverlayTrigger>
                </a>
              </td>
            </tr>
          )
        }) : void 0}
        </tbody>
      </Table>
    )
  }
})

module.exports = FileList
