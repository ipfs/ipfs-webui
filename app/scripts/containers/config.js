import React, {Component} from 'react'
import {connect} from 'react-redux'
import i18n from '../utils/i18n.js'

import ConfigText from '../components/config-text'
import ConfigButtons from '../components/config-buttons'
import {
  Row, Col
}
from 'react-bootstrap'

import {
  config as configActions,
  pages
} from '../actions'

const {config} = configActions

export
class ConfigContainer extends Component {
  static displayName = 'ConfigContainer';
  static propTypes = {
    // Dispatch
    load: React.PropTypes.func.isRequired,
    leave: React.PropTypes.func.isRequired,
    saveClick: React.PropTypes.func.isRequired,
    saveDraft: React.PropTypes.func.isRequired,
    markSaved: React.PropTypes.func.isRequired,
    resetDraft: React.PropTypes.func.isRequired,
    // State
    draft: React.PropTypes.string.isRequired,
    saving: React.PropTypes.bool.isRequired,
    saved: React.PropTypes.bool.isRequired
  };

  componentWillMount () {
    this.props.load()
  }

  componentWillUnmount () {
    this.props.leave()
  }

  render () {
    const buttons = (
      <ConfigButtons
        resetDraft={this.props.resetDraft}
        saveClick={this.props.saveClick}
        saving={this.props.saving}
        saved={this.props.saved}
      />
    )

    return (
      <Row>
        <Col sm={10} smOffset={1}>
          <div className='webui-config'>
            <h3>{i18n.t('Config')}</h3>
            <br/>
            {buttons}
            <div style={{height: '50px'}} />
            <ConfigText
              saveDraft={this.props.saveDraft}
              markSaved={this.props.markSaved}
              draft={this.props.draft}
              saved={this.props.saved}
            />
            {buttons}
            <div style={{height: '50px'}} />
            <br/>
          </div>
        </Col>
      </Row>
    )
  }
}

function mapStateToProps (state) {
  return {
    ...state.config,
    errorMessage: state.errorMessage
  }
}

export default connect(mapStateToProps, {
  load: pages.config.load,
  leave: pages.config.leave,
  saveClick: config.saveClick,
  markSaved: config.markSaved,
  saveDraft: config.saveDraft,
  resetDraft: config.resetDraft
})(ConfigContainer)
