import React from 'react';
import Button from '../button/Button';
const AskToEnable = ({ className, label, yesLabel, noLabel, onYes, onNo, detailsLabel = 'More info...', detailsLink }) => {
    return (<div className={`f6 pv3 pv2-ns ph3 tc bg-snow charcoal ${className}`}>
      <span className='fw4 lh-copy dib mb2'>
        {label}
        {detailsLink && (<a href={detailsLink} className='dib focus-outline link blue ml2'>
            {detailsLabel}
          </a>)}
      </span>
      <span className='dib'>
        <Button className='ml3 mv1 tc' bg={'bg-green'} onClick={onYes}>{yesLabel}</Button>
        <Button className='ml3 mv1 tc' color='charcoal' bg={'bg-snow-muted'} onClick={onNo}>{noLabel}</Button>
      </span>
    </div>);
};
export default AskToEnable;
