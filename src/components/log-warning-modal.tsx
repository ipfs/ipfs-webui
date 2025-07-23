import React from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './modal/Modal.js'
import Button from './button/button.jsx'

interface LogWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  warningType: 'debug-global' | 'high-rate' | 'auto-disable'
  currentRate?: number
}

const LogWarningModal: React.FC<LogWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  warningType,
  currentRate = 0
}) => {
  const { t } = useTranslation('diagnostics')

  const getWarningContent = () => {
    switch (warningType) {
      case 'debug-global':
        return {
          title: t('logs.warnings.debugGlobal.title'),
          message: t('logs.warnings.debugGlobal.message'),
          details: [
            t('logs.warnings.debugGlobal.detail1'),
            t('logs.warnings.debugGlobal.detail2'),
            t('logs.warnings.debugGlobal.detail3')
          ],
          confirmText: t('logs.warnings.debugGlobal.confirm'),
          suggestions: [
            t('logs.warnings.debugGlobal.suggestion1'),
            t('logs.warnings.debugGlobal.suggestion2'),
            t('logs.warnings.debugGlobal.suggestion3')
          ]
        }
      case 'high-rate':
        return {
          title: t('logs.warnings.highRate.title'),
          message: t('logs.warnings.highRate.message', { rate: currentRate.toFixed(1) }),
          details: [
            t('logs.warnings.highRate.detail1'),
            t('logs.warnings.highRate.detail2')
          ],
          confirmText: t('logs.warnings.highRate.confirm'),
          suggestions: [
            t('logs.warnings.highRate.suggestion1'),
            t('logs.warnings.highRate.suggestion2')
          ]
        }
      case 'auto-disable':
        return {
          title: t('logs.warnings.autoDisable.title'),
          message: t('logs.warnings.autoDisable.message', { rate: currentRate.toFixed(1) }),
          details: [
            t('logs.warnings.autoDisable.detail1'),
            t('logs.warnings.autoDisable.detail2')
          ],
          confirmText: t('logs.warnings.autoDisable.confirm'),
          suggestions: [
            t('logs.warnings.autoDisable.suggestion1'),
            t('logs.warnings.autoDisable.suggestion2')
          ]
        }
      default:
        return {
          title: 'Warning',
          message: 'Unknown warning type',
          details: [],
          confirmText: 'OK',
          suggestions: []
        }
    }
  }

  const content = getWarningContent()

  if (!isOpen) return null

  return (
    <Modal onCancel={onClose} className="outline-0">
      <div className="pa4 bg-white br2 shadow-2 mw6">
        <h3 className="montserrat fw4 charcoal ma0 f4 mb3 flex items-center">
          <span className="mr2 f3">⚠️</span>
          {content.title}
        </h3>

        <div className="mb4">
          <p className="charcoal lh-copy mb3">{content.message}</p>

          {content.details.length > 0 && (
            <div className="mb3">
              <h4 className="montserrat fw6 charcoal ma0 f5 mb2">
                {t('logs.warnings.potentialIssues')}
              </h4>
              <ul className="ma0 pl3">
                {content.details.map((detail, index) => (
                  <li key={index} className="charcoal-muted lh-copy mb1">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.suggestions.length > 0 && (
            <div className="mb3">
              <h4 className="montserrat fw6 charcoal ma0 f5 mb2">
                {t('logs.warnings.recommendations')}
              </h4>
              <ul className="ma0 pl3">
                {content.suggestions.map((suggestion, index) => (
                  <li key={index} className="charcoal-muted lh-copy mb1">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap2">
          <Button
            className="mr2 bg-gray white"
            onClick={onClose}
          >
            {t('logs.warnings.cancel')}
          </Button>
          <Button
            className="bg-red white"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {content.confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default LogWarningModal
