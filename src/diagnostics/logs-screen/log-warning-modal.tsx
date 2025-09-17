import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ModalBody, ModalActions } from '../../components/modal/modal'
import Overlay from '../../components/overlay/overlay'
import Button from '../../components/button/button.js'

export type WarningModalTypes = 'debug-global' | 'high-rate' | 'auto-disable' | null

interface LogWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  warningType: WarningModalTypes
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

  const content = useMemo(() => {
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
  }, [warningType, t, currentRate])

  if (warningType == null) return null

  return (
    // @ts-expect-error - Overlay is not typed
    <Overlay show={isOpen} onLeave={onClose}>
      <Modal onCancel={onClose} className="outline-0">
        <ModalBody>
          <div className="flex items-center mb3">
            <span className="mr2 f3">⚠️</span>
            <h3 className="montserrat fw4 charcoal ma0 f4">
              {content.title}
            </h3>
          </div>

          <p className="charcoal lh-copy mb3">{content.message}</p>

          {content.details.length > 0 && (
            <div className="mb3">
              <h4 className="montserrat fw6 charcoal ma0 f5 mb2">
                {t('logs.warnings.potentialIssues')}
              </h4>
              <ul className="ma0 pl3">
                {content.details.map((detail, index) => (
                  <li key={index} className="charcoal lh-copy mb1">
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
                  <li key={index} className="charcoal lh-copy mb1">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ModalBody>

        <ModalActions>
          <Button
            className="ma2 tc bg-gray white"
            onClick={onClose}
          >
            {t('logs.warnings.cancel')}
          </Button>
          <Button
            className="ma2 tc bg-red white"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {content.confirmText}
          </Button>
        </ModalActions>
      </Modal>
    </Overlay>
  )
}

export default LogWarningModal
