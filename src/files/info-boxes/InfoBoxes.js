import React from 'react';
import PropTypes from 'prop-types';
import CompanionInfo from './companion-info/CompanionInfo';
import AddFilesInfo from './add-files-info/AddFilesInfo';
const InfoBoxes = ({ isRoot, isCompanion, filesExist }) => (<div>
    {isRoot && isCompanion && <CompanionInfo />}
    {isRoot && !filesExist && !isCompanion && <AddFilesInfo />}
  </div>);
InfoBoxes.propTypes = {
    isRoot: PropTypes.bool.isRequired,
    isCompanion: PropTypes.bool.isRequired,
    filesExist: PropTypes.bool.isRequired
};
export default InfoBoxes;
