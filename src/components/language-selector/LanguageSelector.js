import React, { Component, Fragment } from 'react';
import { getCurrentLanguage } from '../../lib/i18n';
// Components
import Button from '../button/Button';
import Overlay from '../overlay/Overlay';
import LanguageModal from './language-modal/LanguageModal';
class LanguageSelector extends Component {
    state = { isLanguageModalOpen: false };
    onLanguageEditOpen = () => this.setState({ isLanguageModalOpen: true });
    onLanguageEditClose = () => this.setState({ isLanguageModalOpen: false });
    render() {
        const { t } = this.props;
        return (<Fragment>
        <div className='flex'>
          <div className='pr4 flex items-center lh-copy charcoal f5 fw5' style={{ height: 40 }}>
            {getCurrentLanguage()}
          </div>
          <Button className="tc" bg='bg-teal' minWidth={100} onClick={this.onLanguageEditOpen}>
            {t('app:actions.change')}
          </Button>
        </div>

        <Overlay show={this.state.isLanguageModalOpen} onLeave={this.onLanguageEditClose}>
          <LanguageModal className='outline-0' onLeave={this.onLanguageEditClose} t={t}/>
        </Overlay>
      </Fragment>);
    }
}
export default LanguageSelector;
